'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, User, Calendar, Target, Trophy, Save, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import Layout from '@/components/ui/Layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { saveResult } from '@/utils/storage'
import type { ExamResult, DokumentyFormData } from '@/types'

export default function DokumentyPage() {
  const [formData, setFormData] = useState<DokumentyFormData>({
    nick: '',
    date: '',
    maxPoints: 0,
    achievedPoints: 0,
    bonusPoints: 0,
    notes: ''
  })
  const [result, setResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 1300)
    return () => clearTimeout(timer)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxPoints' || name === 'achievedPoints' || name === 'bonusPoints' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const maxPointsWithBonus = formData.maxPoints + (formData.bonusPoints || 0)
      const totalPointsWithBonus = formData.achievedPoints + (formData.bonusPoints || 0)
      const percentage = maxPointsWithBonus > 0 ? (totalPointsWithBonus / maxPointsWithBonus) * 100 : 0
      const passed = percentage >= 75

      const newResult: ExamResult = {
        id: Date.now(),
        nick: formData.nick,
        date: formData.date,
        bonusPoints: formData.bonusPoints || 0,
        totalPoints: totalPointsWithBonus,
        maxPoints: maxPointsWithBonus,
        percentage: Math.round(percentage * 100) / 100,
        passed,
        timestamp: new Date().toISOString(),
        examType: 'dokumenty',
        notes: formData.notes || ''
      }

      await saveResult(newResult)
      setResult(newResult)
      setFormData({ nick: '', date: '', maxPoints: 0, achievedPoints: 0, bonusPoints: 0, notes: '' })
    } catch (error) {
      console.error('Error submitting result:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setResult(null)
    setFormData({ nick: '', date: '', maxPoints: 0, achievedPoints: 0, bonusPoints: 0, notes: '' })
  }

  const currentPercentage = formData.maxPoints > 0 ? Math.round((formData.achievedPoints / formData.maxPoints) * 100) : 0

  if (pageLoading) {
    return <LoadingSpinner message="Przygotowywanie testu dokumentów administracyjnych..." />
  }

  if (result) {
    return (
      <Layout title="Test Dokumentów Administracyjnych - Wynik">
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={`card-glass p-8 border-2 ${result.passed ? 'border-green-200' : 'border-red-200'}`}>
            <motion.div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Wynik dla: {result.nick}
              </h2>
              <div className={result.passed ? 'status-passed' : 'status-failed'}>
                {result.passed ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                {result.passed ? 'ZALICZONY' : 'NIEZALICZONY'}
              </div>
            </motion.div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center p-4 bg-gray-50/50 rounded-xl backdrop-blur-sm">
                <Calendar className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Data</p>
                <p className="text-lg font-bold text-gray-800">{result.date}</p>
              </div>
              <div className="text-center p-4 bg-purple-50/50 rounded-xl backdrop-blur-sm">
                <Trophy className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-purple-600 font-medium">Procent</p>
                <p className="text-lg font-bold text-purple-700">{result.percentage}%</p>
              </div>
              <div className="text-center p-4 bg-blue-50/50 rounded-xl backdrop-blur-sm">
                <Target className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-600 font-medium">Maksymalne punkty</p>
                <p className="text-lg font-bold text-blue-700">{result.maxPoints}</p>
              </div>
              <div className="text-center p-4 bg-green-50/50 rounded-xl backdrop-blur-sm">
                <Trophy className="w-5 h-5 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-600 font-medium">Zdobyte punkty</p>
                <p className="text-lg font-bold text-green-700">{result.totalPoints}</p>
              </div>
            </div>
            
            <div className="text-center mb-8 p-6 bg-gradient-to-r from-gray-50/50 to-purple-50/50 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-gray-600 font-medium mb-2">Wynik końcowy</p>
              <p className="text-3xl font-bold gradient-text">
                {result.totalPoints} / {result.maxPoints} punktów ({result.percentage}%)
              </p>
            </div>
            
            <button onClick={resetForm} className="btn btn-primary w-full text-lg">
              Dodaj kolejny wynik
            </button>
          </div>
        </motion.div>
      </Layout>
    )
  }

  return (
    <Layout title="Test Dokumentów Administracyjnych">
      <motion.div 
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card-glass border-2 border-white/30 p-8">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl mb-8 text-white">
            <div className="flex items-center mb-4">
              <FileText className="w-8 h-8 mr-4" />
              <h2 className="text-2xl font-bold">Test Dokumentów Administracyjnych</h2>
            </div>
            <p className="text-purple-100">
              <strong className="text-white">Wprowadź maksymalną i zdobytą liczbę punktów</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">
                <User className="w-4 h-4 inline mr-2" />
                Nick
              </label>
              <input
                type="text"
                name="nick"
                value={formData.nick}
                onChange={handleInputChange}
                className="input"
                placeholder="Wprowadź swój nick"
                required
              />
            </div>

            <div>
              <label className="label">
                <Calendar className="w-4 h-4 inline mr-2" />
                Data
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <Target className="w-4 h-4 inline mr-2" />
                  Maksymalna ilość punktów
                </label>
                <input
                  type="number"
                  name="maxPoints"
                  min="1"
                  value={formData.maxPoints}
                  onChange={handleInputChange}
                  className="input text-lg font-bold text-center"
                  placeholder="np. 100"
                  required
                />
              </div>

              <div>
                <label className="label">
                  <Trophy className="w-4 h-4 inline mr-2" />
                  Zdobyta ilość punktów
                </label>
                <input
                  type="number"
                  name="achievedPoints"
                  min="0"
                  max={formData.maxPoints}
                  value={formData.achievedPoints}
                  onChange={handleInputChange}
                  className="input text-lg font-bold text-center"
                  placeholder="np. 85"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">
                <Trophy className="w-4 h-4 inline mr-2" />
                Punkty dodatkowe
              </label>
              <input
                type="number"
                name="bonusPoints"
                min="0"
                value={formData.bonusPoints || 0}
                onChange={handleInputChange}
                className="input text-lg font-bold text-center"
                placeholder="0"
              />
            </div>

            <div>
              <label className="label">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Notatki
              </label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                className="input min-h-[80px] resize-none"
                placeholder="Dodatkowe notatki..."
              />
            </div>

            <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-4 rounded-xl border-2 border-blue-200/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    <strong>Obliczony procent:</strong> {currentPercentage}%
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {formData.achievedPoints} / {formData.maxPoints} punktów
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  currentPercentage >= 75 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentPercentage >= 75 ? (
                    <>
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      ZALICZONY
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 inline mr-1" />
                      NIEZALICZONY
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || formData.maxPoints === 0}
              className="btn btn-success w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Zapisywanie...
                </div>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Zapisz wynik
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </Layout>
  )
}
