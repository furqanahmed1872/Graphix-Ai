"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getStoredToken, submitFeedback } from "@/lib/api";

// ── Schema ────────────────────────────────────────────────────
const feedbackSchema = z.object({
  name: z.string().min(2, "At least 2 characters").max(60),
  email: z.string().min(1, "Required").email("Enter a valid email"),
  thoughts: z.string().min(10, "At least 10 characters").max(1000),
});
type FeedbackInput = z.infer<typeof feedbackSchema>;

// ── Testimonials ──────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote:
      "I left a note about the export flow. Three weeks later it was redesigned. Never happened with any other tool.",
    author: "Arya S.",
    role: "Growth Lead",
    stars: 5,
  },
  {
    quote:
      "Mentioned a missing chart type in passing. It shipped in the next update. These people actually listen.",
    author: "James K.",
    role: "Data Analyst",
    stars: 5,
  },
  {
    quote:
      "Got a personal reply from the founder within a day. Your message lands directly in front of someone who cares.",
    author: "Priya M.",
    role: "Startup Founder",
    stars: 5,
  },
  {
    quote:
      "The 3D charts work in the browser. No plugins, no crashes. That alone sold me.",
    author: "Chen W.",
    role: "Data Scientist",
    stars: 5,
  },
  {
    quote:
      "Went from raw CSV to a board-ready chart in under 2 minutes. Nothing else comes close.",
    author: "Sarah O.",
    role: "Product Manager",
    stars: 5,
  },
  {
    quote:
      "The visual editor is what makes it. I can match our brand colors without touching a config file.",
    author: "Marcus T.",
    role: "Marketing Lead",
    stars: 5,
  },
];

function Stars({ n }: { n: number }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          style={{
            color: "#fbbf24",
            fontSize: 12,
            textShadow: "0 0 4px rgba(251,191,36,0.3)",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function TestimonialCard({
  t,
  index,
  visible,
}: {
  t: (typeof TESTIMONIALS)[0];
  index: number;
  visible: boolean;
}) {
  return (
    <div
      className="testimonial-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) ${index * 0.06}s, transform 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1) ${index * 0.06}s`,
        background:
          "linear-gradient(135deg, rgba(20,21,21,0.95) 0%, rgba(16,17,17,0.98) 100%)",
        backdropFilter: "blur(2px)",
        border: "1px solid rgba(6,182,212,0.12)",
        borderRadius: 20,
        padding: "24px 22px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transitionProperty: "all",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(6,182,212,0.35)";
        e.currentTarget.style.boxShadow =
          "0 12px 28px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(6,182,212,0.2)";
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(6,182,212,0.12)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <Stars n={t.stars} />
      <p
        style={{
          fontSize: 13.5,
          color: "rgba(255,255,255,0.75)",
          lineHeight: 1.65,
          margin: 0,
          fontStyle: "normal",
          fontWeight: 400,
        }}
      >
        “{t.quote}”
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: "auto",
          paddingTop: 8,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #06b6d4, #c084fc)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(6,182,212,0.3)",
          }}
        >
          {t.author[0]}
        </div>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              letterSpacing: "-0.2px",
            }}
          >
            {t.author}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
              fontFamily: "monospace",
              letterSpacing: "0.2px",
            }}
          >
            {t.role}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feedback Form ──────────────────────────────────────────────
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

  const fieldStyle = (hasErr: boolean): React.CSSProperties => ({
    width: "100%",
    background: "#0a0b0b",
    border: `1.5px solid ${hasErr ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.08)"}`,
    borderRadius: 12,
    color: "#fff",
    fontSize: 13,
    padding: "12px 16px",
    outline: "none",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  });

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05))",
            border: "1px solid rgba(6,182,212,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            animation: "checkPulse 0.6s ease-out",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 10,
            letterSpacing: "-0.3px",
          }}
        >
          Thank you.
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.7,
            maxWidth: 260,
            margin: "0 auto",
          }}
        >
          Your thoughts just landed in a real inbox. We'll read every word.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: 18 }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.5)",
              display: "block",
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            Name
          </label>
          <input
            type="text"
            placeholder="Alex Chen"
            style={fieldStyle(!!errors.name)}
            {...register("name")}
            onFocus={(e) => {
              e.target.style.borderColor = "#06b6d4";
              e.target.style.boxShadow = "0 0 0 3px rgba(6,182,212,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.name
                ? "rgba(239,68,68,0.6)"
                : "rgba(255,255,255,0.08)";
              e.target.style.boxShadow = "none";
            }}
          />
          {errors.name && (
            <p
              style={{
                color: "#f87171",
                fontSize: 10,
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <label
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.5)",
              display: "block",
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            Email
          </label>
          <input
            type="email"
            placeholder="you@company.com"
            style={fieldStyle(!!errors.email)}
            {...register("email")}
            onFocus={(e) => {
              e.target.style.borderColor = "#06b6d4";
              e.target.style.boxShadow = "0 0 0 3px rgba(6,182,212,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.email
                ? "rgba(239,68,68,0.6)"
                : "rgba(255,255,255,0.08)";
              e.target.style.boxShadow = "none";
            }}
          />
          {errors.email && (
            <p
              style={{
                color: "#f87171",
                fontSize: 10,
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <label
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.5)",
              fontWeight: 500,
            }}
          >
            Your thoughts
          </label>
          <span
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              color:
                thoughts.length > 900
                  ? "rgba(245,158,11,0.7)"
                  : "rgba(255,255,255,0.3)",
              transition: "color 0.2s",
            }}
          >
            {thoughts.length}/1000
          </span>
        </div>
        <textarea
          rows={4}
          maxLength={1000}
          placeholder="What's working? What isn't? What do you wish Graphix could do?"
          style={{
            ...fieldStyle(!!errors.thoughts),
            resize: "vertical",
            fontFamily: "inherit",
          }}
          {...register("thoughts")}
          onFocus={(e) => {
            e.target.style.borderColor = "#06b6d4";
            e.target.style.boxShadow = "0 0 0 3px rgba(6,182,212,0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = errors.thoughts
              ? "rgba(239,68,68,0.6)"
              : "rgba(255,255,255,0.08)";
            e.target.style.boxShadow = "none";
          }}
        />
        {errors.thoughts && (
          <p
            style={{
              color: "#f87171",
              fontSize: 10,
              marginTop: 6,
              fontWeight: 500,
            }}
          >
            {errors.thoughts.message}
          </p>
        )}
      </div>

      {serverError && (
        <p
          style={{
            color: "#f87171",
            fontSize: 11,
            padding: "10px 14px",
            background: "rgba(239,68,68,0.1)",
            borderRadius: 10,
            border: "1px solid rgba(239,68,68,0.25)",
            backdropFilter: "blur(4px)",
          }}
        >
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          height: 50,
          background: "linear-gradient(135deg, #06b6d4, #0891b2)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          border: "none",
          borderRadius: 12,
          cursor: isSubmitting ? "not-allowed" : "pointer",
          opacity: isSubmitting ? 0.7 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          transition: "all 0.25s ease",
          boxShadow: "0 4px 12px rgba(6,182,212,0.25)",
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(6,182,212,0.35)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(6,182,212,0.25)";
        }}
      >
        {isSubmitting ? (
          <>
            <span
              style={{
                width: 16,
                height: 16,
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                animation: "fb-spin 0.8s linear infinite",
              }}
            />
            Sending…
          </>
        ) : (
          "Send Feedback →"
        )}
      </button>

      <p
        style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.2)",
          textAlign: "center",
          fontFamily: "monospace",
          marginTop: 4,
        }}
      >
        No spam. No follow-ups unless you want them.
      </p>
    </form>
  );
}

// ── Main export ───────────────────────────────────────────────
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
        @keyframes fb-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes checkPulse {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .testimonial-card {
          transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
      `}</style>

      <section
        style={{
          background: "radial-gradient(ellipse at 30% 40%, #111314, #080909)",
          padding: "110px 0 100px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "-15%",
            left: "-10%",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%)",
            borderRadius: "50%",
            filter: "blur(80px)",
            pointerEvents: "none",
            animation: "gradientShift 12s ease infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-5%",
            width: "550px",
            height: "550px",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.1), transparent 70%)",
            borderRadius: "50%",
            filter: "blur(90px)",
            pointerEvents: "none",
          }}
        />

        {/* Refined grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(6,182,212,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.02) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            pointerEvents: "none",
          }}
        />

        <div
          ref={sectionRef}
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 32px",
            position: "relative",
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 64,
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(30px)",
              transition:
                "opacity 0.7s cubic-bezier(0.2, 0.9, 0.4, 1.1), transform 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 18px",
                borderRadius: 100,
                border: "1px solid rgba(6,182,212,0.25)",
                background: "rgba(6,182,212,0.06)",
                backdropFilter: "blur(8px)",
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#06b6d4",
                  display: "inline-block",
                  boxShadow: "0 0 6px #06b6d4",
                }}
              />
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#06b6d4",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                What users say
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                fontWeight: 800,
                background: "linear-gradient(135deg, #ffffff 30%, #94a3b8 80%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                margin: "0 0 16px",
              }}
            >
              Real feedback. Real impact.
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.4)",
                maxWidth: 480,
                margin: "0 auto",
                lineHeight: 1.7,
                fontWeight: 400,
              }}
            >
              Every feature in Graphix started as someone's frustration. Here's
              what they said after.
            </p>
          </div>

          {/* Two-column layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 420px",
              gap: 48,
              alignItems: "start",
            }}
          >
            {/* Testimonial grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 18,
              }}
            >
              {TESTIMONIALS.map((t, i) => (
                <TestimonialCard key={i} t={t} index={i} visible={vis} />
              ))}
            </div>

            {/* Feedback form - glassmorphism style */}
            <div
              style={{
                opacity: vis ? 1 : 0,
                transform: vis ? "translateY(0)" : "translateY(30px)",
                transition:
                  "opacity 0.7s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.2s, transform 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.2s",
                position: "sticky",
                top: 100,
              }}
            >
              <div
                style={{
                  background: "rgba(18, 19, 20, 0.75)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(6,182,212,0.15)",
                  borderRadius: 24,
                  overflow: "hidden",
                  boxShadow: "0 25px 40px -12px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  style={{
                    padding: "28px 28px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    background:
                      "linear-gradient(135deg, rgba(6,182,212,0.05), transparent)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #fff, #cbd5e1)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      marginBottom: 6,
                      letterSpacing: "-0.3px",
                    }}
                  >
                    Share your feedback
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.4)",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    Three fields. Two minutes. Your words shape the next
                    release.
                  </p>
                </div>
                <div style={{ padding: "28px" }}>
                  <FeedbackForm />
                </div>
              </div>

              {/* Mini why-it-matters - enhanced */}
              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {[
                  {
                    icon: "📬",
                    title: "We read every word",
                    desc: "No bot. A real person reads your message within hours.",
                  },
                  {
                    icon: "💬",
                    title: "We reply — often",
                    desc: "Leave your email. There's a real chance you'll hear back.",
                  },
                  {
                    icon: "🚀",
                    title: "Features ship from feedback",
                    desc: "Every chart type you see today started as someone's request.",
                  },
                ].map((item, idx) => (
                  <div
                    key={item.title}
                    style={{
                      display: "flex",
                      gap: 14,
                      padding: "12px 16px",
                      background: "rgba(20, 21, 21, 0.6)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.04)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(6,182,212,0.2)";
                      e.currentTarget.style.background =
                        "rgba(25, 26, 27, 0.7)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.04)";
                      e.currentTarget.style.background =
                        "rgba(20, 21, 21, 0.6)";
                    }}
                  >
                    <span
                      style={{
                        fontSize: 20,
                        flexShrink: 0,
                        lineHeight: 1,
                      }}
                    >
                      {item.icon}
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.85)",
                          marginBottom: 4,
                          letterSpacing: "-0.2px",
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.4)",
                          lineHeight: 1.45,
                        }}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust badge */}
              <div
                style={{
                  marginTop: 16,
                  textAlign: "center",
                  padding: "8px 12px",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(6,182,212,0.08)",
                    padding: "4px 12px",
                    borderRadius: 100,
                    border: "1px solid rgba(6,182,212,0.15)",
                  }}
                >
                  <span style={{ fontSize: 10, color: "#06b6d4" }}>✦</span>
                  <span
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: "monospace",
                    }}
                  >
                    trusted by 2,000+ teams
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
