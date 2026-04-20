/**
 * Fil: OpprettTur.tsx
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse:
 * Side for oppretting av turer i Utopia. Siden støtter registrering av kjent
 * tur, arrangert fellestur og egen tur, samt ulike metoder for å legge inn sti.
 */

import { useState } from "react";
import {
  CalendarDays,
  MapPinned,
  Route,
  Upload,
  House,
  Users,
  CheckCircle2,
  Bell,
} from "lucide-react";

export default function OpprettTur() {
  const [tripType, setTripType] = useState("known");
  const [trailMethod, setTrailMethod] = useState("map");
  const [dateType, setDateType] = useState("fixed");
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
  }

  return (
    <main className="bg-slate-100 text-slate-900">
      <section className="bg-[#17331C] text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 md:py-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Turregistrering
          </p>

          <h1 className="text-4xl font-semibold md:text-5xl">Opprett tur</h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/85">
            Registrer en ny tur med sti, dato og eventuelle overnattingssteder.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <form className="space-y-8" onSubmit={handleSave}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800">
                Turtittel
              </label>
              <input
                type="text"
                placeholder="For eksempel Hardangervidda på tvers"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0f3d2e]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800">
                Beskrivelse
              </label>
              <textarea
                rows={4}
                placeholder="Beskriv turen kort"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0f3d2e]"
              />
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-slate-800">Turtype</p>

              <div className="grid gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => {
                    setTripType("known");
                    setDateType("fixed");
                  }}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    tripType === "known"
                      ? "border-[#0f3d2e] bg-[#eef5f1]"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  <p className="font-semibold text-slate-900">Kjent tur</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Tur som kan leses om og gjennomføres på egen hånd.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTripType("group")}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    tripType === "group"
                      ? "border-[#0f3d2e] bg-[#eef5f1]"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  <p className="font-semibold text-slate-900">
                    Arrangert fellestur
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Tur med deltakere, datooppsett og eventuelle hytter.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTripType("custom");
                    setDateType("fixed");
                  }}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    tripType === "custom"
                      ? "border-[#0f3d2e] bg-[#eef5f1]"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  <p className="font-semibold text-slate-900">Egen tur</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Tur som registreres manuelt av bruker eller turleder.
                  </p>
                </button>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-slate-800">
                Hvordan vil du legge inn stien?
              </p>

              <div className="grid gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setTrailMethod("map")}
                  className={`rounded-xl border px-4 py-4 text-left transition ${
                    trailMethod === "map"
                      ? "border-[#0f3d2e] bg-[#eef5f1]"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  <MapPinned className="mb-3 h-5 w-5 text-[#0f3d2e]" />
                  <p className="font-semibold text-slate-900">Tegn i kart</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Klikk langs ruten for å opprette sti.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTrailMethod("gpx")}
                  className={`rounded-xl border px-4 py-4 text-left transition ${
                    trailMethod === "gpx"
                      ? "border-[#0f3d2e] bg-[#eef5f1]"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  <Upload className="mb-3 h-5 w-5 text-[#0f3d2e]" />
                  <p className="font-semibold text-slate-900">Last opp GPX</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Bruk en GPX-fil for å opprette stien.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTrailMethod("existing")}
                  className={`rounded-xl border px-4 py-4 text-left transition ${
                    trailMethod === "existing"
                      ? "border-[#0f3d2e] bg-[#eef5f1]"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  <Route className="mb-3 h-5 w-5 text-[#0f3d2e]" />
                  <p className="font-semibold text-slate-900">
                    Eksisterende sti
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Velg etablerte stier mellom valgte punkter.
                  </p>
                </button>
              </div>
            </div>

            {trailMethod === "map" && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="mb-3 text-sm font-medium text-slate-800">
                  Kartregistrering
                </p>
                <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-center text-sm text-slate-500">
                  Kartplassholder for manuell registrering av sti
                </div>
              </div>
            )}

            {trailMethod === "gpx" && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Last opp GPX-fil
                </label>
                <input
                  type="file"
                  className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
                />
              </div>
            )}

            {trailMethod === "existing" && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="mb-3 text-sm font-medium text-slate-800">
                  Velg eksisterende strekninger
                </p>

                <div className="grid gap-3">
                  <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3">
                    <input type="checkbox" />
                    Finsehytta → Krækkja
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3">
                    <input type="checkbox" />
                    Krækkja → Tuva
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3">
                    <input type="checkbox" />
                    Tuva → Rauhelleren
                  </label>
                </div>
              </div>
            )}

            {tripType === "group" && (
              <div className="rounded-2xl border border-emerald-200 bg-[#f6fbf8] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#0f3d2e]" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    Oppsett for arrangert fellestur
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-800">
                      Ansvarlig turleder
                    </label>
                    <select className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0f3d2e]">
                      <option>bruker2@usn.no (turleder)</option>
                      <option>bruker1@usn.no (admin)</option>
                    </select>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-medium text-slate-800">
                      Type dato
                    </p>

                    <div className="grid gap-3 md:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setDateType("fixed")}
                        className={`rounded-xl border px-4 py-3 text-left transition ${
                          dateType === "fixed"
                            ? "border-[#0f3d2e] bg-[#eef5f1]"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        <p className="font-semibold text-slate-900">Fast dato</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Én bestemt startdato.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDateType("flexible")}
                        className={`rounded-xl border px-4 py-3 text-left transition ${
                          dateType === "flexible"
                            ? "border-[#0f3d2e] bg-[#eef5f1]"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        <p className="font-semibold text-slate-900">
                          Fleksibel startdato
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Flere datoalternativer før dato låses.
                        </p>
                      </button>
                    </div>
                  </div>

                  {dateType === "fixed" && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-800">
                        Startdato
                      </label>
                      <input
                        type="date"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0f3d2e]"
                      />
                    </div>
                  )}

                  {dateType === "flexible" && (
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-[#0f3d2e]" />
                        <p className="text-sm font-medium text-slate-800">
                          Datoalternativer
                        </p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          type="date"
                          className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0f3d2e]"
                        />
                        <input
                          type="date"
                          className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0f3d2e]"
                        />
                        <input
                          type="date"
                          className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0f3d2e]"
                        />
                        <input
                          type="date"
                          className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0f3d2e]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-800">
                        Minimum antall deltakere
                      </label>
                      <input
                        type="number"
                        placeholder="For eksempel 4"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0f3d2e]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-800">
                        Maks antall deltakere
                      </label>
                      <input
                        type="number"
                        placeholder="For eksempel 10"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0f3d2e]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <House className="h-5 w-5 text-[#0f3d2e]" />
                      <p className="text-sm font-medium text-slate-800">
                        Velg hytter / overnattingssteder
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3">
                        <input type="checkbox" />
                        Finsehytta
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3">
                        <input type="checkbox" />
                        Krækkja turisthytte
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3">
                        <input type="checkbox" />
                        Tuva turisthytte
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3">
                        <input type="checkbox" />
                        Rauhelleren
                      </label>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Fellestur bør være innom minst to hytter.
                    </p>
                  </div>

                  <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3">
                    <input type="checkbox" />
                    <Bell className="h-4 w-4 text-[#0f3d2e]" />
                    Varsle aktuelle hytteeiere om turen
                  </label>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="rounded-full bg-[#0f3d2e] px-6 py-3 font-medium text-white transition hover:bg-[#12351d]"
              >
                Lagre tur
              </button>
            </div>

            {saved && (
              <div className="rounded-2xl border border-emerald-200 bg-[#eef5f1] p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-[#0f3d2e]" />
                  <div>
                    <p className="font-semibold text-slate-900">Tur lagret</p>
                    <p className="mt-1 text-sm text-slate-700">
                      Turoppsettet er registrert i denne prototypen.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}