
import React from 'react';
import { Bot, Code2, Cpu, Globe, Layers, ShieldCheck } from 'lucide-react';

const features = [
  {
    title: 'Autonomous AI Agents',
    description: 'Self-improving agents that handle complex customer service and data entry tasks.',
    icon: <Bot className="w-8 h-8 text-purple-500" />,
    className: 'md:col-span-2'
  },
  {
    title: 'Custom API Design',
    description: 'Robus and scalable backend architectures for enterprise needs.',
    icon: <Cpu className="w-8 h-8 text-blue-500" />,
    className: 'md:col-span-1'
  },
  {
    title: 'Next-Gen Web Apps',
    description: 'Blazing fast React & Next.js applications with pixel-perfect UI.',
    icon: <Code2 className="w-8 h-8 text-emerald-500" />,
    className: 'md:col-span-1'
  },
  {
    title: 'Cloud Infrastructure',
    description: 'Distributed systems on AWS/GCP with 99.9% uptime guaranteed.',
    icon: <Layers className="w-8 h-8 text-orange-500" />,
    className: 'md:col-span-2'
  }
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-purple-500 font-semibold tracking-wider uppercase text-sm mb-3">Our Expertise</h2>
          <h3 className="text-4xl md:text-5xl font-bold mb-6">Engineered for performance</h3>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            We don't just write code. We build intelligent systems that solve real business problems.
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
              
              <div className="mt-8 flex items-center text-sm font-semibold text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                Learn more <span className="ml-2">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
