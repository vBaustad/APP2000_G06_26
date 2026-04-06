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

  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

TourSchema.index({ geometry: "2dsphere" });

export default mongoose.model("Tour", TourSchema);