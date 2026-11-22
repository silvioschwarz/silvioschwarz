import fs from "node:fs/promises";
import path from "node:path";
import { csvParse } from "d3-dsv";
import { calculateEarthquakeDistances } from "../app/utils/calculateEarthquakeDistances.js";

const DATA_DIR = path.resolve("app/external/ground-motion/data");
const OUT_FILE = path.resolve("app/data/ground-motion.json");

function toNum(v) {
  if (v === null || v === undefined) return NaN;
  const s = String(v).trim().replace(",", ".");
  if (s === "") return NaN;
  const n = Number(s);
  return Number.isFinite(n) && n !== -999 ? n : NaN;
}

function round(v, d = 2) {
  return Number.isFinite(v) ? Math.round(v * 10 ** d) / 10 ** d : undefined;
}

function processRow(row, sourceFile) {
  const isNga = sourceFile === "nga-west2.csv";

  const mag = isNga
    ? toNum(row["Earthquake Magnitude"])
    : [toNum(row["Mw"]), toNum(row["ML"]), toNum(row["Ms"])].find(
        Number.isFinite,
      );
/*
  const rawEsmPga = [
    toNum(row["rotD50_pga"]),
    toNum(row["U_pga"]),
    toNum(row["V_pga"]),
  ].find(Number.isFinite);
*/
    let pga;
  if (isNga) {
    pga = toNum(row["PGA (g)"]);
  } else {
    const rawPga = [toNum(row["rotD50_pga"]), toNum(row["U_pga"]), toNum(row["V_pga"])].find(Number.isFinite);
    // Falls ESM-Wert positiv: cm/s^2 -> g; falls negativ: log10(cm/s^2) -> g
    pga = Number.isFinite(rawPga)
      ? (rawPga > 0 ? rawPga / 980.665 : Math.pow(10, rawPga) / 980.665)
      : NaN;
  }

  const hypLat = toNum(
    row[isNga ? "Hypocenter Latitude (deg)" : "ev_latitude"],
  );
  const hypLon = toNum(
    row[isNga ? "Hypocenter Longitude (deg)" : "ev_longitude"],
  );
  const hypDepthKm = toNum(
    row[isNga ? "Hypocenter Depth (km)" : "ev_depth_km"],
  );
  const stLat = toNum(row[isNga ? "Station Latitude" : "st_latitude"]);
  const stLon = toNum(row[isNga ? "Station Longitude" : "st_longitude"]);

  // Strike & Dip aus NGA-West2; falls unbekannt (-999) oder ESM: 0° / 90° als Standard-Approximation
  const rawStrike = isNga ? toNum(row["Strike (deg)"]) : NaN;
  const rawDip = isNga ? toNum(row["Dip (deg)"]) : NaN;
  const strikeDeg = Number.isFinite(rawStrike) ? rawStrike : 0;
  const dipDeg = Number.isFinite(rawDip) ? rawDip : 90;

  let calc = {};
  if ([hypLat, hypLon, hypDepthKm, stLat, stLon, mag].every(Number.isFinite)) {
    calc = calculateEarthquakeDistances({
      hypLat,
      hypLon,
      hypDepthKm: Math.max(0, hypDepthKm),
      stLat,
      stLon,
      strikeDeg,
      dipDeg,
      mw: mag,
      lengthKmOverride: isNga
        ? toNum(row["Fault Rupture Length for Calculation of Ry (km)"])
        : NaN,
      widthKmOverride: isNga ? toNum(row["Fault Rupture Width (km)"]) : NaN,
      zTorKmOverride: isNga
        ? toNum(row["Depth to Top Of Fault Rupture Model"])
        : NaN,
    });
  }

  return {
    _sourceFile: sourceFile,
    "Earthquake Magnitude": round(mag, 2),
    "PGA (g)": Number.isFinite(pga) ? Number(pga.toExponential(4)) : undefined,
    "HypD (km)": round(
      toNum(row[isNga ? "HypD (km)" : "hyp_dist"]) || calc.rHyp,
    ),
    "EpiD (km)": round(
      toNum(row[isNga ? "EpiD (km)" : "epi_dist"]) || calc.rEpi,
    ),
    "Joyner-Boore Dist. (km)": round(
      toNum(row[isNga ? "Joyner-Boore Dist. (km)" : "JB_dist"]) || calc.rJB,
    ),
    "R_rup_calc (km)": round(calc.rRup),
    "R_JB_calc (km)": round(calc.rJB),
    "R_w (km)": round(calc.rW),
    "R_z (km)": round(calc.rZ),
  };
}

async function main() {
  const files = ["nga-west2.csv", "esm.csv"];
  const allRecords = [];

  for (const file of files) {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
    const parsed = csvParse(raw);
    for (const row of parsed) {
      const clean = processRow(row, file);
      if (clean["Earthquake Magnitude"] > 0 && clean["PGA (g)"] > 0) {
        allRecords.push(clean);
      }
    }
  }

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(allRecords));
  console.log(
    `Fertig: ${allRecords.length} Datensätze mit R_w & R_z in ${OUT_FILE} gespeichert.`,
  );
}

main();
