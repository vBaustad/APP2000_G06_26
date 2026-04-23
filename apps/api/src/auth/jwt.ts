/**
 * Fil: Jwt.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Ansvarlig for opprettelse og validering av JWT-token brukt til innlogging
 * og tilgangskontroll i applikasjonen.
 */

import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET in apps/api/.env");
  }
  return secret;
}

export function signToken(payload: { userId: number }) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}