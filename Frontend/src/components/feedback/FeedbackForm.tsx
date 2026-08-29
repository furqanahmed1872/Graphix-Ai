"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getStoredToken, submitFeedback } from "@/lib/api";

/* The previous version of this page ran a ticker of testimonials with
   invented authors, on a third palette (#00d4c8 teal, font-syne) that matched
   nothing else on the site. Graphix has no users to quote, so the page is now
   the form plus a straight account of where the message goes. */

const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  thoughts: z
    .string()
    .min(10, "Tell us a little more, at least 10 characters")
    .max(1000),
});
type FeedbackInput = z.infer<typeof feedbackSchema>;

const ROSE = "#FF6B8A";

const REASONS = [
  {
    num: "01",
    title: "It reaches the people building it",
    desc: "There is no support tier to escalate through. What you write is read by whoever is going to act on it.",
  },
  {
    num: "02",
    title: "You get a real reply",
    desc: "Leave an email and one of us answers you directly, not a templated acknowledgement.",
  },
  {
    num: "03",
    title: "The roadmap is still small",
    desc: "Graphix is early enough that a single well-argued request can genuinely reorder what gets built next.",
  },
];

export default function FeedbackPageForm() {
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

  return (
    <>
      <style>{`
        .fbp-sec { background: var(--gx-bg); min-height: 100vh; }
        .fbp-wrap { max-width: 1100px; margin: 0 auto; padding: 88px 24px 104px; }

        .fbp-eyebrow { display:flex; align-items:center; gap:12px; margin-bottom:24px; }
        .fbp-eyebrow .r { height:1px; width:32px; background:var(--gx-line-strong); }
        .fbp-eyebrow .t { font-family:var(--gx-mono); font-size:12px; color:var(--gx-fg-faint); }

        .fbp-h1 {
          font-family:var(--gx-display); font-weight:400;
          font-size:clamp(2.6rem,5.4vw,4.2rem); line-height:1.06;
          letter-spacing:-0.015em; color:var(--gx-fg); margin:0 0 20px;
        }
        .fbp-lede {
          font-size:17px; line-height:1.6; color:var(--gx-fg-muted);
          max-width:520px; margin:0 0 64px;
        }

        .fbp-grid {
          display:grid; grid-template-columns: 0.85fr 1.15fr; gap:64px;
          align-items:start;
        }

        .fbp-reasons { list-style:none; margin:0; padding:0; border-top:1px solid var(--gx-line); }
        .fbp-reasons li { padding:22px 0; border-bottom:1px solid var(--gx-line); }
        .fbp-rnum {
          font-family:var(--gx-mono); font-size:12px; color:var(--gx-fg-faint);
          display:block; margin-bottom:8px;
        }
        .fbp-rtitle {
          font-family:var(--gx-display); font-weight:400; font-size:21px;
          letter-spacing:-0.01em; color:var(--gx-fg); margin:0 0 7px;
        }
        .fbp-rdesc { font-size:14px; line-height:1.6; color:var(--gx-fg-muted); margin:0; }

        /* ── Form ── */
        .fbp-panel {
          border:1px solid var(--gx-line);
          border-radius:var(--gx-r-lg);
          padding:32px;
          background:rgba(255,255,255,0.02);
        }
        .fbp-ptitle {
          font-family:var(--gx-display); font-weight:400; font-size:27px;
          letter-spacing:-0.01em; color:var(--gx-fg); margin:0 0 6px;
        }
        .fbp-psub { font-size:14px; color:var(--gx-fg-muted); margin:0 0 26px; line-height:1.5; }

        .fbp-form { display:flex; flex-direction:column; gap:18px; }
        .fbp-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .fbp-field { display:flex; flex-direction:column; gap:7px; min-width:0; }
        .fbp-labelrow { display:flex; align-items:baseline; justify-content:space-between; }
        .fbp-label { font-family:var(--gx-mono); font-size:12px; color:var(--gx-fg-faint); }
        .fbp-count { font-family:var(--gx-mono); font-size:12px; color:var(--gx-fg-faint); }

        .fbp-input {
          width:100%; box-sizing:border-box;
          background:var(--gx-bg);
          border:1px solid var(--gx-line);
          border-radius:var(--gx-r-md);
          color:var(--gx-fg);
          font-family:var(--gx-sans); font-size:15px;
          padding:11px 14px; outline:none;
          transition:border-color 0.18s;
        }
        .fbp-input::placeholder { color:var(--gx-fg-faint); }
        .fbp-input:focus { border-color:var(--gx-accent-line); }
        .fbp-input.err { border-color:${ROSE}; }
        .fbp-textarea { resize:vertical; line-height:1.55; }

        .fbp-err { font-family:var(--gx-mono); font-size:12px; color:${ROSE}; }
        .fbp-servererr {
          font-family:var(--gx-mono); font-size:13px; color:${ROSE};
          border:1px solid ${ROSE}55; border-radius:var(--gx-r-md); padding:10px 14px;
        }

        .fbp-submit {
          align-self:flex-start;
          display:inline-flex; align-items:center; gap:10px;
          height:44px; padding:0 8px 0 20px;
          border:none; border-radius:var(--gx-r-md); cursor:pointer;
          background:var(--gx-accent); color:var(--gx-accent-ink);
          font-family:var(--gx-sans); font-size:15px; font-weight:500;
          transition:opacity 0.18s;
        }
        .fbp-submit:hover:not(:disabled) { opacity:0.88; }
        .fbp-submit:disabled { opacity:0.5; cursor:default; }
        .fbp-arrow {
          display:inline-flex; align-items:center; justify-content:center;
          width:28px; height:28px;
          border:1px solid rgba(12,12,10,0.30); border-radius:4px;
        }
        .fbp-arrow svg { transition:transform 0.25s cubic-bezier(.22,1,.36,1); }
        .fbp-submit:hover:not(:disabled) .fbp-arrow svg { transform:translate(1.5px,-1.5px); }

        .fbp-done { padding:24px 0; }
        .fbp-done h3 {
          font-family:var(--gx-display); font-weight:400; font-size:30px;
          letter-spacing:-0.01em; color:var(--gx-fg); margin:0 0 12px;
        }
        .fbp-done p {
          font-size:15px; line-height:1.6; color:var(--gx-fg-muted);
          margin:0; max-width:340px;
        }

        @media (max-width: 900px) {
          .fbp-wrap { padding:64px 18px 80px; }
          .fbp-grid { grid-template-columns:1fr; gap:44px; }
          .fbp-lede { margin-bottom:44px; }
        }
        @media (max-width: 520px) {
          .fbp-row { grid-template-columns:1fr; }
          .fbp-panel { padding:22px; }
        }
      `}</style>

      <section className="fbp-sec">
        <div className="fbp-wrap">
          <div className="fbp-eyebrow">
            <span className="r" />
            <span className="t">feedback</span>
          </div>

          <h1 className="fbp-h1">
            Tell us what Graphix
            <br />
            <span style={{ fontStyle: "italic" }}>gets wrong.</span>
          </h1>
          <p className="fbp-lede">
            The product is early and we would rather hear the blunt version now
            than the polite version later. Bugs, missing chart types, anything
            that made you give up halfway.
          </p>

          <div className="fbp-grid">
            {/* Left: what happens to it */}
            <ul className="fbp-reasons">
              {REASONS.map((r) => (
                <li key={r.num}>
                  <span className="fbp-rnum">{r.num}</span>
                  <h2 className="fbp-rtitle">{r.title}</h2>
                  <p className="fbp-rdesc">{r.desc}</p>
                </li>
              ))}
            </ul>

            {/* Right: the form */}
            <div className="fbp-panel">
              {submitted ? (
                <div className="fbp-done">
                  <h3>Thank you.</h3>
                  <p>
                    That went straight to the team. If you left an email
                    we&apos;ll reply to it ourselves.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="fbp-ptitle">Send it over</h3>
                  <p className="fbp-psub">
                    No account needed. Nothing here goes to a mailing list.
                  </p>

                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="fbp-form"
                  >
                    {serverError && (
                      <div className="fbp-servererr">{serverError}</div>
                    )}

                    <div className="fbp-row">
                      <div className="fbp-field">
                        <label className="fbp-label" htmlFor="fbp-name">
                          Name
                        </label>
                        <input
                          id="fbp-name"
                          className={`fbp-input${errors.name ? " err" : ""}`}
                          placeholder="Your name"
                          {...register("name")}
                        />
                        {errors.name && (
                          <span className="fbp-err">{errors.name.message}</span>
                        )}
                      </div>

                      <div className="fbp-field">
                        <label className="fbp-label" htmlFor="fbp-email">
                          Email
                        </label>
                        <input
                          id="fbp-email"
                          className={`fbp-input${errors.email ? " err" : ""}`}
                          placeholder="you@company.com"
                          {...register("email")}
                        />
                        {errors.email && (
                          <span className="fbp-err">
                            {errors.email.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="fbp-field">
                      <div className="fbp-labelrow">
                        <label className="fbp-label" htmlFor="fbp-thoughts">
                          What&apos;s on your mind
                        </label>
                        <span className="fbp-count">
                          {thoughts.length}/1000
                        </span>
                      </div>
                      <textarea
                        id="fbp-thoughts"
                        rows={7}
                        className={`fbp-input fbp-textarea${
                          errors.thoughts ? " err" : ""
                        }`}
                        placeholder="What broke, what's missing, what you expected to happen instead."
                        {...register("thoughts")}
                      />
                      {errors.thoughts && (
                        <span className="fbp-err">
                          {errors.thoughts.message}
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="fbp-submit"
                      disabled={isSubmitting}
                    >
                      <span>{isSubmitting ? "Sending…" : "Send it"}</span>
                      <span className="fbp-arrow" aria-hidden="true">
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
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
