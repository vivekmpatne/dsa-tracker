import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export const AuthContext = createContext(null) 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('dsa_token'))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('dsa_token')
    const storedUser = localStorage.getItem('dsa_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem('dsa_token', newToken)
    localStorage.setItem('dsa_user', JSON.stringify(newUser))
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    setToken(newToken)
    setUser(newUser)
    setIsAuthenticated(true)
    return res.data
  }, [])

  const signup = useCallback(async (name, email, password) => {
    const res = await api.post('/auth/signup', { name, email, password })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem('dsa_token', newToken)
    localStorage.setItem('dsa_user', JSON.stringify(newUser))
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    setToken(newToken)
    setUser(newUser)
    setIsAuthenticated(true)
    return res.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('dsa_token')
    localStorage.removeItem('dsa_user')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
