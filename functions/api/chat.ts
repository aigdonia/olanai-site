// Cloudflare Pages Function — serves POST /api/chat at the same origin as the site.
// Thin adapter over the shared chat core; no Express, no CORS (same origin).
// Layered abuse controls: Origin allowlist + body-size cap + Turnstile (when configured).
// Per-IP rate limiting is a Cloudflare Rate Limiting Rule (edge), not in code.
import {
  runChatStream,
  verifyTurnstileIfConfigured,
  MessageCapError,
  ConfigError,
  BadRequestError,
  ForbiddenError,
  type ChatEnv,
} from '../../src/chat/handler';

// Minimal Pages Function context shape (avoids a @cloudflare/workers-types dependency).
interface PagesContext {
  request: Request;
  env: ChatEnv;
}

const MAX_BODY_BYTES = 20 * 1024; // 20KB — generous for a chat turn, blocks payload bombs

// Hosts allowed to call the endpoint (defense-in-depth; Origin is spoofable).
const ALLOWED_HOSTS = new Set(['olanai.tech', 'www.olanai.tech', 'olanai-site.pages.dev']);
function isAllowedOrigin(request: Request): boolean {
  const ref = request.headers.get('Origin') || request.headers.get('Referer');
  if (!ref) return false;
  try {
    const host = new URL(ref).hostname;
    return ALLOWED_HOSTS.has(host) || host.endsWith('.olanai-site.pages.dev');
  } catch {
    return false;
  }
}

function jsonResponse(obj: unknown, status: number): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  // Origin allowlist — only our own site may call this endpoint.
  if (!isAllowedOrigin(request)) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }

  // Body-size guard before reading/parsing.
  const contentLength = Number(request.headers.get('Content-Length') || '0');
  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ error: 'Request too large' }, 413);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  try {
    await verifyTurnstileIfConfigured(body, env, request.headers.get('CF-Connecting-IP'));
    const stream = runChatStream(body, env);
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    if (err instanceof ForbiddenError) return jsonResponse({ error: err.message }, 403);
    if (err instanceof MessageCapError) return jsonResponse({ error: err.message }, 429);
    if (err instanceof BadRequestError) return jsonResponse({ error: err.message }, 400);
    if (err instanceof ConfigError) {
      console.error('Chat config error:', err.message);
      return jsonResponse({ error: 'Chat is not configured. Please try again later.' }, 500);
    }
    console.error('Chat error:', err);
    return jsonResponse({ error: 'Failed to process chat request' }, 500);
  }
}
