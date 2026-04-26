import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('dsa_token'))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('dsa_user')

    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }

    setLoading(false)
  }, [token])

  // ✅ LOGIN FIXED
  const login = useCallback(async (email, password) => {
    try {
      const res = await authApi.login({ email, password })

      console.log("LOGIN SUCCESS:", res.data)

      const { token, user } = res.data

      localStorage.setItem('dsa_token', token)
      localStorage.setItem('dsa_user', JSON.stringify(user))

      setToken(token)
      setUser(user)
      setIsAuthenticated(true)

      return res.data
    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data)

      throw new Error(
        err.response?.data?.message || "Login failed"
      )
    }
  }, [])

  // ✅ SIGNUP FIXED
  const signup = useCallback(async (name, email, password) => {
    try {
      const res = await authApi.signup({ name, email, password })

      console.log("SIGNUP SUCCESS:", res.data)

      const { token, user } = res.data

      localStorage.setItem('dsa_token', token)
      localStorage.setItem('dsa_user', JSON.stringify(user))

      setToken(token)
      setUser(user)
      setIsAuthenticated(true)

      return res.data
    } catch (err) {
      console.log("SIGNUP ERROR:", err.response?.data)

      throw new Error(
        err.response?.data?.message || "Signup failed"
      )
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('dsa_token')
    localStorage.removeItem('dsa_user')

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