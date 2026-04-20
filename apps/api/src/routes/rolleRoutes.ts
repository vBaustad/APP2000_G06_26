/**
 * Fil: rolleRoutes.ts
 * Beskrivelse: Tilbyr roller og lar innloggede brukere be om roller.
 */

import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";

export const rolleRouter = Router();

rolleRouter.get("/", async (_req, res) => {
  const roller = await prisma.rolle.findMany({ orderBy: { kode: "asc" } });
  res.json(roller);
});

rolleRouter.post("/apply", requireAuth, async (req, res) => {
  const { rolle } = req.body as { rolle?: string };
  if (!rolle) {
    return res.status(400).json({ error: "Rolle må spesifiseres" });
  }

  if (rolle === "annonsor") {
    return res.status(400).json({
      error: "Annonsør-rolle krever godkjenning. Bruk POST /api/annonsorer/soknad.",
    });
  }

  const rolleRow = await prisma.rolle.findFirst({ where: { kode: rolle } });
  if (!rolleRow) {
    return res.status(400).json({ error: `Ukjent rolle: ${rolle}` });
  }

  const userId = (req as AuthedRequest).user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Bruker ikke autentisert" });
  }

  const existing = await prisma.bruker_rolle.findFirst({
    where: {
      bruker_id: userId,
      rolle_id: rolleRow.id,
    },
  });

  if (existing) {
    return res.status(409).json({ error: "Du har allerede denne rollen" });
  }

  await prisma.bruker_rolle.create({
    data: {
      bruker_id: userId,
      rolle_id: rolleRow.id,
    },
  });

  res.status(201).json({ message: `Rolle ${rolle} er lagt til` });
});
