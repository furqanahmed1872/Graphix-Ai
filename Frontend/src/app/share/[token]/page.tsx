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
  useEffect(() => {
    if (!plotlyReady || !chart || !plotRef.current) return;
    const { data, layout } = chart.chartConfig;
    try {
      window.Plotly.react(
        plotRef.current,
        data,
        {
          ...layout,
          autosize: true,
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          font: { color: "#e2e8f0", family: "DM Mono, monospace" },
        },
        { responsive: true, displayModeBar: true, displaylogo: false },
      );
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#09090f",
        color: "#e2e8f0",
        fontFamily: "'DM Mono', monospace",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(9,9,15,0.9)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <a
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="7" fill="rgba(6,182,212,0.15)" />
            <path
              d="M8 22L14 10L20 18L24 13"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="13" r="2" fill="#06b6d4" />
          </svg>
          <span
            style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: "-0.02em",
            }}
          >
            Graphix
          </span>
        </a>
        <a
          href="/signup"
          style={{
            fontSize: 11,
            padding: "6px 14px",
            borderRadius: 6,
            background: "linear-gradient(135deg,#06b6d4,#0891b2)",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          Create your own →
        </a>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 24px",
        }}
      >
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              marginTop: 80,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid rgba(6,182,212,0.2)",
                borderTopColor: "#06b6d4",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
              Loading chart…
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: 80,
              textAlign: "center",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 12,
              padding: "32px 40px",
              maxWidth: 400,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
            <p
              style={{
                color: "#ef4444",
                fontWeight: 700,
                margin: "0 0 8px",
                fontSize: 14,
              }}
            >
              Chart not found
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 12,
                margin: 0,
              }}
            >
              {error === "Shared chart not found."
                ? "This link may have expired or been removed."
                : error}
            </p>
          </div>
        )}

        {chart && !loading && (
          <div style={{ width: "100%", maxWidth: 960 }}>
            {/* Chart header */}
            <div style={{ marginBottom: 24 }}>
              <h1
                style={{
                  margin: "0 0 6px",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#f1f5f9",
                  letterSpacing: "-0.02em",
                }}
              >
                {titleText}
              </h1>
              {subtitle && (
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  {subtitle}
                </p>
              )}
              {annotations.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {annotations.map((label, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 5,
                        background: "rgba(6,182,212,0.1)",
                        border: "1px solid rgba(6,182,212,0.2)",
                        color: "rgba(6,182,212,0.8)",
                        fontWeight: 600,
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Chart */}
            <div
              style={{
                background: "#18181b",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                overflow: "hidden",
                padding: 16,
              }}
            >
              <div ref={plotRef} style={{ width: "100%", minHeight: 420 }} />
            </div>

            {/* Footer meta */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 16,
                padding: "0 4px",
              }}
            >
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                {chart.views} views
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                Shared via Graphix
              </span>
            </div>

            {/* CTA */}
            <div
              style={{
                marginTop: 40,
                textAlign: "center",
                padding: 28,
                borderRadius: 12,
                background: "rgba(6,182,212,0.05)",
                border: "1px solid rgba(6,182,212,0.12)",
              }}
            >
              <p
                style={{
                  margin: "0 0 14px",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                Build and share your own charts with Graphix — free to start.
              </p>
              <a
                href="/signup"
                style={{
                  display: "inline-block",
                  padding: "10px 28px",
                  background: "linear-gradient(135deg,#06b6d4,#0891b2)",
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.04em",
                }}
              >
                Get started free →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
