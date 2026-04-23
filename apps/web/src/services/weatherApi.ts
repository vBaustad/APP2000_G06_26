/**
 * Fil: weatherApi.ts
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse:
 * Henter værdata fra backend.
 */

export type WeatherData = {
  updatedAt: string | null;
  condition: string;
  symbolCode: string | null;
  temperature: number | null;
  wind: number | null;
  precipitation: number | null;
  cloudAreaFraction: number | null;
  statusText: string;
};

export async function getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/weather?lat=${lat}&lon=${lon}`,
  );

  if (!res.ok) {
    throw new Error("Kunne ikke hente værdata");
  }

  return res.json();
}