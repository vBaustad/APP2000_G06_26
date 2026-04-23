/**
 * Fil: OpprettAnnonsor.tsx
 * Beskrivelse: Side for å opprette en ny annonse i annonsørportalen..
 *  Utvikler(e) Synne Nilsen Oppberget. Copilot (Windws) og ChatGPT (Open AI)  er brukt som guide og lærer i utviklingen av denne siden.
 * ChatGPT har gitt steg for steg instruksjoner og kode samt forklart viktig konspeter og hvordan koden fungerer.
 * Copilot er brukkt for å genrere kode innhold og forklare konsepter og kode på spesifikke steder.
 * Copilot og ChatGPT er også brukt i feilsøking. All kode er gått igjennom manuelt og endret på ved behov.
 * Beskrivelse: Annonsørside og tilgangssjekk for annonsørroller.
 *
 *
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

type EditingAd = {
  id: number;
  tittel?: string;
  beskrivelse?: string | null;
  lenke_url?: string | null;
  kategori?: string | null;
  daily_budget?: number | string | null;
  pris_per_visning?: number | string | null;
  pris_per_klikk?: number | string | null;
  annonsetype?: string | null;
  start_at?: string | null;
  end_at?: string | null;
};

export default function OpprettAnnonsor()
 {  const { t } = useTranslation("annonsor");
 const { token } = useAuth();
 const navigate = useNavigate();
const location = useLocation();
const editingAd = (location.state as { ad?: EditingAd } | null)?.ad;
console.log("editingAd:", editingAd);

  const [tittel, setTittel] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");



  const [bildeUrl, setBildeUrl] = useState("");
  const [bildeFile, setBildeFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lenkeUrl, setLenkeUrl] = useState("");
  const [kategori, setKategori] = useState("turutstyr");
  const keywordOptions: Array<{ value: string; labelKey: string }> = [
    { value: "Turutstyr", labelKey: "opprett.keywords.turutstyr" },
    { value: "Mat og drikke", labelKey: "opprett.keywords.matOgDrikke" },
    { value: "Overnattingssteder", labelKey: "opprett.keywords.overnattingssteder" },
    { value: "Klær og accesorier", labelKey: "opprett.keywords.klaerOgAccesorier" },
    { value: "Friluftsliv", labelKey: "opprett.keywords.friluftsliv" },
  ];
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
      titleKey: "opprett.plans.basic.title",
      descriptionKey: "opprett.plans.basic.description",
      clickPrice: 2.5,
      dailyBudget: 100,
    },
    standard: {
      titleKey: "opprett.plans.standard.title",
      descriptionKey: "opprett.plans.standard.description",
      clickPrice: 5,
      dailyBudget: 300,
    },
    premium: {
      titleKey: "opprett.plans.premium.title",
      descriptionKey: "opprett.plans.premium.description",
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
      setUploadError(t("opprett.messages.errorImageType"));
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
      setError(t("opprett.messages.errorTitleRequired"));
      return;
    }

    if (bildeFile && !bildeUrl) {
      setError(t("opprett.messages.errorWaitForUpload"));
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
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error || t("opprett.messages.errorSave"));
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
      setError(t("opprett.messages.errorServer"));
    }
  }

  return (
    <main className="bg-slate-100 text-slate-900">
      <section className="bg-emerald-600 text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 md:py-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">
            {t("opprett.hero.eyebrow")}
          </p>
          <h1 className="text-4xl font-semibold md:text-5xl">{t("opprett.hero.title")}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-emerald-100/90">
             {t("opprett.hero.subtitle")}
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
                    <h2 className="text-xl font-semibold text-slate-900">{t("opprett.sections.info.title")}</h2>
                    <p className="mt-1 text-sm text-slate-500">{t("opprett.sections.info.description")}</p>
                  </div>
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 transition">
                      <label className="mb-2 block text-sm font-medium text-slate-800">
                        {t("opprett.fields.title")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("opprett.fields.titlePlaceholder")}
                        value={tittel}
                        onChange={(event) => setTittel(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-4 transition">
                      <label className="mb-2 block text-sm font-medium text-slate-800">
                        {t("opprett.fields.description")}
                      </label>
                      <textarea
                        rows={4}
                        placeholder={t("opprett.fields.descriptionPlaceholder")}
                        value={beskrivelse}
                        onChange={(event) => setBeskrivelse(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-4 transition">
                      <label className="mb-2 block text-sm font-medium text-slate-800">
                        {t("opprett.fields.uploadImage")}
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
                          alt={t("opprett.fields.imagePreviewAlt")}
                          className="mt-3 h-40 w-full rounded-2xl object-cover border border-slate-200"
                        />
                      )}
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-4 transition">
                      <label className="mb-2 block text-sm font-medium text-slate-800">
                        {t("opprett.fields.linkLabel")}
                      </label>
                      <input
                        type="url"
                        placeholder={t("opprett.fields.linkPlaceholder")}
                        value={lenkeUrl}
                        onChange={(event) => setLenkeUrl(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-slate-900">{t("opprett.sections.customize.title")}</h2>
                    <p className="mt-1 text-sm text-slate-500">{t("opprett.sections.customize.description")}</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-800">
                        {t("opprett.fields.keywordsLabel")}
                      </label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {keywordOptions.map((keyword) => {
                          const active = keywords.includes(keyword.value);
                          return (
                            <button
                              key={keyword.value}
                              type="button"
                              onClick={() => toggleKeyword(keyword.value)}
                              className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                                active
                                  ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                              }`}
                            >
                              {t(keyword.labelKey)}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{t("opprett.fields.keywordsHint")}</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-800">
                          {t("opprett.fields.startDate")}
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
                          {t("opprett.fields.endDate")}
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
                  <h2 className="mb-4 text-xl font-semibold text-slate-900">{t("opprett.sections.payment.title")}</h2>
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
                                <span className="text-sm font-semibold text-slate-900">{t(plan.titleKey)}</span>
                                {selected ? (
                                  <span className="rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                                    {t("opprett.plans.selected")}
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-2 text-xs text-slate-500">{t(plan.descriptionKey)}</p>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <span className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-700">{t("opprett.plans.pricePerClick", { price: plan.clickPrice })}</span>
                                <span className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-700">{t("opprett.plans.dailyBudget", { amount: plan.dailyBudget })}</span>
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
                {t("opprett.actions.reset")}
              </button>
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                {t("opprett.actions.publish")}
              </button>
            </div>

            {submitted && (
              <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {t("opprett.messages.success")}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
