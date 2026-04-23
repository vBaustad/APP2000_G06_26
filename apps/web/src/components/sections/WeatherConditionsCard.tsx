/**
 * Fil: WeatherConditionsCard.tsx
 * Utvikler(e): Ramona Cretulescu. Copilot er brukt som guide og lærer i utviklingen av denne siden.
 * Beskrivelse:
 * Seksjon på landingssiden som viser ekte værdata for flere aktuelle turmål.
 * Komponenten henter værdata fra backend, som igjen henter data fra MET/Yr.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CloudSun,
  Wind,
  Droplets,
  TriangleAlert,
  MapPin,
} from "lucide-react";
import { getWeatherByCoords, type WeatherData } from "../../services/weatherApi";

type FeaturedWeatherLocation = {
  id: string;
  title: string;
  subtitle: string;
  searchQuery: string;
  lat: number;
  lon: number;
};

type LocationWeatherState = {
  location: FeaturedWeatherLocation;
  weather: WeatherData | null;
  loading: boolean;
};

const featuredLocations: FeaturedWeatherLocation[] = [
  {
    id: "jotunheimen",
    title: "Besseggen",
    subtitle: "Jotunheimen",
    searchQuery: "Besseggen",
    lat: 61.4938,
    lon: 8.3721,
  },
  {
    id: "rjukan",
    title: "Gaustatoppen",
    subtitle: "Rjukan / Telemark",
    searchQuery: "Gaustatoppen",
    lat: 59.8524,
    lon: 8.6539,
  },
  {
    id: "hardanger",
    title: "Vøringsfossen",
    subtitle: "Eidfjord / Hardanger",
    searchQuery: "Vøringsfossen",
    lat: 60.4263,
    lon: 7.2519,
  },
];

function formatTemperature(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "–";
  return `${Math.round(value)}°`;
}

function formatWind(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "–";
  return `${Math.round(value)} m/s`;
}

function formatPrecipitation(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "–";
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} mm`;
}

export default function WeatherConditionsCard() {
  const { t, i18n } = useTranslation("forside");
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "nb-NO";

  const [items, setItems] = useState<LocationWeatherState[]>(
    featuredLocations.map((location) => ({
      location,
      weather: null,
      loading: true,
    })),
  );

  useEffect(() => {
    let isMounted = true;

    async function loadWeather() {
      const results = await Promise.all(
        featuredLocations.map(async (location) => {
          try {
            const weather = await getWeatherByCoords(location.lat, location.lon);

            return {
              location,
              weather,
              loading: false,
            } satisfies LocationWeatherState;
          } catch (error) {
            console.error(`Kunne ikke hente værdata for ${location.title}:`, error);

            return {
              location,
              weather: null,
              loading: false,
            } satisfies LocationWeatherState;
          }
        }),
      );

      if (isMounted) {
        setItems(results);
      }
    }

    loadWeather();

    return () => {
      isMounted = false;
    };
  }, []);

  function formatUpdatedLabel(updatedAt?: string | null) {
    if (!updatedAt) return t("weather.updatedRecent");

    const date = new Date(updatedAt);
    if (Number.isNaN(date.getTime())) return t("weather.updatedRecent");

    const now = new Date();
    const sameDay =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (sameDay) {
      return t("weather.updatedToday", {
        time: date.toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }

    return date.toLocaleDateString(locale);
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#0f3d2e]">
            {t("weather.eyebrow")}
          </p>

          <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            {t("weather.headingBeforeTrip")}
          </h2>

          <p className="mt-3 text-lg leading-8 text-slate-600">
            {t("weather.introBeforeTrip")}
          </p>
        </div>

        <Link
          to="/kart"
          className="inline-flex items-center gap-2 font-semibold text-[#0f3d2e] hover:underline"
        >
          {t("weather.seeWeather")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {items.map(({ location, weather, loading }) => (
          <article
            key={location.id}
            className="flex h-full flex-col rounded-2xl border border-slate-200 bg-[#f8fbf9] p-5 shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {location.title}
                </h3>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 text-[#0f3d2e]" />
                  {location.subtitle}
                </p>
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {loading ? t("weather.loadingShort") : formatUpdatedLabel(weather?.updatedAt)}
              </span>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">
                {t("weather.loadingYr")}
              </div>
            ) : weather ? (
              <>
                <div className="mb-4 rounded-2xl bg-white p-4">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#eef5f1] px-3 py-1 text-sm font-medium text-[#0f3d2e]">
                    <CloudSun className="h-4 w-4" />
                    {weather.condition}
                  </div>

                  <p className="text-3xl font-semibold text-slate-900">
                    {formatTemperature(weather.temperature)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                      <Wind className="h-4 w-4 text-[#0f3d2e]" />
                      {t("weather.windLabel")}
                    </div>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatWind(weather.wind)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                      <Droplets className="h-4 w-4 text-[#0f3d2e]" />
                      {t("weather.precipitationLabel")}
                    </div>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatPrecipitation(weather.precipitation)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-white p-2 shadow-sm">
                      <TriangleAlert className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {t("weather.recommendationLabel")}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {weather.statusText}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">
                {t("weather.unavailable")}
              </div>
            )}

            <div className="mt-5 border-t border-slate-200 pt-4">
              <Link
                to={`/turer?q=${encodeURIComponent(location.searchQuery)}`}
                className="inline-flex items-center gap-2 font-semibold text-[#0f3d2e] hover:underline"
              >
                {t("weather.seeRelatedTours")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
