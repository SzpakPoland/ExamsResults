'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, PenTool, FileText, BarChart3, LogOut, User, Settings, Crown, ChevronDown } from 'lucide-react'
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
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

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
      case 'administrator':
        return 'from-blue-500 to-blue-600'
      case 'cmd':
        return 'from-orange-500 to-orange-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return Crown
      case 'administrator':
        return Settings
      case 'cmd':
        return PenTool
      default:
        return User
    }
  }

  const RoleIcon = getRoleIcon(user?.role || 'user')

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-b border-gray-200/60 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo - po lewej */}
            <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <BarChart3 className="w-4 h-4 text-white transform group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent">
                  Panel Egzaminów
                </span>
                <span className="text-xs text-gray-500 font-medium -mt-1 tracking-wide">System zarządzania wynikami</span>
              </div>
            </Link>

            {/* Navigation Items - wyśrodkowane */}
            <div className="flex-1 flex justify-center">
              <div className="hidden md:flex items-center bg-gray-50/80 rounded-2xl px-6 py-3 shadow-sm space-x-6">
                {allNavigationItems.map((item, index) => {
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center space-x-2 px-6 py-3 rounded-xl 
                        transition-all duration-200 font-semibold text-sm whitespace-nowrap
                        ${isActive 
                          ? 'bg-white text-primary-600 shadow-lg transform scale-105' 
                          : 'text-gray-600 hover:text-gray-800 hover:bg-white/50 hover:scale-105'
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-bold">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* User Menu - po prawej */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className={`w-6 h-6 bg-gradient-to-br ${getRoleColor(user?.role || 'user')} rounded-lg flex items-center justify-center`}>
                    <RoleIcon className="w-3 h-3 text-white" />
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-gray-800">{user?.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200/50 z-50">
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 bg-gradient-to-br ${getRoleColor(user?.role || 'user')} rounded-lg flex items-center justify-center shadow-md`}>
                          <RoleIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-1">
                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4 text-blue-600" />
                        <span>Zarządzaj kontem</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all duration-200 font-semibold text-sm"
                title="Wyloguj się"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Wyloguj</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden px-6 pb-3">
          <div className="flex flex-wrap gap-2">
            {allNavigationItems.map((item, index) => {
              const isActive = pathname === item.href
              const colorClasses = [
                'hover:bg-blue-100 hover:text-blue-700 data-[active=true]:bg-blue-500 data-[active=true]:text-white',
                'hover:bg-green-100 hover:text-green-700 data-[active=true]:bg-green-500 data-[active=true]:text-white',
                'hover:bg-purple-100 hover:text-purple-700 data-[active=true]:bg-purple-500 data-[active=true]:text-white',
                'hover:bg-orange-100 hover:text-orange-700 data-[active=true]:bg-orange-500 data-[active=true]:text-white',
                'hover:bg-pink-100 hover:text-pink-700 data-[active=true]:bg-pink-500 data-[active=true]:text-white',
                'hover:bg-red-100 hover:text-red-700 data-[active=true]:bg-red-500 data-[active=true]:text-white'
              ]
              const colorClass = colorClasses[index % colorClasses.length]
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  data-active={isActive}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-xs ${colorClass} ${
                    isActive ? 'shadow-sm' : 'text-gray-600 bg-gray-50'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  )
}