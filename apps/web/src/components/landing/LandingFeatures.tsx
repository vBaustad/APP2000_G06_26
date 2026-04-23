/**
 * Fil: LandingFeatures.tsx
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse:
 * Seksjon på landingssiden som presenterer sentrale funksjoner i løsningen
 * på en tydelig og oppgavenær måte. Kortene leder brukeren videre til
 * utforsking av turer, hytter/overnattingssteder og planlegging av ruter.
 */

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Mountain,
  House,
  Route,
  ArrowRight,
  MapPinned,
  BedDouble,
  Search,
} from "lucide-react";

type FeatureCardKey = "tours" | "cabins" | "routes";

type FeatureCard = {
  key: FeatureCardKey;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

const featureCards: FeatureCard[] = [
  { key: "tours", to: "/turer", icon: Mountain },
  { key: "cabins", to: "/hytter", icon: House },
  { key: "routes", to: "/tour-routes", icon: Route },
];

export default function LandingFeatures() {
  const { t } = useTranslation("forside");

  return (
    <section className="py-20">
      <div className="mb-12 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#0f3d2e]">
          {t("features.eyebrow")}
        </p>

        <h2 className="mb-4 text-3xl font-semibold text-slate-900 md:text-4xl">
          {t("features.title")}
        </h2>

        <p className="mx-auto max-w-3xl text-lg leading-8 text-slate-700">
          {t("features.intro")}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {featureCards.map((card) => {
          const Icon = card.icon;
          const base = `features.cards.${card.key}`;
          const points = [
            t(`${base}.point1`),
            t(`${base}.point2`),
            t(`${base}.point3`),
          ];

          return (
            <Link key={card.key} to={card.to} className="group block h-full">
              <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-5 flex items-start justify-between">
                  <span className="inline-flex rounded-full bg-[#dcebe4] px-3 py-1 text-sm font-semibold text-[#0f3d2e]">
                    {t(`${base}.badge`)}
                  </span>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f3d2e]">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                <h3 className="mb-3 text-2xl font-semibold leading-tight text-slate-900">
                  {t(`${base}.title`)}
                </h3>

                <p className="mb-6 leading-7 text-slate-700">
                  {t(`${base}.description`)}
                </p>

                <ul className="mb-8 space-y-3">
                  {points.map((point, index) => {
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
                    {t(`${base}.cta`)}
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
