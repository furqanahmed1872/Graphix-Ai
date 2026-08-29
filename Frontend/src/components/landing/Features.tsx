"use client";

import Link from "next/link";
import { Arrow } from "./Nav";
import {
  ArtBars,
  ArtLine,
  ArtScatter,
  ArtGrid,
  ArtSurface,
  ArtFlow,
} from "./GraphField";

/**
 * Product rail — black field, oversized headline left, supporting copy and
 * a CTA right, then a horizontally scrolling row of blue plates. The plates
 * alternate vertical offset so the rail doesn't read as a flat row of boxes.
 */

const CARDS = [
  {
    chip: "Compare",
    t: "Bar & column",
    d: "Grouped, stacked and horizontal bars with value labels, sorted axes and number formats that survive a projector.",
    Art: ArtBars,
  },
  {
    chip: "Trend",
    t: "Line & area",
    d: "Multi-series lines, stacked areas and direct end-labelling, so a legend never eats a third of the figure.",
    Art: ArtLine,
  },
  {
    chip: "Relate",
    t: "Scatter & bubble",
    d: "Correlation plots with optional fitted trends, size and colour encodings, and quadrant annotation.",
    Art: ArtScatter,
  },
  {
    chip: "Density",
    t: "Heatmap & contour",
    d: "Matrix and contour plots with perceptually even colour ramps and configurable bin edges.",
    Art: ArtGrid,
  },
  {
    chip: "Dimension",
    t: "3D surface",
    d: "WebGL surfaces you can rotate in the browser. No plugin, no export step, no separate viewer.",
    Art: ArtSurface,
  },
  {
    chip: "Flow",
    t: "Sankey & funnel",
    d: "Stage-to-stage flows with weighted links, for the journey charts that every deck eventually needs.",
    Art: ArtFlow,
  },
];

export default function Features() {
  return (
    <section className="gxl-dark gxl-band" id="charts">
      <div className="gxl-page">
        <div className="gxl-split gxl-split--top">
          <h2 className="gxl-d2" style={{ maxWidth: "9ch" }}>
            Chart types
          </h2>

          <div>
            <p className="gxl-body">
              Around a hundred and forty encodings ship in the box, from the
              four you use every week to the ones you need twice a year. Each
              is a Plotly figure underneath, so the editor exposes every
              property the renderer does.
            </p>
            <Link href="/signup" className="gxl-btn" style={{ marginTop: 30 }}>
              <span className="gxl-btn__label">Browse the library</span>
              <span className="gxl-btn__box">
                <Arrow />
              </span>
            </Link>
          </div>
        </div>

        <div className="gxl-rail" style={{ marginTop: 84 }}>
          {CARDS.map(({ chip, t, d, Art }) => (
            <Link key={t} href="/signup" className="gxl-card">
              <div className="gxl-card__art">
                <span className="gxl-card__chip">{chip}</span>
                <span className="gxl-card__go">
                  <Arrow />
                </span>
                <Art />
              </div>
              <div className="gxl-card__body">
                <h3 className="gxl-card__t">{t}</h3>
                <p className="gxl-card__d">{d}</p>
              </div>
            </Link>
          ))}
        </div>

        <p className="gxl-mono" style={{ marginTop: 10 }}>
          Scroll the row →
        </p>
      </div>
    </section>
  );
}
