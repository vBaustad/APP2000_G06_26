/**
 * Fil: Registrer.tsx
 * Utvikler(e): Vebjørn Baustad & Parasto Jamshidi
 * Beskrivelse: Fullstendig registreringsside koblet til MySQL via API med automatisk innlogging.
 *
 * KI-bruk: Claude (Anthropic) og GitHub Copilot er brukt som verktøy
 * under utvikling. All kode er lest, forstått og testet. Se rapportens
 * kapittel "Kommentarer til bruk/tilpassing av kode".
 */

import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function Registrer() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fornavn: "",
    etternavn: "",
    epost: "",
    passord: "",
    bekreftPassord: "",
  });

  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (formData.passord !== formData.bekreftPassord) {
      setError(t("register.errorPasswordMismatch"));
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
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
        const loginRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            epost: formData.epost,
            passord: formData.passord,
          }),
        });

        const loginData = await loginRes.json();

        if (loginRes.ok && loginData.token) {
          localStorage.setItem("token", loginData.token);
          if (login) login(loginData.user, loginData.token);

          navigate("/min-side");
        } else {
          navigate("/logg-inn");
        }
      } else {
        setError(data.error || t("register.errorGeneric"));
      }
    } catch {
      setError(t("register.errorServer"));
    }
  }

  const inputClass = "w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-emerald-500 transition";
  const buttonClass = "w-full rounded-lg bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 transition shadow-md active:scale-95";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-800">
            {t("register.title")}
          </h1>
          <p className="mt-2 text-gray-600">{t("register.subtitle")}</p>
        </header>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                {t("register.firstNameLabel")}
              </label>
              <input
                type="text"
                required
                placeholder={t("register.firstNamePlaceholder")}
                className={inputClass}
                onChange={(e) => setFormData({ ...formData, fornavn: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                {t("register.lastNameLabel")}
              </label>
              <input
                type="text"
                required
                placeholder={t("register.lastNamePlaceholder")}
                className={inputClass}
                onChange={(e) => setFormData({ ...formData, etternavn: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              {t("register.emailLabel")}
            </label>
            <input
              type="email"
              required
              placeholder={t("register.emailPlaceholder")}
              className={inputClass}
              onChange={(e) => setFormData({ ...formData, epost: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              {t("register.passwordLabel")}
            </label>
            <input
              type="password"
              required
              placeholder={t("register.passwordPlaceholder")}
              className={inputClass}
              onChange={(e) => setFormData({ ...formData, passord: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              {t("register.confirmPasswordLabel")}
            </label>
            <input
              type="password"
              required
              placeholder={t("register.passwordPlaceholder")}
              className={inputClass}
              onChange={(e) => setFormData({ ...formData, bekreftPassord: e.target.value })}
            />
          </div>

          <button type="submit" className={buttonClass}>
            {t("register.submit")}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          {t("register.haveAccount")}{" "}
          <NavLink to="/logg-inn" className="text-emerald-700 font-bold hover:underline">
            {t("register.loginLink")}
          </NavLink>
        </p>
      </div>
    </div>
  );
}
