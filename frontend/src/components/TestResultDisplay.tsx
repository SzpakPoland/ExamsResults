import { useTestConductor } from './ui/Layout'

interface TestResultProps {
  testResult: {
    id: string
    studentName: string
    score: number
    maxScore: number
    date: string
    conductorName?: string
    conductorId?: string
    // ...other existing properties
  }
}

export default function TestResultDisplay({ testResult }: TestResultProps) {
  const conductorInfo = useTestConductor()
  
  // Use conductor info from result if available, otherwise use current conductor
  const displayConductor = testResult.conductorName || conductorInfo.conductorName

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      {/* ...existing test result display code... */}
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Przeprowadzający test: <strong>{displayConductor}</strong></span>
          <span>Data: {testResult.date}</span>
        </div>
      </div>
    </div>
  )
}
