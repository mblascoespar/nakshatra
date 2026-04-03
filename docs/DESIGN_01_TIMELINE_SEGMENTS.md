# Design Doc 1: Timeline Segments Refactor

## Objective
Transform the day popup from a flat list of activities into a vertically stacked timeline showing how the day unfolds from sunrise to next sunrise.

## Current State
- Single "Day's Nakshatra" displayed at top
- One "Tara Rating" badge
- Long list of activities below
- All activity guidance bunched together regardless of time

## Proposed State
A clean vertical timeline where each segment represents a continuous time period under one Nakshatra.

### UI Structure

```
┌─────────────────────────────────────┐
│ Header                              │
│ Date, Location, Timezone            │
│ Overall Day Quality Label (small)   │
└─────────────────────────────────────┘

┌─ Segment 1 ─────────────────────────┐
│ 07:58 – 12:35                       │ ← Time range (prominent)
│ Sadhana (6)                         │ ← Tara + number
│ Rohini                              │ ← Nakshatra name
│ [Very Good badge]                   │ ← Quality label (right side)
│ ───────────────────────────────────  │
│ Best for: Laying foundations,       │ ← Activity hints
│ Building, Marriage                  │
└─────────────────────────────────────┘

┌─ Segment 2 ─────────────────────────┐
│ 12:35 – 18:22                       │
│ Janma (1)                           │
│ Mrigashirsha                        │
│ [Mixed badge]                       │
│ ───────────────────────────────────  │
│ (No activities shown)                │
└─────────────────────────────────────┘

┌─ Segment 3 ─────────────────────────┐
│ 18:22 – 23:59                       │
│ Naidhana (7)                        │
│ Ardra                               │
│ [Very Bad badge]                    │
│ ───────────────────────────────────  │
│ ⚠ Avoid initiating activities       │
└─────────────────────────────────────┘
```

## Color Mapping

| Tara Numbers | Tier | Background Color | Hex Code |
|---|---|---|---|
| 2, 6, 9 | Very Good | Bright green | #4ade80 |
| 4, 8 | Good | Dull green | #a5d6a7 |
| 1 | Mixed/Janma | Yellow | #fff9c4 |
| 3, 5 | Poor (Vipat, Pratyak) | Pink | #ffc0de |
| 7 | Very Bad (Naidhana) | Red | #e57373 |

## Segment Computation

For a given date and location:

1. Get local sunrise time (start of day)
2. Get next sunrise time (end of day)
3. Query all Nakshatra transitions within this time range
4. Build segments:
   ```
   segments = [
     {start_time, end_time, nakshatra_id, nakshatra_name},
     {start_time, end_time, nakshatra_id, nakshatra_name},
     ...
   ]
   ```
5. For each segment:
   - Compute Tara: `((nakshatra_id - birth_nakshatra_id + 27) % 27) % 9 + 1`
   - Get Tara name, tier, color
   - Determine activity hints (rules below)

## Activity Display Rules

**Show activity hints ONLY for:**
- Tara 2, 4, 6, 8, 9 (favorable)

**Do not show for:**
- Tara 1 (Janma) — mixed, no guidance
- Tara 3, 5 (Vipat, Pratyak) — poor, no positive guidance
- Tara 7 (Naidhana) — very bad, show warning

**When showing activities:**
- Show max 2–3 key activities from the nakshatra's list
- For Tara 2, 4: label as "Good for:"
- For Tara 6, 8, 9: label as "Best for:"

**When Tara 7 (Naidhana):**
- Show: "⚠ Avoid initiating activities"
- Do NOT list avoided activities or what could go wrong

## Component Architecture

```
DayDetailModal
├── Header (date, location, tz, overall quality)
├── TimelineSegments (new)
│   ├── Segment (renders one time block)
│   │   ├── TimeRange
│   │   ├── TaraInfo (number + name)
│   │   ├── NakshatraName
│   │   ├── QualityBadge (right side)
│   │   └── ActivityHints (conditional)
```

## Design Constraints

- Do NOT merge adjacent segments with same Nakshatra
- Do NOT hide short segments (even 5-minute segments must show)
- Do NOT show large text blocks
- Time and color are primary signals
- Prioritize scanning speed

## Implementation Notes

- Existing data (day.nakshatra_transitions) already provides segment boundaries
- Tara computation already exists in tarabalam.js
- Activities data needs correction (separate requirement)
- Sunrise/sunset times already available from backend

## Definition of Done

✓ User clicks a day and sees stacked time segments from sunrise to next sunrise  
✓ Each segment clearly shows time, Tara, Nakshatra, and color  
✓ Activities shown only for Taras 2, 4, 6, 8, 9  
✓ Tara 7 shows warning, no activity list  
✓ Taras 1, 3, 5 show no guidance  
✓ Minimal text, maximum visual clarity
