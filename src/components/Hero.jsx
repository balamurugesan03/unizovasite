import UMark3D from './UMark3D';
import { Arrow } from './Sprite';

export default function Hero() {
  return (
    <div className="wrap hero">
      <div>
        <div className="eyebrow">AI Software &amp; Automation Studio</div>
        <h1>
          Build Smarter.
          <br />
          Automate Faster.
        </h1>
        <div className="btns">
          <a href="#contact" className="btn">Book a Strategy Call <Arrow /></a>
          <a href="#contact" className="btn">Have a Chat <Arrow /></a>
        </div>
      </div>
      <div className="hero-mark">
        <UMark3D label="Unizova 3D logo" />
      </div>
    </div>
  );
}
