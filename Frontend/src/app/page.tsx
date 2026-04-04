// src/app/page.tsx
import CTA from "@/components/landing/CTA";
import Feedback from "@/components/landing/Feedback";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowitWorks";
import PricingSection from "@/components/landing/Pricing";
import LiveDemoSection from "@/components/landing/Section";
import FeaturesSection from "@/components/landing/Features";

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-[#111212] mx-20 border-b border-x border-white/20">
      {/*
        ALTERNATING DARK / LIGHT FLOW:

        1. Hero          → DARK  #111212  — hook, 3D cube, trust bar
        2. Live Demo     → LIGHT #d4d4d4  — rotating real charts, proves it works
        3. How It Works  → DARK  #111212  — 4 scroll-activated steps with live visuals
        4. Features      → LIGHT #d4d4d4  — full feature grid + Excel editor callout
        5. Feedback      → DARK  #0d0e0e  — testimonials + feedback form
        6. Pricing       → DARK  #111212  — everything free, feature bars, ticker
        7. CTA           → DARK  #0a0a0a  — final push
        8. Footer        → DARK  #0a0a0a  — links, columns, legal
      */}

      <Hero />
      <LiveDemoSection />
      <HowItWorks />
      <FeaturesSection />
      <Feedback />
      <PricingSection />
      <CTA />
      <Footer />
    </div>
  );
}
