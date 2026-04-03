'use client';
import Link from "next/link";

const FOOTER_LINKS = ["PRIVACY", "TERMS", "STATUS", "TWITTER"];

export default function Footer() {
  return (
    <footer
      style={{
        background: "#111",
        color: "#fff",
        fontFamily: "monospace",
        borderTop: "1px solid rgba(255,255,255,0.2)",
        borderLeft: "1px solid rgba(255,255,255,0.2)",
        borderRight: "1px solid rgba(255,255,255,0.2)",
        padding: "14px 44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 10, color: "#444455", letterSpacing: "0.18em" }}>
        © 2025 GRAPHIX · ALL RIGHTS RESERVED
      </span>
      <div style={{ display: "flex", gap: 24 }}>
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link}
            href={
              link === "PRIVACY" ? "/policy" : link === "TERMS" ? "/terms" : "#"
            }
            style={{
              fontSize: 10,
              color: "#888899",
              letterSpacing: "0.18em",
              textDecoration: "none",
              transition: "color .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#06b6d4")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888899")}
          >
            {link}
          </Link>
        ))}
      </div>
    </footer>
  );
}
