import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest } from '../api/client'
import { getToken, storeToken } from '../api/authSession'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [status, setStatus] = useState(getToken() ? 'checking' : 'guest')
  const [user, setUser] = useState('')

  useEffect(() => {
    let alive = true
    const verify = async () => {
      if (!getToken()) {
        if (alive) { setStatus('guest'); setUser('') }
        return
      }
      if (alive) setStatus('checking')
      try {
        const response = await apiRequest('/auth/me')
        if (alive) { setUser(response.username); setStatus('authenticated') }
      } catch {
        storeToken('')
        if (alive) { setStatus('guest'); setUser('') }
      }
    }
    verify()
    window.addEventListener('portfolio-auth-change', verify)
    return () => { alive = false; window.removeEventListener('portfolio-auth-change', verify) }
  }, [])

  async function login(username, password) {
    const response = await apiRequest('/auth/login', {
      method: 'POST', body: JSON.stringify({ username, password }),
    })
    storeToken(response.access_token)
    setUser(username)
    setStatus('authenticated')
  }

  function logout() {
    storeToken('')
    setUser('')
    setStatus('guest')
  }

  return <AuthContext.Provider value={{ status, user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used under AuthProvider')
  return context
}
