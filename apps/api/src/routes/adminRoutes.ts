/**
   * Fil: adminRoutes.ts
   * Utvikler: Vebjørn Baustad
   * Beskrivelse: Admin/redaktør-endepunkter for å godkjenne eller avvise annonsører og annonser.
   */

import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

export const adminRouter = Router();

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
    const annonsor = await  prisma.annonsor.findUnique({ where: { id } });
    if(!annonsor) return res.status(404).json({error: "Annonsør ikke funnet" });

    const updated = await prisma.annonsor.update({
        where: { id },
        data: { status: "approved" },
    });
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