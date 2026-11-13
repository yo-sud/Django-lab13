/* ──────────────────────────────────────────────
   src/client/api.js
   Módulo cliente de la API de Django Quiz.

   - Dirección base en un solo sitio.
   - Instancia de Axios con timeout y CORS implícito.
   - listExams, createExam, deleteExam.
   - describeError convierte errores de Axios en texto legible.
   ────────────────────────────────────────────── */

import axios from 'axios'

// ── TODO 3: dirección base en un solo sitio ──
const BASE_URL = 'http://127.0.0.1:8000/api'

// Instancia reutilizable con timeout
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,            // 8 segundos de espera
  headers: { 'Content-Type': 'application/json' },
})

/**
 * listExams – GET /exams/
 * Devuelve response.data (los datos desempacados).
 */
export async function listExams(signal) {
  const response = await apiClient.get('/exams/', { signal })
  // Retornamos .data porque los componentes solo necesitan los datos
  return response.data
}

/**
 * createExam – POST /exams/
 * Recibe { title, description } y devuelve el examen creado.
 */
export async function createExam(payload) {
  const response = await apiClient.post('/exams/', payload)
  return response.data
}

/**
 * deleteExam – DELETE /exams/{id}/
 * Devuelve void cuando el servidor responde 204.
 */
export async function deleteExam(id) {
  await apiClient.delete(`/exams/${id}/`)
}

/**
 * describeError – traduce errores de red a texto legible.
 */
export function describeError(err) {
  if (err.response) {
    // El servidor respondió con un código de error (4xx, 5xx)
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
  // No hubo respuesta del servidor: red caída, CORS bloqueado, etc.
  if (err.message === 'Canceled' || err.name === 'AbortError') {
    return null // petición cancelada internamente; no es un error visible
  }
  return 'No se pudo conectar con el servidor. Verifica que esté encendido.'
}
