/**
 * Fil: toursApi.ts
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse: Henter turer fra backend-API og mapper dataene til formatet som brukes i frontend.
 */

import type { Difficulty, Region, Tour, TourPoint } from "../types/tour";

type ApiTurstiPunkt = {
  rekkefolge: number;
  lat?: string | number | null;
  lng?: string | number | null;
  hoyde_m?: number | null;
};

type ApiTursti = {
  id: number;
  navn: string;
  beskrivelse?: string | null;
  vanskelighetsgrad?: string | null;
  hoydemeter?: number | null;
  lengde_km?: string | number | null;
  omrade?: string | null;
  tursti_punkt?: ApiTurstiPunkt[];
};

type ApiTurTursti = {
  rekkefolge: number;
  tursti: ApiTursti;
};

type ApiTurDato = {
  id: number;
  tittel?: string | null;
  start_at: string;
  end_at: string;
  status: string;
  tidlig_pamelding_frist?: string | null;
  rabatt_prosent?: number | null;
};

type ApiTour = {
  id: number;
  tittel: string;
  beskrivelse?: string | null;
  type?: string | null;
  vanskelighetsgrad?: string | null;
  varighet_timer?: number | null;
  omrade?: string | null;
  bilde_url?: string | null;
  min_deltakere?: number | null;
  max_deltakere?: number | null;
  status?: string | null;
  leder_bruker_id?: number | null;
  created_at?: string;
  updated_at?: string;
  tur_tursti?: ApiTurTursti[];
  tur_dato?: ApiTurDato[];
};

function getRegionFromOmrade(omrade?: string | null): Region {
  const value = (omrade ?? "").toLowerCase();

  if (
    value.includes("nordland") ||
    value.includes("troms") ||
    value.includes("finnmark") ||
    value.includes("lofoten")
  ) {
    return "Nord-Norge";
  }

  if (value.includes("trøndelag")) {
    return "Trøndelag";
  }

  if (
    value.includes("vestland") ||
    value.includes("bergen") ||
    value.includes("eidfjord") ||
    value.includes("odda") ||
    value.includes("hardangervidda")
  ) {
    return "Vestlandet";
  }

  if (
    value.includes("telemark") ||
    value.includes("innlandet") ||
    value.includes("jotunheimen") ||
    value.includes("lom") ||
    value.includes("rjukan")
  ) {
    return "Østlandet";
  }

  if (
    value.includes("agder") ||
    value.includes("sørlandet") ||
    value.includes("kristiansand")
  ) {
    return "Sørlandet";
  }

  return "Østlandet";
}

function mapDifficulty(value?: string | null): Difficulty {
  const normalized = (value ?? "").toLowerCase();

  if (normalized === "lett") return "Lett";
  if (normalized === "middels") return "Middels";
  if (normalized === "krevende") return "Krevende";
  if (normalized === "ekspert") return "Ekspert";

  return "Middels";
}

function mapTourType(value?: string | null): string {
  const normalized = (value ?? "").toLowerCase();

  if (normalized === "fottur") return "Fottur";
  if (normalized === "ski") return "Ski";
  if (normalized === "sykkel") return "Sykkel";
  if (normalized === "padling") return "Padling";

  return value ?? "Ukjent";
}

function sumDistanceFromTurstier(turstier?: ApiTurTursti[]) {
  if (!Array.isArray(turstier) || turstier.length === 0) return 0;

  const total = turstier.reduce((sum, item) => {
    const value = Number(item.tursti?.lengde_km ?? 0);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  return Number(total.toFixed(1));
}

function maxElevationFromTurstier(turstier?: ApiTurTursti[]) {
  if (!Array.isArray(turstier) || turstier.length === 0) return 0;

  return turstier.reduce((max, item) => {
    const value = Number(item.tursti?.hoydemeter ?? 0);
    return value > max ? value : max;
  }, 0);
}

function getOverrideImage(title?: string | null, currentImage?: string | null) {
  if (!title) return currentImage ?? "";

  if (title === "Fra Solbu til Stormbu") {
    return "/images/tours/bildeski.webp";
  }

  if (title === "Rundtur ved Eventyrvannet") {
    return "/images/tours/bildeski2.jpg";
  }

  if (title === "Hardangervidda på tvers") {
    return "/images/tours/bildeski3.jpg";
  }

  return currentImage ?? "";
}

function getMapCenterFromTurstier(turstier?: ApiTurTursti[]) {
  const firstPoint = turstier?.[0]?.tursti?.tursti_punkt?.[0];
  if (!firstPoint) return null;

  const lat = Number(firstPoint.lat);
  const lng = Number(firstPoint.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return [lat, lng] as [number, number];
}

function getRoutePointsFromTurstier(turstier?: ApiTurTursti[]): TourPoint[] {
  if (!Array.isArray(turstier) || turstier.length === 0) return [];

  return turstier.flatMap((item) =>
    (item.tursti?.tursti_punkt ?? [])
      .map((point) => {
        const lat = Number(point.lat);
        const lng = Number(point.lng);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

        return {
          lat,
          lng,
          rekkefolge: point.rekkefolge,
        } satisfies TourPoint;
      })
      .filter((point): point is TourPoint => point !== null)
      .sort((a, b) => a.rekkefolge - b.rekkefolge),
  );
}

function mapTour(tour: ApiTour): Tour {
  return {
    id: String(tour.id),
    title: tour.tittel ?? "Ukjent tur",
    description: tour.beskrivelse ?? "",
    location: tour.omrade ?? "Ukjent område",
    region: getRegionFromOmrade(tour.omrade),
    difficulty: mapDifficulty(tour.vanskelighetsgrad),
    type: mapTourType(tour.type),
    distanceKm: sumDistanceFromTurstier(tour.tur_tursti),
    elevationM: maxElevationFromTurstier(tour.tur_tursti),
    durationHours: tour.varighet_timer ?? 0,
    gear: [],
    imageUrl: getOverrideImage(tour.tittel, tour.bilde_url),
    mapCenter: getMapCenterFromTurstier(tour.tur_tursti),
    routePoints: getRoutePointsFromTurstier(tour.tur_tursti),
    datoer: Array.isArray(tour.tur_dato)
      ? tour.tur_dato.map((d) => ({
          id: d.id,
          tittel: d.tittel ?? null,
          startAt: d.start_at,
          endAt: d.end_at,
          status: d.status,
        }))
      : [],
  };
}

export async function getTours() {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/turer`);

  if (!res.ok) {
    throw new Error("Kunne ikke hente turer fra API");
  }

  const data: ApiTour[] = await res.json();
  return data.map(mapTour);
}

export async function getTourById(id: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/turer/${id}`);

  if (!res.ok) {
    throw new Error("Kunne ikke hente tur fra API");
  }

  const data: ApiTour = await res.json();
  return mapTour(data);
}
