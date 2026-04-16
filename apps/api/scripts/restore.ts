/**
 * Fil: scripts/restore.ts
 * Beskrivelse: Restorer data fra et backup_*.json til den nye Prisma-schemaen.
 * Mapper bort skjema-inkompatible rader (favoritt på tursti) og oversetter enum-verdier.
 *
 * Kjør: npx tsx scripts/restore.ts                  (bruker nyeste backup_*.json i cwd)
 *       npx tsx scripts/restore.ts <fil>            (eksplisitt filsti)
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync } from "fs";

const prisma = new PrismaClient();

type RolleRow = { id: number; kode: string; navn: string; beskrivelse: string | null };
type BrukerRow = {
  id: number;
  epost: string;
  passord_hash: string;
  fornavn: string | null;
  etternavn: string | null;
  bilde_url?: string | null;
  bio?: string | null;
  created_at: string;
};
type BrukerRolleRow = { bruker_id: number; rolle_id: number };
type HytteRow = {
  id: number;
  eier_bruker_id: number;
  navn: string;
  beskrivelse: string | null;
  omrade: string | null;
  adresse: string | null;
  lat?: string | null;
  lng?: string | null;
  hoyde_m?: number | null;
  betjent?: string | null;
  bilde_url?: string | null;
  kapasitet_senger: number;
  maks_gjester: number | null;
  pris_per_natt: string;
  regler: string | null;
  created_at: string;
};
type TurstiRow = {
  id: number;
  navn: string;
  beskrivelse: string | null;
  vanskelighetsgrad: string | null;
  hoydemeter: number | null;
  lengde_km: string | null;
  omrade: string | null;
  created_at: string;
};
type TurstiPunktRow = {
  id: number;
  tursti_id: number;
  rekkefolge: number;
  lat: string;
  lng: string;
  hoyde_m: number | null;
  created_at: string;
};
type AnnonsorRow = {
  id: number;
  navn: string;
  epost: string;
  telefon: string | null;
  status: string;
  created_at: string;
};

type Backup = {
  rolle?: RolleRow[];
  bruker?: BrukerRow[];
  bruker_rolle?: BrukerRolleRow[];
  hytte?: HytteRow[];
  tursti?: TurstiRow[];
  tursti_punkt?: TurstiPunktRow[];
  annonsor?: AnnonsorRow[];
};

function mapAnnonsorStatus(s: string): "pending" | "approved" | "rejected" {
  if (s === "approved" || s === "rejected" || s === "pending") return s;
  if (s === "active") return "approved";
  return "pending";
}

function mapHytteBetjent(b: string | null | undefined): "betjent" | "selvbetjent" | "ubetjent" | null {
  if (b === "betjent" || b === "selvbetjent" || b === "ubetjent") return b;
  return null;
}

function nyesteBackupFil(): string {
  const filer = readdirSync(process.cwd())
    .filter((f) => f.startsWith("backup_") && f.endsWith(".json"))
    .sort()
    .reverse();
  if (!filer.length) throw new Error("Fant ingen backup_*.json i gjeldende mappe.");
  return filer[0];
}

async function main() {
  const fil = process.argv[2] ?? nyesteBackupFil();
  console.log(`Leser ${fil}...\n`);
  const backup: Backup = JSON.parse(readFileSync(fil, "utf-8"));

  for (const r of backup.rolle ?? []) {
    await prisma.rolle.upsert({
      where: { id: r.id },
      update: { kode: r.kode, navn: r.navn, beskrivelse: r.beskrivelse },
      create: r,
    });
  }
  console.log(`Roller: ${backup.rolle?.length ?? 0}`);

  for (const u of backup.bruker ?? []) {
    await prisma.bruker.upsert({
      where: { id: u.id },
      update: {
        epost: u.epost,
        passord_hash: u.passord_hash,
        fornavn: u.fornavn,
        etternavn: u.etternavn,
      },
      create: {
        id: u.id,
        epost: u.epost,
        passord_hash: u.passord_hash,
        fornavn: u.fornavn,
        etternavn: u.etternavn,
        bilde_url: u.bilde_url ?? null,
        bio: u.bio ?? null,
        created_at: new Date(u.created_at),
      },
    });
  }
  console.log(`Brukere: ${backup.bruker?.length ?? 0}`);

  for (const br of backup.bruker_rolle ?? []) {
    await prisma.bruker_rolle.upsert({
      where: { bruker_id_rolle_id: { bruker_id: br.bruker_id, rolle_id: br.rolle_id } },
      update: {},
      create: br,
    });
  }
  console.log(`bruker_rolle: ${backup.bruker_rolle?.length ?? 0}`);

  for (const t of backup.tursti ?? []) {
    await prisma.tursti.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        navn: t.navn,
        beskrivelse: t.beskrivelse,
        vanskelighetsgrad: t.vanskelighetsgrad,
        hoydemeter: t.hoydemeter,
        lengde_km: t.lengde_km,
        omrade: t.omrade,
        created_at: new Date(t.created_at),
      },
    });
  }
  console.log(`Turstier: ${backup.tursti?.length ?? 0}`);

  for (const p of backup.tursti_punkt ?? []) {
    await prisma.tursti_punkt.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        tursti_id: p.tursti_id,
        rekkefolge: p.rekkefolge,
        lat: p.lat,
        lng: p.lng,
        hoyde_m: p.hoyde_m,
        created_at: new Date(p.created_at),
      },
    });
  }
  console.log(`Tursti-punkter: ${backup.tursti_punkt?.length ?? 0}`);

  for (const h of backup.hytte ?? []) {
    await prisma.hytte.upsert({
      where: { id: h.id },
      update: {},
      create: {
        id: h.id,
        eier_bruker_id: h.eier_bruker_id,
        navn: h.navn,
        beskrivelse: h.beskrivelse,
        omrade: h.omrade,
        adresse: h.adresse,
        lat: h.lat ?? null,
        lng: h.lng ?? null,
        hoyde_m: h.hoyde_m ?? null,
        betjent: mapHytteBetjent(h.betjent),
        bilde_url: h.bilde_url ?? null,
        kapasitet_senger: h.kapasitet_senger,
        maks_gjester: h.maks_gjester,
        pris_per_natt: h.pris_per_natt,
        regler: h.regler,
        created_at: new Date(h.created_at),
      },
    });
  }
  console.log(`Hytter: ${backup.hytte?.length ?? 0}`);

  for (const a of backup.annonsor ?? []) {
    await prisma.annonsor.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        navn: a.navn,
        epost: a.epost,
        telefon: a.telefon,
        status: mapAnnonsorStatus(a.status),
        created_at: new Date(a.created_at),
      },
    });
  }
  console.log(`Annonsører: ${backup.annonsor?.length ?? 0}`);

  console.log("\nfavoritt: SKIP (gammelt skjema pekte på tursti, nytt peker på tur/hytte — ingen 1:1-mapping)");
  console.log("\nRestore fullført.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
