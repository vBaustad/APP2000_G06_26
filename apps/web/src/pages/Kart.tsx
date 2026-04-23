/**
 * Fil: Kart.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Oversikt over turer og hytter med kart som viser lokasjoner
 */
/*
 * Videreutviklet av: Ramona Cretulescu
 * Endringer:
 * Leser valgt aktivitet fra URL-en (f.eks. /map?activity=skitur) Filterer hver turliste på aktivitet i tilegg til eksisterende tekstsøk.
 * f.eks.("/map?activity=skytur") viser kun skyturer.
 * Filteret kombineres med eksisterende søk. Hvis ingen aktivitet er valgt i URL-en, vises alle turer som før.
 * Viser aktivt filter øverst i sidemenyen med mulighet for å fjerne det.
 *
 * Videreutviklet av: Aleksandra Cudakiewicz
 * Endringer:
 * Koblet kartet til turer og hytter fra backend/databasen i stedet for hardkodede data.
 * Viser turer og hytter med ulike markører i kartet.
 * La til popup med bilde og informasjon for valgt tur eller hytte.
 */


import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";
import { LocateFixed } from "lucide-react";
import { getTours } from "../services/toursApi";
import type { Tour } from "../types/tour";

function circleMarkerHtml(letter: string, bgColor: string) {
  return `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 9999px;
      background: ${bgColor};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 700;
      border: 2px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    ">${letter}</div>
  `;
}

const tourIcon = L.divIcon({
  className: "custom-tour-marker",
  html: circleMarkerHtml("T", "#b45309"),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const cabinIcon = L.divIcon({
  className: "custom-cabin-marker",
  html: circleMarkerHtml("H", "#059669"),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const userPositionIcon = L.divIcon({
  className: "custom-user-marker",
  html: `
    <div style="
      width: 18px;
      height: 18px;
      border-radius: 9999px;
      background: #2563eb;
      border: 3px solid white;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.25), 0 4px 12px rgba(0, 0, 0, 0.25);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -9],
});

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

type MapTour = Tour & {
  coords: [number, number];
  highlights: string[];
  dateLabel: string;
};

type Cabin = {
  id: number;
  navn: string;
  omrade: string | null;
  adresse: string | null;
  bilde_url: string | null;
  pris_per_natt: number | string | null;
  kapasitet_senger: number;
  lat: number | string | null;
  lng: number | string | null;
};

type MapCabin = Cabin & {
  coords: [number, number];
  imageUrl: string | null;
};

type ViewTab = "all" | "tours" | "cabins";

function MapViewportUpdater({ coords, zoom }: { coords: LatLngExpression; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(coords, zoom, { duration: 0.6 });
  }, [coords, map, zoom]);

  return null;
}

function hashStringToIndex(s: string, mod: number) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return mod === 0 ? 0 : h % mod;
}

function ensureTourImage(tour: Tour): Tour {
  if (tour.imageUrl && tour.imageUrl.trim()) return tour;
  const idx = hashStringToIndex(tour.id ?? tour.title ?? "tour", TOUR_IMAGES.length);
  return { ...tour, imageUrl: TOUR_IMAGES[idx] };
}

function resolveCabinImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${import.meta.env.VITE_API_URL}${url}`;
  return url;
}

function parseCoord(value: number | string | null): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapCabinToMarker(cabin: Cabin): MapCabin | null {
  const lat = parseCoord(cabin.lat);
  const lng = parseCoord(cabin.lng);

  if (lat === null || lng === null) return null;

  return {
    ...cabin,
    coords: [lat, lng],
    imageUrl: resolveCabinImageUrl(cabin.bilde_url),
  };
}

export default function Kart() {
  const { t } = useTranslation("kart");
  const [searchParams, setSearchParams] = useSearchParams();
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [allCabins, setAllCabins] = useState<Cabin[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<MapTour | null>(null);
  const [selectedCabin, setSelectedCabin] = useState<MapCabin | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  function handleLocate() {
    if (!("geolocation" in navigator)) {
      setLocateError(t("locate.unsupported"));
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude]);
        setSelectedTrip(null);
        setSelectedCabin(null);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocateError(t("locate.denied"));
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocateError(t("locate.unavailable"));
        } else {
          setLocateError(t("locate.generic"));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const tourMarkerRefs = useRef<Record<string, L.Marker | null>>({});
  const cabinMarkerRefs = useRef<Record<string, L.Marker | null>>({});

  function buildHighlights(tour: Tour): string[] {
    return [
      `${tour.distanceKm} km`,
      `${tour.durationHours} t`,
      tour.difficulty,
      tour.type || t("fallbacks.defaultType"),
    ];
  }

  function buildDateLabel(tour: Tour): string {
    if (!tour.datoer?.length) return t("dates.none");
    if (tour.datoer.length === 1) return t("dates.one");
    return t("dates.many", { n: tour.datoer.length });
  }

  function mapTourToCard(tour: Tour): MapTour | null {
    if (!tour.mapCenter) return null;

    return {
      ...tour,
      coords: tour.mapCenter,
      highlights: buildHighlights(tour),
      dateLabel: buildDateLabel(tour),
    };
  }

  function collectActiveFilters(params: URLSearchParams): Array<{ key: string; label: string }> {
    const filters: Array<{ key: string; label: string }> = [];
    const difficulty = params.get("difficulty");
    const region = params.get("region");
    const fellestur = params.get("fellestur");

    if (difficulty) filters.push({ key: "difficulty", label: t("filters.difficulty", { value: difficulty }) });
    if (region) filters.push({ key: "region", label: t("filters.region", { value: region }) });
    if (fellestur === "1") filters.push({ key: "fellestur", label: t("filters.fellestur") });

    return filters;
  }

  useEffect(() => {
    let active = true;

    async function loadTours() {
      try {
        const tours = await getTours();
        if (active) {
          setAllTours(Array.isArray(tours) ? tours.map(ensureTourImage) : []);
        }
      } catch (error) {
        console.error("Kunne ikke hente turer til kartet:", error);
        if (active) {
          setAllTours([]);
        }
      }
    }

    async function loadCabins() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/hytter`);
        const cabins = res.ok ? ((await res.json()) as Cabin[]) : [];
        if (active) {
          setAllCabins(Array.isArray(cabins) ? cabins : []);
        }
      } catch (error) {
        console.error("Kunne ikke hente hytter til kartet:", error);
        if (active) {
          setAllCabins([]);
        }
      }
    }

    loadTours();
    loadCabins();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const selectedTourId = searchParams.get("tourId");
  const selectedCabinId = searchParams.get("cabinId");
  const currentView = (searchParams.get("view") as ViewTab | null) ?? "all";
  const difficultyFilter = searchParams.get("difficulty");
  const regionFilter = searchParams.get("region");
  const fellesturOnly = searchParams.get("fellestur") === "1";

  const filteredTrips = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allTours
      .map((tour) => mapTourToCard(tour))
      .filter((tour): tour is MapTour => tour !== null)
      .filter((tour) => {
        const matchesQuery =
          !normalizedQuery ||
          `${tour.title} ${tour.location} ${tour.region} ${tour.type ?? ""}`
            .toLowerCase()
            .includes(normalizedQuery);
        const matchesDifficulty = !difficultyFilter || tour.difficulty === difficultyFilter;
        const matchesRegion = !regionFilter || tour.region === regionFilter;
        const matchesFellestur = !fellesturOnly || (tour.datoer?.length ?? 0) > 0;

        return matchesQuery && matchesDifficulty && matchesRegion && matchesFellestur;
      });
  }, [allTours, difficultyFilter, fellesturOnly, query, regionFilter, t]);

  const visibleCabins = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allCabins
      .map(mapCabinToMarker)
      .filter((cabin): cabin is MapCabin => cabin !== null)
      .filter((cabin) => {
        if (!normalizedQuery) return true;

        return `${cabin.navn} ${cabin.omrade ?? ""} ${cabin.adresse ?? ""}`
          .toLowerCase()
          .includes(normalizedQuery);
      });
  }, [allCabins, query]);

  const displayedTrips = currentView === "cabins" ? [] : filteredTrips;
  const displayedCabins = currentView === "tours" ? [] : visibleCabins;

  useEffect(() => {
    if (selectedCabinId || currentView === "cabins") return;

    if (displayedTrips.length === 0) {
      if (selectedTrip !== null) {
        setSelectedTrip(null);
      }
      return;
    }

    if (!selectedTourId) {
      if (selectedTrip !== null) {
        setSelectedTrip(null);
      }
      return;
    }

    const preferredTrip =
      displayedTrips.find((tour) => tour.id === selectedTourId) ??
      displayedTrips.find((tour) => tour.id === selectedTrip?.id) ??
      null;

    if (!preferredTrip) {
      setSelectedTrip(null);
      return;
    }

    if (!selectedTrip || preferredTrip.id !== selectedTrip.id) {
      setSelectedTrip(preferredTrip);
    }
  }, [currentView, displayedTrips, selectedCabinId, selectedTourId, selectedTrip]);

  useEffect(() => {
    if (!selectedCabinId) {
      if (selectedCabin !== null) {
        setSelectedCabin(null);
      }
      return;
    }

    const preferredCabin =
      displayedCabins.find((cabin) => String(cabin.id) === selectedCabinId) ??
      displayedCabins.find((cabin) => cabin.id === selectedCabin?.id) ??
      null;

    if (!preferredCabin) {
      setSelectedCabin(null);
      return;
    }

    if (!selectedCabin || preferredCabin.id !== selectedCabin.id) {
      setSelectedCabin(preferredCabin);
    }
  }, [displayedCabins, selectedCabin, selectedCabinId]);

  useEffect(() => {
    if (!selectedTrip) return;

    const marker = tourMarkerRefs.current[selectedTrip.id];
    marker?.openPopup();
  }, [selectedTrip]);

  useEffect(() => {
    if (!selectedCabin) return;

    const marker = cabinMarkerRefs.current[String(selectedCabin.id)];
    marker?.openPopup();
  }, [selectedCabin]);

  function handleQueryChange(value: string) {
    setQuery(value);

    const next = new URLSearchParams(searchParams);
    if (value.trim()) {
      next.set("q", value);
    } else {
      next.delete("q");
    }
    next.delete("tourId");
    next.delete("cabinId");
    setSearchParams(next, { replace: true });
  }

  function handleSelectTrip(trip: MapTour) {
    setSelectedTrip(trip);
    setSelectedCabin(null);

    const next = new URLSearchParams(searchParams);
    next.set("tourId", trip.id);
    next.delete("cabinId");
    setSearchParams(next, { replace: true });
  }

  function handleSelectCabin(cabin: MapCabin) {
    setSelectedCabin(cabin);
    setSelectedTrip(null);

    const next = new URLSearchParams(searchParams);
    next.set("cabinId", String(cabin.id));
    next.delete("tourId");
    setSearchParams(next, { replace: true });
  }

  function clearSelection() {
    setSelectedTrip(null);
    setSelectedCabin(null);

    const next = new URLSearchParams(searchParams);
    next.delete("tourId");
    next.delete("cabinId");
    setSearchParams(next, { replace: true });
  }

  function clearFilters() {
    const next = new URLSearchParams(searchParams);
    next.delete("difficulty");
    next.delete("region");
    next.delete("fellestur");
    next.delete("tourId");
    next.delete("cabinId");
    setSearchParams(next);
  }

  function handleViewChange(view: ViewTab) {
    const next = new URLSearchParams(searchParams);

    if (view === "all") {
      next.delete("view");
    } else {
      next.set("view", view);
    }

    if (view === "tours") {
      next.delete("cabinId");
      setSelectedCabin(null);
    }

    if (view === "cabins") {
      next.delete("tourId");
      setSelectedTrip(null);
    }

    setSearchParams(next, { replace: true });
  }

  const activeFilters = collectActiveFilters(searchParams);
  const mapCenter: LatLngExpression =
    selectedCabin?.coords ?? selectedTrip?.coords ?? displayedTrips[0]?.coords ?? displayedCabins[0]?.coords ?? [61.5049, 8.8143];
  const selectedZoom = selectedCabin ? 13 : selectedTrip ? 12 : 6;

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-slate-50 lg:h-[calc(100vh-64px)] lg:flex-row lg:overflow-hidden">
      <aside className="flex w-full flex-col bg-white p-6 lg:flex-[0.6] lg:overflow-y-auto">
        <h1 className="text-2xl font-semibold text-slate-900">{t("heading")}</h1>
        <p className="mb-4 text-sm text-slate-500">
          {t("subheading")}
        </p>

        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LocateFixed className="h-4 w-4" />
          {locating ? t("locate.busy") : t("locate.button")}
        </button>

        {locateError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {locateError}
          </div>
        )}

        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t("viewToggle.label")}
          </p>
          <div className="grid grid-cols-3 rounded-2xl bg-slate-100 p-1">
            {([
              { key: "tours", label: t("viewToggle.tours") },
              { key: "cabins", label: t("viewToggle.cabins") },
              { key: "all", label: t("viewToggle.all") },
            ] as { key: ViewTab; label: string }[]).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleViewChange(tab.key)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  currentView === tab.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-slate-500 underline hover:text-slate-800"
            >
              {t("filters.clear")}
            </button>
          </div>
        )}

        {activeFilters.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <span
                key={filter.key}
                className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {filter.label}
              </span>
            ))}
          </div>
        )}

        <div className="mb-6 space-y-2">
          <label
            htmlFor="trip-search"
            className="text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            {t("search.label")}
          </label>
          <input
            id="trip-search"
            type="search"
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-800 outline-none focus:border-slate-500 focus:bg-white"
          />
        </div>

        <>
          {selectedCabin ? (
            <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs uppercase tracking-wider text-emerald-700">{t("selected.cabinLabel")}</p>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-full px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-white/70 hover:text-slate-800"
                  aria-label={t("selected.closeCabinAria")}
                >
                  ×
                </button>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">{selectedCabin.navn}</h2>
              <p className="text-sm text-slate-600">
                {selectedCabin.omrade || selectedCabin.adresse || t("fallbacks.unknownArea")}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  {t("selected.beds", { n: selectedCabin.kapasitet_senger })}
                </span>
                {selectedCabin.pris_per_natt && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                    {t("selected.pricePerNight", { price: selectedCabin.pris_per_natt })}
                  </span>
                )}
              </div>
              <Link
                to={`/hytter/${selectedCabin.id}`}
                className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {t("selected.cabinDetails")}
              </Link>
            </div>
          ) : selectedTrip ? (
            <div className="space-y-2 rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-end">
                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-full px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  aria-label={t("selected.closeTripAria")}
                >
                  ×
                </button>
              </div>
              <img
                src={selectedTrip.imageUrl || "/images/trip-card-placeholder.jpg"}
                alt={selectedTrip.title}
                className="mb-3 h-28 w-full rounded-xl object-cover"
              />
              <p className="text-xs uppercase tracking-wider text-slate-400">{selectedTrip.dateLabel}</p>
              <h2 className="text-xl font-semibold text-slate-900">{selectedTrip.title}</h2>
              <p className="text-sm text-slate-600">
                {selectedTrip.location} • {selectedTrip.region}
              </p>
              <p className="text-sm text-slate-700">
                {selectedTrip.description || t("selected.tripFallbackDescription")}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedTrip.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
              <Link
                to={`/turer/${selectedTrip.id}`}
                className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {t("selected.tripDetails")}
              </Link>
            </div>
          ) : null}

          {currentView !== "cabins" && (displayedTrips.length > 0 || currentView !== "tours") && (
            <div className="mt-6 space-y-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                {t("results.tours", { n: displayedTrips.length })}
              </p>
              <div className="space-y-2">
                {displayedTrips.map((trip) => {
                  const isActive = selectedTrip?.id === trip.id;
                  return (
                    <button
                      key={trip.id}
                      type="button"
                      onClick={() => handleSelectTrip(trip)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        isActive
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-400"
                      }`}
                    >
                      <p className="text-sm font-semibold">{trip.title}</p>
                      <p className="text-xs opacity-80">
                        {trip.location} • {trip.region}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(displayedCabins.length > 0 || currentView !== "cabins") && (
            <div className="mt-6 space-y-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                {t("results.cabins", { n: displayedCabins.length })}
              </p>
              <div className="space-y-2">
                {displayedCabins.map((cabin) => {
                  const isActive = selectedCabin?.id === cabin.id;
                  return (
                    <button
                      key={cabin.id}
                      type="button"
                      onClick={() => handleSelectCabin(cabin)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        isActive
                          ? "border-emerald-700 bg-emerald-700 text-white"
                          : "border-slate-200 bg-white text-slate-800 hover:border-emerald-400"
                      }`}
                    >
                      <p className="text-sm font-semibold">{cabin.navn}</p>
                      <p className="text-xs opacity-80">
                        {cabin.omrade || cabin.adresse || t("fallbacks.unknownArea")}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {displayedTrips.length === 0 && displayedCabins.length === 0 && (
            <div className="mt-10 flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
            {currentView === "tours"
              ? t("empty.tours")
              : currentView === "cabins"
                ? t("empty.cabins")
                : t("empty.all")}
            </div>
          )}
        </>
      </aside>

      <section className="min-h-80 flex-1 lg:flex-[1.4] lg:h-full">
        <MapContainer center={mapCenter} zoom={6} className="h-full min-h-80 overflow-hidden" scrollWheelZoom>
          <TileLayer
            attribution={t("map.attribution")}
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {(selectedTrip || selectedCabin) && (
            <MapViewportUpdater
              coords={(selectedCabin?.coords ?? selectedTrip?.coords) as LatLngExpression}
              zoom={selectedZoom}
            />
          )}
          {userPosition && !selectedTrip && !selectedCabin && (
            <MapViewportUpdater coords={userPosition as LatLngExpression} zoom={12} />
          )}
          {userPosition && (
            <Marker position={userPosition} icon={userPositionIcon}>
              <Popup>{t("locate.popup")}</Popup>
            </Marker>
          )}
          {displayedTrips.map((trip) => (
            <Marker
              key={trip.id}
              icon={tourIcon}
              ref={(ref) => {
                tourMarkerRefs.current[trip.id] = ref;
              }}
              position={trip.coords}
              eventHandlers={{ click: () => handleSelectTrip(trip) }}
            >
              <Popup>
                <div className="w-[220px] overflow-hidden rounded-xl">
                  <img
                    src={trip.imageUrl || "/images/trip-card-placeholder.jpg"}
                    alt={trip.title}
                    className="h-28 w-full rounded-lg object-cover"
                  />
                  <div className="pt-3">
                    <strong className="block text-base text-slate-900">{trip.title}</strong>
                    <p className="mt-1 text-sm text-slate-600">
                      {trip.location} • {trip.region}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">{trip.dateLabel}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          {displayedCabins.map((cabin) => (
            <Marker
              key={`cabin-${cabin.id}`}
              icon={cabinIcon}
              ref={(ref) => {
                cabinMarkerRefs.current[String(cabin.id)] = ref;
              }}
              position={cabin.coords}
              eventHandlers={{ click: () => handleSelectCabin(cabin) }}
            >
              <Popup>
                <div className="w-[220px] overflow-hidden rounded-xl">
                  <img
                    src={cabin.imageUrl || "/images/cabins/u0wj3hct0e98ocz1bqwy.webp"}
                    alt={cabin.navn}
                    className="h-28 w-full rounded-lg object-cover"
                  />
                  <div className="pt-3">
                    <strong className="block text-base text-slate-900">{cabin.navn}</strong>
                    <p className="mt-1 text-sm text-slate-600">
                      {cabin.omrade || cabin.adresse || t("fallbacks.unknownArea")}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {cabin.pris_per_natt
                        ? t("popup.bedsWithPrice", { beds: cabin.kapasitet_senger, price: cabin.pris_per_natt })
                        : t("popup.bedsOnly", { beds: cabin.kapasitet_senger })}
                    </p>
                    <Link
                      to={`/hytter/${cabin.id}`}
                      className="mt-3 inline-flex text-sm font-semibold text-emerald-700 hover:underline"
                    >
                      {t("popup.viewCabin")}
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </section>
    </div>
  );
}
