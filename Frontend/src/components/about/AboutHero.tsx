export default function AboutHero() {
  return (
    <section className="ab-sec">
      <div className="ab-wrap-lg">
        <div className="ab-eyebrow">
          <span className="r" />
          <span className="t">about</span>
        </div>

        <h1 className="ab-h1">
          We built the visualization
          <br />
          layer for <span style={{ fontStyle: "italic" }}>data.</span>
        </h1>

        <p className="ab-lede">
          Charting tools make you choose between something quick and something
          good. Graphix is an attempt to stop making that a choice, for anyone
          holding a spreadsheet and a question.
        </p>

        <p className="ab-mono" style={{ marginTop: 56 }}>
          A project by The Continental
        </p>
      </div>
    </section>
  );
}
