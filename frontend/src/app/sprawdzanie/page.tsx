'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, User, Calendar, MessageSquare, Save, CheckCircle, XCircle, AlertTriangle, Plus, X } from 'lucide-react'
import Layout, { useTestConductor } from '@/components/ui/Layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { saveResult, getQuestions } from '@/utils/storage'
import type { ExamResult, SprawdzanieFormData, Question, QuestionResult } from '@/types'

export default function SprawdzaniePage() {
  const [formData, setFormData] = useState<SprawdzanieFormData>({
    nick: '',
    date: '',
    questionResults: [],
    bonusPoints: 0,
    notes: '',
    errorsCount: 0,
    errorsList: []
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [result, setResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const conductorInfo = useTestConductor()

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      const questionsData = await getQuestions()
      setQuestions(questionsData)
      
      // Initialize question results
      const initialResults: QuestionResult[] = questionsData.map(q => ({
        questionId: q.id,
        passed: false,
        pointsEarned: 0
      }))
      
      setFormData(prev => ({
        ...prev,
        questionResults: initialResults
      }))
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setTimeout(() => {
        setPageLoading(false)
      }, 1500)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'bonusPoints' || name === 'errorsCount' ? parseInt(value) || 0 : value
    }))
  }

  const handleErrorsCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value) || 0
    const currentErrorsList = [...formData.errorsList]
    
    // Jeśli zwiększamy liczbę błędów, dodaj nowe puste błędy
    if (count > currentErrorsList.length) {
      for (let i = currentErrorsList.length; i < count; i++) {
        currentErrorsList.push({
          id: Date.now() + i,
          description: ''
        })
      }
    }
    // Jeśli zmniejszamy, usuń nadmiarowe błędy
    else if (count < currentErrorsList.length) {
      currentErrorsList.splice(count)
    }

    setFormData(prev => ({
      ...prev,
      errorsCount: count,
      errorsList: currentErrorsList
    }))
  }

  const handleErrorDescriptionChange = (errorId: number, description: string) => {
    setFormData(prev => ({
      ...prev,
      errorsList: prev.errorsList.map(error =>
        error.id === errorId ? { ...error, description } : error
      )
    }))
  }

  const handleQuestionChange = (questionId: number, pointsEarned: number) => {
    const question = questions.find(q => q.id === questionId)
    if (!question) return

    setFormData(prev => ({
      ...prev,
      questionResults: prev.questionResults.map(qr => 
        qr.questionId === questionId 
          ? { 
              ...qr, 
              pointsEarned,
              passed: pointsEarned > 0 // Auto-określa zaliczenie na podstawie punktów
            }
          : qr
      )
    }))
  }

  const calculateResults = () => {
    if (questions.length === 0) return { totalMaxPoints: 0, earnedPoints: 0, totalPoints: 0, percentage: 0, passed: false, pointsAfterErrors: 0 }
    
    const baseMaxPoints = questions.reduce((sum, q) => sum + q.maxPoints, 0)
    const totalMaxPoints = baseMaxPoints + formData.bonusPoints
    const earnedPoints = formData.questionResults.reduce((sum, qr) => sum + qr.pointsEarned, 0)
    
    // Odejmij punkty za błędy (1 punkt za każdy błąd) - POPRAWKA
    const pointsAfterErrors = Math.max(0, earnedPoints - formData.errorsCount)
    const totalPoints = pointsAfterErrors + formData.bonusPoints
    
    // USUŃ DEBUG LOG - spamuje konsolę
    // console.log('Calculation debug:', { ... })
    
    const percentage = totalMaxPoints > 0 ? (totalPoints / totalMaxPoints) * 100 : 0
    const passed = percentage >= 75

    return {
      totalMaxPoints,
      earnedPoints,
      pointsAfterErrors,
      totalPoints,
      percentage: Math.round(percentage * 100) / 100,
      passed
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { totalMaxPoints, totalPoints, percentage, passed } = calculateResults()

      // Użyj wszystkich błędów z opisami
      const allErrorsList = formData.errorsList.map((error, index) => ({
        id: error.id || Date.now() + index,
        description: error.description || `Błąd ${index + 1} - brak opisu`
      }))

      const newResult: ExamResult = {
        id: Date.now(),
        nick: formData.nick,
        date: formData.date,
        bonusPoints: formData.bonusPoints,
        totalPoints,
        maxPoints: totalMaxPoints,
        percentage,
        passed,
        timestamp: new Date().toISOString(),
        examType: 'sprawdzanie',
        questionResults: formData.questionResults,
        notes: formData.notes,
        errors: formData.errorsCount,
        errorsList: allErrorsList,
        conductorName: conductorInfo.conductorName,
        conductorId: conductorInfo.conductorId
      }

      await saveResult(newResult)
      setResult(newResult)
      setFormData({
        nick: '',
        date: '',
        questionResults: questions.map(q => ({
          questionId: q.id,
          passed: false,
          pointsEarned: 0
        })),
        bonusPoints: 0,
        notes: '',
        errorsCount: 0,
        errorsList: []
      })
    } catch (error) {
      console.error('Error submitting result:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setResult(null)
    setFormData({
      nick: '',
      date: '',
      questionResults: questions.map(q => ({
        questionId: q.id,
        passed: false,
        pointsEarned: 0
      })),
      bonusPoints: 0,
      notes: '',
      errorsCount: 0,
      errorsList: []
    })
  }

  if (pageLoading) {
    return <LoadingSpinner message="Ładowanie pytań egzaminacyjnych..." />
  }

  if (result) {
    return (
      <Layout title="Test Sprawdzania - Wynik">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={`card-glass p-8 border-2 ${result.passed ? 'border-green-200' : 'border-red-200'}`}>
            <motion.div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Wynik dla: {result.nick}
              </h2>
              <div className={result.passed ? 'status-passed' : 'status-failed'}>
                {result.passed ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                {result.passed ? 'ZALICZONY' : 'NIEZALICZONY'}
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50/50 rounded-xl">
                <p className="text-sm text-blue-600 font-medium">Punkty za pytania</p>
                <p className="text-2xl font-bold text-blue-700">
                  {result.questionResults?.reduce((sum, qr) => sum + qr.pointsEarned, 0) || 0}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50/50 rounded-xl">
                <p className="text-sm text-red-600 font-medium">Błędy</p>
                <p className="text-2xl font-bold text-red-700">-{result.errors || 0}</p>
              </div>
              <div className="text-center p-4 bg-green-50/50 rounded-xl">
                <p className="text-sm text-green-600 font-medium">Punkty dodatkowe</p>
                <p className="text-2xl font-bold text-green-700">+{result.bonusPoints}</p>
              </div>
              <div className="text-center p-4 bg-purple-50/50 rounded-xl">
                <p className="text-sm text-purple-600 font-medium">Procent</p>
                <p className="text-2xl font-bold text-purple-700">{result.percentage}%</p>
              </div>
            </div>

            {/* Lista błędów */}
            {result.errorsList && result.errorsList.length > 0 && (
              <div className="mb-8 p-4 bg-red-50/50 rounded-xl border border-red-200">
                <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Wykryte błędy ({result.errorsList.length})
                </h3>
                <div className="space-y-2">
                  {result.errorsList.map((error, index) => (
                    <div key={error.id} className="flex items-start">
                      <span className="text-red-600 font-bold mr-2">{index + 1}.</span>
                      <p className="text-red-700">{error.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

  const { totalMaxPoints, totalPoints, earnedPoints, pointsAfterErrors, percentage, passed } = calculateResults()

  return (
    <Layout title="Test Sprawdzania">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Questions Panel */}
          <div className="lg:col-span-2">
            <motion.div 
              className="card-glass border-2 border-white/30 p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl mb-6 text-white">
                <h2 className="text-xl font-bold flex items-center">
                  <BookOpen className="w-6 h-6 mr-3" />
                  Pytania Egzaminacyjne ({questions.length} pytań)
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Wpisz liczbę punktów (0 = niezaliczone, {'>'}0 = zaliczone)
                </p>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {questions.map((question, index) => {
                  const questionResult = formData.questionResults.find(qr => qr.questionId === question.id)
                  const pointsEarned = questionResult?.pointsEarned || 0
                  const isPassed = pointsEarned > 0
                  
                  return (
                    <motion.div 
                      key={question.id}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        isPassed 
                          ? 'border-green-200 bg-green-50/50' 
                          : 'border-gray-200 bg-gray-50/50'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            <span className="text-primary-600 font-semibold">{index + 1}.</span> {question.text}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Maksymalnie: {question.maxPoints} pkt
                          </p>
                        </div>
                        
                        {/* Status Badge */}
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isPassed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isPassed ? (
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
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Logika: {pointsEarned > 0 ? 'Punkty > 0 = Zaliczone' : 'Punkty = 0 = Niezaliczone'}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium text-gray-700">Punkty:</label>
                          <input
                            type="number"
                            min="0"
                            max={question.maxPoints}
                            value={pointsEarned}
                            onChange={(e) => handleQuestionChange(question.id, parseInt(e.target.value) || 0)}
                            className={`w-16 px-2 py-1 border-2 rounded text-center font-bold transition-all ${
                              isPassed 
                                ? 'border-green-300 bg-green-50' 
                                : 'border-gray-300 bg-white'
                            }`}
                          />
                          <span className="text-sm text-gray-600">/ {question.maxPoints}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Form Panel */}
          <div className="lg:col-span-1">
            <motion.div 
              className="card-glass border-2 border-white/30 p-6 sticky top-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl mb-6 text-white">
                <h2 className="text-xl font-bold flex items-center">
                  <User className="w-6 h-6 mr-3" />
                  Dane egzaminu
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div>
                  <label className="label">
                    Punkty dodatkowe
                  </label>
                  <input
                    type="number"
                    name="bonusPoints"
                    min="0"
                    value={formData.bonusPoints}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>

                {/* Nowe pole dla błędów */}
                <div>
                  <label className="label">
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    Liczba błędów (każdy błąd = -1 pkt)
                  </label>
                  <input
                    type="number"
                    name="errorsCount"
                    min="0"
                    value={formData.errorsCount}
                    onChange={handleErrorsCountChange}
                    className="input"
                  />
                </div>

                {/* Pola opisu błędów */}
                {formData.errorsCount > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                      Opisy błędów:
                    </h4>
                    {formData.errorsList.map((error, index) => (
                      <div key={error.id} className="relative">
                        <label className="label text-sm">
                          Błąd {index + 1}:
                        </label>
                        <textarea
                          value={error.description}
                          onChange={(e) => handleErrorDescriptionChange(error.id, e.target.value)}
                          className="input min-h-[60px] resize-none"
                          placeholder={`Opisz błąd ${index + 1}...`}
                        />
                      </div>
                    ))}
                  </div>
                )}

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

                {/* Summary */}
                <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-4 rounded-xl border-2 border-blue-200/50">
                  <h3 className="font-semibold text-blue-800 mb-2">Podsumowanie:</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Pytania załadowane:</strong> {questions.length}</p>
                    <p><strong>Punkty bazowe:</strong> {questions.reduce((sum, q) => sum + q.maxPoints, 0)}</p>
                    <p><strong>Punkty za pytania:</strong> {earnedPoints}</p>
                    <p><strong>Błędy:</strong> -{formData.errorsCount}</p>
                    <p><strong>Po błędach:</strong> {pointsAfterErrors}</p>
                    <p><strong>Punkty dodatkowe:</strong> +{formData.bonusPoints}</p>
                    <p><strong>Maksymalne punkty:</strong> {totalMaxPoints}</p>
                    <p><strong>Końcowy wynik:</strong> {totalPoints}</p>
                    <p><strong>Procent:</strong> {percentage.toFixed(1)}%</p>
                    <p className={`font-bold ${passed ? 'text-green-700' : 'text-red-700'}`}>
                      Status: {passed ? 'ZALICZONY' : 'NIEZALICZONY'}
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-success w-full text-lg disabled:opacity-50"
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
            </motion.div>
          </div>
        </div>
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