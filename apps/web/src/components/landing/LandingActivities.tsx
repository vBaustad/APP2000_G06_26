/**
 * Fil: LandingActivities.tsx
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse:
 * Seksjon på denne landingssiden som viser ulike aktivitet-kategorier.
 * (Med kort og ikon, navn og antall turer og blått for vinteraktiviteter, dummydat for nå.)
 */

import { useNavigate } from "react-router-dom";
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

type ActivityCard = {
  title: string;
  count: string;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  query: string;
};

const activityCards: ActivityCard[] = [
  {
    title: "Fottur",
    count: "19 000 turer",
    icon: Footprints,
    bgColor: "bg-[#dcebe4]",
    iconColor: "#0f3d2e",
    query: "fottur",
  },
  {
    title: "Sykkeltur",
    count: "2 110 turer",
    icon: Bike,
    bgColor: "bg-[#dcebe4]",
    iconColor: "#0f3d2e",
    query: "sykkeltur",
  },
  {
    title: "Hyttetur",
    count: "16 hytter",
    icon: Home,
    bgColor: "bg-[#dcebe4]",
    iconColor: "#0f3d2e",
    query: "hyttetur",
  },
  {
    title: "Skitur",
    count: "4 307 turer",
    icon: Snowflake,
    bgColor: "bg-[#dff1f6]",
    iconColor: "#1593a3",
    query: "skitur",
  },
  {
    title: "Topptur på ski",
    count: "1 130 turer",
    icon: MountainSnow,
    bgColor: "bg-[#dff1f6]",
    iconColor: "#1593a3",
    query: "topptur",
  },
  {
    title: "Padletur",
    count: "619 turer",
    icon: Waves,
    bgColor: "bg-[#dff1f6]",
    iconColor: "#1593a3",
    query: "padletur",
  },
];

export default function LandingActivities() {
  const navigate = useNavigate();

  return (
    <section className="rounded-[2rem] border border-[#d8e6de] bg-[#eef5f1] px-6 py-10 md:px-8 md:py-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#0f3d2e]">
            Aktiviteter og filtrering
          </p>

          <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Utforsk etter aktivitet
          </h2>

          <p className="mt-3 text-lg leading-8 text-slate-600">
            Velg aktivitet og gå videre til turer og kartvisning med relevante
            forslag og filtrering.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/turer")}
          className="inline-flex items-center gap-2 font-medium text-[#0f3d2e] hover:underline"
        >
          Gå til turer
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {activityCards.map((activity) => {
          const Icon = activity.icon;

          return (
            <button
              key={activity.title}
              type="button"
              onClick={() => navigate(`/map?activity=${activity.query}`)}
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
                {activity.title}
              </h3>

              <p className="mb-4 text-sm text-slate-500">{activity.count}</p>

              <span className="inline-flex items-center gap-1 text-sm font-medium text-[#0f3d2e] opacity-0 transition group-hover:opacity-100">
                Se turer
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}