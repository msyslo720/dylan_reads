import { useState, useEffect, useCallback } from 'react'
import dayjs from 'dayjs'
import { supabase } from '../lib/supabase'
import { Calendar } from '../components/Calendar'
import { DayModal } from '../components/DayModal'
import { getSummerSchoolDays, getCurrentWeekSchoolDays, SUMMER_START, SUMMER_END, formatDate } from '../lib/dates'
import type { Book, ReadingEntry } from '../lib/types'

const BONUS_MILESTONES = [5, 15, 30]

export function HomePage() {
  const [entries, setEntries] = useState<Record<string, ReadingEntry>>({})
  const [books, setBooks] = useState<Book[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const [booksRes, logRes] = await Promise.all([
      supabase.from('books').select('*').order('title'),
      supabase
        .from('reading_log')
        .select('*, book:books(*)')
        .gte('date', SUMMER_START.format('YYYY-MM-DD'))
        .lte('date', SUMMER_END.format('YYYY-MM-DD')),
    ])

    if (booksRes.data) setBooks(booksRes.data)

    if (logRes.data) {
      const map: Record<string, ReadingEntry> = {}
      logRes.data.forEach((e: ReadingEntry) => { map[e.date] = e })
      setEntries(map)
    }

    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Weekly stats
  const today = dayjs()
  const weekDays = getCurrentWeekSchoolDays()
  const weekCompleted = weekDays.filter(d => {
    if (d.isAfter(today, 'day')) return false
    const e = entries[formatDate(d)] as ReadingEntry | undefined
    return e && e.amount_read >= (e.book?.daily_goal ?? 1)
  })
  const weekPct = weekDays.length > 0
    ? Math.round((weekCompleted.length / weekDays.length) * 100)
    : 0

  // Overall stats
  const allElapsed = getSummerSchoolDays().filter(d => !d.isAfter(today, 'day'))
  const allCompleted = allElapsed.filter(d => {
    const e = entries[formatDate(d)] as ReadingEntry | undefined
    return e && e.amount_read >= (e.book?.daily_goal ?? 1)
  })
  const overallPct = allElapsed.length > 0
    ? Math.round((allCompleted.length / allElapsed.length) * 100)
    : 0

  // Bonus points
  const bonusPoints = Object.values(entries).filter(e => {
    const goal = e.book?.daily_goal ?? 1
    return e.amount_read >= Math.ceil(goal * 1.5)
  }).length
  const nextMilestone = BONUS_MILESTONES.find(m => bonusPoints < m) ?? null

  const selectedEntry = selectedDate
    ? (entries[selectedDate] as ReadingEntry | undefined)
    : undefined

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <p className="text-gray-400 text-sm">Summer 2026 · June 8 – August 13</p>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="flex flex-col gap-3 mb-6">
            {/* Weekly + Overall */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">This Week</div>
                <div className="text-3xl font-bold text-blue-600">{weekPct}%</div>
                <div className="text-xs text-gray-400 mt-0.5">{weekCompleted.length} / {weekDays.length} days</div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${weekPct}%` }} />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Overall</div>
                <div className="text-3xl font-bold text-green-600">{overallPct}%</div>
                <div className="text-xs text-gray-400 mt-0.5">{allCompleted.length} / {allElapsed.length} days</div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${overallPct}%` }} />
                </div>
              </div>
            </div>

            {/* Bonus points */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Bonus Points</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {nextMilestone !== null
                      ? `${nextMilestone - bonusPoints} more to next award (${nextMilestone} pts)`
                      : 'All awards unlocked!'}
                  </div>
                </div>
                <div className="text-3xl font-bold text-amber-500">{bonusPoints}</div>
              </div>

              {/* Stars + bar + labels */}
              <div className="relative">
                {/* Milestone stars */}
                <div className="relative h-5">
                  {BONUS_MILESTONES.map(m => (
                    <div
                      key={m}
                      className="absolute flex items-center justify-center"
                      style={{ left: `${(m / 30) * 100}%`, transform: 'translateX(-50%)' }}
                    >
                      <span className={`text-sm leading-none ${bonusPoints >= m ? 'text-amber-400' : 'text-gray-200'}`}>
                        &#9733;
                      </span>
                    </div>
                  ))}
                </div>

                {/* Track */}
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((bonusPoints / 30) * 100, 100)}%` }}
                  />
                </div>

                {/* Labels */}
                <div className="relative h-5 mt-0.5">
                  {BONUS_MILESTONES.map(m => (
                    <span
                      key={m}
                      className={`absolute text-xs ${bonusPoints >= m ? 'text-amber-500 font-medium' : 'text-gray-300'}`}
                      style={{ left: `${(m / 30) * 100}%`, transform: 'translateX(-50%)' }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-300 text-sm">Loading...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <Calendar entries={entries} onDayClick={setSelectedDate} />
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-gray-400">
          {[
            { color: 'bg-green-400', label: 'Goal met' },
            { color: 'bg-red-300', label: 'Missed' },
            { color: 'bg-yellow-400', label: 'Today' },
            { color: 'bg-gray-200', label: 'Upcoming' },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded ${color} inline-block`} />
              {label}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-100 border-2 border-amber-400 inline-block" />
            Bonus day
          </span>
        </div>

        <p className="text-center text-xs text-gray-300 mt-3">
          Tap any day to log your reading
        </p>
      </div>

      {selectedDate && (
        <DayModal
          date={selectedDate}
          entry={selectedEntry}
          books={books}
          onClose={() => setSelectedDate(null)}
          onSaved={() => { loadData(); setSelectedDate(null) }}
        />
      )}
    </div>
  )
}
