import api from '../axios'

const getAuthConfig = () => {
  const token = localStorage.getItem('token')

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

export const fetchStudentGuidance = async () => {
  const response = await api.get('/student-guidance', getAuthConfig())
  return response.data.data
}

export const updateStudentInterests = async (payload) => {
  const response = await api.put('/student-guidance/interests', payload, getAuthConfig())
  return response.data.data
}

export const updateStudentSkills = async (payload) => {
  const response = await api.put('/student-guidance/skills', payload, getAuthConfig())
  return response.data.data
}

export const sendAskInternConnectMessage = async (payload) => {
  const response = await api.post('/student-guidance/chat', payload, getAuthConfig())
  return response.data.data
}
