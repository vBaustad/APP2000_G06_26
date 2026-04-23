/**
 * Fil: i18n/index.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Oppsett av react-i18next med bokmål (standard) og engelsk.
 * Språk oppdages fra localStorage / nettleser og kan byttes via navbar.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import nbCommon from "./locales/nb/common.json";
import nbNavbar from "./locales/nb/navbar.json";
import nbFooter from "./locales/nb/footer.json";
import nbAuth from "./locales/nb/auth.json";
import nbForside from "./locales/nb/forside.json";
import nbTurer from "./locales/nb/turer.json";
import nbHytter from "./locales/nb/hytter.json";
import nbKart from "./locales/nb/kart.json";
import nbMinside from "./locales/nb/minside.json";
import nbMeldinger from "./locales/nb/meldinger.json";
import nbOpprettTur from "./locales/nb/opprettTur.json";
import nbAnnonsor from "./locales/nb/annonsor.json";
import nbAdmin from "./locales/nb/admin.json";
import nbInfo from "./locales/nb/info.json";

import enCommon from "./locales/en/common.json";
import enNavbar from "./locales/en/navbar.json";
import enFooter from "./locales/en/footer.json";
import enAuth from "./locales/en/auth.json";
import enForside from "./locales/en/forside.json";
import enTurer from "./locales/en/turer.json";
import enHytter from "./locales/en/hytter.json";
import enKart from "./locales/en/kart.json";
import enMinside from "./locales/en/minside.json";
import enMeldinger from "./locales/en/meldinger.json";
import enOpprettTur from "./locales/en/opprettTur.json";
import enAnnonsor from "./locales/en/annonsor.json";
import enAdmin from "./locales/en/admin.json";
import enInfo from "./locales/en/info.json";

export const defaultNS = "common";

export const resources = {
  nb: {
    common: nbCommon,
    navbar: nbNavbar,
    footer: nbFooter,
    auth: nbAuth,
    forside: nbForside,
    turer: nbTurer,
    hytter: nbHytter,
    kart: nbKart,
    minside: nbMinside,
    meldinger: nbMeldinger,
    opprettTur: nbOpprettTur,
    annonsor: nbAnnonsor,
    admin: nbAdmin,
    info: nbInfo,
  },
  en: {
    common: enCommon,
    navbar: enNavbar,
    footer: enFooter,
    auth: enAuth,
    forside: enForside,
    turer: enTurer,
    hytter: enHytter,
    kart: enKart,
    minside: enMinside,
    meldinger: enMeldinger,
    opprettTur: enOpprettTur,
    annonsor: enAnnonsor,
    admin: enAdmin,
    info: enInfo,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "nb",
    supportedLngs: ["nb", "en"],
    defaultNS,
    ns: Object.keys(resources.nb),
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "app_lang",
    },
  });

export default i18n;
