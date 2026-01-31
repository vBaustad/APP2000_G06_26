/**
 * Fil: MyCabinsPage.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: CRUD for oppretting, redigering og sletting av hytter for brukere med rolle hytteeier
 */

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

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
};

const API_BASE = `${import.meta.env.VITE_API_URL}/api/hytter`;

export default function MyCabinsPage() {
  const { user, token } = useAuth();
  const isHytteeier = useMemo(() => user?.roller?.includes("hytteeier") ?? false, [user]);

  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [form, setForm] = useState<CabinFormState>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (token && isHytteeier) {
      loadCabins();
    }
  }, [token, isHytteeier]);

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

      await loadCabins();
      setForm(initialForm);
      setEditingId(null);
      setSuccess(editingId ? "Hytta ble oppdatert" : "Hytta ble opprettet");
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
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(initialForm);
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
      <div className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-center text-lg">Du må være innlogget for å administrere hytter.</p>
      </div>
    );
  }

  if (!isHytteeier) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-center text-lg">
          Denne siden er kun for brukere med rollen <strong>hytteeier</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold mb-4">
          {editingId ? "Rediger hytte" : "Registrer ny hytte"}
        </h1>

        {error && <p className="mb-4 rounded bg-red-50 px-4 py-2 text-red-700">{error}</p>}
        {success && (
          <p className="mb-4 rounded bg-emerald-50 px-4 py-2 text-emerald-700">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Navn*</label>
              <input
                type="text"
                name="navn"
                value={form.navn}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Område</label>
              <input
                type="text"
                name="omrade"
                value={form.omrade}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Adresse</label>
              <input
                type="text"
                name="adresse"
                value={form.adresse}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Senger</label>
                <input
                  type="number"
                  min={1}
                  name="kapasitet_senger"
                  value={form.kapasitet_senger}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Maks gjester</label>
                <input
                  type="number"
                  min={1}
                  name="maks_gjester"
                  value={form.maks_gjester}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Pris per natt (NOK)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                name="pris_per_natt"
                value={form.pris_per_natt}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Beskrivelse</label>
            <textarea
              name="beskrivelse"
              value={form.beskrivelse}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Regler</label>
            <textarea
              name="regler"
              value={form.regler}
              onChange={handleChange}
              rows={2}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Lagrer..." : editingId ? "Oppdater hytte" : "Opprett hytte"}
            </button>

            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="text-sm underline">
                Avbryt redigering
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Mine registrerte hytter</h2>
        {cabins.length === 0 ? (
          <p className="rounded-lg bg-white p-6 text-center text-gray-600 shadow">
            Ingen hytter registrert ennå.
          </p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {cabins.map((cabin) => (
              <li key={cabin.id} className="rounded-2xl bg-white p-5 shadow space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{cabin.navn}</h3>
                  <span className="text-sm text-gray-500">#{cabin.id}</span>
                </div>
                {cabin.omrade && <p className="text-sm text-gray-600">{cabin.omrade}</p>}
                {cabin.beskrivelse && <p className="text-sm text-gray-700">{cabin.beskrivelse}</p>}
                <div className="text-sm text-gray-600">
                  <span>Senger: {cabin.kapasitet_senger}</span>
                  {cabin.maks_gjester && <span className="ml-4">Maks gjester: {cabin.maks_gjester}</span>}
                </div>
                {cabin.pris_per_natt !== null && (
                  <p className="text-sm text-gray-600">
                    Pris: {Number(cabin.pris_per_natt).toLocaleString("no-NO")} kr / natt
                  </p>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium hover:bg-gray-200"
                    onClick={() => handleEdit(cabin)}
                  >
                    Rediger
                  </button>
                  <button
                    className="rounded-md bg-red-50 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-100"
                    onClick={() => handleDelete(cabin.id)}
                  >
                    Slett
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
