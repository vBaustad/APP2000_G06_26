import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema(
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

    selectedDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["påmeldt", "avmeldt"],
      default: "påmeldt",
    },
  },
  {
    timestamps: true,
  }
);

RegistrationSchema.index(
  { userId: 1, tourId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "påmeldt" } }
);

export default mongoose.models.Registration ||
  mongoose.model("Registration", RegistrationSchema);
