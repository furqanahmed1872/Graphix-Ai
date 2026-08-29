"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";

/* Segmented-group navbar: logo left, primary nav in a centred group,
   secondary links + CTA in a right group. Radii nest (group uses --gx-r-lg,
   the chips inside use --gx-r-md) so the inner corners sit concentric with
   the outer ones rather than fighting them. */
const CSS = `
  .gxn-bar {
    position: sticky; top: 0; z-index: 200;
    display: flex; align-items: center; justify-content: space-between;
    height: 68px; padding: 0 24px;
    background: var(--gx-bg);
    border-bottom: 1px solid var(--gx-line);
    transition: opacity 0.6s, transform 0.6s, border-color 0.3s;
    box-sizing: border-box; width: 100%;
  }
  .gxn-bar.sc  { border-bottom-color: var(--gx-line-strong); }
  .gxn-bar.rdy  { opacity:1; transform:translateY(0); }
  .gxn-bar.nrdy { opacity:0; transform:translateY(-14px); }

  /* ── Logo ── */
  .gxn-logo {
    display:flex; align-items:center; gap:9px;
    text-decoration:none; flex-shrink:0;
  }
  .gxn-logo-word {
    font-size:17px; font-weight:500; letter-spacing:-0.01em;
    color:var(--gx-fg);
  }

  /* ── Segmented groups ── */
  .gxn-group {
    display:flex; align-items:center; gap:2px;
    background:rgba(255,255,255,0.045);
    border:1px solid var(--gx-line);
    border-radius:var(--gx-r-lg);
    padding:4px;
  }

  /* Dead-centre regardless of how wide the logo or CTA get */
  .gxn-center {
    position:absolute; left:50%; transform:translateX(-50%);
  }

  .gxn-chip {
    display:inline-flex; align-items:center;
    height:34px; padding:0 15px;
    border-radius:var(--gx-r-md);
    font-size:14px; font-weight:400; letter-spacing:0;
    color:var(--gx-fg-muted); text-decoration:none; white-space:nowrap;
    transition:color 0.18s, background 0.18s;
  }
  .gxn-chip:hover { color:var(--gx-fg); background:rgba(255,255,255,0.05); }
  .gxn-chip.on {
    background:var(--gx-fg); color:var(--gx-accent-ink); font-weight:500;
  }
  .gxn-chip.on:hover { background:var(--gx-fg); }

  /* ── CTA: filled accent with the arrow in its own boxed square ── */
  .gxn-cta {
    display:inline-flex; align-items:center; gap:10px;
    height:34px; padding:0 6px 0 15px;
    border-radius:var(--gx-r-md);
    background:var(--gx-accent); color:var(--gx-accent-ink);
    font-size:14px; font-weight:500; letter-spacing:0;
    text-decoration:none; white-space:nowrap;
    transition:opacity 0.18s;
  }
  .gxn-cta:hover { opacity:0.88; }
  .gxn-cta-arrow {
    display:inline-flex; align-items:center; justify-content:center;
    width:24px; height:24px; flex-shrink:0;
    border:1px solid rgba(12,12,10,0.30);
    border-radius:4px;
  }
  .gxn-cta-arrow svg { transition:transform 0.25s cubic-bezier(.22,1,.36,1); }
  .gxn-cta:hover .gxn-cta-arrow svg { transform:translate(1.5px,-1.5px); }

  /* ── Mobile ── */
  .gxn-hbg {
    display:none; flex-direction:column; justify-content:center;
    gap:5px; width:38px; height:38px; background:none;
    border:1px solid var(--gx-line);
    border-radius:var(--gx-r-md);
    cursor:pointer; padding:9px; box-sizing:border-box; flex-shrink:0;
  }
  .gxn-hbg span {
    display:block; height:1.5px; background:var(--gx-fg-muted);
    transition:all 0.25s ease; border-radius:1px;
  }
  .gxn-hbg.op span:nth-child(1) { transform:translateY(6.5px) rotate(45deg); }
  .gxn-hbg.op span:nth-child(2) { opacity:0; transform:scaleX(0); }
  .gxn-hbg.op span:nth-child(3) { transform:translateY(-6.5px) rotate(-45deg); }

  .gxn-drop {
    position:fixed; top:68px; left:0; right:0;
    background:var(--gx-bg);
    border-bottom:1px solid var(--gx-line);
    z-index:199; overflow:hidden;
    max-height:0; opacity:0; pointer-events:none;
    transition:max-height 0.35s cubic-bezier(.22,1,.36,1), opacity 0.25s ease;
  }
  .gxn-drop.op { max-height:460px; opacity:1; pointer-events:auto; }
  .gxn-dlink {
    display:block; padding:15px 24px;
    font-size:15px; font-weight:400;
    color:var(--gx-fg-muted); text-decoration:none;
    border-bottom:1px solid var(--gx-line);
    transition:color 0.15s, background 0.15s;
  }
  .gxn-dlink.on { color:var(--gx-fg); }
  .gxn-dlink:hover { color:var(--gx-fg); background:rgba(255,255,255,0.03); }
  .gxn-dcta {
    display:flex; align-items:center; justify-content:center; gap:10px;
    margin:16px 24px; height:46px;
    border-radius:var(--gx-r-md);
    background:var(--gx-accent); color:var(--gx-accent-ink);
    font-size:15px; font-weight:500;
    text-decoration:none; cursor:pointer;
  }

  /* Absolute centring needs room for both side groups; below ~1280 the
     centre group would run into the right one, so fall back to the natural
     flex distribution rather than dropping links. */
  @media (max-width: 1279px) {
    .gxn-center { position: static; transform: none; }
    .gxn-chip   { padding: 0 12px; }
  }

  @media (max-width: 1023px) {
    .gxn-bar     { padding: 0 16px; height: 60px; }
    .gxn-center  { display: none; }
    .gxn-right   { display: none; }
    .gxn-hbg     { display: flex; }
    .gxn-drop    { top: 60px; }
  }
`;

/* Primary product nav sits in the centre group */
const NAV = [
  { label: "Home", href: "/" },
  { label: "How it works", href: "/howitworks" },
  { label: "Pricing", href: "/pricing" },
  { label: "Excel Editor", href: "/panel" },
];

/* Company links sit in the right group, beside the CTA */
const SECONDARY = [
  { label: "About", href: "/about" },
  { label: "Feedback", href: "/feedback" },
];

export default function Navbar() {
  const [ready, setReady] = useState(false);
  const [sc, setSc] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAuth = useAppStore((s) => s.isAuthenticated);
  const hydrated = useAppStore((s) => s._hasHydrated);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setReady(true)),
    );
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    const f = () => setSc(window.scrollY > 40);
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => {
    const f = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  const dash = hydrated && isAuth;
  const isOn = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const ctaLabel = dash ? "Go to Dashboard" : "Get started free";
  const ctaHref = dash ? "/dashboard" : "/signin";

  return (
    <>
      <style>{CSS}</style>

      <nav className={`gxn-bar ${sc ? "sc" : ""} ${ready ? "rdy" : "nrdy"}`}>
        {/* Logo */}
        <Link href="/" className="gxn-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Graphix AI" className="w-7" />
          <span className="gxn-logo-word">Graphix</span>
        </Link>

        {/* Primary nav — centred group */}
        <div className="gxn-group gxn-center">
          {NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`gxn-chip${isOn(l.href) ? " on" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Secondary + CTA — right group */}
        <div className="gxn-group gxn-right">
          {SECONDARY.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`gxn-chip${isOn(l.href) ? " on" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          <Link href={ctaHref} className="gxn-cta">
            <span>{ctaLabel}</span>
            <span className="gxn-cta-arrow" aria-hidden="true">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </span>
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className={`gxn-hbg${open ? " op" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile dropdown */}
      <div className={`gxn-drop${open ? " op" : ""}`}>
        {[...NAV, ...SECONDARY].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`gxn-dlink${isOn(l.href) ? " on" : ""}`}
            onClick={() => setOpen(false)}
          >
            {l.label}
          </Link>
        ))}
        <Link href={ctaHref} className="gxn-dcta" onClick={() => setOpen(false)}>
          <span>{ctaLabel}</span>
          <span className="gxn-cta-arrow" aria-hidden="true">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </span>
        </Link>
      </div>
    </>
  );
}
