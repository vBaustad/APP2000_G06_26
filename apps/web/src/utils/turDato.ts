/**
 * Fil: turDato.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Hjelpefunksjoner for å klassifisere turdatoer som aktive
 * eller historiske. En dato er aktiv når den har status "planned" og
 * sluttidspunktet ikke har inntruffet enda. Alt annet regnes som historikk
 * (låst, avlyst, fristilt, eller utløpt).
 *
 * KI-bruk: Claude (Anthropic) og GitHub Copilot er brukt som verktøy
 * under utvikling. All kode er lest, forstått og testet. Se rapportens
 * kapittel "Kommentarer til bruk/tilpassing av kode".
 */

export function erDatoAktiv(endAt: string, status: string): boolean {
  if (status !== "planned") return false;
  const end = new Date(endAt).getTime();
  if (!Number.isFinite(end)) return false;
  return end >= Date.now();
}

export function erDatoHistorisk(endAt: string, status: string): boolean {
  return !erDatoAktiv(endAt, status);
}
