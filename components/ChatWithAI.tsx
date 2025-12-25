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
      text: "Hi! I'm OlanAI. I can help you understand how our autonomous agents work, discuss your project requirements, or answer any questions about our services. How can I assist you today?",
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

    if (input.includes('pricing') || input.includes('cost') || input.includes('price')) {
      return "Our pricing is flexible and depends on your project scope and requirements. We offer both project-based pricing and retainer models. Would you like to schedule a consultation to discuss your specific needs?";
    } else if (input.includes('autonomous') || input.includes('agent') || input.includes('ai')) {
      return "Our autonomous AI agents are designed to handle complex software development tasks with minimal human intervention. They can write code, perform testing, manage deployments, and continuously improve based on feedback. Each agent is specialized for specific domains like frontend, backend, or DevOps.";
    } else if (input.includes('project') || input.includes('build') || input.includes('develop')) {
      return "We'd love to help build your project! Our process typically starts with understanding your requirements, then we deploy specialized AI agents to handle different aspects of development. The timeline depends on complexity, but most projects see initial results within 1-2 weeks. What kind of project are you considering?";
    } else if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! Great to meet you. I'm here to help you understand how OlanAI can accelerate your software development with autonomous agents. What questions can I answer for you?";
    } else if (input.includes('team') || input.includes('experience') || input.includes('background')) {
      return "Our team combines deep expertise in AI/ML with proven software engineering experience. We've built systems that scale from startups to enterprise. Our autonomous agents are trained on best practices and can adapt to your specific tech stack and requirements.";
    } else {
      return "That's a great question! Our autonomous AI agents can help with a wide range of software development challenges. Could you tell me more about your specific needs or project requirements? I'd be happy to explain how our approach could benefit your situation.";
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
            Chat with OlanAI
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Chat with Olan about your project, Olan will help answer your questions, and check if we are a fir for your next softeware development.
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
                  placeholder="Ask about our Engineering Approach, Technolog Stack, Pricing, or anything else..."
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
          <p className="text-gray-400 mb-6">Ready to start your project with autonomous AI agents?</p>
          <button 
            onClick={() => document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            Build with us
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
