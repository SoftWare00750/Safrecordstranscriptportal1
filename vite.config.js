import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // This proxy targeted the old local Express server (transcript-backend,
    // port 4000) and is no longer used now that VITE_API_BASE_URL is always
    // set to the deployed Supabase Edge Function (see .env). Left in place
    // as a harmless fallback in case VITE_API_BASE_URL is ever unset again.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
