
import React from 'react';
import { ArrowRight, Star } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-400 mb-8 animate-bounce">
          <Star className="w-3 h-3 fill-current" />
          <span>AI-powered software delivery</span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          AI Engineering, <br className="hidden md:block" />
          with <span className="text-white font-bold">foresight.</span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl mb-10 leading-relaxed text-justify">
          Vibe coding ships fast but creates chaos. We bring engineering discipline to AI-powered development. We use this approach to build our own internal tooling — so we know it works before we use it on yours.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button
            onClick={() => document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            Start a Project
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => document.getElementById('how-we-work')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-bold rounded-full border border-white/10 hover:bg-white/10 transition-all"
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
            {/* Visual content placeholder */}
            <div className="grid grid-cols-3 gap-6 w-full p-12 mt-10">
              <div className="h-32 bg-white/5 rounded-lg border border-white/5 animate-pulse" />
              <div className="h-32 bg-white/5 rounded-lg border border-white/5 animate-pulse [animation-delay:200ms]" />
              <div className="h-32 bg-white/5 rounded-lg border border-white/5 animate-pulse [animation-delay:400ms]" />
              <div className="col-span-2 h-20 bg-white/5 rounded-lg border border-white/5 animate-pulse [animation-delay:600ms]" />
              <div className="h-20 bg-white/5 rounded-lg border border-white/5 animate-pulse [animation-delay:800ms]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
