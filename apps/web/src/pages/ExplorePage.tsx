/**
 * Fil: ExplorePage.tsx
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu.
 * Beskrivelse: Utforsk-side som viser tilgjengelige turer med søk + filterpanel + CRUD.
 */

import { useEffect, useMemo, useState } from "react";
import TourForm from "../components/TourForm";
import { getTours } from "../services/toursApi";
import type { Tour, Region } from "../utils/mockTours";
import { Pencil, Trash2, MapPin, Mountain, Clock, Route } from "lucide-react";

type SortKey = "newest" | "distanceAsc" | "durationAsc";

// Enkle filter-buckets (som ut.no)
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

/** Regionvalg */
const REGIONS: Region[] = ["Nord-Norge", "Trøndelag", "Østlandet", "Sørlandet", "Vestlandet"];

// Bildene du faktisk har i /public/images/tours
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

export default function ExplorePage() {
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [query, setQuery] = useState("");

  // Filter state (flervalg)
  const [diffs, setDiffs] = useState<Tour["difficulty"][]>([]);
  const [lengths, setLengths] = useState<LengthBucket[]>([]);
  const [durations, setDurations] = useState<DurationBucket[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);

  const [sort, setSort] = useState<SortKey>("newest");

  // CRUD state
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // UI state
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    getTours().then((data) => {
      setAllTours(data.map(ensureTourImage));
    });
  }, []);

  const activeFilterCount = diffs.length + lengths.length + durations.length + regions.length;

  const visibleTours = useMemo(() => {
    const q = query.trim().toLowerCase();

    let next = allTours.filter((t) => {
      const matchesQuery =
        !q ||
        `${t.title} ${t.location} ${t.difficulty} ${t.region}`.toLowerCase().includes(q);

      const matchesDiff = diffs.length === 0 || diffs.includes(t.difficulty);

      const matchesLen =
        lengths.length === 0 || lengths.some((b) => inLengthBucket(t.distanceKm, b));

      const matchesDur =
        durations.length === 0 || durations.some((b) => inDurationBucket(t.durationHours, b));

      const matchesRegion = regions.length === 0 || regions.includes(t.region);

      return matchesQuery && matchesDiff && matchesLen && matchesDur && matchesRegion;
    });

    if (sort === "distanceAsc") next = [...next].sort((a, b) => a.distanceKm - b.distanceKm);
    if (sort === "durationAsc") next = [...next].sort((a, b) => a.durationHours - b.durationHours);
    if (sort === "newest") next = [...next].sort((a, b) => (a.id < b.id ? 1 : -1)); // ok for mock

    return next;
  }, [allTours, query, diffs, lengths, durations, regions, sort]);

  function handleCreate(newTour: Tour) {
    const safe = ensureTourImage(newTour);
    setAllTours((prev) => [safe, ...prev]);
    setShowCreate(false);
  }

  function handleDelete(id: string) {
    setAllTours((prev) => prev.filter((t) => t.id !== id));
    if (editingTour?.id === id) setEditingTour(null);
  }

  function handleStartEdit(tour: Tour) {
    setEditingTour(tour);
    setShowCreate(false);
    setFiltersOpen(false);
    window.scrollTo({ top: 420, behavior: "smooth" });
  }

  function handleUpdate(updated: Tour) {
    const safe = ensureTourImage(updated);
    setAllTours((prev) => prev.map((t) => (t.id === safe.id ? safe : t)));
    setEditingTour(null);
  }

  function clearAllFilters() {
    setQuery("");
    setDiffs([]);
    setLengths([]);
    setDurations([]);
    setRegions([]);
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
  ];

  return (
    <main>
      {/* HERO */}
      <section className="relative h-[38vh] min-h-[320px]">
        <img
          src="/images/explore-hero.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 h-full">
          <div className="mx-auto max-w-7xl h-full px-6 flex items-end pb-10">
            <div className="w-full max-w-4xl">
              <h1 className="text-white text-5xl font-semibold">Utforsk turer</h1>
              <p className="mt-2 text-white/80 text-sm">
                Finn turer basert på lengde, varighet, vanskelighetsgrad og region
              </p>

              <div className="mt-6">
                <input
                  type="search"
                  placeholder="Søk etter tur eller sted"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-2xl bg-white/95 px-5 py-3 text-gray-900 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT WRAPPER */}
      <div className="bg-gray-50">
        {/* TOPPLINJE */}
        <section className="mx-auto max-w-7xl px-6 pt-8">
          <div className="rounded-2xl bg-white border border-gray-100 shadow p-4 md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-gray-600">
                  Viser <span className="font-semibold">{visibleTours.length}</span> av{" "}
                  <span className="font-semibold">{allTours.length}</span> turer
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
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 inline-flex items-center gap-2"
                >
                  Filtrer
                  {activeFilterCount > 0 && (
                    <span className="ml-2 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-emerald-600 px-2 text-sm font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowCreate((v) => !v);
                    setEditingTour(null);
                    setFiltersOpen(false);
                  }}
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {showCreate ? "Lukk" : "Legg til tur"}
                </button>
              </div>
            </div>

            {/* FILTERPANEL */}
            {filtersOpen && (
              <div className="mt-5 rounded-2xl bg-gray-50 p-4 md:p-6 border border-gray-100">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Vanskelighetsgrad</h3>
                    {(["Lett", "Middels", "Krevende", "Ekspert"] as Tour["difficulty"][]).map(
                      (d) => (
                        <label key={d} className="flex items-center gap-3 py-2 text-base">
                          <input
                            type="checkbox"
                            checked={diffs.includes(d)}
                            onChange={() => setDiffs((prev) => toggleInList(prev, d))}
                            className="h-5 w-5"
                          />
                          <span>{d}</span>
                        </label>
                      )
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Lengde</h3>
                    {([
                      { k: "lt5", label: "Under 5 km" },
                      { k: "5to10", label: "5–10 km" },
                      { k: "10to20", label: "10–20 km" },
                      { k: "gt20", label: "Over 20 km" },
                    ] as { k: LengthBucket; label: string }[]).map((o) => (
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
                    <h3 className="text-lg font-semibold mb-3">Varighet</h3>
                    {([
                      { k: "lt2", label: "Under 2 timer" },
                      { k: "2to4", label: "2–4 timer" },
                      { k: "4to6", label: "4–6 timer" },
                      { k: "gt6", label: "Over 6 timer" },
                    ] as { k: DurationBucket; label: string }[]).map((o) => (
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
                    <h3 className="text-lg font-semibold mb-3">Region</h3>
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

            {/* CREATE */}
            {showCreate && (
              <div className="mt-5 border-t border-gray-100 pt-5">
                <TourForm mode="create" onCreate={handleCreate} />
              </div>
            )}

            {/* UPDATE */}
            {editingTour && (
              <div className="mt-5 border-t border-gray-100 pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Rediger tur</h2>
                  <button
                    type="button"
                    onClick={() => setEditingTour(null)}
                    className="text-sm font-medium text-gray-600 hover:underline"
                  >
                    Avbryt
                  </button>
                </div>
                <TourForm mode="edit" initialTour={editingTour} onUpdate={handleUpdate} />
              </div>
            )}
          </div>
        </section>

        {/* LISTE */}
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-10">
          {visibleTours.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-600 bg-white">
              Ingen turer matcher søk/filter. Prøv å justere kriteriene.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleTours.map((t) => (
                <article
                  key={t.id}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow hover:shadow-lg transition"
                >
                  {/* Image */}
                  <div className="relative">
                    <img
                      src={t.imageUrl || "/images/trip-card-placeholder.jpg"}
                      alt={t.title}
                      className="h-56 w-full object-cover"
                      loading="lazy"
                    />

                    {/* Difficulty badge (top-left) */}
                    <span className="absolute left-4 top-4 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900 shadow-sm">
                      {t.difficulty}
                    </span>

                    {/* Action icons (top-right) */}
                    <div className="absolute right-4 top-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(t)}
                        className="grid h-10 w-10 place-items-center rounded-xl bg-white/95 shadow-sm hover:bg-white"
                        title="Rediger"
                        aria-label="Rediger"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Slette "${t.title}"?`)) handleDelete(t.id);
                        }}
                        className="grid h-10 w-10 place-items-center rounded-xl bg-white/95 shadow-sm hover:bg-white"
                        title="Slett"
                        aria-label="Slett"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
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

                    {/* Meta row */}
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
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
