/**
 * Fil: authRoutes.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: API-ruter for innlogging og autentisering av brukere.
 */

import { Router } from "express";
import { prisma } from "../prisma";
import { signToken } from "../auth/jwt";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { epost, passord } = req.body as {
    epost?: string;
    passord?: string;
  };

  if (!epost || !passord) {
    return res.status(400).json({ error: "Mangler epost eller passord" });
  }

  const user = await prisma.bruker.findUnique({
    where: { epost },
    include: {
      bruker_rolle: {
        include: { rolle: true }
      }
    }
  });

  if (!user) {
    return res.status(401).json({ error: "Feil epost eller passord" });
  }

  // For testbrukere: plain text sjekk
  if (user.passord_hash !== "hemmelig") {
    return res.status(401).json({ error: "Feil epost eller passord" });
  }

  const appUser = {
    id: user.id,
    epost: user.epost,
    roller: user.bruker_rolle.map((r: { rolle: { kode: string } }) => r.rolle.kode),
  };

  const token = signToken({ userId: user.id });

  res.json({ token, user: appUser });
});
