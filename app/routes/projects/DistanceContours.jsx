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
    weightStrike: 0,
    weightDip: 0,
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
    ["Shift Strike", "shiftStrikeFrac", -0.5, 0.5, 0.02, `${shiftLKm} km`],
    ["Shift Dip", "shiftDipFrac", -0.5, 0.5, 0.02, `${shiftWKm} km`],
    ["Gewicht Vorne/Hinten", "weightStrike", -1, 1, 0.05, params.weightStrike.toFixed(2)],
    ["Gewicht Oben/Unten", "weightDip", -1, 1, 0.05, params.weightDip.toFixed(2)],
  ];

  return (
    <div className="w-full max-w-[1850px] mx-auto px-4 py-4">

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* Linke Steuerleiste über volle vertikale Höhe */}
        <aside className="flex h-full flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-md">
          {sliders.map(([label, key, min, max, step, displayVal]) => (
            <label key={key} className="block text-xs font-medium text-slate-200">
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
        </aside>

        {/* Rechts alle 7 Karten */}
        <DistanceContourGrid faultParams={params} />
      </div>
    </div>
  );
}
