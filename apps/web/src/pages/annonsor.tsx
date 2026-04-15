/**
 * Fil: annonsor.tsx
 * Utvikler(e): Vebjørn Baustad, Synne Nilsen Oppberget
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
  lenke_url: string | null;
  bilde_url: string | null;
  pris_per_visning: string | number;
  pris_per_klikk: string | number;
  visninger: number;
  klikk: number;
  start_at: string | null;
  end_at: string | null;
  status: string;
};

const API_BASE = `${import.meta.env.VITE_API_URL}/api/annonser`;

export default function AnnonsorPage() {
  const { user, token } = useAuth();
  const isAnnonsor = useMemo(() => user?.roller?.includes("annonsor") ?? false, [user]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && isAnnonsor) {
      loadAds();
    }
  }, [token, isAnnonsor]);

  const navigate = useNavigate();

  const totalViews = useMemo(() => ads.reduce((sum, ad) => sum + ad.visninger, 0), [ads]);
  const totalClicks = useMemo(() => ads.reduce((sum, ad) => sum + ad.klikk, 0), [ads]);

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

  function handleNewAd() {
    navigate("/create-annonsor");
  }

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
          Her kan du administrere dine annonser. Funksjonen er begrenset til brukere med rollen <strong>annonsør</strong>.
        </p>

        {error && <p className="mb-4 rounded bg-red-50 px-4 py-2 text-red-700">{error}</p>}

        {loading ? (
          <p>Laster annonser...</p>
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
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {ads.map((ad) => (
                <article key={ad.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{ad.tittel}</h2>
                      <p className="text-sm text-slate-500">{ad.kategori || "Uten kategori"}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">{ad.status}</span>
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
                    <span className="rounded-2xl bg-slate-50 px-3 py-2">Pris/visning: {ad.pris_per_visning}</span>
                    <span className="rounded-2xl bg-slate-50 px-3 py-2">Pris/klikk: {ad.pris_per_klikk}</span>
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
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

