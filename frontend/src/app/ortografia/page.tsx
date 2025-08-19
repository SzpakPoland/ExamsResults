'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PenTool, User, RotateCcw, Percent, Save, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import Layout from '@/components/ui/Layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { saveResult } from '@/utils/storage'
import type { ExamResult, OrtografiaFormData } from '@/types'

export default function OrtografiaPage() {
  const [formData, setFormData] = useState<OrtografiaFormData>({
    nick: '',
    attempt: 1,
    percentage: 0,
    date: '',
    notes: ''
  })
  const [result, setResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'percentage' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const totalWords = 20
    const achievedPoints = Math.round(((formData.percentage || 0) / 100) * totalWords)
    const errors = totalWords - achievedPoints
    
    try {
      const newResult: ExamResult = {
        id: Date.now(),
        nick: formData.nick,
        date: formData.date,
        attempt: formData.attempt,
        totalPoints: achievedPoints,
        maxPoints: totalWords,
        percentage: formData.percentage || 0,
        passed: (formData.percentage || 0) >= 75,
        timestamp: new Date().toISOString(),
        examType: 'ortografia',
        notes: formData.notes,
        errors
      }

      await saveResult(newResult)
      setResult(newResult)
      setFormData({ nick: '', date: '', attempt: 1, percentage: 0, notes: '' })
    } catch (error) {
      console.error('Error submitting result:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setResult(null)
    setFormData({ nick: '', attempt: 1, percentage: 0, date: '', notes: '' })
  }

  if (pageLoading) {
    return <LoadingSpinner message="Przygotowywanie testu ortografii..." />
  }

  if (result) {
    return (
      <Layout title="Test Ortografii - Wynik">
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={`card-glass p-8 border-2 ${result.passed ? 'border-green-200' : 'border-red-200'}`}>
            <motion.div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-700 shadow-lg">
                <PenTool className="w-10 h-10 text-white" />
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
                <RotateCcw className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Podejście</p>
                <p className="text-lg font-bold text-gray-800">{result.attempt}</p>
              </div>
              <div className="text-center p-4 bg-green-50/50 rounded-xl backdrop-blur-sm">
                <Percent className="w-5 h-5 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-600 font-medium">Procent</p>
                <p className="text-lg font-bold text-green-700">{result.percentage}%</p>
              </div>
            </div>
            
            <div className="text-center mb-8 p-6 bg-gradient-to-r from-gray-50/50 to-green-50/50 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-gray-600 font-medium mb-2">Wynik końcowy</p>
              <p className="text-3xl font-bold gradient-text">
                {result.percentage}%
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
    <Layout title="Test Ortografii">
      <motion.div 
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card-glass border-2 border-white/30 p-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl mb-8 text-white">
            <div className="flex items-center mb-4">
              <PenTool className="w-8 h-8 mr-4" />
              <h2 className="text-2xl font-bold">Test Ortografii</h2>
            </div>
            <p className="text-green-100">
              <strong className="text-white">Wprowadź nick, podejście i wartość procentową</strong>
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
                <RotateCcw className="w-4 h-4 inline mr-2" />
                Podejście
              </label>
              <select
                name="attempt"
                value={formData.attempt}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="Pierwsze">Pierwsze podejście</option>
                <option value="Drugie">Drugie podejście</option>
                <option value="Inne">Inne</option>
              </select>
            </div>

            <div>
              <label className="label">
                <Percent className="w-4 h-4 inline mr-2" />
                Wartość procentowa (%)
              </label>
              <input
                type="number"
                name="percentage"
                min="0"
                max="100"
                value={formData.percentage}
                onChange={handleInputChange}
                className="input text-lg font-bold text-center"
                placeholder="np. 85"
                required
              />
            </div>

            <div>
              <label className="label">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Notatki
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="input min-h-[80px] resize-none"
                placeholder="Dodatkowe notatki..."
              />
            </div>

            <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-4 rounded-xl border-2 border-blue-200/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    <strong>Wprowadzony procent:</strong> {formData.percentage}%
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  formData.percentage >= 75 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {formData.percentage >= 75 ? (
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
              disabled={loading}
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
