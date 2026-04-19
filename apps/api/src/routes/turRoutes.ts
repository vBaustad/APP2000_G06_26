/**
 * Fil: turRoutes.ts
 * Utvikler(e): Fredrik Tharaldsen
 * Beskrivelse:
 * Implementerer CRUD-operasjoner for turer ved hjelp av Express og Prisma.
 * Alle brukere kan hente turer, mens oppretting, oppdatering og sletting
 * er begrenset til innloggede brukere med admin-rolle.
 *
 * Videreutviklet av: Ramona Cretulescu
 * - Justert GET-ruten for henting av turer slik at den returnerer et kontrollert
 *   utvalg felter fra databasen.
 * - Inkludert type og koblede turstier i GET /api/turer slik at frontend kan
 *   vise turtype, samlet distanse og høydemeter riktig.
 * - Lagt til GET /api/turer/:id for detaljside med tursti- og kartdata.
 * - Lagt til POST /api/turer/:id/pameld for turpåmelding fra detaljsiden.
 * - Lagt inn tydeligere feillogging i API-rutene.
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
        type: true,
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
        tur_tursti: {
          select: {
            rekkefolge: true,
            tursti: {
              select: {
                id: true,
                navn: true,
                hoydemeter: true,
                lengde_km: true,
                omrade: true,
              },
            },
          },
          orderBy: { rekkefolge: "asc" },
        },
      },
    });

    res.json(turer);
  } catch (error) {
    console.error("Feil i GET /api/turer:", error);
    res.status(500).json({ error: "Intern serverfeil." });
  }
});

// PUBLIC: Se én tur.
turRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Ugyldig tur-id." });
  }

  try {
    const tur = await prisma.tur.findUnique({
      where: { id },
      select: {
        id: true,
        tittel: true,
        beskrivelse: true,
        type: true,
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
        tur_dato: {
          select: {
            id: true,
            tittel: true,
            start_at: true,
            end_at: true,
            status: true,
            tidlig_pamelding_frist: true,
            rabatt_prosent: true,
          },
          orderBy: { start_at: "asc" },
        },
        tur_tursti: {
          select: {
            rekkefolge: true,
            tursti: {
              select: {
                id: true,
                navn: true,
                beskrivelse: true,
                vanskelighetsgrad: true,
                hoydemeter: true,
                lengde_km: true,
                omrade: true,
                tursti_punkt: {
                  select: {
                    rekkefolge: true,
                    lat: true,
                    lng: true,
                    hoyde_m: true,
                  },
                  orderBy: { rekkefolge: "asc" },
                },
              },
            },
          },
          orderBy: { rekkefolge: "asc" },
        },
      },
    });

    if (!tur) {
      return res.status(404).json({ error: "Fant ikke turen." });
    }

    res.json(tur);
  } catch (error) {
    console.error("Feil i GET /api/turer/:id:", error);
    res.status(500).json({ error: "Intern serverfeil." });
  }
});

// AUTH: Meld innlogget bruker på en tur.
turRouter.post("/:id/pameld", requireAuth, async (req: any, res) => {
  const turId = Number(req.params.id);
  const brukerId = req.user?.id;

  if (isNaN(turId)) {
    return res.status(400).json({ error: "Ugyldig tur-id." });
  }

  if (!brukerId) {
    return res.status(401).json({ error: "Du må være logget inn." });
  }

  try {
    const tur = await prisma.tur.findUnique({
      where: { id: turId },
      include: {
        tur_dato: {
          where: {
            status: "planned",
          },
          orderBy: {
            start_at: "asc",
          },
          take: 1,
        },
      },
    });

    if (!tur) {
      return res.status(404).json({ error: "Fant ikke turen." });
    }

    const turDato = tur.tur_dato[0];

    if (!turDato) {
      return res.status(404).json({
        error: "Ingen tilgjengelig turdato ble funnet for denne turen.",
      });
    }

    const existing = await prisma.tur_pamelding.findFirst({
      where: {
        tur_dato_id: turDato.id,
        bruker_id: brukerId,
      },
    });

    if (existing) {
      return res.status(409).json({
        error: "Du er allerede påmeldt denne turen.",
      });
    }

    const pamelding = await prisma.tur_pamelding.create({
      data: {
        tur_dato_id: turDato.id,
        bruker_id: brukerId,
        status: "pending",
      },
    });

    return res.status(201).json({
      message: "Du er nå påmeldt turen.",
      pamelding,
    });
  } catch (error) {
    console.error("Feil i POST /api/turer/:id/pameld:", error);
    return res.status(500).json({ error: "Intern serverfeil." });
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
        return res.status(400).json({ error: "Tittel er påkrevd." });
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
      res.status(500).json({ error: "Intern serverfeil." });
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
      return res.status(400).json({ error: "Ugyldig tur-id." });
    }

    try {
      const existing = await prisma.tur.findUnique({
        where: { id },
      });

      if (!existing) {
        return res.status(404).json({ error: "Fant ikke turen." });
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
      res.status(500).json({ error: "Intern serverfeil." });
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
      return res.status(400).json({ error: "Ugyldig tur-id." });
    }

    try {
      const existing = await prisma.tur.findUnique({
        where: { id },
      });

      if (!existing) {
        return res.status(404).json({ error: "Fant ikke turen." });
      }

      await prisma.tur.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      console.error("Feil i DELETE /api/turer/:id:", error);
      res.status(500).json({ error: "Intern serverfeil." });
    }
  }
);