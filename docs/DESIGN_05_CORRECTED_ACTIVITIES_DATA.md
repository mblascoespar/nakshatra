# Design Doc 5: Corrected Nakshatra Activities Data

## Objective
Replace the hallucinated activities in the codebase with authoritative data from the user's reference source.

## Current State

The file `frontend/src/data/tarabalam.js` contains activities that do NOT match the authoritative source. Example:

```javascript
// CURRENT (WRONG)
{ id: 2, name: "Bharani", activities: ["Tap inner strength...", "Express creativity..."] }

// AUTHORITATIVE (CORRECT)
{ id: 2, name: "Bharani", activities: ["Evil schemes & deeds", "Planting ghosts in people", "Deceit", "Setting fires – arson"] }
```

This is a data migration task: replace all 27 nakshatra activity lists with the correct ones.

## Proposed State

Update `frontend/src/data/tarabalam.js` with the complete, authoritative nakshatra data including:
- Correct activity lists (27 entries from user source)
- Constellation type (Light/Swift, Fierce/Cruel, Mixed, Dreadful, Soft/Gentle, Fixed, Temporary)

## Data Structure (Updated)

```javascript
export const NAKSHATRAS = [
  {
    id: 1,
    name: "Ashwini",
    ruler: "Ketu",
    deity: "Ashwini Kumaras",
    constellation_type: "Light or Swift",
    activities: [
      "Starting industries, opening a business, sales, trade",
      "Obtaining, repaying or giving a loan",
      "Luxury, arts, decorations",
      "Sex & pleasure",
      "Sports, Friendship",
      "Spiritual Activities",
      "Travel (avoid starting on Tuesday)",
      "Education, learning Astrology or Astronomy",
      "Gardening, planting & sowing",
      "Medical treatment"
    ]
  },
  {
    id: 2,
    name: "Bharani",
    ruler: "Venus",
    deity: "Yama",
    constellation_type: "Fierce or Cruel",
    activities: [
      "Evil schemes & deeds",
      "Planting ghosts in people",
      "Deceit",
      "Setting fires – arson"
    ]
  },
  // ... all 27 entries with correct activities
]
```

## Migration Map

The user has provided the authoritative source with this structure:

| Nakshatra # | Name | Constellation Type | Activities (from user source) |
|---|---|---|---|
| 1 | Ashwini | Light/Swift | Starting industries, sales, trade, loans, luxury, sex, sports, spiritual, travel, education, gardening, medical |
| 2 | Bharani | Fierce/Cruel | Evil schemes, planting ghosts, deceit, arson |
| 3 | Krittika | Mixed | Routine duties, professional responsibilities, day-to-day works |
| 4 | Rohini | Fixed/Permanent | Permanent things, long-term goals, laying foundations, building, real estate, deity, careers, relationships, art, music, gardening, medical |
| 5 | Mrigashirsha | Soft/Gentle | Buying home, laying foundations, deity, marriage, ceremonies, art, dance, music, sex, medical, travel |
| 6 | Ardra | Dreadful | Emotional healing, release emotions, terminate employee/relationship, personal growth, creativity, research, self-development, surgery |
| 7 | Punarvasu | Temporary/Movable | Buying home, vehicles, procession, gardening, travel, deity, learning astrology, medical |
| 8 | Pushya | Light/Swift | Starting business, sales, trade, loans, luxury, sex, sports, spiritual, travel, education, astronomy, gardening, medical, vedas, will |
| 9 | Ashlesha | Dreadful | Buying home, invocation of spirits, tantric, destruction, war, breaking alliances, separations, surgery |
| 10 | Magha | Fierce/Cruel | Buying home, gardening, evil schemes, planting ghosts, deceit, arson |
| 11 | Purva Phalguni | Fierce/Cruel | Buying home, learning music/dance, evil schemes, planting ghosts, deceit, arson |
| 12 | Uttara Phalguni | Fixed/Permanent | Permanent things, marriage, laying foundations, building, deity, careers, relationships, gardening |
| 13 | Hasta | Light/Swift | Starting business, sales, trade, loans, marriage, laying foundations, deity, pleasure, luxury, sex, sports, spiritual, travel, astronomy, music, gardening, medical |
| 14 | Chitra | Soft/Gentle | Art, dance, music, sex, ceremonies, laying foundations, gardening, medical |
| 15 | Swati | Temporary/Movable | Marriage, vehicles, deity, procession, gardening, travel, astronomy, medical, vedas |
| 16 | Vishaka | Mixed | Buying home, routine duties, professional responsibilities, day-to-day works |
| 17 | Anuradha | Soft/Gentle | Marriage, art, dance, music, sex, ceremonies, gardening, medical, travel |
| 18 | Jyeshta | Dreadful | Laying foundations, learning music, invocation of spirits, tantric, destruction, war, breaking alliances, separations, surgery |
| 19 | Moola | Dreadful | Buying home, invocation of spirits, tantric, destruction, war, breaking alliances, separations, astronomy, gardening, surgery, travel |
| 20 | Purva Ashadha | Fierce/Cruel | Evil schemes, planting ghosts, deceit, arson |
| 21 | Uttara Ashadha | Fixed/Permanent | Permanent things, marriage, laying foundations, building, deity, careers, relationships, music, gardening, medical |
| 22 | Shravana | Temporary/Movable | Vehicles, procession, gardening, travel, laying foundations, medical, vedas |
| 23 | Dhanishta | Temporary/Movable | Vehicles, procession, gardening, travel, music, medical, studying medicine |
| 24 | Shatabhisha | Temporary/Movable | Vehicles, procession, gardening, travel, music, medical, studying medicine |
| 25 | Purva Bhadrapada | Fierce/Cruel | Evil schemes, planting ghosts, deceit, arson |
| 26 | Uttara Bhadrapada | Fixed/Permanent | Permanent things, marriage, laying foundations, building, deity, careers, relationships, music, medical |
| 27 | Revati | Soft/Gentle | Buying home, marriage (first 3 padas), art, dance, music, sex, ceremonies, astronomy, music, gardening, medical, travel |

## Implementation Steps

1. **Backup current data**
   ```
   cp frontend/src/data/tarabalam.js frontend/src/data/tarabalam.js.backup
   ```

2. **Update NAKSHATRAS array**
   - Replace each entry's `activities` field with the correct list
   - Ensure `constellation_type` matches user's source

3. **Verify all 27 entries are present**
   - No duplicates
   - No missing IDs

4. **Update tests** (if any)
   - `frontend/src/tests/tarabalam.test.js` may have activity assertions
   - Update expected values

5. **Update PDF export** (if activities are baked into PDF)
   - Check `frontend/src/utils/generatePdf.js` for activity display
   - Ensure corrected activities appear in exports

## Activity Grouping for Display

When showing activities in the UI (Design Doc 1: Timeline Segments), the app should:

1. Get the nakshatra's activity list
2. Extract **first 2–3 activities** for display in segments
3. For full details, show the complete list

Example:
```javascript
function getActivityHints(nakshatra) {
  return nakshatra.activities.slice(0, 3) // First 3 for quick display
}
```

## Quality Checks

After migration:

✓ All 27 nakshatras have activities  
✓ No activities are duplicated across entries  
✓ Activity text matches user's source exactly (character-for-character if possible)  
✓ Constellation type matches source  
✓ PDF generation includes correct activities  
✓ Tests pass with new data  
✓ UI displays activities correctly (no text overflow, proper formatting)  

## Notes on "Dark" Activities

Some nakshatras (Bharani, Magha, Purva Phalguni, Purva Ashadha, Purva Bhadrapada, Ashlesha, Jyeshta, Moola) have activities like:
- "Evil schemes & deeds"
- "Planting ghosts in people"
- "Deceit"
- "Setting fires – arson"
- "Tantric incantations"
- "Destruction, War"
- "Breaking Alliances, Separations"

**These are authentic activities for FIERCE and DREADFUL nakshatra types.** They are not "bad" activities to avoid—they are auspicious activities for certain purposes (e.g., banishing, protection, strategic planning). The app should display them neutrally, without judgment.

## File to Update

- **Primary:** `frontend/src/data/tarabalam.js` (NAKSHATRAS array)
- **Secondary:** Any tests referencing activities
- **Optional:** Update NAKSHATRA_TARA_MAPPING.md to reflect corrected activities

## Definition of Done

✓ All 27 nakshatras have correct activities from authoritative source  
✓ Constellation types are correct  
✓ No data hallucination remains  
✓ Tests pass  
✓ UI displays corrected activities  
✓ PDF exports show corrected activities
