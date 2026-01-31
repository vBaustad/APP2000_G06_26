/**
 * Fil: password.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Håndterer hashing og verifisering av passord for sikker innlogging.
 */

import bcrypt from "bcrypt";

export async function hashPassword(password: string) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
