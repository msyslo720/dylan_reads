export interface Book {
  id: string
  title: string
  author: string | null
  goal_type: 'pages' | 'chapters'
  daily_goal: number
  active: boolean
  created_at: string
}

export interface ReadingEntry {
  id: string
  date: string
  book_id: string
  amount_read: number
  summary: string | null
  created_at: string
  updated_at: string
  book?: Book
}
