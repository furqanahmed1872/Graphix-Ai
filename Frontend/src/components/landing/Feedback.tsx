"use client";

/**
 * Feedback band. Submission logic is unchanged from the original:
 * react-hook-form + zod, posting through submitFeedback() with the
 * stored token when one exists.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getStoredToken, submitFeedback } from "@/lib/api";
import { Arrow } from "./Nav";

const feedbackSchema = z.object({
  name: z.string().min(2, "At least 2 characters").max(60),
  email: z.string().min(1, "Required").email("Enter a valid email"),
  thoughts: z.string().min(10, "At least 10 characters").max(1000),
});
type FeedbackInput = z.infer<typeof feedbackSchema>;

export default function Feedback() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackInput>({ resolver: zodResolver(feedbackSchema) });

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
    <section className="gxl-dark gxl-band" id="feedback">
      <div className="gxl-page">
        <span className="gxl-tag">Feedback</span>

        <div className="gxl-split gxl-split--top" style={{ marginTop: 26 }}>
          <div>
            <h2 className="gxl-d2" style={{ maxWidth: "11ch" }}>
              Tell us what&rsquo;s broken
            </h2>
            <p className="gxl-body" style={{ marginTop: 26 }}>
              Vague is fine — &ldquo;the legend looks wrong&rdquo; is a useful
              sentence. Most of the chart types in the library exist because
              somebody asked for one that was missing. Leave an email and
              there&rsquo;s a real chance a person replies.
            </p>
          </div>

          {submitted ? (
            <div style={{ border: "1px solid var(--hair)", padding: "34px 30px" }}>
              <span className="gxl-tag">Received</span>
              <h3 className="gxl-d3" style={{ margin: "18px 0 10px" }}>
                Thanks — it landed.
              </h3>
              <p className="gxl-body gxl-body--tight">
                If you left an email, expect a reply rather than a receipt.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="gxl-fb-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                <div>
                  <label className="gxl-lab" htmlFor="fb-name">Name</label>
                  <input id="fb-name" className="gxl-in" placeholder="Ada Lovelace" {...register("name")} />
                  {errors.name && <span className="gxl-err">{errors.name.message}</span>}
                </div>
                <div>
                  <label className="gxl-lab" htmlFor="fb-email">Email</label>
                  <input id="fb-email" className="gxl-in" type="email" placeholder="you@company.com" {...register("email")} />
                  {errors.email && <span className="gxl-err">{errors.email.message}</span>}
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <label className="gxl-lab" htmlFor="fb-msg">Message</label>
                <textarea id="fb-msg" className="gxl-ta" placeholder="The thing that annoyed you most…" {...register("thoughts")} />
                {errors.thoughts && <span className="gxl-err">{errors.thoughts.message}</span>}
              </div>

              {serverError && <span className="gxl-err" style={{ marginTop: 12 }}>{serverError}</span>}

              <button type="submit" className="gxl-btn" style={{ marginTop: 24 }} disabled={isSubmitting}>
                <span className="gxl-btn__label">{isSubmitting ? "Sending…" : "Send"}</span>
                <span className="gxl-btn__box"><Arrow /></span>
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 560px) {
          .gxl-fb-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
