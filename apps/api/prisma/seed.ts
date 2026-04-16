import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;

async function migrerPlaintextPassord() {
  const brukere = await prisma.bruker.findMany({
    select: { id: true, epost: true, passord_hash: true },
  });

  let antallMigrert = 0;
  for (const b of brukere) {
    if (b.passord_hash.startsWith('$2')) continue;
    const nyHash = await bcrypt.hash(b.passord_hash, BCRYPT_ROUNDS);
    await prisma.bruker.update({
      where: { id: b.id },
      data: { passord_hash: nyHash },
    });
    antallMigrert++;
  }

  if (antallMigrert > 0) {
    console.log(`Migrerte ${antallMigrert} plaintext-passord til bcrypt.`);
  }
}

type TestbrukerSeed = {
  gammelEpost: string | null;
  epost: string;
  fornavn: string;
  etternavn: string;
  rolleKode: string;
};

const testbrukere: TestbrukerSeed[] = [
  { gammelEpost: 'ola@usn.no', epost: 'bruker1@usn.no', fornavn: 'Ola', etternavn: 'Bruker', rolleKode: 'bruker' },
  { gammelEpost: 'per@usn.no', epost: 'bruker2@usn.no', fornavn: 'Per', etternavn: 'Hytteeier', rolleKode: 'hytteeier' },
  { gammelEpost: 'kari@usn.no', epost: 'bruker3@usn.no', fornavn: 'Kari', etternavn: 'Admin', rolleKode: 'admin' },
  { gammelEpost: 'lise@usn.no', epost: 'bruker4@usn.no', fornavn: 'Lise', etternavn: 'Annonsør', rolleKode: 'annonsor' },
];

async function sikreTestbrukere() {
  const nyBrukerHash = await bcrypt.hash('hemmelig', BCRYPT_ROUNDS);

  for (const u of testbrukere) {
    if (u.gammelEpost) {
      const gammel = await prisma.bruker.findUnique({ where: { epost: u.gammelEpost } });
      if (gammel && gammel.epost !== u.epost) {
        await prisma.bruker.update({
          where: { id: gammel.id },
          data: { epost: u.epost, fornavn: u.fornavn, etternavn: u.etternavn },
        });
      }
    }

    const bruker = await prisma.bruker.upsert({
      where: { epost: u.epost },
      update: { fornavn: u.fornavn, etternavn: u.etternavn },
      create: {
        epost: u.epost,
        fornavn: u.fornavn,
        etternavn: u.etternavn,
        passord_hash: nyBrukerHash,
      },
    });

    const rolle = await prisma.rolle.findUnique({ where: { kode: u.rolleKode } });
    if (!rolle) continue;

    await prisma.bruker_rolle.deleteMany({
      where: { bruker_id: bruker.id, rolle_id: { not: rolle.id } },
    });
    await prisma.bruker_rolle.upsert({
      where: { bruker_id_rolle_id: { bruker_id: bruker.id, rolle_id: rolle.id } },
      update: {},
      create: { bruker_id: bruker.id, rolle_id: rolle.id },
    });
  }
}

type Punkt = { lat: number; lng: number; hoyde_m?: number };

type TurstiSeed = {
  navn: string;
  beskrivelse: string;
  vanskelighetsgrad: string;
  lengde_km: number;
  hoydemeter: number;
  omrade: string;
  punkter: Punkt[];
};

const turstier: TurstiSeed[] = [
  {
    navn: 'Topptur til Gaustatoppen',
    beskrivelse:
      'Klassisk topptur i Telemark med 360° utsikt over store deler av Sør-Norge.',
    vanskelighetsgrad: 'middels',
    lengde_km: 8.5,
    hoydemeter: 1100,
    omrade: 'Telemark',
    punkter: [
      { lat: 59.8504, lng: 8.6500, hoyde_m: 1170 },
      { lat: 59.8520, lng: 8.6520, hoyde_m: 1320 },
      { lat: 59.8540, lng: 8.6540, hoyde_m: 1500 },
      { lat: 59.8560, lng: 8.6555, hoyde_m: 1700 },
      { lat: 59.8505, lng: 8.6568, hoyde_m: 1883 },
    ],
  },
  {
    navn: 'Besseggen',
    beskrivelse:
      'Populær ryggetur i Jotunheimen mellom Gjende og Bessvatnet.',
    vanskelighetsgrad: 'krevende',
    lengde_km: 14.0,
    hoydemeter: 1100,
    omrade: 'Jotunheimen',
    punkter: [
      { lat: 61.4965, lng: 8.7680, hoyde_m: 990 },
      { lat: 61.5000, lng: 8.7800, hoyde_m: 1400 },
      { lat: 61.5040, lng: 8.7900, hoyde_m: 1700 },
      { lat: 61.5080, lng: 8.7980, hoyde_m: 1550 },
      { lat: 61.5110, lng: 8.8050, hoyde_m: 1000 },
    ],
  },
];

async function main() {
  await migrerPlaintextPassord();

  const roller = [
    { kode: 'admin', navn: 'Administrator', beskrivelse: 'Redaktør med full tilgang.' },
    { kode: 'bruker', navn: 'Bruker', beskrivelse: 'Vanlig innlogget bruker.' },
    { kode: 'hytteeier', navn: 'Hytteeier', beskrivelse: 'Eier én eller flere hytter.' },
    { kode: 'annonsor', navn: 'Annonsør', beskrivelse: 'Kan opprette og administrere annonser i annonseportalen.' },
  ];

  for (const r of roller) {
    await prisma.rolle.upsert({
      where: { kode: r.kode },
      update: {},
      create: r,
    });
  }

  await sikreTestbrukere();

  for (const t of turstier) {
    const finnes = await prisma.tursti.findFirst({ where: { navn: t.navn } });
    if (finnes) continue;

    await prisma.tursti.create({
      data: {
        navn: t.navn,
        beskrivelse: t.beskrivelse,
        vanskelighetsgrad: t.vanskelighetsgrad,
        lengde_km: t.lengde_km,
        hoydemeter: t.hoydemeter,
        omrade: t.omrade,
        tursti_punkt: {
          create: t.punkter.map((p, i) => ({
            rekkefolge: i + 1,
            lat: p.lat,
            lng: p.lng,
            hoyde_m: p.hoyde_m,
          })),
        },
      },
    });
  }

  console.log('Seed fullført.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
