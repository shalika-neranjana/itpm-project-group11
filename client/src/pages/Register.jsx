import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function Register() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        studentId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        linkedin: '',
        password: '',
        confirmPassword: '',
    })

    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [serverError, setServerError] = useState('')

    const validateForm = () => {
        const newErrors = {}

        if (!formData.studentId.trim()) {
            newErrors.studentId = 'Student ID is required'
        }

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required'
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Enter a valid email address'
        }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        if (
            formData.linkedin.trim() &&
            !/^https?:\/\/(www\.)?linkedin\.com\/.+$/i.test(formData.linkedin)
        ) {
            newErrors.linkedin = 'Enter a valid LinkedIn URL'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        setErrors((prev) => ({
            ...prev,
            [name]: '',
        }))

        setServerError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)
        setServerError('')

        try {
            const payload = {
                studentId: formData.studentId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                linkedin: formData.linkedin,
                password: formData.password,
            }

            const response = await api.post('/auth/register', payload)

            const studentData = response.data.data
            const token = studentData.token

            localStorage.setItem('token', token)
            localStorage.setItem('student', JSON.stringify(studentData))

            navigate('/dashboard')
        } catch (err) {
            setServerError(err.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4 py-8">
            <div className="w-full max-w-2xl rounded-2xl border border-[#E8EAF0] bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div className="mb-6 flex flex-col items-center">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#3B6FE8] to-[#6B9FFF] shadow-sm">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                    </div>
                    <h1 className="font-display text-3xl font-bold text-[#1A1D27]">InternConnect</h1>
                    <p className="mt-1 text-sm text-[#6B7280]">Create your student account</p>
                </div>

                {serverError && (
                    <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">
                            Student ID
                        </label>
                        <input
                            type="text"
                            name="studentId"
                            value={formData.studentId}
                            onChange={handleChange}
                            placeholder="Enter your student ID"
                            className="w-full rounded-[10px] border border-[#E8EAF0] px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/10"
                        />
                        {errors.studentId && (
                            <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">
                            First Name
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Enter your first name"
                            className="w-full rounded-[10px] border border-[#E8EAF0] px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/10"
                        />
                        {errors.firstName && (
                            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">
                            Last Name
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Enter your last name"
                            className="w-full rounded-[10px] border border-[#E8EAF0] px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/10"
                        />
                        {errors.lastName && (
                            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="w-full rounded-[10px] border border-[#E8EAF0] px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/10"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">
                            Phone
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            className="w-full rounded-[10px] border border-[#E8EAF0] px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/10"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">
                            LinkedIn
                        </label>
                        <input
                            type="text"
                            name="linkedin"
                            value={formData.linkedin}
                            onChange={handleChange}
                            placeholder="https://linkedin.com/in/your-profile"
                            className="w-full rounded-[10px] border border-[#E8EAF0] px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/10"
                        />
                        {errors.linkedin && (
                            <p className="mt-1 text-sm text-red-600">{errors.linkedin}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="w-full rounded-[10px] border border-[#E8EAF0] px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/10"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#1A1D27]">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className="w-full rounded-[10px] border border-[#E8EAF0] px-4 py-3 text-sm outline-none transition focus:border-[#3B6FE8] focus:ring-2 focus:ring-[#3B6FE8]/10"
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-[10px] bg-[#3B6FE8] px-4 py-3 font-semibold text-white transition hover:bg-[#2D5CD4]"
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link to="/" className="font-semibold text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Register

