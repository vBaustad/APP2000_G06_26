/**
 * Fil: MineHytter.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: CRUD for oppretting, redigering og sletting av hytter for brukere med rolle hytteeier
 */
import { FASILITET_KODER } from "../data/fasiliteter";
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Banknote,
  Bed,
  House,
  Image as ImageIcon,
  MapPin,
  Mountain,
  Pencil,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const defaultIcon = L.icon({
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).toString(),
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).toString(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = defaultIcon;

type BetjentValue = "betjent" | "selvbetjent" | "ubetjent";

const BETJENT_LABELS: Record<BetjentValue, string> = {
  betjent: "Betjent",
  selvbetjent: "Selvbetjent",
  ubetjent: "Ubetjent",
};

type Cabin = {
  id: number;
  navn: string;
  beskrivelse: string | null;
  omrade: string | null;
  adresse: string | null;
  kapasitet_senger: number;
  maks_gjester: number | null;
  pris_per_natt: number | string | null;
  regler: string | null;
  lat: number | string | null;
  lng: number | string | null;
  hoyde_m: number | null;
  betjent: BetjentValue | null;
  bilde_url: string | null;
  hytte_fasilitet?: { kode: string }[];
};

type CabinFormState = {
  navn: string;
  beskrivelse: string;
  omrade: string;
  adresse: string;
  kapasitet_senger: string;
  maks_gjester: string;
  pris_per_natt: string;
  regler: string;
  lat: string;
  lng: string;
  hoyde_m: string;
  betjent: string;
  bilde_url: string;
};

const initialForm: CabinFormState = {
  navn: "",
  beskrivelse: "",
  omrade: "",
  adresse: "",
  kapasitet_senger: "1",
  maks_gjester: "",
  pris_per_natt: "",
  regler: "",
  lat: "",
  lng: "",
  hoyde_m: "",
  betjent: "",
  bilde_url: "",
};

const API_BASE = `${import.meta.env.VITE_API_URL}/api/hytter`;

function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${import.meta.env.VITE_API_URL}${url}`;
  return url;
}

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-[#0f8f5b] focus:ring-2 focus:ring-[#dcebe4]";
const labelClass = "text-sm font-medium text-slate-700";
const sectionEyebrowClass =
  "text-xs font-semibold uppercase tracking-[0.18em] text-[#0f3d2e]";

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ position }: { position: LatLngExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, Math.max(map.getZoom(), 10), { duration: 0.4 });
    }
  }, [position, map]);
  return null;
}

function LocationPicker({
  lat,
  lng,
  onPick,
}: {
  lat: string;
  lng: string;
  onPick: (lat: number, lng: number) => void;
}) {
  const position: LatLngExpression | null =
    lat && lng && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))
      ? [Number(lat), Number(lng)]
      : null;

  return (
    <MapContainer
      center={position ?? [61.5, 8.8]}
      zoom={position ? 10 : 5}
      scrollWheelZoom
      className="h-64 w-full overflow-hidden rounded-2xl border border-slate-200"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap-bidragsytere"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      <Recenter position={position} />
      {position && <Marker position={position} />}
    </MapContainer>
  );
}

export default function MineHytter() {
  const { user, token } = useAuth();
  const isHytteeier = useMemo(() => user?.roller?.includes("hytteeier") ?? false, [user]);

  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [form, setForm] = useState<CabinFormState>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFasiliteter, setSelectedFasiliteter] = useState<string[]>([])

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(resolveImageUrl(form.bilde_url));
  }, [selectedFile, form.bilde_url]);

  useEffect(() => {
    if (token && isHytteeier) {
      loadCabins();
    }
  }, [token, isHytteeier]);

  useEffect(() => {
    if (!modalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [modalOpen]);

  async function loadCabins() {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Kunne ikke hente hytter");
      }
      const data = (await res.json()) as Cabin[];
      setCabins(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt");
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(initialForm);
    setSelectedFile(null);
    setError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
    setSelectedFile(null);
    setError(null);
    setSelectedFasiliteter([]);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleMapPick(lat: number, lng: number) {
    setForm((prev) => ({ ...prev, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      navn: form.navn,
      beskrivelse: form.beskrivelse || null,
      omrade: form.omrade || null,
      adresse: form.adresse || null,
      kapasitet_senger: form.kapasitet_senger ? Number(form.kapasitet_senger) : 1,
      maks_gjester: form.maks_gjester ? Number(form.maks_gjester) : null,
      pris_per_natt: form.pris_per_natt ? Number(form.pris_per_natt) : 0,
      regler: form.regler || null,
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
      hoyde_m: form.hoyde_m ? Number(form.hoyde_m) : null,
      betjent: form.betjent || null,
      bilde_url: form.bilde_url || null,
    };

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        throw new Error(msg?.error || "Kunne ikke lagre hytta");
      }

      const saved = (await res.json()) as Cabin;
      const cabinId = saved.id ?? editingId;
      const wasEditing = editingId !== null;

      if (selectedFile && cabinId) {
        const fd = new FormData();
        fd.append("bilde", selectedFile);
        const uploadRes = await fetch(`${API_BASE}/${cabinId}/bilde`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!uploadRes.ok) {
          const msg = await uploadRes.json().catch(() => null);
          throw new Error(msg?.error || "Bilde ble ikke lastet opp");
        }
      }

      if (cabinId) {
        await fetch(`${API_BASE}/${cabinId}/fasiliteter`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ koder: selectedFasiliteter }),
        });
      }
      await loadCabins();
      setSuccess(wasEditing ? "Hytta ble oppdatert" : "Hytta ble opprettet");
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(cabin: Cabin) {
    setEditingId(cabin.id);
    setForm({
      navn: cabin.navn ?? "",
      beskrivelse: cabin.beskrivelse ?? "",
      omrade: cabin.omrade ?? "",
      adresse: cabin.adresse ?? "",
      kapasitet_senger: cabin.kapasitet_senger?.toString() ?? "1",
      maks_gjester: cabin.maks_gjester?.toString() ?? "",
      pris_per_natt: cabin.pris_per_natt?.toString() ?? "",
      regler: cabin.regler ?? "",
      lat: cabin.lat?.toString() ?? "",
      lng: cabin.lng?.toString() ?? "",
      hoyde_m: cabin.hoyde_m?.toString() ?? "",
      betjent: cabin.betjent ?? "",
      bilde_url: cabin.bilde_url ?? "",
    });
    setSelectedFile(null);
    setError(null);
    setModalOpen(true);
    setSelectedFasiliteter(cabin.hytte_fasilitet?.map((f) => f.kode) ?? []);
  }

  async function handleDelete(id: number) {
    if (!token) return;
    const confirmed = window.confirm("Er du sikker på at du vil slette hytta?");
    if (!confirmed) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        throw new Error(msg?.error || "Kunne ikke slette hytta");
      }
      setSuccess("Hytta ble slettet");
      await loadCabins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt");
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Mine hytter</h1>
          <p className="mt-4 text-slate-600">
            Du må være logget inn for å administrere hytter.
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

  if (!isHytteeier) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Mine hytter</h1>
          <p className="mt-4 text-slate-600">
            Denne siden er kun for brukere med rollen <strong>hytteeier</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={sectionEyebrowClass}>Hytteutleie</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Mine hytter</h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                Registrer, oppdater og administrer hyttene dine. Sett posisjon på kartet, legg
                inn beskrivelse, pris og bilde.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#eef5f1] px-3 py-1 text-sm font-medium text-[#0f3d2e] ring-1 ring-[#dcebe4]">
                <House className="h-4 w-4" />
                {cabins.length} {cabins.length === 1 ? "hytte" : "hytter"}
              </span>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f8f5b] px-4 py-3 font-medium text-white transition hover:bg-[#0d7a4e]"
              >
                <Plus className="h-4 w-4" />
                Ny hytte
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {error && !modalOpen && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-2xl border border-[#dcebe4] bg-[#eef5f1] px-4 py-3 text-sm text-[#0f3d2e]">
            {success}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-2xl font-semibold text-slate-900">Mine registrerte hytter</h2>
          </div>

          <div className="mt-5">
            {cabins.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <House className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-3 text-slate-600">Ingen hytter registrert ennå.</p>
                <p className="mt-1 text-sm text-slate-500">
                  Kom i gang ved å registrere din første hytte.
                </p>
                <button
                  type="button"
                  onClick={openCreate}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0f8f5b] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0d7a4e]"
                >
                  <Plus className="h-4 w-4" />
                  Ny hytte
                </button>
              </div>
            ) : (
              <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {cabins.map((cabin) => (
                  <li
                    key={cabin.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-[#dcebe4] hover:shadow-md"
                  >
                    {cabin.bilde_url ? (
                      <img
                        src={resolveImageUrl(cabin.bilde_url) ?? ""}
                        alt={cabin.navn}
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center bg-[#eef5f1]">
                        <ImageIcon className="h-10 w-10 text-[#0f8f5b]" />
                      </div>
                    )}

                    <div className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{cabin.navn}</h3>
                          <p className="text-xs text-slate-400">#{cabin.id}</p>
                        </div>
                        {cabin.betjent && (
                          <span className="rounded-full bg-[#eef5f1] px-3 py-1 text-xs font-medium text-[#0f3d2e] ring-1 ring-[#dcebe4]">
                            {BETJENT_LABELS[cabin.betjent]}
                          </span>
                        )}
                      </div>

                      {cabin.omrade && (
                        <p className="flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin className="h-4 w-4" />
                          {cabin.omrade}
                        </p>
                      )}

                      {cabin.beskrivelse && (
                        <p className="line-clamp-2 text-sm text-slate-600">{cabin.beskrivelse}</p>
                      )}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Bed className="h-4 w-4 text-[#0f8f5b]" />
                          {cabin.kapasitet_senger} senger
                        </span>
                        {cabin.maks_gjester && (
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-[#0f8f5b]" />
                            Maks {cabin.maks_gjester}
                          </span>
                        )}
                        {cabin.hoyde_m !== null && cabin.hoyde_m !== undefined && (
                          <span className="inline-flex items-center gap-1.5">
                            <Mountain className="h-4 w-4 text-[#0f8f5b]" />
                            {cabin.hoyde_m} moh.
                          </span>
                        )}
                        {cabin.pris_per_natt !== null && (
                          <span className="inline-flex items-center gap-1.5 font-medium text-[#0f3d2e]">
                            <Banknote className="h-4 w-4" />
                            {Number(cabin.pris_per_natt).toLocaleString("no-NO")} kr/natt
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(cabin)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Rediger
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cabin.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                          Slett
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[10050] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className={sectionEyebrowClass}>Hytte</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {editingId ? "Rediger hytte" : "Registrer ny hytte"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Lukk"
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form id="cabin-form" onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <h3 className={sectionEyebrowClass}>Grunnleggende</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Navn*</label>
                      <input
                        type="text"
                        name="navn"
                        value={form.navn}
                        onChange={handleChange}
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Type</label>
                      <select
                        name="betjent"
                        value={form.betjent}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        <option value="">Velg type…</option>
                        <option value="betjent">Betjent</option>
                        <option value="selvbetjent">Selvbetjent</option>
                        <option value="ubetjent">Ubetjent</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Område</label>
                      <input
                        type="text"
                        name="omrade"
                        value={form.omrade}
                        onChange={handleChange}
                        placeholder="f.eks. Hardangervidda"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Adresse</label>
                      <input
                        type="text"
                        name="adresse"
                        value={form.adresse}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className={sectionEyebrowClass}>Kapasitet og pris</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className={labelClass}>Senger</label>
                      <input
                        type="number"
                        min={1}
                        name="kapasitet_senger"
                        value={form.kapasitet_senger}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Maks gjester</label>
                      <input
                        type="number"
                        min={1}
                        name="maks_gjester"
                        value={form.maks_gjester}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Pris per natt (NOK)</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        name="pris_per_natt"
                        value={form.pris_per_natt}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <h3 className={sectionEyebrowClass}>Plassering</h3>
                    <p className="text-xs text-slate-500">Klikk i kartet for å sette posisjon</p>
                  </div>
                  <LocationPicker lat={form.lat} lng={form.lng} onPick={handleMapPick} />
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className={labelClass}>Breddegrad (lat)</label>
                      <input
                        type="number"
                        step="0.000001"
                        name="lat"
                        value={form.lat}
                        onChange={handleChange}
                        placeholder="60.472"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Lengdegrad (lng)</label>
                      <input
                        type="number"
                        step="0.000001"
                        name="lng"
                        value={form.lng}
                        onChange={handleChange}
                        placeholder="8.469"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Høyde (moh.)</label>
                      <input
                        type="number"
                        min={0}
                        name="hoyde_m"
                        value={form.hoyde_m}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className={sectionEyebrowClass}>Fasiliteter</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {FASILITET_KODER.map((f) => (
                      <label key={f.kode} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedFasiliteter.includes(f.kode)}
                          onChange={(e) => {
                            setSelectedFasiliteter((prev) =>
                              e.target.checked ? [...prev, f.kode] : prev.filter((k) => k !== f.kode),
                            );
                          }}
                        />
                        <span className="text-sm text-slate-700">{f.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className={sectionEyebrowClass}>Media og detaljer</h3>
                  <div>
                    <label className={labelClass}>Bilde</label>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
                      <div className="flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:w-56">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Forhåndsvisning"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-10 w-10 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                          <ImageIcon className="h-4 w-4" />
                          {previewUrl ? "Bytt bilde" : "Velg bilde"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                          />
                        </label>
                        {selectedFile && (
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="ml-2 text-xs font-medium text-slate-500 underline hover:text-slate-800"
                          >
                            Angre valg
                          </button>
                        )}
                        <p className="text-xs text-slate-500">
                          JPG, PNG, WebP. Maks 5 MB.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Beskrivelse</label>
                    <textarea
                      name="beskrivelse"
                      value={form.beskrivelse}
                      onChange={handleChange}
                      rows={3}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Regler</label>
                    <textarea
                      name="regler"
                      value={form.regler}
                      onChange={handleChange}
                      rows={2}
                      className={inputClass}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Avbryt
              </button>
              <button
                type="submit"
                form="cabin-form"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f8f5b] px-5 py-2.5 font-medium text-white transition hover:bg-[#0d7a4e] disabled:opacity-60"
              >
                {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {loading ? "Lagrer..." : editingId ? "Oppdater hytte" : "Opprett hytte"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
