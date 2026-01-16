import LandingHero from "../components/landing/LandingHero";
import LandingSidebarSection from "../components/landing/LandingSidebarSection";
import PartnersSection from "../components/sections/PartnerSection";

export default function LandingPage() {
  return (
    <>
      <LandingHero />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <LandingSidebarSection />
      </main>

      <PartnersSection />
    </>
  );
} 
