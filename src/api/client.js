import axios from 'axios'

// In local dev, Vite proxies '/api' to the backend (see vite.config.js), so the
// relative path works out of the box. In production the frontend and backend
// are typically deployed to two different hosts/domains, so there is no proxy —
// the app needs the backend's absolute URL. Set VITE_API_BASE_URL in the
// frontend's deployment environment (e.g. https://your-backend.onrender.com/api)
// to point at the deployed backend. Falls back to the relative '/api' path for
// local dev and same-origin deployments.
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
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

export const updateStudent = (studentId, payload) =>
  api.patch(`/students/${studentId}`, payload).then((r) => r.data)

// ---- Reason-for-status explainer ----
export const explainStatus = (id) =>
  api.get(`/explain/${id}`).then((r) => r.data)

export default api