/* ──────────────────────────────────────────────
   src/client/api.js
   Servicio heredado de exámenes. La instancia de
   Axios y la URL base viven en services/apiClient.
   ────────────────────────────────────────────── */

import apiClient, { describeError } from '../services/apiClient'

export { describeError }

/** listExams – GET /exams/ */
export async function listExams(signal) {
  const response = await apiClient.get('/exams/', { signal })
  return response.data
}

/** createExam – POST /exams/ */
export async function createExam(payload) {
  const response = await apiClient.post('/exams/', payload)
  return response.data
}

/** deleteExam – DELETE /exams/{id}/ */
export async function deleteExam(id) {
  await apiClient.delete(`/exams/${id}/`)
}
