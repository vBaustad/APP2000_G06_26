/**
 * Fil: Turer.tsx
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu.
 * Beskrivelse: Utforsk-side som viser tilgjengelige turer med søk, filterpanel og turkort.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getTours } from "../services/toursApi";
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
import { getMockWeather } from "../utils/weatherMock";

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

const REGIONS: Region[] = ["Nord-Norge", "Trøndelag", "Østlandet", "Sørlandet", "Vestlandet"];

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

function WeatherSummary({ region }: { region?: string }) {
  const weather = getMockWeather(region);

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center gap-2">
        <CloudSun className="h-4 w-4 text-slate-700" />
        <span className="text-sm font-semibold text-slate-800">Vær og forhold</span>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-slate-700">
        <span>{weather.condition}</span>
        <span>{weather.temperature}°C</span>

        <span className="flex items-center gap-1">
          <Wind className="h-4 w-4" />
          {weather.wind} m/s
        </span>

        <span className="flex items-center gap-1">
          <Droplets className="h-4 w-4" />
          {weather.precipitation} mm
        </span>
      </div>

      <p className="mt-2 text-sm font-medium text-slate-800">{weather.statusText}</p>
    </div>
  );
}

export default function Turer() {
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [query, setQuery] = useState("");

  const [diffs, setDiffs] = useState<Tour["difficulty"][]>([]);
  const [lengths, setLengths] = useState<LengthBucket[]>([]);
  const [durations, setDurations] = useState<DurationBucket[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [kunFellestur, setKunFellestur] = useState(false);

  const [sort, setSort] = useState<SortKey>("newest");

  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadTours() {
      try {
        const data = await getTours();
        if (isMounted) {
          setAllTours(Array.isArray(data) ? data.map(ensureTourImage) : []);
        }
      } catch (error) {
        console.error("Kunne ikke hente turer fra API:", error);
        if (isMounted) {
          setAllTours([]);
        }
      }
    }

    loadTours();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeFilterCount =
    diffs.length + lengths.length + durations.length + regions.length + (kunFellestur ? 1 : 0);

  const visibleTours = useMemo(() => {
    const q = query.trim().toLowerCase();

    let next = allTours.filter((t) => {
      const matchesQuery =
        !q ||
        `${t.title ?? ""} ${t.location ?? ""} ${t.difficulty ?? ""} ${t.region ?? ""} ${t.type ?? ""}`
          .toLowerCase()
          .includes(q);

      const matchesDiff = diffs.length === 0 || diffs.includes(t.difficulty);
      const matchesLen = lengths.length === 0 || lengths.some((b) => inLengthBucket(t.distanceKm, b));
      const matchesDur =
        durations.length === 0 || durations.some((b) => inDurationBucket(t.durationHours, b));
      const matchesRegion = regions.length === 0 || regions.includes(t.region);
      const matchesFellestur = !kunFellestur || (t.datoer?.length ?? 0) > 0;

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
      label: d,
      onRemove: () => setDiffs((prev) => prev.filter((x) => x !== d)),
    })),
    ...lengths.map((l) => ({
      key: `len:${l}`,
      label:
        l === "lt5"
          ? "Under 5 km"
          : l === "5to10"
            ? "5–10 km"
            : l === "10to20"
              ? "10–20 km"
              : "Over 20 km",
      onRemove: () => setLengths((prev) => prev.filter((x) => x !== l)),
    })),
    ...durations.map((d) => ({
      key: `dur:${d}`,
      label:
        d === "lt2"
          ? "Under 2 timer"
          : d === "2to4"
            ? "2–4 timer"
            : d === "4to6"
              ? "4–6 timer"
              : "Over 6 timer",
      onRemove: () => setDurations((prev) => prev.filter((x) => x !== d)),
    })),
    ...regions.map((r) => ({
      key: `reg:${r}`,
      label: r,
      onRemove: () => setRegions((prev) => prev.filter((x) => x !== r)),
    })),
    ...(kunFellestur
      ? [
          {
            key: "fellestur",
            label: "Kun fellesturer",
            onRemove: () => setKunFellestur(false),
          },
        ]
      : []),
  ];

  const totalVisibleCount = visibleTours.length;
  const totalCount = allTours.length;

  return (
    <main>
      <section className="relative h-[38vh] min-h-[320px]">
        <img
          src="/images/explore-hero.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 h-full">
          <div className="mx-auto flex h-full max-w-7xl items-end px-6 pb-10">
            <div className="w-full max-w-4xl">
              <h1 className="text-5xl font-semibold text-white">Utforsk turer</h1>
              <p className="mt-2 text-sm text-white/80">
                Finn turer basert på lengde, varighet, vanskelighetsgrad og region
              </p>

              <div className="mt-6">
                <input
                  type="search"
                  aria-label="Søk etter tur eller sted"
                  placeholder="Søk etter tur eller sted"
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
                  Viser <span className="font-semibold">{totalVisibleCount}</span> av{" "}
                  <span className="font-semibold">{totalCount}</span> turer
                </div>

                {chips.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-600">Aktive filtre:</span>
                    {chips.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={c.onRemove}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800 hover:bg-gray-200"
                        title="Fjern filter"
                      >
                        {c.label} <span className="ml-1">×</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="ml-2 text-sm font-semibold text-red-600 hover:underline"
                    >
                      Fjern alle
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
                  <option value="newest">Sorter: Nyeste</option>
                  <option value="distanceAsc">Sorter: Kortest først</option>
                  <option value="durationAsc">Sorter: Kortest tid først</option>
                </select>

                <button
                  type="button"
                  onClick={() => setFiltersOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Filtrer
                  {activeFilterCount > 0 && (
                    <span className="ml-2 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-emerald-600 px-2 text-sm font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <Link
                  to="/opprett-tur"
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Opprett tur
                </Link>
              </div>
            </div>

            {filtersOpen && (
              <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4 md:p-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Vanskelighetsgrad</h3>
                    {(["Lett", "Middels", "Krevende", "Ekspert"] as Tour["difficulty"][]).map((d) => (
                      <label key={d} className="flex items-center gap-3 py-2 text-base">
                        <input
                          type="checkbox"
                          checked={diffs.includes(d)}
                          onChange={() => setDiffs((prev) => toggleInList(prev, d))}
                          className="h-5 w-5"
                        />
                        <span>{d}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Lengde</h3>
                    {(
                      [
                        { k: "lt5", label: "Under 5 km" },
                        { k: "5to10", label: "5–10 km" },
                        { k: "10to20", label: "10–20 km" },
                        { k: "gt20", label: "Over 20 km" },
                      ] as { k: LengthBucket; label: string }[]
                    ).map((o) => (
                      <label key={o.k} className="flex items-center gap-3 py-2 text-base">
                        <input
                          type="checkbox"
                          checked={lengths.includes(o.k)}
                          onChange={() => setLengths((prev) => toggleInList(prev, o.k))}
                          className="h-5 w-5"
                        />
                        <span>{o.label}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Varighet</h3>
                    {(
                      [
                        { k: "lt2", label: "Under 2 timer" },
                        { k: "2to4", label: "2–4 timer" },
                        { k: "4to6", label: "4–6 timer" },
                        { k: "gt6", label: "Over 6 timer" },
                      ] as { k: DurationBucket; label: string }[]
                    ).map((o) => (
                      <label key={o.k} className="flex items-center gap-3 py-2 text-base">
                        <input
                          type="checkbox"
                          checked={durations.includes(o.k)}
                          onChange={() => setDurations((prev) => toggleInList(prev, o.k))}
                          className="h-5 w-5"
                        />
                        <span>{o.label}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Region</h3>
                    {REGIONS.map((r) => (
                      <label key={r} className="flex items-center gap-3 py-2 text-base">
                        <input
                          type="checkbox"
                          checked={regions.includes(r)}
                          onChange={() => setRegions((prev) => toggleInList(prev, r))}
                          className="h-5 w-5"
                        />
                        <span>{r}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Type</h3>
                    <label className="flex items-center gap-3 py-2 text-base">
                      <input
                        type="checkbox"
                        checked={kunFellestur}
                        onChange={() => setKunFellestur((v) => !v)}
                        className="h-5 w-5"
                      />
                      <span>Kun fellesturer (med satte datoer)</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-sm font-semibold text-red-600 hover:underline"
                  >
                    Fjern alle
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Lukk filter
                  </button>
                </div>
              </div>
            )}

          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16 pt-10">
          {totalVisibleCount === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
              <p className="text-base font-medium text-gray-800">
                Ingen turer matcher søket eller filtrene dine.
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Prøv å justere kriteriene eller fjern noen filtre.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Fjern filtre
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-5">
                <h2 className="text-2xl font-semibold text-gray-900">Alle turer</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visibleTours.map((t) => {
                  const erFellestur = (t.datoer?.length ?? 0) > 0;
                  return (
                    <Link
                      key={t.id}
                      to={`/turer/${t.id}`}
                      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <div className="relative">
                        <img
                          src={t.imageUrl || "/images/trip-card-placeholder.jpg"}
                          alt={t.title}
                          className="h-56 w-full object-cover"
                          loading="lazy"
                        />

                        <span className="absolute left-4 top-4 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900 shadow-sm">
                          {t.difficulty}
                        </span>

                        {erFellestur && (
                          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold text-white shadow-sm">
                            <Users className="h-3.5 w-3.5" />
                            Fellestur
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="text-2xl font-semibold tracking-tight text-gray-900">
                          {t.title}
                        </h3>

                        <div className="mt-2 flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <p className="text-sm">
                            {t.location}
                            <span className="mx-2">•</span>
                            {t.region}
                          </p>
                        </div>

                        <div className="mt-5 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Route className="h-4 w-4" />
                              <span>Distanse</span>
                            </div>
                            <div className="mt-1 text-lg font-semibold text-gray-900">
                              {t.distanceKm} km
                            </div>
                          </div>

                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mountain className="h-4 w-4" />
                              <span>Høydemeter</span>
                            </div>
                            <div className="mt-1 text-lg font-semibold text-gray-900">
                              {t.elevationM} m
                            </div>
                          </div>

                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Tid</span>
                            </div>
                            <div className="mt-1 text-lg font-semibold text-gray-900">
                              {t.durationHours} t
                            </div>
                          </div>
                        </div>

                        <WeatherSummary region={t.region} />

                        {erFellestur && (
                          <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                            {t.datoer?.length === 1
                              ? "1 dato tilgjengelig — meld deg på"
                              : `${t.datoer?.length} datoer — meld deg på`}
                          </div>
                        )}

                        <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                          <div className="text-sm text-gray-500">
                            Type: {t.type || "Ukjent"}
                          </div>

                          <span className="text-sm font-semibold text-emerald-700 group-hover:underline">
                            Se mer →
                          </span>
                        </div>
                      </div>
                    </Link>
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