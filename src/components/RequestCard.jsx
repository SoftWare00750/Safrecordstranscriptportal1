import { useState } from 'react'
import StatusBadge from './StatusBadge'
import ReasonExplainer from './ReasonExplainer'
import TranscriptPDF from './TranscriptPDF'

export default function RequestCard({ request, admin = false, onApprove, onDecline }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="ruled-card perforated-top p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-slate">REQ-{request.id}</p>
          <h3 className="font-display font-semibold text-ink text-lg mt-0.5">
            {request.program}
          </h3>
          <p className="text-sm text-slate mt-0.5">
            {admin ? `${request.studentName} · ID ${request.studentId}` : `Term: ${request.termCompleted}`}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <Meta label="Purpose" value={request.purpose} />
        <Meta label="Delivery" value={request.deliveryMethod} />
        <Meta label="Copies" value={request.copies} />
        <Meta label="Filed" value={new Date(request.createdAt).toLocaleDateString()} />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-medium text-ink-light underline underline-offset-2 hover:text-ink"
        >
          {expanded ? 'Hide status explanation' : 'Why this status?'}
        </button>

        {request.status === 'approved' && !admin && (
          <TranscriptPDF request={request} />
        )}

        {admin && request.status === 'pending' && (
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => onDecline(request)}
              className="px-3 py-1.5 rounded border border-seal text-seal text-xs font-medium hover:bg-seal/10 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => onApprove(request)}
              className="px-3 py-1.5 rounded bg-brass text-ink text-xs font-medium hover:bg-brass-light transition-colors"
            >
              Approve
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="mt-4">
          <ReasonExplainer request={request} />
        </div>
      )}
    </div>
  )
}

function Meta({ label, value }) {
  return (
    <div>
      <p className="text-slate uppercase tracking-wide text-[10px]">{label}</p>
      <p className="text-ink font-medium mt-0.5">{value}</p>
    </div>
  )
}
