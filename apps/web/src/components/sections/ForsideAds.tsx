/**
 * Fil: ForsideAds.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse:
 * Seksjon på forsiden som viser aktive, godkjente annonser. Registrerer
 * visninger når annonser rendres, og klikk når bruker trykker lenke.
 * Data hentes fra offentlig GET /api/annonser og filtreres allerede på
 * serversiden etter status og tidsperiode.
 *
 * KI-bruk: Claude (Anthropic) og GitHub Copilot er brukt som verktøy
 * under utvikling. All kode er lest, forstått og testet. Se rapportens
 * kapittel "Kommentarer til bruk/tilpassing av kode".
 */

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Megaphone } from "lucide-react";

type Annonse = {
  id: number;
  tittel: string;
  beskrivelse: string | null;
  bilde_url: string | null;
  lenke_url: string | null;
  kategori: string | null;
  keywords: string | null;
};

function resolveBildeUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/images/")) return url;
  if (url.startsWith("/")) return `${import.meta.env.VITE_API_URL}${url}`;
  return url;
}

export default function ForsideAds() {
  const { t } = useTranslation("forside");
  const [annonser, setAnnonser] = useState<Annonse[]>([]);
  const viewTrackedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    let active = true;
    fetch(`${import.meta.env.VITE_API_URL}/api/annonser`)
      .then((res) => (res.ok ? (res.json() as Promise<Annonse[]>) : []))
      .then((data) => {
        if (active) setAnnonser(Array.isArray(data) ? data.slice(0, 4) : []);
      })
      .catch(() => {
        if (active) setAnnonser([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Registrer visning én gang per annonse når listen lastes.
  useEffect(() => {
    for (const annonse of annonser) {
      if (viewTrackedRef.current.has(annonse.id)) continue;
      viewTrackedRef.current.add(annonse.id);
      fetch(`${import.meta.env.VITE_API_URL}/api/annonser/${annonse.id}/view`, {
        method: "POST",
      }).catch(() => {
        // Ikke-kritisk: visningstelling kan feile uten at brukeren skal merke det.
      });
    }
  }, [annonser]);

  function handleClick(annonse: Annonse) {
    fetch(`${import.meta.env.VITE_API_URL}/api/annonser/${annonse.id}/click`, {
      method: "POST",
    }).catch(() => {
      // Ignorer feil — åpner uansett lenken.
    });
    if (annonse.lenke_url) {
      window.open(annonse.lenke_url, "_blank", "noopener,noreferrer");
    }
  }

  if (annonser.length === 0) return null;

  return (
    <section className="py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#8b5a10]">
            <Megaphone className="h-4 w-4" />
            {t("ads.eyebrow")}
          </p>
          <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
            {t("ads.heading")}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {t("ads.intro")}
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {annonser.map((annonse) => {
          const img = resolveBildeUrl(annonse.bilde_url);
          return (
            <button
              key={annonse.id}
              type="button"
              onClick={() => handleClick(annonse)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-amber-100 bg-white text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              {img ? (
                <img
                  src={img}
                  alt={annonse.tittel}
                  className="h-36 w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-36 w-full items-center justify-center bg-amber-50 text-amber-400">
                  <Megaphone className="h-10 w-10" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-4">
                {annonse.kategori && (
                  <span className="mb-2 inline-flex w-fit rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-amber-900">
                    {annonse.kategori}
                  </span>
                )}
                <h3 className="text-lg font-semibold text-slate-900">
                  {annonse.tittel}
                </h3>
                {annonse.beskrivelse && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {annonse.beskrivelse}
                  </p>
                )}
                <span className="mt-auto pt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-800 group-hover:underline">
                  {t("ads.visit")}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-slate-400">{t("ads.disclaimer")}</p>
    </section>
  );
}
