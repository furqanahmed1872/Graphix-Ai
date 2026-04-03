"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getStoredToken, submitFeedback } from "@/lib/api";

// ── Validation schema (mirrors backend) ───────────────────────
const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  thoughts: z
    .string()
    .min(10, "Tell us a little more — at least 10 characters")
    .max(1000),
});

type FeedbackInput = z.infer<typeof feedbackSchema>;

// ── Testimonial ticker ────────────────────────────────────────
const testimonials = [
  {
    quote:
      "I left a note about the export flow. Three weeks later it was redesigned. Never happened with any other tool.",
    author: "Arya S., Growth Lead",
  },
  {
    quote:
      "Mentioned a missing chart type in passing. It shipped in the next update. These people actually listen.",
    author: "James K., Data Analyst",
  },
  {
    quote:
      "Got a personal reply from the founder within a day. Not a weekly digest. Your message lands directly in front of someone on the product team within hours.",
    author: "Priya M., Startup Founder",
  },
];

function TestimonialTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setIdx((i) => (i + 1) % testimonials.length),
      5000,
    );
    return () => clearInterval(id);
  }, []);

  const t = testimonials[idx];
  return (
    <div
      key={idx}
      className="mt-10 border border-white/10 p-6 text-center"
      style={{ animation: "fadeUp 0.4s ease both" }}
    >
      <p className="text-white/70 text-[0.88rem] leading-[1.8] italic mb-3">
        &ldquo;{t.quote}&rdquo;
      </p>
      <span className="text-[0.72rem] uppercase tracking-widest text-cyan-500">
        — {t.author}
      </span>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────
export default function FeedbackForm() {
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
      // Only grab token if user is logged in — never send "Bearer null"

      await submitFeedback(
        { name: data.name, email: data.email, thoughts: data.thoughts },
        token,
      );
      setSubmitted(true);
    } catch (err: unknown) {
      token
        ? setServerError("You must be logged in to submit feedback.")
        : setServerError(
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.",
          );
    }
  };

  const fieldCls = (hasError: boolean) =>
    `w-full bg-[#111212] border-2 text-white text-[0.95rem] font-light px-5 py-4 outline-none placeholder-[#3a3f47] transition-all duration-200 focus:shadow-[0_0_0_2px_rgba(0,212,200,0.08)] resize-none ${
      hasError
        ? "border-red-500/60 focus:border-red-500"
        : "border-[#1e2227] focus:border-[#00d4c8]"
    }`;

  return (
    <section
      style={{
        background: "#111212",
        backgroundImage: `linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)`,
        backgroundSize: "50px 50px",
      }}
    >
      <div className="max-w-[560px] mx-auto relative overflow-hidden px-6 py-24">
        {submitted ? (
          /* ── Success state ─────────────────────────────── */
          <div
            className="flex flex-col items-center gap-6 text-center py-12"
            style={{ animation: "fadeUp 0.5s ease both" }}
          >
            <div className="pulse-ring w-20 h-20 rounded-full border border-[#00d4c8] bg-[rgba(0,212,200,0.06)] flex items-center justify-center">
              <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
                <path
                  d="M5 14L11 20L23 8"
                  stroke="#00d4c8"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="30"
                  style={{ animation: "drawCheck 0.5s ease 0.2s both" }}
                />
              </svg>
            </div>
            <div>
              <h2 className="font-syne font-extrabold text-[2rem] text-white tracking-tight mb-3">
                Thank you.
              </h2>
              <p className="text-[#6b7280] text-[0.95rem] leading-[1.8] max-w-[380px]">
                Your thoughts just landed in a real inbox, in front of a real
                person who genuinely cares. We&apos;ll read every word.
              </p>
            </div>
          </div>
        ) : (
          /* ── Form state ────────────────────────────────── */
          <div style={{ animation: "fadeUp 0.5s ease 0.1s both" }}>
            <div className="mb-8 text-center">
              <h2 className="font-extrabold text-[1.6rem] text-white tracking-tight mb-2 bg-cyan-600 py-1">
                Share your feedback?
              </h2>
              <p className="text-white/70 text-[0.87rem]">
                Three fields. Two minutes. Real impact.
              </p>
            </div>

            {/* Server-level error banner */}
            {serverError && (
              <div className="mb-4 border border-red-500/40 bg-red-500/10 text-red-400 text-[0.82rem] px-4 py-3 rounded">
                {serverError}
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-[0.72rem] uppercase tracking-[0.1em] text-white/60">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Alex Chen"
                    autoComplete="name"
                    className={fieldCls(!!errors.name)}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-[0.72rem]">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className="text-[0.72rem] uppercase tracking-[0.1em] text-white/60">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    className={fieldCls(!!errors.email)}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-[0.72rem]">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Thoughts */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[0.72rem] uppercase tracking-[0.1em] text-white/60">
                    Your Thoughts
                  </label>
                  <span className="text-[0.68rem] text-white/50">
                    {thoughts.length} / 1000
                  </span>
                </div>
                <textarea
                  rows={6}
                  maxLength={1000}
                  placeholder="What's working? What isn't? What do you wish Graphix could do? Be as specific or as vague as you like — every word helps."
                  className={fieldCls(!!errors.thoughts)}
                  {...register("thoughts")}
                />
                {errors.thoughts && (
                  <p className="text-red-400 text-[0.72rem]">
                    {errors.thoughts.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full hover:cursor-pointer bg-cyan-600 text-white font-bold text-[0.82rem] uppercase tracking-widest py-4 hover:opacity-85 transition-opacity duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send Feedback →"
                )}
              </button>
            </form>

            <p className="text-white/50 text-[0.74rem] text-center mt-5 leading-relaxed">
              No spam. No follow-ups unless you want them. Just a small team
              that genuinely listens.
            </p>

            <TestimonialTicker />
          </div>
        )}
      </div>
    </section>
  );
}
