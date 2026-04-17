/**
 * Fil: MyPage.tsx
 * Utvikler: Parasto Jamshidi (oppdatert videre av Ramona Cretulescu)
 * Beskrivelse:
 * Brukerportal tilpasset Utopia sitt eksisterende design, med profilheader,
 * faner, venstre informasjonskolonne og høyre hovedinnhold for turer,
 * fellesturer, favoritter, bookinger og konto.
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
} from "lucide-react";

type TabKey =
  | "oversikt"
  | "mineTurer"
  | "fellesturer"
  | "favoritter"
  | "bookinger"
  | "konto";

export default function MyPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("oversikt");

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
    window.location.href = "/login";
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
            to="/login"
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
                to="/editprofile"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-800 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4" />
                Rediger profil
              </NavLink>

              <NavLink
                to="/create-trip"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f8f5b] px-4 py-3 font-medium text-white hover:bg-[#0d7a4e]"
              >
                <Plus className="h-4 w-4" />
                Opprett tur
              </NavLink>

              <NavLink
                to="/flexible-trip-demo"
                className="inline-flex items-center gap-2 rounded-xl border border-[#dcebe4] bg-[#eef5f1] px-4 py-3 font-medium text-[#0f3d2e] hover:bg-[#e4efe9]"
              >
                <Users className="h-4 w-4" />
                Ny fellestur
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6">
          {[
            { key: "oversikt", label: "Oversikt" },
            { key: "mineTurer", label: "Mine turer" },
            { key: "fellesturer", label: "Fellesturer" },
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
                to="/editprofile"
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
                to="/explore"
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-slate-700 hover:bg-slate-50"
              >
                <MapPinned className="h-4 w-4 text-[#0f8f5b]" />
                Utforsk turer
              </NavLink>

              <NavLink
                to="/flexible-trip-demo"
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-slate-700 hover:bg-slate-50"
              >
                <Users className="h-4 w-4 text-[#0f8f5b]" />
                Finn fellesturer
              </NavLink>

              <NavLink
                to="/my-cabins"
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
                              Start:{" "}
                              {new Date(pamelding.tur_dato.start_at).toLocaleDateString("no-NO")}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-sm font-medium ${
                                pamelding.status === "pending"
                                  ? "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                                  : "bg-[#eef5f1] text-[#0f3d2e] ring-1 ring-[#dcebe4]"
                              }`}
                            >
                              {pamelding.status === "pending" ? "Påmeldt" : pamelding.status}
                            </span>

                            <NavLink
                              to={`/tours/${pamelding.tur_dato.tur_id}`}
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

              <section className="grid gap-6 xl:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h2 className="text-2xl font-semibold text-slate-900">Fellesturer</h2>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="text-xl font-semibold text-slate-900">
                        Hardangervidda på tvers
                      </h3>
                      <p className="mt-2 text-slate-500">
                        Fleksibel startdato · Foreløpig aktiv
                      </p>
                      <div className="mt-4 flex gap-2">
                        <span className="rounded-full bg-[#eef5f1] px-3 py-1 text-sm font-medium text-[#0f3d2e]">
                          8 interesserte
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                          Ikke låst
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h2 className="text-2xl font-semibold text-slate-900">Varsler</h2>
                  </div>

                  <div className="mt-5 space-y-3">
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
                          Ingen nye bookingoppdateringer akkurat nå.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
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
                            Start:{" "}
                            {new Date(pamelding.tur_dato.start_at).toLocaleDateString("no-NO")}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${
                              pamelding.status === "pending"
                                ? "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                                : "bg-[#eef5f1] text-[#0f3d2e] ring-1 ring-[#dcebe4]"
                            }`}
                          >
                            {pamelding.status === "pending" ? "Påmeldt" : pamelding.status}
                          </span>

                          <NavLink
                            to={`/tours/${pamelding.tur_dato.tur_id}`}
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

          {activeTab === "fellesturer" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-2xl font-semibold text-slate-900">Fellesturer</h2>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Hardangervidda på tvers
                  </h3>
                  <p className="mt-2 text-slate-500">
                    Finse – Krækkja – Tuva
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#eef5f1] px-3 py-1 text-sm font-medium text-[#0f3d2e]">
                      8 interesserte
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                      Foreløpig aktiv
                    </span>
                  </div>
                  <div className="mt-4">
                    <NavLink
                      to="/flexible-trip-demo"
                      className="rounded-xl bg-[#0f3d2e] px-4 py-2 text-sm font-medium text-white hover:bg-[#0c3125]"
                    >
                      Se fellestur
                    </NavLink>
                  </div>
                </div>
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
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                  <p className="text-slate-600">
                    Ingen aktive hyttebookinger ennå.
                  </p>
                  <NavLink
                    to="/my-cabins"
                    className="mt-4 inline-flex rounded-xl bg-[#0f8f5b] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d7a4e]"
                  >
                    Finn hytter
                  </NavLink>
                </div>
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
                  to="/editprofile"
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
    </div>
  );
}