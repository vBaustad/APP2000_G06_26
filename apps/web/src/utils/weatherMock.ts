export type WeatherInfo = {
  condition: string;
  temperature: number;
  wind: number;
  precipitation: number;
  statusText: string;
};

const WEATHER_BY_REGION: Record<string, WeatherInfo> = {
  "østlandet": {
    condition: "Sol",
    temperature: 12,
    wind: 3,
    precipitation: 0,
    statusText: "Gode forhold",
  },
  "vestlandet": {
    condition: "Regn",
    temperature: 7,
    wind: 8,
    precipitation: 4,
    statusText: "Våte forhold",
  },
  "trøndelag": {
    condition: "Skyet",
    temperature: 6,
    wind: 5,
    precipitation: 1,
    statusText: "Greie forhold",
  },
  "nord-norge": {
    condition: "Vind",
    temperature: 2,
    wind: 12,
    precipitation: 2,
    statusText: "Krevende forhold",
  },
  "sørlandet": {
    condition: "Delvis skyet",
    temperature: 10,
    wind: 4,
    precipitation: 0,
    statusText: "Fine forhold",
  },
};

export function getMockWeather(region?: string): WeatherInfo {
  if (!region) {
    return {
      condition: "Skyet",
      temperature: 8,
      wind: 4,
      precipitation: 1,
      statusText: "Greie forhold",
    };
  }

  const key = region.trim().toLowerCase();

  return (
    WEATHER_BY_REGION[key] || {
      condition: "Skyet",
      temperature: 8,
      wind: 4,
      precipitation: 1,
      statusText: "Greie forhold",
    }
  );
}