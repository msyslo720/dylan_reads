import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Book } from '../lib/types'

const SESSION_KEY = 'dylan_reads_admin'

export function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)

  // Add-book form state
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newGoalType, setNewGoalType] = useState<'pages' | 'chapters'>('pages')
  const [newDailyGoal, setNewDailyGoal] = useState('10')
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)

  // PIN change
  const [newPin, setNewPin] = useState('')
  const [pinMsg, setPinMsg] = useState('')

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      setAuthed(true)
      loadBooks()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'admin_pin')
      .single()

    if (data?.value === pin) {
      sessionStorage.setItem(SESSION_KEY, '1')
      setAuthed(true)
      loadBooks()
    } else {
      setPinError('Incorrect PIN — try again')
      setPin('')
    }
  }

  async function loadBooks() {
    setLoading(true)
    const { data } = await supabase.from('books').select('*').order('title')
    if (data) setBooks(data)
    setLoading(false)
  }

  async function handleAddBook(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) { setAddError('Title is required'); return }
    const goal = parseInt(newDailyGoal)
    if (!goal || goal <= 0) { setAddError('Daily goal must be greater than 0'); return }

    setAdding(true)
    setAddError('')

    const { error } = await supabase.from('books').insert({
      title: newTitle.trim(),
      author: newAuthor.trim() || null,
      goal_type: newGoalType,
      daily_goal: goal,
      active: true,
    })

    if (error) {
      setAddError(error.message)
    } else {
      setNewTitle('')
      setNewAuthor('')
      setNewGoalType('pages')
      setNewDailyGoal('10')
      await loadBooks()
    }
    setAdding(false)
  }

  async function toggleActive(book: Book) {
    await supabase.from('books').update({ active: !book.active }).eq('id', book.id)
    await loadBooks()
  }

  async function deleteBook(book: Book) {
    if (!confirm(`Delete "${book.title}"?\n\nThis will fail if Dylan has already logged reading for this book.`)) return
    const { error } = await supabase.from('books').delete().eq('id', book.id)
    if (error) alert(`Could not delete: ${error.message}`)
    else await loadBooks()
  }

  async function handlePinChange(e: React.FormEvent) {
    e.preventDefault()
    if (newPin.length < 4) { setPinMsg('PIN must be at least 4 characters'); return }
    await supabase.from('settings').update({ value: newPin }).eq('key', 'admin_pin')
    setPinMsg('PIN updated!')
    setNewPin('')
    setTimeout(() => setPinMsg(''), 3000)
  }

  // PIN prompt
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow p-8 w-full max-w-xs">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Admin</h2>
          <p className="text-sm text-gray-400 text-center mb-6">Enter your PIN to continue</p>
          <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="PIN"
              className="border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            {pinError && <p className="text-red-500 text-sm text-center">{pinError}</p>}
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 active:bg-blue-800"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        <h1 className="text-xl font-bold text-gray-900">Admin — Book List</h1>

        {/* Add book */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Add a Book</h2>
          <form onSubmit={handleAddBook} className="flex flex-col gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Title *"
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newAuthor}
              onChange={e => setNewAuthor(e.target.value)}
              placeholder="Author (optional)"
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <select
                value={newGoalType}
                onChange={e => setNewGoalType(e.target.value as 'pages' | 'chapters')}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="pages">Pages</option>
                <option value="chapters">Chapters</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={newDailyGoal}
                  onChange={e => setNewDailyGoal(e.target.value)}
                  className="w-20 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500 whitespace-nowrap">/ day</span>
              </div>
            </div>
            {addError && <p className="text-red-500 text-sm">{addError}</p>}
            <button
              type="submit"
              disabled={adding}
              className="bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Add Book'}
            </button>
          </form>
        </section>

        {/* Book list */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">
            Books ({books.filter(b => b.active).length} active)
          </h2>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : books.length === 0 ? (
            <p className="text-gray-400 text-sm">No books yet — add some above.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {books.map(book => (
                <li key={book.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${book.active ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                      {book.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {book.author ? `${book.author} · ` : ''}
                      {book.daily_goal} {book.goal_type}/day
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => toggleActive(book)}
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        book.active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {book.active ? 'Active' : 'Hidden'}
                    </button>
                    <button
                      onClick={() => deleteBook(book)}
                      className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-500 hover:bg-red-100 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Change PIN */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Change Admin PIN</h2>
          <form onSubmit={handlePinChange} className="flex gap-3">
            <input
              type="password"
              value={newPin}
              onChange={e => setNewPin(e.target.value)}
              placeholder="New PIN (min 4 chars)"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-800"
            >
              Update
            </button>
          </form>
          {pinMsg && (
            <p className={`text-sm mt-2 ${pinMsg.includes('!') ? 'text-green-600' : 'text-red-500'}`}>
              {pinMsg}
            </p>
          )}
        </section>

        <div className="text-center pb-4">
          <button
            onClick={() => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false) }}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Lock admin
          </button>
        </div>
      </div>
    </div>
  )
}
