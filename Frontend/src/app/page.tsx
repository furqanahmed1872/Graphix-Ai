"use client";
import dynamic from "next/dynamic";
import Hero from "@/components/landing/Hero";
import { use, useEffect } from "react";

const LiveDemoSection = dynamic(() => import("@/components/landing/Section"), {
  ssr: false,
});
const HowItWorks = dynamic(() => import("@/components/landing/HowitWorks"), {
  ssr: false,
});
const FeaturesSection = dynamic(() => import("@/components/landing/Features"));
const Feedback = dynamic(() => import("@/components/landing/Feedback"));
const PricingSection = dynamic(() => import("@/components/landing/Pricing"));
const CTA = dynamic(() => import("@/components/landing/CTA"));
const Footer = dynamic(() => import("@/components/landing/Footer"));

export default function Home() {

  useEffect(() => {
    console.log("Home page loaded");
   }, []);

  return (
    // NO mx-20, NO border-x on mobile. On desktop only: side margins + borders.
    <div
      style={{
        background: "#0C0C0A",
        position: "relative",
        overflowX: "hidden",
        width: "100%",
        maxWidth: "100vw",
      }}
    >
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
