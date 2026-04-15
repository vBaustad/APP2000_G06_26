/**
 * Fil: CreateAnnonsorPage.tsx
 * Beskrivelse: Side for å opprette en ny annonse i annonsørportalen.
 * Utvikler(e): Synne Nilsen Oppberget
 */

import { useState } from "react";

export default function CreateAnnonsorPage() {
  const [tittel, setTittel] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [bildeUrl, setBildeUrl] = useState("");
  const [lenkeUrl, setLenkeUrl] = useState("");
  const [prisPerVisning, setPrisPerVisning] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitted(false);

    if (!tittel.trim()) {
      setError("Du må skrive inn en tittel.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/annonser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tittel,
          beskrivelse: beskrivelse || null,
          bilde_url: bildeUrl || null,
          lenke_url: lenkeUrl || null,
          pris_per_visning: prisPerVisning ? Number(prisPerVisning) : 0,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error || "Kunne ikke lagre annonsen.");
        return;
      }

      setSubmitted(true);
      setTittel("");
      setBeskrivelse("");
      setBildeUrl("");
      setLenkeUrl("");
      setPrisPerVisning("");
    } catch {
      setError("Kunne ikke kontakte serveren. Sjekk at API kjører.");
    }
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
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800">
                Tittel
              </label>
              <input
                type="text"
                placeholder="For eksempel Sommerstilbud på hytte"
                value={tittel}
                onChange={(event) => setTittel(event.target.value)}
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
                value={beskrivelse}
                onChange={(event) => setBeskrivelse(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800">
                Bilde-URL
              </label>
              <input
                type="text"
                placeholder="https://dittdomene.no/bilde.jpg"
                value={bildeUrl}
                onChange={(event) => setBildeUrl(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800">
                Link til hjemmeside
              </label>
              <input
                type="url"
                placeholder="https://din-hjemmeside.no"
                value={lenkeUrl}
                onChange={(event) => setLenkeUrl(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Pris per visning
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={prisPerVisning}
                  onChange={(event) => setPrisPerVisning(event.target.value)}
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
