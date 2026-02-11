/**
 * Fil: mockTours.ts
 * Utvikler(e): Vebjørn Baustad, Ramona Cretulescu
 * Beskrivelse: Mock-data for turer brukt til visning av turkort
 * på Utforsk-siden (placeholder uten backend).
 */


export type Difficulty = "Lett" | "Middels" | "Krevende" | "Ekspert";

export type Region = "Nord-Norge" | "Trøndelag" | "Østlandet" | "Sørlandet" | "Vestlandet";

export type Tour = {
  id: string;
  title: string;
  location: string;
  distanceKm: number;     // km
  elevationM: number;     // høydemeter
  durationHours: number;  // ca. tid
  difficulty: Difficulty;
  gear: string[];         // klær/utstyr

  // NYE FELT
  region: Region;
  imageUrl?: string;

  // valgfri/legacy
  imageLabel?: string;    // til "IMAGE PLACEHOLDER"
};

export const mockTours: Tour[] = [
  {
    id: "t1",
    title: "Utopiatoppen Rundtur",
    location: "Nord-Utopia",
    region: "Nord-Norge",
    distanceKm: 8.2,
    elevationM: 520,
    durationHours: 4.5,
    difficulty: "Middels",
    gear: ["Fjellsko", "Regnjakke", "Drikkeflaske"],
    imageUrl: "/images/tours/fjelltur-1.jpg",
    imageLabel: "IMAGE PLACEHOLDER",
  },
  {
    id: "t2",
    title: "Skogstien ved Grønndalen",
    location: "Grønndalen",
    region: "Østlandet",
    distanceKm: 5.6,
    elevationM: 180,
    durationHours: 2.0,
    difficulty: "Lett",
    gear: ["Tursko", "Lett jakke"],
    imageUrl: "/images/tours/bergen-fjelloping.avif",
    imageLabel: "IMAGE PLACEHOLDER",
  },
  {
    id: "t3",
    title: "Fjellryggen til Vestvarden",
    location: "Vest-Utopia",
    region: "Vestlandet",
    distanceKm: 12.4,
    elevationM: 840,
    durationHours: 6.0,
    difficulty: "Krevende",
    gear: ["Fjellsko", "Vindjakke", "Lue", "Kart/Kompass"],
    imageUrl: "/images/tours/fjell-okt.avif",
    imageLabel: "IMAGE PLACEHOLDER",
  },
  {
    id: "t4",
    title: "Hytte-til-hytte: Solbu → Stormbu",
    location: "Sentral-Utopia",
    region: "Trøndelag",
    distanceKm: 14.0,
    elevationM: 650,
    durationHours: 5.5,
    difficulty: "Middels",
    gear: ["Fjellsko", "Hodelykt", "Matpakke"],
    imageUrl: "/images/tours/fjelltur-2.jpg",
    imageLabel: "IMAGE PLACEHOLDER",
  },
  {
    id: "t5",
    title: "Kyststien langs Utopiasundet",
    location: "Kysten",
    region: "Sørlandet",
    distanceKm: 9.8,
    elevationM: 120,
    durationHours: 3.0,
    difficulty: "Lett",
    gear: ["Tursko", "Vindjakke", "Solkrem"],
    imageUrl: "/images/tours/oslofjord.jpg",
    imageLabel: "IMAGE PLACEHOLDER",
  },
  {
    id: "t6",
    title: "Vintertur til Isvatnet",
    location: "Høylandet",
    region: "Trøndelag",
    distanceKm: 7.0,
    elevationM: 260,
    durationHours: 3.0,
    difficulty: "Middels",
    gear: ["Broddar", "Varm jakke", "Lue", "Hansker"],
    imageUrl: "/images/tours/1635176958-noedt-til-aa-loepe.avif",
    imageLabel: "IMAGE PLACEHOLDER",
  },
  {
    id: "t7",
    title: "Topptur: Ørnekammen",
    location: "Øst-Utopia",
    region: "Østlandet",
    distanceKm: 10.6,
    elevationM: 980,
    durationHours: 6.5,
    difficulty: "Krevende",
    gear: ["Fjellsko", "Vindjakke", "Førstehjelp", "Kart/Kompass"],
    imageUrl: "/images/tours/fjelltur-3.webp",
    imageLabel: "IMAGE PLACEHOLDER",
  },
  {
    id: "t8",
    title: "Familietur rundt Eventyrvannet",
    location: "Eventyrvannet",
    region: "Østlandet",
    distanceKm: 3.2,
    elevationM: 60,
    durationHours: 1.2,
    difficulty: "Lett",
    gear: ["Joggesko", "Snacks", "Drikke"],
    imageUrl: "/images/tours/floibanen.jpg",
    imageLabel: "IMAGE PLACEHOLDER",
  },
  {
    id: "t9",
    title: "Langtur: Utopiadalen på langs",
    location: "Utopiadalen",
    region: "Nord-Norge",
    distanceKm: 22.5,
    elevationM: 1100,
    durationHours: 9.0,
    difficulty: "Ekspert",
    gear: ["Fjellsko", "Ekstra klær", "Mat", "Hodelykt", "Kart/Kompass"],
    imageUrl: "/images/tours/geiranger.jpg",
    imageLabel: "IMAGE PLACEHOLDER",
  },
  {
    id: "t10",
    title: "Utsiktspunktet ved Skybrua",
    location: "Skybrua",
    region: "Vestlandet",
    distanceKm: 6.8,
    elevationM: 340,
    durationHours: 2.8,
    difficulty: "Middels",
    gear: ["Tursko", "Regnjakke"],
    imageUrl: "/images/tours/fjelltur-1.jpg",
    imageLabel: "IMAGE PLACEHOLDER",
  },
  {
    id: "t11",
    title: "Fossestien til Sølvfossen",
    location: "Sølvfossen",
    region: "Vestlandet",
    distanceKm: 4.9,
    elevationM: 210,
    durationHours: 2.0,
    difficulty: "Lett",
    gear: ["Tursko", "Regntøy"],
    imageUrl: "/images/tours/fjelltur-2.jpg",
    imageLabel: "IMAGE PLACEHOLDER",
  },
  {
    id: "t12",
    title: "Rundtur på Høyfjellsplatået",
    location: "Høyfjellet",
    region: "Nord-Norge",
    distanceKm: 15.7,
    elevationM: 720,
    durationHours: 7.0,
    difficulty: "Krevende",
    gear: ["Fjellsko", "Vindjakke", "Lue", "Kart/Kompass", "Drikke"],
    imageUrl: "/images/tours/fjell-okt.avif",
    imageLabel: "IMAGE PLACEHOLDER",
  },
];
