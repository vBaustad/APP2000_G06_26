/**
 * Fil: gpxParser.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Enkel parser for GPX-filer brukt i seed. Ekstraherer
 * trackpoints (lat/lng + elevation hvis tilgjengelig) og støtter
 * nedsampling for å holde punkt-antall håndterbart.
 */

import { readFileSync } from "fs";
import { join } from "path";

export type GpxPoint = { lat: number; lng: number; hoyde_m?: number };

// GPX-filene ligger i apps/api/prisma/data/gpx/
const GPX_DIR = join(__dirname, "..", "..", "prisma", "data", "gpx");

/**
 * Leser GPX-fil fra standardplassering og returnerer alle track-punkter.
 */
export function parseGpxFile(filename: string): GpxPoint[] {
  const absPath = join(GPX_DIR, filename);
  const xml = readFileSync(absPath, "utf-8");

  const points: GpxPoint[] = [];
  const trkptRegex = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>([\s\S]*?)<\/trkpt>|<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*\/>/g;
  const eleRegex = /<ele>([^<]+)<\/ele>/;

  let match: RegExpExecArray | null;
  while ((match = trkptRegex.exec(xml)) !== null) {
    const lat = Number(match[1] ?? match[4]);
    const lng = Number(match[2] ?? match[5]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    let hoyde: number | undefined;
    const body = match[3];
    if (body) {
      const eleMatch = eleRegex.exec(body);
      if (eleMatch) {
        const parsed = Number(eleMatch[1]);
        if (Number.isFinite(parsed)) hoyde = Math.round(parsed);
      }
    }

    points.push(hoyde !== undefined ? { lat, lng, hoyde_m: hoyde } : { lat, lng });
  }

  return points;
}

/**
 * Reduserer et stort array til maks `target` elementer ved å beholde hvert
 * N-te punkt jevnt fordelt. Siste punkt beholdes alltid for å bevare endepunkt.
 */
export function downsample<T>(arr: T[], target: number): T[] {
  if (arr.length <= target) return arr;
  const step = (arr.length - 1) / (target - 1);
  const out: T[] = [];
  for (let i = 0; i < target - 1; i++) {
    out.push(arr[Math.floor(i * step)]);
  }
  out.push(arr[arr.length - 1]);
  return out;
}
