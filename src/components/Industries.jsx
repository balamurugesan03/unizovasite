const INDUSTRIES = ['Real Estate', 'Automobile', 'Manufacturing', 'Retail', 'Travel & Tourism', 'E-Commerce'];

export default function Industries() {
  return (
    <section className="sec" id="industries" style={{ paddingTop: 20 }}>
      <div className="wrap">
        <h3 data-fx="up" style={{ marginBottom: 22 }}>Industries we served</h3>
        <div className="chips" data-stagger="pop">
          {INDUSTRIES.map((name) => (
            <span className="chip" key={name}>{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
