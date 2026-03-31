import FlexibleTripsCard from "../sections/FlexibleTripsCard";
import WeatherConditionsCard from "../sections/WeatherConditionsCard";

export default function LandingSidebarSection() {
  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <WeatherConditionsCard />
      <FlexibleTripsCard />
    </section>
  );
}