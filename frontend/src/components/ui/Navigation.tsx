'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, PenTool, FileText, BarChart3, LogOut, User, Settings, Crown } from 'lucide-react'
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

  // Add admin panel for superadmin
  const allNavigationItems = user?.role === 'superadmin' 
    ? [...navigationItems, { name: 'Panel Admin', href: '/admin', icon: Settings }]
    : navigationItems

  const handleLogout = () => {
    logout()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'from-red-500 to-red-600'
      case 'admin':
        return 'from-blue-500 to-blue-600'
      case 'teacher':
        return 'from-green-500 to-green-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return Crown
      case 'admin':
        return Settings
      case 'teacher':
        return BookOpen
      default:
        return User
    }
  }

  const RoleIcon = getRoleIcon(user?.role || 'user')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-xl">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Panel Egzaminów
              </span>
              <span className="text-xs text-gray-500 font-medium -mt-1">System zarządzania wynikami</span>
            </div>
          </Link>

          <div className="flex items-center space-x-6">
            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {allNavigationItems.map((item, index) => {
                const isActive = pathname === item.href
                const colors = [
                  'hover:bg-blue-50 hover:text-blue-700',
                  'hover:bg-green-50 hover:text-green-700', 
                  'hover:bg-purple-50 hover:text-purple-700',
                  'hover:bg-orange-50 hover:text-orange-700',
                  'hover:bg-pink-50 hover:text-pink-700',
                  'hover:bg-red-50 hover:text-red-700'
                ]
                const hoverColor = colors[index % colors.length]
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md transform scale-105'
                        : `text-gray-600 ${hoverColor} hover:shadow-sm hover:scale-105`
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              {/* User Info */}
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
                <div className={`w-7 h-7 bg-gradient-to-r ${getRoleColor(user?.role || 'user')} rounded-full flex items-center justify-center shadow-md`}>
                  <RoleIcon className="w-3 h-3 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-800">{user?.name}</span>
                  <span className="text-xs text-gray-500 capitalize font-medium -mt-0.5">{user?.role}</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-medium text-sm hover:shadow-sm hover:scale-105 group"
                title="Wyloguj się"
              >
                <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                <span>Wyloguj</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
