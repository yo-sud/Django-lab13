import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { listExams, createExam, deleteExam, describeError } from '../client/api'

/* ──────────────────────────────────────────────
   useExams – custom hook para el estado de exámenes.

   Estados: 'loading' | 'data' | 'error'
   - signal: AbortController para cancelar peticiones
   - cancelled: bandera para ignorar respuestas viejas
   ────────────────────────────────────────────── */

export function useExams() {
  const [status, setStatus] = useState('loading')   // loading / data / error
  const [exams, setExams] = useState([])
  const [error, setError] = useState(null)

  const abortRef = useRef(null)     // AbortController activo
  const cancelledRef = useRef(false) // bandera de limpieza

  /** Cargar lista de exámenes */
  function fetchExams() {
    // Cancelar petición anterior si existe
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller
    cancelledRef.current = false

    setStatus('loading')
    setError(null)

    listExams(controller.signal)
      .then((data) => {
        if (cancelledRef.current) return // ignorar respuesta vieja
        setExams(data.results || data)
        setStatus('data')
      })
      .catch((err) => {
        if (cancelledRef.current) return
        if (err.name === 'AbortError') return // cancelación propia, no mostrar error
        setError(describeError(err))
        setStatus('error')
      })
  }

  // Al montar, lanzar la petición
  useEffect(() => {
    fetchExams()
    // Cleanup: cancelar y marcar como cancelado
    return () => {
      cancelledRef.current = true
      if (abortRef.current) {
        abortRef.current.abort()
      }
    }
  }, [])

  // Referencia para refrescar desde fuera
  const reloadRef = useRef(fetchExams)
  reloadRef.current = fetchExams

  return {
    status,
    exams,
    error,
    reload: reloadRef.current,
  }
}

/* ──────────────────────────────────────────────
   useExamsActions – hooks para eliminar y crear
   ────────────────────────────────────────────── */

export function useExamsActions(onSuccess) {
  const [actionError, setActionError] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // useRef para evitar doble envío (no cambia re-render)
  const deletingRef = useRef(false)
  const creatingRef = useRef(false)

  async function remove(id) {
    if (deletingRef.current) return // proteger contra doble envío
    deletingRef.current = true
    setIsDeleting(true)
    setActionError(null)
    try {
      await deleteExam(id)
      onSuccess()  // refresca la lista
    } catch (err) {
      setActionError(describeError(err))
    } finally {
      setIsDeleting(false)
      deletingRef.current = false
    }
  }

  async function create(payload) {
    if (creatingRef.current) return
    creatingRef.current = true
    setIsCreating(true)
    setActionError(null)
    try {
      await createExam(payload)
      onSuccess()  // refresca la lista
    } catch (err) {
      setActionError(describeError(err))
    } finally {
      setIsCreating(false)
      creatingRef.current = false
    }
  }

  return { actionError, isDeleting, isCreating, remove, create }
}
