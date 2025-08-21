'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import LoginForm from '@/components/ui/LoginForm'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const pathname = usePathname()

  if (isLoading) {
    return <LoadingSpinner message="Sprawdzanie autoryzacji..." />
  }

  // Check role-based access
  if (isAuthenticated && user) {
    // Super admin has access to everything
    if (user.role === 'superadmin') {
      return <>{children}</>
    }

    // Administrator has access to most things except admin panel
    if (user.role === 'administrator') {
      if (pathname === '/admin') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Brak dostępu</h2>
              <p className="text-gray-600">Tylko Super Administrator ma dostęp do panelu administracyjnego.</p>
            </div>
          </div>
        )
      }
      return <>{children}</>
    }

    // CMD role has access only to ortografia
    if (user.role === 'cmd') {
      const allowedPaths = ['/', '/ortografia', '/results', '/account']
      if (!allowedPaths.includes(pathname)) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-orange-600 mb-4">Ograniczony dostęp</h2>
              <p className="text-gray-600">Konta CMD mają dostęp tylko do testu ortografii i wyników.</p>
            </div>
          </div>
        )
      }
      return <>{children}</>
    }

    // Regular user has access to all exam types but not admin
    if (user.role === 'user') {
      if (pathname === '/admin') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Brak dostępu</h2>
              <p className="text-gray-600">Nie masz uprawnień do panelu administracyjnego.</p>
            </div>
          </div>
        )
      }
      return <>{children}</>
    }
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <>{children}</>
}
