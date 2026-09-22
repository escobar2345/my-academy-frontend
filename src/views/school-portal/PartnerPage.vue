<template>
  <div v-if="authState === 'checking'" class="p-login"><div class="p-login-card"><p>Checking your partner session…</p></div></div>
  <div v-else-if="authState === 'login'" class="p-login"><div class="p-login-card">
    <p class="kicker">BOIRSU SCHOOL / PARTNER SIGN-IN</p>
    <h1>{{ mode === 'parent' ? 'Parent access' : 'Partner access' }}</h1>
    <p class="muted small">{{ mode === 'parent' ? 'Enter the tracking number of the student you want to monitor — you will see that student\u2019s cohort and activity only.' : 'Sign in with the email and password generated for you by the admin.' }}</p>
    <div class="mode-switch">
      <button :class="{ active: mode === 'parent' }" @click="mode = 'parent'">Parent (tracking #)</button>
      <button :class="{ active: mode === 'partner' }" @click="mode = 'partner'">Partner (email)</button>
    </div>
    <form v-if="mode === 'parent'" @submit.prevent="signIn">
      <label>Student tracking number <input v-model="tracking" type="text" required placeholder="e.g. STU0001" style="text-transform:uppercase" /></label>
      <button type="submit" :disabled="busy">{{ busy ? 'Checking…' : 'View my child\u2019s progress' }}</button>
    </form>
    <form v-else @submit.prevent="signIn">
      <label>Email <input v-model="email" type="email" required autocomplete="username" placeholder="partner@company.com" /></label>
      <label>Password <input v-model="password" type="password" required autocomplete="current-password" placeholder="••••••••" /></label>
      <button type="submit" :disabled="busy">{{ busy ? 'Signing in…' : 'Sign in' }}</button>
    </form>
    <p v-if="msg" class="t-msg" :class="{ warn: !msg.ok }">{{ msg.text }}</p>
  </div></div>
  <main v-else class="partner-page"><header><div><p class="kicker">BOIRSU SCHOOL / PARTNER VIEW</p><h1>{{ isParent ? parentStudent?.name || 'Student progress' : 'Your impact, in view.' }}</h1><p class="muted">{{ isParent ? (parentStudent?.course_name || parentStudent?.career_path || 'Cohort activity') + ' — live from the school' : 'Read-only monitoring for students who registered with your sponsor ID.' }}</p></div><span class="read-only">{{ isParent ? 'PARENT VIEW' : 'PARTNER VIEW' }}</span><button class="p-signout" @click="signOut">Sign out</button></header><section class="identity"><span class="label">{{ isParent ? 'TRACKING NUMBER' : 'SPONSOR ID' }}</span><strong>{{ isParent ? (parentStudent?.student_id || sponsorId) : sponsorId }}</strong><button @click="copyId">{{ copied ? 'Copied' : 'Copy ID' }}</button><p>{{ isParent ? 'The tracking number of the student you are monitoring.' : 'Students enter this ID during registration. Students without it remain private to the school.' }}</p></section><!-- Sponsor-wide totals. A real partner (one sponsor ID, many students) sees
     these; a PARENT tracks a single student and must never see them — the
     tracking-number login is scoped to one student, so school-wide figures
     are not theirs to look at. A parent gets the snapshot below instead. -->
<section class="summary" v-if="!isParent"><article><span>Sponsored students</span><strong>42</strong></article><article><span>Active this month</span><strong>31</strong></article><article><span>Courses in progress</span><strong>17</strong></article></section>

<!-- PARENT SNAPSHOT — only the tracked student's own numbers: CGPA, grade,
     course length and how far through the course they are. -->
<section v-if="isParent" class="summary summary--parent">
  <article><span>CGPA</span><strong>{{ prog.cgpa === null ? '—' : prog.cgpa.toFixed(2) }}</strong><em class="sub">out of {{ prog.cgpaScale.toFixed(2) }}</em></article>
  <article><span>Overall grade</span><strong>{{ prog.grade }}</strong><em class="sub">{{ prog.quizzesTaken }} quizzes · avg {{ prog.quizAverage }}%</em></article>
  <article><span>Course length</span><strong>{{ prog.durationText }}</strong><em class="sub">{{ prog.startedOn ? 'started ' + prog.startedOn : (parentStudent?.course_name || parentStudent?.career_path || 'enrolled') }}</em></article>
  <article><span>Progress</span><strong>{{ prog.percent }}%</strong><em class="sub">{{ prog.totalMonths ? 'month ' + prog.currentMonth + ' of ' + prog.totalMonths : 'course length not set' }}</em></article>
</section>
<!-- HOW FAR THEY HAVE COME — the tracked student's own position in the course:
     progress through the months, attendance, quizzes and assignments. -->
<section class="p-mon" v-if="isParent">
  <div class="section-head">
    <div><p class="kicker">HOW FAR THEY HAVE COME</p><h2>{{ parentStudent?.name || 'Your student' }}'s progress</h2></div>
    <span class="muted">{{ prog.loading ? 'loading…' : (prog.totalMonths ? 'month ' + prog.currentMonth + ' of ' + prog.totalMonths + ' · ' + prog.percent + '% through the course' : 'course length not set') }}</span>
  </div>
  <p v-if="prog.error" class="t-msg warn">{{ prog.error }}</p>
  <div class="mon-grid">
    <article class="mon-card">
      <b>Course progress</b><small>{{ prog.percent }}% of {{ prog.durationText }}</small>
      <div class="mon-bars">
        <div class="mon-bar"><span>Progress</span><i><em :style="{ width: prog.percent + '%' }"></em></i><b>{{ prog.percent }}%</b></div>
        <div class="mon-bar"><span>Attendance</span><i><em :style="{ width: prog.attendanceRate + '%' }"></em></i><b>{{ prog.attendanceRate }}%</b></div>
        <div class="mon-line"><span>Classes</span><b>{{ prog.classesAttended }} attended · {{ prog.classesMissed }} missed</b></div>
        <div class="mon-line"><span>Quizzes</span><b>{{ prog.quizzesTaken }} taken · avg {{ prog.quizAverage }}%</b></div>
        <div class="mon-line"><span>Assignments</span><b>{{ prog.assignmentsSubmitted }} submitted · avg {{ prog.assignmentAverage }}%</b></div>
      </div>
    </article>
  </div>
</section>
<!-- GRADES — one row per topic quizzed, with the letter grade and the CGPA the
     school derives from those letters (4.00 scale). -->
<section class="p-mon" v-if="isParent && prog.courses.length">
  <div class="section-head">
    <div><p class="kicker">GRADES</p><h2>{{ parentStudent?.name || 'Your student' }}'s grades</h2></div>
    <span class="muted">CGPA {{ prog.cgpa === null ? '—' : prog.cgpa.toFixed(2) }} / {{ prog.cgpaScale.toFixed(2) }} · {{ prog.courses.length }} topics graded</span>
  </div>
  <table class="grade-table">
    <thead><tr><th>Code</th><th>Topic</th><th>Attempts</th><th>Score</th><th>Grade</th></tr></thead>
    <tbody>
      <tr v-for="(r, i) in prog.courses" :key="i">
        <td class="g-code">{{ r[0] }}</td>
        <td>{{ r[1] }}</td>
        <td>{{ r[2] }}</td>
        <td>{{ r[3] }}%</td>
        <td><b :class="'g-' + String(r[4]).toLowerCase()">{{ r[4] }}</b></td>
      </tr>
    </tbody>
  </table>
</section>
<!-- ROADMAP — the course broken into its months. Months before the student's
     current month are done, the current one is in progress. -->
<section class="p-mon" v-if="isParent">
  <div class="section-head">
    <div><p class="kicker">ROADMAP</p><h2>What {{ parentStudent?.name || 'your student' }} will cover</h2></div>
    <span class="muted">{{ prog.totalMonths ? prog.monthsDone + ' of ' + prog.totalMonths + ' months complete' : 'roadmap not set' }}</span>
  </div>
  <p v-if="!prog.roadmap.length" class="muted small">The roadmap for this course has not been published yet.</p>
  <div v-else class="road-steps">
    <article class="road-step" v-for="m in prog.roadmap" :key="m.month" :class="m.status">
      <span class="road-dot" aria-hidden="true"></span>
      <div>
        <b>{{ m.short }} — {{ m.title }}</b>
        <small v-if="m.tasks.length">{{ m.tasks.join(' · ') }}</small>
        <small v-else>Details to be published.</small>
      </div>
      <em class="road-flag">{{ m.status === 'done' ? 'Done' : (m.status === 'now' ? 'In progress' : 'Upcoming') }}</em>
    </article>
  </div>
</section>
<section class="p-mon" v-if="isParent">
<div class="section-head"><div><p class="kicker">MY CHILD'S COHORT</p><h2>Activity for {{ parentStudent?.name }}</h2></div><span class="muted">{{ (parentActivity?.quizzes || []).length }} quizzes · {{ (parentActivity?.attendance || []).length }} classes · {{ (parentActivity?.assignments || []).length }} assignments</span></div>
<div v-if="parentTeaching.teaching.length" class="p-mon" style="margin-top:18px">
<div class="section-head"><div><p class="kicker">WHAT'S BEING TAUGHT</p><h2>Teacher &amp; classroom status</h2></div><span class="muted">{{ parentTeaching.serverOnline ? 'classroom server online' : 'classroom server offline' }}</span></div>
<div class="act-row" v-for="t in parentTeaching.teaching" :key="t.course"><span class="act-kind">🏫</span><span class="act-text"><b>{{ t.course }}</b> — {{ t.lesson ? 'lesson published' : 'no lesson published yet' }} · {{ t.teacherIn ? 'teacher in the room' : 'teacher not in the room' }} · chat {{ t.chatOpen ? 'open' : 'closed' }}</span><small>{{ t.online }} online</small></div>
</div>
<div class="act-row" v-for="(a, i) in parentActivity" :key="i"><span class="act-kind">{{ a.kind === 'quiz' ? '📝' : a.kind === 'assignment' ? '📤' : (a.kind === 'in' ? '🟢' : '⚪') }}</span><span class="act-text">{{ a.text }}</span><small>{{ a.when ? new Date(a.when).toLocaleDateString() : '' }}</small></div>
<p v-if="!parentActivity.length" class="muted small">No activity recorded yet for this student.</p>
</section>
<section class="p-mon" v-if="!isParent">
<div class="section-head"><div><p class="kicker">STUDENT LEARNING PROGRESS</p><h2>Your sponsored students</h2></div><span class="muted">{{ mon.students.length }} students · live from the school database</span></div>
<p v-if="mon.error" class="t-msg warn">{{ mon.error }}</p>
<p v-else-if="!mon.students.length && !mon.loading" class="muted small">No students are registered with your sponsor ID yet — students type it during registration.</p>
<div class="mon-grid" v-else>
<article class="mon-card" v-for="s in mon.students" :key="s.name">
  <b>{{ s.name }}</b><small>{{ s.course }} · {{ s.paid ? 'fees paid' : 'fees pending' }}</small>
  <div class="mon-bars">
    <div class="mon-bar"><span>Progress</span><i><em :style="{ width: s.progress + '%' }"></em></i><b>{{ s.progress }}%</b></div>
    <div class="mon-bar"><span>Attendance</span><i><em :style="{ width: s.attendance + '%' }"></em></i><b>{{ s.attendance }}%</b></div>
    <div class="mon-line"><span>Quizzes</span><b>{{ s.quizzes }} taken · avg {{ s.avgQuiz }}%</b></div>
    <div class="mon-line"><span>Assignments</span><b>{{ s.assignments }} submitted</b></div>
  </div>
</article>
</div>
</section>
<section class="p-books" v-if="!isParent">
<div class="section-head"><div><p class="kicker">LIBRARY PDFS</p><h2>Textbook prices &amp; access</h2></div><span class="muted">{{ books.rows.length }} PDF textbooks · live from the school library</span></div>
<p class="muted small">Agree the price of any textbook in the student library (0 = free) and lock it <b>read-only</b> — students can open and read the book in the viewer, but the download button is removed and the server refuses file downloads. Amounts are in Naira.</p>
<p v-if="books.loading" class="muted small">Loading textbooks…</p>
<div class="book-row" v-for="b in books.rows" :key="b.id">
  <span class="act-kind">📘</span>
  <span class="act-text"><b>{{ b.title }}</b><small>{{ b.course || 'general' }} · {{ b.pages }}p · {{ b.size }}</small></span>
  <input class="book-price" type="number" min="0" step="500" v-model.number="b.price" title="Price in Naira (0 = free)" />
  <label class="book-ro"><input type="checkbox" v-model="b.read_only" /><span>{{ b.read_only ? '🔒 read-only' : 'downloadable' }}</span></label>
  <button class="p-save" :disabled="bookBusyId === b.id" @click="saveBook(b)">{{ bookBusyId === b.id ? '…' : 'Save' }}</button>
</div>
<p v-if="!books.rows.length && !books.loading" class="muted small">No PDF textbooks uploaded yet — they appear here as soon as a teacher publishes one in class.</p>
<p v-if="bookMsg" class="t-msg" :class="{ warn: !bookMsg.ok }">{{ bookMsg.text }}</p>
<p v-if="books.error" class="t-msg warn">{{ books.error }}</p>
</section>
<section class="p-mon" v-if="mon.activity.length">
<div class="section-head"><div><p class="kicker">RECENT ACTIVITY</p><h2>What your students have been doing</h2></div></div>
<div class="act-row" v-for="(a, i) in mon.activity" :key="i"><span class="act-kind">{{ a.kind === 'quiz' ? '📝' : a.kind === 'assignment' ? '📤' : (a.kind === 'in' ? '🟢' : '⚪') }}</span><span class="act-text">{{ a.text }}</span><small>{{ a.when ? new Date(a.when).toLocaleDateString() : '' }}</small></div>
</section>
<!-- Cohort-wide classroom status is partner-only: a parent already gets this for
     the one cohort their student belongs to (inside MY CHILD'S COHORT above). -->
<section class="p-mon" v-if="!isParent">
<div class="section-head"><div><p class="kicker">WHAT'S BEING TAUGHT</p><h2>Teacher &amp; classroom status</h2></div><span class="muted">{{ mon.serverOnline ? 'classroom server online' : 'classroom server offline' }}</span></div>
<p v-if="!mon.teaching.length && !mon.loading" class="muted small">No cohorts to follow yet.</p>
<div class="act-row" v-for="t in mon.teaching" :key="t.course"><span class="act-kind">🏫</span><span class="act-text"><b>{{ t.course }}</b> — {{ t.lesson ? 'lesson published' : 'no lesson published yet' }} · {{ t.teacherIn ? 'teacher in the room' : 'teacher not in the room' }} · chat {{ t.chatOpen ? 'open' : 'closed' }}</span><small>{{ t.online }} online</small></div>
<div class="act-row" v-for="(t, i) in mon.textbooks" :key="'tb' + i"><span class="act-kind">📘</span><span class="act-text">PDF textbook available: <b>{{ t }}</b></span></div>
</section><section class="p-teachers" v-if="canManageTeachers">
<div class="section-head"><div><p class="kicker">TEACHING TEAM</p><h2>Create & remove teacher accounts</h2></div><span class="muted">{{ teachers.length }} active</span></div>
<p class="muted small">A teacher account is the only way to access /classroom/teacher — you create the login here, and the teacher signs in with the email and password you set. One device per teacher: a newer sign-in signs out the older one.</p>
<form class="t-form" @submit.prevent="addTeacher">
  <input v-model="teachForm.name" placeholder="Full name *" required />
  <input v-model="teachForm.loginEmail" type="email" placeholder="Login email *" required />
  <input v-model="teachForm.password" type="password" placeholder="Password (min 6) *" required minlength="6" />
  <input v-model="teachForm.specialty" placeholder="Specialty" />
  <button type="submit" :disabled="teachBusy">{{ teachBusy ? 'Creating…' : '+ Create teacher account' }}</button>
</form>
<p v-if="teachMsg" class="t-msg" :class="{ warn: !teachMsg.ok }">{{ teachMsg.text }}</p>
<div class="t-row" v-for="t in teachers" :key="t.teacher_id">
  <span class="avatar">{{ initials(t.name) }}</span>
  <span class="rec"><b>{{ t.name }}</b><small>{{ t.login_email || 'no login' }} · {{ t.specialty || 'general' }}</small></span>
  <button class="t-remove" :disabled="removingT[t.teacher_id]" @click="removeTeacher(t)">{{ removingT[t.teacher_id] ? '…' : 'Remove' }}</button>
</div>
<p v-if="!teachers.length && !loadingTeachers" class="muted small">No active teachers yet — create the first one above.</p>
</section><footer>Partner access is limited to this sponsor ID. Contact an admin for account or student changes.</footer></main>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { hashPassword } from './schoolAuth.js'
import { pgInsert, pgSelect, pgUpdate } from '../../lib/pgdb.js'
import { courseWeeks } from '../../constants/courses.js'

const authState = ref('checking') // checking | login | active
const mode = ref('parent') // 'parent' (tracking number) | 'partner' (email+password)
const tracking = ref('')
const email = ref('')
const password = ref('')
const busy = ref(false)
const msg = ref(null)
const partner = ref(null)

// The sponsor ID shown here is the real one on the signed-in partner's row.
const sponsorId = computed(() => partner.value?.sponsor_id || '—')
const copied = ref(false)
function copyId() { copied.value = true; navigator.clipboard?.writeText(sponsorId.value) }

// Partner type: 'parent' = read-only monitoring only (no teacher
// management); 'partner' = real partner (everything, incl. teaching team).
const isParent = computed(() => (partner.value?.partner_type || 'partner') === 'parent')
const canManageTeachers = computed(() => !isParent.value)

const LS_KEY = 'boi_partner_session'

// The partner page can be reached in two ways:
//   ?s=TRACK    -> parent view locked to the student whose tracking number
//                  was typed (only that student's cohort/activity loads).
//   ?s=PARTNER  -> real partner dashboard (full sponsor + teacher mgmt).
const urlParams = new URLSearchParams(window.location.search)
const requestedMode = urlParams.get('s') === 'PARTNER' ? 'partner' : 'parent'

onMounted(async () => {
  mode.value = requestedMode
  if (mode.value === 'partner') {
    // Restore a real-partner session from localStorage if one exists.
    try {
      const raw = JSON.parse(localStorage.getItem('boi_partner_session') || 'null')
      if (raw?.partner_id) {
        const { data, error } = await pgSelect('partners', {
          select: 'partner_id,org_name,contact_person,email,login_email,sponsor_id,status,partner_type',
          eq: { partner_id: raw.partner_id },
          single: true,
        })
        if (!error && data && data.status === 'active') {
          partner.value = data
          authState.value = 'active'
          if (!isParent.value) await Promise.all([loadTeachers(), loadBooks()])
          await loadMonitoring()
          return
        }
      }
    } catch { /* fall through to the sign-in card */ }
    authState.value = 'login'
  } else {
    // Parent launch: if a tracking number is in the query, try it directly.
    const track = urlParams.get('track')
    if (track) { tracking.value = track; signIn() } else { authState.value = 'login' }
  }
})

async function callAuth(path, body) {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const j = await r.json().catch(() => null)
  if (!r.ok) throw new Error(j?.error || 'Authentication failed.')
  return j
}

async function signIn() {
  busy.value = true
  msg.value = null
  try {
    if (mode.value === 'parent') {
      const res = await callAuth('/api/auth/parent', { tracking_number: tracking.value })
      partner.value = {
        // Parent view: no partner row — the "student" IS the identity.
        partner_id: null,
        org_name: res.student?.name || 'Parent',
        contact_person: '',
        email: '',
        login_email: '',
        sponsor_id: res.student?.sponsor_id || '',
        partner_type: 'parent',
      }
      parentStudent.value = res.student
      parentActivity.value = mapParentActivity(res.activity)
      localStorage.removeItem('boi_partner_session')
      authState.value = 'active'
      // Both read the tracked student only. The progress panel needs the quiz
      // records from the login response, so it runs after parentActivity is set.
      await Promise.all([loadParentTeaching(), loadParentProgress()])
    } else {
      const res = await callAuth('/api/auth/partner', { email: email.value, password: password.value })
      localStorage.setItem('boi_partner_session', JSON.stringify({ partner_id: res.partner.partner_id }))
      partner.value = res.partner
      authState.value = 'active'
      applyPartnerData(res)
    }
  } catch (e) {
    msg.value = { ok: false, text: e.message || 'Sign-in failed.' }
  } finally {
    busy.value = false
  }
}

function signOut() {
  localStorage.removeItem('boi_partner_session')
  partner.value = null
  parentStudent.value = null
  parentActivity.value = { quizzes: [], attendance: [], assignments: [] }
  // Drop the parent snapshot too, so a second parent's login never flashes the
  // previous student's CGPA or roadmap.
  prog.value = {
    loading: false, error: '',
    cgpa: null, cgpaScale: CGPA_SCALE, grade: 'N/A',
    currentMonth: 1, totalMonths: 0, durationText: 'duration not set',
    percent: 0, monthsDone: 0,
    classesAttended: 0, classesMissed: 0, attendanceRate: 0,
    quizzesTaken: 0, quizAverage: 0, assignmentsSubmitted: 0, assignmentAverage: 0,
    startedOn: '', courses: [], roadmap: [],
  }
  authState.value = 'login'
}

// ---- Parent view: the ONE tracked student -------------------------------
// A parent signs in with a student tracking number, so everything on this page
// must describe that single student and nothing else. No sponsor-wide totals,
// no roster: CGPA, grade, course length, how far they have come and the
// roadmap. Read from the same school API the dashboard uses, never invented.
const LEARNING_API = '/api'
const CGPA_SCALE = 4.0

const prog = ref({
  loading: false,
  error: '',
  // The tracked student's own numbers only.
  cgpa: null, cgpaScale: CGPA_SCALE, grade: 'N/A',
  currentMonth: 1, totalMonths: 0, durationText: 'duration not set',
  percent: 0, monthsDone: 0,
  classesAttended: 0, classesMissed: 0, attendanceRate: 0,
  quizzesTaken: 0, quizAverage: 0, assignmentsSubmitted: 0, assignmentAverage: 0,
  startedOn: '',
  courses: [],   // grade rows: [code, topic, attempts, score, grade]
  roadmap: [],   // [{ month, short, title, tasks[], status }]
})

async function getJson(path) {
  const r = await fetch(LEARNING_API + path)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

// The roadmap for a student's course. A student's stored career path is the
// slug registration derived from their course name, so try that first, then the
// slugified course name, then a title match against the published careers list.
// Returns { topics, months } — empty when the school has not published a
// roadmap for this course (the page then says so rather than guessing).
async function resolveRoadmap(careerPath, courseName) {
  const slugify = (s) => String(s || '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  for (const slug of [careerPath, slugify(courseName)]) {
    if (!slug) continue
    try {
      const res = await getJson(`/roadmap/${encodeURIComponent(slug)}`)
      if (res?.success && (res.topics || []).length) return { topics: res.topics, months: res.topics.length }
    } catch { /* try the next candidate */ }
  }
  try {
    const res = await getJson('/careers')
    const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
    const want = norm(courseName)
    const hit = (res?.careers || []).find((c) => c.slug === careerPath || norm(c.title) === want)
    if (hit) {
      const rm = await getJson(`/roadmap/${encodeURIComponent(hit.slug)}`)
      if (rm?.success) return { topics: rm.topics || [], months: hit.months || (rm.topics || []).length }
    }
  } catch { /* no roadmap published */ }
  return { topics: [], months: 0 }
}

// Build the tracked student's progress from the school's own records. Every
// number is either the student's row in PostgreSQL (course length, classes,
// averages) or their live record on the learning server (CGPA, grade rows,
// quiz/assignment history). Nothing is hard-coded, and nothing from another
// student ever enters this object.
async function loadParentProgress() {
  const student = parentStudent.value
  if (!student?.student_id) return
  prog.value = { ...prog.value, loading: true, error: '' }

  // The registered record: course length + attendance/score counters.
  let portal = null
  try {
    const { data } = await pgSelect('students', {
      select: 'student_id,course_name,career_path,duration_months,current_month,current_topic_index,classes_attended,classes_missed,total_classes,assignments_submitted,avg_quiz_score,avg_assignment_score,overall_grade,enrolled_date',
      eq: { student_id: student.student_id },
      single: true,
    })
    portal = data || null
  } catch { /* fall back to the login payload below */ }

  // Live record — the same endpoint the student dashboard reads, so a parent and
  // their child always see identical figures. Optional: if the learning server
  // has no record yet we still show what the tracking-number login returned.
  let live = null
  try {
    const res = await getJson(`/student/${encodeURIComponent(student.student_id)}`)
    if (res?.success) live = res.student
  } catch { /* server offline — portal values are used instead */ }

  const careerPath = student.career_path || portal?.career_path || live?.career_path || ''
  const courseName = student.course_name || portal?.course_name || live?.course_name || ''

  // The roadmap doubles as the course outline AND the fallback for its length,
  // so it is resolved before any progress maths runs.
  const { topics: roadmapTopics, months: roadmapMonths } = await resolveRoadmap(careerPath, courseName)

  // Course length — "how long the course will take". The registered duration
  // wins, then the roadmap's own month count, then the catalog's published week
  // count (registration never persisted a duration, so for courses without a
  // roadmap the catalog is the school's only real figure). Progress is measured
  // in months, so catalogue weeks are converted for that maths only.
  const registeredMonths = Number(portal?.duration_months || 0)
  const weeks = courseWeeks(courseName)
  const totalMonths = registeredMonths || roadmapMonths || (weeks ? Math.max(1, Math.round(weeks / 4)) : 0)
  // Keep the school's own wording: weeks stay weeks when that is what we know.
  const durationText = (registeredMonths || roadmapMonths)
    ? `${totalMonths} month${totalMonths === 1 ? '' : 's'}`
    : (weeks ? `${weeks} week${weeks === 1 ? '' : 's'}` : 'duration not set')

  // How far they have come: months finished / months in the course.
  const currentMonth = Number(portal?.current_month || live?.current_month || student.current_month || 1)
  const monthsDone = totalMonths ? Math.max(0, Math.min(currentMonth - 1, totalMonths)) : 0
  const percent = totalMonths ? Math.round((monthsDone / totalMonths) * 100) : 0

  const attended = Number(portal?.classes_attended ?? live?.classes_attended ?? 0)
  const missed = Number(portal?.classes_missed ?? live?.classes_missed ?? 0)
  const totalClasses = Number(portal?.total_classes || live?.total_classes || 0)
  const attendanceRate = Math.round(Number(
    live?.attendance_rate ?? (totalClasses ? (attended / totalClasses) * 100 : 0),
  ))

  // Grade rows are the live per-topic rows; CGPA stays "—" until real quizzes
  // exist, so a new student never reads as a failing 0.00 on a 4.00 scale.
  const courses = Array.isArray(live?.courses) ? live.courses : []
  const quizzesTaken = Number(live?.quizzes_taken ?? parentActivity.value.quizzes.length ?? 0)
  const cgpaScale = Number(live?.cgpa_scale || CGPA_SCALE)
  const cgpa = quizzesTaken > 0 && live?.cgpa != null ? Number(live.cgpa) : null

  // Roadmap months: before the current month = done, the current one = in
  // progress, everything after = upcoming.
  const roadmap = roadmapTopics.map((t) => {
    const month = Number(t.month || 0)
    return {
      month,
      short: t.short || `Month ${month}`,
      title: t.title || '',
      tasks: t.tasks || [],
      status: month < currentMonth ? 'done' : (month === currentMonth ? 'now' : 'upcoming'),
    }
  })

  // Say so plainly when neither source answered, rather than letting zeros read
  // as "this student has done nothing".
  const error = (!portal && !live)
    ? 'School records are unreachable right now — these figures may be incomplete.'
    : ''

  prog.value = {
    loading: false,
    error,
    cgpa,
    cgpaScale,
    grade: live?.overall_grade || portal?.overall_grade || student.overall_grade || 'N/A',
    currentMonth,
    totalMonths,
    durationText,
    percent,
    monthsDone,
    classesAttended: attended,
    classesMissed: missed,
    attendanceRate: Math.max(0, Math.min(100, attendanceRate)),
    quizzesTaken,
    quizAverage: Math.round(Number(live?.avg_quiz_score ?? portal?.avg_quiz_score ?? 0)),
    assignmentsSubmitted: Number(portal?.assignments_submitted ?? parentActivity.value.assignments.length ?? 0),
    assignmentAverage: Math.round(Number(portal?.avg_assignment_score ?? 0)),
    startedOn: portal?.enrolled_date ? String(portal.enrolled_date).slice(0, 10) : '',
    courses,
    roadmap,
  }
}

// Both partner types see this; parent partners see ONLY this. Everything is
// keyed to the students registered with this partner's sponsor ID.
const mon = ref({ loading: false, error: '', students: [], activity: [], teaching: [], textbooks: [], serverOnline: false })

async function loadMonitoring() {
  if (!partner.value) return
  mon.value.loading = true
  mon.value.error = ''
  try {
    // Phase 1: this partner's students only (small, filtered in SQL).
    const st = await pgSelect('students', {
      select: 'student_id,name,course_name,career_path,payment_status',
      eq: { sponsor_id: partner.value.sponsor_id },
      limit: 20000,
    })
    if (st.error) throw st.error
    const list = st.data || []
    const idList = list.map((s) => s.student_id)
    // Phase 2: activity records scoped SERVER-SIDE with IN (student ids) —
    // the partner page never downloads the whole school's records.
    const scoped = { in: { student_id: idList }, limit: 20000 }
    const [sc, qz, at, asg] = idList.length
      ? await Promise.all([
          pgSelect('student_courses', { select: 'student_id,progress,completed_at', ...scoped }),
          pgSelect('quiz_records', { select: 'student_id,topic,percentage,taken_on', ...scoped }),
          pgSelect('attendance_records', { select: 'student_id,attended,recorded_on', ...scoped }),
          pgSelect('assignment_records', { select: 'student_id,title,score,submitted_on', ...scoped }),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }]
    for (const r of [sc, qz, at, asg]) if (r.error) throw r.error
    const ids = new Set(idList)
    const mine = (rows) => rows.filter((r) => ids.has(r.student_id))
    const scM = mine(sc.data || []), qzM = mine(qz.data || []), atM = mine(at.data || []), asM = mine(asg.data || [])
    const avg = (arr, pick) => arr.length ? Math.round(arr.reduce((s, x) => s + (Number(pick(x)) || 0), 0) / arr.length) : 0
    const rows = list.map((s) => {
      const qs = qzM.filter((r) => r.student_id === s.student_id)
      const ats = atM.filter((r) => r.student_id === s.student_id)
      return {
        name: s.name,
        course: s.course_name || s.career_path || '—',
        progress: avg(scM.filter((r) => r.student_id === s.student_id), (c) => c.progress),
        attendance: ats.length ? Math.round((ats.filter((a) => a.attended).length / ats.length) * 100) : 0,
        quizzes: qs.length,
        avgQuiz: avg(qs, (q) => q.percentage),
        assignments: asM.filter((r) => r.student_id === s.student_id && r.submitted_on).length,
        paid: (s.payment_status || '').toLowerCase() === 'paid',
      }
    }).sort((a, b) => b.progress - a.progress)
    const nameOf = (id) => (list.find((s) => s.student_id === id) || {}).name || 'A student'
    const activity = [
      ...qzM.map((q) => ({ when: q.taken_on, kind: 'quiz', text: `${nameOf(q.student_id)} scored ${Math.round(Number(q.percentage) || 0)}% on the "${q.topic || 'class'}" quiz` })),
      ...asM.filter((a) => a.submitted_on).map((a) => ({ when: a.submitted_on, kind: 'assignment', text: `${nameOf(a.student_id)} submitted "${a.title || 'an assignment'}"${a.score !== null && a.score !== undefined ? ' — scored ' + a.score : ''}` })),
      ...atM.map((a) => ({ when: a.recorded_on, kind: a.attended ? 'in' : 'out', text: `${nameOf(a.student_id)} ${a.attended ? 'attended' : 'missed'} a live class` })),
    ].filter((a) => a.when).sort((a, b) => new Date(b.when) - new Date(a.when)).slice(0, 8)
    // What the teacher is teaching: live room status per cohort + textbooks.
    const courses = [...new Set(list.map((s) => (s.course_name || s.career_path || '').trim()).filter(Boolean))].slice(0, 6)
    const server = await fetch('/api/ai/status').then((r) => r.ok).catch(() => false)
    const teaching = await Promise.all(courses.map(async (course) => {
      let lesson = false, teacherIn = false, online = 0, chatOpen = false
      if (server) {
        try {
          const s = await fetch(`/api/classroom/state?course=${encodeURIComponent(course)}`).then((r) => r.json())
          const ppl = Array.isArray(s?.participants) ? s.participants : Object.values(s?.participants || {})
          lesson = !!s?.lesson
          teacherIn = ppl.some((p) => p.role === 'teacher')
          online = ppl.length
          chatOpen = !!s?.chat_open
        } catch { /* room idle / server offline */ }
      }
      return { course, lesson, teacherIn, online, chatOpen }
    }))
    let textbooks = []
    if (server) {
      try {
        const t = await fetch('/api/textbooks').then((r) => r.json())
        const tl = Array.isArray(t) ? t : (t && (t.textbooks || t.data)) || []
        textbooks = tl.slice(0, 6).map((x) => x.title || x.name || x.id).filter(Boolean)
      } catch { /* offline */ }
    }
    mon.value = { loading: false, error: '', students: rows, activity, teaching, textbooks, serverOnline: server }
  } catch (e) {
    mon.value = { ...mon.value, loading: false, error: /Could not find the table/i.test(e.message || '') ? 'Database tables are missing — start the backend (api_server.py auto-applies backend/POSTGRES_SCHEMA.sql), then refresh.' : (e.message || 'Could not load monitoring data.') }
  }
}

// ---- Parent view (single student, tracking-number login) ----------------
const parentStudent = ref(null)
const parentActivity = ref({ quizzes: [], attendance: [], assignments: [] })
const parentTeaching = ref({ loading: false, teaching: [], textbooks: [] })

function mapParentActivity(activity) {
  const rows = []
  for (const q of (activity?.quizzes || [])) {
    rows.push({ when: q.taken_on, kind: 'quiz', text: `Scored ${Math.round(Number(q.percentage) || 0)}% on the "${q.topic || 'class'}" quiz` })
  }
  for (const a of (activity?.assignments || [])) {
    rows.push({ when: a.submitted_on, kind: 'assignment', text: `Submitted "${a.title || 'an assignment'}"${a.score !== null && a.score !== undefined ? ' — scored ' + a.score : ''}` })
  }
  for (const a of (activity?.attendance || [])) {
    rows.push({ when: a.recorded_on, kind: a.attended ? 'in' : 'out', text: a.attended ? 'Attended a live class' : 'Missed a live class' })
  }
  return rows.filter((r) => r.when).sort((a, b) => new Date(b.when) - new Date(a.when))
}

async function loadParentTeaching() {
  if (!parentStudent.value) return
  parentTeaching.value.loading = true
  const courses = [parentStudent.value.course_name || parentStudent.value.career_path || ''].filter(Boolean)
  const server = await fetch('/api/ai/status').then((r) => r.ok).catch(() => false)
  const teaching = await Promise.all(courses.map(async (course) => {
    let lesson = false, teacherIn = false, online = 0, chatOpen = false
    if (server) {
      try {
        const s = await fetch(`/api/classroom/state?course=${encodeURIComponent(course)}`).then((r) => r.json())
        const ppl = Array.isArray(s?.participants) ? s.participants : Object.values(s?.participants || {})
        lesson = !!s?.lesson; teacherIn = ppl.some((p) => p.role === 'teacher'); online = ppl.length; chatOpen = !!s?.chat_open
      } catch { /* idle */ }
    }
    return { course, lesson, teacherIn, online, chatOpen }
  }))
  parentTeaching.value = { loading: false, teaching, textbooks: parentTeaching.value.textbooks, serverOnline: server }
}

function applyPartnerData(res) {
  // A real partner''s PostgreSQL read is proxied through the auth server, which
  // already scoped it to their sponsor ID. Feed it into the existing
  // monitoring state so the template renders without a second network call.
  mon.value = {
    loading: false,
    error: '',
    students: (res.students || []).map((s) => ({
      name: s.name,
      course: s.course_name || s.career_path || '—',
      progress: 0,
      attendance: 0,
      quizzes: 0,
      avgQuiz: 0,
      assignments: 0,
      paid: (s.payment_status || '').toLowerCase() === 'paid',
    })).sort((a, b) => b.progress - a.progress),
    activity: [],
    teaching: [],
    textbooks: [],
    serverOnline: false,
  }
  teachers.value = res.teachers || []
  loadingTeachers.value = false
  // Real partners also price the school's PDF textbooks (parents never see
  // the pricing panel, and must never touch it).
  if (!isParent.value) loadBooks()
}

// ---- Teachers: partners create teacher accounts and remove them ----------
// Creating a teacher here mints the ONLY classroom login that teacher will
// ever have (same PBKDF2 scheme as student logins). Removing one deactivates
// the account and kills any active device session immediately.
const teachers = ref([])
const loadingTeachers = ref(true)
const removingT = ref({})
const teachForm = reactive({ name: '', loginEmail: '', password: '', specialty: '' })
const teachBusy = ref(false)
const teachMsg = ref(null)

function initials(name) {
  return (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

async function loadTeachers() {
  loadingTeachers.value = true
  try {
    const { data, error } = await pgSelect('teachers', {
      select: 'teacher_id,name,login_email,specialty,status',
      eq: { status: 'active' },
      order: 'created_at', ascending: false,
    })
    if (error) throw error
    teachers.value = data || []
  } catch (e) {
    teachMsg.value = { ok: false, text: e.message }
  } finally {
    loadingTeachers.value = false
  }
}

// ---- Library PDF textbooks: price + read-only access ----------------------
// Partners agree the price of a textbook (0 = free) and can lock it
// read-only. The books live on the learning server (:5055) as a JSON
// library index, so this goes through /api/textbooks/settings/<id> with
// role 'partner' — the same endpoint the admin portal uses.
const books = ref({ loading: true, error: '', rows: [] })
const bookBusyId = ref('')
const bookMsg = ref(null)

async function loadBooks() {
  books.value.loading = true
  try {
    const r = await fetch('/api/textbooks', { headers: { Accept: 'application/json' } })
    const j = await r.json().catch(() => null)
    if (!r.ok || !j || j.success === false) throw new Error('Learning server unreachable — textbook pricing is unavailable until api_server.py is running.')
    // Only teacher PDF uploads are priceable — AI-course and roadmap rows
    // have no single downloadable file.
    books.value = { loading: false, error: '', rows: (j.textbooks || []).filter((b) => b && b.kind === 'pdf-textbook') }
  } catch (e) {
    books.value = { loading: false, error: e.message || 'Could not load the textbook library.', rows: books.value.rows }
  }
}

async function saveBook(row) {
  bookBusyId.value = row.id
  bookMsg.value = null
  try {
    const r = await fetch('/api/textbooks/settings/' + encodeURIComponent(row.id), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'partner',
        price: Math.max(0, Math.round(Number(row.price) || 0)),
        read_only: !!row.read_only,
      }),
    })
    const j = await r.json().catch(() => null)
    if (!r.ok || !j || j.success === false) throw new Error((j && j.error) || `HTTP ${r.status}`)
    Object.assign(row, j.textbook || {})
    bookMsg.value = {
      ok: true,
      text: `"${row.title}" saved — price ₦${Number(row.price).toLocaleString('en-NG')}${row.read_only ? ' · read-only (students cannot download it)' : ' · downloadable'}.`,
    }
  } catch (e) {
    bookMsg.value = { ok: false, text: e.message || 'Could not save the textbook settings.' }
  } finally {
    bookBusyId.value = ''
  }
}

async function addTeacher() {
  const name = teachForm.name.trim()
  const mail = teachForm.loginEmail.trim().toLowerCase()
  const pw = String(teachForm.password || '')
  if (!name) { teachMsg.value = { ok: false, text: 'Teacher name is required.' }; return }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) { teachMsg.value = { ok: false, text: 'Enter a valid login email.' }; return }
  if (pw.length < 6) { teachMsg.value = { ok: false, text: 'Password must be at least 6 characters.' }; return }
  teachBusy.value = true
  teachMsg.value = null
  try {
    const { saltHex, hashHex } = await hashPassword(pw)
    const { error } = await pgInsert('teachers', {
      name,
      login_email: mail,
      password_salt: saltHex,
      password_hash: hashHex,
      password_set_at: new Date().toISOString(),
      session_token: null,
      specialty: teachForm.specialty.trim() || null,
    })
    if (error) {
      if (error.code === '23505' || /duplicate key/i.test(error.message || '')) throw new Error('That login email is already used by another teacher.')
      throw error
    }
    teachMsg.value = { ok: true, text: `${name} created — they can sign in to /classroom/teacher with the login you set.` }
    teachForm.name = ''; teachForm.loginEmail = ''; teachForm.password = ''; teachForm.specialty = ''
    await loadTeachers()
  } catch (e) {
    teachMsg.value = { ok: false, text: e.message || 'Could not create the teacher.' }
  } finally {
    teachBusy.value = false
  }
}

async function removeTeacher(t) {
  if (!window.confirm(`Remove ${t.name} from the teaching team? Their classroom login stops working immediately.`)) return
  removingT.value = { ...removingT.value, [t.teacher_id]: true }
  try {
    const { error } = await pgUpdate('teachers', { status: 'inactive', session_token: null }, { teacher_id: t.teacher_id })
    if (error) throw error
    await loadTeachers()
  } catch (e) {
    teachMsg.value = { ok: false, text: e.message }
  } finally {
    removingT.value = { ...removingT.value, [t.teacher_id]: false }
  }
}
</script>

<style scoped>
.partner-page{min-height:100vh;padding:clamp(28px,6vw,80px);background:#f5eee3;color:#263530;font-family:'Space Grotesk',system-ui,sans-serif}.partner-page header,.identity,.summary,.students,footer{max-width:1080px;margin-left:auto;margin-right:auto}.partner-page header{display:flex;justify-content:space-between;gap:30px;margin-bottom:42px}.kicker{margin:0 0 11px;color:#ae653d;font:600 11px monospace;letter-spacing:.14em}.partner-page h1{margin:0;font:500 clamp(42px,6vw,78px)/.94 Georgia,serif}.muted{color:#7b8178}.read-only{height:max-content;padding:10px 13px;border:1px solid #d7c9b9;color:#9a6b4b;font:11px monospace;letter-spacing:.12em}.identity{padding:26px;background:#263f38;color:#f5eee3}.label{display:block;color:#e4b37a;font:11px monospace;letter-spacing:.15em}.identity strong{display:inline-block;margin:12px 20px 8px 0;font:500 32px Georgia,serif;letter-spacing:.04em}.identity button{padding:8px 12px;border:1px solid #e4b37a;background:transparent;color:#f5eee3;cursor:pointer}.identity p{margin:0;color:#b9c7bc;font-size:13px}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin-top:14px;background:#d7c9b9}.summary article{padding:22px;background:#fffaf2}.summary span{color:#7b8178;font-size:12px}.summary strong{display:block;margin-top:12px;font:500 38px Georgia,serif;color:#ae653d}.students{margin-top:54px}.section-head{display:flex;justify-content:space-between;align-items:end;margin-bottom:18px}.students h2{margin:0;font:500 26px Georgia,serif}.student{display:flex;align-items:center;gap:14px;padding:16px 0;border-bottom:1px solid #ded3c5}.avatar{display:grid;place-items:center;width:38px;height:38px;background:#ae653d;color:#fff;font:600 11px monospace}.student-name{width:180px}.student-name b,.student-name small{display:block}.student-name small{margin-top:4px;color:#7b8178;font-size:12px}.progress{height:6px;flex:1;background:#ded3c5}.progress i{display:block;height:100%;background:#668b68}.student>strong{width:40px;font-size:13px}.status{width:90px;color:#668b68;font-size:12px}footer{margin-top:28px;color:#7b8178;font-size:12px}@media(max-width:700px){.partner-page{padding:26px 18px}.partner-page header,.section-head{display:block}.read-only{display:inline-block;margin-top:20px}.summary{grid-template-columns:1fr}.student-name{width:130px}.status{display:none}}
.p-teachers{margin-top:54px;max-width:1080px;margin-left:auto;margin-right:auto}
.p-teachers h2{margin:0;font:500 26px Georgia,serif}
/* Library-PDF pricing (partners agree prices + read-only lock per book). */
.p-books{max-width:1080px;margin:54px auto 0}
.p-books h2{margin:0;font:500 26px Georgia,serif}
.p-books .muted.small{margin-bottom:14px}
.book-row{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #ded3c5}
.book-row .act-kind{font-size:20px;flex:none}
.book-row .act-text{flex:1;display:flex;flex-direction:column;min-width:0}
.book-row .act-text b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.book-row .act-text small{margin-top:3px;color:#7b8178;font-size:12px}
.book-price{width:130px;padding:8px 10px;border:1px solid #d7c9b9;background:#fffaf2;color:#263530;font:600 13px monospace;flex:none}
.book-ro{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#7b8178;cursor:pointer;white-space:nowrap;flex:none}
.book-ro input{width:14px;height:14px;accent-color:#ae653d;cursor:pointer}
.p-save{padding:9px 14px;border:1px solid #ae653d;background:#ae653d;color:#fff;font:600 11px monospace;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;flex:none}
.p-save:disabled{opacity:.6;cursor:wait}
@media(max-width:720px){.book-row{flex-wrap:wrap}}
.t-form{display:grid;grid-template-columns:repeat(4,1fr) auto;gap:8px;margin-top:14px}
.t-form input{padding:11px;background:#fff;border:1px solid #ded3c5;color:#263530;font:inherit;font-size:13px}
.t-form button{padding:11px 14px;border:none;background:#263f38;color:#f5eee3;font:600 11px monospace;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
.t-form button:disabled{opacity:.6;cursor:wait}
.t-row{display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid #ded3c5}
.t-row .avatar{display:grid;place-items:center;width:36px;height:36px;background:#263f38;color:#fff;font:600 11px monospace}
.t-row .rec{flex:1}
.t-row .rec b{display:block;font:500 15px Georgia,serif}
.t-row .rec small{color:#7b8178;font-size:12px}
.t-remove{padding:8px 12px;border:1px solid #d7b9a9;background:transparent;color:#ae653d;font:600 11px monospace;text-transform:uppercase;cursor:pointer}
.t-remove:disabled{opacity:.5;cursor:wait}
.muted.small{font-size:12px;color:#7b8178;margin-top:8px}
.t-msg{margin-top:12px;padding:10px 12px;font-size:13px;background:#eef5e9;color:#387251}
.t-msg.warn{background:#fdf0ec;color:#cf3f2b}
.p-login{min-height:100vh;display:grid;place-items:center;background:#263f38;color:#f5eee3;font-family:'Space Grotesk',system-ui,sans-serif;padding:24px}
.p-login-card{width:min(430px,100%);background:#f5eee3;color:#263530;padding:30px;border:1px solid #d7c9b9}
.p-login-card .kicker{margin:0 0 10px;color:#ae653d;font:600 11px monospace;letter-spacing:.14em}
.p-login-card h1{margin:0 0 10px;font:500 30px Georgia,serif}
.p-login-card form{display:grid;gap:12px;margin-top:16px}
.p-login-card label{display:grid;gap:6px;font-size:12.5px;color:#7b8178}
.p-login-card input{padding:12px;border:1px solid #ded3c5;background:#fff;color:#263530;font:inherit}
.p-login-card button{padding:13px;border:none;background:#263f38;color:#f5eee3;font-weight:700;cursor:pointer}
.p-login-card button:disabled{opacity:.6;cursor:wait}
.p-login-card .mode-switch{display:flex;gap:8px;margin:14px 0}
.p-login-card .mode-switch button{flex:1;padding:10px;border:1px solid #ded3c5;background:#fff;color:#7b8178;font:600 11px monospace;text-transform:uppercase;cursor:pointer}
.p-login-card .mode-switch button.active{background:#263f38;border-color:#263f38;color:#f5eee3}
.p-signout{padding:8px 12px;border:1px solid #d7c9b9;background:transparent;color:#ae653d;font:600 11px monospace;cursor:pointer}
.p-mon{margin-top:44px;max-width:1080px;margin-left:auto;margin-right:auto}
.mon-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;margin-top:14px}
.mon-card{padding:16px;background:#fff;border:1px solid #ded3c5}
.mon-card b{display:block;font:500 16px Georgia,serif}
.mon-card small{display:block;margin-top:3px;color:#7b8178;font-size:12px}
.mon-bars{margin-top:10px;display:grid;gap:7px}
.mon-bar{display:flex;align-items:center;gap:8px;font-size:12px;color:#7b8178}
.mon-bar span{width:76px;flex:none}
.mon-bar i{flex:1;height:6px;background:#ded3c5;display:block}
.mon-bar i em{display:block;height:100%;background:#668b68}
.mon-bar b,.mon-line b{color:#263530;font-size:12px}
.mon-line{display:flex;justify-content:space-between;font-size:12px;color:#7b8178;padding:2px 0 2px 84px}
.act-row{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid #ded3c5;font-size:13px}
.act-kind{flex:none}
.act-text{flex:1}
.act-row small{color:#7b8178;font-size:11.5px;flex:none}
/* ---- Parent view: the tracked student's own numbers --------------------- */
/* The parent snapshot carries four figures instead of the partner's three, so
   it needs its own column count (and wins over the mobile .summary rule above
   because it comes later in the sheet). */
.summary--parent{grid-template-columns:repeat(4,1fr)}
.summary--parent strong{font-size:30px}
.summary em.sub{display:block;margin-top:6px;color:#7b8178;font-size:11.5px;font-style:normal}
/* Grades table — one row per topic quizzed. */
.grade-table{width:100%;margin-top:14px;border-collapse:collapse;background:#fffaf2}
.grade-table th{text-align:left;padding:10px 12px;background:#263f38;color:#e4b37a;font:600 10.5px monospace;letter-spacing:.12em;text-transform:uppercase}
.grade-table td{padding:11px 12px;border-bottom:1px solid #ded3c5;font-size:13px}
.grade-table .g-code{color:#7b8178;font:11px monospace}
.grade-table b{font:600 13px monospace}
.g-a{color:#387251}.g-b{color:#668b68}.g-c{color:#9a6b4b}.g-d{color:#ae653d}.g-f{color:#cf3f2b}
/* Roadmap — the course by month, marked done / in progress / upcoming. */
.road-steps{display:grid;gap:2px;margin-top:16px;background:#d7c9b9}
.road-step{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;background:#fffaf2}
.road-dot{flex:none;width:10px;height:10px;margin-top:5px;background:#ded3c5}
.road-step.done .road-dot{background:#668b68}
.road-step.now .road-dot{background:#ae653d}
.road-step>div{flex:1}
.road-step b{display:block;font:500 15px Georgia,serif}
.road-step small{display:block;margin-top:4px;color:#7b8178;font-size:12px}
.road-flag{flex:none;font:600 10.5px monospace;letter-spacing:.1em;text-transform:uppercase;color:#7b8178;font-style:normal}
.road-step.done .road-flag{color:#668b68}
.road-step.now .road-flag{color:#ae653d}
@media(max-width:700px){.summary--parent{grid-template-columns:1fr}.grade-table{display:block;overflow-x:auto}.road-step{flex-wrap:wrap}}
</style>