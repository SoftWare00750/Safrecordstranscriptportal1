import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const [tab, setTab] = useState('student')
  const { loginAsAdmin, user, authLoading } = useAuth()
  const navigate = useNavigate()

  const [passcode, setPasscode] = useState('')
  const [adminError, setAdminError] = useState('')

  // Handles the email-confirmation redirect: the link sends the browser
  // back to '/' with a session token in the URL. supabase-js picks that up
  // automatically (detectSessionInUrl), which fires onAuthStateChange and
  // populates `user` here — at that point we're already signed in, so send
  // the student straight into the dashboard instead of leaving them on the
  // login screen.
  useEffect(() => {
    if (!authLoading && user?.role === 'student') {
      navigate('/student', { replace: true })
    }
  }, [authLoading, user, navigate])

  const handleAdminLogin = (e) => {
    e.preventDefault()
    if (passcode.trim().toUpperCase() !== 'REGISTRAR') {
      setAdminError('Incorrect staff passcode. Hint: REGISTRAR')
      return
    }
    setAdminError('')
    loginAsAdmin('A. Records Officer')
    navigate('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full border-2 border-ink flex items-center justify-center font-display font-bold text-ink text-xl">
            SR
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink mt-4">SAFRecords</h1>
          <p className="text-slate text-sm mt-1 font-mono tracking-wide">Academic Transcript Portal</p>
        </div>

        <div className="ruled-card p-6 sm:p-8">
          <div className="flex rounded overflow-hidden border border-ledger-line mb-6 text-sm font-medium">
            <button
              onClick={() => setTab('student')}
              className={`flex-1 py-2 transition-colors ${tab === 'student' ? 'bg-ink text-paper' : 'bg-paper text-slate hover:bg-parchment'}`}
            >
              Student
            </button>
            <button
              onClick={() => { setTab('admin'); setAdminError('') }}
              className={`flex-1 py-2 transition-colors ${tab === 'admin' ? 'bg-ink text-paper' : 'bg-paper text-slate hover:bg-parchment'}`}
            >
              Records Office
            </button>
          </div>

          {tab === 'student' ? (
            <StudentAuth />
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate">Staff passcode</span>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode"
                  className="mt-1.5 w-full rounded border border-ledger-line bg-paper px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50"
                />
              </label>
              {adminError && <p className="text-xs text-seal">{adminError}</p>}
              <button type="submit" className="w-full py-2.5 rounded bg-ink text-paper font-medium text-sm hover:bg-ink-light transition-colors">
                Enter approval queue
              </button>
              <p className="text-[11px] text-slate font-mono">Demo passcode: REGISTRAR</p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function StudentAuth() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [studentId, setStudentId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const { signInStudent, signUpStudent } = useAuth()
  const navigate = useNavigate()

  const switchMode = (next) => {
    setMode(next)
    setError('')
    setNotice('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setSubmitting(true)
    try {
      if (mode === 'signin') {
        await signInStudent({ email, password })
        navigate('/student')
      } else {
        const { needsEmailConfirmation } = await signUpStudent({ studentId, email, password })
        if (needsEmailConfirmation) {
          setNotice('Account created — check your email to confirm it, then sign in.')
          setMode('signin')
        } else {
          navigate('/student')
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex text-xs font-mono mb-4 gap-4">
        <button
          type="button"
          onClick={() => switchMode('signin')}
          className={mode === 'signin' ? 'text-ink font-semibold underline' : 'text-slate hover:text-ink'}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => switchMode('signup')}
          className={mode === 'signup' ? 'text-ink font-semibold underline' : 'text-slate hover:text-ink'}
        >
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate">Student ID</span>
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. STU-1"
              className="mt-1.5 w-full rounded border border-ledger-line bg-paper px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50"
            />
          </label>
        )}

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded border border-ledger-line bg-paper px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
            minLength={6}
            className="mt-1.5 w-full rounded border border-ledger-line bg-paper px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50"
          />
        </label>

        {error && <p className="text-xs text-seal">{error}</p>}
        {notice && <p className="text-xs text-emerald-700">{notice}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded bg-ink text-paper font-medium text-sm hover:bg-ink-light transition-colors disabled:opacity-60"
        >
          {submitting
            ? (mode === 'signin' ? 'Signing in…' : 'Creating account…')
            : (mode === 'signin' ? 'Sign in' : 'Create account')}
        </button>

        {mode === 'signup' && (
          <p className="text-[11px] text-slate font-mono">
            Use any of the seeded IDs STU-1 through STU-50 — your account gets linked to that
            student record.
          </p>
        )}
      </form>
    </div>
  )
}