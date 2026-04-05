/**
 * Fil: SignupPage.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Registreringsside med e-post, passord og bekreft passord.
 */

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !password || !confirmPassword) {
      setError("Fyll inn alle feltene.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passordene er ikke like.");
      return;
    }

    if (password.length < 6) {
      setError("Passordet må være minst 6 tegn.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Noe gikk galt ved registrering.");
        return;
      }

      setSuccess("Bruker opprettet! Du kan logge inn nå.");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError("Kunne ikke koble til serveren.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-emerald-500";

  const buttonClass =
    "w-full rounded-lg bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-700 transition disabled:opacity-70";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Registrer</h1>
          <p className="mt-2 text-sm text-gray-600">
            Opprett en konto for å melde deg på turer og lagre favoritter
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">E-post</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="navn@eksempel.no"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Passord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Bekreft passord
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </p>
          )}

          <button type="submit" className={buttonClass} disabled={loading}>
            {loading ? "Registrerer..." : "Registrer deg"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Har du allerede konto?{" "}
          <NavLink to="/login" className="font-medium text-emerald-600 hover:underline">
            Logg inn
          </NavLink>
        </p>
      </div>
    </div>
  );
}