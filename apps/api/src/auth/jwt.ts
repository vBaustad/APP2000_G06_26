/**
 * Fil: Jwt.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Ansvarlig for opprettelse og validering av JWT-token brukt til innlogging
 * og tilgangskontroll i applikasjonen.
 */

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(payload: { userId: number }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: number };
}
