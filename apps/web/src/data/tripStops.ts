import { LatLngExpression } from 'leaflet';

export type TripStop = {
  id: string;
  name: string;
  city: string;
  country: string;
  dateRange: string;
  description: string;
  coords: LatLngExpression;
  highlights: string[];
};

export const tripStops: TripStop[] = [
  {
    id: 'besseggen-ridge',
    name: 'Besseggen og Gjende',
    city: 'Jotunheimen',
    country: 'Norge',
    dateRange: 'Juni-september',
    description: 'Klassisk fjelltur over Besseggen med bat til Memurubu og retur til Gjendesheim.',
    coords: [61.5049, 8.8143],
    highlights: ['Memurubu', 'Gjendesheim', 'Blaa Gjende']
  },
  {
    id: 'lofoten-hut-hop',
    name: 'Lofoten hytte-til-hytte',
    city: 'Svolvaer',
    country: 'Norge',
    dateRange: 'Mai-oktober',
    description: 'Tindebestigning og rorbuer fra Svolvaer til Reine med utsikt over Vestfjorden.',
    coords: [68.2349, 14.5683],
    highlights: ['Djevelporten', 'Reinebringen', 'Rorbuer']
  },
  {
    id: 'hardangervidda-cabin',
    name: 'Hardangervidda fra hytte til hytte',
    city: 'Finse',
    country: 'Norge',
    dateRange: 'Juli-september',
    description: 'Rolig vandring mellom DNT-hytter som Finsehytta, Kraekkja og Tuva.',
    coords: [60.6014, 7.5045],
    highlights: ['Finsehytta', 'Kraekkja', 'Tuva turisthytte']
  },
  {
    id: 'rondane-hiking',
    name: 'Rondane og Rondvassbu',
    city: 'Otta',
    country: 'Norge',
    dateRange: 'Juli-september',
    description: 'Toppturer til Rondslottet og kvelder ved Rondvassbu med kano og balpanne.',
    coords: [61.873, 9.7703],
    highlights: ['Rondslottet', 'Rondvassbu', 'Vinjeronden']
  },
  {
    id: 'trollheimen-cabins',
    name: 'Trollheimen villmark',
    city: 'Oppdal',
    country: 'Norge',
    dateRange: 'Juli-august',
    description: 'Hytteuke mellom Gjevilvasshytta, Trollheimshytta og Joldalshytta.',
    coords: [62.742, 9.143],
    highlights: ['Gjevilvasshytta', 'Trollheimshytta', 'Joldalshytta']
  },
  {
    id: 'femundsmarka-canoe',
    name: 'Femundsmarka kano og vandring',
    city: 'Elgaa',
    country: 'Norge',
    dateRange: 'Juni-august',
    description: 'Padling langs Femunden kombinert med korte vandringer inn til koier og teltplasser.',
    coords: [62.2864, 12.1133],
    highlights: ['Femund II', 'Svukuriset', 'Rovollen koie']
  }
];
