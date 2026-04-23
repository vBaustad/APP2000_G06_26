
/**
 * Fil: TurMap.tsx
 * Utvikler(e): Ramona Cretulescu, Vebjørn Baustad
 * Beskrivelse: Leaflet kart-komponent (React Leaflet) som alltid rendrer riktig i cards/layout.
 *
 * KI-bruk: Claude (Anthropic) og GitHub Copilot er brukt som verktøy
 * under utvikling. All kode er lest, forstått og testet. Se rapportens
 * kapittel "Kommentarer til bruk/tilpassing av kode".
 */

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

// Fix for marker icons in bundlers (Vite/React)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const endMarkerIcon = L.divIcon({
  className: "custom-end-marker",
  html: `
    <div style="
      width: 28px;
      height: 28px;
      border-radius: 9999px;
      background: #dc2626;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      border: 2px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    ">S</div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

const cabinMarkerIcon = L.divIcon({
  className: "custom-cabin-mini-marker",
  html: `
    <div style="
      width: 26px;
      height: 26px;
      border-radius: 9999px;
      background: #059669;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      border: 2px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    ">H</div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -13],
});

type LatLng = [number, number];

type CabinMarker = {
  id: number;
  navn: string;
  lat: number;
  lng: number;
};

type Props = {
  center: LatLng;
  title?: string;
  routePoints?: LatLng[];
  cabins?: CabinMarker[];
};

function MapBoundsUpdater({
  center,
  routePoints,
}: {
  center: LatLng;
  routePoints: LatLng[];
}) {
  const map = useMap();

  useEffect(() => {
    if (routePoints.length >= 2) {
      map.fitBounds(routePoints, {
        padding: [64, 64],
        maxZoom: 11,
      });
      return;
    }

    map.setView(center, 12);
  }, [center, map, routePoints]);

  return null;
}

// Forskyver en posisjon når den ligger "oppå" et referansepunkt, slik at
// markørene ikke rendres rett oppå hverandre på kartet.
function offsetIfCollides(
  pos: LatLng,
  reference: LatLng,
  deltaLng = 0.0015,
): LatLng {
  const TOL = 0.0005;
  if (Math.abs(pos[0] - reference[0]) < TOL && Math.abs(pos[1] - reference[1]) < TOL) {
    return [pos[0], pos[1] + deltaLng];
  }
  return pos;
}

export default function TurMap({ center, title, routePoints = [], cabins = [] }: Props) {
  const hasRoute = routePoints.length >= 2;
  const endPoint = hasRoute ? routePoints[routePoints.length - 1] : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        className="h-[260px] w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundsUpdater center={center} routePoints={routePoints} />
        {hasRoute ? (
          <Polyline
            positions={routePoints}
            pathOptions={{ color: "#047857", weight: 5, opacity: 0.85 }}
          />
        ) : null}
        <Marker position={center}>
          {title ? <Popup>{title}</Popup> : null}
        </Marker>
        {endPoint ? (
          <Marker position={endPoint} icon={endMarkerIcon}>
            <Popup>{title ? `${title} · Sluttpunkt` : "Sluttpunkt"}</Popup>
          </Marker>
        ) : null}
        {cabins.map((cabin) => {
          const base: LatLng = [cabin.lat, cabin.lng];
          const pos = endPoint
            ? offsetIfCollides(offsetIfCollides(base, center), endPoint)
            : offsetIfCollides(base, center);
          return (
            <Marker key={cabin.id} position={pos} icon={cabinMarkerIcon}>
              <Popup>{cabin.navn}</Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {title ? (
        <div className="border-t border-gray-100 bg-white px-3 py-2 text-xs text-gray-500">
          {title}
        </div>
      ) : null}
    </div>
  );
}
