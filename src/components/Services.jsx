const SERVICES = ['Branding', 'Digital Transformation', 'Digital Experience', 'Digital Evolution', 'SEO', 'Marketing Automation'];

export default function Services() {
  return (
    <section className="sec" id="services">
      <div className="wrap">
        <h3 data-fx="left">
          Services to Help You Succeed
          <br />
          in Your Mission!
        </h3>
        <div className="grid3" data-stagger="flip">
          {SERVICES.map((name) => (
            <div className="svc" key={name}>
              <svg className="ic">
                <use href="#ic" />
              </svg>
              <h4>{name}</h4>
              <p>Services to Help You Succeed in Your Mission</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
