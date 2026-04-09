import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import turRoutes from "./routes/turRoutes";
import registrationRoutes from "./routes/registrationRoutes";

// LOAD ENV
dotenv.config();

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/tours", turRoutes);
app.use("/registrations", registrationRoutes);

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// CONNECT TO MONGODB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("🔥 Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB error:", error));

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});