"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Content ───────────────────────────────────────────────────
   This used to be eight equal cards carrying 228 words and 46 tag
   chips, with no card leading. Same facts, grouped into the three
   things a person actually does, so the section reads as three
   ideas instead of eight competing ones. */
const STAGES = [
  {
    num: "01",
    name: "Get your data in",
    lead: "Upload it, paste it, or just describe the chart you want in plain English.",
    items: ["CSV, JSON or paste", "Plain-English prompts", "Type it by hand"],
  },
  {
    num: "02",
    name: "Make it worth looking at",
    lead: "140+ chart types, each with a full visual editor behind it.",
    items: ["16 chart categories", "Palettes, fonts, axes", "Real 3D via WebGL"],
  },
  {
    num: "03",
    name: "Get it back out",
    lead: "Export at whatever size you need, or leave it in your library.",
    items: ["PNG, SVG, JPEG", "Custom or preset sizes", "Auto-saved library"],
  },
];

/* ─── Helpers ───────────────────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

/* ─── Section ───────────────────────────────────────────────── */
export default function FeaturesSection() {
  const { ref: hRef, vis: hVis } = useInView(0.2);
  const { ref: stagesRef, vis: stagesVis } = useInView(0.1);
  const { ref: excelRef, vis: excelVis } = useInView(0.15);

  return (
    <>
      <style>{`
        .fx-wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

        /* Three columns reads as "three things" at a glance. The section
           above is a vertical rail, so going horizontal here keeps the two
           from feeling like the same section twice. */
        .fx-stages {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0;
          border-top: 1px solid var(--gx-line);
        }
        .fx-stage {
          padding: 40px 32px 44px;
          border-left: 1px solid var(--gx-line);
        }
        .fx-stage:first-child { border-left: none; padding-left: 0; }
        .fx-stage:last-child { padding-right: 0; }

        .fx-num {
          font-family: var(--gx-mono);
          font-size: 13px;
          color: var(--gx-fg-faint);
          display: block;
          margin-bottom: 18px;
        }
        .fx-name {
          font-family: var(--gx-display);
          font-weight: 400;
          font-size: 27px;
          line-height: 1.15;
          letter-spacing: -0.015em;
          color: var(--gx-fg);
          margin: 0 0 12px;
        }
        .fx-lead {
          font-size: 15px;
          line-height: 1.6;
          color: var(--gx-fg-muted);
          margin: 0 0 24px;
        }
        .fx-items { list-style: none; margin: 0; padding: 0; }
        .fx-items li {
          font-family: var(--gx-mono);
          font-size: 13px;
          color: var(--gx-fg-faint);
          padding: 9px 0;
          border-top: 1px solid var(--gx-line);
        }

        @media (max-width: 860px) {
          .fx-stages { grid-template-columns: 1fr; }
          .fx-stage {
            border-left: none;
            border-top: 1px solid var(--gx-line);
            padding: 32px 0 34px;
          }
          .fx-stage:first-child { border-top: none; padding-top: 32px; }
        }
      `}</style>

      <section
        id="features"
        className="relative overflow-hidden"
        style={{
          background: "var(--gx-bg)",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      >
        <div className="fx-wrap py-20 md:py-28 relative">
          {/* ── Header ── */}
          <div
            ref={hRef}
            className={`mb-16 transition-all duration-700 ${
              hVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-white/20" />
              <span
                className="text-[12px] text-white/40"
                style={{ fontFamily: "var(--gx-mono)" }}
              >
                02 / features
              </span>
            </div>

            <h2
              className="text-4xl sm:text-5xl md:text-6xl leading-[1.08] mb-5 text-white"
              style={{
                fontFamily: "var(--gx-display)",
                fontWeight: 400,
                letterSpacing: "-0.015em",
              }}
            >
              Built for the full workflow,
              <br />
              <span style={{ fontStyle: "italic" }}>
                not just the first step.
              </span>
            </h2>

            <p className="text-base text-white/45 max-w-md leading-relaxed">
              Raw spreadsheet to a chart you can hand to someone else, without
              leaving the page.
            </p>
          </div>

          {/* ── Three stages ── */}
          <div
            ref={stagesRef}
            className={`fx-stages transition-all duration-700 ${
              stagesVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {STAGES.map((s) => (
              <div key={s.num} className="fx-stage">
                <span className="fx-num">{s.num}</span>
                <h3 className="fx-name">{s.name}</h3>
                <p className="fx-lead">{s.lead}</p>
                <ul className="fx-items">
                  {s.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── Excel editor: a separate product surface, so it keeps its
                own block and its own way in ── */}
          <div
            ref={excelRef}
            className={`relative mt-20 pt-12 border-t border-white/[0.09] transition-all duration-700 ${
              excelVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
              <div className="flex-1">
                <span
                  className="text-[12px] text-white/30 block mb-4"
                  style={{ fontFamily: "var(--gx-mono)" }}
                >
                  also included
                </span>

                <h3
                  className="text-3xl md:text-4xl leading-tight text-white mb-4"
                  style={{
                    fontFamily: "var(--gx-display)",
                    fontWeight: 400,
                    letterSpacing: "-0.015em",
                  }}
                >
                  Spreadsheet and chart,{" "}
                  <span style={{ fontStyle: "italic" }}>one split view.</span>
                </h3>

                <p className="text-base text-white/45 leading-relaxed max-w-lg">
                  A full spreadsheet editor with formulas, conditional
                  formatting, sorting and filtering. Edit on the left, the chart
                  redraws on the right.
                </p>
              </div>

              <Link
                href="/panel"
                className="group/btn inline-flex items-center gap-2 px-6 py-3 text-sm transition-opacity duration-200 hover:opacity-85 flex-shrink-0"
                style={{
                  background: "var(--gx-accent)",
                  color: "var(--gx-accent-ink)",
                  fontWeight: 500,
                }}
              >
                <span className="whitespace-nowrap">Open Excel editor</span>
                <svg
                  className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
