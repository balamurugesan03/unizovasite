import { useState } from 'react';

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
  return (
    <header>
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
        <button className="burger" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          ☰
        </button>
      </div>
    </header>
  );
}
