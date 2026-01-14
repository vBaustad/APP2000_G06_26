/**
 * Fil: LandingPage.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Selve landingssiden som inneholder flere komponenter som bygger opp hele siden. LandingHero, 
 */

/* Vidreutviklet av : Ramona Cretulescu 
 * Endringer: 
 * - Strukturert landingside for videre utvidelse med egne seksjoner, flere landing-komponenter ( hero, features. )  */

import LandingHero from "../components/LandingHero";
import LandingFeatures from "../components/landing/LandingFeatures";
import LandingActivities from "../components/landing/LandingActivities";


export default function LandingPage() {
  return (
    <>
      <LandingHero />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <LandingFeatures />
        <LandingActivities />
      </main>
    </>
  );
} 
