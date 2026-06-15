import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, User, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';
import { useChat, fetchServerSentEvents, type UIMessage } from '@tanstack/ai-react';
import { captureLeadTool, type CaptureLeadInput } from '../src/tools/definitions';
import { OlanCircles } from './OlanCircles';

// Chat API endpoint — configurable so production (Cloudflare) can point elsewhere
// without code changes. Falls back to the local dev API server.
const CHAT_API_URL =
  (import.meta.env.VITE_CHAT_API_URL as string | undefined) ||
  'http://localhost:3001/api/chat';

// Soft-close before the server's hard cap (16) so the UX degrades gracefully.
const MAX_USER_MESSAGES = 12;

const SOFT_CLOSE_TEXT =
  "No problem at all — whenever you're ready, reach us at hello@olanai.tech and the team will take it from there.";

// --- Funnel data (deterministic, client-side — these forks cost zero LLM tokens) ---

type Stage = 'welcome' | 'discovery' | 'qualify' | 'closed';

interface FunnelContext {
  funnelStage: Stage;
  serviceCategory?: string;
  budgetBand?: string;
  timeline?: string;
}

const SERVICE_OPTIONS = [
  { key: 'full_product', label: 'Full product (SaaS / mobile)', seed: "I'm looking to build a full product — SaaS or mobile." },
  { key: 'internal_tools', label: 'Internal tool / automation', seed: 'I need an internal tool or workflow automation.' },
  { key: 'ai_integration', label: 'AI feature / integration', seed: 'I want to add AI features to a product.' },
  { key: 'team_augmentation', label: 'Team augmentation', seed: "I'd like to augment my engineering team." },
] as const;

const BUDGET_OPTIONS = [
  { key: 'under_10k', label: 'Under $10k' },
  { key: '10k_25k', label: '$10k–25k' },
  { key: '25k_50k', label: '$25k–50k' },
  { key: '50k_100k', label: '$50k–100k' },
  { key: 'over_100k', label: '$100k+' },
  { key: 'not_specified', label: 'Not sure yet' },
] as const;

const TIMELINE_OPTIONS = [
  { label: 'ASAP' },
  { label: '1–3 months' },
  { label: '3–6 months' },
  { label: 'Just exploring' },
] as const;

// Helper to extract text from message parts
const getMessageText = (message: UIMessage): string => {
  if (!message.parts) return '';
  return message.parts
    .filter((part): part is { type: 'text'; content: string } => part.type === 'text')
    .map((part) => part.content)
    .join('');
};

// Check if message has tool calls
const hasToolCall = (message: UIMessage): boolean => {
  if (!message.parts) return false;
  return message.parts.some((part) => part.type === 'tool-call');
};

// Client-side tool for UI feedback
const captureLeadClient = captureLeadTool.client(async (rawArgs) => {
  const args = rawArgs as CaptureLeadInput;
  // Client-side feedback - the actual capture happens on server
  return {
    success: true,
    message: `Information captured for ${args.name}`,
    leadId: undefined,
  };
});

export const ChatWithAI: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [leadCaptured, setLeadCaptured] = useState(false);
  // Funnel state, mirrored to a ref so the per-request body function always
  // ships the latest selections to the server (state updates are async).
  const [stage, setStage] = useState<Stage>('welcome');
  const [serviceCategory, setServiceCategory] = useState<string | undefined>();
  const [budgetBand, setBudgetBand] = useState<string | undefined>();
  const [timeline, setTimeline] = useState<string | undefined>();
  const ctxRef = useRef<FunnelContext>({ funnelStage: 'welcome' });

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial greeting message (rendered UI — costs no LLM tokens)
  const initialMessage: UIMessage = {
    id: 'greeting',
    role: 'assistant',
    parts: [{
      type: 'text',
      content: "Hi, I'm Goss, OlanAI's AI sales engineer. I help you figure out scope, approach, and whether we're a fit — then our engineering team builds it. What are you working on?"
    }],
    createdAt: new Date(),
  };

  // TanStack AI useChat hook with SSE streaming
  const {
    messages,
    sendMessage,
    isLoading,
    error,
    reload,
    setMessages,
  } = useChat({
    // The options function resolves per request, so ctxRef.current always
    // reflects the visitor's latest chip selections and funnel stage.
    connection: fetchServerSentEvents(CHAT_API_URL, () => ({ body: { ...ctxRef.current } })),
    initialMessages: [initialMessage],
    tools: [captureLeadClient],
    onFinish: (message) => {
      // Check if lead was captured in this message
      if (message.parts?.some((part) =>
        part.type === 'tool-call' && part.name === 'capture_lead'
      )) {
        setLeadCaptured(true);
        setStage('closed');
      }
    },
    onError: (err) => {
      console.error('Chat error:', err);
    },
  });

  const userMessageCount = messages.filter((m) => m.role === 'user').length;
  const capReached = userMessageCount >= MAX_USER_MESSAGES;
  const conversationOver = leadCaptured || stage === 'closed' || capReached;

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Listen for chat prompt from Features "Learn more" links
  useEffect(() => {
    const handleSetPrompt = (e: CustomEvent<string>) => {
      setInputText(e.detail);
      inputRef.current?.focus();
    };

    window.addEventListener('setChatPrompt', handleSetPrompt as EventListener);
    return () => window.removeEventListener('setChatPrompt', handleSetPrompt as EventListener);
  }, []);

  // Send a message while syncing funnel context (ref updated synchronously first).
  const sendWithContext = useCallback(async (text: string, patch?: Partial<FunnelContext>) => {
    if (patch) ctxRef.current = { ...ctxRef.current, ...patch };
    await sendMessage(text);
  }, [sendMessage]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || conversationOver) return;
    const text = inputText.trim();
    setInputText('');
    // Free-text in the welcome stage still advances the funnel.
    if (stage === 'welcome') {
      setStage('discovery');
      await sendWithContext(text, { funnelStage: 'discovery' });
    } else if (stage === 'discovery') {
      // The first free-text answer IS the project description. Only now do we
      // advance to qualify, so the budget/timeline chips can't short-circuit
      // discovery before Goss understands the project.
      setStage('qualify');
      await sendWithContext(text, { funnelStage: 'qualify' });
    } else {
      await sendWithContext(text);
    }
  };

  const handleSelectService = async (option: typeof SERVICE_OPTIONS[number]) => {
    setServiceCategory(option.key);
    setStage('discovery');
    await sendWithContext(option.seed, { funnelStage: 'discovery', serviceCategory: option.key });
  };

  const handleJustExploring = () => {
    // Zero-LLM soft close — no model call for tire-kickers.
    setStage('closed');
    setMessages([
      ...messages,
      {
        id: `soft-close-${messages.length}`,
        role: 'assistant',
        parts: [{ type: 'text', content: SOFT_CLOSE_TEXT }],
        createdAt: new Date(),
      },
    ]);
  };

  const handleSelectBudget = async (option: typeof BUDGET_OPTIONS[number]) => {
    setBudgetBand(option.key);
    setStage('qualify');
    await sendWithContext(`My budget is around: ${option.label}.`, { funnelStage: 'qualify', budgetBand: option.key });
  };

  const handleSelectTimeline = async (option: typeof TIMELINE_OPTIONS[number]) => {
    setTimeline(option.label);
    setStage('qualify');
    await sendWithContext(`My timeline: ${option.label}.`, { funnelStage: 'qualify', timeline: option.label });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([initialMessage]);
    setLeadCaptured(false);
    setStage('welcome');
    setServiceCategory(undefined);
    setBudgetBand(undefined);
    setTimeline(undefined);
    ctxRef.current = { funnelStage: 'welcome' };
  };

  // Decide which deterministic chips to show for the current funnel state.
  const renderChips = () => {
    if (conversationOver || isLoading) return null;

    if (stage === 'welcome') {
      return (
        <ChipRow label="Pick what fits:">
          {SERVICE_OPTIONS.map((opt) => (
            <Chip key={opt.key} onClick={() => handleSelectService(opt)}>{opt.label}</Chip>
          ))}
          <Chip variant="ghost" onClick={handleJustExploring}>Just exploring</Chip>
        </ChipRow>
      );
    }

    // During discovery, show NO chips — the visitor must describe the project in
    // free text before any qualify shortcuts appear. This guarantees Goss does
    // real discovery instead of jumping straight to budget/timeline collection.
    if (stage === 'discovery') return null;

    if (!budgetBand) {
      return (
        <ChipRow label="Rough budget?">
          {BUDGET_OPTIONS.map((opt) => (
            <Chip key={opt.key} onClick={() => handleSelectBudget(opt)}>{opt.label}</Chip>
          ))}
        </ChipRow>
      );
    }

    if (!timeline) {
      return (
        <ChipRow label="Timeline?">
          {TIMELINE_OPTIONS.map((opt) => (
            <Chip key={opt.label} onClick={() => handleSelectTimeline(opt)}>{opt.label}</Chip>
          ))}
        </ChipRow>
      );
    }

    return null;
  };

  return (
    <section id="chat" className="py-24 px-4 relative">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
            Let's Talk
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Tell Goss what you're trying to build or solve. He'll help you gauge scope, approach, and fit — no commitment required.
          </p>
        </div>

        {/* Lead Captured Success Banner */}
        {leadCaptured && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-green-400 font-medium">Thanks for your interest!</p>
              <p className="text-green-300/70 text-sm">Our team will reach out within 24 hours.</p>
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Messages Area (conventional: oldest at top, newest at bottom) */}
          <div ref={messagesContainerRef} className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => {
              const text = getMessageText(message);
              const isToolCallOnly = hasToolCall(message) && !text;

              // Skip rendering if it's only a tool call with no text
              if (isToolCallOnly) return null;
              // Skip rendering if there's no text content
              if (!text) return null;

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <OlanCircles width={18} height={18} className="text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white rounded-br-md'
                        : 'bg-white/5 text-gray-100 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
                    {message.createdAt && (
                      <p className="text-xs opacity-60 mt-2">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <OlanCircles width={18} height={18} className="text-white" />
                </div>
                <div className="bg-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Goss is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick-reply chips, inline in the conversation (aligned under Goss) */}
            {renderChips() && (
              <div className="pl-11">{renderChips()}</div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-6 py-3 bg-red-500/10 border-t border-red-500/30">
              <p className="text-red-400 text-sm">
                {error.message || 'Something went wrong. Please try again.'}
              </p>
              <button
                onClick={() => reload()}
                className="text-red-300 hover:text-red-100 text-xs mt-1 underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Input Area (anchored at the bottom, conventional chat) */}
          <div className="border-t border-white/10 p-4">
            {conversationOver && !leadCaptured ? (
              <div className="text-center py-3">
                <p className="text-gray-300 text-sm mb-3">
                  {capReached
                    ? "Let's continue this over email so the team can give it proper attention."
                    : 'Whenever you\'re ready to talk, we\'re here.'}
                </p>
                <a
                  href="mailto:hello@olanai.tech"
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-full font-medium transition-colors"
                >
                  hello@olanai.tech
                  <Send className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <>
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3 items-end">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask Goss about your project, our process, or pricing..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      disabled={isLoading || leadCaptured}
                      autoComplete="off"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading || leadCaptured}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-2xl p-3 transition-colors duration-200 flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>

                {/* Clear chat button */}
                {messages.length > 1 && (
                  <button
                    onClick={handleClearChat}
                    className="mt-2 text-gray-500 hover:text-gray-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Clear conversation
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-6">Prefer email? Reach out directly.</p>
          <a
            href="mailto:hello@olanai.tech"
            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2 mx-auto inline-flex"
          >
            hello@olanai.tech
            <Send className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

// --- Chip UI primitives ---

const ChipRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="mt-3 flex flex-col items-start gap-2">
    <span className="text-xs text-gray-500">{label}</span>
    {children}
  </div>
);

const Chip: React.FC<{ onClick: () => void; children: React.ReactNode; variant?: 'solid' | 'ghost' }> = ({
  onClick,
  children,
  variant = 'solid',
}) => (
  <button
    type="button"
    onClick={onClick}
    className={
      variant === 'ghost'
        ? 'text-sm px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20 transition-colors'
        : 'text-sm px-4 py-2 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-100 hover:bg-purple-500/20 hover:border-purple-500/50 transition-colors'
    }
  >
    {children}
  </button>
);
