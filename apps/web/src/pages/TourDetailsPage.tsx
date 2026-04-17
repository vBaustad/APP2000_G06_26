/**
 * Fil: TourDetailsPage.tsx
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse: Detaljside for en tur (åpnes "Se mer").
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTourById } from "../services/toursApi";
import type { Tour } from "../utils/mockTours";
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
  if ((t as any).imageUrl && String((t as any).imageUrl).trim()) return t;
  const idx = hashStringToIndex((t as any).id ?? (t as any).title ?? "tour", TOUR_IMAGES.length);
  return { ...(t as any), imageUrl: TOUR_IMAGES[idx] } as Tour;
}

type Review = {
  id: string;
  name: string;
  rating: number;
  text: string;
  createdAt: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

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

function makeId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

function safeGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function keyReviews(tourId: string) {
  return `tour_reviews_${tourId}`;
}

function keySaved(tourId: string) {
  return `tour_saved_${tourId}`;
}

function storyForTour(tour: Tour) {
  const fallback =
    "Dette er en tur som gir en tydelig naturopplevelse med god progresjon underveis. Gå jevnt, ta pauser og bruk forholdene til din fordel.";

  const diff = (tour as any).difficulty;
  const region = (tour as any).region;

  const diffLine =
    diff === "Lett"
      ? "Passer for en rolig dag og for deg som vil ha en mer tilgjengelig tur."
      : diff === "Middels"
        ? "Gir nok motbakke og lengde til at turen føles ordentlig, uten å bli for ekstrem."
        : diff === "Krevende"
          ? "Her bør du ha gode sko, litt erfaring og være forberedt på en mer fysisk tur."
          : "Dette er en tur for sterke bein og god dømmekraft.";

  const regionLine =
    region === "Vestlandet"
      ? "Vestlandet kan skifte vær fort, så det lønner seg å pakke for mer enn bare sol."
      : region === "Nord-Norge"
        ? "Nord-Norge gir store naturopplevelser, men krever også respekt for vær og avstander."
        : region === "Østlandet"
          ? "Østlandet gir ofte fine og stabile forhold, men våte stier og værskifter må fortsatt tas på alvor."
          : region === "Trøndelag"
            ? "Trøndelag byr ofte på variert terreng og turer som kan overraske underveis."
            : "Sørlandet kan gi rolige og fine turer med gode stopp underveis.";

  const typeLine =
    (tour as any).type
      ? `Turtypen er ${(tour as any).type.toLowerCase()}, så det er lurt å tilpasse tempo og utstyr deretter.`
      : "Tilpass turen etter forholdene og formen din den dagen.";

  return `${fallback} ${diffLine} ${regionLine} ${typeLine}`;
}

function pickLatLngFromTour(tour: any): LatLng | null {
  const center = tour?.mapCenter;
  if (Array.isArray(center) && center.length === 2) {
    const lat = Number(center[0]);
    const lng = Number(center[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
  }

  const lat = tour?.lat ?? tour?.latitude ?? tour?.coords?.lat ?? tour?.coordinates?.lat;
  const lng = tour?.lng ?? tour?.lon ?? tour?.longitude ?? tour?.coords?.lng ?? tour?.coordinates?.lng;

  if (typeof lat === "number" && typeof lng === "number") return [lat, lng];
  return null;
}

export default function TourDetailsPage() {
  const { id } = useParams();

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  const tid = String((tour as any)?.id ?? id ?? "");

  const mapCenter = useMemo<LatLng>(() => {
    if (!tour) return [60.472, 8.468];
    const fromTour = pickLatLngFromTour(tour as any);
    if (fromTour) return fromTour;
    return [60.472, 8.468];
  }, [tour]);

  const gear: string[] = useMemo(() => {
    if (!tour) return [];
    const g = (tour as any).gear;
    return Array.isArray(g) ? g : [];
  }, [tour]);

  const [saved, setSaved] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  const isLoggedIn = useMemo(() => {
    const token = safeGet("token") || safeGet("auth_token");
    const user = safeGet("user") || safeGet("auth_user");
    return Boolean(token || user);
  }, []);

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
    if (!tour) return;

    setSaved(safeGet(keySaved(tid)) === "1");

    const raw = safeGet(keyReviews(tid));
    try {
      const parsed = raw ? (JSON.parse(raw) as Review[]) : [];
      setReviews(Array.isArray(parsed) ? parsed : []);
    } catch {
      setReviews([]);
    }
  }, [tour, tid]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

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
          <Link to="/explore" className="text-sm font-semibold text-emerald-700 hover:underline">
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

  const imageUrl = (tour as any).imageUrl || "/images/trip-card-placeholder.jpg";

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: (tour as any).title, url });
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

  function handleToggleSave() {
    const next = !saved;
    setSaved(next);
    safeSet(keySaved(tid), next ? "1" : "0");
  }

  function handleReport() {
    alert("Rapportering er en demo her. (Koble til backend senere)");
  }

  function handleDownloadGpx() {
    const [lat, lon] = mapCenter;

    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Utopia TiU">
  <wpt lat="${lat}" lon="${lon}">
    <name>${(tour as any).title}</name>
  </wpt>
</gpx>`;

    const blob = new Blob([gpx], { type: "application/gpx+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${String((tour as any).title).replaceAll(" ", "_")}.gpx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function submitReview() {
    if (!isLoggedIn) {
      alert("Du må logge inn for å legge igjen anmeldelse.");
      return;
    }

    const name = reviewName.trim() || "Anonym";
    const text = reviewText.trim();

    if (text.length < 10) {
      alert("Skriv litt mer (minst 10 tegn).");
      return;
    }

    const rating = clamp(reviewRating, 1, 5);

    const nextReview: Review = {
      id: makeId(),
      name,
      rating,
      text,
      createdAt: new Date().toISOString(),
    };

    const next = [nextReview, ...reviews];
    setReviews(next);
    safeSet(keyReviews(tid), JSON.stringify(next));

    setReviewName("");
    setReviewText("");
    setReviewRating(5);
  }

  return (
    <main className="bg-gray-50">
      <section className="relative h-[38vh] min-h-[320px]">
        <img src={imageUrl} alt={(tour as any).title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 h-full">
          <div className="mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-10">
            <Link
              to="/explore"
              className="mb-5 inline-flex w-fit text-sm font-semibold text-white/90 hover:underline"
            >
              ← Tilbake til Utforsk
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900 shadow-sm">
                {(tour as any).difficulty}
              </span>

              <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-gray-900">
                {(tour as any).region}
              </span>

              {(tour as any).type && (
                <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-gray-900">
                  {(tour as any).type}
                </span>
              )}

              {avgRating !== null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-900">
                  <Star className="h-4 w-4" /> {avgRating}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl">{(tour as any).title}</h1>

            <div className="mt-2 flex items-center gap-2 text-white/85">
              <MapPin className="h-4 w-4" />
              <p className="text-sm">{(tour as any).location}</p>
            </div>
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
              <div className="mt-1 text-2xl font-semibold text-gray-900">{(tour as any).distanceKm} km</div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-emerald-700" />
                <span>Varighet</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{(tour as any).durationHours} t</div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mountain className="h-4 w-4 text-emerald-700" />
                <span>Stigning</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{(tour as any).elevationM} m</div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-700" />
                <span>Vurdering</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{avgRating ?? "N/A"}</div>
            </div>
          </div>
        </div>

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
                    <div className="font-semibold">{(tour as any).location}</div>
                    <div className="text-sm text-gray-500">{(tour as any).region}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Footprints className="h-5 w-5 text-emerald-700" />
                  <div>
                    <div className="font-semibold">{(tour as any).type || "Fottur"}</div>
                    <div className="text-sm text-gray-500">{(tour as any).difficulty}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Repeat className="h-5 w-5 text-emerald-700" />
                  <div>
                    <div className="font-semibold">Tur basert på koblede turstier</div>
                    <div className="text-sm text-gray-500">Rute</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-emerald-700" />
                  <div>
                    <div className="font-semibold">Hele året (væravhengig)</div>
                    <div className="text-sm text-gray-500">Sesong</div>
                  </div>
                </div>
              </div>

              <p className="mt-6 leading-relaxed text-gray-700">
                {(tour as any).description || storyForTour(tour)}
              </p>

              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="text-sm font-semibold text-emerald-900">Turvett (klassisk og smart)</div>
                <p className="mt-1 text-sm text-emerald-900/80">
                  Hold deg på stien der det er mulig, vis hensyn, og ta med søppel hjem. Naturen er ikke en søppelbøtte.
                </p>
                <button
                  type="button"
                  className="mt-3 inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                  onClick={() => alert("Demo: Her kan dere lenke til info-side om turvett/verneregler.")}
                >
                  Les mer
                </button>
              </div>

              <h3 className="mt-6 text-sm font-semibold text-gray-900">Anbefalt utstyr</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {gear.length === 0 ? (
                  <span className="text-sm text-gray-500">Ikke spesifisert</span>
                ) : (
                  gear.map((g) => (
                    <span key={g} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
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
                    window.open(`https://www.openstreetmap.org/#map=13/${lat}/${lng}`, "_blank");
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

            <TurMap center={mapCenter} title={(tour as any).title} />
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-6 shadow">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-emerald-700" />
              <h2 className="text-xl font-semibold">Anmeldelser</h2>
              <span className="ml-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{reviews.length}</span>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold text-gray-900">Skriv en anmeldelse</div>

            {!isLoggedIn ? (
              <div className="mt-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600">
                Logg inn for å legge igjen en anmeldelse.
                <div className="mt-3">
                  <Link
                    to="/login"
                    className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Logg inn
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <input
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Navn (valgfritt)"
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setReviewRating(n)}
                          title={`${n} stjerner`}
                          className="p-1"
                        >
                          <Star className={`h-4 w-4 ${n <= reviewRating ? "text-amber-500" : "text-gray-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={submitReview}
                    className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Publiser
                  </button>
                </div>

                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Skriv kort om opplevelsen din… (minst 10 tegn)"
                  className="mt-3 min-h-[110px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </>
            )}
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="text-sm font-semibold text-gray-900">Hva andre sier</div>

            {reviews.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-600">
                Ingen anmeldelser ennå. Bli den første til å dele din opplevelse!
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-gray-100 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-gray-900">{r.name}</div>
                        <div className="mt-1 text-xs text-gray-500">{formatDateNo(r.createdAt)}</div>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`h-4 w-4 ${n <= r.rating ? "text-amber-500" : "text-gray-200"}`} />
                        ))}
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-gray-700">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-gray-500">Lagret lokalt (demo) • Tur-ID: {tid}</div>

            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSave}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-gray-50 ${
                  saved
                    ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Heart className="h-4 w-4" />
                {saved ? "Lagret" : "Lagre"}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50"
              >
                <Share2 className="h-4 w-4" />
                Del
              </button>

              <button
                type="button"
                onClick={handleReport}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50"
              >
                <Flag className="h-4 w-4 text-red-600" />
                Rapporter
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}