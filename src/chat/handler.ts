// Runtime-agnostic chat core, shared by the local Express dev server
// (server/index.ts) and the Cloudflare Pages Function (functions/api/chat.ts).
// Uses only the global `fetch` + an injected `env` object — no Node built-ins —
// so it runs unchanged on Node and on the Workers runtime.
import { chat, toServerSentEventsStream } from '@tanstack/ai';
import { createGeminiChat } from '@tanstack/ai-gemini';
import { captureLeadTool, type CaptureLeadInput } from '../tools/definitions';
import { OLANAI_SYSTEM_PROMPT } from './system-prompt';

export interface ChatEnv {
  GEMINI_API_KEY?: string;
  SHEET_WEBHOOK_URL?: string;
  SHEET_WEBHOOK_TOKEN?: string;
  DISCORD_WEBHOOK_URL?: string;
  SLACK_WEBHOOK_URL?: string;
}

// Hard cap on user turns per conversation so one session can't run up the bill.
export const MAX_USER_MESSAGES = 16;

/** Thrown when the conversation exceeds the message cap (adapters map this to 429). */
export class MessageCapError extends Error {}
/** Thrown when the model API key is missing/placeholder (adapters map this to 500). */
export class ConfigError extends Error {}
/** Thrown on a malformed request body (adapters map this to 400). */
export class BadRequestError extends Error {}

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

// Append the lead as a row in a Google Sheet via an Apps Script web-app webhook.
async function appendLeadToSheet(lead: Lead, env: ChatEnv) {
  const sheetUrl = env.SHEET_WEBHOOK_URL;
  if (!sheetUrl) {
    console.log('No SHEET_WEBHOOK_URL configured. Lead not written to sheet.');
    return;
  }
  try {
    const resp = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: env.SHEET_WEBHOOK_TOKEN || '',
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

// Optional Discord/Slack notification.
async function sendLeadNotification(lead: Lead, env: ChatEnv) {
  const webhookUrl = env.DISCORD_WEBHOOK_URL || env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

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
  } catch (error) {
    console.error('Failed to send webhook notification:', error);
  }
}

// The capture_lead server tool, closing over env for the Sheet/notification writes.
function createCaptureLeadServer(env: ChatEnv) {
  return captureLeadTool.server(async (rawArgs) => {
    const args = rawArgs as CaptureLeadInput;
    const leadId = `LEAD_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
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

    console.log('\n=== NEW LEAD CAPTURED ===');
    console.log(JSON.stringify(lead, null, 2));
    console.log('=========================\n');

    await Promise.allSettled([
      appendLeadToSheet(lead, env),
      sendLeadNotification(lead, env),
    ]);

    return {
      success: true,
      message: `Thanks ${args.name}! Your information has been saved. Our team will reach out to ${args.email} within 24 hours to discuss your project.`,
      leadId,
    };
  });
}

/**
 * Build the chat SSE stream for a request body. Pure logic — the caller (Express
 * or the Pages Function) handles transport. Throws BadRequestError / MessageCapError /
 * ConfigError for the caller to map to HTTP status codes.
 */
export function runChatStream(body: any, env: ChatEnv): ReadableStream<Uint8Array> {
  const messages = body?.messages;
  if (!messages || !Array.isArray(messages)) {
    throw new BadRequestError('Messages array is required');
  }

  const userMessageCount = messages.filter((m: any) => m?.role === 'user').length;
  if (userMessageCount > MAX_USER_MESSAGES) {
    throw new MessageCapError(
      "Let's continue this over email — reach us at hello@olanai.tech and the team will pick it up.",
    );
  }

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new ConfigError('GEMINI_API_KEY not configured.');
  }

  // gemini-2.5-flash — fast, cost-effective for this scripted triage/qualify job.
  // Use createGeminiChat (explicit key) NOT geminiText: geminiText ignores its config
  // and reads process.env, which doesn't exist on the Cloudflare Workers runtime.
  const adapter = createGeminiChat('gemini-2.5-flash', apiKey);

  const contextPrompt = buildContextPrompt(body);
  const systemPrompts = contextPrompt
    ? [OLANAI_SYSTEM_PROMPT, contextPrompt]
    : [OLANAI_SYSTEM_PROMPT];

  const response = chat({
    adapter,
    messages,
    systemPrompts,
    tools: [createCaptureLeadServer(env)],
    temperature: 0.7,
    maxTokens: 512,
  });

  return toServerSentEventsStream(response) as ReadableStream<Uint8Array>;
}
