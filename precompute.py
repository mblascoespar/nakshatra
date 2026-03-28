"""
Pre-computation script. Run once per year before deploying.

Usage:
    uv run precompute.py --year 2026

This script:
  1. Walks the full year in 10-minute UTC steps via Swiss Ephemeris (Moshier).
  2. Detects and bisects every Nakshatra and Tithi transition to the second.
  3. Writes the results to data/ephem_{year}.db (SQLite).

After running this, run export_json.py --year <year> to produce the static JSON
files consumed by the frontend.

Runtime: ~10-12 seconds for a full year.
"""

import argparse
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from ephemeris import find_transitions

ROOT_DIR = Path(__file__).parent
DATA_DIR = ROOT_DIR / "data"


def db_path(year: int) -> Path:
    return DATA_DIR / f"ephem_{year}.db"


def _create_schema(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        DROP TABLE IF EXISTS nakshatra_transitions;
        DROP TABLE IF EXISTS tithi_transitions;

        CREATE TABLE nakshatra_transitions (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            utc_dt       TEXT NOT NULL,
            nakshatra_id INTEGER NOT NULL
        );

        CREATE TABLE tithi_transitions (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            utc_dt       TEXT NOT NULL,
            tithi_index  INTEGER NOT NULL
        );

        CREATE INDEX idx_nk_utc ON nakshatra_transitions(utc_dt);
        CREATE INDEX idx_tt_utc ON tithi_transitions(utc_dt);
    """)
    conn.commit()


def precompute(year: int) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    db_file = db_path(year)

    print(f"[1/3] Connecting to {db_file} ...")
    conn = sqlite3.connect(db_file)
    _create_schema(conn)

    start = datetime(year, 1, 1, tzinfo=timezone.utc)
    end   = datetime(year + 1, 1, 1, tzinfo=timezone.utc)

    print(f"[2/3] Scanning {year} for Nakshatra and Tithi transitions ...")
    print("      (This takes ~10-12 seconds — running Swiss Ephemeris Moshier)")

    nk_transitions, tt_transitions = find_transitions(start, end, step_minutes=10)

    print(f"      Found {len(nk_transitions)} Nakshatra transitions")
    print(f"      Found {len(tt_transitions)} Tithi transitions")

    conn.executemany(
        "INSERT INTO nakshatra_transitions (utc_dt, nakshatra_id) VALUES (?, ?)",
        [
            (dt.strftime("%Y-%m-%dT%H:%M:%SZ"), nk_idx + 1)  # store 1-based
            for dt, nk_idx in nk_transitions
        ],
    )
    conn.executemany(
        "INSERT INTO tithi_transitions (utc_dt, tithi_index) VALUES (?, ?)",
        [
            (dt.strftime("%Y-%m-%dT%H:%M:%SZ"), tt_idx)  # 0-based
            for dt, tt_idx in tt_transitions
        ],
    )
    conn.commit()

    size_kb = db_file.stat().st_size // 1024
    print(f"[3/3] Written to {db_file}  ({size_kb} KB)")
    print(f"\nDone. Run: uv run export_json.py --year {year}")
    conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pre-compute ephemeris transition data for a given year.")
    parser.add_argument("--year", type=int, required=True, help="Calendar year to compute")
    args = parser.parse_args()
    precompute(args.year)
