import axios from 'axios'

const BASE = 'http://localhost:5000/api'

// Internships 
export const getInternships = (studentIdNumber) =>
  axios.get(`${BASE}/internships/student/${studentIdNumber}`)

export const addInternship   = (data) =>
  axios.post(`${BASE}/internships`, data)

export const updateInternship = (id, data) =>
  axios.put(`${BASE}/internships/${id}`, data)

export const deleteInternship = (id) =>
  axios.delete(`${BASE}/internships/${id}`)

// Daily Diary
export const getEntries    = (internshipId) =>
  axios.get(`${BASE}/diary/internship/${internshipId}`)

export const addEntry      = (data) =>
  axios.post(`${BASE}/diary`, data)

export const updateEntry   = (id, data) =>
  axios.put(`${BASE}/diary/${id}`, data)

export const deleteEntry   = (id) =>
  axios.delete(`${BASE}/diary/${id}`)

// Tasks 
export const getTasks    = (internshipId) =>
  axios.get(`${BASE}/tasks/internship/${internshipId}`)

export const addTask     = (data) =>
  axios.post(`${BASE}/tasks`, data)

export const updateTask  = (id, data) =>
  axios.put(`${BASE}/tasks/${id}`, data)

export const deleteTask  = (id) =>
  axios.delete(`${BASE}/tasks/${id}`)

//  Monthly Reports 
export const getReports    = (internshipId) =>
  axios.get(`${BASE}/monthly-reports/internship/${internshipId}`)

export const addReport     = (data) =>
  axios.post(`${BASE}/monthly-reports`, data)

export const updateReport  = (id, data) =>
  axios.put(`${BASE}/monthly-reports/${id}`, data)

export const deleteReport  = (id) =>
  axios.delete(`${BASE}/monthly-reports/${id}`)

// Final Report 
export const getFinalReport    = (internshipId) =>
  axios.get(`${BASE}/final-reports/internship/${internshipId}`)

export const addFinalReport    = (data) =>
  axios.post(`${BASE}/final-reports`, data)

export const updateFinalReport = (id, data) =>
  axios.put(`${BASE}/final-reports/${id}`, data)

export const deleteFinalReport = (id) =>
  axios.delete(`${BASE}/final-reports/${id}`)