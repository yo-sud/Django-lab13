import { useExams, useExamsActions } from '../client/useExams'
import { useNavigate } from 'react-router-dom'

/* ──────────────────────────────────────────────
   ExamList – Página de listado de exámenes.
   Muestra los tres estados: carga, datos, error.
   ────────────────────────────────────────────── */

export function ExamList() {
  const { status, exams, error, reload } = useExams()
  const navigate = useNavigate()
  const { actionError, isDeleting, remove } = useExamsActions(reload)

  function goToCreate() {
    navigate('/new')
  }

  /* ── Estado de carga ── */
  if (status === 'loading') {
    return (
      <div className="card">
        <h1>Cuestionarios</h1>
        <div className="skeleton">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
        <p>Cargando cuestionarios…</p>
      </div>
    )
  }

  /* ── Estado de error ── */
  if (status === 'error') {
    return (
      <div className="card error">
        <h1>Cuestionarios</h1>
        <p className="error-msg">{error}</p>
        <button onClick={reload}>Reintentar</button>
      </div>
    )
  }

  /* ── Estado de datos ── */
  return (
    <div className="card">
      <h1>Cuestionarios</h1>

      {actionError && <p className="error-msg">{actionError}</p>}

      <button className="btn-primary" onClick={goToCreate}>
        Nuevo cuestionario
      </button>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {exams.length === 0 ? (
            <tr>
              <td colSpan="4" className="empty">No hay cuestionarios. ¡Crea uno!</td>
            </tr>
          ) : (
            exams.map((exam) => (
              <tr key={exam.id}>
                <td>{exam.id}</td>
                <td>{exam.title}</td>
                <td>{exam.description || '—'}</td>
                <td>
                  <button
                    className="btn-danger"
                    onClick={() => remove(exam.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Borrando…' : 'Eliminar'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
