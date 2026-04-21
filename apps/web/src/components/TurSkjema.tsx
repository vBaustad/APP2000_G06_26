
/**
 * Fil: TurSkjema.tsx
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu.
 * Beskrivelse: Skjema for å opprette og redigere turer.
 */

import { useMemo, useState, type FormEvent } from "react";
import type { Tour, Region } from "../types/tour";

type Props =
  | { mode: "create"; onCreate: (tour: Tour) => void }
  | { mode: "edit"; initialTour: Tour; onUpdate: (tour: Tour) => void };

function toNumber(v: string, fallback = 0) {
  const normalized = v.replace(",", ".").trim();
  const n = Number(normalized);
  return Number.isFinite(n) ? n : fallback;
}

function gearToString(gear: string[]) {
  return gear.join(", ");
}

function stringToGear(v: string) {
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function makeId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `tour_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

const REGIONS: Region[] = [
  "Nord-Norge",
  "Trøndelag",
  "Østlandet",
  "Sørlandet",
  "Vestlandet",
];

// Samme filer som du har i /public/images/tours
const TOUR_IMAGES = [
  { value: "", label: "Bruk automatisk / standard" },
  { value: "/images/tours/floibanen.jpg", label: "Fløibanen" },
  { value: "/images/tours/oslofjord.jpg", label: "Oslofjorden" },
  { value: "/images/tours/geiranger.jpg", label: "Geiranger" },
  { value: "/images/tours/fjelltur-1.jpg", label: "Fjelltur 1" },
  { value: "/images/tours/fjelltur-2.jpg", label: "Fjelltur 2" },
  { value: "/images/tours/fjelltur-3.webp", label: "Fjelltur 3" },
  { value: "/images/tours/bergen-fjelloping.avif", label: "Bergen fjelløping" },
  { value: "/images/tours/fjell-okt.avif", label: "Fjelløkt" },
  { value: "/images/tours/1635176958-noedt-til-aa-loepe.avif", label: "Nødt til å løpe" },
];

export default function TurSkjema(props: Props) {
  const initial = useMemo<Tour>(() => {
    if (props.mode === "edit") return props.initialTour;

    return {
      id: makeId(),
      title: "",
      location: "",
      region: "Østlandet",
      distanceKm: 0,
      elevationM: 0,
      durationHours: 0,
      difficulty: "Lett",
      gear: [],
      imageUrl: "",
      imageLabel: "IMAGE PLACEHOLDER",
    };
  }, [props]);

  const [title, setTitle] = useState(initial.title);
  const [location, setLocation] = useState(initial.location);
  const [region, setRegion] = useState<Region>(initial.region);
  const [distanceKm, setDistanceKm] = useState(String(initial.distanceKm || ""));
  const [elevationM, setElevationM] = useState(String(initial.elevationM || ""));
  const [durationHours, setDurationHours] = useState(String(initial.durationHours || ""));
  const [difficulty, setDifficulty] = useState<Tour["difficulty"]>(initial.difficulty);
  const [gear, setGear] = useState(gearToString(initial.gear));
  const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const cleanTitle = title.trim();
    const cleanLocation = location.trim();

    if (!cleanTitle) {
      setError("Tittel må fylles ut.");
      return;
    }

    if (!cleanLocation) {
      setError("Sted må fylles ut.");
      return;
    }

    const parsedDistanceKm = toNumber(distanceKm, NaN);
    const parsedElevationM = toNumber(elevationM, NaN);
    const parsedDurationHours = toNumber(durationHours, NaN);

    if (!Number.isFinite(parsedDistanceKm)) {
      setError("Distanse må være et gyldig tall.");
      return;
    }

    if (!Number.isFinite(parsedElevationM)) {
      setError("Høydemeter må være et gyldig tall.");
      return;
    }

    if (!Number.isFinite(parsedDurationHours)) {
      setError("Varighet må være et gyldig tall.");
      return;
    }

    if (parsedDistanceKm <= 0) {
      setError("Distanse må være større enn 0 km.");
      return;
    }

    if (parsedElevationM < 0) {
      setError("Høydemeter kan ikke være negativt.");
      return;
    }

    if (parsedDurationHours <= 0) {
      setError("Varighet må være større enn 0 timer.");
      return;
    }

    const next: Tour = {
      id: initial.id,
      title: cleanTitle,
      location: cleanLocation,
      region,
      distanceKm: parsedDistanceKm,
      elevationM: parsedElevationM,
      durationHours: parsedDurationHours,
      difficulty,
      gear: stringToGear(gear),
      imageUrl: imageUrl || undefined,
      imageLabel: initial.imageLabel,
    };

    if (props.mode === "create") {
      props.onCreate(next);
    } else {
      props.onUpdate(next);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-gray-700">Tittel</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="F.eks. Utopiatoppen Rundtur"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-gray-700">Sted</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="F.eks. Grønndalen"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-gray-700">Region</span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as Region)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-gray-700">Vanskelighetsgrad</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Tour["difficulty"])}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Lett">Lett</option>
            <option value="Middels">Middels</option>
            <option value="Krevende">Krevende</option>
            <option value="Ekspert">Ekspert</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-gray-700">Distanse (km)</span>
          <input
            inputMode="decimal"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="8.2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-gray-700">Høydemeter (m)</span>
          <input
            inputMode="numeric"
            value={elevationM}
            onChange={(e) => setElevationM(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="520"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-gray-700">Varighet (timer)</span>
          <input
            inputMode="decimal"
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="4.5"
          />
        </label>
      </div>

      <label className="grid gap-1 text-sm">
        <span className="font-medium text-gray-700">Utstyr (komma-separert)</span>
        <input
          value={gear}
          onChange={(e) => setGear(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Fjellsko, Regnjakke, Drikkeflaske"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium text-gray-700">Bilde</span>
        <select
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {TOUR_IMAGES.map((o) => (
            <option key={o.value || "auto"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-500">
          Hvis du velger “automatisk”, får turen et bilde automatisk basert på id.
        </span>
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          {props.mode === "create" ? "Legg til tur" : "Lagre endringer"}
        </button>
      </div>
    </form>
  );
}