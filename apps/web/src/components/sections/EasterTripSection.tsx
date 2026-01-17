/**
 * Fil: EasterTripsSection.tsx
 * Beskrivelse: Seksjon som viser forslag til påsketurer.
 */

export default function EasterTripsSection() {
  return (
    <section className="py-16">
      <div className="rounded-xl bg-yellow-50 p-6 shadow">
        <h2 className="text-3xl font-semibold mb-6 text-yellow-900">
          3 fine påsketurer
        </h2>

        <ul className="space-y-4 text-yellow-900 text-sm">
          <li>
            <h3 className="font-semibold">1. En magisk rundtur ved Eventyrvannet</h3>
            <p>
              En klassiker med fantastisk utsikt. Passer godt for erfarne turgåere med vinterutstyr.
            </p>
          </li>

          <li>
            <h3 className="font-semibold">2. Påskeløp fra Solbu til Stormbu</h3>
            <p>
              Flott rundtur med variert terreng og gode muligheter for skitur i påskesol.
            </p>
          </li>

          <li>
            <h3 className="font-semibold">3. Solstien ved Rjukan</h3>
            <p>
              En lett og familievennlig tur med panoramautsikt og historiske stoppesteder.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
