/**
 * Fil: LandingPage.tsx
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu, Synne Oppberget
 * Beskrivelse:
 * Hovedkomponent for landingssiden som setter sammen og strukturerer alle
 * underseksjoner på forsiden. Består av hero-seksjon, feature-presentasjon,
 * informasjons- og engasjementsseksjoner (fjellvettregler, konkurranse),
 * aktivitetsutforskning, sesongbasert inspirasjon (påsketurer) og
 * samarbeidspartner-visning nederst på siden.
 * Komponenten fungerer som en ren komposisjonsfil og inneholder ingen
 * forretningslogikk utover sammensetting av visuelle seksjoner.
 */


import LandingActivities from "../components/landing/LandingActivities";
import LandingFeatures from "../components/landing/LandingFeatures";
import LandingHero from "../components/landing/LandingHero";
import LandingSidebarSection from "../components/landing/LandingSidebarSection";
import EasterTripsSection from "../components/sections/EasterTripSection";
import PartnersSection from "../components/sections/PartnerSection";

export default function LandingPage() {
  return (
    <>
      <LandingHero />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <LandingFeatures/>
        <LandingSidebarSection />
        <LandingActivities />
        <div className="mt-10">
          <EasterTripsSection />
        </div>
      </main>

      <PartnersSection />
    </>
  );
} 
