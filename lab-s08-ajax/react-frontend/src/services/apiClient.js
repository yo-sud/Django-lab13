/* ──────────────────────────────────────────────
   src/services/apiClient.js
   Único sitio donde se configura Axios y la URL base de la API.
   ────────────────────────────────────────────── */

import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const apiClient = axios.create({
  baseURL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

/** DRF pagina las listas; devolvemos siempre un array a los servicios. */
export function unwrapCollection(data) {
  return Array.isArray(data) ? data : (data?.results ?? [])
}

/** Traduce errores de Axios a texto legible para la interfaz. */
export function describeError(err) {
  if (err.response) {
    const status = err.response.status
    const detail = err.response.data?.detail
      || err.response.data?.title
      || JSON.stringify(err.response.data)
    if (status === 400) {
      return `Error de validación: ${detail}`
    }
    if (status === 404) {
      return 'Recurso no encontrado.'
    }
    if (status >= 500) {
      return `Error del servidor (${status}).`
    }
    return `Error ${status}: ${detail}`
  }
  if (err.code === 'ECONNABORTED') {
    return 'La petición expiró (timeout). Verifica tu conexión.'
  }
  if (err.message === 'Canceled' || err.name === 'AbortError') {
    return null
  }
  return 'No se pudo conectar con el servidor. Verifica que esté encendido.'
}

export default apiClient
