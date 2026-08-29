"use client";

import Link from "next/link";

const COLUMNS = [
  {
    head: "Product",
    items: [
      { label: "Chart generator", href: "/signin" },
      { label: "Data editor", href: "/panel" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "How it works", href: "/howitworks" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    head: "Chart types",
    items: [
      { label: "Bar & column", href: "/signin" },
      { label: "Line & area", href: "/signin" },
      { label: "Scatter & bubble", href: "/signin" },
      { label: "Heatmap & contour", href: "/signin" },
      { label: "3D surface", href: "/signin" },
    ],
  },
  {
    head: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Feedback", href: "/feedback" },
      { label: "Privacy policy", href: "/policy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="gxl-dark">
      <div className="gxl-page">
        <div className="gxl-foot">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="1" y="13" width="5" height="10" fill="currentColor" />
                <rect x="9.5" y="7" width="5" height="16" fill="currentColor" />
                <rect x="18" y="1" width="5" height="22" fill="currentColor" />
              </svg>
              <span className="gxl-brand__name">Graphix</span>
            </div>
            <p className="gxl-body gxl-body--tight" style={{ maxWidth: "34ch" }}>
              Describe a chart, get a Plotly figure you can actually edit.
              In beta, and improved mostly by complaints.
            </p>
          </div>

          {COLUMNS.map((c) => (
            <div key={c.head}>
              <div className="gxl-foot__h">{c.head}</div>
              {c.items.map((i) => (
                <Link key={i.label} href={i.href} className="gxl-foot__l">
                  {i.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="gxl-foot__bar">
          <span className="gxl-mono">© 2026 Graphix</span>
          <span className="gxl-mono">Rendered with Plotly · Beta</span>
        </div>
      </div>
    </footer>
  );
}
