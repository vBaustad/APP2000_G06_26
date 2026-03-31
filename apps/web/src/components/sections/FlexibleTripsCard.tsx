
/**
 * Fil: FlexibleTripsCard.tsx
 * Utvikler(e): Synne Oppberget, Ramona Cretulescu
 * Beskrivelse:
 * Kortkomponent på landingssiden som fremhever en fellestur med fleksibel
 * startdato. Komponenten støtter oppgavens krav om sosial turplanlegging,
 * der brukere kan vise interesse før endelig dato fastsettes ut fra vær,
 * kapasitet og tilgjengelighet.
 */

import { Link } from "react-router-dom";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  CloudSun,
  MapPin,
  Users,
} from "lucide-react";

export default function FlexibleTripsCard() {
  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#0f3d2e]">
            Fellestur
          </p>

          <h2 className="text-2xl font-semibold text-slate-900">
            Hardangervidda på tvers
          </h2>

          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-4 w-4 text-[#0f3d2e]" />
            Finse – Krækkja – Tuva
          </p>
        </div>

        <span className="rounded-full bg-[#eef5f1] px-3 py-1 text-sm font-medium text-[#0f3d2e]">
          Ikke låst ennå
        </span>
      </div>

      <p className="mb-6 text-sm leading-7 text-slate-600">
        Denne fellesturen har fleksibel startdato. Brukere kan først vise
        interesse, mens endelig avreise bestemmes ut fra værforhold,
        kapasitet på hyttene og antall deltakere.
      </p>

      <div className="rounded-2xl bg-[#eef5f1] p-4">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-white p-2 shadow-sm">
              <CalendarDays className="h-4 w-4 text-[#0f3d2e]" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Mulige startdatoer</p>
              <p className="text-sm text-slate-600">17.–20. april</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-white p-2 shadow-sm">
              <Users className="h-4 w-4 text-[#0f3d2e]" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Interesserte deltakere</p>
              <p className="text-sm text-slate-600">
                8 brukere har vist interesse, 5 trengs for å låse turen
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-white p-2 shadow-sm">
              <BedDouble className="h-4 w-4 text-[#0f3d2e]" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Overnatting</p>
              <p className="text-sm text-slate-600">
                2 hytter har meldt foreløpig kapasitet
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-white p-2 shadow-sm">
              <CloudSun className="h-4 w-4 text-[#0f3d2e]" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Foreløpig værvindu</p>
              <p className="text-sm text-slate-600">
                Lørdag ser ut til å gi best forhold i fjellet
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="text-sm text-slate-500">
          Planlegging basert på vær og kapasitet
        </span>

        <Link
          to="/explore"
          className="inline-flex items-center gap-2 font-semibold text-[#0f3d2e] hover:underline"
        >
          Se fellesturer
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}