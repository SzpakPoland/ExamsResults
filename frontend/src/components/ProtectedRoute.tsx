'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import LoginForm from '@/components/ui/LoginForm'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner message="Sprawdzanie autoryzacji..." />
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <>{children}</>
}
