import { apiClient } from './apiClient'

export async function listProducts(signal) {
  const { data } = await apiClient.get('/products/', { signal })
  return data.products
}
