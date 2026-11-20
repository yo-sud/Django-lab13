/* ──────────────────────────────────────────────
   Servicio de productos: única puerta de acceso
   desde los componentes al recurso /products/.
   ────────────────────────────────────────────── */

import apiClient, { unwrapCollection } from './apiClient'

/** Listar productos; admite filtros como { category: 2 }. */
export async function listProducts(params = {}, signal) {
  const response = await apiClient.get('/products/', { params, signal })
  return unwrapCollection(response.data)
}

/** Obtener un producto por su id. */
export async function getProduct(id, signal) {
  const response = await apiClient.get(`/products/${id}/`, { signal })
  return response.data
}

/** Crear un producto. */
export async function createProduct(payload) {
  const response = await apiClient.post('/products/', payload)
  return response.data
}

/** Modificar un producto completo. */
export async function updateProduct(id, payload) {
  const response = await apiClient.put(`/products/${id}/`, payload)
  return response.data
}

/** Eliminar un producto. */
export async function deleteProduct(id) {
  await apiClient.delete(`/products/${id}/`)
}
