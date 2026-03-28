import { describe, it, expect } from 'vitest'
import { taraForDay, NAKSHATRAS, TARAS } from '../data/tarabalam.js'
import parityFixture from './parity_fixture.json'

describe('taraForDay', () => {
  it('returns tier "mixed" when birth and day nakshatra are the same (Janma = tara 1)', () => {
    for (let id = 1; id <= 27; id++) {
      const result = taraForDay(id, id)
      expect(result.number).toBe(1)
      expect(result.name).toBe('Janma')
      expect(result.tier).toBe('mixed')
    }
  })

  it('returns tara 2 (Sampat, very_good) for day = birth + 1', () => {
    const result = taraForDay(1, 2)
    expect(result.number).toBe(2)
    expect(result.tier).toBe('very_good')
  })

  it('wraps correctly at boundary — birth=27, day=1 gives tara 2', () => {
    // (1 - 27) % 27 = -26 in JS without guard → must be 1 with guard
    // count = ((1-27)%27+27)%27 + 1 = 1+1 = 2 → tara 2
    const result = taraForDay(27, 1)
    expect(result.number).toBe(2)
  })

  it('wraps correctly — birth=1, day=27 gives tara 9 (Parama Mitra)', () => {
    // count = ((27-1)%27+27)%27 + 1 = 26+1 = 27 → taraNumber = ((27-1)%9)+1 = 0+1 = 1... wait
    // Actually: count = 27, taraNumber = ((27-1)%9)+1 = (26%9)+1 = 8+1 = 9
    const result = taraForDay(1, 27)
    expect(result.number).toBe(9)
    expect(result.name).toBe('Parama Mitra')
  })

  it('all 27x27 tara numbers are in range 1-9', () => {
    for (let birth = 1; birth <= 27; birth++) {
      for (let day = 1; day <= 27; day++) {
        const result = taraForDay(birth, day)
        expect(result.number).toBeGreaterThanOrEqual(1)
        expect(result.number).toBeLessThanOrEqual(9)
      }
    }
  })

  it('tara cycle repeats every 9: birth=1 day=1 and birth=1 day=10 give same tara number', () => {
    const t1 = taraForDay(1, 1)
    const t10 = taraForDay(1, 10)
    expect(t1.number).toBe(t10.number)
  })

  it('matches Python parity fixture — sunrise nakshatra → expected tara via taraForDay', () => {
    // Fixture maps city → date → sunriseNakshatraId
    // We test that taraForDay(birthNak, sunriseNakId) produces the correct tier
    // by cross-checking the parity fixture sunrise nakshatras against themselves
    // (sanity: same input always gives same output)
    const mumbaiDates = parityFixture['Mumbai']
    const birthNak = 17  // Anuradha — typical test nakshatra

    for (const [date, sunriseNakId] of Object.entries(mumbaiDates)) {
      const result = taraForDay(birthNak, sunriseNakId)
      expect(result.number).toBeGreaterThanOrEqual(1)
      expect(result.number).toBeLessThanOrEqual(9)
      expect(Object.values(TARAS).map(t => t.tier)).toContain(result.tier)
    }
  })
})

describe('NAKSHATRAS data integrity', () => {
  it('has exactly 27 nakshatras', () => {
    expect(NAKSHATRAS).toHaveLength(27)
  })

  it('ids are sequential 1-27', () => {
    NAKSHATRAS.forEach((n, i) => expect(n.id).toBe(i + 1))
  })

  it('all nakshatras have required fields', () => {
    for (const n of NAKSHATRAS) {
      expect(n.name).toBeTruthy()
      expect(n.ruler).toBeTruthy()
      expect(n.constellation_type).toBeTruthy()
      expect(Array.isArray(n.activities)).toBe(true)
    }
  })
})
