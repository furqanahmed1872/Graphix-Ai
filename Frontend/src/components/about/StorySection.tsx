/* The history is real and stays as written. Only the chart-type count was
   changed, from "149+" to the "140+" used everywhere else on the site, since
   the two numbers contradicted each other. */
const TIMELINE = [
  {
    year: "2021",
    quarter: "Q4",
    title: "The beginning",
    description:
      "Graphix started as a simple question: why is data visualization still so hard? A weekend project turned into an obsession.",
    detail:
      "Two founders, one laptop, and a mission. No funding. No office. Just a belief that there had to be a better way.",
  },
  {
    year: "2022",
    quarter: "Q2",
    title: "First prototype",
    description:
      "80 chart types. No AI yet. Just pure Plotly and a dream.",
    detail:
      "We showed it to 10 data scientists. Nine said 'this is nice.' The tenth said 'I'd actually use this.' That was enough.",
  },
  {
    year: "2023",
    quarter: "Q1",
    title: "AI integration",
    description:
      "We added natural language. Suddenly you could just describe what you wanted to see.",
    detail:
      "The first time someone typed 'show me sales by region' and got a perfect grouped bar chart, we knew we were onto something.",
  },
  {
    year: "2024",
    quarter: "Q3",
    title: "Dashboard launch",
    description:
      "Saved charts, personal workspace, activity feed. Graphix became a place to keep your work, not just generate it.",
    detail:
      "Charts had been disappearing the moment you closed the tab. The dashboard fixed that.",
  },
  {
    year: "2025",
    quarter: "Q1",
    title: "Excel editor",
    description:
      "Full spreadsheet with formulas, conditional formatting and live charts. The panel changed everything.",
    detail:
      "Not everyone wants to talk to an AI. Some people want to type =SUM and watch the chart update. So we built both.",
  },
  {
    year: "2026",
    quarter: "Now",
    title: "140+ chart types",
    description:
      "From 80 to 140+. 3D surfaces, parallel coordinates, candlesticks.",
    detail:
      "Live, and early. The catalogue is broad; the polish is still arriving week by week.",
  },
];

export default function StorySection() {
  return (
    <section className="ab-sec">
      <div className="ab-wrap">
        <div className="ab-eyebrow">
          <span className="r" />
          <span className="t">03 / how we got here</span>
        </div>

        <h2 className="ab-h2">
          Five years of
          <br />
          <span style={{ fontStyle: "italic" }}>narrowing it down.</span>
        </h2>

        <ol className="ab-tl" style={{ marginTop: 48 }}>
          {TIMELINE.map((t) => (
            <li key={t.year}>
              <div>
                <span className="ab-tl-year">{t.year}</span>
                <span className="ab-tl-q">{t.quarter}</span>
              </div>
              <div>
                <h3 className="ab-h3">{t.title}</h3>
                <p className="ab-body">{t.description}</p>
                <p className="ab-tl-detail">{t.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
