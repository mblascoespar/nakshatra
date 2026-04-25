/**
 * NOAA solar position algorithm.
 * Accurate to within ~1 minute for dates 1950-2050.
 *
 * Returns sunrise as UTC minutes-since-midnight for the given date + location.
 * Returns null for polar day (midnight sun) or polar night.
 */

function _julianDay(year, month, day) {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
}

export function sunriseUTCMinutes(year, month, day, lat, lon) {
  const JD = _julianDay(year, month, day)
  const T  = (JD - 2451545.0) / 36525.0

  const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360
  const M  = 357.52911 + T * (35999.05029 - 0.0001537 * T)
  const Mr = M * Math.PI / 180

  const C  = Math.sin(Mr) * (1.914602 - T * (0.004817 + 0.000014 * T))
           + Math.sin(2 * Mr) * (0.019993 - 0.000101 * T)
           + Math.sin(3 * Mr) * 0.000289

  const sl  = L0 + C
  const om  = (125.04 - 1934.136 * T) * Math.PI / 180
  const la  = sl - 0.00569 - 0.00478 * Math.sin(om)

  const e0  = 23 + (26 + (21.448 - T * (46.8150 + T * (0.00059 - T * 0.001813))) / 60) / 60
  const eA  = e0 + 0.00256 * Math.cos(om)
  const eAr = eA * Math.PI / 180

  const dec = Math.asin(Math.sin(eAr) * Math.sin(la * Math.PI / 180))

  // Equation of time (minutes)
  const e   = 0.016708634 - T * (0.000042037 + 0.0000001267 * T)
  const yy  = Math.tan(eAr / 2) ** 2
  const l0r = L0 * Math.PI / 180
  const EqT = 4 * (180 / Math.PI) * (
    yy * Math.sin(2 * l0r)
    - 2 * e * Math.sin(Mr)
    + 4 * e * yy * Math.sin(Mr) * Math.cos(2 * l0r)
    - 0.5 * yy * yy * Math.sin(4 * l0r)
    - 1.25 * e * e * Math.sin(2 * Mr)
  )

  // Hour angle at sunrise (90.833° = 90° + refraction + solar disc radius)
  const latR = lat * Math.PI / 180
  const cosH = (Math.cos(90.833 * Math.PI / 180) - Math.sin(latR) * Math.sin(dec))
             / (Math.cos(latR) * Math.cos(dec))
  if (Math.abs(cosH) > 1) return null

  const H = Math.acos(cosH) * 180 / Math.PI
  return 720 - 4 * lon - EqT - H * 4
}
