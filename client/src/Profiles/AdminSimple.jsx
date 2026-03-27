import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function AdminSimple() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('Loading admin dashboard...')

  useEffect(() => {
    // Simple test - check if admin
    const token = localStorage.getItem('token')
    const studentData = localStorage.getItem('student')
    
    console.log('🔍 Admin Debug Info:')
    console.log('- Token exists:', !!token)
    console.log('- Student data exists:', !!studentData)
    
    if (studentData) {
      const parsed = JSON.parse(studentData)
      console.log('- User email:', parsed.email)
      console.log('- Is admin:', parsed.email === 'admin@internconnect.com')
    }

    if (!token) {
      setMessage('❌ No token found. Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
      return
    }

    if (!studentData || JSON.parse(studentData).email !== 'admin@internconnect.com') {
      setMessage('❌ Not admin user. Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
      return
    }

    // Test API call
    setMessage('🔍 Testing admin API...')
    
    api.get('/admin/students')
      .then(response => {
        console.log('✅ API Response:', response)
        setMessage(`✅ Admin working! Found ${response.data?.data?.length || 0} students`)
      })
      .catch(error => {
        console.error('❌ API Error:', error)
        console.error('❌ Error Response:', error.response)
        setMessage(`❌ API Error: ${error.response?.data?.message || error.message}`)
      })

  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Dashboard - Simple Test</h1>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Debug Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Token:</strong> {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}</p>
            <p><strong>User:</strong> {localStorage.getItem('student') ? JSON.parse(localStorage.getItem('student')).email : '❌ Missing'}</p>
            <p><strong>Is Admin:</strong> {localStorage.getItem('student') && JSON.parse(localStorage.getItem('student')).email === 'admin@internconnect.com' ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Status</h2>
          <p className="text-center">{message}</p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminSimple
