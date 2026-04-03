// src/app/page.tsx
import CtaSection from "@/components/about/CtaSection";
import CTA from "@/components/landing/CTA";
import Feedback from "@/components/landing/Feedback";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowitWorks";
import PricingSection from "@/components/landing/Pricing";
import HeroSection from "@/components/landing/Section";

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-[#111212] mx-20 border-b border-x  border-white/20">
      <Hero />
      <HeroSection />
      <HowItWorks />
      <PricingSection />
      <Feedback />
      <CTA />
      <Footer />
    </div>
  );
}
