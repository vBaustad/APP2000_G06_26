/**
 * Fil: Forside.tsx
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

import { useEffect, useState } from "react";
import LandingHero from "../components/landing/LandingHero";
import LandingFeatures from "../components/landing/LandingFeatures";
import LandingActivities from "../components/landing/LandingActivities";
import LandingCommunitySection from "../components/landing/LandingCommunitySection";
import LandingSidebarSection from "../components/landing/LandingSidebarSection";
import EasterTripsSection from "../components/sections/EasterTripSection";
import PartnersSection from "../components/sections/PartnerSection";
import { getTours } from "../services/toursApi";
import type { Tour } from "../utils/mockTours";

export default function Forside() {
  const [tours, setTours] = useState<Tour[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadTours() {
      try {
        const data = await getTours();
        if (isMounted) {
          setTours(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Kunne ikke hente turer til forsiden:", error);
        if (isMounted) {
          setTours([]);
        }
      }
    }

    loadTours();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <LandingHero />

      <main className="mx-auto max-w-6xl space-y-20 px-4 py-16">
        <LandingFeatures />
        <LandingActivities />
        <LandingCommunitySection tours={tours} />
        <EasterTripsSection tours={tours} />
        <LandingSidebarSection />
      </main>

      <PartnersSection />
    </>
  );
}