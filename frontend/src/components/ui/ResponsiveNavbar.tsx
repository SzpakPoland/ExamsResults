'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, Home, BarChart3, Users, FileText, LogOut, User, Key } from 'lucide-react';

const ResponsiveNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navigationItems = [
    { name: 'Strona główna', href: '/', icon: Home },
    { name: 'Sprawdzanie', href: '/sprawdzanie', icon: FileText },
    { name: 'Ortografia', href: '/ortografia', icon: FileText },
    { name: 'Dokumenty', href: '/dokumenty', icon: FileText },
    { name: 'Wyniki', href: '/results', icon: BarChart3 },
    ...(user?.role === 'superadmin' ? [{ name: 'Panel Admina', href: '/admin', icon: Users }] : []),
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-white text-xl font-bold hover:text-blue-200 transition-colors">
              Panel wyników
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-blue-100 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    <IconComponent className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop User Info & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3 bg-blue-700/50 px-3 py-2 rounded-lg">
                <User className="w-5 h-5 text-blue-200" />
                <div className="text-blue-100">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-blue-300">{user.role}</div>
                </div>
              </div>
            )}
            <Link
              href="/account"
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              Zarządzaj kontem
            </Link>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Wyloguj
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="bg-blue-700 inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-900/50 rounded-lg mt-2 mb-2">
            {/* Mobile User Info */}
            {user && (
              <div className="bg-blue-700/50 p-3 rounded-lg mb-3">
                <div className="flex items-center space-x-3 text-blue-100">
                  <User className="w-6 h-6 text-blue-200" />
                  <div>
                    <div className="text-base font-medium">{user.name}</div>
                    <div className="text-sm text-blue-300">{user.role}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Links */}
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMenu}
                  className="text-blue-100 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center gap-3"
                >
                  <IconComponent className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Divider */}
            <div className="border-t border-blue-700 my-2"></div>
            
            {/* Action Buttons */}
            <Link
              href="/account"
              onClick={closeMenu}
              className="text-amber-100 bg-amber-600 hover:bg-amber-700 block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center gap-3 w-full"
            >
              <Key className="w-5 h-5" />
              Zarządzaj kontem
            </Link>
            
            <button
              onClick={() => {
                logout();
                closeMenu();
              }}
              className="w-full text-left bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center gap-3 mt-1"
            >
              <LogOut className="w-5 h-5" />
              Wyloguj
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ResponsiveNavbar;
