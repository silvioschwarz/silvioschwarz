import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { computeDistances } from "../utils/faultDistance.js";

const METRICS = [
  { key: "rEpi", label: "R_epi", title: "R_epi — Epizentraldistanz", sub: "Kreissymmetrisch um Epizentrum", color: "text-emerald-400" },
  { key: "rHyp", label: "R_hyp", title: "R_hyp — Hypozentraldistanz", sub: "3D-Abstand zum Herd", color: "text-rose-400" },
  { key: "rJB", label: "R_JB", title: "R_JB — Joyner-Boore", sub: "0 km innerhalb der JB-Box", color: "text-sky-400" },
  { key: "rRup", label: "R_rup", title: "R_rup — Rupture Distance", sub: "Asymmetrisch durch Einfallen (Dip)", color: "text-orange-400" },
  { key: "rCorners2D", label: "R_w", title: "R_w — Ø 2D-JB-Ecken", sub: "Mittlerer 2D-Abstand zu 4 Ecken", color: "text-yellow-400" },
  { key: "rCorners3D", label: "R_z", title: "R_z — Ø 3D-Bruchecken", sub: "Mittlerer 3D-Abstand zu 4 Ecken", color: "text-purple-400" },
];

const GRID_N = 64;
const EXTENT_KM = 50;
const THRESHOLDS = Array.from({ length: 16 }, (_, i) => i * 5);

function ContourCard({ metric, gridValues, corners, epi, maxDist, hoverPos, onHover }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = 280;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);

    const contours = d3.contours().size([GRID_N, GRID_N]).thresholds(THRESHOLDS)(gridValues);
    const scale = size / GRID_N;
    const path = d3.geoPath(d3.geoIdentity().scale(scale), ctx);
    const colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, maxDist]);

    for (const c of contours) {
      ctx.beginPath();
      path(c);
      ctx.fillStyle = colorScale(c.value);
      ctx.fill();
      ctx.strokeStyle = "rgba(15, 23, 42, 0.55)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [gridValues, maxDist]);

  const toPct = (km) => ((km + EXTENT_KM) / (2 * EXTENT_KM)) * 100;
  const polyPoints = corners
    .map(([cn, ce]) => `${toPct(ce).toFixed(1)},${toPct(-cn).toFixed(1)}`)
    .join(" ");
  const epiX = toPct(epi.at(1));
  const epiY = toPct(-epi.at(0));

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fracX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const fracY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const eastKm = -EXTENT_KM + fracX * 2 * EXTENT_KM;
    const northKm = EXTENT_KM - fracY * 2 * EXTENT_KM;
    onHover({ eastKm, northKm, pctX: fracX * 100, pctY: fracY * 100 });
  };

  return (
    <div className="flex flex-col items-center rounded-xl border border-slate-800 bg-slate-900 p-3.5 shadow-md">
      <div className="mb-2 flex w-full items-baseline justify-between">
        <div>
          <div className="text-sm font-bold text-white">{metric.title}</div>
          <div className="text-xs text-slate-400">{metric.sub}</div>
        </div>
        {hoverPos && (
          <span className={`text-sm font-extrabold ${metric.color}`}>
            {hoverPos.values[metric.key].toFixed(1)} km
          </span>
        )}
      </div>

      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={() => onHover(null)}
        className="relative aspect-square w-full max-w-[280px] cursor-crosshair overflow-hidden rounded-lg border border-slate-700 bg-emerald-900"
      >
        <canvas ref={canvasRef} width={280} height={280} className="h-full w-full" />
        <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full">
          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
          <polygon points={polyPoints} fill="rgba(250, 204, 21, 0.18)" stroke="#facc15" strokeWidth="1.2" />
          <circle cx={epiX} cy={epiY} r="2.2" fill="#f43f5e" stroke="#ffffff" strokeWidth="0.8" />

          {hoverPos && (
            <g>
              <line x1={hoverPos.pctX} y1="0" x2={hoverPos.pctX} y2="100" stroke="#ffffff" strokeWidth="0.6" strokeDasharray="2 1.5" />
              <line x1="0" y1={hoverPos.pctY} x2="100" y2={hoverPos.pctY} stroke="#ffffff" strokeWidth="0.6" strokeDasharray="2 1.5" />
              <circle cx={hoverPos.pctX} cy={hoverPos.pctY} r="2.1" fill="#38bdf8" stroke="#0f172a" strokeWidth="0.7" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

export default function DistanceContourGrid({ faultParams }) {
  const [cursor, setCursor] = useState(null);

  const { grids, corners, epi, maxDist } = useMemo(() => {
    const out = {
      rEpi: new Float64Array(GRID_N * GRID_N),
      rHyp: new Float64Array(GRID_N * GRID_N),
      rJB: new Float64Array(GRID_N * GRID_N),
      rRup: new Float64Array(GRID_N * GRID_N),
      rCorners2D: new Float64Array(GRID_N * GRID_N),
      rCorners3D: new Float64Array(GRID_N * GRID_N),
    };

    const rad = Math.PI / 180;
    const kmPerDegLat = 111.132;
    const kmPerDegLon = 111.320 * Math.cos(faultParams.hypLat * rad);

    let globalMax = 75;
    let sampleCorners = [];
    let sampleEpi = Array.of(0, 0, 0);

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

        if (row === 0 && col === 0) {
          sampleCorners = res.corners;
          sampleEpi = res.epi;
          globalMax = Math.max(70, res.rCorners3D);
        }
      }
    }

    return { grids: out, corners: sampleCorners, epi: sampleEpi, maxDist: globalMax };
  }, [faultParams]);

  const hoverPos = useMemo(() => {
    if (!cursor) return null;
    const rad = Math.PI / 180;
    const stLat = faultParams.hypLat + cursor.northKm / 111.132;
    const stLon = faultParams.hypLon + cursor.eastKm / (111.320 * Math.cos(faultParams.hypLat * rad));
    const values = computeDistances({ ...faultParams, stLat, stLon });
    return { ...cursor, values };
  }, [cursor, faultParams]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="text-xs text-slate-300">
          {hoverPos ? (
            <span>
              Position: <strong className="text-sky-400">{hoverPos.northKm.toFixed(1)} km N, {hoverPos.eastKm.toFixed(1)} km E</strong>{" "}
              — Fahre über eine beliebige Karte, um alle 6 Werte synchron zu vergleichen
            </span>
          ) : (
            <span>
              Gitter: <strong>100 × 100 km</strong> · Gelb = Bodenprojektion · Roter Punkt = Epizentrum · <em>Maus über Karte bewegen für Live-Werte</em>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <span className="text-rose-400">0 km</span>
          <div
            className="h-3 w-28 rounded-full border border-slate-600"
            style={{ background: "linear-gradient(to right, #a50026, #f46d43, #fee08b, #66bd63, #006837)" }}
          />
          <span className="text-emerald-400">{Math.round(maxDist)} km</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((m) => (
          <ContourCard
            key={m.key}
            metric={m}
            gridValues={grids[m.key]}
            corners={corners}
            epi={epi}
            maxDist={maxDist}
            hoverPos={hoverPos}
            onHover={setCursor}
          />
        ))}
      </div>
    </div>
  );
}
