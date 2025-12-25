
import React from 'react';

const logos = [
  'Vercel', 'Stripe', 'Figma', 'Linear', 'Github', 'Postman', 'Notion', 'Slack', 'Raycast'
];

export const MarqueeLogos: React.FC = () => {
  return (
    <div className="py-20 border-y border-white/5 bg-white/[0.01] overflow-hidden relative">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...logos, ...logos].map((logo, i) => (
          <div key={i} className="mx-12 text-2xl font-bold text-gray-500 hover:text-white transition-colors cursor-default">
            {logo}
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};
