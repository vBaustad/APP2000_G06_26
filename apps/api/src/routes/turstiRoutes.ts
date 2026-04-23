/**
 * Fil: turstiRoutes.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Public endepunkt for å liste eksisterende turstier. Brukes av
 * opprett-tur-skjemaet for å velge stier som inngår i en tur.
 *
 * KI-bruk: Claude (Anthropic) og GitHub Copilot er brukt som verktøy
 * under utvikling. All kode er lest, forstått og testet. Se rapportens
 * kapittel "Kommentarer til bruk/tilpassing av kode".
 */

import { Router } from "express";
import { TurstiKilde } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";

export const turstiRouter = Router();

function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) *
      Math.cos(toRad(bLat)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

turstiRouter.get("/", async (_req, res) => {
  const turstier = await prisma.tursti.findMany({
    orderBy: { navn: "asc" },
    select: {
      id: true,
      navn: true,
      beskrivelse: true,
      vanskelighetsgrad: true,
      hoydemeter: true,
      lengde_km: true,
      omrade: true,
      tursti_punkt: {
        select: { lat: true, lng: true },
        orderBy: { rekkefolge: "asc" },
      },
    },
  });
  res.json(turstier);
});

// AUTH: Opprett ny tursti (tegnet i kart)
turstiRouter.post("/", requireAuth, async (req, res) => {
  const {
    navn,
    beskrivelse,
    vanskelighetsgrad,
    omrade,
    punkter,
  } = req.body as {
    navn?: string;
    beskrivelse?: string;
    vanskelighetsgrad?: string;
    omrade?: string;
    punkter?: { lat: number | string; lng: number | string }[];
  };

  if (!navn || !navn.trim()) {
    return res.status(400).json({ error: "Navn er påkrevd." });
  }
  if (!Array.isArray(punkter) || punkter.length < 2) {
    return res.status(400).json({ error: "Stien må ha minst to punkter." });
  }

  const rensedePunkter = punkter
    .map((p) => ({ lat: Number(p.lat), lng: Number(p.lng) }))
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));

  if (rensedePunkter.length < 2) {
    return res.status(400).json({ error: "Ugyldige koordinater." });
  }

  let lengdeKm = 0;
  for (let i = 1; i < rensedePunkter.length; i++) {
    lengdeKm += haversineKm(
      rensedePunkter[i - 1].lat,
      rensedePunkter[i - 1].lng,
      rensedePunkter[i].lat,
      rensedePunkter[i].lng,
    );
  }

  const opprettet = await prisma.$transaction(async (tx) => {
    const tursti = await tx.tursti.create({
      data: {
        navn: navn.trim(),
        beskrivelse: beskrivelse?.trim() || null,
        vanskelighetsgrad: vanskelighetsgrad || null,
        omrade: omrade?.trim() || null,
        lengde_km: Number(lengdeKm.toFixed(2)),
        kilde: TurstiKilde.manual_draw,
      },
    });

    await tx.tursti_punkt.createMany({
      data: rensedePunkter.map((p, i) => ({
        tursti_id: tursti.id,
        rekkefolge: i + 1,
        lat: p.lat,
        lng: p.lng,
      })),
    });

    return tursti;
  });

  const full = await prisma.tursti.findUnique({
    where: { id: opprettet.id },
    select: {
      id: true,
      navn: true,
      beskrivelse: true,
      vanskelighetsgrad: true,
      hoydemeter: true,
      lengde_km: true,
      omrade: true,
      tursti_punkt: {
        select: { lat: true, lng: true },
        orderBy: { rekkefolge: "asc" },
      },
    },
  });

  res.status(201).json(full);
});
