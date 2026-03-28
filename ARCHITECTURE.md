# Architecture

## Overview

The system is split into two independent processes: a Python backend that handles all astronomical computation and serves a JSON API, and a React frontend that handles all rendering, state, and PDF generation. There is no shared database between them beyond the pre-computed SQLite files that the backend reads.

```
┌─────────────────────────────────────────┐
│               Browser                   │
│                                         │
│  React + Zustand + Tailwind             │
│  ┌───────────────────────────────────┐  │
│  │  NakshatraSelector                │  │
│  │  LocationSelector / Timezone      │  │
│  │  YearCalendar → MonthGrid         │  │
│  │  DayCell → DayDetailModal         │  │
│  │  PDF Export (client-side)         │  │
│  └──────────────┬────────────────────┘  │
│                 │ HTTP GET              │
└─────────────────┼───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           FastAPI (uvicorn)             │
│                                         │
│  GET /api/nakshatras                    │
│  GET /api/calendar/year                 │
│  GET /api/years                         │
│                                         │
│  calendar_service.py                    │
│  ├── tarabalam.py  (pure domain logic)  │
│  ├── ephemeris.py  (pyswisseph wrapper) │
│  └── db.py         (SQLite reads)       │
│                                         │
│  data/ephem_YYYY.db  (pre-computed)     │
└─────────────────────────────────────────┘
```

---

## Key Design Decisions

### 1. Pre-computation of Nakshatra and Tithi Transitions

**Decision:** Nakshatra and Tithi transition times for a full year are computed once at startup by `precompute.py` and stored in a SQLite file (`data/ephem_YYYY.db`). At request time, the backend reads from this file — it does not re-run Swiss Ephemeris for transitions.

**Why:** Walking a full year in 10-minute steps and bisecting each transition takes ~10–12 seconds and hits the CPU hard. Running this at API request time would make the first calendar load of a year intolerably slow. Pre-computing once and storing the results decouples the heavy ephemeris work from the user-facing request path.

**Why SQLite per year:** One file per year keeps the data model simple. The file can be checked into a deployment artifact or regenerated in under 15 seconds. No migration tooling needed. SQLite is fast enough for the read volume (one query per year per request).

**What is NOT pre-computed:** Sunrise time and the Nakshatra active at sunrise are computed live at request time per the user's latitude/longitude. This is the piece that is personalized per location — it cannot be pre-computed because there are infinitely many possible locations. The ~365 ephemeris calls needed for a full year of sunrises take ~150–300ms, which is acceptable for a one-time-per-session load.

---

### 2. Swiss Ephemeris, Moshier Mode

**Decision:** All astronomical calculations use pyswisseph in Moshier mode (`FLG_MOSEPH`).

**Why:** Moshier is built directly into the pyswisseph binary — no external data files to ship or download. Accuracy is ~1 arcsecond for the Moon, which is far more than sufficient: determining which Nakshatra (each spanning 13.33°) the Moon occupies only requires ~0.5° (~1800 arcsecond) precision. There is no paid data provider dependency.

**No external astronomical API:** The spec explicitly requires internal calculation. Relying on an external API would introduce latency, rate limits, cost, and a failure mode outside our control.

---

### 3. Sunrise-Based Day Classification

**Decision:** The Tarabalam tier for a day is determined by the Nakshatra the Moon occupies at the moment of sunrise at the client's location — not at UTC midnight or local midnight.

**Why:** This is the correct Vedic method (Chandra Tara). The Nakshatra at sunrise is the one that "rules" the day in Jyotish convention. Using midnight would produce incorrect results for days where the Moon transitions between midnight and sunrise.

**Implementation:** `compute_sunrise_jd` calls `swe.rise_trans` for each day. The Nakshatra at that JD is then used for Tarabalam assignment. This is computed fresh each time, which is correct — sunrise depends on latitude/longitude, so it cannot be shared across users.

---

### 4. The 5-Tier Color System

**Decision:** Nine Taras map to five tiers, not three.

**Why:** The original Excel workflow used five distinct colors. The early backend implementation collapsed this to three buckets (favorable/neutral/unfavorable), which loses the critical distinction between Naidhana (Tara 7, "Very bad", red) and Vipat/Pratyak (Tara 3 and 5, "Poor", pink). Naidhana represents a qualitatively worse outcome and practitioners treat it categorically differently — they would never recommend a Naidhana day for any significant activity regardless of other factors. Collapsing it with Vipat/Pratyak erases that signal.

**Tier mapping:**
```
very_good  →  bright green  →  Sampat (2), Sadhana (6), Parama Mitra (9)
good       →  dull green    →  Kshema (4), Mitra (8)
mixed      →  yellow        →  Janma (1)
poor       →  pink          →  Vipat (3), Pratyak (5)
very_bad   →  red           →  Naidhana (7)
```

---

### 5. Day-Start Nakshatra vs. Sunrise Nakshatra

**Decision:** `DayData` exposes two distinct Nakshatra references: `day_start_nakshatra_id` (Nakshatra active at local midnight) and `sunrise_nakshatra_id` (Nakshatra at sunrise, which drives Tarabalam).

**Why:** Tarabalam uses sunrise. But the PDF "Timings" section shows complete Nakshatra spans that cross midnight boundaries — e.g., "Pushya — Jan 31 04:04 PM – Feb 01 02:27 PM". To reconstruct this continuous timeline, the frontend needs to know what Nakshatra was active at the start of each day (midnight), not just at sunrise. Without `day_start_nakshatra_id`, days where a transition occurs between midnight and sunrise would have a gap in the displayed timeline.

---

### 6. Activity Guidance as Full Text, Per Nakshatra

**Decision:** Activity guidance is stored as full multi-line text per Nakshatra (not a short summary), derived from the practitioner reference document. It is type-based (all Nakshatras of the same type share the same text) but stored per Nakshatra entry for directness.

**Why:** The PDF output matches the reference document verbatim — practitioners recognize the exact phrasing. A summarized version would feel wrong to practitioners who already know the reference text. The text is static and small enough to embed directly in `tarabalam.py` with no performance concern.

---

### 7. Client-Side PDF Export

**Decision:** PDF generation happens entirely in the browser using a client-side library. There is no server-side PDF rendering endpoint.

**Why:** The spec requires it. Practically: it eliminates a server-side rendering pipeline (headless Chrome, wkhtmltopdf, or similar), removes the need for a file storage layer, and means the practitioner can generate and download PDFs without any server involvement after the initial data load. The tradeoff is that the PDF library runs in the browser and must be bundled — acceptable given the audience (practitioners on desktop browsers).

**PDF format reference:** The target output matches the practitioner's existing Excel-based calendar: landscape weekly grid with colored Nakshatra cells per person, full activity text per day column, intra-day Nakshatra timings with start/end times spanning midnight, and Full/New Moon labels.

---

### 8. No Authentication in MVP

**Decision:** The tool is publicly accessible. No login, no API keys, no rate limiting.

**Why:** The PRD explicitly calls this out. The tool is practitioner-facing with low abuse risk at MVP scale. Adding auth would block the workflow rather than protect a meaningful asset. This is re-evaluated post-MVP.

---

### 9. Frontend State Management with Zustand

**Decision:** Global UI state (selected Nakshatra, location, year, calendar data) is managed with Zustand rather than React Context or a heavier solution.

**Why:** The state shape is simple and flat. Zustand gives a clean store without boilerplate. The calendar data from the API is loaded once per (Nakshatra, location, year) combination and cached in the store for the session — no re-fetching on navigation between months.

---

### 10. No Backend for the Current Session

**Decision:** Once the initial API call loads the year calendar, the frontend operates entirely off the data in the Zustand store. There are no incremental API calls for month switching, day detail views, or PDF generation.

**Why:** The API returns a full year of data in one response. Month switching and day detail are purely client-side operations on the already-loaded data. This makes the UI feel instant after the initial load and eliminates any network dependency for the PDF generation step.

---

## Data Flow

```
User selects: Nakshatra + Location + Year
       │
       ▼
Frontend → GET /api/calendar/year?nakshatra=17&lat=...&lon=...&tz=...&year=2026
       │
       ▼
Backend:
  1. Validate year has pre-computed data (db file exists)
  2. Load all Nakshatra transitions for the year from SQLite
  3. Load all Tithi transitions for the year from SQLite
  4. For each of 365 days:
       a. Compute sunrise JD at (lat, lon)           ← live ephemeris
       b. Compute Nakshatra at sunrise                ← Tarabalam classification
       c. Compute Nakshatra at local midnight         ← for PDF timings
       d. Compute Tithi at sunrise                    ← for paksha / moon phase
       e. Derive Tara (tier, name, meaning)
       f. Derive activity guidance (from Nakshatra type)
       g. Slice Nakshatra and Tithi transitions for that day's window
  5. Return YearCalendarResponse (12 months × N days)
       │
       ▼
Frontend:
  - Stores response in Zustand
  - Renders MonthGrid (color-coded day cells)
  - On day click: renders DayDetailModal from store data
  - On PDF export: generates full-year PDF in browser from store data
```

---

## File Structure

```
nakshatra/
├── backend/
│   ├── main.py                    # FastAPI app, CORS config
│   ├── models.py                  # Pydantic response models
│   ├── config.py                  # Paths, reference coords
│   ├── db.py                      # SQLite read helpers
│   ├── routers/
│   │   └── calendar.py            # API route handlers
│   └── services/
│       ├── tarabalam.py           # Domain logic: Tara calc, Nakshatra data, activity text
│       ├── ephemeris.py           # pyswisseph wrapper: sunrise, transitions, bisection
│       └── calendar_service.py    # Assembles DayData from DB + live ephemeris
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── api/client.js          # Axios wrapper for backend calls
│       ├── store/useCalendarStore.js  # Zustand store
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
│   └── ephem_YYYY.db             # Pre-computed transition data (one per year)
│
├── precompute.py                  # One-time script: generates ephem_YYYY.db
├── pyproject.toml
└── frontend/package.json
```

---

## Pending Backend Changes (v4)

The following changes are required to align the backend with the v4 PRD. They are not yet implemented.

### `backend/services/tarabalam.py`
- Fix Tara names: Tara 5 `"Pratyari"` → `"Pratyak"`, Tara 6 `"Sadhaka"` → `"Sadhana"`, Tara 7 `"Vadha"` → `"Naidhana"`
- Change all `bucket` values to 5-tier `tier` values (Naidhana = `very_bad`, isolated from Vipat/Pratyak = `poor`)
- Add `nakshatra_type` field to each of the 27 NAKSHATRA entries
- Add `favourable_for` full activity text per Nakshatra entry (from practitioner reference document)

### `backend/models.py`
- `TaraDetail.bucket` → `tier` with literal type `"very_good" | "good" | "mixed" | "poor" | "very_bad"`
- `DayData.tarabalam_bucket` → `tarabalam_tier`
- New fields on `DayData`: `day_start_nakshatra_id`, `day_start_nakshatra_name`, `sunrise_nakshatra_name`, `activity_guidance`, `moon_phase`, `paksha`
- New field on `NakshatraMeta`: `nakshatra_type`

### `backend/services/calendar_service.py`
- Extend `_compute_sunrise_nakshatras` to also return `day_start_nk_id` (Nakshatra at local midnight) and `sunrise_tithi_index` (for paksha/moon phase)
- Populate all new `DayData` fields
- Rename `tarabalam_bucket` → `tarabalam_tier` throughout
