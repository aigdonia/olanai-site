import React, { useEffect, useRef } from 'react';

/**
 * Interactive constellation for the hero background. A field of drifting dots
 * stays dim at rest and ignites around the cursor — dots and links bloom where
 * you look. Before any pointer input (and on touch), the light gently orbits
 * on its own so it never sits dead.
 *
 * Pure canvas + rAF (no deps), DPR-aware, brand palette (indigo #4F46E5 ->
 * purple #A855F7). Masked via CSS so it's strongest around the headline and
 * fades out before the browser mockup. Honors prefers-reduced-motion and
 * pauses when the tab is hidden.
 */
export const HeroBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PURPLE = '168, 85, 247';
    const INDIGO = '79, 70, 229';
    const colors = [PURPLE, INDIGO];
    const TWO_PI = Math.PI * 2;
    const LINK_DIST = 130;
    const GLOW = 230; // cursor reveal radius

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let tick = 0;

    type P = { x: number; y: number; vx: number; vy: number; r: number; c: string };
    let particles: P[] = [];

    // Cursor target (mx,my) + eased glow position (gx,gy).
    let mx = 0, my = 0, gx = 0, gy = 0;
    let hasPointer = false;

    const seed = () => {
      const count = Math.min(90, Math.round((width * height) / 16000));
      particles = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.8,
        c: colors[i % colors.length],
      }));
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mx = gx = width * 0.5;
      my = gy = height * 0.3;
      seed();
    };

    const frame = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Idle orbit until the user moves the pointer.
      if (!hasPointer) {
        mx = width * 0.5 + Math.sin(tick * 0.01) * width * 0.18;
        my = height * 0.32 + Math.cos(tick * 0.013) * height * 0.12;
      }
      gx += (mx - gx) * 0.08;
      gy += (my - gy) * 0.08;

      // Move dots
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      // Links — dim at rest, igniting near the cursor
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK_DIST) {
            const prox = Math.max(0, 1 - Math.hypot((a.x + b.x) / 2 - gx, (a.y + b.y) / 2 - gy) / GLOW);
            const falloff = 1 - dist / LINK_DIST;
            ctx.strokeStyle = `rgba(${a.c}, ${falloff * (0.05 + prox * 0.55)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Dots — dim at rest, bright + bloomed under the light
      for (const p of particles) {
        const inten = Math.max(0, 1 - Math.hypot(p.x - gx, p.y - gy) / GLOW);
        if (inten > 0.15) { ctx.shadowColor = `rgba(${p.c}, 0.9)`; ctx.shadowBlur = 8 * inten; }
        ctx.fillStyle = `rgba(${p.c}, ${0.22 + inten * 0.7})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + inten * 1.4, 0, TWO_PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Soft glow pool at the cursor
      const rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, GLOW);
      rg.addColorStop(0, `rgba(${PURPLE}, 0.06)`);
      rg.addColorStop(1, `rgba(${PURPLE}, 0)`);
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, width, height);
    };

    let raf = 0;
    let running = true;
    const loop = () => {
      if (!running) return;
      frame();
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduceMotion) {
        running = true;
        loop();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
      hasPointer = true;
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pointermove', onPointerMove);

    if (reduceMotion) frame();
    else loop();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent 0%, black 14%, black 42%, transparent 72%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, black 14%, black 42%, transparent 72%)',
      }}
    />
  );
};
