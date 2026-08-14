// Rule-based Reason-for-Status Explainer.
// Maps a request's status + missing/flagged fields to a plain-language
// reason and a concrete next step. This mirrors the backend's rule-based
// engine so the UI can show guidance instantly, before the network call
// resolves (see /api/explain/:id for the server version, which is also
// the seam where an AI Text Generation API could be swapped in).

const FIELD_LABELS = {
  studentId: 'Student ID',
  program: 'Program of study',
  termCompleted: 'Most recent completed term',
  purpose: 'Purpose of request',
  deliveryMethod: 'Delivery method',
  email: 'Contact email',
  holdBalance: 'Outstanding account balance',
  holdDiscipline: 'Disciplinary hold',
  holdAdvising: 'Missing advising sign-off',
}

export function explainLocally(request) {
  if (!request) return null
  const { status, missingFields = [], holds = [], reviewNote } = request

  if (status === 'approved') {
    return {
      headline: 'Your transcript has been approved.',
      detail:
        'The registrar verified your record and there are no outstanding holds. Your PDF is ready to download below.',
      nextSteps: ['Download the PDF from the request card.', 'Share the file directly, it carries a verifiable record ID.'],
      tone: 'positive',
    }
  }

  if (status === 'declined') {
    const holdText = holds.length
      ? `This is due to: ${holds.map((h) => FIELD_LABELS[h] || h).join(', ')}.`
      : reviewNote
      ? reviewNote
      : 'The registrar found an issue with this request that needs to be resolved first.'
    return {
      headline: 'Your request was declined.',
      detail: holdText,
      nextSteps: holds.includes('holdBalance')
        ? ['Clear your outstanding balance with Student Accounts.', 'Resubmit the request once your account shows a zero balance.']
        : holds.includes('holdDiscipline')
        ? ['Contact the Dean of Students office to resolve the disciplinary hold.', 'Resubmit once the office confirms the hold is lifted.']
        : ['Contact the Registrar\'s Office for the specific reason.', 'Correct the issue and submit a new request.'],
      tone: 'negative',
    }
  }

  // pending
  if (missingFields.length > 0) {
    return {
      headline: 'Your request is pending — some information is missing.',
      detail: `We still need: ${missingFields.map((f) => FIELD_LABELS[f] || f).join(', ')}.`,
      nextSteps: ['Open the request and complete the missing fields.', 'Resubmit — review typically takes 2–3 business days.'],
      tone: 'warning',
    }
  }

  if (holds.length > 0) {
    return {
      headline: 'Your request is pending review of an account hold.',
      detail: `We found a hold on your account: ${holds.map((h) => FIELD_LABELS[h] || h).join(', ')}. The registrar is confirming whether it blocks release.`,
      nextSteps: ['Check your account balance or advising status.', 'Resolving it before review speeds up approval.'],
      tone: 'warning',
    }
  }

  return {
    headline: 'Your request is in the queue.',
    detail: 'Everything looks complete. It is waiting for a registrar to review and approve it.',
    nextSteps: ['No action needed — average turnaround is 2–3 business days.', 'You will see the status update here automatically.'],
    tone: 'neutral',
  }
}
