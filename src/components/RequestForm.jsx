import { useState } from 'react'

const PURPOSES = ['Graduate school application', 'Employment', 'Transfer credit', 'Personal records', 'Other']
const DELIVERY = ['Electronic PDF', 'Mailed hard copy', 'Both']

const emptyForm = {
  program: '',
  termCompleted: '',
  purpose: '',
  deliveryMethod: '',
  copies: 1,
  notes: '',
}

export default function RequestForm({ student, onSubmit, submitting }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.program.trim()) next.program = 'Program of study is required.'
    if (!form.termCompleted.trim()) next.termCompleted = 'Enter the most recent completed term.'
    if (!form.purpose) next.purpose = 'Select a purpose for this request.'
    if (!form.deliveryMethod) next.deliveryMethod = 'Select a delivery method.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ ...form, copies: Number(form.copies) || 1 })
    setForm(emptyForm)
  }

  return (
    <form onSubmit={handleSubmit} className="ruled-card p-6 sm:p-8 space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">New transcript request</h2>
        <p className="text-sm text-slate mt-1">
          Filed for <span className="font-mono text-ink">{student.fullName}</span> · ID{' '}
          <span className="font-mono text-ink">{student.studentId}</span>
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Program of study" error={errors.program}>
          <input
            value={form.program}
            onChange={update('program')}
            placeholder="e.g. B.Sc. Computer Science"
            className={inputClass(errors.program)}
          />
        </Field>

        <Field label="Most recent completed term" error={errors.termCompleted}>
          <input
            value={form.termCompleted}
            onChange={update('termCompleted')}
            placeholder="e.g. Spring 2026"
            className={inputClass(errors.termCompleted)}
          />
        </Field>

        <Field label="Purpose of request" error={errors.purpose}>
          <select value={form.purpose} onChange={update('purpose')} className={inputClass(errors.purpose)}>
            <option value="">Select a purpose…</option>
            {PURPOSES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>

        <Field label="Delivery method" error={errors.deliveryMethod}>
          <select value={form.deliveryMethod} onChange={update('deliveryMethod')} className={inputClass(errors.deliveryMethod)}>
            <option value="">Select delivery…</option>
            {DELIVERY.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Field>

        <Field label="Number of copies">
          <input
            type="number"
            min={1}
            max={10}
            value={form.copies}
            onChange={update('copies')}
            className={inputClass()}
          />
        </Field>

        <Field label="Notes for the registrar (optional)">
          <input
            value={form.notes}
            onChange={update('notes')}
            placeholder="Anything the office should know"
            className={inputClass()}
          />
        </Field>
      </div>

      <div className="pt-2 flex items-center justify-between">
        <p className="text-xs text-slate font-mono">Typical review time: 2–3 business days</p>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 rounded bg-ink text-paper font-medium text-sm hover:bg-ink-light transition-colors disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit request'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-slate">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="text-xs text-seal mt-1 block">{error}</span>}
    </label>
  )
}

function inputClass(error) {
  return `w-full rounded border bg-paper px-3 py-2 text-sm text-ink placeholder:text-slate/60 focus:outline-none focus:ring-2 focus:ring-brass/50 transition-shadow ${
    error ? 'border-seal' : 'border-ledger-line'
  }`
}
