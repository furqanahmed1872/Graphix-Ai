"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ─── Feature definitions ───────────────────────────────────────
const FEATURES = [
  {
    tag: "Core AI",
    accent: "#06b6d4",
    gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" />
      </svg>
    ),
    headline: "Natural Language → Perfect Chart",
    body: "Type what you want in plain English. No formulas, no code, no complexity. The AI understands your intent, auto-selects from 80+ chart types, and delivers publication-ready visualizations in under 3 seconds.",
    pills: [
      "Natural language",
      "3s generation",
      "Auto chart-type",
      "Zero setup",
    ],
    stat: { num: "< 3s", label: "avg. generation" },
  },
  {
    tag: "140+ Charts",
    accent: "#a855f7",
    gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="12" width="4" height="9" rx="1" />
        <rect x="10" y="7" width="4" height="14" rx="1" />
        <rect x="17" y="3" width="4" height="18" rx="1" />
      </svg>
    ),
    headline: "Every Chart Type That Matters",
    body: "From basic bars to 3D surfaces, violin plots to candlesticks, waterfall to ternary diagrams. Statistical, financial, scientific, geospatial — 80+ chart types across 10 categories, all fully interactive with WebGL rendering.",
    pills: [
      "Line · Scatter · Bar",
      "3D Surface · Mesh",
      "Heatmap · Contour",
      "Violin · Funnel",
      "Candlestick · Waterfall",
      "Ternary · Parallel",
    ],
    stat: { num: "140+", label: "chart types" },
    featured: true,
  },
  {
    tag: "Visual Editor",
    accent: "#10b981",
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    headline: "Full Design Studio Per Chart",
    body: "Pixel-perfect control over every visual detail. 12 color palettes, 15 fonts, 8 background presets, custom dimensions, and granular controls for line width, opacity, spacing, rotation, and more. No design skills required.",
    pills: [
      "12 palettes",
      "15 fonts",
      "8 backgrounds",
      "Custom colors",
      "Line/marker controls",
      "Grid & axes",
      "Annotations",
      "Export presets",
    ],
    stat: { num: "∞", label: "possibilities" },
  },
  {
    tag: "Data Input",
    accent: "#f59e0b",
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
    headline: "Every Data Format Welcome",
    body: "Upload CSV, paste JSON, drag tabular data, or type it manually. Auto-detects headers, handles messy formatting, and instantly makes your data chart-ready. No preprocessing needed.",
    pills: ["CSV upload", "JSON paste", "Raw table data", "Manual entry"],
    stat: { num: "4", label: "input methods" },
  },
  {
    tag: "Dashboard",
    accent: "#ec4899",
    gradient: "from-pink-500/20 via-pink-500/5 to-transparent",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    headline: "Your Personal Chart Library",
    body: "Every chart auto-saves with a live Plotly preview. Star favorites, re-open in the editor anytime, update existing charts in place. Your work is never lost, always accessible, infinitely revisable.",
    pills: [
      "Live previews",
      "Star favorites",
      "Re-open & edit",
      "In-place updates",
      "Activity feed",
      "Type badges",
    ],
    stat: { num: "∞", label: "saved charts" },
  },
  {
    tag: "3D WebGL",
    accent: "#6366f1",
    gradient: "from-indigo-500/20 via-indigo-500/5 to-transparent",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    headline: "True 3D Charts in the Browser",
    body: "Scatter, surface, mesh, ribbon, spiral — full WebGL-powered 3D charts you can rotate, zoom, and orbit. All in-browser, no plugins, no downloads. Interactive 3D at 60fps.",
    pills: [
      "3D Scatter",
      "Surface plot",
      "Mesh",
      "Ribbon",
      "Line spiral",
      "WebGL 60fps",
    ],
    stat: { num: "60", label: "fps rendering" },
  },
  {
    tag: "Export",
    accent: "#f97316",
    gradient: "from-orange-500/20 via-orange-500/5 to-transparent",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    headline: "Export at Any Resolution",
    body: "PNG, SVG, JPEG — download at custom dimensions or pick from 8 presets (Square, Twitter card, Instagram, 4K UHD, presentation slides). Perfect for reports, social, or print.",
    pills: [
      "PNG · SVG · JPEG",
      "Custom size",
      "4K UHD",
      "8 presets",
      "Twitter/IG ready",
    ],
    stat: { num: "3", label: "export formats" },
    featured: true,
  },
  {
    tag: "Excel Editor",
    accent: "#14b8a6",
    gradient: "from-teal-500/20 via-teal-500/5 to-transparent ",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    headline: "Spreadsheet + Chart Split View",
    body: "Full Excel-style editor with formulas (=SUM, =AVG), conditional formatting, sorting, filtering, and instant chart generation. Edit data on the left, see your chart update live on the right.",
    pills: [
      "Formula bar",
      "Conditional format",
      "Sort & filter",
      "CSV import/export",
      "Live sync",
      "Undo/redo",
      "Quick stats",
    ],
    stat: { num: "2", label: "panes, 1 tool" },
    long: true,
  },
];

// ─── Helpers ───────────────────────────────────────────────────
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

function FeatureCard({ f, index }: { f: (typeof FEATURES)[0]; index: number }) {
  const { ref, vis } = useInView(0.08);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative
        
        overflow-hidden rounded-xl bg-[#0a0a0b] border border-white/[0.06]
        transition-all duration-500 ease-out
        ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        ${f.featured ? "md:col-span-2" : ""}
        ${f.long ? "md:col-span-3" : ""}
        ${isHovered ? "border-white/[0.12] scale-[1.01]" : ""}
        group
      `}
      style={{
        transitionDelay: `${index * 60}ms`,
      }}
    >
      {/* Animated gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
      />

      {/* Glow orb */}
      <div
        className="absolute -top-12 -left-12 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-10 transition-opacity duration-500"
        style={{ backgroundColor: f.accent }}
      />

      {/* Card content */}
      <div className="relative p-6 flex flex-col gap-4 h-full ">
        {/* Top row: icon + tag */}
        <div className="flex items-start justify-between">
          <div
            className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] transition-colors duration-300 group-hover:bg-white/[0.05]"
            style={{
              color: f.accent,
            }}
          >
            {f.icon}
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase"
            style={{
              backgroundColor: `${f.accent}15`,
              border: `1px solid ${f.accent}40`,
              color: f.accent,
            }}
          >
            {f.tag}
          </span>
        </div>

        {/* Headline + body */}
        <div className="flex-1 space-y-2">
          <h3 className="text-base font-bold text-white leading-snug tracking-tight">
            {f.headline}
          </h3>
          <p className="text-[13px] text-white/40 leading-relaxed font-light">
            {f.body}
          </p>
        </div>

        {/* Stat (if exists) */}
        {f.stat && (
          <div className="flex items-baseline gap-2 pt-2 border-t border-white/[0.04]">
            <span
              className="text-2xl font-black tracking-tighter"
              style={{ color: f.accent }}
            >
              {f.stat.num}
            </span>
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
              {f.stat.label}
            </span>
          </div>
        )}

        {/* Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {f.pills.map((p) => (
            <span
              key={p}
              className="px-2 py-0.5 rounded text-[9px] font-mono font-medium text-white/35 bg-white/[0.03] border border-white/[0.06] transition-colors duration-200 group-hover:bg-white/[0.05] group-hover:text-white/45"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Hover corner accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${f.accent}, transparent 70%)`,
        }}
      />
    </div>
  );
}

export default function FeaturesSection() {
  const { ref: hRef, vis: hVis } = useInView(0.2);
  const { ref: statsRef, vis: statsVis } = useInView(0.15);
  const { ref: excelRef, vis: excelVis } = useInView(0.15);

  return (
    <>
      {/* Animated background keyframes */}
      <style>{`
        @keyframes bg-scrolling {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <section
        id="features"
        className="relative overflow-hidden bg-neutral-200"
        style={{
          backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC")`,
          backgroundRepeat: "repeat",
          animation: "bg-scrolling 0.92s linear infinite",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 lg:py-24 relative">
          {/* Header */}
          <div
            ref={hRef}
            className={`text-center mb-12 transition-all duration-700 ${
              hVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 backdrop-blur-sm mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-cyan-600">
                Everything Included
              </span>
            </div>

            {/* Main headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] mb-3 px-4">
              <span className="text-[#111212]">
                Built for the full workflow.
              </span>
              <br />
              <span
                className="inline-block bg-gradient-to-r from-cyan-400 via-cyan-500 to-teal-500 bg-clip-text text-transparent"
                style={{
                  backgroundSize: "200% auto",
                  animation: "shimmer 3s linear infinite",
                }}
              >
                Not just the first step.
              </span>
            </h2>

            {/* Subheadline */}
            <p className="text-sm md:text-base text-white/50 max-w-2xl mx-auto leading-relaxed font-light px-4">
              From raw data to polished, shareable chart — every tool is already
              here.
              <br className="hidden md:block" />
              Free during beta. No credit card. No limits.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.tag} f={f} index={i} />
            ))}
          </div>

          {/* Stats bar */}
          <div
            ref={statsRef}
            className={`grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden border border-white/[0.06] mb-12 transition-all duration-700 ${
              statsVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {[
              ["140+", "Chart types", "#a855f7"],
              ["12", "Color palettes", "#10b981"],
              ["15", "Font options", "#f59e0b"],
              ["4", "Export formats", "#f97316"],
            ].map(([num, label, color], i) => (
              <div
                key={label}
                className="relative bg-[#0a0a0b] p-8 text-center group hover:bg-[#0f0f10] transition-colors duration-300"
              >
                {/* Hover gradient */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at center, ${color}, transparent 70%)`,
                  }}
                />
                <div className="relative">
                  <div
                    className="text-3xl md:text-4xl font-black tracking-tighter leading-none mb-2 transition-transform duration-300 group-hover:scale-110"
                    style={{ color }}
                  >
                    {num}
                  </div>
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Excel/Panel callout */}
          <div
            ref={excelRef}
            className={`relative overflow-hidden rounded-2xl border border-emerald-400/30 transition-all duration-700 ${
              excelVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              background:
                "linear-gradient(135deg, rgba(16,185,129,0.7) 0%, rgba(6,182,212,0.06) 100%)",
            }}
          >
            {/* Animated gradient overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background:
                  "linear-gradient(110deg, transparent 40%, rgba(16,185,129,0.15) 50%, transparent 60%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 3s linear infinite",
              }}
            />

            <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              {/* Left content */}
              <div className="flex-1 space-y-3 md:space-y-4">
                {/* Icon + badge */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/70 border border-emerald-400 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-emerald-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-[0.12em] uppercase text-white">
                    Also Included — Excel Editor
                  </span>
                </div>

                {/* Headline */}
                <h3 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                  <span className="text-white">Spreadsheet + Chart</span>
                  <br />
                  <span className="text-emerald-700">in one split view</span>
                </h3>

                {/* Description */}
                <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-xl font-light">
                  A full spreadsheet editor with formula support (=SUM, =AVG),
                  conditional formatting, column sorting, filtering, and instant
                  chart generation — all in a split-pane interface. Edit data on
                  the left, watch your chart update live on the right.
                </p>

                {/* Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    "Formula bar",
                    "Conditional formatting",
                    "CSV import/export",
                    "Live chart sync",
                    "Undo/redo",
                    "Quick stats",
                  ].map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-1 rounded-md text-[9px] font-mono font-bold text-emerald-700 bg-white/95 border border-emerald-500/20 shadow-sm"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA button */}
              <Link
                href="/panel"
                className="group/btn relative flex items-center gap-2.5 px-6 md:px-8 py-3 md:py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs md:text-sm tracking-wide uppercase rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 overflow-hidden flex-shrink-0"
              >
                {/* Button shimmer effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover/btn:opacity-30 transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s linear infinite",
                  }}
                />
                <span className="relative whitespace-nowrap">
                  Open Excel Editor
                </span>
                <svg
                  className="relative w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
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
