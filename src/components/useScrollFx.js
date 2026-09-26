import { useLayoutEffect } from 'react';

// Scroll effects:
//  - [data-fx="name"]      entrance animation every time the element enters the viewport
//                          (reset once it has fully left, so it replays on the next pass)
//  - [data-stagger="name"] gives every child data-fx="name" plus a --i index for staggered delays
//  - [data-scroll]         continuously receives --p (0 = just entering bottom, 1 = just left top)
//  - [data-count]          number counts up from 0 each time it is revealed
//  - documentElement gets --sp (0..1 page scroll progress) for the top progress bar
export default function useScrollFx() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    document.querySelectorAll('[data-stagger]').forEach((box) => {
      [...box.children].forEach((child, i) => {
        if (!child.dataset.fx) child.dataset.fx = box.dataset.stagger;
        child.style.setProperty('--i', i);
      });
    });
    root.classList.add('fx');

    const countUp = (el) => {
      cancelAnimationFrame(el._countRaf);
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const dur = 1600;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) el._countRaf = requestAnimationFrame(tick);
      };
      el._countRaf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const vh = window.innerHeight;
        entries.forEach((entry) => {
          const el = entry.target;
          if (!entry.isIntersecting) {
            // fully out of view: reset so the effect plays again next time
            el.classList.remove('in');
            if (el.dataset.count) cancelAnimationFrame(el._countRaf);
            return;
          }
          // 15% of the element visible (or 15% of the screen for very tall elements)
          const enough = entry.intersectionRatio >= 0.15 || entry.intersectionRect.height >= vh * 0.15;
          if (!enough || el.classList.contains('in')) return;
          el.classList.add('in');
          if (el.dataset.count) countUp(el);
        });
      },
      { threshold: [0, 0.05, 0.1, 0.15, 0.3] }
    );
    document.querySelectorAll('[data-fx],[data-count]').forEach((el) => io.observe(el));

    const scrollEls = [...document.querySelectorAll('[data-scroll]')];
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const max = root.scrollHeight - vh;
      root.style.setProperty('--sp', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
      scrollEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        el.style.setProperty('--p', p.toFixed(4));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      root.classList.remove('fx');
    };
  }, []);
}
