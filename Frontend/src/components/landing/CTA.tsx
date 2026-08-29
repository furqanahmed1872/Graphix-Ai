"use client";

import Link from "next/link";
import { useAppStore } from "@/store/appStore";
import { Arrow } from "./Nav";
import GraphField from "./GraphField";

/**  
 * Cl  osing band — the chord field returns, dimmed, behind a last call.
 */

export default function CTA() {
  const isAuth = useAppStore((s) => s.isAuthenticated);
  const hydrated = useAppStore((s) => s._hasHydrated);
  const signedIn = hydrated && isAuth;

  return (
    <section className="gxl-blue gxl-band" style={{ padding: "128px 0 132px" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      >
        <GraphField />
      </div>

      <div className="gxl-page" style={{ position: "relative", zIndex: 1 }}>
        <h2 className="gxl-d2" style={{ maxWidth: "13ch" }}>
          Paste a column of numbers and see
        </h2>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 40 }}>
          <Link href={signedIn ? "/dashboard" : "/signup"} className="gxl-btn">
            <span className="gxl-btn__label">
              {signedIn ? "Go to dashboard" : "Get started"}
            </span>
            <span className="gxl-btn__box">
              <Arrow />
            </span>
          </Link>
          <Link href="/panel" className="gxl-btn gxl-btn--ghost">
            <span className="gxl-btn__label">Open the data editor</span>
            <span className="gxl-btn__box">
              <Arrow />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
