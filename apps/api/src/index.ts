import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Demo-data
const tours = [
  {
    id: "t1",
    title: "Preikestolen",
    location: "Stavanger",
    region: "Vestlandet",
    difficulty: "Middels",
    distanceKm: 8,
    durationHours: 4,
    elevationM: 500,
    gear: ["Gode sko", "Vannflaske", "Vindjakke"],
  },
  {
    id: "t2",
    title: "Besseggen",
    location: "Jotunheimen",
    region: "Østlandet",
    difficulty: "Krevende",
    distanceKm: 14,
    durationHours: 7,
    elevationM: 1100,
    gear: ["Fjellsko", "Matpakke", "Ekstra klær"],
  },
  {
    id: "t3",
    title: "Geiranger",
    location: "Møre og Romsdal",
    region: "Vestlandet",
    difficulty: "Krevende",
    distanceKm: 10,
    durationHours: 5,
    elevationM: 700,
    gear: ["Fjellsko", "Regnjakke", "Vannflaske"],
  },
];

// Route
app.get("/tours/:id", (req: Request, res: Response) => {
  const tour = tours.find((t) => t.id === req.params.id);

  if (!tour) {
    return res.status(404).json({ message: "Fant ikke tur" });
  }

  res.json(tour);
});

// Test route (valgfri men nice)
app.get("/", (_req: Request, res: Response) => {
  res.send("API is running 🚀");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});