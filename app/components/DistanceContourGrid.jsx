import { useMemo, useState } from "react";
import { computeDistances } from "../utils/faultDistance.js";
import ContourCard from "./ContourCard.jsx";

const TOP_ROW = [
  { key: "rEpi", title: "R_epi (Epizentrum)", sub: "2D-Abstand zum Epizentrum", color: "text-emerald-400" },
  { key: "rHyp", title: "R_hyp (Hypozentrum)", sub: "3D-Abstand zum Hypozentrum", color: "text-rose-400" },
  { key: "rJB", title: "R_JB (Joyner-Boore)", sub: "2D-Abstand zur JB-Box", color: "text-sky-400" },
  { key: "rRup", title: "R_rup (Rupture)", sub: "3D-Abstand zur Bruchfläche", color: "text-orange-400" },
];

const BOTTOM_ROW = [
  { key: "rEllipse", title: "R_ellipse (Linienquelle)", sub: "Ellipsen-Abstand zu 2 Endpunkten", color: "text-cyan-400" },
  { key: "rCorners2D", title: "R_w (4 JB-Ecken)", sub: "Gewichtetes 2D-Mittel der JB-Ecken", color: "text-yellow-400" },
  { key: "rCorners3D", title: "R_z (4 Bruchecken)", sub: "Gewichtetes 3D-Mittel der Bruchecken", color: "text-purple-400" },
];

const GRID_N = 64;
const EXTENT_KM = 50;

export default function DistanceContourGrid({ faultParams }) {
  const [cursor, setCursor] = useState(null);

  const { grids, corners, epi, lineFoci, maxDist } = useMemo(() => {
    const out = {
      rEpi: new Float64Array(GRID_N * GRID_N),
      rHyp: new Float64Array(GRID_N * GRID_N),
      rJB: new Float64Array(GRID_N * GRID_N),
      rRup: new Float64Array(GRID_N * GRID_N),
      rCorners2D: new Float64Array(GRID_N * GRID_N),
      rCorners3D: new Float64Array(GRID_N * GRID_N),
      rEllipse: new Float64Array(GRID_N * GRID_N),
    };

    const rad = Math.PI / 180;
    const kmPerDegLat = 111.132;
    const kmPerDegLon = 111.320 * Math.cos(faultParams.hypLat * rad);

    let globalMax = 75;
    let sampleCorners = [];
    let sampleEpi = Array.of(0, 0, 0);
    let sampleFoci = [];

    for (let row = 0; row < GRID_N; row++) {
      const northKm = EXTENT_KM - (row / (GRID_N - 1)) * (2 * EXTENT_KM);
      const stLat = faultParams.hypLat + northKm / kmPerDegLat;

      for (let col = 0; col < GRID_N; col++) {
        const eastKm = -EXTENT_KM + (col / (GRID_N - 1)) * (2 * EXTENT_KM);
        const stLon = faultParams.hypLon + eastKm / kmPerDegLon;

        const res = computeDistances({ ...faultParams, stLat, stLon });
        const idx = row * GRID_N + col;

        out.rEpi[idx] = res.rEpi;
        out.rHyp[idx] = res.rHyp;
        out.rJB[idx] = res.rJB;
        out.rRup[idx] = res.rRup;
        out.rCorners2D[idx] = res.rCorners2D;
        out.rCorners3D[idx] = res.rCorners3D;
        out.rEllipse[idx] = res.rEllipse;

        if (row === 0 && col === 0) {
          sampleCorners = res.corners;
          sampleEpi = res.epi;
          sampleFoci = res.lineFoci;
          globalMax = Math.max(70, res.rCorners3D);
        }
      }
    }

    return { grids: out, corners: sampleCorners, epi: sampleEpi, lineFoci: sampleFoci, maxDist: globalMax };
  }, [faultParams]);

  const hoverPos = useMemo(() => {
    if (!cursor) return null;
    const rad = Math.PI / 180;
    const stLat = faultParams.hypLat + cursor.northKm / 111.132;
    const stLon = faultParams.hypLon + cursor.eastKm / (111.320 * Math.cos(faultParams.hypLat * rad));
    const values = computeDistances({ ...faultParams, stLat, stLon });
    return { ...cursor, values };
  }, [cursor, faultParams]);

  const renderCard = (m) => (
    <ContourCard
      key={m.key}
      metric={m}
      gridValues={grids[m.key]}
      corners={corners}
      epi={epi}
      lineFoci={lineFoci}
      maxDist={maxDist}
      hoverPos={hoverPos}
      onHover={setCursor}
    />
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5">
        <div className="text-xs text-slate-300">
          {hoverPos ? (
            <span>
              Position: <strong className="text-sky-400">{hoverPos.northKm.toFixed(1)} km N, {hoverPos.eastKm.toFixed(1)} km E</strong>
            </span>
          ) : (
            <span>
              Gelb = JB-Box · <span className="text-cyan-400">Cyan = Linienquelle</span> · Rot = Epizentrum
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <span className="text-rose-400">0 km</span>
          <div className="h-2.5 w-24 rounded-full border border-slate-600" style={{ background: "linear-gradient(to right, #a50026, #f46d43, #fee08b, #66bd63, #006837)" }} />
          <span className="text-emerald-400">{Math.round(maxDist)} km</span>
        </div>
      </div>

      {/* Reihe 1: 4 Karten (Epi, Hypo, JB, Rupture) */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {TOP_ROW.map(renderCard)}
      </div>

      {/* Reihe 2: 3 Karten (Ellipse, R_w, R_z) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {BOTTOM_ROW.map(renderCard)}
      </div>
    </div>
  );
}
