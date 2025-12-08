import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { userService } from '../services/userService'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { toast } from 'react-toastify'

interface User {
  id: number;
  name: string;
  last_name: string;
  email: string;
  role: string | null;
  is_verified: boolean;
}

interface FormData {
  name: string
  last_name: string
  email: string
  password: string
}

function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    last_name: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      navigate('/login')
      return
    }
    setFormData({
      name: currentUser.name || '',
      last_name: currentUser.last_name || '',
      email: currentUser.email || '',
      password: ''
    })
    setLoading(false)
  }, [navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveChanges = async () => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser || !currentUser.id) {
      toast.error('User not found')
      return
    }

    try {
      setIsSaving(true)
      
      const updateData: Partial<FormData> = {
        name: formData.name,
        last_name: formData.last_name,
        email: formData.email,
      }

      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password
      }

      await userService.updateUser(currentUser.id, updateData)
      
      setFormData(prev => ({
        ...prev,
        password: ''
      }))
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64 pt-16">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-3 lg:p-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-3">
              <h1 className="text-xl font-bold text-gray-900 mb-1">Account</h1>
              <p className="text-xs text-gray-600">Real-time information and activities of your account.</p>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Profile picture</h2>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                    {formData.name?.[0]?.toUpperCase() || 'U'}{formData.last_name?.[0]?.toUpperCase() || ''}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Full name</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">First name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Last name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Last name"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-1">Contact email</h2>
                <p className="text-xs text-gray-600 mb-3">Manage your account's email address for the invoices.</p>
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Email"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-1">Password</h2>
                <p className="text-xs text-gray-600 mb-3">Set your new password.</p>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">New password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 015.12 5.12m3.46 3.46L12 12m-3.42-3.42l3.42 3.42m0 0l3.42 3.42M12 12l3.42 3.42m-3.42-3.42l-3.42-3.42m6.84 6.84A9.97 9.97 0 0118.88 18.88M12 12l-3.42-3.42m6.84 6.84L12 12" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-3">
                <h1 className="text-xl font-bold text-gray-900 mb-1">Integrated account</h1>
                <p className="text-xs text-gray-600">Manage your current integrated accounts.</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Google</h3>
                      <p className="text-xs text-gray-600">Use Google for the faster login methods in your account.</p>
                    </div>
                  </div>
                  <button disabled className="px-2.5 py-1 text-xs font-medium rounded transition-colors bg-gray-300 text-gray-600 cursor-not-allowed">
                    Coming Soon
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Apple</h3>
                      <p className="text-xs text-gray-600">Sign in with Apple for a seamless experience.</p>
                    </div>
                  </div>
                  <button disabled className="px-2.5 py-1 text-xs font-medium rounded transition-colors bg-gray-300 text-gray-600 cursor-not-allowed">
                    Coming Soon
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">f</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Facebook</h3>
                      <p className="text-xs text-gray-600">Connect with Facebook for quick access to your account.</p>
                    </div>
                  </div>
                  <button disabled className="px-2.5 py-1 text-xs font-medium rounded transition-colors bg-gray-300 text-gray-600 cursor-not-allowed">
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h1 className="text-xl font-bold text-gray-900 mb-1">Account security</h1>
              <p className="text-xs text-gray-600 mb-3">Manage your account security.</p>

              <div className="flex gap-2">
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ProfilePage

