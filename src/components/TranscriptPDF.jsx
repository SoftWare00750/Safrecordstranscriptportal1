import { useEffect, useRef, useState } from 'react'
import html2pdf from 'html2pdf.js'
import { fetchStudentResults } from '../api/client'

export default function TranscriptPDF({ request }) {
  const printRef = useRef(null)
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState([])
  const [summary, setSummary] = useState({ totalCredits: 0, gpa: 0, courseCount: 0 })
  const [loadError, setLoadError] = useState('')
  const [loadingResults, setLoadingResults] = useState(true)

  // The transcript's grades table comes from the student's academic record,
  // not the request itself — fetch it as soon as an approved request card
  // renders this component, so the PDF button is ready to generate the
  // moment the student clicks it (no spinner-inside-a-spinner).
  useEffect(() => {
    let active = true
    setLoadingResults(true)
    fetchStudentResults(request.studentId)
      .then((data) => {
        if (!active) return
        setResults(data.results)
        setSummary(data.summary)
      })
      .catch(() => {
        if (active) setLoadError('Could not load the academic record for this transcript.')
      })
      .finally(() => {
        if (active) setLoadingResults(false)
      })
    return () => {
      active = false
    }
  }, [request.studentId])

  const handleDownload = async () => {
    if (!printRef.current) return
    setGenerating(true)
    try {
      await html2pdf()
        .set({
          margin: 0.5,
          filename: `transcript-${request.studentId}-REQ${request.id}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        })
        .from(printRef.current)
        .save()
    } finally {
      setGenerating(false)
    }
  }

  const byTerm = groupByTerm(results)
  const verificationCode = `${request.studentId}-${request.trackingCode}`

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={generating || loadingResults}
        title={loadError || undefined}
        className="px-3 py-1.5 rounded bg-ink text-paper text-xs font-medium hover:bg-ink-light transition-colors disabled:opacity-50"
      >
        {generating ? 'Preparing PDF…' : loadingResults ? 'Loading record…' : 'Download PDF'}
      </button>

      {/* Off-screen printable transcript, captured by html2pdf */}
      <div className="fixed -left-[9999px] top-0" aria-hidden="true">
        <div
          ref={printRef}
          className="relative w-[7.5in] bg-white text-black p-10 overflow-hidden"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          <Watermark />

          <div className="relative">
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-wide">SAFRecords University</h1>
                <p className="text-xs tracking-widest uppercase mt-1">Office of the Registrar</p>
              </div>
              <div className="text-right text-xs">
                <p>Record ID: REQ-{request.id}</p>
                <p>Issued: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <h2 className="text-center text-lg font-bold uppercase tracking-widest mt-6 mb-6">
              Official Academic Transcript
            </h2>

            <table className="w-full text-sm border-collapse mb-6">
              <tbody>
                <Row label="Student name" value={request.studentName} />
                <Row label="Student ID" value={request.studentId} />
                <Row label="Program of study" value={request.program} />
                <Row label="Most recent completed term" value={request.termCompleted} />
                <Row label="Purpose of request" value={request.purpose} />
                <Row label="Delivery method" value={request.deliveryMethod} />
                <Row label="Copies issued" value={request.copies} />
              </tbody>
            </table>

            <h3 className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 mb-3">
              Academic Record
            </h3>

            {loadError && <p className="text-xs italic mb-3">{loadError}</p>}

            {!loadError && byTerm.length === 0 && !loadingResults && (
              <p className="text-xs italic mb-3">No coursework is on file for this student yet.</p>
            )}

            {byTerm.map(([term, courses]) => (
              <div key={term} className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wide mb-1">{term}</p>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="text-left py-1 pr-2 font-semibold">Course</th>
                      <th className="text-left py-1 pr-2 font-semibold">Title</th>
                      <th className="text-right py-1 pr-2 font-semibold">Credit Hrs</th>
                      <th className="text-right py-1 font-semibold">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c.id} className="border-b border-gray-300">
                        <td className="py-1 pr-2 font-mono">{c.courseCode}</td>
                        <td className="py-1 pr-2">{c.courseTitle}</td>
                        <td className="py-1 pr-2 text-right">{c.creditHours.toFixed(0)}</td>
                        <td className="py-1 text-right font-semibold">{c.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {byTerm.length > 0 && (
              <div className="flex justify-end gap-8 text-xs font-semibold border-t border-black pt-2 mb-6">
                <p>Courses: {summary.courseCount}</p>
                <p>Total credit hours: {summary.totalCredits}</p>
                <p>Cumulative GPA (5.0 scale): {summary.gpa.toFixed(2)}</p>
              </div>
            )}

            <div className="border border-black p-4 text-xs leading-relaxed">
              This document certifies that the above-named student's transcript request has been
              reviewed and approved by the Office of the Registrar. This PDF serves as a
              record-locked confirmation copy; official sealed transcripts are issued separately
              per the selected delivery method.
            </div>

            <div className="mt-10 flex justify-between items-end text-xs">
              <div>
                <p className="border-t border-black pt-1 w-48 text-center">Registrar Signature</p>
              </div>
              <OriginalitySeal code={verificationCode} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function Row({ label, value }) {
  return (
    <tr className="border-b border-gray-300">
      <td className="py-2 pr-4 font-semibold w-1/3 align-top">{label}</td>
      <td className="py-2 align-top">{value}</td>
    </tr>
  )
}

function groupByTerm(results) {
  const map = new Map()
  for (const r of results) {
    if (!map.has(r.term)) map.set(r.term, [])
    map.get(r.term).push(r)
  }
  // Chronological-ish order matches how the backend already sorts by term,
  // so preserve first-seen order rather than re-sorting alphabetically.
  return Array.from(map.entries())
}

// A diagonal, tiled "AUTHENTIC TRANSCRIPT" watermark behind the document
// body. Low-opacity and print-safe (pure CSS, no external image), and — like
// a real security paper watermark — makes the PDF harder to pass off as a
// screenshot or edited copy, since tiled text survives cropping better than
// a single corner mark.
function Watermark() {
  const rows = Array.from({ length: 10 })
  const cols = Array.from({ length: 4 })
  return (
    <div
      className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none"
      style={{ transform: 'rotate(-28deg) scale(1.4)', transformOrigin: 'center' }}
    >
      {rows.map((_, ri) => (
        <div key={ri} className="flex justify-between">
          {cols.map((_, ci) => (
            <span
              key={ci}
              className="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap"
              style={{ color: 'rgba(0,0,0,0.06)' }}
            >
              Authentic Transcript
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

// The "seal of originality": a two-ring rosette with radiating guilloché
// lines (the sunburst pattern banknotes and real diplomas use, since it's
// very hard to reproduce cleanly on a photocopier) plus a per-document
// verification code, so any given transcript's seal is unique to that
// student and that request — not just a decorative stamp reused everywhere.
function OriginalitySeal({ code }) {
  const rays = Array.from({ length: 36 })
  const size = 120
  const cx = size / 2
  const cy = size / 2
  return (
    <div className="flex flex-col items-center" style={{ width: 150 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-6deg)' }}>
        <circle cx={cx} cy={cy} r={56} fill="none" stroke="black" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={48} fill="none" stroke="black" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={30} fill="none" stroke="black" strokeWidth="1" />
        {rays.map((_, i) => {
          const angle = (i * 360) / rays.length
          const rad = (angle * Math.PI) / 180
          const x1 = cx + 31 * Math.cos(rad)
          const y1 = cy + 31 * Math.sin(rad)
          const x2 = cx + 47 * Math.cos(rad)
          const y2 = cy + 47 * Math.sin(rad)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth="0.75" />
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="7" fontWeight="700" fontFamily="Georgia, serif">
          SEAL OF
        </text>
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="7" fontWeight="700" fontFamily="Georgia, serif">
          ORIGINALITY
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="5" fontFamily="Georgia, serif">
          SAFRecords Univ.
        </text>
      </svg>
      <p className="text-[8px] font-mono mt-1 text-center leading-tight">
        VERIFY&nbsp;{code}
      </p>
    </div>
  )
}
