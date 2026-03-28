// Direct port of backend/services/tarabalam.py

export const NAKSHATRAS = [
  { id:  1, name: "Ashwini",           ruler: "Ketu",    deity: "Ashwini Kumaras", qualities: "Swift, healing, new beginnings",              constellation_type: "Light / Swift",       activities: ["Starting a business or industry","Sales & trade","Obtaining or repaying loans","Luxury, arts & decorations","Sex & pleasure","Sports & friendship","Spiritual activities","Travel (avoid Tuesdays)","Education & astrology","Gardening & sowing","Medical treatment"] },
  { id:  2, name: "Bharani",           ruler: "Venus",   deity: "Yama",            qualities: "Transformation, discipline, restraint",        constellation_type: "Fierce / Cruel",      activities: ["Tap inner strength to achieve goals","Express creativity & leadership","Pursue passions responsibly","Harness transformative power for positive impact"] },
  { id:  3, name: "Krittika",          ruler: "Sun",     deity: "Agni",            qualities: "Sharp, purifying, decisive",                   constellation_type: "Mixed",               activities: ["Routine duties & professional responsibilities","Day-to-day activities","Fire ceremonies (deity Agni)"] },
  { id:  4, name: "Rohini",            ruler: "Moon",    deity: "Brahma",          qualities: "Fertile, creative, sensual",                   constellation_type: "Fixed / Permanent",   activities: ["Laying foundations & long-term goals","Buying real estate, homes & land","Building & construction","Installing a deity / building a temple","Careers & financial planning","Relationships & marriage","Art & auspicious deeds","Learning music or dance","Gardening & sowing","Medical treatment"] },
  { id:  5, name: "Mrigashira",        ruler: "Mars",    deity: "Soma",            qualities: "Searching, curious, gentle",                   constellation_type: "Soft / Gentle",       activities: ["Buying a home","Laying foundations","Installing a deity / building a temple","Marriage & ceremonies","Art, dance & music","Sex & romance","Medical treatment","Travel (avoid Tuesdays)"] },
  { id:  6, name: "Ardra",             ruler: "Rahu",    deity: "Rudra",           qualities: "Turbulent, transformative, intense",           constellation_type: "Sharp / Dreadful",    activities: ["Emotional healing & releasing negative emotions","Ending unhealthy relationships or situations","Personal growth & transformation","Creative expression & problem-solving","Research & innovation","Self-development & spiritual exploration","Surgical treatment*"] },
  { id:  7, name: "Punarvasu",         ruler: "Jupiter", deity: "Aditi",           qualities: "Restoration, abundance, optimism",             constellation_type: "Temporary / Movable", activities: ["Buying a home","Acquiring vehicles","Gardening & landscaping","Travel (avoid Tuesdays)","Installing a deity / building a temple","Learning astrology or astronomy","Medical treatment"] },
  { id:  8, name: "Pushya",            ruler: "Saturn",  deity: "Brihaspati",      qualities: "Nourishing, protective, prosperous",           constellation_type: "Light / Swift",       activities: ["Starting a business or industry","Sales & trade","Obtaining or repaying loans","Luxury, arts & decorations","Sex & pleasure","Sports & friendship","Spiritual activities","Travel (avoid Tuesdays)","Education & astrology","Gardening & sowing","Medical treatment","Studying Vedas or Shastras","Making a will"] },
  { id:  9, name: "Ashlesha",          ruler: "Mercury", deity: "Nagas",           qualities: "Penetrating, mystical, complex",               constellation_type: "Sharp / Dreadful",    activities: ["Buying a home","Ending unhealthy relationships or situations","Personal transformation","Surgical treatment*"] },
  { id: 10, name: "Magha",             ruler: "Ketu",    deity: "Pitrs",           qualities: "Regal, ancestral, authoritative",              constellation_type: "Fierce / Cruel",      activities: ["Buying a home","Gardening & sowing","Tap inner strength to achieve goals","Express creativity & leadership","Harness transformative power for positive impact"] },
  { id: 11, name: "Purva Phalguni",    ruler: "Venus",   deity: "Bhaga",           qualities: "Creative, romantic, pleasure-seeking",         constellation_type: "Fierce / Cruel",      activities: ["Buying a home","Learning music or dance","Tap inner strength to achieve goals","Express creativity & leadership","Harness transformative power for positive impact"] },
  { id: 12, name: "Uttara Phalguni",   ruler: "Sun",     deity: "Aryaman",         qualities: "Generous, social, fortunate",                  constellation_type: "Fixed / Permanent",   activities: ["Permanent goals & laying foundations","Marriage","Building & construction","Installing a deity / building a temple","Careers & relationships","Gardening & sowing"] },
  { id: 13, name: "Hasta",             ruler: "Moon",    deity: "Savitar",         qualities: "Skilled, resourceful, dexterous",              constellation_type: "Light / Swift",       activities: ["Starting a business, sales & trade","Obtaining or repaying loans","Marriage","Laying foundations","Installing a deity / building a temple","Pleasure, luxury & sex","Sports & friendship","Spiritual activities & healing","Travel (avoid Tuesdays)","Learning astrology & music","Gardening & sowing","Medical treatment"] },
  { id: 14, name: "Chitra",            ruler: "Mars",    deity: "Vishvakarma",     qualities: "Artistic, bright, multi-talented",             constellation_type: "Soft / Gentle",       activities: ["Art, dance & music","Sex & ceremonies","Laying foundations of a home","Gardening & sowing","Medical treatment"] },
  { id: 15, name: "Swati",             ruler: "Rahu",    deity: "Vayu",            qualities: "Independent, flexible, business-minded",       constellation_type: "Temporary / Movable", activities: ["Marriage","Acquiring vehicles","Installing a deity / building a temple","Gardening & sowing","Travel (avoid Tuesdays)","Learning astrology or astronomy","Medical treatment","Studying Vedas or Shastras"] },
  { id: 16, name: "Vishakha",          ruler: "Jupiter", deity: "Indra-Agni",      qualities: "Goal-oriented, ambitious, intense",            constellation_type: "Mixed",               activities: ["Buying a home","Routine duties & professional responsibilities","Day-to-day activities"] },
  { id: 17, name: "Anuradha",          ruler: "Saturn",  deity: "Mitra",           qualities: "Devoted, disciplined, friendly",               constellation_type: "Soft / Gentle",       activities: ["Marriage","Art, dance & music","Learning music or dance","Sex & ceremonies","Gardening & sowing","Medical treatment","Travel (avoid Tuesdays)"] },
  { id: 18, name: "Jyeshtha",          ruler: "Mercury", deity: "Indra",           qualities: "Elder, protective, powerful",                  constellation_type: "Sharp / Dreadful",    activities: ["Laying foundations of a home","Learning music or dance","Ending unhealthy relationships or situations","Personal transformation","Surgical treatment*"] },
  { id: 19, name: "Moola",             ruler: "Ketu",    deity: "Nirriti",         qualities: "Investigative, foundational, transformative",  constellation_type: "Sharp / Dreadful",    activities: ["Buying a home","Learning astrology or astronomy","Gardening & sowing","Travel (avoid Tuesdays)","Personal transformation","Surgical treatment*"] },
  { id: 20, name: "Purva Ashadha",     ruler: "Venus",   deity: "Apas",            qualities: "Invincible, proud, purifying",                 constellation_type: "Fierce / Cruel",      activities: ["Tap inner strength to achieve goals","Express creativity & leadership","Pursue passions responsibly","Harness transformative power for positive impact"] },
  { id: 21, name: "Uttara Ashadha",    ruler: "Sun",     deity: "Vishvadevas",     qualities: "Universal, victorious, righteous",             constellation_type: "Fixed / Permanent",   activities: ["Permanent goals & laying foundations","Marriage","Building & construction","Installing a deity / building a temple","Careers & relationships","Learning music or dance","Gardening & sowing","Medical treatment"] },
  { id: 22, name: "Shravana",          ruler: "Moon",    deity: "Vishnu",          qualities: "Listening, learning, preserving",              constellation_type: "Temporary / Movable", activities: ["Acquiring vehicles","Gardening","Travel (avoid Tuesdays)","Laying foundations","Medical treatment","Studying Vedas or Shastras"] },
  { id: 23, name: "Dhanishtha",        ruler: "Mars",    deity: "Ashta Vasus",     qualities: "Wealthy, musical, generous",                   constellation_type: "Temporary / Movable", activities: ["Acquiring vehicles","Gardening","Travel (avoid Tuesdays)","Learning music or dance","Medical treatment","Studying medicine"] },
  { id: 24, name: "Shatabhisha",       ruler: "Rahu",    deity: "Varuna",          qualities: "Healing, secretive, independent",              constellation_type: "Temporary / Movable", activities: ["Acquiring vehicles","Gardening","Travel (avoid Tuesdays)","Learning music or dance","Medical treatment","Studying medicine"] },
  { id: 25, name: "Purva Bhadrapada",  ruler: "Jupiter", deity: "Aja Ekapada",     qualities: "Fiery, transformative, passionate",            constellation_type: "Fierce / Cruel",      activities: ["Tap inner strength to achieve goals","Express creativity & leadership","Pursue passions responsibly","Harness transformative power for positive impact"] },
  { id: 26, name: "Uttara Bhadrapada", ruler: "Saturn",  deity: "Ahir Budhanya",   qualities: "Wise, calm, prosperous",                       constellation_type: "Fixed / Permanent",   activities: ["Permanent goals & laying foundations","Marriage","Building & construction","Installing a deity / building a temple","Careers & relationships","Learning music or dance","Medical treatment"] },
  { id: 27, name: "Revati",            ruler: "Mercury", deity: "Pushan",          qualities: "Nourishing, protective, completion",           constellation_type: "Soft / Gentle",       activities: ["Buying a home","Marriage (first 3 padas)","Art, dance & music","Sex & ceremonies","Learning astrology or astronomy","Learning music or dance","Gardening & sowing","Medical treatment","Travel (avoid Tuesdays)"] },
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
