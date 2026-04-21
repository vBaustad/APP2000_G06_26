/**
 * Fil: OpprettTur.tsx
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse:
 * Side for oppretting av turer i Utopia. Admin velger tittel, beskrivelse,
 * turtype, eksisterende turstier (i rekkefølge) og eventuelle hytter
 * underveis. Datoer for fellestur håndteres i et eget steg senere.
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, Polyline, TileLayer, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CheckCircle2,
  House,
  PencilLine,
  Plus,
  Route,
  Search,
  Undo2,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).toString(),
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).toString(),
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).toString(),
});

type TurstiPunkt = {
  lat: number | string;
  lng: number | string;
};

type Tursti = {
  id: number;
  navn: string;
  beskrivelse: string | null;
  vanskelighetsgrad: string | null;
  hoydemeter: number | null;
  lengde_km: number | string | null;
  omrade: string | null;
  tursti_punkt?: TurstiPunkt[];
};

type Hytte = {
  id: number;
  navn: string;
  omrade: string | null;
  betjent: "betjent" | "selvbetjent" | "ubetjent" | null;
  lat: number | string | null;
  lng: number | string | null;
};

const HYTTE_RADIUS_KM = 10;

function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const sLat1 = Math.sin(dLat / 2) ** 2;
  const sLng1 = Math.sin(dLng / 2) ** 2;
  const h =
    sLat1 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * sLng1;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const TYPER = [
  { verdi: "fottur", label: "Fottur" },
  { verdi: "sykkel", label: "Sykkel" },
  { verdi: "ski", label: "Ski" },
] as const;

const VANSKELIGHETSGRADER = ["Lett", "Middels", "Krevende", "Ekspert"] as const;

export default function OpprettTur() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [tittel, setTittel] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [type, setType] = useState("");
  const [vanskelighetsgrad, setVanskelighetsgrad] = useState("");
  const [omrade, setOmrade] = useState("");
  const [antallNetter, setAntallNetter] = useState("");

  const [turstier, setTurstier] = useState<Tursti[]>([]);
  const [hytter, setHytter] = useState<Hytte[]>([]);
  const [valgteTurstier, setValgteTurstier] = useState<number[]>([]);
  const [valgteHytter, setValgteHytter] = useState<number[]>([]);

  const [turstiSok, setTurstiSok] = useState("");
  const [hytteSok, setHytteSok] = useState("");
  const [visAlleHytter, setVisAlleHytter] = useState(false);

  const [tegneModalOpen, setTegneModalOpen] = useState(false);
  const [tegnePunkter, setTegnePunkter] = useState<[number, number][]>([]);
  const [tegneNavn, setTegneNavn] = useState("");
  const [tegneBeskrivelse, setTegneBeskrivelse] = useState("");
  const [tegneVanskelighet, setTegneVanskelighet] = useState("");
  const [tegneOmrade, setTegneOmrade] = useState("");
  const [tegneBusy, setTegneBusy] = useState(false);
  const [tegneFeil, setTegneFeil] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/turstier`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Tursti[]) => setTurstier(Array.isArray(d) ? d : []))
      .catch(() => setTurstier([]));

    fetch(`${import.meta.env.VITE_API_URL}/api/hytter`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Hytte[]) => setHytter(Array.isArray(d) ? d : []))
      .catch(() => setHytter([]));
  }, []);

  const valgteTurstiData = useMemo(
    () =>
      valgteTurstier
        .map((id) => turstier.find((t) => t.id === id))
        .filter((t): t is Tursti => Boolean(t)),
    [valgteTurstier, turstier],
  );

  const valgteHytteData = useMemo(
    () =>
      valgteHytter
        .map((id) => hytter.find((h) => h.id === id))
        .filter((h): h is Hytte => Boolean(h)),
    [valgteHytter, hytter],
  );

  const filtrerteTurstier = useMemo(() => {
    const q = turstiSok.trim().toLowerCase();
    if (!q) return turstier;
    return turstier.filter((t) =>
      `${t.navn} ${t.omrade ?? ""}`.toLowerCase().includes(q),
    );
  }, [turstier, turstiSok]);

  const valgtePunkter = useMemo(() => {
    const punkter: { lat: number; lng: number }[] = [];
    for (const t of valgteTurstiData) {
      for (const p of t.tursti_punkt ?? []) {
        const lat = Number(p.lat);
        const lng = Number(p.lng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          punkter.push({ lat, lng });
        }
      }
    }
    return punkter;
  }, [valgteTurstiData]);

  const hytterINaerheten = useMemo(() => {
    if (visAlleHytter || valgtePunkter.length === 0) return hytter;
    return hytter.filter((h) => {
      if (h.lat === null || h.lng === null) return false;
      const hLat = Number(h.lat);
      const hLng = Number(h.lng);
      if (!Number.isFinite(hLat) || !Number.isFinite(hLng)) return false;
      return valgtePunkter.some(
        (p) => haversineKm(hLat, hLng, p.lat, p.lng) <= HYTTE_RADIUS_KM,
      );
    });
  }, [hytter, valgtePunkter, visAlleHytter]);

  const filtrerteHytter = useMemo(() => {
    const q = hytteSok.trim().toLowerCase();
    if (!q) return hytterINaerheten;
    return hytterINaerheten.filter((h) =>
      `${h.navn} ${h.omrade ?? ""}`.toLowerCase().includes(q),
    );
  }, [hytterINaerheten, hytteSok]);

  function toggleTursti(id: number) {
    setValgteTurstier((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleHytte(id: number) {
    setValgteHytter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const tegneLengdeKm = useMemo(() => {
    let sum = 0;
    for (let i = 1; i < tegnePunkter.length; i++) {
      sum += haversineKm(
        tegnePunkter[i - 1][0],
        tegnePunkter[i - 1][1],
        tegnePunkter[i][0],
        tegnePunkter[i][1],
      );
    }
    return sum;
  }, [tegnePunkter]);

  useEffect(() => {
    if (!tegneModalOpen) return;
    const forrige = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !tegneBusy) {
        lukkTegneModal();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = forrige;
    };
  }, [tegneModalOpen, tegneBusy]);

  function apneTegneModal() {
    setTegnePunkter([]);
    setTegneNavn("");
    setTegneBeskrivelse("");
    setTegneVanskelighet("");
    setTegneOmrade("");
    setTegneFeil(null);
    setTegneModalOpen(true);
  }

  function lukkTegneModal() {
    if (tegneBusy) return;
    setTegneModalOpen(false);
    setTegneFeil(null);
  }

  async function handleLagreTursti() {
    if (!token) {
      setTegneFeil("Du må være innlogget.");
      return;
    }
    if (!tegneNavn.trim()) {
      setTegneFeil("Navn er påkrevd.");
      return;
    }
    if (tegnePunkter.length < 2) {
      setTegneFeil("Klikk i kartet for å legge til minst to punkter.");
      return;
    }

    setTegneBusy(true);
    setTegneFeil(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/turstier`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          navn: tegneNavn.trim(),
          beskrivelse: tegneBeskrivelse.trim() || null,
          vanskelighetsgrad: tegneVanskelighet || null,
          omrade: tegneOmrade.trim() || null,
          punkter: tegnePunkter.map(([lat, lng]) => ({ lat, lng })),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | (Tursti & { error?: string })
        | null;
      if (!res.ok || !data || typeof data.id !== "number") {
        setTegneFeil(data?.error || "Kunne ikke lagre turstien.");
        return;
      }
      setTurstier((prev) => [...prev, data]);
      setValgteTurstier((prev) => [...prev, data.id]);
      setTegneModalOpen(false);
    } catch {
      setTegneFeil("Nettverksfeil. Prøv igjen.");
    } finally {
      setTegneBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      setError("Du må være innlogget for å opprette tur.");
      return;
    }
    if (!tittel.trim()) {
      setError("Tittel er påkrevd.");
      return;
    }
    if (valgteTurstier.length === 0) {
      setError("Velg minst én tursti.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/turer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tittel: tittel.trim(),
          beskrivelse: beskrivelse.trim() || null,
          type: type || null,
          vanskelighetsgrad: vanskelighetsgrad || null,
          omrade: omrade.trim() || null,
          antall_netter: antallNetter || null,
          status: "published",
          tursti_ids: valgteTurstier,
          hytte_ids: valgteHytter,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { id?: number; error?: string }
        | null;

      if (!res.ok) {
        setError(data?.error || "Kunne ikke opprette turen.");
        return;
      }

      if (data?.id) {
        navigate(`/turer/${data.id}`);
      } else {
        navigate("/turer");
      }
    } catch {
      setError("Nettverksfeil. Prøv igjen.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <main className="bg-slate-100">
        <section className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">Opprett tur</h1>
            <p className="mt-4 text-slate-600">
              Du må være innlogget for å opprette en tur.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-slate-100 text-slate-900">
      <section className="bg-[#17331C] text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 md:py-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Turregistrering
          </p>
          <h1 className="text-4xl font-semibold md:text-5xl">Opprett tur</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/85">
            Registrer en ny tur med turstier og eventuelle hytter underveis.
            Datoer for fellestur legges til senere.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Grunnleggende</h2>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Turtittel *
              </label>
              <input
                type="text"
                required
                value={tittel}
                onChange={(e) => setTittel(e.target.value)}
                placeholder="For eksempel Hardangervidda på tvers"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f3d2e]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Beskrivelse
              </label>
              <textarea
                rows={4}
                value={beskrivelse}
                onChange={(e) => setBeskrivelse(e.target.value)}
                placeholder="Beskriv turen kort"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f3d2e]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f3d2e]"
                >
                  <option value="">Velg type…</option>
                  {TYPER.map((t) => (
                    <option key={t.verdi} value={t.verdi}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Vanskelighetsgrad
                </label>
                <select
                  value={vanskelighetsgrad}
                  onChange={(e) => setVanskelighetsgrad(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f3d2e]"
                >
                  <option value="">Velg vanskelighetsgrad…</option>
                  {VANSKELIGHETSGRADER.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Område
                </label>
                <input
                  type="text"
                  value={omrade}
                  onChange={(e) => setOmrade(e.target.value)}
                  placeholder="f.eks. Hardangervidda"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f3d2e]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Antall netter
                </label>
                <input
                  type="number"
                  min={0}
                  value={antallNetter}
                  onChange={(e) => setAntallNetter(e.target.value)}
                  placeholder="0 for dagstur"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0f3d2e]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Route className="h-5 w-5 text-[#0f3d2e]" />
                <h2 className="text-xl font-semibold text-slate-900">Turstier *</h2>
              </div>

              <button
                type="button"
                onClick={apneTegneModal}
                className="inline-flex items-center gap-2 rounded-xl border border-[#0f3d2e] bg-white px-3 py-2 text-sm font-semibold text-[#0f3d2e] hover:bg-[#eef5f1]"
              >
                <PencilLine className="h-4 w-4" />
                Tegn ny tursti
              </button>
            </div>
            <p className="text-sm text-slate-600">
              Søk og klikk for å velge. Rekkefølgen følger klikk-rekkefølgen.
            </p>

            {valgteTurstiData.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {valgteTurstiData.map((t, i) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-2 rounded-full bg-[#eef5f1] px-3 py-1 text-sm text-[#0f3d2e] ring-1 ring-[#dcebe4]"
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0f3d2e] text-xs font-semibold text-white">
                      {i + 1}
                    </span>
                    {t.navn}
                    <button
                      type="button"
                      onClick={() => toggleTursti(t.id)}
                      className="ml-1 text-[#0f3d2e] hover:text-slate-900"
                      aria-label={`Fjern ${t.navn}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {turstier.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                Ingen turstier er registrert i databasen ennå.
              </p>
            ) : (
              <>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={turstiSok}
                    onChange={(e) => setTurstiSok(e.target.value)}
                    placeholder="Søk etter tursti eller område"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 pl-9 text-sm outline-none focus:border-[#0f3d2e]"
                  />
                </div>

                <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                  {filtrerteTurstier.length === 0 ? (
                    <li className="p-3 text-center text-sm text-slate-500">
                      Ingen treff.
                    </li>
                  ) : (
                    filtrerteTurstier.map((t) => {
                      const valgt = valgteTurstier.includes(t.id);
                      return (
                        <li key={t.id}>
                          <label
                            className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition ${
                              valgt ? "bg-[#eef5f1]" : "hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={valgt}
                              onChange={() => toggleTursti(t.id)}
                              className="h-4 w-4"
                            />
                            <span className="flex-1 font-medium text-slate-900">
                              {t.navn}
                            </span>
                            <span className="text-xs text-slate-500">
                              {[
                                t.omrade,
                                t.lengde_km !== null
                                  ? `${Number(t.lengde_km)} km`
                                  : null,
                                t.vanskelighetsgrad,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </label>
                        </li>
                      );
                    })
                  )}
                </ul>
              </>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <House className="h-5 w-5 text-[#0f3d2e]" />
                <h2 className="text-xl font-semibold text-slate-900">
                  Hytter underveis
                </h2>
              </div>

              {valgtePunkter.length > 0 && (
                <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={visAlleHytter}
                    onChange={(e) => setVisAlleHytter(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Vis alle hytter (ikke bare i nærheten)
                </label>
              )}
            </div>
            <p className="text-sm text-slate-600">
              Valgfritt. Viser hytter innen {HYTTE_RADIUS_KM} km fra valgte
              turstier. Rekkefølgen følger klikk-rekkefølgen.
            </p>

            {valgteHytteData.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {valgteHytteData.map((h, i) => (
                  <span
                    key={h.id}
                    className="inline-flex items-center gap-2 rounded-full bg-[#eef5f1] px-3 py-1 text-sm text-[#0f3d2e] ring-1 ring-[#dcebe4]"
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0f3d2e] text-xs font-semibold text-white">
                      {i + 1}
                    </span>
                    {h.navn}
                    <button
                      type="button"
                      onClick={() => toggleHytte(h.id)}
                      className="ml-1 text-[#0f3d2e] hover:text-slate-900"
                      aria-label={`Fjern ${h.navn}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {hytter.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                Ingen hytter er registrert i databasen ennå.
              </p>
            ) : valgtePunkter.length === 0 && !visAlleHytter ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                Velg en tursti først, eller huk av "Vis alle hytter".
              </p>
            ) : (
              <>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={hytteSok}
                    onChange={(e) => setHytteSok(e.target.value)}
                    placeholder="Søk etter hytte eller område"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 pl-9 text-sm outline-none focus:border-[#0f3d2e]"
                  />
                </div>

                <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                  {filtrerteHytter.length === 0 ? (
                    <li className="p-3 text-center text-sm text-slate-500">
                      Ingen treff.
                    </li>
                  ) : (
                    filtrerteHytter.map((h) => {
                      const valgt = valgteHytter.includes(h.id);
                      return (
                        <li key={h.id}>
                          <label
                            className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition ${
                              valgt ? "bg-[#eef5f1]" : "hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={valgt}
                              onChange={() => toggleHytte(h.id)}
                              className="h-4 w-4"
                            />
                            <span className="flex-1 font-medium text-slate-900">
                              {h.navn}
                            </span>
                            <span className="text-xs text-slate-500">
                              {[h.omrade, h.betjent]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </label>
                        </li>
                      );
                    })
                  )}
                </ul>
              </>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-[#0f3d2e] px-6 py-3 font-medium text-white transition hover:bg-[#12351d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              {submitting ? "Oppretter..." : "Opprett tur"}
            </button>
          </div>
        </form>
      </section>

      {tegneModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={lukkTegneModal}
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <PencilLine className="h-5 w-5 text-[#0f3d2e]" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Tegn ny tursti
                </h3>
              </div>
              <button
                type="button"
                onClick={lukkTegneModal}
                aria-label="Lukk"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-6 md:grid-cols-[1.3fr_1fr]">
              <div className="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200">
                <MapContainer
                  center={[61.5, 8.8] as LatLngExpression}
                  zoom={5}
                  scrollWheelZoom
                  className="h-full min-h-[320px] w-full"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap-bidragsytere"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <ClickHandler
                    onPick={(lat, lng) =>
                      setTegnePunkter((prev) => [...prev, [lat, lng]])
                    }
                  />
                  {tegnePunkter.map((p, i) => (
                    <Marker key={i} position={p} />
                  ))}
                  {tegnePunkter.length >= 2 && (
                    <Polyline positions={tegnePunkter} color="#0f3d2e" />
                  )}
                </MapContainer>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Navn *
                  </label>
                  <input
                    type="text"
                    value={tegneNavn}
                    onChange={(e) => setTegneNavn(e.target.value)}
                    placeholder="f.eks. Finsehytta → Krækkja"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-[#0f3d2e]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Vanskelighetsgrad
                  </label>
                  <select
                    value={tegneVanskelighet}
                    onChange={(e) => setTegneVanskelighet(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-[#0f3d2e]"
                  >
                    <option value="">Ikke satt</option>
                    {VANSKELIGHETSGRADER.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Område
                  </label>
                  <input
                    type="text"
                    value={tegneOmrade}
                    onChange={(e) => setTegneOmrade(e.target.value)}
                    placeholder="f.eks. Hardangervidda"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-[#0f3d2e]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Beskrivelse
                  </label>
                  <textarea
                    rows={3}
                    value={tegneBeskrivelse}
                    onChange={(e) => setTegneBeskrivelse(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-[#0f3d2e]"
                  />
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="font-semibold">{tegnePunkter.length}</span>{" "}
                      {tegnePunkter.length === 1 ? "punkt" : "punkter"}
                    </span>
                    {tegnePunkter.length >= 2 && (
                      <span className="font-semibold">
                        {tegneLengdeKm.toFixed(1)} km
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Klikk i kartet for å legge til punkter langs stien.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTegnePunkter((prev) => prev.slice(0, -1))}
                    disabled={tegnePunkter.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    Angre siste
                  </button>
                  <button
                    type="button"
                    onClick={() => setTegnePunkter([])}
                    disabled={tegnePunkter.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Tøm alle
                  </button>
                </div>

                {tegneFeil && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {tegneFeil}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={lukkTegneModal}
                disabled={tegneBusy}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={handleLagreTursti}
                disabled={tegneBusy}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-5 py-2 text-sm font-semibold text-white hover:bg-[#12351d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {tegneBusy ? "Lagrer..." : "Lagre tursti"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
