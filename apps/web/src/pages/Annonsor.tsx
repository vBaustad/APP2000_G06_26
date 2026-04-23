/**
 * Fil: annonsor.tsx
 * Utvikler(e): Vebjørn Baustad, Synne Nilsen Oppberget. Copilot (Windws) og ChatGPT (Open AI)  er brukt som guide og lærer i utviklingen av denne siden. 
 * ChatGPT har gitt steg for steg instruksjoner og kode samt forklart viktig konspeter og hvordan koden fungerer.
 * Copilot er brukkt for å genrere deler av kode innhold og forklare konsepter og kode på spesifikke steder.
 * Copilot og ChatGPT er også brukt i feilsøking. All kode er gått igjennom manuelt og endret på ved behov.
 * Beskrivelse: Annonsørside og tilgangssjekk for annonsørroller.
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Ad = {
  id: number;
  tittel: string;
  beskrivelse: string | null;
  kategori: string | null;
  keywords?: string | null;
  annonsetype: string | null;
  lenke_url: string | null;
  bilde_url: string | null;
  pris_per_visning: string | number;
  pris_per_klikk: string | number;
  daily_budget: string | number;
  budget_spent: string | number;
  visninger: number;
  klikk: number;
  start_at: string | null;
  end_at: string | null;
  status: string;
};

const API_BASE = `${import.meta.env.VITE_API_URL}/api/annonser`;

export default function Annonsor() {
  // All hooks MUST be at the top of the component
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // State declarations
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "ended">("all");

  // Memoized values
  const isAnnonsor = useMemo(() => user?.roller?.includes("annonsor") ?? false, [user]);

  const filteredAds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return ads.filter((ad) => {
      const status = ad.status?.toLowerCase() ?? "";
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && status === "active") ||
        (statusFilter === "paused" && status === "paused") ||
        (statusFilter === "ended" && (status === "ended" || status === "utløpt"));

      const matchesSearch =
        !query ||
        ad.tittel.toLowerCase().includes(query) ||
        ad.beskrivelse?.toLowerCase().includes(query) ||
        ad.kategori?.toLowerCase().includes(query) ||
        ad.keywords?.toLowerCase().includes(query) ||
        ad.annonsetype?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [ads, searchQuery, statusFilter]);

  const totalViews = useMemo(() => ads.reduce((sum, ad) => sum + ad.visninger, 0), [ads]);
  const totalClicks = useMemo(() => ads.reduce((sum, ad) => sum + ad.klikk, 0), [ads]);

  // Effects
  useEffect(() => {
    if (token && isAnnonsor) {
      loadAds();
    }
  }, [token, isAnnonsor]);

  // Handler functions
  async function loadAds() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Kunne ikke hente annonser");
      }
      const data = (await res.json()) as Ad[];
      setAds(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        console.error("Kunne ikke slette annonsen");
        return;
      }

      setAds((prev) => prev.filter((ad) => ad.id !== id));
    } catch (error) {
      console.error("Feil ved sletting:", error);
    }
  };

const handleEdit = (ad: Ad) => {
  navigate("/opprett-annonsor", { state: { ad } });
};

  function handleNewAd() {
    navigate("/opprett-annonsor");
  }

  function getStatusBadgeClasses(status: string | null) {
    const value = status?.toLowerCase() ?? "";
    if (value === "active") {
      return "bg-emerald-50 text-emerald-700";
    }
    if (value === "paused") {
      return "bg-amber-50 text-amber-700";
    }
    if (value === "ended" || value === "utløpt") {
      return "bg-slate-100 text-slate-700";
    }
    return "bg-slate-50 text-slate-700";
  }

  async function registerAdEvent(id: number, eventType: "view" | "click") {
    try {
      const res = await fetch(`${API_BASE}/${id}/${eventType}`, { method: "POST" });
      if (!res.ok) return;
      const updated = (await res.json()) as Ad;
      setAds((previous) => previous.map((ad) => (ad.id === id ? updated : ad)));
    } catch {
      // ignore for now
    }
  }

  function handleLinkClick(ad: Ad) {
    if (!ad.lenke_url) return;
    registerAdEvent(ad.id, "click");
    window.open(ad.lenke_url, "_blank", "noopener,noreferrer");
  }


  // Conditional early returns (after all hooks and functions)
  if (!token) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-center text-lg">Du må være innlogget for å bruke annonsørportalen.</p>
      </div>
    );
  }

  if (!isAnnonsor) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-center text-lg">
          Denne siden er kun for brukere med rollen <strong>annonsør</strong>.
        </p>
      </div>
    );
  }

  // Main render
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Annonsørportal</h1>
          <button
            type="button"
            onClick={handleNewAd}
            className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Ny annonse
          </button>
        </div>
        <p className="mb-6 text-gray-600">
          Her kan du administrere dine annonser.
        </p>

        <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_260px] lg:items-end">
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-4">
              {[
                { value: "all", label: "Alle annonser" },
                { value: "active", label: "Aktive annonser" },
                { value: "paused", label: "Inaktive annonser" },
                { value: "ended", label: "Annonse historikk" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.value as typeof statusFilter)}
                  className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                    statusFilter === option.value
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-500">Filtrer annonsene dine etter status for å finne kampanjer raskere.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-slate-700">Søk i annonser</label>
            <div className="flex items-center gap-2">
              <input
                type="search"
                placeholder="Tittel, kategori eller søkeord"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="rounded-full border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
              >
                Nullstill
              </button>
            </div>
          </div>
        </div>

        {error && <p className="mb-4 rounded bg-red-50 px-4 py-2 text-red-700">{error}</p>}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 h-6 w-3/4 rounded-full bg-slate-200" />
                <div className="mb-4 h-48 rounded-3xl bg-slate-200" />
                <div className="grid gap-2">
                  <div className="h-10 rounded-2xl bg-slate-200" />
                  <div className="h-10 rounded-2xl bg-slate-200" />
                  <div className="h-10 rounded-2xl bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : ads.length === 0 ? (
          <p>Ingen annonser er funnet.</p>
        ) : (
          <>
            <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-900 shadow-sm">
              <h2 className="text-xl font-semibold mb-3">Annonseanalyse</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Antall annonser</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{ads.length}</p>
                </div>
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Totale visninger</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{totalViews}</p>
                </div>
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Totale klikk</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{totalClicks}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">Viser {filteredAds.length} annonser etter gjeldende filter.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {filteredAds.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
                  Ingen annonser matcher søk eller filter. Prøv et annet søk eller nullstill filteret.
                </div>
              ) : (
                filteredAds.map((ad) => (
                  <article key={ad.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900">{ad.tittel}</h2>
                        <p className="text-sm text-slate-500">
                          {ad.kategori || "Uten kategori"}
                          {ad.keywords ? ` • ${ad.keywords}` : ""}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeClasses(ad.status)}`}>
                        {ad.status || "Ukjent"}
                      </span>
                    </div>

                    {ad.bilde_url ? (
                      <img
                        src={ad.bilde_url}
                        alt={ad.tittel}
                        className="mb-4 h-40 w-full rounded-3xl object-cover"
                      />
                    ) : null}

                    <p className="mb-4 text-slate-700">{ad.beskrivelse ?? "Ingen beskrivelse"}</p>

                    <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                      <span className="rounded-2xl bg-slate-50 px-3 py-2">Type: {ad.annonsetype || "–"}</span>
                      <span className="rounded-2xl bg-slate-50 px-3 py-2">Pris/visning: {ad.pris_per_visning}</span>
                      <span className="rounded-2xl bg-slate-50 px-3 py-2">Pris/klikk: {ad.pris_per_klikk}</span>
                      <span className="rounded-2xl bg-slate-50 px-3 py-2">Dagsbudsjett: {ad.daily_budget} kr</span>
                      <span className="rounded-2xl bg-slate-50 px-3 py-2">Brukt i dag: {ad.budget_spent} kr</span>
                      <span className="rounded-2xl bg-slate-50 px-3 py-2">Visninger: {ad.visninger}</span>
                      <span className="rounded-2xl bg-slate-50 px-3 py-2">Klikk: {ad.klikk}</span>
                      <span className="rounded-2xl bg-slate-50 px-3 py-2 md:col-span-2">Periode: {ad.start_at ? new Date(ad.start_at).toLocaleDateString("no-NO") : "-"} – {ad.end_at ? new Date(ad.end_at).toLocaleDateString("no-NO") : "-"}</span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => registerAdEvent(ad.id, "view")}
                        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Registrer visning
                      </button>
                      {ad.lenke_url ? (
                        <button
                          type="button"
                          onClick={() => handleLinkClick(ad)}
                          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                        >
                          Åpne annonse
                        </button>
                        
                      ) : null}
                      <button
  type="button"
  onClick={() => handleEdit(ad)}
  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
>
  Rediger
</button>
<button
  type="button"
  onClick={() => {
    if (confirm("Er du sikker på at du vil slette annonsen?")) {
      handleDelete(ad.id);
    }
  }}
  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
>
  Slett
</button>

                      <span className="ml-auto rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
                        Budsjett brukt: {ad.budget_spent} kr
                      </span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

