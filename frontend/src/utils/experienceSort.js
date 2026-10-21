// Experience sorting for the existing free-text `period` field.
// Supports English/Indonesian month names, year-only dates and YYYY-MM(-DD).
const MONTHS = {
  jan: 1, january: 1, januari: 1,
  feb: 2, february: 2, februari: 2,
  mar: 3, march: 3, maret: 3,
  apr: 4, april: 4,
  may: 5, mei: 5,
  jun: 6, june: 6, juni: 6,
  jul: 7, july: 7, juli: 7,
  aug: 8, august: 8, agu: 8, agustus: 8, agt: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10, okt: 10, oktober: 10,
  nov: 11, november: 11,
  dec: 12, december: 12, des: 12, desember: 12,
}

const ONGOING = /^(?:present|current|ongoing|now|sekarang|saat\s+ini|hingga\s+kini|masih\s+berlangsung)$/i

function monthValue(value, defaultMonth = 12) {
  if (!value) return null
  const text = String(value).trim().toLowerCase()

  // ISO date formats: 2025-02, 2025-02-14, 2025/02
  const iso = text.match(/^(\d{4})[-/](\d{1,2})(?:[-/](\d{1,2}))?$/)
  if (iso) {
    const month = Number(iso[2])
    return month >= 1 && month <= 12 ? Number(iso[1]) * 12 + month : null
  }

  // e.g. "Feb 2025", "Februari 2025", "2025 Feb", "2025"
  const yearMatch = text.match(/\b(?:19|20)\d{2}\b/)
  if (!yearMatch) return null
  const year = Number(yearMatch[0])
  const monthText = text.replace(yearMatch[0], '').replace(/[.,]/g, '').trim()
  if (!monthText) return year * 12 + defaultMonth
  const month = MONTHS[monthText]
  return month ? year * 12 + month : null
}

function getSortData(item) {
  const period = String(item?.period || '').trim()
  // Distinguish punctuation separating ranges from dashes in ISO dates.
  const normalized = period.replace(/\s*[–—]\s*/g, ' - ').replace(/(\b\d{4})-(\d{4}\b)/g, '$1 - $2')
  const parts = normalized.split(/\s+(?:-|to|sampai|hingga)\s+/i).map((part) => part.trim())
  const fromPeriod = monthValue(parts[0], 1)
  const untilPeriod = parts.length > 1 ? monthValue(parts[parts.length - 1], 12) : monthValue(parts[0], 12)
  const currentByPeriod = parts.length > 1 && ONGOING.test(parts[parts.length - 1])

  // Optional structured dates supported if added later; no backend change required.
  const explicitStart = item?.startDate ?? item?.start_date
  const explicitEnd = item?.endDate ?? item?.end_date
  const hasExplicitStart = Boolean(explicitStart)
  const start = monthValue(explicitStart, 1) ?? fromPeriod
  const isOngoing = item?.isCurrent === true || item?.is_current === true ||
    currentByPeriod || (hasExplicitStart && !explicitEnd)
  const end = isOngoing ? null : (monthValue(explicitEnd, 12) ?? untilPeriod)

  return { isOngoing, start: start ?? -Infinity, end: end ?? -Infinity }
}

/** Returns a new array, leaving the original experiences state unchanged. */
export function sortExperiencesByDate(experiences = []) {
  return [...experiences].sort((a, b) => {
    const left = getSortData(a)
    const right = getSortData(b)
    if (left.isOngoing !== right.isOngoing) return left.isOngoing ? -1 : 1
    // Among ongoing experiences, show the most recently started first.
    // Otherwise, order by latest end date (then start date for ties).
    const first = left.isOngoing ? left.start : left.end
    const second = right.isOngoing ? right.start : right.end
    return second - first || right.start - left.start
  })
}
