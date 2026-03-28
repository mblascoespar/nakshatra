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

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
DATA_DIR = ROOT_DIR / "data"
OUT_DIR  = ROOT_DIR / "frontend" / "public" / "data"

# Canonical city list — mirrors LocationSelector.jsx exactly.
# Key: city label (used as the JSON lookup key in the frontend).
CITIES = [
    # India
    {"label": "Mumbai",        "lat":  19.08, "lon":  72.88},
    {"label": "Delhi",         "lat":  28.67, "lon":  77.22},
    {"label": "Bangalore",     "lat":  12.97, "lon":  77.59},
    {"label": "Chennai",       "lat":  13.08, "lon":  80.27},
    {"label": "Hyderabad",     "lat":  17.38, "lon":  78.48},
    {"label": "Kolkata",       "lat":  22.57, "lon":  88.37},
    {"label": "Pune",          "lat":  18.52, "lon":  73.86},
    {"label": "Ahmedabad",     "lat":  23.03, "lon":  72.58},
    {"label": "Jaipur",        "lat":  26.92, "lon":  75.82},
    {"label": "Kochi",         "lat":   9.93, "lon":  76.27},
    {"label": "Varanasi",      "lat":  25.32, "lon":  82.97},
    {"label": "Nagpur",        "lat":  21.15, "lon":  79.09},
    # South Asia
    {"label": "Colombo",       "lat":   6.93, "lon":  79.85},
    {"label": "Kathmandu",     "lat":  27.71, "lon":  85.31},
    {"label": "Dhaka",         "lat":  23.72, "lon":  90.41},
    # Middle East
    {"label": "Dubai",         "lat":  25.20, "lon":  55.27},
    {"label": "Abu Dhabi",     "lat":  24.45, "lon":  54.37},
    {"label": "Muscat",        "lat":  23.59, "lon":  58.41},
    {"label": "Kuwait City",   "lat":  29.37, "lon":  47.98},
    # East Africa
    {"label": "Nairobi",       "lat":  -1.29, "lon":  36.82},
    {"label": "Mombasa",       "lat":  -4.05, "lon":  39.67},
    # South Africa
    {"label": "Johannesburg",  "lat": -26.20, "lon":  28.04},
    {"label": "Durban",        "lat": -29.86, "lon":  31.02},
    # Europe
    {"label": "London",        "lat":  51.51, "lon":  -0.13},
    {"label": "Birmingham",    "lat":  52.48, "lon":  -1.90},
    {"label": "Leicester",     "lat":  52.64, "lon":  -1.13},
    {"label": "Amsterdam",     "lat":  52.37, "lon":   4.90},
    {"label": "Frankfurt",     "lat":  50.11, "lon":   8.68},
    {"label": "Zurich",        "lat":  47.38, "lon":   8.54},
    # North America
    {"label": "New York",      "lat":  40.71, "lon": -74.01},
    {"label": "Chicago",       "lat":  41.88, "lon": -87.63},
    {"label": "Houston",       "lat":  29.76, "lon": -95.37},
    {"label": "Dallas",        "lat":  32.78, "lon": -96.80},
    {"label": "Los Angeles",   "lat":  34.05, "lon": -118.24},
    {"label": "San Francisco", "lat":  37.77, "lon": -122.42},
    {"label": "Seattle",       "lat":  47.61, "lon": -122.33},
    {"label": "Atlanta",       "lat":  33.75, "lon":  -84.39},
    {"label": "Toronto",       "lat":  43.65, "lon":  -79.38},
    {"label": "Vancouver",     "lat":  49.25, "lon": -123.12},
    # Australia & New Zealand
    {"label": "Sydney",        "lat": -33.87, "lon":  151.21},
    {"label": "Melbourne",     "lat": -37.81, "lon":  144.96},
    {"label": "Brisbane",      "lat": -27.47, "lon":  153.02},
    {"label": "Perth",         "lat": -31.95, "lon":  115.86},
    {"label": "Auckland",      "lat": -36.87, "lon":  174.77},
    # Southeast Asia
    {"label": "Singapore",     "lat":   1.35, "lon":  103.82},
    {"label": "Kuala Lumpur",  "lat":   3.14, "lon":  101.69},
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


def _compute_sunrise_nakshatras_for_city(year: int, lat: float, lon: float) -> dict[str, int]:
    """
    For every calendar day in `year`, compute the sunrise nakshatra at (lat, lon).
    Returns {"YYYY-MM-DD": nakshatra_id_1based, ...}
    """
    result: dict[str, int] = {}
    day = datetime(year, 1, 1, tzinfo=timezone.utc)
    end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    while day < end:
        midnight_jd = utc_to_jd(day)
        sunrise_jd  = compute_sunrise_jd(midnight_jd, lat, lon)
        nk_id       = nakshatra_index(moon_longitude(sunrise_jd)) + 1  # 1-based
        result[day.strftime("%Y-%m-%d")] = nk_id
        day += timedelta(days=1)
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
        city_data = _compute_sunrise_nakshatras_for_city(year, city["lat"], city["lon"])
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
