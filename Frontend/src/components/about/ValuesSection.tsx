/* The "uptime / exports / p99 latency / NPS score" figures that used to sit
   under each value were invented, so they're gone. The attributed quotes are
   real quotations and stay. */
const VALUES = [
  {
    title: "Transparency",
    description:
      "We show our work. Every decision, every trade-off, every mistake, documented and shared. You always know what's happening and why.",
    quote: "Sunlight is the best disinfectant.",
    author: "Louis Brandeis",
  },
  {
    title: "Ownership",
    description:
      "Everything you create belongs to you. Export it, move it, delete it. We're the tool, not the vault.",
    quote:
      "Freedom is not worth having if it does not include the freedom to make mistakes.",
    author: "Mahatma Gandhi",
  },
  {
    title: "Craft",
    description:
      "We sweat the pixels, the performance, the micro-interactions. Quality isn't a feature, it's the baseline.",
    quote:
      "Perfection is not attainable, but if we chase perfection we can catch excellence.",
    author: "Vince Lombardi",
  },
  {
    title: "Courage",
    description:
      "We tell you when your idea won't work. We ship the unpopular fix. We kill the feature that's holding everyone back.",
    quote:
      "It takes courage to grow up and become who you really are.",
    author: "E. E. Cummings",
  },
];

export default function ValuesSection() {
  return (
    <section className="ab-sec">
      <div className="ab-wrap">
        <div className="ab-eyebrow">
          <span className="r" />
          <span className="t">02 / how we work</span>
        </div>

        <h2 className="ab-h2">
          The values that survive
          <br />
          contact with a <span style={{ fontStyle: "italic" }}>deadline.</span>
        </h2>

        <div className="ab-grid4" style={{ marginTop: 48 }}>
          {VALUES.map((v) => (
            <div key={v.title} className="ab-cell">
              <h3 className="ab-h3">{v.title}</h3>
              <p className="ab-body">{v.description}</p>
              <p className="ab-quote">
                {v.quote}
                <span
                  className="ab-mono"
                  style={{ display: "block", marginTop: 10, fontStyle: "normal" }}
                >
                  {v.author}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
