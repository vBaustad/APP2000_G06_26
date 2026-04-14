import express from "express";
import Review from "../models/Review";

const router = express.Router();

// GET 
router.get("/:tourId", async (req, res) => {
  try {
    const reviews = await Review.find({ tourId: req.params.tourId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Kunne ikke hente anmeldelser" });
  }
});

// PoOST
router.post("/", async (req, res) => {
  try {
    const { tourId, name, rating, text } = req.body;

    const newReview = new Review({
      tourId,
      name,
      rating,
      text,
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(400).json({ message: "Kunne ikke lagre anmeldelse" });
  }
});

export default router;
