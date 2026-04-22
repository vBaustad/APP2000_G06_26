/**
 * Fil: tour.ts
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu
 * Beskrivelse: Frontend-typer for tur-domenet. Brukes av tur-lister, detaljside,
 * opprett-skjema og API-mapping i toursApi.ts.
 */

export type Difficulty = "Lett" | "Middels" | "Krevende" | "Ekspert";

export type Region =
  | "Nord-Norge"
  | "Trøndelag"
  | "Østlandet"
  | "Sørlandet"
  | "Vestlandet";

export type TourType = "Fottur" | "Ski" | "Sykkel" | "Padling";

export type TourDato = {
  id: number;
  tittel: string | null;
  startAt: string;
  endAt: string;
  status: string;
};

export type TourPoint = {
  lat: number;
  lng: number;
  rekkefolge: number;
};

export type Tour = {
  id: string;
  title: string;
  location: string;
  distanceKm: number;
  elevationM: number;
  durationHours: number;
  difficulty: Difficulty;
  gear: string[];
  region: Region;
  imageUrl?: string;
  imageLabel?: string;
  description?: string;
  type?: TourType | string;
  mapCenter?: [number, number] | null;
  routePoints?: TourPoint[];
  datoer?: TourDato[];
};
