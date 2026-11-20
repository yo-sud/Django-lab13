/* ──────────────────────────────────────────────
   src/client/cors.js
   Política de CORS para el navegador.

   - allowedOrigins: solo el origen de React (puerto 5173).
   - Sin barra final, sin comodín.
   - El navegador rechaza * cuando hay credenciales.
   - http://localhost:5173 y http://localhost:8000 son orígenes distintos (diferente puerto).
   ────────────────────────────────────────────── */

/** Orígenes autorizados: esquema + host + puerto exactos. */
const allowedOrigins = ['http://localhost:5173']

/**
 * checkOrigin verifica si un origen es permitido.
 * @param {string} origin - El origen de la petición (ej: 'http://localhost:5173')
 * @returns {boolean} true si el origen está en la lista permitida
 */
export function checkOrigin(origin) {
  if (!origin) return false
  // Sin barra final, sin comodín
  return allowedOrigins.includes(origin)
}

/**
 * isWildcardAllowed - detecta si se está usando el comodín '*'
 * @returns {boolean}
 */
export function isWildcardAllowed() {
  return allowedOrigins.includes('*')
}
