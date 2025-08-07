'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, PenTool, FileText, BarChart3, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import type { NavigationItem } from '@/types'

const navigationItems: NavigationItem[] = [
  { name: 'Główna', href: '/', icon: Home },
  { name: 'Sprawdzanie', href: '/sprawdzanie', icon: BookOpen },
  { name: 'Ortografia', href: '/ortografia', icon: PenTool },
  { name: 'Dokumenty', href: '/dokumenty', icon: FileText },
  { name: 'Wyniki', href: '/results', icon: BarChart3 },
]

export default function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  // Add admin panel for superadmin
  const allNavigationItems = user?.role === 'superadmin' 
    ? [...navigationItems, { name: 'Panel Administracyjny', href: '/admin', icon: Settings }]
    : navigationItems

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Panel Egzaminów</span>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {allNavigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                title="Wyloguj się"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Wyloguj</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
