import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { toast } from 'react-toastify'
import axios from 'axios'

interface Website {
  id: number
  website_id: string
  name: string
  url: string
}

interface FileInfo {
  id: number
  name: string
  download_url: string
}

interface DealInfo {
  id: number
  name: string
  category: string
  owner: string
  files: FileInfo[]
}

interface CredentialsResponse {
  session: string
  session_id: string
  user: {
    [key: string]: any
  }
  deals: DealInfo[]
}

function WebsiteCredentialsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [downloading, setDownloading] = useState(false)
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

      // Supported websites - hardcoded list
      const supportedWebsites: Website[] = [
        {
          id: 1,
          website_id: 'fo1',
          name: 'Forex Option 1',
          url: 'fo1.altius.finance'
        },
        {
          id: 2,
          website_id: 'fo2',
          name: 'Forex Option 2',
          url: 'fo2.altius.finance'
        }
      ]

      setWebsites(supportedWebsites)
      setLoading(false)
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
      
      const requestPayload = {
        website: selectedWebsite.toLowerCase(),
        username,
        password
      }
      
      const response = await axios.post('http://localhost:8000/login', requestPayload, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      setResponseData(response.data)
      setError('')
      toast.success('Login successful!')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError('Bad credentials')
          setResponseData(null)
          toast.error('Bad credentials')
        } else if (error.response?.status === 502) {
          setError('Website unavailable')
          setResponseData(null)
          toast.error('Website unavailable')
        } else if (error.response?.status === 500) {
          setError('Unexpected error')
          setResponseData(null)
          toast.error('Unexpected error')
        } else {
          const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'An error occurred'
          setError(errorMessage)
          setResponseData(null)
          toast.error(errorMessage)
        }
      } else {
        setError('Server error')
        setResponseData(null)
        toast.error('Server error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownload = async (downloadUrl: string, fileName: string) => {
    if (!downloadUrl) {
      toast.error('No download URL available.')
      return
    }

    if (!responseData?.session_id) {
      toast.error('Session expired. Please login again.')
      return
    }

    try {
      setDownloading(true)
      
      const response = await axios.get('http://localhost:8000/download', {
        params: {
          url: downloadUrl,
          session_id: responseData.session_id
        },
        responseType: 'blob'
      })

      // Get filename from Content-Disposition header or use provided name
      const contentDisposition = response.headers['content-disposition']
      let filename = fileName || `download_${selectedWebsite}_${new Date().toISOString().split('T')[0]}.txt`
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/i)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      // Create blob URL and trigger download
      const url = URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('File downloaded successfully!')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error('Unauthorized. Please login again.')
        } else if (error.response?.status === 502) {
          toast.error('Website unavailable')
        } else {
          const errorMessage = error.response?.data?.detail || 'Failed to download file'
          toast.error(errorMessage)
        }
      } else {
        toast.error('Failed to download file. Please try again.')
      }
    } finally {
      setDownloading(false)
    }
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
        
        {/* Loading Dialog */}
        {submitting && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-12 max-w-lg mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Connecting to the site</h3>
                <p className="text-base text-gray-700">It takes a few minutes, please wait...</p>
              </div>
            </div>
          </div>
        )}
        
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
                      // Display URL (remove https:// prefix if present)
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
                    Send
                  </button>
                </div>
              </form>
            </div>

            {responseData && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Results</h2>
                <div className="space-y-6">
                  {responseData.session_id && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Session Token
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 break-all">
                        <code className="text-xs text-gray-800 font-mono">{responseData.session_id}</code>
                      </div>
                    </div>
                  )}

                  {responseData.user && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        User Information
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="space-y-2">
                          {(responseData.user.data?.email || responseData.user.email) && (
                            <div className="text-sm text-gray-800">
                              <span className="font-medium">Email:</span> {responseData.user.data?.email || responseData.user.email}
                            </div>
                          )}
                          {(responseData.user.data?.full_name || responseData.user.data?.first_name || responseData.user.name) && (
                            <div className="text-sm text-gray-800">
                              <span className="font-medium">Name:</span> {responseData.user.data?.full_name || responseData.user.data?.first_name + ' ' + (responseData.user.data?.last_name || '') || responseData.user.name}
                            </div>
                          )}
                          {responseData.user.data?.role?.name && (
                            <div className="text-sm text-gray-800">
                              <span className="font-medium">Role:</span> {responseData.user.data.role.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deals ({responseData.deals?.length || 0})
                    </label>
                    {responseData.deals && responseData.deals.length > 0 ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <ul className="space-y-3">
                          {responseData.deals.map((deal, index) => (
                            <li key={deal.id || index} className="text-sm text-gray-800 bg-white p-4 rounded-md border border-gray-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-2">
                                    <span className="text-blue-600 mr-3 font-bold">#{index + 1}</span>
                                    <h3 className="font-semibold text-gray-900">{deal.name || `Deal ${deal.id || index + 1}`}</h3>
                                  </div>
                                  {deal.category && (
                                    <div className="text-xs text-gray-600 mb-1">
                                      <span className="font-medium">Category:</span> {deal.category}
                                    </div>
                                  )}
                                  {deal.owner && (
                                    <div className="text-xs text-gray-600 mb-1">
                                      <span className="font-medium">Owner:</span> {deal.owner}
                                    </div>
                                  )}
                                  {deal.files && deal.files.length > 0 && (
                                    <div className="mt-3">
                                      <div className="text-xs font-medium text-gray-700 mb-2">Files ({deal.files.length}):</div>
                                      <div className="space-y-2">
                                        {deal.files.map((file, fileIndex) => (
                                          <div key={file.id || fileIndex} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200">
                                            <div className="flex items-center flex-1">
                                              <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                              </svg>
                                              <span className="text-sm text-gray-800 font-medium">{file.name || `File ${file.id || fileIndex + 1}`}</span>
                                            </div>
                                            {file.download_url && (
                                              <button
                                                onClick={() => handleDownload(file.download_url, file.name || 'download')}
                                                disabled={downloading}
                                                className="ml-3 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                              >
                                                {downloading ? 'Downloading...' : 'Download'}
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
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
