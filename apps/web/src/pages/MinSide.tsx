/**
 * Fil: MinSide.tsx
 * Utvikler(e): Parasto Jamshidi, Ramona Cretulescu, Vebjørn Baustad
 * Beskrivelse:
 * Brukerportal med profilheader, faner, venstre informasjonskolonne og
 * høyre hovedinnhold for mine turer, favoritter, kommentarer, bookinger
 * og konto. Henter bruker, favoritter, turpåmeldinger og hyttebookinger
 * fra /api/bruker/me.
 */

import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  CalendarDays,
  Heart,
  Mail,
  Settings,
  Footprints,
  LogOut,
  Plus,
  Users,
  House,
  Bell,
  MapPinned,
  Megaphone,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

type AnnonsorSoknadStatus = {
  id: number;
  status: "pending" | "approved" | "rejected";
  navn: string;
  created_at: string;
} | null;

type TabKey =
  | "oversikt"
  | "mineTurer"
  | "favoritter"
  | "bookinger"
  | "konto";

type MinKommentar = {
  id: number;
  body: string | null;
  created_at: string;
  tur: { id: number; tittel: string } | null;
};

type PameldingStatus = "pending" | "binding" | "freed" | "locked";

const PAMELDING_LABEL: Record<PameldingStatus, string> = {
  pending: "Interesse meldt",
  binding: "Bindende påmelding",
  locked: "Dato låst",
  freed: "Dato fristilt",
};

const PAMELDING_STYLE: Record<PameldingStatus, string> = {
  pending: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  binding: "bg-[#eef5f1] text-[#0f3d2e] ring-1 ring-[#dcebe4]",
  locked: "bg-blue-100 text-blue-900 ring-1 ring-blue-200",
  freed: "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
};

type BookingStatus = "pending" | "confirmed" | "cancelled";

type HytteBooking = {
  id: number;
  start_dato: string;
  slutt_dato: string;
  status: BookingStatus;
  antall_gjester: number | null;
  total_pris: number | string | null;
  hytte: {
    id: number;
    navn: string;
    omrade: string | null;
    bilde_url: string | null;
  } | null;
};

const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Venter på bekreftelse",
  confirmed: "Bekreftet",
  cancelled: "Kansellert",
};

const BOOKING_STATUS_STYLE: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
  confirmed: "bg-[#eef5f1] text-[#0f3d2e] ring-1 ring-[#dcebe4]",
  cancelled: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

function formatBookingDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("no-NO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function MinSide() {
  const { user: authUser, token } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("oversikt");

  const isAnnonsor = authUser?.roller?.includes("annonsor") ?? false;
  const isTurleder = authUser?.roller?.includes("turleder") ?? false;
  const [soknadStatus, setSoknadStatus] = useState<AnnonsorSoknadStatus>(null);
  const [soknadOpen, setSoknadOpen] = useState(false);
  const [soknadNavn, setSoknadNavn] = useState("");
  const [soknadTelefon, setSoknadTelefon] = useState("");
  const [soknadBusy, setSoknadBusy] = useState(false);
  const [soknadError, setSoknadError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/bruker/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Kunne ikke hente profil");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!token || isAnnonsor) {
      setSoknadStatus(null);
      return;
    }
    fetch(`${import.meta.env.VITE_API_URL}/api/annonsorer/soknad/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AnnonsorSoknadStatus) => setSoknadStatus(data))
      .catch(() => setSoknadStatus(null));
  }, [token, isAnnonsor]);

  async function handleSoknad(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSoknadBusy(true);
    setSoknadError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/annonsorer/soknad`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ navn: soknadNavn, telefon: soknadTelefon || undefined }),
      });
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(data.error || "Kunne ikke sende søknad");
      }
      const data: AnnonsorSoknadStatus = await res.json();
      setSoknadStatus(data);
      setSoknadOpen(false);
      setSoknadNavn("");
      setSoknadTelefon("");
    } catch (err) {
      setSoknadError(err instanceof Error ? err.message : "Noe gikk galt");
    } finally {
      setSoknadBusy(false);
    }
  }

  const fullforteTurer =
    user?.tur_pamelding?.filter((t: any) => t.status === "Fullført").length || 0;

  const pameldteTurer =
    user?.tur_pamelding?.filter((t: any) => t.status === "pending").length || 0;

  const antallFavoritter = user?.favoritt?.length || 0;

  const medlemSiden = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("no-NO", {
        month: "long",
        year: "numeric",
      })
    : "Ukjent";

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/logg-inn";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-600">Laster din profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Min side</h1>
          <p className="mt-4 text-slate-600">
            Du må være logget inn for å se dine turer og favoritter.
          </p>
          <NavLink
            to="/logg-inn"
            className="mt-6 inline-flex rounded-xl bg-[#0f8f5b] px-6 py-3 font-medium text-white hover:bg-[#0d7a4e]"
          >
            Logg inn
          </NavLink>
        </div>
      </div>
    );
  }

  const favoriteItems = Array.isArray(user?.favoritt) ? user.favoritt : [];
  const tripItems = Array.isArray(user?.tur_pamelding) ? user.tur_pamelding : [];
  const bookingItems: HytteBooking[] = Array.isArray(user?.hytte_booking)
    ? (user.hytte_booking as HytteBooking[])
    : [];
  const aktiveBookinger = bookingItems.filter((b) => b.status !== "cancelled").length;
  const kommentarItems: MinKommentar[] = Array.isArray(user?.tur_kommentar)
    ? (user.tur_kommentar as MinKommentar[])
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
            <img
              src="/images/profile/usnprofile.png"
              alt={`${user.fornavn} ${user.etternavn}`}
              className="h-20 w-20 rounded-full object-cover shadow-sm ring-2 ring-[#dcebe4]"
            />

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f3d2e]">
                Min profil
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold text-slate-900">
                  {user.fornavn} {user.etternavn}
                </h1>
                <span className="rounded-full bg-[#eef5f1] px-3 py-1 text-sm font-medium text-[#0f3d2e]">
                  Turmedlem
                </span>
              </div>

              <p className="mt-2 flex items-center gap-2 text-slate-500">
                <Mail className="h-4 w-4" />
                {user.epost}
              </p>

              <p className="mt-2 max-w-2xl text-slate-600">
                Her får du oversikt over turene dine, fellesturer, favoritter,
                bookinger og kontoinformasjon.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <NavLink
                to="/rediger-profil"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-800 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4" />
                Rediger profil
              </NavLink>

              <NavLink
                to="/opprett-tur"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f8f5b] px-4 py-3 font-medium text-white hover:bg-[#0d7a4e]"
              >
                <Plus className="h-4 w-4" />
                Opprett tur
              </NavLink>

              {isTurleder && (
                <NavLink
                  to="/opprett-tur"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#dcebe4] bg-[#eef5f1] px-4 py-3 font-medium text-[#0f3d2e] hover:bg-[#e4efe9]"
                >
                  <Users className="h-4 w-4" />
                  Ny fellestur
                </NavLink>
              )}

              {!isAnnonsor && soknadStatus?.status !== "pending" && (
                <button
                  type="button"
                  onClick={() => {
                    setSoknadNavn(`${user.fornavn ?? ""} ${user.etternavn ?? ""}`.trim());
                    setSoknadError(null);
                    setSoknadOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-800 hover:bg-slate-50"
                >
                  <Megaphone className="h-4 w-4" />
                  Bli annonsør
                </button>
              )}
              {!isAnnonsor && soknadStatus?.status === "pending" && (
                <span className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-medium text-amber-800">
                  <Megaphone className="h-4 w-4" />
                  Annonsør-søknad sendt
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6">
          {[
            { key: "oversikt", label: "Oversikt" },
            { key: "mineTurer", label: "Mine turer" },
            { key: "favoritter", label: "Favoritter" },
            { key: "bookinger", label: "Bookinger" },
            { key: "konto", label: "Konto" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`border-b-2 px-4 py-4 text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? "border-[#0f8f5b] text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="border-b border-slate-200 pb-3 text-xl font-semibold text-slate-900">
              Info
            </h2>

            <div className="mt-4 space-y-5 text-slate-700">
              <div>
                <p className="text-sm font-medium text-slate-500">Navn</p>
                <p className="mt-1 text-lg">
                  {user.fornavn} {user.etternavn}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">E-post</p>
                <p className="mt-1 break-all text-lg">{user.epost}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">Medlem siden</p>
                <p className="mt-1 text-lg">{medlemSiden}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">Rolle</p>
                <p className="mt-1 text-lg">Bruker</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-200 pt-5">
              <NavLink
                to="/rediger-profil"
                className="flex items-center gap-3 text-sm font-medium text-[#0f8f5b] hover:text-[#0d7a4e]"
              >
                <Settings className="h-4 w-4" />
                Rediger profil
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                <LogOut className="h-4 w-4" />
                Logg ut
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Aktivitet</h3>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <Footprints className="h-5 w-5 text-[#0f8f5b]" />
                <div className="flex w-full items-center justify-between">
                  <span className="text-slate-600">Fullførte turer</span>
                  <span className="font-semibold text-slate-900">{fullforteTurer}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-[#0f8f5b]" />
                <div className="flex w-full items-center justify-between">
                  <span className="text-slate-600">Påmeldte turer</span>
                  <span className="font-semibold text-slate-900">{pameldteTurer}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-[#0f8f5b]" />
                <div className="flex w-full items-center justify-between">
                  <span className="text-slate-600">Favoritter</span>
                  <span className="font-semibold text-slate-900">{antallFavoritter}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Snarveier</h3>

            <div className="mt-4 space-y-3">
              <NavLink
                to="/turer"
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-slate-700 hover:bg-slate-50"
              >
                <MapPinned className="h-4 w-4 text-[#0f8f5b]" />
                Utforsk turer
              </NavLink>

              <NavLink
                to="/hytter"
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-slate-700 hover:bg-slate-50"
              >
                <House className="h-4 w-4 text-[#0f8f5b]" />
                Finn hytter
              </NavLink>
            </div>
          </section>
        </aside>

        <section className="space-y-6">
          {activeTab === "oversikt" && (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-2xl font-semibold text-slate-900">Mine turer</h2>
                </div>

                <div className="mt-5 space-y-3">
                  {tripItems.length > 0 ? (
                    tripItems.slice(0, 2).map((pamelding: any) => (
                      <div
                        key={pamelding.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-slate-900">
                              {pamelding.tur_dato.tur.tittel}
                            </h3>
                            <p className="mt-2 flex items-center gap-2 text-slate-500">
                              <CalendarDays className="h-4 w-4" />
                              {new Date(pamelding.tur_dato.start_at).toLocaleDateString("no-NO")}
                              {" – "}
                              {new Date(pamelding.tur_dato.end_at).toLocaleDateString("no-NO")}
                            </p>
                            {pamelding.tur_dato.tittel && (
                              <p className="mt-1 text-sm text-slate-400">
                                {pamelding.tur_dato.tittel}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-sm font-medium ${
                                PAMELDING_STYLE[pamelding.status as PameldingStatus] ??
                                "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                              }`}
                            >
                              {PAMELDING_LABEL[pamelding.status as PameldingStatus] ??
                                pamelding.status}
                            </span>

                            <NavLink
                              to={`/turer/${pamelding.tur_dato.tur_id}`}
                              className="rounded-xl bg-[#0f3d2e] px-4 py-2 text-sm font-medium text-white hover:bg-[#0c3125]"
                            >
                              Detaljer
                            </NavLink>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="mt-5 text-slate-500">Du er ikke påmeldt noen turer.</p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-2xl font-semibold text-slate-900">Varsler</h2>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <Bell className="mt-0.5 h-4 w-4 text-[#0f8f5b]" />
                      <p className="text-slate-700">
                        Du har {pameldteTurer} aktiv(e) turpåmelding(er).
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <Bell className="mt-0.5 h-4 w-4 text-[#0f8f5b]" />
                      <p className="text-slate-700">
                        {aktiveBookinger > 0
                          ? `Du har ${aktiveBookinger} aktiv${aktiveBookinger === 1 ? "" : "e"} hyttebooking${aktiveBookinger === 1 ? "" : "er"}.`
                          : "Ingen aktive hyttebookinger akkurat nå."}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-2xl font-semibold text-slate-900">Favoritter</h2>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {favoriteItems.length > 0 ? (
                    favoriteItems.slice(0, 4).map((fav: any) => {
                      const navn = fav.tur?.tittel ?? fav.hytte?.navn ?? "Ukjent favoritt";
                      const type = fav.tur ? "Tur" : "Hytte";

                      return (
                        <div
                          key={fav.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xl font-semibold text-slate-900">{navn}</p>
                              <p className="mt-2 text-slate-500">{type}</p>
                            </div>
                            <Heart className="h-5 w-5 fill-[#0f8f5b] text-[#0f8f5b]" />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="mt-5 text-slate-500">Ingen favoritter ennå.</p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-2xl font-semibold text-slate-900">Mine kommentarer</h2>
                  <span className="text-sm text-slate-500">
                    {kommentarItems.length} totalt
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {kommentarItems.length > 0 ? (
                    kommentarItems.slice(0, 5).map((k) => (
                      <div
                        key={k.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-slate-500">
                              På tur:{" "}
                              {k.tur ? (
                                <NavLink
                                  to={`/turer/${k.tur.id}`}
                                  className="font-semibold text-[#0f8f5b] hover:underline"
                                >
                                  {k.tur.tittel}
                                </NavLink>
                              ) : (
                                <span className="text-slate-600">(slettet tur)</span>
                              )}
                            </p>
                            <p className="mt-2 text-slate-800">{k.body}</p>
                            <p className="mt-2 text-xs text-slate-400">
                              {new Date(k.created_at).toLocaleDateString("no-NO", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="mt-2 text-slate-500">
                      Du har ikke skrevet kommentarer ennå.
                    </p>
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === "mineTurer" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-2xl font-semibold text-slate-900">Mine turer</h2>
              </div>

              <div className="mt-5 space-y-3">
                {tripItems.length > 0 ? (
                  tripItems.map((pamelding: any) => (
                    <div
                      key={pamelding.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {pamelding.tur_dato.tur.tittel}
                          </h3>
                          <p className="mt-2 flex items-center gap-2 text-slate-500">
                            <CalendarDays className="h-4 w-4" />
                            {new Date(pamelding.tur_dato.start_at).toLocaleDateString("no-NO")}
                            {" – "}
                            {new Date(pamelding.tur_dato.end_at).toLocaleDateString("no-NO")}
                          </p>
                          {pamelding.tur_dato.tittel && (
                            <p className="mt-1 text-sm text-slate-400">
                              {pamelding.tur_dato.tittel}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${
                              PAMELDING_STYLE[pamelding.status as PameldingStatus] ??
                              "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                            }`}
                          >
                            {PAMELDING_LABEL[pamelding.status as PameldingStatus] ??
                              pamelding.status}
                          </span>

                          <NavLink
                            to={`/turer/${pamelding.tur_dato.tur_id}`}
                            className="rounded-xl bg-[#0f3d2e] px-4 py-2 text-sm font-medium text-white hover:bg-[#0c3125]"
                          >
                            Detaljer
                          </NavLink>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="mt-5 text-slate-500">Du er ikke påmeldt noen turer.</p>
                )}
              </div>
            </section>
          )}

          {activeTab === "favoritter" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-2xl font-semibold text-slate-900">Favoritter</h2>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {favoriteItems.length > 0 ? (
                  favoriteItems.map((fav: any) => {
                    const navn = fav.tur?.tittel ?? fav.hytte?.navn ?? "Ukjent favoritt";
                    const type = fav.tur ? "Tur" : "Hytte";

                    return (
                      <div
                        key={fav.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xl font-semibold text-slate-900">{navn}</p>
                            <p className="mt-2 text-slate-500">{type}</p>
                          </div>
                          <Heart className="h-5 w-5 fill-[#0f8f5b] text-[#0f8f5b]" />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="mt-5 text-slate-500">Ingen favoritter ennå.</p>
                )}
              </div>
            </section>
          )}

          {activeTab === "bookinger" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-2xl font-semibold text-slate-900">Bookinger</h2>
                <span className="text-sm text-slate-500">
                  {bookingItems.length} totalt
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {bookingItems.length > 0 ? (
                  bookingItems.map((b) => (
                    <div
                      key={b.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {b.hytte?.navn ?? "Ukjent hytte"}
                          </h3>
                          {b.hytte?.omrade && (
                            <p className="mt-1 text-sm text-slate-500">{b.hytte.omrade}</p>
                          )}
                          <p className="mt-2 flex items-center gap-2 text-slate-600">
                            <CalendarDays className="h-4 w-4" />
                            {formatBookingDate(b.start_dato)} – {formatBookingDate(b.slutt_dato)}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                            {b.antall_gjester !== null && (
                              <span>
                                {b.antall_gjester}{" "}
                                {b.antall_gjester === 1 ? "gjest" : "gjester"}
                              </span>
                            )}
                            {b.total_pris !== null && (
                              <span>Total: {b.total_pris} kr</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${BOOKING_STATUS_STYLE[b.status]}`}
                          >
                            {BOOKING_STATUS_LABEL[b.status]}
                          </span>

                          {b.hytte?.id && (
                            <NavLink
                              to={`/hytter/${b.hytte.id}`}
                              className="rounded-xl bg-[#0f3d2e] px-4 py-2 text-sm font-medium text-white hover:bg-[#0c3125]"
                            >
                              Detaljer
                            </NavLink>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                    <p className="text-slate-600">
                      Ingen hyttebookinger ennå.
                    </p>
                    <NavLink
                      to="/hytter"
                      className="mt-4 inline-flex rounded-xl bg-[#0f8f5b] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d7a4e]"
                    >
                      Finn hytter
                    </NavLink>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "konto" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-2xl font-semibold text-slate-900">Konto</h2>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Navn</p>
                  <p className="mt-2 text-xl text-slate-900">
                    {user.fornavn} {user.etternavn}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">E-post</p>
                  <p className="mt-2 break-all text-xl text-slate-900">{user.epost}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Medlem siden</p>
                  <p className="mt-2 text-xl text-slate-900">{medlemSiden}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Rolle</p>
                  <p className="mt-2 text-xl text-slate-900">Bruker</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
                <NavLink
                  to="/rediger-profil"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-800 hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4" />
                  Rediger profil
                </NavLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-800 hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logg ut
                </button>
              </div>
            </section>
          )}
        </section>
      </main>

      {soknadOpen && (
        <div
          className="fixed inset-0 z-[10050] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSoknadOpen(false);
          }}
        >
          <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f3d2e]">Søknad</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Bli annonsør</h2>
              </div>
              <button
                type="button"
                onClick={() => setSoknadOpen(false)}
                aria-label="Lukk"
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSoknad} className="flex-1 overflow-y-auto px-6 py-6">
              <p className="text-sm text-slate-600">
                Admin vil gjennomgå søknaden og gi deg annonsør-rollen ved godkjenning.
              </p>

              {soknadError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {soknadError}
                </div>
              )}

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Navn / firma*</label>
                  <input
                    type="text"
                    value={soknadNavn}
                    onChange={(e) => setSoknadNavn(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-[#0f8f5b] focus:ring-2 focus:ring-[#dcebe4]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Telefon</label>
                  <input
                    type="tel"
                    value={soknadTelefon}
                    onChange={(e) => setSoknadTelefon(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-[#0f8f5b] focus:ring-2 focus:ring-[#dcebe4]"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSoknadOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={soknadBusy}
                  className="rounded-xl bg-[#0f8f5b] px-4 py-2 font-medium text-white hover:bg-[#0d7a4e] disabled:opacity-50"
                >
                  {soknadBusy ? "Sender..." : "Send søknad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}