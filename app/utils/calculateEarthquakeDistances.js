export function calculateEarthquakeDistances({
  hypLat,
  hypLon,
  hypDepthKm,
  stLat,
  stLon,
  strikeDeg,
  dipDeg,
  mw,
  lengthKmOverride = NaN,
  widthKmOverride = NaN,
  zTorKmOverride = NaN,
  shiftStrikeFrac = 0,
  shiftDipFrac = 0,
}) {
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const rad = Math.PI / 180;

  // 1. Echte Bruchflächendimensionen bevorzugen, sonst Wells & Coppersmith (1994)
  const lengthKm =
    Number.isFinite(lengthKmOverride) && lengthKmOverride > 0
      ? lengthKmOverride
      : Math.pow(10, -2.44 + 0.59 * mw);

  const widthKm =
    Number.isFinite(widthKmOverride) && widthKmOverride > 0
      ? widthKmOverride
      : Math.pow(10, -1.01 + 0.32 * mw);

  // 2. Station relativ zum Hypozentrum in lokales NED-System (North, East, Down in km)
  const stNorth = (stLat - hypLat) * 111.132;
  const stEast = (stLon - hypLon) * 111.320 * Math.cos(hypLat * rad);

  // 3. Orthogonale Einheitsvektoren (Right-Hand-Rule)
  const strike = strikeDeg * rad;
  const dip = dipDeg * rad;

  const usN = Math.cos(strike);
  const usE = Math.sin(strike);

  const udN = -Math.sin(strike) * Math.cos(dip);
  const udE = Math.cos(strike) * Math.cos(dip);
  const udD = Math.sin(dip);

  // 4. Obere linke Ecke P0 (Z_TOR aus CSV bevorzugen, falls vorhanden)
  const sinDip = Math.max(Math.sin(dip), 1e-4);
  const offsetS = (-0.5 + shiftStrikeFrac) * lengthKm;

  let offsetD;
  let p0D;
  if (Number.isFinite(zTorKmOverride) && zTorKmOverride >= 0) {
    p0D = zTorKmOverride;
    offsetD = (p0D - hypDepthKm) / sinDip;
  } else {
    const minOffsetD = -hypDepthKm / sinDip;
    const rawOffsetD = (-0.5 + shiftDipFrac) * widthKm;
    offsetD = Math.max(rawOffsetD, minOffsetD);
    p0D = Math.max(0, hypDepthKm + offsetD * udD);
  }

  const p0N = offsetS * usN + offsetD * udN;
  const p0E = offsetS * usE + offsetD * udE;

  // 5. R_epi & R_hyp
  const rEpi = Math.hypot(stNorth, stEast);
  const rHyp = Math.hypot(stNorth, stEast, hypDepthKm);

  // 6. R_rup (3D-Abstand zur geneigten Bruchfläche)
  const vN = stNorth - p0N;
  const vE = stEast - p0E;
  const vD = -p0D;

  const projS = clamp(vN * usN + vE * usE, 0, lengthKm);
  const projD = clamp(vN * udN + vE * udE + vD * udD, 0, widthKm);

  const cRupN = p0N + projS * usN + projD * udN;
  const cRupE = p0E + projS * usE + projD * udE;
  const cRupD = p0D + projD * udD;

  const rRup = Math.hypot(stNorth - cRupN, stEast - cRupE, -cRupD);

  // 7. R_JB (2D-Abstand zur Oberflächenprojektion)
  const wHoriz = widthKm * Math.cos(dip);
  const udHorizN = -Math.sin(strike);
  const udHorizE = Math.cos(strike);

  const projSH = clamp(vN * usN + vE * usE, 0, lengthKm);
  const projDH = clamp(vN * udHorizN + vE * udHorizE, 0, wHoriz);

  const cJbN = p0N + projSH * usN + projDH * udHorizN;
  const cJbE = p0E + projSH * usE + projDH * udHorizE;

  const rJB = Math.hypot(stNorth - cJbN, stEast - cJbE);

  // 8. R_w (Ø 2D-JB-Ecken) & R_z (Ø 3D-Bruchecken)
  const corners = [
    [p0N, p0E, p0D],
    [p0N + lengthKm * usN, p0E + lengthKm * usE, p0D],
    [p0N + lengthKm * usN + widthKm * udN, p0E + lengthKm * usE + widthKm * udE, p0D + widthKm * udD],
    [p0N + widthKm * udN, p0E + widthKm * udE, p0D + widthKm * udD],
  ];

  const rW = corners.reduce((s, [cn, ce]) => s + Math.hypot(stNorth - cn, stEast - ce), 0) / 4;
  const rZ = corners.reduce((s, [cn, ce, cd]) => s + Math.hypot(stNorth - cn, stEast - ce, -cd), 0) / 4;

  return { rEpi, rHyp, rJB, rRup, rW, rZ };
}



/*
const distances = calculateEarthquakeDistances({
  hypLat: 35.7695,
  hypLon: -117.5993,
  hypDepthKm: 8.0,
  stLat: 35.62,
  stLon: -117.38,
  strikeDeg: 322,
  dipDeg: 81,
  mw: 7.1,
});
*/