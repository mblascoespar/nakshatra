# Requirements Summary & Implementation Order

## Overview

You have 5 distinct but interconnected design requirements for the Tarabalam Calendar app. This document helps you understand the dependencies and suggested implementation order.

## The 5 Requirements

| # | Design Doc | Title | Scope | Dependencies |
|---|---|---|---|---|
| 1 | DESIGN_01_TIMELINE_SEGMENTS.md | Timeline Segments Refactor | UI/UX | Corrected Activities (5) |
| 2 | DESIGN_02_RED_LIGHT_RULE.md | Red-Light Rule (Tara 7) | Presentation | Timeline Segments (1) |
| 3 | DESIGN_03_ACTIVITY_SEARCH.md | Activity Search | New Feature | Corrected Activities (5) |
| 4 | DESIGN_04_SEARCHABLE_LOCATIONS.md | Searchable Locations | New Feature | None (independent) |
| 5 | DESIGN_05_CORRECTED_ACTIVITIES_DATA.md | Corrected Activities Data | Data Migration | None (independent) |

## Dependency Graph

```
[5] Corrected Activities
    ├──→ [1] Timeline Segments
    │    └──→ [2] Red-Light Rule
    │
    └──→ [3] Activity Search

[4] Searchable Locations (independent)
```

## What Each Requirement Does

### 1. Timeline Segments Refactor (DESIGN_01)
**What:** Transform the day popup from a flat activity list into a vertical timeline showing how the day unfolds from sunrise to next sunrise.

**Why:** Users can't understand how their day changes over time. Each segment shows when a Nakshatra is active, the Tara for that period, and only activities suitable for that time window.

**Before:**
```
Day: Rohini (Tara 4 - Good)
Activities: Marriage, buying home, building, careers, relationships...
```

**After:**
```
07:58 – 12:35 | Sadhana (6) | Rohini | [Very Good]
Best for: Laying foundations, Building, Marriage

12:35 – 18:22 | Janma (1) | Mrigashirsha | [Mixed]
(No activities shown)

18:22 – 23:59 | Naidhana (7) | Ardra | [Very Bad]
⚠️ Avoid initiating activities
```

---

### 2. Red-Light Rule (DESIGN_02)
**What:** Enforce a visual warning for Tara 7 (Naidhana) segments—never suggest activities during these periods.

**Why:** Tara 7 is "Very Bad" and represents danger. Users should know: "Do not initiate anything during these times."

**Implementation:** Dependent on Timeline Segments. Once segments render, Tara 7 segments show a red background + warning text instead of activities.

---

### 3. Activity Search (DESIGN_03)
**What:** New feature allowing users to search for auspicious days for a specific activity (e.g., "When is the next good day to start a business?").

**Why:** Current workflow is reactive—click each day to check activities. Search makes it proactive: "Find all days in April good for marriage."

**Results:** Ranked by Tara quality (Very Good first), sorted by date. Only shows favorable days (Tara 2, 4, 6, 8, 9).

---

### 4. Searchable Locations (DESIGN_04)
**What:** Replace the fixed location dropdown with a city search interface. Type "Mumbai" and get lat/lon/timezone automatically.

**Why:** Practitioners work with clients in different cities. A dropdown of 10 cities isn't enough.

**Data:** Embed ~1,000 common cities or integrate with a geocoding API.

---

### 5. Corrected Activities Data (DESIGN_05)
**What:** Data migration. Replace the hallucinated activities in `tarabalam.js` with the authoritative 27-nakshatra activity list you provided.

**Why:** The current app shows wrong activities (e.g., Bharani shows "Express creativity" when it should show "Evil schemes & deeds"). This is a blocker for timeline segments and activity search to work correctly.

---

## Suggested Implementation Order

### Phase 1: Foundation (Data Integrity)
**Do first:**
1. **[5] Corrected Activities Data** — migrate to authoritative list
   - Time: ~1–2 hours
   - Unblocks: Timeline Segments, Activity Search
   - Risk: Low (data change, minimal code logic change)

### Phase 2: Core UI Refactor (Time-Based Presentation)
**Do after Phase 1:**
2. **[1] Timeline Segments Refactor** — redesign the day popup
   - Time: ~3–4 hours (component + styling + testing)
   - Unblocks: Red-Light Rule
   - Risk: Medium (significant UI change)

3. **[2] Red-Light Rule** — add Tara 7 warning
   - Time: ~30 minutes
   - Depends on: Timeline Segments
   - Risk: Low (presentation-layer only)

### Phase 3: New Capabilities
**Do in parallel or after Phase 2:**
4. **[4] Searchable Locations** — city search + geocoding
   - Time: ~2–3 hours (if using embedded cities) or ~4–5 hours (if API integration)
   - Dependencies: None
   - Risk: Medium (adds external data source)

5. **[3] Activity Search** — find auspicious days for activity
   - Time: ~3–4 hours
   - Depends on: Corrected Activities Data, ideally Timeline Segments design settled
   - Risk: Medium (new filtering/ranking logic)

---

## Total Effort Estimate

| Phase | Requirements | Estimated Time | Risk |
|---|---|---|---|
| Phase 1 | [5] | 1–2 hours | Low |
| Phase 2 | [1], [2] | 3.5–4.5 hours | Medium |
| Phase 3 | [3], [4] | 5–7 hours | Medium |
| **Total** | **All 5** | **9.5–13.5 hours** | Medium |

*(Estimates assume one developer, no blocking unknowns)*

---

## Key Decisions & Trade-offs

### Timeline Segments
- **Decision:** Don't merge adjacent segments with same Nakshatra
- **Why:** Preserves time transparency, helps users understand when transitions occur
- **Tradeoff:** More segments on screen (but scannable with color)

### Red-Light Rule
- **Decision:** Show warning text only, no explanation of consequences
- **Why:** Users already know Tara 7 is bad; a terse warning is more actionable
- **Tradeoff:** Less educational, but more decisive

### Activity Search
- **Decision:** Only show favorable Tara days (2, 4, 6, 8, 9)
- **Why:** Users search for "good days"; unfavorable days aren't useful for planning
- **Tradeoff:** Users can't discover when an activity is unfavorable (but they can see it in day detail)

### Searchable Locations
- **Decision:** Embed common cities + optional manual lat/lon entry
- **Why:** Fast typeahead for 80% of users, fallback for rare locations
- **Tradeoff:** Need to maintain a city dataset (~100KB)

### Corrected Activities
- **Decision:** Accept all activities including "dark" ones (evil schemes, arson, tantric)
- **Why:** These are authentic nakshatra activities; practitioners know their context
- **Tradeoff:** App is neutral/judgment-free, which may be confusing for new users

---

## Testing Strategy

### Phase 1 (Activities Data)
- Verify all 27 nakshatras have activities
- Check PDF export shows corrected activities
- No UI tests needed

### Phase 2 (Timeline Segments + Red-Light)
- Render timeline for various day types (multi-segment, single-segment, Tara 7)
- Verify segment times are correct and non-overlapping
- Verify Tara 7 shows warning, no activities
- Verify other Taras show activity hints

### Phase 3 (Activity Search + Locations)
- Search for common activities, verify results
- Verify results are sorted by Tara tier
- Select a city, verify calendar re-fetches with new coordinates
- Verify manual lat/lon entry works

---

## Open Questions (Before Starting)

Before you implement, clarify:

1. **Timeline Segments:** Should segment times be exact ISO timestamps or human-readable (e.g., "7:58 AM – 12:35 PM")? Recommend: human-readable with timezone offset.

2. **Activity Hints:** When showing 2–3 activities in a segment, should they be the first N from the list, or the "most relevant" by some heuristic? Recommend: first 2–3.

3. **Location Search:** Use embedded cities (~100KB) or query a geocoding API (adds latency)? Recommend: embedded for MVP.

4. **Activity Search UI:** Separate modal, sidebar, or integrated into main calendar view? Recommend: separate sidebar or modal.

5. **Export Format:** Should activity search results be exportable (e.g., as .ics calendar file)? Recommend: low priority, defer.

---

## Files to Create/Modify

### Phase 1
- **Modify:** `frontend/src/data/tarabalam.js` (activities + constellation_type)
- **No new files**

### Phase 2
- **Modify:** `frontend/src/components/DayDetailModal.jsx` (refactor to use new timeline component)
- **Create:** `frontend/src/components/TimelineSegments.jsx` (new)
- **Create:** `frontend/src/components/TimelineSegment.jsx` (new)

### Phase 3
- **Modify:** `frontend/src/components/LocationSelector.jsx` (refactor dropdown to search)
- **Create:** `frontend/src/components/ActivitySearch.jsx` (new)
- **Create:** `frontend/public/data/cities.json` (if embedded cities)

---

## Rollout Strategy

1. **Phase 1:** Land corrected activities in isolation (safe, low-risk)
2. **Phase 2:** Land timeline refactor (breaks existing day modal, but improves UX)
3. **Phase 3:** Land new features (independent improvements)

Each phase should be its own PR/commit so changes are reviewable and reversible.

---

## Success Criteria

After all 5 requirements are implemented:

✅ Day popup shows time-based timeline (not flat list)  
✅ Tara 7 days show clear warning, no activity suggestions  
✅ Users can search for auspicious days by activity  
✅ Users can find their location by city name  
✅ All 27 nakshatras have correct, authoritative activities  
✅ No "hallucinated" data in the app  
✅ PDF exports include corrected activities  
✅ Mobile responsiveness maintained
