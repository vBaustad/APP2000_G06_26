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
  waypoints: Punkt[];
};

// Bygger en sti med ca. `total` punkter ved å interpolere mellom waypoints
// og legge til en liten perpendikulær wiggle så stien ikke blir en rett linje.
function byggSti(waypoints: Punkt[], total = 60): Punkt[] {
  if (waypoints.length < 2) return [...waypoints];

  const segmenter = waypoints.length - 1;
  const perSegment = Math.max(1, Math.floor((total - 1) / segmenter));
  const resultat: Punkt[] = [];

  for (let i = 0; i < segmenter; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    const dLat = b.lat - a.lat;
    const dLng = b.lng - a.lng;
    const lengde = Math.sqrt(dLat * dLat + dLng * dLng) || 1;
    const perpLat = -dLng / lengde;
    const perpLng = dLat / lengde;

    for (let s = 0; s < perSegment; s++) {
      const t = s / perSegment;
      const wiggle = 0.00035 * Math.sin(s * 0.7 + i * 2.1);
      const lat = a.lat + dLat * t + perpLat * wiggle;
      const lng = a.lng + dLng * t + perpLng * wiggle;
      const hoyde =
        a.hoyde_m !== undefined && b.hoyde_m !== undefined
          ? Math.round(a.hoyde_m + (b.hoyde_m - a.hoyde_m) * t + Math.sin(s * 0.5 + i) * 4)
          : undefined;
      resultat.push({
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        hoyde_m: hoyde,
      });
    }
  }

  const siste = waypoints[waypoints.length - 1];
  resultat.push({
    lat: Number(siste.lat.toFixed(6)),
    lng: Number(siste.lng.toFixed(6)),
    hoyde_m: siste.hoyde_m,
  });

  return resultat;
}

const turstier: TurstiSeed[] = [
  {
    navn: 'Topptur til Gaustatoppen',
    beskrivelse:
      'Klassisk topptur i Telemark med 360° utsikt over store deler av Sør-Norge. Starter på Stavsro.',
    vanskelighetsgrad: 'middels',
    lengde_km: 8.5,
    hoydemeter: 713,
    omrade: 'Telemark',
    waypoints: [
      { lat: 59.8405, lng: 8.6385, hoyde_m: 1170 },
      { lat: 59.8435, lng: 8.6420, hoyde_m: 1320 },
      { lat: 59.8462, lng: 8.6470, hoyde_m: 1470 },
      { lat: 59.8485, lng: 8.6520, hoyde_m: 1620 },
      { lat: 59.8505, lng: 8.6550, hoyde_m: 1780 },
      { lat: 59.8532, lng: 8.6570, hoyde_m: 1883 },
    ],
  },
  {
    navn: 'Besseggen',
    beskrivelse:
      'Populær ryggetur i Jotunheimen mellom Memurubu og Gjendesheim, med utsikt over det grønne Gjende og det blå Bessvatnet.',
    vanskelighetsgrad: 'krevende',
    lengde_km: 14.0,
    hoydemeter: 1100,
    omrade: 'Jotunheimen',
    waypoints: [
      { lat: 61.5617, lng: 8.7783, hoyde_m: 995 },
      { lat: 61.5570, lng: 8.7850, hoyde_m: 1250 },
      { lat: 61.5500, lng: 8.8000, hoyde_m: 1450 },
      { lat: 61.5430, lng: 8.7980, hoyde_m: 1743 },
      { lat: 61.5320, lng: 8.8040, hoyde_m: 1500 },
      { lat: 61.5180, lng: 8.8100, hoyde_m: 1200 },
      { lat: 61.5050, lng: 8.8080, hoyde_m: 1100 },
      { lat: 61.4896, lng: 8.8050, hoyde_m: 995 },
    ],
  },
  {
    navn: 'Preikestolen',
    beskrivelse:
      'Ikonisk klippeformasjon 604 moh. over Lysefjorden. Familievennlig dagstur fra Preikestolhytta.',
    vanskelighetsgrad: 'middels',
    lengde_km: 8.2,
    hoydemeter: 500,
    omrade: 'Rogaland',
    waypoints: [
      { lat: 58.9887, lng: 6.1040, hoyde_m: 270 },
      { lat: 58.9910, lng: 6.1100, hoyde_m: 380 },
      { lat: 58.9918, lng: 6.1250, hoyde_m: 500 },
      { lat: 58.9900, lng: 6.1450, hoyde_m: 570 },
      { lat: 58.9885, lng: 6.1700, hoyde_m: 600 },
      { lat: 58.9864, lng: 6.1901, hoyde_m: 604 },
    ],
  },
  {
    navn: 'Trolltunga',
    beskrivelse:
      'Lang og krevende tur til den berømte steinformasjonen som stikker ut over Ringedalsvatnet.',
    vanskelighetsgrad: 'krevende',
    lengde_km: 28.0,
    hoydemeter: 1200,
    omrade: 'Hardanger',
    waypoints: [
      { lat: 60.1089, lng: 6.6980, hoyde_m: 460 },
      { lat: 60.1160, lng: 6.7050, hoyde_m: 800 },
      { lat: 60.1220, lng: 6.7130, hoyde_m: 1100 },
      { lat: 60.1250, lng: 6.7180, hoyde_m: 1180 },
      { lat: 60.1260, lng: 6.7270, hoyde_m: 1140 },
      { lat: 60.1245, lng: 6.7350, hoyde_m: 1110 },
      { lat: 60.1242, lng: 6.7388, hoyde_m: 1100 },
    ],
  },
  {
    navn: 'Romsdalseggen',
    beskrivelse:
      'Dramatisk ryggetur over Romsdalen med utsikt mot Trollveggen og Romsdalshornet. Avsluttes ned til Åndalsnes.',
    vanskelighetsgrad: 'krevende',
    lengde_km: 10.0,
    hoydemeter: 970,
    omrade: 'Møre og Romsdal',
    waypoints: [
      { lat: 62.5760, lng: 7.7450, hoyde_m: 320 },
      { lat: 62.5720, lng: 7.7350, hoyde_m: 720 },
      { lat: 62.5700, lng: 7.7220, hoyde_m: 1216 },
      { lat: 62.5690, lng: 7.7050, hoyde_m: 1150 },
      { lat: 62.5680, lng: 7.6950, hoyde_m: 950 },
      { lat: 62.5675, lng: 7.6900, hoyde_m: 708 },
      { lat: 62.5690, lng: 7.6870, hoyde_m: 537 },
      { lat: 62.5686, lng: 7.6897, hoyde_m: 20 },
    ],
  },
  {
    navn: 'Galdhøpiggen via Juvasshytta',
    beskrivelse:
      'Tur til Norges høyeste fjelltopp (2469 moh.) over Styggebreen. Krever breutstyr og guide.',
    vanskelighetsgrad: 'krevende',
    lengde_km: 12.0,
    hoydemeter: 700,
    omrade: 'Jotunheimen',
    waypoints: [
      { lat: 61.6797, lng: 8.3531, hoyde_m: 1841 },
      { lat: 61.6720, lng: 8.3400, hoyde_m: 1950 },
      { lat: 61.6640, lng: 8.3300, hoyde_m: 2100 },
      { lat: 61.6560, lng: 8.3230, hoyde_m: 2250 },
      { lat: 61.6480, lng: 8.3190, hoyde_m: 2355 },
      { lat: 61.6364, lng: 8.3125, hoyde_m: 2469 },
    ],
  },
  {
    navn: 'Reinebringen',
    beskrivelse:
      'Kort, men bratt tur opp sherpatrappa til et av Lofotens mest fotograferte utsiktspunkt.',
    vanskelighetsgrad: 'middels',
    lengde_km: 2.0,
    hoydemeter: 448,
    omrade: 'Lofoten',
    waypoints: [
      { lat: 67.9325, lng: 13.0830, hoyde_m: 10 },
      { lat: 67.9340, lng: 13.0850, hoyde_m: 110 },
      { lat: 67.9355, lng: 13.0875, hoyde_m: 250 },
      { lat: 67.9370, lng: 13.0895, hoyde_m: 380 },
      { lat: 67.9389, lng: 13.0923, hoyde_m: 448 },
    ],
  },
  {
    navn: 'Kjerag',
    beskrivelse:
      'Platåtur til Kjeragbolten, en rund steinblokk klemt mellom to fjellsider 984 moh. over Lysefjorden.',
    vanskelighetsgrad: 'krevende',
    lengde_km: 11.0,
    hoydemeter: 570,
    omrade: 'Rogaland',
    waypoints: [
      { lat: 59.0155, lng: 6.5630, hoyde_m: 640 },
      { lat: 59.0190, lng: 6.5700, hoyde_m: 900 },
      { lat: 59.0220, lng: 6.5770, hoyde_m: 750 },
      { lat: 59.0265, lng: 6.5840, hoyde_m: 950 },
      { lat: 59.0310, lng: 6.5920, hoyde_m: 870 },
      { lat: 59.0345, lng: 6.5975, hoyde_m: 984 },
    ],
  },
];

async function seedTurstier() {
  for (const t of turstier) {
    const punkter = byggSti(t.waypoints, 60);

    const eksisterende = await prisma.tursti.findFirst({ where: { navn: t.navn } });

    if (eksisterende) {
      await prisma.tursti.update({
        where: { id: eksisterende.id },
        data: {
          beskrivelse: t.beskrivelse,
          vanskelighetsgrad: t.vanskelighetsgrad,
          lengde_km: t.lengde_km,
          hoydemeter: t.hoydemeter,
          omrade: t.omrade,
        },
      });
      await prisma.tursti_punkt.deleteMany({ where: { tursti_id: eksisterende.id } });
      await prisma.tursti_punkt.createMany({
        data: punkter.map((p, i) => ({
          tursti_id: eksisterende.id,
          rekkefolge: i + 1,
          lat: p.lat,
          lng: p.lng,
          hoyde_m: p.hoyde_m,
        })),
      });
    } else {
      await prisma.tursti.create({
        data: {
          navn: t.navn,
          beskrivelse: t.beskrivelse,
          vanskelighetsgrad: t.vanskelighetsgrad,
          lengde_km: t.lengde_km,
          hoydemeter: t.hoydemeter,
          omrade: t.omrade,
          tursti_punkt: {
            create: punkter.map((p, i) => ({
              rekkefolge: i + 1,
              lat: p.lat,
              lng: p.lng,
              hoyde_m: p.hoyde_m,
            })),
          },
        },
      });
    }

    console.log(`  - ${t.navn}: ${punkter.length} punkter`);
  }
}

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

  console.log('Seeder turstier:');
  await seedTurstier();

  console.log('Seed fullført.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
