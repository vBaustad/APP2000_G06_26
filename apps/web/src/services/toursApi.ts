/**
 * Fil: toursApi.ts
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse: Henter turer fra backend-API og mapper dataene til formatet som brukes i frontend.
 */

type ApiTour = {
  id: number;
  tittel: string;
  beskrivelse?: string | null;
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
};

export async function getTours() {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/turer`);

  if (!res.ok) {
    throw new Error("Kunne ikke hente turer fra API");
  }

  const data: ApiTour[] = await res.json();

  return data.map((tour) => ({
    id: String(tour.id),
    title: tour.tittel ?? "Ukjent tur",
    description: tour.beskrivelse ?? "",
    location: tour.omrade ?? "Ukjent område",
    region: "Østlandet",
    difficulty:
      tour.vanskelighetsgrad === "Lett" ||
      tour.vanskelighetsgrad === "Middels" ||
      tour.vanskelighetsgrad === "Krevende" ||
      tour.vanskelighetsgrad === "Ekspert"
        ? tour.vanskelighetsgrad
        : "Middels",
    distanceKm: 0,
    elevationM: 0,
    durationHours: tour.varighet_timer ?? 0,
    gear: [],
    imageUrl: tour.bilde_url ?? "",
  }));
}