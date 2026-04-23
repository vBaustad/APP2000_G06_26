/**
 * Fil: TurDetaljer.tsx
 * Utvikler(e): Ramona Cretulescu, Vebjørn Baustad
 * Beskrivelse: Detaljside for en tur. Viser turinfo, kart, kommentarer,
 * favoritt-toggle, liste over tur-datoer og innlogget brukers egen
 * påmeldingsstatus på turen.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTourById } from "../services/toursApi";
import type { Tour } from "../types/tour";
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
} from "lucide-react";
import TurMap from "../components/TurMap";

type LatLng = [number, number];

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

function ensureTourImage(t: Tour): Tour {
  if (t.imageUrl && t.imageUrl.trim()) return t;
  const idx = hashStringToIndex(t.id ?? t.title ?? "tour", TOUR_IMAGES.length);
  return { ...t, imageUrl: TOUR_IMAGES[idx] };
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

const PAMELDING_LABEL: Record<MinPamelding["status"], string> = {
  pending: "Interesse meldt",
  binding: "Bindende påmelding",
  locked: "Dato låst",
  freed: "Dato fristilt",
};

const PAMELDING_STYLE: Record<MinPamelding["status"], string> = {
  pending: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  binding: "bg-[#eef5f1] text-[#0f3d2e] ring-1 ring-[#dcebe4]",
  locked: "bg-blue-100 text-blue-900 ring-1 ring-blue-200",
  freed: "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
};

function formatDateNo(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("nb-NO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function safeGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storyForTour(tour: Tour) {
  const fallback =
    "Dette er en tur som gir en tydelig naturopplevelse med god progresjon underveis. Gå jevnt, ta pauser og bruk forholdene til din fordel.";

  const diffLine =
    tour.difficulty === "Lett"
      ? "Passer for en rolig dag og for deg som vil ha en mer tilgjengelig tur."
      : tour.difficulty === "Middels"
        ? "Gir nok motbakke og lengde til at turen føles ordentlig, uten å bli for ekstrem."
        : tour.difficulty === "Krevende"
          ? "Her bør du ha gode sko, litt erfaring og være forberedt på en mer fysisk tur."
          : "Dette er en tur for sterke bein og god dømmekraft.";

  const regionLine =
    tour.region === "Vestlandet"
      ? "Vestlandet kan skifte vær fort, så det lønner seg å pakke for mer enn bare sol."
      : tour.region === "Nord-Norge"
        ? "Nord-Norge gir store naturopplevelser, men krever også respekt for vær og avstander."
        : tour.region === "Østlandet"
          ? "Østlandet gir ofte fine og stabile forhold, men våte stier og værskifter må fortsatt tas på alvor."
          : tour.region === "Trøndelag"
            ? "Trøndelag byr ofte på variert terreng og turer som kan overraske underveis."
            : "Sørlandet kan gi rolige og fine turer med gode stopp underveis.";

  const typeLine = tour.type
    ? `Turtypen er ${tour.type.toLowerCase()}, så det er lurt å tilpasse tempo og utstyr deretter.`
    : "Tilpass turen etter forholdene og formen din den dagen.";

  return `${fallback} ${diffLine} ${regionLine} ${typeLine}`;
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

  const tid = String(tour?.id ?? id ?? "");

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

  const datoer = tour?.datoer ?? [];
  const pameldteDatoIds = new Set(minePameldinger.map((p) => p.tur_dato.id));
  const token = safeGet("token") || safeGet("auth_token");
  const lasedeChatPameldinger = minePameldinger.filter((pamelding) => {
    const dato = datoer.find((item) => item.id === pamelding.tur_dato.id);
    return dato?.status === "locked" && pamelding.status !== "freed";
  });

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
    const token = safeGet("token") || safeGet("auth_token");
    if (!token) {
      setFavorittId(null);
      setMinePameldinger([]);
      return;
    }
    let active = true;

    fetch(`${import.meta.env.VITE_API_URL}/api/favoritter`, {
      headers: { Authorization: `Bearer ${token}` },
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
      headers: { Authorization: `Bearer ${token}` },
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
            <p className="text-gray-600">Laster turdetaljer...</p>
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
            ← Tilbake til Utforsk
          </Link>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow">
            <h1 className="text-2xl font-semibold">Fant ikke tur</h1>
            <p className="mt-2 text-gray-600">
              Vi fant ingen tur{" "}
              {id ? (
                <>
                  med id: <span className="font-mono">{id}</span>
                </>
              ) : (
                <> (mangler id i URL)</>
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
      alert("Lenke kopiert!");
    } catch {
      alert(url);
    }
  }

  async function handleSignup(turDatoId: number) {
    if (!isLoggedIn) {
      alert("Du må logge inn for å melde deg på turen.");
      window.location.href = "/logg-inn";
      return;
    }

    const token = safeGet("token") || safeGet("auth_token");

    if (!token) {
      alert("Fant ikke gyldig innlogging.");
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
            Authorization: `Bearer ${token}`,
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
        setSignupMessage(data?.error || "Kunne ikke melde deg på turen.");
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

      setSignupMessage(
        "Du er nå meldt på turdatoen. Sjekk Min side for oversikt.",
      );
    } catch (error) {
      console.error("Feil ved turpåmelding:", error);
      setSignupMessage("Noe gikk galt ved påmelding.");
    } finally {
      setSignupLoading(false);
    }
  }

  function scrollToDatoer() {
    const el = document.getElementById("datoalternativer");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleToggleSave() {
    const token = safeGet("token") || safeGet("auth_token");
    if (!token) {
      alert("Du må være innlogget for å favorisere turen.");
      return;
    }
    if (!tid || favorittBusy) return;
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
      alert("Du må være innlogget for å kommentere.");
      return;
    }
    const token = safeGet("token") || safeGet("auth_token");
    if (!token || !tid) return;

    const tekst = kommentarTekst.trim();
    if (tekst.length < 3) {
      setKommentarFeil("Kommentar må ha minst 3 tegn.");
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
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ body: tekst }),
        },
      );
      const data = (await res.json().catch(() => null)) as
        | (Kommentar & { error?: string })
        | null;
      if (!res.ok) {
        setKommentarFeil(data?.error ?? "Kunne ikke lagre kommentar.");
        return;
      }
      if (data && typeof data.id === "number") {
        setKommentarer((prev) => [data, ...prev]);
      }
      setKommentarTekst("");
    } catch {
      setKommentarFeil("Nettverksfeil. Prøv igjen.");
    } finally {
      setKommentarBusy(false);
    }
  }

  function handleReport() {
    alert("Rapportering er en demo her. (Koble til backend senere)");
  }

  function handleAvbrytAvmeld() {
    if (avmeldBusy) return;
    setAvmeldKandidat(null);
    setAvmeldFeil(null);
  }

  async function handleBekreftAvmeld() {
    if (!avmeldKandidat) return;
    const token = safeGet("token") || safeGet("auth_token");
    if (!token) {
      setAvmeldFeil("Fant ikke gyldig innlogging.");
      return;
    }

    setAvmeldBusy(true);
    setAvmeldFeil(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/turer/pamelding/${avmeldKandidat.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) {
        setAvmeldFeil("Kunne ikke melde deg av. Prøv igjen.");
        return;
      }
      setMinePameldinger((prev) =>
        prev.filter((p) => p.id !== avmeldKandidat.id),
      );
      setAvmeldKandidat(null);
    } catch {
      setAvmeldFeil("Nettverksfeil. Prøv igjen.");
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
              ← Tilbake til Utforsk
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900 shadow-sm">
                {tour.difficulty}
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
              {datoer.length === 1 ? (
                <button
                  type="button"
                  onClick={() => handleSignup(datoer[0].id)}
                  disabled={signupLoading || pameldteDatoIds.has(datoer[0].id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Calendar className="h-4 w-4" />
                  {pameldteDatoIds.has(datoer[0].id)
                    ? "Du er påmeldt"
                    : signupLoading
                      ? "Melder på..."
                      : "Meld meg på"}
                </button>
              ) : datoer.length > 1 ? (
                <button
                  type="button"
                  onClick={scrollToDatoer}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <Calendar className="h-4 w-4" />
                  Velg dato ({datoer.length} alternativer)
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
                  {favorittId ? "Favoritt" : "Legg til favoritt"}
                </button>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                <Share2 className="h-4 w-4" />
                Del
              </button>
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
                <span>Distanse</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {tour.distanceKm} km
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-emerald-700" />
                <span>Varighet</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {tour.durationHours} t
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mountain className="h-4 w-4 text-emerald-700" />
                <span>Stigning</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {tour.elevationM} m
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-700" />
                <span>Kommentarer</span>
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
                Din påmelding på denne turen
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
                    {formatDateNo(p.tur_dato.start_at)} –{" "}
                    {formatDateNo(p.tur_dato.end_at)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${PAMELDING_STYLE[p.status]}`}
                    >
                      {PAMELDING_LABEL[p.status]}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAvmeldFeil(null);
                        setAvmeldKandidat(p);
                      }}
                      className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Meld av
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {lasedeChatPameldinger.length > 0 && (
          <div className="mt-6 rounded-2xl border border-sky-100 bg-white p-5 shadow">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-sky-700" />
                  <h2 className="text-lg font-semibold text-slate-900">
                    Gruppesamtale i meldinger
                  </h2>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Du har {lasedeChatPameldinger.length} låst{" "}
                  {lasedeChatPameldinger.length === 1 ? "turdato" : "turdatoer"} med
                  egen gruppesamtale. Åpne dem i meldingssiden.
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
                Åpne riktig chat
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
                      {pamelding.tur_dato.tittel ?? "Turdato"}
                    </span>
                    {" · "}
                    {formatDateNo(pamelding.tur_dato.start_at)} –{" "}
                    {formatDateNo(pamelding.tur_dato.end_at)}
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
                    {chatLenker[pamelding.tur_dato.id] ? "Åpne chat" : "Gå til meldinger"}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {datoer.length > 0 && (
          <div
            id="datoalternativer"
            className="mt-6 scroll-mt-24 rounded-2xl border border-gray-100 bg-white p-6 shadow"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-semibold">Datoalternativer</h2>
              <span className="ml-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                {datoer.length} {datoer.length === 1 ? "dato" : "datoer"}
              </span>
            </div>

            {datoer.length > 1 && (
              <p className="mt-2 text-sm text-gray-600">
                Meld deg på én eller flere datoer. Er du på flere, låses den
                datoen som til slutt får nok deltakere.
              </p>
            )}

            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {datoer.map((d) => {
                const erPameldt = pameldteDatoIds.has(d.id);
                const kanMelde = isLoggedIn && !erPameldt && d.status === "planned";
                return (
                  <li
                    key={d.id}
                    className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">
                        {d.tittel ?? "Dato"}
                      </div>
                      <div className="text-gray-700">
                        {formatDateNo(d.startAt)} – {formatDateNo(d.endAt)}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-wider text-gray-500">
                        {d.status}
                      </div>
                    </div>

                    <div className="mt-auto">
                      {erPameldt ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200">
                          <Calendar className="h-3.5 w-3.5" />
                          Du er påmeldt
                        </span>
                      ) : !isLoggedIn ? (
                        <Link
                          to="/logg-inn"
                          className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                        >
                          Logg inn for å melde deg på
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSignup(d.id)}
                          disabled={signupLoading || !kanMelde}
                          title={
                            d.status !== "planned"
                              ? "Denne datoen er ikke åpen for påmelding."
                              : undefined
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          {signupLoading ? "Melder på..." : "Meld meg på"}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-emerald-200 text-emerald-700">
                  i
                </span>
                Om turen
              </h2>

              <div className="mt-5 space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-emerald-700" />
                  <div>
                    <div className="font-semibold">{tour.location}</div>
                    <div className="text-sm text-gray-500">
                      {tour.region}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Footprints className="h-5 w-5 text-emerald-700" />
                  <div>
                    <div className="font-semibold">
                      {tour.type || "Fottur"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {tour.difficulty}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Repeat className="h-5 w-5 text-emerald-700" />
                  <div>
                    <div className="font-semibold">
                      Tur basert på koblede turstier
                    </div>
                    <div className="text-sm text-gray-500">Rute</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-emerald-700" />
                  <div>
                    <div className="font-semibold">
                      Hele året (væravhengig)
                    </div>
                    <div className="text-sm text-gray-500">Sesong</div>
                  </div>
                </div>
              </div>

              <p className="mt-6 leading-relaxed text-gray-700">
                {tour.description || storyForTour(tour)}
              </p>

              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="text-sm font-semibold text-emerald-900">
                  Turvett (klassisk og smart)
                </div>
                <p className="mt-1 text-sm text-emerald-900/80">
                  Hold deg på stien der det er mulig, vis hensyn, og ta med søppel hjem.
                  Naturen er ikke en søppelbøtte.
                </p>
                <button
                  type="button"
                  className="mt-3 inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                  onClick={() =>
                    alert(
                      "Demo: Her kan dere lenke til info-side om turvett/verneregler."
                    )
                  }
                >
                  Les mer
                </button>
              </div>

              <h3 className="mt-6 text-sm font-semibold text-gray-900">
                Anbefalt utstyr
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {gear.length === 0 ? (
                  <span className="text-sm text-gray-500">Ikke spesifisert</span>
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
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Kart</h3>
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
                  Stort kart
                </button>

                <button
                  type="button"
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                  onClick={handleDownloadGpx}
                >
                  GPX
                </button>
              </div>
            </div>

            <TurMap center={mapCenter} title={tour.title} routePoints={routePoints} />
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-6 shadow">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-emerald-700" />
              <h2 className="text-xl font-semibold">Kommentarer</h2>
              <span className="ml-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                {kommentarer.length}
              </span>
            </div>
          </div>

          <div className="mt-6">
            {!isLoggedIn ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600">
                Logg inn for å legge igjen en kommentar.
                <div className="mt-3">
                  <Link
                    to="/logg-inn"
                    className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Logg inn
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
                  placeholder="Skriv kort om opplevelsen din..."
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
                    {kommentarBusy ? "Publiserer..." : "Publiser kommentar"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="text-sm font-semibold text-gray-900">
              Hva andre sier
            </div>

            {kommentarer.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-600">
                Ingen kommentarer ennå. Bli den første til å dele!
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {kommentarer.map((k) => {
                  const navn = k.bruker
                    ? `${k.bruker.fornavn ?? ""} ${k.bruker.etternavn ?? ""}`.trim() ||
                      "Bruker"
                    : "Bruker";
                  return (
                    <div
                      key={k.id}
                      className="rounded-2xl border border-gray-100 bg-white p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold text-gray-900">{navn}</div>
                          <div className="mt-1 text-xs text-gray-500">
                            {formatDateNo(k.created_at)}
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
            <div className="text-xs text-gray-500">Tur-ID: {tid}</div>

            <button
              type="button"
              onClick={handleReport}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50"
            >
              <Flag className="h-4 w-4 text-red-600" />
              Rapporter
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
              Meld deg av turdato?
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Du er i ferd med å melde deg av{" "}
              <span className="font-semibold text-slate-800">
                {avmeldKandidat.tur_dato.tittel
                  ? `${avmeldKandidat.tur_dato.tittel} · `
                  : ""}
                {formatDateNo(avmeldKandidat.tur_dato.start_at)} –{" "}
                {formatDateNo(avmeldKandidat.tur_dato.end_at)}
              </span>
              . Du kan melde deg på igjen senere hvis det fortsatt er plass.
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
                Avbryt
              </button>
              <button
                type="button"
                onClick={handleBekreftAvmeld}
                disabled={avmeldBusy}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {avmeldBusy ? "Melder av..." : "Meld av"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
