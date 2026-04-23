/**
 * Fil: weatherRoutes.ts
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse:
 * Henter værdata fra MET/Yr Locationforecast og eksponerer et enkelt JSON-svar
 * til frontend basert på koordinater.
 */

import { Router } from "express";

export const weatherRouter = Router();

type YrInstantDetails = {
  air_temperature?: number;
  wind_speed?: number;
  cloud_area_fraction?: number;
};

type YrTimeseriesItem = {
  time: string;
  data?: {
    instant?: {
      details?: YrInstantDetails;
    };
    next_1_hours?: {
      summary?: {
        symbol_code?: string;
      };
      details?: {
        precipitation_amount?: number;
      };
    };
  };
};

function mapSymbolToText(symbolCode?: string) {
  if (!symbolCode) return "Ukjent vær";

  if (symbolCode.includes("clearsky")) return "Klart";
  if (symbolCode.includes("fair")) return "Lettskyet";
  if (symbolCode.includes("partlycloudy")) return "Delvis skyet";
  if (symbolCode.includes("cloudy")) return "Skyet";
  if (symbolCode.includes("rain")) return "Regn";
  if (symbolCode.includes("heavyrain")) return "Kraftig regn";
  if (symbolCode.includes("snow")) return "Snø";
  if (symbolCode.includes("fog")) return "Tåke";

  return symbolCode;
}

function buildStatusText(
  temperature?: number,
  wind?: number,
  precipitation?: number,
) {
  if (typeof precipitation === "number" && precipitation > 2) {
    return "Våte forhold – vurder klær og utstyr nøye.";
  }

  if (typeof wind === "number" && wind > 10) {
    return "Det blåser en del – vær ekstra oppmerksom i åpne områder.";
  }

  if (typeof temperature === "number" && temperature <= 0) {
    return "Kalde forhold – kle deg godt og vær oppmerksom på glatte partier.";
  }

  return "Forholdene ser relativt gode ut for turplanlegging.";
}

weatherRouter.get("/", async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({ error: "Ugyldige koordinater." });
  }

  const roundedLat = Number(lat.toFixed(4));
  const roundedLon = Number(lon.toFixed(4));

  try {
    const yrRes = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${roundedLat}&lon=${roundedLon}`,
      {
        headers: {
          "User-Agent": "Utopia APP2000/1.0 ramona.tcretulescu@student.usn.no",
          Accept: "application/json",
        },
      },
    );

    if (!yrRes.ok) {
      return res.status(yrRes.status).json({ error: "Kunne ikke hente værdata fra Yr." });
    }

    const data = await yrRes.json();

    const first: YrTimeseriesItem | undefined = data?.properties?.timeseries?.[0];
    const details = first?.data?.instant?.details;
    const next1h = first?.data?.next_1_hours;

    const temperature = details?.air_temperature ?? null;
    const wind = details?.wind_speed ?? null;
    const precipitation = next1h?.details?.precipitation_amount ?? null;
    const symbolCode = next1h?.summary?.symbol_code ?? null;
    const condition = mapSymbolToText(symbolCode ?? undefined);

    return res.json({
      updatedAt: data?.properties?.meta?.updated_at ?? null,
      condition,
      symbolCode,
      temperature,
      wind,
      precipitation,
      cloudAreaFraction: details?.cloud_area_fraction ?? null,
      statusText: buildStatusText(
        temperature ?? undefined,
        wind ?? undefined,
        precipitation ?? undefined,
      ),
    });
  } catch (error) {
    console.error("Feil i GET /api/weather:", error);
    return res.status(500).json({ error: "Intern serverfeil." });
  }
});