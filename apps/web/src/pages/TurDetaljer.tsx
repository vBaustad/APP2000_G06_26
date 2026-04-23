/**
 * Fil: TurDetaljer.tsx
 * Utvikler(e): Ramona Cretulescu, Vebjørn Baustad
 * Beskrivelse: Detaljside for en tur. Viser turinfo, kart, kommentarer,
 * favoritt-toggle, liste over tur-datoer og innlogget brukers egen
 * påmeldingsstatus på turen.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { getTourById } from "../services/toursApi";
import type { Tour } from "../types/tour";
import { useAuth } from "../context/AuthContext";
import {
  MapPin,
  Route,
  Mountain,
  Clock,
  Star,
  Heart,
  Share2,
  Flag,
  Calendar,
  Repeat,
  Footprints,
  MessageCircle,
  PencilLine,
  Lock,
  XCircle,
} from "lucide-react";
import TurMap from "../components/TurMap";
import { erDatoAktiv } from "../utils/turDato";

type LatLng = [number, number];

const DIFF_KEY: Record<Tour["difficulty"], string> = {
  Lett: "diffEasy",
  Middels: "diffMedium",
  Krevende: "diffHard",
  Ekspert: "diffExpert",
};

const REGION_KEY: Record<string, string> = {
  "Nord-Norge": "regionNorth",
  "Trøndelag": "regionTrondelag",
  "Østlandet": "regionEast",
  "Sørlandet": "regionSouth",
  "Vestlandet": "regionWest",
};

const TOUR_IMAGES = [
  "/images/tours/floibanen.jpg",
  "/images/tours/oslofjord.jpg",
  "/images/tours/geiranger.jpg",
  "/images/tours/fjelltur-1.jpg",
  "/images/tours/fjelltur-2.jpg",
  "/images/tours/fjelltur-3.webp",
  "/images/tours/bergen-fjelloping.avif",
  "/images/tours/fjell-okt.avif",
  "/images/tours/1635176958-noedt-til-aa-loepe.avif",
];

function hashStringToIndex(s: string, mod: number) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return mod === 0 ? 0 : h % mod;
}

function ensureTourImage(tour: Tour): Tour {
  if (tour.imageUrl && tour.imageUrl.trim()) return tour;
  const idx = hashStringToIndex(tour.id ?? tour.title ?? "tour", TOUR_IMAGES.length);
  return { ...tour, imageUrl: TOUR_IMAGES[idx] };
}

type Kommentar = {
  id: number;
  body: string | null;
  created_at: string;
  bruker: {
    id: number;
    fornavn: string | null;
    etternavn: string | null;
  } | null;
};

type MinPamelding = {
  id: number;
  status: "pending" | "binding" | "freed" | "locked";
  tur_dato: {
    id: number;
    start_at: string;
    end_at: string;
    tittel: string | null;
    tur: { id: number; tittel: string };
  };
};

const PAMELDING_STYLE: Record<MinPamelding["status"], string> = {
  pending: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  binding: "bg-[#eef5f1] text-[#0f3d2e] ring-1 ring-[#dcebe4]",
  locked: "bg-blue-100 text-blue-900 ring-1 ring-blue-200",
  freed: "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
};

function safeGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function pickLatLngFromTour(tour: Tour): LatLng | null {
  if (Array.isArray(tour.routePoints) && tour.routePoints.length > 0) {
    const firstPoint = tour.routePoints[0];
    if (Number.isFinite(firstPoint.lat) && Number.isFinite(firstPoint.lng)) {
      return [firstPoint.lat, firstPoint.lng];
    }
  }

  const center = tour.mapCenter;
  if (Array.isArray(center) && center.length === 2) {
    const lat = Number(center[0]);
    const lng = Number(center[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
  }
  return null;
}

export default function TurDetaljer() {
  const { t, i18n } = useTranslation("turer");
  const { user } = useAuth();
  const { id } = useParams();

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  const [favorittId, setFavorittId] = useState<number | null>(null);
  const [favorittBusy, setFavorittBusy] = useState(false);

  const [kommentarer, setKommentarer] = useState<Kommentar[]>([]);
  const [kommentarTekst, setKommentarTekst] = useState("");
  const [kommentarBusy, setKommentarBusy] = useState(false);
  const [kommentarFeil, setKommentarFeil] = useState<string | null>(null);

  const [minePameldinger, setMinePameldinger] = useState<MinPamelding[]>([]);
  const [chatLenker, setChatLenker] = useState<Record<number, number>>({});

  const [signupLoading, setSignupLoading] = useState(false);
  const [signupMessage, setSignupMessage] = useState("");

  const [avmeldKandidat, setAvmeldKandidat] = useState<MinPamelding | null>(null);
  const [avmeldBusy, setAvmeldBusy] = useState(false);
  const [avmeldFeil, setAvmeldFeil] = useState<string | null>(null);

  const [statusBusyId, setStatusBusyId] = useState<number | null>(null);
  const [historikkApen, setHistorikkApen] = useState(false);

  const tid = String(tour?.id ?? id ?? "");
  const dateLocale = i18n.resolvedLanguage === "en" ? "en-US" : "nb-NO";
  const canEdit = useMemo(() => {
    if (!user || !tour) return false;
    const isAdmin = user.roller?.includes("admin") ?? false;
    const isOwner = tour.ownerId !== null && tour.ownerId === user.id;
    return isAdmin || isOwner;
  }, [user, tour]);

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString(dateLocale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

  const mapCenter = useMemo<LatLng>(() => {
    if (!tour) return [60.472, 8.468];
    return pickLatLngFromTour(tour) ?? [60.472, 8.468];
  }, [tour]);

  const gear: string[] = useMemo(
    () => (Array.isArray(tour?.gear) ? tour!.gear : []),
    [tour],
  );
  const routePoints = useMemo<LatLng[]>(
    () =>
      Array.isArray(tour?.routePoints)
        ? tour.routePoints
            .map((point) => [point.lat, point.lng] as LatLng)
            .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng))
        : [],
    [tour],
  );

  const isLoggedIn = useMemo(() => {
    const token = safeGet("token") || safeGet("auth_token");
    const user = safeGet("user") || safeGet("auth_user");
    return Boolean(token || user);
  }, []);

  function storyForTour(tourArg: Tour) {
    const base = t("detail.story.intro");
    const diffLine =
      tourArg.difficulty === "Lett"
        ? t("detail.story.diffEasy")
        : tourArg.difficulty === "Middels"
          ? t("detail.story.diffMedium")
          : tourArg.difficulty === "Krevende"
            ? t("detail.story.diffHard")
            : t("detail.story.diffExpert");

    const regionLineKey = REGION_KEY[tourArg.region] ?? "regionSouth";
    const regionLine = t(`detail.story.${regionLineKey}`);

    const typeLine = tourArg.type
      ? t("detail.story.typeWith", { type: tourArg.type.toLowerCase() })
      : t("detail.story.typeWithout");

    return `${base} ${diffLine} ${regionLine} ${typeLine}`;
  }

  const datoer = useMemo(() => tour?.datoer ?? [], [tour]);
  const aktiveDatoer = useMemo(
    () => datoer.filter((d) => erDatoAktiv(d.endAt, d.status)),
    [datoer],
  );
  const historiskeDatoer = useMemo(
    () => datoer.filter((d) => !erDatoAktiv(d.endAt, d.status)),
    [datoer],
  );
  const pameldteDatoIds = useMemo(
    () => new Set(minePameldinger.map((p) => p.tur_dato.id)),
    [minePameldinger],
  );
  const token = safeGet("token") || safeGet("auth_token");
  const lasedeChatPameldinger = useMemo(
    () =>
      minePameldinger.filter((pamelding) => {
        const dato = datoer.find((item) => item.id === pamelding.tur_dato.id);
        return dato?.status === "locked" && pamelding.status !== "freed";
      }),
    [minePameldinger, datoer],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadTour() {
      if (!id) {
        if (isMounted) {
          setTour(null);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getTourById(id);
        if (isMounted) {
          setTour(ensureTourImage(data));
          setLoading(false);
        }
      } catch (error) {
        console.error("Kunne ikke hente turdetaljer fra API:", error);
        if (isMounted) {
          setTour(null);
          setLoading(false);
        }
      }
    }

    loadTour();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!tour || !tid) return;
    let active = true;

    fetch(`${import.meta.env.VITE_API_URL}/api/turer/${tid}/kommentarer`)
      .then((res) => (res.ok ? (res.json() as Promise<Kommentar[]>) : []))
      .then((data) => {
        if (active) setKommentarer(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setKommentarer([]);
      });

    return () => {
      active = false;
    };
  }, [tour, tid]);

  useEffect(() => {
    if (!tid) return;
    const localToken = safeGet("token") || safeGet("auth_token");
    if (!localToken) {
      setFavorittId(null);
      setMinePameldinger([]);
      return;
    }
    let active = true;

    fetch(`${import.meta.env.VITE_API_URL}/api/favoritter`, {
      headers: { Authorization: `Bearer ${localToken}` },
    })
      .then((res) =>
        res.ok
          ? (res.json() as Promise<Array<{ id: number; tur_id: number | null }>>)
          : [],
      )
      .then((data) => {
        if (!active) return;
        const hit = Array.isArray(data)
          ? data.find((f) => f.tur_id === Number(tid))
          : undefined;
        setFavorittId(hit ? hit.id : null);
      })
      .catch(() => {
        if (active) setFavorittId(null);
      });

    fetch(`${import.meta.env.VITE_API_URL}/api/bruker/me`, {
      headers: { Authorization: `Bearer ${localToken}` },
    })
      .then((res) =>
        res.ok
          ? (res.json() as Promise<{ tur_pamelding?: MinPamelding[] }>)
          : { tur_pamelding: [] as MinPamelding[] },
      )
      .then((data) => {
        if (!active) return;
        const alle = Array.isArray(data.tur_pamelding) ? data.tur_pamelding : [];
        setMinePameldinger(
          alle.filter((p) => p.tur_dato?.tur?.id === Number(tid)),
        );
      })
      .catch(() => {
        if (active) setMinePameldinger([]);
      });

    return () => {
      active = false;
    };
  }, [tid]);

  useEffect(() => {
    if (!avmeldKandidat) return;
    const forrigeOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !avmeldBusy) {
        setAvmeldKandidat(null);
        setAvmeldFeil(null);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = forrigeOverflow;
    };
  }, [avmeldKandidat, avmeldBusy]);

  useEffect(() => {
    if (!token || lasedeChatPameldinger.length === 0) {
      setChatLenker({});
      return;
    }

    let active = true;

    async function loadChatLenker() {
      try {
        const entries = await Promise.all(
          lasedeChatPameldinger.map(async (pamelding) => {
            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/api/turer/datoer/${pamelding.tur_dato.id}/chat`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );

            const data = (await res.json().catch(() => null)) as
              | { chatId?: number }
              | null;

            if (!res.ok || !data?.chatId) {
              return null;
            }

            return [pamelding.tur_dato.id, data.chatId] as const;
          }),
        );

        if (!active) return;

        setChatLenker(
          Object.fromEntries(entries.filter((entry): entry is readonly [number, number] => entry !== null)),
        );
      } catch (error) {
        console.error("Feil ved henting av chat-lenker:", error);
        if (active) {
          setChatLenker({});
        }
      }
    }

    void loadChatLenker();

    return () => {
      active = false;
    };
  }, [lasedeChatPameldinger, token]);

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

  if (!tour) {
    return (
      <main className="min-h-[70vh] bg-gray-50">
        <section className="mx-auto max-w-7xl px-6 py-10">
          <Link
            to="/turer"
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

  const imageUrl = tour.imageUrl || "/images/trip-card-placeholder.jpg";

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: tour!.title, url });
        return;
      }
    } catch {
      // ignore
    }

    try {
      await navigator.clipboard.writeText(url);
      alert(t("detail.shareCopied"));
    } catch {
      alert(url);
    }
  }

  async function handleSignup(turDatoId: number) {
    if (!isLoggedIn) {
      alert(t("detail.mustLoginSignup"));
      window.location.href = "/logg-inn";
      return;
    }

    const signupToken = safeGet("token") || safeGet("auth_token");

    if (!signupToken) {
      alert(t("detail.mustLoginToken"));
      return;
    }

    try {
      setSignupLoading(true);
      setSignupMessage("");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/turer/${tid}/pameld`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${signupToken}`,
          },
          body: JSON.stringify({ tur_dato_id: turDatoId }),
        }
      );

      const data = (await res.json().catch(() => null)) as
        | {
            error?: string;
            pamelding?: { id: number; status: MinPamelding["status"] };
          }
        | null;

      if (!res.ok) {
        setSignupMessage(data?.error || t("detail.signupFailed"));
        return;
      }

      const dato = datoer.find((d) => d.id === turDatoId);
      if (tour && data?.pamelding && dato) {
        const ny: MinPamelding = {
          id: data.pamelding.id,
          status: data.pamelding.status ?? "pending",
          tur_dato: {
            id: dato.id,
            start_at: dato.startAt,
            end_at: dato.endAt,
            tittel: dato.tittel,
            tur: { id: Number(tour.id), tittel: tour.title },
          },
        };
        setMinePameldinger((prev) => [...prev, ny]);
      }

      setSignupMessage(t("detail.signupSuccess"));
    } catch (error) {
      console.error("Feil ved turpåmelding:", error);
      setSignupMessage(t("detail.signupError"));
    } finally {
      setSignupLoading(false);
    }
  }

  function scrollToDatoer() {
    const el = document.getElementById("datoalternativer");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleToggleSave() {
    const favToken = safeGet("token") || safeGet("auth_token");
    if (!favToken) {
      alert(t("detail.mustLoginFavorite"));
      return;
    }
    if (!tid || favorittBusy) return;
    setFavorittBusy(true);
    try {
      if (favorittId) {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/favoritter/${favorittId}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${favToken}` } },
        );
        if (res.ok) setFavorittId(null);
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/favoritter`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${favToken}`,
          },
          body: JSON.stringify({ tur_id: Number(tid) }),
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

  async function handleSubmitKommentar() {
    if (!isLoggedIn) {
      alert(t("detail.mustLoginComment"));
      return;
    }
    const komToken = safeGet("token") || safeGet("auth_token");
    if (!komToken || !tid) return;

    const tekst = kommentarTekst.trim();
    if (tekst.length < 3) {
      setKommentarFeil(t("detail.commentMinLength"));
      return;
    }

    setKommentarBusy(true);
    setKommentarFeil(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/turer/${tid}/kommentarer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${komToken}`,
          },
          body: JSON.stringify({ body: tekst }),
        },
      );
      const data = (await res.json().catch(() => null)) as
        | (Kommentar & { error?: string })
        | null;
      if (!res.ok) {
        setKommentarFeil(data?.error ?? t("detail.commentSaveFailed"));
        return;
      }
      if (data && typeof data.id === "number") {
        setKommentarer((prev) => [data, ...prev]);
      }
      setKommentarTekst("");
    } catch {
      setKommentarFeil(t("detail.commentNetworkError"));
    } finally {
      setKommentarBusy(false);
    }
  }

  function handleReport() {
    alert(t("detail.reportDemo"));
  }

  function handleAvbrytAvmeld() {
    if (avmeldBusy) return;
    setAvmeldKandidat(null);
    setAvmeldFeil(null);
  }

  async function handleDatoStatus(datoId: number, nyStatus: "locked" | "cancelled") {
    const statusToken = safeGet("token") || safeGet("auth_token");
    if (!statusToken) {
      alert(t("detail.mustLoginToken"));
      return;
    }

    const confirmMsg =
      nyStatus === "locked"
        ? t("detail.confirmLock")
        : t("detail.confirmCancel");
    if (!window.confirm(confirmMsg)) return;

    setStatusBusyId(datoId);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/turer/datoer/${datoId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${statusToken}`,
          },
          body: JSON.stringify({ status: nyStatus }),
        },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        alert(data?.error ?? t("detail.statusError"));
        return;
      }
      // Refetch turen og mine påmeldinger for å få oppdaterte statuser.
      if (id) {
        const fresh = await getTourById(id);
        setTour(ensureTourImage(fresh));
      }
      try {
        const meRes = await fetch(`${import.meta.env.VITE_API_URL}/api/bruker/me`, {
          headers: { Authorization: `Bearer ${statusToken}` },
        });
        if (meRes.ok) {
          const meData = (await meRes.json()) as { tur_pamelding?: MinPamelding[] };
          const alle = Array.isArray(meData.tur_pamelding) ? meData.tur_pamelding : [];
          setMinePameldinger(alle.filter((p) => p.tur_dato?.tur?.id === Number(tid)));
        }
      } catch {
        // Ikke-kritisk — brukeren kan reloade hvis statusene ser gamle ut.
      }
    } catch {
      alert(t("detail.commentNetworkError"));
    } finally {
      setStatusBusyId(null);
    }
  }

  async function handleBekreftAvmeld() {
    if (!avmeldKandidat) return;
    const avToken = safeGet("token") || safeGet("auth_token");
    if (!avToken) {
      setAvmeldFeil(t("detail.unregisterTokenMissing"));
      return;
    }

    setAvmeldBusy(true);
    setAvmeldFeil(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/turer/pamelding/${avmeldKandidat.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${avToken}` } },
      );
      if (!res.ok) {
        setAvmeldFeil(t("detail.unregisterFailed"));
        return;
      }
      setMinePameldinger((prev) =>
        prev.filter((p) => p.id !== avmeldKandidat.id),
      );
      setAvmeldKandidat(null);
    } catch {
      setAvmeldFeil(t("detail.commentNetworkError"));
    } finally {
      setAvmeldBusy(false);
    }
  }

  function handleDownloadGpx() {
    const [lat, lon] = mapCenter;

    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Utopia TiU">
  <wpt lat="${lat}" lon="${lon}">
    <name>${tour!.title}</name>
  </wpt>
</gpx>`;

    const blob = new Blob([gpx], { type: "application/gpx+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${tour!.title.replaceAll(" ", "_")}.gpx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const lockedCount = lasedeChatPameldinger.length;

  return (
    <main className="bg-gray-50">
      <section className="relative h-[38vh] min-h-[320px]">
        <img
          src={imageUrl}
          alt={tour.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 h-full">
          <div className="mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-10">
            <Link
              to="/turer"
              className="mb-5 inline-flex w-fit text-sm font-semibold text-white/90 hover:underline"
            >
              {t("detail.back")}
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900 shadow-sm">
                {t(`list.filters.${DIFF_KEY[tour.difficulty]}`)}
              </span>

              <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-gray-900">
                {tour.region}
              </span>

              {tour.type && (
                <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-gray-900">
                  {tour.type}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl">
              {tour.title}
            </h1>

            <div className="mt-2 flex items-center gap-2 text-white/85">
              <MapPin className="h-4 w-4" />
              <p className="text-sm">{tour.location}</p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {aktiveDatoer.length === 1 ? (
                <button
                  type="button"
                  onClick={() => handleSignup(aktiveDatoer[0].id)}
                  disabled={signupLoading || pameldteDatoIds.has(aktiveDatoer[0].id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Calendar className="h-4 w-4" />
                  {pameldteDatoIds.has(aktiveDatoer[0].id)
                    ? t("detail.signedUp")
                    : signupLoading
                      ? t("detail.signingUp")
                      : t("detail.signUp")}
                </button>
              ) : aktiveDatoer.length > 1 ? (
                <button
                  type="button"
                  onClick={scrollToDatoer}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <Calendar className="h-4 w-4" />
                  {t("detail.chooseDate", { count: aktiveDatoer.length })}
                </button>
              ) : null}

              {isLoggedIn && (
                <button
                  type="button"
                  onClick={handleToggleSave}
                  disabled={favorittBusy}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-sm transition disabled:opacity-60 ${
                    favorittId
                      ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600"
                      : "border-white/40 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${favorittId ? "fill-white" : ""}`} />
                  {favorittId ? t("detail.favorite") : t("detail.addFavorite")}
                </button>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                <Share2 className="h-4 w-4" />
                {t("detail.share")}
              </button>

              {canEdit && (
                <Link
                  to={`/turer/${tid}/rediger`}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-900 shadow-sm hover:bg-amber-200"
                >
                  <PencilLine className="h-4 w-4" />
                  {t("detail.edit")}
                </Link>
              )}
            </div>

            {signupMessage && (
              <div className="mt-3 inline-block rounded-xl bg-white/90 px-4 py-2 text-sm text-slate-800 shadow-sm">
                {signupMessage}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Route className="h-4 w-4 text-emerald-700" />
                <span>{t("detail.summaryDistance")}</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {tour.distanceKm} km
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-emerald-700" />
                <span>{t("detail.summaryDuration")}</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {tour.durationHours} {t("detail.unitHours")}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mountain className="h-4 w-4 text-emerald-700" />
                <span>{t("detail.summaryElevation")}</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {tour.elevationM} m
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-700" />
                <span>{t("detail.summaryComments")}</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {kommentarer.length}
              </div>
            </div>
          </div>
        </div>

        {minePameldinger.length > 0 && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-[#eef5f1] p-5 shadow">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#0f3d2e]" />
              <h2 className="text-lg font-semibold text-[#0f3d2e]">
                {t("detail.myRegistration")}
              </h2>
            </div>

            <ul className="mt-3 space-y-2">
              {minePameldinger.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-2 rounded-xl bg-white p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-slate-800">
                    {p.tur_dato.tittel && (
                      <span className="font-semibold">{p.tur_dato.tittel} · </span>
                    )}
                    {formatDate(p.tur_dato.start_at)} – {formatDate(p.tur_dato.end_at)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${PAMELDING_STYLE[p.status]}`}
                    >
                      {t(`detail.statusLabels.${p.status}`)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAvmeldFeil(null);
                        setAvmeldKandidat(p);
                      }}
                      className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      {t("detail.unregister")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {lockedCount > 0 && (
          <div className="mt-6 rounded-2xl border border-sky-100 bg-white p-5 shadow">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-sky-700" />
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t("detail.groupChatTitle")}
                  </h2>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {lockedCount === 1
                    ? t("detail.groupChatBodyOne", { count: lockedCount })
                    : t("detail.groupChatBodyMany", { count: lockedCount })}
                </p>
              </div>
              <Link
                to={
                  lasedeChatPameldinger[0] && chatLenker[lasedeChatPameldinger[0].tur_dato.id]
                    ? `/meldinger?chat=${chatLenker[lasedeChatPameldinger[0].tur_dato.id]}`
                    : "/meldinger"
                }
                className="inline-flex items-center gap-2 self-start rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
              >
                <MessageCircle className="h-4 w-4" />
                {t("detail.groupChatOpen")}
              </Link>
            </div>

            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {lasedeChatPameldinger.map((pamelding) => (
                <li
                  key={pamelding.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-800">
                      {pamelding.tur_dato.tittel ?? t("detail.dateItemTitle")}
                    </span>
                    {" · "}
                    {formatDate(pamelding.tur_dato.start_at)} – {formatDate(pamelding.tur_dato.end_at)}
                  </div>
                  <Link
                    to={
                      chatLenker[pamelding.tur_dato.id]
                        ? `/meldinger?chat=${chatLenker[pamelding.tur_dato.id]}`
                        : "/meldinger"
                    }
                    className="inline-flex items-center gap-2 self-start rounded-xl border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    {chatLenker[pamelding.tur_dato.id]
                      ? t("detail.groupChatOpenOne")
                      : t("detail.groupChatOpenFallback")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(aktiveDatoer.length > 0 || historiskeDatoer.length > 0) && (
          <div
            id="datoalternativer"
            className="mt-6 scroll-mt-24 rounded-2xl border border-gray-100 bg-white p-6 shadow"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-semibold">{t("detail.dateOptionsTitle")}</h2>
              <span className="ml-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                {aktiveDatoer.length}{" "}
                {aktiveDatoer.length === 1 ? t("detail.dateSingular") : t("detail.datePlural")}
              </span>
            </div>

            {aktiveDatoer.length > 1 && (
              <p className="mt-2 text-sm text-gray-600">{t("detail.datesIntro")}</p>
            )}

            {aktiveDatoer.length === 0 && (
              <p className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                {t("detail.noActiveDates")}
              </p>
            )}

            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {aktiveDatoer.map((d) => {
                const erPameldt = pameldteDatoIds.has(d.id);
                const kanMelde = isLoggedIn && !erPameldt && d.status === "planned";
                return (
                  <li
                    key={d.id}
                    className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">
                        {d.tittel ?? t("detail.dateNoLabel")}
                      </div>
                      <div className="text-gray-700">
                        {formatDate(d.startAt)} – {formatDate(d.endAt)}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-wider text-gray-500">
                        {d.status}
                      </div>
                    </div>

                    <div className="mt-auto">
                      {erPameldt ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200">
                          <Calendar className="h-3.5 w-3.5" />
                          {t("detail.signedUp")}
                        </span>
                      ) : !isLoggedIn ? (
                        <Link
                          to="/logg-inn"
                          className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                        >
                          {t("detail.loginToSignup")}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSignup(d.id)}
                          disabled={signupLoading || !kanMelde}
                          title={
                            d.status !== "planned"
                              ? t("detail.dateClosed")
                              : undefined
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          {signupLoading ? t("detail.signingUp") : t("detail.signUp")}
                        </button>
                      )}
                    </div>

                    {canEdit && d.status === "planned" && (
                      <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-2">
                        <button
                          type="button"
                          disabled={statusBusyId === d.id}
                          onClick={() => handleDatoStatus(d.id, "locked")}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f3d2e] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#12351d] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Lock className="h-3.5 w-3.5" />
                          {t("detail.lockDate")}
                        </button>
                        <button
                          type="button"
                          disabled={statusBusyId === d.id}
                          onClick={() => handleDatoStatus(d.id, "cancelled")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          {t("detail.cancelDate")}
                        </button>
                      </div>
                    )}
                    {canEdit && d.status === "locked" && (
                      <div className="flex items-center gap-1.5 border-t border-gray-200 pt-2 text-xs font-semibold text-blue-900">
                        <Lock className="h-3.5 w-3.5" />
                        {t("detail.dateIsLocked")}
                      </div>
                    )}
                    {canEdit && d.status === "cancelled" && (
                      <div className="flex items-center gap-1.5 border-t border-gray-200 pt-2 text-xs font-semibold text-slate-600">
                        <XCircle className="h-3.5 w-3.5" />
                        {t("detail.dateIsCancelled")}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {historiskeDatoer.length > 0 && (
              <div className="mt-6 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setHistorikkApen((v) => !v)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  {historikkApen
                    ? t("detail.hideHistory", { count: historiskeDatoer.length })
                    : t("detail.showHistory", { count: historiskeDatoer.length })}
                </button>

                {historikkApen && (
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {historiskeDatoer.map((d) => (
                      <li
                        key={d.id}
                        className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-slate-50 p-3 text-sm text-slate-700"
                      >
                        <div className="font-medium text-slate-800">
                          {d.tittel ?? t("detail.dateNoLabel")}
                        </div>
                        <div className="text-xs text-slate-600">
                          {formatDate(d.startAt)} – {formatDate(d.endAt)}
                        </div>
                        <div className="text-xs uppercase tracking-wider text-slate-500">
                          {d.status}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-emerald-200 text-emerald-700">
                  i
                </span>
                {t("detail.aboutTour")}
              </h2>

              <div className="mt-5 space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-emerald-700" />
                  <div>
                    <div className="font-semibold">{tour.location}</div>
                    <div className="text-sm text-gray-500">{tour.region}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Footprints className="h-5 w-5 text-emerald-700" />
                  <div>
                    <div className="font-semibold">
                      {tour.type || t("detail.aboutTypeFallback")}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t(`list.filters.${DIFF_KEY[tour.difficulty]}`)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Repeat className="h-5 w-5 text-emerald-700" />
                  <div>
                    <div className="font-semibold">{t("detail.aboutRouteBased")}</div>
                    <div className="text-sm text-gray-500">{t("detail.aboutRouteLabel")}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-emerald-700" />
                  <div>
                    <div className="font-semibold">{t("detail.aboutSeason")}</div>
                    <div className="text-sm text-gray-500">{t("detail.aboutSeasonLabel")}</div>
                  </div>
                </div>
              </div>

              <p className="mt-6 leading-relaxed text-gray-700">
                {tour.description || storyForTour(tour)}
              </p>

              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="text-sm font-semibold text-emerald-900">
                  {t("detail.turvettTitle")}
                </div>
                <p className="mt-1 text-sm text-emerald-900/80">{t("detail.turvettBody")}</p>
                <button
                  type="button"
                  className="mt-3 inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                  onClick={() => alert(t("detail.turvettDemoAlert"))}
                >
                  {t("detail.turvettReadMore")}
                </button>
              </div>

              <h3 className="mt-6 text-sm font-semibold text-gray-900">
                {t("detail.recommendedGear")}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {gear.length === 0 ? (
                  <span className="text-sm text-gray-500">{t("detail.gearNotSpecified")}</span>
                ) : (
                  gear.map((g) => (
                    <span
                      key={g}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                    >
                      {g}
                    </span>
                  ))
                )}
              </div>
            </div>

            {tour.hytter.length > 0 && (
              <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    H
                  </span>
                  {t("detail.cabinsHeading")}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {t("detail.cabinsIntro", { count: tour.hytter.length })}
                </p>

                <ul className="mt-4 space-y-3">
                  {tour.hytter.map((h, i) => (
                    <li
                      key={h.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0f3d2e] text-xs font-semibold text-white">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-gray-900">{h.navn}</div>
                          <div className="text-xs text-gray-500">
                            {[
                              h.omrade,
                              h.betjent
                                ? t(`detail.cabinBetjent.${h.betjent}`)
                                : null,
                              `${h.kapasitetSenger} senger`,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        </div>
                      </div>

                      <Link
                        to={`/hytter/${h.id}`}
                        className="shrink-0 text-sm font-semibold text-emerald-700 hover:underline"
                      >
                        {t("detail.viewCabin")}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">{t("detail.mapTitle")}</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                  onClick={() => {
                    const [lat, lng] = mapCenter;
                    window.open(
                      `https://www.openstreetmap.org/#map=13/${lat}/${lng}`,
                      "_blank"
                    );
                  }}
                >
                  {t("detail.bigMap")}
                </button>

                <button
                  type="button"
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                  onClick={handleDownloadGpx}
                >
                  {t("detail.gpxDownload")}
                </button>
              </div>
            </div>

            <TurMap
              center={mapCenter}
              title={tour.title}
              routePoints={routePoints}
              cabins={tour.hytter
                .filter(
                  (h): h is typeof h & { lat: number; lng: number } =>
                    h.lat !== null && h.lng !== null,
                )
                .map((h) => ({ id: h.id, navn: h.navn, lat: h.lat, lng: h.lng }))}
            />
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-6 shadow">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-emerald-700" />
              <h2 className="text-xl font-semibold">{t("detail.commentsTitle")}</h2>
              <span className="ml-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                {kommentarer.length}
              </span>
            </div>
          </div>

          <div className="mt-6">
            {!isLoggedIn ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600">
                {t("detail.loginToComment")}
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
              <div className="space-y-3">
                <textarea
                  value={kommentarTekst}
                  onChange={(e) => {
                    setKommentarTekst(e.target.value);
                    setKommentarFeil(null);
                  }}
                  placeholder={t("detail.commentPlaceholder")}
                  maxLength={500}
                  className="min-h-[100px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />

                {kommentarFeil && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900">
                    {kommentarFeil}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {kommentarTekst.length}/500
                  </span>
                  <button
                    type="button"
                    onClick={handleSubmitKommentar}
                    disabled={kommentarBusy}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {kommentarBusy ? t("detail.commentPublishing") : t("detail.commentPublish")}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="text-sm font-semibold text-gray-900">{t("detail.othersSay")}</div>

            {kommentarer.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-600">
                {t("detail.noCommentsYet")}
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {kommentarer.map((k) => {
                  const navn = k.bruker
                    ? `${k.bruker.fornavn ?? ""} ${k.bruker.etternavn ?? ""}`.trim() ||
                      t("detail.unknownUser")
                    : t("detail.unknownUser");
                  return (
                    <div
                      key={k.id}
                      className="rounded-2xl border border-gray-100 bg-white p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold text-gray-900">{navn}</div>
                          <div className="mt-1 text-xs text-gray-500">
                            {formatDate(k.created_at)}
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-gray-700">
                        {k.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-gray-500">{t("detail.tourIdLabel")} {tid}</div>

            <button
              type="button"
              onClick={handleReport}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50"
            >
              <Flag className="h-4 w-4 text-red-600" />
              {t("detail.report")}
            </button>
          </div>
        </div>
      </section>

      {avmeldKandidat && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="avmeld-tittel"
          onClick={handleAvbrytAvmeld}
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3
              id="avmeld-tittel"
              className="text-lg font-semibold text-slate-900"
            >
              {t("detail.unregisterDialogTitle")}
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              <Trans
                i18nKey="detail.unregisterDialogBody"
                ns="turer"
                values={{
                  date: `${avmeldKandidat.tur_dato.tittel ? `${avmeldKandidat.tur_dato.tittel} · ` : ""}${formatDate(avmeldKandidat.tur_dato.start_at)} – ${formatDate(avmeldKandidat.tur_dato.end_at)}`,
                }}
                components={[<span className="font-semibold text-slate-800" key="0" />]}
              />
            </p>

            {avmeldFeil && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900">
                {avmeldFeil}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleAvbrytAvmeld}
                disabled={avmeldBusy}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {t("detail.cancel")}
              </button>
              <button
                type="button"
                onClick={handleBekreftAvmeld}
                disabled={avmeldBusy}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {avmeldBusy ? t("detail.unregistering") : t("detail.confirmUnregister")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
