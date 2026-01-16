export default function CompetitionCard() {
  return (
    <section className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-3 text-emerald-900">Konkurranse!</h2>
      <p className="mb-4 text-sm text-emerald-800">
        Bli med i trekkningen av en eksklusiv Utopia UT på tur Tursekk!
      </p>

      <div className="space-y-6">
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
  );
}
