'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, User, Eye, EyeOff, BarChart3 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import type { LoginFormData } from '@/types'

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('Attempting login with:', formData.username, formData.password)

    const success = await login(formData.username, formData.password)
    
    if (!success) {
      setError('Nieprawidłowe dane logowania')
    }
    
    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Panel Egzaminów</h1>
          <p className="text-gray-600 mt-2">Zaloguj się aby kontynuować</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="card-glass p-8 border border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">
                <User className="w-4 h-4 inline mr-2" />
                Nazwa użytkownika
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="input"
                placeholder="Wprowadź nazwę użytkownika"
                required
              />
            </div>

            <div>
              <label className="label">
                <Lock className="w-4 h-4 inline mr-2" />
                Hasło
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input pr-10"
                  placeholder="Wprowadź hasło"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                className="bg-red-50 border border-red-200 rounded-lg p-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Logowanie...
                </div>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Zaloguj się
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials - zaktualizowane */}
          <motion.div
            className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <p className="text-sm font-medium text-blue-800 mb-2">Dane testowe:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Super Admin:</strong> superadmin / admin123</p>
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Nauczyciel:</strong> teacher / teacher123</p>
              <p><strong>Użytkownik:</strong> user / user123</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
