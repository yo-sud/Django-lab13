import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { describeError } from '../services/apiClient'
import { listCategories } from '../services/categoryService'
import { deleteProduct, listProducts } from '../services/productService'

/* ──────────────────────────────────────────────
   Catálogo: carga por servicio dentro del efecto,
   tres estados de petición y filtrado por categoría
   con las categorías proporcionadas por el API.
   ────────────────────────────────────────────── */

const isCancelled = (err) =>
  err?.code === 'ERR_CANCELED' || err?.name === 'Canceled' || err?.name === 'AbortError'

export default function CatalogPage() {
  const [status, setStatus] = useState('loading')
  const [hasLoaded, setHasLoaded] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [isFiltering, setIsFiltering] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  // Las categorías del desplegable nunca se escriben a mano.
  useEffect(() => {
    const controller = new AbortController()
    let active = true

    listCategories({}, controller.signal)
      .then((data) => {
        if (active) setCategories(data)
      })
      .catch((err) => {
        if (active && !isCancelled(err)) setActionError(describeError(err))
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  // El filtro se envía al servidor: ?category=<id>.
  useEffect(() => {
    const controller = new AbortController()
    let active = true
    setIsFiltering(true)

    const params = selectedCategory ? { category: selectedCategory } : {}
    listProducts(params, controller.signal)
      .then((data) => {
        if (!active) return
        setProducts(data)
        setStatus('data')
        setHasLoaded(true)
        setError(null)
        setIsFiltering(false)
      })
      .catch((err) => {
        if (!active || isCancelled(err)) return
        if (hasLoaded) {
          setActionError(describeError(err))
        } else {
          setError(describeError(err))
          setStatus('error')
        }
        setIsFiltering(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [selectedCategory, reloadKey]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete(id) {
    setIsDeleting(true)
    setActionError(null)
    try {
      await deleteProduct(id)
      // El catálogo refleja el borrado sin recargar la página.
      setProducts((current) => current.filter((product) => product.id !== id))
    } catch (err) {
      setActionError(describeError(err))
    } finally {
      setIsDeleting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="card catalog">
        <h1>Catálogo de productos</h1>
        <div className="skeleton">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
        <p>Cargando catálogo…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="card error">
        <h1>Catálogo de productos</h1>
        <p className="error-msg">{error}</p>
        <button onClick={() => setReloadKey((key) => key + 1)}>Reintentar</button>
      </div>
    )
  }

  return (
    <div className="card catalog">
      <div className="catalog-header">
        <div>
          <h1>Catálogo de productos</h1>
          <p className="muted">Productos con su categoría incluida en la misma respuesta.</p>
        </div>
        <Link className="btn-primary" to="/products/new">Nuevo producto</Link>
      </div>

      {actionError && <p className="error-msg">{actionError}</p>}

      <div className="filters">
        <label htmlFor="category-filter">Filtrar por categoría</label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          disabled={categories.length === 0}
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {isFiltering && <span className="muted">Actualizando…</span>}
      </div>

      {products.length === 0 ? (
        <p className="empty">No hay productos para este filtro.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  )
}
