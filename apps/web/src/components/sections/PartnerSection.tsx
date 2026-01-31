/**
 * Fil: PartnersSection.tsx
 * Utvikler(e): Alex
 * Beskrivelse: Viser samarbeidspartnere nederst på landingssiden.
 */

export default function PartnersSection() {
  return (
    <section className="mx-auto mt-16 max-w-5xl px-4">
      <div className="rounded-xl bg-gray-100 p-6 shadow">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          Takk til våre samarbeidspartnere
        </h2>

        <div className="flex flex-wrap items-center gap-6">
          <img src="/partner1.png" alt="Partner 1" className="h-12" />
          <img src="/partner2.png" alt="Partner 2" className="h-12" />
          <img src="/partner3.png" alt="Partner 3" className="h-12" />
        </div>
      </div>
    </section>
  );
}
