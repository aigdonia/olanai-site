import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';
import { useChat, fetchServerSentEvents, type UIMessage } from '@tanstack/ai-react';
import { captureLeadTool, type CaptureLeadInput } from '../src/tools/definitions';

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

export const ChatWithAI: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [leadCaptured, setLeadCaptured] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial greeting message
  const initialMessage: UIMessage = {
    id: 'greeting',
    role: 'assistant',
    parts: [{
      type: 'text',
      content: "Hi! I'm Olan. I help businesses go digital without the chaos. Tell me about your project — whether it's a new product, internal tool, or a team that needs support — and I'll help you figure out if we're a good fit."
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
    connection: fetchServerSentEvents('http://localhost:3001/api/chat'),
    initialMessages: [initialMessage],
    tools: [captureLeadClient],
    onFinish: (message) => {
      // Check if lead was captured in this message
      if (message.parts?.some((part) =>
        part.type === 'tool-call' && part.name === 'capture_lead'
      )) {
        setLeadCaptured(true);
      }
    },
    onError: (err) => {
      console.error('Chat error:', err);
    },
  });

  const scrollToTop = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [messages, scrollToTop]);

  // Listen for chat prompt from Features "Learn more" links
  useEffect(() => {
    const handleSetPrompt = (e: CustomEvent<string>) => {
      setInputText(e.detail);
      inputRef.current?.focus();
    };

    window.addEventListener('setChatPrompt', handleSetPrompt as EventListener);
    return () => window.removeEventListener('setChatPrompt', handleSetPrompt as EventListener);
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    await sendMessage(text);
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
            Tell Olan about your project. Get a sense of scope, approach, and whether we're the right fit — no commitment required.
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
          {/* Input Area */}
          <div className="border-b border-white/10 p-4">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Describe your project, ask about pricing, our process, or anything else..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
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
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/30">
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

          {/* Messages Area */}
          <div ref={messagesContainerRef} className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.slice().reverse().map((message) => {
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
                      <Bot className="w-4 h-4 text-white" />
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
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Olan is thinking...</span>
                  </div>
                </div>
              </div>
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
