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
  Bell,
  Megaphone,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
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
  | "opprettedeTurer"
  | "favoritter"
  | "bookinger"
  | "konto";

type OpprettetTur = {
  id: number;
  tittel: string;
  status: string;
  type: string | null;
  vanskelighetsgrad: string | null;
  omrade: string | null;
  updated_at: string;
  tur_dato?: { id: number }[];
};

type MinKommentar = {
  id: number;
  body: string | null;
  created_at: string;
  tur: { id: number; tittel: string } | null;
};

type PameldingStatus = "pending" | "binding" | "freed" | "locked";

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

const BOOKING_STATUS_STYLE: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
  confirmed: "bg-[#eef5f1] text-[#0f3d2e] ring-1 ring-[#dcebe4]",
  cancelled: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

type TurPameldingItem = {
  id: number;
  status: string;
  tur_dato: {
    tur_id: number;
    start_at: string;
    end_at: string;
    tittel: string | null;
    tur: { tittel: string };
  };
};

type FavorittItem = {
  id: number;
  tur?: { tittel: string } | null;
  hytte?: { navn: string } | null;
};

type BrukerProfil = {
  fornavn: string | null;
  etternavn: string | null;
  epost: string;
  created_at?: string;
  tur_pamelding?: TurPameldingItem[];
  favoritt?: FavorittItem[];
  hytte_booking?: HytteBooking[];
  tur_kommentar?: MinKommentar[];
};

export default function MinSide() {
  const { t, i18n } = useTranslation("minside");
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "nb-NO";
  const { user: authUser, token } = useAuth();
  const [user, setUser] = useState<BrukerProfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("oversikt");
  const [opprettedeTurer, setOpprettedeTurer] = useState<OpprettetTur[]>([]);

  const isAnnonsor = authUser?.roller?.includes("annonsor") ?? false;
  const [soknadStatus, setSoknadStatus] = useState<AnnonsorSoknadStatus>(null);
  const [soknadOpen, setSoknadOpen] = useState(false);
  const [soknadNavn, setSoknadNavn] = useState("");
  const [soknadTelefon, setSoknadTelefon] = useState("");
  const [soknadBusy, setSoknadBusy] = useState(false);
  const [soknadError, setSoknadError] = useState<string | null>(null);

  const pameldingLabel = (status: PameldingStatus): string => {
    return t(`minside.pamelding.${status}`);
  };

  const bookingStatusLabel = (status: BookingStatus): string => {
    return t(`minside.bookingStatus.${status}`);
  };

  function formatBookingDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

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
        if (!res.ok) throw new Error(t("minside.errors.fetchProfile"));
        return res.json();
      })
      .then((data: BrukerProfil) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [t]);

  useEffect(() => {
    if (!token) {
      setOpprettedeTurer([]);
      return;
    }
    let active = true;
    fetch(`${import.meta.env.VITE_API_URL}/api/turer/mine-leder`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? (res.json() as Promise<OpprettetTur[]>) : []))
      .then((data) => {
        if (active) setOpprettedeTurer(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setOpprettedeTurer([]);
      });
    return () => {
      active = false;
    };
  }, [token]);

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
        throw new Error(data.error || t("minside.soknad.defaultError"));
      }
      const data: AnnonsorSoknadStatus = await res.json();
      setSoknadStatus(data);
      setSoknadOpen(false);
      setSoknadNavn("");
      setSoknadTelefon("");
    } catch (err) {
      setSoknadError(err instanceof Error ? err.message : t("shared.somethingWentWrong"));
    } finally {
      setSoknadBusy(false);
    }
  }

  const fullforteTurer =
    user?.tur_pamelding?.filter((x) => x.status === "Fullført").length || 0;

  const pameldteTurer =
    user?.tur_pamelding?.filter((x) => x.status === "pending").length || 0;

  const antallFavoritter = user?.favoritt?.length || 0;

  const medlemSiden = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      })
    : t("minside.info.unknown");

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/logg-inn";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-600">{t("shared.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">{t("minside.eyebrow")}</h1>
          <p className="mt-4 text-slate-600">
            {t("shared.mustLogIn")}
          </p>
          <NavLink
            to="/logg-inn"
            className="mt-6 inline-flex rounded-xl bg-[#0f8f5b] px-6 py-3 font-medium text-white hover:bg-[#0d7a4e]"
          >
            {t("shared.logIn")}
          </NavLink>
        </div>
      </div>
    );
  }

  const favoriteItems: FavorittItem[] = Array.isArray(user?.favoritt) ? user.favoritt : [];
  const tripItems: TurPameldingItem[] = Array.isArray(user?.tur_pamelding) ? user.tur_pamelding : [];
  const bookingItems: HytteBooking[] = Array.isArray(user?.hytte_booking)
    ? (user.hytte_booking as HytteBooking[])
    : [];
  const aktiveBookinger = bookingItems.filter((b) => b.status !== "cancelled").length;
  const kommentarItems: MinKommentar[] = Array.isArray(user?.tur_kommentar)
    ? (user.tur_kommentar as MinKommentar[])
    : [];

  const tabs: { key: TabKey; label: string }[] = [
    { key: "oversikt", label: t("minside.tabs.oversikt") },
    { key: "mineTurer", label: t("minside.tabs.mineTurer") },
    { key: "opprettedeTurer", label: t("minside.tabs.opprettedeTurer") },
    { key: "favoritter", label: t("minside.tabs.favoritter") },
    { key: "bookinger", label: t("minside.tabs.bookinger") },
    { key: "konto", label: t("minside.tabs.konto") },
  ];

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
                {t("minside.eyebrow")}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold text-slate-900">
                  {user.fornavn} {user.etternavn}
                </h1>
                <span className="rounded-full bg-[#eef5f1] px-3 py-1 text-sm font-medium text-[#0f3d2e]">
                  {t("minside.memberBadge")}
                </span>
              </div>

              <p className="mt-2 flex items-center gap-2 text-slate-500">
                <Mail className="h-4 w-4" />
                {user.epost}
              </p>

              <p className="mt-2 max-w-2xl text-slate-600">
                {t("minside.intro")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <NavLink
                to="/rediger-profil"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-800 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4" />
                {t("minside.editProfile")}
              </NavLink>

              <NavLink
                to="/opprett-tur"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f8f5b] px-4 py-3 font-medium text-white hover:bg-[#0d7a4e]"
              >
                <Plus className="h-4 w-4" />
                {t("minside.createTour")}
              </NavLink>

              <NavLink
                to="/mine-turer-leder"
                className="inline-flex items-center gap-2 rounded-xl border border-[#dcebe4] bg-[#eef5f1] px-4 py-3 font-medium text-[#0f3d2e] hover:bg-[#e4efe9]"
              >
                <CalendarDays className="h-4 w-4" />
                {t("minside.myToursAsLeader")}
              </NavLink>

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
                  {t("minside.becomeAdvertiser")}
                </button>
              )}
              {!isAnnonsor && soknadStatus?.status === "pending" && (
                <span className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-medium text-amber-800">
                  <Megaphone className="h-4 w-4" />
                  {t("minside.advertiserApplicationSent")}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
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
              {t("minside.info.title")}
            </h2>

            <div className="mt-4 space-y-5 text-slate-700">
              <div>
                <p className="text-sm font-medium text-slate-500">{t("minside.info.name")}</p>
                <p className="mt-1 text-lg">
                  {user.fornavn} {user.etternavn}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">{t("minside.info.email")}</p>
                <p className="mt-1 break-all text-lg">{user.epost}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">{t("minside.info.memberSince")}</p>
                <p className="mt-1 text-lg">{medlemSiden}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">{t("minside.info.role")}</p>
                <p className="mt-1 text-lg">{t("minside.info.roleUser")}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-200 pt-5">
              <NavLink
                to="/rediger-profil"
                className="flex items-center gap-3 text-sm font-medium text-[#0f8f5b] hover:text-[#0d7a4e]"
              >
                <Settings className="h-4 w-4" />
                {t("minside.editProfile")}
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                <LogOut className="h-4 w-4" />
                {t("shared.logOut")}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{t("minside.activity.title")}</h3>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <Footprints className="h-5 w-5 text-[#0f8f5b]" />
                <div className="flex w-full items-center justify-between">
                  <span className="text-slate-600">{t("minside.activity.completedTours")}</span>
                  <span className="font-semibold text-slate-900">{fullforteTurer}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-[#0f8f5b]" />
                <div className="flex w-full items-center justify-between">
                  <span className="text-slate-600">{t("minside.activity.registeredTours")}</span>
                  <span className="font-semibold text-slate-900">{pameldteTurer}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-[#0f8f5b]" />
                <div className="flex w-full items-center justify-between">
                  <span className="text-slate-600">{t("minside.activity.favorites")}</span>
                  <span className="font-semibold text-slate-900">{antallFavoritter}</span>
                </div>
              </div>
            </div>
          </section>

        </aside>

        <section className="space-y-6">
          {activeTab === "oversikt" && (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-2xl font-semibold text-slate-900">{t("minside.myTours.title")}</h2>
                </div>

                <div className="mt-5 space-y-3">
                  {tripItems.length > 0 ? (
                    tripItems.slice(0, 2).map((pamelding) => (
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
                              {new Date(pamelding.tur_dato.start_at).toLocaleDateString(locale)}
                              {" – "}
                              {new Date(pamelding.tur_dato.end_at).toLocaleDateString(locale)}
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
                              {pameldingLabel(pamelding.status as PameldingStatus) ?? pamelding.status}
                            </span>

                            <NavLink
                              to={`/turer/${pamelding.tur_dato.tur_id}`}
                              className="rounded-xl bg-[#0f3d2e] px-4 py-2 text-sm font-medium text-white hover:bg-[#0c3125]"
                            >
                              {t("minside.myTours.details")}
                            </NavLink>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="mt-5 text-slate-500">{t("minside.myTours.empty")}</p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-2xl font-semibold text-slate-900">{t("minside.notifications.title")}</h2>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <Bell className="mt-0.5 h-4 w-4 text-[#0f8f5b]" />
                      <p className="text-slate-700">
                        {t("minside.notifications.activeRegistrations", { count: pameldteTurer })}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <Bell className="mt-0.5 h-4 w-4 text-[#0f8f5b]" />
                      <p className="text-slate-700">
                        {aktiveBookinger > 0
                          ? aktiveBookinger === 1
                            ? t("minside.notifications.activeBookingsSingular")
                            : t("minside.notifications.activeBookingsPlural", { count: aktiveBookinger })
                          : t("minside.notifications.noActiveBookings")}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-2xl font-semibold text-slate-900">{t("minside.favorites.title")}</h2>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {favoriteItems.length > 0 ? (
                    favoriteItems.slice(0, 4).map((fav) => {
                      const navn = fav.tur?.tittel ?? fav.hytte?.navn ?? t("minside.favorites.unknown");
                      const type = fav.tur ? t("minside.favorites.typeTour") : t("minside.favorites.typeCabin");

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
                    <p className="mt-5 text-slate-500">{t("minside.favorites.empty")}</p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-2xl font-semibold text-slate-900">{t("minside.comments.title")}</h2>
                  <span className="text-sm text-slate-500">
                    {t("minside.comments.totalCount", { count: kommentarItems.length })}
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
                              {t("minside.comments.onTour")}{" "}
                              {k.tur ? (
                                <NavLink
                                  to={`/turer/${k.tur.id}`}
                                  className="font-semibold text-[#0f8f5b] hover:underline"
                                >
                                  {k.tur.tittel}
                                </NavLink>
                              ) : (
                                <span className="text-slate-600">{t("minside.comments.deletedTour")}</span>
                              )}
                            </p>
                            <p className="mt-2 text-slate-800">{k.body}</p>
                            <p className="mt-2 text-xs text-slate-400">
                              {new Date(k.created_at).toLocaleDateString(locale, {
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
                      {t("minside.comments.empty")}
                    </p>
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === "mineTurer" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-2xl font-semibold text-slate-900">{t("minside.myTours.title")}</h2>
              </div>

              <div className="mt-5 space-y-3">
                {tripItems.length > 0 ? (
                  tripItems.map((pamelding) => (
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
                            {new Date(pamelding.tur_dato.start_at).toLocaleDateString(locale)}
                            {" – "}
                            {new Date(pamelding.tur_dato.end_at).toLocaleDateString(locale)}
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
                            {pameldingLabel(pamelding.status as PameldingStatus) ?? pamelding.status}
                          </span>

                          <NavLink
                            to={`/turer/${pamelding.tur_dato.tur_id}`}
                            className="rounded-xl bg-[#0f3d2e] px-4 py-2 text-sm font-medium text-white hover:bg-[#0c3125]"
                          >
                            {t("minside.myTours.details")}
                          </NavLink>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="mt-5 text-slate-500">{t("minside.myTours.empty")}</p>
                )}
              </div>
            </section>
          )}

          {activeTab === "opprettedeTurer" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {t("minside.createdTours.title")}
                </h2>
                <NavLink
                  to="/opprett-tur"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-4 py-2 text-sm font-medium text-white hover:bg-[#0c3125]"
                >
                  <Plus className="h-4 w-4" />
                  {t("minside.createdTours.create")}
                </NavLink>
              </div>

              <div className="mt-5 space-y-3">
                {opprettedeTurer.length > 0 ? (
                  opprettedeTurer.map((tur) => {
                    const erFellestur = (tur.tur_dato?.length ?? 0) > 0;
                    return (
                      <div
                        key={tur.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0">
                            <h3 className="text-xl font-semibold text-slate-900">
                              {tur.tittel}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              {[
                                tur.omrade,
                                tur.type,
                                tur.vanskelighetsgrad,
                                erFellestur
                                  ? t("minside.createdTours.groupTour")
                                  : t("minside.createdTours.regularTour"),
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <NavLink
                              to={`/turer/${tur.id}`}
                              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              {t("minside.createdTours.view")}
                            </NavLink>
                            <NavLink
                              to={`/turer/${tur.id}/rediger`}
                              className="rounded-xl bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-200"
                            >
                              {t("minside.createdTours.edit")}
                            </NavLink>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="mt-5 text-slate-500">{t("minside.createdTours.empty")}</p>
                )}
              </div>
            </section>
          )}

          {activeTab === "favoritter" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-2xl font-semibold text-slate-900">{t("minside.favorites.title")}</h2>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {favoriteItems.length > 0 ? (
                  favoriteItems.map((fav) => {
                    const navn = fav.tur?.tittel ?? fav.hytte?.navn ?? t("minside.favorites.unknown");
                    const type = fav.tur ? t("minside.favorites.typeTour") : t("minside.favorites.typeCabin");

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
                  <p className="mt-5 text-slate-500">{t("minside.favorites.empty")}</p>
                )}
              </div>
            </section>
          )}

          {activeTab === "bookinger" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-2xl font-semibold text-slate-900">{t("minside.bookings.title")}</h2>
                <span className="text-sm text-slate-500">
                  {t("minside.bookings.totalCount", { count: bookingItems.length })}
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
                            {b.hytte?.navn ?? t("minside.bookings.unknownCabin")}
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
                                {b.antall_gjester === 1
                                  ? t("minside.bookings.guestSingular")
                                  : t("minside.bookings.guestPlural")}
                              </span>
                            )}
                            {b.total_pris !== null && (
                              <span>{t("minside.bookings.total", { price: b.total_pris })}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${BOOKING_STATUS_STYLE[b.status]}`}
                          >
                            {bookingStatusLabel(b.status)}
                          </span>

                          {b.hytte?.id && (
                            <NavLink
                              to={`/hytter/${b.hytte.id}`}
                              className="rounded-xl bg-[#0f3d2e] px-4 py-2 text-sm font-medium text-white hover:bg-[#0c3125]"
                            >
                              {t("minside.bookings.details")}
                            </NavLink>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                    <p className="text-slate-600">
                      {t("minside.bookings.empty")}
                    </p>
                    <NavLink
                      to="/hytter"
                      className="mt-4 inline-flex rounded-xl bg-[#0f8f5b] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d7a4e]"
                    >
                      {t("minside.bookings.findCabins")}
                    </NavLink>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "konto" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-2xl font-semibold text-slate-900">{t("minside.account.title")}</h2>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">{t("minside.info.name")}</p>
                  <p className="mt-2 text-xl text-slate-900">
                    {user.fornavn} {user.etternavn}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">{t("minside.info.email")}</p>
                  <p className="mt-2 break-all text-xl text-slate-900">{user.epost}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">{t("minside.info.memberSince")}</p>
                  <p className="mt-2 text-xl text-slate-900">{medlemSiden}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">{t("minside.info.role")}</p>
                  <p className="mt-2 text-xl text-slate-900">{t("minside.info.roleUser")}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
                <NavLink
                  to="/rediger-profil"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-800 hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4" />
                  {t("minside.editProfile")}
                </NavLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-800 hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  {t("shared.logOut")}
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
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f3d2e]">{t("minside.soknad.eyebrow")}</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">{t("minside.soknad.title")}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSoknadOpen(false)}
                aria-label={t("shared.close")}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSoknad} className="flex-1 overflow-y-auto px-6 py-6">
              <p className="text-sm text-slate-600">
                {t("minside.soknad.description")}
              </p>

              {soknadError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {soknadError}
                </div>
              )}

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">{t("minside.soknad.nameLabel")}</label>
                  <input
                    type="text"
                    value={soknadNavn}
                    onChange={(e) => setSoknadNavn(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-[#0f8f5b] focus:ring-2 focus:ring-[#dcebe4]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">{t("minside.soknad.phoneLabel")}</label>
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
                  {t("shared.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={soknadBusy}
                  className="rounded-xl bg-[#0f8f5b] px-4 py-2 font-medium text-white hover:bg-[#0d7a4e] disabled:opacity-50"
                >
                  {soknadBusy ? t("minside.soknad.submitting") : t("minside.soknad.submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
