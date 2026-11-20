import { formatMoney, stockLabel } from '../utils/format'

export default function ProductCard({ product, onAdd, busy }) {
  const stock = stockLabel(product.stock)
  const soldOut = product.stock <= 0

  return (
    <article className="product-card">
      <div className="product-card__top">
        <span className="sku-pill">{product.sku}</span>
        <span className={`stock-pill stock-pill--${stock.tone}`}>{stock.text}</span>
      </div>

      <div className="product-card__art" aria-hidden="true">
        <span>{product.sku.slice(0, 2)}</span>
      </div>

      <div className="product-card__body">
        <h3>{product.name}</h3>
        <p className="product-card__meta">Periférico · Stock disponible</p>

        <div className="product-card__footer">
          <strong className="price">{formatMoney(product.price)}</strong>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onAdd(product)}
            disabled={soldOut || busy}
          >
            {busy ? 'Agregando…' : soldOut ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>
    </article>
  )
}
