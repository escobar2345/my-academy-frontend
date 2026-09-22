import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // 3001 (not 3000): another dev project (long2short Next.js) occupies
    // 3000 on this machine. Change back if that project is closed.
    port: 3001,
    open: true,
    proxy: {
      // Vite matches proxy keys in insertion order, so these specific
      // prefixes must stay ABOVE the catch-all '/api' below — otherwise
      // the 5001 target swallows every boi-rsu call.
      // api_server.py (port 5055) serves the AI learning bridge and the
      // student records that studentdashboard.vue reads.
      '/api/ai': { target: 'http://localhost:5055', changeOrigin: true, secure: false },
      '/api/stream': { target: 'http://localhost:5055', changeOrigin: true, secure: false },
      '/api/students': { target: 'http://localhost:5055', changeOrigin: true, secure: false },
      '/api/student': { target: 'http://localhost:5055', changeOrigin: true, secure: false },
      '/api/attendance': { target: 'http://localhost:5055', changeOrigin: true, secure: false },
      '/api/assignment': { target: 'http://localhost:5055', changeOrigin: true, secure: false },
      '/api/careers': { target: 'http://localhost:5055', changeOrigin: true, secure: false },
      '/api/roadmap': { target: 'http://localhost:5055', changeOrigin: true, secure: false },
      '/api/progress': { target: 'http://localhost:5055', changeOrigin: true, secure: false },

      // School portal PostgreSQL API — AdminPage / PartnerPage /
      // TeacherClassroomGate / registration.vue read + write through here
      // (pgdb.js in the browser). MUST stay above the catch-all.
      '/api/portal': { target: 'http://localhost:5055', changeOrigin: true, secure: false },

      // These prefixes must also stay ABOVE the catch-all '/api' below —
      // otherwise the request falls through to the 5001 target, which has no
      // handler for them (e.g. /api/paystack/verify 404s there and every
      // payment shows "Could not verify this payment").
      '/api/paystack': { target: 'http://localhost:5055', changeOrigin: true, secure: false },
      '/api/textbooks': { target: 'http://localhost:5055', changeOrigin: true, secure: false },
      '/api/library': { target: 'http://localhost:5055', changeOrigin: true, secure: false },
      '/api/classroom': { target: 'http://localhost:5055', changeOrigin: true, secure: false },

      // Partner authentication server (partner_auth.py on :5056).
      '/api/auth': { target: 'http://localhost:5056', changeOrigin: true, secure: false },
      '/api/timetable': { target: 'http://localhost:5055', changeOrigin: true, secure: false },
      '/api/start-ai-class': { target: 'http://localhost:5055', changeOrigin: true, secure: false },
      '/api/videos': { target: 'http://localhost:5055', changeOrigin: true, secure: false },

      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
