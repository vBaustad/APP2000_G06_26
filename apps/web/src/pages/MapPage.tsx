import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSearchParams, Link } from "react-router-dom";
import { getTours } from "../services/toursApi";

const defaultIcon = L.icon({
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).toString(),
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).toString(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = defaultIcon;

function MapViewportUpdater({ coords }: { coords: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(coords, map.getZoom(), { duration: 0.6 });
  }, [coords, map]);

  return null;
}

type Tour = {
  _id?: string;
  id?: string;
  title: string;
  location: string;
  region: string;
  difficulty: string;
  distanceKm: number;
  durationHours: number;
  elevationM: number;
  gear?: string[];
  imageUrl?: string;
  geometry?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
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

function ensureTourImage(tour: Tour): Tour {
  if (tour.imageUrl && tour.imageUrl.trim()) return tour;
  const idx = hashStringToIndex(tour._id ?? tour.id ?? tour.title ?? "tour", TOUR_IMAGES.length);
  return { ...tour, imageUrl: TOUR_IMAGES[idx] };
}

function getLatLng(tour: Tour): [number, number] | null {
  if (
    !tour.geometry ||
    !Array.isArray(tour.geometry.coordinates) ||
    tour.geometry.coordinates.length !== 2
  ) {
    return null;
  }

  const [lng, lat] = tour.geometry.coordinates;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }

  return [lat, lng];
}

export default function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Tour | null>(null);
  const [query, setQuery] = useState("");

  const activeActivity = searchParams.get("activity");
  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    async function loadTours() {
      try {
        const data = await getTours();

        const toursWithCoords = Array.isArray(data)
          ? data
              .map((tour: Tour) => ensureTourImage(tour))
              .filter((tour: Tour) => getLatLng(tour) !== null)
          : [];

        setAllTours(toursWithCoords);
        setSelectedTrip(toursWithCoords[0] ?? null);
      } catch (error) {
        console.error("Kunne ikke hente turer:", error);
        setAllTours([]);
        setSelectedTrip(null);
      }
    }

    loadTours();
  }, []);

  const filteredTrips = useMemo(() => {
    return allTours.filter((trip) => {
      const matchesQuery =
        !normalizedQuery ||
        `${trip.title ?? ""} ${trip.location ?? ""} ${trip.region ?? ""} ${trip.difficulty ?? ""}`
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesActivity = !activeActivity;

      return matchesQuery && matchesActivity;
    });
  }, [allTours, normalizedQuery, activeActivity]);

  useEffect(() => {
    if (filteredTrips.length === 0) {
      setSelectedTrip(null);
      return;
    }

    if (
      !selectedTrip ||
      !filteredTrips.some(
        (trip) => (trip._id || trip.id) === (selectedTrip._id || selectedTrip.id)
      )
    ) {
      setSelectedTrip(filteredTrips[0]);
    }
  }, [filteredTrips, selectedTrip]);

  const selectedCoords = selectedTrip ? getLatLng(selectedTrip) : null;
  const firstCoords = filteredTrips[0] ? getLatLng(filteredTrips[0]) : null;

  const mapCenter: LatLngExpression =
    selectedCoords ?? firstCoords ?? [61.5049, 8.8143];

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-slate-50 lg:flex-row">
      <aside className="w-full bg-white p-6 flex flex-col lg:flex-[0.6]">
        <h1 className="text-2xl font-semibold text-slate-900">Finn din neste tur</h1>
        <p className="text-sm text-slate-500 mb-6">
          Utforsk turer på kartet. Filtrer listen for å finne rett opplevelse.
        </p>

        {activeActivity && (
          <div className="mb-6 flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              Filter: {activeActivity}
            </span>

            <button
              onClick={() => setSearchParams({})}
              className="text-sm font-medium text-slate-500 underline hover:text-slate-800"
            >
              Fjern filter
            </button>
          </div>
        )}

        <div className="mb-6 space-y-2">
          <label
            htmlFor="trip-search"
            className="text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Søk etter destinasjon
          </label>
          <input
            id="trip-search"
            type="search"
            placeholder="F.eks. Hardangervidda eller Lofoten"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-800 outline-none focus:border-slate-500 focus:bg-white"
          />
        </div>

        {selectedTrip ? (
          <>
            <div className="space-y-2 rounded-xl border border-slate-200 p-4">
              <img
                src={selectedTrip.imageUrl || "/images/trip-card-placeholder.jpg"}
                alt={selectedTrip.title}
                className="mb-4 h-40 w-full rounded-xl object-cover"
              />
              <h2 className="text-xl font-semibold text-slate-900">{selectedTrip.title}</h2>
              <p className="text-sm text-slate-600">
                {selectedTrip.location}, {selectedTrip.region}
              </p>
              <p className="text-sm text-slate-700">
                Vanskelighetsgrad: {selectedTrip.difficulty}
              </p>
              <p className="text-sm text-slate-700">
                {selectedTrip.distanceKm} km • {selectedTrip.durationHours} t • {selectedTrip.elevationM} hm
              </p>

              <Link
                to={`/tours/${selectedTrip._id || selectedTrip.id}`}
                className="inline-block pt-2 text-sm font-semibold text-emerald-700 hover:underline"
              >
                Se mer
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Lagrede ruter</p>

              <div className="space-y-2">
                {filteredTrips.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                    Ingen turer matcher søket ditt.
                  </p>
                ) : (
                  filteredTrips.map((trip) => {
                    const isActive =
                      (selectedTrip._id || selectedTrip.id) === (trip._id || trip.id);

                    return (
                      <button
                        key={trip._id || trip.id}
                        onClick={() => setSelectedTrip(trip)}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                          isActive
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-800 hover:border-slate-400"
                        }`}
                      >
                        <p className="text-sm font-semibold">{trip.title}</p>
                        <p className="text-xs opacity-80">
                          {trip.location}, {trip.region}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="mt-10 flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
            Ingen treff akkurat nå. Sjekk at turene i databasen har geometry.coordinates.
          </div>
        )}
      </aside>

      <section className="flex-1 min-h-80 lg:flex-[1.4]">
        <MapContainer
          center={mapCenter}
          zoom={5}
          className="h-full min-h-80 overflow-hidden"
          scrollWheelZoom
        >
          <TileLayer
            attribution="&copy; OpenStreetMap-bidragsytere"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {selectedCoords && <MapViewportUpdater coords={selectedCoords} />}

          {filteredTrips.map((trip) => {
            const coords = getLatLng(trip);
            if (!coords) return null;

            return (
              <Marker
                key={trip._id || trip.id}
                position={coords}
                eventHandlers={{ click: () => setSelectedTrip(trip) }}
              >
                <Popup>
                  <img
                    src={trip.imageUrl || "/images/trip-card-placeholder.jpg"}
                    alt={trip.title}
                    className="mb-3 h-28 w-full rounded-lg object-cover"
                  />
                  <strong>{trip.title}</strong>
                  <p className="text-sm text-slate-600">
                    {trip.location}, {trip.region}
                  </p>
                  <p className="text-xs text-slate-500">
                    {trip.distanceKm} km • {trip.durationHours} t
                  </p>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </section>
    </div>
  );
}
