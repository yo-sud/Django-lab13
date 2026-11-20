import { apiClient } from './apiClient'

export async function getSummary(signal) {
  const { data } = await apiClient.get('/cart/', { signal })
  return data
}

export async function addItem(sku, qty = 1) {
  const { data } = await apiClient.post('/cart/items/', { sku, qty })
  return data
}

export async function removeItem(sku, qty = 1) {
  const { data } = await apiClient.post('/cart/items/remove/', { sku, qty })
  return data
}

export async function applyCoupon(code) {
  const { data } = await apiClient.post('/cart/coupon/', { code })
  return data
}

export async function checkout() {
  const { data } = await apiClient.post('/cart/checkout/')
  return data
}
