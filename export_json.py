"""
Static JSON export script. Run after precompute.py for each year.

Usage:
    uv run export_json.py --year 2026
    uv run export_json.py --year 2026 --year 2027   # multiple years

Reads the SQLite DB produced by precompute.py, then computes sunrise nakshatras
for every city in the app's location list and writes three JSON files per year to
frontend/public/data/:

  nakshatra_transitions_{year}.json  — [{utc, nakshatra_id}, ...]
  tithi_transitions_{year}.json      — [{utc, tithi_index}, ...]
  sunrise_nakshatras_{year}.json     — {cityLabel: {"YYYY-MM-DD": nk_id, ...}, ...}

Runtime: ~5-10 seconds per year (45 cities × 365 ephemeris calls).
"""

import argparse
import json
import logging
import sqlite3
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from ephemeris import compute_sunrise_jd, moon_longitude, nakshatra_index, utc_to_jd

try:
    from zoneinfo import ZoneInfo
except ImportError:
    from backports.zoneinfo import ZoneInfo

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
DATA_DIR = ROOT_DIR / "data"
OUT_DIR  = ROOT_DIR / "frontend" / "public" / "data"

# Canonical city list — mirrors LocationSelector.jsx exactly.
# Key: city label (used as the JSON lookup key in the frontend).
# tz_name: IANA timezone name (handles DST automatically)
CITIES = [
    # India
    {"label": "Mumbai",        "lat":  19.08, "lon":  72.88, "tz_name": "Asia/Kolkata"},
    {"label": "Delhi",         "lat":  28.67, "lon":  77.22, "tz_name": "Asia/Kolkata"},
    {"label": "Bangalore",     "lat":  12.97, "lon":  77.59, "tz_name": "Asia/Kolkata"},
    {"label": "Chennai",       "lat":  13.08, "lon":  80.27, "tz_name": "Asia/Kolkata"},
    {"label": "Hyderabad",     "lat":  17.38, "lon":  78.48, "tz_name": "Asia/Kolkata"},
    {"label": "Kolkata",       "lat":  22.57, "lon":  88.37, "tz_name": "Asia/Kolkata"},
    {"label": "Pune",          "lat":  18.52, "lon":  73.86, "tz_name": "Asia/Kolkata"},
    {"label": "Ahmedabad",     "lat":  23.03, "lon":  72.58, "tz_name": "Asia/Kolkata"},
    {"label": "Jaipur",        "lat":  26.92, "lon":  75.82, "tz_name": "Asia/Kolkata"},
    {"label": "Kochi",         "lat":   9.93, "lon":  76.27, "tz_name": "Asia/Kolkata"},
    {"label": "Varanasi",      "lat":  25.32, "lon":  82.97, "tz_name": "Asia/Kolkata"},
    {"label": "Nagpur",        "lat":  21.15, "lon":  79.09, "tz_name": "Asia/Kolkata"},
    # South Asia
    {"label": "Colombo",       "lat":   6.93, "lon":  79.85, "tz_name": "Asia/Colombo"},
    {"label": "Kathmandu",     "lat":  27.71, "lon":  85.31, "tz_name": "Asia/Kathmandu"},
    {"label": "Dhaka",         "lat":  23.72, "lon":  90.41, "tz_name": "Asia/Dhaka"},
    # Middle East
    {"label": "Dubai",         "lat":  25.20, "lon":  55.27, "tz_name": "Asia/Dubai"},
    {"label": "Abu Dhabi",     "lat":  24.45, "lon":  54.37, "tz_name": "Asia/Dubai"},
    {"label": "Muscat",        "lat":  23.59, "lon":  58.41, "tz_name": "Asia/Muscat"},
    {"label": "Kuwait City",   "lat":  29.37, "lon":  47.98, "tz_name": "Asia/Kuwait"},
    # East Africa
    {"label": "Nairobi",       "lat":  -1.29, "lon":  36.82, "tz_name": "Africa/Nairobi"},
    {"label": "Mombasa",       "lat":  -4.05, "lon":  39.67, "tz_name": "Africa/Nairobi"},
    # South Africa
    {"label": "Johannesburg",  "lat": -26.20, "lon":  28.04, "tz_name": "Africa/Johannesburg"},
    {"label": "Durban",        "lat": -29.86, "lon":  31.02, "tz_name": "Africa/Johannesburg"},
    # Europe
    {"label": "London",        "lat":  51.51, "lon":  -0.13, "tz_name": "Europe/London"},
    {"label": "Birmingham",    "lat":  52.48, "lon":  -1.90, "tz_name": "Europe/London"},
    {"label": "Leicester",     "lat":  52.64, "lon":  -1.13, "tz_name": "Europe/London"},
    {"label": "Amsterdam",     "lat":  52.37, "lon":   4.90, "tz_name": "Europe/Amsterdam"},
    {"label": "Frankfurt",     "lat":  50.11, "lon":   8.68, "tz_name": "Europe/Berlin"},
    {"label": "Zurich",        "lat":  47.38, "lon":   8.54, "tz_name": "Europe/Zurich"},
    # North America
    {"label": "New York",      "lat":  40.71, "lon": -74.01, "tz_name": "America/New_York"},
    {"label": "Chicago",       "lat":  41.88, "lon": -87.63, "tz_name": "America/Chicago"},
    {"label": "Houston",       "lat":  29.76, "lon": -95.37, "tz_name": "America/Chicago"},
    {"label": "Dallas",        "lat":  32.78, "lon": -96.80, "tz_name": "America/Chicago"},
    {"label": "Los Angeles",   "lat":  34.05, "lon": -118.24, "tz_name": "America/Los_Angeles"},
    {"label": "San Francisco", "lat":  37.77, "lon": -122.42, "tz_name": "America/Los_Angeles"},
    {"label": "Seattle",       "lat":  47.61, "lon": -122.33, "tz_name": "America/Los_Angeles"},
    {"label": "Atlanta",       "lat":  33.75, "lon":  -84.39, "tz_name": "America/New_York"},
    {"label": "Toronto",       "lat":  43.65, "lon":  -79.38, "tz_name": "America/Toronto"},
    {"label": "Vancouver",     "lat":  49.25, "lon": -123.12, "tz_name": "America/Vancouver"},
    # Australia & New Zealand
    {"label": "Sydney",        "lat": -33.87, "lon":  151.21, "tz_name": "Australia/Sydney"},
    {"label": "Melbourne",     "lat": -37.81, "lon":  144.96, "tz_name": "Australia/Melbourne"},
    {"label": "Brisbane",      "lat": -27.47, "lon":  153.02, "tz_name": "Australia/Brisbane"},
    {"label": "Perth",         "lat": -31.95, "lon":  115.86, "tz_name": "Australia/Perth"},
    {"label": "Auckland",      "lat": -36.87, "lon":  174.77, "tz_name": "Pacific/Auckland"},
    # Southeast Asia
    {"label": "Singapore",     "lat":   1.35, "lon":  103.82, "tz_name": "Asia/Singapore"},
    {"label": "Kuala Lumpur",  "lat":   3.14, "lon":  101.69, "tz_name": "Asia/Kuala_Lumpur"},
]


def _db_path(year: int) -> Path:
    return DATA_DIR / f"ephem_{year}.db"


def _read_transitions(year: int) -> tuple[list[dict], list[dict]]:
    """Read nakshatra and tithi transitions from SQLite for the given year."""
    db_file = _db_path(year)
    if not db_file.exists():
        raise FileNotFoundError(
            f"No pre-computed DB for {year}. Run: uv run precompute.py --year {year}"
        )
    conn = sqlite3.connect(db_file)
    conn.row_factory = sqlite3.Row

    nk_rows = conn.execute(
        "SELECT utc_dt, nakshatra_id FROM nakshatra_transitions ORDER BY utc_dt"
    ).fetchall()
    tt_rows = conn.execute(
        "SELECT utc_dt, tithi_index FROM tithi_transitions ORDER BY utc_dt"
    ).fetchall()
    conn.close()

    nakshatra_transitions = [{"utc": r["utc_dt"], "nakshatra_id": r["nakshatra_id"]} for r in nk_rows]
    tithi_transitions     = [{"utc": r["utc_dt"], "tithi_index":  r["tithi_index"]}  for r in tt_rows]
    return nakshatra_transitions, tithi_transitions


def _compute_sunrise_nakshatras_for_city(year: int, lat: float, lon: float, tz_name: str) -> dict[str, int]:
    """
    For every calendar day in `year` (in local timezone), compute the nakshatra active at the
    START of that day (local midnight).

    Returns {"YYYY-MM-DD": nakshatra_id_1based, ...}

    The name "sunrise_nakshatras" is historical but misleading - we actually compute the nakshatra
    at the START of the local calendar day, not at sunrise time. This ensures the first timeline
    segment matches what's stored here.
    """
    result: dict[str, int] = {}

    tz = ZoneInfo(tz_name)

    # Iterate through calendar days in LOCAL timezone
    day_local = datetime(year, 1, 1)
    end_local = datetime(year + 1, 1, 1)

    while day_local < end_local:
        # Create a datetime at local midnight, then make it aware in the target timezone
        dt_local_aware = day_local.replace(tzinfo=tz)

        # Convert to UTC - this tells us what UTC time corresponds to local midnight
        dt_utc = dt_local_aware.astimezone(timezone.utc).replace(tzinfo=None)

        # Compute the nakshatra at the START of the local day (at UTC midnight equivalent)
        midnight_jd = utc_to_jd(dt_utc)
        nk_id = nakshatra_index(moon_longitude(midnight_jd)) + 1  # 1-based

        # Store result using LOCAL date string
        result[day_local.strftime("%Y-%m-%d")] = nk_id
        day_local += timedelta(days=1)

    return result


def export_year(year: int) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    log.info(f"[{year}] Reading transitions from SQLite ...")
    nk_transitions, tt_transitions = _read_transitions(year)
    log.info(f"[{year}]   {len(nk_transitions)} nakshatra transitions, {len(tt_transitions)} tithi transitions")

    # Write global transition files
    nk_path = OUT_DIR / f"nakshatra_transitions_{year}.json"
    tt_path = OUT_DIR / f"tithi_transitions_{year}.json"
    nk_path.write_text(json.dumps(nk_transitions, separators=(",", ":")))
    tt_path.write_text(json.dumps(tt_transitions, separators=(",", ":")))
    log.info(f"[{year}]   Written {nk_path.name} ({nk_path.stat().st_size // 1024} KB)")
    log.info(f"[{year}]   Written {tt_path.name} ({tt_path.stat().st_size // 1024} KB)")

    # Compute sunrise nakshatras for all cities
    log.info(f"[{year}] Computing sunrise nakshatras for {len(CITIES)} cities ...")
    t0 = time.perf_counter()
    sunrise_data: dict[str, dict[str, int]] = {}
    for i, city in enumerate(CITIES, 1):
        city_data = _compute_sunrise_nakshatras_for_city(year, city["lat"], city["lon"], city["tz_name"])
        sunrise_data[city["label"]] = city_data
        if i % 10 == 0 or i == len(CITIES):
            elapsed = time.perf_counter() - t0
            log.info(f"[{year}]   {i}/{len(CITIES)} cities done  ({elapsed:.1f}s)")

    sn_path = OUT_DIR / f"sunrise_nakshatras_{year}.json"
    sn_path.write_text(json.dumps(sunrise_data, separators=(",", ":")))
    total_elapsed = time.perf_counter() - t0
    log.info(f"[{year}]   Written {sn_path.name} ({sn_path.stat().st_size // 1024} KB)  [{total_elapsed:.1f}s]")

    # Size check
    total_kb = sum(
        p.stat().st_size for p in [nk_path, tt_path, sn_path]
    ) // 1024
    log.info(f"[{year}] Total uncompressed: {total_kb} KB  (budget: 500 KB)")
    if total_kb > 500:
        log.warning(f"[{year}] WARNING: output exceeds 500 KB budget — consider splitting by month")

    log.info(f"[{year}] Done.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Export ephemeris data as static JSON for GitHub Pages.")
    parser.add_argument("--year", type=int, action="append", required=True,
                        dest="years", metavar="YEAR",
                        help="Year to export (repeat for multiple years)")
    args = parser.parse_args()

    for year in sorted(set(args.years)):
        export_year(year)


if __name__ == "__main__":
    main()
