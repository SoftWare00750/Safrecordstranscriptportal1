import { createClient } from '@supabase/supabase-js'

// Used for student sign-up / sign-in only. All transcript-request and
// student-record data still lives in the Express backend (see src/api/client.js) —
// Supabase here is purely the auth layer that gates access to /student.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const CONFIG_ERROR =
  'Student sign-in is not configured yet. Set VITE_SUPABASE_URL and ' +
  'VITE_SUPABASE_PUBLISHABLE_KEY in your deployment environment (see .env.example).'

// createClient() throws synchronously if the URL/key are missing or malformed.
// Since this file runs at module-load time (imported by AuthContext, imported
// by App, imported by main.jsx), an uncaught throw here crashes the entire
// bundle before React ever mounts — the page goes blank except for plain CSS
// that isn't gated behind JS (e.g. the body's decorative ruled-line
// background). Everything else — admin login included — has nothing to do
// with Supabase, so a missing/bad key should never be able to take down the
// whole app. Fall back to a stub client that fails only when an auth method
// is actually called, with a clear error message instead of a blank screen.
function createSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn(CONFIG_ERROR)
    return createStubClient()
  }
  try {
    return createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err)
    return createStubClient()
  }
}

function createStubClient() {
  const error = { message: CONFIG_ERROR }
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error }),
      signUp: async () => ({ data: { user: null, session: null }, error }),
      signOut: async () => ({ error: null }),
    },
  }
}

export const supabase = createSupabaseClient()
