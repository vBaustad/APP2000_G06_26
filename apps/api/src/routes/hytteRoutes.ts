/**
 * Fil: hytteRoutes.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Implementerer CRUD-operasjoner for hytter ved bruk av Express og Prisma,
 * med støtte for autentisering og rollebasert tilgang.
 */


import crypto from "crypto";
import path from "path";
import { Router } from "express";
import { put, del } from "@vercel/blob";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import type { AuthedRequest } from "../middleware/auth";
import { uploadCabinImage } from "../middleware/upload";

export const hytteRouter = Router();

// PUBLIC: List all cabins
hytteRouter.get("/", async (_req, res) => {
  const hytter = await prisma.hytte.findMany({
    orderBy: { id: "desc" },
    include: { hytte_fasilitet: true },
  });
  res.json(hytter);
});

// Hytteeier: Create cabin
hytteRouter.get("/mine", requireAuth, requireRole("hytteeier"), async (req, res) => {
  const { id } = (req as AuthedRequest).user!;
  const hytter = await prisma.hytte.findMany({
    where: { eier_bruker_id: id },
    orderBy: { id: "desc" },
    include: { hytte_fasilitet: true },
  })
  res.json(hytter);
});

// Hytteeier: Create cabin
hytteRouter.post("/", requireAuth, requireRole("hytteeier"), async (req, res) => {
  const { navn, beskrivelse, omrade, adresse, kapasitet_senger, maks_gjester, pris_per_natt, regler, lat, lng, hoyde_m, betjent, bilde_url } = req.body;

  if (!navn) return res.status(400).json({ error: "navn is required" });

  const created = await prisma.hytte.create({
    data: {
      eier_bruker_id: (req as AuthedRequest).user!.id,
      navn,
      beskrivelse,
      omrade,
      adresse,
      regler,
      lat: lat !== undefined && lat !== "" ? Number(lat) : null,
      lng: lng !== undefined && lng !== "" ? Number(lng) : null,
      hoyde_m: hoyde_m !== undefined && hoyde_m !== "" ? Number(hoyde_m) : null,
      betjent: betjent || null,      
      bilde_url: bilde_url ?? null,
      kapasitet_senger: kapasitet_senger ? Number(kapasitet_senger) : 1,
      maks_gjester: maks_gjester ? Number(maks_gjester) : null,
      pris_per_natt: pris_per_natt ? Number(pris_per_natt) : 0,      
    },
  });

  res.status(201).json(created);
});

// Hytteeier: Update cabin
hytteRouter.put("/:id", requireAuth, requireRole("hytteeier"), async (req, res) => {
  const id = Number(req.params.id);
  const ownerId = (req as AuthedRequest).user!.id;

  const { navn, beskrivelse, omrade, adresse, kapasitet_senger, maks_gjester, pris_per_natt, regler, lat, lng, hoyde_m, betjent, bilde_url } = req.body;

  const existing = await prisma.hytte.findUnique({ where: { id } });
  if (!existing || existing.eier_bruker_id !== ownerId) {
    return res.status(404).json({ error: "Cabin not found" });
  }

  const updated = await prisma.hytte.update({
    where: { id },
    data: {
      navn,
      beskrivelse,
      omrade,
      adresse,
      regler,
      betjent: betjent === undefined ? undefined : (betjent || null),
      bilde_url: bilde_url === undefined ? undefined : (bilde_url ?? null),
      lat: lat === undefined ? undefined : (lat !== "" ? Number(lat) : null),
      lng: lng === undefined ? undefined : (lng !== "" ? Number(lng) : null),
      hoyde_m: hoyde_m === undefined ? undefined : (hoyde_m !== "" ? Number(hoyde_m) : null),
      kapasitet_senger: kapasitet_senger === undefined ? undefined : Number(kapasitet_senger),
      maks_gjester: maks_gjester === undefined ? undefined : (maks_gjester !== "" ? Number(maks_gjester) : null),
      pris_per_natt: pris_per_natt === undefined ? undefined : Number(pris_per_natt),
    }
  });

  res.json(updated);
});

// Hytteeier: Upload/replace cabin image
hytteRouter.post(
  "/:id/bilde",
  requireAuth,
  requireRole("hytteeier"),
  (req, res, next) => {
    uploadCabinImage(req, res, (err: unknown) => {
      if (err instanceof Error) return res.status(400).json({ error: err.message });
      if (err) return res.status(400).json({ error: "Opplasting feilet" });
      next();
    });
  },
  async (req, res) => {
    const id = Number(req.params.id);
    const ownerId = (req as AuthedRequest).user!.id;
    const file = req.file;

    const existing = await prisma.hytte.findUnique({ where: { id } });
    if (!existing || existing.eier_bruker_id !== ownerId) {
      return res.status(404).json({ error: "Cabin not found" });
    }
    if (!file) return res.status(400).json({ error: "Ingen fil" });

    const ext = path.extname(file.originalname).toLowerCase();
    const key = `cabins/${crypto.randomBytes(16).toString("hex")}${ext}`;
    const blob = await put(key, file.buffer, {
      access: "public",
      contentType: file.mimetype,
    });

    if (existing.bilde_url && /^https?:\/\/.*\.blob\.vercel-storage\.com\//.test(existing.bilde_url)) {
      await del(existing.bilde_url).catch(() => {});
    }

    const updated = await prisma.hytte.update({
      where: { id },
      data: { bilde_url: blob.url },
    });
    res.json(updated);
  },
);

hytteRouter.put("/:id/fasiliteter", requireAuth, requireRole("hytteeier"), async (req, res) => {
  const id = Number(req.params.id);
  const ownerId = (req as AuthedRequest).user!.id;
  const { koder } = req.body as { koder?: string[] };
  if(!Array.isArray(koder)) return res.status(400).json({ error: "koder må være array" });

  const hytte = await prisma.hytte.findUnique({ where: { id } });
  if(!hytte || hytte.eier_bruker_id !== ownerId) {
    return res.status(404).json({ error: "Cabin not found" });
  }

  await prisma.$transaction([
    prisma.hytte_fasilitet.deleteMany({ where: { hytte_id: id } }),
    prisma.hytte_fasilitet.createMany({
      data: koder.map((kode) => ({ hytte_id: id, kode })),
    }),
  ]);

  const fasiliteter = await prisma.hytte_fasilitet.findMany({ where: { hytte_id: id } });
  res.json(fasiliteter);
});

hytteRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const hytte = await prisma.hytte.findUnique({
    where: { id },
    include: { hytte_fasilitet: true },
  });
  if(!hytte) return res.status(404).json({ error: "Cabin not found" });
  res.json(hytte);
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

  if (existing.bilde_url && /^https?:\/\/.*\.blob\.vercel-storage\.com\//.test(existing.bilde_url)) {
    await del(existing.bilde_url).catch(() => {});
  }

  res.status(204).send();
});


