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
import {
  ArrowRight,
  CloudSun,
  Thermometer,
  Wind,
  TriangleAlert,
  MapPin,
} from "lucide-react";

export default function WeatherConditionsCard() {
  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#0f3d2e]">
            Vær og forhold
          </p>

          <h2 className="text-2xl font-semibold text-slate-900">
            Turforhold i Jotunheimen
          </h2>

          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-4 w-4 text-[#0f3d2e]" />
            Besseggen og nærliggende turmål
          </p>
        </div>

        <span className="rounded-full bg-[#eef5f1] px-3 py-1 text-sm font-medium text-[#0f3d2e]">
          Oppdatert i dag
        </span>
      </div>

      <p className="mb-6 text-sm leading-7 text-slate-600">
        Vær og turforhold er viktige ved planlegging av tur, særlig i fjellet.
        Dette kortet viser hvordan løsningen kan gi brukeren rask oversikt over
        forhold som påvirker rutevalg, utstyr og tidspunkt.
      </p>

      <div className="rounded-2xl bg-[#eef5f1] p-4">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-white p-2 shadow-sm">
              <CloudSun className="h-4 w-4 text-[#0f3d2e]" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Forhold</p>
              <p className="text-sm text-slate-600">
                Lettskyet og gode siktforhold i høyden
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-white p-2 shadow-sm">
              <Thermometer className="h-4 w-4 text-[#0f3d2e]" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Temperatur</p>
              <p className="text-sm text-slate-600">2 °C på utsatte partier</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-white p-2 shadow-sm">
              <Wind className="h-4 w-4 text-[#0f3d2e]" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Vind</p>
              <p className="text-sm text-slate-600">
                Frisk bris langs rygger og åpne områder
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-white p-2 shadow-sm">
              <TriangleAlert className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Anbefaling</p>
              <p className="text-sm text-slate-600">
                Sjekk kart, kle deg for skiftende vær og planlegg med tidsmargin
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="text-sm text-slate-500">
          Beslutningsstøtte for tryggere turplanlegging
        </span>

        <Link
          to="/map"
          className="inline-flex items-center gap-2 font-semibold text-[#0f3d2e] hover:underline"
        >
          Se vær og forhold
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}