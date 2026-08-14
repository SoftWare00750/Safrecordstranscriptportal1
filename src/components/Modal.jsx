export default function Modal({
  open,
  title,
  children,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
}) {
  if (!open) return null

  const confirmClasses =
    tone === 'danger'
      ? 'bg-seal hover:bg-seal-light text-paper'
      : tone === 'positive'
      ? 'bg-brass hover:bg-brass-light text-ink'
      : 'bg-ink hover:bg-ink-light text-paper'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px] px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onCancel}
    >
      <div
        className="ruled-card w-full max-w-md p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="modal-title" className="font-display text-xl font-semibold text-ink mb-2">
          {title}
        </h3>
        <div className="text-sm text-slate leading-relaxed mb-6">{children}</div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded border border-ledger-line text-slate hover:bg-parchment transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
