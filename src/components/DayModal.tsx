import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatModalDate } from '../lib/dates'
import type { Book, ReadingEntry } from '../lib/types'

interface Props {
  date: string
  entry: ReadingEntry | undefined
  books: Book[]
  onClose: () => void
  onSaved: () => void
}

export function DayModal({ date, entry, books, onClose, onSaved }: Props) {
  const [bookId, setBookId] = useState(entry?.book_id ?? '')
  const [amountRead, setAmountRead] = useState(entry?.amount_read?.toString() ?? '')
  const [summary, setSummary] = useState(entry?.summary ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const activeBooks = books.filter(b => b.active)
  const selectedBook = activeBooks.find(b => b.id === bookId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!bookId) { setError('Please select a book'); return }
    const amount = parseInt(amountRead)
    if (!amount || amount <= 0) { setError('Please enter a valid amount'); return }

    setSaving(true)
    setError('')

    const payload = {
      date,
      book_id: bookId,
      amount_read: amount,
      summary: summary.trim() || null,
      updated_at: new Date().toISOString(),
    }

    const { error: err } = entry
      ? await supabase.from('reading_log').update(payload).eq('id', entry.id)
      : await supabase.from('reading_log').insert(payload)

    setSaving(false)
    if (err) {
      setError(err.message)
    } else {
      onSaved()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{formatModalDate(date)}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {activeBooks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No books in the list yet. Ask a parent to add books on the Admin page.
            </p>
          ) : (
            <>
              {/* Book selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Book</label>
                <select
                  value={bookId}
                  onChange={e => setBookId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">— Select a book —</option>
                  {activeBooks.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title}{b.author ? ` — ${b.author}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount read */}
              {selectedBook && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {selectedBook.goal_type === 'chapters' ? 'Chapters read' : 'Pages read'}
                    <span className="text-gray-400 font-normal ml-1.5">
                      (daily goal: {selectedBook.daily_goal})
                    </span>
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={amountRead}
                    onChange={e => setAmountRead(e.target.value)}
                    placeholder={selectedBook.goal_type === 'chapters' ? 'e.g. 2' : 'e.g. 15'}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedBook && amountRead && parseInt(amountRead) > 0 && (() => {
                    const n = parseInt(amountRead)
                    const bonusAt = Math.ceil(selectedBook.daily_goal * 1.5)
                    if (n >= bonusAt)
                      return <p className="text-xs mt-1 text-amber-500 font-medium">Bonus point earned!</p>
                    if (n >= selectedBook.daily_goal)
                      return <p className="text-xs mt-1 text-green-600">Goal met! {bonusAt - n} more for a bonus point</p>
                    return <p className="text-xs mt-1 text-orange-500">{selectedBook.daily_goal - n} more to reach today's goal</p>
                  })()}
                </div>
              )}

              {/* Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  What happened?
                  <span className="text-gray-400 font-normal ml-1.5">(1–2 sentences)</span>
                </label>
                <textarea
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Write a quick summary of what you read today..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3 pt-1 pb-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : entry ? 'Update' : 'Save'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
