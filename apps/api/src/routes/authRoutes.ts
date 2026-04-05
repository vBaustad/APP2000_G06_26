/**
 * Fil: authRoutes.ts
 * Utvikler(e): Vebjørn Baustad, aleksandra
 * Beskrivelse: API-ruter for innlogging og autentisering av brukere.
 */
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Bruker finnes allerede" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "Bruker opprettet" });
  } catch (err) {
    res.status(500).json({ message: "Serverfeil" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Bruker finnes ikke" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Feil passord" });
    }

    const token = jwt.sign(
      { userId: user._id },
      "supersecret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Serverfeil" });
  }
});

// ME
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Ingen token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, "supersecret") as { userId: string };

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Bruker ikke funnet" });
    }

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: "Ugyldig token" });
  }
});

export default router;