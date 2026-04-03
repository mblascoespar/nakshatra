# Implementation: Activity Search Feature

**Status:** Ready to start building  
**Estimated Time:** 3 days  
**Key Requirement:** Filter results to show ONLY days with Tara tier "good" or "very_good"

---

## Prerequisites

✅ Activity data ready: `frontend/src/data/activityIndex.js` (60 activities with displayText + categories)  
✅ Calendar data structure ready: `frontend/src/data/calendar.js` (loads full year with Tara tiers)  
✅ Design finalized: `docs/DESIGN_03_ACTIVITY_SEARCH.md`  
✅ Existing components: `DayDetailModal.jsx` (will integrate with)

---

## File Structure

Create/modify:
```
frontend/src/
├── components/
│   └── ActivitySearch/                    (NEW FOLDER)
│       ├── ActivitySearchModal.jsx        (main container)
│       ├── ActivitySearchInput.jsx        (search + typeahead)
│       ├── CategoryFilter.jsx             (category buttons)
│       ├── DateRangePicker.jsx            (date inputs)
│       └── ResultsList.jsx                (results display)
│
├── utils/
│   └── activitySearchUtils.js             (NEW - search logic)
│
└── hooks/
    └── useActivitySearch.js               (NEW - state management)
```

---

## Phase 1: Foundation (Day 1, ~3-4 hours)

### 1.1 Create ActivitySearchModal.jsx (container)

**File:** `frontend/src/components/ActivitySearch/ActivitySearchModal.jsx`

```javascript
import { useState, useCallback } from 'react'
import ActivitySearchInput from './ActivitySearchInput'
import CategoryFilter from './CategoryFilter'
import DateRangePicker from './DateRangePicker'
import ResultsList from './ResultsList'
import { performActivitySearch } from '../../utils/activitySearchUtils'

export default function ActivitySearchModal({
  calendarData,
  onClose,
  onSelectDay,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().setDate(new Date().getDate()))
  )
  const [dateTo, setDateTo] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 1))
  )
  const [searchResults, setSearchResults] = useState([])
  const [resultsExpanded, setResultsExpanded] = useState(false)

  const handleSearch = useCallback(() => {
    if (!selectedActivity) return

    const results = performActivitySearch(
      selectedActivity,
      calendarData,
      dateFrom,
      dateTo
    )
    setSearchResults(results)
    setResultsExpanded(false)
  }, [selectedActivity, calendarData, dateFrom, dateTo])

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity)
    setSearchQuery(activity.displayText)
    setSearchResults([])
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(
      selectedCategory === category ? null : category
    )
    setSelectedActivity(null)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleDateChange = (from, to) => {
    setDateFrom(from)
    setDateTo(to)
  }

  const handleClear = () => {
    setSearchQuery('')
    setSelectedActivity(null)
    setSelectedCategory(null)
    setSearchResults([])
    setResultsExpanded(false)
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Activity Search</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Search Input */}
          <ActivitySearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSelect={handleActivitySelect}
            selectedCategory={selectedCategory}
            placeholder="Type activity name (e.g., marriage, business)..."
          />

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t"></div>
            <span className="text-sm text-gray-500 font-medium">OR</span>
            <div className="flex-1 border-t"></div>
          </div>

          {/* Category Filter */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
          />

          {/* Date Range */}
          <DateRangePicker
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={handleDateChange}
          />

          {/* Search Button */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
            >
              Clear
            </button>
            <button
              onClick={handleSearch}
              disabled={!selectedActivity}
              className={`px-4 py-2 rounded-lg font-medium text-white ${
                selectedActivity
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        {selectedActivity && (
          <div className="border-t p-6">
            <ResultsList
              results={searchResults}
              activity={selectedActivity}
              expanded={resultsExpanded}
              onToggleExpanded={() => setResultsExpanded(!resultsExpanded)}
              onSelectDay={(day) => {
                onSelectDay(day)
                onClose()
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
```

### 1.2 Create ActivitySearchUtils.js

**File:** `frontend/src/utils/activitySearchUtils.js`

```javascript
import { getNakshatrasForActivity } from '../data/activityIndex'

/**
 * Search calendar for auspicious days to perform an activity.
 * 
 * Filters to ONLY days with Tara tier "very_good" or "good"
 * Sorts by tier (very_good first), then by date (earliest first)
 * 
 * @param {Object} activity - Activity object with id, displayText
 * @param {Object} calendarData - Full year calendar data
 * @param {Date} dateFrom - Start of search range
 * @param {Date} dateTo - End of search range
 * @returns {Array} Filtered and sorted results
 */
export function performActivitySearch(
  activity,
  calendarData,
  dateFrom,
  dateTo
) {
  // Get nakshatras that have this activity
  const nakshatras = getNakshatrasForActivity(activity.id)
  if (!nakshatras.length) return []

  // Flatten calendar to array of all days
  const allDays = calendarData.months.flatMap((m) => m.days)

  // Filter and rank results
  const results = allDays
    .filter((day) => {
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

### 1.3 Create ActivitySearchInput.jsx

**File:** `frontend/src/components/ActivitySearch/ActivitySearchInput.jsx`

```javascript
import { useState, useCallback } from 'react'
import { searchActivities, getActivitiesByCategory } from '../../data/activityIndex'

export default function ActivitySearchInput({
  value,
  onChange,
  onSelect,
  selectedCategory,
  placeholder,
}) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleChange = useCallback(
    (e) => {
      const query = e.target.value
      onChange(query)

      if (query.length === 0) {
        setSuggestions([])
        return
      }

      // Search activities
      let results = searchActivities(query)

      // Filter by category if selected
      if (selectedCategory) {
        const categoryActivities = getActivitiesByCategory()[selectedCategory]
        const categoryIds = categoryActivities.map((a) => a.id)
        results = results.filter((a) => categoryIds.includes(a.id))
      }

      setSuggestions(results.slice(0, 5))
      setShowSuggestions(true)
    },
    [onChange, selectedCategory]
  )

  const handleSelect = (activity) => {
    onSelect(activity)
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Search activity:
      </label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => value && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
          {suggestions.map((activity) => (
            <div
              key={activity.id}
              onClick={() => handleSelect(activity)}
              className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0"
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

### 1.4 Create CategoryFilter.jsx

**File:** `frontend/src/components/ActivitySearch/CategoryFilter.jsx`

```javascript
import { ACTIVITY_CATEGORIES } from '../../data/activityIndex'

export default function CategoryFilter({ selectedCategory, onSelect }) {
  const categories = Object.keys(ACTIVITY_CATEGORIES)

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Or browse by category:
      </label>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition whitespace-nowrap ${
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

### 1.5 Create DateRangePicker.jsx

**File:** `frontend/src/components/ActivitySearch/DateRangePicker.jsx`

```javascript
export default function DateRangePicker({ dateFrom, dateTo, onChange }) {
  const handleFromChange = (e) => {
    onChange(new Date(e.target.value), dateTo)
  }

  const handleToChange = (e) => {
    onChange(dateFrom, new Date(e.target.value))
  }

  const fromString = dateFrom.toISOString().split('T')[0]
  const toString = dateTo.toISOString().split('T')[0]

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Date range:
      </label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-600 block mb-1">From:</label>
          <input
            type="date"
            value={fromString}
            onChange={handleFromChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">To:</label>
          <input
            type="date"
            value={toString}
            onChange={handleToChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  )
}
```

### 1.6 Create ResultsList.jsx

**File:** `frontend/src/components/ActivitySearch/ResultsList.jsx`

```javascript
const TIER_COLORS = {
  very_good: 'bg-green-50 border-green-500',
  good: 'bg-lime-50 border-lime-500',
}

const TIER_LABELS = {
  very_good: '✓ Very Good',
  good: '✓ Good',
}

export default function ResultsList({
  results,
  activity,
  expanded,
  onToggleExpanded,
  onSelectDay,
}) {
  if (!activity) {
    return (
      <div className="text-gray-500 text-sm py-4">
        Search or select an activity to see results.
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-gray-500 text-sm py-4">
        No auspicious days found for <strong>{activity.displayText}</strong> in this range.
      </div>
    )
  }

  const displayedResults = expanded ? results : results.slice(0, 3)

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-700">
        Results: "{activity.displayText}" ({results.length} auspicious days found)
      </p>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {displayedResults.map((day) => {
          const dateObj = new Date(day.date)
          const dateStr = dateObj.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })

          return (
            <div
              key={day.date}
              onClick={() => onSelectDay(day)}
              className={`p-3 rounded-lg cursor-pointer border-l-4 transition hover:shadow-md ${TIER_COLORS[day.tarabalam_tier]}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{dateStr}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {day.sunrise_nakshatra_name}, Tara {day.tara.number} ({day.tara.name})
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-white">
                  {TIER_LABELS[day.tarabalam_tier]}
                </span>
              </div>
            </div>
          )
        })}
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

## Phase 2: Integration (Day 2, ~4-5 hours)

### 2.1 Add button to toolbar

**File:** `frontend/src/components/YearCalendar.jsx` or main App component

```javascript
import { useState } from 'react'
import ActivitySearchButton from './components/ActivitySearch/ActivitySearchButton'
import ActivitySearchModal from './components/ActivitySearch/ActivitySearchModal'

// In your component:
const [activitySearchOpen, setActivitySearchOpen] = useState(false)

// In render:
<ActivitySearchButton onClick={() => setActivitySearchOpen(true)} />

{activitySearchOpen && (
  <ActivitySearchModal
    calendarData={calendarData}
    onClose={() => setActivitySearchOpen(false)}
    onSelectDay={(day) => {
      setActivitySearchOpen(false)
      // Open DayDetailModal with day
      setSelectedDay(day)
      setDayDetailOpen(true)
    }}
  />
)}
```

### 2.2 Create ActivitySearchButton.jsx

**File:** `frontend/src/components/ActivitySearch/ActivitySearchButton.jsx`

```javascript
export default function ActivitySearchButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 font-medium transition"
    >
      <span>🔍</span>
      <span>Activity Search</span>
    </button>
  )
}
```

### 2.3 Update ARCHITECTURE.md

**File:** `ARCHITECTURE.md`

Add to "Pending Backend Changes" or "Frontend Features":

```markdown
### Frontend: Activity Search Modal (v5)

**Components:**
- ActivitySearchModal: Main modal container
- ActivitySearchInput: Search box with typeahead
- CategoryFilter: Category button filter
- DateRangePicker: Date range selection
- ResultsList: Results display with ranking

**Data Sources:**
- ACTIVITIES, ACTIVITY_TO_NAKSHATRAS from activityIndex.js
- Calendar data from Zustand store (already loaded)

**Key Logic:**
- performActivitySearch() filters to ONLY "very_good" or "good" Tara tiers
- Results sorted by Tara tier (very_good first), then date
- Typeahead filtered by selected category if chosen

**Files:**
- frontend/src/components/ActivitySearch/*.jsx (5 components)
- frontend/src/utils/activitySearchUtils.js (search logic)

**Integration:**
- Button in toolbar → opens modal
- Modal result click → opens DayDetailModal with selected day
- No backend calls (all client-side computation)
```

---

## Phase 3: Testing & Polish (Day 3, ~2-3 hours)

### 3.1 Test file structure

```
frontend/src/utils/__tests__/activitySearchUtils.test.js
frontend/src/components/ActivitySearch/__tests__/
  ├── ActivitySearchModal.test.jsx
  ├── ActivitySearchInput.test.jsx
  ├── ResultsList.test.jsx
```

### 3.2 Basic tests

```javascript
// activitySearchUtils.test.js
import { performActivitySearch } from '../activitySearchUtils'

describe('performActivitySearch', () => {
  it('returns only very_good and good Tara days', () => {
    const activity = { id: 26, displayText: 'Marriage' }
    const results = performActivitySearch(activity, mockCalendar, dateFrom, dateTo)
    
    results.forEach(day => {
      expect(['very_good', 'good']).toContain(day.tarabalam_tier)
    })
  })

  it('filters by date range', () => {
    const results = performActivitySearch(activity, mockCalendar, dateFrom, dateTo)
    
    results.forEach(day => {
      expect(new Date(day.date)).toBeGreaterThanOrEqual(dateFrom)
      expect(new Date(day.date)).toBeLessThanOrEqual(dateTo)
    })
  })

  it('sorts by Tara tier then date', () => {
    const results = performActivitySearch(activity, mockCalendar, dateFrom, dateTo)
    
    expect(results[0].tarabalam_tier).toBe('very_good')
    if (results.length > 1 && results[1].tarabalam_tier === 'very_good') {
      expect(new Date(results[0].date)).toBeLessThanOrEqual(new Date(results[1].date))
    }
  })
})
```

### 3.3 Responsive testing

- Test on mobile (< 600px): buttons stack, modal full-screen
- Test on desktop (> 768px): modal 600px width, centered
- Test date picker on both
- Test results list scrollable on mobile

---

## Definition of Done

- [ ] All 5 components created and working
- [ ] performActivitySearch() filters to good/very_good only
- [ ] Search button in toolbar
- [ ] Modal opens/closes correctly
- [ ] Typeahead suggests activities
- [ ] Categories filter typeahead
- [ ] Date range picker works
- [ ] Search button triggers filtering
- [ ] Results show only favorable Tara days
- [ ] Results sorted by tier then date
- [ ] "Show more/less" works
- [ ] Clicking result closes modal and opens DayDetailModal
- [ ] Modal responsive on mobile & desktop
- [ ] Tests pass (at least performActivitySearch)
- [ ] ARCHITECTURE.md updated
- [ ] No console errors or warnings

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/activity-search

# After Phase 1
git add frontend/src/components/ActivitySearch/ frontend/src/utils/activitySearchUtils.js
git commit -m "Add activity search components and utilities"

# After Phase 2 (integration)
git add frontend/src/components/YearCalendar.jsx docs/ARCHITECTURE.md
git commit -m "Integrate activity search into toolbar and update architecture"

# After Phase 3 (testing)
git add frontend/src/**/*.test.js
git commit -m "Add activity search tests"

# Final
git push origin feature/activity-search
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Typeahead shows no suggestions | Check searchActivities() is imported correctly, verify ACTIVITIES data |
| Search returns no results | Verify dateFrom < dateTo, check if activity nakshatras exist in calendar |
| Only showing mixed/poor Tara | Bug: check performActivitySearch filters to ['very_good', 'good'] only |
| Modal not opening | Check ActivitySearchButton onClick connects to state, modal open state updates |
| Results not sorted correctly | Verify tierOrder object and date comparison in sort function |
