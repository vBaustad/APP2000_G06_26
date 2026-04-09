import express from "express";
import Tour from "../models/Tour";

const router = express.Router();

// Hent alle turer
router.get("/", async (req, res) => {
  try {
    const tours = await Tour.find();
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: "Kunne ikke hente turer" });
  }
});

// Hent én tur
router.get("/:id", async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({ message: "Fant ikke turen" });
    }

    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: "Kunne ikke hente turen" });
  }
});

// Opprett ny tur
router.post("/", async (req, res) => {
  try {
    const newTour = new Tour(req.body);
    const savedTour = await newTour.save();
    res.status(201).json(savedTour);
  } catch (error) {
    res.status(400).json({ message: "Kunne ikke opprette tur" });
  }
});

// (VALGFRI) Slett tur
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Tour.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Fant ikke turen" });
    }

    res.json({ message: "Tur slettet" });
  } catch (error) {
    res.status(500).json({ message: "Kunne ikke slette tur" });
  }
});

export default router;