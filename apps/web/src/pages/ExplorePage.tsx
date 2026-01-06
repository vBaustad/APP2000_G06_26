/**
 * Fil: ExplorePage.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Utforsk-side som viser tilgjengelige turer med søk og
 * visning av turkort (placeholders).
 */

import { useEffect, useState } from "react";
import TourForm from "../components/TourForm";
import { getTours } from "../services/toursApi";

export default function ExplorePage() {
  const [tours, setTours] = useState<any[]>([]);

  // Hent turer (senere fra backend)
  useEffect(() => {
    getTours().then(setTours);
  }, []);

  function handleCreate(newTour: any) {
    setTours((prev) => [newTour, ...prev]);
  }

  function handleDelete(id: any) {
    setTours((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <main>
      <section className="relative h-[40vh]">
        <img
          src="/images/explore-hero.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full">
          <div className="mx-auto max-w-7xl h-full px-6 flex items-end justify-between pb-10 gap-8">
            {/* Venstre */}
            <div className="max-w-xl">
              <h1 className="text-white text-4xl font-semibold">
                Utforsk turer
              </h1>
              <p className="mt-2 text-white/80 text-sm">
                Finn turer basert på lengde, vanskelighetsgrad og utstyr
              </p>
            </div>

            {/* Høyre */}
            <form className="w-full max-w-sm">
              <input
                type="search"
                placeholder="Søk etter tur, sted eller vanskelighetsgrad"
                className="w-full rounded-lg bg-white/95 px-4 py-3 text-gray-900 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </form>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pb-16 my-8">
        {/* Skjema */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow">
          <h2 className="text-lg font-semibold mb-3">Legg til tur</h2>
          <TourForm onCreate={handleCreate} />
        </div>

        {/* Turkort */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((t) => (
            <div
              key={t.id}
              className="rounded-xl overflow-hidden bg-white shadow hover:shadow-lg transition"
            >
              <img
                src="/images/trip-card-placeholder.jpg"
                alt=""
                className="h-40 w-full object-cover"
              />

              <div className="p-4 space-y-2">
                <h3 className="text-lg font-semibold">{t.title}</h3>

                <p className="text-sm text-gray-600">
                  {t.distanceKm} km • {t.elevationM} hm • ca. {t.durationHours} t
                </p>

                <p className="text-sm text-gray-600">
                  Utstyr: {t.gear.join(", ")}
                </p>

                <div className="pt-2">
                  <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                    {t.difficulty}
                  </span>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Slett
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
