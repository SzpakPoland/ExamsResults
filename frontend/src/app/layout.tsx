import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

export const metadata: Metadata = {
  title: 'Panel Wyników Egzaminów',
  description: 'System zarządzania wynikami egzaminów',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body className="antialiased">
        <AuthProvider>
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  )
}
