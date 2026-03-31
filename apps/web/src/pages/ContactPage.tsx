/**
 * Fil: ContactPage.tsx
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse:
 * Kontaktside for Utopia. Siden viser kontaktinformasjon og et enkelt
 * kontaktskjema i et design som følger uttrykket og fargepaletten i resten
 * av løsningen.
 */

import { Mail, Phone, MapPin, Clock3, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="bg-slate-100 text-slate-900">
      {/* Toppseksjon */}
      <section className="bg-[#17331C] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Kontakt
          </p>

          <h1 className="text-4xl font-semibold md:text-5xl">Kontakt oss</h1>

          <p className="mt-4 max-w-4xl text-lg leading-8 text-white/85">
            Har du spørsmål om løsningen, turinnhold eller funksjonalitet? Send
            oss en melding. Utopia er et studentprosjekt ved Universitetet i
            Sørøst-Norge og siden brukes som del av demonstrasjon og utvikling.
          </p>
        </div>
      </section>

      {/* Hovedinnhold */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Skjema */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="h-10 w-1 rounded-full bg-emerald-500" />
              <h2 className="text-2xl font-semibold text-slate-900">
                Send oss en melding
              </h2>
            </div>

            <form className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Navn
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ditt navn"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  E-post
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="din@epost.no"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Emne
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Hva gjelder det?"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Melding
                </label>
                <textarea
                  id="message"
                  rows={6}
                  placeholder="Skriv meldingen din her..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                <Send className="h-4 w-4" />
                Send melding
              </button>
            </form>
          </div>

          {/* Kontaktinfo */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="h-10 w-1 rounded-full bg-emerald-500" />
              <h2 className="text-2xl font-semibold text-slate-900">
                Kontaktinformasjon
              </h2>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-[#eef5f1] p-3">
                  <Mail className="h-5 w-5 text-[#0f3d2e]" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">E-post</p>
                  <p className="mt-1 text-slate-600">post@utopia.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-full bg-[#eef5f1] p-3">
                  <MapPin className="h-5 w-5 text-[#0f3d2e]" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Adresse</p>
                  <p className="mt-1 text-slate-600">Utopiaveien 1</p>
                  <p className="text-slate-600">0123 Utopia, Norge</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-full bg-[#eef5f1] p-3">
                  <Phone className="h-5 w-5 text-[#0f3d2e]" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Telefon</p>
                  <p className="mt-1 text-slate-600">+47 00 000 000</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-full bg-[#eef5f1] p-3">
                  <Clock3 className="h-5 w-5 text-[#0f3d2e]" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Åpningstider</p>
                  <p className="mt-1 text-slate-600">Man–fre: 09:00–17:00</p>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-emerald-200 bg-[#eef5f1] p-5">
              <p className="text-sm leading-7 text-slate-700">
                Denne kontaktsiden er del av et skoleprosjekt. Meldinger brukes
                som demonstrasjon av funksjonalitet og går ikke til en faktisk
                kundeservice.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}