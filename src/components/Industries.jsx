const INDUSTRIES = ['Real Estate', 'Automobile', 'Manufacturing', 'Retail', 'Travel & Tourism', 'E-Commerce'];

export default function Industries() {
  return (
    <section className="sec" id="industries" style={{ paddingTop: 20 }}>
      <div className="wrap">
        <h3 style={{ marginBottom: 22 }}>Industries we served</h3>
        <div className="chips">
          {INDUSTRIES.map((name) => (
            <span className="chip" key={name}>{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
