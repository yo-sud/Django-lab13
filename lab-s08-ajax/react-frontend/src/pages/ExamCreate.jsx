import { useState } from 'react'
import { useExamsActions } from '../client/useExams'
import { useNavigate } from 'react-router-dom'

/* ──────────────────────────────────────────────
   ExamCreate – Formulario para crear un examen.
   - Entradas controladas (useState)
   - onSubmit evita el envío del navegador
   - Navega al listado tras crear
   ────────────────────────────────────────────── */

export function ExamCreate() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const navigate = useNavigate()
  const { actionError, isCreating, create } = useExamsActions(() => {
    navigate('/')
  })

  async function handleSubmit(e) {
    e.preventDefault()                    // evitar recarga del navegador
    await create({ title, description })
  }

  return (
    <div className="card">
      <h1>Nuevo cuestionario</h1>

      {actionError && <p className="error-msg">{actionError}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Título *
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Fundamentos de Python"
            autoFocus
          />
        </label>

        <label>
          Descripción
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripción del cuestionario"
            rows={3}
          />
        </label>

        <div className="form-actions">
          <button type="submit" disabled={isCreating}>
            {isCreating ? 'Creando…' : 'Guardar'}
          </button>
          <button type="button" onClick={() => navigate('/')}>Cancelar</button>
        </div>
      </form>
    </div>
  )
}
