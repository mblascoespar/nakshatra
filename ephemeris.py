"""
Thin wrapper around pyswisseph.
Used ONLY by precompute.py — never called at API request time.
"""

from datetime import datetime, timezone
import swisseph as swe

# Use the Moshier ephemeris — built into pyswisseph, no data files required.
# Accuracy is ~1 arcsecond for Moon, far more than needed for Nakshatra/Tithi
# determination (which only requires ~0.5° = 1800 arcsecond precision).
# Lahiri ayanamsa is the standard for Vedic (sidereal) astrology in India.
swe.set_sid_mode(swe.SIDM_LAHIRI)
_FLAGS = swe.FLG_MOSEPH | swe.FLG_SIDEREAL

NAKSHATRA_SPAN = 360.0 / 27   # 13.333...°
TITHI_SPAN = 12.0              # degrees of Sun-Moon elongation per Tithi


def utc_to_jd(dt: datetime) -> float:
    """Convert a UTC datetime to a Julian Day number."""
    ut = dt.hour + dt.minute / 60.0 + dt.second / 3600.0
    return swe.julday(dt.year, dt.month, dt.day, ut)


def jd_to_utc(jd: float) -> datetime:
    """Convert a Julian Day number to a UTC datetime (second precision)."""
    year, month, day, hour_frac = swe.revjul(jd)
    h = int(hour_frac)
    m = int((hour_frac - h) * 60)
    s = int(((hour_frac - h) * 60 - m) * 60)
    return datetime(int(year), int(month), int(day), h, m, s, tzinfo=timezone.utc)


def moon_longitude(jd: float) -> float:
    xx, _ = swe.calc_ut(jd, swe.MOON, _FLAGS)
    return xx[0]


def sun_longitude(jd: float) -> float:
    xx, _ = swe.calc_ut(jd, swe.SUN, _FLAGS)
    return xx[0]


def nakshatra_index(moon_lon: float) -> int:
    """Returns 0-26."""
    return int(moon_lon / NAKSHATRA_SPAN) % 27


def tithi_index(moon_lon: float, sun_lon: float) -> int:
    """Returns 0-29."""
    diff = (moon_lon - sun_lon) % 360.0
    return int(diff / TITHI_SPAN) % 30


def _bisect_nakshatra(jd1: float, jd2: float, prev_idx: int) -> float:
    """Bisect to find the JD when nakshatra_index changes from prev_idx."""
    for _ in range(20):  # 2^20 steps → sub-second precision from a 10-min window
        mid = (jd1 + jd2) / 2.0
        if nakshatra_index(moon_longitude(mid)) == prev_idx:
            jd1 = mid
        else:
            jd2 = mid
    return (jd1 + jd2) / 2.0


def _bisect_tithi(jd1: float, jd2: float, prev_idx: int) -> float:
    """Bisect to find the JD when tithi_index changes from prev_idx."""
    for _ in range(20):
        mid = (jd1 + jd2) / 2.0
        ml = moon_longitude(mid)
        sl = sun_longitude(mid)
        if tithi_index(ml, sl) == prev_idx:
            jd1 = mid
        else:
            jd2 = mid
    return (jd1 + jd2) / 2.0


def compute_sunrise_jd(date_utc_midnight: float, lat: float, lon: float) -> float:
    """
    Return the JD of sunrise for the given date at the reference location.
    Falls back to 06:00 local-ish (6/24 of a day after midnight) on failure.
    """
    geopos = (lon, lat, 0.0)  # (longitude_east, latitude_north, altitude_m)
    try:
        ret, tret = swe.rise_trans(
            date_utc_midnight, swe.SUN, swe.CALC_RISE, geopos,
            atpress=1013.25, attemp=15.0,
        )
        if ret >= 0 and tret[0] > 0:
            return tret[0]
    except Exception:
        pass
    return date_utc_midnight + 6.0 / 24.0  # fallback: 06:00 UTC


def find_transitions(
    start_dt: datetime,
    end_dt: datetime,
    step_minutes: int = 10,
) -> tuple[list[tuple[datetime, int]], list[tuple[datetime, int]]]:
    """
    Walk the time range in `step_minutes` steps, detect Nakshatra and Tithi
    crossings, bisect each to second-level precision.

    Returns:
        nakshatra_transitions: list of (utc_datetime, new_nakshatra_index_0based)
        tithi_transitions:     list of (utc_datetime, new_tithi_index_0based)
    """
    step_jd = step_minutes / (24.0 * 60.0)

    jd = utc_to_jd(start_dt)
    end_jd = utc_to_jd(end_dt)

    ml = moon_longitude(jd)
    sl = sun_longitude(jd)
    prev_nk = nakshatra_index(ml)
    prev_tt = tithi_index(ml, sl)
    prev_jd = jd

    nk_transitions: list[tuple[datetime, int]] = []
    tt_transitions: list[tuple[datetime, int]] = []

    jd += step_jd

    while jd <= end_jd:
        ml = moon_longitude(jd)
        sl = sun_longitude(jd)
        nk = nakshatra_index(ml)
        tt = tithi_index(ml, sl)

        if nk != prev_nk:
            crossing_jd = _bisect_nakshatra(prev_jd, jd, prev_nk)
            # Use nk (the scan-step value) directly — re-computing from crossing_jd
            # is unreliable because the boundary point is ambiguous under floating point.
            nk_transitions.append((jd_to_utc(crossing_jd), nk))
            prev_nk = nk

        if tt != prev_tt:
            crossing_jd = _bisect_tithi(prev_jd, jd, prev_tt)
            # Same reasoning: use the scan-step value tt directly.
            tt_transitions.append((jd_to_utc(crossing_jd), tt))
            prev_tt = tt

        prev_jd = jd
        jd += step_jd

    return nk_transitions, tt_transitions
