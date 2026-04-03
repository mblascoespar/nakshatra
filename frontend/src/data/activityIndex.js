/**
 * Activity Index - Normalized Activities Database
 *
 * Master list of 64 normalized activities extracted from all 27 nakshatras.
 * Structured for fast client-side search (Design Doc 3).
 *
 * Structure:
 * - ACTIVITIES: master list with metadata
 * - ACTIVITY_TO_NAKSHATRAS: reverse lookup (activityId → nakshatraIds)
 * - ACTIVITIES_SEARCHABLE: optimized for fuzzy/partial matching
 * - ACTIVITY_CATEGORIES: grouping for UI dropdown
 */

/**
 * Master Activity List (64 total)
 * Each entry has: id, name (normalized for search), displayText (human-friendly for UI/PDF), category
 */
export const ACTIVITIES = [
  { id: 1, name: "Art", displayText: "Art & decoration", category: "Creative" },
  { id: 2, name: "Arson", displayText: "Setting fires – arson", category: "Ritual/Tantric" },
  { id: 3, name: "Astronomy", displayText: "Learning astronomy", category: "Learning" },
  { id: 4, name: "Breaking alliances", displayText: "Breaking alliances & separations", category: "Conflict" },
  { id: 5, name: "Building", displayText: "Building & construction", category: "Property" },
  { id: 6, name: "Buying home", displayText: "Buying home & real estate", category: "Property" },
  { id: 7, name: "Careers", displayText: "Careers & financial planning", category: "Professional" },
  { id: 8, name: "Ceremonies", displayText: "Marriage ceremonies & rituals", category: "Spiritual" },
  { id: 9, name: "Creativity", displayText: "Creative expression & problem-solving", category: "Creative" },
  { id: 10, name: "Dance", displayText: "Dance & performing arts", category: "Creative" },
  { id: 11, name: "Day-to-day works", displayText: "Day-to-day activities & work", category: "Daily" },
  { id: 12, name: "Deceit", displayText: "Deceit & deception", category: "Ritual/Tantric" },
  { id: 13, name: "Deity", displayText: "Installing deity & building temples", category: "Spiritual" },
  { id: 14, name: "Destruction", displayText: "Destruction & transformation", category: "Conflict" },
  { id: 15, name: "Education", displayText: "Education & general learning", category: "Learning" },
  { id: 16, name: "Emotional healing", displayText: "Emotional healing & release", category: "Healing" },
  { id: 17, name: "Evil schemes", displayText: "Evil schemes & dark deeds", category: "Ritual/Tantric" },
  { id: 18, name: "Gardening", displayText: "Gardening & landscaping", category: "Agriculture" },
  { id: 19, name: "Invocation of spirits", displayText: "Invocation of spirits & entities", category: "Ritual/Tantric" },
  { id: 20, name: "Laying foundations", displayText: "Laying foundations & establishing roots", category: "Property" },
  { id: 21, name: "Learning astrology", displayText: "Learning astrology & divination", category: "Learning" },
  { id: 22, name: "Learning dance", displayText: "Learning dance & choreography", category: "Learning" },
  { id: 23, name: "Learning music", displayText: "Learning music & instruments", category: "Learning" },
  { id: 24, name: "Long-term goals", displayText: "Long-term goals & permanent things", category: "Goals" },
  { id: 25, name: "Luxury", displayText: "Luxury & material comforts", category: "Leisure" },
  { id: 26, name: "Marriage", displayText: "Marriage & matrimonial unions", category: "Life Events" },
  { id: 27, name: "Medical", displayText: "Medical treatment & healing", category: "Health" },
  { id: 28, name: "Music", displayText: "Music & musical arts", category: "Creative" },
  { id: 29, name: "Personal growth", displayText: "Personal growth & self-transformation", category: "Spiritual" },
  { id: 30, name: "Permanent things", displayText: "Permanent & long-lasting matters", category: "Goals" },
  { id: 31, name: "Planting ghosts", displayText: "Planting ghosts in people", category: "Ritual/Tantric" },
  { id: 32, name: "Pleasure", displayText: "Pleasure & enjoyment", category: "Leisure" },
  { id: 33, name: "Procession", displayText: "Processions & public gatherings", category: "Social" },
  { id: 34, name: "Professional responsibilities", displayText: "Professional responsibilities & duties", category: "Professional" },
  { id: 35, name: "Real estate", displayText: "Real estate & property dealings", category: "Property" },
  { id: 36, name: "Release emotions", displayText: "Release & purge emotions", category: "Healing" },
  { id: 37, name: "Research", displayText: "Research & investigation", category: "Creative" },
  { id: 38, name: "Relationships", displayText: "Relationships & interpersonal bonds", category: "Life Events" },
  { id: 39, name: "Routine duties", displayText: "Routine duties & responsibilities", category: "Daily" },
  { id: 40, name: "Sales", displayText: "Sales & commercial activities", category: "Business" },
  { id: 41, name: "Self-development", displayText: "Self-development & spiritual exploration", category: "Spiritual" },
  { id: 42, name: "Separations", displayText: "Separations & ending ties", category: "Conflict" },
  { id: 43, name: "Sex", displayText: "Sex & pleasure", category: "Leisure" },
  { id: 44, name: "Sowing", displayText: "Sowing & planting seeds", category: "Agriculture" },
  { id: 45, name: "Spiritual", displayText: "Spiritual activities & practices", category: "Spiritual" },
  { id: 46, name: "Sports", displayText: "Sports & friendship", category: "Recreation" },
  { id: 47, name: "Starting business", displayText: "Starting business & trade", category: "Business" },
  { id: 48, name: "Starting industries", displayText: "Starting industries & enterprises", category: "Business" },
  { id: 49, name: "Studying medicine", displayText: "Studying medicine & medical education", category: "Learning" },
  { id: 50, name: "Surgery", displayText: "Surgery & surgical intervention", category: "Health" },
  { id: 51, name: "Tantric", displayText: "Tantric practices & incantations", category: "Ritual/Tantric" },
  { id: 52, name: "Terminate employee", displayText: "Terminating employees & employment", category: "Conflict" },
  { id: 53, name: "Terminate relationship", displayText: "Terminating relationships", category: "Conflict" },
  { id: 54, name: "Trade", displayText: "Trade & commercial exchange", category: "Business" },
  { id: 55, name: "Travel", displayText: "Travel & journeys (avoid starting on Tuesday)", category: "Travel" },
  { id: 56, name: "Vedas", displayText: "Studying Vedas & Shastras", category: "Learning" },
  { id: 57, name: "Vehicles", displayText: "Acquiring vehicles & transportation", category: "Travel" },
  { id: 58, name: "War", displayText: "War & conflict", category: "Conflict" },
  { id: 59, name: "Will", displayText: "Making a will & testament", category: "Legal" },
  { id: 60, name: "Loans", displayText: "Obtaining, repaying or giving a loan", category: "Finance" },
];

/**
 * Reverse Lookup: Activity ID → Nakshatra IDs
 *
 * For each activity, which nakshatras have it?
 * Use this for: search results filtering
 */
export const ACTIVITY_TO_NAKSHATRAS = {
  1: [4, 5, 13, 14, 17, 27], // Art
  2: [2, 10, 11, 20, 25], // Arson
  3: [8, 13, 15, 19, 27], // Astronomy
  4: [9, 18, 19], // Breaking alliances
  5: [4, 12, 21, 26], // Building
  6: [5, 7, 9, 10, 11, 16, 19, 27], // Buying home
  7: [4, 12, 21, 26], // Careers
  8: [5, 14, 17, 27], // Ceremonies
  9: [6], // Creativity
  10: [5, 14, 17, 27], // Dance
  11: [3, 16], // Day-to-day works
  12: [2, 10, 11, 20, 25], // Deceit
  13: [4, 5, 7, 12, 13, 15, 21, 26], // Deity
  14: [9, 18, 19], // Destruction
  15: [1, 8], // Education
  16: [6], // Emotional healing
  17: [2, 10, 11, 20, 25], // Evil schemes
  18: [1, 4, 7, 10, 12, 13, 15, 19, 22, 23, 24, 27], // Gardening
  19: [9, 18, 19], // Invocation of spirits
  20: [4, 5, 12, 13, 14, 18, 22], // Laying foundations
  21: [7], // Learning astrology
  22: [11], // Learning dance
  23: [11, 18], // Learning music
  24: [4], // Long-term goals
  25: [1, 8, 13], // Luxury
  26: [5, 12, 13, 15, 17, 21, 26, 27], // Marriage
  27: [1, 4, 5, 7, 8, 13, 14, 15, 17, 22, 23, 24, 26, 27], // Medical
  28: [4, 13, 14, 17, 21, 23, 24, 26, 27], // Music
  29: [6], // Personal growth
  30: [4, 12, 21, 26], // Permanent things
  31: [2, 10, 11, 20, 25], // Planting ghosts
  32: [13], // Pleasure
  33: [7, 15, 22, 23, 24], // Procession
  34: [3, 16], // Professional responsibilities
  35: [4], // Real estate
  36: [6], // Release emotions
  37: [6], // Research
  38: [4, 12, 21, 26], // Relationships
  39: [3, 16], // Routine duties
  40: [1, 8, 13], // Sales
  41: [6], // Self-development
  42: [9, 18, 19], // Separations
  43: [1, 4, 5, 8, 13, 14, 17, 27], // Sex
  44: [1], // Sowing
  45: [1, 8, 13], // Spiritual
  46: [1, 8, 13], // Sports
  47: [8, 13], // Starting business
  48: [1], // Starting industries
  49: [23, 24], // Studying medicine
  50: [6, 9, 18, 19], // Surgery
  51: [9, 18, 19], // Tantric
  52: [6], // Terminate employee
  53: [6], // Terminate relationship
  54: [1, 8, 13], // Trade
  55: [1, 5, 7, 15, 17, 19, 22, 23, 24, 27], // Travel
  56: [8, 15, 22], // Vedas
  57: [7, 15, 22, 23, 24], // Vehicles
  58: [9, 18, 19], // War
  59: [8], // Will
  60: [1, 8, 13], // Loans
};

/**
 * Searchable Index
 *
 * Optimized for fuzzy/partial matching and typeahead.
 * Each entry maps to the master ACTIVITIES list by ID.
 */
export const ACTIVITIES_SEARCHABLE = ACTIVITIES.map((activity) => ({
  id: activity.id,
  name: activity.name,
  category: activity.category,
  searchText: activity.name.toLowerCase(),
}));

/**
 * Activity Categories for UI Grouping
 *
 * Groups activities by semantic category for dropdown menus.
 */
export const ACTIVITY_CATEGORIES = {
  "Business & Commerce": [40, 47, 48, 54, 60], // Sales, Starting business, Starting industries, Trade, Loans
  "Life Events": [26, 38], // Marriage, Relationships
  "Property & Real Estate": [5, 6, 20, 35], // Building, Buying home, Laying foundations, Real estate
  "Professional Work": [7, 34, 39, 11], // Careers, Professional responsibilities, Routine duties, Day-to-day works
  "Creative Arts": [1, 9, 10, 28, 37], // Art, Creativity, Dance, Music, Research
  "Spiritual & Ritual": [8, 13, 15, 21, 22, 23, 45, 49, 51, 56], // Ceremonies, Deity, Education, Learning astrology, Learning dance, Learning music, Spiritual, Studying medicine, Tantric, Vedas
  "Health & Medicine": [27, 50, 16, 36, 41], // Medical, Surgery, Emotional healing, Release emotions, Self-development
  "Travel & Transport": [55, 57], // Travel, Vehicles
  "Agriculture & Nature": [18, 44], // Gardening, Sowing
  "Recreation & Leisure": [25, 32, 43, 46], // Luxury, Pleasure, Sex, Sports
  "Social & Gatherings": [33], // Procession
  "Conflict & Transformation": [2, 4, 12, 14, 17, 19, 31, 42, 51, 52, 53, 58], // Arson, Breaking alliances, Deceit, Destruction, Evil schemes, Invocation of spirits, Planting ghosts, Separations, Tantric, Terminate employee, Terminate relationship, War
  "Goals & Planning": [24, 30], // Long-term goals, Permanent things
  "Legal": [59], // Will
};

/**
 * Get activity by ID
 * @param {number} activityId
 * @returns {Object|null} Activity or null if not found
 */
export function getActivityById(activityId) {
  return ACTIVITIES.find((a) => a.id === activityId) || null;
}

/**
 * Get nakshatras that have a specific activity
 * @param {number} activityId
 * @returns {number[]} Array of nakshatra IDs
 */
export function getNakshatrasForActivity(activityId) {
  return ACTIVITY_TO_NAKSHATRAS[activityId] || [];
}

/**
 * Find activities by partial/fuzzy match
 * @param {string} query - User search input
 * @returns {Object[]} Matching activities with scores
 */
export function searchActivities(query) {
  if (!query || query.trim() === "") {
    return ACTIVITIES;
  }

  const lowerQuery = query.toLowerCase().trim();

  // Exact match first
  const exact = ACTIVITIES.filter(
    (a) => a.name.toLowerCase() === lowerQuery
  );
  if (exact.length > 0) return exact;

  // Partial match (includes)
  const partial = ACTIVITIES.filter((a) =>
    a.name.toLowerCase().includes(lowerQuery)
  );
  if (partial.length > 0) return partial;

  // Fuzzy match (starts with any word in the activity name)
  const fuzzy = ACTIVITIES.filter((a) => {
    const words = a.name.toLowerCase().split(/\s+/);
    return words.some((word) => word.startsWith(lowerQuery));
  });

  return fuzzy;
}

/**
 * Get activities grouped by category
 * @returns {Object} { categoryName: [activities] }
 */
export function getActivitiesByCategory() {
  const grouped = {};

  Object.entries(ACTIVITY_CATEGORIES).forEach(([category, activityIds]) => {
    grouped[category] = activityIds
      .map((id) => getActivityById(id))
      .filter(Boolean);
  });

  return grouped;
}

/**
 * Get common activities (appear in 5+ nakshatras)
 * Useful for typeahead suggestions
 * @returns {Object[]} Top activities by frequency
 */
export function getCommonActivities() {
  return ACTIVITIES.filter((activity) => {
    const count = getNakshatrasForActivity(activity.id).length;
    return count >= 5;
  }).sort((a, b) => {
    const countA = getNakshatrasForActivity(a.id).length;
    const countB = getNakshatrasForActivity(b.id).length;
    return countB - countA;
  });
}

export default {
  ACTIVITIES,
  ACTIVITY_TO_NAKSHATRAS,
  ACTIVITIES_SEARCHABLE,
  ACTIVITY_CATEGORIES,
  getActivityById,
  getNakshatrasForActivity,
  searchActivities,
  getActivitiesByCategory,
  getCommonActivities,
};
