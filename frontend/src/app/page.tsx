'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, PenTool, FileText, BarChart3, Zap, Save, Target } from 'lucide-react'
import Layout from '@/components/ui/Layout'

const examTypes = [
  {
    name: 'Sprawdzanie',
    description: 'Test sprawdzający z błędami i punktami dodatkowymi',
    href: '/sprawdzanie',
    icon: BookOpen,
    gradient: 'from-blue-500 to-blue-700',
  },
  {
    name: 'Ortografia',
    description: 'Test ortograficzny z nick, podejściem i wartością procentową',
    href: '/ortografia',
    icon: PenTool,
    gradient: 'from-green-500 to-green-700',
  },
  {
    name: 'Dokumenty',
    description: 'Test z maksymalną i zdobytą liczbą punktów',
    href: '/dokumenty',
    icon: FileText,
    gradient: 'from-purple-500 to-purple-700',
  },
  {
    name: 'Wyniki',
    description: 'Przeglądanie wszystkich wyników egzaminów',
    href: '/results',
    icon: BarChart3,
    gradient: 'from-orange-500 to-orange-700',
  },
]

const features = [
  {
    icon: Zap,
    title: 'Automatyczne obliczanie',
    description: 'System automatycznie oblicza wyniki na podstawie wprowadzonych danych',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    icon: Save,
    title: 'Lokalny zapis',
    description: 'Wszystkie wyniki są zapisywane lokalnie w przeglądarce',
    color: 'from-green-400 to-green-600',
  },
  {
    icon: Target,
    title: 'Różne typy testów',
    description: 'Obsługa różnych typów egzaminów z własnymi regułami',
    color: 'from-purple-400 to-purple-600',
  },
]

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center shadow-2xl animate-float">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        
        <motion.h1 
          className="text-6xl font-bold gradient-text mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Panel Wyników Egzaminów
        </motion.h1>
        
        <motion.p 
          className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Nowoczesny system zarządzania wynikami egzaminów z intuicyjnym interfejsem
        </motion.p>
      </motion.div>

      {/* Exam Types Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        {examTypes.map((examType, index) => (
          <motion.div
            key={examType.name}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
          >
            <Link
              href={examType.href}
              className="group block card-glass p-8 hover:scale-[1.02] transition-all duration-300 border border-white/30 hover:border-white/50 h-full"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${examType.gradient} mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <examType.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:gradient-text transition-all duration-300 min-h-[3.5rem] flex items-center">
                {examType.name}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-6 min-h-[4.5rem]">
                {examType.description}
              </p>
              
              <div className="mt-auto flex items-center text-primary-600 group-hover:text-primary-700 transition-colors duration-300">
                <span className="text-sm font-semibold">Rozpocznij test</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Features Section */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.6 }}
      >
       
      </motion.div>

      
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
