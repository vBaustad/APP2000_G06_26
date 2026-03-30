
/**
 * Fil: TurMap.tsx
 * Utvikler(e): Ramona Cretulescu, Vebjørn Baustad
 * Beskrivelse: Leaflet kart-komponent (React Leaflet) som alltid rendrer riktig i cards/layout.
 */

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

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

type Props = {
  center: LatLng;
  title?: string;
};

export default function TurMap({ center, title }: Props) {
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
        <Marker position={center}>
          {title ? <Popup>{title}</Popup> : null}
        </Marker>
      </MapContainer>

      {title ? (
        <div className="border-t border-gray-100 bg-white px-3 py-2 text-xs text-gray-500">
          {title}
        </div>
      ) : null}
    </div>
  );
}