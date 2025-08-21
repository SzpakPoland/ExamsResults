'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, verifyToken as apiVerifyToken } from '@/utils/storage'
import type { AuthState, User } from '@/types'

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      console.log('Checking auth state...')
      const token = localStorage.getItem('auth-token')
      console.log('Stored token:', token)
      
      if (token) {
        const response = await apiVerifyToken(token)
        console.log('Token verification response:', response)
        
        if (response.valid && response.user) {
          setState({
            isAuthenticated: true,
            user: response.user,
            token
          })
          console.log('User authenticated:', response.user)
        } else {
          localStorage.removeItem('auth-token')
          console.log('Token invalid, removed from storage')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth-token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('=== AuthContext Login ===')
      console.log('Username:', username)
      console.log('Attempting login...')
      
      const response = await apiLogin(username, password)
      console.log('Login API response:', response)

      if (response.success && response.user && response.token) {
        localStorage.setItem('auth-token', response.token)
        setState({
          isAuthenticated: true,
          user: response.user,
          token: response.token
        })
        console.log('✅ Login successful, user set:', response.user)
        return true
      } else {
        console.log('❌ Login failed - invalid response format:', response)
        return false
      }
    } catch (error: any) {
      console.error('❌ Login error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('auth-token')
    setState({
      isAuthenticated: false,
      user: null,
      token: null
    })
    console.log('User logged out')
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}