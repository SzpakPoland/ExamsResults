'use client'

import { useState } from 'react'
import { User, Lock, Eye, EyeOff, Save, CheckCircle, Key } from 'lucide-react'
import Layout from '@/components/ui/Layout'
import { useAuth } from '@/context/AuthContext'
import { changePassword } from '@/utils/storage'
import { motion } from 'framer-motion'

export default function AccountPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'password' | 'profile'>('password')
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Nowe hasła nie są identyczne')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Nowe hasło musi mieć co najmniej 6 znaków')
      return
    }

    setPasswordLoading(true)

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      setPasswordSuccess(true)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (error: any) {
      setPasswordError(error.message || 'Błąd podczas zmiany hasła')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    if (passwordError) setPasswordError('')
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <Layout title="Zarządzanie kontem">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="card-glass border border-white/30 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Zarządzanie kontem</h1>
              <p className="text-gray-600">Zalogowany jako: <strong>{user?.name}</strong> ({user?.role})</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('password')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'password'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Zmiana hasła
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Informacje o koncie
          </button>
        </div>

        {/* Password Change Tab */}
        {activeTab === 'password' && (
          <div className="card-glass border border-white/30 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Zmiana hasła</h2>
            
            {passwordSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Hasło zostało zmienione!</h3>
                <p className="text-gray-600">Twoje hasło zostało pomyślnie zaktualizowane.</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="label">
                    <Key className="w-4 h-4 inline mr-2" />
                    Obecne hasło
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      className="input pr-10"
                      placeholder="Wprowadź obecne hasło"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Nowe hasło
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      className="input pr-10"
                      placeholder="Wprowadź nowe hasło"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Potwierdź nowe hasło
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className="input pr-10"
                      placeholder="Potwierdź nowe hasło"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm font-medium">{passwordError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn btn-primary w-full disabled:opacity-50"
                >
                  {passwordLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Zmieniam hasło...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Zmień hasło
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card-glass border border-white/30 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Informacje o koncie</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 font-medium mb-1">Nazwa użytkownika</p>
                  <p className="text-lg font-bold text-gray-800">{user?.username}</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 font-medium mb-1">Nazwa konta</p>
                  <p className="text-lg font-bold text-gray-800">{user?.name}</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 font-medium mb-1">Rola</p>
                  <p className={`text-lg font-bold capitalize ${
                    user?.role === 'superadmin' ? 'text-red-600' :
                    user?.role === 'administrator' ? 'text-blue-600' :
                    user?.role === 'cmd' ? 'text-orange-600' :
                    'text-gray-600'
                  }`}>
                    {user?.role === 'superadmin' ? 'Super Administrator' :
                     user?.role === 'administrator' ? 'Administrator' :
                     user?.role === 'cmd' ? 'CMD' : 'Użytkownik'}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 font-medium mb-1">ID konta</p>
                  <p className="text-lg font-bold text-gray-800">{user?.id}</p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                <p className="text-sm text-blue-800">
                  <strong>Informacja:</strong> Aby zmienić dane konta (nazwa użytkownika, nazwa konta), 
                  skontaktuj się z administratorem systemu.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <motion.footer 
        className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-auto pt-8 pb-0 border-t border-gray-200/50 shadow-lg"
        style={{ backgroundColor: '#e6e8ebff' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="container mx-auto px-4 pb-6">
          
          <div className="flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 md:space-x-8 py-3 border-t border-gray-100">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Wyniki w czasie rzeczywistym
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Automatyczne obliczenia
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Bezpieczne przechowywanie
              </span>
            </div>
          </div>
          
          <div className="text-center text-black-400 text-sm">
            <p className="mb-1">© 2025 Mikołaj Hamerski. Wszystkie prawa zastrzeżone.</p>
            <p>Wersja 2.0.0 - Hybrid SQLite + JSON Storage</p>
          </div>
        </div>
      </motion.footer>
    </Layout>
  )
}
 