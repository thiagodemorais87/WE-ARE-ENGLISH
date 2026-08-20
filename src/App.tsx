import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from '@/pages/Home'

/**
 * Future platform routes (not implemented yet):
 * PUBLIC: /about /method /lessons /contact
 * STUDENT: /student/dashboard /student/lessons /student/calendar ...
 * TEACHER: /teacher/dashboard /teacher/students ...
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}
