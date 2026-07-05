
import React from 'react';
import { startProject } from '../lib/cta';

// Single sprite sheet (2x2 grid) lives at /services.jpeg.
// Each card shows one quadrant via background-position with a 200% background-size.
const features = [
  {
    title: 'Full Product Development',
    description: 'From MVPs to full-scale SaaS and mobile applications. We own the entire delivery process — architecture, development, deployment, and beyond.',
    spritePos: '0% 0%',      // top-left: stacked blocks
    className: 'md:col-span-2',
    chatPrompt: 'Tell me about building a SaaS or mobile app from scratch'
  },
  {
    title: 'Internal Tools & Automation',
    description: 'Streamline your operations with custom tools that orchestrate daily tasks, reduce app clutter, and support smarter decision-making.',
    spritePos: '100% 0%',    // top-right: connected nodes
    className: 'md:col-span-1',
    chatPrompt: 'How can you help with internal tools and automation?'
  },
  {
    title: 'AI Engineering',
    description: 'We integrate AI where it matters — not as a gimmick, but as infrastructure. Real engineers building real solutions.',
    spritePos: '0% 100%',    // bottom-left: orbiting core
    className: 'md:col-span-1',
    chatPrompt: 'How do you integrate AI into software projects?'
  },
  {
    title: 'Team Augmentation',
    description: 'Already have a team? We embed with your engineers to accelerate delivery, introduce AI tooling, and strengthen your development practices.',
    spritePos: '100% 100%',  // bottom-right: interlocking rings
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
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            We help SMBs go digital without the chaos. Real engineers using AI to build software that actually works.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`group relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 overflow-hidden ${feature.className}`}
            >
              {/* Hover glow */}
              <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                {/* Icon + title on one row */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Sprite icon — black background dropped via screen blend, glow floats freely */}
                  <div
                    className="flex-shrink-0 w-20 h-20 -m-2 mix-blend-screen transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundImage: 'url(/services.jpeg)',
                      backgroundSize: '200% 200%',
                      backgroundPosition: feature.spritePos,
                    }}
                    role="img"
                    aria-label={feature.title}
                  />
                  <h4 className="text-2xl font-bold">{feature.title}</h4>
                </div>

                <p className="text-gray-300 leading-relaxed">{feature.description}</p>

                <button
                  onClick={() => startProject(feature.chatPrompt)}
                  className="mt-6 flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors font-display"
                >
                  Learn more
                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
