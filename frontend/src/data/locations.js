// Canonical city list. Single source of truth for both the UI picker and
// export_json.py (which mirrors this list to compute sunrise nakshatras).

export const LOCATIONS = [
  { group: 'India',
    cities: [
      { label: 'Mumbai',        lat:  19.08, lon:  72.88, tz: 'Asia/Kolkata' },
      { label: 'Delhi',         lat:  28.67, lon:  77.22, tz: 'Asia/Kolkata' },
      { label: 'Bangalore',     lat:  12.97, lon:  77.59, tz: 'Asia/Kolkata' },
      { label: 'Chennai',       lat:  13.08, lon:  80.27, tz: 'Asia/Kolkata' },
      { label: 'Hyderabad',     lat:  17.38, lon:  78.48, tz: 'Asia/Kolkata' },
      { label: 'Kolkata',       lat:  22.57, lon:  88.37, tz: 'Asia/Kolkata' },
      { label: 'Pune',          lat:  18.52, lon:  73.86, tz: 'Asia/Kolkata' },
      { label: 'Ahmedabad',     lat:  23.03, lon:  72.58, tz: 'Asia/Kolkata' },
      { label: 'Jaipur',        lat:  26.92, lon:  75.82, tz: 'Asia/Kolkata' },
      { label: 'Kochi',         lat:   9.93, lon:  76.27, tz: 'Asia/Kolkata' },
      { label: 'Varanasi',      lat:  25.32, lon:  82.97, tz: 'Asia/Kolkata' },
      { label: 'Nagpur',        lat:  21.15, lon:  79.09, tz: 'Asia/Kolkata' },
    ],
  },
  { group: 'South Asia',
    cities: [
      { label: 'Colombo',       lat:   6.93, lon:  79.85, tz: 'Asia/Colombo' },
      { label: 'Kathmandu',     lat:  27.71, lon:  85.31, tz: 'Asia/Kathmandu' },
      { label: 'Dhaka',         lat:  23.72, lon:  90.41, tz: 'Asia/Dhaka' },
    ],
  },
  { group: 'Middle East',
    cities: [
      { label: 'Dubai',         lat:  25.20, lon:  55.27, tz: 'Asia/Dubai' },
      { label: 'Abu Dhabi',     lat:  24.45, lon:  54.37, tz: 'Asia/Dubai' },
      { label: 'Muscat',        lat:  23.59, lon:  58.41, tz: 'Asia/Muscat' },
      { label: 'Kuwait City',   lat:  29.37, lon:  47.98, tz: 'Asia/Kuwait' },
    ],
  },
  { group: 'East Africa',
    cities: [
      { label: 'Nairobi',       lat:  -1.29, lon:  36.82, tz: 'Africa/Nairobi' },
      { label: 'Mombasa',       lat:  -4.05, lon:  39.67, tz: 'Africa/Nairobi' },
    ],
  },
  { group: 'South Africa',
    cities: [
      { label: 'Johannesburg',  lat: -26.20, lon:  28.04, tz: 'Africa/Johannesburg' },
      { label: 'Durban',        lat: -29.86, lon:  31.02, tz: 'Africa/Johannesburg' },
    ],
  },
  { group: 'Europe',
    cities: [
      { label: 'London',        lat:  51.51, lon:  -0.13, tz: 'Europe/London' },
      { label: 'Birmingham',    lat:  52.48, lon:  -1.90, tz: 'Europe/London' },
      { label: 'Leicester',     lat:  52.64, lon:  -1.13, tz: 'Europe/London' },
      { label: 'Amsterdam',     lat:  52.37, lon:   4.90, tz: 'Europe/Amsterdam' },
      { label: 'Frankfurt',     lat:  50.11, lon:   8.68, tz: 'Europe/Berlin' },
      { label: 'Zurich',        lat:  47.38, lon:   8.54, tz: 'Europe/Zurich' },
    ],
  },
  { group: 'North America',
    cities: [
      { label: 'New York',      lat:  40.71, lon: -74.01, tz: 'America/New_York' },
      { label: 'Chicago',       lat:  41.88, lon: -87.63, tz: 'America/Chicago' },
      { label: 'Houston',       lat:  29.76, lon: -95.37, tz: 'America/Chicago' },
      { label: 'Dallas',        lat:  32.78, lon: -96.80, tz: 'America/Chicago' },
      { label: 'Los Angeles',   lat:  34.05, lon:-118.24, tz: 'America/Los_Angeles' },
      { label: 'San Francisco', lat:  37.77, lon:-122.42, tz: 'America/Los_Angeles' },
      { label: 'Seattle',       lat:  47.61, lon:-122.33, tz: 'America/Los_Angeles' },
      { label: 'Atlanta',       lat:  33.75, lon: -84.39, tz: 'America/New_York' },
      { label: 'Toronto',       lat:  43.65, lon: -79.38, tz: 'America/Toronto' },
      { label: 'Vancouver',     lat:  49.25, lon:-123.12, tz: 'America/Vancouver' },
    ],
  },
  { group: 'Australia & New Zealand',
    cities: [
      { label: 'Sydney',        lat: -33.87, lon: 151.21, tz: 'Australia/Sydney' },
      { label: 'Melbourne',     lat: -37.81, lon: 144.96, tz: 'Australia/Melbourne' },
      { label: 'Brisbane',      lat: -27.47, lon: 153.02, tz: 'Australia/Brisbane' },
      { label: 'Perth',         lat: -31.95, lon: 115.86, tz: 'Australia/Perth' },
      { label: 'Auckland',      lat: -36.87, lon: 174.77, tz: 'Pacific/Auckland' },
    ],
  },
  { group: 'Southeast Asia',
    cities: [
      { label: 'Singapore',     lat:   1.35, lon: 103.82, tz: 'Asia/Singapore' },
      { label: 'Kuala Lumpur',  lat:   3.14, lon: 101.69, tz: 'Asia/Kuala_Lumpur' },
    ],
  },
]

export const ALL_CITIES = LOCATIONS.flatMap((g) => g.cities)

export const DEFAULT_CITY = ALL_CITIES.find((c) => c.label === 'Mumbai')
