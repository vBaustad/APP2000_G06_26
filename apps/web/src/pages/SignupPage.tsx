/**
 * Fil: SignupPage.tsx
 * Utvikler(e): Vebjørn Baustad & Parasto Jamshidi
 * Beskrivelse: Fullstendig registreringsside koblet til MariaDB via API.
 */

import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();

  // State for alle skjemafeltene
  const [formData, setFormData] = useState({
    fornavn: "",
    etternavn: "",
    epost: "",
    passord: "",
    bekreftPassord: "",
  });

  const [error, setError] = useState("");

  // Funksjon som sender data til backenden (API)
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // Sjekk at passordene er like
    if (formData.passord !== formData.bekreftPassord) {
      setError("Passordene er ikke like!");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fornavn: formData.fornavn,
          etternavn: formData.etternavn,
          epost: formData.epost,
          passord: formData.passord,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Gratulerer! Du er nå registrert. Logg inn for å fortsette.");
        navigate("/login");
      } else {
        setError(data.error || "Noe gikk galt under registrering.");
      }
    } catch (err) {
      setError("Kunne ikke koble til serveren. Sjekk at backenden kjører.");
    }
  }

  // CSS-klasser for styling
  const inputClass = "w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-emerald-500 transition";
  const buttonClass = "w-full rounded-lg bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 transition shadow-md active:scale-95";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-800">Bli medlem</h1>
          <p className="mt-2 text-gray-600">Utforsk Utopia sammen med oss</p>
        </header>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Fornavn</label>
              <input
                type="text"
                required
                placeholder="Ola"
                className={inputClass}
                onChange={(e) => setFormData({ ...formData, fornavn: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Etternavn</label>
              <input
                type="text"
                required
                placeholder="Nordmann"
                className={inputClass}
                onChange={(e) => setFormData({ ...formData, etternavn: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">E-postadresse</label>
            <input
              type="email"
              required
              placeholder="navn@domene.no"
              className={inputClass}
              onChange={(e) => setFormData({ ...formData, epost: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Velg Passord</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className={inputClass}
              onChange={(e) => setFormData({ ...formData, passord: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Bekreft Passord</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className={inputClass}
              onChange={(e) => setFormData({ ...formData, bekreftPassord: e.target.value })}
            />
          </div>

          <button type="submit" className={buttonClass}>
            Opprett konto
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Har du allerede en konto?{" "}
          <NavLink to="/login" className="text-emerald-700 font-bold hover:underline">
            Logg inn her
          </NavLink>
        </p>
      </div>
    </div>
  );
}