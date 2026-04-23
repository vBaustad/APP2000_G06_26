/**
 * Fil: Turer.tsx
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu. Copilot er brukt som guide og lærer i utviklingen av denne siden.
 * Copilot er brukt som guide og lærer i utviklingen av denne siden.
 * Beskrivelse: Utforsk-side som viser tilgjengelige turer med søk, filterpanel og turkort.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { getTours } from "../services/toursApi";
import { getWeatherByCoords, type WeatherData } from "../services/weatherApi";
import type { Tour, Region } from "../types/tour";
import {
  MapPin,
  Mountain,
  Clock,
  Route,
  CloudSun,
  Wind,
  Droplets,
  Users,
} from "lucide-react";

type SortKey = "newest" | "distanceAsc" | "durationAsc";

type LengthBucket = "lt5" | "5to10" | "10to20" | "gt20";
type DurationBucket = "lt2" | "2to4" | "4to6" | "gt6";

function inLengthBucket(km: number, b: LengthBucket) {
  if (b === "lt5") return km < 5;
  if (b === "5to10") return km >= 5 && km <= 10;
  if (b === "10to20") return km > 10 && km <= 20;
  return km > 20;
}

function inDurationBucket(h: number, b: DurationBucket) {
  if (b === "lt2") return h < 2;
  if (b === "2to4") return h >= 2 && h <= 4;
  if (b === "4to6") return h > 4 && h <= 6;
  return h > 6;
}

function toggleInList<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

const REGIONS: Region[] = [
  "Nord-Norge",
  "Trøndelag",
  "Østlandet",
  "Sørlandet",
  "Vestlandet",
];

const REGION_TO_KEY: Record<Region, string> = {
  "Nord-Norge": "north",
  "Trøndelag": "trondelag",
  "Østlandet": "east",
  "Sørlandet": "south",
  "Vestlandet": "west",
};

const DIFF_KEY: Record<Tour["difficulty"], string> = {
  Lett: "diffEasy",
  Middels: "diffMedium",
  Krevende: "diffHard",
  Ekspert: "diffExpert",
};

const TOUR_IMAGES = [
  "/images/tours/floibanen.jpg",
  "/images/tours/oslofjord.jpg",
  "/images/tours/geiranger.jpg",
  "/images/tours/fjelltur-1.jpg",
  "/images/tours/fjelltur-2.jpg",
  "/images/tours/fjelltur-3.webp",
  "/images/tours/bergen-fjelloping.avif",
  "/images/tours/fjell-okt.avif",
  "/images/tours/1635176958-noedt-til-aa-loepe.avif",
];

function hashStringToIndex(s: string, mod: number) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return mod === 0 ? 0 : h % mod;
}

function ensureTourImage(t: Tour): Tour {
  if (t.imageUrl && t.imageUrl.trim()) return t;
  const idx = hashStringToIndex(t.id ?? t.title ?? "tour", TOUR_IMAGES.length);
  return { ...t, imageUrl: TOUR_IMAGES[idx] };
}

function buildMapSearchParams({
  query,
  diffs,
  regions,
  kunFellestur,
  tourId,
}: {
  query: string;
  diffs: Tour["difficulty"][];
  regions: Region[];
  kunFellestur: boolean;
  tourId?: string;
}) {
  const params = new URLSearchParams();

  if (query.trim()) params.set("q", query.trim());
  if (diffs.length === 1) params.set("difficulty", diffs[0]);
  if (regions.length === 1) params.set("region", regions[0]);
  if (kunFellestur) params.set("fellestur", "1");
  if (tourId) params.set("tourId", tourId);

  const value = params.toString();
  return value ? `?${value}` : "";
}

function translateWeatherCondition(condition: string | null | undefined, t: (key: string) => string) {
  const value = (condition ?? "").toLowerCase().trim();

  const keyMap: Record<string, string> = {
    clearsky: "list.weatherConditions.clearsky",
    fair: "list.weatherConditions.fair",
    partlycloudy: "list.weatherConditions.partlycloudy",
    cloudy: "list.weatherConditions.cloudy",
    lightrainshowers: "list.weatherConditions.lightrainshowers",
    rainshowers: "list.weatherConditions.rainshowers",
    heavyrainshowers: "list.weatherConditions.heavyrainshowers",
    lightrain: "list.weatherConditions.lightrain",
    rain: "list.weatherConditions.rain",
    heavyrain: "list.weatherConditions.heavyrain",
    sleet: "list.weatherConditions.sleet",
    lightsleet: "list.weatherConditions.lightsleet",
    heavysleet: "list.weatherConditions.heavysleet",
    snow: "list.weatherConditions.snow",
    lightsnow: "list.weatherConditions.lightsnow",
    heavysnow: "list.weatherConditions.heavysnow",
    fog: "list.weatherConditions.fog",
  };

  if (!value) return t("list.weatherConditions.unknown");
  const key = keyMap[value];
  return key ? t(key) : (condition ?? t("list.weatherConditions.unknown"));
}

function formatWeatherNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "–";
  return String(value);
}

function WeatherSummary({ mapCenter }: { mapCenter?: [number, number] | null }) {
  const { t } = useTranslation("turer");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mapCenter) return;

    let isMounted = true;

    async function loadWeather() {
      try {
        setLoading(true);
        const data = await getWeatherByCoords(mapCenter[0], mapCenter[1]);
        if (isMounted) {
          setWeather(data);
        }
      } catch (error) {
        console.error("Kunne ikke hente værdata:", error);
        if (isMounted) {
          setWeather(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadWeather();

    return () => {
      isMounted = false;
    };
  }, [mapCenter]);

  if (!mapCenter) return null;

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CloudSun className="h-4 w-4 text-slate-700" />
          <span className="text-sm font-semibold text-slate-800">
            {t("list.weatherHeading")}
          </span>
        </div>

        {!loading && weather && (
          <span className="text-sm font-semibold text-slate-900">
            {formatWeatherNumber(weather.temperature)}°C
          </span>
        )}
      </div>

      {loading && (
        <p className="mt-2 text-sm text-slate-600">{t("list.weatherLoading")}</p>
      )}

      {!loading && weather && (
        <>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-700">
            <span className="font-medium text-slate-800">
              {translateWeatherCondition(weather.condition, t)}
            </span>

            <span className="inline-flex items-center gap-1">
              <Wind className="h-3.5 w-3.5" />
              {formatWeatherNumber(weather.wind)} m/s
            </span>

            <span className="inline-flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5" />
              {formatWeatherNumber(weather.precipitation)} mm
            </span>
          </div>

          {weather.statusText && (
            <p className="mt-2 text-xs font-medium text-slate-700">
              {weather.statusText}
            </p>
          )}
        </>
      )}

      {!loading && !weather && (
        <p className="mt-2 text-sm text-slate-600">
          {t("list.weatherUnavailable")}
        </p>
      )}
    </div>
  );
}

export default function Turer() {
  const { t } = useTranslation("turer");
  const [searchParams] = useSearchParams();

  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState(false);

  const [diffs, setDiffs] = useState<Tour["difficulty"][]>([]);
  const [lengths, setLengths] = useState<LengthBucket[]>([]);
  const [durations, setDurations] = useState<DurationBucket[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [kunFellestur, setKunFellestur] = useState(false);

  const [sort, setSort] = useState<SortKey>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    setQuery(urlQuery);
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    async function loadTours() {
      try {
        setLoadError(false);
        const data = await getTours();
        if (isMounted) {
          setAllTours(Array.isArray(data) ? data.map(ensureTourImage) : []);
        }
      } catch (error) {
        console.error("Kunne ikke hente turer fra API:", error);
        if (isMounted) {
          setAllTours([]);
          setLoadError(true);
        }
      }
    }

    loadTours();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeFilterCount =
    diffs.length +
    lengths.length +
    durations.length +
    regions.length +
    (kunFellestur ? 1 : 0);

  const visibleTours = useMemo(() => {
    const q = query.trim().toLowerCase();

    let next = allTours.filter((x) => {
      const matchesQuery =
        !q ||
        `${x.title ?? ""} ${x.location ?? ""} ${x.difficulty ?? ""} ${x.region ?? ""} ${x.type ?? ""}`
          .toLowerCase()
          .includes(q);

      const matchesDiff = diffs.length === 0 || diffs.includes(x.difficulty);
      const matchesLen = lengths.length === 0 || lengths.some((b) => inLengthBucket(x.distanceKm, b));
      const matchesDur =
        durations.length === 0 || durations.some((b) => inDurationBucket(x.durationHours, b));
      const matchesRegion = regions.length === 0 || regions.includes(x.region);
      const matchesFellestur = !kunFellestur || (x.datoer?.length ?? 0) > 0;

      return (
        matchesQuery &&
        matchesDiff &&
        matchesLen &&
        matchesDur &&
        matchesRegion &&
        matchesFellestur
      );
    });

    if (sort === "distanceAsc") {
      next = [...next].sort((a, b) => a.distanceKm - b.distanceKm);
    }

    if (sort === "durationAsc") {
      next = [...next].sort((a, b) => a.durationHours - b.durationHours);
    }

    if (sort === "newest") {
      next = [...next].sort((a, b) => String(b.id ?? "").localeCompare(String(a.id ?? "")));
    }

    return next;
  }, [allTours, query, diffs, lengths, durations, regions, sort, kunFellestur]);

  function clearAllFilters() {
    setQuery("");
    setDiffs([]);
    setLengths([]);
    setDurations([]);
    setRegions([]);
    setKunFellestur(false);
    setSort("newest");
  }

  const chips: { key: string; label: string; onRemove: () => void }[] = [
    ...diffs.map((d) => ({
      key: `diff:${d}`,
      label: t(`list.filters.${DIFF_KEY[d]}`),
      onRemove: () => setDiffs((prev) => prev.filter((x) => x !== d)),
    })),
    ...lengths.map((l) => ({
      key: `len:${l}`,
      label:
        l === "lt5"
          ? t("list.filters.lengthLt5")
          : l === "5to10"
            ? t("list.filters.length5to10")
            : l === "10to20"
              ? t("list.filters.length10to20")
              : t("list.filters.lengthGt20"),
      onRemove: () => setLengths((prev) => prev.filter((x) => x !== l)),
    })),
    ...durations.map((d) => ({
      key: `dur:${d}`,
      label:
        d === "lt2"
          ? t("list.filters.durLt2")
          : d === "2to4"
            ? t("list.filters.dur2to4")
            : d === "4to6"
              ? t("list.filters.dur4to6")
              : t("list.filters.durGt6"),
      onRemove: () => setDurations((prev) => prev.filter((x) => x !== d)),
    })),
    ...regions.map((r) => ({
      key: `reg:${r}`,
      label: t(`list.filters.regions.${REGION_TO_KEY[r]}`),
      onRemove: () => setRegions((prev) => prev.filter((x) => x !== r)),
    })),
    ...(kunFellestur
      ? [
          {
            key: "fellestur",
            label: t("list.filters.feltuerOnly"),
            onRemove: () => setKunFellestur(false),
          },
        ]
      : []),
  ];

  const totalVisibleCount = visibleTours.length;
  const totalCount = allTours.length;
  const mapSearch = buildMapSearchParams({ query, diffs, regions, kunFellestur });

  return (
    <main>
      <section className="relative h-[38vh] min-h-80">
        <img
          src="/images/explore-hero.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 h-full">
          <div className="mx-auto flex h-full max-w-7xl items-end px-6 pb-10">
            <div className="w-full max-w-4xl">
              <h1 className="text-5xl font-semibold text-white">{t("list.heroTitle")}</h1>
              <p className="mt-2 text-sm text-white/80">{t("list.heroSubtitle")}</p>

              <div className="mt-6">
                <input
                  type="search"
                  aria-label={t("list.searchLabel")}
                  placeholder={t("list.searchPlaceholder")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-2xl bg-white/95 px-5 py-3 text-gray-900 outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-gray-50">
        <section className="mx-auto max-w-7xl px-6 pt-8">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-gray-600">
                  <Trans
                    i18nKey="list.showingCount"
                    ns="turer"
                    values={{ visible: totalVisibleCount, total: totalCount }}
                    components={[<span className="font-semibold" key="v" />, <span className="font-semibold" key="t" />]}
                  />
                </div>

                {loadError && (
                  <p className="mt-2 text-sm text-red-600">
                    Kunne ikke hente alle turdata akkurat nå.
                  </p>
                )}

                {chips.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-600">{t("list.activeFilters")}</span>
                    {chips.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={c.onRemove}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800 hover:bg-gray-200"
                        title={t("list.removeFilterTitle")}
                      >
                        {c.label} <span className="ml-1">×</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="ml-2 text-sm font-semibold text-red-600 hover:underline"
                    >
                      {t("list.clearAll")}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="newest">{t("list.sortNewest")}</option>
                  <option value="distanceAsc">{t("list.sortDistance")}</option>
                  <option value="durationAsc">{t("list.sortDuration")}</option>
                </select>

                <button
                  type="button"
                  onClick={() => setFiltersOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  {t("list.filter")}
                  {activeFilterCount > 0 && (
                    <span className="ml-2 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-emerald-600 px-2 text-sm font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <Link
                  to={`/kart${mapSearch}`}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  {t("list.showInMap")}
                </Link>

                <Link
                  to="/opprett-tur"
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {t("list.createTour")}
                </Link>
              </div>
            </div>

            {filtersOpen && (
              <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4 md:p-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">{t("list.filters.difficulty")}</h3>
                    {(["Lett", "Middels", "Krevende", "Ekspert"] as Tour["difficulty"][]).map((d) => (
                      <label key={d} className="flex items-center gap-3 py-2 text-base">
                        <input
                          type="checkbox"
                          checked={diffs.includes(d)}
                          onChange={() => setDiffs((prev) => toggleInList(prev, d))}
                          className="h-5 w-5"
                        />
                        <span>{t(`list.filters.${DIFF_KEY[d]}`)}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold">{t("list.filters.length")}</h3>
                    {(
                      [
                        { k: "lt5" as LengthBucket, tKey: "lengthLt5" },
                        { k: "5to10" as LengthBucket, tKey: "length5to10" },
                        { k: "10to20" as LengthBucket, tKey: "length10to20" },
                        { k: "gt20" as LengthBucket, tKey: "lengthGt20" },
                      ]
                    ).map((o) => (
                      <label key={o.k} className="flex items-center gap-3 py-2 text-base">
                        <input
                          type="checkbox"
                          checked={lengths.includes(o.k)}
                          onChange={() => setLengths((prev) => toggleInList(prev, o.k))}
                          className="h-5 w-5"
                        />
                        <span>{t(`list.filters.${o.tKey}`)}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold">{t("list.filters.duration")}</h3>
                    {(
                      [
                        { k: "lt2" as DurationBucket, tKey: "durLt2" },
                        { k: "2to4" as DurationBucket, tKey: "dur2to4" },
                        { k: "4to6" as DurationBucket, tKey: "dur4to6" },
                        { k: "gt6" as DurationBucket, tKey: "durGt6" },
                      ]
                    ).map((o) => (
                      <label key={o.k} className="flex items-center gap-3 py-2 text-base">
                        <input
                          type="checkbox"
                          checked={durations.includes(o.k)}
                          onChange={() => setDurations((prev) => toggleInList(prev, o.k))}
                          className="h-5 w-5"
                        />
                        <span>{t(`list.filters.${o.tKey}`)}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold">{t("list.filters.region")}</h3>
                    {REGIONS.map((r) => (
                      <label key={r} className="flex items-center gap-3 py-2 text-base">
                        <input
                          type="checkbox"
                          checked={regions.includes(r)}
                          onChange={() => setRegions((prev) => toggleInList(prev, r))}
                          className="h-5 w-5"
                        />
                        <span>{t(`list.filters.regions.${REGION_TO_KEY[r]}`)}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold">{t("list.filters.type")}</h3>
                    <label className="flex items-center gap-3 py-2 text-base">
                      <input
                        type="checkbox"
                        checked={kunFellestur}
                        onChange={() => setKunFellestur((v) => !v)}
                        className="h-5 w-5"
                      />
                      <span>{t("list.filters.typeFellestur")}</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-sm font-semibold text-red-600 hover:underline"
                  >
                    {t("list.clearAll")}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    {t("list.closeFilter")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16 pt-10">
          {totalVisibleCount === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
              <p className="text-base font-medium text-gray-800">{t("list.emptyTitle")}</p>
              <p className="mt-2 text-sm text-gray-600">{t("list.emptySubtitle")}</p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {t("list.emptyClear")}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-5">
                <h2 className="text-2xl font-semibold text-gray-900">{t("list.allTours")}</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visibleTours.map((tour) => {
                  const erFellestur = (tour.datoer?.length ?? 0) > 0;
                  const tourMapSearch = buildMapSearchParams({
                    query,
                    diffs,
                    regions,
                    kunFellestur,
                    tourId: tour.id,
                  });
                  const dateCount = tour.datoer?.length ?? 0;

                  return (
                    <article
                      key={tour.id}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="relative">
                        <Link
                          to={`/turer/${tour.id}`}
                          className="block focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <img
                            src={tour.imageUrl || "/images/trip-card-placeholder.jpg"}
                            alt={tour.title}
                            className="h-56 w-full object-cover"
                            loading="lazy"
                          />
                        </Link>

                        <span className="absolute left-4 top-4 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900 shadow-sm">
                          {t(`list.filters.${DIFF_KEY[tour.difficulty]}`)}
                        </span>

                        {erFellestur && (
                          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold text-white shadow-sm">
                            <Users className="h-3.5 w-3.5" />
                            {t("list.fellestur")}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <Link
                          to={`/turer/${tour.id}`}
                          className="focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <h3 className="text-2xl font-semibold tracking-tight text-gray-900">
                            {tour.title}
                          </h3>
                        </Link>

                        <div className="mt-2 flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <p className="text-sm">
                            {tour.location}
                            <span className="mx-2">•</span>
                            {tour.region}
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {t("list.typeLabel")} {tour.type || t("list.typeUnknown")}
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4">
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Route className="h-4 w-4" />
                              <span>{t("list.distance")}</span>
                            </div>
                            <div className="mt-1 text-lg font-semibold text-gray-900">
                              {tour.distanceKm} km
                            </div>
                          </div>

                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mountain className="h-4 w-4" />
                              <span>{t("list.elevation")}</span>
                            </div>
                            <div className="mt-1 text-lg font-semibold text-gray-900">
                              {tour.elevationM} m
                            </div>
                          </div>

                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{t("list.time")}</span>
                            </div>
                            <div className="mt-1 text-lg font-semibold text-gray-900">
                              {tour.durationHours} {t("list.unitHours")}
                            </div>
                          </div>
                        </div>

                        <WeatherSummary mapCenter={tour.mapCenter} />

                        {erFellestur && (
                          <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                            {dateCount === 1
                              ? t("list.feltuerOneDate")
                              : t("list.feltuerManyDates", { count: dateCount })}
                          </div>
                        )}

                        <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                          <div className="text-sm text-gray-500">
                            {t("list.typeLabel")} {tour.type || t("list.typeUnknown")}
                          </div>

                          <div className="flex items-center gap-4">
                            {tour.mapCenter && (
                              <Link
                                to={`/kart${tourMapSearch}`}
                                className="text-sm font-semibold text-slate-600 hover:underline"
                              >
                                {t("list.showInMapLink")}
                              </Link>
                            )}

                            <Link
                              to={`/turer/${tour.id}`}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                              {t("list.seeMore")}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}