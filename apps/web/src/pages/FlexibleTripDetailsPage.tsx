/**
 * Fil: FlexibleTripDetailsPage.tsx
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse:
 * Detaljside for en fleksibel fellestur i Utopia.
 * Komponenten er laget for å demonstrere oppgavens krav knyttet til:
 * - fleksibel startdato
 * - flere datoalternativer
 * - hytte-til-hytte-tur
 * - interesse fra brukere
 * - foreløpig kapasitet fra hytteeiere
 * - vurdering, låsing av dato og videre varsling
 */

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CloudSun,
  House,
  Users,
  BedDouble,
  Bell,
  Route,
  Clock3,
  MapPinned,
  CheckCircle2,
  Lock,
  Send,
  Flag,
} from "lucide-react";

const dateOptions = [
  {
    id: 1,
    date: "17. april 2026",
    weather: "Godt værvindu",
    status: "2 hytter har meldt foreløpig kapasitet",
    recommended: false,
  },
  {
    id: 2,
    date: "18. april 2026",
    weather: "Usikkert vær",
    status: "Kapasitet ikke ferdig bekreftet",
    recommended: false,
  },
  {
    id: 3,
    date: "19. april 2026",
    weather: "Best vær ifølge foreløpig vurdering",
    status: "God kapasitet så langt",
    recommended: true,
  },
  {
    id: 4,
    date: "20. april 2026",
    weather: "Roligere vindforhold",
    status: "Færre sengeplasser tilgjengelig",
    recommended: false,
  },
];

const cabins = [
  {
    name: "Finsehytta",
    capacity: 6,
    owner: "bruker3@usn.no",
  },
  {
    name: "Krækkja turisthytte",
    capacity: 4,
    owner: "bruker3@usn.no",
  },
  {
    name: "Tuva turisthytte",
    capacity: 5,
    owner: "bruker3@usn.no",
  },
];

const participants = [
  "bruker4@usn.no",
  "bruker5@usn.no",
  "bruker6@usn.no",
  "ekstra.testbruker@usn.no",
];

export default function FlexibleTripDetailsPage() {
  const [selectedDateId, setSelectedDateId] = useState<number | null>(
    dateOptions.find((option) => option.recommended)?.id ?? null
  );
  const [isDateLocked, setIsDateLocked] = useState(false);
  const [notificationsSent, setNotificationsSent] = useState(false);
  const [tripConfirmed, setTripConfirmed] = useState(false);

  const selectedDate = useMemo(() => {
    return dateOptions.find((option) => option.id === selectedDateId) ?? null;
  }, [selectedDateId]);

  const totalCapacity = useMemo(() => {
    return cabins.reduce((sum, cabin) => sum + cabin.capacity, 0);
  }, []);

  const tripStatus = useMemo(() => {
    if (tripConfirmed) return "Bekreftet tur";
    if (notificationsSent) return "Varsler sendt";
    if (isDateLocked) return "Dato låst";
    return "Åpen for ikke-bindende interesse";
  }, [tripConfirmed, notificationsSent, isDateLocked]);

  function handleLockDate() {
    if (!selectedDateId) return;
    setIsDateLocked(true);
    setTripConfirmed(false);
  }

  function handleSendNotifications() {
    if (!isDateLocked) return;
    setNotificationsSent(true);
  }

  function handleConfirmTrip() {
    if (!isDateLocked) return;
    setTripConfirmed(true);
  }

  return (
    <main className="bg-slate-100 text-slate-900">
      <section className="bg-[#17331C] text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Fellestur
          </p>

          <h1 className="text-4xl font-semibold md:text-5xl">
            Hardangervidda på tvers
          </h1>

          <p className="mt-4 max-w-4xl text-lg leading-8 text-white/85">
            Fleksibel fellestur med hytte-til-hytte-rute, flere datoalternativer
            og foreløpig kapasitet fra hytteeiere.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-sm text-white/70">Status</p>
              <p className="mt-1 font-semibold">{tripStatus}</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-sm text-white/70">Turleder</p>
              <p className="mt-1 font-semibold">bruker2@usn.no</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-sm text-white/70">Interesserte</p>
              <p className="mt-1 font-semibold">{participants.length} brukere</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-sm text-white/70">Sengeplasser</p>
              <p className="mt-1 font-semibold">{totalCapacity} foreløpige plasser</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-2xl font-semibold text-slate-900">
                Om turen
              </h2>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Turtype</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    Arrangert fellestur
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Datoform</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    Fleksibel startdato
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Sti-oppsett</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    Eksisterende stier mellom hytter
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">
                    Deltakerkrav
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    Min. 4 / maks. 10 deltakere
                  </p>
                </div>
              </div>

              <p className="mt-5 leading-7 text-slate-700">
                Turen går fra Finsehytta via Krækkja til Tuva. Brukere melder først
                ikke-bindende interesse. Deretter vurderer turleder vær, kapasitet
                og antall interesserte før dato låses og turen bekreftes.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#0f3d2e]" />
                <h2 className="text-2xl font-semibold text-slate-900">
                  Datoalternativer
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {dateOptions.map((option) => {
                  const isSelected = selectedDateId === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        if (!isDateLocked) setSelectedDateId(option.id);
                      }}
                      className={`rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-[#0f3d2e] bg-[#eef5f1]"
                          : option.recommended
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-200 bg-slate-50"
                      } ${isDateLocked ? "cursor-default" : "hover:border-[#0f3d2e]"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-slate-900">{option.date}</p>

                        <div className="flex flex-col items-end gap-2">
                          {option.recommended && (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                              Anbefalt
                            </span>
                          )}

                          {isSelected && (
                            <span className="rounded-full bg-[#0f3d2e] px-3 py-1 text-xs font-semibold text-white">
                              Valgt
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-slate-700">
                        <span className="font-medium">Vær:</span> {option.weather}
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        <span className="font-medium">Status:</span> {option.status}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleLockDate}
                  disabled={!selectedDateId || isDateLocked}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0f3d2e] px-5 py-3 font-medium text-white transition hover:bg-[#12351d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  Lås valgt dato
                </button>

                <button
                  type="button"
                  onClick={handleSendNotifications}
                  disabled={!isDateLocked || notificationsSent}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Send varsler
                </button>

                <button
                  type="button"
                  onClick={handleConfirmTrip}
                  disabled={!isDateLocked || tripConfirmed}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-5 py-3 font-medium text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Bekreft tur
                </button>
              </div>

              {selectedDate && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">Aktiv vurdering</p>
                  <p className="mt-2 text-sm text-slate-700">
                    Turleder vurderer nå <strong>{selectedDate.date}</strong> som
                    aktuell dato for turen.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Route className="h-5 w-5 text-[#0f3d2e]" />
                <h2 className="text-2xl font-semibold text-slate-900">
                  Rute og etapper
                </h2>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl bg-white px-4 text-center text-sm text-slate-500">
                  <p>Kartplassholder for hytte-til-hytte-rute</p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">Finsehytta</span>
                    <span>→</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">Krækkja</span>
                    <span>→</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">Tuva</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Etappe 1</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    Finsehytta → Krækkja
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Etappe 2</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    Krækkja → Tuva
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Lengde</p>
                  <p className="mt-1 font-semibold text-slate-900">34 km</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-200 bg-[#eef5f1] p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Flag className="h-5 w-5 text-[#0f3d2e]" />
                <h2 className="text-2xl font-semibold text-slate-900">
                  Teststatus
                </h2>
              </div>

              <ul className="space-y-2 text-slate-700">
                <li>• Fleksibel startdato er satt opp med 4 alternativer</li>
                <li>• Turen er innom minst 2 hytter</li>
                <li>• Turleder er bruker2@usn.no</li>
                <li>• Hytteeier er satt opp som bruker3@usn.no</li>
                <li>• Ikke-bindende interesse kan demonstreres</li>
                <li>• Turen kan senere låses til fast dato</li>
              </ul>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-white p-4 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">Valgt dato:</span>{" "}
                  {selectedDate ? selectedDate.date : "Ingen valgt"}
                </div>

                <div className="rounded-xl bg-white p-4 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">Dato låst:</span>{" "}
                  {isDateLocked ? "Ja" : "Nei"}
                </div>

                <div className="rounded-xl bg-white p-4 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">Varsler sendt:</span>{" "}
                  {notificationsSent ? "Ja" : "Nei"}
                </div>

                <div className="rounded-xl bg-white p-4 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">Tur bekreftet:</span>{" "}
                  {tripConfirmed ? "Ja" : "Nei"}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-[#0f3d2e]" />
                <h2 className="text-xl font-semibold text-slate-900">
                  Interesserte deltakere
                </h2>
              </div>

              <ul className="space-y-3 text-slate-700">
                {participants.map((participant) => (
                  <li key={participant} className="rounded-xl bg-slate-50 p-3">
                    {participant}
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-sm text-slate-500">
                Disse kan få varsel når turleder velger endelig dato.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <House className="h-5 w-5 text-[#0f3d2e]" />
                <h2 className="text-xl font-semibold text-slate-900">
                  Hytter og kapasitet
                </h2>
              </div>

              <div className="space-y-3">
                {cabins.map((cabin) => (
                  <div key={cabin.name} className="rounded-xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{cabin.name}</p>
                    <p className="mt-1 text-sm text-slate-700">
                      {cabin.capacity} foreløpige sengeplasser
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Ansvarlig hytteeier: {cabin.owner}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CloudSun className="h-5 w-5 text-[#0f3d2e]" />
                <h2 className="text-xl font-semibold text-slate-900">
                  Turleder må vurdere
                </h2>
              </div>

              <ul className="space-y-3 text-slate-700">
                <li>• hvilket datoalternativ som har best vær</li>
                <li>• om nok deltakere har meldt interesse</li>
                <li>• om nok hytter har meldt kapasitet</li>
                <li>• når dato kan låses</li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-emerald-200 bg-[#eef5f1] p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-[#0f3d2e]" />
                <h2 className="text-xl font-semibold text-slate-900">
                  Neste steg
                </h2>
              </div>

              <ul className="space-y-3 text-slate-700">
                <li>1. Brukere melder ikke-bindende interesse</li>
                <li>2. Hytteeiere melder inn foreløpig kapasitet</li>
                <li>3. Turleder velger datoalternativ</li>
                <li>4. Dato låses og varsler sendes ut</li>
                <li>5. Turen bekreftes</li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-[#0f3d2e]" />
                <h2 className="text-xl font-semibold text-slate-900">
                  Overnatting
                </h2>
              </div>

              <ul className="space-y-3 text-slate-700">
                <li>• 3 hytter inngår i turen</li>
                <li>• Foreløpig kapasitet: {totalCapacity} sengeplasser</li>
                <li>• Kapasitet må være tilstrekkelig før turen bekreftes</li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <MapPinned className="h-5 w-5 text-[#0f3d2e]" />
                <h2 className="text-xl font-semibold text-slate-900">
                  Ruteoppsett
                </h2>
              </div>

              <ul className="space-y-3 text-slate-700">
                <li>• Startpunkt: Finsehytta</li>
                <li>• Mellomstopp: Krækkja</li>
                <li>• Sluttpunkt: Tuva</li>
                <li>• Sti bygger på eksisterende etapper mellom hyttene</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}