import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, LockKeyhole, Mail, Phone, User } from 'lucide-react'
import api from '../api'

function Field({ label, name, type = 'text', value, onChange, placeholder, required = false, error = '', icon, options = null }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative">
        {icon ? <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">{icon}</span> : null}
        {options ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${name}-error` : undefined}
            className={`w-full rounded-lg border bg-white py-3 text-sm text-gray-900 outline-none transition-all duration-300 focus:ring-2 ${
              icon ? 'pl-10 pr-4' : 'px-4'
            } ${error ? 'border-red-300 focus:ring-red-500/30' : 'border-gray-300 focus:ring-blue-500'}`}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${name}-error` : undefined}
            className={`w-full rounded-lg border bg-white py-3 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:ring-2 ${
              icon ? 'pl-10 pr-4' : 'px-4'
            } ${error ? 'border-red-300 focus:ring-red-500/30' : 'border-gray-300 focus:ring-blue-500'}`}
          />
        )}
      </div>
      {error ? (
        <p id={`${name}-error`} className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}

const initialFormData = {
  studentId: '',
  firstName: '',
  lastName: '',
  faculty: '',
  specialization: 'Computer Science',
  phone: '',
  linkedin: '',
  github: '',
  name: '',
  industry: '',
  location: '',
  website: '',
  phoneCompany: '',
  email: '',
  password: '',
  confirmPassword: ''
}

const initialErrors = {
  studentId: '',
  firstName: '',
  lastName: '',
  faculty: '',
  name: '',
  industry: '',
  location: '',
  email: '',
  password: '',
  confirmPassword: ''
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

const EnhancedRegister = () => {
  const [regRole, setRegRole] = useState('student')
  const [formData, setFormData] = useState(initialFormData)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [fieldErrors, setFieldErrors] = useState(initialErrors)
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: value
    }))

    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({ ...previous, [name]: '' }))
    }
  }

  const validateForm = () => {
    const nextErrors = { ...initialErrors }

    if (regRole === 'student') {
      if (!formData.firstName.trim()) nextErrors.firstName = 'First name is required.'
      if (!formData.lastName.trim()) nextErrors.lastName = 'Last name is required.'
      if (!formData.studentId.trim()) nextErrors.studentId = 'Student ID is required.'
      if (!formData.faculty.trim()) nextErrors.faculty = 'Faculty is required.'
    }

    if (regRole === 'company') {
      if (!formData.name.trim()) nextErrors.name = 'Company name is required.'
      if (!formData.industry.trim()) nextErrors.industry = 'Industry is required.'
      if (!formData.location.trim()) nextErrors.location = 'Location is required.'
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!emailRegex.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.'
    } else if (!passwordRegex.test(formData.password)) {
      nextErrors.password = 'Password must be at least 8 characters and include letters and numbers.'
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.'
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    setFieldErrors(nextErrors)
    return Object.values(nextErrors).every((value) => value === '')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const endpoint = regRole === 'student' ? '/auth/register' : '/company/register'

      const submitData =
        regRole === 'student'
          ? {
              studentId: formData.studentId,
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              password: formData.password,
              faculty: formData.faculty,
              specialization: formData.specialization,
              phone: formData.phone,
              linkedin: formData.linkedin,
              github: formData.github
            }
          : {
              name: formData.name,
              industry: formData.industry,
              email: formData.email,
              password: formData.password,
              location: formData.location,
              website: formData.website,
              phone: formData.phoneCompany
            }

      const response = await api.post(endpoint, submitData)

      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token)
        if (regRole === 'student') {
          localStorage.setItem('student', JSON.stringify(response.data.data))
          localStorage.setItem('role', 'student')
          navigate('/profile')
        } else {
          localStorage.setItem('user', JSON.stringify(response.data.data))
          localStorage.setItem('role', 'company')
          navigate('/company-dashboard')
        }
      }
    } catch (error) {
      const backendErrors = error.response?.data?.errors
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        setSubmitError(backendErrors.join(', '))
      } else {
        setSubmitError(error.response?.data?.message || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo_icon_only.png"
              alt="InternConnect logo"
              className="h-10 w-10 rounded-lg border border-gray-200 object-cover"
            />
            <span className="text-xl font-bold tracking-tight text-gray-900">InternConnect</span>
          </Link>

          <Link
            to="/"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-blue-400 hover:text-blue-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="relative flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-20 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl" />
        </div>

        <div className="relative w-full max-w-2xl space-y-6">
          <div className="text-center">
            <img
              src="/logo_icon_only.png"
              alt="InternConnect logo mark"
              className="mx-auto mb-4 h-16 w-16 rounded-2xl border border-gray-200 bg-white object-cover p-2 shadow-sm"
            />
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create your account</h1>
            <p className="mt-2 text-sm text-gray-600">Join InternConnect and start your internship journey.</p>
          </div>

          <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Account setup</h2>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setRegRole('student')}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                  regRole === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="mr-2 inline h-4 w-4" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setRegRole('company')}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                  regRole === 'company' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Building2 className="mr-2 inline h-4 w-4" />
                Company
              </button>
            </div>

            {submitError ? (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {submitError}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {regRole === 'student' ? (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Ahmad"
                      required
                      error={fieldErrors.firstName}
                      icon={<User className="h-4 w-4" />}
                    />
                    <Field
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Razin"
                      required
                      error={fieldErrors.lastName}
                      icon={<User className="h-4 w-4" />}
                    />
                  </div>

                  <Field
                    label="Student ID"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="A22101234"
                    required
                    error={fieldErrors.studentId}
                    icon={<User className="h-4 w-4" />}
                  />

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field
                      label="Faculty"
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleChange}
                      placeholder="Faculty of Computing"
                      required
                      error={fieldErrors.faculty}
                    />
                    <Field
                      label="Specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      options={['Computer Science', 'Software Engineering', 'Data Science', 'Multimedia', 'Cybersecurity']}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field
                      label="Phone (Optional)"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+94 77 123 4567"
                      icon={<Phone className="h-4 w-4" />}
                    />
                    <Field
                      label="LinkedIn (Optional)"
                      name="linkedin"
                      type="url"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <Field
                    label="GitHub (Optional)"
                    name="github"
                    type="url"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                  />
                </>
              ) : (
                <>
                  <Field
                    label="Company Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="TechNova Sdn Bhd"
                    required
                    error={fieldErrors.name}
                    icon={<Building2 className="h-4 w-4" />}
                  />

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field
                      label="Industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      placeholder="Technology"
                      required
                      error={fieldErrors.industry}
                    />
                    <Field
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Kuala Lumpur"
                      required
                      error={fieldErrors.location}
                    />
                  </div>

                  <Field
                    label="Website (Optional)"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://company.com"
                  />

                  <Field
                    label="Phone (Optional)"
                    name="phoneCompany"
                    type="tel"
                    value={formData.phoneCompany}
                    onChange={handleChange}
                    placeholder="+94 77 123 4567"
                    icon={<Phone className="h-4 w-4" />}
                  />
                </>
              )}

              <Field
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@email.com"
                required
                error={fieldErrors.email}
                icon={<Mail className="h-4 w-4" />}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters with letters and numbers"
                  required
                  error={fieldErrors.password}
                  icon={<LockKeyhole className="h-4 w-4" />}
                />
                <Field
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  required
                  error={fieldErrors.confirmPassword}
                  icon={<LockKeyhole className="h-4 w-4" />}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-indigo-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-semibold text-blue-600 transition-colors duration-300 hover:text-blue-700"
              >
                Sign in
              </button>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default EnhancedRegister
