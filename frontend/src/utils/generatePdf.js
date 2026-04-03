/**
 * Client-side PDF generation.
 * Replicates the original reportlab output: one A4 portrait page per month,
 * calendar grid with cells coloured by tarabalam tier.
 *
 * jsPDF is loaded lazily (dynamic import) so it doesn't bloat the initial bundle.
 */

const TIER_COLORS = {
  very_good: [76,  175,  80],
  good:      [165, 214, 167],
  mixed:     [255, 249, 196],
  poor:      [255, 205, 210],
  very_bad:  [229, 115, 115],
}

const TIER_LABELS = {
  very_good: 'Very Good',
  good:      'Good',
  mixed:     'Mixed',
  poor:      'Poor',
  very_bad:  'Very Bad',
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// A4 portrait
const PAGE_W   = 210
const PAGE_H   = 297
const MARGIN   = 10
const CONTENT_W = PAGE_W - 2 * MARGIN
const COL_W    = CONTENT_W / 7

/**
 * Build a week grid from a month's days array.
 * Returns an array of 7-element arrays (null = empty cell).
 * day_of_week: 0=Mon … 6=Sun (Python weekday convention).
 */
function buildWeekGrid(days) {
  const grid = []
  let week = Array(7).fill(null)

  for (const day of days) {
    week[day.day_of_week] = day
    if (day.day_of_week === 6) {
      grid.push(week)
      week = Array(7).fill(null)
    }
  }
  if (week.some((d) => d !== null)) grid.push(week)
  return grid
}

function drawCell(doc, cellX, cellY, cellW, cellH, day) {
  // Background
  if (day === null) {
    doc.setFillColor(245, 245, 245)
  } else {
    const [r, g, b] = TIER_COLORS[day.tarabalam_tier]
    doc.setFillColor(r, g, b)
  }
  doc.rect(cellX, cellY, cellW, cellH, 'F')

  // Border
  doc.setDrawColor(180, 180, 180)
  doc.setLineWidth(0.2)
  doc.rect(cellX, cellY, cellW, cellH, 'S')

  if (day === null) return

  const pad = 1.5
  const textW = cellW - 2 * pad
  let ty = cellY + pad

  // Day number
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(0, 0, 0)
  const dayNum = parseInt(day.date.split('-')[2], 10)
  ty += 3
  doc.text(String(dayNum), cellX + pad, ty)
  ty += 3.5

  // Nakshatra name
  doc.setFontSize(7)
  const nakLines = doc.splitTextToSize(day.sunrise_nakshatra_name, textW)
  doc.text(nakLines, cellX + pad, ty)
  ty += nakLines.length * 3

  const hasTransitions = day.nakshatra_transitions.length > 0

  // Reserve space for transitions section at the bottom
  const transitionLines = day.nakshatra_transitions.map((t) => t.nakshatra_name)
  const transitionBlockH = hasTransitions ? 1.5 + transitionLines.length * 2.5 + 1 : 0
  const maxY = cellY + cellH - transitionBlockH - 1.5

  // Activities (only for favorable tiers: very_good, good)
  const showActivities = ['very_good', 'good'].includes(day.tarabalam_tier)
  if (showActivities) {
    doc.setFontSize(5.5)
    doc.setTextColor(30, 30, 30)
    for (const activity of day.activities) {
      if (ty >= maxY) break
      const lines = doc.splitTextToSize(`\u00B7 ${activity}`, textW)
      for (const line of lines) {
        if (ty >= maxY) break
        doc.text(line, cellX + pad, ty)
        ty += 2.6
      }
    }
  }

  // Nakshatra transitions section
  if (hasTransitions) {
    ty = cellY + cellH - transitionBlockH
    doc.setDrawColor(120, 120, 120)
    doc.setLineWidth(0.15)
    doc.line(cellX + pad, ty, cellX + cellW - pad, ty)
    ty += 2.2

    doc.setFontSize(5)
    doc.setTextColor(80, 80, 140)
    for (const nakName of transitionLines) {
      if (ty >= cellY + cellH - 1) break
      doc.text(nakName, cellX + pad, ty)
      ty += 2.5
    }
  }
}

export async function generatePdf(calendarData, locationLabel) {
  const { default: jsPDF } = await import('jspdf')

  const { nakshatra, year, timezone, months } = calendarData
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  months.forEach((monthData, monthIdx) => {
    if (monthIdx > 0) doc.addPage()

    let y = MARGIN

    // ── Title ──────────────────────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    y += 8
    doc.text(`${monthData.month_name} ${year} \u2014 ${nakshatra.name} Nakshatra`, MARGIN, y)
    y += 5

    // ── Subtitle ───────────────────────────────────────────
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `Ruler: ${nakshatra.ruler} \u00B7 Deity: ${nakshatra.deity} \u00B7 ${locationLabel} \u00B7 ${timezone}`,
      MARGIN, y
    )
    y += 4

    // ── Separator ──────────────────────────────────────────
    doc.setDrawColor(210, 210, 210)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, y, PAGE_W - MARGIN, y)
    y += 3

    // ── Legend bar ─────────────────────────────────────────
    const LEGEND_H = 6
    const legendW = CONTENT_W / 5
    Object.entries(TIER_LABELS).forEach(([tier, label], i) => {
      const lx = MARGIN + i * legendW
      const [r, g, b] = TIER_COLORS[tier]
      doc.setFillColor(r, g, b)
      doc.rect(lx, y, legendW, LEGEND_H, 'F')
      doc.setDrawColor(160, 160, 160)
      doc.setLineWidth(0.2)
      doc.rect(lx, y, legendW, LEGEND_H, 'S')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.5)
      doc.setTextColor(0, 0, 0)
      doc.text(label, lx + legendW / 2, y + 4, { align: 'center' })
    })
    y += LEGEND_H + 1

    // ── Day-of-week header ─────────────────────────────────
    const HEADER_H = 6
    doc.setFillColor(50, 50, 50)
    doc.rect(MARGIN, y, CONTENT_W, HEADER_H, 'F')
    DAY_NAMES.forEach((name, i) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.setTextColor(255, 255, 255)
      doc.text(name, MARGIN + i * COL_W + COL_W / 2, y + 4, { align: 'center' })
    })
    y += HEADER_H

    // ── Calendar grid ──────────────────────────────────────
    const grid = buildWeekGrid(monthData.days)
    const rowH = (PAGE_H - y - MARGIN) / grid.length

    grid.forEach((week, wi) => {
      const rowY = y + wi * rowH
      week.forEach((day, di) => {
        drawCell(doc, MARGIN + di * COL_W, rowY, COL_W, rowH, day)
      })
    })
  })

  doc.save(`tarabalam_${year}_${nakshatra.name.replace(/ /g, '_')}.pdf`)
}
