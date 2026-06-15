import React from 'react';

// Sprite sheet (2x2 grid) at /how-we-build.jpeg. Zoomed in to 300% so each
// icon fills its tile (less empty space); positions are the icon CENTERS
// (12.5% / 87.5%) given the 300% scale. A radial mask fades the tile edges,
// and mix-blend-screen drops the matte-black background into the card.
const SPRITE_SIZE = '300% 300%';

const principles = [
  {
    title: 'Engineering discipline',
    description: 'We bring structure to AI-powered development — clean, maintainable architecture, not vibe-coded chaos you pay for later.',
    spritePos: '12.5% 12.5%',   // top-left: shield + check
  },
  {
    title: 'AI as infrastructure',
    description: 'Model-agnostic LLM systems wired into real workflows, built with the same rigor as the rest of your stack. Not a gimmick.',
    spritePos: '87.5% 12.5%',   // top-right: chip
  },
  {
    title: 'You own everything',
    description: 'Full ownership of your code and infrastructure. No lock-in, no black boxes, no dependency on us to keep the lights on.',
    spritePos: '12.5% 87.5%',   // bottom-left: key
  },
  {
    title: 'Proven on ourselves',
    description: 'We build our own internal tooling this way first — so we know the approach works before we use it on yours.',
    spritePos: '87.5% 87.5%',   // bottom-right: flask
  },
];

const EDGE_FADE = 'radial-gradient(closest-side, #000 68%, transparent 100%)';

export const HowWeBuild: React.FC = () => {
  return (
    <section id="how-we-build" className="py-24 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-purple-500 font-semibold tracking-wider uppercase text-sm mb-3">How We Build</h2>
          <h3 className="text-4xl md:text-5xl font-bold mb-6">Engineering discipline, by default</h3>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            AI accelerates the work. Engineering keeps it standing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((p, i) => (
            <div
              key={i}
              className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 overflow-hidden"
            >
              <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                {/* Sprite icon — zoomed, black bg dropped via screen blend, edges faded via radial mask */}
                <div
                  className="mb-4 w-20 h-20 -ml-1 mix-blend-screen transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundImage: 'url(/how-we-build.jpeg)',
                    backgroundSize: SPRITE_SIZE,
                    backgroundPosition: p.spritePos,
                    maskImage: EDGE_FADE,
                    WebkitMaskImage: EDGE_FADE,
                  }}
                  role="img"
                  aria-label={p.title}
                />
                <h4 className="text-xl font-bold mb-3">{p.title}</h4>
                <p className="text-gray-400 leading-relaxed text-sm">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
