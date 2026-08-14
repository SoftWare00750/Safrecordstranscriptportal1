import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { fetchStudentById } from '../api/client'

const AuthContext = createContext(null)

const ADMIN_STORAGE_KEY = 'safrecords-admin'

// Builds the app-facing student user object from a Supabase auth user plus
// their profile record in the Express backend (fullName, program). The
// studentId is stored on the Supabase user at sign-up time (user_metadata)
// so we always know which backend record to enrich with.
// Distinguishes "the backend told us this ID doesn't exist" (a genuine 404
// from our Express API) from "we couldn't even reach the backend" (network
// error, wrong/missing VITE_API_BASE_URL, CORS, 5xx, timeout). This matters
// because a misconfigured API base URL in production makes '/api/students/...'
// hit the frontend's own domain instead of the backend — and most static
// hosts (Vercel included) return their own 404 page for that unmatched
// route, which is ALSO technically a 404. So status===404 alone isn't
// enough: we additionally check that the response actually came from our
// API (JSON body shaped like { error: "..." }), not a platform 404 page.
// Getting this wrong was the original bug: every kind of failure — including
// the backend being completely unreachable — was reported as "no student
// record matches that ID", which is misleading and sent people chasing a
// data problem that didn't exist.
function describeStudentLookupError(err, studentId) {
  const res = err?.response
  const isGenuineApiNotFound =
    res?.status === 404 &&
    typeof res.data === 'object' &&
    res.data !== null &&
    typeof res.data.error === 'string'

  if (isGenuineApiNotFound) {
    return `No student record matches ID "${studentId}". Check the ID and try again.`
  }
  return "Couldn't reach the records server to verify that Student ID. Check your connection and try again in a moment."
}

async function buildStudentUser(supabaseUser) {
  const studentId = supabaseUser?.user_metadata?.studentId
  if (!studentId) {
    throw new Error(
      'This account has no Student ID on file. Contact the Records Office to link your account.'
    )
  }
  let profile
  try {
    profile = await fetchStudentById(studentId)
  } catch (err) {
    throw new Error(describeStudentLookupError(err, studentId))
  }
  return {
    role: 'student',
    studentId: profile.studentId,
    fullName: profile.fullName,
    program: profile.program,
    email: supabaseUser.email,
  }
}

export function AuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    const saved = sessionStorage.getItem(ADMIN_STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  })
  const [studentUser, setStudentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    if (adminUser) sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser))
    else sessionStorage.removeItem(ADMIN_STORAGE_KEY)
  }, [adminUser])

  // Restore an existing Supabase session on load (e.g. page refresh) and
  // keep the student profile in sync with auth state changes (sign-in from
  // this tab, sign-out from another tab, token refresh, etc).
  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return
      if (session?.user) {
        try {
          setStudentUser(await buildStudentUser(session.user))
        } catch {
          setStudentUser(null)
        }
      }
      setAuthLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return
      if (session?.user) {
        try {
          setStudentUser(await buildStudentUser(session.user))
        } catch {
          setStudentUser(null)
        }
      } else {
        setStudentUser(null)
      }
    })

    return () => {
      active = false
      subscription?.subscription?.unsubscribe()
    }
  }, [])

  // ---- Student: real Supabase auth ----
  const signUpStudent = async ({ studentId, email, password }) => {
    const trimmedId = studentId.trim()
    let profile
    try {
      profile = await fetchStudentById(trimmedId)
    } catch (err) {
      throw new Error(describeStudentLookupError(err, trimmedId))
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { studentId: profile.studentId } },
    })
    if (error) throw new Error(error.message)

    if (data.session) {
      setStudentUser(await buildStudentUser(data.user))
      return { needsEmailConfirmation: false }
    }
    // Project has email confirmation enabled — no session yet.
    return { needsEmailConfirmation: true }
  }

  const signInStudent = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) throw new Error(error.message)
    setStudentUser(await buildStudentUser(data.user))
  }

  // ---- Admin: unchanged passcode-based demo login ----
  const loginAsAdmin = (name) => setAdminUser({ role: 'admin', name, staffId: 'REG-STAFF' })

  const logout = async () => {
    if (studentUser) await supabase.auth.signOut()
    setStudentUser(null)
    setAdminUser(null)
  }

  const user = studentUser || adminUser || null

  return (
    <AuthContext.Provider
      value={{ user, authLoading, signUpStudent, signInStudent, loginAsAdmin, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
