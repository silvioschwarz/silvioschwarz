import numpy as np


def calculate_earthquake_distances_vec(
    hyp_lat,
    hyp_lon,
    hyp_depth_km,
    st_lat,
    st_lon,
    strike_deg,
    dip_deg,
    mw,
    shift_strike_frac=0.0,  # Skalar oder Array: -0.5 bis +0.5 (-L/2 bis +L/2)
    shift_dip_frac=0.0,     # Skalar oder Array: -0.5 bis +0.5 (-W/2 bis +W/2)
) -> dict:
    """
    Vektorisierte Berechnung seismologischer Distanzen (R_epi, R_hyp, R_JB, R_rup, R_w, R_z)
    für einzelne Werte, NumPy-Arrays oder Pandas-Spalten.
    """
    hyp_lat = np.asarray(hyp_lat, dtype=np.float64)
    hyp_lon = np.asarray(hyp_lon, dtype=np.float64)
    hyp_depth_km = np.asarray(hyp_depth_km, dtype=np.float64)
    st_lat = np.asarray(st_lat, dtype=np.float64)
    st_lon = np.asarray(st_lon, dtype=np.float64)
    strike = np.radians(np.asarray(strike_deg, dtype=np.float64))
    dip = np.radians(np.asarray(dip_deg, dtype=np.float64))
    mw = np.asarray(mw, dtype=np.float64)
    shift_s = np.asarray(shift_strike_frac, dtype=np.float64)
    shift_d = np.asarray(shift_dip_frac, dtype=np.float64)

    # 1. Bruchflächenlänge L & Breite W (in km) aus Mw nach Wells & Coppersmith (1994)
    length_km = 10.0 ** (-2.44 + 0.59 * mw)
    width_km = 10.0 ** (-1.01 + 0.32 * mw)

    # 2. Station relativ zum Hypozentrum im lokalen NED-System (North, East, Down in km)
    st_north = (st_lat - hyp_lat) * 111.132
    st_east = (st_lon - hyp_lon) * 111.320 * np.cos(np.radians(hyp_lat))

    # 3. Orthogonale Einheitsvektoren der Bruchfläche (Right-Hand-Rule)
    us_n = np.cos(strike)
    us_e = np.sin(strike)

    ud_n = -np.sin(strike) * np.cos(dip)
    ud_e = np.cos(strike) * np.cos(dip)
    ud_d = np.sin(dip)

    # 4. Obere linke Ecke P0 (Oberkante bleibt an/unter Oberfläche: p0_d >= 0)
    sin_dip = np.maximum(np.sin(dip), 1e-4)
    min_offset_d = -hyp_depth_km / sin_dip
    raw_offset_d = (-0.5 + shift_d) * width_km
    offset_d = np.maximum(raw_offset_d, min_offset_d)
    offset_s = (-0.5 + shift_s) * length_km

    p0_n = offset_s * us_n + offset_d * ud_n
    p0_e = offset_s * us_e + offset_d * ud_e
    p0_d = np.maximum(0.0, hyp_depth_km + offset_d * ud_d)

    # 5. R_epi & R_hyp
    r_epi = np.hypot(st_north, st_east)
    r_hyp = np.sqrt(st_north**2 + st_east**2 + hyp_depth_km**2)

    # 6. R_rup (kürzester 3D-Abstand Station -> geneigtes Rechteck)
    v_n = st_north - p0_n
    v_e = st_east - p0_e
    v_d = -p0_d

    proj_s = np.clip(v_n * us_n + v_e * us_e, 0.0, length_km)
    proj_d = np.clip(v_n * ud_n + v_e * ud_e + v_d * ud_d, 0.0, width_km)

    c_rup_n = p0_n + proj_s * us_n + proj_d * ud_n
    c_rup_e = p0_e + proj_s * us_e + proj_d * ud_e
    c_rup_d = p0_d + proj_d * ud_d

    r_rup = np.sqrt((st_north - c_rup_n) ** 2 + (st_east - c_rup_e) ** 2 + (-c_rup_d) ** 2)

    # 7. R_JB (kürzester 2D-Horizontalabstand -> Oberflächenprojektion)
    w_horiz = width_km * np.cos(dip)
    ud_horiz_n = -np.sin(strike)
    ud_horiz_e = np.cos(strike)

    proj_sh = np.clip(v_n * us_n + v_e * us_e, 0.0, length_km)
    proj_dh = np.clip(v_n * ud_horiz_n + v_e * ud_horiz_e, 0.0, w_horiz)

    c_jb_n = p0_n + proj_sh * us_n + proj_dh * ud_horiz_n
    c_jb_e = p0_e + proj_sh * us_e + proj_dh * ud_horiz_e

    r_jb = np.hypot(st_north - c_jb_n, st_east - c_jb_e)

    # 8. Mittlere Distanzen zu den 4 Eckpunkten: R_w (2D-JB-Ecken) & R_z (3D-Bruchecken)
    corners = [
        (p0_n, p0_e, p0_d),
        (p0_n + length_km * us_n, p0_e + length_km * us_e, p0_d),
        (p0_n + length_km * us_n + width_km * ud_n, p0_e + length_km * us_e + width_km * ud_e, p0_d + width_km * ud_d),
        (p0_n + width_km * ud_n, p0_e + width_km * ud_e, p0_d + width_km * ud_d),
    ]

    r_w = sum(np.hypot(st_north - cn, st_east - ce) for cn, ce, _ in corners) / 4.0
    r_z = sum(np.sqrt((st_north - cn) ** 2 + (st_east - ce) ** 2 + (-cd) ** 2) for cn, ce, cd in corners) / 4.0

    return {
        "r_epi": r_epi,
        "r_hyp": r_hyp,
        "r_jb": r_jb,
        "r_rup": r_rup,
        "r_w": r_w,
        "r_z": r_z,
        "length_km": length_km,
        "width_km": width_km,
        "z_tor_km": p0_d,
    }

#import pandas as pd
#
#df enthält z. B. Spalten: hyp_lat, hyp_lon, depth, st_lat, st_lon, strike, dip, mw
#res = calculate_earthquake_distances_vec(
#    hyp_lat=df["hyp_lat"],
#    hyp_lon=df["hyp_lon"],
#    hyp_depth_km=df["depth"],
#    st_lat=df["st_lat"],
#    st_lon=df["st_lon"],
#    strike_deg=df["strike"],
#    dip_deg=df["dip"],
#    mw=df["mw"],
#)
#
#for key in ["r_epi", "r_hyp", "r_jb", "r_rup", "r_w", "r_z"]:
#   df[key] = res[key]
