// Local dev API server. Thin Express adapter over the shared chat core in
// src/chat/handler.ts — the SAME code that runs in production as a Cloudflare
// Pages Function (functions/api/chat.ts). Express/cors/dotenv are dev-only.
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  runChatStream,
  MessageCapError,
  ConfigError,
  BadRequestError,
  type ChatEnv,
} from '../src/chat/handler';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors({
  origin: ['http://localhost:9003', 'http://127.0.0.1:9003', 'http://0.0.0.0:9003'],
  credentials: true,
}));
app.use(express.json());

// Dev-only in-memory per-IP rate limiter. In production this is replaced by a
// Cloudflare Rate Limiting Rule on /api/chat (in-memory can't span Workers isolates).
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

app.post('/api/chat', async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }

  try {
    const stream = runChatStream(req.body, process.env as ChatEnv);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value));
    }
    res.end();
  } catch (err) {
    if (err instanceof MessageCapError) return res.status(429).json({ error: err.message });
    if (err instanceof BadRequestError) return res.status(400).json({ error: err.message });
    if (err instanceof ConfigError) return res.status(500).json({ error: err.message });
    console.error('Chat error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat request' });
    } else {
      res.end();
    }
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 OlanAI API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat endpoint: POST http://localhost:${PORT}/api/chat\n`);
});
