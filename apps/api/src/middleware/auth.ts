/**
 * Fil: auth.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Håndterer autentisering og rollebasert tilgang i API-et.
 */

import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma"
import passport from "../auth/passport";

export type AuthedRequest = Request & {
    user?: { id: number; email: string; roles: string[] };
};

function getBearerToken(req: Request) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
    passport.authenticate("jwt", { session: false }, (err: unknown, user: AuthedRequest["user"] | false) => {
      if (err) return res.status(500).json({ error: "Auth error" });
      if (!user) return res.status(401).json({ error: "Invalid or missing token" });
      req.user = user;
      next();
    })(req, res, next);
  }

export function requireRole(role: string) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (!req.user.roles.includes(role)) return res.status(403).json({ error: `Requires role: ${role}` });
    next();
  };
}
