/* ──────────────────────────────────────────────
   src/client/api.test.js
   Pruebas para el módulo cliente de la API.
   ────────────────────────────────────────────── */

import { describe, test, expect, vi } from 'vitest'
import * as axiosModule from 'axios'

// Mockear axios ANTES de que sea importado
vi.mock('axios', async (importOriginal) => {
  const mockGet = vi.fn()
  const mockPost = vi.fn()
  const mockDelete = vi.fn()

  const actual = await importOriginal()

  return {
    ...actual,
    default: {
      create: () => ({
        get: mockGet,
        post: mockPost,
        delete: mockDelete,
      }),
    },
    create: () => ({
      get: mockGet,
      post: mockPost,
      delete: mockDelete,
    }),
    _getMock: () => ({ mockGet, mockPost, mockDelete }),
  }
})

import { listExams, createExam, deleteExam, describeError } from './api'

describe('listExams', () => {
  test('devuelve los datos del response (response.data)', async () => {
    const { _getMock } = await import('axios')
    const { mockGet } = _getMock()
    const mockData = { results: [{ id: 1, title: 'Python' }] }
    mockGet.mockResolvedValue({ data: mockData })

    const result = await listExams()

    expect(mockGet).toHaveBeenCalledWith('/exams/', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  test('pasa el signal de AbortController a la petición', async () => {
    const { _getMock } = await import('axios')
    const { mockGet } = _getMock()
    const controller = new AbortController()
    mockGet.mockResolvedValue({ data: { results: [] } })

    await listExams(controller.signal)

    expect(mockGet).toHaveBeenCalledWith(
      '/exams/',
      expect.objectContaining({ signal: controller.signal })
    )
  })
})

describe('createExam', () => {
  test('envía el payload y devuelve el dato creado', async () => {
    const { _getMock } = await import('axios')
    const { mockPost } = _getMock()
    const createdExam = { id: 3, title: 'Nuevo Examen', description: 'Desc' }
    mockPost.mockResolvedValue({ data: createdExam })

    const result = await createExam({ title: 'Nuevo Examen', description: 'Desc' })

    expect(mockPost).toHaveBeenCalledWith('/exams/', { title: 'Nuevo Examen', description: 'Desc' })
    expect(result).toEqual(createdExam)
  })
})

describe('deleteExam', () => {
  test('hace DELETE al endpoint correcto', async () => {
    const { _getMock } = await import('axios')
    const { mockDelete } = _getMock()
    mockDelete.mockResolvedValue({ data: null })

    await deleteExam(42)

    expect(mockDelete).toHaveBeenCalledWith('/exams/42/')
  })
})

describe('describeError', () => {
  test('describe errores de validación (400)', () => {
    const err = {
      response: {
        status: 400,
        data: { title: ['Este campo es obligatorio.'] },
      },
    }
    expect(describeError(err)).toContain('validación')
  })

  test('describe errores 404', () => {
    const err = { response: { status: 404 } }
    expect(describeError(err)).toBe('Recurso no encontrado.')
  })

  test('describe errores 500+', () => {
    const err = { response: { status: 500 } }
    expect(describeError(err)).toBe('Error del servidor (500).')
  })

  test('describe errores genéricos de estado', () => {
    const err = { response: { status: 403, data: { detail: 'Permisos denegados' } } }
    expect(describeError(err)).toBe('Error 403: Permisos denegados')
  })

  test('describe error de timeout', () => {
    const err = { code: 'ECONNABORTED', message: 'timeout of 8000ms exceeded' }
    expect(describeError(err)).toBe('La petición expiró (timeout). Verifica tu conexión.')
  })

  test('retorna null para peticiones canceladas', () => {
    const err = { name: 'AbortError' }
    expect(describeError(err)).toBeNull()
  })

  test('describe error de red cuando no hay respuesta', () => {
    const err = { message: 'Network Error', code: 'ERR_CONNECTION_REFUSED' }
    expect(describeError(err)).toContain('No se pudo conectar')
  })
})
