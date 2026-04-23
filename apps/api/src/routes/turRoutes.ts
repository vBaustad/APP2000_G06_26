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
import { Prisma, TurType, TurStatus } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import type { AuthedRequest } from "../middleware/auth";

export const turRouter = Router();

const CHAT_TILGANG_STATUS = ["pending", "binding", "locked"] as const;

type TurDatoChatError = {
  ok: false;
  error: string;
  statusCode: number;
};

type TurDatoChatSuccess = {
  ok: true;
  chatId: number;
  turDatoId: number;
  title: string;
  subtitle: string;
  medlemmer: Array<{
    id: number;
    fornavn: string | null;
    etternavn: string | null;
  }>;
  meldinger: Array<{
    id: number;
    body: string;
    created_at: Date;
    sender: {
      id: number;
      fornavn: string | null;
      etternavn: string | null;
    } | null;
  }>;
};

function buildTurDatoChatKey(turDatoId: number) {
  return `tur_dato:${turDatoId}`;
}

function formatChatDateRange(startAt: Date, endAt: Date) {
  const formatter = new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${formatter.format(startAt)} - ${formatter.format(endAt)}`;
}

async function ensureTurDatoChat(
  db: typeof prisma | Prisma.TransactionClient,
  turDatoId: number,
  brukerId: number,
): Promise<TurDatoChatError | TurDatoChatSuccess> {
  const turDato = await db.tur_dato.findUnique({
    where: { id: turDatoId },
    select: {
      id: true,
      tur_id: true,
      tittel: true,
      start_at: true,
      end_at: true,
      status: true,
      tur: {
        select: {
          id: true,
          tittel: true,
        },
      },
      tur_pamelding: {
        where: {
          status: { in: [...CHAT_TILGANG_STATUS] },
        },
        select: {
          bruker_id: true,
          bruker: {
            select: {
              id: true,
              fornavn: true,
              etternavn: true,
            },
          },
        },
      },
    },
  });

  if (!turDato) {
    return { ok: false, error: "Fant ikke turdatoen.", statusCode: 404 };
  }

  if (turDato.status !== "locked") {
    return {
      ok: false,
      error: "Gruppesamtalen åpnes først når turdatoen er låst.",
      statusCode: 403,
    };
  }

  const medlemIds = turDato.tur_pamelding.map((pamelding) => pamelding.bruker_id);

  if (!medlemIds.includes(brukerId)) {
    return {
      ok: false,
      error: "Du har ikke tilgang til denne turchatten.",
      statusCode: 403,
    };
  }

  let chat = await db.chat.findFirst({
    where: {
      tur_id: turDato.tur_id,
      type: "group",
      tittel: buildTurDatoChatKey(turDato.id),
    },
    select: { id: true },
  });

  if (!chat) {
    chat = await db.chat.create({
      data: {
        tur_id: turDato.tur_id,
        type: "group",
        tittel: buildTurDatoChatKey(turDato.id),
        chat_medlem: {
          create: medlemIds.map((id) => ({
            bruker_id: id,
          })),
        },
      },
      select: { id: true },
    });
  } else {
    await db.chat_medlem.createMany({
      data: medlemIds.map((id) => ({
        chat_id: chat!.id,
        bruker_id: id,
      })),
      skipDuplicates: true,
    });

    await db.chat_medlem.deleteMany({
      where: {
        chat_id: chat.id,
        bruker_id: {
          notIn: medlemIds,
        },
      },
    });
  }

  const meldinger = await db.melding.findMany({
    where: { chat_id: chat.id },
    orderBy: { created_at: "asc" },
    take: 200,
    include: {
      bruker: {
        select: {
          id: true,
          fornavn: true,
          etternavn: true,
        },
      },
    },
  });

  return {
    ok: true,
    chatId: chat.id,
    turDatoId: turDato.id,
    title:
      turDato.tittel?.trim() ||
      `${turDato.tur.tittel} · ${formatChatDateRange(turDato.start_at, turDato.end_at)}`,
    subtitle: `${turDato.tur.tittel} · ${formatChatDateRange(turDato.start_at, turDato.end_at)}`,
    medlemmer: turDato.tur_pamelding.map((pamelding) => pamelding.bruker),
    meldinger: meldinger.map((melding) => ({
      id: melding.id,
      body: melding.body,
      created_at: melding.created_at,
      sender: melding.bruker,
    })),
  };
}

turRouter.get("/datoer/:turDatoId/chat", requireAuth, async (req: AuthedRequest, res) => {
  const turDatoId = Number(req.params.turDatoId);
  const brukerId = req.user?.id;

  if (isNaN(turDatoId)) {
    return res.status(400).json({ error: "Ugyldig turdato-id." });
  }

  if (!brukerId) {
    return res.status(401).json({ error: "Du må være logget inn." });
  }

  try {
    const chat = await ensureTurDatoChat(prisma, turDatoId, brukerId);

    if (!chat.ok) {
      return res.status(chat.statusCode).json({ error: chat.error });
    }

    return res.json(chat);
  } catch (error) {
    console.error("Feil i GET /api/turer/datoer/:turDatoId/chat:", error);
    return res.status(500).json({ error: "Intern serverfeil." });
  }
});

turRouter.post(
  "/datoer/:turDatoId/chat/meldinger",
  requireAuth,
  async (req: AuthedRequest, res) => {
    const turDatoId = Number(req.params.turDatoId);
    const brukerId = req.user?.id;
    const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";

    if (isNaN(turDatoId)) {
      return res.status(400).json({ error: "Ugyldig turdato-id." });
    }

    if (!brukerId) {
      return res.status(401).json({ error: "Du må være logget inn." });
    }

    if (!body) {
      return res.status(400).json({ error: "Meldingen kan ikke være tom." });
    }

    try {
      const resultat = await prisma.$transaction(async (tx) => {
        const chat = await ensureTurDatoChat(tx, turDatoId, brukerId);

        if (!chat.ok) {
          return chat;
        }

        const melding = await tx.melding.create({
          data: {
            chat_id: chat.chatId,
            sender_id: brukerId,
            body,
          },
          include: {
            bruker: {
              select: {
                id: true,
                fornavn: true,
                etternavn: true,
              },
            },
          },
        });

        return {
          id: melding.id,
          body: melding.body,
          created_at: melding.created_at,
          sender: melding.bruker,
        };
      });

      if ("ok" in resultat && !resultat.ok) {
        return res.status(resultat.statusCode).json({ error: resultat.error });
      }

      return res.status(201).json(resultat);
    } catch (error) {
      console.error("Feil i POST /api/turer/datoer/:turDatoId/chat/meldinger:", error);
      return res.status(500).json({ error: "Intern serverfeil." });
    }
  },
);

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
        bruker: {
          select: {
            fornavn: true,
            etternavn: true,
          },
        },
        created_at: true,
        updated_at: true,
        antall_netter: true,
        tur_rating: {
          select: {
            rating: true,
          },
        },
        tur_kommentar: {
          select: {
            id: true,
            body: true,
            created_at: true,
            bruker: {
              select: {
                fornavn: true,
                etternavn: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
        },
        favoritt: {
          select: {
            id: true,
          },
        },
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

// AUTH: Turer der innlogget bruker er leder (dashboard for turleder).
// Må ligge før GET "/:id" slik at Express ikke tolker "mine-leder" som en id.
turRouter.get("/mine-leder", requireAuth, async (req: AuthedRequest, res) => {
  const brukerId = req.user?.id;
  if (!brukerId) {
    return res.status(401).json({ error: "Ikke innlogget" });
  }

  try {
    const turer = await prisma.tur.findMany({
      where: { leder_bruker_id: brukerId },
      orderBy: { id: "desc" },
      select: {
        id: true,
        tittel: true,
        status: true,
        omrade: true,
        antall_netter: true,
        created_at: true,
        tur_dato: {
          orderBy: { start_at: "asc" },
          select: {
            id: true,
            tittel: true,
            start_at: true,
            end_at: true,
            status: true,
            tidlig_pamelding_frist: true,
            rabatt_prosent: true,
            tur_pamelding: {
              select: { id: true, status: true },
            },
          },
        },
      },
    });

    res.json(turer);
  } catch (error) {
    console.error("Feil i GET /api/turer/mine-leder:", error);
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
        bruker: {
          select: {
            fornavn: true,
            etternavn: true,
          },
        },
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

// AUTH (leder): Legg til en tur_dato på en tur. Kun turlederen kan gjøre dette.
turRouter.post("/:id/datoer", requireAuth, async (req: AuthedRequest, res) => {
  const turId = Number(req.params.id);
  const brukerId = req.user?.id;
  if (!Number.isFinite(turId)) {
    return res.status(400).json({ error: "Ugyldig tur-id." });
  }
  if (!brukerId) {
    return res.status(401).json({ error: "Ikke innlogget" });
  }

  const {
    tittel,
    start_at,
    end_at,
    tidlig_pamelding_frist,
    rabatt_prosent,
  } = req.body as {
    tittel?: string;
    start_at?: string;
    end_at?: string;
    tidlig_pamelding_frist?: string | null;
    rabatt_prosent?: number | string | null;
  };

  if (!start_at || !end_at) {
    return res.status(400).json({ error: "start_at og end_at er påkrevd." });
  }
  const start = new Date(start_at);
  const slutt = new Date(end_at);
  if (Number.isNaN(start.getTime()) || Number.isNaN(slutt.getTime())) {
    return res.status(400).json({ error: "Ugyldig datoformat." });
  }
  if (start >= slutt) {
    return res.status(400).json({ error: "Sluttdato må være etter startdato." });
  }

  let fristDato: Date | null = null;
  if (tidlig_pamelding_frist) {
    const d = new Date(tidlig_pamelding_frist);
    if (Number.isNaN(d.getTime())) {
      return res.status(400).json({ error: "Ugyldig tidlig_pamelding_frist." });
    }
    if (d >= start) {
      return res.status(400).json({
        error: "Tidlig påmeldings-frist må være før startdato.",
      });
    }
    fristDato = d;
  }

  let rabatt: number | null = null;
  if (rabatt_prosent !== undefined && rabatt_prosent !== null && rabatt_prosent !== "") {
    const r = Number(rabatt_prosent);
    if (!Number.isFinite(r) || r < 0 || r > 100) {
      return res.status(400).json({ error: "rabatt_prosent må være 0–100." });
    }
    rabatt = Math.round(r);
  }

  try {
    const tur = await prisma.tur.findUnique({
      where: { id: turId },
      select: { id: true, leder_bruker_id: true },
    });
    if (!tur) return res.status(404).json({ error: "Fant ikke turen." });

    const erEier = tur.leder_bruker_id === brukerId;
    const erAdmin = req.user?.roles.includes("admin") ?? false;
    const harTurlederRolle = req.user?.roles.includes("turleder") ?? false;

    if (!((erEier && harTurlederRolle) || erAdmin)) {
      return res.status(403).json({
        error: "Kun turledere kan legge til datoer på egne turer.",
      });
    }

    const turDato = await prisma.tur_dato.create({
      data: {
        tur_id: turId,
        tittel: tittel?.trim() || null,
        start_at: start,
        end_at: slutt,
        tidlig_pamelding_frist: fristDato,
        rabatt_prosent: rabatt,
      },
    });

    res.status(201).json(turDato);
  } catch (error) {
    console.error("Feil i POST /api/turer/:id/datoer:", error);
    res.status(500).json({ error: "Intern serverfeil." });
  }
});

// AUTH (leder): Endre status på en tur_dato — lås eller avlys.
// Ved låsing: andre tur_dato på samme tur fristilles, og påmeldinger oppdateres
// i tråd med tilstandsmaskinen i domenemodellen.
turRouter.patch(
  "/datoer/:id/status",
  requireAuth,
  async (req: AuthedRequest, res) => {
    const datoId = Number(req.params.id);
    const brukerId = req.user?.id;
    if (!Number.isFinite(datoId)) {
      return res.status(400).json({ error: "Ugyldig dato-id." });
    }
    if (!brukerId) {
      return res.status(401).json({ error: "Ikke innlogget" });
    }

    const { status } = req.body as { status?: string };
    if (status !== "locked" && status !== "cancelled") {
      return res.status(400).json({
        error: "status må være 'locked' eller 'cancelled'.",
      });
    }

    try {
      const dato = await prisma.tur_dato.findUnique({
        where: { id: datoId },
        select: {
          id: true,
          status: true,
          tur_id: true,
          tur: { select: { leder_bruker_id: true } },
        },
      });
      if (!dato) return res.status(404).json({ error: "Fant ikke datoen." });
      const erAdmin = req.user?.roles.includes("admin") ?? false;
      const erLeder = dato.tur.leder_bruker_id === brukerId;
      if (!erLeder && !erAdmin) {
        return res.status(403).json({ error: "Kun turlederen eller admin kan endre status." });
      }
      if (dato.status === "locked" || dato.status === "cancelled") {
        return res.status(409).json({
          error: "Datoen har allerede endelig status og kan ikke endres.",
        });
      }

      const resultat = await prisma.$transaction(async (tx) => {
        if (status === "cancelled") {
          await tx.tur_dato.update({
            where: { id: datoId },
            data: { status: "cancelled" },
          });
          await tx.tur_pamelding.updateMany({
            where: { tur_dato_id: datoId },
            data: { status: "freed" },
          });
          return { locked: false };
        }

        // status === "locked"
        await tx.tur_dato.update({
          where: { id: datoId },
          data: { status: "locked" },
        });
        // Bindende påmeldinger på låst dato bekreftes.
        await tx.tur_pamelding.updateMany({
          where: { tur_dato_id: datoId, status: "binding" },
          data: { status: "locked" },
        });
        // Pending (kun interesse) på låst dato fristilles — de har ikke forpliktet seg.
        await tx.tur_pamelding.updateMany({
          where: { tur_dato_id: datoId, status: "pending" },
          data: { status: "freed" },
        });

        // Alle andre tur_dato på samme tur fristilles.
        const andreDatoer = await tx.tur_dato.findMany({
          where: {
            tur_id: dato.tur_id,
            id: { not: datoId },
            status: { in: ["planned"] },
          },
          select: { id: true },
        });
        const andreIds = andreDatoer.map((d) => d.id);
        if (andreIds.length > 0) {
          await tx.tur_dato.updateMany({
            where: { id: { in: andreIds } },
            data: { status: "freed" },
          });
          await tx.tur_pamelding.updateMany({
            where: { tur_dato_id: { in: andreIds } },
            data: { status: "freed" },
          });
        }

        return { locked: true, fristilteDatoer: andreIds.length };
      });

      res.json(resultat);
    } catch (error) {
      console.error("Feil i PATCH /api/turer/datoer/:id/status:", error);
      res.status(500).json({ error: "Intern serverfeil." });
    }
  },
);

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
  const { tur_dato_id, binding } = req.body as {
    tur_dato_id?: number | string;
    binding?: boolean;
  };

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

    // Ved bindende påmelding: sjekk at brukeren ikke har andre
    // overlappende bindende eller låste påmeldinger.
    if (binding === true) {
      const overlapp = await prisma.tur_pamelding.findFirst({
        where: {
          bruker_id: brukerId,
          status: { in: ["binding", "locked"] },
          tur_dato: {
            start_at: { lt: turDato.end_at },
            end_at: { gt: turDato.start_at },
          },
        },
        include: {
          tur_dato: {
            select: {
              start_at: true,
              end_at: true,
              tittel: true,
              tur: { select: { tittel: true } },
            },
          },
        },
      });

      if (overlapp) {
        return res.status(409).json({
          error:
            "Du har allerede en overlappende bindende påmelding for «" +
            (overlapp.tur_dato.tur?.tittel ?? "en annen tur") +
            "». En person kan ikke ha flere overlappende bindende påmeldinger.",
          konflikt: {
            tur: overlapp.tur_dato.tur?.tittel ?? null,
            dato_tittel: overlapp.tur_dato.tittel ?? null,
            start_at: overlapp.tur_dato.start_at,
            end_at: overlapp.tur_dato.end_at,
          },
        });
      }
    }

    const pamelding = await prisma.tur_pamelding.create({
      data: {
        tur_dato_id: turDato.id,
        bruker_id: brukerId,
        status: binding === true ? "binding" : "pending",
      },
    });

    return res.status(201).json({
      message:
        binding === true
          ? "Du har gjort en bindende påmelding til turdatoen."
          : "Du er nå påmeldt turdatoen (interesse registrert).",
      pamelding,
    });
  } catch (error) {
    console.error("Feil i POST /api/turer/:id/pameld:", error);
    return res.status(500).json({ error: "Intern serverfeil." });
  }
});

// AUTH: Oppgrader egen pending-påmelding til bindende, med overlapp-sjekk.
turRouter.patch(
  "/pamelding/:id/binding",
  requireAuth,
  async (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    const brukerId = req.user?.id;

    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Ugyldig pamelding-id." });
    }
    if (!brukerId) {
      return res.status(401).json({ error: "Ikke innlogget." });
    }

    try {
      const pamelding = await prisma.tur_pamelding.findUnique({
        where: { id },
        include: {
          tur_dato: {
            select: { id: true, start_at: true, end_at: true },
          },
        },
      });

      if (!pamelding) {
        return res.status(404).json({ error: "Fant ikke påmeldingen." });
      }
      if (pamelding.bruker_id !== brukerId) {
        return res.status(403).json({ error: "Kan kun oppgradere egne påmeldinger." });
      }
      if (pamelding.status !== "pending") {
        return res.status(409).json({
          error: "Kun pending-påmeldinger kan oppgraderes til bindende.",
        });
      }

      const overlapp = await prisma.tur_pamelding.findFirst({
        where: {
          bruker_id: brukerId,
          id: { not: id },
          status: { in: ["binding", "locked"] },
          tur_dato: {
            start_at: { lt: pamelding.tur_dato.end_at },
            end_at: { gt: pamelding.tur_dato.start_at },
          },
        },
        include: {
          tur_dato: {
            select: {
              start_at: true,
              end_at: true,
              tittel: true,
              tur: { select: { tittel: true } },
            },
          },
        },
      });

      if (overlapp) {
        return res.status(409).json({
          error:
            "Du har allerede en overlappende bindende påmelding for «" +
            (overlapp.tur_dato.tur?.tittel ?? "en annen tur") +
            "». En person kan ikke ha flere overlappende bindende påmeldinger.",
        });
      }

      const oppdatert = await prisma.tur_pamelding.update({
        where: { id },
        data: { status: "binding" },
      });

      return res.json({
        message: "Påmeldingen er nå bindende.",
        pamelding: oppdatert,
      });
    } catch (error) {
      console.error("Feil i PATCH /api/turer/pamelding/:id/binding:", error);
      return res.status(500).json({ error: "Intern serverfeil." });
    }
  }
);

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
// AUTH (eier eller admin): Oppdater tur inkludert turstier og hytter.
turRouter.put(
  "/:id",
  requireAuth,
  async (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    const brukerId = req.user?.id;

    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Ugyldig tur-id." });
    }
    if (!brukerId) {
      return res.status(401).json({ error: "Ikke innlogget" });
    }

    try {
      const existing = await prisma.tur.findUnique({
        where: { id },
        select: { id: true, leder_bruker_id: true },
      });

      if (!existing) {
        return res.status(404).json({ error: "Fant ikke turen." });
      }

      const erEier = existing.leder_bruker_id === brukerId;
      const erAdmin = req.user?.roles.includes("admin") ?? false;
      if (!erEier && !erAdmin) {
        return res.status(403).json({ error: "Du har ikke tilgang til å redigere denne turen." });
      }

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
        beskrivelse?: string | null;
        type?: string | null;
        vanskelighetsgrad?: string | null;
        omrade?: string | null;
        antall_netter?: number | string | null;
        min_deltakere?: number | string | null;
        max_deltakere?: number | string | null;
        status?: string;
        tursti_ids?: number[];
        hytte_ids?: number[];
      };

      const valgtType =
        type && (Object.values(TurType) as string[]).includes(type)
          ? (type as TurType)
          : type === null || type === ""
            ? null
            : undefined;
      const valgtStatus =
        status && (Object.values(TurStatus) as string[]).includes(status)
          ? (status as TurStatus)
          : undefined;

      const tursti_ids_num = Array.isArray(tursti_ids)
        ? tursti_ids.map((v) => Number(v)).filter((v) => Number.isFinite(v))
        : null;
      const hytte_ids_num = Array.isArray(hytte_ids)
        ? hytte_ids.map((v) => Number(v)).filter((v) => Number.isFinite(v))
        : null;

      if (tursti_ids_num !== null && tursti_ids_num.length === 0) {
        return res.status(400).json({ error: "Minst én tursti må velges." });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const tur = await tx.tur.update({
          where: { id },
          data: {
            tittel: tittel ?? undefined,
            beskrivelse: beskrivelse === undefined ? undefined : beskrivelse,
            type: valgtType,
            vanskelighetsgrad:
              vanskelighetsgrad === undefined ? undefined : vanskelighetsgrad,
            omrade: omrade === undefined ? undefined : omrade,
            antall_netter:
              antall_netter === undefined
                ? undefined
                : antall_netter === null || antall_netter === ""
                  ? null
                  : Number(antall_netter),
            min_deltakere:
              min_deltakere === undefined
                ? undefined
                : min_deltakere === null || min_deltakere === ""
                  ? null
                  : Number(min_deltakere),
            max_deltakere:
              max_deltakere === undefined
                ? undefined
                : max_deltakere === null || max_deltakere === ""
                  ? null
                  : Number(max_deltakere),
            status: valgtStatus,
          },
        });

        if (tursti_ids_num !== null) {
          await tx.tur_tursti.deleteMany({ where: { tur_id: id } });
          await tx.tur_tursti.createMany({
            data: tursti_ids_num.map((tursti_id, i) => ({
              tur_id: id,
              tursti_id,
              rekkefolge: i + 1,
            })),
          });
        }

        if (hytte_ids_num !== null) {
          await tx.tur_hytte.deleteMany({ where: { tur_id: id } });
          if (hytte_ids_num.length > 0) {
            await tx.tur_hytte.createMany({
              data: hytte_ids_num.map((hytte_id, i) => ({
                tur_id: id,
                hytte_id,
                rekkefolge: i + 1,
              })),
            });
          }
        }

        return tur;
      });

      res.json(updated);
    } catch (error) {
      console.error("Feil i PUT /api/turer/:id:", error);
      res.status(500).json({ error: "Intern serverfeil." });
    }
  }
);

// AUTH (eier eller admin): Slett egen tur.
turRouter.delete(
  "/:id",
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    const id = Number(req.params.id);
    const brukerId = req.user?.id;

    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Ugyldig tur-id." });
    }
    if (!brukerId) {
      return res.status(401).json({ error: "Ikke innlogget" });
    }

    try {
      const existing = await prisma.tur.findUnique({
        where: { id },
        select: { id: true, leder_bruker_id: true },
      });

      if (!existing) {
        return res.status(404).json({ error: "Fant ikke turen." });
      }

      const erEier = existing.leder_bruker_id === brukerId;
      const erAdmin = req.user?.roles.includes("admin") ?? false;
      if (!erEier && !erAdmin) {
        return res.status(403).json({ error: "Du har ikke tilgang til å slette denne turen." });
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