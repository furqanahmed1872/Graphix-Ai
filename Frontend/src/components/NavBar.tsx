"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";


export default function Navbar() {
  const [ready, setReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const _hasHydrated = useAppStore((s) => s._hasHydrated);


  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setReady(true)),
    );
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
   const showDashboard = _hasHydrated && isAuthenticated;

  return (
    <>
      <style>{`
        .gx-nav-link {
          position: relative;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          text-transform: uppercase;
          transition: color 0.2s;
          padding-bottom: 2px;
        }
        .gx-nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: #06b6d4;
          transition: width 0.25s cubic-bezier(.22,1,.36,1);
        }
        .gx-nav-link:hover { color: #fff; }
        .gx-nav-link:hover::after { width: 100%; }

        .gx-signin-btn {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          padding: 0 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #111;
          background: #fff;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.3s;
        }
        .gx-signin-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #06b6d4;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(.22,1,.36,1);
        }
        .gx-signin-btn:hover::before { transform: translateY(0); }
        .gx-signin-btn:hover { color: #fff; }
        .gx-signin-btn span { position: relative; z-index: 1; }
      `}</style>

      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
          padding: "0 32px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: scrolled ? "rgba(17,18,18,0.92)" : "rgba(17,18,18,0.6)",
          backdropFilter: "blur(12px)",
          transition: "background 0.3s, opacity 0.6s, transform 0.6s",
          opacity: ready ? 1 : 0,
          transform: ready ? "translateY(0)" : "translateY(-14px)",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                lineHeight: 1,
              }}
            >
              Graphix
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          {[
            { label: "About", href: "/about" },
            { label: "How it works", href: "#how-it-works" },
            { label: "Pricing", href: "#pricing" },
            { label: "Excel Editor", href: "/panel" },

          ].map(({ label, href }) => (
            <a key={label} href={href} className="gx-nav-link">
              {label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        
          {showDashboard ? (
            <Link href="/dashboard" className="gx-signin-btn">
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <Link href="/signin" className="gx-signin-btn">
              <span>Get started free</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
