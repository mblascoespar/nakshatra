# Design Doc 3: Activity Search — Approaches & Trade-offs

**Status:** Exploration phase - comparing implementation strategies  
**Based on:** 60 normalized activities with displayText + categories

---

## The Problem

Users want: *"Show me auspicious days for [specific activity]"*

Currently they must: Click each day individually to see activities.

We have:
- 60 searchable activities (normalized names)
- 60 display texts (human-friendly descriptions)
- 11 categories (grouping for discovery)
- Reverse mapping: activity → which nakshatras have it
- Full year calendar already loaded client-side

---

## Approach 1: Simple Typeahead + Results

**How it works:**
1. User types "marriage" → typeahead suggests matching activities
2. User selects "Marriage & matrimonial unions"
3. Frontend filters calendar: show only days with nakshatras that have this activity
4. Results ranked by Tara tier (Very Good → Good → Mixed)

**UI:**
```
┌──────────────────────────────┐
│ Search activity:             │
│ [marriage___________________]│ ← typeahead dropdown
│                              │
│ Date range:                  │
│ [From] Apr 1, 2026           │
│ [To]   Apr 30, 2026          │
│                              │
│ [Search]                     │
└──────────────────────────────┘

Results:
✓ Apr 5 (Thursday) — Very Good
  Rohini, Tara 6
  
✓ Apr 7 (Saturday) — Very Good
  Pushya, Tara 9
```

**Pros:**
- Simple, intuitive
- Fast (all computation client-side)
- Low learning curve
- Works with existing calendar load

**Cons:**
- Fuzzy search might not find what user is looking for ("starting business" vs "starting industries")
- No category discovery — users must know what to search
- Single activity only (can't combine searches)
- Typos might fail

**Implementation Effort:** Low (1-2 days)

**Code Example:**
```javascript
// User searches "marriage"
const activity = searchActivities("marriage")[0] // Get first match
const nakshatras = getNakshatrasForActivity(activity.id) // [5, 12, 13, 15, 17, 21, 26, 27]

// Filter calendar days
const results = calendarData.months
  .flatMap(m => m.days)
  .filter(day => {
    if (new Date(day.date) < dateFrom || new Date(day.date) > dateTo) return false
    return nakshatras.includes(day.sunrise_nakshatra_id)
  })
  .sort((a, b) => TARA_TIER_ORDER[a.tarabalam_tier] - TARA_TIER_ORDER[b.tarabalam_tier])
```

---

## Approach 2: Category-First Discovery

**How it works:**
1. User sees category list: "Business & Commerce", "Creative Arts", "Life Events", etc.
2. User selects category → sees all activities in that category
3. User clicks activity → see results

**UI:**
```
┌────────────────────────────────────────┐
│ Find auspicious days by activity       │
├────────────────────────────────────────┤
│                                        │
│ ► Business & Commerce (5)              │
│   • Sales & commercial activities      │
│   • Starting business & trade          │
│   • Starting industries & enterprises  │
│   • Trade & commercial exchange       │
│   • Obtaining, repaying loan          │
│                                        │
│ ► Life Events (2)                      │
│   • Marriage & matrimonial unions      │
│   • Relationships & interpersonal      │
│                                        │
│ ► Creative Arts (5)                    │
│   ...
│                                        │
│ Or search: [marriage________________] │
│                                        │
└────────────────────────────────────────┘
```

**Pros:**
- Helps users **discover** what's possible (practitioners might not know all 60 activities)
- Browse-friendly for someone exploring
- Categories match practitioner mental model (Business, Life Events, Spiritual)
- Reduces cognitive load (don't show all 60 at once)

**Cons:**
- More UI space needed
- Extra click to get to activity (category → activity → search)
- Still need typeahead for direct search
- More implementation work

**Implementation Effort:** Medium (2-3 days)

**Code Example:**
```javascript
const groupedActivities = getActivitiesByCategory()
// Returns: { "Business & Commerce": [...], "Life Events": [...], ... }

// When user clicks activity
const activity = groupedActivities["Life Events"][0] // Marriage
const results = filterCalendarByActivity(activity.id, dateFrom, dateTo)
```

---

## Approach 3: Category Filter + Typeahead

**How it works:**
1. User optionally selects category filter: "Life Events"
2. Typeahead now only suggests activities from that category
3. User types "mar" → suggests only "Marriage & matrimonial unions" (not "Market" from unrelated category)
4. Search and rank results

**UI:**
```
┌──────────────────────────────────────┐
│ Find auspicious activity days        │
├──────────────────────────────────────┤
│ Category (optional):                 │
│ [All categories ▼]                   │
│ (or select: Life Events, Creative... │
│                                      │
│ Activity:                            │
│ [mar_____________________________]    │
│ • Marriage & matrimonial unions ← match in "Life Events"
│ • Marriage ceremonies & rituals       │
│                                      │
│ Date range:                          │
│ [From] Apr 1     [To] Apr 30         │
│                                      │
│ [Search]                             │
└──────────────────────────────────────┘
```

**Pros:**
- Precision: filter + search narrows possibilities
- Discovery: category filter shows what's available
- Typo-resistant: fewer activities to match against
- Power user friendly (can narrow or keep broad)

**Cons:**
- More interaction steps
- Slightly more complex state management
- Default "all categories" might still feel overwhelming

**Implementation Effort:** Medium (2-3 days)

---

## Approach 4: Multi-Activity Search (Combinations)

**How it works:**
1. User searches "marriage" → results
2. User adds second activity "music" (AND logic)
3. Filter to days that have **both** nakshatras
4. Or with OR logic: days that have **either** activity

**UI:**
```
┌──────────────────────────────────────┐
│ Activities:                          │
│ [marriage______________] [+]         │
│ [music_________________] [+]         │
│                                      │
│ Logic: ⦿ AND  ○ OR                   │
│                                      │
│ Results (AND):                       │
│ ✓ Apr 5 — Both marriage & music      │
│   Rohini (has both)                  │
│                                      │
│ Results (OR):                        │
│ ✓ Apr 5 — Marriage                   │
│ ✓ Apr 7 — Music                      │
│                                      │
└──────────────────────────────────────┘
```

**Pros:**
- Powerful: combine constraints (e.g., "marriage AND spiritual" for auspicious ceremony)
- Covers advanced use cases (practitioners often plan multiple goals)
- More flexible than single-activity search

**Cons:**
- More complex UI & logic
- AND logic with 60 activities can result in zero days (no nakshatra has all combinations)
- Users might not understand AND vs OR logic
- Requires careful result messaging ("No days for BOTH activities in this range")

**Implementation Effort:** Medium-High (3-4 days)

**Code Example:**
```javascript
const activity1Nakshatras = getNakshatrasForActivity(26) // Marriage
const activity2Nakshatras = getNakshatrasForActivity(45) // Spiritual

// AND: nakshatras that have BOTH
const andNakshatras = activity1Nakshatras.filter(n => activity2Nakshatras.includes(n))

// OR: nakshatras that have EITHER
const orNakshatras = new Set([...activity1Nakshatras, ...activity2Nakshatras])

// Filter calendar
const results = filterCalendarByNakshatras(andNakshatras, dateFrom, dateTo)
```

---

## Approach 5: Calendar Integration (Inline)

**How it works:**
1. User interacts **directly with calendar** (not a separate search UI)
2. Click/long-press on activity legend or day cell: "Show all days good for this"
3. Calendar highlights matching days (visual filter, not full list)

**UI:**
```
Calendar view:
  Apr 5 (Rohini, Tara 6) — Auspicious Activities
  • Art & decoration
  • Building & construction
  • [Marriage & matrimonial unions] ← user clicks

Highlight all days with "Marriage" nakshatras on the calendar:
  Apr 5 ✓ — Rohini (has it)
  Apr 12 ✓ — Pushya (has it)
  ...other days grey out
```

**Pros:**
- **Integrated:** no context-switch to separate search UI
- Visual: see pattern across month
- Exploratory: click activities directly from day detail
- Reduces modal/overlay fatigue

**Cons:**
- Calendar view only (not mobile-friendly if calendar is small)
- Harder to show detailed ranking (calendar cell has limited space)
- Less discoverable (users must know to click on activity text)
- Not actionable beyond "highlight" — still need to click each day for details

**Implementation Effort:** Medium (2-3 days)

---

## Approach 6: Natural Language / Smart Search

**How it works:**
1. User types natural language: *"Good days for marriage in May"* or *"When can I start a business?"*
2. Parser extracts: activity + optional date range + optional quality preference
3. Execute search with parsed parameters

**UI:**
```
┌─────────────────────────────────────┐
│ What do you want to do?             │
│                                     │
│ [Good days for marriage in May___]  │
│                                     │
│ Suggestions:                        │
│ • "marriage"                        │
│ • "marriage in may"                 │
│ • "good days for marriage"          │
│                                     │
│ [Search]                            │
└─────────────────────────────────────┘
```

**Pros:**
- Most intuitive for end users ("I just ask what I want")
- One input field instead of multiple dropdowns
- Modern UX (similar to search engines)
- Handles typos via fuzzy matching

**Cons:**
- Requires NLP parser (even simple one adds complexity)
- Date parsing can be fragile ("May" assumes current year)
- Quality preferences ("good days" vs "very good days") need interpretation
- Edge cases ("May I..." gets parsed as month, not permission)

**Implementation Effort:** High (4-5 days)

**Code Example:**
```javascript
// Simple regex-based parser (not true NLP)
const query = "good days for marriage in may"
const activityMatch = query.match(/for\s+(\w+)/i) // "marriage"
const monthMatch = query.match(/\b(january|february|...|may|...)\b/i) // "may"
const qualityMatch = query.match/(very\s+)?good/) // "good"

const activity = searchActivities(activityMatch[1])[0]
const dateRange = getMonthRange(monthMatch[1], currentYear)
const minTier = qualityMatch ? "good" : "mixed"

const results = filterCalendar(activity.id, dateRange, minTier)
```

---

## Approach 7: Saved Searches / Favorites

**How it works:**
1. User performs search (any approach above)
2. Sees "Save this search" option
3. Search is stored locally (browser localStorage)
4. Dashboard shows saved searches for quick re-run

**UI:**
```
Saved Searches:
┌─────────────────────────────┐
│ ⭐ Marriage (next 30 days)  │ ← click to run
│ ⭐ Business (2026)           │
│ ⭐ Medical (April-May)       │
│                              │
│ [+ New Search]               │
└─────────────────────────────┘
```

**Pros:**
- Reduces repeated search effort (practitioners search same things often)
- Improves workflow (one-click to "show marriage days for this year")
- Builds on any other approach
- Simple to implement (localStorage)

**Cons:**
- Only works if users revisit app (not useful for one-time lookup)
- Competes for UI space
- localStorage has size limits (~5MB per domain)

**Implementation Effort:** Low-Medium (1-2 days, on top of any base approach)

---

## Comparison Matrix

| Approach | UX Simplicity | Discovery | Advanced Use | Implementation | Mobile | Practitioner Appeal |
|----------|---|---|---|---|---|---|
| 1. Simple Typeahead | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 2. Category First | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 3. Category + Search | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 4. Multi-Activity | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ |
| 5. Calendar Inline | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 6. Natural Language | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 7. Saved Searches | ⭐⭐⭐⭐⭐ | N/A | ⭐⭐ | ⭐⭐ (add-on) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Recommended Combinations

### MVP (Phase 1): Simple + Discoverable
**Approach 1 (Typeahead) + Approach 2 (Categories)**

- Users can search directly if they know what to look for
- Users can browse categories if they're exploring
- Simple to implement
- Covers 80% of use cases

**Effort:** 2-3 days  
**Result:** A search UI that's both powerful and approachable

---

### V2 (Phase 2): Power User Features
Add **Approach 4 (Multi-Activity)** + **Approach 7 (Saved Searches)**

- Combine activities (e.g., "marriage AND spiritual" for ceremony)
- Save frequently-used searches
- Practitioners can build personalized search library

**Effort:** 4-5 days additional  
**Result:** Advanced workflow for return users

---

### Advanced (Phase 3): Smart Search
Add **Approach 6 (Natural Language)**

- For practitioners with less technical comfort
- "Find good days for business in May" one-liner
- Powerful but requires user education

**Effort:** 4-5 days additional  
**Result:** Most intuitive for non-technical users

---

## Current Data Readiness

✅ **Approach 1** — Ready now (typeahead with searchActivities())  
✅ **Approach 2** — Ready now (getActivitiesByCategory())  
✅ **Approach 3** — Ready now (both functions above)  
✅ **Approach 4** — Ready now (getNakshatrasForActivity() + set logic)  
✅ **Approach 5** — Ready now (integrate with DayDetailModal)  
⚠️ **Approach 6** — Requires parser (not implemented)  
✅ **Approach 7** — Ready now (localStorage helper)  

---

## Questions for You

1. **Which approach resonates most?** (or combination?)
2. **Who is the primary user?**
   - Practitioners who know astrology (prefer power)
   - General users (prefer simplicity)
   - Both (need flexibility)
3. **Mobile-first or desktop-first?**
4. **Want to start simple (MVP) or comprehensive (all at once)?**

---

## Next Step

Once you choose approach(es), I'll:
1. Update docs/DESIGN_03_ACTIVITY_SEARCH.md with final design
2. Create component specs + data flow diagrams
3. Build implementation checklist
4. Code the components
