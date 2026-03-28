# Nakshatra Tarabalam Calendar

A web application for Vedic astrology practitioners to generate personalized Tarabalam calendars for clients. The practitioner enters a client's birth Nakshatra and location; the app produces a year-long calendar showing which days are favorable, neutral, or unfavorable — color-coded by Tarabalam tier — along with optimal activities, exact Nakshatra transition timings, and moon phase markers. The calendar exports to a polished PDF ready to share with the client.

---

## Requirements

**Backend**
- Python 3.11+
- [uv](https://docs.astral.sh/uv/) (package manager)

**Frontend**
- Node.js 18+
- npm

---

## Setup

### 1. Install backend dependencies

```bash
uv sync
```

### 2. Pre-compute ephemeris data

The backend requires a pre-computed SQLite file for each year you want to serve. This takes ~10–12 seconds per year and only needs to run once.

```bash
uv run precompute.py --year 2026
```

This writes `data/ephem_2026.db`. Repeat for any additional years.

### 3. Start the backend

```bash
uv run uvicorn backend.main:app --reload
```

The API will be available at `http://localhost:8000`. OpenAPI docs at `http://localhost:8000/docs`.

### 4. Install frontend dependencies

```bash
cd frontend
npm install
```

> **WSL users:** If `node_modules` already exists (e.g. installed on Windows), remove it first — the native Rollup binary differs between platforms:
> ```bash
> rm -rf node_modules package-lock.json && npm install
> ```

### 5. Start the frontend

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Adding a New Year

Run `precompute.py` for the year you need:

```bash
uv run precompute.py --year 2027
```

The backend will automatically detect the new file and expose it via `GET /api/years`.

---

## API Reference

All endpoints are read-only (`GET`).

### `GET /api/nakshatras`
Returns the list of all 27 Nakshatras with metadata (id, name, ruler, deity, type, qualities, activity guidance).

### `GET /api/calendar/year`
Returns a full year calendar for a given birth Nakshatra and location.

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `nakshatra` | int (1–27) | Yes | Birth Nakshatra ID |
| `year` | int | Yes | Calendar year (must have pre-computed data) |
| `lat` | float | Yes | Client latitude (degrees North) |
| `lon` | float | Yes | Client longitude (degrees East, positive) |
| `tz` | string | Yes | IANA timezone string (e.g., `"America/New_York"`) |

**Response:** `YearCalendarResponse` — 12 months of `DayData`, each containing:
- `date`, `day_of_week`
- `tarabalam_tier` — `"very_good" | "good" | "mixed" | "poor" | "very_bad"`
- `tara` — Tara number, name, tier, meaning
- `sunrise_nakshatra_id`, `sunrise_nakshatra_name`
- `day_start_nakshatra_id`, `day_start_nakshatra_name` — for reconstructing midnight-spanning timelines
- `activity_guidance` — full activity text for the day's Nakshatra type
- `moon_phase` — `"full_moon" | "new_moon" | null`
- `paksha` — `"Shukla" | "Krishna"`
- `nakshatra_transitions` — list of `{time, nakshatra_id, nakshatra_name}` (local time)
- `tithi_transitions` — list of `{time, tithi_number, tithi_name, paksha}`

### `GET /api/years`
Returns the list of years that have pre-computed data available.

### `GET /health`
Returns `{"status": "ok"}`.

---

## Project Structure

```
nakshatra/
├── backend/
│   ├── main.py                    # FastAPI app and CORS config
│   ├── models.py                  # Pydantic response models
│   ├── config.py                  # Data directory path config
│   ├── db.py                      # SQLite read helpers
│   ├── routers/
│   │   └── calendar.py            # Route handlers
│   └── services/
│       ├── tarabalam.py           # Domain logic: Taras, Nakshatras, activity text
│       ├── ephemeris.py           # Swiss Ephemeris wrapper (sunrise, transitions)
│       └── calendar_service.py    # Assembles year calendar from DB + live ephemeris
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── api/client.js
│       ├── store/useCalendarStore.js
│       ├── utils/timezone.js
│       └── components/
│           ├── NakshatraSelector.jsx
│           ├── LocationSelector.jsx
│           ├── TimezoneSelector.jsx
│           ├── YearCalendar.jsx
│           ├── MonthGrid.jsx
│           ├── DayCell.jsx
│           └── DayDetailModal.jsx
│
├── data/
│   └── ephem_YYYY.db              # Pre-computed Nakshatra/Tithi transitions
│
├── precompute.py                   # Year pre-computation script
├── pyproject.toml
├── prd.md                          # Product requirements
├── ARCHITECTURE.md                 # Design decisions
└── README.md
```

---

## How It Works

### Astronomical Calculation

All calculations use [Swiss Ephemeris](https://www.astro.com/swisseph/) via [pyswisseph](https://github.com/astrorigin/pyswisseph) in Moshier mode — no data files or external API required.

**Pre-computed (once per year):** Every Nakshatra and Tithi transition for the year is found by walking the year in 10-minute steps and bisecting each crossing to second precision. Results are stored in `data/ephem_YYYY.db`.

**Live per request:** Sunrise time at the client's location is computed for each day using `swe.rise_trans`. The Nakshatra at sunrise determines the day's Tarabalam tier. The Nakshatra at local midnight is also computed to support the full timeline display in the PDF.

### Tarabalam Calculation

The birth Nakshatra is counted forward to the day's sunrise Nakshatra. The count mod 9 gives a Tara number (1–9), which maps to a quality tier:

| Tier | Tara(s) | Color |
|---|---|---|
| Very good | Sampat (2), Sadhana (6), Parama Mitra (9) | Bright green |
| Good | Kshema (4), Mitra (8) | Dull green |
| Mixed | Janma (1) | Yellow |
| Poor | Vipat (3), Pratyak (5) | Pink |
| Very bad | Naidhana (7) | Red |

### PDF Export

PDF generation runs entirely in the browser — no server involvement after the initial data load. The PDF matches the practitioner reference format: landscape weekly grid with colored Nakshatra cells, full activity text, intra-day transition timings (including midnight-spanning spans), and Full/New Moon markers.

---

## Reference Documents

The following practitioner documents informed the design and are included in the repository root:

- `1 Tarabalam_App_Spec.pdf` — Original developer brief
- `Nakshatra Optimal Uses.pdf` — Full activity guidance per Nakshatra (source of `favourable_for` text)
- `Tarabalam Month Example.pdf` — Reference PDF output format (month view)
- `Tarabalam Calendar 1yr Fam. Example.pdf` — Reference PDF output format (full year, two-person)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend language | Python 3.12 |
| Backend framework | FastAPI + uvicorn |
| Ephemeris | pyswisseph (Swiss Ephemeris, Moshier mode) |
| Data storage | SQLite (pre-computed, one file per year) |
| Package manager (Python) | uv |
| Frontend framework | React 18 |
| Build tool | Vite |
| Styling | Tailwind CSS |
| State management | Zustand |
| HTTP client | Axios |
| PDF generation | Client-side browser library (TBD) |
