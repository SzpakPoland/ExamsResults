'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Users, Plus, Edit, Trash2, Save, X, Eye, EyeOff } from 'lucide-react'
import Layout from '@/components/ui/Layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/context/AuthContext'
import { getUsers, createUser, updateUser, deleteUser } from '@/utils/storage'
import type { User, UserFormData } from '@/types'

export default function AdminPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    role: 'user',
    name: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    console.log('AdminPage mounted, current user:', user)
    if (user?.role !== 'superadmin') {
      console.log('User is not superadmin, role:', user?.role)
      return
    }
    loadUsers()
  }, [user])

  const loadUsers = async () => {
    console.log('Loading users...')
    setLoading(true)
    setError('')
    try {
      const userData = await getUsers()
      console.log('Loaded users data:', userData)
      setUsers(userData)
    } catch (error) {
      console.error('Error loading users:', error)
      setError('Błąd podczas ładowania użytkowników')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createUser(formData)
      setFormData({ username: '', password: '', role: 'user', name: '' })
      setShowCreateForm(false)
      loadUsers()
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    
    try {
      const updateData: Partial<UserFormData> = {
        username: formData.username,
        role: formData.role,
        name: formData.name
      }
      
      if (formData.password) {
        updateData.password = formData.password
      }

      await updateUser(editingUser.id, updateData)
      setEditingUser(null)
      setFormData({ username: '', password: '', role: 'user', name: '' })
      loadUsers()
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
      try {
        await deleteUser(userId)
        loadUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  const startEdit = (userToEdit: User) => {
    setEditingUser(userToEdit)
    setFormData({
      username: userToEdit.username,
      password: '',
      role: userToEdit.role,
      name: userToEdit.name
    })
    setShowCreateForm(false)
  }

  const cancelEdit = () => {
    setEditingUser(null)
    setShowCreateForm(false)
    setFormData({ username: '', password: '', role: 'user', name: '' })
  }

  // Check if user is superadmin
  if (user?.role !== 'superadmin') {
    return (
      <Layout title="Brak dostępu">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Brak uprawnień</h2>
          <p className="text-gray-600">Tylko Super Administrator ma dostęp do tej strony.</p>
        </div>
      </Layout>
    )
  }

  if (loading) {
    return <LoadingSpinner message="Ładowanie panelu administracyjnego..." />
  }

  return (
    <Layout title="Panel Administracyjny">
      <div className="max-w-6xl mx-auto">
        {/* Debug info */}
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm">Debug: Current user: {user?.username} (role: {user?.role})</p>
          <p className="text-sm">Users loaded: {users.length}</p>
          {error && <p className="text-sm text-red-600">Error: {error}</p>}
        </div>

        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8 text-primary-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Zarządzanie Użytkownikami</h2>
                <p className="text-gray-600">Dodawaj, edytuj i usuwaj konta użytkowników</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
              disabled={editingUser !== null}
            >
              <Plus className="w-5 h-5 mr-2" />
              Dodaj użytkownika
            </button>
          </div>
        </motion.div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingUser) && (
          <motion.div 
            className="card-glass p-6 mb-8 border-2 border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {editingUser ? 'Edytuj użytkownika' : 'Dodaj nowego użytkownika'}
              </h3>
              <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nazwa użytkownika</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Imię i nazwisko</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Hasło {editingUser && '(zostaw puste aby nie zmieniać)'}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="input pr-10"
                    required={!editingUser}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Rola</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="input"
                  required
                >
                  <option value="user">Użytkownik</option>
                  <option value="cmd">CMD (tylko ortografia)</option>
                  <option value="administrator">Administrator</option>
                  {user?.id === editingUser?.id && (
                    <option value="superadmin">Super Administrator</option>
                  )}
                </select>
              </div>

              <div className="md:col-span-2 flex space-x-4">
                <button type="submit" className="btn btn-success">
                  <Save className="w-5 h-5 mr-2" />
                  {editingUser ? 'Zaktualizuj' : 'Utwórz'}
                </button>
                <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                  Anuluj
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Users List */}
        <motion.div 
          className="card-glass border-2 border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Lista użytkowników ({users.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Użytkownik</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nazwa konta</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rola</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userData) => (
                    <tr key={userData.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4 text-gray-600">{userData.id}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{userData.username}</td>
                      <td className="py-3 px-4 text-gray-700">{userData.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userData.role === 'superadmin' ? 'bg-red-100 text-red-800' :
                          userData.role === 'administrator' ? 'bg-blue-100 text-blue-800' :
                          userData.role === 'cmd' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {userData.role === 'superadmin' ? 'Super Admin' :
                           userData.role === 'administrator' ? 'Administrator' :
                           userData.role === 'cmd' ? 'CMD' : 'Użytkownik'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => startEdit(userData)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edytuj"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {userData.role !== 'superadmin' && (
                            <button
                              onClick={() => handleDeleteUser(userData.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Usuń"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
