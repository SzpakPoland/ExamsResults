import { useTestConductor } from '../components/ui/Layout'

export function useTestSubmission() {
  const conductorInfo = useTestConductor()

  const submitTest = async (testData: any) => {
    const enrichedTestData = {
      ...testData,
      conductorName: conductorInfo.conductorName,
      conductorId: conductorInfo.conductorId,
      submissionTimestamp: conductorInfo.timestamp
    }

    // Submit to your API
    const response = await fetch('/api/tests/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrichedTestData)
    })

    return response.json()
  }

  return { submitTest, conductorInfo }
}
