'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { AuthState, User } from '@/types'

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = 'http://localhost:3001/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on app start
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth-token')
      if (storedToken) {
        verifyToken(storedToken)
      } else {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAuthState({
          isAuthenticated: true,
          user: data.user,
          token
        })
      } else {
        // Invalid token, remove it
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token')
        }
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null
        })
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token')
      }
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null
      })
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        const newAuthState = {
          isAuthenticated: true,
          user: data.user,
          token: data.token
        }
        
        setAuthState(newAuthState)
        localStorage.setItem('auth-token', data.token)
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token')
    }
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    })
  }

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
