"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getStoredToken, submitFeedback } from "@/lib/api";

/* This section used to carry six testimonials with invented names, roles and
   five-star ratings. Graphix has no users yet, so there is nothing to quote —
   the honest version of this section is the form and a straight explanation
   of where the message goes. */

// ── Schema ────────────────────────────────────────────────────
const feedbackSchema = z.object({
  name: z.string().min(2, "At least 2 characters").max(60),
  email: z.string().min(1, "Required").email("Enter a valid email"),
  thoughts: z.string().min(10, "At least 10 characters").max(1000),
});
type FeedbackInput = z.infer<typeof feedbackSchema>;

const ROSE = "#FF6B8A";

// ── Form ──────────────────────────────────────────────────────
function FeedbackForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackInput>({ resolver: zodResolver(feedbackSchema) });
  const thoughts = watch("thoughts", "");

  const onSubmit = async (data: FeedbackInput) => {
    setServerError(null);
    const token = getStoredToken() ?? undefined;
    try {
      await submitFeedback(
        { name: data.name, email: data.email, thoughts: data.thoughts },
        token,
      );
      setSubmitted(true);
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  };

  if (submitted) {
    return (
      <div className="fb-done">
        <h3 className="fb-done-title">Thank you.</h3>
        <p className="fb-done-body">
          That went straight to the team. If you left an email we&apos;ll reply
          to it ourselves.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="fb-form">
      {serverError && (
        <div className="fb-servererr">{serverError}</div>
      )}

      <div className="fb-row">
        <div className="fb-field">
          <label className="fb-label" htmlFor="fb-name">
            Name
          </label>
          <input
            id="fb-name"
            className={`fb-input${errors.name ? " err" : ""}`}
            placeholder="Your name"
            {...register("name")}
          />
          {errors.name && <span className="fb-err">{errors.name.message}</span>}
        </div>

        <div className="fb-field">
          <label className="fb-label" htmlFor="fb-email">
            Email
          </label>
          <input
            id="fb-email"
            className={`fb-input${errors.email ? " err" : ""}`}
            placeholder="you@company.com"
            {...register("email")}
          />
          {errors.email && (
            <span className="fb-err">{errors.email.message}</span>
          )}
        </div>
      </div>

      <div className="fb-field">
        <div className="fb-label-row">
          <label className="fb-label" htmlFor="fb-thoughts">
            What&apos;s on your mind
          </label>
          <span className="fb-count">{thoughts.length}/1000</span>
        </div>
        <textarea
          id="fb-thoughts"
          rows={6}
          className={`fb-input fb-textarea${errors.thoughts ? " err" : ""}`}
          placeholder="What's missing, what broke, what you'd want it to do."
          {...register("thoughts")}
        />
        {errors.thoughts && (
          <span className="fb-err">{errors.thoughts.message}</span>
        )}
      </div>

      <button type="submit" className="fb-submit" disabled={isSubmitting}>
        <span>{isSubmitting ? "Sending…" : "Send it"}</span>
        <span className="fb-submit-arrow" aria-hidden="true">
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
      </button>
    </form>
  );
}

// ── Section ───────────────────────────────────────────────────
export default function Feedback() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .fb-sec { background: var(--gx-bg); }
        .fb-wrap { max-width: 1100px; margin: 0 auto; padding: 96px 24px; }

        .fb-eyebrow { display:flex; align-items:center; gap:12px; margin-bottom:24px; }
        .fb-eyebrow span.r { height:1px; width:32px; background:var(--gx-line-strong); }
        .fb-eyebrow span.t {
          font-family:var(--gx-mono); font-size:12px; color:var(--gx-fg-faint);
        }

        .fb-grid {
          display:grid; grid-template-columns: 1fr 1fr; gap:64px;
          align-items:start;
        }

        .fb-h2 {
          font-family:var(--gx-display); font-weight:400;
          font-size:clamp(2.4rem,4.6vw,3.6rem); line-height:1.08;
          letter-spacing:-0.015em; color:var(--gx-fg); margin:0 0 20px;
        }
        .fb-lede {
          font-size:16px; line-height:1.6; color:var(--gx-fg-muted);
          max-width:400px; margin:0 0 32px;
        }
        .fb-notes { list-style:none; margin:0; padding:0; border-top:1px solid var(--gx-line); }
        .fb-notes li {
          font-size:14px; line-height:1.5; color:var(--gx-fg-muted);
          padding:14px 0; border-bottom:1px solid var(--gx-line);
          display:grid; grid-template-columns:auto 1fr; gap:14px;
        }
        .fb-notes b {
          font-family:var(--gx-mono); font-size:12px; font-weight:400;
          color:var(--gx-fg-faint); padding-top:2px;
        }

        /* ── Form ── */
        .fb-panel {
          border:1px solid var(--gx-line);
          border-radius:var(--gx-r-lg);
          padding:28px;
          background:rgba(255,255,255,0.02);
        }
        .fb-panel-title {
          font-family:var(--gx-display); font-weight:400; font-size:26px;
          letter-spacing:-0.01em; color:var(--gx-fg); margin:0 0 6px;
        }
        .fb-panel-sub {
          font-size:14px; color:var(--gx-fg-muted); margin:0 0 24px; line-height:1.5;
        }

        .fb-form { display:flex; flex-direction:column; gap:18px; }
        .fb-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .fb-field { display:flex; flex-direction:column; gap:7px; min-width:0; }
        .fb-label-row { display:flex; align-items:baseline; justify-content:space-between; }
        .fb-label {
          font-family:var(--gx-mono); font-size:12px; letter-spacing:0;
          color:var(--gx-fg-faint);
        }
        .fb-count { font-family:var(--gx-mono); font-size:12px; color:var(--gx-fg-faint); }

        .fb-input {
          width:100%; box-sizing:border-box;
          background:var(--gx-bg);
          border:1px solid var(--gx-line);
          border-radius:var(--gx-r-md);
          color:var(--gx-fg);
          font-family:var(--gx-sans); font-size:15px;
          padding:11px 14px; outline:none;
          transition:border-color 0.18s;
        }
        .fb-input::placeholder { color:var(--gx-fg-faint); }
        .fb-input:focus { border-color:var(--gx-accent-line); }
        .fb-input.err { border-color:${ROSE}; }
        .fb-textarea { resize:vertical; line-height:1.55; }

        .fb-err { font-family:var(--gx-mono); font-size:12px; color:${ROSE}; }
        .fb-servererr {
          font-family:var(--gx-mono); font-size:13px; color:${ROSE};
          border:1px solid ${ROSE}55; border-radius:var(--gx-r-md);
          padding:10px 14px;
        }

        .fb-submit {
          align-self:flex-start;
          display:inline-flex; align-items:center; gap:10px;
          height:42px; padding:0 8px 0 18px;
          border:none; border-radius:var(--gx-r-md); cursor:pointer;
          background:var(--gx-accent); color:var(--gx-accent-ink);
          font-family:var(--gx-sans); font-size:15px; font-weight:500;
          transition:opacity 0.18s;
        }
        .fb-submit:hover:not(:disabled) { opacity:0.88; }
        .fb-submit:disabled { opacity:0.5; cursor:default; }
        .fb-submit-arrow {
          display:inline-flex; align-items:center; justify-content:center;
          width:26px; height:26px;
          border:1px solid rgba(12,12,10,0.30); border-radius:4px;
        }
        .fb-submit-arrow svg { transition:transform 0.25s cubic-bezier(.22,1,.36,1); }
        .fb-submit:hover:not(:disabled) .fb-submit-arrow svg { transform:translate(1.5px,-1.5px); }

        .fb-done { padding:32px 0; }
        .fb-done-title {
          font-family:var(--gx-display); font-weight:400; font-size:28px;
          color:var(--gx-fg); margin:0 0 10px; letter-spacing:-0.01em;
        }
        .fb-done-body {
          font-size:15px; color:var(--gx-fg-muted); line-height:1.6; margin:0; max-width:320px;
        }

        @media (max-width: 900px) {
          .fb-wrap { padding:64px 18px; }
          .fb-grid { grid-template-columns:1fr; gap:40px; }
        }
        @media (max-width: 520px) {
          .fb-row { grid-template-columns:1fr; }
          .fb-panel { padding:20px; }
        }
      `}</style>

      <section className="fb-sec" id="feedback">
        <div
          ref={sectionRef}
          className="fb-wrap"
          style={{
            opacity: vis ? 1 : 0,
            transform: vis ? "none" : "translateY(20px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div className="fb-eyebrow">
            <span className="r" />
            <span className="t">03 / feedback</span>
            <span className="r" />
          </div>

          <div className="fb-grid">
            {/* Left: the honest framing */}
            <div>
              <h2 className="fb-h2">
                No testimonials here.{" "}
                <span style={{ fontStyle: "italic" }}>Not yet.</span>
              </h2>
              <p className="fb-lede">
                Graphix is live but early. Nobody has used it long enough to
                have an opinion worth quoting, so there is nothing on this page
                pretending otherwise.
              </p>

              <ul className="fb-notes">
                <li>
                  <b>01</b>
                  <span>
                    Your message goes to the people building this, not a support
                    queue.
                  </span>
                </li>
                <li>
                  <b>02</b>
                  <span>
                    Leave an email and you get a reply from one of us.
                  </span>
                </li>
                <li>
                  <b>03</b>
                  <span>
                    Right now the roadmap is small enough that a single request
                    can move it.
                  </span>
                </li>
              </ul>
            </div>

            {/* Right: the form */}
            <div className="fb-panel">
              <h3 className="fb-panel-title">Tell us what&apos;s missing</h3>
              <p className="fb-panel-sub">
                Bugs, gaps, chart types we don&apos;t support yet. All of it
                helps.
              </p>
              <FeedbackForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
