/**
 * Fil: LandingActivities.tsx
 * Utvikler(e): Ramona Cretulescu. Copilot er brukt som guide og lærer i utviklingen av denne siden.
 * Beskrivelse:
 * Seksjon på landingssiden som viser ulike aktivitetskategorier.
 * Hver kategori sender brukeren videre til relevant side for utforsking
 * eller kartvisning med tilpasset filtrering.
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTours } from "../../services/toursApi";
import type { Tour } from "../../types/tour";
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
  description: string;
  icon: LucideIcon;
  iconWrapClass: string;
  iconClass: string;
  query: string;
  matchTerms?: string[];
  target: "kart" | "hytter";
};

const activityCards: ActivityCard[] = [
  {
    title: "Fottur",
    description: "Nærturer, dagsturer og lengre vandringer i variert terreng.",
    icon: Footprints,
    iconWrapClass: "bg-emerald-50",
    iconClass: "text-emerald-900",
    query: "fottur",
    matchTerms: ["fottur", "fotturer", "vandring", "gåtur", "tur"],
    target: "kart",
  },
  {
    title: "Sykkeltur",
    description: "Turer og ruter som passer for sykkel i ulike områder.",
    icon: Bike,
    iconWrapClass: "bg-emerald-50",
    iconClass: "text-emerald-900",
    query: "sykkeltur",
    matchTerms: ["sykkeltur", "sykkel", "sykling"],
    target: "kart",
  },
  {
    title: "Hyttetur",
    description: "Hytter og overnatting som passer som stopp eller mål for turen.",
    icon: Home,
    iconWrapClass: "bg-emerald-50",
    iconClass: "text-emerald-900",
    query: "hyttetur",
    target: "hytter",
  },
  {
    title: "Skitur",
    description: "Områder og turer som er relevante for ski og vinteraktiviteter.",
    icon: Snowflake,
    iconWrapClass: "bg-sky-50",
    iconClass: "text-sky-700",
    query: "skitur",
    matchTerms: ["skitur", "langrenn", "ski"],
    target: "kart",
  },
  {
    title: "Topptur på ski",
    description: "Mer krevende vinterturer og toppturrelaterte områder.",
    icon: MountainSnow,
    iconWrapClass: "bg-sky-50",
    iconClass: "text-sky-700",
    query: "topptur",
    matchTerms: ["topptur", "topptur på ski", "randonee"],
    target: "kart",
  },
  {
    title: "Padletur",
    description: "Forslag for kajakk, kano og andre rolige padleopplevelser.",
    icon: Waves,
    iconWrapClass: "bg-sky-50",
    iconClass: "text-sky-700",
    query: "padletur",
    matchTerms: ["padletur", "padling", "kajakk", "kano"],
    target: "kart",
  },
];

function normalize(text?: string) {
  return (text ?? "").toLowerCase().trim();
}

function formatCount(count: number) {
  return new Intl.NumberFormat("nb-NO").format(count);
}

function matchesTerms(tour: Tour, terms: string[]) {
  const haystack = [
    normalize(tour.title),
    normalize(tour.location),
    normalize(tour.type),
    normalize(tour.region),
    normalize(tour.difficulty),
  ].join(" ");

  return terms.some((term) => haystack.includes(normalize(term)));
}

export default function LandingActivities() {
  const navigate = useNavigate();

  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadTours() {
      try {
        setLoading(true);
        setHasError(false);

        const data = await getTours();

        if (isMounted) {
          setAllTours(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Kunne ikke hente turdata til aktivitetsseksjonen:", error);
        if (isMounted) {
          setAllTours([]);
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTours();

    return () => {
      isMounted = false;
    };
  }, []);

  const activityCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const activity of activityCards) {
      if (!activity.matchTerms || activity.target !== "kart") continue;

      counts[activity.title] = allTours.filter((tour) =>
        matchesTerms(tour, activity.matchTerms!)
      ).length;
    }

    return counts;
  }, [allTours]);

  function handleGoToTours() {
    navigate("/turer");
  }

  function handleActivityClick(activity: ActivityCard) {
    if (activity.target === "hytter") {
      navigate("/hytter");
      return;
    }

    navigate(`/kart?activity=${encodeURIComponent(activity.query)}`);
  }

  function getMetaText(activity: ActivityCard) {
    if (activity.target === "hytter") {
      return "Hytter og overnatting";
    }

    if (loading) {
      return "Henter turer…";
    }

    if (hasError) {
      return "Data utilgjengelig";
    }

    const count = activityCounts[activity.title] ?? 0;

    if (count <= 0) {
      return "Utforsk aktivitet";
    }

    return `${formatCount(count)} ${count === 1 ? "tur" : "turer"}`;
  }

  return (
    <section className="rounded-[2rem] border border-[#d9e3dd] bg-[#eff5f1] px-6 py-10 md:px-8 md:py-12">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#214a37]">
            Aktiviteter og filtrering
          </p>

          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Utforsk etter aktivitet
          </h2>

          <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
            Velg aktivitet og gå videre til relevante turer, hytter og kartvisning.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoToTours}
          className="inline-flex items-center gap-2 rounded-full border border-[#cad8cf] bg-white px-4 py-2 text-sm font-semibold text-[#214a37] transition hover:bg-[#f8fbf9]"
        >
          Gå til turer
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-5 snap-x snap-mandatory scroll-px-1">
          {activityCards.map((activity) => {
            const Icon = activity.icon;

            return (
              <button
                key={activity.title}
                type="button"
                onClick={() => handleActivityClick(activity)}
                className="group flex w-[260px] flex-shrink-0 snap-start flex-col rounded-[1.4rem] border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#bdd0c4] hover:shadow-md"
              >
                <div
                  className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${activity.iconWrapClass}`}
                >
                  <Icon className={`h-8 w-8 ${activity.iconClass}`} strokeWidth={2.1} />
                </div>

                <div className="flex-1">
                  <h3 className="text-[2rem] font-semibold leading-tight tracking-tight text-slate-900">
                    {activity.title}
                  </h3>

                  <p className="mt-2 text-sm font-semibold text-[#214a37]">
                    {getMetaText(activity)}
                  </p>

                  <p className="mt-4 text-base leading-7 text-slate-600">
                    {activity.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#214a37]">
                    {activity.target === "hytter" ? "Se hytter" : "Se turer"}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}