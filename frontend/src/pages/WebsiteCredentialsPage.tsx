import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { credentialsService } from '../services/credentialsService'
import { websiteService } from '../services/websiteService'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { toast } from 'react-toastify'

interface Website {
  id: number
  website_id: string
  name: string
  url: string | null
  active: boolean
  created_at: string | null
  updated_at: string | null
}

interface CredentialsResponse {
  success: boolean
  message: string
  token: string
  deals: string[]
}

function WebsiteCredentialsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [websites, setWebsites] = useState<Website[]>([])
  const [selectedWebsite, setSelectedWebsite] = useState<string>('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>('')
  const [responseData, setResponseData] = useState<CredentialsResponse | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      const currentUser = authService.getCurrentUser()
      const token = authService.getToken()
      
      if (!currentUser || !token) {
        authService.logout()
        navigate('/login')
        return
      }

      try {
        const websitesResponse = await websiteService.getUserWebsites()
        setWebsites(websitesResponse.data)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load websites'
        
        if (errorMessage.includes('token') || errorMessage.includes('authentication') || errorMessage.includes('No authentication') || errorMessage.includes('Session expired')) {
          authService.logout()
          navigate('/login')
          return
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResponseData(null)
    
    if (!selectedWebsite) {
      setError('Please select a website')
      toast.error('Please select a website')
      return
    }

    if (!username || !password) {
      setError('Please fill in all fields')
      toast.error('Please fill in all fields')
      return
    }

    // Check if there are any websites available
    if (websites.length === 0) {
      setError('No websites available. Please contact administrator.')
      toast.error('No websites available. Please contact administrator.')
      return
    }

    try {
      setSubmitting(true)
      const response = await credentialsService.submitCredentials({
        website: selectedWebsite.toLowerCase(),
        username,
        password
      })

      if (response.success) {
        setResponseData(response)
        toast.success('Credentials submitted successfully!')
      } else {
        setError(response.message || 'Submission failed')
        toast.error(response.message || 'Submission failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Submission failed'
      setError(errorMessage)
      
      if (errorMessage.includes('access') || errorMessage.includes('permission') || errorMessage.includes('403') || errorMessage.includes('FORBIDDEN')) {
        toast.error('You do not have permission to access this website. Please contact administrator.')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownload = () => {
    if (!responseData || !responseData.deals || responseData.deals.length === 0) {
      toast.error('No deals to download')
      return
    }
    
    const content = responseData.deals.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deals_${selectedWebsite}_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('File downloaded successfully!')
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
        <main className="p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Website Credentials</h1>
              <p className="text-sm text-gray-600">Select a website and enter your credentials.</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Select Website
                  </label>
                  <select
                    value={selectedWebsite}
                    onChange={(e) => {
                      setSelectedWebsite(e.target.value)
                      setResponseData(null)
                      setError('')
                    }}
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="">Select website...</option>
                    {websites.map((website) => {
                      const websiteId = (website.website_id || '').toLowerCase()
                      // Display URL if available, remove https:// prefix, otherwise fallback to name or website_id
                      let displayText = website.url || website.name || websiteId
                      if (displayText && displayText.startsWith('https://')) {
                        displayText = displayText.replace('https://', '')
                      } else if (displayText && displayText.startsWith('http://')) {
                        displayText = displayText.replace('http://', '')
                      }
                      return (
                        <option key={website.id} value={websiteId}>
                          {displayText}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setError('')
                    }}
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter password"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="flex justify-center lg:justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-8 py-3 text-sm font-semibold rounded-lg transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg ${
                      submitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {submitting ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>

            {responseData && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Results</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Token
                    </label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 break-all">
                      <code className="text-xs text-gray-800 font-mono">{responseData.token}</code>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deals
                    </label>
                    {responseData.deals && responseData.deals.length > 0 ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <ul className="space-y-2">
                          {responseData.deals.map((deal, index) => (
                            <li key={index} className="text-sm text-gray-800 flex items-start">
                              <span className="text-blue-600 mr-2">•</span>
                              <span>{deal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
                        No deals available
                      </div>
                    )}
                  </div>

                  {responseData.deals && responseData.deals.length > 0 && (
                    <div className="flex justify-center lg:justify-end pt-2">
                      <button
                        onClick={handleDownload}
                        className="px-8 py-3 text-sm font-semibold rounded-lg transition-all bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                      >
                        Download
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default WebsiteCredentialsPage
