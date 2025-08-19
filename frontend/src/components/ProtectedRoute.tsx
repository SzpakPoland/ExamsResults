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

  if (!isAuthenticated) {
    return <LoginForm />
  }

  // Check role-based access
  if (user) {
    // CMD can only access ortografia
    if (user.role === 'cmd' && pathname !== '/ortografia' && pathname !== '/' && pathname !== '/results') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Brak uprawnień</h2>
            <p className="text-gray-600 mb-4">Twoje konto CMD ma dostęp tylko do testu ortografii.</p>
            <a href="/ortografia" className="btn btn-primary">Przejdź do ortografii</a>
          </div>
        </div>
      )
    }

    // Administrator and superadmin have full access
    // Regular users have access to all exam types but not admin panel
    if (user.role === 'user' && pathname === '/admin') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Brak uprawnień</h2>
            <p className="text-gray-600">Nie masz dostępu do panelu administracyjnego.</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
