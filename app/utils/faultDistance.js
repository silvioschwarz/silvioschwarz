function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function latLonToNED(lat, lon, depthKm, refLat, refLon) {
  const rad = Math.PI / 180;
  const n = (lat - refLat) * 111.132;
  const e = (lon - refLon) * 111.320 * Math.cos(refLat * rad);
  return [n, e, depthKm];
}

export function computeDistances({
  hypLat,
  hypLon,
  hypDepthKm,
  stLat,
  stLon,
  strikeDeg,
  dipDeg,
  lengthKm,
  widthKm,
  shiftStrikeFrac = 0, // -0.5 bis +0.5 (-L/2 bis +L/2)
  shiftDipFrac = 0,    // -0.5 bis +0.5 (-W/2 bis +W/2)
  weightStrike = 0,    // -1 (vorne) bis +1 (hinten)
  weightDip = 0,       // -1 (oben) bis +1 (unten)
}) {
  const rad = Math.PI / 180;
  const strike = strikeDeg * rad;
  const dip = dipDeg * rad;

  const hyp = [0, 0, hypDepthKm];
  const epi = Array.of(0, 0, 0);
  const [stNorth, stEast] = latLonToNED(stLat, stLon, 0, hypLat, hypLon);
  const S = [stNorth, stEast, 0];

  const usN = Math.cos(strike);
  const usE = Math.sin(strike);

  const udN = -Math.sin(strike) * Math.cos(dip);
  const udE = Math.cos(strike) * Math.cos(dip);
  const udD = Math.sin(dip);

  const sinDip = Math.max(Math.sin(dip), 1e-4);
  const minOffsetD = -hypDepthKm / sinDip;
  const rawOffsetD = (-0.5 + shiftDipFrac) * widthKm;
  const offsetD = Math.max(rawOffsetD, minOffsetD);
  const offsetS = (-0.5 + shiftStrikeFrac) * lengthKm;

  const p0N = offsetS * usN + offsetD * udN;
  const p0E = offsetS * usE + offsetD * udE;
  const p0D = Math.max(0, hypDepthKm + offsetD * udD);

  // 1. R_rup
  const vN = stNorth - p0N;
  const vE = stEast - p0E;
  const vD = -p0D;

  const projS = clamp(vN * usN + vE * usE, 0, lengthKm);
  const projD = clamp(vN * udN + vE * udE + vD * udD, 0, widthKm);

  const cRupN = p0N + projS * usN + projD * udN;
  const cRupE = p0E + projS * usE + projD * udE;
  const cRupD = p0D + projD * udD;
  const rRup = Math.hypot(stNorth - cRupN, stEast - cRupE, -cRupD);

  // 2. R_JB
  const wHoriz = widthKm * Math.cos(dip);
  const udHorizN = -Math.sin(strike);
  const udHorizE = Math.cos(strike);

  const projSH = clamp(vN * usN + vE * usE, 0, lengthKm);
  const projDH = clamp(vN * udHorizN + vE * udHorizE, 0, wHoriz);

  const cJbN = p0N + projSH * usN + projDH * udHorizN;
  const cJbE = p0E + projSH * usE + projDH * udHorizE;
  const rJB = Math.hypot(stNorth - cJbN, stEast - cJbE);

  // 3. R_hyp & 4. R_epi
  const rHyp = Math.hypot(stNorth, stEast, hypDepthKm);
  const rEpi = Math.hypot(stNorth, stEast);

  // 4 Eckpunkte: c0 (oben-vorne), c1 (oben-hinten), c2 (unten-hinten), c3 (unten-vorne)
  const c0 = [p0N, p0E, p0D];
  const c1 = [p0N + lengthKm * usN, p0E + lengthKm * usE, p0D];
  const c2 = [
    p0N + lengthKm * usN + widthKm * udN,
    p0E + lengthKm * usE + widthKm * udE,
    p0D + widthKm * udD,
  ];
  const c3 = [p0N + widthKm * udN, p0E + widthKm * udE, p0D + widthKm * udD];
  const corners = [c0, c1, c2, c3];

  // Gewichtungsfaktoren (Summe = 1)
  const ws = clamp(weightStrike, -1, 1);
  const wd = clamp(weightDip, -1, 1);
  const weights = [
    ((1 - ws) * (1 - wd)) / 4,
    ((1 + ws) * (1 - wd)) / 4,
    ((1 + ws) * (1 + wd)) / 4,
    ((1 - ws) * (1 + wd)) / 4,
  ];

  const rCorners2D = corners.reduce(
    (sum, [cn, ce], i) => sum + weights.at(i) * Math.hypot(stNorth - cn, stEast - ce),
    0
  );

  const rCorners3D = corners.reduce(
    (sum, [cn, ce, cd], i) => sum + weights.at(i) * Math.hypot(stNorth - cn, stEast - ce, -cd),
    0
  );

  // 7. R_ellipse: Linienquelle an der Oberfläche (Endpunkte F1 vorne, F2 hinten)
  const f1 = [(c0.at(0) + c3.at(0)) / 2, (c0.at(1) + c3.at(1)) / 2, 0];
  const f2 = [(c1.at(0) + c2.at(0)) / 2, (c1.at(1) + c2.at(1)) / 2, 0];

  const dF1 = Math.hypot(stNorth - f1.at(0), stEast - f1.at(1));
  const dF2 = Math.hypot(stNorth - f2.at(0), stEast - f2.at(1));

  const wFront = (1 - ws) / 2;
  const wBack = (1 + ws) / 2;
  const rEllipse = wFront * dF1 + wBack * dF2;

  return {
    rRup,
    rJB,
    rHyp,
    rEpi,
    rCorners3D,
    rCorners2D,
    rEllipse,
    lineFoci: [f1, f2],
    cornerWeights: weights,
    stOffsetKm: { north: stNorth, east: stEast },
    S,
    cRup: [cRupN, cRupE, cRupD],
    cJB: [cJbN, cJbE, 0],
    hyp,
    epi,
    corners,
  };
}
