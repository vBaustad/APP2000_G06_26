/**
 * Fil: LandingPage.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Selve landingssiden som inneholder flere komponenter som bygger opp hele siden. LandingHero, 
 */

import LandingHero from "../components/LandingHero";

export default function LandingPage() {
  return (
    <>
      <LandingHero />
      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* resten av forsiden */}
      </main>
    </>
  );
}
