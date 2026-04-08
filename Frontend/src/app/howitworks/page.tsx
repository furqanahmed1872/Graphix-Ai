import Navbar from "@/components/NavBar";
import Footer from "@/components/landing/Footer";
import HowitWorksContent from "@/components/landing/HowitWorks";

export const metadata = { title: "How it works — Graphix" };    

export default function HowitWorks() {
  return (
    <>
      <Navbar />
      <HowitWorksContent />
      <Footer />
    </>
  );
}