import { useMemo } from "react";
import * as d3 from "d3";
import GroundMotionDashboard from "../../external/ground-motion/src/GroundMotionDashboard.jsx";
import preloadedRecords from "../../data/ground-motion.json";
import ngaWest2Csv from "../../external/ground-motion/data/nga-west2.csv?raw";
import esmCsv from "../../external/ground-motion/data/esm.csv?raw";

function parseNum(val) {
  if (val === undefined || val === null || val === "") return NaN;
  return +String(val).replace(",", ".");
}

function parseAndNormalizeCsv(csvText, fileName) {
  const cleanText = csvText.replace(/^\uFEFF/, "");
  const firstLine = cleanText.split("\n");
  const rows =
    firstLine.includes(";") && !firstLine.includes(",")
      ? d3.dsvFormat(";").parse(cleanText)
      : d3.csvParse(cleanText);

  const records = [];

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

    records.push({
      _sourceFile: fileName,
      "Earthquake ID": eqId,
      "Earthquake Magnitude": isNaN(mag) ? null : Math.round(mag * 100) / 100,
      "PGA (g)": Number(pga.toPrecision(5)),
      "HypD (km)": isNaN(hypD) ? null : Math.round(hypD * 100) / 100,
      "EpiD (km)": isNaN(epiD) ? null : Math.round(epiD * 100) / 100,
      "Joyner-Boore Dist. (km)": isNaN(jbD) ? null : Math.round(jbD * 100) / 100,
    });
  }
  return records;
}

export default function GroundMotionRoute() {
  return <GroundMotionDashboard preloadedRecords={preloadedRecords} />;
}