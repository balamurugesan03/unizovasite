import UMark3D from './UMark3D';

export default function About() {
  return (
    <section className="sec" id="about">
      <div className="wrap about">
        <div>
          <div className="kicker">About Unizova Technologies</div>
          <h3>
            We believe in crafting
            <br />
            experiences for the future.
          </h3>
          <p>
            Unizova helps businesses worldwide embrace digital transformation through bespoke solutions that drive
            innovation, growth, and better digital experiences.
          </p>
          <a href="#contact" className="btn">Learn More</a>
          <div className="stats">
            <div><b>240+</b><span>Business Peoples</span></div>
            <div><b>100%</b><span>Customer Satisfaction</span></div>
          </div>
        </div>
        <div className="hero-mark">
          <UMark3D small />
        </div>
      </div>
    </section>
  );
}
