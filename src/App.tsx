import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import { HomePage } from './pages/HomePage'
import { AdminPage } from './pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}
