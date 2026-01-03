
import React from 'react';
import { Bot, Code2, Users, Globe, Layers, ShieldCheck } from 'lucide-react';

const features = [
  {
    title: 'Full Product Development',
    description: 'From MVPs to full-scale SaaS and mobile applications. We own the entire delivery process — architecture, development, deployment, and beyond.',
    icon: <Code2 className="w-8 h-8 text-purple-500" />,
    className: 'md:col-span-2',
    chatPrompt: 'Tell me about building a SaaS or mobile app from scratch'
  },
  {
    title: 'Internal Tools & Automation',
    description: 'Streamline your operations with custom tools that orchestrate daily tasks, reduce app clutter, and support smarter decision-making.',
    icon: <Layers className="w-8 h-8 text-blue-500" />,
    className: 'md:col-span-1',
    chatPrompt: 'How can you help with internal tools and automation?'
  },
  {
    title: 'AI Engineering',
    description: 'We integrate AI where it matters — not as a gimmick, but as infrastructure. Real engineers building real solutions.',
    icon: <Bot className="w-8 h-8 text-emerald-500" />,
    className: 'md:col-span-1',
    chatPrompt: 'How do you integrate AI into software projects?'
  },
  {
    title: 'Team Augmentation',
    description: 'Already have a team? We embed with your engineers to accelerate delivery, introduce AI tooling, and strengthen your development practices.',
    icon: <Users className="w-8 h-8 text-orange-500" />,
    className: 'md:col-span-2',
    chatPrompt: 'We have an existing dev team — how can you help us?'
  }
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-purple-500 font-semibold tracking-wider uppercase text-sm mb-3">What We Do</h2>
          <h3 className="text-4xl md:text-5xl font-bold mb-6">Digital transformation, done right</h3>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            We help SMBs go digital without the chaos. Real engineers using AI to build software that actually works.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div 
              key={i}
              className={`group relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all duration-300 overflow-hidden ${feature.className}`}
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity">
                {feature.icon}
              </div>
              <div className="mb-6 inline-block p-3 rounded-2xl bg-white/5 border border-white/10">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('setChatPrompt', { detail: feature.chatPrompt }));
                  document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-8 flex items-center text-sm font-semibold text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 hover:text-purple-300"
              >
                Learn more <span className="ml-2">→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
