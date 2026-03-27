import api from './axios'

const BASE = '/my-internships'
const DIARY_BASE = '/diary'
const TASKS_BASE = '/tasks'
const MONTHLY_REPORTS_BASE = '/monthly-reports'
const FINAL_REPORTS_BASE = '/final-reports'

// Internships 
export const getInternships = (studentIdNumber) =>
  api.get(`${BASE}/student/${studentIdNumber}`)

export const addInternship   = (data) =>
  api.post(BASE, data)

export const updateInternship = (id, data) =>
  api.put(`${BASE}/${id}`, data)

export const deleteInternship = (id) =>
  api.delete(`${BASE}/${id}`)

// Daily Diary
export const getEntries    = (internshipId) =>
  api.get(`${DIARY_BASE}/internship/${internshipId}`)

export const addEntry      = (data) =>
  api.post(DIARY_BASE, data)

export const updateEntry   = (id, data) =>
  api.put(`${DIARY_BASE}/${id}`, data)

export const deleteEntry   = (id) =>
  api.delete(`${DIARY_BASE}/${id}`)

// Tasks 
export const getTasks    = (internshipId) =>
  api.get(`${TASKS_BASE}/internship/${internshipId}`)

export const addTask     = (data) =>
  api.post(TASKS_BASE, data)

export const updateTask  = (id, data) =>
  api.put(`${TASKS_BASE}/${id}`, data)

export const deleteTask  = (id) =>
  api.delete(`${TASKS_BASE}/${id}`)

//  Monthly Reports 
export const getReports    = (internshipId) =>
  api.get(`${MONTHLY_REPORTS_BASE}/internship/${internshipId}`)

export const addReport     = (data) =>
  api.post(MONTHLY_REPORTS_BASE, data)

export const updateReport  = (id, data) =>
  api.put(`${MONTHLY_REPORTS_BASE}/${id}`, data)

export const deleteReport  = (id) =>
  api.delete(`${MONTHLY_REPORTS_BASE}/${id}`)

// Final Report 
export const getFinalReport    = (internshipId) =>
  api.get(`${FINAL_REPORTS_BASE}/internship/${internshipId}`)

export const addFinalReport    = (data) =>
  api.post(FINAL_REPORTS_BASE, data)

export const updateFinalReport = (id, data) =>
  api.put(`${FINAL_REPORTS_BASE}/${id}`, data)

export const deleteFinalReport = (id) =>
  api.delete(`${FINAL_REPORTS_BASE}/${id}`)
