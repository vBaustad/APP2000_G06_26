/**
 * Fil: LandingSidebarSection.tsx
 * Utvikler(e): Synne Oppberget, Ramona Cretulescu, Vebjørn Baustad
 * Beskrivelse: Seksjon på landingssiden som samler kortinnhold om
 * værforhold og turplanlegging. Holder plass til flere kort etter hvert
 * som reelle datakilder kobles på (f.eks. neste fellestur fra API).
 */

import WeatherConditionsCard from "../sections/WeatherConditionsCard";

export default function LandingSidebarSection() {
  return (
    <section className="grid gap-8">
      <WeatherConditionsCard />
    </section>
  );
}
