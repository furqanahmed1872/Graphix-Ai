"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";

const LINKS = [
  { label: "Home", href: "#top", on: true },
  { label: "Product", href: "#product" },
  { label: "Charts", href: "#charts" },
  { label: "Pricing", href: "#pricing" },
];

export function Arrow({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function Nav() {
  const isAuth = useAppStore((s) => s.isAuthenticated);
  const hydrated = useAppStore((s) => s._hasHydrated);
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);
  const signedIn = hydrated && isAuth;

  // The bar is transparent over the hero so there is no seam at the top;
  // it only picks up a tint once content scrolls beneath it.
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`gxl-nav${lifted ? " gxl-nav--lifted" : ""}`} id="top">
      <div className="gxl-page">
        <div className="gxl-nav__in">
          <Link href="/" className="gxl-brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="gxl-brand__mark" aria-hidden="true">
              <rect x="1" y="13" width="5" height="10" fill="currentColor" />
              <rect x="9.5" y="7" width="5" height="16" fill="currentColor" />
              <rect x="18" y="1" width="5" height="22" fill="currentColor" />
            </svg>
            <span className="gxl-brand__name">Graphix</span>
          </Link>

          <nav className="gxl-navgroup">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={`gxl-navlink${l.on ? " gxl-navlink--on" : ""}`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="gxl-nav__right">
            <Link href="/panel" className="gxl-navlink">
              Data editor
            </Link>
            <Link href={signedIn ? "/dashboard" : "/signin"} className="gxl-navlink">
              Sign in
            </Link>
            <Link href={signedIn ? "/dashboard" : "/signup"} className="gxl-btn">
              <span className="gxl-btn__label">
                {signedIn ? "Dashboard" : "Get started"}
              </span>
              <span className="gxl-btn__box">
                <Arrow />
              </span>
            </Link>
          </div>

          <button
            className="gxl-burger"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true">
              <path
                d={open ? "M2 1l12 10M14 1L2 11" : "M0 1h16M0 6h16M0 11h16"}
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="gxl-page" style={{ padding: "12px 20px 20px" }}>
            {[...LINKS, { label: "Data editor", href: "/panel" }, { label: "Sign in", href: "/signin" }].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="gxl-foot__l"
                style={{ fontSize: "1rem", padding: "10px 0" }}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
