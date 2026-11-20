import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ExamList } from './pages/ExamList'
import { ExamCreate } from './pages/ExamCreate'
import CatalogPage from './pages/CatalogPage'
import ProductFormPage from './pages/ProductFormPage'

/* ──────────────────────────────────────────────
   App – enrutador principal de la aplicación.
   El catálogo es la portada; los exámenes del
   laboratorio anterior siguen disponibles.
   ────────────────────────────────────────────── */

const router = createBrowserRouter([
  {
    path: '/',
    element: <CatalogPage />,
  },
  {
    path: '/products/new',
    element: <ProductFormPage />,
  },
  {
    path: '/products/:id/edit',
    element: <ProductFormPage />,
  },
  {
    path: '/exams',
    element: <ExamList />,
  },
  {
    path: '/exams/new',
    element: <ExamCreate />,
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
