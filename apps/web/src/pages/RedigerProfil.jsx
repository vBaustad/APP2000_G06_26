/**
 * Fil: RedigerProfil.jsx
 * Utvikler (Logikk & API-integrasjon): Parasto Jamshidi
 * Design & UI-oppsett: Ramona Cretulescu
 * 
 * Beskrivelse:
 * Denne komponenten utgjør brukergrensesnittet for å redigere profilinformasjon i Utopia-portalen.
 * 
 * Teknisk funksjonalitet (utviklet av Parasto):
 * - Henter eksisterende brukerdata fra backenden via REST-API (GET /api/bruker/me) 
 *   ved bruk av JWT-autentisering.
 * - Håndterer lokal tilstand (state) for skjemaet og synkronisering av input-felter.
 * - Sender oppdaterte profilendringer til serveren via PUT-forespørsler.
 * - Implementerer logikk for visning av statusmeldinger (loading, saving, suksess).
 * 
 * Visuelt design (utviklet av Ramona):
 * - Utforming av layout og stil ved bruk av Tailwind CSS.
 * - Integrasjon av ikoner og sikring av at siden følger den grafiske profilen til prosjektet.
 */

import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Mail, Save, User, CalendarDays, FileText } from "lucide-react";

export default function RedigerProfil() {
  const [form, setForm] = useState({
    fornavn: "",
    etternavn: "",
    epost: "",
    fodselsdato: "",
    omMeg: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

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
        setForm({
          fornavn: data.fornavn ?? "",
          etternavn: data.etternavn ?? "",
          epost: data.epost ?? "",
          fodselsdato: data.fodselsdato ?? "",
          omMeg: data.omMeg ?? "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSavedMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSaving(true);
      setSavedMessage("");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bruker/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Kunne ikke lagre profil");
      }

      setSavedMessage("Endringene ble lagret.");
    } catch (err) {
      console.error(err);
      setSavedMessage("Noe gikk galt. Prøv igjen.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-600">Laster profilinformasjon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#0f3d2e]">
            Konto
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">Rediger profil</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Oppdater navn, e-post og informasjon om deg selv. Hold profilen enkel,
            tydelig og relevant for bruk av løsningen.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="border-b border-slate-200 pb-3 text-xl font-semibold text-slate-900">
                Profil
              </h2>

              <div className="mt-5 space-y-4">
                <NavLink
                  to="/min-side"
                  className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Tilbake til min side
                </NavLink>

                <div className="rounded-xl bg-[#eef5f1] px-4 py-3 text-sm font-medium text-[#0f3d2e]">
                  Rediger profil
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Tips</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Bruk fullt navn og en kort tekst om interesser. Det gjør profilen mer
                troverdig og nyttig i fellesturer og sosial turplanlegging.
              </p>
            </section>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-semibold text-slate-900">Din profil</h2>
              <p className="mt-2 text-slate-500">
                Informasjonen under brukes i kontoen din og på profilsiden.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Fornavn
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="fornavn"
                      value={form.fornavn}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none focus:border-[#0f8f5b] focus:ring-2 focus:ring-[#dcebe4]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Etternavn
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="etternavn"
                      value={form.etternavn}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none focus:border-[#0f8f5b] focus:ring-2 focus:ring-[#dcebe4]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  E-post
                </label>
                <p className="mb-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Hvis du endrer e-postadressen vil du kunne måtte bekrefte den på nytt.
                </p>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="epost"
                    value={form.epost}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none focus:border-[#0f8f5b] focus:ring-2 focus:ring-[#dcebe4]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Fødselsdato
                </label>
                <p className="mb-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Valgfritt felt. Kan brukes for tilpasning av profil og statistikk.
                </p>
                <div className="relative max-w-sm">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="fodselsdato"
                    placeholder="DD.MM.ÅÅÅÅ"
                    value={form.fodselsdato}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none focus:border-[#0f8f5b] focus:ring-2 focus:ring-[#dcebe4]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Om meg
                </label>
                <p className="mb-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Skriv en kort tekst om deg og friluftsinteressene dine.
                </p>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
                  <textarea
                    name="omMeg"
                    value={form.omMeg}
                    onChange={handleChange}
                    maxLength={200}
                    rows={6}
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none focus:border-[#0f8f5b] focus:ring-2 focus:ring-[#dcebe4]"
                  />
                </div>
                <div className="mt-2 text-right text-sm text-slate-400">
                  {form.omMeg.length}/200
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">{savedMessage}</div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0f8f5b] px-5 py-3 font-medium text-white transition hover:bg-[#0d7a4e] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Lagrer..." : "Lagre endringer"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}