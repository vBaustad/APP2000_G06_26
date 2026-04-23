/**
 * Fil: LoggetUt.tsx
 * Utvikler: Parasto Jamshidi
 * Beskrivelse:
 * En enkel landingsside som vises etter at brukeren har logget ut av Utopia-portalen.
 * Siden bekrefter utloggingen og gir brukeren raske lenker for å logge inn på nytt
 * eller gå tilbake til forsiden.
 */

import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LoggetUt() {
  const { t } = useTranslation("auth");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-100">
        <div className="text-emerald-600 text-6xl mb-4 text-center">✓</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("loggedOut.title")}
        </h1>
        <p className="text-gray-600 mb-8">{t("loggedOut.subtitle")}</p>
        <NavLink
          to="/logg-inn"
          className="block w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition"
        >
          {t("loggedOut.loginAgain")}
        </NavLink>
        <NavLink
          to="/"
          className="block mt-4 text-emerald-700 hover:underline"
        >
          {t("loggedOut.backHome")}
        </NavLink>
      </div>
    </div>
  );
}
