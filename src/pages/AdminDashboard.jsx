import { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import Tabs from '../components/Tabs'
import RequestCard from '../components/RequestCard'
import Modal from '../components/Modal'
import { fetchRequests, updateRequestStatus } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('pending')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmAction, setConfirmAction] = useState(null) // { request, action }

  const load = () => {
    setLoading(true)
    fetchRequests()
      .then(setRequests)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = requests.filter((r) => (tab === 'all' ? true : r.status === tab))

  const counts = {
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    declined: requests.filter((r) => r.status === 'declined').length,
    all: requests.length,
  }

  const openConfirm = (request, action) => setConfirmAction({ request, action })

  const runAction = async () => {
    const { request, action } = confirmAction
    await updateRequestStatus(request.id, {
      status: action === 'approve' ? 'approved' : 'declined',
      reviewedBy: user.name,
      holds: action === 'decline' ? request.holds?.length ? request.holds : [] : [],
    })
    setConfirmAction(null)
    load()
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-ink mb-1">Approval queue</h1>
        <p className="text-sm text-slate mb-6">
          Review incoming transcript requests and approve or decline them.
        </p>

        <Tabs
          tabs={[
            { id: 'pending', label: 'Pending', count: counts.pending },
            { id: 'approved', label: 'Approved', count: counts.approved },
            { id: 'declined', label: 'Declined', count: counts.declined },
            { id: 'all', label: 'All requests', count: counts.all },
          ]}
          active={tab}
          onChange={setTab}
        />

        <div className="mt-6 space-y-4">
          {loading && <p className="text-sm text-slate">Loading queue…</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-sm text-slate ruled-card p-6 text-center">Nothing here right now.</p>
          )}
          {filtered
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                admin
                onApprove={(req) => openConfirm(req, 'approve')}
                onDecline={(req) => openConfirm(req, 'decline')}
              />
            ))}
        </div>
      </main>

      <Modal
        open={!!confirmAction}
        title={confirmAction?.action === 'approve' ? 'Approve this request?' : 'Decline this request?'}
        onCancel={() => setConfirmAction(null)}
        onConfirm={runAction}
        confirmLabel={confirmAction?.action === 'approve' ? 'Approve' : 'Decline'}
        tone={confirmAction?.action === 'approve' ? 'positive' : 'danger'}
      >
        {confirmAction?.action === 'approve' ? (
          <>
            This releases <strong>{confirmAction?.request.studentName}</strong>'s transcript for{' '}
            <strong>{confirmAction?.request.program}</strong>. They'll be able to download the PDF
            immediately.
          </>
        ) : (
          <>
            <strong>{confirmAction?.request.studentName}</strong>'s request will be marked declined
            and they'll see the reason in their status explainer.
          </>
        )}
      </Modal>
    </div>
  )
}
