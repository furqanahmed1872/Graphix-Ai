"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, z } from "zod";
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

// ── Reason card ───────────────────────────────────────────────
function ReasonCard({
  num,
  title,
  desc,
  delay,
}: {
  num: string;
  title: string;
  desc: string;
  delay: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="bg-[#090b0e] p-6 border-r border-b border-[#1e2227] last:border-r-0"
      style={{
        transition: `opacity 0.5s ease ${delay}, transform 0.5s ease ${delay}`,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(24px)",
      }}
    >
      <span className="font-syne font-extrabold text-[2rem] text-[#00d4c8] opacity-20 leading-none block mb-3">
        {num}
      </span>
      <h3 className="font-syne font-bold text-[0.95rem] text-white mb-2">
        {title}
      </h3>
      <p className="text-[#6b7280] text-[0.82rem] leading-[1.7]">{desc}</p>
    </div>
  );
}

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
      className="mt-8 border border-[#1e2227] p-6 text-center"
      style={{ animation: "fadeUp 0.4s ease both" }}
    >
      <p className="text-[#6b7280] text-[0.88rem] leading-[1.8] italic mb-3">
        &ldquo;{t.quote}&rdquo;
      </p>
      <span className="text-[0.72rem] uppercase tracking-widest text-[#00d4c8]">
        — {t.author}
      </span>
    </div>
  );
}

// ── Counter (animates to target number) ───────────────────────
function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [val, setVal] = useState(0);
  const startedRef = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const start = Date.now();
          const duration = 1400;
          const tick = () => {
            const p = Math.min((Date.now() - start) / duration, 1);
            setVal(Math.round(p * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

// ── Main export ───────────────────────────────────────────────
export default function FeedbackFormPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVis, setHeroVis] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVis(true), 100);
    return () => clearTimeout(t);
  }, []);

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
    `w-full bg-[#0d1014] border text-white text-[0.95rem] font-light px-5 py-4 outline-none placeholder-[#3a3f47] transition-all duration-200 focus:shadow-[0_0_0_2px_rgba(0,212,200,0.08)] resize-none ${
      hasError
        ? "border-red-500/60 focus:border-red-500"
        : "border-[#1e2227] focus:border-[#00d4c8]"
    }`;

  return (
    <div>
      {/* ── HERO ──────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="pt-24 pb-20 px-6 text-center border-b border-[#1e2227]"
        style={{ background: "#090b0e" }}
      >
        <div
          className="inline-block text-[0.7rem] uppercase tracking-[0.18em] text-[#00d4c8] border border-[#00d4c8]/30 px-4 py-1.5 mb-8"
          style={{
            opacity: heroVis ? 1 : 0,
            transition: "opacity 0.5s ease 0.1s",
          }}
        >
          Your voice shapes Graphix
        </div>

        <h1
          className="font-syne font-extrabold text-[clamp(2.4rem,5vw,4rem)] text-white leading-[1.1] tracking-tight mb-6"
          style={{
            opacity: heroVis ? 1 : 0,
            transform: heroVis ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s",
          }}
        >
          Tell us what you
          <br />
          <span className="text-[#00d4c8]">really think.</span>
        </h1>

        <p
          className="text-[#6b7280] max-w-[480px] mx-auto leading-[1.85] text-[0.95rem] mb-12"
          style={{
            opacity: heroVis ? 1 : 0,
            transform: heroVis ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
          }}
        >
          We&apos;re not asking out of habit. Every word you write lands in
          front of a real person and changes something real about this product.
        </p>

        {/* Stats row */}
        <div
          className="flex flex-wrap justify-center gap-px border border-[#1e2227] bg-[#1e2227]"
          style={{
            opacity: heroVis ? 1 : 0,
            transition: "opacity 0.6s ease 0.35s",
          }}
        >
          {[
            { num: 12000, suffix: "+", label: "teams trust us" },
            { num: 847, suffix: "", label: "requests shipped" },
            { num: 96, suffix: "+", label: "chart types built" },
            { num: 48, suffix: "h", label: "avg response time" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#090b0e] px-10 py-6 flex flex-col items-center gap-1.5 min-w-[140px]"
            >
              <span className="font-syne font-extrabold text-[1.9rem] text-white leading-none">
                <Counter target={s.num} suffix={s.suffix} />
              </span>
              <span className="text-[0.72rem] text-[#6b7280] uppercase tracking-[0.08em]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY FEEDBACK MATTERS ──────────────────────────── */}
      <section className="px-6 pb-24 max-w-[900px] mx-auto pt-20">
        <div className="text-center mb-12">
          <h2 className="font-syne font-extrabold text-[clamp(1.6rem,3vw,2.4rem)] text-white tracking-tight mb-3">
            Why your feedback
            <span className="text-[#00d4c8]"> actually matters.</span>
          </h2>
          <p className="text-[#6b7280] text-[0.9rem] max-w-[440px] mx-auto leading-relaxed">
            Not a survey. Not a box to check. Here&apos;s what happens when you
            hit send.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1e2227] border border-[#1e2227]">
          <ReasonCard
            num="01"
            delay="0s"
            title="We read every word"
            desc="Not a bot. Not a weekly digest. Your message lands directly in front of someone on the product team within hours."
          />
          <ReasonCard
            num="02"
            delay="0.1s"
            title="Your pain becomes our priority"
            desc="Every feature you see in Graphix today started as someone's frustration. Yours could be next."
          />
          <ReasonCard
            num="03"
            delay="0.2s"
            title="We reply — often"
            desc="Leave your email and there's a real chance you'll hear back personally. We've shipped features just from one reply."
          />
          <ReasonCard
            num="04"
            delay="0.3s"
            title="You speak for many"
            desc="When you share a pain point, you're almost certainly voicing what dozens of others felt but never said."
          />
        </div>
      </section>

      {/* ── FORM ─────────────────────────────────────────── */}
      <section className="px-6 pb-32">
        <div className="max-w-[560px] mx-auto">
          {submitted ? (
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
            <div style={{ animation: "fadeUp 0.5s ease 0.1s both" }}>
              <div className="w-full my-5 h-6 bg-[repeating-linear-gradient(-45deg,black_0px,white_5px,transparent_5px,transparent_10px)]" />

              <div className="mb-8 text-center">
                <h2 className="font-syne font-extrabold text-[1.6rem] text-white tracking-tight mb-2">
                  Ready to share?
                </h2>
                <p className="text-[#6b7280] text-[0.87rem]">
                  Three fields. Two minutes. Real impact.
                </p>
              </div>

              {/* Server-level error banner */}
              {serverError && (
                <div className="mb-4 border border-red-500/40 bg-red-500/10 text-red-400 text-[0.82rem] px-4 py-3">
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
                    <label className="text-[0.72rem] uppercase tracking-[0.1em] text-[#6b7280]">
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
                    <label className="text-[0.72rem] uppercase tracking-[0.1em] text-[#6b7280]">
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
                    <label className="text-[0.72rem] uppercase tracking-[0.1em] text-[#6b7280]">
                      Your Thoughts
                    </label>
                    <span className="text-[0.68rem] text-[#3a3f47]">
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
                  className="mt-2 w-full hover:cursor-pointer bg-[#00d4c8] text-[#090b0e] font-syne font-bold text-[0.82rem] uppercase tracking-widest py-4 hover:opacity-85 transition-opacity duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[#090b0e] border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send Feedback →"
                  )}
                </button>
              </form>

              <p className="text-[#3a3f47] text-[0.74rem] text-center mt-5 leading-relaxed">
                No spam. No follow-ups unless you want them. Just a small team
                that genuinely listens.
              </p>

              <TestimonialTicker />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
