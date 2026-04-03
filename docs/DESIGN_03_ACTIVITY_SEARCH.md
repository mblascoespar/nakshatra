# Design Doc 3: Activity Search Feature

**Status:** Implementation ready  
**Approach:** Simple Typeahead (Approach 1) + Category Discovery (Approach 2)  
**Representation:** Modal Dialog (Option B)

---

## Objective

Enable users to find auspicious days for a specific activity without manually clicking through the calendar.

**User story:**
> As a practitioner, I want to search for "marriage" and see all auspicious days for marriage in a given date range, ranked by Tara quality, so I can quickly identify optimal dates.

---

## Current State vs. Proposed

### Current
- User clicks individual days to see activities
- No bulk search capability
- Workflow is reactive (check day → see activities)

### Proposed
- User searches activity name or browses categories
- System returns ranked list of auspicious days
- Results show Nakshatra, Tara, and date
- Workflow is proactive (search → see all options)

---

## UI Design

### Modal Layout

```
┌─────────────────────────────────────────────────────┐
│             ACTIVITY SEARCH                    [×]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Search activity:                                    │
│ [marriage___________________________] ▼             │
│ Suggestions:                                        │
│ • Marriage & matrimonial unions                     │
│ • Marriage ceremonies & rituals                     │
│                                                     │
│ ── OR ──                                            │
│                                                     │
│ Browse by category:                                 │
│ [Business & Commerce] [Life Events] [Creative]      │
│ [Spiritual]           [Property]    [Professional]  │
│ [Health & Medicine]   [Travel]      [Learning]      │
│ [Conflict]            [Healing]     [Goals]         │
│ [Leisure]             [Recreation]  [Legal]         │
│ [Agriculture]         [Finance]     [Social]        │
│                                                     │
│ Date range:                                         │
│ From: [Apr 1, 2026 ▼]  To: [Apr 30, 2026 ▼]        │
│                                                     │
│ [Search]  [Clear]                                   │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Results: "Marriage" (8 auspicious days found)       │
│                                                     │
│ ✓ Apr 5 (Thursday) — Very Good                      │
│   Rohini, Tara 6 (Sadhana)                          │
│                                                     │
│ ✓ Apr 7 (Saturday) — Very Good                      │
│   Pushya, Tara 9 (Parama Mitra)                     │
│                                                     │
│ ✓ Apr 12 (Thursday) — Good                          │
│   Ashwini, Tara 4 (Kshema)                          │
│                                                     │
│ [Show more] [Export as .ics]                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Responsive Behavior

**Desktop (> 768px):**
- Modal width: 600px, centered on screen
- Category buttons in rows (2-3 per row)
- Results list scrollable within modal (max-height)

**Mobile (< 768px):**
- Modal full-screen or near full-screen (95vw)
- Category buttons stack vertically or 1 per row
- Larger touch targets (48px minimum)
- Simplified layout (fewer category buttons visible, scroll to see more)

---

## Component Architecture

```
App
├── ActivitySearchButton (toolbar button)
│   └── onClick → opens modal
│
└── ActivitySearchModal (new)
    ├── ActivitySearchInput (search box with typeahead)
    │   ├── input: string (user typing)
    │   ├── suggestions: Activity[] (filtered from ACTIVITIES)
    │   └── onSelect(activity) → updates state
    │
    ├── CategoryFilter (category buttons)
    │   ├── categories: string[] (all available)
    │   ├── selectedCategory: string | null
    │   └── onClick(category) → filters typeahead + resets search
    │
    ├── DateRangePicker (date selection)
    │   ├── fromDate: Date
    │   ├── toDate: Date
    │   └── onChange(from, to) → updates state
    │
    ├── SearchButton (triggers search)
    │   └── onClick → executes filter logic
    │
    └── ResultsList (search results)
        ├── results: DayResult[] (sorted by Tara tier)
        ├── total: number
        ├── expanded: boolean
        └── onClick(day) → opens DayDetailModal
```

---

## Data Flow

### State Shape

```javascript
// Inside ActivitySearchModal component
const [modalOpen, setModalOpen] = useState(false)

// Search form state
const [searchQuery, setSearchQuery] = useState("")
const [selectedActivity, setSelectedActivity] = useState(null)
const [selectedCategory, setSelectedCategory] = useState(null)
const [dateFrom, setDateFrom] = useState(new Date())
const [dateTo, setDateTo] = useState(new Date(new Date().setMonth(new Date().getMonth() + 1)))

// Results state
const [searchResults, setSearchResults] = useState([])
const [loading, setLoading] = useState(false)
const [resultsExpanded, setResultsExpanded] = useState(false)
```

### Search Flow

```
User types "marriage"
         ↓
searchActivities("marriage") → finds Activity { id: 26, name: "Marriage", ... }
         ↓
getNakshatrasForActivity(26) → [5, 12, 13, 15, 17, 21, 26, 27]
         ↓
Filter calendar.months[*].days:
  - Keep only days with sunrise_nakshatra_id in nakshatras array
  - Keep only days between dateFrom and dateTo
  - ⭐ KEEP ONLY days with tarabalam_tier in ["very_good", "good"] ⭐
  - Discard all other Tara tiers (mixed, poor, very_bad)
         ↓
Sort results by:
  1. Tara tier (very_good first, then good)
  2. Date (earliest first)
         ↓
Display in ResultsList
  - Show first 3-5 results
  - "[Show more]" button if more exist
  - Each result shows date, day name, Tara info
```

### Code Example: Search Logic

```javascript
function performActivitySearch(
  activity,
  calendar,
  dateFrom,
  dateTo
) {
  // Get nakshatras that have this activity
  const nakshatras = getNakshatrasForActivity(activity.id)
  if (!nakshatras.length) return []

  // Flatten calendar to array of all days
  const allDays = calendar.months.flatMap(m => m.days)

  // Filter and rank results
  const results = allDays
    .filter(day => {
      // Date range check
      const dayDate = new Date(day.date)
      if (dayDate < dateFrom || dayDate > dateTo) return false

      // Nakshatra check: day must have this activity
      if (!nakshatras.includes(day.sunrise_nakshatra_id)) return false

      // ⭐ TARA QUALITY FILTER: only good or very_good days
      const favorableTaras = ['very_good', 'good']
      if (!favorableTaras.includes(day.tarabalam_tier)) return false

      return true
    })
    .sort((a, b) => {
      // Sort by Tara tier first (very_good before good)
      const tierOrder = { very_good: 1, good: 2 }
      const tierDiff = tierOrder[a.tarabalam_tier] - tierOrder[b.tarabalam_tier]
      if (tierDiff !== 0) return tierDiff

      // Then by date (earliest first)
      return new Date(a.date) - new Date(b.date)
    })

  return results
}
```

---

## Component Specifications

### 1. ActivitySearchButton

**Purpose:** Trigger modal open  
**Location:** Toolbar (next to NakshatraSelector, LocationSelector)

```javascript
export function ActivitySearchButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
    >
      <span>🔍</span>
      <span>Activity Search</span>
    </button>
  )
}
```

---

### 2. ActivitySearchInput

**Purpose:** Search and typeahead for activities

```javascript
import { searchActivities } from '../data/activityIndex.js'

export function ActivitySearchInput({
  value,
  onChange,
  onSelect,
  selectedCategory,
  placeholder = "Type activity name (e.g., marriage, business)..."
}) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleChange = (e) => {
    const query = e.target.value
    onChange(query)

    // Debounce search
    if (query.length === 0) {
      setSuggestions([])
      return
    }

    // Search activities, filter by category if selected
    let results = searchActivities(query)
    if (selectedCategory) {
      const categoryActivities = getActivitiesByCategory()[selectedCategory]
      const categoryIds = categoryActivities.map(a => a.id)
      results = results.filter(a => categoryIds.includes(a.id))
    }

    setSuggestions(results.slice(0, 5)) // Top 5 matches
    setShowSuggestions(true)
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-t-0 rounded-b-lg shadow-lg max-h-48 overflow-y-auto z-10">
          {suggestions.map((activity) => (
            <div
              key={activity.id}
              onClick={() => {
                onSelect(activity)
                setShowSuggestions(false)
              }}
              className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
            >
              <div className="font-medium text-sm">{activity.displayText}</div>
              <div className="text-xs text-gray-500">{activity.category}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### 3. CategoryFilter

**Purpose:** Browse activities by category

```javascript
import { ACTIVITY_CATEGORIES } from '../data/activityIndex.js'

export function CategoryFilter({ selectedCategory, onSelect }) {
  const categories = Object.keys(ACTIVITY_CATEGORIES)

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-700">Or browse by category:</p>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

### 4. DateRangePicker

**Purpose:** Select date range for search

```javascript
export function DateRangePicker({ dateFrom, dateTo, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">From:</label>
        <input
          type="date"
          value={dateFrom.toISOString().split('T')[0]}
          onChange={(e) => onChange(new Date(e.target.value), dateTo)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">To:</label>
        <input
          type="date"
          value={dateTo.toISOString().split('T')[0]}
          onChange={(e) => onChange(dateFrom, new Date(e.target.value))}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
    </div>
  )
}
```

---

### 5. ResultsList

**Purpose:** Display ranked search results

```javascript
import { TARAS } from '../data/tarabalam.js'

export function ResultsList({ results, activity, loading, expanded, onToggleExpanded, onSelectDay }) {
  if (loading) {
    return <div className="text-center py-4">Searching...</div>
  }

  if (!activity) {
    return <div className="text-gray-500 text-sm py-4">Search or select an activity to see results.</div>
  }

  if (results.length === 0) {
    return <div className="text-gray-500 text-sm py-4">No auspicious days found for {activity.displayText} in this range.</div>
  }

  const displayedResults = expanded ? results : results.slice(0, 3)

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-700">
        Results: "{activity.displayText}" ({results.length} days found)
      </p>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {displayedResults.map((day) => (
          <div
            key={day.date}
            onClick={() => onSelectDay(day)}
            className={`p-3 rounded-lg cursor-pointer border-l-4 transition ${
              day.tarabalam_tier === 'very_good'
                ? 'bg-green-50 border-green-500 hover:bg-green-100'
                : day.tarabalam_tier === 'good'
                ? 'bg-lime-50 border-lime-500 hover:bg-lime-100'
                : 'bg-gray-50 border-gray-400 hover:bg-gray-100'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-sm">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {day.sunrise_nakshatra_name}, Tara {day.tara.number} ({day.tara.name})
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-white">
                {day.tarabalam_tier === 'very_good'
                  ? '✓ Very Good'
                  : day.tarabalam_tier === 'good'
                  ? '✓ Good'
                  : day.tarabalam_tier === 'mixed'
                  ? '● Mixed'
                  : '✗ Poor'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {results.length > 3 && (
        <button
          onClick={onToggleExpanded}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {expanded ? 'Show less' : `Show ${results.length - 3} more`}
        </button>
      )}
    </div>
  )
}
```

---

## State Management

**Option 1: Local State in Modal Component**
- Simplest for MVP
- Store search state in ActivitySearchModal component
- Use Zustand to share with calendar if needed

**Option 2: Zustand Store**
- If search state needs to persist across navigation
- Can pre-populate modal on reopen with last search
- Easier testing

**Recommended:** Option 1 for MVP (local state), upgrade to Option 2 if needed later

---

## Implementation Checklist

### Phase 1: Foundation (Day 1)
- [ ] Create ActivitySearchModal component (skeleton)
- [ ] Create ActivitySearchInput component (search box only)
- [ ] Create DateRangePicker component
- [ ] Wire up modal open/close button in toolbar
- [ ] Test modal appears and closes

### Phase 2: Search Logic (Day 2)
- [ ] Implement performActivitySearch() function
- [ ] Connect ActivitySearchInput to search
- [ ] Implement typeahead suggestions (searchActivities())
- [ ] Display results in ResultsList
- [ ] Test search with sample activity (e.g., "marriage")

### Phase 3: Categories (Day 2)
- [ ] Create CategoryFilter component
- [ ] Implement category selection
- [ ] Filter typeahead by selected category
- [ ] Reset search when category changes
- [ ] Test category filtering

### Phase 4: UX Polish (Day 3)
- [ ] Responsive design (mobile/desktop)
- [ ] Loading state
- [ ] Empty state ("No results")
- [ ] Sorting by Tara tier
- [ ] "Show more/less" for results
- [ ] Click result → open DayDetailModal

### Phase 5: Testing (Day 3)
- [ ] Unit tests: performActivitySearch()
- [ ] Unit tests: searchActivities() + filtering
- [ ] Integration test: full search flow
- [ ] E2E test: user searches activity, sees results, clicks day
- [ ] Mobile responsive testing

---

## Data Inputs

### From activityIndex.js
- `ACTIVITIES` — Master list (60 total)
- `ACTIVITY_TO_NAKSHATRAS` — Reverse mapping
- `ACTIVITY_CATEGORIES` — Category grouping
- `searchActivities(query)` — Fuzzy search
- `getNakshatrasForActivity(id)` — Get nakshatras
- `getActivitiesByCategory()` — Group by category

### From calendar data
- `calendarData.months[*].days[*]` — All days with:
  - `date` (YYYY-MM-DD)
  - `sunrise_nakshatra_id` (1-27)
  - `sunrise_nakshatra_name`
  - `tarabalam_tier` (very_good, good, mixed, poor, very_bad)
  - `tara` (number, name, meaning)

### From Zustand store (useCalendarStore)
- `calendarData` — Full year calendar
- Already loaded on initial app render

---

## Integration Points

### 1. Toolbar Button
```javascript
// In App.jsx or toolbar component
import { ActivitySearchButton } from './components/ActivitySearch'

<ActivitySearchButton onClick={() => setActivitySearchOpen(true)} />
```

### 2. Modal Integration
```javascript
// In App.jsx
const [activitySearchOpen, setActivitySearchOpen] = useState(false)

{activitySearchOpen && (
  <ActivitySearchModal
    onClose={() => setActivitySearchOpen(false)}
    calendarData={calendarData}
    onSelectDay={(day) => {
      setActivitySearchOpen(false)
      // Open DayDetailModal with selected day
    }}
  />
)}
```

### 3. DayDetailModal Linkage
```javascript
// From ActivitySearchModal result click
function handleResultClick(day) {
  onSelectDay(day)  // Pass to parent
  // Parent opens DayDetailModal with this day
}
```

---

## Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| No results found | Show: "No auspicious days found for [activity] in this range" |
| User selects category then types in unrelated activity | Reset category selection + show all search matches |
| Date range is invalid (from > to) | Disable search button, show error |
| User searches non-existent activity | Show suggestions from typeahead only |
| Search takes > 1 second | Show loading spinner |
| Mobile with small screen | Stack categories vertically, show 2-3 at a time |

---

## Performance Considerations

**Search speed:** < 100ms (all in-memory, no API calls)
- Calendar data already loaded
- Activity filtering is O(n) where n = 365 days
- Sorting is O(n log n) but fast on small result sets

**Optimization opportunities:**
- Memoize `performActivitySearch` results
- Use React.memo for ResultsList if rendering large lists
- Debounce typeahead input (200ms)

---

## Testing Strategy

### Unit Tests
```javascript
// performActivitySearch() tests
test('returns days with activity', () => {
  const activity = { id: 26, displayText: 'Marriage' }
  const results = performActivitySearch(activity, calendar, dateFrom, dateTo)
  expect(results.length).toBeGreaterThan(0)
})

test('filters by date range', () => {
  const dateFrom = new Date('2026-04-01')
  const dateTo = new Date('2026-04-07')
  const results = performActivitySearch(activity, calendar, dateFrom, dateTo)
  results.forEach(day => {
    expect(new Date(day.date)).toBeGreaterThanOrEqual(dateFrom)
  })
})

test('sorts by Tara tier then date', () => {
  const results = performActivitySearch(activity, calendar, dateFrom, dateTo)
  // Check very_good comes before good
  expect(results[0].tarabalam_tier).toBe('very_good')
})
```

### Integration Tests
```javascript
test('search flow: user types activity', async () => {
  render(<ActivitySearchModal {...props} />)
  const input = screen.getByPlaceholderText(/type activity/i)
  
  fireEvent.change(input, { target: { value: 'marriage' } })
  
  // Wait for suggestions
  await waitFor(() => {
    expect(screen.getByText(/Marriage & matrimonial/)).toBeInTheDocument()
  })
})

test('category filter narrows typeahead', async () => {
  render(<ActivitySearchModal {...props} />)
  
  // Click "Life Events" category
  fireEvent.click(screen.getByText('Life Events'))
  
  // Type something that doesn't match category
  fireEvent.change(screen.getByPlaceholderText(/type activity/i), {
    target: { value: 'business' }
  })
  
  // Should show no suggestions (business is in Business & Commerce)
  expect(screen.queryByText(/Starting business/)).not.toBeInTheDocument()
})
```

### E2E Tests
```javascript
test('user searches marriage and clicks result', () => {
  cy.visit('/')
  cy.contains('Activity Search').click()
  cy.get('input[placeholder*="type activity"]').type('marriage')
  cy.contains('Marriage & matrimonial').click()
  cy.contains('Search').click()
  cy.contains(/Apr 5/).click() // Click first result
  cy.contains('DayDetailModal').should('exist') // Verify modal opened
})
```

---

## Definition of Done

✓ Activity search modal opens/closes  
✓ Typeahead works for all 60 activities  
✓ Categories browse works  
✓ Search filters days by activity + date range  
✓ Results sorted by Tara tier, then date  
✓ Results show date, Nakshatra, Tara info  
✓ "Show more" works for large result sets  
✓ Clicking result opens DayDetailModal  
✓ Modal responsive on mobile & desktop  
✓ All tests pass  
✓ No API calls (all client-side)  
✓ Search completes in < 100ms  

---

## Timeline

**Estimated effort:** 2.5-3 days

- Day 1: Components (ActivitySearchButton, ActivitySearchInput, DateRangePicker, CategoryFilter)
- Day 2: Search logic + integration + ResultsList
- Day 2.5: Polish + responsive design + basic tests
- Day 3: Full test coverage + edge cases + final QA

---

## Future Enhancements (Post-MVP)

1. **Multi-activity search** (Approach 4): Combine "marriage AND spiritual"
2. **Saved searches** (Approach 7): Save favorite searches locally
3. **Tara quality filter**: Limit to "very good" days only
4. **PDF/ICS export**: Export results as calendar file
5. **Natural language search** (Approach 6): "Good days for marriage in May"
