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
      {/* Main footer body */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "56px 24px 40px",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 40,
        }}
      >
        {/* Brand col */}
        <div>
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
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              {col}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.4)",
                    textDecoration: "none",
                    transition: "color 0.15s",
                    letterSpacing: "0.02em",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
                  }
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "16px 24px",
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.15em",
          }}
        >
          © 2025 GRAPHIX · ALL RIGHTS RESERVED
        </span>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {[
            { label: "PRIVACY", href: "/policy" },
            { label: "TERMS", href: "/terms" },
            { label: "STATUS", href: "#" },
            { label: "FEEDBACK", href: "/feedback" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.25)",
                textDecoration: "none",
                letterSpacing: "0.15em",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#06b6d4")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.25)")
              }
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
