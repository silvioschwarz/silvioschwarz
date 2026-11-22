import { useEffect, useRef } from "react";
import * as d3 from "d3";

const GRID_N = 64;
const EXTENT_KM = 50;
const THRESHOLDS = Array.from({ length: 16 }, (_, i) => i * 5);

export default function ContourCard({ metric, gridValues, corners, epi, lineFoci, maxDist, hoverPos, onHover }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = 220;
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
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }

    ctx.font = "bold 9px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (const c of contours) {
      if (c.value <= 0 || c.value % 10 !== 0) continue;
      let bestPt = null;
      let bestScore = -Infinity;

      for (const polygon of c.coordinates) {
        for (const ring of polygon) {
          if (!ring || ring.length < 6) continue;
          for (let i = 0; i < ring.length; i++) {
            const pt = ring.at(i);
            const gx = pt.at(0);
            const gy = pt.at(1);
            if (gx <= 2 || gx >= GRID_N - 2 || gy <= 2 || gy >= GRID_N - 2) continue;
            const px = gx * scale;
            const py = gy * scale;
            if (px < 14 || px > size - 14 || py < 12 || py > size - 12) continue;
            const score = px - py;
            if (score > bestScore) {
              bestScore = score;
              bestPt = { px, py };
            }
          }
        }
      }

      if (bestPt) {
        const label = String(c.value);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(15, 23, 42, 0.9)";
        ctx.strokeText(label, bestPt.px, bestPt.py);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, bestPt.px, bestPt.py);
      }
    }
  }, [gridValues, maxDist]);

  const toPct = (km) => ((km + EXTENT_KM) / (2 * EXTENT_KM)) * 100;
  const polyPoints = corners.map(([cn, ce]) => `${toPct(ce).toFixed(1)},${toPct(-cn).toFixed(1)}`).join(" ");
  const epiX = toPct(epi.at(1));
  const epiY = toPct(-epi.at(0));

  const f1 = lineFoci.at(0) || Array.of(0, 0, 0);
  const f2 = lineFoci.at(1) || Array.of(0, 0, 0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fracX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const fracY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    onHover({
      eastKm: -EXTENT_KM + fracX * 2 * EXTENT_KM,
      northKm: EXTENT_KM - fracY * 2 * EXTENT_KM,
      pctX: fracX * 100,
      pctY: fracY * 100,
    });
  };

  return (
    <div className="flex flex-col items-center rounded-xl border border-slate-800 bg-slate-900 p-2.5 shadow-md">
      <div className="mb-1.5 flex w-full items-baseline justify-between gap-1">
        <div className="truncate text-xs font-bold text-white" title={metric.sub}>
          {metric.title}
        </div>
        {hoverPos && (
          <span className={`shrink-0 text-xs font-extrabold ${metric.color}`}>
            {hoverPos.values[metric.key].toFixed(1)} km
          </span>
        )}
      </div>

      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={() => onHover(null)}
        className="relative aspect-square w-full max-w-[215px] cursor-crosshair overflow-hidden rounded-lg border border-slate-700 bg-emerald-900"
      >
        <canvas ref={canvasRef} width={220} height={220} className="h-full w-full" />
        <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full">
          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
          <polygon points={polyPoints} fill="rgba(250, 204, 21, 0.16)" stroke="#facc15" strokeWidth="1.2" />
          <line x1={toPct(f1.at(1))} y1={toPct(-f1.at(0))} x2={toPct(f2.at(1))} y2={toPct(-f2.at(0))} stroke="#22d3ee" strokeWidth="1.3" strokeDasharray="2.5 1.5" />
          <circle cx={toPct(f1.at(1))} cy={toPct(-f1.at(0))} r="1.9" fill="#22d3ee" stroke="#0f172a" strokeWidth="0.6" />
          <circle cx={toPct(f2.at(1))} cy={toPct(-f2.at(0))} r="1.9" fill="#22d3ee" stroke="#0f172a" strokeWidth="0.6" />
          <circle cx={epiX} cy={epiY} r="2.3" fill="#f43f5e" stroke="#ffffff" strokeWidth="0.8" />
          {hoverPos && (
            <g>
              <line x1={hoverPos.pctX} y1="0" x2={hoverPos.pctX} y2="100" stroke="#ffffff" strokeWidth="0.6" strokeDasharray="2 1.5" />
              <line x1="0" y1={hoverPos.pctY} x2="100" y2={hoverPos.pctY} stroke="#ffffff" strokeWidth="0.6" strokeDasharray="2 1.5" />
              <circle cx={hoverPos.pctX} cy={hoverPos.pctY} r="2.2" fill="#38bdf8" stroke="#0f172a" strokeWidth="0.7" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
