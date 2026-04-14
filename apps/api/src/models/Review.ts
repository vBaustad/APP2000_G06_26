import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Review ||
  mongoose.model("Review", ReviewSchema);
