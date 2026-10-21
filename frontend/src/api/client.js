import { getToken, storeToken } from './authSession'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

export async function apiRequest(path, options = {}) {
  const token = getToken()
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error(`Tidak dapat terhubung ke ${API_BASE_URL}. Periksa FastAPI dan CORS.`)
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    if (response.status === 401 && token && path !== '/auth/login') storeToken('')
    const detail = payload?.detail
    const message = typeof detail === 'string'
      ? detail
      : Array.isArray(detail) ? detail.map((error) => `${error.loc?.join('.')}: ${error.msg}`).join('; ') : null
    throw new Error(message || `API ${response.status}: ${path}`)
  }
  if (response.status === 204) return null
  return response.json()
}
