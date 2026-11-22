import { useState } from "react";
import DistanceContourGrid from "../../components/DistanceContourGrid.jsx";

export default function DistanceContoursRoute() {
  const [params, setParams] = useState({
    hypLat: 35.7695,
    hypLon: -117.5993,
    hypDepthKm: 8.0,
    strikeDeg: 35,
    dipDeg: 45,
    lengthKm: 34,
    widthKm: 18,
    shiftStrikeFrac: 0,
    shiftDipFrac: 0,
  });

  const setVal = (key) => (e) =>
    setParams((p) => ({ ...p, [key]: Number(e.target.value) }));

  const shiftLKm = (params.shiftStrikeFrac * params.lengthKm).toFixed(1);
  const shiftWKm = (params.shiftDipFrac * params.widthKm).toFixed(1);

  const sliders = [
    ["Tiefe Hypozentrum", "hypDepthKm", 0, 35, 0.5, `${params.hypDepthKm} km`],
    ["Strike (Streichen)", "strikeDeg", 0, 360, 1, `${params.strikeDeg}°`],
    ["Dip (Einfallen)", "dipDeg", 5, 90, 1, `${params.dipDeg}°`],
    ["Länge L", "lengthKm", 5, 70, 1, `${params.lengthKm} km`],
    ["Breite W", "widthKm", 5, 40, 1, `${params.widthKm} km`],
    ["Verschiebung Strike (−L/2 … +L/2)", "shiftStrikeFrac", -0.5, 0.5, 0.02, `${shiftLKm} km`],
    ["Verschiebung Dip (−W/2 … +W/2)", "shiftDipFrac", -0.5, 0.5, 0.02, `${shiftWKm} km`],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-md">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Distance Contours — Isolinien-Vergleich der 6 Distanzmaße
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
          Berechnung von R_epi, R_hyp, R_JB, R_rup, R_w und R_z auf einem festen 100 × 100 km Oberflächengitter (Rot = nah, Grün = fern).
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-md sm:grid-cols-2 lg:grid-cols-4">
        {sliders.map(([label, key, min, max, step, displayVal]) => (
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

      <DistanceContourGrid faultParams={params} />
    </div>
  );
}
