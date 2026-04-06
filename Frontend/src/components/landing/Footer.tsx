"use client";

import Link from "next/link";

const LINKS = {
  Product: [
    { label: "AI Chart Generator", href: "/signin" },
    { label: "Excel Editor", href: "/panel" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Chart Types", href: "/#features" },
    { label: "How it works", href: "/#how-it-works" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Feedback", href: "/feedback" },
    { label: "Privacy Policy", href: "/policy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  Charts: [
    { label: "Line & Scatter", href: "/signin" },
    { label: "Bar Charts", href: "/signin" },
    { label: "3D Charts", href: "/signin" },
    { label: "Heatmaps", href: "/signin" },
    { label: "Financial Charts", href: "/signin" },
  ],
};

export default function Footer() {
  return (
    <footer
      style={{
        background: "#111212",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        fontFamily: "monospace",
      }}
    >
      <style>{`
        .gx-footer-grid {
          max-width: 1100px;
          margin: 0 auto;
          padding: 56px 24px 40px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
        }
        .gx-footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 16px 24px;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .gx-footer-link-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .gx-footer-col-title {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .gx-footer-link {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: color 0.15s;
          letter-spacing: 0.02em;
        }
        .gx-footer-link:hover { color: #fff; }
        .gx-footer-legal-links {
          display: flex;
          gap: 24px;
          align-items: center;
          flex-wrap: wrap;
        }
        .gx-footer-legal-link {
          font-size: 10px;
          color: rgba(255,255,255,0.25);
          text-decoration: none;
          letter-spacing: 0.15em;
          transition: color 0.15s;
        }
        .gx-footer-legal-link:hover { color: #06b6d4; }

        @media (max-width: 767px) {
          .gx-footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px 24px !important;
            padding: 40px 20px 32px !important;
          }
          .gx-footer-brand {
            grid-column: 1 / -1;
          }
          .gx-footer-bottom {
            padding: 16px 20px;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .gx-footer-legal-links {
            gap: 16px;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .gx-footer-grid {
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 32px !important;
          }
          .gx-footer-brand {
            grid-column: 1 / -1;
          }
        }
      `}</style>

      {/* Main footer body */}
      <div className="gx-footer-grid">
        {/* Brand col */}
        <div className="gx-footer-brand">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#06b6d4",
                boxShadow: "0 0 8px #06b6d4",
              }}
            />
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              Graphix
            </span>
          </div>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.3)",
              lineHeight: 1.75,
              maxWidth: 260,
              marginBottom: 20,
            }}
          >
            AI-powered data visualization. Describe what you want to see — get a
            beautiful, interactive chart in seconds.
          </p>
          {/* Feature pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["80+ chart types", "AI-powered", "Free beta"].map((p) => (
              <span
                key={p}
                style={{
                  fontSize: 9,
                  color: "rgba(6,182,212,0.7)",
                  padding: "2px 7px",
                  borderRadius: 4,
                  background: "rgba(6,182,212,0.08)",
                  border: "1px solid rgba(6,182,212,0.15)",
                  letterSpacing: "0.05em",
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([col, items]) => (
          <div key={col}>
            <p className="gx-footer-col-title">{col}</p>
            <div className="gx-footer-link-list">
              {items.map(({ label, href }) => (
                <Link key={label} href={href} className="gx-footer-link">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="gx-footer-bottom">
        <span
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.15em",
          }}
        >
          © 2025 GRAPHIX · ALL RIGHTS RESERVED
        </span>
        <div className="gx-footer-legal-links">
          {[
            { label: "PRIVACY", href: "/policy" },
            { label: "TERMS", href: "/terms" },
            { label: "STATUS", href: "#" },
            { label: "FEEDBACK", href: "/feedback" },
          ].map(({ label, href }) => (
            <Link key={label} href={href} className="gx-footer-legal-link">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
