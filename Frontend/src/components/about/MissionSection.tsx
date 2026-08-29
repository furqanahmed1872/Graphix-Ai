/* The numeric chips that sat under each principle (149+ types, <3s, 4 formats,
   $0) were removed — the figures were unverified and the principles read
   better as stated positions than as claims with numbers attached. */
const PRINCIPLES = [
  {
    label: "Brutalist simplicity",
    title: "Clarity over complexity",
    description:
      "Every pixel, every label, every chart type exists for one reason: to make data easier to understand. Nothing more.",
  },
  {
    label: "User obsession",
    title: "Speed is a feature",
    description:
      "A chart should arrive while you still remember why you asked for it. No spinners, no thinking-out-loud, no waiting.",
  },
  {
    label: "Open by default",
    title: "Own your work",
    description:
      "Your charts, your dashboard, your data. We don't lock you in. Export it and take it elsewhere whenever you want.",
  },
  {
    label: "Ship fast",
    title: "No gatekeeping",
    description:
      "No SQL required, no engineering degree, no enterprise sales call. Data visualization should be for everyone.",
  },
];

export default function MissionSection() {
  return (
    <section className="ab-sec">
      <div className="ab-wrap">
        <div className="ab-eyebrow">
          <span className="r" />
          <span className="t">01 / what we&apos;re for</span>
        </div>

        <h2 className="ab-h2">
          Four things we refuse
          <br />
          to <span style={{ fontStyle: "italic" }}>compromise on.</span>
        </h2>

        <div className="ab-grid4" style={{ marginTop: 48 }}>
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="ab-cell">
              <span className="ab-mono">{p.label}</span>
              <h3 className="ab-h3" style={{ marginTop: 14 }}>
                {p.title}
              </h3>
              <p className="ab-body">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
