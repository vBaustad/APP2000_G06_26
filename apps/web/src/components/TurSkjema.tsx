/**
 * Fil: TurSkjema.tsx
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu.
 * Beskrivelse: Skjema for å opprette og redigere turer.
 */

import { useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
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

const TOUR_IMAGES = [
  { value: "", tKey: "auto" },
  { value: "/images/tours/floibanen.jpg", tKey: "floibanen" },
  { value: "/images/tours/oslofjord.jpg", tKey: "oslofjord" },
  { value: "/images/tours/geiranger.jpg", tKey: "geiranger" },
  { value: "/images/tours/fjelltur-1.jpg", tKey: "fjelltur1" },
  { value: "/images/tours/fjelltur-2.jpg", tKey: "fjelltur2" },
  { value: "/images/tours/fjelltur-3.webp", tKey: "fjelltur3" },
  { value: "/images/tours/bergen-fjelloping.avif", tKey: "bergen" },
  { value: "/images/tours/fjell-okt.avif", tKey: "fjellokt" },
  { value: "/images/tours/1635176958-noedt-til-aa-loepe.avif", tKey: "running" },
];

const DIFFICULTY_KEY: Record<Tour["difficulty"], string> = {
  Lett: "diffEasy",
  Middels: "diffMedium",
  Krevende: "diffHard",
  Ekspert: "diffExpert",
};

export default function TurSkjema(props: Props) {
  const { t } = useTranslation("opprettTur");
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
      setError(t("form.errorTitleRequired"));
      return;
    }

    if (!cleanLocation) {
      setError(t("form.errorLocationRequired"));
      return;
    }

    const parsedDistanceKm = toNumber(distanceKm, NaN);
    const parsedElevationM = toNumber(elevationM, NaN);
    const parsedDurationHours = toNumber(durationHours, NaN);

    if (!Number.isFinite(parsedDistanceKm)) {
      setError(t("form.errorDistanceNumber"));
      return;
    }

    if (!Number.isFinite(parsedElevationM)) {
      setError(t("form.errorElevationNumber"));
      return;
    }

    if (!Number.isFinite(parsedDurationHours)) {
      setError(t("form.errorDurationNumber"));
      return;
    }

    if (parsedDistanceKm <= 0) {
      setError(t("form.errorDistancePositive"));
      return;
    }

    if (parsedElevationM < 0) {
      setError(t("form.errorElevationNotNegative"));
      return;
    }

    if (parsedDurationHours <= 0) {
      setError(t("form.errorDurationPositive"));
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
          <span className="font-medium text-gray-700">{t("form.titleLabel")}</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder={t("form.titlePlaceholder")}
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-gray-700">{t("form.locationLabel")}</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder={t("form.locationPlaceholder")}
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-gray-700">{t("form.regionLabel")}</span>
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
          <span className="font-medium text-gray-700">{t("form.difficultyLabel")}</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Tour["difficulty"])}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {(["Lett", "Middels", "Krevende", "Ekspert"] as Tour["difficulty"][]).map((d) => (
              <option key={d} value={d}>
                {t(`page.${DIFFICULTY_KEY[d]}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-gray-700">{t("form.distanceLabel")}</span>
          <input
            inputMode="decimal"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="8.2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-gray-700">{t("form.elevationLabel")}</span>
          <input
            inputMode="numeric"
            value={elevationM}
            onChange={(e) => setElevationM(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="520"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-gray-700">{t("form.durationLabel")}</span>
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
        <span className="font-medium text-gray-700">{t("form.gearLabel")}</span>
        <input
          value={gear}
          onChange={(e) => setGear(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder={t("form.gearPlaceholder")}
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium text-gray-700">{t("form.imageLabel")}</span>
        <select
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {TOUR_IMAGES.map((o) => (
            <option key={o.value || "auto"} value={o.value}>
              {t(`form.imageOptions.${o.tKey}`)}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-500">{t("form.imageAutoHint")}</span>
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          {props.mode === "create" ? t("form.submitCreate") : t("form.submitSave")}
        </button>
      </div>
    </form>
  );
}
