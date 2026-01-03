# Olanai Tech Lead Agent - Installation Guide

This guide covers the setup and configuration of the AI Chat Agent for Olanai Tech, built with TanStack AI and Gemini 2.0 Flash.

## Prerequisites

- Node.js 18+
- npm or pnpm
- A Google AI Studio account for Gemini API access

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- `@tanstack/ai` - Core AI SDK
- `@tanstack/ai-react` - React hooks for chat
- `@tanstack/ai-gemini` - Gemini adapter
- `zod` - Schema validation
- `express` - API server
- `cors` - Cross-origin support

### 2. Configure Environment

Copy the environment template and add your API key:

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key at: https://aistudio.google.com/app/apikey

### 3. Start Development Servers

```bash
npm run dev
```

This starts both servers concurrently:
- **Frontend**: http://localhost:9003
- **API Server**: http://localhost:3001

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Vite + React)                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  components/ChatWithAI.tsx                               │    │
│  │  - useChat() hook from @tanstack/ai-react               │    │
│  │  - SSE streaming for real-time responses                │    │
│  │  - Lead capture UI feedback                             │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST /api/chat (SSE)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Express Server)                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  server/index.ts                                         │    │
│  │  - Gemini 2.0 Flash adapter                             │    │
│  │  - capture_lead tool execution                          │    │
│  │  - Webhook notifications (Discord/Slack)                │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  server/system-prompt.ts                                 │    │
│  │  - AI Strategist personality                            │    │
│  │  - BANT qualification guidelines                        │    │
│  │  - Service descriptions                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Gemini API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Google Gemini 2.0 Flash                       │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
olanai/
├── components/
│   └── ChatWithAI.tsx      # React chat component with SSE streaming
├── server/
│   ├── index.ts            # Express API server
│   └── system-prompt.ts    # AI Strategist system prompt
├── src/
│   └── tools/
│       └── definitions.ts  # capture_lead tool with Zod schemas
├── docs/
│   └── install.md          # This file
├── .env.local              # Environment configuration
└── package.json            # Scripts and dependencies
```

## Configuration Options

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key |
| `API_PORT` | No | API server port (default: 3001) |
| `DISCORD_WEBHOOK_URL` | No | Discord webhook for lead notifications |
| `SLACK_WEBHOOK_URL` | No | Slack webhook for lead notifications |

### Example `.env.local`

```bash
# Gemini API Key (required)
GEMINI_API_KEY=AIzaSy...your_key_here

# API Server Port (optional)
API_PORT=3001

# Lead Notification Webhooks (optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

## Features

### 1. AI Chat with SSE Streaming

The chat uses Server-Sent Events for real-time streaming responses:

```typescript
const { messages, sendMessage, isLoading } = useChat({
  connection: fetchServerSentEvents('http://localhost:3001/api/chat'),
  tools: [captureLeadClient],
});
```

### 2. Lead Capture Tool

The `capture_lead` tool validates and captures qualified leads:

**Input Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full name (min 2 chars) |
| `email` | string | Yes | Valid email address |
| `projectSummary` | string | Yes | Project description (min 10 chars) |
| `budget` | enum | No | Budget range |
| `priority` | enum | No | Urgency level |
| `timeline` | string | No | Expected timeline |
| `companyName` | string | No | Company name |
| `additionalNotes` | string | No | Extra context |

**Budget Options:** `under_10k`, `10k_25k`, `25k_50k`, `50k_100k`, `over_100k`, `not_specified`

**Priority Options:** `urgent`, `high`, `medium`, `low`, `not_specified`

### 3. BANT Lead Qualification

The AI Strategist qualifies leads using BANT methodology:
- **B**udget - What's their budget range?
- **A**uthority - Are they the decision maker?
- **N**eed - What problem are they solving?
- **T**imeline - When do they need it?

### 4. Webhook Notifications

When a lead is captured, notifications are sent to configured webhooks:

```typescript
// Discord/Slack message format
{
  content: `**New Lead Captured**
    Name: ${lead.name}
    Email: ${lead.email}
    Project: ${lead.projectSummary}
    ...`
}
```

## API Endpoints

### POST /api/chat

Streams AI chat responses using SSE.

**Request:**
```json
{
  "messages": [
    { "role": "user", "parts": [{ "type": "text", "content": "Hello" }] }
  ]
}
```

**Response:** Server-Sent Events stream

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "leads": 0
}
```

### GET /api/leads

Returns all captured leads (for debugging).

**Response:**
```json
[
  {
    "id": "LEAD_1234567890_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "projectSummary": "Need a SaaS application",
    "capturedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

## Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both frontend and API servers |
| `npm run dev:frontend` | Start only the Vite frontend |
| `npm run dev:api` | Start only the Express API server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Customization

### Modifying the System Prompt

Edit `server/system-prompt.ts` to customize the AI's personality, services, and conversation guidelines.

### Adding New Tools

1. Define the tool schema in `src/tools/definitions.ts`:

```typescript
export const myToolSchema = z.object({
  // ... your schema
});

export const myTool = toolDefinition({
  name: 'my_tool',
  description: 'What this tool does',
  inputSchema: myToolSchema,
  outputSchema: z.object({ success: z.boolean() }),
});
```

2. Add server implementation in `server/index.ts`:

```typescript
const myToolServer = myTool.server(async (args) => {
  // ... implementation
  return { success: true };
});
```

3. Add to the chat tools array:

```typescript
const response = chat({
  // ...
  tools: [captureLeadServer, myToolServer],
});
```

### Changing the AI Model

In `server/index.ts`, modify the adapter:

```typescript
// Available models:
// - gemini-2.0-flash (fast, cost-effective)
// - gemini-2.0-flash-lite (faster, cheaper)
// - gemini-2.5-pro (more capable)
// - gemini-2.5-flash (balanced)

const adapter = geminiText('gemini-2.5-flash', { apiKey });
```

## Production Deployment

### 1. Build the Frontend

```bash
npm run build
```

This creates a `dist/` folder with optimized static files.

### 2. Deploy the API Server

The Express server in `server/index.ts` can be deployed to:
- Vercel (serverless functions)
- Railway
- Render
- AWS Lambda
- Any Node.js hosting

### 3. Update CORS Origins

In `server/index.ts`, update the allowed origins:

```typescript
app.use(cors({
  origin: ['https://your-domain.com'],
  credentials: true,
}));
```

### 4. Update Frontend API URL

In `components/ChatWithAI.tsx`, update the connection URL:

```typescript
connection: fetchServerSentEvents('https://api.your-domain.com/api/chat'),
```

## Troubleshooting

### "GEMINI_API_KEY not configured"

Ensure your `.env.local` file exists and contains a valid API key.

### CORS Errors

Check that the API server's CORS configuration includes your frontend URL.

### SSE Connection Fails

1. Verify the API server is running on port 3001
2. Check browser console for connection errors
3. Ensure no firewall is blocking the connection

### Tool Not Executing

1. Check the system prompt allows the tool to be called
2. Verify the user has provided required information (email, project details)
3. Check server logs for tool execution errors

## Support

For issues or questions:
- Email: hello@olanai.tech
- GitHub: [Report an issue](https://github.com/olanai/olanai)
