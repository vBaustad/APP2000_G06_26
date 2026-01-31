import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../auth/jwt";
import { prisma } from "../prisma"

export type AuthedRequest = Request & {
  user?: { id: number; roles: string[] };
};

function getBearerToken(req: Request) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: "Missing Bearer token" });

    const { userId } = verifyToken(token);

    // Hent roller via join: bruker_rolle -> rolle
    const user = await prisma.bruker.findUnique({
      where: { id: userId },
      select: {
        id: true,
        bruker_rolle: {
          select: {
            rolle: { select: { kode: true } },
          },
        },
      },
    });

    if (!user) return res.status(401).json({ error: "User not found" });

    const roles = user.bruker_rolle.map((ur: { rolle: { kode: any; }; }) => ur.rolle.kode);

    req.user = { id: user.id, roles };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(role: string) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (!req.user.roles.includes(role)) return res.status(403).json({ error: `Requires role: ${role}` });
    next();
  };
}
