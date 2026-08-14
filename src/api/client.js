import axios from 'axios'

// In local dev, Vite proxies '/api' to the backend (see vite.config.js), so the
// relative path works out of the box. In production the frontend and backend
// are typically deployed to two different hosts/domains, so there is no proxy —
// the app needs the backend's absolute URL. Set VITE_API_BASE_URL in the
// frontend's deployment environment (e.g. https://your-backend.onrender.com/api)
// to point at the deployed backend. Falls back to the relative '/api' path for
// local dev and same-origin deployments.
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

// The backend is a Supabase Edge Function. Supabase's gateway sits in front
// of every Edge Function and can require a valid project API key on the
// request before it ever reaches the function's own code — independent of
// the function's `withSupabase({ auth: 'none' })` route-level check (see the
// warning comment at the top of backend/supabase/functions/api/index.ts).
// Without this header, a deployment where that gateway-level check is
// enforced returns a bare 401 with no JSON body, which the frontend can't
// tell apart from "the server is unreachable" (see describeStudentLookupError
// in AuthContext.jsx). supabase-js sends this same header automatically for
// every other Supabase service (PostgREST, Storage, Realtime) — doing it
// here too is safe and doesn't require any backend change.
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    ...(supabaseKey ? { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } : {}),
  },
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

// ---- Academic results (course grades, for the transcript PDF) ----
export const fetchStudentResults = (studentId) =>
  api.get(`/students/${studentId}/results`).then((r) => r.data)

// ---- Reason-for-status explainer ----
export const explainStatus = (id) =>
  api.get(`/explain/${id}`).then((r) => r.data)

export default api
