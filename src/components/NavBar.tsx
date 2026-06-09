import { Link, useLocation } from 'react-router-dom'

export function NavBar() {
  const { pathname } = useLocation()

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
        <span className="font-bold text-blue-800 text-lg">Dylan Reads</span>
        <div className="flex gap-5">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              pathname === '/' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Calendar
          </Link>
          <Link
            to="/admin"
            className={`text-sm font-medium transition-colors ${
              pathname === '/admin' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  )
}
