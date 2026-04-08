import Navbar from "@/components/NavBar";
import Footer from "@/components/landing/Footer";
import PricingSection from "@/components/landing/Pricing";
export const metadata = { title: "Pricing — Graphix" };

export default function Pricing() {
  return (
    <>
      <Navbar />
      <PricingSection />
      <Footer />
    </>
  );
}