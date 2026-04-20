/**
 * Fil: FastGruppeTur.tsx
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse:
 * Detaljside for en arrangert fellestur med fast dato.
 * Siden er laget for å støtte testing og demonstrasjon av oppgavens krav
 * knyttet til fellesturer med fast dato, deltakere, hytter og kapasitet.
 */

import {
  CalendarDays,
  House,
  Users,
  BedDouble,
  Route,
  CheckCircle2,
  MapPinned,
  Bell,
} from "lucide-react";

const cabins = [
  {
    name: "Gjendesheim",
    capacity: "8 tilgjengelige sengeplasser",
    owner: "bruker3@usn.no",
  },
  {
    name: "Memurubu",
    capacity: "6 tilgjengelige sengeplasser",
    owner: "bruker3@usn.no",
  },
];

const participants = [
  {
    email: "bruker4@usn.no",
    status: "Bindende påmeldt",
  },
  {
    email: "bruker5@usn.no",
    status: "Bindende påmeldt",
  },
  {
    email: "bruker6@usn.no",
    status: "Invitert",
  },
];

export default function FastGruppeTur() {
  return (
    <main className="bg-slate-100 text-slate-900">
      <section className="bg-[#17331C] text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Fellestur
          </p>

          <h1 className="text-4xl font-semibold md:text-5xl">
            Jotunheimen helgetur
          </h1>

          <p className="mt-4 max-w-4xl text-lg leading-8 text-white/85">
            Arrangert fellestur med fast dato, forhåndsvalgt rute og overnatting
            underveis.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-sm text-white/70">Status</p>
              <p className="mt-1 font-semibold">Fast dato satt</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-sm text-white/70">Turleder</p>
              <p className="mt-1 font-semibold">bruker2@usn.no</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-sm text-white/70">Startdato</p>
              <p className="mt-1 font-semibold">8. mai 2026</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-sm text-white/70">Overnatting</p>
              <p className="mt-1 font-semibold">2 hytter</p>
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
                  <p className="mt-1 font-semibold text-slate-900">Fast dato</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Startdato</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    8. mai 2026
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
                Denne turen er satt opp med fast dato og kan brukes som testtur
                for vanlig fellestur. Turleder har valgt rute og overnatting på
                forhånd, og deltakere kan bekrefte bindende påmelding.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#0f3d2e]" />
                <h2 className="text-2xl font-semibold text-slate-900">
                  Dato og påmelding
                </h2>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-[#eef5f1] p-4">
                <p className="text-sm font-medium text-slate-500">Fast dato</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  8. mai 2026
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Turen er satt opp med én bestemt dato og er klar for bindende
                  påmelding.
                </p>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Påmeldte</p>
                  <p className="mt-1 font-semibold text-slate-900">2 brukere</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Inviterte</p>
                  <p className="mt-1 font-semibold text-slate-900">1 bruker</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Varsling</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    Sendt til deltakere
                  </p>
                </div>
              </div>
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
                  <p>Kartplassholder for fast fellestur</p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      Gjendesheim
                    </span>
                    <span>→</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      Memurubu
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Etappe</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    Gjendesheim → Memurubu
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Lengde</p>
                  <p className="mt-1 font-semibold text-slate-900">16 km</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Varighet</p>
                  <p className="mt-1 font-semibold text-slate-900">7 timer</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-200 bg-[#eef5f1] p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#0f3d2e]" />
                <h2 className="text-2xl font-semibold text-slate-900">
                  Teststatus
                </h2>
              </div>

              <ul className="space-y-2 text-slate-700">
                <li>• Fellesturen har fast dato</li>
                <li>• Turleder er satt til bruker2@usn.no</li>
                <li>• Hytteeier er satt opp som bruker3@usn.no</li>
                <li>• Turen er innom overnattingssteder</li>
                <li>• Bindende påmelding kan demonstreres</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-[#0f3d2e]" />
                <h2 className="text-xl font-semibold text-slate-900">
                  Deltakere
                </h2>
              </div>

              <div className="space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant.email}
                    className="rounded-xl bg-slate-50 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {participant.email}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {participant.status}
                    </p>
                  </div>
                ))}
              </div>
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
                      {cabin.capacity}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Ansvarlig hytteeier: {cabin.owner}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-200 bg-[#eef5f1] p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#0f3d2e]" />
                <h2 className="text-xl font-semibold text-slate-900">
                  Neste steg
                </h2>
              </div>

              <ul className="space-y-3 text-slate-700">
                <li>1. Bruker mottar varsel om fast dato</li>
                <li>2. Bruker bekrefter eller trekker bindende påmelding</li>
                <li>3. Hytteeier bekrefter kapasitet</li>
                <li>4. Turleder ser at turen er klar</li>
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
                <li>• 2 overnattingssteder inngår i turen</li>
                <li>• Kapasitet er satt opp for testing</li>
                <li>• Turen kan brukes i demo av fast fellestur</li>
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
                <li>• Startpunkt: Gjendesheim</li>
                <li>• Sluttpunkt: Memurubu</li>
                <li>• Fast rute er valgt på forhånd</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}