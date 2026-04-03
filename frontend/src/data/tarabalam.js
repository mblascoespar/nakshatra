// Direct port of backend/services/tarabalam.py
// NOTE: activities now use human-friendly displayText from activityIndex.js

export const NAKSHATRAS = [
  { id:  1, name: "Ashwini",           ruler: "Ketu",    deity: "Ashwini Kumaras", qualities: "Swift, healing, new beginnings",              constellation_type: "Light / Swift",       activities: ["Education & general learning", "Gardening & landscaping", "Obtaining, repaying or giving a loan", "Luxury & material comforts", "Sales & commercial activities", "Sowing & planting seeds", "Spiritual activities & practices", "Sports & friendship", "Starting industries & enterprises", "Trade & commercial exchange", "Travel & journeys (avoid starting on Tuesday)"] },
  { id:  2, name: "Bharani",           ruler: "Venus",   deity: "Yama",            qualities: "Transformation, discipline, restraint",        constellation_type: "Fierce / Cruel",      activities: ["Setting fires – arson", "Deceit & deception", "Evil schemes & dark deeds", "Planting ghosts in people"] },
  { id:  3, name: "Krittika",          ruler: "Sun",     deity: "Agni",            qualities: "Sharp, purifying, decisive",                   constellation_type: "Mixed",               activities: ["Day-to-day activities & work", "Professional responsibilities & duties", "Routine duties & responsibilities"] },
  { id:  4, name: "Rohini",            ruler: "Moon",    deity: "Brahma",          qualities: "Fertile, creative, sensual",                   constellation_type: "Fixed / Permanent",   activities: ["Art & decoration", "Building & construction", "Careers & financial planning", "Installing deity & building temples", "Gardening & landscaping", "Laying foundations & establishing roots", "Long-term goals & permanent things", "Medical treatment & healing", "Music & musical arts", "Permanent & long-lasting matters", "Real estate & property dealings", "Relationships & interpersonal bonds", "Sex & pleasure"] },
  { id:  5, name: "Mrigashira",        ruler: "Mars",    deity: "Soma",            qualities: "Searching, curious, gentle",                   constellation_type: "Soft / Gentle",       activities: ["Art & decoration", "Buying home & real estate", "Marriage ceremonies & rituals", "Dance & performing arts", "Installing deity & building temples", "Laying foundations & establishing roots", "Marriage & matrimonial unions", "Medical treatment & healing", "Music & musical arts", "Sex & pleasure", "Travel & journeys (avoid starting on Tuesday)"] },
  { id:  6, name: "Ardra",             ruler: "Rahu",    deity: "Rudra",           qualities: "Turbulent, transformative, intense",           constellation_type: "Sharp / Dreadful",    activities: ["Creative expression & problem-solving", "Emotional healing & release", "Personal growth & self-transformation", "Release & purge emotions", "Research & investigation", "Self-development & spiritual exploration", "Surgery & surgical intervention", "Terminating employees & employment", "Terminating relationships"] },
  { id:  7, name: "Punarvasu",         ruler: "Jupiter", deity: "Aditi",           qualities: "Restoration, abundance, optimism",             constellation_type: "Temporary / Movable", activities: ["Buying home & real estate", "Installing deity & building temples", "Gardening & landscaping", "Learning astrology & divination", "Medical treatment & healing", "Processions & public gatherings", "Travel & journeys (avoid starting on Tuesday)", "Acquiring vehicles & transportation"] },
  { id:  8, name: "Pushya",            ruler: "Saturn",  deity: "Brihaspati",      qualities: "Nourishing, protective, prosperous",           constellation_type: "Light / Swift",       activities: ["Education & general learning", "Gardening & landscaping", "Obtaining, repaying or giving a loan", "Luxury & material comforts", "Medical treatment & healing", "Sales & commercial activities", "Spiritual activities & practices", "Sports & friendship", "Starting business & trade", "Trade & commercial exchange", "Travel & journeys (avoid starting on Tuesday)", "Studying Vedas & Shastras", "Making a will & testament"] },
  { id:  9, name: "Ashlesha",          ruler: "Mercury", deity: "Nagas",           qualities: "Penetrating, mystical, complex",               constellation_type: "Sharp / Dreadful",    activities: ["Breaking alliances & separations", "Buying home & real estate", "Destruction & transformation", "Invocation of spirits & entities", "Separations & ending ties", "Surgery & surgical intervention", "Tantric practices & incantations", "War & conflict"] },
  { id: 10, name: "Magha",             ruler: "Ketu",    deity: "Pitrs",           qualities: "Regal, ancestral, authoritative",              constellation_type: "Fierce / Cruel",      activities: ["Setting fires – arson", "Buying home & real estate", "Deceit & deception", "Evil schemes & dark deeds", "Gardening & landscaping", "Planting ghosts in people"] },
  { id: 11, name: "Purva Phalguni",    ruler: "Venus",   deity: "Bhaga",           qualities: "Creative, romantic, pleasure-seeking",         constellation_type: "Fierce / Cruel",      activities: ["Setting fires – arson", "Buying home & real estate", "Deceit & deception", "Evil schemes & dark deeds", "Learning dance & choreography", "Learning music & instruments", "Planting ghosts in people"] },
  { id: 12, name: "Uttara Phalguni",   ruler: "Sun",     deity: "Aryaman",         qualities: "Generous, social, fortunate",                  constellation_type: "Fixed / Permanent",   activities: ["Building & construction", "Careers & financial planning", "Installing deity & building temples", "Gardening & landscaping", "Laying foundations & establishing roots", "Marriage & matrimonial unions", "Permanent & long-lasting matters", "Relationships & interpersonal bonds"] },
  { id: 13, name: "Hasta",             ruler: "Moon",    deity: "Savitar",         qualities: "Skilled, resourceful, dexterous",              constellation_type: "Light / Swift",       activities: ["Art & decoration", "Learning astronomy", "Building & construction", "Installing deity & building temples", "Gardening & landscaping", "Obtaining, repaying or giving a loan", "Luxury & material comforts", "Marriage & matrimonial unions", "Medical treatment & healing", "Music & musical arts", "Pleasure & enjoyment", "Sales & commercial activities", "Sex & pleasure", "Spiritual activities & practices", "Sports & friendship", "Starting business & trade", "Travel & journeys (avoid starting on Tuesday)"] },
  { id: 14, name: "Chitra",            ruler: "Mars",    deity: "Vishvakarma",     qualities: "Artistic, bright, multi-talented",             constellation_type: "Soft / Gentle",       activities: ["Art & decoration", "Marriage ceremonies & rituals", "Dance & performing arts", "Gardening & landscaping", "Laying foundations & establishing roots", "Medical treatment & healing", "Music & musical arts", "Sex & pleasure"] },
  { id: 15, name: "Swati",             ruler: "Rahu",    deity: "Vayu",            qualities: "Independent, flexible, business-minded",       constellation_type: "Temporary / Movable", activities: ["Learning astronomy", "Installing deity & building temples", "Gardening & landscaping", "Marriage & matrimonial unions", "Medical treatment & healing", "Processions & public gatherings", "Travel & journeys (avoid starting on Tuesday)", "Studying Vedas & Shastras", "Acquiring vehicles & transportation"] },
  { id: 16, name: "Vishakha",          ruler: "Jupiter", deity: "Indra-Agni",      qualities: "Goal-oriented, ambitious, intense",            constellation_type: "Mixed",               activities: ["Buying home & real estate", "Day-to-day activities & work", "Professional responsibilities & duties", "Routine duties & responsibilities"] },
  { id: 17, name: "Anuradha",          ruler: "Saturn",  deity: "Mitra",           qualities: "Devoted, disciplined, friendly",               constellation_type: "Soft / Gentle",       activities: ["Art & decoration", "Marriage ceremonies & rituals", "Dance & performing arts", "Gardening & landscaping", "Marriage & matrimonial unions", "Medical treatment & healing", "Music & musical arts", "Sex & pleasure", "Travel & journeys (avoid starting on Tuesday)"] },
  { id: 18, name: "Jyeshtha",          ruler: "Mercury", deity: "Indra",           qualities: "Elder, protective, powerful",                  constellation_type: "Sharp / Dreadful",    activities: ["Breaking alliances & separations", "Destruction & transformation", "Invocation of spirits & entities", "Laying foundations & establishing roots", "Learning music & instruments", "Separations & ending ties", "Surgery & surgical intervention", "Tantric practices & incantations", "War & conflict"] },
  { id: 19, name: "Moola",             ruler: "Ketu",    deity: "Nirriti",         qualities: "Investigative, foundational, transformative",  constellation_type: "Sharp / Dreadful",    activities: ["Learning astronomy", "Breaking alliances & separations", "Buying home & real estate", "Destruction & transformation", "Gardening & landscaping", "Invocation of spirits & entities", "Separations & ending ties", "Surgery & surgical intervention", "Tantric practices & incantations", "Travel & journeys (avoid starting on Tuesday)", "War & conflict"] },
  { id: 20, name: "Purva Ashadha",     ruler: "Venus",   deity: "Apas",            qualities: "Invincible, proud, purifying",                 constellation_type: "Fierce / Cruel",      activities: ["Setting fires – arson", "Deceit & deception", "Evil schemes & dark deeds", "Planting ghosts in people"] },
  { id: 21, name: "Uttara Ashadha",    ruler: "Sun",     deity: "Vishvadevas",     qualities: "Universal, victorious, righteous",             constellation_type: "Fixed / Permanent",   activities: ["Building & construction", "Careers & financial planning", "Installing deity & building temples", "Gardening & landscaping", "Laying foundations & establishing roots", "Marriage & matrimonial unions", "Medical treatment & healing", "Music & musical arts", "Permanent & long-lasting matters", "Relationships & interpersonal bonds"] },
  { id: 22, name: "Shravana",          ruler: "Moon",    deity: "Vishnu",          qualities: "Listening, learning, preserving",              constellation_type: "Temporary / Movable", activities: ["Gardening & landscaping", "Laying foundations & establishing roots", "Medical treatment & healing", "Processions & public gatherings", "Travel & journeys (avoid starting on Tuesday)", "Studying Vedas & Shastras", "Acquiring vehicles & transportation"] },
  { id: 23, name: "Dhanishtha",        ruler: "Mars",    deity: "Ashta Vasus",     qualities: "Wealthy, musical, generous",                   constellation_type: "Temporary / Movable", activities: ["Gardening & landscaping", "Medical treatment & healing", "Music & musical arts", "Processions & public gatherings", "Studying medicine & medical education", "Travel & journeys (avoid starting on Tuesday)", "Acquiring vehicles & transportation"] },
  { id: 24, name: "Shatabhisha",       ruler: "Rahu",    deity: "Varuna",          qualities: "Healing, secretive, independent",              constellation_type: "Temporary / Movable", activities: ["Gardening & landscaping", "Medical treatment & healing", "Music & musical arts", "Processions & public gatherings", "Studying medicine & medical education", "Travel & journeys (avoid starting on Tuesday)", "Acquiring vehicles & transportation"] },
  { id: 25, name: "Purva Bhadrapada",  ruler: "Jupiter", deity: "Aja Ekapada",     qualities: "Fiery, transformative, passionate",            constellation_type: "Fierce / Cruel",      activities: ["Setting fires – arson", "Deceit & deception", "Evil schemes & dark deeds", "Planting ghosts in people"] },
  { id: 26, name: "Uttara Bhadrapada", ruler: "Saturn",  deity: "Ahir Budhanya",   qualities: "Wise, calm, prosperous",                       constellation_type: "Fixed / Permanent",   activities: ["Building & construction", "Careers & financial planning", "Installing deity & building temples", "Gardening & landscaping", "Marriage & matrimonial unions", "Medical treatment & healing", "Music & musical arts", "Permanent & long-lasting matters", "Relationships & interpersonal bonds"] },
  { id: 27, name: "Revati",            ruler: "Mercury", deity: "Pushan",          qualities: "Nourishing, protective, completion",           constellation_type: "Soft / Gentle",       activities: ["Art & decoration", "Learning astronomy", "Buying home & real estate", "Marriage ceremonies & rituals", "Dance & performing arts", "Gardening & landscaping", "Marriage & matrimonial unions", "Medical treatment & healing", "Music & musical arts", "Sex & pleasure", "Travel & journeys (avoid starting on Tuesday)"] },
]

// tara number (1-9) → metadata
export const TARAS = {
  1: { name: "Janma",        tier: "mixed",     meaning: "Birth star — personally significant, requires care" },
  2: { name: "Sampat",       tier: "very_good", meaning: "Wealth and prosperity" },
  3: { name: "Vipat",        tier: "poor",      meaning: "Danger and obstacles" },
  4: { name: "Kshema",       tier: "good",      meaning: "Well-being and security" },
  5: { name: "Pratyak",      tier: "poor",      meaning: "Opposition and enmity" },
  6: { name: "Sadhana",      tier: "very_good", meaning: "Achievement and accomplishment" },
  7: { name: "Naidhana",     tier: "very_bad",  meaning: "Danger and obstruction" },
  8: { name: "Mitra",        tier: "good",      meaning: "Friendship and alliance" },
  9: { name: "Parama Mitra", tier: "very_good", meaning: "Supreme friendship and support" },
}

const _nakshatraById = Object.fromEntries(NAKSHATRAS.map((n) => [n.id, n]))

export function nakshatraById(id) {
  return _nakshatraById[id]
}

/**
 * Returns the Tara object for a given day.
 * Port of backend/services/tarabalam.py::tara_for_day.
 *
 * Classic formula:
 *   count = ((dayNakId - birthNakId) mod 27) + 1   → 1..27
 *   tara  = ((count - 1) mod 9) + 1                → 1..9
 *
 * JS note: % can return negative for negative operands, so we use (x%27+27)%27.
 */
export function taraForDay(birthNakshatraId, dayNakshatraId) {
  const count = ((dayNakshatraId - birthNakshatraId) % 27 + 27) % 27 + 1
  const taraNumber = ((count - 1) % 9) + 1
  return { number: taraNumber, ...TARAS[taraNumber] }
}

const _SHUKLA = ["Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami",
                  "Shashthi","Saptami","Ashtami","Navami","Dashami",
                  "Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima"]
const _KRISHNA = ["Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami",
                   "Shashthi","Saptami","Ashtami","Navami","Dashami",
                   "Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Amavasya"]

/** tithi_index is 0-29 (as stored in JSON). */
export function tithiInfo(tithiIndex) {
  if (tithiIndex < 15) {
    return { number: tithiIndex + 1, name: _SHUKLA[tithiIndex], paksha: "Shukla" }
  }
  const k = tithiIndex - 15
  return { number: k + 1, name: _KRISHNA[k], paksha: "Krishna" }
}
