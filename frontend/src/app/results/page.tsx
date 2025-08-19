'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Calendar, User, CheckCircle, XCircle, RefreshCw, Eye, X, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import Layout from '@/components/ui/Layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getResults, getResultsByType } from '@/utils/storage'
import type { ExamResult } from '@/types'

export default function ResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

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
    
    let filtered = results
    
    // Filter by type
    if (activeFilter !== 'all') {
      filtered = filtered.filter(result => result.examType === activeFilter)
    }
    
    // Filter by search term (nick)
    if (searchTerm.trim()) {
      filtered = filtered.filter(result => 
        result.nick.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filtered
  }

  const filteredResults = getFilteredResults()
  const totalResults = Array.isArray(results) ? results.length : 0
  const passedResults = Array.isArray(results) ? results.filter(r => r.passed).length : 0

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentResults = filteredResults.slice(startIndex, endIndex)

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
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
      
      <div className="flex justify-between items-center mt-4">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          result.examType === 'sprawdzanie' ? 'bg-blue-100 text-blue-800' :
          result.examType === 'ortografia' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {result.examType.charAt(0).toUpperCase() + result.examType.slice(1)}
        </span>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedResult(result)}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center space-x-1"
          >
            <Eye className="w-3 h-3" />
            <span>Szczegóły</span>
          </button>
          <p className="text-xs text-gray-500">
            {new Date(result.timestamp).toLocaleString('pl-PL')}
          </p>
        </div>
      </div>
    </motion.div>
  )

  // Details Modal Component
  const DetailsModal = ({ result, onClose }: { result: ExamResult, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Szczegóły wyniku - {result.nick}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 font-medium">Typ egzaminu</p>
              <p className="text-lg font-bold text-gray-800 capitalize">{result.examType}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 font-medium">Data</p>
              <p className="text-lg font-bold text-gray-800">{result.date}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 font-medium">Status</p>
              <p className={`text-lg font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                {result.passed ? 'ZALICZONY' : 'NIEZALICZONY'}
              </p>
            </div>
          </div>

          {/* Score Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-600 font-medium">Punkty</p>
              <p className="text-2xl font-bold text-blue-700">{result.totalPoints}/{result.maxPoints}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-purple-600 font-medium">Procent</p>
              <p className="text-2xl font-bold text-purple-700">{result.percentage}%</p>
            </div>
            {result.errors !== undefined && (
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <p className="text-sm text-red-600 font-medium">Błędy</p>
                <p className="text-2xl font-bold text-red-700">{result.errors}</p>
              </div>
            )}
            {result.bonusPoints !== undefined && (
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-green-600 font-medium">Punkty dodatkowe</p>
                <p className="text-2xl font-bold text-green-700">+{result.bonusPoints}</p>
              </div>
            )}
          </div>

          {/* Question Details (only for sprawdzanie) */}
          {result.examType === 'sprawdzanie' && result.questionResults && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Szczegóły odpowiedzi</h3>
              <div className="space-y-3">
                {result.questionResults.map((qr, index) => (
                  <div
                    key={qr.questionId}
                    className={`p-4 rounded-lg border-2 ${
                      qr.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          <span className="text-primary-600 font-semibold">Pytanie {index + 1}:</span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Punkty: {qr.pointsEarned}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        qr.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {qr.passed ? (
                          <>
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            Zaliczone
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 inline mr-1" />
                            Niezaliczone
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {result.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Notatki</h3>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-gray-700 whitespace-pre-wrap">{result.notes}</p>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="text-sm text-gray-500 border-t border-gray-200 pt-4">
            <p>Dodano: {new Date(result.timestamp).toLocaleString('pl-PL')}</p>
            {result.attempt && <p>Podejście: {result.attempt}</p>}
          </div>
        </div>
      </motion.div>
    </div>
  )

  if (loading) {
    return <LoadingSpinner message="Ładowanie wyników egzaminów..." />
  }

  return (
    <Layout title="Wyniki Egzaminów">
      {/* Filter Buttons */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {filterButtons.map((button) => (
              <button
                key={button.key}
                onClick={() => {
                  setActiveFilter(button.key)
                  setCurrentPage(1)
                }}
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
          
          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Wyszukaj po nicku..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCurrentPage(1)
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
        
        {/* Search Results Info */}
        {searchTerm && (
          <div className="text-sm text-gray-600 mb-4">
            {filteredResults.length > 0 ? (
              <>Znaleziono <strong>{filteredResults.length}</strong> wyników dla "<strong>{searchTerm}</strong>"</>
            ) : (
              <>Brak wyników dla "<strong>{searchTerm}</strong>"</>
            )}
          </div>
        )}
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
        <div className="flex items-center justify-between">
          <button
            onClick={loadResults}
            className="btn btn-primary"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Odśwież wyniki
          </button>
          
          {(searchTerm || activeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setActiveFilter('all')
                setCurrentPage(1)
              }}
              className="btn btn-secondary"
            >
              Wyczyść filtry
            </button>
          )}
        </div>
      </motion.div>

      {/* Results Table */}
      <motion.div
        className="card-glass border border-white/30 overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? 'Brak wyników wyszukiwania' : 'Brak wyników'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? (
                <>Nie znaleziono wyników dla "<strong>{searchTerm}</strong>"</>
              ) : activeFilter === 'all' ? (
                'Nie masz jeszcze żadnych wyników egzaminów.'
              ) : (
                `Brak wyników dla kategorii: ${filterButtons.find(b => b.key === activeFilter)?.label}`
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Nick
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Typ</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Data</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Wynik</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Procent</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {currentResults
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((result, index) => (
                      <motion.tr
                        key={result.id}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-800">
                              {searchTerm ? (
                                <span dangerouslySetInnerHTML={{
                                  __html: result.nick.replace(
                                    new RegExp(`(${searchTerm})`, 'gi'),
                                    '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                                  )
                                }} />
                              ) : (
                                result.nick
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            result.examType === 'sprawdzanie' ? 'bg-blue-100 text-blue-800' :
                            result.examType === 'ortografia' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {result.examType.charAt(0).toUpperCase() + result.examType.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">{result.date || 'Brak daty'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="font-semibold text-gray-800">
                            {result.totalPoints}/{result.maxPoints}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {result.percentage}%
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {result.passed ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                ZALICZONY
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                NIEZALICZONY
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => setSelectedResult(result)}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-xs font-medium transition-colors duration-200"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Szczegóły
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Pokazuje {startIndex + 1}-{Math.min(endIndex, filteredResults.length)} z {filteredResults.length} wyników
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    Strona {currentPage} z {totalPages}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Details Modal */}
      {selectedResult && (
        <DetailsModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </Layout>
  )
}
