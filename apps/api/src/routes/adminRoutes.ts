/**
   * Fil: adminRoutes.ts
   * Utvikler: Vebjørn Baustad
   * Beskrivelse: Admin/redaktør-endepunkter for å godkjenne eller avvise annonsører og annonser.
   */

import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { clearAllData, seedAll } from "../lib/seed";

export const adminRouter = Router();

// PUBLIC: Tilbakestill alle testdata. Bevisst uten auth så sensor kan
// nullstille systemet under testing. UI-en krever confirm-modal før kall.
// Enkel mutex hindrer at to samtidige kall korrupterer databasen midtveis.
let resetBusy = false;

adminRouter.post("/reset-testdata", async (_req, res) => {
  if (resetBusy) {
    return res.status(429).json({
      ok: false,
      error: "En tilbakestilling pågår allerede. Prøv igjen om noen sekunder.",
    });
  }
  resetBusy = true;
  try {
    await clearAllData();
    await seedAll();
    res.json({
      ok: true,
      message: "Testdata tilbakestilt. Alle brukere, turer, hytter og annonser er reseedet.",
    });
  } catch (error) {
    console.error("Feil ved reset av testdata:", error);
    res.status(500).json({
      ok: false,
      error: "Kunne ikke tilbakestille testdata.",
    });
  } finally {
    resetBusy = false;
  }
});

//Alle ruter under krever admin-rolle
adminRouter.use(requireAuth, requireRole("admin"));

// --- Annonsører ---
adminRouter.get("/annonsorer/pending", async (_req, res) => {
    const pending = await prisma.annonsor.findMany({
        where: {status: "pending" },
        orderBy: {created_at: "asc" },
    });
    res.json(pending);
});

adminRouter.post("/annonsorer/:id/approve", async (req, res) => {
    const id = Number(req.params.id);
    const annonsor = await prisma.annonsor.findUnique({ where: { id } });
    if(!annonsor) return res.status(404).json({error: "Annonsør ikke funnet" });

    const updated = await prisma.annonsor.update({
        where: { id },
        data: { status: "approved" },
    });

    // Gi brukeren annonsor-rolle (hvis bruker med matchende e-post finnes)
    const bruker = await prisma.bruker.findUnique({ where: { epost: annonsor.epost } });
    const rolle = await prisma.rolle.findFirst({ where: { kode: "annonsor" } });
    if (bruker && rolle) {
        await prisma.bruker_rolle.upsert({
            where: { bruker_id_rolle_id: { bruker_id: bruker.id, rolle_id: rolle.id } },
            create: { bruker_id: bruker.id, rolle_id: rolle.id },
            update: {},
        });
    }

    res.json(updated);
});

adminRouter.post("/annonsorer/:id/reject", async (req, res) => {
    const id = Number(req.params.id);
    const annonsor = await prisma.annonsor.findUnique({ where: { id } });
    if(!annonsor) return res.status(404).json({ error: "Annonsør ikke funnet" });

    const updated = await prisma.annonsor.update({
        where: { id },
        data: { status: "rejected" },
    });
    res.json(updated);
});

// --- Annonser --- 
adminRouter.get("/annonser/pending", async (_req, res) => {
    const pending = await prisma.annonse.findMany({
        where: { status: "pending" },
        include: { annonsor: { select: { id: true, navn: true, epost: true }}}, 
        orderBy: { created_at: "asc" },
    });
    res.json(pending);
});

adminRouter.post("/annonser/:id/approve", async (req, res) => {
    const id = Number(req.params.id);
    const annonse = await prisma.annonse.findUnique({ where: { id } });
    if(!annonse) return res.status(404).json({error: "Annonse ikke funnet" });

    const updated = await prisma.annonse.update({
        where: { id },
        data: { status: "active" },        
    });
    res.json(updated);
});

adminRouter.post("/annonser/:id/reject", async (req, res) => {
    const id = Number(req.params.id);
    const annonse = await prisma.annonse.findUnique({ where: { id } });
    if(!annonse) return res.status(404).json({error: "Annonse ikke funnet" });

    const updated = await prisma.annonse.update({
        where: { id },
        data: { status: "rejected" },
    });
    res.json(updated);
});

// --- Brukere og roller ---
adminRouter.get("/brukere", async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const where = q
        ? {
              OR: [
                  { epost: { contains: q } },
                  { fornavn: { contains: q } },
                  { etternavn: { contains: q } },
              ],
          }
        : {};

    const brukere = await prisma.bruker.findMany({
        where,
        take: 25,
        orderBy: { created_at: "desc" },
        select: {
            id: true,
            epost: true,
            fornavn: true,
            etternavn: true,
            bruker_rolle: { select: { rolle: { select: { id: true, kode: true, navn: true } } } },
        },
    });
    res.json(brukere);
});

adminRouter.post("/bruker/:id/roller", async (req, res) => {
    const brukerId = Number(req.params.id);
    const { rolle } = req.body as { rolle?: string };
    if (!rolle) return res.status(400).json({ error: "Rolle må spesifiseres" });

    const bruker = await prisma.bruker.findUnique({ where: { id: brukerId } });
    if (!bruker) return res.status(404).json({ error: "Bruker ikke funnet" });

    const rolleRow = await prisma.rolle.findFirst({ where: { kode: rolle } });
    if (!rolleRow) return res.status(400).json({ error: `Ukjent rolle: ${rolle}` });

    await prisma.bruker_rolle.upsert({
        where: { bruker_id_rolle_id: { bruker_id: brukerId, rolle_id: rolleRow.id } },
        create: { bruker_id: brukerId, rolle_id: rolleRow.id },
        update: {},
    });

    // Ved tildeling av annonsor-rolle direkte fra admin: sørg for annonsor-rad
    if (rolle === "annonsor") {
        const existing = await prisma.annonsor.findFirst({ where: { epost: bruker.epost } });
        if (!existing) {
            await prisma.annonsor.create({
                data: {
                    navn: `${bruker.fornavn ?? ""} ${bruker.etternavn ?? ""}`.trim() || bruker.epost.split("@")[0],
                    epost: bruker.epost,
                    status: "approved",
                },
            });
        } else if (existing.status !== "approved") {
            await prisma.annonsor.update({ where: { id: existing.id }, data: { status: "approved" } });
        }
    }

    res.status(201).json({ message: `Rolle ${rolle} lagt til` });
});

adminRouter.delete("/bruker/:id/roller/:rolle", async (req, res) => {
    const brukerId = Number(req.params.id);
    const rolle = req.params.rolle;

    const rolleRow = await prisma.rolle.findFirst({ where: { kode: rolle } });
    if (!rolleRow) return res.status(400).json({ error: `Ukjent rolle: ${rolle}` });

    await prisma.bruker_rolle.deleteMany({
        where: { bruker_id: brukerId, rolle_id: rolleRow.id },
    });

    res.status(204).send();
});

adminRouter.get("/roller", async (_req, res) => {
    const roller = await prisma.rolle.findMany({ orderBy: { kode: "asc" } });
    res.json(roller);
});