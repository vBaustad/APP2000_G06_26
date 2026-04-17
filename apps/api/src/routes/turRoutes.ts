/**
 * Fil: turRoutes.ts
 * Utvikler(e): Fredrik Tharaldsen
 * Beskrivelse:
 * Implementerer CRUD-operasjoner for turer ved hjelp av Express og Prisma.
 * Alle brukere kan hente turer, mens oppretting, oppdatering og sletting
 * er begrenset til innloggede brukere med admin-rolle.
 *
 * Videreutviklet av: Ramona Cretulescu
 * Endringer:
 * - Justert GET-ruten for henting av turer slik at den returnerer et kontrollert
 *   utvalg felter fra databasen i stedet for å hente alt ukritisk.
 * - Lagt inn tydeligere feillogging i GET /api/turer for enklere feilsøking ved
 *   kobling mellom frontend, API og database.
 * - Tilpasset ruten som første steg i overgang fra mock-data til ekte turdata
 *   fra databasen i frontend.
 */

import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

export const turRouter = Router();

// PUBLIC: Se alle turer.
turRouter.get("/", async (_req, res) => {
  try {
    const turer = await prisma.tur.findMany({
      orderBy: { id: "desc" },
      select: {
        id: true,
        tittel: true,
        beskrivelse: true,
        vanskelighetsgrad: true,
        varighet_timer: true,
        omrade: true,
        bilde_url: true,
        min_deltakere: true,
        max_deltakere: true,
        status: true,
        leder_bruker_id: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json(turer);
  } catch (error) {
    console.error("Feil i GET /api/turer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ADMIN: Create tur
turRouter.post(
  "/",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const {
        tittel,
        beskrivelse,
        vanskelighetsgrad,
        min_deltakere,
        max_deltakere,
        status,
        leder_bruker_id,
      } = req.body;

      if (!tittel) {
        return res.status(400).json({ error: "tittel is required" });
      }

      const created = await prisma.tur.create({
        data: {
          tittel,
          beskrivelse,
          vanskelighetsgrad,
          min_deltakere: min_deltakere ? Number(min_deltakere) : null,
          max_deltakere: max_deltakere ? Number(max_deltakere) : null,
          status: status ?? "draft",
          leder_bruker_id: leder_bruker_id ? Number(leder_bruker_id) : null,
        },
      });

      res.status(201).json(created);
    } catch (error) {
      console.error("Feil i POST /api/turer:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ADMIN: Update tur
turRouter.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    try {
      const existing = await prisma.tur.findUnique({
        where: { id },
      });

      if (!existing) {
        return res.status(404).json({ error: "Tour not found" });
      }

      const {
        tittel,
        beskrivelse,
        vanskelighetsgrad,
        min_deltakere,
        max_deltakere,
        status,
        leder_bruker_id,
      } = req.body;

      const updated = await prisma.tur.update({
        where: { id },
        data: {
          tittel,
          beskrivelse,
          vanskelighetsgrad,
          min_deltakere: min_deltakere ? Number(min_deltakere) : undefined,
          max_deltakere: max_deltakere ? Number(max_deltakere) : undefined,
          status,
          leder_bruker_id: leder_bruker_id ? Number(leder_bruker_id) : undefined,
        },
      });

      res.json(updated);
    } catch (error) {
      console.error("Feil i PUT /api/turer/:id:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ADMIN: Delete tur
turRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    try {
      const existing = await prisma.tur.findUnique({
        where: { id },
      });

      if (!existing) {
        return res.status(404).json({ error: "Tour not found" });
      }

      await prisma.tur.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      console.error("Feil i DELETE /api/turer/:id:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);