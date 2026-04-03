"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ── Section with scroll reveal ────────────────────────────
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

// ── Sticky TOC item ───────────────────────────────────────
const tocItems = [
  { label: "Acceptance", id: "acceptance" },
  { label: "Use of Service", id: "use" },
  { label: "Accounts", id: "accounts" },
  { label: "Intellectual Property", id: "ip" },
  { label: "Prohibited Conduct", id: "prohibited" },
  { label: "Termination", id: "termination" },
  { label: "Disclaimers", id: "disclaimers" },
  { label: "Limitation of Liability", id: "liability" },
  { label: "Governing Law", id: "governing" },
  { label: "Changes", id: "changes" },
  { label: "Contact", id: "contact" },
];

export default function TermsPage() {
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
          Terms of{" "}
          "<span
            style={{
              color: "transparent",
              WebkitTextStroke: "1.5px rgba(255,255,255,0.55)",
            }}
          >
            Use.
          </span>"
        </h1>

        <p
          className="text-[rgba(255,255,255,0.38)] text-[1rem] leading-[1.8] max-w-[520px]"
          style={{
            opacity: heroVis ? 1 : 0,
            transition: "opacity 0.7s ease 0.25s",
          }}
        >
          These terms govern your access to and use of Graphix. By using our
          platform, you agree to be bound by everything below. Please read it —
          we've kept it human.
        </p>

        {/* Animated divider */}

        <div className="w-full my-5 h-6 bg-[repeating-linear-gradient(-45deg,black_0px,white_5px,transparent_5px,transparent_10px)]"></div>
      </section>

      {/* ── BODY: TOC + CONTENT ── */}
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
                className="text-left text-[0.76rem] py-1.5 transition-colors duration-200 hover:cursor-pointer hover:text-white"
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
          <Section index="01" title="Acceptance of Terms" id="acceptance">
            <p>
              By accessing or using Graphix ("Service"), you confirm that you
              are at least 18 years old, have read these Terms, and agree to be
              bound by them. If you're using Graphix on behalf of an
              organization, you represent that you have authority to bind that
              organization.
            </p>
            <p>
              If you do not agree with any part of these terms, you do not have
              permission to access or use the Service.
            </p>
          </Section>

          <Section index="02" title="Use of Service" id="use">
            <p>
              Graphix grants you a limited, non-exclusive, non-transferable
              license to access and use the Service for your internal business
              or personal purposes, subject to these Terms.
            </p>
            <p>
              You may not sublicense, sell, resell, transfer, assign, or
              otherwise commercially exploit the Service. You may not frame or
              mirror any content without our prior written consent.
            </p>
          </Section>

          <Section index="03" title="Accounts & Responsibilities" id="accounts">
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activity that occurs under your
              account. Notify us immediately at security@graphix.io if you
              suspect unauthorized access.
            </p>
            <p>
              You agree to provide accurate, current, and complete information
              during registration and keep it updated. Accounts found to be
              using false information may be suspended without notice.
            </p>
          </Section>

          <Section index="04" title="Intellectual Property" id="ip">
            <p>
              All content, features, and functionality of the Service —
              including but not limited to text, graphics, logos, and software —
              are owned by Graphix and protected by intellectual property laws.
            </p>
            <p>
              You retain ownership of data you submit to the Service. By
              submitting content, you grant Graphix a worldwide, royalty-free
              license to use, process, and display that content solely to
              provide the Service to you.
            </p>
          </Section>

          <Section index="05" title="Prohibited Conduct" id="prohibited">
            <p>
              You agree not to: (a) violate any applicable laws or regulations;
              (b) infringe upon the rights of others; (c) upload malicious code
              or interfere with the integrity or performance of the Service; (d)
              attempt to gain unauthorized access to any system or network.
            </p>
            <p>
              We reserve the right to investigate and take appropriate action
              against anyone who, in our sole discretion, violates these
              provisions, including suspending or terminating accounts.
            </p>
          </Section>

          <Section index="06" title="Termination" id="termination">
            <p>
              You may stop using the Service at any time. We may terminate or
              suspend your access immediately, without prior notice, if you
              breach these Terms.
            </p>
            <p>
              Upon termination, your right to use the Service will cease
              immediately. Provisions that by their nature should survive
              termination will survive, including ownership provisions, warranty
              disclaimers, and limitations of liability.
            </p>
          </Section>

          <Section index="07" title="Disclaimers" id="disclaimers">
            <p>
              The Service is provided "as is" and "as available" without
              warranties of any kind, either express or implied. We do not
              warrant that the Service will be uninterrupted, error-free, or
              completely secure.
            </p>
            <p>
              We make no warranty that the results obtained from use of the
              Service will be accurate or reliable, or that the quality of any
              data obtained through the Service will meet your expectations.
            </p>
          </Section>

          <Section index="08" title="Limitation of Liability" id="liability">
            <p>
              To the maximum extent permitted by applicable law, Graphix shall
              not be liable for any indirect, incidental, special,
              consequential, or punitive damages — including loss of profits,
              data, goodwill, or other intangible losses — resulting from your
              use of or inability to use the Service.
            </p>
            <p>
              Our total liability to you for all claims arising out of or
              relating to these Terms or the Service shall not exceed the
              greater of $100 USD or the amount you paid Graphix in the twelve
              months preceding the claim.
            </p>
          </Section>

          <Section index="09" title="Governing Law" id="governing">
            <p>
              These Terms shall be governed by the laws of the State of
              Delaware, without regard to its conflict of law provisions. Any
              disputes arising under these Terms shall be resolved exclusively
              in the state or federal courts located in Delaware.
            </p>
            <p>
              You waive any objection to jurisdiction or venue in such courts.
              If any provision of these Terms is found to be unenforceable, the
              remaining provisions will remain in full force and effect.
            </p>
          </Section>

          <Section index="10" title="Changes to Terms" id="changes">
            <p>
              We reserve the right to modify these Terms at any time. We'll
              provide notice of significant changes by updating the date at the
              top of this page and, where appropriate, notifying you by email.
            </p>
            <p>
              Your continued use of the Service after changes take effect
              constitutes your acceptance of the new Terms. If you don't agree
              to the updated terms, please stop using the Service.
            </p>
          </Section>

          <Section index="11" title="Contact Us" id="contact">
            <p>
              If you have questions about these Terms, please reach out to our
              legal team. We're real people and we'll actually respond.
            </p>
            <div className="mt-2 border border-[#1e2227] bg-[rgba(255,255,255,0.02)] p-5 flex flex-col gap-1">
              <p className="text-white text-[0.85rem] font-syne font-semibold">
                Graphix Legal
              </p>
              <p>legal@graphix.io</p>
              <p>123 Data Street, Suite 400, Wilmington, DE 19801</p>
            </div>
          </Section>
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1e2227] px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.75rem] text-[rgba(255,255,255,0.2)]">
        <span>© 2025 Graphix. All rights reserved.</span>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
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
