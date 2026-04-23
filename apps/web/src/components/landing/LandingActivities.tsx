/**
 * Fil: LandingActivities.tsx
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse:
 * Seksjon på landingssiden som viser ulike aktivitetskategorier.
 * Hver kategori sender brukeren videre til relevant side for utforsking
 * eller kartvisning med tilpasset filtrering.
 */

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Footprints,
  Snowflake,
  MountainSnow,
  Bike,
  Waves,
  Home,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

type ActivityCardKey =
  | "foot"
  | "bike"
  | "cabin"
  | "ski"
  | "peakSki"
  | "paddle";

type ActivityCard = {
  key: ActivityCardKey;
  count: number;
  unit: "trips" | "cabins";
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  query: string;
};

const activityCards: ActivityCard[] = [
  { key: "foot", count: 19000, unit: "trips", icon: Footprints, bgColor: "bg-[#dcebe4]", iconColor: "#0f3d2e", query: "fottur" },
  { key: "bike", count: 2110, unit: "trips", icon: Bike, bgColor: "bg-[#dcebe4]", iconColor: "#0f3d2e", query: "sykkeltur" },
  { key: "cabin", count: 16, unit: "cabins", icon: Home, bgColor: "bg-[#dcebe4]", iconColor: "#0f3d2e", query: "hyttetur" },
  { key: "ski", count: 4307, unit: "trips", icon: Snowflake, bgColor: "bg-[#dff1f6]", iconColor: "#1593a3", query: "skitur" },
  { key: "peakSki", count: 1130, unit: "trips", icon: MountainSnow, bgColor: "bg-[#dff1f6]", iconColor: "#1593a3", query: "topptur" },
  { key: "paddle", count: 619, unit: "trips", icon: Waves, bgColor: "bg-[#dff1f6]", iconColor: "#1593a3", query: "padletur" },
];

export default function LandingActivities() {
  const { t, i18n } = useTranslation("forside");
  const navigate = useNavigate();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "nb-NO";

  function handleGoToTours() {
    navigate("/turer");
  }

  function handleActivityClick(query: string) {
    navigate(`/kart?activity=${encodeURIComponent(query)}`);
  }

  return (
    <section className="rounded-[2rem] border border-[#d8e6de] bg-[#eef5f1] px-6 py-10 md:px-8 md:py-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#0f3d2e]">
            {t("activities.eyebrow")}
          </p>

          <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            {t("activities.title")}
          </h2>

          <p className="mt-3 text-lg leading-8 text-slate-600">
            {t("activities.intro")}
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoToTours}
          className="inline-flex items-center gap-2 font-medium text-[#0f3d2e] transition hover:underline"
        >
          {t("activities.goToTours")}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {activityCards.map((activity) => {
          const Icon = activity.icon;
          const unitLabel =
            activity.unit === "cabins"
              ? t("activities.cabinsUnit")
              : t("activities.tripsUnit");
          const countLabel = `${activity.count.toLocaleString(locale)} ${unitLabel}`;

          return (
            <button
              key={activity.key}
              type="button"
              onClick={() => handleActivityClick(activity.query)}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#b7d1c3] hover:shadow-lg"
            >
              <div
                className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${activity.bgColor}`}
              >
                <Icon
                  color={activity.iconColor}
                  strokeWidth={2.4}
                  className="h-7 w-7 transition group-hover:scale-105"
                />
              </div>

              <h3 className="mb-1 text-xl font-semibold text-slate-900">
                {t(`activities.cards.${activity.key}`)}
              </h3>

              <p className="mb-4 text-sm text-slate-500">{countLabel}</p>

              <span className="inline-flex items-center gap-1 text-sm font-medium text-[#0f3d2e] opacity-0 transition group-hover:opacity-100">
                {t("activities.seeTours")}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
