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
  const [kategori, setKategori] = useState("Turutstyr");
  const keywordOptions = ["Turutstyr", "Turmat", "Hytte", "turtips", "friluftsliv"];
  const [keywords, setKeywords] = useState<string[]>(["turutstyr"]);
  const [annonseType, setAnnonseType] = useState("standard");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [dailyBudget, setDailyBudget] = useState("300");

  function toggleKeyword(keyword: string) {
    setKeywords((previous) =>
      previous.includes(keyword)
        ? previous.filter((item) => item !== keyword)
        : [...previous, keyword]
    );
  }
  const [prisPerVisning, setPrisPerVisning] = useState("0");
  const [prisPerKlikk, setPrisPerKlikk] = useState("5");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planRecommendations = {
    basic: {
      title: "Basic",
      description: "En rimelig startpakke med lavere kostnad per klikk og små budsjetter.",
      clickPrice: 2.5,
      dailyBudget: 100,
    },
    standard: {
      title: "Standard",
      description: "God balanse mellom pris og synlighet. Passer de fleste annonsører.",
      clickPrice: 5,
      dailyBudget: 300,
    },
    premium: {
      title: "Premium",
      description: "Sterk synlighet med høyere bud og større daglig budsjett.",
      clickPrice: 10,
      dailyBudget: 600,
    },
  } as const;

  const selectedPlan = planRecommendations[annonseType as keyof typeof planRecommendations];

  function applyPlanRecommendation() {
    setPrisPerKlikk(String(selectedPlan.clickPrice));
    setDailyBudget(String(selectedPlan.dailyBudget));
  }

  function resetFormFields() {
    setTittel("");
    setBeskrivelse("");
    setBildeUrl("");
    setLenkeUrl("");
    setKategori("turutstyr");
    setKeywords(["turutstyr"]);
    setAnnonseType("standard");
    setStartAt("");
    setEndAt("");
    setDailyBudget("300");
    setPrisPerVisning("0");
    setPrisPerKlikk("5");
    setError(null);
    setSubmitted(false);
  }

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
          kategori,
          keywords: keywords.length ? keywords.join(",") : null,
          annonsetype: annonseType,
          start_at: startAt || null,
          end_at: endAt || null,
          daily_budget: dailyBudget ? Number(dailyBudget) : 0,
          pris_per_visning: prisPerVisning ? Number(prisPerVisning) : 0,
          pris_per_klikk: prisPerKlikk ? Number(prisPerKlikk) : 0,
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
      setKategori("turutstyr");
      setKeywords(["turutstyr"]);
      setAnnonseType("standard");
      setStartAt("");
      setEndAt("");
      setDailyBudget("300");
      setPrisPerVisning("0");
      setPrisPerKlikk("5");
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
             Kom i kontakt med hundrevis av turinteresserte!
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

            <div className="grid gap-8 lg:grid-cols-[1.7fr_0.95fr]">
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Tittel
                  </label>
                  <input
                    type="text"
                    placeholder="Annonsetittel"
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
                    placeholder="Annonsetekst"
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

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Kategori
                  </label>
                  <select
                    value={kategori}
                    onChange={(event) => setKategori(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="turutstyr">Turutstyr</option>
                    <option value="turmat">Turmat</option>
                    <option value="hytte">Hytte</option>
                    <option value="turtips">Turtips</option>
                    <option value="friluftsliv">Friluftsliv</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Søkeord / kategorier
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {keywordOptions.map((keyword) => {
                      const active = keywords.includes(keyword);
                      return (
                        <button
                          key={keyword}
                          type="button"
                          onClick={() => toggleKeyword(keyword)}
                          className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            active
                              ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                          }`}
                        >
                          {keyword}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Velg søkeord og kategorier som skal knyttes til annonsen.</p>
                </div>
              </div>

              <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-slate-900">Annonsevalg</h2>
                <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4">
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Annonsetype
                  </label>
                  <select
                    value={annonseType}
                    onChange={(event) => setAnnonseType(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">Velg et budsjettnivå som gir synlighet og foreslåtte priser.</p>
                </div>

                <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Anbefalt</p>
                      <p className="text-xs text-slate-500">{selectedPlan.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={applyPlanRecommendation}
                      className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      Bruk forslag
                    </button>
                  </div>
                  <div className="grid gap-3">
                    <div className="rounded-3xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Forslag pris per klikk</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{selectedPlan.clickPrice} kr</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Forslag daglig budsjett</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{selectedPlan.dailyBudget} kr</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4">
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Daglig budsjett
                  </label>
                  <input
                    type="number"
                    placeholder="300"
                    value={dailyBudget}
                    onChange={(event) => setDailyBudget(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4">
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

                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Pris per klikk
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    value={prisPerKlikk}
                    onChange={(event) => setPrisPerKlikk(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </aside>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={resetFormFields}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Slett innhold
              </button>
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Send inn
              </button>
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Lagre annonse
              </button>
            </div>

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
