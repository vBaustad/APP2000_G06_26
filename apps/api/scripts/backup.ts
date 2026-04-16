/**
 * Fil: scripts/backup.ts
 * Beskrivelse: Engangs-dump av alle tabeller i databasen til JSON. Kjøres mot eksisterende DB
 * (uavhengig av schema.prisma) via raw SQL. Brukes som sikkerhetsnett før destruktiv migrasjon.
 *
 * Kjør: npx tsx scripts/backup.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  const dbRows = await prisma.$queryRawUnsafe<{ db: string }[]>(
    "SELECT DATABASE() AS db"
  );
  const dbName = dbRows[0]?.db;
  if (!dbName) throw new Error("Klarte ikke å lese databasenavn fra tilkoblingen.");

  const tables = await prisma.$queryRawUnsafe<{ TABLE_NAME: string }[]>(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'",
    dbName
  );

  const dump: Record<string, unknown[]> = {};
  for (const { TABLE_NAME } of tables) {
    const rows = await prisma.$queryRawUnsafe<unknown[]>(
      `SELECT * FROM \`${TABLE_NAME}\``
    );
    dump[TABLE_NAME] = rows;
    console.log(`${TABLE_NAME}: ${rows.length} rader`);
  }

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const path = join(process.cwd(), `backup_${ts}.json`);
  const json = JSON.stringify(
    dump,
    (_, v) => (typeof v === "bigint" ? v.toString() : v),
    2
  );
  writeFileSync(path, json);
  console.log(`\nBackup skrevet til ${path}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
