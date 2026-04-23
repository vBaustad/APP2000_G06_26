/**
 * Fil: HytteDetaljer.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Offentlig detaljside for en hytte. Henter data fra GET /api/hytter/:id
 * og viser bilde, nøkkelinfo, fasiliteter, beskrivelse, regler og posisjon på kart.
 *
 * KI-bruk: Claude (Anthropic) og GitHub Copilot er brukt som verktøy
 * under utvikling. All kode er lest, forstått og testet. Se rapportens
 * kapittel "Kommentarer til bruk/tilpassing av kode".
 */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import {
  MapPin,
  BedDouble,
  Users,
  Mountain,
  Wallet,
  Image as ImageIcon,
  CalendarDays,
  Heart,
} from "lucide-react";
import TurMap from "../components/TurMap";

type Betjent = "betjent" | "selvbetjent" | "ubetjent";

type BookingStatus = "pending" | "confirmed" | "cancelled";

type HytteFasilitet = {
  kode: string;
};

type BookingPeriode = {
  start_dato: string;
  slutt_dato: string;
  status: BookingStatus;
};

type Hytte = {
  id: number;
  navn: string;
  beskrivelse: string | null;
  omrade: string | null;
  adresse: string | null;
  regler: string | null;
  kapasitet_senger: number;
  maks_gjester: number | null;
  pris_per_natt: number | string | null;
  bilde_url: string | null;
  betjent: Betjent | null;
  lat: number | string | null;
  lng: number | string | null;
  hoyde_m: number | null;
  hytte_fasilitet?: HytteFasilitet[];
};

const BETJENT_BADGE: Record<Betjent, string> = {
  betjent: "bg-emerald-100 text-emerald-900",
  selvbetjent: "bg-amber-100 text-amber-900",
  ubetjent: "bg-slate-200 text-slate-800",
};

function resolveImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/images/")) return url;
  if (url.startsWith("/")) return `${import.meta.env.VITE_API_URL}${url}`;
  return url;
}

function parseCoord(value: number | string | null): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toDate(iso: string): Date {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d;
}

function todayIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function periodsOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  return startA < endB && endA > startB;
}

export default function HytteDetaljer() {
  const { t, i18n } = useTranslation("hytter");
  const { id } = useParams();

  const [hytte, setHytte] = useState<Hytte | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bookinger, setBookinger] = useState<BookingPeriode[]>([]);
  const [bookingerLoading, setBookingerLoading] = useState(true);

  const [startDato, setStartDato] = useState("");
  const [sluttDato, setSluttDato] = useState("");
  const [gjester, setGjester] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingMelding, setBookingMelding] = useState<
    { type: "ok" | "feil"; tekst: string } | null
  >(null);

  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
  const erInnlogget = Boolean(token);

  const [favorittId, setFavorittId] = useState<number | null>(null);
  const [favorittBusy, setFavorittBusy] = useState(false);

  const dateLocale = i18n.resolvedLanguage === "en" ? "en-US" : "nb-NO";

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString(dateLocale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

  useEffect(() => {
    let active = true;

    if (!id) {
      setError(t("detail.notFoundNoId"));
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/hytter/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(t("detail.notFoundTitle"));
        return res.json() as Promise<Hytte>;
      })
      .then((data) => {
        if (active) setHytte(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : t("detail.notFoundTitle"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, t]);

  useEffect(() => {
    if (!token || !id) {
      setFavorittId(null);
      return;
    }
    let active = true;
    fetch(`${import.meta.env.VITE_API_URL}/api/favoritter`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? (res.json() as Promise<Array<{ id: number; hytte_id: number | null }>>) : []))
      .then((data) => {
        if (!active) return;
        const hit = Array.isArray(data)
          ? data.find((f) => f.hytte_id === Number(id))
          : undefined;
        setFavorittId(hit ? hit.id : null);
      })
      .catch(() => {
        if (active) setFavorittId(null);
      });
    return () => {
      active = false;
    };
  }, [id, token]);

  async function toggleFavoritt() {
    if (!token || !id || favorittBusy) return;
    setFavorittBusy(true);
    try {
      if (favorittId) {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/favoritter/${favorittId}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) setFavorittId(null);
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/favoritter`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ hytte_id: Number(id) }),
        });
        if (res.ok) {
          const data = (await res.json()) as { id: number };
          setFavorittId(data.id);
        }
      }
    } finally {
      setFavorittBusy(false);
    }
  }

  useEffect(() => {
    let active = true;
    if (!id) {
      setBookingerLoading(false);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/hytter/${id}/bookinger`)
      .then((res) => (res.ok ? (res.json() as Promise<BookingPeriode[]>) : []))
      .then((data) => {
        if (active) setBookinger(Array.isArray(data) ? data : []);
      })
      .catch(() => active && setBookinger([]))
      .finally(() => active && setBookingerLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  const fasilitetLabel = (kode: string) => t(`fasiliteter.${kode}`, kode);

  const fremtidigeBookinger = useMemo(() => {
    const idag = new Date();
    idag.setHours(0, 0, 0, 0);
    return bookinger
      .filter((b) => new Date(b.slutt_dato) >= idag)
      .sort(
        (a, b) =>
          new Date(a.start_dato).getTime() - new Date(b.start_dato).getTime(),
      );
  }, [bookinger]);

  const valgtOverlapper = useMemo(() => {
    if (!startDato || !sluttDato) return false;
    const start = toDate(startDato);
    const slutt = toDate(sluttDato);
    if (start >= slutt) return false;
    return bookinger.some((b) =>
      periodsOverlap(start, slutt, toDate(b.start_dato), toDate(b.slutt_dato)),
    );
  }, [startDato, sluttDato, bookinger]);

  const antallNetter = useMemo(() => {
    if (!startDato || !sluttDato) return 0;
    const start = toDate(startDato);
    const slutt = toDate(sluttDato);
    if (start >= slutt) return 0;
    return Math.round((slutt.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, [startDato, sluttDato]);

  const totalPris = useMemo(() => {
    if (!hytte || antallNetter === 0) return 0;
    const pris = Number(hytte.pris_per_natt ?? 0);
    return Number.isFinite(pris) ? pris * antallNetter : 0;
  }, [hytte, antallNetter]);

  const mapCenter = useMemo<[number, number] | null>(() => {
    if (!hytte) return null;
    const lat = parseCoord(hytte.lat);
    const lng = parseCoord(hytte.lng);
    if (lat === null || lng === null) return null;
    return [lat, lng];
  }, [hytte]);

  async function handleBookingSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!id || !token) return;

    if (!startDato || !sluttDato) {
      setBookingMelding({ type: "feil", tekst: t("detail.errorStartEnd") });
      return;
    }
    if (toDate(startDato) >= toDate(sluttDato)) {
      setBookingMelding({ type: "feil", tekst: t("detail.errorEndBeforeStart") });
      return;
    }
    if (valgtOverlapper) {
      setBookingMelding({ type: "feil", tekst: t("detail.errorOverlap") });
      return;
    }

    try {
      setSubmitting(true);
      setBookingMelding(null);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/hytter/${id}/bookinger`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            start_dato: startDato,
            slutt_dato: sluttDato,
            antall_gjester: gjester ? Number(gjester) : null,
          }),
        },
      );

      const data = (await res.json().catch(() => null)) as
        | { error?: string; start_dato?: string; slutt_dato?: string; status?: BookingStatus }
        | null;

      if (!res.ok) {
        setBookingMelding({
          type: "feil",
          tekst: data?.error ?? t("detail.errorCreate"),
        });
        return;
      }

      if (data?.start_dato && data.slutt_dato) {
        setBookinger((prev) => [
          ...prev,
          {
            start_dato: data.start_dato as string,
            slutt_dato: data.slutt_dato as string,
            status: data.status ?? "pending",
          },
        ]);
      }

      setBookingMelding({ type: "ok", tekst: t("detail.okSent") });
      setStartDato("");
      setSluttDato("");
      setGjester("");
    } catch {
      setBookingMelding({ type: "feil", tekst: t("detail.errorNetwork") });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-gray-50">
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow">
            <p className="text-gray-600">{t("detail.loading")}</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !hytte) {
    return (
      <main className="min-h-[70vh] bg-gray-50">
        <section className="mx-auto max-w-7xl px-6 py-10">
          <Link
            to="/hytter"
            className="text-sm font-semibold text-emerald-700 hover:underline"
          >
            {t("detail.back")}
          </Link>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow">
            <h1 className="text-2xl font-semibold">{t("detail.notFoundTitle")}</h1>
            <p className="mt-2 text-gray-600">
              {id ? (
                <>
                  {t("detail.notFoundWithId")} <span className="font-mono">{id}</span>
                </>
              ) : (
                t("detail.notFoundNoId")
              )}
            </p>
          </div>
        </section>
      </main>
    );
  }

  const imageUrl = resolveImageUrl(hytte.bilde_url);
  const fasiliteter = hytte.hytte_fasilitet ?? [];

  return (
    <main className="bg-gray-50">
      <section className="relative h-[38vh] min-h-[320px]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={hytte.navn}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
            <ImageIcon className="h-16 w-16 text-slate-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 h-full">
          <div className="mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-10">
            <Link
              to="/hytter"
              className="mb-5 inline-flex w-fit text-sm font-semibold text-white/90 hover:underline"
            >
              {t("detail.back")}
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              {hytte.betjent && (
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold shadow-sm ${BETJENT_BADGE[hytte.betjent]}`}
                >
                  {t(`betjent.${hytte.betjent}`)}
                </span>
              )}

              {hytte.omrade && (
                <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-gray-900">
                  {hytte.omrade}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <h1 className="text-4xl font-semibold text-white md:text-5xl">
                {hytte.navn}
              </h1>

              {erInnlogget && (
                <button
                  type="button"
                  onClick={toggleFavoritt}
                  disabled={favorittBusy}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                    favorittId
                      ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border-white/40 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${favorittId ? "fill-white" : ""}`}
                  />
                  {favorittId ? t("detail.favorite") : t("detail.addFavorite")}
                </button>
              )}
            </div>

            {hytte.adresse && (
              <div className="mt-2 flex items-center gap-2 text-white/85">
                <MapPin className="h-4 w-4" />
                <p className="text-sm">{hytte.adresse}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BedDouble className="h-4 w-4 text-emerald-700" />
                <span>{t("detail.beds")}</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {hytte.kapasitet_senger}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4 text-emerald-700" />
                <span>{t("detail.maxGuests")}</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {hytte.maks_gjester ?? "—"}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mountain className="h-4 w-4 text-emerald-700" />
                <span>{t("detail.altitude")}</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {hytte.hoyde_m !== null ? `${hytte.hoyde_m} m` : "—"}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Wallet className="h-4 w-4 text-emerald-700" />
                <span>{t("detail.pricePerNight")}</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {hytte.pris_per_natt ? `${hytte.pris_per_natt} kr` : "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow">
              <h2 className="text-xl font-semibold">{t("detail.about")}</h2>

              <p className="mt-4 whitespace-pre-line leading-relaxed text-gray-700">
                {hytte.beskrivelse?.trim()
                  ? hytte.beskrivelse
                  : t("detail.noDescription")}
              </p>

              {fasiliteter.length > 0 && (
                <>
                  <h3 className="mt-8 text-sm font-semibold text-gray-900">
                    {t("detail.amenities")}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {fasiliteter.map((f) => (
                      <span
                        key={f.kode}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-900 ring-1 ring-emerald-100"
                      >
                        {fasilitetLabel(f.kode)}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {hytte.regler?.trim() && (
                <>
                  <h3 className="mt-8 text-sm font-semibold text-gray-900">
                    {t("detail.rules")}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                    {hytte.regler}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">{t("detail.location")}</h3>
              {mapCenter && (
                <button
                  type="button"
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                  onClick={() => {
                    const [lat, lng] = mapCenter;
                    window.open(
                      `https://www.openstreetmap.org/#map=13/${lat}/${lng}`,
                      "_blank",
                    );
                  }}
                >
                  {t("detail.bigMap")}
                </button>
              )}
            </div>

            {mapCenter ? (
              <TurMap center={mapCenter} title={hytte.navn} />
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
                {t("detail.noPosition")}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow lg:col-span-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-emerald-700" />
              <h2 className="text-xl font-semibold">{t("detail.book")}</h2>
            </div>

            {!erInnlogget ? (
              <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600">
                {t("detail.mustLoginToBook")}
                <div className="mt-3">
                  <Link
                    to="/logg-inn"
                    className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    {t("detail.login")}
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="mt-5 space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      {t("detail.startDate")}
                    </label>
                    <input
                      type="date"
                      required
                      min={todayIso()}
                      value={startDato}
                      onChange={(e) => {
                        setStartDato(e.target.value);
                        setBookingMelding(null);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      {t("detail.endDate")}
                    </label>
                    <input
                      type="date"
                      required
                      min={startDato || todayIso()}
                      value={sluttDato}
                      onChange={(e) => {
                        setSluttDato(e.target.value);
                        setBookingMelding(null);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      {t("detail.guests")}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={hytte.maks_gjester ?? undefined}
                      value={gjester}
                      onChange={(e) => setGjester(e.target.value)}
                      placeholder={
                        hytte.maks_gjester
                          ? t("detail.maxGuestsPlaceholder", { max: hytte.maks_gjester })
                          : t("detail.optional")
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                {antallNetter > 0 && !valgtOverlapper && (
                  <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    <Trans
                      i18nKey={antallNetter === 1 ? "detail.nightOne" : "detail.nightMany"}
                      ns="hytter"
                      values={{ count: antallNetter, price: totalPris }}
                      components={[<span className="font-semibold" key="0" />]}
                    />
                  </div>
                )}

                {valgtOverlapper && (
                  <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {t("detail.overlapWarning")}
                  </div>
                )}

                {bookingMelding && (
                  <div
                    className={`rounded-xl px-4 py-3 text-sm ${
                      bookingMelding.type === "ok"
                        ? "bg-emerald-50 text-emerald-900"
                        : "bg-red-50 text-red-900"
                    }`}
                  >
                    {bookingMelding.tekst}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500">{t("detail.bookingNote")}</p>
                  <button
                    type="submit"
                    disabled={submitting || valgtOverlapper}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? t("detail.sending") : t("detail.send")}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow">
            <h3 className="text-sm font-semibold text-gray-900">{t("detail.bookedDates")}</h3>

            {bookingerLoading ? (
              <p className="mt-3 text-sm text-gray-500">{t("detail.loadingShort")}</p>
            ) : fremtidigeBookinger.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">{t("detail.noFutureBookings")}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {fremtidigeBookinger.map((b, i) => (
                  <li
                    key={`${b.start_dato}-${i}`}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                  >
                    <span className="text-gray-800">
                      {formatDate(b.start_dato)} – {formatDate(b.slutt_dato)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        b.status === "confirmed"
                          ? "bg-red-100 text-red-900"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {b.status === "confirmed"
                        ? t("detail.statusConfirmed")
                        : t("detail.statusPending")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
