/**
 * Fil: WeatherConditionsCard.tsx
 * Utvikler(e): Synne Oppberget, Ramona Cretulescu
 * Beskrivelse:
 * Kortkomponent på landingssiden som viser vær og turforhold for et
 * aktuelt område. Komponenten støtter oppgavens krav om integrasjon med
 * værdata og viser hvordan værforhold kan brukes som beslutningsstøtte
 * ved planlegging av turer og fellesturer.
 */

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CloudSun,
  Thermometer,
  Wind,
  TriangleAlert,
  MapPin,
} from "lucide-react";

export default function WeatherConditionsCard() {
  const { t } = useTranslation("forside");

  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#0f3d2e]">
            {t("weather.eyebrow")}
          </p>

          <h2 className="text-2xl font-semibold text-slate-900">
            {t("weather.title")}
          </h2>

          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-4 w-4 text-[#0f3d2e]" />
            {t("weather.location")}
          </p>
        </div>

        <span className="rounded-full bg-[#eef5f1] px-3 py-1 text-sm font-medium text-[#0f3d2e]">
          {t("weather.updatedBadge")}
        </span>
      </div>

      <p className="mb-6 text-sm leading-7 text-slate-600">
        {t("weather.intro")}
      </p>

      <div className="rounded-2xl bg-[#eef5f1] p-4">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-white p-2 shadow-sm">
              <CloudSun className="h-4 w-4 text-[#0f3d2e]" />
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {t("weather.conditionsLabel")}
              </p>
              <p className="text-sm text-slate-600">
                {t("weather.conditionsValue")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-white p-2 shadow-sm">
              <Thermometer className="h-4 w-4 text-[#0f3d2e]" />
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {t("weather.temperatureLabel")}
              </p>
              <p className="text-sm text-slate-600">
                {t("weather.temperatureValue")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-white p-2 shadow-sm">
              <Wind className="h-4 w-4 text-[#0f3d2e]" />
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {t("weather.windLabel")}
              </p>
              <p className="text-sm text-slate-600">
                {t("weather.windValue")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-white p-2 shadow-sm">
              <TriangleAlert className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {t("weather.recommendationLabel")}
              </p>
              <p className="text-sm text-slate-600">
                {t("weather.recommendationValue")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="text-sm text-slate-500">
          {t("weather.footerNote")}
        </span>

        <Link
          to="/kart"
          className="inline-flex items-center gap-2 font-semibold text-[#0f3d2e] hover:underline"
        >
          {t("weather.seeWeather")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
