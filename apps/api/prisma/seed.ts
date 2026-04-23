/**
 * Fil: prisma/seed.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: CLI-entrypoint for `prisma db seed`. Delegerer til
 * seed-logikken i src/lib/seed.ts slik at samme funksjon gjenbrukes av
 * reset-endepunktet i adminRoutes.
 */

import { runSeedCli } from "../src/lib/seed";

runSeedCli().catch((err) => {
  console.error(err);
  process.exit(1);
});
