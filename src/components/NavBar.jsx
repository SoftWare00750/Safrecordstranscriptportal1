import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ledger-line bg-paper/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-ink flex items-center justify-center font-display font-bold text-ink text-sm">
            SR
          </div>
          <div className="leading-tight">
            <p className="font-display font-semibold text-ink text-base">SAFRecords</p>
            <p className="text-[11px] text-slate font-mono tracking-wide">Transcript Portal</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-ink">
                {user.role === 'admin' ? user.name : user.fullName}
              </p>
              <p className="text-[11px] text-slate font-mono uppercase tracking-wide">
                {user.role === 'admin' ? 'Records Office' : `ID ${user.studentId}`}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium px-3 py-1.5 rounded border border-ledger-line text-slate hover:text-seal hover:border-seal/50 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
