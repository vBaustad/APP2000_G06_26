import CompetitionCard from "../sections/CompetitionCard";
import MountainSafetyRulesCard from "../sections/MountainSafetyRulesCard";


export default function LandingSidebarSection() {
  return (
    <section className="mt-10">
      <div className="grid gap-6 md:grid-cols-2">
        <MountainSafetyRulesCard />
        <CompetitionCard />
      </div>
    </section>
  );
}
