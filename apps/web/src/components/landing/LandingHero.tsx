/**
 * Fil: LandingHero.tsx
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu. Copilot er brukt som guide og lærer i utviklingen av denne siden.
 * Beskrivelse: Hero-komponent for forsiden med bakgrunnsbilde, overskrift og søkefelt.
 */

import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LandingHero() {
  const { t } = useTranslation("forside");
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = query.trim();

    if (!trimmed) {
      navigate("/turer");
      return;
    }

    navigate(`/turer?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <section className="relative h-[70vh] w-full">
      <img
        src="/images/hero-background.jpg"
        alt={t("hero.backgroundAlt")}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <h1 className="max-w-5xl text-center text-5xl font-semibold leading-tight text-white md:text-7xl lg:text-8xl">
          {t("hero.title")}
        </h1>

        <h2 className="mt-6 max-w-3xl text-center text-xl font-medium text-white/90 md:text-2xl lg:text-3xl">
          {t("hero.subtitle")}
        </h2>

        <form onSubmit={handleSubmit} className="mt-10 w-full max-w-3xl">
          <div className="flex items-center gap-3 rounded-full bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("hero.searchPlaceholder")}
              className="w-full bg-transparent px-2 py-2 text-lg text-gray-900 outline-none placeholder:text-gray-500 md:text-xl"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700"
            >
              {t("hero.searchButton")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
