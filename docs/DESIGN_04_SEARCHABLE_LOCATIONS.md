# Design Doc 4: Searchable Locations by City

## Objective
Replace the fixed location dropdown with a searchable interface where users can type a city name and get lat/lon/timezone automatically.

## Current State
- Fixed dropdown of pre-selected locations (very limited)
- No way to add a custom city
- Users are forced into closest approximate location

## Proposed State

A city search interface that:
1. User types a city name (e.g., "Mumbai", "New York", "Tokyo")
2. Typeahead suggests matching cities with country
3. User selects a city
4. App fetches/looks up lat/lon/timezone automatically
5. Calendar updates for that location

## UI Entry Point

```
┌─────────────────────────────────────┐
│ Location Selector                   │
├─────────────────────────────────────┤
│ Search city:                        │
│ [____________ Mumbai______________] │
│ 🔍                                  │
│                                     │
│ Suggestions:                        │
│ • Mumbai, India (19.07° N, 72.87°E) │
│ • Mumbai (Alternative) — NY, USA    │ (if exists)
│ • Mumbra, India                     │
│                                     │
│ Current: Mumbai, India              │
│ Latitude: 19.0760° N                │
│ Longitude: 72.8777° E               │
│ Timezone: Asia/Kolkata (UTC+5:30)   │
│ [Edit manually]                     │
└─────────────────────────────────────┘
```

## Data Source Options

### Option A: Static City Database
- Embedded JSON file of ~5,000 major cities with [name, country, lat, lon, timezone]
- No external API needed
- Fast typeahead
- Limited to pre-curated cities

### Option B: Geoapify/Nominatim API
- Query live city database via free API
- More comprehensive coverage
- Adds network dependency and latency
- May have rate limits

### Option C: Hybrid (Recommended)
- Embed ~1,000 most common cities (instant typeahead)
- Option to query geocoding API for uncommon cities (slower)
- Fallback: manual lat/lon entry

## City Data Structure

```javascript
const CITIES = [
  {
    id: "mumbai_in",
    name: "Mumbai",
    country: "India",
    lat: 19.0760,
    lon: 72.8777,
    timezone: "Asia/Kolkata"
  },
  {
    id: "newyork_us",
    name: "New York",
    country: "United States",
    lat: 40.7128,
    lon: -74.0060,
    timezone: "America/New_York"
  },
  // ... ~1,000 cities
]
```

## Search Algorithm

```javascript
function searchCities(query) {
  const normalized = query.toLowerCase().trim()
  
  return CITIES.filter(city => {
    const nameMatch = city.name.toLowerCase().startsWith(normalized)
    const countryMatch = city.country.toLowerCase().startsWith(normalized)
    return nameMatch || countryMatch
  })
  .sort((a, b) => {
    // Prioritize exact name prefix matches
    const aNameMatch = a.name.toLowerCase().startsWith(normalized)
    const bNameMatch = b.name.toLowerCase().startsWith(normalized)
    if (aNameMatch && !bNameMatch) return -1
    if (!aNameMatch && bNameMatch) return 1
    // Then by population (implicit in dataset order)
    return 0
  })
  .slice(0, 10) // Limit to 10 suggestions
}
```

## Component Architecture

```
App
├── LocationSelector (refactored from dropdown)
│   ├── SearchInput (typeahead)
│   │   └── Suggestions (dropdown)
│   ├── CurrentLocation (display)
│   │   ├── City name + country
│   │   ├── Lat/lon display
│   │   ├── Timezone
│   │   └── [Edit] button
│   └── ManualEntry (optional, hidden by default)
│       ├── Latitude input
│       ├── Longitude input
│       ├── Timezone dropdown
│       └── [Save] button
```

## Integration Points

1. **Zustand Store**
   - location: { name, country, lat, lon, timezone }
   - Track separately (don't lump with Nakshatra/Year)

2. **API Call**
   - Backend still needs lat/lon/timezone to compute sunrise
   - Frontend passes these from selected city

3. **URL State (Optional)**
   - Can encode city in URL for bookmarking
   - Example: `?city=mumbai_in&year=2026`

## Typeahead UX

- Debounce input: 150ms
- Show suggestions after 2 characters typed
- Display: "City, Country" format
- Include coordinates in suggestion for clarity
- Keyboard navigation: arrow keys to select, Enter to confirm

## Manual Entry Fallback

For users in rare/unlisted locations:

```
[Edit] → Reveals
  Latitude: [___________] (e.g., 19.0760)
  Longitude: [__________] (e.g., 72.8777)
  Timezone: [Asia/Kolkata dropdown]
  [Confirm]
```

- Timezone dropdown lists all IANA timezones
- Validation: lat in [-90, 90], lon in [-180, 180]

## Implementation Notes

### Embedded Cities JSON

Create `frontend/public/data/cities.json` (~100–200KB):

```json
{
  "cities": [
    { "id": "mumbai_in", "name": "Mumbai", "country": "India", "lat": 19.0760, "lon": 72.8777, "tz": "Asia/Kolkata" },
    ...
  ]
}
```

Can be generated from:
- GeoNames (free download)
- Natural Earth (public domain)
- Or curated manually from top ~1,000 cities by population

### Timezone Lookup

```javascript
// Use existing timezone library (already in frontend)
const timezone = moment.tz.guess() // Browser default
// But override with user selection from city
```

## User Experience Flow

1. App loads → show default location (browser geolocation or fallback)
2. User clicks "Change location"
3. Sees search input
4. Types "paris"
5. Sees suggestions: "Paris, France" + coordinates
6. Clicks suggestion
7. Calendar re-fetches with new lat/lon/tz
8. UI updates to show new location

## Edge Cases

- User searches "New York" → show multiple (New York, NY; New York, Canada; etc.)
- User types exact coordinates → manual entry fallback
- Timezone ambiguity (e.g., DST regions) → show current tz in UTC offset format
- City name spelled wrong → fuzzy match or "no results, try manual entry"

## Testing Scenarios

✓ Search "Mumbai" returns Mumbai, India  
✓ Search "New" returns New York, Newark, New Delhi, etc.  
✓ Select a city → calendar updates with new location  
✓ Manual entry: valid lat/lon accepted, invalid rejected  
✓ Timezone matches city location  
✓ URL state reflects selected city (if bookmarking enabled)  
✓ Default location appears on first load  

## Definition of Done

✓ Users can search for cities by name  
✓ Typeahead returns relevant suggestions  
✓ Selecting a city auto-fills lat/lon/timezone  
✓ Calendar re-fetches data for new location  
✓ Manual entry available as fallback  
✓ UI clearly shows selected location
