
import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

const processSteps = [
  {
    step: '01',
    title: 'Discovery',
    description: 'We learn your business, map your needs, and define the scope together.'
  },
  {
    step: '02',
    title: 'Proposal',
    description: 'You get a clear milestone breakdown with fixed costs — no surprises.'
  },
  {
    step: '03',
    title: 'Build',
    description: 'We deliver in iterations. You see progress, give feedback, and pay per milestone.'
  },
  {
    step: '04',
    title: 'Launch & Support',
    description: 'We ship production-ready software and stick around to make sure it works.'
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

export const Pricing: React.FC = () => {
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

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
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
