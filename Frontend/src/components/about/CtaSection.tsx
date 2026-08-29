import Link from "next/link";

/* The stat row here (149+ / $0 / 0 / 4) duplicated numbers stated elsewhere
   and contradicted the 140+ used on the landing page, so the closing section
   is just the ask. */
export default function CtaSection() {
  return (
    <section className="ab-sec">
      <div className="ab-wrap" style={{ paddingBottom: 128 }}>
        <div
          style={{ borderTop: "1px solid var(--gx-line)", paddingTop: 64 }}
        >
          <h2 className="ab-h2">
            That&apos;s the whole pitch.
            <br />
            <span style={{ fontStyle: "italic" }}>Go make a chart.</span>
          </h2>
          <p className="ab-lede" style={{ marginBottom: 36 }}>
            Free while Graphix is in beta. No card, no seat minimum, and no
            call with anyone before you can try it.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link href="/signin" className="ab-cta">
              <span>Start for free</span>
              <span className="ab-cta-arrow" aria-hidden="true">
                <svg
                  width="12"
                  height="12"
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
            <Link href="/feedback" className="ab-ghost">
              Tell us what&apos;s missing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
