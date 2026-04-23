/**
 * Fil: types/tour.ts
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu
 * Beskrivelse: Felles typer for tur-entitet brukt på tvers av frontend.
 */

export type Difficulty = "Lett" | "Middels" | "Krevende" | "Ekspert";

export type Region =
  | "Nord-Norge"
  | "Trøndelag"
  | "Østlandet"
  | "Sørlandet"
  | "Vestlandet";

export type TourPoint = {
  lat: number;
  lng: number;
  rekkefolge: number;
};

export type TourDato = {
  id: number;
  tittel: string | null;
  startAt: string;
  endAt: string;
  status: string;
};

export type TourHytte = {
  id: number;
  navn: string;
  omrade: string | null;
  betjent: "betjent" | "selvbetjent" | "ubetjent" | null;
  bildeUrl: string | null;
  kapasitetSenger: number;
  prisPerNatt: number | null;
  lat: number | null;
  lng: number | null;
  rekkefolge: number;
};

export type TourSocial = {
  averageRating: number | null;
  commentCount: number;
  likeCount: number;
  latestCommentUserName: string | null;
  latestCommentFirstName: string | null;
  latestCommentCreatedAt: string | null;
  ownerFirstName: string | null;
  ownerFullName: string | null;
};

export type Tour = {
  id: string;
  title: string;
  description: string;
  location: string;
  region: Region;
  difficulty: Difficulty;
  type: string;
  distanceKm: number;
  elevationM: number;
  durationHours: number;
  gear: string[];
  imageUrl: string;
  imageLabel?: string;
  mapCenter: [number, number] | null;
  routePoints: TourPoint[];
  datoer: TourDato[];
  hytter: TourHytte[];
  ownerId: number | null;
  social: TourSocial;
};
