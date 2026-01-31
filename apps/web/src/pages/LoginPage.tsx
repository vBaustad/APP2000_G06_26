/**
 * Fil: LoginPage.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Innloggingsside med e-post og passord. Logger inn via API og lagrer brukerinfo.
 */

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type LoginResponse = {
  token: string;
  user: {
    id: number;
    epost: string;
    roller: string[];
  };
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ epost: email, passord: password }),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        setError(msg?.error ?? "Feil e-post eller passord");
        return;
      }

      const data = (await res.json()) as LoginResponse;

      login(data.user, data.token);
      navigate("/me");
    } catch {
      setError("Kunne ikke kontakte serveren. Sjekk at API kjører.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-emerald-500";
  const buttonClass =
    "w-full rounded-lg bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-700 transition disabled:opacity-60";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Logg inn</h1>
          <p className="mt-2 text-sm text-gray-600">
            Logg inn for å melde deg på turer og lagre favoritter
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">E-post</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="bruker1@usn.no"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Passord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="hemmelig"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className={buttonClass} disabled={loading}>
            {loading ? "Logger inn..." : "Logg inn"}
          </button>
        </form>

        <footer>
          <p className="mt-4 text-center text-sm text-gray-600">
            Har du ikke konto?{" "}
            <NavLink to="/signup" className="text-emerald-700 hover:underline">
              Registrer deg
            </NavLink>
          </p>
        </footer>
      </div>
    </div>
  );
}
