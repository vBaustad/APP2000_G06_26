/**
 * Fil: TourDetailsPage.tsx
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse: Detaljside for en tur (åpnes "Se mer").
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
import { useAuth } from "../context/AuthContext";

type Tour = {
  _id?: string;
  id?: string;
  title: string;
  location: string;
  region: string;
  difficulty: string;
  distanceKm: number;
  durationHours: number;
  elevationM: number;
  imageUrl?: string;
  gear?: string[];
  lat?: number;
  lng?: number;
  geometry?: {
    type: string;
    coordinates: [number, number];
  };
};

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

function getTourId(t: Partial<Tour> | null | undefined) {
  return String(t?._id ?? t?.id ?? "");
}

function ensureTourImage(t: Tour): Tour {
  if (t.imageUrl && String(t.imageUrl).trim()) return t;
  const idx = hashStringToIndex(getTourId(t) || t.title || "tour", TOUR_IMAGES.length);
  return { ...t, imageUrl: TOUR_IMAGES[idx] };
}

function normalizeText(value: string | null | undefined) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function hasKeywordMatch(value: string | null | undefined, keywords: string[]) {
  const normalized = normalizeText(value);
  return keywords.some((keyword) => normalized.includes(normalizeText(keyword)));
}

/**
 * Demo geo-db (kart). Keys må matche tour.id / _id hvis dere vil bruke denne.
 */
const TOUR_GEO: Record<
  string,
  { center: LatLng; season: string; roundTrip: string; typeText: string; protectedArea: boolean }
> = {
  t1: {
    center: [60.39299, 5.32415],
    season: "Hele året (best vår–høst)",
    roundTrip: "Tur/retur samme vei",
    typeText: "Fottur (fjell/utsikt)",
    protectedArea: false,
  },
  t2: {
    center: [59.9139, 10.7522],
    season: "Vår–høst (fin også på vinter med brodder)",
    roundTrip: "Rundtur (sløyfe)",
    typeText: "By-nær skogstur",
    protectedArea: false,
  },
  t3: {
    center: [62.1015, 7.205],
    season: "Sommer–tidlig høst",
    roundTrip: "Tur/retur samme vei",
    typeText: "Fjelltur (brattere parti)",
    protectedArea: true,
  },
};

function getGeoForTour(tour: Tour | null) {
  if (!tour) return undefined;

  const direct = TOUR_GEO[getTourId(tour)];
  if (direct) return direct;

  if (
    hasKeywordMatch(tour.title, ["fløibanen", "floibanen"]) ||
    hasKeywordMatch(tour.location, ["bergen"])
  ) {
    return TOUR_GEO.t1;
  }

  if (hasKeywordMatch(tour.title, ["oslofjorden"]) || hasKeywordMatch(tour.location, ["oslo"])) {
    return TOUR_GEO.t2;
  }

  if (
    hasKeywordMatch(tour.title, ["geiranger"]) ||
    hasKeywordMatch(tour.location, ["geiranger"])
  ) {
    return TOUR_GEO.t3;
  }

  return undefined;
}

type Review = {
  _id: string;
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

function safeGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function keySaved(tourId: string) {
  return `tour_saved_${tourId}`;
}

function storyForTour(tour: Tour) {
  const id = getTourId(tour);

  const fallback =
    "Dette er en tur som føles som klassisk Norge: tydelig sti, frisk luft og en utsikt som belønner deg for å gå rolig, jevnt og fornuftig. Ta pauser, drikk vann – og la fjellet få siste ordet.";

  const byId: Record<string, string> = {
    t1: "Fløibanen-området er som et gammelt, godt friluftsråd i praksis: du får høyde, skog og utsikt – uten at det blir sirkus. Hold et jevnt tempo, og du blir belønnet med by og fjord under deg. Dette er turen du kan gå mange ganger og likevel finne en ny liten detalj hver gang.",
    t2: "Oslofjorden gjør det lett å være ute: lufta er mild, stiene er tydelige, og du kan gå med den deilige følelsen av at naturen ligger rett ved siden av hverdagen. Dette er en tur for deg som vil ha ro i hodet og fremdrift i beina – uten å måtte ‘prestere’ noe annet enn å møte opp.",
    t3: "Geiranger og fjellene rundt er Norge på sitt mest dramatiske: bratte sider, dype daler, og utsikt som får folk til å bli stille. Her lønner det seg å være tradisjonell: gode sko, litt ekstra klær og respekt for været. Gjør du det enkelt og riktig, får du en tur som sitter i kroppen lenge etterpå.",
  };

  const scenicIntro =
    hasKeywordMatch(tour.title, ["fløibanen", "floibanen"]) || hasKeywordMatch(tour.location, ["bergen"])
      ? byId.t1
      : hasKeywordMatch(tour.title, ["oslofjorden"]) || hasKeywordMatch(tour.location, ["oslo"])
      ? byId.t2
      : hasKeywordMatch(tour.title, ["geiranger"]) || hasKeywordMatch(tour.location, ["geiranger"])
      ? byId.t3
      : byId[id] ?? fallback;

  const diff = tour.difficulty;
  const region = tour.region;

  const diffLine =
    diff === "Lett"
      ? "Passer for en rolig dag, og for folk som liker tur uten drama."
      : diff === "Middels"
      ? "Nok motbakke til at kaffepausen blir fortjent."
      : diff === "Krevende"
      ? "Brattere partier – her er det lurt å ta det kontrollert og ikke jage tempo."
      : "Dette er en tur for sterke bein og god dømmekraft. Ingen skam i å snu.";

  const regionLine =
    region === "Vestlandet"
      ? "Vestlandet kan skifte vær fort – pakk som om fjellet ikke har lest værmeldingen."
      : region === "Nord-Norge"
      ? "Nord-Norge gir deg stor natur og store inntrykk. Ta med ekstra varme."
      : region === "Østlandet"
      ? "Østlandet er ofte stabilt, men undervurder aldri en våt sti i skog."
      : region === "Trøndelag"
      ? "Trøndelag er variert: småpartier som føles lette, før bakkene plutselig mener alvor."
      : "Sørlandet er mer enn svaberg – fine stier og gode pauser underveis.";

  return `${scenicIntro} ${diffLine} ${regionLine}`;
}

function pickLatLngFromTour(tour: Partial<Tour> & Record<string, unknown>): LatLng | null {
  if (
    tour.geometry &&
    typeof tour.geometry === "object" &&
    Array.isArray((tour.geometry as { coordinates?: unknown[] }).coordinates)
  ) {
    const coords = (tour.geometry as { coordinates: [number, number] }).coordinates;
    const [lng, lat] = coords;
    if (typeof lat === "number" && typeof lng === "number") {
      return [lat, lng];
    }
  }

  const lat =
    typeof tour.lat === "number"
      ? tour.lat
      : typeof tour.latitude === "number"
      ? (tour.latitude as number)
      : typeof (tour.coords as { lat?: number } | undefined)?.lat === "number"
      ? (tour.coords as { lat: number }).lat
      : typeof (tour.coordinates as { lat?: number } | undefined)?.lat === "number"
      ? (tour.coordinates as { lat: number }).lat
      : null;

  const lng =
    typeof tour.lng === "number"
      ? tour.lng
      : typeof tour.lon === "number"
      ? (tour.lon as number)
      : typeof tour.longitude === "number"
      ? (tour.longitude as number)
      : typeof (tour.coords as { lng?: number } | undefined)?.lng === "number"
      ? (tour.coords as { lng: number }).lng
      : typeof (tour.coordinates as { lng?: number } | undefined)?.lng === "number"
      ? (tour.coordinates as { lng: number }).lng
      : null;

  if (typeof lat === "number" && typeof lng === "number") return [lat, lng];
  return null;
}

export default function TourDetailsPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const authToken = token || safeGet("token") || safeGet("auth_token");

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState("");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    async function loadTour() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:4000/tours/${id}`);

        if (!response.ok) {
          setTour(null);
          return;
        }

        const data = await response.json();
        setTour(ensureTourImage(data));
      } catch (error) {
        console.error("Kunne ikke hente tur:", error);
        setTour(null);
      } finally {
        setLoading(false);
      }
    }

    loadTour();
  }, [id]);

  const tid = String(getTourId(tour) || id || "");

  const geo = useMemo(() => {
    return getGeoForTour(tour);
  }, [tour]);

  const mapCenter = useMemo<LatLng>(() => {
    if (!tour) return [60.472, 8.468];
    const fromTour = pickLatLngFromTour(tour as Partial<Tour> & Record<string, unknown>);
    if (fromTour) return fromTour;
    if (geo?.center) return geo.center;
    return [60.472, 8.468];
  }, [tour, geo]);

  const gear: string[] = useMemo(() => {
    if (!tour) return [];
    return Array.isArray(tour.gear) ? tour.gear : [];
  }, [tour]);

  const isLoggedIn = useMemo(() => {
    const localUser = safeGet("user") || safeGet("auth_user");
    return Boolean(user || authToken || localUser);
  }, [authToken, user]);

  useEffect(() => {
    if (!tour) return;

    setSaved(safeGet(keySaved(tid)) === "1");

    async function loadReviews() {
      try {
        const res = await fetch(`http://localhost:4000/reviews/${tid}`);

        if (!res.ok) {
          setReviews([]);
          return;
        }

        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Kunne ikke hente anmeldelser:", error);
        setReviews([]);
      }
    }

    loadReviews();
  }, [tour, tid]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  async function handleRegister() {
    if (!authToken) {
      setRegisterMessage("Du må logge inn på nytt for å melde deg på.");
      return;
    }

    if (!tour) {
      alert("Fant ikke tur.");
      return;
    }

    const tourId = getTourId(tour);

    if (!tourId) {
      alert("Fant ikke tur-ID.");
      return;
    }

    try {
      setRegistering(true);
      setRegisterMessage("");

      const response = await fetch("http://localhost:4000/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          tourId,
          selectedDate: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Kunne ikke melde deg på");
      }

      setRegisterMessage("Du er nå påmeldt turen 🎉");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kunne ikke melde deg på";
      setRegisterMessage(message);
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-gray-50">
        <section className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-gray-600">Laster tur...</p>
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

  const imageUrl = tour.imageUrl || "/images/trip-card-placeholder.jpg";

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: tour.title, url });
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
    <name>${tour.title}</name>
  </wpt>
</gpx>`;

    const blob = new Blob([gpx], { type: "application/gpx+xml" });
    const a = document.createElement("a");
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = `${String(tour.title).replaceAll(" ", "_")}.gpx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  }

  async function submitReview() {
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

    try {
      const res = await fetch("http://localhost:4000/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tourId: tid,
          name,
          rating,
          text,
        }),
      });

      if (!res.ok) {
        alert("Kunne ikke lagre anmeldelse.");
        return;
      }

      const savedReview = (await res.json()) as Review;
      setReviews((prev) => [savedReview, ...prev]);

      setReviewName("");
      setReviewText("");
      setReviewRating(5);
    } catch (error) {
      console.error("Kunne ikke sende anmeldelse:", error);
      alert("Noe gikk galt.");
    }
  }

  return (
    <main className="bg-gray-50">
      <section className="relative h-[38vh] min-h-[320px]">
        <img src={imageUrl} alt={tour.title} className="absolute inset-0 h-full w-full object-cover" />
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
                {tour.difficulty}
              </span>

              <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-gray-900">
                {tour.region}
              </span>

              {avgRating !== null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-900">
                  <Star className="h-4 w-4" /> {avgRating}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl">{tour.title}</h1>

            <div className="mt-2 flex items-center gap-2 text-white/85">
              <MapPin className="h-4 w-4" />
              <p className="text-sm">{tour.location}</p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {!isLoggedIn ? (
                <Link
                  to="/login"
                  className="inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Logg inn for å melde deg på
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={registering}
                  className="inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {registering ? "Melder deg på..." : "Meld deg på"}
                </button>
              )}

              {registerMessage && (
                <div className="rounded-xl bg-white/90 px-4 py-3 text-sm font-medium text-gray-900">
                  {registerMessage}
                </div>
              )}
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
              <div className="mt-1 text-2xl font-semibold text-gray-900">{tour.distanceKm} km</div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-emerald-700" />
                <span>Varighet</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{tour.durationHours} t</div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mountain className="h-4 w-4 text-emerald-700" />
                <span>Stigning</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{tour.elevationM} m</div>
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
                    <div className="font-semibold">{tour.location}</div>
                    <div className="text-sm text-gray-500">{tour.region}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Footprints className="h-5 w-5 text-emerald-700" />
                  <div>
                    <div className="font-semibold">{geo?.typeText ?? "Fottur"}</div>
                    <div className="text-sm text-gray-500">{tour.difficulty}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Repeat className="h-5 w-5 text-emerald-700" />
                  <div>
                    <div className="font-semibold">{geo?.roundTrip ?? "Tur/retur samme vei"}</div>
                    <div className="text-sm text-gray-500">Rute</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-emerald-700" />
                  <div>
                    <div className="font-semibold">{geo?.season ?? "Hele året (væravhengig)"}</div>
                    <div className="text-sm text-gray-500">Sesong</div>
                  </div>
                </div>
              </div>

              <p className="mt-6 leading-relaxed text-gray-700">{storyForTour(tour)}</p>

              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="text-sm font-semibold text-emerald-900">
                  {geo?.protectedArea ? "Denne turen går i vernede områder!" : "Turvett (klassisk og smart)"}
                </div>
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

            <TurMap center={mapCenter} title={tour.title} />

            {!geo && (
              <div className="mt-3 text-xs text-gray-500">
                Demo: Denne turen bruker foreløpig standard kartinnstillinger. Legg inn turens id{" "}
                (<span className="font-mono">{tid}</span>) i <span className="font-mono">TOUR_GEO</span> for mer
                presis sesong-, rute- og typeinformasjon.
              </div>
            )}
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
                  <div key={r._id} className="rounded-2xl border border-gray-100 bg-white p-5">
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
