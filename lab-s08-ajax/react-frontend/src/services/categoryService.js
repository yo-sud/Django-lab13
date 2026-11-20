/* ──────────────────────────────────────────────
   Servicio de categorías: misma interfaz CRUD que
   el servicio de productos.
   ────────────────────────────────────────────── */

import apiClient, { unwrapCollection } from './apiClient'

/** Listar categorías. */
export async function listCategories(params = {}, signal) {
  const response = await apiClient.get('/categories/', { params, signal })
  return unwrapCollection(response.data)
}

/** Obtener una categoría por su id. */
export async function getCategory(id, signal) {
  const response = await apiClient.get(`/categories/${id}/`, { signal })
  return response.data
}

/** Crear una categoría. */
export async function createCategory(payload) {
  const response = await apiClient.post('/categories/', payload)
  return response.data
}

/** Modificar una categoría. */
export async function updateCategory(id, payload) {
  const response = await apiClient.put(`/categories/${id}/`, payload)
  return response.data
}

/** Eliminar una categoría. */
export async function deleteCategory(id) {
  await apiClient.delete(`/categories/${id}/`)
}
