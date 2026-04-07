"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

declare global {
  interface Window {
    Plotly: any;
  }
}

export default function SharePage() {
  const params = useParams();
  const token = params?.token as string;

  const [chart, setChart] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const plotRef = useRef<HTMLDivElement>(null);
  const [plotlyReady, setPlotlyReady] = useState(false);

  // Load Plotly
  useEffect(() => {
    if (window.Plotly) {
      setPlotlyReady(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdn.plot.ly/plotly-2.27.0.min.js";
    s.onload = () => setPlotlyReady(true);
    document.head.appendChild(s);
  }, []);

  // Fetch chart data
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/charts/share/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setChart(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  // Render chart
  // Render chart useEffect
  useEffect(() => {
    if (!plotlyReady || !chart || !plotRef.current) return;
    const { data, layout } = chart.chartConfig;
    const traces = data || [];

    const is3D = traces.some((t: any) =>
      [
        "scatter3d",
        "surface",
        "mesh3d",
        "cone",
        "streamtube",
        "isosurface",
        "volume",
      ].includes(t.type),
    );
    const isHeat = traces.some((t: any) =>
      ["heatmap", "contour", "histogram2d"].includes(t.type),
    );
    const isSankey = traces.some((t: any) => t.type === "sankey");
    const isNoAxes =
      isSankey ||
      traces.some((t: any) =>
        [
          "icicle",
          "sunburst",
          "treemap",
          "pie",
          "funnel",
          "funnelarea",
        ].includes(t.type),
      );

    // Sanitize traces
    const cleanTraces = traces.map((t: any) => {
      if (t.type === "sankey") {
        return {
          ...t,
          node: {
            pad: 15,
            thickness: 20,
            ...(t.node || {}),
            label: t.node?.label || [],
          },
          link: t.link || { source: [], target: [], value: [] },
        };
      }
      if (["icicle", "sunburst", "treemap"].includes(t.type)) {
        return { ...t, textinfo: t.textinfo || "label+value" };
      }
      return t;
    });

    const layoutOverride: any = {
      ...layout,
      autosize: true,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: isHeat ? "#0f0f0f" : "rgba(0,0,0,0)",
      font: { color: "#cbd5e1", family: "DM Mono, monospace", size: 12 },
      margin: is3D
        ? { l: 0, r: 0, t: 20, b: 0 }
        : { l: 40, r: 20, t: 20, b: 40 },
      legend: {
        bgcolor: "rgba(0,0,0,0)",
        font: { color: "#94a3b8", size: 11 },
      },
      title: undefined,
    };

    if (!isNoAxes && !is3D) {
      layoutOverride.xaxis = layout?.xaxis
        ? {
            ...layout.xaxis,
            gridcolor: "rgba(255,255,255,0.06)",
            linecolor: "rgba(255,255,255,0.1)",
            tickfont: { color: "#64748b", size: 11 },
            title: layout.xaxis.title
              ? { ...layout.xaxis.title, font: { color: "#94a3b8", size: 12 } }
              : undefined,
          }
        : undefined;
      layoutOverride.yaxis = layout?.yaxis
        ? {
            ...layout.yaxis,
            gridcolor: "rgba(255,255,255,0.06)",
            linecolor: "rgba(255,255,255,0.1)",
            tickfont: { color: "#64748b", size: 11 },
            title: layout.yaxis.title
              ? { ...layout.yaxis.title, font: { color: "#94a3b8", size: 12 } }
              : undefined,
          }
        : undefined;
    }

    try {
      window.Plotly.react(plotRef.current, cleanTraces, layoutOverride, {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ["toImage"],
      });
    } catch (e) {
      console.error("Plotly render error", e);
    }
  }, [plotlyReady, chart]);
  const titleText =
    chart?.chartConfig?.layout?.title?.text ||
    (typeof chart?.chartConfig?.layout?.title === "string"
      ? chart.chartConfig.layout.title
      : null) ||
    chart?.title ||
    "Untitled Chart";

  const subtitle = chart?.chartConfig?.layout?._subtitle || "";
  const annotations: string[] = Array.isArray(
    chart?.chartConfig?.layout?._annotations,
  )
    ? chart.chartConfig.layout._annotations
    : [];

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#08080f",
        color: "#e2e8f0",
        fontFamily: "'DM Mono', monospace",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');

        * { box-sizing: border-box; }

        .share-nav { 
          position: sticky; top: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; height: 56px;
          background: rgba(8,8,15,0.85);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(16px);
        }

        .share-logo {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none;
        }
        .share-logo-mark {
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(6,182,212,0.12);
          border: 1px solid rgba(6,182,212,0.25);
          display: flex; align-items: center; justify-content: center;
        }
        .share-logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 15px;
          color: #fff; letter-spacing: -0.02em;
        }

        .share-cta-btn {
          padding: 7px 16px; border-radius: 8px;
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          color: #fff; text-decoration: none;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.04em;
          border: none; cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(6,182,212,0.25);
          white-space: nowrap;
        }
        .share-cta-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(6,182,212,0.4); }

        .share-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px 80px;
        }

        .share-card {
          width: 100%;
          max-width: 900px;
          animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .share-header {
          margin-bottom: 28px;
        }

        .share-meta-row {
          display: flex; align-items: center; gap: 10; margin-bottom: 12px; flex-wrap: wrap;
        }

        .share-type-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 6px;
          background: rgba(6,182,212,0.1);
          border: 1px solid rgba(6,182,212,0.2);
          font-size: 9px; font-weight: 700; color: #06b6d4;
          letter-spacing: 0.12em; text-transform: uppercase;
        }

        .share-views-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 10px; color: rgba(255,255,255,0.25);
        }

        .share-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: clamp(22px, 4vw, 32px);
          color: #f1f5f9; letter-spacing: -0.03em;
          margin: 0 0 8px; line-height: 1.15;
        }

        .share-subtitle {
          font-size: 14px; color: rgba(255,255,255,0.4);
          margin: 0 0 12px; line-height: 1.5;
        }

        .share-annotations {
          display: flex; flex-wrap: wrap; gap: 6px;
          margin-bottom: 8px;
        }

        .share-ann-tag {
          font-size: 10px; padding: 2px 9px; border-radius: 5px;
          background: rgba(6,182,212,0.08);
          border: 1px solid rgba(6,182,212,0.18);
          color: rgba(6,182,212,0.8); font-weight: 600;
        }

        .share-chart-wrap {
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02);
          overflow: hidden;
          padding: 20px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04);
          margin-bottom: 24px;
        }

        .share-plot { width: 100%; min-height: 420px; }

        .share-actions {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
          margin-bottom: 48px;
        }

        .share-url-box {
          flex: 1; min-width: 0;
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px; padding: 9px 9px 9px 14px;
        }

        .share-url-text {
          flex: 1; font-size: 11px; color: rgba(255,255,255,0.35);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          font-family: 'DM Mono', monospace;
        }

        .copy-btn {
          flex-shrink: 0; padding: 6px 14px; border-radius: 7px;
          font-size: 11px; font-weight: 700; cursor: pointer;
          transition: all 0.2s; border: 1px solid;
          font-family: 'DM Mono', monospace;
        }
        .copy-btn.idle {
          background: rgba(6,182,212,0.12);
          border-color: rgba(6,182,212,0.3);
          color: #06b6d4;
        }
        .copy-btn.done {
          background: rgba(16,185,129,0.12);
          border-color: rgba(16,185,129,0.3);
          color: #10b981;
        }

        .share-footer-cta {
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(6,182,212,0.07) 0%, rgba(6,182,212,0.03) 100%);
          border: 1px solid rgba(6,182,212,0.12);
          padding: 36px 32px;
          text-align: center;
        }

        .footer-cta-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: clamp(18px, 3vw, 24px);
          color: #fff; letter-spacing: -0.02em;
          margin: 0 0 10px;
        }

        .footer-cta-sub {
          font-size: 13px; color: rgba(255,255,255,0.4);
          margin: 0 0 24px; line-height: 1.6; max-width: 400px;
          margin-left: auto; margin-right: auto;
        }

        .footer-cta-link {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 12px 28px; border-radius: 10px;
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          color: #fff; text-decoration: none;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 20px rgba(6,182,212,0.3);
          transition: all 0.2s;
        }
        .footer-cta-link:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(6,182,212,0.45); }

        /* Loading */
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

        .loader-ring {
          width: 36px; height: 36px;
          border: 2.5px solid rgba(6,182,212,0.2);
          border-top-color: #06b6d4;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .share-body { padding: 24px 16px 60px; }
          .share-chart-wrap { padding: 12px; }
          .share-actions { flex-direction: column; align-items: stretch; }
          .share-url-box { min-width: 0; }
          .share-footer-cta { padding: 28px 20px; }
        }
      `}</style>

      {/* Nav */}
      <nav className="share-nav">
        <a href="/" className="share-logo">
          <div className="share-logo-mark">
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
              <path
                d="M8 22L14 10L20 18L24 13"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="24" cy="13" r="2" fill="#06b6d4" />
            </svg>
          </div>
          <span className="share-logo-text">Graphix</span>
        </a>
        <a href="/signup" className="share-cta-btn">
          Create yours free →
        </a>
      </nav>

      {/* Body */}
      <main className="share-body">
        {/* Loading */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              marginTop: 100,
            }}
          >
            <div className="loader-ring" />
            <p
              style={{
                color: "rgba(255,255,255,0.25)",
                fontSize: 12,
                margin: 0,
              }}
            >
              Loading chart…
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div
            style={{
              marginTop: 80,
              textAlign: "center",
              background: "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.18)",
              borderRadius: 16,
              padding: "40px 32px",
              maxWidth: 380,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
            <p
              style={{
                color: "#ef4444",
                fontWeight: 700,
                margin: "0 0 8px",
                fontSize: 15,
                fontFamily: "'Syne',sans-serif",
              }}
            >
              Chart not found
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 12,
                margin: "0 0 24px",
                lineHeight: 1.6,
              }}
            >
              {error === "Shared chart not found."
                ? "This link may have expired or been removed by the owner."
                : error}
            </p>
            <a
              href="/"
              style={{
                color: "#06b6d4",
                fontSize: 12,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              ← Go to Graphix
            </a>
          </div>
        )}

        {/* Chart content */}
        {chart && !loading && (
          <div className="share-card">
            {/* Header */}
            <div className="share-header">
              <div className="share-meta-row">
                <span className="share-type-badge">
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#06b6d4",
                      display: "inline-block",
                    }}
                  />
                  {chart.tag || "CHART"}
                </span>
                <span className="share-views-badge">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {chart.views ?? 0} views
                </span>
              </div>

              <h1 className="share-title">{titleText}</h1>

              {subtitle && <p className="share-subtitle">{subtitle}</p>}

              {annotations.length > 0 && (
                <div className="share-annotations">
                  {annotations.map((label: string, i: number) => (
                    <span key={i} className="share-ann-tag">
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="share-chart-wrap">
              <div ref={plotRef} className="share-plot" />
            </div>

            {/* Share URL + copy */}
            <div className="share-actions">
              <div className="share-url-box">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
                <span className="share-url-text">{shareUrl}</span>
                <button
                  onClick={handleCopy}
                  className={`copy-btn ${copied ? "done" : "idle"}`}
                >
                  {copied ? "✓ Copied!" : "Copy link"}
                </button>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="share-footer-cta">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  margin: "0 auto 18px",
                  background: "rgba(6,182,212,0.12)",
                  border: "1px solid rgba(6,182,212,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M8 22L14 10L20 18L24 13"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="24" cy="13" r="2" fill="#06b6d4" />
                </svg>
              </div>
              <p className="footer-cta-title">Build your own charts</p>
              <p className="footer-cta-sub">
                Create stunning interactive visualisations in seconds with
                Graphix. Free to start — no credit card needed.
              </p>
              <a href="/signup" className="footer-cta-link">
                Start for free
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
