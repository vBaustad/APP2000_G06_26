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

import LandingHero from "../components/landing/LandingHero";
import LandingFeatures from "../components/landing/LandingFeatures";
import LandingActivities from "../components/landing/LandingActivities";
import LandingCommunitySection from "../components/landing/LandingCommunitySection";
import LandingSidebarSection from "../components/landing/LandingSidebarSection";
import EasterTripsSection from "../components/sections/EasterTripSection";
import PartnersSection from "../components/sections/PartnerSection";

export default function LandingPage() {
  return (
    <>
      <LandingHero />

      <main className="mx-auto max-w-6xl px-4 py-16 space-y-20">
        <LandingFeatures />
        <LandingActivities />
        <LandingCommunitySection />
        <EasterTripsSection />
        <LandingSidebarSection />
      </main>

      <PartnersSection />
    </>
  );
}