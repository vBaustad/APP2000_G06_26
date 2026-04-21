import { Router } from "express";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
import path from "path";
import { put } from "@vercel/blob";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import type { AuthedRequest } from "../middleware/auth";
import { uploadChatImage } from "../middleware/upload";

export const chatRouter = Router();

const CHAT_TILGANG_STATUS = ["pending", "binding", "locked"] as const;
const TUR_DATO_PREFIX = "tur_dato:";

function buildTurDatoChatKey(turDatoId: number) {
  return `${TUR_DATO_PREFIX}${turDatoId}`;
}

function parseTurDatoChatId(tittel?: string | null) {
  if (!tittel?.startsWith(TUR_DATO_PREFIX)) return null;
  const verdi = Number(tittel.slice(TUR_DATO_PREFIX.length));
  return Number.isFinite(verdi) ? verdi : null;
}

function formatDateRange(startAt: Date, endAt: Date) {
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
) {
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

  if (!turDato || turDato.status !== "locked") {
    return null;
  }

  const medlemIds = turDato.tur_pamelding.map((pamelding) => pamelding.bruker_id);
  if (!medlemIds.includes(brukerId)) {
    return null;
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

  return {
    chatId: chat.id,
    title:
      turDato.tittel?.trim() ||
      `${turDato.tur.tittel} · ${formatDateRange(turDato.start_at, turDato.end_at)}`,
    subtitle: `${turDato.tur.tittel} · ${formatDateRange(turDato.start_at, turDato.end_at)}`,
  };
}

async function syncLockedChatsForUser(brukerId: number) {
  const lockedDatoer = await prisma.tur_dato.findMany({
    where: {
      status: "locked",
      tur_pamelding: {
        some: {
          bruker_id: brukerId,
          status: { in: [...CHAT_TILGANG_STATUS] },
        },
      },
    },
    select: { id: true },
  });

  for (const turDato of lockedDatoer) {
    await ensureTurDatoChat(prisma, turDato.id, brukerId);
  }
}

function formatNavn(fornavn?: string | null, etternavn?: string | null) {
  return `${fornavn ?? ""} ${etternavn ?? ""}`.trim() || "Bruker";
}

async function getAccessibleChat(chatId: number, brukerId: number) {
  return prisma.chat.findFirst({
    where: {
      id: chatId,
      chat_medlem: {
        some: {
          bruker_id: brukerId,
        },
      },
    },
    include: {
      tur: {
        select: {
          id: true,
          tittel: true,
        },
      },
      chat_medlem: {
        include: {
          bruker: {
            select: {
              id: true,
              fornavn: true,
              etternavn: true,
              epost: true,
            },
          },
        },
      },
      melding: {
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
          melding_bilde: {
            include: {
              melding_bilde_godkjenning: {
                select: {
                  bruker_id: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

function mapChatDetail(
  chat: NonNullable<Awaited<ReturnType<typeof getAccessibleChat>>>,
  brukerId: number,
  turDato:
    | {
        id: number;
        tittel: string | null;
        start_at: Date;
        end_at: Date;
        tur: { id: number; tittel: string };
      }
    | null,
) {
  const andre = chat.chat_medlem
    .map((medlem) => medlem.bruker)
    .filter((bruker) => bruker.id !== brukerId);

  const title =
    chat.type === "direct"
      ? formatNavn(andre[0]?.fornavn, andre[0]?.etternavn)
      : turDato
        ? turDato.tittel?.trim() ||
          `${turDato.tur.tittel} · ${formatDateRange(turDato.start_at, turDato.end_at)}`
        : chat.tittel?.trim() || chat.tur?.tittel || "Gruppesamtale";

  const subtitle =
    chat.type === "direct"
      ? andre[0]?.epost || "Direktemelding"
      : turDato
        ? `${turDato.tur.tittel} · ${formatDateRange(turDato.start_at, turDato.end_at)}`
        : `${chat.chat_medlem.length} deltakere`;

  return {
    id: chat.id,
    type: chat.type,
    title,
    subtitle,
    medlemmer: chat.chat_medlem.map((medlem) => ({
      id: medlem.bruker.id,
      navn: formatNavn(medlem.bruker.fornavn, medlem.bruker.etternavn),
      epost: medlem.bruker.epost,
    })),
    meldinger: chat.melding.map((melding) => {
      const bilder = Array.isArray(melding.melding_bilde) ? melding.melding_bilde : [];

      return {
        id: melding.id,
        body: melding.body ?? "",
        created_at: melding.created_at,
        sender: {
          id: melding.bruker.id,
          navn: formatNavn(melding.bruker.fornavn, melding.bruker.etternavn),
        },
        bilder: bilder.map((bilde) => {
          const godkjenninger = Array.isArray(bilde.melding_bilde_godkjenning)
            ? bilde.melding_bilde_godkjenning
            : [];
          const harGodkjent = godkjenninger.some(
            (godkjenning) => godkjenning.bruker_id === brukerId,
          );

          return {
            id: bilde.id,
            imageUrl: harGodkjent ? bilde.bilde_url : null,
            isVisibleToCurrentUser: harGodkjent,
            requiresApproval: !harGodkjent,
            approvedCount: godkjenninger.length,
          };
        }),
      };
    }),
  };
}

chatRouter.get("/users/search", requireAuth, async (req: AuthedRequest, res) => {
  const brukerId = req.user?.id;
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (!brukerId) {
    return res.status(401).json({ error: "Du må være logget inn." });
  }

  if (q.length < 2) {
    return res.json([]);
  }

  try {
    const brukere = await prisma.bruker.findMany({
      where: {
        id: { not: brukerId },
        OR: [
          { fornavn: { contains: q } },
          { etternavn: { contains: q } },
          { epost: { contains: q } },
        ],
      },
      select: {
        id: true,
        fornavn: true,
        etternavn: true,
        epost: true,
      },
      take: 12,
      orderBy: [{ fornavn: "asc" }, { etternavn: "asc" }],
    });

    return res.json(
      brukere.map((bruker) => ({
        id: bruker.id,
        navn: formatNavn(bruker.fornavn, bruker.etternavn),
        epost: bruker.epost,
      })),
    );
  } catch (error) {
    console.error("Feil i GET /api/chats/users/search:", error);
    return res.status(500).json({ error: "Intern serverfeil." });
  }
});

chatRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const brukerId = req.user?.id;

  if (!brukerId) {
    return res.status(401).json({ error: "Du må være logget inn." });
  }

  try {
    await syncLockedChatsForUser(brukerId);

    const chats = await prisma.chat.findMany({
      where: {
        chat_medlem: {
          some: { bruker_id: brukerId },
        },
      },
      include: {
        tur: {
          select: {
            id: true,
            tittel: true,
          },
        },
        chat_medlem: {
          include: {
            bruker: {
              select: {
                id: true,
                fornavn: true,
                etternavn: true,
              },
            },
          },
        },
        melding: {
          take: 1,
          orderBy: { created_at: "desc" },
          include: {
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

    const turDatoIds = chats
      .map((chat) => parseTurDatoChatId(chat.tittel))
      .filter((value): value is number => value !== null);

    const turDatoer = turDatoIds.length
      ? await prisma.tur_dato.findMany({
          where: { id: { in: turDatoIds } },
          select: {
            id: true,
            tittel: true,
            start_at: true,
            end_at: true,
            tur: {
              select: {
                id: true,
                tittel: true,
              },
            },
          },
        })
      : [];

    const turDatoMap = new Map(turDatoer.map((dato) => [dato.id, dato]));

    const payload = chats
      .map((chat) => {
        const andre = chat.chat_medlem
          .map((medlem) => medlem.bruker)
          .filter((bruker) => bruker.id !== brukerId);

        const turDatoId = parseTurDatoChatId(chat.tittel);
        const turDato = turDatoId ? turDatoMap.get(turDatoId) : null;
        const sisteMelding = chat.melding[0] ?? null;

        const title =
          chat.type === "direct"
            ? formatNavn(andre[0]?.fornavn, andre[0]?.etternavn)
            : turDato
              ? turDato.tittel?.trim() ||
                `${turDato.tur.tittel} · ${formatDateRange(turDato.start_at, turDato.end_at)}`
              : chat.tittel?.trim() || chat.tur?.tittel || "Gruppesamtale";

        const subtitle =
          chat.type === "direct"
            ? andre[0] ? `Direktemelding med ${formatNavn(andre[0].fornavn, andre[0].etternavn)}` : "Direktemelding"
            : turDato
              ? `${turDato.tur.tittel} · ${formatDateRange(turDato.start_at, turDato.end_at)}`
              : `${chat.chat_medlem.length} deltakere`;

        return {
          id: chat.id,
          type: chat.type,
          title,
          subtitle,
          memberCount: chat.chat_medlem.length,
          latestMessage: sisteMelding
            ? {
                body: sisteMelding.body,
                created_at: sisteMelding.created_at,
                senderNavn: formatNavn(
                  sisteMelding.bruker?.fornavn,
                  sisteMelding.bruker?.etternavn,
                ),
              }
            : null,
          updatedAt: sisteMelding?.created_at ?? chat.created_at,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

    return res.json(payload);
  } catch (error) {
    console.error("Feil i GET /api/chats:", error);
    return res.status(500).json({ error: "Intern serverfeil." });
  }
});

chatRouter.post("/direct", requireAuth, async (req: AuthedRequest, res) => {
  const brukerId = req.user?.id;
  const mottakerId = Number(req.body?.recipientUserId);

  if (!brukerId) {
    return res.status(401).json({ error: "Du må være logget inn." });
  }

  if (!Number.isFinite(mottakerId)) {
    return res.status(400).json({ error: "Ugyldig mottaker." });
  }

  if (mottakerId === brukerId) {
    return res.status(400).json({ error: "Du kan ikke starte chat med deg selv." });
  }

  try {
    const mottaker = await prisma.bruker.findUnique({
      where: { id: mottakerId },
      select: { id: true },
    });

    if (!mottaker) {
      return res.status(404).json({ error: "Fant ikke brukeren." });
    }

    const eksisterende = await prisma.chat.findMany({
      where: {
        type: "direct",
        chat_medlem: {
          some: {
            bruker_id: brukerId,
          },
        },
      },
      include: {
        chat_medlem: {
          select: {
            bruker_id: true,
          },
        },
      },
    });

    const funnet = eksisterende.find((chat) => {
      const ids = chat.chat_medlem.map((medlem) => medlem.bruker_id).sort((a, b) => a - b);
      return ids.length === 2 && ids[0] === Math.min(brukerId, mottakerId) && ids[1] === Math.max(brukerId, mottakerId);
    });

    if (funnet) {
      return res.json({ chatId: funnet.id });
    }

    const nyChat = await prisma.chat.create({
      data: {
        type: "direct",
        chat_medlem: {
          create: [{ bruker_id: brukerId }, { bruker_id: mottakerId }],
        },
      },
      select: { id: true },
    });

    return res.status(201).json({ chatId: nyChat.id });
  } catch (error) {
    console.error("Feil i POST /api/chats/direct:", error);
    return res.status(500).json({ error: "Intern serverfeil." });
  }
});

chatRouter.get("/:id", requireAuth, async (req: AuthedRequest, res) => {
  const chatId = Number(req.params.id);
  const brukerId = req.user?.id;

  if (isNaN(chatId)) {
    return res.status(400).json({ error: "Ugyldig chat-id." });
  }

  if (!brukerId) {
    return res.status(401).json({ error: "Du må være logget inn." });
  }

  try {
    const chat = await getAccessibleChat(chatId, brukerId);

    if (!chat) {
      return res.status(404).json({ error: "Fant ikke chatten." });
    }

    const turDatoId = parseTurDatoChatId(chat.tittel);
    const turDato = turDatoId
      ? await prisma.tur_dato.findUnique({
          where: { id: turDatoId },
          select: {
            id: true,
            tittel: true,
            start_at: true,
            end_at: true,
            tur: {
              select: {
                id: true,
                tittel: true,
              },
            },
          },
        })
      : null;

    return res.json(mapChatDetail(chat, brukerId, turDato));
  } catch (error) {
    console.error("Feil i GET /api/chats/:id:", error);
    return res.status(500).json({ error: "Intern serverfeil." });
  }
});

chatRouter.post("/:id/messages", requireAuth, async (req: AuthedRequest, res) => {
  const chatId = Number(req.params.id);
  const brukerId = req.user?.id;
  const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";

  if (isNaN(chatId)) {
    return res.status(400).json({ error: "Ugyldig chat-id." });
  }

  if (!brukerId) {
    return res.status(401).json({ error: "Du må være logget inn." });
  }

  if (!body) {
    return res.status(400).json({ error: "Meldingen kan ikke være tom." });
  }

  try {
    const medlem = await prisma.chat_medlem.findUnique({
      where: {
        chat_id_bruker_id: {
          chat_id: chatId,
          bruker_id: brukerId,
        },
      },
    });

    if (!medlem) {
      return res.status(403).json({ error: "Du har ikke tilgang til chatten." });
    }

    const melding = await prisma.melding.create({
      data: {
        chat_id: chatId,
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

    return res.status(201).json({
      id: melding.id,
      body: melding.body,
      created_at: melding.created_at,
      sender: {
        id: melding.bruker.id,
        navn: formatNavn(melding.bruker.fornavn, melding.bruker.etternavn),
      },
      bilder: [],
    });
  } catch (error) {
    console.error("Feil i POST /api/chats/:id/messages:", error);
    return res.status(500).json({ error: "Intern serverfeil." });
  }
});

chatRouter.post(
  "/:id/images",
  requireAuth,
  (req, res, next) => {
    uploadChatImage(req, res, (err: unknown) => {
      if (err instanceof Error) return res.status(400).json({ error: err.message });
      if (err) return res.status(400).json({ error: "Opplasting feilet" });
      next();
    });
  },
  async (req: AuthedRequest, res) => {
    const chatId = Number(req.params.id);
    const brukerId = req.user?.id;
    const file = req.file;
    const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";

    if (isNaN(chatId)) {
      return res.status(400).json({ error: "Ugyldig chat-id." });
    }

    if (!brukerId) {
      return res.status(401).json({ error: "Du må være logget inn." });
    }

    if (!file) {
      return res.status(400).json({ error: "Ingen bildefil mottatt." });
    }

    try {
      const medlem = await prisma.chat_medlem.findUnique({
        where: {
          chat_id_bruker_id: {
            chat_id: chatId,
            bruker_id: brukerId,
          },
        },
      });

      if (!medlem) {
        return res.status(403).json({ error: "Du har ikke tilgang til chatten." });
      }

      const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
      const key = `chat-images/${crypto.randomBytes(16).toString("hex")}${ext}`;
      const blob = await put(key, file.buffer, {
        access: "public",
        contentType: file.mimetype,
      });

      const created = await prisma.$transaction(async (tx) => {
        const melding = await tx.melding.create({
          data: {
            chat_id: chatId,
            sender_id: brukerId,
            body,
          },
        });

        const bilde = await tx.melding_bilde.create({
          data: {
            melding_id: melding.id,
            bilde_url: blob.url,
            godkjent_av_alle: false,
          },
          include: {
            melding_bilde_godkjenning: {
              select: {
                bruker_id: true,
              },
            },
          },
        });

        const sender = await tx.bruker.findUnique({
          where: { id: brukerId },
          select: {
            id: true,
            fornavn: true,
            etternavn: true,
          },
        });

        return {
          id: melding.id,
          body: melding.body,
          created_at: melding.created_at,
          sender: {
            id: sender!.id,
            navn: formatNavn(sender!.fornavn, sender!.etternavn),
          },
          bilder: [
            {
              id: bilde.id,
              imageUrl: null,
              isVisibleToCurrentUser: false,
              requiresApproval: true,
              approvedCount: bilde.melding_bilde_godkjenning.length,
            },
          ],
        };
      });

      return res.status(201).json(created);
    } catch (error) {
      console.error("Feil i POST /api/chats/:id/images:", error);
      return res.status(500).json({ error: "Intern serverfeil." });
    }
  },
);

chatRouter.post("/:chatId/images/:imageId/approve", requireAuth, async (req: AuthedRequest, res) => {
  const chatId = Number(req.params.chatId);
  const imageId = Number(req.params.imageId);
  const brukerId = req.user?.id;

  if (isNaN(chatId) || isNaN(imageId)) {
    return res.status(400).json({ error: "Ugyldig chat- eller bilde-id." });
  }

  if (!brukerId) {
    return res.status(401).json({ error: "Du må være logget inn." });
  }

  try {
    const medlem = await prisma.chat_medlem.findUnique({
      where: {
        chat_id_bruker_id: {
          chat_id: chatId,
          bruker_id: brukerId,
        },
      },
    });

    if (!medlem) {
      return res.status(403).json({ error: "Du har ikke tilgang til chatten." });
    }

    const bilde = await prisma.melding_bilde.findFirst({
      where: {
        id: imageId,
        melding: {
          chat_id: chatId,
        },
      },
      include: {
        melding: {
          select: {
            sender_id: true,
            chat_id: true,
          },
        },
        melding_bilde_godkjenning: {
          select: {
            bruker_id: true,
          },
        },
      },
    });

    if (!bilde) {
      return res.status(404).json({ error: "Fant ikke bildet." });
    }

    await prisma.melding_bilde_godkjenning.upsert({
      where: {
        bilde_id_bruker_id: {
          bilde_id: imageId,
          bruker_id: brukerId,
        },
      },
      update: {},
      create: {
        bilde_id: imageId,
        bruker_id: brukerId,
      },
    });

    const antallMedlemmer = await prisma.chat_medlem.count({
      where: { chat_id: chatId },
    });
    const antallGodkjenninger = await prisma.melding_bilde_godkjenning.count({
      where: { bilde_id: imageId },
    });

    await prisma.melding_bilde.update({
      where: { id: imageId },
      data: {
        godkjent_av_alle: antallGodkjenninger >= antallMedlemmer,
      },
    });

    return res.json({
      imageId,
      approvedCount: antallGodkjenninger,
      isVisibleToCurrentUser: true,
      imageUrl: bilde.bilde_url,
    });
  } catch (error) {
    console.error("Feil i POST /api/chats/:chatId/images/:imageId/approve:", error);
    return res.status(500).json({ error: "Intern serverfeil." });
  }
});
