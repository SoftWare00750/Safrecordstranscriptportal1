const CONFIG = {
  approved: { label: 'Approved', color: 'text-brass' },
  declined: { label: 'Declined', color: 'text-seal' },
  pending: { label: 'Pending', color: 'text-ink-light' },
}

export default function StatusBadge({ status, size = 'md' }) {
  const cfg = CONFIG[status] || CONFIG.pending
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2.5 py-1' : ''
  return (
    <span className={`seal-stamp ${cfg.color} ${sizeClasses}`}>
      {cfg.label}
    </span>
  )
}
