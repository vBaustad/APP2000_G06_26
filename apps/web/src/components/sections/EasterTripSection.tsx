/**
 * Fil: EasterTripsSection.tsx
 * Utvikler(e): Ramona Cretulescu. Copilot er brukt som guide og lærer i utviklingen av denne siden.
 * Beskrivelse:
 * Seksjon på landingssiden som viser sesongbaserte forslag til påsketurer.
 * Komponenten fremhever relevante turer for påskeferien og leder brukeren
 * videre til utforsking av turer i løsningen.
 */

import { Link } from "react-router-dom";
import { ArrowRight, Clock3, Route as RouteIcon, SunMedium } from "lucide-react";
import type { Tour } from "../../types/tour";

type EasterTripsSectionProps = {
  tours: Tour[];
};

export default function EasterTripsSection({ tours }: EasterTripsSectionProps) {
  const easterTrips = tours.slice(0, 3);

  if (easterTrips.length === 0) {
    return null;
  }

  return (
    <section className="py-4">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#8b5a10]">
            Sesongbaserte forslag
          </p>

          <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Fine turer i påsken
          </h2>

          <p className="mt-3 text-lg leading-8 text-slate-600">
            Utforsk turforslag som passer godt for påskeferien, med alt fra
            skiturer i fjellet til roligere familievennlige alternativer.
          </p>
        </div>

        <Link
          to="/turer"
          className="inline-flex items-center gap-2 font-medium text-[#8b5a10] hover:underline"
        >
          Se flere sesongturer
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {easterTrips.map((trip) => (
          <article
            key={trip.id}
            className="flex h-full flex-col rounded-2xl border border-amber-100 bg-[#fffaf0] p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-[#8b5a10]">
                <SunMedium className="h-4 w-4" />
                Påsketur
              </span>
            </div>

            <h3 className="mb-3 text-2xl font-semibold text-slate-900">
              {trip.title}
            </h3>

            <p className="mb-5 leading-7 text-slate-700">
              {trip.description || "Se turdetaljer for mer informasjon om denne turen."}
            </p>

            <div className="mb-6 space-y-2 text-sm text-slate-600">
              <p className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-[#8b5a10]" />
                {trip.durationHours} timer
              </p>
              <p className="inline-flex items-center gap-2">
                <RouteIcon className="h-4 w-4 text-[#8b5a10]" />
                {trip.distanceKm} km
              </p>
              <p>
                <span className="font-medium text-slate-800">Nivå:</span>{" "}
                {trip.difficulty}
              </p>
            </div>

            <div className="mt-auto border-t border-amber-100 pt-4">
              <Link
                to={`/turer/${trip.id}`}
                className="inline-flex items-center gap-2 font-semibold text-[#8b5a10] hover:underline"
              >
                Se tur
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}