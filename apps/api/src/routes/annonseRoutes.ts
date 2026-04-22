/**
 * Fil: annonseRoutes.ts
 * Beskrivelse: CRUD-operasjoner for annonser med rollebasert tilgang for annonsører. CRUD operasjoner for annonser er 
 * laget med støtte og hjelp av ChatGPT. 
 */

import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth";


export const annonseRouter = Router();

export const annonsorRouter = Router();

annonseRouter.post("/", requireAuth, async (req, res) => {
  try {
    const authed = req as AuthedRequest;
    const email = authed.user?.email;

    if (!email) {
      return res.status(401).json({ error: "Bruker ikke autentisert" });
    }

    const annonsor = await prisma.annonsor.findFirst({
      where: { epost: email },
    });

    if (!annonsor) {
      return res.status(404).json({ error: "Fant ikke annonsør" });
    }

    const {
      tittel,
      beskrivelse,
      bilde_url,
      lenke_url,
      kategori,
      keywords,
      annonsetype,
      start_at,
      end_at,
      daily_budget,
      pris_per_visning,
      pris_per_klikk,
    } = req.body;

    const nyAnnonse = await prisma.annonse.create({
      data: {
        annonsor_id: annonsor.id,
        tittel,
        beskrivelse: beskrivelse || null,
        bilde_url: bilde_url || null,
        lenke_url: lenke_url || null,
        kategori: kategori || null,
        keywords: keywords || null,
        annonsetype: annonsetype || null,
        start_at: start_at ? new Date(start_at) : null,
        end_at: end_at ? new Date(end_at) : null,
        daily_budget: daily_budget ? Number(daily_budget) : 0,
        pris_per_visning: pris_per_visning ? Number(pris_per_visning) : 0,
        pris_per_klikk: pris_per_klikk ? Number(pris_per_klikk) : 0,
        budget_spent: 0,
        visninger: 0,
        klikk: 0,
        status: "pending",
      },
    });

    res.status(201).json(nyAnnonse);
  } catch (error) {
    console.error("Feil ved oppretting av annonse:", error);
    res.status(500).json({ error: "Kunne ikke opprette annonse" });
  }
});

// Innlogget bruker: søk om å bli annonsør. Oppretter pending annonsør-rad,
// men gir IKKE rollen — det gjør admin ved godkjenning.
annonsorRouter.post("/soknad", requireAuth, async (req, res) => {
  const authed = req as AuthedRequest;
  const email = authed.user?.email;
  if (!email) return res.status(401).json({ error: "Bruker ikke autentisert" });

  if (authed.user?.roles?.includes("annonsor")) {
    return res.status(409).json({ error: "Du er allerede annonsør" });
  }

  const { navn, telefon } = req.body as { navn?: string; telefon?: string };
  if (!navn || !navn.trim()) {
    return res.status(400).json({ error: "Navn/firma må fylles ut" });
  }

  const existing = await prisma.annonsor.findFirst({ where: { epost: email } });
  if (existing) {
    if (existing.status === "pending") {
      return res.status(409).json({ error: "Du har allerede en ventende søknad" });
    }
    if (existing.status === "approved") {
      return res.status(409).json({ error: "Du er allerede godkjent som annonsør" });
    }
    const updated = await prisma.annonsor.update({
      where: { id: existing.id },
      data: { navn: navn.trim(), telefon: telefon?.trim() || null, status: "pending" },
    });
    return res.status(201).json(updated);
  }

  const created = await prisma.annonsor.create({
    data: {
      navn: navn.trim(),
      epost: email,
      telefon: telefon?.trim() || null,
      status: "pending",
    },
  });
  res.status(201).json(created);
});

// Innlogget bruker: sjekk egen søknadsstatus
annonsorRouter.get("/soknad/status", requireAuth, async (req, res) => {
  const email = (req as AuthedRequest).user?.email;
  if (!email) return res.status(401).json({ error: "Bruker ikke autentisert" });

  const row = await prisma.annonsor.findFirst({
    where: { epost: email },
    select: { id: true, status: true, navn: true, created_at: true },
  });
  res.json(row);
});

async function getCurrentAnnonsor(req: AuthedRequest) {
  const email = req.user?.email;
  if (!email) return null;

  const existing = await prisma.annonsor.findFirst({ where: { epost: email } });
  if (existing) return existing;

  return prisma.annonsor.create({
    data: {
      navn: email.split("@")[0],
      epost: email,
      status: "pending",
    },
  });
}

// PUBLIC: List all annonser sorted etter bud og tilgjengelighet
annonseRouter.get("/", async (_req, res) => {
  const now = new Date();
  const annonser = await prisma.annonse.findMany({
    where: {
      status: "active",
      AND: [
        { OR: [{ start_at: null }, { start_at: { lte: now } }] },
        { OR: [{ end_at: null }, { end_at: { gte: now } }] },
      ],
    },
    orderBy: [
      { pris_per_klikk: "desc" },
      { daily_budget: "desc" },
      { created_at: "desc" },
    ],
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
annonseRouter.post("/", requireAuth, async (req, res) => {
  console.log("POST /annonser traff backend");

  try {
    


    const annonsor = await getCurrentAnnonsor(req as AuthedRequest);
    if (!annonsor) {
      return res.status(404).json({ error: "Annonsørprofil ikke funnet" });
    }
    if(annonsor.status !== "approved"){
      return res.status(403).json({
        error: "Annonsørprofilen din venter på godkjenning fra admin. Du kan opprette annonser når du er godkjent"
      });
    } 
    const {
      tittel,
      beskrivelse,
      bilde_url,
      lenke_url,
      kategori,
      keywords,
      annonsetype,
      start_at,
      end_at,
      daily_budget,
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
        keywords: keywords || null,
        annonsetype: annonsetype || null,
        start_at: start_at ? new Date(start_at) : null,
        end_at: end_at ? new Date(end_at) : null,
        daily_budget: daily_budget ? Number(daily_budget) : 0,
        pris_per_visning: pris_per_visning ? Number(pris_per_visning) : 0,
        pris_per_klikk: pris_per_klikk ? Number(pris_per_klikk) : 0,
      },
    });
res.status(201).json(created);
  } catch (error) {
    console.error("Feil ved oppretting av annonse:", error);
    res.status(500).json({ error: "Kunne ikke opprette annonse" });
  }
});

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
        daily_budget: req.body.daily_budget
          ? Number(req.body.daily_budget)
          : existing.daily_budget,
        keywords:
          req.body.keywords !== undefined ? req.body.keywords : existing.keywords,
        annonsetype: req.body.annonsetype || existing.annonsetype,
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

// Public: register annonse-visning
annonseRouter.post("/:id/view", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.annonse.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Annonse ikke funnet" });
  }

  const now = new Date();
  if (existing.start_at && now < existing.start_at) {
    return res.status(400).json({ error: "Annonse er ikke aktiv enda" });
  }
  if (existing.end_at && now > existing.end_at) {
    return res.status(400).json({ error: "Annonse er ikke aktiv" });
  }

  const updated = await prisma.annonse.update({
    where: { id },
    data: { visninger: existing.visninger + 1 },
  });

  res.json(updated);
});

// Public: register annonse-klikk
annonseRouter.post("/:id/click", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.annonse.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Annonse ikke funnet" });
  }

  const now = new Date();
  if (existing.start_at && now < existing.start_at) {
    return res.status(400).json({ error: "Annonse er ikke aktiv enda" });
  }
  if (existing.end_at && now > existing.end_at) {
    return res.status(400).json({ error: "Annonse er ikke aktiv" });
  }

  const nextSpend = Number(existing.budget_spent) + Number(existing.pris_per_klikk || 0);
  if (Number(existing.daily_budget) > 0 && nextSpend > Number(existing.daily_budget)) {
    const updated = await prisma.annonse.update({
      where: { id },
      data: { status: "budget_exhausted" },
    });
    return res.status(402).json({ error: "Budsjettet er brukt opp", annonse: updated });
  }

  const updated = await prisma.annonse.update({
    where: { id },
    data: {
      klikk: existing.klikk + 1,
      budget_spent: nextSpend,
      status:
        Number(existing.daily_budget) > 0 && nextSpend >= Number(existing.daily_budget)
          ? "budget_exhausted"
          : existing.status,
    },
  });

  res.json(updated);
});

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
