/**
 * Fil: prisma.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Setter opp Prisma-klienten for tilgang til databasen.
 */

import { PrismaClient } from "@prisma/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Missing DATABASE_URL in apps/api/.env");

export const prisma = new PrismaClient({
  datasources: {
    db: { url },
  },
});
