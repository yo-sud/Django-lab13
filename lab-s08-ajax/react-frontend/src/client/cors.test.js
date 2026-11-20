/* ──────────────────────────────────────────────
   src/client/cors.test.js
   Pruebas para la política de CORS.
   ────────────────────────────────────────────── */

import { describe, test, expect } from 'vitest'
import { checkOrigin, isWildcardAllowed } from './cors'

describe('checkOrigin', () => {
  test('permite el origen del proyecto (http://localhost:5173)', () => {
    expect(checkOrigin('http://localhost:5173')).toBe(true)
  })

  test('rechaza otros orígenes con diferente puerto', () => {
    expect(checkOrigin('http://localhost:8000')).toBe(false)
    expect(checkOrigin('http://localhost:3000')).toBe(false)
  })

  test('rechaza otros orígenes con diferente host', () => {
    expect(checkOrigin('http://127.0.0.1:5173')).toBe(false)
    expect(checkOrigin('http://example.com:5173')).toBe(false)
  })

  test('rechaza orígenes con barra final', () => {
    expect(checkOrigin('http://localhost:5173/')).toBe(false)
  })

  test('rechaza orígenes con HTTPS', () => {
    expect(checkOrigin('https://localhost:5173')).toBe(false)
  })

  test('rechaza origen vacío o nulo', () => {
    expect(checkOrigin('')).toBe(false)
    expect(checkOrigin(null)).toBe(false)
    expect(checkOrigin(undefined)).toBe(false)
  })
})

describe('isWildcardAllowed', () => {
  test('la lista no contiene el comodín', () => {
    expect(isWildcardAllowed()).toBe(false)
  })

  test('usar * con credenciales es rechazado por el navegador', () => {
    // RFC 6265 / Fetch spec: si Access-Control-Allow-Credentials es true,
    // el valor de Access-Control-Allow-Origin no puede ser '*'
    // Esto se demuestra porque allowedOrigins no incluye '*'
    expect(isWildcardAllowed()).toBe(false)
  })
})
