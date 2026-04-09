import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

FavoriteSchema.index({ userId: 1, tourId: 1 }, { unique: true });

export default mongoose.models.Favorite ||
  mongoose.model("Favorite", FavoriteSchema);