/**
 * Fil: LandingHero.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Hero-komponent for forsiden med bakgrunnsbilde, overskrift og søkefelt.
 */

import { useTranslation } from "react-i18next";

export default function LandingHero() {
  const { t } = useTranslation("forside");

  return (
    <section className="relative h-[70vh] w-full">
      <img
        src="/images/hero-background.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 flex flex-col h-full items-center justify-center px-4">
        <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-semibold text-center max-w-5xl leading-tight">
          {t("hero.title")}
        </h1>
        <h2 className="mt-6 text-white/90 text-xl md:text-2xl lg:text-3xl font-medium text-center max-w-3xl">
          {t("hero.subtitle")}
        </h2>

        <form className="mt-10 w-full max-w-3xl">
          <div className="flex items-center gap-3 rounded-full bg-white/95 backdrop-blur px-4 py-3 shadow-lg">
            <input
              type="text"
              placeholder={t("hero.searchPlaceholder")}
              className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-500 text-lg md:text-xl px-2 py-2"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 transition"
            >
              {t("hero.searchButton")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
