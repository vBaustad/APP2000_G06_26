/**
 * Fil: Jwt.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Ansvarlig for opprettelse og validering av JWT-token brukt til innlogging
 * og tilgangskontroll i applikasjonen.
 *
 * KI-bruk: Claude (Anthropic) og GitHub Copilot er brukt som verktøy
 * under utvikling. All kode er lest, forstått og testet. Se rapportens
 * kapittel "Kommentarer til bruk/tilpassing av kode".
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
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "1h" }); // @Fredrik - endret fra 7d til 1h for bedre sikkerhet
}