import type { Dayjs } from 'dayjs'
import { getSummerWeeks, isToday, isPast, formatDate, monthAbbr } from '../lib/dates'
import type { ReadingEntry } from '../lib/types'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

function cellClass(
  day: Dayjs,
  entry: ReadingEntry | undefined,
): string {
  const base =
    'flex flex-col items-center justify-center rounded-xl transition-all duration-150 select-none h-16 sm:h-20'

  if (!entry) {
    if (isToday(day))
      return `${base} bg-yellow-50 border-2 border-yellow-400 text-yellow-800 cursor-pointer hover:bg-yellow-100 active:scale-95`
    if (isPast(day))
      return `${base} bg-red-50 border-2 border-red-300 text-red-700 cursor-pointer hover:bg-red-100 active:scale-95`
    return `${base} bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-pointer hover:bg-gray-100 active:scale-95`
  }

  const dailyGoal = entry.book?.daily_goal ?? 1
  const goalMet = entry.amount_read >= dailyGoal
  const bonusEarned = entry.amount_read >= Math.ceil(dailyGoal * 1.5)

  if (goalMet && bonusEarned)
    return `${base} bg-green-50 border-2 border-amber-400 text-green-800 cursor-pointer hover:bg-green-100 active:scale-95`
  if (goalMet)
    return `${base} bg-green-50 border-2 border-green-400 text-green-800 cursor-pointer hover:bg-green-100 active:scale-95`
  return `${base} bg-orange-50 border-2 border-orange-300 text-orange-700 cursor-pointer hover:bg-orange-100 active:scale-95`
}

interface Props {
  entries: Record<string, ReadingEntry>
  onDayClick: (date: string) => void
}

export function Calendar({ entries, onDayClick }: Props) {
  const weeks = getSummerWeeks()

  return (
    <div className="w-full">
      <div className="grid grid-cols-5 gap-1.5 mb-2">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-5 gap-1.5">
            {week.map((day, di) => {
              if (!day) return <div key={di} className="h-16 sm:h-20" />

              const dateStr = formatDate(day)
              const entry = entries[dateStr] as ReadingEntry | undefined

              return (
                <div
                  key={di}
                  className={cellClass(day, entry)}
                  onClick={() => onDayClick(dateStr)}
                >
                  <span className="text-xs font-medium opacity-50 leading-none">
                    {monthAbbr(day)}
                  </span>
                  <span className="text-lg sm:text-xl font-bold leading-tight">{day.date()}</span>
                  {entry && (
                    <span className="text-xs opacity-60 leading-none mt-0.5">
                      {entry.amount_read}
                      {entry.book?.goal_type === 'chapters' ? 'ch' : 'pg'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
