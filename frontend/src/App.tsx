import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import WebsiteCredentialsPage from './pages/WebsiteCredentialsPage'
import { authService } from './services/authService'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authService.isAuthenticated())
    }
    
    checkAuth()
    
    window.addEventListener('storage', checkAuth)
    window.addEventListener('auth-change', checkAuth)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('auth-change', checkAuth)
    }
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/credentials" replace /> : <LoginPage />
          } 
        />
        <Route 
          path="/profile" 
          element={
            isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/credentials" 
          element={
            isAuthenticated ? <WebsiteCredentialsPage /> : <Navigate to="/login" replace />
          } 
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/credentials" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

