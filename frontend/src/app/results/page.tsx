'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Calendar, User, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import Layout from '@/components/ui/Layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getResults, getResultsByType } from '@/utils/storage'
import type { ExamResult } from '@/types'

export default function ResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    loadResults()
  }, [])

  const loadResults = async () => {
    setLoading(true)
    try {
      const data = await getResults()
      // Ensure data is an array
      setResults(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading results:', error)
      setResults([])
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 800)
    }
  }

  const filterButtons = [
    { key: 'all', label: 'Wszystkie', color: 'bg-primary-500' },
    { key: 'sprawdzanie', label: 'Sprawdzanie', color: 'bg-blue-500' },
    { key: 'ortografia', label: 'Ortografia', color: 'bg-green-500' },
    { key: 'dokumenty', label: 'Dokumenty', color: 'bg-purple-500' },
  ]

  const getFilteredResults = () => {
    if (!Array.isArray(results)) return []
    if (activeFilter === 'all') return results
    return results.filter(result => result.examType === activeFilter)
  }

  const ResultCard = ({ result }: { result: ExamResult }) => (
    <motion.div
      className={`card-glass p-6 border-2 ${result.passed ? 'border-green-200' : 'border-red-200'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <User className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{result.nick}</h3>
        </div>
        <div className={result.passed ? 'status-passed' : 'status-failed'}>
          {result.passed ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
          {result.passed ? 'ZALICZONY' : 'NIEZALICZONY'}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        {result.date && (
          <div className="text-center p-2 bg-gray-50/50 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Data</p>
            <p className="font-medium text-sm">{result.date}</p>
          </div>
        )}
        {result.attempt && (
          <div className="text-center p-2 bg-blue-50/50 rounded-lg">
            <p className="text-xs text-blue-600">Podejście</p>
            <p className="font-medium text-sm">{result.attempt}</p>
          </div>
        )}
        <div className="text-center p-2 bg-green-50/50 rounded-lg">
          <p className="text-xs text-green-600">Wynik</p>
          <p className="font-medium text-sm">{result.totalPoints}/{result.maxPoints}</p>
        </div>
        <div className="text-center p-2 bg-purple-50/50 rounded-lg">
          <p className="text-xs text-purple-600">Procent</p>
          <p className="font-bold text-sm">{result.percentage}%</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          result.examType === 'sprawdzanie' ? 'bg-blue-100 text-blue-800' :
          result.examType === 'ortografia' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {result.examType.charAt(0).toUpperCase() + result.examType.slice(1)}
        </span>
        <p className="text-xs text-gray-500">
          {new Date(result.timestamp).toLocaleString('pl-PL')}
        </p>
      </div>
    </motion.div>
  )

  if (loading) {
    return <LoadingSpinner message="Ładowanie wyników egzaminów..." />
  }

  const filteredResults = getFilteredResults()
  const totalResults = Array.isArray(results) ? results.length : 0
  const passedResults = Array.isArray(results) ? results.filter(r => r.passed).length : 0

  return (
    <Layout title="Wyniki Egzaminów">
      {/* Filter Buttons */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-wrap gap-3 mb-6">
          {filterButtons.map((button) => (
            <button
              key={button.key}
              onClick={() => setActiveFilter(button.key)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeFilter === button.key
                  ? `${button.color} text-white shadow-lg transform scale-105`
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6 text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Łącznie wyników</h3>
            <p className="text-3xl font-bold gradient-text">{totalResults}</p>
          </div>
          <div className="card p-6 text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Zaliczonych</h3>
            <p className="text-3xl font-bold text-green-600">{passedResults}</p>
          </div>
          <div className="card p-6 text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Niezaliczonych</h3>
            <p className="text-3xl font-bold text-red-600">{totalResults - passedResults}</p>
          </div>
          <div className="card p-6 text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-2">% Zdawalności</h3>
            <p className="text-3xl font-bold text-blue-600">
              {totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0}%
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <button
          onClick={loadResults}
          className="btn btn-primary"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Odśwież wyniki
        </button>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {filteredResults.length === 0 ? (
          <div className="card-glass text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Brak wyników</h3>
            <p className="text-gray-500">
              {activeFilter === 'all' 
                ? 'Nie masz jeszcze żadnych wyników egzaminów.' 
                : `Brak wyników dla kategorii: ${filterButtons.find(b => b.key === activeFilter)?.label}`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((result) => (
                <ResultCard key={result.id} result={result} />
              ))}
          </div>
        )}
      </motion.div>
    </Layout>
  )
}
