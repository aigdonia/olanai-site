import express from 'express';
import cors from 'cors';
import { chat, toServerSentEventsStream } from '@tanstack/ai';
import { geminiText } from '@tanstack/ai-gemini';
import { captureLeadTool, type CaptureLeadInput } from '../src/tools/definitions.js';
import { OLANAI_SYSTEM_PROMPT } from './system-prompt.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:9003', 'http://127.0.0.1:9003', 'http://0.0.0.0:9003'],
  credentials: true,
}));
app.use(express.json());

// Lead type for storage
interface Lead {
  id: string;
  name: string;
  email: string;
  projectSummary: string;
  budget?: string;
  priority?: string;
  timeline?: string;
  companyName?: string;
  serviceCategory?: string;
  fitScore?: string;
  fitReason?: string;
  additionalNotes?: string;
  capturedAt: Date;
}

// In-memory lead storage (replace with database in production)
const leads: Lead[] = [];

// Server-side tool implementation
const captureLeadServer = captureLeadTool.server(async (rawArgs) => {
  const args = rawArgs as CaptureLeadInput;
  const leadId = `LEAD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Store the lead
  const lead: Lead = {
    id: leadId,
    name: args.name,
    email: args.email,
    projectSummary: args.projectSummary,
    budget: args.budget ?? undefined,
    priority: args.priority ?? undefined,
    timeline: args.timeline ?? undefined,
    companyName: args.companyName ?? undefined,
    serviceCategory: args.serviceCategory ?? undefined,
    fitScore: args.fitScore ?? undefined,
    fitReason: args.fitReason ?? undefined,
    additionalNotes: args.additionalNotes ?? undefined,
    capturedAt: new Date(),
  };
  leads.push(lead);

  console.log('\n=== NEW LEAD CAPTURED ===');
  console.log(JSON.stringify(lead, null, 2));
  console.log('=========================\n');

  // Persist to Google Sheet (primary) + optional Discord/Slack notification
  await Promise.allSettled([
    appendLeadToSheet(lead),
    sendLeadNotification(lead),
  ]);

  return {
    success: true,
    message: `Thanks ${args.name}! Your information has been saved. Our team will reach out to ${args.email} within 24 hours to discuss your project.`,
    leadId,
  };
});

// Append the lead as a row in a Google Sheet via an Apps Script web-app webhook.
// The Apps Script doPost reads these JSON fields and appends them in order.
async function appendLeadToSheet(lead: Lead) {
  const sheetUrl = process.env.SHEET_WEBHOOK_URL;

  if (!sheetUrl) {
    console.log('No SHEET_WEBHOOK_URL configured. Lead not written to sheet.');
    return;
  }

  try {
    const resp = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: process.env.SHEET_WEBHOOK_TOKEN || '',
        capturedAt: lead.capturedAt.toISOString(),
        name: lead.name,
        email: lead.email,
        companyName: lead.companyName || '',
        serviceCategory: lead.serviceCategory || '',
        projectSummary: lead.projectSummary,
        budget: lead.budget || '',
        timeline: lead.timeline || '',
        priority: lead.priority || '',
        fitScore: lead.fitScore || '',
        fitReason: lead.fitReason || '',
        additionalNotes: lead.additionalNotes || '',
        leadId: lead.id,
      }),
    });
    // Apps Script returns 200 even on rejection, so inspect the body.
    const body = await resp.text();
    if (body.includes('"ok":true')) {
      console.log('Lead appended to Google Sheet');
    } else {
      console.error('Google Sheet rejected the lead:', resp.status, body.slice(0, 200));
    }
  } catch (error) {
    console.error('Failed to append lead to Google Sheet:', error);
  }
}

// Webhook notification function
async function sendLeadNotification(lead: Lead) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('No webhook URL configured. Lead saved locally only.');
    return;
  }

  const fitLabel = lead.fitScore ? lead.fitScore.toUpperCase() : 'UNSCORED';
  const message = {
    content: `**New Lead Captured — ${fitLabel}** \n\n` +
      `**Name:** ${lead.name}\n` +
      `**Email:** ${lead.email}\n` +
      `**Service:** ${lead.serviceCategory || 'Not specified'}\n` +
      `**Project:** ${lead.projectSummary}\n` +
      `**Budget:** ${lead.budget || 'Not specified'}\n` +
      `**Priority:** ${lead.priority || 'Not specified'}\n` +
      `**Timeline:** ${lead.timeline || 'Not specified'}\n` +
      `**Company:** ${lead.companyName || 'Not specified'}\n` +
      `**Fit:** ${fitLabel}${lead.fitReason ? ` — ${lead.fitReason}` : ''}\n` +
      `**Lead ID:** ${lead.id}\n` +
      `**Captured At:** ${lead.capturedAt.toISOString()}`,
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    console.log('Webhook notification sent successfully');
  } catch (error) {
    console.error('Failed to send webhook notification:', error);
  }
}

// --- Cost guards -----------------------------------------------------------
// Hard cap on user turns per conversation so a single session can't run up the bill.
const MAX_USER_MESSAGES = 16;
// Lightweight in-memory per-IP rate limiter (sliding window). NOTE: in production
// on Cloudflare this moves to Cloudflare's edge rate-limiting; in-memory is per-instance.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  hits.push(now);
  ipHits.set(ip, hits);
  return hits.length > RATE_LIMIT_MAX;
}

// Build a short, dynamic context system prompt from the funnel state the client sends.
function buildContextPrompt(body: any): string | null {
  const stage = typeof body?.funnelStage === 'string' ? body.funnelStage : null;
  const service = typeof body?.serviceCategory === 'string' ? body.serviceCategory : null;
  const budget = typeof body?.budgetBand === 'string' ? body.budgetBand : null;
  const timeline = typeof body?.timeline === 'string' ? body.timeline : null;
  const parts: string[] = [];
  if (stage) parts.push(`Current funnel stage: ${stage}.`);
  if (service) parts.push(`Visitor selected service: ${service}.`);
  if (budget) parts.push(`Visitor indicated budget: ${budget}.`);
  if (timeline) parts.push(`Visitor indicated timeline: ${timeline}.`);
  if (parts.length === 0) return null;
  return `CONVERSATION CONTEXT (from the UI, trusted):\n${parts.join('\n')}`;
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }

    const userMessageCount = messages.filter((m: any) => m?.role === 'user').length;
    if (userMessageCount > MAX_USER_MESSAGES) {
      return res.status(429).json({
        error: "Let's continue this over email — reach us at hello@olanai.tech and the team will pick it up.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      return res.status(500).json({
        error: 'GEMINI_API_KEY not configured. Please add a valid API key to .env.local',
      });
    }

    // Configure Gemini adapter - gemini-2.5-flash for fast, cost-effective responses
    const adapter = geminiText('gemini-2.5-flash', { apiKey });

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Inject per-turn funnel context so Olan knows where the visitor is.
    const contextPrompt = buildContextPrompt(req.body);
    const systemPrompts = contextPrompt
      ? [OLANAI_SYSTEM_PROMPT, contextPrompt]
      : [OLANAI_SYSTEM_PROMPT];

    // Create the chat response
    const response = chat({
      adapter,
      messages,
      systemPrompts,
      tools: [captureLeadServer],
      temperature: 0.7,
      maxTokens: 512,
    });

    // Convert to SSE stream and pipe to response
    const stream = toServerSentEventsStream(response);
    const reader = stream.getReader();

    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            break;
          }
          res.write(new TextDecoder().decode(value));
        }
      } catch (error) {
        console.error('Stream error:', error);
        res.end();
      }
    };

    pump();
  } catch (error) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat request' });
    } else {
      res.end();
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', leads: leads.length });
});

// Get leads endpoint (for debugging)
app.get('/api/leads', (req, res) => {
  res.json(leads);
});

app.listen(PORT, () => {
  console.log(`\n🚀 OlanAI API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat endpoint: POST http://localhost:${PORT}/api/chat\n`);
});
