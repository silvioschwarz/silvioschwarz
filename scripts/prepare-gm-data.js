import fs from "node:fs/promises";
import path from "node:path";
import * as d3 from "d3";

function parseNum(val) {
  if (val === undefined || val === null || val === "") return NaN;
  return +String(val).replace(",", ".");
}

function normalizeAndTrim(csvText, fileName) {
  const cleanText = csvText.replace(/^\uFEFF/, "");
  const rows = d3.csvParse(cleanText);
  const out = [];

  for (const row of rows) {
    let pga = parseNum(row["PGA (g)"]);
    if (isNaN(pga)) {
      const rawPga = row["rotD50_pga"] || row["U_pga"] || row["V_pga"] || row["W_pga"];
      const pgaCmS2 = parseNum(rawPga);
      if (!isNaN(pgaCmS2)) pga = pgaCmS2 / 980.665;
    }
    if (isNaN(pga) || pga <= 0) continue;

    const mag = parseNum(row["Earthquake Magnitude"] ?? row["Mw"] ?? row["ML"] ?? row["Ms"]);
    const epiD = parseNum(row["EpiD (km)"] ?? row["epi_dist"]);
    const depth = parseNum(row["ev_depth_km"]);
    let hypD = parseNum(row["HypD (km)"]);
    if (isNaN(hypD) && !isNaN(epiD)) {
      hypD = !isNaN(depth) ? Math.sqrt(epiD * epiD + depth * depth) : epiD;
    }
    const jbD = parseNum(row["Joyner-Boore Dist. (km)"] ?? row["JB (km)"] ?? row["JB_dist"]);

    const eqId = String(
      row["Earthquake ID"] || row["EQID"] || row["event_id"] || row["vent_id"] ||
      `${mag}_${row["Earthquake Name"] || row["YEAR"] || ""}`
    ).trim();

    out.push({
      _sourceFile: fileName,
      "Earthquake ID": eqId,
      "Earthquake Magnitude": isNaN(mag) ? null : Math.round(mag * 100) / 100,
      "PGA (g)": Number(pga.toPrecision(5)),
      "HypD (km)": isNaN(hypD) ? null : Math.round(hypD * 100) / 100,
      "EpiD (km)": isNaN(epiD) ? null : Math.round(epiD * 100) / 100,
      "Joyner-Boore Dist. (km)": isNaN(jbD) ? null : Math.round(jbD * 100) / 100,
    });
  }
  return out;
}

const dataDir = path.resolve("app/external/ground-motion/data");
const outDir = path.resolve("app/data");
await fs.mkdir(outDir, { recursive: true });

const records = [];
for (const file of ["nga-west2.csv", "esm.csv"]) {
  const text = await fs.readFile(path.join(dataDir, file), "utf-8");
  records.push(...normalizeAndTrim(text, file));
}

await fs.writeFile(path.join(outDir, "ground-motion.json"), JSON.stringify(records));
console.log(`Fertig: ${records.length} Datensätze komprimiert in app/data/ground-motion.json.`);
