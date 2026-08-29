const ROLES = [
  {
    role: "Vision",
    description: "The one who says 'but why?' until it actually makes sense.",
  },
  {
    role: "Code",
    description: "Turns chaos into structure. Sleeps only after it compiles.",
  },
  {
    role: "Design",
    description: "Makes complex feel obvious. Hates bad kerning.",
  },
  {
    role: "Data",
    description:
      "Sees stories where others see numbers. Never trusts a single source.",
  },
];

const NOS = ["No investors", "No meetings", "No egos", "No locked doors"];

export default function TeamSection() {
  return (
    <section className="ab-sec">
      <div className="ab-wrap">
        <div className="ab-eyebrow">
          <span className="r" />
          <span className="t">04 / who</span>
        </div>

        <h2 className="ab-h2">
          A small team called
          <br />
          <span style={{ fontStyle: "italic" }}>The Continental.</span>
        </h2>
        <p className="ab-lede">
          Four seats, no layers in between. The person who reads your bug report
          is the person who fixes it.
        </p>

        <div className="ab-grid4" style={{ marginTop: 48 }}>
          {ROLES.map((r) => (
            <div key={r.role} className="ab-cell">
              <h3 className="ab-h3">{r.role}</h3>
              <p className="ab-body">{r.description}</p>
            </div>
          ))}
        </div>

        <ul
          style={{
            listStyle: "none",
            margin: "40px 0 0",
            padding: 0,
            display: "flex",
            flexWrap: "wrap",
            gap: "0 28px",
          }}
        >
          {NOS.map((n, i) => (
            <li key={n} className="ab-mono">
              {i > 0 && <span style={{ opacity: 0.4, marginRight: 28 }}>/</span>}
              {n}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
