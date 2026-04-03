"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ── Scroll-reveal section ─────────────────────────────────
function Section({
  index,
  title,
  icon,
  id,
  children,
}: {
  index: string;
  title: string;
  icon?: string;
  id: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      id={id}
      ref={ref}
      className="border-t border-[#1e2227] pt-10 pb-12 grid grid-cols-[80px_1fr] gap-8 transition-all duration-700 scroll-mt-28"
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(28px)",
      }}
    >
      <div>
        <p className="text-[0.72rem] text-[rgba(255,255,255,0.18)] font-mono mb-2">
          {index} {icon && <span className="ml-1">{icon}</span>}
        </p>
      </div>
      <div>
        <h2 className="font-syne font-bold text-[1.5rem] mb-4">{title}</h2>
        <div className="text-[rgba(255,255,255,0.38)] text-[1rem] leading-[1.8] max-w-[680px]">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Data pill ─────────────────────────────────────────────
function DataPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#1e2227] bg-[rgba(255,255,255,0.02)] px-4 py-3 flex flex-col gap-0.5">
      <span className="text-[0.65rem] text-[rgba(255,255,255,0.25)] uppercase tracking-[0.1em]">
        {label}
      </span>
      <span className="text-white text-[0.85rem] font-syne font-semibold">
        {value}
      </span>
    </div>
  );
}

const tocItems = [
  { label: "Information We Collect", id: "collect" },
  { label: "How We Use It", id: "use" },
  { label: "Data Sharing", id: "sharing" },
  { label: "Cookies", id: "cookies" },
  { label: "Data Retention", id: "retention" },
  { label: "Your Rights", id: "rights" },
  { label: "Security", id: "security" },
  { label: "Children's Privacy", id: "children" },
  { label: "Third-Party Links", id: "thirdparty" },
  { label: "Changes", id: "changes" },
  { label: "Contact", id: "contact" },
];

export default function PrivacyPage() {
  const [heroVis, setHeroVis] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setHeroVis(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative min-h-screen text-white overflow-x-hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes diagMove {
          from { background-position:0 0; }
          to   { background-position:9px 0; }
        }
      `}</style>

      {/* ── NAV ── */}
    

      {/* ── HERO ── */}
      <section className="relative z-10 px-8 pt-24 pb-20 max-w-[980px] mx-auto">
        <div
          className="inline-flex items-center gap-2 border border-[rgba(255,255,255,0.1)] rounded-full px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] text-[rgba(255,255,255,0.4)] mb-8"
          style={{ opacity: heroVis ? 1 : 0, transition: "opacity 0.6s ease" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white opacity-40" />
          Legal · Last updated Jan 2025
        </div>

        <h1
          className="font-syne font-extrabold text-[clamp(3rem,7vw,5.5rem)] leading-[0.95] tracking-tight mb-6"
          style={{
            opacity: heroVis ? 1 : 0,
            transform: heroVis ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
          }}
        >
          Privacy 
          <span
            style={{
              color: "transparent",
              WebkitTextStroke: "1.5px rgba(255,255,255,0.55)",
            }}
          >
            "P0licy."
          </span>
        </h1>

        <p
          className="text-[rgba(255,255,255,0.38)] text-[1rem] leading-[1.8] max-w-[540px] mb-10"
          style={{
            opacity: heroVis ? 1 : 0,
            transition: "opacity 0.7s ease 0.25s",
          }}
        >
          Your data belongs to you. This policy explains exactly what we
          collect, why we collect it, and how you can take control of it at any
          time. No legalese. Just straight answers.
        </p>

        {/* Quick-glance data pills */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1e2227] border border-[#1e2227] mb-14"
          style={{
            opacity: heroVis ? 1 : 0,
            transition: "opacity 0.7s ease 0.35s",
          }}
        >
          <DataPill label="Data stored in" value="United States" />
          <DataPill label="Retention period" value="Up to 3 years" />
          <DataPill label="Sold to third parties" value="Never" />
          <DataPill label="Your data export" value="Available anytime" />
        </div>

        {/* Animated divider */}

        <div className="w-full my-5 h-6 bg-[repeating-linear-gradient(-45deg,black_0px,white_5px,transparent_5px,transparent_10px)]"></div>
      </section>

      {/* ── BODY ── */}
      <div className="relative z-10 max-w-[980px] mx-auto px-8 pb-32 flex gap-16">
        {/* Sticky TOC */}
        <aside className="hidden lg:block w-[180px] flex-shrink-0">
          <div className="sticky top-28 flex flex-col gap-1">
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-[rgba(255,255,255,0.2)] mb-3">
              Contents
            </p>
            {tocItems.map((item, i) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveIdx(i);
                  document
                    .getElementById(item.id)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="text-left text-[0.76rem] py-1.5 transition-colors duration-200 hover:cursor-pointer"
                style={{
                  color: activeIdx === i ? "white" : "rgba(255,255,255,0.28)",
                }}
              >
                <span className="text-[rgba(255,255,255,0.18)] mr-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Sections */}
        <main className="flex-1 min-w-0">
          <Section
            index="01"
            title="Information We Collect"
            icon="📥"
            id="collect"
          >
            <p>
              We collect information you provide directly — such as your name,
              email address, and any content you upload or create using Graphix.
              We also collect usage data automatically, including pages visited,
              features used, and interactions with the Service.
            </p>
            <p>
              When you connect third-party services, we may receive information
              from those providers in accordance with their privacy policies and
              your permission settings.
            </p>
          </Section>

          <Section
            index="02"
            title="How We Use Your Information"
            icon="⚙️"
            id="use"
          >
            <p>
              We use your data to provide, maintain, and improve the Service; to
              communicate with you about updates, features, and support; to
              personalize your experience; and to detect and prevent fraud or
              abuse.
            </p>
            <p>
              We process your data on legal bases including performance of our
              contract with you, our legitimate business interests, compliance
              with legal obligations, and — where required — your explicit
              consent.
            </p>
          </Section>

          <Section index="03" title="Data Sharing" icon="🔗" id="sharing">
            <p>
              We do not sell your personal data. We share information only with:
              (a) service providers who help us operate the Service under strict
              data processing agreements; (b) professional advisors bound by
              confidentiality; (c) law enforcement when required by law.
            </p>
            <p>
              If Graphix is acquired or merged, your data may transfer to the
              new entity, who will be bound by this Privacy Policy or provide
              you equivalent protections.
            </p>
          </Section>

          <Section index="04" title="Cookies & Tracking" icon="🍪" id="cookies">
            <p>
              We use cookies and similar technologies for authentication,
              preferences, analytics, and security. Essential cookies are
              required for the Service to function and cannot be disabled.
            </p>
            <p>
              You can manage non-essential cookies through your browser settings
              or our cookie preference center. Opting out of analytics cookies
              will not affect your access to the Service.
            </p>
          </Section>

          <Section index="05" title="Data Retention" icon="🗄️" id="retention">
            <p>
              We retain your data for as long as your account is active and for
              up to three years after closure to comply with legal obligations,
              resolve disputes, and enforce agreements.
            </p>
            <p>
              Backups may persist for up to 90 days after deletion. You can
              request immediate deletion of your data — see your rights below.
            </p>
          </Section>

          <Section index="06" title="Your Rights" icon="⚖️" id="rights">
            <p>
              Depending on your location, you may have the right to: access the
              personal data we hold about you; correct inaccurate data; request
              deletion of your data; object to or restrict processing; and data
              portability.
            </p>
            <div className="border border-[#1e2227] bg-[rgba(255,255,255,0.02)] p-4 mt-1">
              <p className="text-white text-[0.82rem] font-syne font-semibold mb-1">
                Exercise your rights
              </p>
              <p>
                Email <span className="text-white">privacy@graphix.io</span>{" "}
                with your request. We respond within 30 days. EU/UK users may
                also lodge complaints with their local data protection
                authority.
              </p>
            </div>
          </Section>

          <Section index="07" title="Security" icon="🔒" id="security">
            <p>
              We implement industry-standard security measures including
              encryption in transit (TLS) and at rest (AES-256), regular
              penetration testing, access controls, and security monitoring.
            </p>
            <p>
              No method of transmission over the internet is 100% secure. We
              will notify you and relevant authorities of any data breach as
              required by applicable law.
            </p>
          </Section>

          <Section
            index="08"
            title="Children's Privacy"
            icon="🛡️"
            id="children"
          >
            <p>
              Graphix is not directed to children under 16. We do not knowingly
              collect personal information from children. If we learn we have
              collected data from a child, we will delete it promptly.
            </p>
            <p>
              If you believe we have inadvertently collected information from a
              child, please contact us immediately at privacy@graphix.io.
            </p>
          </Section>

          <Section
            index="09"
            title="Third-Party Links"
            icon="🌐"
            id="thirdparty"
          >
            <p>
              The Service may contain links to third-party websites or services.
              This Privacy Policy does not apply to those sites. We encourage
              you to review the privacy policies of any third-party services you
              visit.
            </p>
            <p>
              We have no control over and assume no responsibility for the
              content, privacy policies, or practices of any third-party sites
              or services.
            </p>
          </Section>

          <Section
            index="10"
            title="Changes to This Policy"
            icon="📋"
            id="changes"
          >
            <p>
              We may update this Privacy Policy periodically. We'll notify you
              of material changes by updating the date at the top of this page
              and, where appropriate, by email.
            </p>
            <p>
              We encourage you to review this policy whenever you access the
              Service. Your continued use after changes take effect constitutes
              acceptance of the revised policy.
            </p>
          </Section>

          <Section index="11" title="Contact & DPO" icon="✉️" id="contact">
            <p>
              For privacy-related questions, data requests, or concerns about
              how we handle your information, reach our Privacy team directly.
              For EU users, we have a designated Data Protection Officer.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#1e2227] border border-[#1e2227] mt-2">
              <div className="bg-[rgba(9,11,14,0.9)] p-5">
                <p className="text-white text-[0.82rem] font-syne font-semibold mb-1">
                  Privacy Team
                </p>
                <p>privacy@graphix.io</p>
                <p className="mt-1">123 Data Street, Suite 400</p>
                <p>Wilmington, DE 19801</p>
              </div>
              <div className="bg-[rgba(9,11,14,0.9)] p-5">
                <p className="text-white text-[0.82rem] font-syne font-semibold mb-1">
                  EU / Data Protection Officer
                </p>
                <p>dpo@graphix.io</p>
                <p className="mt-1">Response within 30 days</p>
                <p>GDPR & UK GDPR compliant</p>
              </div>
            </div>
          </Section>
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1e2227] px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.75rem] text-[rgba(255,255,255,0.2)]">
        <span>© 2025 Graphix. All rights reserved.</span>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Use
          </Link>
          <Link href="/feedback" className="hover:text-white transition-colors">
            Feedback
          </Link>
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
