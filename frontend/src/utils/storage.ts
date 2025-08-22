import type { ExamResult, Question, User, UserFormData } from '@/types'


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

export const getQuestions = async (): Promise<Question[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/questions`)

    if (!response.ok) {
      throw new Error('Failed to fetch questions')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching questions:', error)
    return []
  }
}

export const saveResult = async (result: ExamResult): Promise<void> => {
  try {
    console.log('=== FRONTEND SAVE DEBUG ===')
    console.log('Sending result to backend:', result)
    console.log('ErrorsList in request:', result.errorsList)
    console.log('ErrorsList type:', typeof result.errorsList)
    console.log('ErrorsList is array:', Array.isArray(result.errorsList))
    console.log('ErrorsList length:', result.errorsList?.length)
    
    if (result.errorsList && Array.isArray(result.errorsList)) {
      result.errorsList.forEach((error, index) => {
        console.log(`Frontend Error ${index + 1}:`, error)
      })
    }

    const response = await fetch(`${API_BASE_URL}/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    })

    console.log('Backend response status:', response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error('Backend error response:', error)
      throw new Error(error.message || 'Failed to save result')
    }

    const savedResult = await response.json()
    console.log('Backend returned saved result:', savedResult)
    console.log('Returned errorsList:', savedResult.errorsList)
  } catch (error) {
    console.error('Error saving result:', error)
    throw error
  }
}

export const getResults = async (): Promise<ExamResult[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/results`)

    if (!response.ok) {
      throw new Error('Failed to fetch results')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching results:', error)
    return []
  }
}

export const getResultsByType = async (type: string): Promise<ExamResult[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/results/${type}`)

    if (!response.ok) {
      throw new Error('Failed to fetch results by type')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching results by type:', error)
    return []
  }
}

export const deleteResult = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/results/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete result')
    }
  } catch (error) {
    console.error('Error deleting result:', error)
    throw error
  }
}

export const getStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`)

    if (!response.ok) {
      throw new Error('Failed to fetch statistics')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      total: 0,
      passed: 0,
      failed: 0,
      byType: { sprawdzanie: 0, ortografia: 0, dokumenty: 0 },
      passRate: 0
    }
  }
}

// User management functions (superadmin only)
export const getUsers = async (): Promise<User[]> => {
  try {
    const token = localStorage.getItem('auth-token')
    console.log('Getting users with token:', token)
    
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    console.log('Users API response status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Users API error:', errorData)
      throw new Error('Failed to fetch users')
    }

    const users = await response.json()
    console.log('Fetched users:', users)
    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export const createUser = async (userData: UserFormData): Promise<User | null> => {
  try {
    const token = localStorage.getItem('auth-token')
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create user')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export const updateUser = async (id: number, userData: Partial<UserFormData>): Promise<User | null> => {
  try {
    const token = localStorage.getItem('auth-token')
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update user')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export const deleteUser = async (id: number): Promise<void> => {
  try {
    const token = localStorage.getItem('auth-token')
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete user')
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

export const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem('auth-token')
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to change password')
    }

    return true
  } catch (error) {
    console.error('Error changing password:', error)
    throw error
  }
}

// Add auth functions
export const login = async (username: string, password: string) => {
  console.log('Login attempt to:', `${API_BASE_URL}/auth/login`)
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    console.log('Login response status:', response.status)
    console.log('Login response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Login error response:', errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('Login success data:', data)
    return data
  } catch (error) {
    console.error('Login network error:', error)
    throw error
  }
}

export const verifyToken = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    if (!response.ok) {
      throw new Error('Token verification failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Token verification error:', error)
    throw error
  }
}