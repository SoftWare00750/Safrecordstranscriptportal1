import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="font-mono text-sm text-slate">Error 404</p>
      <h1 className="font-display text-3xl font-semibold text-ink mt-2">Record not found</h1>
      <p className="text-slate text-sm mt-2 max-w-sm">
        That page isn't in the registrar's index. Head back to the portal entrance.
      </p>
      <Link to="/" className="mt-6 px-4 py-2 rounded bg-ink text-paper text-sm font-medium hover:bg-ink-light transition-colors">
        Return home
      </Link>
    </div>
  )
}
