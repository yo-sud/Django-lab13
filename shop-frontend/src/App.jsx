import { useCallback, useEffect, useState } from 'react'
import CartPanel from './components/CartPanel'
import ProductCard from './components/ProductCard'
import { describeError, isCancelled } from './services/apiClient'
import {
  addItem,
  applyCoupon,
  checkout,
  getSummary,
  removeItem,
} from './services/cartService'
import { listProducts } from './services/productService'

const EMPTY_SUMMARY = {
  lines: [],
  subtotal: '0.00',
  discount: '0.00',
  igv: '0.00',
  total: '0.00',
  coupon: null,
}

export default function App() {
  const [status, setStatus] = useState('loading')
  const [products, setProducts] = useState([])
  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [receipt, setReceipt] = useState(null)
  const [busy, setBusy] = useState({ products: {}, coupon: false, checkout: false })

  const fetchAll = useCallback(async (signal, initial = false) => {
    if (initial) setStatus('loading')
    try {
      const [productList, cartSummary] = await Promise.all([
        listProducts(signal),
        getSummary(signal),
      ])
      setProducts(productList)
      setSummary(cartSummary)
      setStatus('ready')
    } catch (err) {
      if (isCancelled(err)) return
      setError(describeError(err))
      setStatus((current) => (current === 'loading' ? 'error' : current))
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchAll(controller.signal, true)
    return () => controller.abort()
  }, [fetchAll])

  function setProductBusy(sku, value) {
    setBusy((current) => {
      const productsBusy = { ...current.products }
      if (value) productsBusy[sku] = true
      else delete productsBusy[sku]
      return { ...current, products: productsBusy }
    })
  }

  async function handleAdd(item) {
    const sku = item.sku
    setProductBusy(sku, true)
    setError(null)
    setNotice(null)
    setReceipt(null)
    try {
      await addItem(sku, 1)
      await fetchAll()
      setNotice(`${item.name || sku} agregado al carrito.`)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setProductBusy(sku, false)
    }
  }

  async function handleRemove(line) {
    setError(null)
    setNotice(null)
    setReceipt(null)
    setBusy((current) => ({ ...current, checkout: true }))
    try {
      await removeItem(line.sku, 1)
      await fetchAll()
      setNotice(`Una unidad de ${line.sku} quitada del carrito.`)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setBusy((current) => ({ ...current, checkout: false }))
    }
  }

  async function handleCoupon(code) {
    setError(null)
    setNotice(null)
    setReceipt(null)
    setBusy((current) => ({ ...current, coupon: true }))
    try {
      const result = await applyCoupon(code)
      await fetchAll()
      setNotice(`Cupón ${result.coupon} aplicado.`)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setBusy((current) => ({ ...current, coupon: false }))
    }
  }

  async function handleCheckout() {
    setError(null)
    setNotice(null)
    setBusy((current) => ({ ...current, checkout: true }))
    try {
      const result = await checkout()
      setReceipt(result)
      await fetchAll()
      setNotice('Pago realizado y existencias actualizadas.')
    } catch (err) {
      setError(describeError(err))
    } finally {
      setBusy((current) => ({ ...current, checkout: false }))
    }
  }

  const cartBusy = busy.coupon || busy.checkout || Object.keys(busy.products).length > 0

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__inner">
          <div>
            <p className="eyebrow">NovaTech Store</p>
            <h1>Periféricos que elevan tu setup</h1>
            <p className="hero__lead">
              Descubre accesorios seleccionados para trabajar y jugar mejor. Agrega al carrito,
              aplica tu cupón y completa tu compra en segundos.
            </p>
          </div>
        </div>
      </header>

      <main className="layout">
        <section id="productos" aria-labelledby="products-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Catálogo</p>
              <h2 id="products-title">Productos destacados</h2>
            </div>
            <span className="section-heading__count">{products.length} artículos</span>
          </div>

          {error && (
            <div className="alert alert--error" role="alert">
              {error}
              <button type="button" onClick={() => fetchAll()}>
                Reintentar
              </button>
            </div>
          )}
          {notice && (
            <div className="alert alert--ok" role="status">
              {notice}
            </div>
          )}

          {status === 'loading' ? (
            <div className="grid" aria-busy="true">
              {[1, 2, 3, 4].map((item) => (
                <div className="skeleton-card" key={item} />
              ))}
            </div>
          ) : status === 'error' ? (
            <div className="empty-state">
              <span aria-hidden="true">⚠️</span>
              <h3>No se pudo cargar la tienda</h3>
              <p>Revisa que la API esté en marcha y vuelve a intentarlo.</p>
              <button type="button" className="btn btn--primary" onClick={() => fetchAll(undefined, true)}>
                Recargar
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <span aria-hidden="true">📦</span>
              <h3>No hay productos</h3>
              <p>Vuelve en unos instantes para ver nuevas novedades.</p>
            </div>
          ) : (
            <div className="grid">
              {products.map((product) => (
                <ProductCard
                  key={product.sku}
                  product={product}
                  onAdd={handleAdd}
                  busy={Boolean(busy.products[product.sku])}
                />
              ))}
            </div>
          )}
        </section>

        <CartPanel
          summary={summary}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onCoupon={handleCoupon}
          onCheckout={handleCheckout}
          busy={cartBusy}
          receipt={receipt}
        />
      </main>

      <footer className="footer">
        © 2026 NovaTech Store · Tecnología, periféricos y accesorios
      </footer>
    </div>
  )
}
