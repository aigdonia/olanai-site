import type { VercelRequest, VercelResponse } from '@vercel/node';
import { chat, toServerSentEventsStream } from '@tanstack/ai';
import { geminiText } from '@tanstack/ai-gemini';
import { captureLeadTool, type CaptureLeadInput } from '../src/tools/definitions';
import { OLANAI_SYSTEM_PROMPT } from '../src/server/system-prompt';

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
  additionalNotes?: string;
  capturedAt: Date;
}

// In-memory lead storage (note: this resets on each function invocation in serverless)
// For production, use a database like Supabase, PlanetScale, or Vercel KV
const leads: Lead[] = [];

// Webhook notification function
async function sendLeadNotification(lead: Lead) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('No webhook URL configured. Lead saved locally only.');
    return;
  }

  const message = {
    content: `**New Lead Captured** \n\n` +
      `**Name:** ${lead.name}\n` +
      `**Email:** ${lead.email}\n` +
      `**Project:** ${lead.projectSummary}\n` +
      `**Budget:** ${lead.budget || 'Not specified'}\n` +
      `**Priority:** ${lead.priority || 'Not specified'}\n` +
      `**Timeline:** ${lead.timeline || 'Not specified'}\n` +
      `**Company:** ${lead.companyName || 'Not specified'}\n` +
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
    additionalNotes: args.additionalNotes ?? undefined,
    capturedAt: new Date(),
  };
  leads.push(lead);

  console.log('\n=== NEW LEAD CAPTURED ===');
  console.log(JSON.stringify(lead, null, 2));
  console.log('=========================\n');

  // Send webhook notification (Discord/Slack)
  await sendLeadNotification(lead);

  return {
    success: true,
    message: `Thanks ${args.name}! Your information has been saved. Our team will reach out to ${args.email} within 24 hours to discuss your project.`,
    leadId,
  };
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      return res.status(500).json({
        error: 'GEMINI_API_KEY not configured. Please add a valid API key.',
      });
    }

    // Configure Gemini adapter - gemini-2.0-flash for fast, cost-effective responses
    const adapter = geminiText('gemini-2.0-flash', { apiKey });

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Create the chat response
    const response = chat({
      adapter,
      messages,
      systemPrompts: [OLANAI_SYSTEM_PROMPT],
      tools: [captureLeadServer],
      temperature: 0.7,
      maxTokens: 1024,
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

    await pump();
  } catch (error) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat request' });
    } else {
      res.end();
    }
  }
}
