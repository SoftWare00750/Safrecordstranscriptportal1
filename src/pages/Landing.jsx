import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchStudents } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const [tab, setTab] = useState('student')
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [studentsError, setStudentsError] = useState('')
  const [studentId, setStudentId] = useState('')
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const { loginAsStudent, loginAsAdmin } = useAuth()
  const navigate = useNavigate()

  const loadStudents = () => {
    setStudentsLoading(true)
    setStudentsError('')
    fetchStudents()
      .then((data) => setStudents(data))
      .catch(() => {
        setStudents([])
        setStudentsError("Couldn't reach the records server. Check your connection and try again.")
      })
      .finally(() => setStudentsLoading(false))
  }

  useEffect(() => { loadStudents() }, [])

  const handleStudentLogin = (e) => {
    e.preventDefault()
    if (studentsError) {
      setError("Can't verify Student IDs right now — the records server is unreachable. Try Retry below.")
      return
    }
    const student = students.find((s) => s.studentId === studentId.trim())
    if (!student) {
      setError('No student record matches that ID. Try one of the sample IDs below.')
      return
    }
    setError('')
    loginAsStudent(student)
    navigate('/student')
  }

  const handleAdminLogin = (e) => {
    e.preventDefault()
    if (passcode.trim().toUpperCase() !== 'REGISTRAR') {
      setError('Incorrect staff passcode. Hint: REGISTRAR')
      return
    }
    setError('')
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
              onClick={() => { setTab('student'); setError('') }}
              className={`flex-1 py-2 transition-colors ${tab === 'student' ? 'bg-ink text-paper' : 'bg-paper text-slate hover:bg-parchment'}`}
            >
              Student
            </button>
            <button
              onClick={() => { setTab('admin'); setError('') }}
              className={`flex-1 py-2 transition-colors ${tab === 'admin' ? 'bg-ink text-paper' : 'bg-paper text-slate hover:bg-parchment'}`}
            >
              Records Office
            </button>
          </div>

          {tab === 'student' ? (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate">Student ID</span>
                <input
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. STU-1"
                  className="mt-1.5 w-full rounded border border-ledger-line bg-paper px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50"
                />
              </label>
              {error && <p className="text-xs text-seal">{error}</p>}
              <button type="submit" className="w-full py-2.5 rounded bg-ink text-paper font-medium text-sm hover:bg-ink-light transition-colors">
                Enter portal
              </button>

              {studentsLoading && (
                <p className="text-[11px] text-slate font-mono">Loading sample IDs…</p>
              )}

              {!studentsLoading && studentsError && (
                <p className="text-[11px] text-seal font-mono">
                  {studentsError}{' '}
                  <button type="button" onClick={loadStudents} className="underline hover:text-ink">
                    Retry
                  </button>
                </p>
              )}

              {!studentsLoading && !studentsError && (
                <p className="text-[11px] text-slate font-mono">
                  {students.length > 0
                    ? `Sample IDs: ${students.map((s) => s.studentId).join(', ')}`
                    : 'No sample students found on the server yet.'}
                </p>
              )}
            </form>
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
              {error && <p className="text-xs text-seal">{error}</p>}
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
