// Cloudflare Pages Function — serves POST /api/chat at the same origin as the site.
// Thin adapter over the shared chat core; no Express, no CORS (same origin).
// Rate limiting is handled by a Cloudflare Rate Limiting Rule on /api/chat, not here.
import {
  runChatStream,
  MessageCapError,
  ConfigError,
  BadRequestError,
  type ChatEnv,
} from '../../src/chat/handler';

// Minimal Pages Function context shape (avoids a @cloudflare/workers-types dependency).
interface PagesContext {
  request: Request;
  env: ChatEnv;
}

function jsonResponse(obj: unknown, status: number): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  let body: any;
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  try {
    const stream = runChatStream(body, context.env);
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
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
