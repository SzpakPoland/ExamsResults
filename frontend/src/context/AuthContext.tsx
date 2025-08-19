'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { AuthState, User } from '@/types'

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://162.19.246.158:3001/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on app start
    const storedToken = localStorage.getItem('auth-token')
    if (storedToken) {
      verifyToken(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
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
        localStorage.removeItem('auth-token')
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null
        })
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('auth-token')
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
      const apiUrl = `${API_BASE_URL}/auth/login`;
      console.log('Attempting login to:', apiUrl);
      console.log('API_BASE_URL:', API_BASE_URL);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('Login successful:', data)
        const newAuthState = {
          isAuthenticated: true,
          user: data.user,
          token: data.token
        }
        
        setAuthState(newAuthState)
        localStorage.setItem('auth-token', data.token)
        return true
      } else {
        const errorData = await response.json()
        console.error('Login failed:', errorData)
        return false
      }
    } catch (error) {
      console.error('Network error during login:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('auth-token')
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