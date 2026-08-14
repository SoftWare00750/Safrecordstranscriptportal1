import { useRef, useState } from 'react'
import html2pdf from 'html2pdf.js'

export default function TranscriptPDF({ request }) {
  const printRef = useRef(null)
  const [generating, setGenerating] = useState(false)

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

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={generating}
        className="px-3 py-1.5 rounded bg-ink text-paper text-xs font-medium hover:bg-ink-light transition-colors disabled:opacity-50"
      >
        {generating ? 'Preparing PDF…' : 'Download PDF'}
      </button>

      {/* Off-screen printable transcript, captured by html2pdf */}
      <div className="fixed -left-[9999px] top-0" aria-hidden="true">
        <div ref={printRef} className="w-[7.5in] bg-white text-black p-10" style={{ fontFamily: 'Georgia, serif' }}>
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
            <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center text-[9px] font-bold uppercase text-center leading-tight rotate-[-8deg]">
              Official Seal
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
