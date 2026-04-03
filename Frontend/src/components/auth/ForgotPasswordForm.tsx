"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import AuthCard from "./ui/AuthCard";
import AuthInput from "./ui/AuthInput";
import AuthButton from "./ui/AuthButton";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});
type ForgotInput = z.infer<typeof forgotSchema>;

// ── Resend countdown ──────────────────────────────────────
function ResendButton({ email }: { email: string }) {
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setResending(false);
    setSent(true);
    setCooldown(60);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={cooldown > 0 || resending}
      className="w-full border border-[#1e2227] text-[0.82rem] py-3.5 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#3a3f47] text-white"
    >
      {resending ? (
        <>
          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Resending…
        </>
      ) : sent ? (
        <span className="text-[#00d4c8]">✓ Sent again</span>
      ) : cooldown > 0 ? (
        <span className="text-[#6b7280]">Resend in {cooldown}s</span>
      ) : (
        "Resend email"
      )}
    </button>
  );
}

// ── Main component ────────────────────────────────────────
export default function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotInput) => {
    setServerError(null);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      console.log("Reset for:", data.email);
      setSubmitted(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <AuthCard
      title={submitted ? "Check your inbox." : "Forgot password?"}
      subtitle={
        submitted
          ? `We sent a reset link to ${getValues("email")}. It expires in 15 minutes.`
          : "No worries. Enter your email and we'll send you a reset link right away."
      }
      footerText="Remembered it?"
      footerLinkLabel="Back to sign in"
      footerLinkHref="/signin"
    >
      {submitted ? (
        /* ── SUCCESS STATE ── */
        <div className="flex flex-col gap-4">
          {/* Animated check */}
          <div className="flex justify-center py-6">
            <div className="w-16 h-16 rounded-full border border-[#2a2f37] bg-[#0f1115] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M5 14L11 20L23 8"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="30"
                  strokeDashoffset="0"
                  style={{ animation: "drawCheck 0.5s ease 0.1s both" }}
                />
                <style>{`
                  @keyframes drawCheck {
                    from { stroke-dashoffset: 30; }
                    to   { stroke-dashoffset: 0;  }
                  }
                `}</style>
              </svg>
            </div>
          </div>

          {/* Hint cards */}
          <div className="border border-[#1e2227] divide-y divide-[#1e2227]">
            {[
              {
                icon: "📬",
                text: "Check your spam folder if you don't see it.",
              },
              { icon: "⏱", text: "The link expires in 15 minutes." },
              {
                icon: "🔁",
                text: "You can request a new link after 60 seconds.",
              },
            ].map((h) => (
              <div key={h.text} className="flex items-start gap-3 px-4 py-3">
                <span className="text-[0.9rem] mt-px">{h.icon}</span>
                <p className="text-[#6b7280] text-[0.82rem] leading-relaxed">
                  {h.text}
                </p>
              </div>
            ))}
          </div>

          <ResendButton email={getValues("email")} />
        </div>
      ) : (
        /* ── FORM STATE ── */
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-5"
        >
          <AuthInput
            label="Email address"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          {serverError && (
            <p className="text-red-400 text-[0.78rem] bg-red-500/10 border border-red-500/20 px-3 py-2">
              {serverError}
            </p>
          )}

          <div className="flex items-center gap-6 mt-1">
            <AuthButton
              loading={isSubmitting}
              label="Send Reset Link →"
              loadingLabel="Sending…"
            />
            <Link
              href="/signin"
              className="text-[0.82rem] text-[#6b7280] hover:text-white transition-colors whitespace-nowrap"
            >
              ← Back to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
