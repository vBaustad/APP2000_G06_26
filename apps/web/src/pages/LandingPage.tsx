/**
 * Fil: LandingPage.tsx
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu, Synne Oppberget
 * Beskrivelse: Selve landingssiden som inneholder flere komponenter som bygger opp hele siden. LandingHero, Strukturert landingside for videre utvidelse med egne seksjoner, flere landing-komponenter ( hero, features. )  
 */


import { useState } from "react";
import LandingHero from "../components/LandingHero";
import LandingFeatures from "../components/landing/LandingFeatures";
import LandingActivities from "../components/landing/LandingActivities";


export default function LandingPage() {
  const [openRule, setOpenRule] = useState<number | null>(null);

  
  return (
    <>
      <LandingHero />
      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* resten av forsiden */}
      </main>
    </>
  );
} 
