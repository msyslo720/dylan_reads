import dayjs from 'dayjs'

export const SUMMER_START = dayjs('2026-06-08')
export const SUMMER_END = dayjs('2026-08-13')

export const TOTAL_SCHOOL_DAYS = 49 // June 8 – Aug 13, M–F

export function getSummerSchoolDays(): dayjs.Dayjs[] {
  const days: dayjs.Dayjs[] = []
  let current = SUMMER_START
  while (!current.isAfter(SUMMER_END, 'day')) {
    const dow = current.day()
    if (dow >= 1 && dow <= 5) days.push(current)
    current = current.add(1, 'day')
  }
  return days
}

// Returns weeks as arrays of Mon–Fri (null for days outside the range)
export function getSummerWeeks(): (dayjs.Dayjs | null)[][] {
  const weekMap = new Map<string, (dayjs.Dayjs | null)[]>()
  getSummerSchoolDays().forEach(day => {
    // Key by the Monday of that week
    const monday = day.subtract(day.day() - 1, 'day')
    const weekKey = monday.format('YYYY-MM-DD')
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, [null, null, null, null, null])
    }
    weekMap.get(weekKey)![day.day() - 1] = day // day.day() 1=Mon…5=Fri
  })
  return Array.from(weekMap.values())
}

export function getCurrentWeekSchoolDays(): dayjs.Dayjs[] {
  const today = dayjs()
  const monday = today.subtract(today.day() - 1, 'day')
  const friday = monday.add(4, 'day')
  return getSummerSchoolDays().filter(
    d => !d.isBefore(monday, 'day') && !d.isAfter(friday, 'day')
  )
}

export function formatDate(date: dayjs.Dayjs): string {
  return date.format('YYYY-MM-DD')
}

export function isToday(date: dayjs.Dayjs): boolean {
  return date.isSame(dayjs(), 'day')
}

export function isPast(date: dayjs.Dayjs): boolean {
  return date.isBefore(dayjs(), 'day')
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function monthAbbr(date: dayjs.Dayjs): string {
  return MONTHS[date.month()]
}

export function formatModalDate(dateStr: string): string {
  const d = dayjs(dateStr)
  return `${DAYS_LONG[d.day()]}, ${MONTHS_LONG[d.month()]} ${d.date()}`
}
