import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { loginSchema, type LoginFormData } from '../validator/loginSchema'
import { authService } from '../services/authService'

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError('')
      const response = await authService.login(data.email, data.password)
      
      if (response.success) {
        // Dispatch event to notify App component
        window.dispatchEvent(new Event('auth-change'))
        // Navigate to credentials page
        navigate('/credentials', { replace: true })
      }
    } catch (error) {
      if (error instanceof Error) {
        setLoginError(error.message || 'Invalid email or password')
      } else {
        setLoginError('Invalid email or password')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-4 sm:py-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4 sm:mb-6">
          <img 
            src="/MainLogo.png" 
            alt="Altius Logo" 
            className="h-12 sm:h-16 w-auto object-contain"
          />
        </div>

        <div className="text-center mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5">
            Welcome back!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Login to your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter your email"
                className={`w-full px-0 py-2.5 border-0 border-b-2 focus:outline-none bg-transparent text-gray-900 placeholder-gray-400 text-sm transition-colors ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Enter your password"
                className={`w-full px-0 py-2.5 pr-10 border-0 border-b-2 focus:outline-none bg-transparent text-gray-900 placeholder-gray-400 text-sm transition-colors ${
                  errors.password
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 015.12 5.12m3.46 3.46L12 12m-3.42-3.42l3.42 3.42m0 0l3.42 3.42M12 12l3.42 3.42m-3.42-3.42l-3.42-3.42m6.84 6.84A9.97 9.97 0 0118.88 18.88M12 12l-3.42-3.42m6.84 6.84L12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
            <div className="mt-2 text-right">
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600 underline">
                Forgot Password?
              </a>
            </div>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-lg btn-primary disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="relative my-3 sm:my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-b from-blue-50 to-white text-gray-500 text-sm sm:text-base font-medium">
                OR
              </span>
            </div>
            <div className="text-center mt-1.5">
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                SIGN UP WITH
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-2.5 sm:gap-3">
            <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors shadow-sm">
              <span className="text-blue-600 font-bold text-base sm:text-lg">f</span>
            </button>
            <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors shadow-sm">
              <span className="text-red-500 font-bold text-base sm:text-lg">G</span>
            </button>
            <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors shadow-sm">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
            </button>
          </div>

          <div className="text-center mt-4 sm:mt-5">
            <p className="text-gray-600 text-xs sm:text-sm">
              Don't have an account?{' '}
              <a href="#" className="text-blue-600 font-semibold hover:text-blue-700 underline">
                Sign Up
              </a>
            </p>
          </div>
        </form>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
          <div className="flex justify-center items-center gap-2 sm:gap-2.5 flex-wrap">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full"></div>
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-200 rounded-full"></div>
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-100 rounded-full"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-300 rounded-full"></div>
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-200 rounded-full"></div>
            <div className="w-3 h-3 sm:w-3 sm:h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
