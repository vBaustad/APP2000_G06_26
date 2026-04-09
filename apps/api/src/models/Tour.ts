import mongoose from "mongoose";

const TourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      required: true,
      trim: true,
    },
    distanceKm: {
      type: Number,
      required: true,
    },
    durationHours: {
      type: Number,
      required: true,
    },
    elevationM: {
      type: Number,
      required: true,
    },
    gear: {
      type: [String],
      default: [],
    },

    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

TourSchema.index({ geometry: "2dsphere" });

export default mongoose.models.Tour || mongoose.model("Tour", TourSchema);