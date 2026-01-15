/**
 * Fil: LandingPage.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Selve landingssiden som inneholder flere komponenter som bygger opp hele siden. LandingHero, 
 */

import { useState } from "react";
import LandingHero from "../components/LandingHero";

export default function LandingPage() {
  const [openRule, setOpenRule] = useState<number | null>(null);

  
  return (
 <>
  <LandingHero />

  <main className="max-w-6xl mx-auto px-4 py-10 flex gap-8">

    {/* VENSTRE KOLONNE */}
    <aside className="w-1/3 space-y-6">
     <section className="p-4 bg-emerald-100 rounded-xl shadow">
  <h2 className="text-xl font-bold mb-3 text-emerald-900">Fjellvettreglene</h2>
  <ul className="space-y-2 text-emerald-900 text-sm">
    <li>1. Planlegg turen og meld fra hvor du går.</li>
    <li>2. Tilpass turen etter evne og forhold.</li>
    <li>3. Ta hensyn til vær- og skredvarsel.</li>
    <li>4. Vær forberedt på uvær og kulde.</li>
    <li>5. Ta med nødvendig utstyr.</li>
    <li>6. Ta trygge veivalg.</li>
    <li>7. Bruk kart og kompass.</li>
    <li>8. Vend i tide.</li>
    <li>9. Spar på kreftene og søk ly.</li>
  </ul>
</section>
<section className="p-4 bg-white rounded-xl shadow">
  <h2 className="text-xl font-bold mb-3 text-emerald-900">Konkurranse!</h2>
  <p className="mb-4 text-sm text-emerald-800">
    Bli med i trekkningen av en eksklusiv Utopia UT på tur Tursekk! 
  </p>

  <div className="space-y-6">

    {/* Spørsmål 1 */}
    <div>
      <p className="font-medium text-emerald-900">
        1. Hva bør du alltid gjøre før du går på tur?
      </p>
      <button className="block w-full mt-2 p-2 bg-emerald-100 rounded hover:bg-emerald-200">
        Sjekke vær og melde fra
      </button>
      <button className="block w-full mt-2 p-2 bg-emerald-100 rounded hover:bg-emerald-200">
        Pakke solbriller og shorts
      </button>
    </div>

    {/* Spørsmål 2 */}

  </div>
</section>

    </aside>
<section className="p-3 bg-yellow-50 rounded-xl shadow">

  <h2 className="text-2xl font-bold mb-4 text-yellow-900">3 fine påsketurer</h2>
  <ul className="space-y-4 text-yellow-900 text-sm">

    <li>
      <h3 className="font-semibold">1. En magisk rundtur ved Eventyrvannet </h3>
      <p>En klassiker med fantastisk utsikt. Passer godt for erfarne turgåere med vinterutstyr.</p>
    </li>

    <li>
      <h3 className="font-semibold">2. Påskeløp fra Solbu til Stormbu </h3>
      <p>Flott rundtur med variert terreng og gode muligheter for skitur i påskesol.</p>
    </li>

    <li>
      <h3 className="font-semibold">3. Solstien ved Rjukan</h3>
      <p>En lett og familievennlig tur med panoramautsikt og historiske stoppesteder.</p>
    </li>

  </ul>
</section>

    {/* HØYRE KOLONNE */}
    <section className="flex-1 space-y-6">
      {/* Quiz */}
      {/* Nyheter */}
      {/* Inspirasjon */}
    </section>

  </main>
  <main> ... </main>

<section className="max-w-6xl mx-auto mt-10 p-6 bg-gray-100 rounded-xl shadow">
  <h2 className="text-xl font-bold mb-3 text-gray-900">Takk til våre samarbeidspartnere</h2>

  <div className="flex gap-6 items-center">
    <img src="/partner1.png" alt="Partner 1" className="h-12" />
    <img src="/partner2.png" alt="Partner 2" className="h-12" />
    <img src="/partner3.png" alt="Partner 3" className="h-12" />
  </div>
</section>

</>

  );
}
