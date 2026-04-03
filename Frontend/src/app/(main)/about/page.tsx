import AboutHero from "@/components/about/AboutHero";
import MissionSection from "@/components/about/MissionSection";
import ValuesSection from "@/components/about/ValuesSection";
import StorySection from "@/components/about/StorySection";
import TeamSection from "@/components/about/TeamSection";
import CtaSection from "@/components/about/CtaSection";

export const metadata = {
  title: "About Us — Graphix",
  description:
    "We built the visualization layer for data. Learn about our mission, values, story, and the team behind Graphix.",
};

export default function AboutPage() {
  return (
    <main className="text-white">
      <AboutHero />
      <MissionSection />
      <ValuesSection />
      <StorySection />
      <TeamSection />
      <CtaSection />
    </main>
  );
}
