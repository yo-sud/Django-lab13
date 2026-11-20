const money = (value) => `S/ ${Number(value || 0).toFixed(2)}`

export function formatMoney(value) {
  return money(value)
}

export function stockLabel(stock) {
  if (stock <= 0) return { text: 'Agotado', tone: 'out' }
  if (stock <= 3) return { text: `Últimas ${stock}`, tone: 'low' }
  return { text: `${stock} disponibles`, tone: 'ok' }
}
