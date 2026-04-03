# Design Doc 2: Red-Light Rule (Tara 7 Avoidance)

## Objective
Enforce a safety rule: on Tara 7 (Naidhana) days, the application should not suggest any activities. Instead, it should clearly signal that this is a day to avoid initiating new ventures.

## Context

Tara 7 (Naidhana) is classified as "Very Bad" and represents danger, obstruction, and a period where practitioners strongly avoid starting activities.

Unlike poor Taras (3, 5) which might show no guidance, Tara 7 requires an explicit warning to prevent users from misinterpreting silence as approval.

## Current State
- Activities are shown regardless of Tara tier
- No distinction made for red-light periods
- Users might attempt activities during Naidhana by mistake

## Proposed State

### Visual Signal for Tara 7 Segments

When a segment has Tara 7 (Naidhana):

```
┌─ Segment ────────────────────────────┐
│ 18:22 – 23:59                        │
│ Naidhana (7)                         │
│ Ardra                                │
│ [RED badge: Very Bad]                │
│ ─────────────────────────────────────│
│ ⚠️  Avoid initiating activities      │
└──────────────────────────────────────┘
```

**Design notes:**
- Red background (#e57373) immediately signals danger
- Warning text is terse and directive (not explanatory)
- No activities are listed (no noise)
- No "why" explanation (keep it simple)

### Activity Display Logic

```javascript
if (segment.tara.number === 7) {
  // Naidhana: show warning only
  showWarning("⚠️  Avoid initiating activities")
  doNotShowActivities()
} else if ([2, 4, 6, 8, 9].includes(segment.tara.number)) {
  // Favorable: show hints
  showActivityHints(segment.nakshatra)
} else {
  // Tara 1, 3, 5: show nothing
  showNothing()
}
```

## Integration Points

1. **DayDetailModal** → TimelineSegments component
   - Check segment.tara.number === 7
   - Conditionally render warning badge

2. **Activity guidance source** (corrected data)
   - No changes needed; Tara 7 just hides the activities
   - The rule is presentation-layer only

## Design Constraints

- Warning must be visible at a glance (color + text)
- Do NOT show "what could go wrong" or detailed consequences
- Do NOT show a list of things to avoid
- Keep the message short and actionable

## User Experience Flow

1. User selects a day
2. Timeline segments render
3. User scans from sunrise to next sunrise
4. RED segments with "⚠️ Avoid initiating activities" stand out immediately
5. User knows: "Don't start anything during these times"
6. Other segments guide positive actions

## Implementation Notes

- No backend changes needed (rule is frontend presentation)
- Existing Tara number is already computed and available
- Color mapping already exists (red for tier: "very_bad")
- Message can be hardcoded (no dynamic content)

## Testing Scenarios

✓ Segment with Tara 7 shows red background  
✓ Segment with Tara 7 shows warning text  
✓ Segment with Tara 7 does NOT show activities  
✓ Segment with Tara 7 is still readable and scannable  
✓ All other Tara numbers display normally  
✓ Modal layout doesn't break with warning message

## Definition of Done

✓ Tara 7 segments are visually unmistakable  
✓ Clear warning message without explanation  
✓ No activities suggested during Tara 7  
✓ User behavior: avoids initiating during red periods
