import mongoose from "mongoose";

const TourSchema = new mongoose.Schema({
  title: String,
  location: String,
  region: String,
  difficulty: String,
  distanceKm: Number,
  durationHours: Number,
  elevationM: Number,
  gear: [String],
});

export default mongoose.model("Tour", TourSchema);