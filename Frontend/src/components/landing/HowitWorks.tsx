"use client";

import { TraceField } from "./GraphField";

/**
 * Foundation band — blue, headline pinned top-left, supporting copy
 * dropped to the lower right, hairline traces running behind both.
 */

const STEPS = [
  {
    n: "01",
    t: "Describe it",
    d: "One sentence. “Monthly churn by plan for the last year, flag anything over 4%.” No chart-type picker, no wizard, no menu tree.",
  },
  {
    n: "02",
    t: "Bring numbers, or don't",
    d: "Attach a CSV, XLSX or JSON file to the prompt, or let the model draft plausible figures while you get the shape of the chart right.",
  },
  {
    n: "03",
    t: "It picks the encoding",
    d: "Grouped bars to compare, lines for change over time, scatter for correlation — axes, ticks, legends and number formats already set.",
  },
  {
    n: "04",
    t: "You overrule it",
    d: "Colours, ranges, gridlines, fonts, annotations, marker styles. Change any of it, then save the chart to your dashboard.",
  },
];

export default function HowItWorks() {
  return (
    <section className="gxl-blue gxl-band" id="product">
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.5,
          pointerEvents: "none",
        }}
      >
        <TraceField />
      </div>

      <div className="gxl-page" style={{ position: "relative", zIndex: 1 }}>
        <span className="gxl-tag">Foundation</span>

        <h2 className="gxl-d2" style={{ marginTop: 26, maxWidth: "14ch" }}>
          Built for the chart you have to defend
        </h2>

        <div className="gxl-split" style={{ marginTop: 120 }}>
          <div />
          <div>
            <h3 className="gxl-d3" style={{ maxWidth: "20ch" }}>
              From a prompt to an editable figure, in one pass
            </h3>
            <p className="gxl-body" style={{ marginTop: 20, color: "rgba(255,255,255,0.8)" }}>
              Graphix renders with Plotly, so what you get back is a real
              figure — pannable, zoomable, exportable to vector — not a picture
              of one. Every property the renderer exposes is exposed to you
              too, which is the difference between a chart you can ship and a
              chart you have to redraw somewhere else.
            </p>
          </div>
        </div>

        <div className="gxl-rows" style={{ marginTop: 96 }}>
          {STEPS.map((s) => (
            <div key={s.n} className="gxl-row">
              <div className="gxl-row__n">{s.n}</div>
              <div className="gxl-row__t">{s.t}</div>
              <p
                className="gxl-body gxl-body--tight"
                style={{ color: "rgba(255,255,255,0.8)", maxWidth: "58ch" }}
              >
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
