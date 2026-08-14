import { useEffect, useState } from 'react'
import { explainLocally } from '../api/statusExplainer'
import { explainStatus } from '../api/client'

const TONE_STYLES = {
  positive: 'border-brass/50 bg-brass/10',
  negative: 'border-seal/50 bg-seal/10',
  warning: 'border-ink-light/40 bg-parchment',
  neutral: 'border-ledger-line bg-parchment',
}

export default function ReasonExplainer({ request }) {
  const [explanation, setExplanation] = useState(() => explainLocally(request))
  const [source, setSource] = useState('rule-based')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setExplanation(explainLocally(request))
  }, [request])

  const refreshFromServer = async () => {
    setLoading(true)
    try {
      const data = await explainStatus(request.id)
      setExplanation(data.explanation)
      setSource(data.mode)
    } catch (e) {
      // keep local explanation if the server call fails
    } finally {
      setLoading(false)
    }
  }

  if (!explanation) return null

  return (
    <div className={`rounded border p-4 ${TONE_STYLES[explanation.tone] || TONE_STYLES.neutral}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-display font-semibold text-ink text-sm">{explanation.headline}</p>
        <button
          onClick={refreshFromServer}
          disabled={loading}
          className="shrink-0 text-[11px] font-mono uppercase tracking-wide text-slate hover:text-ink underline underline-offset-2 disabled:opacity-50"
          title="Ask the registrar's explainer service to re-check this"
        >
          {loading ? 'Checking…' : 'Re-check'}
        </button>
      </div>
      <p className="text-sm text-slate mt-1.5 leading-relaxed">{explanation.detail}</p>
      {explanation.nextSteps?.length > 0 && (
        <ul className="mt-3 space-y-1">
          {explanation.nextSteps.map((step, i) => (
            <li key={i} className="text-xs text-ink-light flex gap-2">
              <span className="font-mono text-brass">{String(i + 1).padStart(2, '0')}</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-[10px] uppercase tracking-widest text-slate/70 font-mono">
        Source: {source === 'ai' ? 'AI-generated explanation' : 'Registrar rule-based guidance'}
      </p>
    </div>
  )
}
