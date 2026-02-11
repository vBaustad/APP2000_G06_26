
/**
 * Fil: TurMap.tsx
 * Utvikler(e): Ramona Cretulescu, Vebjørn Baustad
 * Beskrivelse: Leaflet kart-komponent (React Leaflet) som alltid rendrer riktig i cards/layout.
 */
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

// Fix for marker icons in bundlers (Vite/React)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type LatLng = [number, number];

export default function TurMap({ center, title }: { center: LatLng; title?: string }) {
  // Viktig: wrapper må ha høyde, ellers ser det ut som “kartet ikke virker”
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        className="h-[260px] w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} />
      </MapContainer>

      {title ? (
        <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100 bg-white">
          {title}
        </div>
      ) : null}
    </div>
  );
}