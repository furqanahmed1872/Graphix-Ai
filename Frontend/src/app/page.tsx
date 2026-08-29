"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/landing/Hero";
import "@/components/landing/system.css";

const LiveDemoSection = dynamic(() => import("@/components/landing/Section"), {
  ssr: false,
});
const HowItWorks = dynamic(() => import("@/components/landing/HowitWorks"));
const FeaturesSection = dynamic(() => import("@/components/landing/Features"));
const Feedback = dynamic(() => import("@/components/landing/Feedback"));
const PricingSection = dynamic(() => import("@/components/landing/Pricing"));
const CTA = dynamic(() => import("@/components/landing/CTA"));
const Footer = dynamic(() => import("@/components/landing/Footer"));

export default function Home() {
  // `gxl` scopes the landing system so the dark app shell is untouched.
  return (
    <div className="gxl">
      <Hero />
      <HowItWorks />
      <FeaturesSection />
      <LiveDemoSection />
      <PricingSection />
      <Feedback />
      <CTA />
      <Footer />
    </div>
  );
}
