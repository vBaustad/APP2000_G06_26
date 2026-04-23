/**
 * Fil: seed.ts
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu
 * Beskrivelse: Seed-logikk for APP2000-prosjektet. Oppretter testbrukere
 * (bruker1..bruker6 med passord "hemmelig"), hytter, turstier (basert på
 * reelle GPX-filer), turer (inkl. én fleksibel fellestur og én fellestur
 * med fast dato), samt enkle annonser for annonsørportalen.
 *
 * Eksporterer seedAll() som kjøres både fra CLI (prisma db seed) og fra
 * reset-endepunktet i adminRoutes.
 *
 * KI-bruk: Claude (Anthropic) og GitHub Copilot er brukt som verktøy
 * under utvikling. All kode er lest, forstått og testet. Se rapportens
 * kapittel "Kommentarer til bruk/tilpassing av kode".
 */

import { PrismaClient, TurType, TurStatus, TurDatoStatus, AnnonsorStatus, AnnonseStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import { parseGpxFile, downsample } from "./gpxParser";

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;
const TEST_PASSWORD = "hemmelig";

type TestbrukerSeed = {
  epost: string;
  fornavn: string;
  etternavn: string;
  roller: string[];
};

const testbrukere: TestbrukerSeed[] = [
  { epost: "bruker1@usn.no", fornavn: "Anne",    etternavn: "Admin",    roller: ["admin", "bruker"] },
  { epost: "bruker2@usn.no", fornavn: "Ola",     etternavn: "Turleder", roller: ["turleder", "bruker"] },
  { epost: "bruker3@usn.no", fornavn: "Kari",    etternavn: "Hytteeier",roller: ["hytteeier", "bruker"] },
  { epost: "bruker4@usn.no", fornavn: "Per",     etternavn: "Annonsør", roller: ["bruker", "annonsor"] },
  { epost: "bruker5@usn.no", fornavn: "Lise",    etternavn: "Bruker",   roller: ["bruker"] },
  { epost: "bruker6@usn.no", fornavn: "Sondre",  etternavn: "Bruker",   roller: ["bruker"] },
];

type HytteSeed = {
  navn: string;
  beskrivelse: string;
  omrade: string;
  lat: number;
  lng: number;
  hoyde_m: number | null;
  betjent: "betjent" | "selvbetjent" | "ubetjent";
  kapasitet_senger: number;
  maks_gjester: number;
  pris_per_natt: number;
  bilde_url: string | null;
  regler: string;
  fasiliteter: { kode: string; verdi: string }[];
};

const hytter: HytteSeed[] = [
  // Eksisterende hytter (fra DB-snapshot)
  {
    navn: "Gaustahytta",
    beskrivelse: "Hytte like ved Gaustatoppen med utsikt over Telemark.",
    omrade: "Telemark",
    lat: 59.85, lng: 8.6564, hoyde_m: 1830,
    betjent: "betjent",
    kapasitet_senger: 2, maks_gjester: 4, pris_per_natt: 550,
    bilde_url: "https://7p9j5kk10irx0asq.public.blob.vercel-storage.com/cabins/619c5086e7ea00cc8095c66fc8b36310.webp",
    regler: "Åpen i sommersesong og utvalgte vinterhelger.",
    fasiliteter: [
      { kode: "kjokken", verdi: "selvhushold" },
      { kode: "strom", verdi: "ja" },
      { kode: "vedovn", verdi: "ja" },
    ],
  },
  {
    navn: "Memurubu",
    beskrivelse: "Betjent turisthytte ved Gjende, kjent som start- eller endepunkt for Besseggen.",
    omrade: "Jotunheimen",
    lat: 61.5167, lng: 8.7833, hoyde_m: 1008,
    betjent: "betjent",
    kapasitet_senger: 14, maks_gjester: 16, pris_per_natt: 750,
    bilde_url: "https://7p9j5kk10irx0asq.public.blob.vercel-storage.com/cabins/0075d505b68366f339bbbf1928ef4627.webp",
    regler: "Båtforbindelse fra Gjendesheim. Ro etter kl. 23:00.",
    fasiliteter: [
      { kode: "kjokken", verdi: "felleskjøkken" },
      { kode: "dusj", verdi: "varmtvann" },
      { kode: "strom", verdi: "ja" },
    ],
  },
  {
    navn: "Tuva",
    beskrivelse: "Selvbetjent hytte midt på Hardangervidda, mellomstopp på hytte-til-hytte-turen etter etappe 2.",
    omrade: "Hardangervidda",
    lat: 60.1544, lng: 7.3206, hoyde_m: 1210,
    betjent: "selvbetjent",
    kapasitet_senger: 5, maks_gjester: 6, pris_per_natt: 350,
    bilde_url: "https://7p9j5kk10irx0asq.public.blob.vercel-storage.com/cabins/0207b3989271521b8838a0aa1789b6c6.webp",
    regler: "Ta med eget sengetøy. Rydd og lås etter deg.",
    fasiliteter: [
      { kode: "kjokken", verdi: "selvhushold" },
      { kode: "vedovn", verdi: "ja" },
    ],
  },
  {
    navn: "Krækkja",
    beskrivelse: "Selvbetjent hytte på Hardangervidda, første mellomstopp etter etappe 1.",
    omrade: "Hardangervidda",
    lat: 60.1357, lng: 7.2582, hoyde_m: 1220,
    betjent: "selvbetjent",
    kapasitet_senger: 20, maks_gjester: 24, pris_per_natt: 400,
    bilde_url: "/images/cabins/cszvwrcgoa2iqepidhxf.webp",
    regler: "Ta med eget sengetøy. Rydd etter deg.",
    fasiliteter: [
      { kode: "kjokken", verdi: "selvhushold" },
      { kode: "vedovn", verdi: "ja" },
    ],
  },
  {
    navn: "Finsehytta",
    beskrivelse: "Stor betjent turisthytte ved Finse stasjon, nordkanten av Hardangervidda.",
    omrade: "Hardangervidda",
    lat: 60.6019, lng: 7.5017, hoyde_m: 1222,
    betjent: "betjent",
    kapasitet_senger: 80, maks_gjester: 100, pris_per_natt: 800,
    bilde_url: "/images/cabins/eg51jvwhhgz67xxzvvws.webp",
    regler: "Servering av frokost og middag. Ro etter 23:00.",
    fasiliteter: [
      { kode: "kjokken", verdi: "felleskjøkken" },
      { kode: "dusj", verdi: "varmtvann" },
      { kode: "strom", verdi: "ja" },
    ],
  },
  {
    navn: "Solgløtt",
    beskrivelse: "Liten hytte med god utsikt, egnet for kortere besøk.",
    omrade: "Utopiafjella",
    lat: 61.613252, lng: 9.09668, hoyde_m: 900,
    betjent: "selvbetjent",
    kapasitet_senger: 4, maks_gjester: 6, pris_per_natt: 300,
    bilde_url: "/images/cabins/l8svnzsf0vjklk02jq3h.webp",
    regler: "Ta med eget sengetøy.",
    fasiliteter: [
      { kode: "vedovn", verdi: "ja" },
    ],
  },
  // Nye hytter plassert langs Sandhaug→Litlos-ruta (koordinater fra GPX-endepunkter)
  {
    navn: "Sandhaug turisthytte",
    beskrivelse: "Selvbetjent hytte på Hardangervidda, startpunkt for hytte-til-hytte-etappene mot Litlos.",
    omrade: "Hardangervidda",
    lat: 60.0938, lng: 7.1371, hoyde_m: 1250,
    betjent: "selvbetjent",
    kapasitet_senger: 30, maks_gjester: 36, pris_per_natt: 400,
    bilde_url: "/images/cabins/p0dxka7pcwkg4d17ccbg.webp",
    regler: "Ta med eget sengetøy. Ved- og gasskomfyr tilgjengelig.",
    fasiliteter: [
      { kode: "kjokken", verdi: "selvhushold" },
      { kode: "vedovn", verdi: "ja" },
    ],
  },
  {
    navn: "Litlos turisthytte",
    beskrivelse: "Betjent hytte på Hardangervidda, endepunkt for fellestur-etappene.",
    omrade: "Hardangervidda",
    lat: 60.1843, lng: 7.4813, hoyde_m: 1182,
    betjent: "betjent",
    kapasitet_senger: 25, maks_gjester: 30, pris_per_natt: 700,
    bilde_url: "/images/cabins/u0wj3hct0e98ocz1bqwy.webp",
    regler: "Betjent sommer og påske. Middag og frokost inkludert.",
    fasiliteter: [
      { kode: "kjokken", verdi: "felleskjøkken" },
      { kode: "dusj", verdi: "varmtvann" },
      { kode: "strom", verdi: "ja" },
    ],
  },
];

type TurstiSeed = {
  key: string;              // intern referanse for turer
  navn: string;
  beskrivelse: string;
  vanskelighetsgrad: string;
  lengde_km: number;
  hoydemeter: number;
  omrade: string;
  gpxFile: string;
  targetPoints: number;
  // Valgfritt: kutt ut en del av GPX-ruten (fraksjoner 0..1) for å dele
  // en lang rute opp i flere stier.
  gpxSliceStart?: number;
  gpxSliceEnd?: number;
};

const turstier: TurstiSeed[] = [
  // Sandhaug → Litlos deles i tre etapper (tredelt GPX) slik at fellestur-
  // deltakere har mellomstopp på hytter etter hver etappe.
  {
    key: "sandhaug-etappe1",
    navn: "Etappe 1 · Sandhaug → Krækkja",
    beskrivelse: "Første etappe av hytte-til-hytte-turen over Hardangervidda.",
    vanskelighetsgrad: "Krevende",
    lengde_km: 7,
    hoydemeter: 150,
    omrade: "Hardangervidda",
    gpxFile: "fra-sandhaug-til-litlos--route.gpx",
    gpxSliceStart: 0,
    gpxSliceEnd: 1 / 3,
    targetPoints: 40,
  },
  {
    key: "sandhaug-etappe2",
    navn: "Etappe 2 · Krækkja → Tuva",
    beskrivelse: "Andre etappe fra Krækkja videre sørover til Tuva.",
    vanskelighetsgrad: "Krevende",
    lengde_km: 8,
    hoydemeter: 120,
    omrade: "Hardangervidda",
    gpxFile: "fra-sandhaug-til-litlos--route.gpx",
    gpxSliceStart: 1 / 3,
    gpxSliceEnd: 2 / 3,
    targetPoints: 40,
  },
  {
    key: "sandhaug-etappe3",
    navn: "Etappe 3 · Tuva → Litlos",
    beskrivelse: "Siste etappe ender på Litlos turisthytte.",
    vanskelighetsgrad: "Krevende",
    lengde_km: 7,
    hoydemeter: 80,
    omrade: "Hardangervidda",
    gpxFile: "fra-sandhaug-til-litlos--route.gpx",
    gpxSliceStart: 2 / 3,
    gpxSliceEnd: 1,
    targetPoints: 40,
  },
  {
    key: "varlivarden",
    navn: "Vårlivarden fra Nodhagen",
    beskrivelse: "Populær fottur i Ryfylke med flott panorama over fjord og fjell.",
    vanskelighetsgrad: "Middels",
    lengde_km: 11,
    hoydemeter: 700,
    omrade: "Rogaland",
    gpxFile: "fottur-til-v-rlivarden-fra-nodhagen--trip.gpx",
    targetPoints: 60,
  },
  {
    key: "hamregruva",
    navn: "Fottur til Hamregruva",
    beskrivelse: "Kort og lettgått tur til gammel gruveoppgang, fin for hele familien.",
    vanskelighetsgrad: "Lett",
    lengde_km: 3,
    hoydemeter: 120,
    omrade: "Agder",
    gpxFile: "fottur-til-hamregruva-trip.gpx",
    targetPoints: 35,
  },
  {
    key: "storsmeden",
    navn: "Topptur til Storsmeden",
    beskrivelse: "Fra Rondvassbu opp til Storsmeden 2016 moh. Krever god form og fast fottøy.",
    vanskelighetsgrad: "Ekspert",
    lengde_km: 8,
    hoydemeter: 900,
    omrade: "Rondane",
    gpxFile: "topptur-til-storsmeden-2016-moh-fra-rondvassbu-trip.gpx",
    targetPoints: 80,
  },
  {
    key: "hovstoyl-skitur",
    navn: "Skitur til Hovstøyl",
    beskrivelse: "Fin skitur fra Hallbjørnsekken med moderat stigning.",
    vanskelighetsgrad: "Middels",
    lengde_km: 6,
    hoydemeter: 250,
    omrade: "Telemark",
    gpxFile: "skitur-til-hovst-yl-fra-hallbj-rnsekken-trip.gpx",
    targetPoints: 18,
  },
  {
    key: "reisadalen",
    navn: "Reisadalen historisk vandrerute",
    beskrivelse: "Lang historisk rute mellom Saraelv og Ráisjávri i Reisa nasjonalpark.",
    vanskelighetsgrad: "Krevende",
    lengde_km: 24,
    hoydemeter: 400,
    omrade: "Troms",
    gpxFile: "reisadalen-historisk-vandrerute-saraelv-r-isj-vri--trip.gpx",
    targetPoints: 80,
  },
  {
    key: "nordryggen",
    navn: "Nordryggen Geotrail",
    beskrivelse: "Del av «Norge på langs» — geotrail langs sørlige ryggen i Agder.",
    vanskelighetsgrad: "Ekspert",
    lengde_km: 35,
    hoydemeter: 800,
    omrade: "Agder",
    gpxFile: "norge-p-langs-langs-nordryggen-geotrail-trip.gpx",
    targetPoints: 100,
  },
  {
    key: "bleskestadmoen-krossvatn",
    navn: "Bleskestadmoen til Krossvatn",
    beskrivelse: "Rolig rute gjennom furuskog og myrområder i Ryfylke-heiane.",
    vanskelighetsgrad: "Middels",
    lengde_km: 10,
    hoydemeter: 350,
    omrade: "Rogaland",
    gpxFile: "fra-bleskestadmoen-til-krossvatn--route.gpx",
    targetPoints: 60,
  },
  {
    key: "engan-motdalshytta",
    navn: "Engan til Åmotdalshytta",
    beskrivelse: "Hytte-til-hytte i Trollheimen. Lang dagsetappe med variert landskap.",
    vanskelighetsgrad: "Krevende",
    lengde_km: 20,
    hoydemeter: 600,
    omrade: "Trøndelag",
    gpxFile: "fra-engan-til-motdalshytta--route.gpx",
    targetPoints: 100,
  },
  {
    key: "fiskefjorden-haakonsbu",
    navn: "Fiskefjorden til Håkonsbu",
    beskrivelse: "Nord-norsk fjell- og fjordtur fra Fiskefjorden innover til Håkonsbu.",
    vanskelighetsgrad: "Krevende",
    lengde_km: 18,
    hoydemeter: 700,
    omrade: "Nordland",
    gpxFile: "fra-fiskefjorden-til-haakonsbu--route.gpx",
    targetPoints: 100,
  },
  {
    key: "geiterygghytta-kongshelleren",
    navn: "Geiterygghytta til Kongshelleren",
    beskrivelse: "Kort, vakker etappe på nordre Hardangervidda.",
    vanskelighetsgrad: "Middels",
    lengde_km: 5,
    hoydemeter: 200,
    omrade: "Hardangervidda",
    gpxFile: "fra-geiterygghytta-til-kongshelleren--route.gpx",
    targetPoints: 60,
  },
  {
    key: "halgutusveen-oyungshytta",
    navn: "Halgutusveen til Øyungshytta",
    beskrivelse: "Fin skogs- og heietur med god variasjon i terrenget.",
    vanskelighetsgrad: "Middels",
    lengde_km: 12,
    hoydemeter: 300,
    omrade: "Innlandet",
    gpxFile: "fra-halgutusveen-til-yungshytta--route.gpx",
    targetPoints: 80,
  },
  {
    key: "holsbru-vestfjellhytta",
    navn: "Holsbru til Vestfjellhytta",
    beskrivelse: "Høyfjellsetappe med utsikt mot Jotunheimen.",
    vanskelighetsgrad: "Krevende",
    lengde_km: 15,
    hoydemeter: 500,
    omrade: "Innlandet",
    gpxFile: "fra-holsbru-til-vestfjellhytta--route.gpx",
    targetPoints: 100,
  },
  {
    key: "jonstolen-bleskestadmoen",
    navn: "Jonstølen til Bleskestadmoen",
    beskrivelse: "Kort forbindelse mellom to populære turisthytter.",
    vanskelighetsgrad: "Lett",
    lengde_km: 7,
    hoydemeter: 250,
    omrade: "Rogaland",
    gpxFile: "fra-jonst-len-til-bleskestadmoen--route.gpx",
    targetPoints: 60,
  },
  {
    key: "jonstolen-krossvatn-ost",
    navn: "Jonstølen til Krossvatn (øst for Skoranutane)",
    beskrivelse: "Alternativ rute øst om Skoranutane, passer når vest-traseen er dårlig.",
    vanskelighetsgrad: "Middels",
    lengde_km: 13,
    hoydemeter: 400,
    omrade: "Rogaland",
    gpxFile: "fra-jonst-len-til-krossvatn-via-st-for-skoranutane-route.gpx",
    targetPoints: 80,
  },
  {
    key: "lonsstua-storjordstua",
    navn: "Lønsstua til Storjordstua/Nystadnesstua",
    beskrivelse: "Hytte-til-hytte i Saltfjellet–Svartisen nasjonalpark.",
    vanskelighetsgrad: "Krevende",
    lengde_km: 22,
    hoydemeter: 500,
    omrade: "Nordland",
    gpxFile: "fra-l-nsstua-til-storjordstua-nystadnesstua--route.gpx",
    targetPoints: 100,
  },
  {
    key: "otterstein-nipebu",
    navn: "Otterstein til Nipebu",
    beskrivelse: "Vestlandstur med fjordutsikt og myke skogsbunner.",
    vanskelighetsgrad: "Middels",
    lengde_km: 9,
    hoydemeter: 450,
    omrade: "Vestland",
    gpxFile: "fra-otterstein-til-nipebu--route.gpx",
    targetPoints: 80,
  },
  {
    key: "skulneset-bjellavasstua",
    navn: "Skulneset til Bjellåvasstua (via Djupvatnet)",
    beskrivelse: "Nordlandstur gjennom Tollådalen og forbi Djupvatnet.",
    vanskelighetsgrad: "Krevende",
    lengde_km: 14,
    hoydemeter: 450,
    omrade: "Nordland",
    gpxFile: "fra-skulneset-toll-dalen-til-bjell-vasstua-via-djupvatnet-route.gpx",
    targetPoints: 80,
  },
  {
    key: "gjelafuro",
    navn: "Gjelafuro",
    beskrivelse: "Kort og grei lokal tur i Vestland.",
    vanskelighetsgrad: "Lett",
    lengde_km: 4,
    hoydemeter: 150,
    omrade: "Vestland",
    gpxFile: "gjelafuro-trip.gpx",
    targetPoints: 40,
  },
];

/**
 * Slett alt data som reset-endepunktet skal nullstille. Kjører i riktig
 * rekkefølge for å respektere foreign keys. Roller beholdes.
 */
export async function clearAllData() {
  await prisma.$transaction([
    prisma.annonse_event.deleteMany(),
    prisma.annonse.deleteMany(),
    prisma.annonsor.deleteMany(),
    prisma.melding_bilde_godkjenning.deleteMany(),
    prisma.melding_bilde.deleteMany(),
    prisma.melding.deleteMany(),
    prisma.chat_medlem.deleteMany(),
    prisma.chat.deleteMany(),
    prisma.tur_pamelding.deleteMany(),
    prisma.tur_dato_hytte.deleteMany(),
    prisma.tur_dato.deleteMany(),
    prisma.tur_hytte.deleteMany(),
    prisma.tur_tursti.deleteMany(),
    prisma.tur_kommentar.deleteMany(),
    prisma.tur_rating.deleteMany(),
    prisma.favoritt.deleteMany(),
    prisma.tur.deleteMany(),
    prisma.tursti_punkt.deleteMany(),
    prisma.tursti.deleteMany(),
    prisma.hytte_kommentar.deleteMany(),
    prisma.hytte_rating.deleteMany(),
    prisma.hytte_booking.deleteMany(),
    prisma.hytte_fasilitet.deleteMany(),
    prisma.hytte.deleteMany(),
    prisma.bruker_rolle.deleteMany(),
    prisma.bruker.deleteMany(),
  ]);
}

async function seedRoller() {
  const roller = [
    { kode: "admin",     navn: "Administrator", beskrivelse: "Redaktør med full tilgang." },
    { kode: "bruker",    navn: "Bruker",        beskrivelse: "Vanlig innlogget bruker." },
    { kode: "turleder",  navn: "Turleder",      beskrivelse: "Kan opprette og lede fellesturer." },
    { kode: "hytteeier", navn: "Hytteeier",     beskrivelse: "Eier én eller flere hytter." },
    { kode: "annonsor",  navn: "Annonsør",      beskrivelse: "Kan opprette og administrere annonser." },
  ];
  for (const r of roller) {
    await prisma.rolle.upsert({ where: { kode: r.kode }, update: {}, create: r });
  }
}

async function seedTestbrukere() {
  const hash = await bcrypt.hash(TEST_PASSWORD, BCRYPT_ROUNDS);
  const brukerIds: Record<string, number> = {};

  for (const u of testbrukere) {
    const bruker = await prisma.bruker.create({
      data: {
        epost: u.epost,
        fornavn: u.fornavn,
        etternavn: u.etternavn,
        passord_hash: hash,
      },
    });
    brukerIds[u.epost] = bruker.id;

    for (const rolleKode of u.roller) {
      const rolle = await prisma.rolle.findUnique({ where: { kode: rolleKode } });
      if (!rolle) continue;
      await prisma.bruker_rolle.create({
        data: { bruker_id: bruker.id, rolle_id: rolle.id },
      });
    }
  }

  return brukerIds;
}

async function seedHytter(hytteeierId: number) {
  const hytteIds: Record<string, number> = {};

  for (const h of hytter) {
    const hytte = await prisma.hytte.create({
      data: {
        eier_bruker_id: hytteeierId,
        navn: h.navn,
        beskrivelse: h.beskrivelse,
        omrade: h.omrade,
        lat: h.lat,
        lng: h.lng,
        hoyde_m: h.hoyde_m,
        betjent: h.betjent,
        kapasitet_senger: h.kapasitet_senger,
        maks_gjester: h.maks_gjester,
        pris_per_natt: h.pris_per_natt,
        bilde_url: h.bilde_url,
        regler: h.regler,
      },
    });
    hytteIds[h.navn] = hytte.id;

    if (h.fasiliteter.length > 0) {
      await prisma.hytte_fasilitet.createMany({
        data: h.fasiliteter.map((f) => ({
          hytte_id: hytte.id,
          kode: f.kode,
          verdi: f.verdi,
        })),
      });
    }
  }

  return hytteIds;
}

async function seedTurstier() {
  const turstiIds: Record<string, number> = {};

  for (const ts of turstier) {
    const parsed = parseGpxFile(ts.gpxFile);
    const startIdx = Math.floor(parsed.length * (ts.gpxSliceStart ?? 0));
    const endIdx = Math.max(
      startIdx + 2,
      Math.floor(parsed.length * (ts.gpxSliceEnd ?? 1)),
    );
    const sliced = parsed.slice(startIdx, endIdx);
    const punkter = downsample(sliced, ts.targetPoints);

    const tursti = await prisma.tursti.create({
      data: {
        navn: ts.navn,
        beskrivelse: ts.beskrivelse,
        vanskelighetsgrad: ts.vanskelighetsgrad,
        lengde_km: ts.lengde_km,
        hoydemeter: ts.hoydemeter,
        omrade: ts.omrade,
      },
    });
    turstiIds[ts.key] = tursti.id;

    if (punkter.length > 0) {
      await prisma.tursti_punkt.createMany({
        data: punkter.map((p, i) => ({
          tursti_id: tursti.id,
          rekkefolge: i + 1,
          lat: p.lat,
          lng: p.lng,
          hoyde_m: p.hoyde_m ?? null,
        })),
      });
    }
  }

  return turstiIds;
}

type TurSeed = {
  tittel: string;
  beskrivelse: string;
  type: TurType;
  vanskelighetsgrad: string;
  varighet_timer: number;
  omrade: string;
  antall_netter: number | null;
  min_deltakere: number | null;
  max_deltakere: number | null;
  turstiKeys: string[];
  hytteNavn: string[];
  datoer: { tittel: string | null; start: Date; end: Date; status?: TurDatoStatus }[];
  er_selvgaende: boolean;
};

function dagerFraNa(dager: number, startHour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() + dager);
  d.setHours(startHour, 0, 0, 0);
  return d;
}

const turer: TurSeed[] = [
  {
    tittel: "Hardangervidda hytte-til-hytte",
    beskrivelse:
      "Fleksibel fellestur fra Sandhaug via Krækkja og Tuva til Litlos. Fire hytter langs ruta, flere datoalternativer — vi velger den med best vær og nok påmeldte.",
    type: TurType.fottur,
    vanskelighetsgrad: "Krevende",
    varighet_timer: 24,
    omrade: "Hardangervidda",
    antall_netter: 3,
    min_deltakere: 4,
    max_deltakere: 12,
    turstiKeys: ["sandhaug-etappe1", "sandhaug-etappe2", "sandhaug-etappe3"],
    hytteNavn: ["Sandhaug turisthytte", "Krækkja", "Tuva", "Litlos turisthytte"],
    datoer: [
      { tittel: "Alternativ A — midten av juli", start: dagerFraNa(30, 8), end: dagerFraNa(32, 17) },
      { tittel: "Alternativ B — slutten av juli", start: dagerFraNa(45, 8), end: dagerFraNa(47, 17) },
      { tittel: "Alternativ C — begynnelsen av august", start: dagerFraNa(60, 8), end: dagerFraNa(62, 17) },
    ],
    er_selvgaende: false,
  },
  {
    tittel: "Vårlivarden fellestur",
    beskrivelse: "Dagstur opp til Vårlivarden i Ryfylke. Fast dato, kom-og-gå-klar om morgenen.",
    type: TurType.fottur,
    vanskelighetsgrad: "Middels",
    varighet_timer: 6,
    omrade: "Rogaland",
    antall_netter: 0,
    min_deltakere: 3,
    max_deltakere: 15,
    turstiKeys: ["varlivarden"],
    hytteNavn: [],
    datoer: [
      {
        tittel: "Gjennomført høstutgave",
        start: dagerFraNa(-60, 9),
        end: dagerFraNa(-60, 16),
        status: TurDatoStatus.locked,
      },
      { tittel: null, start: dagerFraNa(21, 9), end: dagerFraNa(21, 16) },
    ],
    er_selvgaende: false,
  },
  {
    tittel: "Besseggen sommer-klassiker (gjennomført)",
    beskrivelse:
      "Tidligere gjennomført fellestur for demonstrasjon av arkivert/historisk status. Ingen aktive datoer igjen.",
    type: TurType.fottur,
    vanskelighetsgrad: "Krevende",
    varighet_timer: 9,
    omrade: "Jotunheimen",
    antall_netter: 0,
    min_deltakere: 5,
    max_deltakere: 20,
    turstiKeys: ["hamregruva"],
    hytteNavn: ["Memurubu"],
    datoer: [
      {
        tittel: "Sommerutgave 2025",
        start: dagerFraNa(-120, 8),
        end: dagerFraNa(-120, 18),
        status: TurDatoStatus.locked,
      },
    ],
    er_selvgaende: false,
  },
  {
    tittel: "Fottur til Hamregruva",
    beskrivelse: "Kort og familievennlig tur til gammel gruveoppgang.",
    type: TurType.fottur,
    vanskelighetsgrad: "Lett",
    varighet_timer: 2,
    omrade: "Agder",
    antall_netter: 0,
    min_deltakere: null,
    max_deltakere: null,
    turstiKeys: ["hamregruva"],
    hytteNavn: [],
    datoer: [],
    er_selvgaende: true,
  },
  {
    tittel: "Topptur til Storsmeden",
    beskrivelse: "Krevende topptur fra Rondvassbu. Krev god form og fast fottøy.",
    type: TurType.fottur,
    vanskelighetsgrad: "Ekspert",
    varighet_timer: 7,
    omrade: "Rondane",
    antall_netter: 0,
    min_deltakere: null,
    max_deltakere: null,
    turstiKeys: ["storsmeden"],
    hytteNavn: [],
    datoer: [],
    er_selvgaende: true,
  },
  {
    tittel: "Skitur til Hovstøyl",
    beskrivelse: "Fin skitur med moderat stigning, for deg med litt erfaring på ski.",
    type: TurType.ski,
    vanskelighetsgrad: "Middels",
    varighet_timer: 4,
    omrade: "Telemark",
    antall_netter: 0,
    min_deltakere: null,
    max_deltakere: null,
    turstiKeys: ["hovstoyl-skitur"],
    hytteNavn: [],
    datoer: [],
    er_selvgaende: true,
  },
  {
    tittel: "Reisadalen historisk rute",
    beskrivelse:
      "Lang fottur langs historisk vandrerute i Reisa nasjonalpark i Troms. Krever planlegging og erfaring.",
    type: TurType.fottur,
    vanskelighetsgrad: "Krevende",
    varighet_timer: 12,
    omrade: "Troms",
    antall_netter: 1,
    min_deltakere: null,
    max_deltakere: null,
    turstiKeys: ["reisadalen"],
    hytteNavn: [],
    datoer: [],
    er_selvgaende: true,
  },
  {
    tittel: "Trollheimen fellestur",
    beskrivelse:
      "Tre-dagers fellestur fra Engan til Åmotdalshytta i hjertet av Trollheimen. Bindende påmelding — leder avgjør dato etter værmelding.",
    type: TurType.fottur,
    vanskelighetsgrad: "Krevende",
    varighet_timer: 16,
    omrade: "Trøndelag",
    antall_netter: 2,
    min_deltakere: 4,
    max_deltakere: 10,
    turstiKeys: ["engan-motdalshytta"],
    hytteNavn: [],
    datoer: [
      { tittel: "Forslag A — midtsommer", start: dagerFraNa(40, 9), end: dagerFraNa(42, 17) },
      { tittel: "Forslag B — august", start: dagerFraNa(70, 9), end: dagerFraNa(72, 17) },
    ],
    er_selvgaende: false,
  },
  {
    tittel: "Fiskefjorden til Håkonsbu",
    beskrivelse: "Vandretur i Nordland fra fjord til fjell. Egnet for erfarne turgåere.",
    type: TurType.fottur,
    vanskelighetsgrad: "Krevende",
    varighet_timer: 10,
    omrade: "Nordland",
    antall_netter: 0,
    min_deltakere: null,
    max_deltakere: null,
    turstiKeys: ["fiskefjorden-haakonsbu"],
    hytteNavn: [],
    datoer: [],
    er_selvgaende: true,
  },
  {
    tittel: "Ryfylke rundtur (Jonstølen-Bleskestadmoen-Krossvatn)",
    beskrivelse:
      "Sammensatt tur over to etapper: først fra Jonstølen til Bleskestadmoen, så videre til Krossvatn.",
    type: TurType.fottur,
    vanskelighetsgrad: "Middels",
    varighet_timer: 8,
    omrade: "Rogaland",
    antall_netter: 1,
    min_deltakere: null,
    max_deltakere: null,
    turstiKeys: ["jonstolen-bleskestadmoen", "bleskestadmoen-krossvatn"],
    hytteNavn: [],
    datoer: [],
    er_selvgaende: true,
  },
  {
    tittel: "Gjelafuro dagstur",
    beskrivelse: "Kort og familievennlig tur i Vestland.",
    type: TurType.fottur,
    vanskelighetsgrad: "Lett",
    varighet_timer: 2,
    omrade: "Vestland",
    antall_netter: 0,
    min_deltakere: null,
    max_deltakere: null,
    turstiKeys: ["gjelafuro"],
    hytteNavn: [],
    datoer: [],
    er_selvgaende: true,
  },
  {
    tittel: "Saltfjellet fellestur",
    beskrivelse:
      "Hytte-til-hytte-tur i Saltfjellet–Svartisen nasjonalpark. Fast dato.",
    type: TurType.fottur,
    vanskelighetsgrad: "Krevende",
    varighet_timer: 14,
    omrade: "Nordland",
    antall_netter: 1,
    min_deltakere: 4,
    max_deltakere: 12,
    turstiKeys: ["lonsstua-storjordstua"],
    hytteNavn: [],
    datoer: [
      { tittel: null, start: dagerFraNa(50, 9), end: dagerFraNa(51, 17) },
    ],
    er_selvgaende: false,
  },
  {
    tittel: "Otterstein til Nipebu",
    beskrivelse: "Vestlandstur med fjordutsikt og myke skogsbunner.",
    type: TurType.fottur,
    vanskelighetsgrad: "Middels",
    varighet_timer: 5,
    omrade: "Vestland",
    antall_netter: 0,
    min_deltakere: null,
    max_deltakere: null,
    turstiKeys: ["otterstein-nipebu"],
    hytteNavn: [],
    datoer: [],
    er_selvgaende: true,
  },
];

async function seedTurer(
  turlederId: number,
  turstiIds: Record<string, number>,
  hytteIds: Record<string, number>,
) {
  for (const t of turer) {
    const tur = await prisma.tur.create({
      data: {
        tittel: t.tittel,
        beskrivelse: t.beskrivelse,
        type: t.type,
        vanskelighetsgrad: t.vanskelighetsgrad,
        varighet_timer: t.varighet_timer,
        omrade: t.omrade,
        antall_netter: t.antall_netter,
        min_deltakere: t.min_deltakere,
        max_deltakere: t.max_deltakere,
        status: TurStatus.published,
        leder_bruker_id: turlederId,
        er_selvgaende: t.er_selvgaende,
      },
    });

    for (let i = 0; i < t.turstiKeys.length; i++) {
      const tursti_id = turstiIds[t.turstiKeys[i]];
      if (!tursti_id) continue;
      await prisma.tur_tursti.create({
        data: { tur_id: tur.id, tursti_id, rekkefolge: i + 1 },
      });
    }

    for (let i = 0; i < t.hytteNavn.length; i++) {
      const hytte_id = hytteIds[t.hytteNavn[i]];
      if (!hytte_id) continue;
      await prisma.tur_hytte.create({
        data: { tur_id: tur.id, hytte_id, rekkefolge: i + 1 },
      });
    }

    for (const d of t.datoer) {
      await prisma.tur_dato.create({
        data: {
          tur_id: tur.id,
          tittel: d.tittel,
          start_at: d.start,
          end_at: d.end,
          status: d.status ?? TurDatoStatus.planned,
        },
      });
    }
  }
}

async function seedAnnonser(annonsorBrukerEpost: string) {
  const annonsor = await prisma.annonsor.create({
    data: {
      navn: "Per's turutstyr AS",
      epost: annonsorBrukerEpost,
      telefon: "+47 99 99 99 99",
      status: AnnonsorStatus.approved,
    },
  });

  const start = new Date("2026-04-15T00:00:00Z");
  const end = new Date("2026-08-25T23:59:59Z");

  await prisma.annonse.createMany({
    data: [
      {
        annonsor_id: annonsor.id,
        tittel: "Tilbud: fjellsko fra Salomon",
        beskrivelse: "Robuste fjellsko til rabattert pris. Alle størrelser på lager.",
        bilde_url: "/images/ads/annonse-1.png",
        lenke_url: "https://www.salomon.com/",
        kategori: "turutstyr",
        keywords: "Turutstyr",
        status: AnnonseStatus.active,
        start_at: start,
        end_at: end,
        pris_per_visning: 0,
        pris_per_klikk: 5,
        daily_budget: 300,
      },
      {
        annonsor_id: annonsor.id,
        tittel: "Naturkompaniet — alt for friluftslivet",
        beskrivelse: "Kvalitetsutstyr til tur og friluftsliv, fra sekker til sovepose.",
        bilde_url: "/images/ads/annonse-2.jpg",
        lenke_url: "https://www.naturkompaniet.no/",
        kategori: "turutstyr",
        keywords: "Turutstyr, butikk",
        status: AnnonseStatus.active,
        start_at: start,
        end_at: end,
        pris_per_visning: 0,
        pris_per_klikk: 4,
        daily_budget: 200,
      },
      {
        annonsor_id: annonsor.id,
        tittel: "Bergans — jakker for alle turer",
        beskrivelse: "Vanntette og pustende jakker som holder deg tørr uansett vær.",
        bilde_url: "/images/ads/annonse-3.jpg",
        lenke_url: "https://www.bergans.com/",
        kategori: "turutstyr",
        keywords: "Turutstyr, klær",
        status: AnnonseStatus.active,
        start_at: start,
        end_at: end,
        pris_per_visning: 0,
        pris_per_klikk: 6,
        daily_budget: 250,
      },
    ],
  });
}

/**
 * Hovedseed-funksjon. Kan kjøres fra CLI (prisma db seed) eller kalles
 * fra reset-endepunktet etter clearAllData().
 */
export async function seedAll() {
  await seedRoller();
  const brukerIds = await seedTestbrukere();

  const hytteeierId = brukerIds["bruker3@usn.no"];
  const turlederId = brukerIds["bruker2@usn.no"];

  const hytteIds = await seedHytter(hytteeierId);
  const turstiIds = await seedTurstier();
  await seedTurer(turlederId, turstiIds, hytteIds);
  await seedAnnonser("bruker4@usn.no");
}

/**
 * CLI-entrypoint: renser alt og kjører seedAll på nytt.
 */
export async function runSeedCli() {
  console.log("Kjører seed...");
  await clearAllData();
  await seedAll();
  console.log("Seed fullført.");
  await prisma.$disconnect();
}

export { prisma };
