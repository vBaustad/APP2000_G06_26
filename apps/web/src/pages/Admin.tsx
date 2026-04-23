/**
 * Fil: Admin.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Admin/redaktør-panel for å godkjenne annonsør-søknader og tildele roller til brukere.
 *
 * KI-bruk: Claude (Anthropic) og GitHub Copilot er brukt som verktøy
 * under utvikling. All kode er lest, forstått og testet. Se rapportens
 * kapittel "Kommentarer til bruk/tilpassing av kode".
 */

import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

type PendingAnnonsor = {
  id: number;
  navn: string;
  epost: string;
  telefon: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

type PendingAnnonse = {
  id: number;
  tittel: string;
  beskrivelse: string | null;
  bilde_url: string | null;
  kategori: string | null;
  status: "pending" | "active" | "paused" | "rejected" | "ended";
  created_at: string;
  annonsor: { id: number; navn: string; epost: string } | null;
};

type Rolle = { id: number; kode: string; navn: string };

type AdminBruker = {
  id: number;
  epost: string;
  fornavn: string | null;
  etternavn: string | null;
  bruker_rolle: { rolle: Rolle }[];
};

const API_BASE = `${import.meta.env.VITE_API_URL}/api/admin`;

export default function Admin() {
  const { user, token } = useAuth();
  const { t, i18n } = useTranslation("admin");
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "nb-NO";
  const isAdmin = user?.roller?.includes("admin") ?? false;

  const [pending, setPending] = useState<PendingAnnonsor[]>([]);
  const [pendingAnnonser, setPendingAnnonser] = useState<PendingAnnonse[]>([]);
  const [roller, setRoller] = useState<Rolle[]>([]);
  const [brukere, setBrukere] = useState<AdminBruker[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  );

  async function loadPending() {
    const res = await fetch(`${API_BASE}/annonsorer/pending`, { headers: authHeaders });
    if (res.ok) setPending(await res.json());
  }

  async function loadPendingAnnonser() {
    const res = await fetch(`${API_BASE}/annonser/pending`, { headers: authHeaders });
    if (res.ok) setPendingAnnonser(await res.json());
  }

  async function loadRoller() {
    const res = await fetch(`${API_BASE}/roller`, { headers: authHeaders });
    if (res.ok) setRoller(await res.json());
  }

  async function loadBrukere(q: string) {
    const url = q ? `${API_BASE}/brukere?q=${encodeURIComponent(q)}` : `${API_BASE}/brukere`;
    const res = await fetch(url, { headers: authHeaders });
    if (res.ok) setBrukere(await res.json());
  }

  useEffect(() => {
    if (!isAdmin || !token) return;
    loadPending();
    loadPendingAnnonser();
    loadRoller();
    loadBrukere("");
  }, [isAdmin, token]);

  useEffect(() => {
    if (!isAdmin || !token) return;
    const tId = setTimeout(() => loadBrukere(query), 250);
    return () => clearTimeout(tId);
  }, [query, isAdmin, token]);

  async function handleAnnonsor(id: number, action: "approve" | "reject") {
    setBusy(`annonsor-${id}`);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/annonsorer/${id}/${action}`, {
        method: "POST",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error(action === "approve" ? t("errors.approve") : t("errors.reject"));
      await loadPending();
      await loadBrukere(query);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errors.generic"));
    } finally {
      setBusy(null);
    }
  }

  async function handleAnnonse(id: number, action: "approve" | "reject") {
    setBusy(`annonse-${id}`);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/annonser/${id}/${action}`, {
        method: "POST",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error(action === "approve" ? t("errors.approve") : t("errors.reject"));
      await loadPendingAnnonser();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errors.generic"));
    } finally {
      setBusy(null);
    }
  }

  async function grantRole(brukerId: number, rolle: string) {
    setBusy(`grant-${brukerId}-${rolle}`);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/bruker/${brukerId}/roller`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ rolle }),
      });
      if (!res.ok) throw new Error(t("errors.grantRole"));
      await loadBrukere(query);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errors.generic"));
    } finally {
      setBusy(null);
    }
  }

  async function revokeRole(brukerId: number, rolle: string) {
    setBusy(`revoke-${brukerId}-${rolle}`);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/bruker/${brukerId}/roller/${rolle}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok && res.status !== 204) throw new Error(t("errors.revokeRole"));
      await loadBrukere(query);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errors.generic"));
    } finally {
      setBusy(null);
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">{t("title")}</h1>
          <p className="mt-4 text-slate-600">{t("noAccess.description")}</p>
          <NavLink
            to="/logg-inn"
            className="mt-6 inline-flex rounded-xl bg-[#0f8f5b] px-6 py-3 font-medium text-white hover:bg-[#0d7a4e]"
          >
            {t("noAccess.loginButton")}
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f3d2e]">{t("eyebrow")}</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">{t("heading")}</h1>
          <p className="mt-2 text-slate-600">{t("description")}</p>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("advertisers.heading", { n: pending.length })}
          </h2>
          <div className="mt-4 space-y-3">
            {pending.length === 0 ? (
              <p className="text-slate-500">{t("advertisers.empty")}</p>
            ) : (
              pending.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{a.navn}</p>
                    <p className="text-sm text-slate-600">{a.epost}</p>
                    {a.telefon && <p className="text-sm text-slate-600">{a.telefon}</p>}
                    <p className="mt-1 text-xs text-slate-500">
                      {t("advertisers.sentOn", { date: new Date(a.created_at).toLocaleDateString(locale) })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busy === `annonsor-${a.id}`}
                      onClick={() => handleAnnonsor(a.id, "approve")}
                      className="rounded-xl bg-[#0f8f5b] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d7a4e] disabled:opacity-50"
                    >
                      {t("advertisers.approve")}
                    </button>
                    <button
                      type="button"
                      disabled={busy === `annonsor-${a.id}`}
                      onClick={() => handleAnnonsor(a.id, "reject")}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                      {t("advertisers.reject")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("ads.heading", { n: pendingAnnonser.length })}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{t("ads.description")}</p>
          <div className="mt-4 space-y-3">
            {pendingAnnonser.length === 0 ? (
              <p className="text-slate-500">{t("ads.empty")}</p>
            ) : (
              pendingAnnonser.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-start md:justify-between"
                >
                  <div className="flex min-w-0 gap-4">
                    {a.bilde_url && (
                      <img
                        src={
                          a.bilde_url.startsWith("http") || a.bilde_url.startsWith("/images/")
                            ? a.bilde_url
                            : `${import.meta.env.VITE_API_URL}${a.bilde_url}`
                        }
                        alt={a.tittel}
                        className="h-20 w-28 shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{a.tittel}</p>
                      {a.annonsor && (
                        <p className="text-sm text-slate-600">{a.annonsor.navn}</p>
                      )}
                      {a.beskrivelse && (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                          {a.beskrivelse}
                        </p>
                      )}
                      {a.kategori && (
                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                          {a.kategori}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        {t("advertisers.sentOn", { date: new Date(a.created_at).toLocaleDateString(locale) })}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={busy === `annonse-${a.id}`}
                      onClick={() => handleAnnonse(a.id, "approve")}
                      className="rounded-xl bg-[#0f8f5b] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d7a4e] disabled:opacity-50"
                    >
                      {t("ads.approve")}
                    </button>
                    <button
                      type="button"
                      disabled={busy === `annonse-${a.id}`}
                      onClick={() => handleAnnonse(a.id, "reject")}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                      {t("ads.reject")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">{t("roles.heading")}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {t("roles.description")}
          </p>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("roles.searchPlaceholder")}
            className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-[#0f8f5b] focus:bg-white"
          />

          <div className="mt-4 space-y-3">
            {brukere.length === 0 ? (
              <p className="text-slate-500">{t("roles.noUsers")}</p>
            ) : (
              brukere.map((b) => {
                const brukerRoller = new Set(b.bruker_rolle.map((r) => r.rolle.kode));
                return (
                  <div
                    key={b.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {b.fornavn || b.etternavn
                            ? `${b.fornavn ?? ""} ${b.etternavn ?? ""}`.trim()
                            : b.epost}
                        </p>
                        <p className="text-sm text-slate-600">{b.epost}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {b.bruker_rolle.map((br) => (
                          <span
                            key={br.rolle.id}
                            className="inline-flex items-center gap-2 rounded-full bg-[#eef5f1] px-3 py-1 text-xs font-medium text-[#0f3d2e]"
                          >
                            {br.rolle.kode}
                            <button
                              type="button"
                              disabled={busy === `revoke-${b.id}-${br.rolle.kode}`}
                              onClick={() => revokeRole(b.id, br.rolle.kode)}
                              className="text-[#0f3d2e]/70 hover:text-red-600 disabled:opacity-50"
                              aria-label={t("roles.removeAria", { role: br.rolle.kode })}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {roller
                        .filter((r) => !brukerRoller.has(r.kode))
                        .map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            disabled={busy === `grant-${b.id}-${r.kode}`}
                            onClick={() => grantRole(b.id, r.kode)}
                            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-[#0f8f5b] hover:text-[#0f8f5b] disabled:opacity-50"
                          >
                            + {r.kode}
                          </button>
                        ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
