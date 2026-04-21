/**
 * Fil: Hytter.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Offentlig oversikt over hytter med hero, søk, filter og kortgrid.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, BedDouble, Users, Image as ImageIcon } from "lucide-react";
import { FASILITET_KODER } from "../data/fasiliteter";

type Betjent = "betjent" | "selvbetjent" | "ubetjent";

type SortKey = "newest" | "priceAsc" | "priceDesc";

type Hytte = {
  id: number;
  navn: string;
  omrade: string | null;
  adresse: string | null;
  kapasitet_senger: number;
  maks_gjester: number | null;
  pris_per_natt: number | string | null;
  bilde_url: string | null;
  betjent: Betjent | null;
  hytte_fasilitet?: { kode: string }[];
};

const API_BASE = `${import.meta.env.VITE_API_URL}/api/hytter`;

const BETJENT_VALUES: Betjent[] = ["betjent", "selvbetjent", "ubetjent"];

const BETJENT_BADGE: Record<Betjent, string> = {
  betjent: "bg-emerald-100 text-emerald-900",
  selvbetjent: "bg-amber-100 text-amber-900",
  ubetjent: "bg-slate-200 text-slate-800",
};

function resolveImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${import.meta.env.VITE_API_URL}${url}`;
  return url;
}

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

export default function Hytter() {
  const [hytter, setHytter] = useState<Hytte[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [betjentFilter, setBetjentFilter] = useState<Betjent[]>([]);
  const [maxPris, setMaxPris] = useState<string>("");
  const [fasFilter, setFasFilter] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(API_BASE)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Hytte[]) => {
        if (active) setHytter(Array.isArray(data) ? data : []);
      })
      .catch(() => active && setHytter([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const fasilitetLabel = useMemo(() => {
    const map = new Map<string, string>();
    FASILITET_KODER.forEach((f) => map.set(f.kode, f.label));
    return map;
  }, []);

  const activeFilterCount = betjentFilter.length + fasFilter.length + (maxPris ? 1 : 0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const max = maxPris ? Number(maxPris) : null;

    let next = hytter.filter((h) => {
      if (q && !`${h.navn} ${h.omrade ?? ""} ${h.adresse ?? ""}`.toLowerCase().includes(q)) {
        return false;
      }
      if (betjentFilter.length && (!h.betjent || !betjentFilter.includes(h.betjent))) return false;
      if (max !== null && Number(h.pris_per_natt ?? 0) > max) return false;
      if (fasFilter.length) {
        const koder = new Set(h.hytte_fasilitet?.map((f) => f.kode) ?? []);
        if (!fasFilter.every((k) => koder.has(k))) return false;
      }
      return true;
    });

    if (sort === "priceAsc") {
      next = [...next].sort(
        (a, b) => Number(a.pris_per_natt ?? 0) - Number(b.pris_per_natt ?? 0),
      );
    } else if (sort === "priceDesc") {
      next = [...next].sort(
        (a, b) => Number(b.pris_per_natt ?? 0) - Number(a.pris_per_natt ?? 0),
      );
    }

    return next;
  }, [hytter, query, betjentFilter, maxPris, fasFilter, sort]);

  function clearAllFilters() {
    setQuery("");
    setBetjentFilter([]);
    setMaxPris("");
    setFasFilter([]);
    setSort("newest");
  }

  const chips: { key: string; label: string; onRemove: () => void }[] = [
    ...betjentFilter.map((b) => ({
      key: `bet:${b}`,
      label: b[0].toUpperCase() + b.slice(1),
      onRemove: () => setBetjentFilter((prev) => prev.filter((x) => x !== b)),
    })),
    ...(maxPris
      ? [
          {
            key: "pris",
            label: `Maks ${maxPris} kr/natt`,
            onRemove: () => setMaxPris(""),
          },
        ]
      : []),
    ...fasFilter.map((k) => ({
      key: `fas:${k}`,
      label: fasilitetLabel.get(k) ?? k,
      onRemove: () => setFasFilter((prev) => prev.filter((x) => x !== k)),
    })),
  ];

  return (
    <main>
      <section className="relative h-[38vh] min-h-[320px]">
        <img
          src="/images/cabins/u0wj3hct0e98ocz1bqwy.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 h-full">
          <div className="mx-auto flex h-full max-w-7xl items-end px-6 pb-10">
            <div className="w-full max-w-4xl">
              <h1 className="text-5xl font-semibold text-white">Finn din hytte</h1>
              <p className="mt-2 text-sm text-white/80">
                Filtrer på type, pris og fasiliteter — fra betjente hytter til enkel selvbetjening.
              </p>

              <div className="mt-6">
                <input
                  type="search"
                  aria-label="Søk etter hytte eller sted"
                  placeholder="Søk etter hytte eller sted"
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
                  Viser <span className="font-semibold">{visible.length}</span> av{" "}
                  <span className="font-semibold">{hytter.length}</span> hytter
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
                  <option value="priceAsc">Sorter: Lavest pris</option>
                  <option value="priceDesc">Sorter: Høyest pris</option>
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
              </div>
            </div>

            {filtersOpen && (
              <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4 md:p-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Type</h3>
                    {BETJENT_VALUES.map((b) => (
                      <label key={b} className="flex items-center gap-3 py-2 text-base">
                        <input
                          type="checkbox"
                          checked={betjentFilter.includes(b)}
                          onChange={() => setBetjentFilter((prev) => toggleInList(prev, b))}
                          className="h-5 w-5"
                        />
                        <span>{b[0].toUpperCase() + b.slice(1)}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Maks pris/natt</h3>
                    <input
                      type="number"
                      min="0"
                      value={maxPris}
                      onChange={(e) => setMaxPris(e.target.value)}
                      placeholder="Ubegrenset"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Fasiliteter</h3>
                    <div className="grid grid-cols-2 gap-x-3">
                      {FASILITET_KODER.map((f) => (
                        <label key={f.kode} className="flex items-center gap-2 py-1.5 text-sm">
                          <input
                            type="checkbox"
                            checked={fasFilter.includes(f.kode)}
                            onChange={() => setFasFilter((prev) => toggleInList(prev, f.kode))}
                            className="h-4 w-4"
                          />
                          <span>{f.label}</span>
                        </label>
                      ))}
                    </div>
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
          {loading ? (
            <p className="text-gray-600">Laster hytter...</p>
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
              <p className="text-base font-medium text-gray-800">
                Ingen hytter matcher søket eller filtrene dine.
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
                <h2 className="text-2xl font-semibold text-gray-900">Alle hytter</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visible.map((h) => {
                  const img = resolveImageUrl(h.bilde_url);
                  const fasiliteter = h.hytte_fasilitet ?? [];
                  return (
                    <Link
                      key={h.id}
                      to={`/hytter/${h.id}`}
                      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <div className="relative">
                        {img ? (
                          <img
                            src={img}
                            alt={h.navn}
                            className="h-56 w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-56 w-full items-center justify-center bg-slate-100">
                            <ImageIcon className="h-12 w-12 text-slate-400" />
                          </div>
                        )}

                        {h.betjent && (
                          <span
                            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-sm font-semibold shadow-sm ${BETJENT_BADGE[h.betjent]}`}
                          >
                            {h.betjent[0].toUpperCase() + h.betjent.slice(1)}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col p-5">
                        <h3 className="text-2xl font-semibold tracking-tight text-gray-900">
                          {h.navn}
                        </h3>

                        {(h.omrade || h.adresse) && (
                          <div className="mt-2 flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <p className="text-sm">
                              {h.omrade}
                              {h.omrade && h.adresse && <span className="mx-2">•</span>}
                              {h.adresse}
                            </p>
                          </div>
                        )}

                        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <BedDouble className="h-4 w-4" />
                              <span>Senger</span>
                            </div>
                            <div className="mt-1 text-lg font-semibold text-gray-900">
                              {h.kapasitet_senger}
                            </div>
                          </div>

                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>Gjester</span>
                            </div>
                            <div className="mt-1 text-lg font-semibold text-gray-900">
                              {h.maks_gjester ?? "—"}
                            </div>
                          </div>
                        </div>

                        {fasiliteter.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {fasiliteter.slice(0, 4).map((f) => (
                              <span
                                key={f.kode}
                                className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900 ring-1 ring-emerald-100"
                              >
                                {fasilitetLabel.get(f.kode) ?? f.kode}
                              </span>
                            ))}
                            {fasiliteter.length > 4 && (
                              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                +{fasiliteter.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-base font-semibold text-gray-900">
                            {h.pris_per_natt ? `${h.pris_per_natt} kr/natt` : "Pris ikke satt"}
                          </div>

                          <span className="text-sm font-semibold text-emerald-700 group-hover:underline">
                            Se detaljer →
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
