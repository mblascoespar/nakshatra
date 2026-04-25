/**
 * Client-side PDF generation.
 * Structure: cover photo page + calendar grid page per month.
 * Calendar cells are coloured by tarabalam tier; hybrid days get split backgrounds.
 *
 * jsPDF is loaded lazily so it doesn't bloat the initial bundle.
 */

const TIER_COLORS = {
  very_good: [46,  160,  67],
  good:      [140, 210, 150],
  mixed:     [255, 232, 110],
  poor:      [255, 170, 170],
  very_bad:  [220,  75,  75],
}

const TIER_LABELS = {
  very_good: 'Very Good',
  good:      'Good',
  mixed:     'Mixed',
  poor:      'Poor',
  very_bad:  'Very Bad',
}

const TIER_SHORT = {
  very_good: 'VG', good: 'G', mixed: 'Mix', poor: 'P', very_bad: 'VB',
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const HEADER_BG   = [15,  80,  45]
const HEADER_GOLD = [255, 210,  60]
const DOW_BG      = [30, 110,  60]
const GRID_BORDER = [100, 100, 100]
const CELL_BORDER = [160, 160, 160]

const PAGE_W    = 210
const PAGE_H    = 297
const MARGIN    = 8
const CONTENT_W = PAGE_W - 2 * MARGIN
const COL_W     = CONTENT_W / 7

// One deity per month, tied to that month's major festival.
const MONTH_DEITIES = [
  { name: 'Surya',     festival: 'Makara Sankranti', mantra: 'Om Suryaya Namah',              file: 'jan.jpg' },
  { name: 'Saraswati', festival: 'Vasant Panchami',  mantra: 'Om Sarasvatyai Namah',          file: 'feb.jpg' },
  { name: 'Shiva',     festival: 'Maha Shivaratri',  mantra: 'Om Namah Shivaya',              file: 'mar.jpg' },
  { name: 'Rama',      festival: 'Rama Navami',       mantra: 'Om Sri Ramaya Namah',           file: 'apr.jpg' },
  { name: 'Lakshmi',   festival: 'Akshaya Tritiya',  mantra: 'Om Mahalakshmyai Namah',        file: 'may.jpg' },
  { name: 'Murugan',   festival: 'Skanda Jayanti',   mantra: 'Om Saravanabhavaya Namah',      file: 'jun.jpg' },
  { name: 'Vishnu',    festival: 'Ashadhi Ekadashi', mantra: 'Om Namo Narayanaya',            file: 'jul.jpg' },
  { name: 'Krishna',   festival: 'Janmashtami',       mantra: 'Om Namo Bhagavate Vasudevaya', file: 'aug.jpg' },
  { name: 'Durga',     festival: 'Navaratri',         mantra: 'Om Dum Durgayai Namah',        file: 'sep.jpg' },
  { name: 'Hanuman',   festival: 'Vijaya Dashami',   mantra: 'Om Hanumate Namah',             file: 'oct.jpg' },
  { name: 'Ganesha',   festival: 'Karthika Masa',    mantra: 'Om Gam Ganapataye Namah',      file: 'nov.jpg' },
  { name: 'Surya',     festival: 'Uttarayana',        mantra: 'Om Suryaya Namah',              file: 'dec.jpg' },
]

const BASE = import.meta.env.BASE_URL

async function loadImageAsBase64(url) {
  try {
    const resp = await fetch(url)
    if (!resp.ok) return null
    const blob = await resp.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function buildWeekGrid(days) {
  const grid = []
  let week = Array(7).fill(null)
  for (const day of days) {
    week[day.day_of_week] = day
    if (day.day_of_week === 6) { grid.push(week); week = Array(7).fill(null) }
  }
  if (week.some((d) => d !== null)) grid.push(week)
  return grid
}

function drawCell(doc, cellX, cellY, cellW, cellH, day) {
  if (day === null) {
    doc.setFillColor(235, 235, 235)
    doc.rect(cellX, cellY, cellW, cellH, 'F')
    doc.setDrawColor(...CELL_BORDER)
    doc.setLineWidth(0.25)
    doc.rect(cellX, cellY, cellW, cellH, 'S')
    return
  }

  // ── Segmented background (hybrid days) ──────────────────
  // Base uses the nakshatra active at midnight (not sunrise) so that early-morning
  // transitions show the correct color before sunrise.
  const baseTier = day.midnight_tarabalam_tier ?? day.tarabalam_tier
  const segments = [{ tier: baseTier }]
  for (const t of day.nakshatra_transitions) {
    const [h, m] = t.time.split(':').map(Number)
    segments.push({ rawFrac: (h * 60 + m) / 1440, tier: t.tier })
  }

  // Raw sizes derived from wall-clock fractions
  const rawFracs = segments.map((s, i) => {
    const start = s.rawFrac ?? 0
    const end   = i + 1 < segments.length ? (segments[i + 1].rawFrac ?? 1) : 1
    return Math.max(0, end - start)
  })

  // Enforce a minimum visible band of 8% so tiny slivers are still legible
  const MIN_BAND = 0.08
  const bumped = rawFracs.map((f) => Math.max(f, MIN_BAND))
  const total  = bumped.reduce((a, b) => a + b, 0)
  const sizes  = bumped.map((f) => f / total)

  let curY = cellY
  for (let i = 0; i < segments.length; i++) {
    const segH = sizes[i] * cellH
    const [r, g, b] = TIER_COLORS[segments[i].tier]
    doc.setFillColor(r, g, b)
    doc.rect(cellX, curY, cellW, segH, 'F')
    curY += segH
  }

  // ── Special day stripe ───────────────────────────────────
  const STRIPE_H = 3.5
  if (day.special_day_name) {
    doc.setFillColor(200, 90, 0)
    doc.rect(cellX, cellY, cellW, STRIPE_H, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(4.5)
    doc.setTextColor(255, 240, 180)
    doc.text(day.special_day_name, cellX + cellW / 2, cellY + 2.4, { align: 'center' })
  }

  // ── Cell border ──────────────────────────────────────────
  doc.setDrawColor(...CELL_BORDER)
  doc.setLineWidth(0.25)
  doc.rect(cellX, cellY, cellW, cellH, 'S')

  const pad   = 1.8
  const textW = cellW - 2 * pad
  const stripeOffset = day.special_day_name ? STRIPE_H : 0
  let ty = cellY + stripeOffset + pad

  // ── Day number (top-right) ───────────────────────────────
  const dayNum = parseInt(day.date.split('-')[2], 10)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(20, 20, 20)
  ty += 3.5
  doc.text(String(dayNum), cellX + cellW - pad, ty, { align: 'right' })

  // ── Moon phase (top-left) ────────────────────────────────
  if (day.is_purnima || day.is_amavasya) {
    const mx = cellX + pad + 1.8
    const my = ty - 1.5
    const mr = 1.8
    if (day.is_purnima) {
      doc.setFillColor(255, 255, 255); doc.setDrawColor(70, 70, 70); doc.setLineWidth(0.4)
      doc.ellipse(mx, my, mr, mr, 'FD')
    } else {
      doc.setFillColor(30, 30, 30); doc.setDrawColor(30, 30, 30)
      doc.ellipse(mx, my, mr, mr, 'F')
    }
  }
  ty += 2

  // Thin rule under day number
  doc.setDrawColor(130, 130, 130)
  doc.setLineWidth(0.15)
  doc.line(cellX + pad, ty, cellX + cellW - pad, ty)
  ty += 2.2

  // ── Nakshatra ────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(15, 15, 15)
  const nakLines = doc.splitTextToSize(day.sunrise_nakshatra_name, textW)
  doc.text(nakLines, cellX + pad, ty)
  ty += nakLines.length * 2.8

  // ── Tara ─────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(50, 50, 50)
  doc.text(`Tara ${day.tara.number}: ${day.tara.name}`, cellX + pad, ty)
  ty += 3.2

  const hasTransitions = day.nakshatra_transitions.length > 0 || day.tithi_transitions.length > 0
  const transitionLines = [
    ...day.nakshatra_transitions.map((t) => `${t.time} ${t.nakshatra_name} [${TIER_SHORT[t.tier]}]`),
    ...day.tithi_transitions.map((t) => `${t.time} ${t.tithi_name} (${t.paksha})`),
  ]
  const transitionBlockH = hasTransitions ? 1.5 + transitionLines.length * 2.5 + 1 : 0
  const maxY = cellY + cellH - transitionBlockH - 1.5

  // ── Activities ───────────────────────────────────────────
  doc.setFontSize(5.2)
  doc.setTextColor(30, 30, 30)
  for (const activity of day.activities) {
    if (ty >= maxY) break
    const lines = doc.splitTextToSize(`· ${activity}`, textW)
    for (const line of lines) {
      if (ty >= maxY) break
      doc.text(line, cellX + pad, ty)
      ty += 2.5
    }
  }

  // ── Transitions section ──────────────────────────────────
  if (hasTransitions) {
    ty = cellY + cellH - transitionBlockH
    doc.setDrawColor(110, 110, 110)
    doc.setLineWidth(0.15)
    doc.line(cellX + pad, ty, cellX + cellW - pad, ty)
    ty += 2.2
    doc.setFontSize(4.8)
    doc.setTextColor(40, 40, 40)
    for (const line of transitionLines) {
      if (ty >= cellY + cellH - 1) break
      doc.text(line, cellX + pad, ty)
      ty += 2.4
    }
  }
}

function drawCoverPage(doc, imageData, year, nakshatra, locationLabel, timezone) {
  if (imageData) {
    doc.addImage(imageData, 'JPEG', 0, 0, PAGE_W, PAGE_H)
  } else {
    doc.setFillColor(...HEADER_BG)
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F')
  }

  // Gold top strip
  doc.setFillColor(...HEADER_GOLD)
  doc.rect(0, 0, PAGE_W, 2.5, 'F')

  // Dark overlay — bottom 52%
  const overlayH = PAGE_H * 0.52
  const overlayY = PAGE_H - overlayH
  doc.setFillColor(5, 5, 5)
  doc.rect(0, overlayY, PAGE_W, overlayH, 'F')
  doc.setFillColor(...HEADER_GOLD)
  doc.rect(0, overlayY, PAGE_W, 1.5, 'F')

  // Calendar title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...HEADER_GOLD)
  doc.text('TARABALAM CALENDAR', PAGE_W / 2, overlayY + 13, { align: 'center' })

  // Year — giant
  doc.setFontSize(68)
  doc.setTextColor(255, 255, 255)
  doc.text(String(year), PAGE_W / 2, overlayY + 45, { align: 'center' })

  // Nakshatra line
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...HEADER_GOLD)
  doc.text(`${nakshatra.name} Nakshatra`, PAGE_W / 2, overlayY + 58, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(180, 180, 180)
  doc.text(
    `Ruler: ${nakshatra.ruler}  ·  Deity: ${nakshatra.deity}  ·  ${nakshatra.qualities}`,
    PAGE_W / 2, overlayY + 66, { align: 'center' }
  )

  doc.setFontSize(7.5)
  doc.setTextColor(110, 110, 110)
  doc.text(`${locationLabel}  ·  ${timezone}`, PAGE_W / 2, overlayY + 73, { align: 'center' })

  // Gold bottom strip
  doc.setFillColor(...HEADER_GOLD)
  doc.rect(0, PAGE_H - 2, PAGE_W, 2, 'F')
}

function drawIntroPage(doc, nakshatra, year) {
  // Cream background
  doc.setFillColor(252, 248, 240)
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F')

  // Header banner
  const BANNER_H = 24
  doc.setFillColor(...HEADER_BG)
  doc.rect(0, 0, PAGE_W, BANNER_H, 'F')
  doc.setFillColor(...HEADER_GOLD)
  doc.rect(0, 0, PAGE_W, 1.5, 'F')
  doc.rect(0, BANNER_H - 1.2, PAGE_W, 1.2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...HEADER_GOLD)
  doc.text('UNDERSTANDING YOUR TARABALAM CALENDAR', PAGE_W / 2, 14, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(200, 240, 210)
  doc.text(
    `A personalised ${year} guide for ${nakshatra.name} Nakshatra  ·  Ruler: ${nakshatra.ruler}  ·  Deity: ${nakshatra.deity}`,
    PAGE_W / 2, 20, { align: 'center' }
  )

  // Two-column layout
  const COL_GAP = 5
  const COL_W_L = 90
  const COL_W_R = CONTENT_W - COL_W_L - COL_GAP
  const LX = MARGIN
  const RX = MARGIN + COL_W_L + COL_GAP
  const START_Y = BANNER_H + 6

  function secHead(text, x, y, w) {
    doc.setFillColor(...HEADER_BG)
    doc.rect(x, y, w, 6.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...HEADER_GOLD)
    doc.text(text, x + 2.5, y + 4.4)
    return y + 6.5 + 2
  }

  function para(text, x, y, w, size = 6.0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(size)
    doc.setTextColor(35, 35, 35)
    const lines = doc.splitTextToSize(text, w)
    doc.text(lines, x, y)
    return y + lines.length * 2.7
  }

  // ── LEFT COLUMN ─────────────────────────────────────────────────
  let ly = START_Y

  ly = secHead('WHAT IS TARABALAM?', LX, ly, COL_W_L)
  ly = para(
    'Tarabalam is an ancient Vedic system for evaluating the auspiciousness of each day. It is based on the relationship between the Moon\'s current Nakshatra (lunar mansion) and your birth Nakshatra.',
    LX, ly, COL_W_L
  )
  ly += 2
  ly = para(
    '"Tara" means star and "Balam" means strength — this calendar shows your daily star strength. The Moon transits through all 27 Nakshatras roughly once per month. Each transit creates a unique energetic relationship with your birth star, determining which activities are supported or challenged.',
    LX, ly, COL_W_L
  )
  ly += 4

  ly = secHead('THE 27 NAKSHATRAS', LX, ly, COL_W_L)
  ly = para(
    'The sky is divided into 27 lunar mansions called Nakshatras, each spanning 13°20\'. The Moon spends roughly one day in each. Every Nakshatra has a ruling planet, presiding deity, and characteristic quality that shapes the day\'s energy.',
    LX, ly, COL_W_L
  )
  ly += 4

  ly = secHead('THE 9 TARA CYCLE', LX, ly, COL_W_L)
  ly = para(
    'Counting from your birth Nakshatra (Tara 1), each successive Nakshatra is numbered 1–9 in a repeating cycle. The Tara number determines auspiciousness:',
    LX, ly, COL_W_L
  )
  ly += 2.5

  const TARA_ROWS = [
    { n: 1, name: 'Janma',        tier: 'mixed',     meaning: 'Birth star — significant, proceed with care' },
    { n: 2, name: 'Sampat',       tier: 'very_good', meaning: 'Wealth and prosperity' },
    { n: 3, name: 'Vipat',        tier: 'poor',      meaning: 'Danger and obstacles' },
    { n: 4, name: 'Kshema',       tier: 'good',      meaning: 'Well-being and security' },
    { n: 5, name: 'Pratyak',      tier: 'poor',      meaning: 'Opposition and enmity' },
    { n: 6, name: 'Sadhana',      tier: 'very_good', meaning: 'Achievement and success' },
    { n: 7, name: 'Naidhana',     tier: 'very_bad',  meaning: 'Danger — avoid major acts' },
    { n: 8, name: 'Mitra',        tier: 'good',      meaning: 'Friendship and alliance' },
    { n: 9, name: 'Parama Mitra', tier: 'very_good', meaning: 'Supreme friendship & support' },
  ]
  for (const t of TARA_ROWS) {
    const [r, g, b] = TIER_COLORS[t.tier]
    doc.setFillColor(r, g, b)
    doc.rect(LX, ly - 1.2, 5, 4, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5.8)
    doc.setTextColor(20, 20, 20)
    doc.text(`${t.n}. ${t.name}`, LX + 6.5, ly + 1.4)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.4)
    doc.setTextColor(55, 55, 55)
    const ml = doc.splitTextToSize(t.meaning, COL_W_L - 43)
    doc.text(ml, LX + 43, ly + 1.4)
    ly += Math.max(1, ml.length) * 4.5
  }
  ly += 4

  ly = secHead('NAKSHATRA QUALITIES', LX, ly, COL_W_L)
  ly = para('Each Nakshatra has a quality that shapes which activities are favoured:', LX, ly, COL_W_L)
  ly += 2
  const NK_TYPES = [
    ['Fixed / Permanent',   'Long-term goals, marriage, building, foundations'],
    ['Temporary / Movable', 'Travel, vehicles, short-term activities'],
    ['Sharp / Dreadful',    'Surgery, ending relationships, confrontation'],
    ['Soft / Gentle',       'Arts, romance, healing, ceremonies'],
    ['Light / Swift',       'Trade, loans, sports, learning, travel'],
    ['Fierce / Cruel',      'Bold leadership, creativity, transformation'],
    ['Mixed',               'Routine duties and professional responsibilities'],
  ]
  for (const [type, desc] of NK_TYPES) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5.5)
    doc.setTextColor(15, 80, 45)
    doc.text(type + ':', LX, ly)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.5)
    doc.setTextColor(50, 50, 50)
    const dl = doc.splitTextToSize(desc, COL_W_L - 2)
    doc.text(dl, LX, ly + 2.9)
    ly += 2.9 + dl.length * 2.6 + 1.5
  }

  // ── RIGHT COLUMN ─────────────────────────────────────────────────
  let ry = START_Y

  ry = secHead('AUSPICIOUSNESS TIERS', RX, ry, COL_W_R)
  const TIER_DESC = {
    very_good: 'Highly auspicious — ideal for ceremonies, major decisions, and new beginnings.',
    good:      'Auspicious — suitable for most positive activities and important tasks.',
    mixed:     'Proceed mindfully. Favourable for spiritual practice, self-care, and reflection. (Janma Nakshatra days fall here.)',
    poor:      'Less favourable — avoid major decisions; focus on routine and maintenance.',
    very_bad:  'Inauspicious — rest, reflection, and spiritual practice are recommended.',
  }
  for (const [tier, label] of Object.entries(TIER_LABELS)) {
    const [r, g, b] = TIER_COLORS[tier]
    doc.setFillColor(r, g, b)
    doc.roundedRect(RX, ry, COL_W_R, 9.5, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(20, 20, 20)
    doc.text(label, RX + 3, ry + 4)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.5)
    doc.setTextColor(40, 40, 40)
    const dl = doc.splitTextToSize(TIER_DESC[tier], COL_W_R - 6)
    doc.text(dl, RX + 3, ry + 7.5)
    ry += 9.5 + 1.5
  }
  ry += 4

  ry = secHead('HOW TO READ EACH DAY', RX, ry, COL_W_R)
  const TERM_W = COL_W_R * 0.38
  const VAL_W  = COL_W_R * 0.60
  const VAL_X  = RX + TERM_W + 2
  const CELL_GUIDE = [
    ['Background colour',  'Auspiciousness tier of the sunrise Nakshatra'],
    ['Split background',   'Nakshatra transitions — each band shows the tier for that period'],
    ['Number (top-right)', 'Calendar day of the month'],
    ['White circle',       'Purnima — Full Moon'],
    ['Black circle',       'Amavasya — New Moon (dark fortnight)'],
    ['Saffron stripe',     'Self-auspicious day (Swayam-siddha) — universally auspicious'],
    ['Nakshatra name',     'Lunar mansion active at sunrise — sets the day\'s Tara'],
    ['Tara N: Name',       'Your personal Tara based on your birth Nakshatra'],
    ['Transition section', 'Exact local times when Nakshatra or Tithi changes'],
  ]
  for (const [term, val] of CELL_GUIDE) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5.5)
    doc.setTextColor(15, 80, 45)
    const tl = doc.splitTextToSize(term, TERM_W)
    doc.text(tl, RX, ry)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.5)
    doc.setTextColor(40, 40, 40)
    const vl = doc.splitTextToSize(val, VAL_W)
    doc.text(vl, VAL_X, ry)
    ry += Math.max(tl.length, vl.length) * 2.7 + 1.2
  }
  ry += 4

  ry = secHead('SELF-AUSPICIOUS DAYS', RX, ry, COL_W_R)
  ry = para(
    'Four days per year are Swayam-siddha ("self-proven") — universally auspicious regardless of your personal Tarabalam. Marked with a saffron stripe at the top of the cell:',
    RX, ry, COL_W_R
  )
  ry += 2.5
  const SA_DAYS = [
    ['Yugadi',           'Hindu New Year — Chaitra Shukla Pratipada'],
    ['Akshaya Tritiya',  'Vaishakha Shukla Tritiya — day of inexhaustible merit'],
    ['Vijaya Dashami',   'Ashvina Shukla Dashami — the day of victory'],
    ['Balipratipada',    'Kartika Shukla Pratipada — day of abundance'],
  ]
  for (const [name, desc] of SA_DAYS) {
    doc.setFillColor(200, 90, 0)
    doc.rect(RX, ry - 1.2, 4, 4, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5.8)
    doc.setTextColor(15, 80, 45)
    doc.text(name, RX + 6, ry + 1.4)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.4)
    doc.setTextColor(55, 55, 55)
    const dl = doc.splitTextToSize(desc, COL_W_R - 48)
    doc.text(dl, RX + 47, ry + 1.4)
    ry += 5.2
  }

  // Gold bottom strip
  doc.setFillColor(...HEADER_GOLD)
  doc.rect(0, PAGE_H - 2, PAGE_W, 2, 'F')
}

function drawPhotoPage(doc, imageData, monthName, deity) {
  // Full-page image (or deep-green fallback)
  if (imageData) {
    doc.addImage(imageData, 'JPEG', 0, 0, PAGE_W, PAGE_H)
  } else {
    doc.setFillColor(...HEADER_BG)
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F')
  }

  // Dark gradient overlay at the bottom
  const overlayH = 62
  const overlayY = PAGE_H - overlayH
  doc.setFillColor(5, 5, 5)
  doc.rect(0, overlayY, PAGE_W, overlayH, 'F')

  // Gold top edge of overlay
  doc.setFillColor(...HEADER_GOLD)
  doc.rect(0, overlayY, PAGE_W, 1.2, 'F')

  // Month name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(30)
  doc.setTextColor(...HEADER_GOLD)
  doc.text(monthName.toUpperCase(), PAGE_W / 2, overlayY + 17, { align: 'center' })

  // Deity name
  doc.setFontSize(17)
  doc.setTextColor(230, 230, 230)
  doc.text(deity.name, PAGE_W / 2, overlayY + 30, { align: 'center' })

  // Festival
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(180, 180, 180)
  doc.text(deity.festival, PAGE_W / 2, overlayY + 41, { align: 'center' })

  // Mantra
  doc.setFontSize(8.5)
  doc.setTextColor(120, 120, 120)
  doc.text(deity.mantra, PAGE_W / 2, overlayY + 52, { align: 'center' })
}

function drawCalendarPage(doc, monthData, nakshatra, locationLabel, timezone, monthIdx, deity) {
  // ── Full-width header banner ────────────────────────────
  const BANNER_H = 24
  doc.setFillColor(...HEADER_BG)
  doc.rect(0, 0, PAGE_W, BANNER_H, 'F')

  doc.setFillColor(...HEADER_GOLD)
  doc.rect(0, 0, PAGE_W, 1.5, 'F')

  // Deity reference — top-left caption
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(180, 220, 190)
  doc.text(`${deity.name}  ·  ${deity.festival}`, MARGIN, 7)

  // Month + year — large, centred
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...HEADER_GOLD)
  doc.text(`${monthData.month_name.toUpperCase()} ${monthData.month_name.includes('') ? '' : ''}`, PAGE_W / 2, 13, { align: 'center' })

  // Nakshatra subtitle
  doc.setFontSize(8.5)
  doc.setTextColor(200, 240, 210)
  doc.text(
    `${nakshatra.name} Nakshatra  ·  Ruler: ${nakshatra.ruler}  ·  Deity: ${nakshatra.deity}`,
    PAGE_W / 2, 19, { align: 'center' }
  )

  // Location — right-aligned
  doc.setFontSize(6.5)
  doc.setTextColor(150, 210, 170)
  doc.text(`${locationLabel}  ·  ${timezone}`, PAGE_W - MARGIN, 23, { align: 'right' })

  doc.setFillColor(...HEADER_GOLD)
  doc.rect(0, BANNER_H - 1.2, PAGE_W, 1.2, 'F')

  let y = BANNER_H + 2

  // ── Legend (first calendar page only) ──────────────────
  if (monthIdx === 0) {
    const LEGEND_H = 7
    const legendW  = CONTENT_W / 5
    Object.entries(TIER_LABELS).forEach(([tier, label], i) => {
      const lx = MARGIN + i * legendW
      const [r, g, b] = TIER_COLORS[tier]
      doc.setFillColor(r, g, b)
      doc.roundedRect(lx, y, legendW - 1, LEGEND_H, 1, 1, 'F')
      doc.setDrawColor(...GRID_BORDER)
      doc.setLineWidth(0.3)
      doc.roundedRect(lx, y, legendW - 1, LEGEND_H, 1, 1, 'S')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.5)
      doc.setTextColor(20, 20, 20)
      doc.text(label, lx + (legendW - 1) / 2, y + 4.5, { align: 'center' })
    })
    y += LEGEND_H + 1.5

    const moonR = 1.5
    const iconY = y + 2.5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor(40, 40, 40)

    doc.setFillColor(255, 255, 255); doc.setDrawColor(70, 70, 70); doc.setLineWidth(0.3)
    doc.ellipse(MARGIN + 2, iconY, moonR, moonR, 'FD')
    doc.text('Purnima (Full Moon)', MARGIN + 5.5, iconY + 0.6)

    doc.setFillColor(30, 30, 30)
    doc.ellipse(MARGIN + 52, iconY, moonR, moonR, 'F')
    doc.text('Amavasya (New Moon)', MARGIN + 55.5, iconY + 0.6)

    doc.setFillColor(200, 90, 0)
    doc.roundedRect(MARGIN + 104, iconY - 2, 7, 3.5, 0.5, 0.5, 'F')
    doc.setTextColor(40, 40, 40)
    doc.text('Self-auspicious day  (Yugadi / Akshaya Tritiya / Vijaya Dashami / Balipratipada)', MARGIN + 113, iconY + 0.6)

    y += 8
  }

  // ── Day-of-week header ──────────────────────────────────
  const DOW_H = 7
  doc.setFillColor(...DOW_BG)
  doc.rect(MARGIN, y, CONTENT_W, DOW_H, 'F')
  DAY_NAMES.forEach((name, i) => {
    if (i === 5 || i === 6) {
      doc.setFillColor(20, 90, 50)
      doc.rect(MARGIN + i * COL_W, y, COL_W, DOW_H, 'F')
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(255, 255, 255)
    doc.text(name, MARGIN + i * COL_W + COL_W / 2, y + 4.8, { align: 'center' })
  })
  doc.setDrawColor(...GRID_BORDER)
  doc.setLineWidth(0.4)
  doc.rect(MARGIN, y, CONTENT_W, DOW_H, 'S')
  y += DOW_H

  // ── Calendar grid ───────────────────────────────────────
  const grid = buildWeekGrid(monthData.days)
  const rowH  = (PAGE_H - y - MARGIN) / grid.length
  grid.forEach((week, wi) => {
    const rowY = y + wi * rowH
    week.forEach((day, di) => drawCell(doc, MARGIN + di * COL_W, rowY, COL_W, rowH, day))
  })

  // Thick outer border for entire grid
  doc.setDrawColor(...GRID_BORDER)
  doc.setLineWidth(0.6)
  doc.rect(MARGIN, y, CONTENT_W, rowH * grid.length, 'S')
}

export async function generatePdf(calendarData, locationLabel) {
  const { default: jsPDF } = await import('jspdf')

  const { nakshatra, year, timezone, months } = calendarData
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // Pre-load all deity images in parallel
  const images = await Promise.all(
    MONTH_DEITIES.map((d) => loadImageAsBase64(`${BASE}images/deities/${d.file}`))
  )

  // Cover page (uses first month's deity image — Surya)
  drawCoverPage(doc, images[0], year, nakshatra, locationLabel, timezone)

  // Explanation / how-to-read page
  doc.addPage()
  drawIntroPage(doc, nakshatra, year)

  // Monthly pages: photo + calendar grid
  for (let i = 0; i < months.length; i++) {
    doc.addPage()
    drawPhotoPage(doc, images[i], months[i].month_name, MONTH_DEITIES[i])
    doc.addPage()
    drawCalendarPage(doc, months[i], nakshatra, locationLabel, timezone, i, MONTH_DEITIES[i])
  }

  doc.save(`tarabalam_${year}_${nakshatra.name.replace(/ /g, '_')}.pdf`)
}
