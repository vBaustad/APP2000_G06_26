/**
 * Fil: IkkeFunnet.tsx
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu
 * Beskrivelse: Enkel 404-side når brukeren går til en rute som ikke finnes.
 */
import { useTranslation } from "react-i18next";

export default function IkkeFunnet() {
  const { t } = useTranslation("info");
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">{t("ikkeFunnet.title")}</h1>
      <p className="mt-2 text-gray-600">{t("ikkeFunnet.text")}</p>
    </main>
  );
}
