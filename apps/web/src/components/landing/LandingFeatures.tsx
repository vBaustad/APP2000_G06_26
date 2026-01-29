/**
 * Fil: LandingFeatures.tsx.
 * Utvikler(e): Ramona Cretulscu
 * Beskrivelse: Enkel side seksjon komponent som representerer en egen seksjon på landingssiden. på landingssiden som presenterrer hovedfunksjonene i løsningen (turer, kart,) som fanger opp navigering til sider som ikke finnes.
 */
//da kan vi bruke react sin href bare bedre
import { Link } from "react-router-dom";


export default function LandingFeatures() {
  // Komponent som returnerer JSX 
  return (
    <>
      {/*
        Seksjon som markerer en egenlogisk del av forsiden.
        Brukes til å presentere hva løsningen gir.
      */}
      <section className="py-16">
    
        <h2 className="text-3xl font-semibold text-center mb-10">
          Hva tilbyr Utopia?
        </h2>

        {/*
          Viser tre kolonner på større skjermer.
        */}
        <div className="grid gap-8 md:grid-cols-3">

{/* Kort 1: Utforsk turer */}
<Link to="/explore" className="block">
  <div className="rounded-xl bg-white p-6 shadow hover:shadow-lg transition cursor-pointer">
    <h3 className="text-xl font-semibold mb-2">Utforsk turer</h3>
    <p className="text-gray-600">
      Finn turer basert på vanskelighetsgrad, lengde og utstyr.
    </p>
  </div>
</Link>

{/* Kort 2: Kart & oversikt */}
<Link to="/map" className="block">
  <div className="rounded-xl bg-white p-6 shadow hover:shadow-lg transition cursor-pointer">
    <h3 className="text-xl font-semibold mb-2">Kart & oversikt</h3>
    <p className="text-gray-600">
      Se turer visuelt på kart og planlegg neste opplevelse.
    </p>
  </div>
</Link>

{/* Kort 3: Mine turer */}
<Link to="/me" className="block">
  <div className="rounded-xl bg-white p-6 shadow hover:shadow-lg transition cursor-pointer">
    <h3 className="text-xl font-semibold mb-2">Mine turer</h3>
    <p className="text-gray-600">
      Meld deg på turer og hold oversikt over dine aktiviteter.
    </p>
  </div>
</Link>

</div>


        
      </section>
    </>
  );
}

