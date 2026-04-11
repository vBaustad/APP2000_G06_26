/**
 * Fil: annonseRoutes.ts
 * Beskrivelse: CRUD-operasjoner for annonser med rollebasert tilgang for annonsører.
 */

import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth";

export const annonseRouter = Router();

async function getCurrentAnnonsor(req: AuthedRequest) {
  const email = req.user?.email;
  if (!email) return null;

  const existing = await prisma.annonsor.findFirst({ where: { epost: email } });
  if (existing) return existing;

  return prisma.annonsor.create({
    data: {
      navn: email.split("@")[0],
      epost: email,
      status: "active",
    },
  });
}

// PUBLIC: List all annonser
annonseRouter.get("/", async (_req, res) => {
  const annonser = await prisma.annonse.findMany({
    orderBy: { created_at: "desc" },
  });
  res.json(annonser);
});

// Annonsør: load own annonser
annonseRouter.get(
  "/mine",
  requireAuth,
  requireRole("annonsor"),
  async (req, res) => {
    const annonsor = await getCurrentAnnonsor(req as AuthedRequest);
    if (!annonsor) {
      return res.status(404).json({ error: "Annonsørprofil ikke funnet" });
    }

    const annonser = await prisma.annonse.findMany({
      where: { annonsor_id: annonsor.id },
      orderBy: { created_at: "desc" },
    });

    res.json(annonser);
  }
);

// Annonsør: create annonse
annonseRouter.post(
  "/",
  requireAuth,
  requireRole("annonsor"),
  async (req, res) => {
    const annonsor = await getCurrentAnnonsor(req as AuthedRequest);
    if (!annonsor) {
      return res.status(404).json({ error: "Annonsørprofil ikke funnet" });
    }

    const {
      tittel,
      beskrivelse,
      bilde_url,
      lenke_url,
      kategori,
      start_at,
      end_at,
      pris_per_visning,
      pris_per_klikk,
    } = req.body;

    if (!tittel) {
      return res.status(400).json({ error: "Tittel er påkrevd" });
    }

    const created = await prisma.annonse.create({
      data: {
        annonsor_id: annonsor.id,
        tittel,
        beskrivelse: beskrivelse || null,
        bilde_url: bilde_url || null,
        lenke_url: lenke_url || null,
        kategori: kategori || null,
        start_at: start_at ? new Date(start_at) : null,
        end_at: end_at ? new Date(end_at) : null,
        pris_per_visning: pris_per_visning ? Number(pris_per_visning) : 0,
        pris_per_klikk: pris_per_klikk ? Number(pris_per_klikk) : 0,
      },
    });

    res.status(201).json(created);
  }
);

// Annonsør: update egen annonse
annonseRouter.put(
  "/:id",
  requireAuth,
  requireRole("annonsor"),
  async (req, res) => {
    const id = Number(req.params.id);
    const annonsor = await getCurrentAnnonsor(req as AuthedRequest);
    if (!annonsor) {
      return res.status(404).json({ error: "Annonsørprofil ikke funnet" });
    }

    const existing = await prisma.annonse.findUnique({ where: { id } });
    if (!existing || existing.annonsor_id !== annonsor.id) {
      return res.status(404).json({ error: "Annonse ikke funnet" });
    }

    const updated = await prisma.annonse.update({
      where: { id },
      data: {
        ...req.body,
        start_at: req.body.start_at ? new Date(req.body.start_at) : null,
        end_at: req.body.end_at ? new Date(req.body.end_at) : null,
        pris_per_visning: req.body.pris_per_visning
          ? Number(req.body.pris_per_visning)
          : existing.pris_per_visning,
        pris_per_klikk: req.body.pris_per_klikk
          ? Number(req.body.pris_per_klikk)
          : existing.pris_per_klikk,
      },
    });

    res.json(updated);
  }
);

// Annonsør: delete egen annonse
annonseRouter.delete(
  "/:id",
  requireAuth,
  requireRole("annonsor"),
  async (req, res) => {
    const id = Number(req.params.id);
    const annonsor = await getCurrentAnnonsor(req as AuthedRequest);
    if (!annonsor) {
      return res.status(404).json({ error: "Annonsørprofil ikke funnet" });
    }

    const existing = await prisma.annonse.findUnique({ where: { id } });
    if (!existing || existing.annonsor_id !== annonsor.id) {
      return res.status(404).json({ error: "Annonse ikke funnet" });
    }

    await prisma.annonse.delete({ where: { id } });
    res.status(204).send();
  }
);
