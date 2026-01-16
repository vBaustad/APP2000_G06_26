/**
 * Fil: LandingActivities.tsx
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse:
 * Seksjon på denne landingssiden som viser ulike aktivitet-kategorier.
 * (Med kort og ikon, navn og antall turer og blått for vinteraktiviteter, dummydat for nå.)
 */
import { useNavigate } from "react-router-dom";

import {
  Footprints,
  Snowflake,
  MountainSnow,
  Bike,
  Waves,
  Home,
} from "lucide-react"; // Ikonbibloteket lucide-react brukt for hver aktivitetskort.

export default function LandingActivities() {
  const navigate = useNavigate();
  // Delen av landingsssiden som grupperer aktivitettskortene..

  return (
    <section className="py-16">
      <h2 className="text-3xl font-semibold mb-2">Utforsk etter aktivitet</h2>

      <p className="text-gray-600 mb-8">Velg aktivitet og finn passende turer</p>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {/* Fottur: kort- grønt */}
        <div
          onClick={() => navigate("/map?activity=fottur")}
          className="rounded-xl bg-white p-6 text-center shadow hover:shadow-md transition cursor-pointer"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Footprints color="#165a30" strokeWidth={2.5} />
          </div>
          <h3 className="font-semibold">Fottur</h3>
          <p className="text-sm text-gray-500">19 000 turer</p>
        </div>

        {/* Sykkeltur: kort- grønt */}
        <div
          onClick={() => navigate("/map?activity=sykkeltur")}
          className="rounded-xl bg-white p-6 text-center shadow hover:shadow-md transition cursor-pointer"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Bike color="#165a30" strokeWidth={2.5} />
          </div>
          <h3 className="font-semibold">Sykkeltur</h3>
          <p className="text-sm text-gray-500">2 110 turer</p>
        </div>

        {/* Hyttetur: kort- grønt */}
        <div
          onClick={() => navigate("/map?activity=hyttetur")}
          className="rounded-xl bg-white p-6 text-center shadow hover:shadow-md transition cursor-pointer"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Home color="#165a30" strokeWidth={2.5} />
          </div>
          <h3 className="font-semibold">Hyttetur</h3>
          <p className="text-sm text-gray-500">16 hytter</p>
        </div>

        {/* Skitur: kort- blått */}
        <div
          onClick={() => navigate("/map?activity=skitur")}
          className="rounded-xl bg-white p-6 text-center shadow hover:shadow-md transition cursor-pointer"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
            <Snowflake color="#19b5baff" strokeWidth={2.5} />
          </div>
          <h3 className="font-semibold">Skitur</h3>
          <p className="text-sm text-gray-500">4 307 turer</p>
        </div>

        {/* Topptur på ski: kort- blått */}
        <div
          onClick={() => navigate("/map?activity=topptur")}
          className="rounded-xl bg-white p-6 text-center shadow hover:shadow-md transition cursor-pointer"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
            <MountainSnow color="#19b5baff" strokeWidth={2.5} />
          </div>
          <h3 className="font-semibold">Topptur på ski</h3>
          <p className="text-sm text-gray-500">1 130 turer</p>
        </div>

        {/* Padletur: kort- blått */}
        <div
          onClick={() => navigate("/map?activity=padletur")}
          className="rounded-xl bg-white p-6 text-center shadow hover:shadow-md transition cursor-pointer"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
            <Waves color="#19b5baff" strokeWidth={2.5} />
          </div>
          <h3 className="font-semibold">Padletur</h3>
          <p className="text-sm text-gray-500">619 turer</p>
        </div>
      </div>
    </section>
  );
}
