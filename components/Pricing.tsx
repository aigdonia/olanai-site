
import React, { useState, useEffect, useRef } from 'react';
import { Check, ArrowRight } from 'lucide-react';

const processSteps = [
  {
    step: '01',
    title: 'Understand',
    description: 'We learn your business, your goals, and what success looks like for you.'
  },
  {
    step: '02',
    title: 'Plan',
    description: 'We design the solution and break it into clear milestones with fixed costs.'
  },
  {
    step: '03',
    title: 'Build',
    description: 'We develop in iterations — you see progress, give feedback, and stay in control.'
  },
  {
    step: '04',
    title: 'Test',
    description: 'We ensure everything works as expected before it goes live.'
  },
  {
    step: '05',
    title: 'Launch & Support',
    description: 'We deploy to production, train your team, and stick around to keep things running.'
  }
];

const includedItems = [
  'Milestone-based delivery',
  'Fixed pricing per phase',
  'Full ownership of your code',
  'Direct communication with engineers',
  'No long-term contracts',
  'Post-launch support included'
];

// Animated Timeline View
const AnimatedTimeline: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (timelineRef.current) {
      observer.observe(timelineRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-advance through steps (stops at last step)
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= processSteps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div ref={timelineRef} className="mb-16">
      {/* Timeline Container */}
      <div className="relative">
        {/* Horizontal Dotted Line (progress only) */}
        <div
          className="hidden md:block absolute top-8 left-0 h-px border-t-2 border-dashed border-purple-400/50 transition-all duration-1000 ease-out"
          style={{ width: isVisible ? `${((activeStep + 1) / processSteps.length) * 100}%` : '0%' }}
        />

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4">
          {processSteps.map((item, i) => (
            <div
              key={i}
              className={`relative flex flex-col items-center text-center transition-all duration-500 cursor-pointer ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
              onClick={() => setActiveStep(i)}
            >
              {/* Node */}
              <div
                className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                  i <= activeStep
                    ? 'bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)]'
                    : 'bg-white/5 border border-white/20'
                }`}
              >
                <span className={`text-lg font-bold transition-colors duration-300 ${
                  i <= activeStep ? 'text-white' : 'text-gray-500'
                }`}>
                  {item.step}
                </span>

                {/* Pulse animation for active step */}
                {i === activeStep && (
                  <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-25" />
                )}
              </div>

              {/* Title */}
              <h4 className={`mt-4 text-lg font-bold transition-colors duration-300 ${
                i <= activeStep ? 'text-white' : 'text-gray-500'
              }`}>
                {item.title}
              </h4>

              {/* Description - shows on active */}
              <div className={`mt-2 overflow-hidden transition-all duration-500 ${
                i === activeStep ? 'max-h-24 opacity-100' : 'max-h-0 md:max-h-24 opacity-0 md:opacity-50'
              }`}>
                <p className="text-gray-400 text-sm leading-relaxed px-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Active Step Detail Card */}
      <div className="md:hidden mt-8 p-6 rounded-2xl bg-white/[0.03] border border-purple-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
            <span className="text-sm font-bold text-white">{processSteps[activeStep].step}</span>
          </div>
          <h4 className="text-xl font-bold">{processSteps[activeStep].title}</h4>
        </div>
        <p className="text-gray-400 leading-relaxed">{processSteps[activeStep].description}</p>
      </div>

      {/* Step Indicators (Mobile) */}
      <div className="flex justify-center gap-2 mt-6 md:hidden">
        {processSteps.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === activeStep ? 'w-6 bg-purple-500' : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Static Grid View (Original)
const StaticGrid: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-16">
    {processSteps.map((item, i) => (
      <div
        key={i}
        className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all"
      >
        <div className="text-4xl font-bold text-purple-500/30 mb-4">{item.step}</div>
        <h4 className="text-xl font-bold mb-2">{item.title}</h4>
        <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
      </div>
    ))}
  </div>
);

export const Pricing: React.FC = () => {
  // A/B Test: 'animated' | 'static' (uncomment toggle above to enable)
  // const [viewMode, setViewMode] = useState<'animated' | 'static'>('animated');

  return (
    <section id="how-we-work" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-purple-500 font-semibold tracking-wider uppercase text-sm mb-3">How We Work</h2>
          <h3 className="text-4xl md:text-5xl font-bold mb-6">Predictable costs. Clear milestones.</h3>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            No retainers. No hourly billing surprises. You pay for deliverables, and you own everything we build.
          </p>
        </div>

        {/* Philosophy Callout */}
        <div className="max-w-3xl mx-auto mb-16 p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
          <p className="text-lg text-gray-300 leading-relaxed">
            We build from scratch when it makes sense — and extend what you already have when it doesn't.
            Your current tools and investments matter. We maximize them before adding anything new.
          </p>
        </div>

        {/* A/B Toggle (hidden in production, visible for testing) */}
        {/* <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setViewMode('animated')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'animated'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Timeline View
          </button>
          <button
            onClick={() => setViewMode('static')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'static'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Card View
          </button>
        </div> */}

        {/* Process Steps - Timeline View (Card View available via toggle above) */}
        <AnimatedTimeline />
        {/* {viewMode === 'animated' ? <AnimatedTimeline /> : <StaticGrid />} */}

        {/* Engagement Card */}
        <div className="max-w-2xl mx-auto">
          <div className="relative p-8 md:p-12 rounded-3xl bg-white/[0.03] border border-purple-500/30 shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]">
            <div className="text-center mb-8">
              <h4 className="text-2xl md:text-3xl font-bold mb-4">Every project starts with a conversation</h4>
              <p className="text-gray-400 leading-relaxed">
                We scope together, agree on milestones, and you only pay for what gets delivered.
                No open-ended retainers. No runaway budgets. Just clear phases with clear outcomes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {includedItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <button
              onClick={() => document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full py-4 rounded-xl font-bold bg-purple-500 hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
            >
              Let's Talk About Your Project
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
