/* ──────────────────────────────────────────────
   src/client/useExams.test.js
   Pruebas para el hook useExams y useExamsActions.
   ────────────────────────────────────────────── */

import { describe, test, expect, vi } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'

// Mockear todo el módulo api ANTES de cualquier import
vi.mock('./api', () => ({
  listExams: vi.fn(),
  createExam: vi.fn(),
  deleteExam: vi.fn(),
  describeError: vi.fn((err) => {
    if (err?.response?.status === 400) return 'Error de validación'
    if (err?.response?.status) return `Error ${err.response.status}`
    return 'No se pudo conectar. Verifica tu conexión.'
  }),
}))

// Importar el hook después del mock
import { useExams, useExamsActions } from './useExams'
import * as apiModule from './api'

describe('useExams', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  test('inicia en estado loading', () => {
    apiModule.listExams.mockResolvedValue({ results: [{ id: 1, title: 'A' }] })

    const { result } = renderHook(() => useExams())

    expect(result.current.status).toBe('loading')
    expect(result.current.exams).toEqual([])
    expect(result.current.error).toBeNull()
  })

  test('transiciona a data cuando la petición resuelve', async () => {
    const mockExams = [
      { id: 1, title: 'Examen 1', description: 'Desc 1' },
      { id: 2, title: 'Examen 2', description: 'Desc 2' },
    ]
    apiModule.listExams.mockResolvedValue({ results: mockExams })

    const { result } = renderHook(() => useExams())

    // Esperar a que se resuelva la promesa
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    expect(result.current.status).toBe('data')
    expect(result.current.exams).toEqual(mockExams)
    expect(result.current.error).toBeNull()
  })

  test('transiciona a error cuando la petición falla', async () => {
    apiModule.listExams.mockRejectedValue(new Error('Network Error'))

    const { result } = renderHook(() => useExams())

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBeTruthy()
    expect(typeof result.current.error).toBe('string')
    expect(result.current.exams).toEqual([])
  })

  test('reload refresca la lista', async () => {
    const mockExams = [{ id: 1, title: 'Examen A', description: '' }]
    apiModule.listExams.mockResolvedValue({ results: mockExams })

    const { result } = renderHook(() => useExams())

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    expect(result.current.status).toBe('data')
    expect(result.current.exams.length).toBe(1)

    // Simulamos que la API ahora devuelve un examen diferente
    const newMockExams = [
      { id: 1, title: 'Examen A', description: '' },
      { id: 3, title: 'Examen C', description: 'Nueva descripción' },
    ]
    apiModule.listExams.mockResolvedValue({ results: newMockExams })

    await act(async () => {
      result.current.reload()
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    expect(result.current.exams.length).toBe(newMockExams.length)
    expect(result.current.status).toBe('data')
  })
})

describe('useExamsActions', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  test('remove llama deleteExam y notifica al callback', async () => {
    const onSuccess = vi.fn()
    apiModule.deleteExam.mockResolvedValue(undefined)

    const { result } = renderHook(() => useExamsActions(onSuccess))

    await act(async () => {
      await result.current.remove(1)
    })

    expect(apiModule.deleteExam).toHaveBeenCalledWith(1)
    expect(onSuccess).toHaveBeenCalled()
  })

  test('remove captura errores de la API', async () => {
    const onSuccess = vi.fn()
    apiModule.deleteExam.mockRejectedValue(new Error('404 Not Found'))

    const { result } = renderHook(() => useExamsActions(onSuccess))

    await act(async () => {
      await result.current.remove(999)
    })

    expect(result.current.actionError).toBeTruthy()
    expect(typeof result.current.actionError).toBe('string')
  })

  test('create llama createExam y notifica al callback', async () => {
    const onSuccess = vi.fn()
    apiModule.createExam.mockResolvedValue({ id: 5, title: 'Nuevo', description: '' })

    const { result } = renderHook(() => useExamsActions(onSuccess))

    await act(async () => {
      await result.current.create({ title: 'Nuevo', description: '' })
    })

    expect(apiModule.createExam).toHaveBeenCalledWith({ title: 'Nuevo', description: '' })
    expect(onSuccess).toHaveBeenCalled()
  })

  test('create captura errores de validación', async () => {
    const onSuccess = vi.fn()
    const validationError = new Error('Validation Error')
    validationError.response = {
      status: 400,
      data: { title: ['Este campo es obligatorio.'] },
    }
    apiModule.createExam.mockRejectedValue(validationError)

    const { result } = renderHook(() => useExamsActions(onSuccess))

    await act(async () => {
      await result.current.create({ title: '', description: '' })
    })

    expect(result.current.actionError).toBeTruthy()
    expect(typeof result.current.actionError).toBe('string')
  })
})
