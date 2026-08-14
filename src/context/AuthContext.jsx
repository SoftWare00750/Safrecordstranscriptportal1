import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { fetchStudentById } from '../api/client'

const AuthContext = createContext(null)

const ADMIN_STORAGE_KEY = 'safrecords-admin'

// Builds the app-facing student user object from a Supabase auth user plus
// their profile record in the Express backend (fullName, program). The
// studentId is stored on the Supabase user at sign-up time (user_metadata)
// so we always know which backend record to enrich with.
async function buildStudentUser(supabaseUser) {
  const studentId = supabaseUser?.user_metadata?.studentId
  if (!studentId) {
    throw new Error(
      'This account has no Student ID on file. Contact the Records Office to link your account.'
    )
  }
  const profile = await fetchStudentById(studentId)
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
    } catch {
      throw new Error(`No student record matches ID "${trimmedId}". Check the ID and try again.`)
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
