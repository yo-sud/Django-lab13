import axios from 'axios'

// Único lugar donde se crea el cliente HTTP. Los componentes sólo usan servicios.
const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8010/api'

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

export function describeError(error) {
  if (error?.response?.data?.error) return error.response.data.error
  if (error?.code === 'ERR_NETWORK') {
    return 'No se pudo conectar con la API. ¿Está levantado el servidor de Django?'
  }
  return error?.message || 'Ocurrió un error inesperado.'
}

export function isCancelled(error) {
  return (
    error?.code === 'ERR_CANCELED' ||
    error?.name === 'Canceled' ||
    error?.name === 'AbortError'
  )
}
