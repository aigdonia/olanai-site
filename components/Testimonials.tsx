
import React from 'react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CTO at TechFlow',
    text: 'Agentic transformed our support workflow. The AI agents they built are handling 70% of our tickets now.',
    avatar: 'https://picsum.photos/100/100?random=1'
  },
  {
    name: 'James Wilson',
    role: 'Founder of Bloom',
    text: 'Best software agency we have worked with. Their attention to detail in UI/UX is unparalleled.',
    avatar: 'https://picsum.photos/100/100?random=2'
  },
  {
    name: 'Elena Rodriguez',
    role: 'Product Lead at Nexus',
    text: 'The speed of delivery was incredible. We went from MVP to full launch in under 6 weeks.',
    avatar: 'https://picsum.photos/100/100?random=3'
  },
  {
    name: 'Michael Park',
    role: 'VP Engineering',
    text: 'The cloud architecture they designed has scaled with us through a 10x growth spurt without a hitch.',
    avatar: 'https://picsum.photos/100/100?random=4'
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
        <h2 className="text-4xl font-bold mb-4">Trusted by industry leaders</h2>
        <p className="text-gray-400">See what our partners have to say about our work.</p>
      </div>

      <div className="flex overflow-hidden relative">
        <div className="flex gap-6 py-4 animate-scroll">
          {[...testimonials, ...testimonials].map((t, i) => (
            <div key={i} className="flex-none w-[350px] p-8 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border border-white/10" />
                <div>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.role}</div>
                </div>
              </div>
              <p className="text-gray-300 italic">"{t.text}"</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </section>
  );
};
