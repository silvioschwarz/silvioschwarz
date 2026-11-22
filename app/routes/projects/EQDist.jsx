import { useState } from "react";
import { computeDistances } from "../../utils/faultDistance.js";
import FaultScene3D from "../../components/FaultScene3D.jsx";

export default function EQDistRoute() {
  const [params, setParams] = useState({
    hypLat: 35.7695,
    hypLon: -117.5993,
    hypDepthKm: 8.0,
    stLat: 35.62,
    stLon: -117.38,
    strikeDeg: 322,
    dipDeg: 81,
    lengthKm: 34,
    widthKm: 16,
    shiftStrikeFrac: 0,
    shiftDipFrac: 0,
  });

  const metrics = computeDistances(params);
  const setVal = (key) => (e) =>
    setParams((p) => ({ ...p, [key]: Number(e.target.value) }));

  const cards = [
    { short: "R_epi — Epizentraldistanz", desc: "2D-Abstand an der Oberfläche", val: metrics.rEpi, border: "border-emerald-500", accent: "text-emerald-400" },
    { short: "R_hyp — Hypozentraldistanz", desc: "3D-Abstand zum Erdbebenherd", val: metrics.rHyp, border: "border-rose-500", accent: "text-rose-400" },
    { short: "R_JB — Joyner-Boore Distance", desc: "2D-Abstand zur Bodenprojektion", val: metrics.rJB, border: "border-sky-500", accent: "text-sky-400" },
    { short: "R_rup — Rupture Distance", desc: "Kürzester 3D-Abstand zur Bruchfläche", val: metrics.rRup, border: "border-orange-500", accent: "text-orange-400" },
    { short: "R_w", desc: "Mittlere 2D-Distanz zu den 4 JB-Ecken", val: metrics.rCorners2D, border: "border-yellow-500", accent: "text-yellow-400" },
    { short: "R_z", desc: "Mittlere 3D-Distanz zu allen 4 Bruchecken", val: metrics.rCorners3D, border: "border-purple-500", accent: "text-purple-400" },
  ];

  const shiftLKm = (params.shiftStrikeFrac * params.lengthKm).toFixed(1);
  const shiftWKm = (params.shiftDipFrac * params.widthKm).toFixed(1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-md">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          EqDist — 3D-Distanzberechnung zur Erdbeben-Bruchfläche
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
          Gib Koordinaten von Hypozentrum & Station ein und verschiebe die Bruchfläche relativ zum Herd (−L/2 bis +L/2 bzw. −W/2 bis +W/2).
        </p>
      </div>

      {/* 6 Distanzkarten */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((item) => (
          <div key={item.short} className={`rounded-xl border-l-4 ${item.border} bg-slate-900 p-4 shadow-md`}>
            <div className={`text-sm font-bold ${item.accent}`}>{item.short}</div>
            <div className="mt-0.5 text-xs text-slate-300">{item.desc}</div>
            <div className="mt-2 text-2xl font-extrabold tracking-tight text-white">
              {item.val.toFixed(2)} <span className="text-base font-semibold text-slate-300">km</span>
            </div>
          </div>
        ))}
      </div>

      {/* Koordinaten-Eingabefelder */}
      <div className="mb-5 grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-md md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-rose-400">
            Erdbeben (Hypozentrum)
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              ["Breite (Lat °)", "hypLat", 0.001],
              ["Länge (Lon °)", "hypLon", 0.001],
              ["Tiefe (km)", "hypDepthKm", 0.5],
            ].map(([lbl, key, step]) => (
              <label key={key} className="block text-xs text-slate-300">
                <span className="mb-1 block">{lbl}</span>
                <input
                  type="number"
                  step={step}
                  value={params[key]}
                  onChange={setVal(key)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm font-semibold text-white focus:border-sky-500 focus:outline-none"
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-sky-400">
            Messstation (relativ: {metrics.stOffsetKm.north.toFixed(1)} km N, {metrics.stOffsetKm.east.toFixed(1)} km E)
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              ["Station Lat (°)", "stLat", 0.001],
              ["Station Lon (°)", "stLon", 0.001],
            ].map(([lbl, key, step]) => (
              <label key={key} className="block text-xs text-slate-300">
                <span className="mb-1 block">{lbl}</span>
                <input
                  type="number"
                  step={step}
                  value={params[key]}
                  onChange={setVal(key)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm font-semibold text-white focus:border-sky-500 focus:outline-none"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <FaultScene3D metrics={metrics} />

      {/* Geometrie- & Verschiebungs-Slider */}
      <div className="grid grid-cols-1 gap-5 rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-md sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Strike (Streichen)", "strikeDeg", 0, 360, 1, `${params.strikeDeg}°`],
          ["Dip (Einfallen)", "dipDeg", 5, 90, 1, `${params.dipDeg}°`],
          ["Länge L", "lengthKm", 5, 70, 1, `${params.lengthKm} km`],
          ["Breite W", "widthKm", 5, 40, 1, `${params.widthKm} km`],
          ["Verschiebung Strike (−L/2 … +L/2)", "shiftStrikeFrac", -0.5, 0.5, 0.02, `${shiftLKm} km`],
          ["Verschiebung Dip (−W/2 … +W/2)", "shiftDipFrac", -0.5, 0.5, 0.02, `${shiftWKm} km`],
        ].map(([label, key, min, max, step, displayVal]) => (
          <label key={key} className="block text-sm font-medium text-slate-200">
            <div className="mb-1.5 flex justify-between">
              <span>{label}</span>
              <strong className="font-bold text-sky-400">{displayVal}</strong>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={params[key]}
              onChange={setVal(key)}
              className="h-2 w-full cursor-pointer accent-sky-400"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
