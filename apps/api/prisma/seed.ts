/**
 * Fil: prisma/seed.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: CLI-entrypoint for `prisma db seed`. Delegerer til
 * seed-logikken i src/lib/seed.ts slik at samme funksjon gjenbrukes av
 * reset-endepunktet i adminRoutes.
 *
 * KI-bruk: Claude (Anthropic) og GitHub Copilot er brukt som verktøy
 * under utvikling. All kode er lest, forstått og testet. Se rapportens
 * kapittel "Kommentarer til bruk/tilpassing av kode".
 */

import { runSeedCli } from "../src/lib/seed";

runSeedCli().catch((err) => {
  console.error(err);
  process.exit(1);
});
