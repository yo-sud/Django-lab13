import CouponForm from './CouponForm'
import { formatMoney } from '../utils/format'

export default function CartPanel({ summary, onAdd, onRemove, onCoupon, onCheckout, busy, receipt }) {
  const lines = summary.lines || []
  const empty = lines.length === 0

  return (
    <aside className="cart" id="carrito" aria-labelledby="cart-title">
      <header className="cart__header">
        <div>
          <p className="eyebrow">Resumen</p>
          <h2 id="cart-title">Tu carrito</h2>
        </div>
        <span className="cart__count">{lines.reduce((sum, line) => sum + line.qty, 0)}</span>
      </header>

      {receipt && (
        <div className="receipt" role="status">
          <strong>¡Pago confirmado!</strong>
          <span>Total pagado: {formatMoney(receipt.total)}</span>
        </div>
      )}

      {empty ? (
        <div className="cart__empty">
          <span aria-hidden="true">🛒</span>
          <p>Todavía no agregas productos.</p>
          <small>Elige un producto de la lista para empezar.</small>
        </div>
      ) : (
        <ul className="cart__lines">
          {lines.map((line) => (
            <li className="cart-line" key={line.sku}>
              <div className="cart-line__info">
                <strong>{line.sku}</strong>
                <small>{formatMoney(line.unit_price)} c/u</small>
              </div>
              <div className="qty" aria-label={`Cantidad de ${line.sku}`}>
                <button
                  type="button"
                  onClick={() => onRemove(line)}
                  disabled={busy}
                  aria-label={`Quitar una unidad de ${line.sku}`}
                >
                  −
                </button>
                <span>{line.qty}</span>
                <button
                  type="button"
                  onClick={() => onAdd(line)}
                  disabled={busy}
                  aria-label={`Agregar una unidad de ${line.sku}`}
                >
                  +
                </button>
              </div>
              <strong className="cart-line__total">{formatMoney(line.line_total)}</strong>
            </li>
          ))}
        </ul>
      )}

      <CouponForm coupon={summary.coupon} onApply={onCoupon} busy={busy} />

      <dl className="totals">
        <div>
          <dt>Subtotal</dt>
          <dd>{formatMoney(summary.subtotal)}</dd>
        </div>
        <div className="totals__discount">
          <dt>Descuento {summary.coupon && <span>({summary.coupon})</span>}</dt>
          <dd>−{formatMoney(summary.discount)}</dd>
        </div>
        <div>
          <dt>IGV (18 %)</dt>
          <dd>{formatMoney(summary.igv)}</dd>
        </div>
        <div className="totals__grand">
          <dt>Total</dt>
          <dd>{formatMoney(summary.total)}</dd>
        </div>
      </dl>

      <button
        type="button"
        className="btn btn--checkout"
        onClick={onCheckout}
        disabled={empty || busy}
      >
        {busy ? 'Procesando…' : 'Pagar ahora'}
      </button>
      <p className="cart__note">Pago seguro · Confirmación inmediata</p>
    </aside>
  )
}
