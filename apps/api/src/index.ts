import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// LOAD ENV
dotenv.config();

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

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