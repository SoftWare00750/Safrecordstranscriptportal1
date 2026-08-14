import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ role, children }) {
  const { user, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate font-mono">
        Loading session…
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />

  return children
}
