/**
 * Fil: authRoutes.ts
 * Utvikler(e): Vebjørn Baustad & Parasto Jamshidi
 * Beskrivelse: API-ruter for innlogging og registrering av brukere.
 *
 * KI-bruk: Claude (Anthropic) og GitHub Copilot er brukt som verktøy
 * under utvikling. All kode er lest, forstått og testet. Se rapportens
 * kapittel "Kommentarer til bruk/tilpassing av kode".
 */

import { Router } from "express";
import { prisma } from "../prisma";
import { signToken } from "../auth/jwt";
import { verifyPassword, hashPassword } from "../auth/password"; // Lagt til hashPassword her

export const authRouter = Router();

// 1. INNLOGGING (Vebjørns oppdaterte kode)
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

  // Sjekker kryptert passord
  const passordOk = await verifyPassword(passord, user.passord_hash);
  if (!passordOk) {
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

// 2. REGISTRERING (Din nye rute)
authRouter.post("/register", async (req, res) => {
  const { epost, passord, fornavn, etternavn } = req.body;

  if (!epost || !passord || !fornavn || !etternavn) {
    return res.status(400).json({ error: "Vennligst fyll ut alle feltene" });
  }

  try {
    // Sjekk om e-posten allerede er i bruk
    const eksisterendeBruker = await prisma.bruker.findUnique({
      where: { epost }
    });

    if (eksisterendeBruker) {
      return res.status(400).json({ error: "Denne e-postadressen er allerede i bruk" });
    }

    // VIKTIG: Vi krypterer passordet før vi lagrer det!
    const hashedPassord = await hashPassword(passord);

    const nyBruker = await prisma.bruker.create({
      data: {
        epost,
        passord_hash: hashedPassord, // Lagrer det krypterte passordet
        fornavn,
        etternavn
      }
    });

    res.status(201).json({ message: "Bruker opprettet!", id: nyBruker.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Kunne ikke opprette bruker" });
  }
});