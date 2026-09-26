export default function Cases() {
  return (
    <section className="sec" id="cases" style={{ paddingTop: 30 }}>
      <div className="wrap">
        <div className="head-row" data-fx="blur">
          <h3>
            Check Out Our
            <br />
            Case Studies
          </h3>
          <a href="#cases" className="pill" style={{ marginTop: 0 }}>Explore Our Projects</a>
        </div>
        <div className="cases" data-stagger="wipe">
          <div className="case">
            <figure>
              <div className="img dizad" data-scroll>
                <div className="tree" style={{ left: '2%' }} />
                <div className="bldg" />
                <div className="tree" style={{ right: '2%' }} />
              </div>
            </figure>
            <p>Dizad Interiors</p>
          </div>
          <div className="case">
            <figure>
              <div className="img rahan" data-scroll>
                <div className="wall" />
                <div className="water" />
                <div className="plants" />
                <div className="grass" />
                <div className="person" />
              </div>
            </figure>
            <p>Raihan Landscaping</p>
          </div>
        </div>
      </div>
    </section>
  );
}
