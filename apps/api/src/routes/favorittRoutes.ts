/**
 * Fil: favorittRoutes.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: API for favoritter. En favoritt peker enten på en tur eller en hytte
 * (polymorf — tur_id XOR hytte_id). Alle endepunkter krever innlogget bruker.
 */

import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import type { AuthedRequest } from "../middleware/auth";

export const favorittRouter = Router();

// Mine favoritter
favorittRouter.get("/", requireAuth, async (req, res) => {
  const brukerId = (req as AuthedRequest).user!.id;
  const favoritter = await prisma.favoritt.findMany({
    where: { bruker_id: brukerId },
    include: { tur: true, hytte: true },
    orderBy: { created_at: "desc" },
  });
  res.json(favoritter);
});

// Legg til favoritt (tur ELLER hytte)
favorittRouter.post("/", requireAuth, async (req, res) => {
  const brukerId = (req as AuthedRequest).user!.id;
  const { tur_id, hytte_id } = req.body as {
    tur_id?: number | string;
    hytte_id?: number | string;
  };

  const turId = tur_id !== undefined && tur_id !== "" ? Number(tur_id) : null;
  const hytteId = hytte_id !== undefined && hytte_id !== "" ? Number(hytte_id) : null;

  if ((turId && hytteId) || (!turId && !hytteId)) {
    return res.status(400).json({
      error: "Oppgi enten tur_id ELLER hytte_id, ikke begge.",
    });
  }
  if (turId !== null && !Number.isFinite(turId)) {
    return res.status(400).json({ error: "Ugyldig tur_id" });
  }
  if (hytteId !== null && !Number.isFinite(hytteId)) {
    return res.status(400).json({ error: "Ugyldig hytte_id" });
  }

  const existing = await prisma.favoritt.findFirst({
    where: {
      bruker_id: brukerId,
      tur_id: turId,
      hytte_id: hytteId,
    },
  });
  if (existing) {
    return res.status(200).json(existing);
  }

  const created = await prisma.favoritt.create({
    data: {
      bruker_id: brukerId,
      tur_id: turId,
      hytte_id: hytteId,
    },
    include: { tur: true, hytte: true },
  });
  res.status(201).json(created);
});

// Fjern favoritt (må eie den)
favorittRouter.delete("/:id", requireAuth, async (req, res) => {
  const brukerId = (req as AuthedRequest).user!.id;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Ugyldig id" });

  const fav = await prisma.favoritt.findUnique({ where: { id } });
  if (!fav || fav.bruker_id !== brukerId) {
    return res.status(404).json({ error: "Fant ikke favoritt" });
  }

  await prisma.favoritt.delete({ where: { id } });
  res.status(204).send();
});
