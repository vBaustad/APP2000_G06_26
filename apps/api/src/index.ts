import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import Tour from "./models/Tour"; // 👈 viktig

// LOAD ENV
dotenv.config();

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);

// 👇 NY ROUTE FOR TOURS
app.get("/tours", async (req, res) => {
  try {
    const tours = await Tour.find();
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: "Kunne ikke hente turer" });
  }
});

// TEST LOG
console.log("MONGO_URI:", process.env.MONGO_URI);

// CONNECT TO MONGODB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("🔥 Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB error:", error));

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});