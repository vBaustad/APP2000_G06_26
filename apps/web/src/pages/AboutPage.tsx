/**
 * Fil: AboutPage.tsx
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse: Om Utopia-side som presenterer løsningens formål,
 * målgruppe, verdier, visjon og prosjektkontekst.
 */

import { Link } from "react-router-dom";
import {
  Trees,
  Users,
  ShieldCheck,
  Compass,
  BadgeCheck,
  Accessibility,
  Target,
  Lightbulb,
} from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="relative min-h-[340px] overflow-hidden">
        <img
          src="/images/hero-background.jpg"
          alt="Om Utopia"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/30" />

        <div className="relative z-10 mx-auto flex min-h-[340px] max-w-7xl items-end px-6 pb-14">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-white/80">
              Om Utopia
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              En digital løsning for turplanlegging
              <br className="hidden md:block" /> og friluftsliv
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/90 md:text-lg">
              Utopia er utviklet for å gjøre det enklere å finne, forstå og planlegge turer i naturen gjennom en oversiktlig og brukervennlig plattform.
            </p>
          </div>
        </div>
      </section>

      {/* HVA ER UTOPIA */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1.5 text-sm font-semibold tracking-wide text-emerald-900">
              Hva er Utopia?
            </span>

            <h2 className="mt-4 text-3xl font-semibold text-gray-900">
              En plattform som samler turinformasjon på ett sted
            </h2>

            <p className="mt-5 text-gray-600">
              Utopia er utviklet som en webapplikasjon for brukere som ønsker bedre
              oversikt over turmuligheter, kart og informasjon knyttet til friluftsliv.
              Løsningen skal gjøre det enklere å finne relevante turer og planlegge
              dem på en mer strukturert måte.
            </p>

            <p className="mt-4 text-gray-600">
              Tanken bak prosjektet er å samle sentral informasjon på ett sted, slik
              at brukeren slipper å lete flere steder for å få oversikt over
              vanskelighetsgrad, varighet, sted og andre praktiske detaljer.
            </p>

            <p className="mt-4 text-gray-600">
              Utopia er derfor både en informasjonsløsning og et planleggingsverktøy,
              utviklet med fokus på tydelig struktur, brukervennlighet og tilgjengelighet.
            </p>
          </div>

          <div>
            <div className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-100">
              <img
                src="/images/tours/fjell10.jpg"
                alt="Natur i Utopia"
                className="h-[380px] w-full object-cover"
              />
              <div className="border-t border-gray-100 p-6">
                <p className="text-sm leading-6 text-gray-600">
                  Utopia er laget for å gjøre naturen mer oversiktlig og lettere å
                  utforske gjennom en moderne digital løsning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMÅL OG MÅLGRUPPE */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow ring-1 ring-gray-100">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Formål</h2>
            <p className="mt-4 text-gray-600">
              Formålet med Utopia er å gjøre turplanlegging enklere og mer oversiktlig.
              Løsningen skal hjelpe brukeren med å finne turer, forstå viktig
              informasjon og sammenligne alternativer på en måte som støtter gode valg.
            </p>
            <p className="mt-4 text-gray-600">
              Prosjektet viser også hvordan moderne webteknologi kan brukes til å bygge
              en helhetlig tjeneste med fokus på strukturert informasjon, kart og
              brukeropplevelse.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow ring-1 ring-gray-100">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Målgruppe</h2>
            <p className="mt-4 text-gray-600">
              Utopia er utviklet for brukere som ønsker å utforske naturen på en enkel
              og oversiktlig måte. Løsningen skal være nyttig både for dem som ønsker
              korte nærturer og for dem som planlegger lengre og mer krevende turer.
            </p>
            <p className="mt-4 text-gray-600">
              Målgruppen inkluderer derfor både nybegynnere og mer erfarne brukere som
              trenger et tydelig system for å finne relevant turinformasjon.
            </p>
          </div>
        </div>
      </section>

      {/* VÅRE VERDIER */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 max-w-3xl">
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1.5 text-sm font-semibold tracking-wide text-emerald-900">
            Våre verdier
          </span>
          <h2 className="mt-4 text-3xl font-semibold text-gray-900">
            Verdiene som ligger til grunn for løsningen
          </h2>
          <p className="mt-4 text-gray-600">
            Utopia er utviklet med verdier som handler om brukervennlighet, trygghet,
            tilgjengelighet og inspirasjon til friluftsliv.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Trees className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Naturglede</h3>
            <p className="mt-3 text-gray-600">
              Løsningen skal motivere flere til å bruke naturen aktivt og oppleve
              verdien av friluftsliv i hverdagen.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Fellesskap</h3>
            <p className="mt-3 text-gray-600">
              Friluftsliv handler også om å dele erfaringer, opplevelser og inspirasjon med andre.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Trygghet</h3>
            <p className="mt-3 text-gray-600">
              God og tydelig turinformasjon skal bidra til bedre planlegging og gjøre det enklere å ta trygge valg.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Utforskning</h3>
            <p className="mt-3 text-gray-600">
              Utopia skal gjøre det enklere å oppdage nye turmål og se flere muligheter enn brukeren kanskje allerede kjenner til.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Kvalitet</h3>
            <p className="mt-3 text-gray-600">
              Informasjonen skal presenteres på en ryddig og nyttig måte, slik at brukeren raskt forstår det viktigste.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Accessibility className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Tilgjengelighet</h3>
            <p className="mt-3 text-gray-600">
              Løsningen skal være enkel å bruke for ulike typer brukere, uansett erfaring med turplanlegging eller digitale tjenester.
            </p>
          </div>
        </div>
      </section>

      {/* VISJON */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-3xl bg-white p-8 shadow ring-1 ring-gray-100 md:p-10">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-semibold text-gray-900">Vår visjon</h2>
            <p className="mt-4 text-gray-600">
              Visjonen bak Utopia er å utvikle en løsning som gjør friluftsliv mer oversiktlig, relevant og tilgjengelig for flere mennesker.
            </p>
            <p className="mt-4 text-gray-600">
              Ved å kombinere kart, turinformasjon og en strukturert brukerflate ønsker vi å senke terskelen for å planlegge og gjennomføre turer.
            </p>
            <p className="mt-4 text-gray-600">
              Teknologi skal her fungere som et praktisk hjelpemiddel som støtter naturopplevelsen, ikke erstatter den.
            </p>
          </div>

          <div className="rounded-3xl bg-emerald-700 p-8 text-white shadow md:p-10">
            <h3 className="text-xl font-semibold">Det vi ønsker å bidra til</h3>
            <ul className="mt-5 space-y-4 text-white/90">
              <li>• tydeligere og enklere turinformasjon</li>
              <li>• bedre oversikt over turmuligheter</li>
              <li>• enklere planlegging av turer</li>
              <li>• mer tilgjengelig friluftsliv for flere brukere</li>
            </ul>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-100">
            <img
              src="/images/tours/fjell11.jpg"
              alt="Teamet bak Utopia"
              className="h-[340px] w-full object-cover"
            />
          </div>

          <div>
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1.5 text-sm font-semibold tracking-wide text-emerald-900">
              Teamet bak løsningen
            </span>
            <h2 className="mt-4 text-3xl font-semibold text-gray-900">
              Et studentprosjekt med fokus på både teknologi og brukeropplevelse
            </h2>
            <p className="mt-4 text-gray-600">
              Utopia er utviklet som et studentprosjekt med mål om å designe og bygge en moderne webapplikasjon for turplanlegging og friluftsliv.
            </p>
            <p className="mt-4 text-gray-600">
              Prosjektet kombinerer arbeid med design, frontend, backend og informasjonsstruktur for å skape en helhetlig løsning som er både nyttig og brukervennlig.
            </p>
            <p className="mt-4 text-gray-600">
              Arbeidet med Utopia handler derfor både om å utvikle en digital løsning og om å utforske hvordan teknologi kan støtte brukere i møte med naturen.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-4">
        <div className="overflow-hidden rounded-3xl bg-emerald-700 px-8 py-12 text-white shadow-lg md:px-12">
          <h2 className="text-3xl font-semibold">
            Klar for å utforske Utopia?
          </h2>
          <p className="mt-4 max-w-3xl text-white/90">
            Ta en nærmere titt på turene i løsningen og utforsk hvordan Utopia presenterer turinformasjon, kart og planleggingsmuligheter.
          </p>

          <div className="mt-6">
            <Link
              to="/explore"
              className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-gray-100"
            >
              Utforsk turer →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}