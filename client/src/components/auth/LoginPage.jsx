import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import api from '../../api'
import InputField from './InputField'

function detectUserRole(email) {
  if (!email) return null

  const lowerEmail = email.toLowerCase()
  const studentKeywords = ['.edu', '.ac.lk', '.edu.lk', 'student', 'campus']
  const publicDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']

  if (studentKeywords.some((keyword) => lowerEmail.includes(keyword))) {
    return 'student'
  }

  if (publicDomains.some((domain) => lowerEmail.endsWith(domain))) {
    return 'student'
  }

  return 'company'
}

function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' })

  useEffect(() => {
    setRole(detectUserRole(email))
  }, [email])

  const validateForm = () => {
    const nextErrors = { email: '', password: '' }

    if (!email.trim()) {
      nextErrors.email = 'Email is required.'
    }

    if (!password.trim()) {
      nextErrors.password = 'Password is required.'
    }

    setFieldErrors(nextErrors)

    return !nextErrors.email && !nextErrors.password
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const activeRole = role || 'student'
      const endpoint = activeRole === 'student' ? '/auth/login' : '/company/login'
      const response = await api.post(endpoint, { email, password })

      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token)

        if (activeRole === 'student') {
          localStorage.setItem('student', JSON.stringify(response.data.data))
        } else {
          localStorage.setItem('user', JSON.stringify(response.data.data))
        }

        localStorage.setItem('role', activeRole)

        if (activeRole === 'student' && response.data.data.email === 'admin@internconnect.com') {
          navigate('/admin')
        } else if (activeRole === 'student') {
          navigate('/dashboard')
        } else {
          navigate('/company-dashboard')
        }
      }
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
            <span className="text-lg font-bold tracking-wide">IC</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">InternConnect</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to continue managing your internship workflow.</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          </div>

          {submitError ? (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {submitError}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <InputField
              id="email"
              name="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (fieldErrors.email) {
                  setFieldErrors((previous) => ({ ...previous, email: '' }))
                }
              }}
              placeholder="name@organization.com"
              autoComplete="email"
              icon={<Mail className="h-4 w-4" />}
              error={fieldErrors.email}
              required
            />

            <InputField
              id="password"
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                if (fieldErrors.password) {
                  setFieldErrors((previous) => ({ ...previous, password: '' }))
                }
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              icon={<LockKeyhole className="h-4 w-4" />}
              error={fieldErrors.password}
              required
              rightAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="rounded p-1 text-gray-500 transition-all duration-300 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="group relative inline-block font-semibold text-blue-600 transition-all duration-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              Create account
              <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
