// useAdminData.js — analytics feeds behind the admin dashboard.
// PostgreSQL feeds via the portal API (/api/portal/* — see src/lib/pgdb.js)
// + the learning server's live classroom state (/api/classroom/state via the
// Vite proxy on :5055).
import { ref } from 'vue'
import { pgSelect, pgStats, pgUpdate, pgUpsert } from '../../lib/pgdb.js'
import { hashPassword } from './schoolAuth.js'

async function jget(path, ms = 6000) {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), ms)
  try {
    const r = await fetch(path, { signal: ctl.signal, headers: { Accept: 'application/json' } })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return await r.json()
  } finally {
    clearTimeout(timer)
  }
}

const isMissing = (e) => e?.code === 'PGRST205' || /Could not find the table/i.test(e?.message || '')
const missingMsg = 'Database tables are missing — start the backend (api_server.py auto-applies backend/POSTGRES_SCHEMA.sql), then refresh.'

export function useAdminData() {
  // ---- Registration page (registration.vue -> students table) ----
  const registration = ref({ loading: true, error: '', total: 0, last30: 0, paid: 0, unpaid: 0, courses: [], locations: [], gender: [], tracks: [], countries: 0, latest: [], latestError: '' })

  async function loadRegistration() {
    registration.value.loading = true
    try {
      // Aggregates are computed inside PostgreSQL (COUNT/GROUP BY over
      // indexed columns) — this scales to any number of registrations,
      // where the old full-table download would grow linearly.
      const s = await pgStats()
      if (s.error) throw s.error
      const R = s.registration || {}
      registration.value = {
        loading: false, error: '',
        total: R.total || 0,
        last30: R.last30 || 0,
        paid: R.paid || 0,
        unpaid: R.unpaid || 0,
        courses: R.courses || [],
        locations: R.locations || [],
        gender: R.gender || [],
        tracks: R.tracks || [],
        countries: R.countries || 0,
        // Carry the roster across. This literal replaces the whole ref, so
        // omitting `latest` left reg.latest undefined for one render — the
        // template's `!reg.latest.length` then threw on every refresh. It is
        // re-fetched just below.
        latest: registration.value.latest,
        latestError: '',
      }
    } catch (e) {
      registration.value = { ...registration.value, loading: false, error: isMissing(e) ? missingMsg : e.message }
    }
    // Newest students — the stat cards above are aggregates, so this is the
    // only part of the feed that shows actual people. It is fetched inside
    // loadRegistration() on purpose: registration.vue inserts into this exact
    // `students` table, so the admin page's refresh timer (which calls
    // loadRegistration) makes a brand-new student appear on its own.
    try {
      const { data, error } = await pgSelect('students', {
        select: 'name,student_id,email,course_name,track,payment_status,gender,location,qualification,created_at',
        order: 'created_at', ascending: false, limit: 8,
      })
      if (error) throw error
      registration.value.latest = data || []
      registration.value.latestError = ''
    } catch (e) {
      registration.value.latest = []
      registration.value.latestError = isMissing(e) ? missingMsg : e.message
    }
  }

  // ---- Learning progress (studentdashboard.vue + boirsu.py records) ----
  const learning = ref({ loading: true, error: '', enrollments: 0, avgProgress: 0, completed: 0, attendanceRate: 0, avgQuiz: 0, quizzes: 0, quizBands: [], submitted: 0, graded: 0 })

  async function loadLearning() {
    learning.value.loading = true
    try {
      // Same SQL-aggregate feed — quiz bands arrive as counts, so the
      // dashboard no longer downloads every quiz/attendance/assignment row.
      const s = await pgStats()
      if (s.error) throw s.error
      const L = s.learning || {}
      learning.value = {
        loading: false, error: '',
        enrollments: L.enrollments || 0,
        avgProgress: L.avg_progress || 0,
        completed: L.completed || 0,
        attendanceRate: L.attendanceRate || 0,
        avgQuiz: L.avg_quiz || 0,
        quizzes: L.quizzes || 0,
        quizBands: [['0–49%', L.band0 || 0], ['50–69%', L.band1 || 0], ['70–89%', L.band2 || 0], ['90–100%', L.band3 || 0]],
        submitted: L.submitted || 0,
        graded: L.graded || 0,
      }
    } catch (e) {
      learning.value = { ...learning.value, loading: false, error: isMissing(e) ? missingMsg : e.message }
    }
  }

  // ---- AI learning system (courses table + api_server content) ----
  const ai = ref({ loading: true, error: '', courses: 0, aiCourses: 0, serverOnline: false, serverCourses: [], textbooks: 0 })

  async function loadAi() {
    ai.value.loading = true
    const out = { loading: false, error: '', courses: 0, aiCourses: 0, serverOnline: false, serverCourses: [], textbooks: 0 }
    try {
      const { data, error } = await pgSelect('courses', { select: 'id,ai,title' })
      if (error) throw error
      out.courses = (data || []).length
      out.aiCourses = (data || []).filter((c) => c.ai).length
      // Learning server (api_server.py on :5055, proxied through /api/ai).
      try {
        const s = await jget('/api/ai/status', 5000)
        out.serverOnline = !!(s && (s.success || s.status))
        const c = await jget('/api/ai/courses', 6000)
        const list = Array.isArray(c) ? c : (c && (c.courses || c.data)) || []
        out.serverCourses = list.slice(0, 8).map((x) => ({
          id: x.id || x.course_id,
          title: x.title || x.topic || x.id,
          sections: Array.isArray(x.sections) ? x.sections.length : (x.section_count ?? null),
        }))
        const t = await jget('/api/textbooks', 5000)
        const tl = Array.isArray(t) ? t : (t && (t.textbooks || t.data)) || []
        out.textbooks = tl.length
      } catch { /* learning server offline — database stats still shown */ }
      ai.value = out
    } catch (e) {
      ai.value = { ...out, error: isMissing(e) ? missingMsg : e.message }
    }
  }

  // ---- Live classroom (classroom/teacher -> /api/classroom/state) ----
  const classroom = ref({ loading: true, error: '', serverOnline: false, onlineNow: 0, roomsLive: 0, raised: 0, rooms: [] })
  let pollTimer = null

  async function loadClassroom() {
    classroom.value.loading = true
    const out = { loading: false, error: '', serverOnline: false, onlineNow: 0, roomsLive: 0, raised: 0, rooms: [] }
    try {
      const st = await jget('/api/ai/status', 4000).catch(() => null)
      out.serverOnline = !!(st && (st.success || st.status))
      if (out.serverOnline) {
        // Distinct cohort courses come from the SQL stats feed — no need to
        // download every student row just to list the course names.
        const s = await pgStats().catch(() => null)
        const courses = ((s && !s.error && s.registration) ? s.registration.cohortCourses : []).slice(0, 10)
        const rooms = await Promise.all(courses.map(async (course) => {
          try {
            const s = await jget(`/api/classroom/state?course=${encodeURIComponent(course)}`, 5000)
            const ppl = Array.isArray(s?.participants) ? s.participants : Object.values(s?.participants || {})
            return {
              course,
              online: ppl.length,
              teachers: ppl.filter((p) => p.role === 'teacher').length,
              raised: ppl.filter((p) => p.raised).length,
              sharing: ppl.filter((p) => p.sharing).length,
              chatOpen: !!s?.chat_open,
              lesson: !!s?.lesson,
            }
          } catch { return { course, online: -1, teachers: 0, raised: 0, sharing: 0, chatOpen: false, lesson: false } }
        }))
        out.rooms = rooms
        out.roomsLive = rooms.filter((r) => r.online > 0).length
        out.onlineNow = rooms.reduce((s2, r) => s2 + Math.max(r.online, 0), 0)
        out.raised = rooms.reduce((s2, r) => s2 + (r.raised || 0), 0)
      }
      classroom.value = out
    } catch (e) {
      classroom.value = { ...out, error: isMissing(e) ? missingMsg : e.message }
    }
  }

  function startPolling(ms = 20000) { stopPolling(); pollTimer = setInterval(loadClassroom, ms) }
  function stopPolling() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null } }

  // ---- Course school fees (admin-set prices -> course_fees table) ----
  const fees = ref({ loading: true, error: '', rows: [], candidates: [] })

  async function loadFees() {
    fees.value.loading = true
    try {
      const [f, s] = await Promise.all([
        pgSelect('course_fees', { select: 'course,amount,updated_at', order: 'course' }),
        pgStats(),
      ])
      if (f.error) throw f.error
      if (s.error) throw s.error
      const rows = f.data || []
      // Courses that exist in registrations but have no price yet — offered
      // as suggestions when adding a new fee (distinct list from SQL).
      const priced = new Set(rows.map((r) => r.course))
      const candidates = ((s.registration || {}).cohortCourses || [])
        .filter((c) => !priced.has(c))
        .sort()
      fees.value = { loading: false, error: '', rows, candidates }
    } catch (e) {
      fees.value = { ...fees.value, loading: false, error: isMissing(e) ? missingMsg : e.message }
    }
  }

  async function setFee(course, amount) {
    const n = Math.round(Number(amount))
    if (!course || !course.trim()) throw new Error('Enter the course name.')
    if (!n || n <= 0) throw new Error('Enter a positive amount in Naira.')
    const { error } = await pgUpsert(
      'course_fees',
      { course: course.trim(), amount: n, currency: 'NGN', updated_at: new Date().toISOString() },
      'course',  // course is the PRIMARY KEY of course_fees
    )
    if (error) throw error
    await loadFees()
  }

  // ---- Partner login credentials (same scheme as student logins) ----
  function validPartnerEmail(email) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((email || '').trim().toLowerCase())
  }

  async function makePartnerCreds(email, password) {
    const mail = (email || '').trim().toLowerCase()
    const pw = String(password || '')
    if (!validPartnerEmail(mail)) throw new Error('Enter a valid partner login email.')
    if (pw.length < 6) throw new Error('Partner password must be at least 6 characters.')
    const { saltHex, hashHex } = await hashPassword(pw)
    return { login_email: mail, password_salt: saltHex, password_hash: hashHex, password_set_at: new Date().toISOString() }
  }

  async function setPartnerLogin(partnerId, email, password) {
    const fields = await makePartnerCreds(email, password)
    const { error } = await pgUpdate('partners', fields, { partner_id: partnerId })
    if (error) {
      if (error.code === '23505' || /duplicate key/i.test(error.message || '')) {
        throw new Error('That login email is already used by another partner.')
      }
      throw error
    }
    await loadLists()
  }

  // Switch a partner between 'partner' (real — teacher management) and
  // 'parent' (read-only monitoring only). The caller refreshes its lists.
  async function setPartnerType(partnerId, type) {
    const { error } = await pgUpdate('partners', { partner_type: type }, { partner_id: partnerId })
    if (error) throw error
  }

  // ---- Partner fee agreements (sponsor-ID pricing) ------------------------
  // When a student registers with a partner's sponsor ID, an ACTIVE
  // agreement for their course overrides the base course_fees price.
  async function loadPartnerFees(sponsorId) {
    const { data, error } = await pgSelect('partner_fees', {
      select: 'id,sponsor_id,course,amount,active,updated_at',
      eq: { sponsor_id: sponsorId },
      order: 'course',
    })
    if (error) throw error
    return data || []
  }

  async function setPartnerFee(sponsorId, course, amount) {
    const n = Math.round(Number(amount))
    if (!course || !course.trim()) throw new Error('Enter the course name.')
    if (!n || n <= 0) throw new Error('Enter a positive amount in Naira.')
    const { error } = await pgUpsert(
      'partner_fees',
      { sponsor_id: sponsorId, course: course.trim(), amount: n, currency: 'NGN', active: true, updated_at: new Date().toISOString() },
      'sponsor_id,course',
    )
    if (error) throw error
  }

  // No DELETE anywhere — "removing" an agreement deactivates it
  // so the row stays for reference and the base course price applies again.
  async function removePartnerFee(feeId) {
    const { error } = await pgUpdate('partner_fees', { active: false }, { id: feeId })
    if (error) throw error
  }

  // ---- Teacher login credentials ------------------------------------------
  // A teacher login exists ONLY when an admin or partner creates the teacher,
  // so credentials are always minted here — never through self-signup.
  function validTeacherEmail(email) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((email || '').trim().toLowerCase())
  }

  async function makeTeacherCreds(email, password) {
    const mail = (email || '').trim().toLowerCase()
    const pw = String(password || '')
    if (!validTeacherEmail(mail)) throw new Error('Enter a valid teacher login email — this is how they sign in to the classroom.')
    if (pw.length < 6) throw new Error('Teacher password must be at least 6 characters.')
    const { saltHex, hashHex } = await hashPassword(pw)
    return { login_email: mail, password_salt: saltHex, password_hash: hashHex, password_set_at: new Date().toISOString(), session_token: null }
  }

  async function setTeacherLogin(teacherId, email, password) {
    const fields = await makeTeacherCreds(email, password)
    const { error } = await pgUpdate('teachers', fields, { teacher_id: teacherId })
    if (error) {
      if (error.code === '23505' || /duplicate key/i.test(error.message || '')) {
        throw new Error('That login email is already used by another teacher.')
      }
      throw error
    }
    await loadLists()
  }

  function loadAll() { loadRegistration(); loadLearning(); loadAi(); loadFees() }

  return { registration, learning, ai, classroom, fees, loadAll, loadRegistration, loadLearning, loadAi, loadClassroom, loadFees, setFee, makePartnerCreds, setPartnerLogin, makeTeacherCreds, setTeacherLogin, setPartnerType, loadPartnerFees, setPartnerFee, removePartnerFee, startPolling, stopPolling }
}
