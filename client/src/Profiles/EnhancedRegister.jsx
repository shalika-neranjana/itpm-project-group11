import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Cropper from 'react-easy-crop'
import { ArrowRight, Building2, ImagePlus, LockKeyhole, Mail, Phone, User, X } from 'lucide-react'
import api from '../api'
import { formatPhoneNumber } from '../utils/phoneFormatter'

function Field({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  requiredIndicator = false,
  error = '',
  icon,
  options = null,
  selectPlaceholder = ''
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
        {label}
        {requiredIndicator ? <span className="ml-1 text-red-600">*</span> : null}
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
            className={`w-full cursor-pointer rounded-lg border bg-white py-3 text-sm text-gray-900 outline-none transition-all duration-300 focus:ring-2 ${
              icon ? 'pl-10 pr-4' : 'px-4'
            } ${error ? 'border-red-300 focus:ring-red-500/30' : 'border-gray-300 focus:ring-blue-500'}`}
          >
            {selectPlaceholder ? (
              <option value="" disabled>
                {selectPlaceholder}
              </option>
            ) : null}
            {options.map((option) => (
              <option key={option.value ?? option} value={option.value ?? option}>
                {option.label ?? option}
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
            className={`w-full cursor-text rounded-lg border bg-white py-3 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:ring-2 ${
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

function PasswordRequirements({ password }) {
  const checks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'At least 1 uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'At least 1 lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'At least 1 number', valid: /\d/.test(password) },
    { label: 'At least 1 special character', valid: /[^A-Za-z0-9]/.test(password) }
  ]

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">Password requirements</p>
      <ul className="space-y-1 text-sm">
        {checks.map((check) => (
          <li key={check.label} className={check.valid ? 'text-emerald-700' : 'text-gray-500'}>
            {check.valid ? '\u2713' : '\u2022'} {check.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })

const getCroppedImageBlob = async (imageSrc, croppedAreaPixels) => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = croppedAreaPixels.width
  canvas.height = croppedAreaPixels.height

  context.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Image crop failed'))
          return
        }

        resolve(blob)
      },
      'image/jpeg',
      0.92
    )
  })
}

const initialFormData = {
  studentId: '',
  firstName: '',
  lastName: '',
  faculty: '',
  phone: '',
  linkedin: '',
  github: '',
  name: '',
  industry: '',
  address: '',
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
  phone: '',
  profileImage: '',
  name: '',
  industry: '',
  address: '',
  website: '',
  phoneCompany: '',
  logo: '',
  email: '',
  password: '',
  confirmPassword: ''
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
const studentIdRegex = /^[A-Z0-9]+$/
const facultyOptions = [
  { value: 'Faculty of Computing', label: 'Faculty of Computing' },
  { value: 'Faculty of Engineering', label: 'Faculty of Engineering' },
  { value: 'SLIIT Business School', label: 'SLIIT Business School' },
  { value: 'Faculty of Humanities & Sciences', label: 'Faculty of Humanities & Sciences' },
  { value: 'School of Architecture', label: 'School of Architecture' },
  { value: 'Faculty of Graduate Studies', label: 'Faculty of Graduate Studies' }
]

const companyIndustryOptions = [
  {
    value: 'Technology & IT',
    label: 'Technology & IT (Software, AI, Cybersecurity, SaaS, Data, Cloud)'
  },
  {
    value: 'Finance & Business Services',
    label: 'Finance & Business Services (Banking, Accounting, Consulting, Insurance, Legal)'
  },
  {
    value: 'Healthcare & Life Sciences',
    label: 'Healthcare & Life Sciences (Hospitals, Pharma, Biotech, Medical Services)'
  },
  {
    value: 'Education & Training',
    label: 'Education & Training (Schools, Universities, EdTech, Training Institutes)'
  },
  {
    value: 'Manufacturing & Engineering',
    label: 'Manufacturing & Engineering (Factories, Industrial, Automotive, Electronics)'
  },
  {
    value: 'Retail & E-commerce',
    label: 'Retail & E-commerce (Online Stores, Supermarkets, Wholesale)'
  },
  {
    value: 'Media, Marketing & Communication',
    label: 'Media, Marketing & Communication (Advertising, Digital Marketing, PR, Entertainment)'
  },
  {
    value: 'Transportation & Logistics',
    label: 'Transportation & Logistics (Delivery, Shipping, Travel, Supply Chain)'
  },
  {
    value: 'Energy, Agriculture & Environment',
    label: 'Energy, Agriculture & Environment (Farming, Renewable Energy, Utilities, Sustainability)'
  },
  {
    value: 'Hospitality, Real Estate & Other Services',
    label: 'Hospitality, Real Estate & Other Services (Hotels, Tourism, Property, NGOs, General Services)'
  }
]

const EnhancedRegister = () => {
  const [regRole, setRegRole] = useState('student')
  const [formData, setFormData] = useState(initialFormData)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [fieldErrors, setFieldErrors] = useState(initialErrors)
  const [showErrorSummary, setShowErrorSummary] = useState(false)
  const [studentImageFile, setStudentImageFile] = useState(null)
  const [companyLogoFile, setCompanyLogoFile] = useState(null)
  const [studentImagePreview, setStudentImagePreview] = useState('')
  const [companyLogoPreview, setCompanyLogoPreview] = useState('')
  const [cropSourceImage, setCropSourceImage] = useState('')
  const [cropTarget, setCropTarget] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const navigate = useNavigate()

  const navigateWithTransition = (path) => {
    if (typeof document !== 'undefined' && typeof document.startViewTransition === 'function') {
      document.startViewTransition(() => navigate(path))
      return
    }

    navigate(path)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    let nextValue = value
    
    if (name === 'studentId') {
      nextValue = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
    } else if (name === 'phone' || name === 'phoneCompany') {
      nextValue = formatPhoneNumber(value)
    }

    setFormData((previous) => ({
      ...previous,
      [name]: nextValue
    }))

    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({ ...previous, [name]: '' }))
    }
    setShowErrorSummary(false)
  }

  const resetCropState = () => {
    setCropSourceImage('')
    setCropTarget('')
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }

  const handleImageSelection = (event, target) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setSubmitError('Please select a valid image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Image size must be 5MB or less.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setSubmitError('')
      setCropTarget(target)
      setCropSourceImage(String(reader.result || ''))
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
    }
    reader.readAsDataURL(file)
  }

  const handleCropConfirm = async () => {
    if (!cropSourceImage || !croppedAreaPixels || !cropTarget) {
      setSubmitError('Please adjust the crop area before saving the image.')
      return
    }

    try {
      const blob = await getCroppedImageBlob(cropSourceImage, croppedAreaPixels)
      const fileNamePrefix = cropTarget === 'student' ? 'student-profile' : 'company-logo'
      const croppedFile = new File([blob], `${fileNamePrefix}-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const previewUrl = URL.createObjectURL(croppedFile)

      if (cropTarget === 'student') {
        if (studentImagePreview.startsWith('blob:')) URL.revokeObjectURL(studentImagePreview)
        setStudentImageFile(croppedFile)
        setStudentImagePreview(previewUrl)
        setFieldErrors((previous) => ({ ...previous, profileImage: '' }))
      } else {
        if (companyLogoPreview.startsWith('blob:')) URL.revokeObjectURL(companyLogoPreview)
        setCompanyLogoFile(croppedFile)
        setCompanyLogoPreview(previewUrl)
        setFieldErrors((previous) => ({ ...previous, logo: '' }))
      }

      setSubmitError('')
      resetCropState()
    } catch {
      setSubmitError('Unable to crop image. Please try another file.')
    }
  }

  const validateForm = () => {
    const nextErrors = { ...initialErrors }

    if (regRole === 'student') {
      if (!formData.firstName.trim()) nextErrors.firstName = 'First name is required.'
      if (!formData.lastName.trim()) nextErrors.lastName = 'Last name is required.'
      if (!formData.studentId.trim()) nextErrors.studentId = 'Student ID is required.'
      else if (!studentIdRegex.test(formData.studentId)) {
        nextErrors.studentId = 'Student ID can contain only English letters and numbers.'
      }
      if (!formData.faculty.trim()) nextErrors.faculty = 'Faculty is required.'
      if (!formData.phone.trim()) nextErrors.phone = 'Phone number is required.'
      if (!studentImageFile) nextErrors.profileImage = 'Profile photo is required.'
    }

    if (regRole === 'company') {
      if (!formData.name.trim()) nextErrors.name = 'Company name is required.'
      if (!formData.industry.trim()) nextErrors.industry = 'Industry is required.'
      if (!formData.address.trim()) nextErrors.address = 'Address is required.'
      if (!formData.website.trim()) nextErrors.website = 'Website is required.'
      if (!formData.phoneCompany.trim()) nextErrors.phoneCompany = 'Phone number is required.'
      if (!companyLogoFile) nextErrors.logo = 'Company logo is required.'
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!emailRegex.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.'
    } else if (!passwordRegex.test(formData.password)) {
      nextErrors.password = 'Password must include uppercase, lowercase, number, special character, and be at least 8 characters.'
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
      setShowErrorSummary(true)
      return
    }
    setShowErrorSummary(false)

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
              phone: formData.phone,
              linkedin: formData.linkedin,
              github: formData.github
            }
          : {
              name: formData.name,
              industry: formData.industry,
              address: formData.address,
              email: formData.email,
              password: formData.password,
              location: formData.location,
              website: formData.website,
              phone: formData.phoneCompany
            }

      const payload = new FormData()
      Object.entries(submitData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          payload.append(key, value)
        }
      })

      if (regRole === 'student' && studentImageFile) {
        payload.append('profileImage', studentImageFile)
      }

      if (regRole === 'company' && companyLogoFile) {
        payload.append('logo', companyLogoFile)
      }

      const response = await api.post(endpoint, payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

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
    <div className="relative min-h-screen overflow-hidden bg-[#e8edf6] text-gray-900">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/authbackgound.jpg')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-white/25 to-[#d8e6f8]/35" />
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
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-blue-400 hover:text-blue-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-10">
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

          <section
            className="auth-panel-transition rounded-2xl border border-white/60 bg-white/70 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.14)]"
            style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Account setup</h2>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setRegRole('student')}
                className={`cursor-pointer rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                  regRole === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="mr-2 inline h-4 w-4" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setRegRole('company')}
                className={`cursor-pointer rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
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

            {showErrorSummary && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <p className="mb-2 font-semibold">Please fix the following errors:</p>
                <ul className="list-disc list-inside space-y-1">
                  {Object.values(fieldErrors).filter(error => error !== '').map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div key={regRole} data-role={regRole} className="role-form-transition space-y-6">
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
                      requiredIndicator
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
                      requiredIndicator
                      error={fieldErrors.lastName}
                      icon={<User className="h-4 w-4" />}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field
                      label="Student ID"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="A22101234"
                      required
                      requiredIndicator
                      error={fieldErrors.studentId}
                      icon={<User className="h-4 w-4" />}
                    />
                    <Field
                      label="Faculty"
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleChange}
                      required
                      requiredIndicator
                      error={fieldErrors.faculty}
                      options={facultyOptions}
                      selectPlaceholder="Select your faculty"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@email.com"
                      required
                      requiredIndicator
                      error={fieldErrors.email}
                      icon={<Mail className="h-4 w-4" />}
                    />
                    <Field
                      label="Phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+94 77 123 4567"
                      required
                      requiredIndicator
                      error={fieldErrors.phone}
                      icon={<Phone className="h-4 w-4" />}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field
                      label="LinkedIn"
                      name="linkedin"
                      type="url"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                    <Field
                      label="GitHub"
                      name="github"
                      type="url"
                      value={formData.github}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="studentProfileImage" className="block text-sm font-semibold text-gray-700">
                      Profile Photo
                      <span className="ml-1 text-red-600">*</span>
                    </label>
                    <div className="flex flex-col gap-3 rounded-lg border border-gray-300 bg-white p-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        {studentImagePreview ? (
                          <img src={studentImagePreview} alt="Student profile preview" className="h-14 w-14 rounded-lg border border-gray-200 object-cover" />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400">
                            <ImagePlus className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-800">Upload and crop to 1:1</p>
                          <p className="text-xs text-gray-500">JPG/PNG up to 5MB</p>
                        </div>
                      </div>
                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100">
                        <ImagePlus className="h-4 w-4" />
                        Choose Photo
                        <input
                          id="studentProfileImage"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => handleImageSelection(event, 'student')}
                        />
                      </label>
                    </div>
                    {fieldErrors.profileImage ? <p className="text-sm text-red-600">{fieldErrors.profileImage}</p> : null}
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field
                      label="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters with letters and numbers"
                      required
                      requiredIndicator
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
                      requiredIndicator
                      error={fieldErrors.confirmPassword}
                      icon={<LockKeyhole className="h-4 w-4" />}
                    />
                  </div>

                  <PasswordRequirements password={formData.password} />
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
                    requiredIndicator
                    error={fieldErrors.name}
                    icon={<Building2 className="h-4 w-4" />}
                  />

                  <Field
                    label="Industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    options={companyIndustryOptions}
                    selectPlaceholder="Select company industry"
                    required
                    requiredIndicator
                    error={fieldErrors.industry}
                  />

                  <Field
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123, Main Street, Colombo"
                    required
                    requiredIndicator
                    error={fieldErrors.address}
                  />

                  <Field
                    label="Website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://company.com"
                    required
                    requiredIndicator
                    error={fieldErrors.website}
                  />

                  <Field
                    label="Phone"
                    name="phoneCompany"
                    type="tel"
                    value={formData.phoneCompany}
                    onChange={handleChange}
                    placeholder="+94 77 123 4567"
                    required
                    requiredIndicator
                    error={fieldErrors.phoneCompany}
                    icon={<Phone className="h-4 w-4" />}
                  />

                  <div className="space-y-2">
                    <label htmlFor="companyLogo" className="block text-sm font-semibold text-gray-700">
                      Company Logo
                      <span className="ml-1 text-red-600">*</span>
                    </label>
                    <div className="flex flex-col gap-3 rounded-lg border border-gray-300 bg-white p-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        {companyLogoPreview ? (
                          <img src={companyLogoPreview} alt="Company logo preview" className="h-14 w-14 rounded-lg border border-gray-200 object-cover" />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400">
                            <ImagePlus className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-800">Upload and crop to 1:1</p>
                          <p className="text-xs text-gray-500">JPG/PNG up to 5MB</p>
                        </div>
                      </div>
                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100">
                        <ImagePlus className="h-4 w-4" />
                        Choose Logo
                        <input
                          id="companyLogo"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => handleImageSelection(event, 'company')}
                        />
                      </label>
                    </div>
                    {fieldErrors.logo ? <p className="text-sm text-red-600">{fieldErrors.logo}</p> : null}
                  </div>
                  </>
                )}
              </div>

              {regRole === 'company' ? (
                <>
                  <Field
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@email.com"
                    required
                    requiredIndicator
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
                      requiredIndicator
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
                      requiredIndicator
                      error={fieldErrors.confirmPassword}
                      icon={<LockKeyhole className="h-4 w-4" />}
                    />
                  </div>

                  <PasswordRequirements password={formData.password} />
                </>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-indigo-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
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
                onClick={() => navigateWithTransition('/login')}
                className="cursor-pointer font-semibold text-blue-600 transition-colors duration-300 hover:text-blue-700"
              >
                Sign in
              </button>
            </p>
          </section>
        </div>
      </main>

      {cropSourceImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Crop image to square (1:1)</h3>
                <p className="text-sm text-gray-500">Position your image and save the cropped version.</p>
              </div>
              <button
                type="button"
                onClick={resetCropState}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close crop dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative h-80 w-full overflow-hidden rounded-xl bg-slate-900">
              <Cropper
                image={cropSourceImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_croppedArea, areaPixels) => setCroppedAreaPixels(areaPixels)}
              />
            </div>

            <div className="mt-4 space-y-2">
              <label htmlFor="cropZoom" className="text-sm font-semibold text-gray-700">
                Zoom
              </label>
              <input
                id="cropZoom"
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-full"
              />
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetCropState}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Use Cropped Image
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default EnhancedRegister
