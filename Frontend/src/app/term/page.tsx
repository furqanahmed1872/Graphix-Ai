"use client";

import { useEffect, useRef, useState } from "react";

// ─── Terms content ────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "acceptance",
    code: "§ 01",
    label: "Acceptance of Terms",
    tag: "BINDING",
    color: "#4e79a7",
    content: [
      {
        heading: "Agreement",
        body: "By accessing or using Graphix, you confirm that you have read, understood, and agree to be bound by these Terms of Service and all applicable laws. If you do not agree, you must immediately discontinue use of the platform.",
      },
      {
        heading: "Eligibility",
        body: "You must be at least 16 years of age to use Graphix. By using the platform, you represent and warrant that you meet this requirement. Use by minors requires verifiable parental or guardian consent.",
      },
      {
        heading: "Modifications",
        body: "Graphix reserves the right to modify these terms at any time. We will provide notice of material changes via email or an in-app notification. Continued use after modifications constitutes acceptance of updated terms.",
      },
    ],
  },
  {
    id: "license",
    code: "§ 02",
    label: "License & Usage",
    tag: "PERMITTED",
    color: "#59a14f",
    content: [
      {
        heading: "Grant of License",
        body: "Graphix grants you a limited, non-exclusive, non-transferable, revocable license to access and use the platform solely for your personal or internal business purposes in accordance with these terms.",
      },
      {
        heading: "Restrictions",
        body: "You may not sublicense, sell, resell, transfer, assign, or otherwise commercially exploit the platform. You may not reverse engineer, decompile, or attempt to extract source code from any part of the service.",
      },
      {
        heading: "API Access",
        body: "Access to Graphix APIs is subject to rate limits and additional developer terms. Automated access must identify itself truthfully via appropriate user-agent strings. Scraping or harvesting data without written permission is prohibited.",
      },
    ],
  },
  {
    id: "data",
    code: "§ 03",
    label: "Data & Privacy",
    tag: "IMPORTANT",
    color: "#f28e2b",
    content: [
      {
        heading: "Your Data",
        body: "You retain full ownership of all data you upload, input, or create using Graphix. We do not claim intellectual property rights over your content. You grant us a limited license to process your data solely to provide the service.",
      },
      {
        heading: "Data Processing",
        body: "Uploaded CSV files and data inputs are processed transiently to generate visualizations. We do not permanently store raw data inputs beyond the session unless you explicitly save a workspace. Saved workspaces are encrypted at rest.",
      },
      {
        heading: "Analytics",
        body: "We collect anonymized usage analytics — chart types created, session duration, feature interactions — to improve the product. This data is never sold to third parties. You may opt out via account settings at any time.",
      },
    ],
  },
  {
    id: "ip",
    code: "§ 04",
    label: "Intellectual Property",
    tag: "PROTECTED",
    color: "#e15759",
    content: [
      {
        heading: "Platform Ownership",
        body: "All rights, title, and interest in and to the Graphix platform — including its algorithms, AI models, chart rendering engine, user interface, and brand — are and shall remain the exclusive property of Graphix and its licensors.",
      },
      {
        heading: "Output Ownership",
        body: "Charts and visualizations you generate using your own data are yours. You may export, publish, and commercialize your outputs freely. However, template charts, sample datasets, and built-in demos remain Graphix property.",
      },
      {
        heading: "Feedback",
        body: "Any feedback, suggestions, or ideas you voluntarily provide may be used by Graphix to improve the service without obligation, compensation, or attribution. We appreciate every data point.",
      },
    ],
  },
  {
    id: "liability",
    code: "§ 05",
    label: "Liability & Warranty",
    tag: "DISCLAIMER",
    color: "#76b7b2",
    content: [
      {
        heading: "No Warranty",
        body: 'The platform is provided "as is" and "as available" without warranties of any kind, whether express or implied. We do not warrant that the service will be uninterrupted, error-free, or that defects will be corrected.',
      },
      {
        heading: "Limitation of Liability",
        body: "To the maximum extent permitted by applicable law, Graphix shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the platform.",
      },
      {
        heading: "Indemnification",
        body: "You agree to indemnify and hold harmless Graphix, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your violation of these terms or misuse of the platform.",
      },
    ],
  },
  {
    id: "termination",
    code: "§ 06",
    label: "Termination",
    tag: "ENFORCEMENT",
    color: "#edc948",
    content: [
      {
        heading: "By You",
        body: "You may terminate your account at any time by contacting support or using the account deletion flow in settings. Upon termination, your data will be deleted within 30 days in accordance with our data retention policy.",
      },
      {
        heading: "By Graphix",
        body: "We reserve the right to suspend or terminate your access immediately, without prior notice, for conduct that we believe violates these terms, is harmful to other users, or is otherwise objectionable.",
      },
      {
        heading: "Effect of Termination",
        body: "Upon termination, all licenses granted to you will cease. Provisions which by their nature should survive termination — including intellectual property, indemnification, and limitation of liability — shall remain in effect.",
      },
    ],
  },
];

const LAST_UPDATED = "March 8, 2025";
const EFFECTIVE = "March 15, 2025";

// ─── Mini sparkline (decorative, SVG) ────────────────────────────────────────
function Sparkline({ color }: { color: string }) {
  const pts = [12, 18, 10, 22, 15, 8, 20, 14, 24, 11, 19, 16, 25];
  const maxV = Math.max(...pts),
    minV = Math.min(...pts);
  const W = 80,
    H = 24;
  const px = (i: number) => (i / (pts.length - 1)) * W;
  const py = (v: number) => H - ((v - minV) / (maxV - minV)) * H;
  const d = pts
    .map(
      (v, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(v).toFixed(1)}`,
    )
    .join(" ");
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      style={{ display: "block" }}
    >
      <path
        d={d}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <circle
        cx={px(pts.length - 1)}
        cy={py(pts[pts.length - 1])}
        r="2.5"
        fill={color}
        opacity="0.9"
      />
    </svg>
  );
}

// ─── Section panel ────────────────────────────────────────────────────────────
function SectionPanel({
  section,
  index,
}: {
  section: (typeof SECTIONS)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVis(true);
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      id={section.id}
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.6s ease ${index * 0.07}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${index * 0.07}s`,
        marginBottom: 2,
      }}
    >
      {/* Panel card — mimics the hero's app preview card */}
      <div
        style={{
          background: "#161616",
          border: "1px solid rgba(255,255,255,0.1)",
          borderLeft: `3px solid ${section.color}`,
          overflow: "hidden",
        }}
      >
        {/* Chart-style header bar */}
        <div
          style={{
            background: "#1a1a1a",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Traffic lights */}
            <div style={{ display: "flex", gap: 5 }}>
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "#ff5f57",
                }}
              />
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "#febc2e",
                }}
              />
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "#28c840",
                }}
              />
            </div>
            {/* Section code */}
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: section.color,
                letterSpacing: "0.15em",
                fontWeight: 700,
              }}
            >
              {section.code}
            </span>
            {/* Pulsing dot */}
            <span
              style={{
                position: "relative",
                display: "inline-flex",
                width: 6,
                height: 6,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: section.color,
                  opacity: 0.4,
                  animation: "termPing 2s ease infinite",
                }}
              />
              <span
                style={{
                  position: "relative",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: section.color,
                  display: "block",
                }}
              />
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.08em",
              }}
            >
              {section.label.toUpperCase()}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkline color={section.color} />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 9,
                letterSpacing: "0.2em",
                padding: "2px 7px",
                borderRadius: 2,
                background: `${section.color}18`,
                border: `1px solid ${section.color}40`,
                color: section.color,
                textTransform: "uppercase",
              }}
            >
              {section.tag}
            </span>
          </div>
        </div>

        {/* Content — subsections as data rows */}
        <div style={{ padding: "0" }}>
          {section.content.map((item, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                borderBottom:
                  i < section.content.length - 1
                    ? "1px solid rgba(255,255,255,0.05)"
                    : "none",
              }}
            >
              {/* Left: axis label column */}
              <div
                style={{
                  padding: "20px 20px",
                  borderRight: "1px solid rgba(255,255,255,0.05)",
                  background: "#131313",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  justifyContent: "flex-start",
                }}
              >
                {/* Tick mark */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 12,
                      height: 1,
                      background: section.color,
                      opacity: 0.6,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      color: "rgba(255,255,255,0.25)",
                      letterSpacing: "0.15em",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.7)",
                    letterSpacing: "0.05em",
                    lineHeight: 1.4,
                  }}
                >
                  {item.heading}
                </span>
                {/* Mini bar chart decoration */}
                <div
                  style={{
                    display: "flex",
                    gap: 2,
                    alignItems: "flex-end",
                    height: 16,
                    marginTop: 4,
                  }}
                >
                  {[0.4, 0.7, 0.55, 1, 0.8, 0.65, 0.9].map((h, bi) => (
                    <div
                      key={bi}
                      style={{
                        width: 4,
                        height: `${h * 100}%`,
                        background: section.color,
                        opacity: bi === 3 ? 0.9 : 0.25,
                        borderRadius: 1,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Right: body text */}
              <div
                style={{
                  padding: "22px 28px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    lineHeight: 1.8,
                    color: "rgba(255,255,255,0.55)",
                    margin: 0,
                    maxWidth: 620,
                  }}
                >
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TermsPage() {
  const [activeId, setActiveId] = useState("acceptance");
  const [scrollPct, setScrollPct] = useState(0);
  const [headerVis, setHeaderVis] = useState(false);

  useEffect(() => {
    setHeaderVis(true);

    const onScroll = () => {
      // Reading progress
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(pct);

      // Active section
      let current = SECTIONS[0].id;
      SECTIONS.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45)
          current = s.id;
      });
      setActiveId(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body, html {
          background: #111;
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
          scroll-behavior: smooth;
        }

        @keyframes termPing {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(2.2); opacity: 0; }
        }

        @keyframes headerIn {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Reading progress bar */
        .progress-bar {
          position: fixed; top: 0; left: 0;
          height: 2px; background: #0891b2;
          z-index: 1000;
          transition: width 0.1s linear;
          box-shadow: 0 0 8px rgba(8,145,178,0.6);
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #0891b2; border-radius: 2px; }

        .nav-link:hover { color: #06b6d4 !important; }
        .nav-link.active { color: #fff !important; }
      `}</style>

      {/* Reading progress */}
      <div className="progress-bar" style={{ width: `${scrollPct}%` }} />

      {/* Grid bg */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
          backgroundSize: "40px 40px",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* ── NAV — same as hero ── */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 56,
            borderBottom: "1px solid rgba(255,255,255,0.12)",
            borderLeft: "1px solid rgba(255,255,255,0.12)",
            borderRight: "1px solid rgba(255,255,255,0.12)",
            padding: "0 24px",
            animation: "headerIn .5s ease both",
            background: "rgba(17,17,17,0.95)",
            backdropFilter: "blur(8px)",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              border: "2px solid #0891b2",
              padding: "2px 10px",
              fontSize: 14,
              fontWeight: 700,
              color: "#0891b2",
              letterSpacing: "-0.02em",
            }}
          >
            Graphix
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.2em",
            }}
          >
            TERMS OF SERVICE
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#0891b2",
                display: "inline-block",
                boxShadow: "0 0 6px #0891b2",
              }}
            />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.12em",
              }}
            >
              EFFECTIVE {EFFECTIVE.toUpperCase()}
            </span>
          </div>
        </nav>

        {/* ── HERO HEADER ── */}
        <div
          style={{
            padding: "72px 0 56px",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            paddingLeft: 24,
            paddingRight: 24,
            animation: "headerIn .7s ease .1s both",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 24,
            }}
          >
            <div style={{ flex: 1, minWidth: 300 }}>
              {/* Accent bar */}
              <div
                style={{
                  height: 1,
                  width: 220,
                  background: "linear-gradient(90deg, #0891b2, #06b6d4)",
                  marginBottom: 28,
                }}
              />

              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: "#0891b2",
                  letterSpacing: "0.3em",
                  marginBottom: 16,
                  textTransform: "uppercase",
                }}
              >
                Legal Document · v2.1.0
              </div>
              <h1
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 5rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.0,
                  color: "#fff",
                  marginBottom: 24,
                }}
              >
                Terms of
                <br />
                <span style={{ color: "#0891b2" }}>Service</span>
              </h1>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  color: "#666",
                  lineHeight: 1.7,
                  maxWidth: 480,
                }}
              >
                These terms govern your use of the Graphix platform. Please read
                them carefully. By continuing, you accept this agreement in
                full.
              </p>

              {/* Meta row */}
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  marginTop: 28,
                  flexWrap: "wrap",
                }}
              >
                {[
                  { label: "LAST UPDATED", val: LAST_UPDATED },
                  { label: "SECTIONS", val: `${SECTIONS.length} §` },
                  { label: "VERSION", val: "2.1.0" },
                ].map((m) => (
                  <div
                    key={m.label}
                    style={{
                      borderLeft: "2px solid rgba(8,145,178,0.4)",
                      paddingLeft: 12,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: 9,
                        color: "#0891b2",
                        letterSpacing: "0.2em",
                        marginBottom: 3,
                      }}
                    >
                      {m.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: 700,
                      }}
                    >
                      {m.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: mini "chart" showing sections at a glance */}
            <div
              style={{
                width: 280,
                background: "#161616",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: 16,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  color: "rgba(255,255,255,0.25)",
                  letterSpacing: "0.2em",
                  marginBottom: 14,
                }}
              >
                SECTION INDEX
              </div>
              {SECTIONS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "7px 0",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    borderBottom:
                      i < SECTIONS.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      color: s.color,
                      letterSpacing: "0.1em",
                      width: 32,
                      textAlign: "left",
                    }}
                  >
                    {s.code}
                  </span>
                  {/* Mini bar */}
                  <div
                    style={{
                      flex: 1,
                      height: 3,
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${((i + 1) / SECTIONS.length) * 100}%`,
                        background: s.color,
                        borderRadius: 2,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      color: "rgba(255,255,255,0.35)",
                      letterSpacing: "0.05em",
                      textAlign: "right",
                      flex: "0 0 auto",
                      maxWidth: 120,
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT + SIDEBAR ── */}
        <div style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>
          {/* Sticky sidebar — chart legend style */}
          <div
            style={{
              width: 220,
              flexShrink: 0,
              position: "sticky",
              top: 72,
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              borderRight: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 32,
              paddingBottom: 32,
              alignSelf: "flex-start",
            }}
          >
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 9,
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.2em",
                padding: "0 16px",
                marginBottom: 12,
              }}
            >
              NAVIGATION
            </div>

            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`nav-link${activeId === s.id ? " active" : ""}`}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 16px",
                  background:
                    activeId === s.id
                      ? "rgba(255,255,255,0.04)"
                      : "transparent",
                  border: "none",
                  borderLeft: `2px solid ${activeId === s.id ? s.color : "transparent"}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  color: activeId === s.id ? "#fff" : "rgba(255,255,255,0.3)",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: s.color,
                    flexShrink: 0,
                    opacity: activeId === s.id ? 1 : 0.35,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      color: "inherit",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {s.code}
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 10,
                      color: "inherit",
                      letterSpacing: "0.04em",
                      marginTop: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 140,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              </button>
            ))}

            {/* Progress indicator */}
            <div
              style={{
                margin: "20px 16px 0",
                paddingTop: 16,
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  color: "rgba(255,255,255,0.2)",
                  letterSpacing: "0.15em",
                  marginBottom: 8,
                }}
              >
                READ PROGRESS
              </div>
              <div
                style={{
                  height: 3,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${scrollPct}%`,
                    background: "#0891b2",
                    borderRadius: 2,
                    transition: "width 0.1s",
                    boxShadow: "0 0 6px rgba(8,145,178,0.5)",
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  color: "#0891b2",
                  marginTop: 5,
                }}
              >
                {Math.round(scrollPct)}%
              </div>
            </div>
          </div>

          {/* Content area */}
          <div
            style={{
              flex: 1,
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
              paddingBottom: 80,
            }}
          >
            {/* Column header */}
            <div
              style={{
                padding: "12px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "#131313",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  color: "rgba(255,255,255,0.2)",
                  letterSpacing: "0.2em",
                }}
              >
                CLAUSE · PROVISION · BODY
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  color: "rgba(255,255,255,0.2)",
                  letterSpacing: "0.15em",
                }}
              >
                {SECTIONS.length} SECTIONS ·{" "}
                {SECTIONS.reduce((n, s) => n + s.content.length, 0)} CLAUSES
              </span>
            </div>

            <div style={{ padding: "24px 0 0 0" }}>
              {SECTIONS.map((section, i) => (
                <div
                  key={section.id}
                  style={{ padding: "0 24px", marginBottom: 24 }}
                >
                  <SectionPanel section={section} index={i} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER — mirrors hero bottom bar ── */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.12)",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                border: "2px solid #0891b2",
                padding: "2px 10px",
                fontSize: 12,
                fontWeight: 700,
                color: "#0891b2",
                letterSpacing: "-0.02em",
              }}
            >
              Graphix
            </div>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: "#444455",
                letterSpacing: "0.12em",
              }}
            >
              © 2025 · ALL RIGHTS RESERVED
            </span>
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {["PRIVACY POLICY", "COOKIE POLICY", "CONTACT"].map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: "#888899",
                  letterSpacing: "0.15em",
                  textDecoration: "none",
                  transition: "color .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#06b6d4")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#888899")}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
