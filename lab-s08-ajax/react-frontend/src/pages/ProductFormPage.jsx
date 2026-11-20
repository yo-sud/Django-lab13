import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { describeError } from '../services/apiClient'
import { listCategories } from '../services/categoryService'
import { createProduct, getProduct, updateProduct } from '../services/productService'

/* ──────────────────────────────────────────────
   Alta y edición de un producto con el mismo
   formulario controlado y los mismos servicios.
   ────────────────────────────────────────────── */

const emptyForm = { name: '', description: '', price: '', stock: '0', category_id: '' }

const isCancelled = (err) =>
  err?.code === 'ERR_CANCELED' || err?.name === 'Canceled' || err?.name === 'AbortError'

export default function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [status, setStatus] = useState(isEdit ? 'loading' : 'ready')
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const requests = [listCategories({}, controller.signal)]
    if (isEdit) requests.push(getProduct(id, controller.signal))

    Promise.all(requests)
      .then(([categoriesData, product]) => {
        if (!active) return
        setCategories(categoriesData)
        if (product) {
          setForm({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stock: String(product.stock),
            category_id: String(product.category?.id ?? ''),
          })
        }
        setStatus('ready')
      })
      .catch((err) => {
        if (!active || isCancelled(err)) return
        setError(describeError(err))
        setStatus('error')
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!form.category_id) {
      setError('Selecciona una categoría.')
      return
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price,
      stock: Number(form.stock),
      category_id: Number(form.category_id),
    }

    setIsSaving(true)
    try {
      if (isEdit) {
        await updateProduct(id, payload)
      } else {
        await createProduct(payload)
      }
      navigate('/')
    } catch (err) {
      setError(describeError(err))
      setIsSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="card">
        <h1>Editar producto</h1>
        <div className="skeleton">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
        <p>Cargando producto…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="card error">
        <h1>Producto</h1>
        <p className="error-msg">{error}</p>
        <button onClick={() => navigate('/')}>Volver al catálogo</button>
      </div>
    )
  }

  return (
    <div className="card">
      <h1>{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>

      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Nombre *
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            autoFocus
          />
        </label>

        <label>
          Descripción
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
        </label>

        <div className="form-grid">
          <label>
            Precio *
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              required
            />
          </label>

          <label>
            Existencias *
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              min="0"
              required
            />
          </label>
        </div>

        <label>
          Categoría *
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            required
            disabled={categories.length === 0}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isSaving}>
            {isSaving ? 'Guardando…' : 'Guardar'}
          </button>
          <button type="button" onClick={() => navigate('/')}>Cancelar</button>
        </div>
      </form>
    </div>
  )
}
