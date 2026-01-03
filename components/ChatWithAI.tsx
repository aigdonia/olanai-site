import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const ChatWithAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Olan. I help businesses go digital without the chaos. Tell me about your project — whether it's a new product, internal tool, or a team that needs support — and I'll help you figure out if we're a good fit.",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToTop = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    scrollToTop();
  }, [messages]);

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

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(userMessage.text),
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Feature-specific prompts (from "Learn more" links)
    if (input.includes('saas') && input.includes('scratch')) {
      return "We handle the full journey — from initial architecture to production deployment. For SaaS, that means auth, billing, multi-tenancy, APIs, the works. For mobile, we build native-quality apps with shared logic where it makes sense. You get milestone-based delivery, so you're never in the dark. What's the product you're envisioning?";
    } else if (input.includes('internal tools') || input.includes('automation')) {
      return "Most teams are drowning in disconnected apps and manual processes. We build custom internal tools that tie everything together — task orchestration, dashboards, data pipelines, workflow automation. The goal is fewer apps, less clutter, better decisions. What's eating up your team's time right now?";
    } else if (input.includes('integrate ai') || input.includes('ai into')) {
      return "We integrate AI where it creates real value — not just chatbots for the sake of it. Think intelligent document processing, predictive analytics, automated workflows, or LLM-powered features in your product. We architect it properly so it's maintainable, not a black box. What problem are you trying to solve with AI?";
    } else if (input.includes('existing') && input.includes('team')) {
      return "We embed with your engineers, not replace them. That means working in your codebase, your processes, your tools. We can accelerate delivery on a specific initiative, introduce AI tooling to boost productivity, or help level up your practices. What's the biggest bottleneck your team is facing?";
    }
    // General prompts
    else if (input.includes('pricing') || input.includes('cost') || input.includes('price') || input.includes('budget')) {
      return "Projects start at $5,000 and typically range up to $50K depending on scope. We work on a milestone basis — you pay for deliverables, not hours. No surprises, no retainers. Would you like to tell me about your project so I can give you a better sense of scope?";
    } else if (input.includes('vibe') || input.includes('cursor') || input.includes('copilot')) {
      return "Vibe coding tools are great for prototypes, but they create technical debt fast. We use AI as a tool, not a replacement for engineering judgment. Real engineers review, architect, and ensure what gets built is maintainable. That's how you get AI speed without the chaos.";
    } else if (input.includes('project') || input.includes('build') || input.includes('develop') || input.includes('app') || input.includes('saas') || input.includes('mobile')) {
      return "We build everything from MVPs to full-scale SaaS and mobile apps. The process starts with a discovery call where we scope your needs, then we deliver in milestones so you see progress and can give feedback. What kind of project are you thinking about?";
    } else if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hey! Good to meet you. I'm here to help figure out if OlanAI is the right fit for your project. What are you working on?";
    } else if (input.includes('team') || input.includes('experience') || input.includes('who')) {
      return "We're engineers who've built large-scale mobile apps and SaaS products. We use the same AI-powered engineering approach to build our own internal tooling — so we know it works before we use it on client projects. No vibe-coded chaos.";
    } else if (input.includes('tool') || input.includes('internal') || input.includes('automat') || input.includes('existing') || input.includes('integrat')) {
      return "We work with what you have. If your current tools work, we extend them. If they don't, we replace only what's needed. The goal is to protect your investments and maximize what's already in place before adding anything new.";
    } else if (input.includes('how') || input.includes('process') || input.includes('work')) {
      return "Simple: Discovery → Proposal → Build → Launch. We scope your project, give you a clear milestone breakdown with fixed costs, then deliver in iterations. You pay per milestone, own everything we build, and we stick around post-launch to make sure it works.";
    } else if (input.includes('ai')) {
      return "We integrate AI where it matters — not as a gimmick, but as infrastructure. Whether it's LLMs, automation, or predictive features, we build it with proper engineering so it actually works in production. What are you looking to do with AI?";
    } else {
      return "We help businesses go digital — building from scratch or extending what you already have. We protect your current investments and only add what's truly needed. Real engineers, AI-powered delivery, milestone-based pricing. What's on your mind?";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage();
    }
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
          </div>

          {/* Messages Area */}
          <div ref={messagesContainerRef} className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.slice().reverse().map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-br-md'
                      : 'bg-white/5 text-gray-100 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className="text-xs opacity-60 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
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
