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
  shiftStrikeFrac = 0, // -0.5 bis +0.5 (entspricht -L/2 bis +L/2)
  shiftDipFrac = 0,    // -0.5 bis +0.5 (entspricht -W/2 bis +W/2)
}) {
  const rad = Math.PI / 180;
  const strike = strikeDeg * rad;
  const dip = dipDeg * rad;

  // Hypozentrum im lokalen Ursprung (0, 0, hypDepthKm), Station relativ dazu in km
  const hyp = [0, 0, hypDepthKm];
  const epi = [0, 0, 0];
  const [stNorth, stEast] = latLonToNED(stLat, stLon, 0, hypLat, hypLon);
  const S = [stNorth, stEast, 0];

  // Orthogonale Einheitsvektoren im NED-System (North, East, Down)
  const usN = Math.cos(strike);
  const usE = Math.sin(strike);

  const udN = -Math.sin(strike) * Math.cos(dip);
  const udE = Math.cos(strike) * Math.cos(dip);
  const udD = Math.sin(dip);

  // Obere linke Ecke P0 relativ zum Hypozentrum:
  // Begrenzung entlang Dip, damit die Oberkante (Z_TOR = p0D) niemals über die Erdoberfläche (0 km) ragt
  const sinDip = Math.max(Math.sin(dip), 1e-4);
  const minShiftDipFrac = Math.max(-0.5, 0.5 - hypDepthKm / (widthKm * sinDip));
  const clampedShiftDipFrac = clamp(shiftDipFrac, minShiftDipFrac, 0.5);

  const offsetS = (-0.5 + shiftStrikeFrac) * lengthKm;
  const offsetD = (-0.5 + clampedShiftDipFrac) * widthKm;

  const p0N = offsetS * usN + offsetD * udN;
  const p0E = offsetS * usE + offsetD * udE;
  const p0D = Math.max(0, hypDepthKm + offsetD * udD);
  // 1. R_rup (kürzester 3D-Abstand Station S -> geneigte Bruchfläche)
  const vN = stNorth - p0N;
  const vE = stEast - p0E;
  const vD = 0 - p0D;

  const projS = clamp(vN * usN + vE * usE, 0, lengthKm);
  const projD = clamp(vN * udN + vE * udE + vD * udD, 0, widthKm);

  const cRupN = p0N + projS * usN + projD * udN;
  const cRupE = p0E + projS * usE + projD * udE;
  const cRupD = p0D + projD * udD;

  const rRup = Math.hypot(stNorth - cRupN, stEast - cRupE, 0 - cRupD);

  // 2. R_JB (kürzester 2D-Abstand Station S -> Oberflächenprojektion)
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

  // 4 Eckpunkte der Bruchfläche
  const c0 = [p0N, p0E, p0D];
  const c1 = [p0N + lengthKm * usN, p0E + lengthKm * usE, p0D];
  const c2 = [
    p0N + lengthKm * usN + widthKm * udN,
    p0E + lengthKm * usE + widthKm * udE,
    p0D + widthKm * udD,
  ];
  const c3 = [p0N + widthKm * udN, p0E + widthKm * udE, p0D + widthKm * udD];
  const corners = [c0, c1, c2, c3];

  const rCorners3D =
    corners.reduce((sum, [cn, ce, cd]) => sum + Math.hypot(stNorth - cn, stEast - ce, 0 - cd), 0) / 4;

  const rCorners2D =
    corners.reduce((sum, [cn, ce]) => sum + Math.hypot(stNorth - cn, stEast - ce), 0) / 4;

  return {
    rRup,
    rJB,
    rHyp,
    rEpi,
    rCorners3D,
    rCorners2D,
    stOffsetKm: { north: stNorth, east: stEast },
    S,
    cRup: [cRupN, cRupE, cRupD],
    cJB: [cJbN, cJbE, 0],
    hyp,
    epi,
    corners,
    clampedShiftDipFrac,
    minShiftDipFrac,
  };
}
