'use client'

import { ReactNode, createContext, useContext } from 'react'
import { motion } from 'framer-motion'
import ResponsiveNavbar from './ResponsiveNavbar'
import { useAuth } from '@/context/AuthContext'

interface LayoutProps {
  children: ReactNode
  title?: string
}

// Context for test conductor information
interface TestConductorContextType {
  conductorName: string
  conductorId: string
  timestamp: string
}

const TestConductorContext = createContext<TestConductorContextType | null>(null)

export const useTestConductor = () => {
  const context = useContext(TestConductorContext)
  const { user } = useAuth()
  
  // Return safe defaults if context is not available
  if (!context) {
    return {
      conductorName: user?.name || 'Nieznany',
      conductorId: user?.id?.toString() || 'unknown',
      timestamp: new Date().toISOString()
    }
  }
  return context
}

export default function Layout({ children, title }: LayoutProps) {
  const { user } = useAuth()
  
  // Get current user info from auth context
  const getCurrentConductor = (): TestConductorContextType => {
    return {
      conductorName: user?.name || 'Nieznany',
      conductorId: user?.id?.toString() || 'unknown',
      timestamp: new Date().toISOString()
    }
  }

  const conductorInfo = getCurrentConductor()

  return (
    <TestConductorContext.Provider value={conductorInfo}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
        <ResponsiveNavbar />
        
        <main className="container mx-auto px-4 py-8 flex-1 flex flex-col">
          {title && (
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold gradient-text mb-2">{title}</h1>
              <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full" />
            </motion.div>
          )}
          
          <motion.div
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </TestConductorContext.Provider>
  )
}