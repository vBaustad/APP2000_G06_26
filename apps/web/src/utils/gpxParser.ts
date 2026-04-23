/**
 * Fil: gpxParser.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Klient-sidig parser for GPX-filer. Ekstraherer trackpoints
 * og valgfritt navn fra <name>-tag. Støtter nedsampling så lange GPX-filer
 * ikke blåser opp UI-en eller DB-en.
 *
 * KI-bruk: Claude (Anthropic) og GitHub Copilot er brukt som verktøy
 * under utvikling. All kode er lest, forstått og testet. Se rapportens
 * kapittel "Kommentarer til bruk/tilpassing av kode".
 */

export type GpxPoint = { lat: number; lng: number; hoyde_m?: number };

export type GpxResult = {
  name: string | null;
  points: GpxPoint[];
};

/**
 * Parse en GPX-tekststreng og returner alle trackpoints + navn.
 */
export function parseGpxText(xml: string): GpxResult {
  const points: GpxPoint[] = [];

  const trkptRegex =
    /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>([\s\S]*?)<\/trkpt>|<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*\/>/g;
  const eleRegex = /<ele>([^<]+)<\/ele>/;

  let match: RegExpExecArray | null;
  while ((match = trkptRegex.exec(xml)) !== null) {
    const lat = Number(match[1] ?? match[4]);
    const lng = Number(match[2] ?? match[5]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    let hoyde: number | undefined;
    const body = match[3];
    if (body) {
      const ele = eleRegex.exec(body);
      if (ele) {
        const parsed = Number(ele[1]);
        if (Number.isFinite(parsed)) hoyde = Math.round(parsed);
      }
    }

    points.push(hoyde !== undefined ? { lat, lng, hoyde_m: hoyde } : { lat, lng });
  }

  const nameMatch = /<name>([^<]+)<\/name>/.exec(xml);
  const name = nameMatch ? nameMatch[1].trim() : null;

  return { name, points };
}

/**
 * Reduserer punkt-antall til maks `target` (default 100) med jevn fordeling.
 * Siste punkt beholdes alltid.
 */
export function downsample<T>(arr: T[], target = 100): T[] {
  if (arr.length <= target) return arr;
  const step = (arr.length - 1) / (target - 1);
  const out: T[] = [];
  for (let i = 0; i < target - 1; i++) {
    out.push(arr[Math.floor(i * step)]);
  }
  out.push(arr[arr.length - 1]);
  return out;
}
