import { createClient } from '@supabase/supabase-js'

// Used for student sign-up / sign-in only. All transcript-request and
// student-record data still lives in the Express backend (see src/api/client.js) —
// Supabase here is purely the auth layer that gates access to /student.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase env vars are missing (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY). ' +
    'Student sign-up/sign-in will fail until these are set — see .env.example.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
