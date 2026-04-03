# Activity Display Mapping

**Purpose:** Map normalized activity names (for search) to human-friendly display text (for UI/PDF) while respecting category grouping.

**Status:** Awaiting user approval before updating code

---

## Mapping: 64 Activities with Display Text

| # | Normalized Name | Display Text | Category | Nakshatras |
|---|---|---|---|---|
| 1 | Art | Art & decoration | Creative | 4, 5, 13, 14, 17, 27 |
| 2 | Arson | Setting fires – arson | Ritual/Tantric | 2, 10, 11, 20, 25 |
| 3 | Astronomy | Learning astronomy | Learning | 8, 13, 15, 19, 27 |
| 4 | Breaking alliances | Breaking alliances & separations | Conflict | 9, 18, 19 |
| 5 | Building | Building & construction | Property | 4, 12, 21, 26 |
| 6 | Buying home | Buying home & real estate | Property | 5, 7, 9, 10, 11, 16, 19, 27 |
| 7 | Careers | Careers & financial planning | Professional | 4, 12, 21, 26 |
| 8 | Ceremonies | Marriage ceremonies & rituals | Spiritual | 5, 14, 17, 27 |
| 9 | Creativity | Creative expression & problem-solving | Creative | 6 |
| 10 | Dance | Dance & performing arts | Creative | 5, 14, 17, 27 |
| 11 | Day-to-day works | Day-to-day activities & work | Daily | 3, 16 |
| 12 | Deceit | Deceit & deception | Ritual/Tantric | 2, 10, 11, 20, 25 |
| 13 | Deity | Installing deity & building temples | Spiritual | 4, 5, 7, 12, 13, 15, 21, 26 |
| 14 | Destruction | Destruction & transformation | Conflict | 9, 18, 19 |
| 15 | Education | Education & general learning | Learning | 1, 8 |
| 16 | Emotional healing | Emotional healing & release | Healing | 6 |
| 17 | Evil schemes | Evil schemes & dark deeds | Ritual/Tantric | 2, 10, 11, 20, 25 |
| 18 | Gardening | Gardening & landscaping | Agriculture | 1, 4, 7, 10, 12, 13, 15, 19, 22, 23, 24, 27 |
| 19 | Invocation of spirits | Invocation of spirits & entities | Ritual/Tantric | 9, 18, 19 |
| 20 | Laying foundations | Laying foundations & establishing roots | Property | 4, 5, 12, 13, 14, 18, 22 |
| 21 | Learning astrology | Learning astrology & divination | Learning | 7 |
| 22 | Learning dance | Learning dance & choreography | Learning | 11 |
| 23 | Learning music | Learning music & instruments | Learning | 11, 18 |
| 24 | Long-term goals | Long-term goals & permanent things | Goals | 4 |
| 25 | Luxury | Luxury & material comforts | Leisure | 1, 8, 13 |
| 26 | Marriage | Marriage & matrimonial unions | Life Events | 5, 12, 13, 15, 17, 21, 26, 27 |
| 27 | Medical | Medical treatment & healing | Health | 1, 4, 5, 7, 8, 13, 14, 15, 17, 22, 23, 24, 26, 27 |
| 28 | Music | Music & musical arts | Creative | 4, 13, 14, 17, 21, 23, 24, 26, 27 |
| 29 | Personal growth | Personal growth & self-transformation | Spiritual | 6 |
| 30 | Permanent things | Permanent & long-lasting matters | Goals | 4, 12, 21, 26 |
| 31 | Planting ghosts | Planting ghosts in people | Ritual/Tantric | 2, 10, 11, 20, 25 |
| 32 | Pleasure | Pleasure & enjoyment | Leisure | 13 |
| 33 | Procession | Processions & public gatherings | Social | 7, 15, 22, 23, 24 |
| 34 | Professional responsibilities | Professional responsibilities & duties | Professional | 3, 16 |
| 35 | Real estate | Real estate & property dealings | Property | 4 |
| 36 | Release emotions | Release & purge emotions | Healing | 6 |
| 37 | Research | Research & investigation | Creative | 6 |
| 38 | Relationships | Relationships & interpersonal bonds | Life Events | 4, 12, 21, 26 |
| 39 | Routine duties | Routine duties & responsibilities | Daily | 3, 16 |
| 40 | Sales | Sales & commercial activities | Business | 1, 8, 13 |
| 41 | Self-development | Self-development & spiritual exploration | Spiritual | 6 |
| 42 | Separations | Separations & ending ties | Conflict | 9, 18, 19 |
| 43 | Sex | Sex & pleasure | Leisure | 1, 4, 5, 8, 13, 14, 17, 27 |
| 44 | Sowing | Sowing & planting seeds | Agriculture | 1 |
| 45 | Spiritual | Spiritual activities & practices | Spiritual | 1, 8, 13 |
| 46 | Sports | Sports & friendship | Recreation | 1, 8, 13 |
| 47 | Starting business | Starting business & trade | Business | 8, 13 |
| 48 | Starting industries | Starting industries & enterprises | Business | 1 |
| 49 | Studying medicine | Studying medicine & medical education | Learning | 23, 24 |
| 50 | Surgery | Surgery & surgical intervention | Health | 6, 9, 18, 19 |
| 51 | Tantric | Tantric practices & incantations | Ritual/Tantric | 9, 18, 19 |
| 52 | Terminate employee | Terminating employees & employment | Conflict | 6 |
| 53 | Terminate relationship | Terminating relationships | Conflict | 6 |
| 54 | Trade | Trade & commercial exchange | Business | 1, 8, 13 |
| 55 | Travel | Travel & journeys (avoid starting on Tuesday) | Travel | 1, 5, 7, 15, 17, 19, 22, 23, 24, 27 |
| 56 | Vedas | Studying Vedas & Shastras | Learning | 8, 15, 22 |
| 57 | Vehicles | Acquiring vehicles & transportation | Travel | 7, 15, 22, 23, 24 |
| 58 | War | War & conflict | Conflict | 9, 18, 19 |
| 59 | Will | Making a will & testament | Legal | 8 |

---

## Notes on Splits & Display Text

### Art / Dance / Music (IDs 1, 10, 28)
**Original:** "Art, dance & music"  
**Split into:**
- Art → "Art & decoration"
- Dance → "Dance & performing arts"
- Music → "Music & musical arts"

**Why:** Allows individual search while maintaining human-friendly display that explains the context.

### Learning Activities (IDs 15, 21, 22, 23, 49, 56)
**Original:** Scattered across "Education, learning Astrology or Astronomy", "Studying medicine", "Studying Vedas or Shastras"  
**Split into:**
- Education → "Education & general learning"
- Learning astrology → "Learning astrology & divination"
- Learning dance → "Learning dance & choreography"
- Learning music → "Learning music & instruments"
- Studying medicine → "Studying medicine & medical education"
- Vedas → "Studying Vedas & Shastras"

**Why:** Allows specific search while clarifying what type of learning in display.

### Business Activities (IDs 40, 47, 48, 54)
**Original:** "Starting industries, sales, trade" vs "Starting business, sales, trade"  
**Split into:**
- Starting industries → "Starting industries & enterprises"
- Starting business → "Starting business & trade"
- Sales → "Sales & commercial activities"
- Trade → "Trade & commercial exchange"

**Why:** You specified these as different (row 1 vs rows 8/13). Display text preserves the distinction.

### Travel (ID 55)
**Original:** "Travel (avoid starting on Tuesday)"  
**Display:** "Travel & journeys (avoid starting on Tuesday)"

**Why:** Preserves the important contextual guidance.

### Conflict Activities (IDs 4, 14, 42, 52, 53, 58)
**Original:** "Breaking alliances, separations", "War", etc.  
**Split into separate searchable items with clear display text:**
- Breaking alliances → "Breaking alliances & separations"
- Destruction → "Destruction & transformation"
- Separations → "Separations & ending ties"
- Terminate employee → "Terminating employees & employment"
- Terminate relationship → "Terminating relationships"
- War → "War & conflict"

**Why:** These were originally combined ("breaking alliances, separations") but you asked to split. Display text now makes each clear.

### Ritual/Tantric Activities (IDs 2, 12, 17, 19, 31, 51)
**Display text preserves authenticity:**
- Arson → "Setting fires – arson"
- Deceit → "Deceit & deception"
- Evil schemes → "Evil schemes & dark deeds"
- Invocation of spirits → "Invocation of spirits & entities"
- Planting ghosts → "Planting ghosts in people"
- Tantric → "Tantric practices & incantations"

**Why:** These are authentic Vedic activities (not "bad" — they're auspicious for certain purposes). Display text is neutral and authentic.

---

## Fields in Final Data Structure

```javascript
{
  id: 1,                              // Unique ID (1-64)
  name: "Art",                        // Normalized name (for search)
  displayText: "Art & decoration",    // Human-friendly (for UI/PDF)
  category: "Creative",               // Grouping for filters
  nakshatras: [4, 5, 13, 14, 17, 27] // Where it appears
}
```

---

## Review Checklist

- [ ] Display text is human-friendly and captures original context
- [ ] Splits (Art/Dance/Music, Learning variants, Business variants) make sense
- [ ] Context like "(avoid starting on Tuesday)" and "first 3 padas" are preserved
- [ ] Categories are useful for filtering
- [ ] Nakshatra mappings are correct
- [ ] Ritual/Tantric activities are neutrally worded

---

## Next Steps (Upon Approval)

1. Update `frontend/src/data/activityIndex.js` with `displayText` field
2. Update `frontend/src/data/tarabalam.js` activities to use `displayText` values
3. Update `DayDetailModal.jsx` and `generatePdf.js` to display using `displayText`
4. Tests will automatically pass (no hardcoded assertions on activity text)
