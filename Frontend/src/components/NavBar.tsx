"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";

const CSS = `
  .gxn-bar {
    position: sticky; top: 0; z-index: 200;
    display: flex; align-items: center; justify-content: space-between;
    height: 56px; padding: 0 32px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(12px);
    transition: background 0.3s, opacity 0.6s, transform 0.6s;
    box-sizing: border-box; width: 100%;
  }
  .gxn-bar.sc  { background: rgba(17,18,18,0.95); }
  .gxn-bar.nsc { background: rgba(17,18,18,0.6); }
  .gxn-bar.rdy  { opacity:1; transform:translateY(0); }
  .gxn-bar.nrdy { opacity:0; transform:translateY(-14px); }

  .gxn-links { display:flex; align-items:center; gap:36px; }
  .gxn-link {
    font-size:11px; font-weight:600; letter-spacing:0.08em;
    color:rgba(255,255,255,0.45); text-decoration:none;
    text-transform:uppercase; white-space:nowrap;
    position:relative; padding-bottom:2px;
    transition: color 0.2s;
  }
  .gxn-link::after {
    content:''; position:absolute; bottom:-2px; left:0;
    width:0; height:1px; background:#06b6d4;
    transition: width 0.25s cubic-bezier(.22,1,.36,1);
  }
  .gxn-link:hover { color:#fff; }
  .gxn-link:hover::after { width:100%; }

  .gxn-cta {
    position:relative; overflow:hidden;
    display:inline-flex; align-items:center; justify-content:center;
    height:36px; padding:0 20px;
    font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;
    color:#111; background:#fff; text-decoration:none;
    border:none; cursor:pointer; transition:color 0.3s; white-space:nowrap;
  }
  .gxn-cta::before {
    content:''; position:absolute; inset:0; background:#06b6d4;
    transform:translateY(100%); transition:transform 0.3s cubic-bezier(.22,1,.36,1);
  }
  .gxn-cta:hover::before { transform:translateY(0); }
  .gxn-cta:hover { color:#fff; }
  .gxn-cta span { position:relative; z-index:1; }

  .gxn-hbg {
    display:none; flex-direction:column; justify-content:center;
    gap:5px; width:36px; height:36px; background:none;
    border:1px solid rgba(255,255,255,0.15);
    cursor:pointer; padding:8px; box-sizing:border-box; flex-shrink:0;
  }
  .gxn-hbg span {
    display:block; height:1.5px; background:rgba(255,255,255,0.7);
    transition:all 0.25s ease; border-radius:1px;
  }
  .gxn-hbg.op span:nth-child(1) { transform:translateY(6.5px) rotate(45deg); }
  .gxn-hbg.op span:nth-child(2) { opacity:0; transform:scaleX(0); }
  .gxn-hbg.op span:nth-child(3) { transform:translateY(-6.5px) rotate(-45deg); }

  .gxn-mob-cta {
    display:none; font-size:11px; font-weight:700;
    letter-spacing:0.08em; text-transform:uppercase;
    color:#06b6d4; text-decoration:none; white-space:nowrap;
  }

  .gxn-drop {
    position:fixed; top:56px; left:0; right:0;
    background:rgba(14,15,15,0.98); backdrop-filter:blur(16px);
    border-bottom:1px solid rgba(255,255,255,0.08);
    z-index:199; overflow:hidden;
    max-height:0; opacity:0; pointer-events:none;
    transition:max-height 0.35s cubic-bezier(.22,1,.36,1), opacity 0.25s ease;
  }
  .gxn-drop.op { max-height:400px; opacity:1; pointer-events:auto; }
  .gxn-dlink {
    display:block; padding:16px 24px;
    font-size:13px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase;
    color:rgba(255,255,255,0.5); text-decoration:none;
    border-bottom:1px solid rgba(255,255,255,0.04);
    transition:color 0.15s, background 0.15s;
  }
  .gxn-dlink:hover { color:#fff; background:rgba(255,255,255,0.03); }
  .gxn-dcta {
    display:flex; align-items:center; justify-content:center;
    margin:16px 24px; height:44px; background:#06b6d4; color:#111;
    font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;
    text-decoration:none; cursor:pointer; transition:filter 0.2s;
  }
  .gxn-dcta:hover { filter:brightness(1.1); }

  @media (max-width: 767px) {
    .gxn-bar    { padding: 0 16px; }
    .gxn-links  { display: none; }
    .gxn-dt-cta { display: none; }
    .gxn-hbg    { display: flex; }
    .gxn-mob-cta { display: block; }
  }
`;

const LINKS = [
  { label: "About", href: "/about" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Excel Editor", href: "/panel" },
];

export default function Navbar() {
  const [ready, setReady] = useState(false);
  const [sc, setSc] = useState(false);
  const [open, setOpen] = useState(false);
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
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  const dash = hydrated && isAuth;

  return (
    <>
      <style>{CSS}</style>

      <nav className={`gxn-bar ${sc ? "sc" : "nsc"} ${ready ? "rdy" : "nrdy"}`}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            
            <img src="/logo.png" alt="Graphix AI Logo" className="w-7 invert" />
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              Graphix AI
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="gxn-links">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className="gxn-link">
              {l.label}
            </a>
          ))}
        </div>

        {/* Right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          {/* Desktop CTA */}
          <div className="gxn-dt-cta">
            {dash ? (
              <Link href="/dashboard" className="gxn-cta">
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <Link href="/signin" className="gxn-cta">
                <span>Get started free</span>
              </Link>
            )}
          </div>
          {/* Mobile sign-in */}
          {dash ? (
            <Link href="/dashboard" className="gxn-mob-cta">
              Dashboard
            </Link>
          ) : (
            <Link href="/signin" className="gxn-mob-cta">
              Sign in
            </Link>
          )}
          {/* Hamburger */}
          <button
            className={`gxn-hbg${open ? " op" : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Dropdown */}
      <div className={`gxn-drop${open ? " op" : ""}`}>
        {LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="gxn-dlink"
            onClick={() => setOpen(false)}
          >
            {l.label}
          </a>
        ))}
        {dash ? (
          <Link
            href="/dashboard"
            className="gxn-dcta"
            onClick={() => setOpen(false)}
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/signin"
            className="gxn-dcta"
            onClick={() => setOpen(false)}
          >
            Get started free
          </Link>
        )}
      </div>
    </>
  );
}
