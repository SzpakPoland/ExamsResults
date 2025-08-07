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
    name: 'Dokumenty Administracyjne',
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
              className="group block card-glass p-8 hover:scale-[1.02] transition-all duration-300 border border-white/30 hover:border-white/50"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${examType.gradient} mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <examType.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:gradient-text transition-all duration-300">
                {examType.name}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {examType.description}
              </p>
              
              <div className="mt-4 flex items-center text-primary-600 group-hover:text-primary-700 transition-colors duration-300">
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
        <h2 className="text-4xl font-bold gradient-text mb-4">
          Funkcje systemu
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Zaawansowane funkcje zaprojektowane z myślą o efektywności
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="card-glass p-8 group hover:scale-105 transition-all duration-300 border border-white/30"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.8 + index * 0.2 }}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Layout>
  )
}
