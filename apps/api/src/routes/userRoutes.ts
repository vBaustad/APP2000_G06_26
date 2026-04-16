/**
 * Fil: userRoutes.ts
 * Utvikler(e): Vebjørn Baustad & Parasto Jamshidi
 * Beskrivelse: API-ruter for innlogget brukers profil. Henter profil med favoritter (tur og hytte) og påmeldinger, 
 * og lar bruker oppdatere egne profilfelter
 */

import { Router, Response } from 'express';
import { prisma } from '../prisma'; // Lagt til { } her
import { requireAuth, AuthedRequest } from '../middleware/auth'; // Byttet navn til requireAuth

export const userRouter = Router();

// 1. Hent profil for den som er logget inn
// Vi bruker AuthedRequest for å få tilgang til req.user
userRouter.get('/me', requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Ikke autorisert" });

    const bruker = await prisma.bruker.findUnique({
      where: { id: req.user.id },
      include: {
        favoritt: { include: { tur: true, hytte: true } },
        tur_pamelding: { include: { tur_dato: { include: { tur: true } } } }
      }
    });
    
    if (!bruker) {
      return res.status(404).json({ error: "Bruker ikke funnet" });
    }
    
    res.json(bruker);
  } catch (error) {
    console.error("Feil ved henting av bruker:", error);
    res.status(500).json({ error: "Kunne ikke hente profil" });
  }
});

// 2. Oppdater profil
userRouter.put('/me', requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Ikke autorisert" });

    const { fornavn, etternavn, epost } = req.body;
    const oppdatert = await prisma.bruker.update({
      where: { id: req.user.id },
      data: { fornavn, etternavn, epost }
    });
    res.json(oppdatert);
  } catch (error) {
    console.error("Feil ved oppdatering av bruker:", error);
    res.status(500).json({ error: "Kunne ikke oppdatere profil" });
  }
});