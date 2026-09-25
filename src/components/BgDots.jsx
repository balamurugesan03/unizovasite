import { useEffect, useRef } from 'react';

// Full-page twinkling green/white dots with scroll parallax (fixed canvas behind everything).
export default function BgDots() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let D = [];
    let W = 0;
    let H = 0;
    let raf = 0;

    const seed = () => {
      W = window.innerWidth;
      H = cv.clientHeight || window.innerHeight; // 100lvh in CSS: stable while the mobile URL bar moves
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      D = [];
      const n = Math.round((W * H) / (W < 700 ? 1800 : 1300));
      for (let i = 0; i < n; i++) {
        const g = Math.random() < 0.78;
        D.push({
          x: Math.random() * W,
          y: Math.random() * H * 1.6,
          r: Math.random() < 0.9 ? Math.random() * 0.6 + 0.35 : Math.random() * 0.6 + 0.9,
          c: g ? (Math.random() < 0.5 ? '#39e04a' : '#6dff78') : '#ffffff',
          a: g ? Math.random() * 0.6 + 0.3 : Math.random() * 0.4 + 0.15,
          tw: Math.random() * 6.28,
          sp: 0.6 + Math.random() * 1.8,
          d: 0.05 + Math.random() * 0.25,
        });
      }
    };

    const draw = (now) => {
      raf = 0;
      const t = now / 1000;
      const sy = window.scrollY;
      const span = H * 1.6;
      ctx.clearRect(0, 0, W, H);
      for (const p of D) {
        const y = (((p.y - sy * p.d) % span) + span) % span;
        if (y > H) continue;
        ctx.globalAlpha = reduce ? p.a : p.a * (0.55 + 0.45 * Math.sin(t * p.sp + p.tw));
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, y, p.r, 0, 6.283);
        ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    const redraw = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    // mobile browsers fire resize when the URL bar shows/hides; skip reseeding when nothing changed
    const onResize = () => {
      if (window.innerWidth === W && (cv.clientHeight || window.innerHeight) === H) return;
      seed();
      redraw();
    };

    seed();
    redraw();
    window.addEventListener('resize', onResize);
    if (reduce) window.addEventListener('scroll', redraw, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', redraw);
    };
  }, []);

  return <canvas id="bgdots" ref={ref} aria-hidden="true" />;
}
