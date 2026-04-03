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

### 3. Day-Start-Based Day Classification

**Decision:** The Tarabalam tier for a day is determined by the Nakshatra active at the **start of the local calendar day** (local midnight), not at sunrise.

**Why:** Tarabalam is applied to the entire day, and the frontend Timeline Segments feature shows all nakshatra transitions throughout that day starting from midnight. To avoid spurious self-transitions (e.g., showing "Shravana → Shravana" at the start of a day), the stored nakshatra must match the nakshatra at the start of the local day, not at sunrise. 

**Implementation:** For each location and date, we compute the Nakshatra active at local midnight (converted to UTC) using the Moon's longitude at that moment. This is stored in `sunrise_nakshatras_{year}.json` and used for Tarabalam assignment. IANA timezone names with `zoneinfo` ensure correct DST handling across all regions.

**Prior approach:** Earlier versions computed the Nakshatra at sunrise time, which led to mismatches where the first timeline segment showed a different nakshatra than expected (e.g., Mumbai March 15 sunrise = nakshatra 22, but local day starts with nakshatra 21).

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
Frontend loads static JSON files:
  1. frontend/public/data/nakshatra_transitions_{year}.json
     (361 transitions per year in UTC)
  2. frontend/public/data/tithi_transitions_{year}.json
     (371 transitions per year in UTC)
  3. frontend/public/data/sunrise_nakshatras_{year}.json
     (nakshatra at local midnight for each date per location)
       │
       ▼
Frontend:
  1. For each location/date combination:
       a. Load pre-computed nakshatra from sunrise_nakshatras_{year}.json
       b. Compute Tara (tier, name, meaning) relative to birth nakshatra
       c. Filter transitions by local day window (using IANA timezone)
       d. Convert transition times to local time
       e. Build TimelineSegments for display
  2. Stores all data in Zustand
  3. Renders MonthGrid (color-coded day cells)
  4. On day click: renders DayDetailModal with TimelineSegments
  5. On PDF export: generates full-year PDF in browser (activities only for favorable tiers)
```

**Key Change:** All computation is now client-side. The backend (`precompute.py` and `export_json.py`) runs once per year to generate the JSON files, then publishes them as static assets. The frontend handles all rendering, day-window filtering, timezone conversion, and PDF generation.

---

## File Structure

```
nakshatra/
├── ephemeris.py                   # pyswisseph wrapper: sunrise, transitions, bisection
├── precompute.py                  # One-time script: generates ephem_YYYY.db from Swiss Ephemeris
├── export_json.py                 # One-time script: exports static JSON from ephem_YYYY.db
│
├── data/
│   └── ephem_YYYY.db             # Pre-computed transition data (one per year)
│                                  # Generated by precompute.py
│
├── frontend/
│   ├── public/data/
│   │   ├── nakshatra_transitions_YYYY.json    # All nakshatra transitions for the year (UTC)
│   │   ├── tithi_transitions_YYYY.json        # All tithi transitions for the year (UTC)
│   │   └── sunrise_nakshatras_YYYY.json       # Nakshatra at local day-start per location
│   │                                          # Generated by export_json.py
│   └── src/
│       ├── App.jsx
│       ├── store/useCalendarStore.js          # Zustand store (calendar data + UI state)
│       ├── data/
│       │   ├── calendar.js                    # buildYearCalendar: loads JSON, filters transitions
│       │   └── tarabalam.js                   # Nakshatra/Tara data, tara computation
│       ├── utils/
│       │   ├── timelineUtils.js               # buildTimelineSegments: intraday segment logic
│       │   └── generatePdf.js                 # Client-side PDF generation
│       └── components/
│           ├── NakshatraSelector.jsx
│           ├── LocationSelector.jsx
│           ├── YearCalendar.jsx
│           ├── MonthGrid.jsx
│           ├── DayCell.jsx                    # Shows nakshatra names only (not transition times)
│           ├── DayDetailModal.jsx             # Shows TimelineSegments
│           ├── TimelineSegments.jsx           # Container for intraday segments
│           ├── TimelineSegment.jsx            # Individual segment display
│           └── ActivitySearch/
│               └── (5 component files)
│
├── pyproject.toml
└── frontend/package.json
```

**Key Changes from v4:**
- No FastAPI backend in production (all static JSON files)
- JSON export moved to `export_json.py` (separate from backend)
- Frontend loads static JSON instead of making API calls
- New `timelineUtils.js` for segment-based day display
- Calendar grid cells show nakshatra names only (no transition times)
- PDF generation uses `tarabalam_tier` field and activities only for favorable tiers

---

## Known Issues & Limitations

**None currently tracked. The system is working as designed.**

---

## Frontend Features Implemented (v5)

### Timeline Segments

**Purpose:** Display nakshatra transitions throughout a day in an intuitive segment-based view.

**Components:**
- `TimelineSegments.jsx` — Main container
- `TimelineSegment.jsx` — Individual segment display with time range, nakshatra, tara tier, and activities
- `frontend/src/utils/timelineUtils.js` — `buildTimelineSegments()` logic

**Key Logic:**
```javascript
buildTimelineSegments(day, birthNakshatraId)
  1. If no transitions: return single segment for entire day (00:00-23:59)
  2. Else build segments:
     - Before first transition: sunrise_nakshatra from 00:00 to first transition time
     - Between transitions: for each pair, nakshatra N from t[i] to t[i+1]
     - After last transition: nakshatra M from last transition to 23:59
  3. For each segment: compute Tara tier and activities
```

**Display Rules:**
- Each segment shows: time range, nakshatra name, tara quality tier, and activities
- Activities displayed only for favorable tiers: `very_good` and `good`
- Poor/very_bad tiers show "⚠️ Avoid any activity" warning
- No redundant information (removed daily tara summary, removed auspicious activities list)

**Integration:**
- Replaces the old day detail layout (which showed redundant tara info and auspicious activities separately)
- Appears in `DayDetailModal` when user clicks a calendar day
- Modal scrolls vertically when many segments cause overflow

**Files:**
- `frontend/src/components/TimelineSegment.jsx`
- `frontend/src/components/TimelineSegments.jsx`
- `frontend/src/utils/timelineUtils.js`
- Integrated into `DayDetailModal.jsx`

---

### Activity Search Modal

**Purpose:** Enable users to search for auspicious days to perform a specific activity without clicking through the calendar.

**Components:**
- `ActivitySearchModal.jsx` — Main container with state management
- `ActivitySearchInput.jsx` — Search box with typeahead suggestions
- `CategoryFilter.jsx` — Category button filtering
- `DateRangePicker.jsx` — Date range selection
- `ResultsList.jsx` — Results display with Tara tier ranking
- `ActivitySearchButton.jsx` — Toolbar button to open modal

**Data Sources:**
- `frontend/src/data/activityIndex.js` — 60 normalized activities with displayText and categories
- Calendar data from Zustand store (already loaded at render time)
- `frontend/src/utils/activitySearchUtils.js` — Search logic

**Key Logic:**
```javascript
performActivitySearch(activity, calendarData, dateFrom, dateTo)
  1. Get nakshatras that have the activity
  2. Filter calendar days:
     - Keep only days in date range
     - Keep only days with nakshatras that have the activity
     ⭐ Keep ONLY days with Tara tier "very_good" or "good"
  3. Sort by: Tara tier (very_good first), then date (earliest first)
  4. Return results
```

**Integration:**
- ActivitySearchButton added to YearCalendar toolbar header
- Modal opens with button click
- Selecting a day in results:
  1. Closes modal
  2. Opens DayDetailModal with selected day
  3. User can see full activity context and nakshatra transitions

**Files:**
- `frontend/src/components/ActivitySearch/` (5 component files)
- `frontend/src/utils/activitySearchUtils.js` (search logic)
- `frontend/src/components/YearCalendar.jsx` (integrated)

**Performance:**
- All computation client-side (no API calls)
- Search completes in < 100ms (typical results: 8-15 days)
- No backend changes required

**User Experience:**
- **Path 1 (Direct Search):** Type activity name → typeahead suggests → click to search
- **Path 2 (Browse):** Click category button → typeahead filters by category → type/select activity → search
- Results show date, nakshatra, Tara info, and quality tier
- Click result → see full day detail with all transitions
