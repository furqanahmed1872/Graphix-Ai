"use client";

import Link from "next/link";
import { useAppStore } from "@/store/appStore";
import Nav, { Arrow } from "./Nav";
import GraphField from "./GraphField";

/**
 * Hero.
 *
 * Full-height blue field. The chord graph sits centred and behind
 * everything; the headline is pinned to the bottom-left corner and the
 * scroll cue to the bottom-right, so the middle of the screen stays open.
 */

// Placed on a ring around the figure by angle, so they annotate it instead
// of floating at the edges of the screen. 0deg is due right, clockwise.
// Angles between 100 and 175 are skipped — that is where the headline sits.
const LABELS = [
  { text: "PARSING…", deg: 215 },
  { text: "SCALES…", deg: 318 },
  { text: "ENCODING…", deg: 18 },
  { text: "AXES…", deg: 180 },
  { text: "RENDERING…", deg: 58 },
];
const RING = 64;

export default function Hero() {
  const isAuth = useAppStore((s) => s.isAuthenticated);
  const hydrated = useAppStore((s) => s._hasHydrated);
  const signedIn = hydrated && isAuth;

  return (
    <>
      <Nav />

      <section className="gxl-blue gxl-hero">
        <div className="gxl-hero__field">
          <GraphField />

          {LABELS.map((l) => {
            const r = (l.deg * Math.PI) / 180;
            return (
              <span
                key={l.text}
                className="gxl-mono gxl-hero__label"
                style={{
                  left: `${(50 + RING * Math.cos(r)).toFixed(3)}%`,
                  top: `${(50 + RING * Math.sin(r)).toFixed(3)}%`,
                }}
              >
                {l.text}
              </span>
            );
          })}
        </div>

        <div className="gxl-page">
          <div className="gxl-hero__foot">
            <div>
              <h1 className="gxl-d1 gxl-hero__h">
                From one sentence to a chart you can ship
              </h1>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Link
                  href={signedIn ? "/dashboard" : "/signup"}
                  className="gxl-btn"
                >
                  <span className="gxl-btn__label">
                    {signedIn ? "Go to dashboard" : "Get started"}
                  </span>
                  <span className="gxl-btn__box">
                    <Arrow />
                  </span>
                </Link>
                <Link href="#charts" className="gxl-btn gxl-btn--ghost">
                  <span className="gxl-btn__label">See it render</span>
                  <span className="gxl-btn__box">
                    <Arrow />
                  </span>
                </Link>
              </div>
            </div>

            <span className="gxl-mono gxl-hero__scroll">Scroll down</span>
          </div>
        </div>
      </section>
    </>
  );
}
