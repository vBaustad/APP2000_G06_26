import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import type { AuthedRequest } from "../middleware/auth";

export const hytteRouter = Router();

// PUBLIC: List all cabins
hytteRouter.get("/", async (_req, res) => {
  const hytter = await prisma.hytte.findMany({
    orderBy: { id: "desc" },
  });
  res.json(hytter);
});

// Hytteeier: Create cabin
hytteRouter.get("/mine", requireAuth, requireRole("hytteeier"), async (req, res) => {
  const { id } = (req as AuthedRequest).user!;
  const hytter = await prisma.hytte.findMany({
    where: { eier_bruker_id: id },
    orderBy: { id: "desc" },
  });
  res.json(hytter);
});

// Hytteeier: Create cabin
hytteRouter.post("/", requireAuth, requireRole("hytteeier"), async (req, res) => {
  const { navn, beskrivelse, omrade, adresse, kapasitet_senger, maks_gjester, pris_per_natt, regler } = req.body;

  if (!navn) return res.status(400).json({ error: "navn is required" });

  const created = await prisma.hytte.create({
    data: {
      eier_bruker_id: (req as AuthedRequest).user!.id,
      navn,
      beskrivelse,
      omrade,
      adresse,
      kapasitet_senger: kapasitet_senger ? Number(kapasitet_senger) : 1,
      maks_gjester: maks_gjester ? Number(maks_gjester) : null,
      pris_per_natt: pris_per_natt ? Number(pris_per_natt) : 0,
      regler,
    },
  });

  res.status(201).json(created);
});

// Hytteeier: Update cabin
hytteRouter.put("/:id", requireAuth, requireRole("hytteeier"), async (req, res) => {
  const id = Number(req.params.id);
  const ownerId = (req as AuthedRequest).user!.id;

  const existing = await prisma.hytte.findUnique({ where: { id } });
  if (!existing || existing.eier_bruker_id !== ownerId) {
    return res.status(404).json({ error: "Cabin not found" });
  }

  const updated = await prisma.hytte.update({
    where: { id },
    data: req.body,
  });

  res.json(updated);
});

// Hytteeier: Delete cabin
hytteRouter.delete("/:id", requireAuth, requireRole("hytteeier"), async (req, res) => {
  const id = Number(req.params.id);
  const ownerId = (req as AuthedRequest).user!.id;

  const existing = await prisma.hytte.findUnique({ where: { id } });
  if (!existing || existing.eier_bruker_id !== ownerId) {
    return res.status(404).json({ error: "Cabin not found" });
  }

  await prisma.hytte.delete({ where: { id } });
  res.status(204).send();
});
