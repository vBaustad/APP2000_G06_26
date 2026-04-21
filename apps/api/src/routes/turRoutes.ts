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
import { TurType, TurStatus } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import type { AuthedRequest } from "../middleware/auth";

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
        antall_netter: true,
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
        tur_hytte: {
          select: {
            rekkefolge: true,
            hytte: {
              select: {
                id: true,
                navn: true,
                omrade: true,
                betjent: true,
              },
            },
          },
          orderBy: { rekkefolge: "asc" },
        },
        tur_dato: {
          select: {
            id: true,
            tittel: true,
            start_at: true,
            end_at: true,
            status: true,
          },
          orderBy: { start_at: "asc" },
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
        antall_netter: true,
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
        tur_hytte: {
          select: {
            rekkefolge: true,
            hytte: {
              select: {
                id: true,
                navn: true,
                omrade: true,
                adresse: true,
                betjent: true,
                bilde_url: true,
                lat: true,
                lng: true,
                kapasitet_senger: true,
                maks_gjester: true,
                pris_per_natt: true,
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

// PUBLIC: Hent alle kommentarer for en tur
turRouter.get("/:id/kommentarer", async (req, res) => {
  const turId = Number(req.params.id);
  if (isNaN(turId)) return res.status(400).json({ error: "Ugyldig tur-id." });

  try {
    const kommentarer = await prisma.tur_kommentar.findMany({
      where: { tur_id: turId },
      include: {
        bruker: { select: { id: true, fornavn: true, etternavn: true } },
      },
      orderBy: { created_at: "desc" },
    });
    res.json(kommentarer);
  } catch (error) {
    console.error("Feil i GET /api/turer/:id/kommentarer:", error);
    res.status(500).json({ error: "Intern serverfeil." });
  }
});

// AUTH: Legg til kommentar på en tur
turRouter.post("/:id/kommentarer", requireAuth, async (req, res) => {
  const turId = Number(req.params.id);
  const brukerId = (req as Request & { user?: { id: number } }).user?.id;
  if (isNaN(turId)) return res.status(400).json({ error: "Ugyldig tur-id." });
  if (!brukerId) return res.status(401).json({ error: "Ikke innlogget" });

  const { body } = req.body as { body?: string };
  const tekst = typeof body === "string" ? body.trim() : "";
  if (tekst.length < 3) {
    return res.status(400).json({ error: "Kommentar må ha minst 3 tegn." });
  }

  try {
    const tur = await prisma.tur.findUnique({ where: { id: turId }, select: { id: true } });
    if (!tur) return res.status(404).json({ error: "Fant ikke turen." });

    const kommentar = await prisma.tur_kommentar.create({
      data: { tur_id: turId, bruker_id: brukerId, body: tekst },
      include: {
        bruker: { select: { id: true, fornavn: true, etternavn: true } },
      },
    });
    res.status(201).json(kommentar);
  } catch (error) {
    console.error("Feil i POST /api/turer/:id/kommentarer:", error);
    res.status(500).json({ error: "Intern serverfeil." });
  }
});

// AUTH: Meld brukeren av en tur-påmelding (sletter egen pamelding)
turRouter.delete("/pamelding/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const brukerId = (req as Request & { user?: { id: number } }).user?.id;
  if (isNaN(id)) return res.status(400).json({ error: "Ugyldig påmeldings-id." });
  if (!brukerId) return res.status(401).json({ error: "Ikke innlogget" });

  try {
    const pamelding = await prisma.tur_pamelding.findUnique({ where: { id } });
    if (!pamelding || pamelding.bruker_id !== brukerId) {
      return res.status(404).json({ error: "Fant ikke påmeldingen." });
    }

    await prisma.tur_pamelding.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error("Feil i DELETE /api/turer/pamelding/:id:", error);
    return res.status(500).json({ error: "Intern serverfeil." });
  }
});

// AUTH: Meld innlogget bruker på en tur (valgfri tur_dato_id i body).
turRouter.post("/:id/pameld", requireAuth, async (req: AuthedRequest, res) => {
  const turId = Number(req.params.id);
  const brukerId = req.user?.id;
  const { tur_dato_id } = req.body as { tur_dato_id?: number | string };

  if (isNaN(turId)) {
    return res.status(400).json({ error: "Ugyldig tur-id." });
  }

  if (!brukerId) {
    return res.status(401).json({ error: "Du må være logget inn." });
  }

  const onsketDatoId =
    tur_dato_id !== undefined && tur_dato_id !== ""
      ? Number(tur_dato_id)
      : null;
  if (onsketDatoId !== null && !Number.isFinite(onsketDatoId)) {
    return res.status(400).json({ error: "Ugyldig tur_dato_id." });
  }

  try {
    const tur = await prisma.tur.findUnique({
      where: { id: turId },
      include: {
        tur_dato: {
          where: onsketDatoId !== null ? { id: onsketDatoId } : { status: "planned" },
          orderBy: { start_at: "asc" },
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
        error:
          onsketDatoId !== null
            ? "Fant ikke valgt turdato på denne turen."
            : "Ingen tilgjengelig turdato ble funnet for denne turen.",
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
        error: "Du er allerede påmeldt denne turdatoen.",
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
      message: "Du er nå påmeldt turdatoen.",
      pamelding,
    });
  } catch (error) {
    console.error("Feil i POST /api/turer/:id/pameld:", error);
    return res.status(500).json({ error: "Intern serverfeil." });
  }
});

// AUTH: Opprett tur (med turstier og eventuelle hytter). Eier = innlogget bruker.
turRouter.post(
  "/",
  requireAuth,
  async (req: AuthedRequest, res) => {
    const brukerId = req.user?.id;
    if (!brukerId) {
      return res.status(401).json({ error: "Du må være logget inn." });
    }
    try {
      const {
        tittel,
        beskrivelse,
        type,
        vanskelighetsgrad,
        omrade,
        antall_netter,
        min_deltakere,
        max_deltakere,
        status,
        tursti_ids,
        hytte_ids,
      } = req.body as {
        tittel?: string;
        beskrivelse?: string;
        type?: string;
        vanskelighetsgrad?: string;
        omrade?: string;
        antall_netter?: number | string;
        min_deltakere?: number | string;
        max_deltakere?: number | string;
        status?: string;
        tursti_ids?: number[];
        hytte_ids?: number[];
      };

      if (!tittel) {
        return res.status(400).json({ error: "Tittel er påkrevd." });
      }
      if (!Array.isArray(tursti_ids) || tursti_ids.length === 0) {
        return res.status(400).json({ error: "Minst én tursti må velges." });
      }

      const tursti_ids_num = tursti_ids.map((v) => Number(v));
      const hytte_ids_num = Array.isArray(hytte_ids)
        ? hytte_ids.map((v) => Number(v))
        : [];

      const valgtType =
        type && (Object.values(TurType) as string[]).includes(type)
          ? (type as TurType)
          : null;
      const valgtStatus =
        status && (Object.values(TurStatus) as string[]).includes(status)
          ? (status as TurStatus)
          : TurStatus.draft;

      const created = await prisma.$transaction(async (tx) => {
        const tur = await tx.tur.create({
          data: {
            tittel,
            beskrivelse: beskrivelse ?? null,
            type: valgtType,
            vanskelighetsgrad: vanskelighetsgrad ?? null,
            omrade: omrade ?? null,
            antall_netter:
              antall_netter !== undefined && antall_netter !== ""
                ? Number(antall_netter)
                : null,
            min_deltakere: min_deltakere ? Number(min_deltakere) : null,
            max_deltakere: max_deltakere ? Number(max_deltakere) : null,
            status: valgtStatus,
            leder_bruker_id: brukerId,
            er_selvgaende: true,
          },
        });

        await tx.tur_tursti.createMany({
          data: tursti_ids_num.map((tursti_id, i) => ({
            tur_id: tur.id,
            tursti_id,
            rekkefolge: i + 1,
          })),
        });

        if (hytte_ids_num.length > 0) {
          await tx.tur_hytte.createMany({
            data: hytte_ids_num.map((hytte_id, i) => ({
              tur_id: tur.id,
              hytte_id,
              rekkefolge: i + 1,
            })),
          });
        }

        return tur;
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