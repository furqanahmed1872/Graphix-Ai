"use client";

import Link from "next/link";
import { useAppStore } from "@/store/appStore";
import { Arrow } from "./Nav";

const LINES: [string, string][] = [
  ["Charts per month", "Unlimited"],
  ["Chart types", "140+"],
  ["File attachments (CSV, XLSX, JSON)", "Unlimited"],
  ["Per-chart visual editor", "Included"],
  ["Spreadsheet data editor", "Included"],
  ["Exports — SVG, PNG, JPEG", "Included"],
  ["Public share links", "Included"],
  ["Saved dashboard and activity", "Included"],
  ["Watermark on exports", "None"],
  ["Card required to start", "No"],
];

export default function Pricing() {
  const isAuth = useAppStore((s) => s.isAuthenticated);
  const hydrated = useAppStore((s) => s._hasHydrated);
  const signedIn = hydrated && isAuth;

  return (
    <section className="gxl-blue gxl-band" id="pricing">
      <div className="gxl-page">
        <span className="gxl-tag">Terms</span>

        <div className="gxl-split gxl-split--top" style={{ marginTop: 26 }}>
          <div>
            <h2 className="gxl-d2" style={{ maxWidth: "8ch" }}>
              Free, for now
            </h2>
            <p
              className="gxl-body"
              style={{ marginTop: 26, color: "rgba(255,255,255,0.82)" }}
            >
              Graphix is in beta and everything below is free while it stays
              there. When paid plans arrive, accounts that already exist get
              notice before anything changes — not a locked dashboard.
            </p>
            <Link
              href={signedIn ? "/dashboard" : "/signup"}
              className="gxl-btn"
              style={{ marginTop: 34 }}
            >
              <span className="gxl-btn__label">
                {signedIn ? "Go to dashboard" : "Create an account"}
              </span>
              <span className="gxl-btn__box">
                <Arrow />
              </span>
            </Link>
          </div>

          <table className="gxl-tab">
            <tbody>
              {LINES.map(([k, v]) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
