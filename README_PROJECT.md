# SAFRecords — Academic Transcript Portal

A responsive, component-based transcript request system: students submit
requests and track their status, records staff review and approve/decline
them, and approved transcripts can be downloaded as a PDF.

This deliverable is split into two independent projects, matching a real
frontend/backend split:

```
transcript-portal/     React (Vite) frontend — UI, routing, PDF export
transcript-backend/    Express API + JSON file store — mock data source
```

## Quick start

Open two terminals.

**Terminal 1 — backend (port 4000):**
```bash
cd transcript-backend
npm install
npm start          # or: npm run dev (auto-reload with nodemon)
```

**Terminal 2 — frontend (port 5173):**
```bash
cd transcript-portal
npm install
npm run dev
```

Then open **http://localhost:5173**. The Vite dev server proxies all
`/api/*` calls to the backend on port 4000 (see `vite.config.js`), so no
extra CORS setup is needed in dev.

## Demo logins

- **Student:** enter one of the sample IDs shown on the login screen
  (`STU-1` through `STU-50`).
- **Records Office (admin):** passcode `REGISTRAR`.

## Feature tour

| Feature | Where |
|---|---|
| Request form for student data | Student dashboard → "New request" tab |
| Transcript status dashboard | Student dashboard → "My requests" tab |
| Admin approval interface | Admin dashboard → Pending / Approved / Declined / All tabs |
| Downloadable PDF transcript | "Download PDF" button on an approved request card (html2pdf.js) |
| Tabbed views for student/admin | Both dashboards use the shared `Tabs` component |
| Responsive dashboard design | Tailwind CSS, mobile-first layout throughout |
| Confirmation modals | Submitting a request, approving, and declining all confirm first |
| Reason-for-Status Explainer | "Why this status?" link on any request card |

## Reason-for-Status Explainer

Implemented with **both** options from the brief:

1. **Rule-based (default, always on)** — `transcript-backend/server.js`
   (`ruleBasedExplanation`) and the mirrored client-side copy in
   `transcript-portal/src/api/statusExplainer.js` map a request's status
   plus any missing fields / account holds to a plain-language reason and
   concrete next steps. This works with zero configuration.
2. **API-integrated (optional)** — `aiExplanation()` in `server.js` is the
   seam for a real AI Text Generation API. Set these environment variables
   before starting the backend to enable it:

   ```bash
   export AI_API_KEY=your-key-here
   export AI_API_URL=https://api.example.com/v1/messages
   export AI_MODEL=your-model-name   # optional
   ```

   If the variables are unset, or the API call fails for any reason, the
   backend automatically falls back to the rule-based explanation — the
   feature never breaks the demo. The "Re-check" button on a request's
   explainer panel calls `GET /api/explain/:id`, which is where this logic
   runs.

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router, Axios, html2pdf.js
- **Backend:** Node.js, Express, a flat `db.json` file as the mock data store
- **Design:** an "academic ledger" visual system — parchment background,
  ruled lines, ink/brass/seal-crimson palette, and a rotated rubber-stamp
  badge for status (see `transcript-portal/src/index.css`)

## API reference (backend)

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Liveness check |
| GET | `/api/students` | List sample students |
| GET | `/api/students/:studentId` | Get one student |
| GET | `/api/requests` | List requests (optional `?studentId=` / `?status=` filters) |
| GET | `/api/requests/:id` | Get one request |
| POST | `/api/requests` | Create a request |
| PATCH | `/api/requests/:id/status` | Approve/decline/reset a request's status |
| DELETE | `/api/requests/:id` | Remove a request |
| GET | `/api/explain/:id` | Reason-for-Status Explainer (rule-based or AI) |

## Notes

- Data persists to `transcript-backend/db.json` between restarts (it's a
  real file, not in-memory), so requests you create/approve during a demo
  will still be there next time you start the server.
- There's no real authentication — the student/admin "login" is a mock
  role-selection flow appropriate for a classroom project, not production use.
