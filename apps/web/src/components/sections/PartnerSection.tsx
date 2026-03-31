/**
 * Fil: PartnersSection.tsx
 * Utvikler(e): Alex, Ramona Cretulescu
 * Beskrivelse:
 * Diskret seksjon nederst på landingssiden som viser samarbeidspartnere
 * gjennom en enkel logo-rad rett over footeren.
 */

const partners = [
  { name: "Kvikk Lunsj", logo: "/partner1.png" },
  { name: "Solo", logo: "/partner2.png" },
  { name: "Salomon", logo: "/partner3.png" },
  { name: "Yr", logo: "/YR_blaa_rgb.webp" },
];

export default function PartnersSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-8 pt-2">
      <div className="border-t border-slate-200 pt-6">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Takk til våre samarbeidspartnere
        </p>

        <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex h-10 items-center opacity-75 transition duration-200 hover:opacity-100"
              title={partner.name}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-10 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}