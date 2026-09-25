import { useEffect, useRef, useState } from 'react';

const LINKS = [
  ['#services', 'Services'],
  ['#cases', 'Our Works'],
  ['#industries', 'Industries'],
  ['#services', 'Solutions'],
  ['#about', 'Career'],
  ['#about', 'Technologies'],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close the mobile menu on Escape, outside tap, or when resizing up to desktop
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const mq = window.matchMedia('(min-width: 901px)');
    const onMq = () => mq.matches && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    mq.addEventListener('change', onMq);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
      mq.removeEventListener('change', onMq);
    };
  }, [open]);

  return (
    <header ref={ref}>
      <div className="wrap nav">
        <a href="#" className="logo" aria-label="Unizova Technologies home">
          <svg viewBox="0 0 472 124">
            <use href="#wordmark" />
          </svg>
        </a>
        <nav>
          <ul id="menu" className={open ? 'open' : undefined}>
            {LINKS.map(([href, label]) => (
              <li key={label}>
                <a href={href} onClick={() => setOpen(false)}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <button
          className={open ? 'burger open' : 'burger'}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-controls="menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
