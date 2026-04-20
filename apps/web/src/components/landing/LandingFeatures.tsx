
/**
 * Fil: LandingFeatures.tsx
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse:
 * Seksjon på landingssiden som presenterer sentrale funksjoner i løsningen
 * på en tydelig og oppgavenær måte. Kortene leder brukeren videre til
 * utforsking av turer, hytter/overnattingssteder og planlegging av ruter.
 */

import { Link } from "react-router-dom";
import {
  Mountain,
  House,
  Route,
  ArrowRight,
  MapPinned,
  BedDouble,
  Search,
} from "lucide-react";

type FeatureCard = {
  id: number;
  title: string;
  description: string;
  points: string[];
  to: string;
  cta: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
};

const featureCards: FeatureCard[] = [
  {
    id: 1,
    title: "Utforsk turer",
    description:
      "Finn turer etter aktivitet, vanskelighetsgrad og varighet. Denne inngangen støtter søk, filtrering og videre navigering til turdetaljer.",
    points: [
      "Søk etter turmål og aktiviteter",
      "Filtrer på nivå, lengde og type tur",
      "Gå videre til turdetaljer",
    ],
    to: "/turer",
    cta: "Gå til turer",
    icon: Mountain,
    badge: "Turer",
  },
  {
    id: 2,
    title: "Hytter og overnatting",
    description:
      "Se hytter og andre overnattingssteder samlet på en egen side. Her kan brukeren få oversikt over fasiliteter, plassering og mulige stopp underveis.",
    points: [
      "Gå videre til oversikt over hytter og overnatting",
      "Oversikt over fasiliteter og plassering",
      "Relevant for turplanlegging med stopp",
    ],
    to: "/hytter",
    cta: "Se hytter og overnatting",
    icon: House,
    badge: "Overnatting",
  },
  {
    id: 3,
    title: "Planlegg rute",
    description:
      "Bruk kart og ruteoversikt for å planlegge neste tur. Denne delen peker mot arbeid med stier, etapper og videre støtte for egne turer.",
    points: [
      "Se ruter og stier i kart",
      "Planlegg tur med flere etapper",
      "Knytt turen til kartvisning",
    ],
    to: "/tour-routes",
    cta: "Planlegg tur",
    icon: Route,
    badge: "Ruter",
  },
];

export default function LandingFeatures() {
  return (
    <section className="py-20">
      <div className="mb-12 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#0f3d2e]">
          Planlegging og utforsking
        </p>

        <h2 className="mb-4 text-3xl font-semibold text-slate-900 md:text-4xl">
          Finn turer, hytter og ruter
        </h2>

        <p className="mx-auto max-w-3xl text-lg leading-8 text-slate-700">
          Utopia gjør det enklere å utforske turmuligheter, finne
          overnattingssteder og planlegge neste tur med kart, ruteoversikt og
          relevant informasjon.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {featureCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link key={card.id} to={card.to} className="group block h-full">
              <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-5 flex items-start justify-between">
                  <span className="inline-flex rounded-full bg-[#dcebe4] px-3 py-1 text-sm font-semibold text-[#0f3d2e]">
                    {card.badge}
                  </span>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f3d2e]">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                <h3 className="mb-3 text-2xl font-semibold leading-tight text-slate-900">
                  {card.title}
                </h3>

                <p className="mb-6 leading-7 text-slate-700">
                  {card.description}
                </p>

                <ul className="mb-8 space-y-3">
                  {card.points.map((point, index) => {
                    const pointIcons = [Search, BedDouble, MapPinned];
                    const PointIcon = pointIcons[index] || ArrowRight;

                    return (
                      <li key={point} className="flex items-start gap-3 text-slate-800">
                        <PointIcon className="mt-1 h-4 w-4 shrink-0 text-[#0f3d2e]" />
                        <span>{point}</span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-auto border-t border-slate-200 pt-5">
                  <span className="inline-flex items-center gap-2 font-semibold text-[#0f3d2e] group-hover:underline">
                    {card.cta}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}