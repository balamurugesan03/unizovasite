const COLUMNS = [
  ['Explore Unizova', [['#about', 'About Us'], ['#services', 'Services'], ['#about', 'Career'], ['#contact', 'Contact Us']]],
  ['What we do', [['#services', 'Services'], ['#cases', 'Our Works'], ['#industries', 'Industries'], ['#services', 'Solutions'], ['#about', 'Technologies']]],
  ['Get in Touch', [['tel:+910000000000', '+91 00000 00000'], ['mailto:info@unizova.com', 'info@unizova.com']]],
];
const TAGS = ['Web Designing', 'Mobile App Development', 'Branding', 'Website Development', 'ERP Development', 'CRM Development', 'SEO', 'Digital Marketing'];

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="fgrid" data-stagger="up">
          <div>
            <div className="logo" role="img" aria-label="Unizova Technologies">
              <svg viewBox="0 0 472 124">
                <use href="#wordmark" />
              </svg>
            </div>
            <p>
              Unizova helps businesses worldwide embrace digital transformation through bespoke solutions that drive
              innovation, growth, and better digital experiences.
            </p>
          </div>
          {COLUMNS.map(([title, links]) => (
            <div key={title}>
              <h5>{title}</h5>
              <ul>
                {links.map(([href, label]) => (
                  <li key={label}><a href={href}>{label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="tags" data-stagger="fade">
          {TAGS.map((t) => <span key={t}>{t}</span>)}
        </div>
        <div className="copy">
          <span>© Copyright 2026 Unizova Technologies. All rights reserved.</span>
          <div><a href="#">Terms and Conditions</a><a href="#">Privacy Policy</a></div>
        </div>
      </div>
    </footer>
  );
}
