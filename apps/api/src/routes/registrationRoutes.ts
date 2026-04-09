import express from "express";
import jwt from "jsonwebtoken";
import Registration from "../models/Registration";
import Tour from "../models/Tour";
import User from "../models/User";

const router = express.Router();

function getBearerToken(req: express.Request) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.split(" ")[1];
}

async function getAuthenticatedUser(req: express.Request) {
  const token = getBearerToken(req);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, "supersecret") as { userId: string };
    const user = await User.findById(decoded.userId).select("_id email");
    return user;
  } catch {
    return null;
  }
}

// Hent alle påmeldinger
router.get("/", async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("userId", "email")
      .populate("tourId");

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Kunne ikke hente påmeldinger" });
  }
});

// Meld bruker på tur
router.post("/", async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({ message: "Du må logge inn for å melde deg på" });
    }

    const { tourId, selectedDate } = req.body;

    if (!tourId) {
      return res.status(400).json({ message: "Mangler tur-ID" });
    }

    const tour = await Tour.findById(tourId).select("_id");

    if (!tour) {
      return res.status(404).json({ message: "Fant ikke turen" });
    }

    const existingRegistration = await Registration.findOne({
      userId: user._id,
      tourId,
      status: "påmeldt",
    });

    if (existingRegistration) {
      return res.status(400).json({ message: "Brukeren er allerede påmeldt denne turen" });
    }

    const registration = new Registration({
      userId: user._id,
      tourId,
      selectedDate: selectedDate ? new Date(selectedDate) : new Date(),
      status: "påmeldt",
    });

    const savedRegistration = await registration.save();
    const populatedRegistration = await savedRegistration.populate([
      { path: "userId", select: "email" },
      { path: "tourId" },
    ]);

    res.status(201).json(populatedRegistration);
  } catch (error) {
    if ((error as { code?: number })?.code === 11000) {
      return res.status(400).json({ message: "Du er allerede påmeldt denne turen" });
    }

    res.status(400).json({ message: "Kunne ikke registrere påmelding" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({ message: "Du må logge inn" });
    }

    const registrations = await Registration.find({
      userId: user._id,
    })
      .populate("tourId")
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Kunne ikke hente brukerens påmeldinger" });
  }
});

// Hent alle påmeldinger til en bruker
router.get("/user/:userId", async (req, res) => {
  try {
    const registrations = await Registration.find({
      userId: req.params.userId,
    })
      .populate("tourId")
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Kunne ikke hente brukerens påmeldinger" });
  }
});

// Hent alle påmeldinger til en tur
router.get("/tour/:tourId", async (req, res) => {
  try {
    const registrations = await Registration.find({
      tourId: req.params.tourId,
    })
      .populate("userId", "email")
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Kunne ikke hente turens påmeldinger" });
  }
});

// Hent én påmelding
router.get("/:id", async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate("userId", "email")
      .populate("tourId");

    if (!registration) {
      return res.status(404).json({ message: "Fant ikke påmeldingen" });
    }

    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: "Kunne ikke hente påmeldingen" });
  }
});

// Meld av tur
router.patch("/:id/cancel", async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({ message: "Du må logge inn" });
    }

    const updatedRegistration = await Registration.findOneAndUpdate(
      { _id: req.params.id, userId: user._id },
      { status: "avmeldt" },
      { new: true }
    );

    if (!updatedRegistration) {
      return res.status(404).json({ message: "Fant ikke påmeldingen" });
    }

    res.json(updatedRegistration);
  } catch (error) {
    res.status(500).json({ message: "Kunne ikke melde av tur" });
  }
});

// Slett påmelding helt
router.delete("/:id", async (req, res) => {
  try {
    const deletedRegistration = await Registration.findByIdAndDelete(req.params.id);

    if (!deletedRegistration) {
      return res.status(404).json({ message: "Fant ikke påmeldingen" });
    }

    res.json({ message: "Påmelding slettet" });
  } catch (error) {
    res.status(500).json({ message: "Kunne ikke slette påmelding" });
  }
});

export default router;
