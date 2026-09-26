export default function Band() {
  return (
    <section className="band" data-scroll>
      <svg className="wave" viewBox="0 0 1440 400" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="w1" x1="0" x2="1">
            <stop offset="0" stopColor="#ff3d6e" stopOpacity=".0" />
            <stop offset=".15" stopColor="#ff3d6e" />
            <stop offset=".45" stopColor="#ffb13d" />
            <stop offset=".7" stopColor="#3dc8ff" />
            <stop offset="1" stopColor="#7a3dff" stopOpacity=".2" />
          </linearGradient>
          <linearGradient id="w2" x1="0" x2="1">
            <stop offset="0" stopColor="#b03dff" stopOpacity="0" />
            <stop offset=".3" stopColor="#ff5ea8" />
            <stop offset=".6" stopColor="#ffd23d" />
            <stop offset=".85" stopColor="#3d8bff" />
            <stop offset="1" stopColor="#3d8bff" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <g fill="none" filter="url(#glow)" opacity=".85">
          <path d="M-50 120 C 250 20, 450 220, 720 110 S 1150 30, 1500 150" stroke="url(#w1)" strokeWidth="3" />
          <path d="M-50 150 C 280 60, 480 250, 740 130 S 1180 60, 1500 170" stroke="url(#w2)" strokeWidth="2" />
          <path d="M-50 90 C 220 0, 430 190, 700 90 S 1120 10, 1500 130" stroke="url(#w2)" strokeWidth="1.5" />
        </g>
        <g fill="none" opacity=".55">
          <path d="M-50 110 C 260 30, 460 230, 730 115 S 1160 40, 1500 160" stroke="url(#w1)" strokeWidth="1" />
          <path d="M-50 135 C 270 40, 470 240, 735 125 S 1170 50, 1500 165" stroke="url(#w2)" strokeWidth="1" />
          <path d="M-50 100 C 240 10, 440 205, 710 100 S 1130 20, 1500 140" stroke="url(#w1)" strokeWidth=".8" />
        </g>
      </svg>
      <div className="wrap">
        <h2 data-fx="blur">
          Transform Your Business with
          <br />
          <span className="g">Unizova Intelligent Automation</span>
        </h2>
        <a href="#services" className="pill" data-fx="pop">Explore Our AI Solutions</a>
      </div>
    </section>
  );
}
