/**
 * Fil: CreateAnnonsorPage.tsx
 * Beskrivelse: Side for å opprette en ny annonse i annonsørportalen.
 * Utvikler(e): Synne Nilsen Oppberget
 */

import { useState } from "react";

export default function CreateAnnonsorPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="bg-slate-100 text-slate-900">
      <section className="bg-emerald-600 text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 md:py-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">
            Annonsørportal
          </p>
          <h1 className="text-4xl font-semibold md:text-5xl">Opprett ny annonse</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-emerald-100/90">
            Fyll inn annonseinformasjonen og publiser den for dine besøkende.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800">
                Tittel
              </label>
              <input
                type="text"
                placeholder="For eksempel Sommerstilbud på hytte"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800">
                Beskrivelse
              </label>
              <textarea
                rows={4}
                placeholder="Skriv kort hva annonsen handler om"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Startdato
                </label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Sluttdato
                </label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Pris per visning
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Pris per klikk
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Lagre annonse
            </button>

            {submitted && (
              <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Annonsen er registrert (simulert). Du kan nå tilbake til annonsørportalen.
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
