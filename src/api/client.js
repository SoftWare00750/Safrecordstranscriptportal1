import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ---- Requests ----
export const fetchRequests = (params = {}) =>
  api.get('/requests', { params }).then((r) => r.data)

export const fetchRequest = (id) =>
  api.get(`/requests/${id}`).then((r) => r.data)

export const createRequest = (payload) =>
  api.post('/requests', payload).then((r) => r.data)

export const updateRequestStatus = (id, payload) =>
  api.patch(`/requests/${id}/status`, payload).then((r) => r.data)

// ---- Students (lookup / autofill) ----
export const fetchStudents = () => api.get('/students').then((r) => r.data)

export const fetchStudentById = (studentId) =>
  api.get(`/students/${studentId}`).then((r) => r.data)

// ---- Reason-for-status explainer ----
export const explainStatus = (id) =>
  api.get(`/explain/${id}`).then((r) => r.data)

export default api
