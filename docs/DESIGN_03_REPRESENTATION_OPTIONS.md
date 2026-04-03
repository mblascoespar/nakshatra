# Design Doc 3: Activity Search — Representation Options

**Goal:** Explore how to present Approach 1 (Typeahead) + Approach 2 (Categories) on screen

We have two user paths:
- **Direct searcher:** Knows what to look for → types "marriage" → gets results
- **Browser:** Exploring what's possible → clicks "Life Events" → sees activities → picks one

---

## Option A: Sidebar Search Panel

**Layout:**
```
┌────────────────┬──────────────────────────────┐
│                │                              │
│                │     Calendar / Year View     │
│   Search       │                              │
│   Panel        │   (existing)                 │
│   (new)        │                              │
│                │                              │
│ • Categories   │                              │
│ • Typeahead    │                              │
│ • Results      │                              │
│                │                              │
└────────────────┴──────────────────────────────┘
```

**Detailed View:**
```
┌─────────────────────────┐
│ Activity Search         │
├─────────────────────────┤
│                         │
│ Search:                 │
│ [marriage___________]   │
│ ▼ Suggestions:          │
│ • Marriage & matri...   │
│ • Marriage ceremonies   │
│                         │
├─────────────────────────┤
│ Or browse by category:  │
│                         │
│ ▶ Business (5)          │
│ ▶ Life Events (2)       │
│ ▼ Creative Arts (5)     │
│   • Art & decoration    │
│   • Dance & perf...     │
│   • Music & musical     │
│ ▶ Spiritual (6)         │
│ ▶ Property (5)          │
│                         │
├─────────────────────────┤
│ Results (10 days):      │
│                         │
│ ✓ Apr 5 — Very Good     │
│   Rohini, Tara 6        │
│                         │
│ ✓ Apr 7 — Very Good     │
│   Pushya, Tara 9        │
│                         │
│ [Show more]             │
└─────────────────────────┘
```

**Pros:**
- Always visible (persistent)
- Lots of space for categories + search + results
- Familiar pattern (like Google Docs sidebar)
- Desktop-friendly
- Can show both search UI and results simultaneously

**Cons:**
- Reduces calendar viewing area (especially on smaller screens)
- Sidebar on mobile feels cramped
- Takes up vertical or horizontal real estate
- Distracting if user is just browsing calendar

**Best For:** Desktop-first, power users who switch between calendar and search

---

## Option B: Modal / Overlay

**Layout:**
```
┌────────────────────────────────────┐
│         Calendar / Year View       │
│                                    │
│   ┌──────────────────────────┐    │
│   │  Activity Search         │    │
│   ├──────────────────────────┤    │
│   │ Search:                  │    │
│   │ [marriage___________]    │    │
│   │                          │    │
│   │ Categories:              │    │
│   │ [Business] [Life Events] │    │
│   │ [Creative] [Spiritual]   │    │
│   │ [Property] [Professional]│    │
│   │                          │    │
│   │ [×] Close                │    │
│   └──────────────────────────┘    │
│   (calendar greys out behind)      │
│                                    │
└────────────────────────────────────┘
```

**Detailed View (expanded modal):**
```
┌────────────────────────────────────────┐
│       ACTIVITY SEARCH                  │
├────────────────────────────────────────┤
│                                        │
│ Search activity:                       │
│ [marriage___________________]          │
│ ▼ Suggestions:                         │
│ • Marriage & matrimonial unions        │
│ • Marriage ceremonies & rituals        │
│                                        │
│ ── OR ──                               │
│                                        │
│ Browse by category:                    │
│                                        │
│ [Business & Commerce] [Life Events]    │
│ [Creative Arts]       [Spiritual]      │
│ [Property & RE]       [Professional]   │
│ [Health & Medicine]   [Travel]         │
│ [Learning]            [Conflict]       │
│                                        │
│ Selected category details:             │
│ [none selected]                        │
│                                        │
│ Date range:                            │
│ [From] Apr 1    [To] Apr 30            │
│                                        │
│ [Search]  [Clear]                      │
├────────────────────────────────────────┤
│ Results (10 days found)                │
│                                        │
│ ✓ Apr 5 (Thu) — Very Good              │
│   Rohini, Tara 6 (Sadhana)             │
│                                        │
│ ✓ Apr 7 (Sat) — Very Good              │
│   Pushya, Tara 9 (Parama Mitra)        │
│                                        │
│ [See more results...] [Export as .ics] │
└────────────────────────────────────────┘
```

**Pros:**
- Focused interaction (modal demands attention)
- Calendar stays visible for reference
- Takes up defined space (not persistent)
- Results can be scrollable within modal
- Mobile-friendly (full-screen modal)
- Can open/close without affecting calendar state

**Cons:**
- Modal feels heavy/interrupting for quick searches
- Results below search = need to scroll in modal
- Can't see calendar and results simultaneously
- One more click to open/close

**Best For:** General users, exploratory searches, mobile-first

---

## Option C: Collapsible/Expandable Panel

**Compact state (collapsed):**
```
┌────────────────────────────────────────┐
│ Calendar / Year View                   │
│                                        │
│ [🔍 Activity Search ▼]  (compact bar)  │
│                                        │
└────────────────────────────────────────┘
```

**Expanded state:**
```
┌────────────────────────────────────────┐
│ ▲ Activity Search ▲                    │
├────────────────────────────────────────┤
│ Search: [marriage__________________]   │
│                                        │
│ Categories:                            │
│ [Business] [Life Events] [Creative]    │
│ [Spiritual] [Property] [Professional]  │
│                                        │
│ Results:                               │
│ ✓ Apr 5 — Very Good (Rohini, Tara 6)  │
│ ✓ Apr 7 — Very Good (Pushya, Tara 9)  │
├────────────────────────────────────────┤
│ Calendar / Month Grid (below)          │
│                                        │
└────────────────────────────────────────┘
```

**Pros:**
- Compact by default (doesn't distract)
- Expands on demand
- User controls how much space it takes
- Results visible while viewing calendar (if expanded fully)
- Smooth animation feels modern

**Cons:**
- Two states to manage (collapsed/expanded)
- Expanded state pushes calendar down (or sidebar becomes cluttered)
- Not ideal for "sticky" workflows (search hidden again when user switches focus)

**Best For:** Balanced desktop/mobile, exploratory users

---

## Option D: Tab/Drawer Interface

**Layout (like Google Workspace tabs):**
```
┌────────────────────────────────────────┐
│ [Calendar] [Activity Search] [Settings]│
├────────────────────────────────────────┤
│                                        │
│ Activity Search tab content:           │
│                                        │
│ Search: [marriage__________________]   │
│                                        │
│ Categories:                            │
│ [Business] [Life Events] [Creative]    │
│ [Spiritual] [Property] [Professional]  │
│                                        │
│ Results:                               │
│ ✓ Apr 5 — Very Good                    │
│ ✓ Apr 7 — Very Good                    │
│                                        │
└────────────────────────────────────────┘
```

**Pros:**
- Clear separation of concerns (Calendar vs Search)
- User explicitly switches between views
- Each tab has full space
- Scales well to add more features later
- Tab state persists (user comes back to same tab)

**Cons:**
- Extra click to switch views
- Can't see calendar while searching
- Feels more like two separate apps than integrated feature
- Less discoverable (search is hidden in tab)

**Best For:** Feature-rich app, power users, scenarios where calendar and search are separate workflows

---

## Option E: Floating Action Button (FAB) + Bottom Sheet

**Default state (FAB visible):**
```
┌────────────────────────────────────────┐
│ Calendar / Year View                   │
│                                        │
│                          [🔍 Search FAB]│ ← floating button
│                                        │
└────────────────────────────────────────┘
```

**Activated (bottom sheet slides up):**
```
┌────────────────────────────────────────┐
│ Calendar / Year View (partially visible)
│                                        │
├────────────────────────────────────────┤
│ ╭─ Activity Search ─────────────────╮  │
│ │ [marriage__________________]      │  │
│ │                                  │  │
│ │ [Business] [Life Events]         │  │
│ │ [Creative] [Spiritual]           │  │
│ │ [Property] [Professional]        │  │
│ │                                  │  │
│ │ Results:                         │  │
│ │ ✓ Apr 5 — Very Good              │  │
│ │ ✓ Apr 7 — Very Good              │  │
│ │ [Show more]                      │  │
│ │                                  │  │
│ │ [Drag to expand] [×]             │  │
│ ╰──────────────────────────────────╯  │
│                                        │
└────────────────────────────────────────┘
```

**Pros:**
- Mobile-native pattern (Material Design)
- FAB is always accessible
- Bottom sheet can be dragged up to full screen
- Calendar visible behind
- Non-intrusive (just a button, doesn't block)
- Feels polished on mobile

**Cons:**
- Requires touch-friendly design
- Can feel cramped on desktop (FAB positioned at weird spot)
- Bottom sheet might obscure bottom of calendar on small screens
- Less discoverable on desktop (users might miss FAB)

**Best For:** Mobile-first, touch-friendly interfaces

---

## Option F: Inline Within Calendar View

**Integration point: Results appear in the calendar itself**

```
┌────────────────────────────────────────┐
│ Calendar View                          │
├────────────────────────────────────────┤
│                                        │
│ Search: [marriage__________________]   │
│ [Business] [Life Events] [Creative]    │
│ [Spiritual] [Property]  [Professional] │
│                                        │
│ Filtered calendar view (highlighted):  │
│                                        │
│        Apr 2026                        │
│  M   T   W   Th  F   S   Su           │
│              1   2  [3]  [4]           │ ← highlighted
│ [5]  6  [7]  8   9  10  11            │
│  12 [13] 14  15  16 [17]  18          │
│  19  20  21 [22] 23 [24]  25          │
│  26 [27] 28  29  30                   │
│                                        │
│ [3] Apr 3 — Very Good (Rohini, T6)    │
│ [4] Apr 4 — Good (Mrigashirsha, T4)   │
│ [5] Apr 5 — Very Good (Rohini, T6)    │
│                                        │
└────────────────────────────────────────┘
```

**Pros:**
- Most integrated (search and results in same context)
- Visual pattern recognition (user sees which days cluster)
- Doesn't require new UI elements (just enhanced calendar)
- Click day to get full detail modal

**Cons:**
- Calendar cells might get crowded with highlighting
- Hard to show full list of results (limited by grid)
- Typeahead might not fit in search bar above calendar
- Categories harder to display inline

**Best For:** Calendar-centric workflows, visual learners

---

## Option G: Two-Pane (Search + Results Side-by-Side)

**Layout:**
```
┌────────────────┬──────────────────────────┐
│    Search      │      Results             │
│    & Browse    │      (List View)         │
│                │                          │
│ [marriage___]  │ ✓ Apr 5 — Very Good     │
│                │   Rohini, Tara 6        │
│ Categories:    │                          │
│ ▼ Business (5) │ ✓ Apr 7 — Very Good     │
│   • Sales      │   Pushya, Tara 9        │
│   • Starting   │                          │
│ ▼ Life Events  │ ✓ Apr 12 — Good         │
│   • Marriage   │   Ashwini, Tara 4       │
│   • Relationsh │                          │
│ ▶ Creative (5) │ ✓ Apr 15 — Very Good    │
│ ▶ Spiritual (6)│   Hasta, Tara 2         │
│                │                          │
│ Date range:    │ [← Back to calendar]    │
│ [Apr 1 - 30]   │                          │
│ [Search]       │                          │
│                │                          │
└────────────────┴──────────────────────────┘
```

**Pros:**
- Power user friendly (search and results visible simultaneously)
- Clear visual separation
- Can show large result list
- Great for desktop (uses full width)

**Cons:**
- Takes a lot of horizontal space
- Not mobile-friendly
- Complex to implement
- Calendar hidden while searching

**Best For:** Desktop-only, power users, analysts

---

## Representation Comparison

| Option | User Type | Space Usage | Mobile | Discovery | Results View | Complexity |
|--------|-----------|---|---|---|---|---|
| A. Sidebar | Power | Side space | ⚠️ Hard | Good | Always visible | Low |
| B. Modal | General | Modal | ⭐ Good | Good | Inside modal | Low |
| C. Collapsible | Balanced | Flexible | ⭐ Good | Good | Expandable | Medium |
| D. Tab | Power | Full | ⚠️ Hard | Moderate | Full space | Medium |
| E. FAB+Sheet | Mobile | Minimal | ⭐⭐⭐ Best | Good | Sheet | Medium |
| F. Inline | Calendar | In-place | ⭐ Good | Great | Highlighted | High |
| G. Two-Pane | Power | Full width | ✗ No | Good | Side panel | High |

---

## Recommended Combinations

### Recommendation 1: Modal (B) for MVP
**Why:**
- Simple to build (modal + search form inside)
- Works equally well on desktop & mobile
- Clear interaction pattern (click → search → see results)
- Results scrollable inside modal if needed
- Non-disruptive (closes when done)

**Implementation:**
- Add "Activity Search" button to main toolbar
- Click → modal opens with search + categories + results
- Category clicks → filters typeahead suggestions
- Date range picker inside modal

**Effort:** 2-3 days

---

### Recommendation 2: Sidebar (A) + Modal (B) — Best of Both
**Desktop version:**
- Sidebar visible by default (persistent search)
- User doesn't need to click to open
- Can search while viewing calendar

**Mobile version:**
- Hide sidebar, use modal instead
- Modal opens full-screen
- Less cramped than sidebar on small screen

**Implementation:**
- Responsive component (show sidebar on desktop, modal on mobile)
- Shared search logic between both representations

**Effort:** 3-4 days

---

### Recommendation 3: FAB + Bottom Sheet (E) — Mobile-First
**Best for touch interfaces:**
- FAB always accessible (never in the way)
- Bottom sheet natural for mobile (like Maps, Gmail)
- Can drag to expand or collapse
- Calendar visible while searching (partially)

**Trade-off:** Less ideal on desktop (FAB looks out of place)

**Effort:** 2-3 days

---

## Questions for You

1. **Primary platform?**
   - Desktop-first?
   - Mobile-first?
   - Equal both?

2. **User behavior?**
   - Quick searches (1-2 min then leave)?
   - Long sessions (switching between calendar and search)?
   - Exploratory browsing?

3. **Visual preference?**
   - Minimal/clean (modal, FAB)?
   - Always visible (sidebar)?
   - Integrated (inline calendar)?

4. **Complexity tolerance?**
   - Keep it simple?
   - Can handle responsive design?

---

## My Suggestion

**Start with: Modal (Option B)**

- Simplest to build first
- Works on all screen sizes (just needs responsive tweaking)
- Clear, focused UX (user opens search → does search → closes)
- Can evolve to sidebar/FAB later if needed
- Most practitioners probably familiar with modal workflows

**Future iteration: Add responsive sidebar** for desktop power users if needed

Does this resonate? Which option feels right for your use case?
