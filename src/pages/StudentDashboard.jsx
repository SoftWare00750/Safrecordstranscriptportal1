import { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import Tabs from '../components/Tabs'
import RequestForm from '../components/RequestForm'
import RequestCard from '../components/RequestCard'
import Modal from '../components/Modal'
import { createRequest, fetchRequests } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('new')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [pendingSubmission, setPendingSubmission] = useState(null)
  const [justSubmitted, setJustSubmitted] = useState(false)

  const load = () => {
    setLoading(true)
    fetchRequests({ studentId: user.studentId })
      .then(setRequests)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleFormSubmit = (payload) => setPendingSubmission(payload)

  const confirmSubmit = async () => {
    setSubmitting(true)
    try {
      await createRequest({
        ...pendingSubmission,
        studentId: user.studentId,
        studentName: user.fullName,
        email: user.email,
      })
      setPendingSubmission(null)
      setJustSubmitted(true)
      setTab('mine')
      load()
    } finally {
      setSubmitting(false)
    }
  }

  const counts = {
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    declined: requests.filter((r) => r.status === 'declined').length,
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-ink mb-1">Student dashboard</h1>
        <p className="text-sm text-slate mb-6">
          Submit new transcript requests and track their review status.
        </p>

        <Tabs
          tabs={[
            { id: 'new', label: 'New request' },
            { id: 'mine', label: 'My requests', count: requests.length },
          ]}
          active={tab}
          onChange={setTab}
        />

        <div className="mt-6">
          {tab === 'new' && (
            <RequestForm student={user} onSubmit={handleFormSubmit} submitting={submitting} />
          )}

          {tab === 'mine' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 mb-2">
                <SummaryPill label="Pending" value={counts.pending} />
                <SummaryPill label="Approved" value={counts.approved} />
                <SummaryPill label="Declined" value={counts.declined} />
              </div>

              {loading && <p className="text-sm text-slate">Loading your requests…</p>}
              {!loading && requests.length === 0 && (
                <p className="text-sm text-slate ruled-card p-6 text-center">
                  No requests yet. File one from the "New request" tab.
                </p>
              )}
              {requests
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((r) => (
                  <RequestCard key={r.id} request={r} />
                ))}
            </div>
          )}
        </div>
      </main>

      <Modal
        open={!!pendingSubmission}
        title="Confirm transcript request"
        onCancel={() => setPendingSubmission(null)}
        onConfirm={confirmSubmit}
        confirmLabel={submitting ? 'Submitting…' : 'Submit request'}
      >
        You're about to file a transcript request for{' '}
        <strong>{pendingSubmission?.program}</strong>, term{' '}
        <strong>{pendingSubmission?.termCompleted}</strong>. The Registrar's Office will review
        it within 2–3 business days.
      </Modal>

      <Modal
        open={justSubmitted}
        title="Request submitted"
        onCancel={() => setJustSubmitted(false)}
        onConfirm={() => setJustSubmitted(false)}
        confirmLabel="Got it"
        cancelLabel="Close"
        tone="positive"
      >
        Your transcript request has been filed and is now pending review. You can track its
        status from the "My requests" tab.
      </Modal>
    </div>
  )
}

function SummaryPill({ label, value }) {
  return (
    <div className="ruled-card px-3 py-2 text-center">
      <p className="font-display text-xl font-semibold text-ink">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate">{label}</p>
    </div>
  )
}
