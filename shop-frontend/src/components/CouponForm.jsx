import { useState } from 'react'

export default function CouponForm({ coupon, onApply, busy }) {
  const [code, setCode] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const value = code.trim()
    if (!value) return
    onApply(value)
    setCode('')
  }

  return (
    <form className="coupon" onSubmit={handleSubmit}>
      <label htmlFor="coupon-code">Cupón</label>
      <div className="coupon__row">
        <input
          id="coupon-code"
          name="code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="BIENVENIDA10"
          autoComplete="off"
          disabled={busy}
        />
        <button type="submit" className="btn btn--dark" disabled={busy || !code.trim()}>
          {busy ? 'Aplicando…' : 'Aplicar'}
        </button>
      </div>
      <p className="coupon__hint">
        {coupon ? (
          <>
            Cupón activo: <strong>{coupon}</strong>. Aplicar otro lo reemplaza.
          </>
        ) : (
          '¿Tienes un código promocional? Ingrésalo aquí.'
        )}
      </p>
    </form>
  )
}
