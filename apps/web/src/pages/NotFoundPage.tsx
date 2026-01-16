/**
 * Fil: NotFoundPage.tsx
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu
 * Beskrivelse: Enkel 404-side når brukeren går til en rute som ikke finnes.
 */
export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">404 – Siden finnes ikke</h1>
      <p className="mt-2 text-gray-600">Gå tilbake til forsiden.</p>
    </main>
  );
}
