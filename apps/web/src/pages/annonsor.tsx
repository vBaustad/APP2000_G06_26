/**
 * Fil: annonsor.tsx
 * Utvikler(e): Vebjørn Baustad, Synne Nilsen Oppberget
 * Beskrivelse: Annonsørside og tilgangssjekk for annonsørroller.
 */

import { useEffect, useMemo, useState } from "react";
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
        <h1 className="text-3xl font-bold mb-4">Annonsørportal</h1>
        <p className="mb-6 text-gray-600">
          Her kan du administrere dine annonser. Funksjonen er begrenset til brukere med rollen <strong>annonsør</strong>.
        </p>

        {error && <p className="mb-4 rounded bg-red-50 px-4 py-2 text-red-700">{error}</p>}

        {loading ? (
          <p>Laster annonser...</p>
        ) : ads.length === 0 ? (
          <p>Ingen annonser er funnet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {ads.map((ad) => (
              <article key={ad.id} className="rounded-3xl border border-gray-200 bg-slate-50 p-5 shadow-sm">
                <h2 className="text-xl font-semibold mb-2">{ad.tittel}</h2>
                <p className="mb-3 text-sm text-gray-600">{ad.kategori || "Uten kategori"}</p>
                <p className="mb-4 text-gray-700">{ad.beskrivelse ?? "Ingen beskrivelse"}</p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                  <span>Status: {ad.status}</span>
                  <span>Visning: {ad.pris_per_visning}</span>
                  <span>Klikk: {ad.pris_per_klikk}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

