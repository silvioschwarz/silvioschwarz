function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function computeDistances({
  strikeDeg,
  dipDeg,
  lengthKm,
  widthKm,
  zTorKm,
  stEast,
  stNorth,
}) {
  const rad = Math.PI / 180;
  const strike = strikeDeg * rad;
  const dip = dipDeg * rad;

  // Orthogonale Einheitsvektoren im NED-System (North, East, Down)
  const usN = Math.cos(strike);
  const usE = Math.sin(strike);

  const udN = -Math.sin(strike) * Math.cos(dip);
  const udE = Math.cos(strike) * Math.cos(dip);
  const udD = Math.sin(dip);

  // Obere linke Ecke P0 so setzen, dass die Bruchfläche um (0, 0) zentriert ist
  const p0N = -0.5 * lengthKm * usN - 0.5 * widthKm * udN;
  const p0E = -0.5 * lengthKm * usE - 0.5 * widthKm * udE;
  const p0D = zTorKm;

  // Hypozentrum (Mitte der Bruchfläche) & Epizentrum (Oberfläche)
  const hypN = p0N + 0.5 * lengthKm * usN + 0.5 * widthKm * udN;
  const hypE = p0E + 0.5 * lengthKm * usE + 0.5 * widthKm * udE;
  const hypD = p0D + 0.5 * widthKm * udD;

  // 1. R_rup (3D-Abstand Station S -> geneigtes Rechteck)
  const vN = stNorth - p0N;
  const vE = stEast - p0E;
  const vD = 0 - p0D;

  const projS = clamp(vN * usN + vE * usE, 0, lengthKm);
  const projD = clamp(vN * udN + vE * udE + vD * udD, 0, widthKm);

  const cRupN = p0N + projS * usN + projD * udN;
  const cRupE = p0E + projS * usE + projD * udE;
  const cRupD = p0D + projD * udD;

  const rRup = Math.hypot(stNorth - cRupN, stEast - cRupE, 0 - cRupD);

  // 2. R_JB (2D-Abstand Station S -> Oberflächenprojektion)
  const wHoriz = widthKm * Math.cos(dip);
  const udHorizN = -Math.sin(strike);
  const udHorizE = Math.cos(strike);

  const projSH = clamp(vN * usN + vE * usE, 0, lengthKm);
  const projDH = clamp(vN * udHorizN + vE * udHorizE, 0, wHoriz);

  const cJbN = p0N + projSH * usN + projDH * udHorizN;
  const cJbE = p0E + projSH * usE + projDH * udHorizE;

  const rJB = Math.hypot(stNorth - cJbN, stEast - cJbE);

  // 3. R_hyp & 4. R_epi
  const rHyp = Math.hypot(stNorth - hypN, stEast - hypE, 0 - hypD);
  const rEpi = Math.hypot(stNorth - hypN, stEast - hypE);

  // 4 Eckpunkte der Bruchfläche als [North, East, Down]
  const c0 = [p0N, p0E, p0D];
  const c1 = [p0N + lengthKm * usN, p0E + lengthKm * usE, p0D];
  const c2 = [
    p0N + lengthKm * usN + widthKm * udN,
    p0E + lengthKm * usE + widthKm * udE,
    p0D + widthKm * udD,
  ];
  const c3 = [p0N + widthKm * udN, p0E + widthKm * udE, p0D + widthKm * udD];

  return {
    rRup,
    rJB,
    rHyp,
    rEpi,
    S: [stNorth, stEast, 0],
    cRup: [cRupN, cRupE, cRupD],
    cJB: [cJbN, cJbE, 0],
    hyp: [hypN, hypE, hypD],
    epi: [hypN, hypE, 0],
    corners: [c0, c1, c2, c3],
  };
}
