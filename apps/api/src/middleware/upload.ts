/**
 * Fil: upload.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Multer-oppsett (memory storage) for opplasting av hyttebilder.
 * Selve lagringen går til Vercel Blob i route-handleren.
 *
 * KI-bruk: Claude (Anthropic) og GitHub Copilot er brukt som verktøy
 * under utvikling. All kode er lest, forstått og testet. Se rapportens
 * kapittel "Kommentarer til bruk/tilpassing av kode".
 */

import multer from "multer";

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Kun bildefiler er tillatt"));
    return;
  }
  cb(null, true);
};

export const uploadCabinImage = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("bilde");

export const uploadChatImage = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
}).single("bilde");
