import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  await prisma.rolle.upsert({
    where: { kode: 'annonsor' },
    update: {},
    create: {
      kode: 'annonsor',
      navn: 'Annonsør',
      beskrivelse:
        'Kan opprette og administrere annonser i annonseportalen.',
    },
  });

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
