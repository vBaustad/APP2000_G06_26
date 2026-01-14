import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { tripStops, TripStop } from '../data/tripStops';

const defaultIcon = L.icon({
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = defaultIcon;

function MapViewportUpdater({ coords }: { coords: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(coords, map.getZoom(), { duration: 0.6 });
  }, [coords, map]);

  return null;
}

export default function MapPage() {
  const [selectedTrip, setSelectedTrip] = useState<TripStop | null>(tripStops[0] ?? null);
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const filteredTrips = useMemo(() => {
    if (!normalizedQuery) return tripStops;
    return tripStops.filter((trip) =>
      `${trip.name} ${trip.city} ${trip.country}`.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  useEffect(() => {
    if (filteredTrips.length === 0) {
      if (selectedTrip !== null) {
        setSelectedTrip(null);
      }
      return;
    }

    if (!selectedTrip || !filteredTrips.some((trip) => trip.id === selectedTrip.id)) {
      setSelectedTrip(filteredTrips[0]);
    }
  }, [filteredTrips, selectedTrip]);

  const mapCenter: LatLngExpression =
    selectedTrip?.coords ?? filteredTrips[0]?.coords ?? tripStops[0]?.coords ?? [61.5049, 8.8143];

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-slate-50 lg:flex-row">
      <aside className="w-full bg-white p-6 flex flex-col lg:flex-[0.6]">
        <h1 className="text-2xl font-semibold text-slate-900">Finn din neste tur</h1>
        <p className="text-sm text-slate-500 mb-6">
          Utforsk hytter, ruter og turer. Filtrer listen for a finne rett opplevelse.
        </p>

        <div className="mb-6 space-y-2">
          <label htmlFor="trip-search" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sok etter destinasjon
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
              <p className="text-xs uppercase tracking-wider text-slate-400">{selectedTrip.dateRange}</p>
              <h2 className="text-xl font-semibold text-slate-900">{selectedTrip.name}</h2>
              <p className="text-sm text-slate-600">
                {selectedTrip.city}, {selectedTrip.country}
              </p>
              <p className="text-sm text-slate-700">{selectedTrip.description}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedTrip.highlights.map((highlight) => (
                  <span key={highlight} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {highlight}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Lagrede ruter</p>
              <div className="space-y-2">
                {filteredTrips.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                    Ingen reiser matcher soket ditt.
                  </p>
                ) : (
                  filteredTrips.map((trip) => {
                    const isActive = selectedTrip?.id === trip.id;
                    return (
                      <button
                        key={trip.id}
                        onClick={() => setSelectedTrip(trip)}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                          isActive
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'
                        }`}
                      >
                        <p className="text-sm font-semibold">{trip.name}</p>
                        <p className="text-xs opacity-80">
                          {trip.city}, {trip.country} - {trip.dateRange}
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
            Ingen treff akkurat na. Juster soket eller nullstill filteret.
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
            attribution='&copy; OpenStreetMap-bidragsytere'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {selectedTrip && <MapViewportUpdater coords={selectedTrip.coords} />}
          {filteredTrips.map((trip) => (
            <Marker key={trip.id} position={trip.coords} eventHandlers={{ click: () => setSelectedTrip(trip) }}>
              <Popup>
                <strong>{trip.name}</strong>
                <p className="text-sm text-slate-600">
                  {trip.city}, {trip.country}
                </p>
                <p className="text-xs text-slate-500">{trip.dateRange}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </section>
    </div>
  );
}
