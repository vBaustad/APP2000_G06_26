/**
 * Fil: OpprettAnnonsor.tsx
 * Beskrivelse: Side for å opprette en ny annonse i annonsørportalen.
 * Utvikler(e): Synne Nilsen Oppberget
 */

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function OpprettAnnonsor()
 {  const { token } = useAuth();
 const navigate = useNavigate();
const location = useLocation();
const editingAd = (location.state as { ad?: any })?.ad;
console.log("editingAd:", editingAd);

  const [tittel, setTittel] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");


  
  const [bildeUrl, setBildeUrl] = useState("");
  const [bildeFile, setBildeFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lenkeUrl, setLenkeUrl] = useState("");
  const [kategori, setKategori] = useState("turutstyr");
  const keywordOptions = ["Turutstyr", "Mat og drikke", "Overnattingssteder", "Klær og accesorier", "Friluftsliv"];
  const [keywords, setKeywords] = useState<string[]>(["Turutstyr"]);
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

useEffect(() => {
  if (editingAd) {
    setTittel(editingAd.tittel || "");
    setBeskrivelse(editingAd.beskrivelse || "");
    setLenkeUrl(editingAd.lenke_url || "");
    setKategori(editingAd.kategori || "turutstyr");
    setDailyBudget(String(editingAd.daily_budget || "300"));

    setPrisPerVisning(String(editingAd.pris_per_visning || "0"));
    setPrisPerKlikk(String(editingAd.pris_per_klikk || "5"));
    setAnnonseType(editingAd.annonsetype || "standard");
    setStartAt(editingAd.start_at || "");
    setEndAt(editingAd.end_at || "");
  }
}, [editingAd]);
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

  function resetFormFields() {
    setTittel("");
    setBeskrivelse("");
    setBildeUrl("");
    setBildeFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    setLenkeUrl("");
    setKategori("turutstyr");
    setKeywords(["Turutstyr"]);
    setAnnonseType("standard");
    setStartAt("");
    setEndAt("");
    setDailyBudget("300");
    setPrisPerVisning("0");
    setPrisPerKlikk("5");
    setError(null);
    setSubmitted(false);
  }

  function handleBildeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setBildeFile(null);
      setPreviewUrl(null);
      setBildeUrl("");
      setUploadError(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Velg et bilde (jpg, png eller lignende).");
      return;
    }

    setBildeFile(file);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setPreviewUrl(result);
        setBildeUrl(result);
      }
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleSubmit(event: React.FormEvent) {
     console.log("SUBMIT KJØRER");
    event.preventDefault();
    setError(null);    setSubmitted(false);

    if (!tittel.trim()) {
      setError("Du må skrive inn en tittel.");
      return;
    }

    if (bildeFile && !bildeUrl) {
      setError("Vennligst vent på at bildet lastes opp før du sender inn annonsen.");
      return;
    }

   try {
  const url = editingAd
    ? `${import.meta.env.VITE_API_URL}/api/annonser/${editingAd.id}`
    : `${import.meta.env.VITE_API_URL}/api/annonser`;

  const method = editingAd ? "PUT" : "POST";

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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
      daily_budget: Number(dailyBudget),
      pris_per_visning: Number(prisPerVisning),
      pris_per_klikk: Number(prisPerKlikk),
    }),
  });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error || "Kunne ikke lagre annonsen.");
        return;
      }

      setSubmitted(true);
     navigate("/annonsor");
      setTittel("");
      setBeskrivelse("");
      setBildeUrl("");
      setLenkeUrl("");
      setKategori("turutstyr");
      setKeywords(["Turutstyr"]);
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
            Mine annonser 
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
                <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-slate-900">Annonseinfo</h2>
                    <p className="mt-1 text-sm text-slate-500">Skriv inn tittel, beskrivelse og last opp bilde for annonsen.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 transition">
                      <label className="mb-2 block text-sm font-medium text-slate-800">
                        Tittel
                      </label>
                      <input
                        type="text"
                        placeholder="Annonsetittel"
                        value={tittel}
                        onChange={(event) => setTittel(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-4 transition">
                      <label className="mb-2 block text-sm font-medium text-slate-800">
                        Beskrivelse
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Annonsetekst"
                        value={beskrivelse}
                        onChange={(event) => setBeskrivelse(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-4 transition">
                      <label className="mb-2 block text-sm font-medium text-slate-800">
                        Last opp bilde
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBildeChange}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition file:cursor-pointer file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      />
                      {uploadError && (
                        <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                      )}
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Preview av annonsebildet"
                          className="mt-3 h-40 w-full rounded-2xl object-cover border border-slate-200"
                        />
                      )}
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-4 transition">
                      <label className="mb-2 block text-sm font-medium text-slate-800">
                        Link til hjemmeside
                      </label>
                      <input
                        type="url"
                        placeholder="https://din-hjemmeside.no"
                        value={lenkeUrl}
                        onChange={(event) => setLenkeUrl(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-slate-900">Tilpass din annonse</h2>
                    <p className="mt-1 text-sm text-slate-500">Velg riktig kategori, relevante søkeord og kampanjeperiode.</p>
                  </div>
                  <div className="space-y-6">
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

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-800">
                          Startdato
                        </label>
                        <input
                          type="date"
                          value={startAt}
                          onChange={(event) => setStartAt(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-800">
                          Sluttdato
                        </label>
                        <input
                          type="date"
                          value={endAt}
                          onChange={(event) => setEndAt(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
                  <h2 className="mb-4 text-xl font-semibold text-slate-900">Betalingsmodell</h2>
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-4">
                      <div className="grid gap-3">
                        {Object.entries(planRecommendations).map(([key, plan]) => {
                          const selected = annonseType === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setAnnonseType(key)}
                              className={`rounded-3xl border p-4 text-left transition ${
                                selected
                                  ? "border-emerald-600 bg-emerald-50"
                                  : "border-slate-300 bg-white hover:border-slate-400"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-semibold text-slate-900">{plan.title}</span>
                                {selected ? (
                                  <span className="rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                                    Valgt
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-2 text-xs text-slate-500">{plan.description}</p>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <span className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-700">Pris/klikk {plan.clickPrice} kr</span>
                                <span className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-700">Daglig {plan.dailyBudget} kr</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 sm:max-w-xl sm:mx-auto">
                    </div>
                  </div>
                </section>
              </aside>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={resetFormFields}
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Tøm skjema
              </button>
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Publiser
              </button>
            </div>

            {submitted && (
              <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Annonsen er registrert. Du kan nå tilbake til annonsørportalen.
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
