/**
 * Fil: TourDetailsPage.tsx
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse: Detaljside for én tur (åpnes "Se mer").
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mockTours, type Tour } from "../utils/mockTours";
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

/**
 * Demo geo-db (kart). Keys må matche tour.id
 * Legg gjerne inn flere id’er etter hvert.
 */
const TOUR_GEO: Record<
  string,
  { center: LatLng; season: string; roundTrip: string; typeText: string; protectedArea: boolean }
> = {
  "1": {
    center: [60.39299, 5.32415],
    season: "Hele året (best vår–høst)",
    roundTrip: "Tur/retur samme vei",
    typeText: "Fottur (fjell/utsikt)",
    protectedArea: false,
  },
  "2": {
    center: [59.9139, 10.7522],
    season: "Vår–høst (fin også på vinter med brodder)",
    roundTrip: "Rundtur (sløyfe)",
    typeText: "By-nær skogstur",
    protectedArea: false,
  },
  "3": {
    center: [62.1015, 7.205],
    season: "Sommer–tidlig høst",
    roundTrip: "Tur/retur samme vei",
    typeText: "Fjelltur (brattere parti)",
    protectedArea: true,
  },
};

type Review = {
  id: string;
  name: string;
  rating: number; // 1-5
  text: string;
  createdAt: string; // ISO
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
  const id = String((tour as any).id ?? "");

  const fallback =
    "Dette er en tur som føles som klassisk Norge: tydelig sti, frisk luft og en utsikt som belønner deg for å gå rolig, jevnt og fornuftig. Ta pauser, drikk vann – og la fjellet få siste ordet.";

  const byId: Record<string, string> = {
    "1":
      "Fløibanen-området er som et gammelt, godt friluftsråd i praksis: du får høyde, skog og utsikt – uten at det blir sirkus. Hold et jevnt tempo, og du blir belønnet med by og fjord under deg. Dette er turen du kan gå mange ganger og likevel finne en ny liten detalj hver gang.",
    "2":
      "Oslofjorden gjør det lett å være ute: lufta er mild, stiene er tydelige, og du kan gå med den deilige følelsen av at naturen ligger rett ved siden av hverdagen. Dette er en tur for deg som vil ha ro i hodet og fremdrift i beina – uten å måtte ‘prestere’ noe annet enn å møte opp.",
    "3":
      "Geiranger og fjellene rundt er Norge på sitt mest dramatiske: bratte sider, dype daler, og utsikt som får folk til å bli stille. Her lønner det seg å være tradisjonell: gode sko, litt ekstra klær og respekt for været. Gjør du det enkelt og riktig, får du en tur som sitter i kroppen lenge etterpå.",
  };

  const diff = (tour as any).difficulty;
  const region = (tour as any).region;

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

  return `${byId[id] ?? fallback} ${diffLine} ${regionLine}`;
}

/** Prøv å hente lat/lng fra tour hvis dere har det i mockTours */
function pickLatLngFromTour(tour: any): LatLng | null {
  const lat = tour?.lat ?? tour?.latitude ?? tour?.coords?.lat ?? tour?.coordinates?.lat;
  const lng = tour?.lng ?? tour?.lon ?? tour?.longitude ?? tour?.coords?.lng ?? tour?.coordinates?.lng;

  if (typeof lat === "number" && typeof lng === "number") return [lat, lng];
  return null;
}

export default function TourDetailsPage() {
  const { id } = useParams();

  const tour = useMemo(() => {
    if (!id) return null;
    const found = mockTours.find((x) => String((x as any).id) === String(id));
    return found ? ensureTourImage(found) : null;
  }, [id]);

  const tid = String((tour as any)?.id ?? id ?? "");

  const geo = useMemo(() => {
    if (!tour) return undefined;
    return TOUR_GEO[String((tour as any).id)];
  }, [tour]);

  // Kart: alltid ha et senter, selv om TOUR_GEO mangler (som id=9)
  const mapCenter = useMemo<LatLng>(() => {
    if (!tour) return [60.472, 8.468]; // Norge-ish fallback
    const fromTour = pickLatLngFromTour(tour as any);
    if (fromTour) return fromTour;
    if (geo?.center) return geo.center;
    return [60.472, 8.468];
  }, [tour, geo?.center]);

  const gear: string[] = useMemo(() => {
    if (!tour) return [];
    const g = (tour as any).gear;
    return Array.isArray(g) ? g : [];
  }, [tour]);

  // Saved
  const [saved, setSaved] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  //  “Logg inn for å poste” (enkelt). Tilpass nøkkel etter deres auth senere.
  const isLoggedIn = useMemo(() => {
    const token = safeGet("token") || safeGet("auth_token");
    const user = safeGet("user") || safeGet("auth_user");
    return Boolean(token || user);
  }, []);

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

  if (!tour) {
    return (
      <main className="bg-gray-50 min-h-[70vh]">
        <section className="mx-auto max-w-7xl px-6 py-10">
          <Link to="/explore" className="text-sm font-semibold text-emerald-700 hover:underline">
            ← Tilbake til Utforsk
          </Link>

          <div className="mt-6 rounded-2xl bg-white border border-gray-100 shadow p-6">
            <h1 className="text-2xl font-semibold">Fant ikke tur</h1>
            <p className="mt-2 text-gray-600">
              Vi fant ingen tur{ id ? <> med id: <span className="font-mono">{id}</span></> : <> (mangler id i URL)</> }
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
      {/* HERO */}
      <section className="relative h-[38vh] min-h-[320px]">
        <img src={imageUrl} alt={(tour as any).title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 h-full">
          <div className="mx-auto max-w-7xl h-full px-6 flex flex-col justify-end pb-10">
            <Link to="/explore" className="mb-5 inline-flex w-fit text-sm font-semibold text-white/90 hover:underline">
              ← Tilbake til Utforsk
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900 shadow-sm">
                {(tour as any).difficulty}
              </span>
              <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-gray-900">
                {(tour as any).region}
              </span>
              {avgRating !== null && (
                <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-900 inline-flex items-center gap-1">
                  <Star className="h-4 w-4" /> {avgRating}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-white text-4xl md:text-5xl font-semibold">{(tour as any).title}</h1>

            <div className="mt-2 flex items-center gap-2 text-white/85">
              <MapPin className="h-4 w-4" />
              <p className="text-sm">{(tour as any).location}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* TOP STATS */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Route className="h-4 w-4 text-emerald-700" />
                <span>Distanse</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{(tour as any).distanceKm} km</div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Clock className="h-4 w-4 text-emerald-700" />
                <span>Varighet</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{(tour as any).durationHours} t</div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Mountain className="h-4 w-4 text-emerald-700" />
                <span>Stigning</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{(tour as any).elevationM} m</div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Star className="h-4 w-4 text-emerald-700" />
                <span>Vurdering</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{avgRating ?? "N/A"}</div>
            </div>
          </div>
        </div>

        {/* Om turen + kart */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white border border-gray-100 shadow p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-emerald-200 text-emerald-700">
                  i
                </span>
                Om turen
              </h2>

              <div className="mt-5 space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-emerald-700 mt-0.5" />
                  <div>
                    <div className="font-semibold">{(tour as any).location}</div>
                    <div className="text-sm text-gray-500">{(tour as any).region}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Footprints className="h-5 w-5 text-emerald-700" />
                  <div>
                    <div className="font-semibold">{geo?.typeText ?? "Fottur"}</div>
                    <div className="text-sm text-gray-500">{(tour as any).difficulty}</div>
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

              <p className="mt-6 text-gray-700 leading-relaxed">{storyForTour(tour)}</p>

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

          {/* Right (Kart) */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow p-4">
            <div className="flex items-center justify-between mb-3">
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

            {/* ALLTID kart */}
            <TurMap center={mapCenter} title={(tour as any).title} />

            {!geo && (
              <div className="mt-3 text-xs text-gray-500">
                Tips: Legg inn turens id (<span className="font-mono">{tid}</span>) i <span className="font-mono">TOUR_GEO</span> for riktig sesong/rute-tekst.
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-10 rounded-2xl bg-white border border-gray-100 shadow p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-emerald-700" />
              <h2 className="text-xl font-semibold">Anmeldelser</h2>
              <span className="ml-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{reviews.length}</span>
            </div>
          </div>

          {/* Skriv anmeldelse */}
          <div className="mt-6">
            <div className="text-sm font-semibold text-gray-900">Skriv en anmeldelse</div>

            {!isLoggedIn ? (
              <div className="mt-3 rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-600 bg-gray-50">
                Logg inn for å legge igjen en anmeldelse.
                <div className="mt-3">
                  <Link to="/login" className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                    Logg inn
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Navn (valgfritt)"
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm flex items-center justify-between">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" onClick={() => setReviewRating(n)} title={`${n} stjerner`} className="p-1">
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
                  className="mt-3 w-full min-h-[110px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </>
            )}
          </div>

          {/* Hva andre sier */}
          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="text-sm font-semibold text-gray-900">Hva andre sier</div>

            {reviews.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-600 bg-gray-50">
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

                    <p className="mt-3 text-sm text-gray-700 leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flyttet actions: kommer ETTER "Hva andre sier" */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-100 pt-5">
            <div className="text-xs text-gray-500">Lagret lokalt (demo) • Tur-ID: {tid}</div>

            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSave}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-gray-50 ${
                  saved ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700" : "bg-white border-gray-200"
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
