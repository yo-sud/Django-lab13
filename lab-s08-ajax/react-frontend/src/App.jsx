import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Route, Link } from 'react-router-dom'
import { ExamList } from './pages/ExamList'
import { ExamCreate } from './pages/ExamCreate'

/* ──────────────────────────────────────────────
   App – enrutador principal de la aplicación.
   ────────────────────────────────────────────── */

const router = createBrowserRouter([
  {
    path: '/',
    element: <ExamList />,
  },
  {
    path: '/new',
    element: <ExamCreate />,
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
