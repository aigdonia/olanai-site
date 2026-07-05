
import React from 'react';
import { ArrowRight, Send, User } from 'lucide-react';
import { HeroBackground } from './HeroBackground';
import { OlanCircles } from './OlanCircles';
import { startProject } from '../lib/cta';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      <HeroBackground />
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          AI Engineering, <br className="hidden md:block" />
          with <span className="text-white font-bold">foresight.</span>
        </h1>

        {/* Value prop — the 3-second "what / who" */}
        <p className="max-w-2xl mx-auto text-gray-300 text-xl md:text-2xl font-medium mb-6 font-display">
          We design and build SaaS platforms, internal tools, and AI systems for growing businesses.
        </p>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-gray-300 text-lg md:text-xl mb-10 leading-relaxed">
          Vibe coding ships fast but creates chaos. We bring engineering discipline to AI-powered development. We use this approach to build our own internal tooling — so we know it works before we use it on yours.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button
            onClick={() => startProject()}
            className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-display"
          >
            Start a Project
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => document.getElementById('how-we-work')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-bold rounded-full border border-white/10 hover:bg-white/10 transition-all font-display"
          >
            How We Work
          </button>
        </div>

        {/* Hero Image/Mockup Area */}
        <div className="relative mx-auto max-w-5xl group">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="relative bg-neutral-900/50 rounded-2xl border border-white/10 aspect-video flex items-center justify-center overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
              <div className="w-2 h-2 rounded-full bg-green-500/50" />
            </div>
            {/* Static preview of the live chat (the product the CTAs open) */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 top-10 flex flex-col gap-3 p-4 sm:p-6 text-left select-none pointer-events-none transition-all duration-500 group-hover:scale-[0.97] group-hover:opacity-30 group-hover:blur-sm"
            >
              {/* Assistant */}
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <OlanCircles width={18} height={18} className="text-white" />
                </div>
                <div className="max-w-[80%] bg-white/5 text-gray-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed">
                  Hi, I'm Goss. What are you looking to build?
                </div>
              </div>

              {/* User */}
              <div className="flex gap-3 justify-end">
                <div className="max-w-[80%] bg-purple-600 text-white rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed">
                  A SaaS MVP for my startup — web and mobile.
                </div>
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Assistant + chips */}
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <OlanCircles width={18} height={18} className="text-white" />
                </div>
                <div className="max-w-[80%] bg-white/5 text-gray-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed">
                  Love it — roughly what budget are we working with?
                </div>
              </div>
              <div className="pl-11 flex flex-wrap gap-2">
                {['$10–25k', '$25–50k', '$50k+'].map((c) => (
                  <span key={c} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs">
                    {c}
                  </span>
                ))}
              </div>

              {/* Input bar */}
              <div className="mt-auto flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2.5">
                <span className="text-gray-400 text-sm">Describe your project…</span>
                <span className="ml-auto w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Send className="w-4 h-4 text-white" />
                </span>
              </div>
            </div>

            {/* Hover CTA overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-500 pointer-events-none group-hover:pointer-events-auto focus-within:pointer-events-auto">
              <button
                onClick={() => startProject()}
                className="px-8 py-5 bg-white text-black text-lg font-bold rounded-full hover:bg-gray-200 transition-transform transform hover:scale-105 flex items-center gap-2 shadow-2xl font-display"
              >
                Tell us what you're building
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
