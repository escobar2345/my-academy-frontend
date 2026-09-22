<template>
  <main class="portal admin-portal">
    <header class="portal-head">
      <div><p class="kicker">BOIRSU SCHOOL / CONTROL ROOM</p><h1>Admin command</h1><p class="muted">One place to manage people, classes, content, sponsors and payouts.</p></div>
      <span class="role-pill">FULL ACCESS</span>
    </header>

    <section class="metric-grid">
      <article v-for="metric in metrics" :key="metric.label" class="metric"><span>{{ metric.label }}</span><strong>{{ metric.value }}</strong><small>{{ metric.note }}</small></article>
    </section>

    <section class="content-grid">
      <article class="panel wide"><div class="panel-head"><div><p class="kicker">OPERATIONS</p><h2>School controls</h2></div><span class="status-dot" :class="{ offline: dbStatus !== 'live' && dbStatus !== 'checking' }">{{ statusLabel }}</span></div>
        <div class="control-list"><button v-for="control in controls" :key="control.label" class="control" @click="announce(control.label)"><span class="control-icon">{{ control.icon }}</span><span><b>{{ control.label }}</b><small>{{ control.detail }}</small></span><span class="arrow">&rarr;</span></button></div>
        <p v-if="notice" class="notice">{{ notice }}</p>
        <p v-if="dbDetail" class="notice warn">{{ dbDetail }}</p>
      </article>
      <article class="panel"><p class="kicker">ACCESS MAP</p><h2>Role permissions</h2><div v-for="role in roles" :key="role.name" class="role-row"><span class="role-avatar">{{ role.initial }}</span><span><b>{{ role.name }}</b><small>{{ role.access }}</small></span><em>{{ role.count }}</em></div></article>
    </section>

    <section class="content-grid manage-grid">
      <article class="panel">
        <div class="panel-head"><div><p class="kicker">STAFFING</p><h2>Teachers</h2></div><span class="count-chip">{{ teachers.length }} active</span></div>
        <form class="add-form" @submit.prevent="addTeacher">
          <input v-model="teacherForm.name" placeholder="Full name *" required />
          <input v-model="teacherForm.email" type="email" placeholder="Email" />
          <input v-model="teacherForm.phone" placeholder="Phone" />
          <input v-model="teacherForm.specialty" placeholder="Specialty — e.g. Python, Design" />
          <input v-model="teacherForm.loginEmail" type="email" placeholder="Login email (classroom sign-in) *" required />
          <input v-model="teacherForm.password" type="password" placeholder="Login password — min 6 chars *" required minlength="6" />
          <button type="submit" :disabled="teacherBusy">{{ teacherBusy ? 'Adding…' : '+ Add teacher' }}</button>
        </form>
        <p v-if="teacherMsg" class="notice" :class="{ warn: !teacherMsg.ok }">{{ teacherMsg.text }}</p>
        <ul class="record-list">
          <template v-for="t in teachers" :key="t.teacher_id">
            <li>
              <span class="avatar">{{ initials(t.name) }}</span>
              <span class="rec"><b>{{ t.name }}</b><small>{{ t.login_email ? 'login: ' + t.login_email + ' · ' : 'no login yet — ' }}{{ t.specialty || 'general instructor' }}</small></span>
              <button class="btn-remove" :disabled="removing[t.teacher_id]" @click="removeTeacher(t)">{{ removing[t.teacher_id] ? '…' : 'Remove' }}</button>
              <button class="btn-remove" @click="openTeacherLogin(t)">{{ t.login_email ? '🔑 Reset' : '🔑 Login' }}</button>
            </li>
            <li v-if="teachLoginFor === t.teacher_id" class="login-row">
              <form @submit.prevent="saveTeacherLogin(t)">
                <input v-model="teachLoginForm.email" type="email" placeholder="Login email" required />
                <input v-model="teachLoginForm.password" type="password" placeholder="New password (min 6)" required />
                <button class="btn-primary-sm" type="submit" :disabled="teachLoginBusy">{{ teachLoginBusy ? 'Saving…' : 'Save login' }}</button>
                <button class="btn-remove" type="button" @click="teachLoginFor = null">Cancel</button>
              </form>
            </li>
          </template>
          <li v-if="!teachers.length && !loadingLists" class="empty">No active teachers yet — add the first one above.</li>
        </ul>
        <p v-if="teachLoginMsg" class="notice" :class="{ warn: !teachLoginMsg.ok }">{{ teachLoginMsg.text }}</p>
        <p v-if="listError" class="notice warn">{{ listError }}</p>
      </article>
      <article class="panel">
        <div class="panel-head"><div><p class="kicker">SPONSORS</p><h2>Partners</h2></div><span class="count-chip">{{ partners.length }} active</span></div>
        <form class="add-form" @submit.prevent="addPartner">
          <input v-model="partnerForm.org" placeholder="Organisation name *" required />
          <input v-model="partnerForm.contact" placeholder="Contact person" />
          <input v-model="partnerForm.email" type="email" placeholder="Email" />
          <input v-model="partnerForm.phone" placeholder="Phone" />
          <select v-model="partnerForm.ptype" class="add-select">
            <option value="partner">Real partner — manages teachers</option>
            <option value="parent">Parent partner — read-only view</option>
          </select>
          <input v-model="partnerForm.loginEmail" type="email" placeholder="Login email (optional)" />
          <input v-model="partnerForm.password" type="password" placeholder="Password — min 6 chars (optional)" />
          <button type="submit" :disabled="partnerBusy">{{ partnerBusy ? 'Adding…' : '+ Add partner' }}</button>
        </form>
        <p v-if="partnerMsg" class="notice" :class="{ warn: !partnerMsg.ok }">{{ partnerMsg.text }}</p>
        <ul class="record-list">
          <template v-for="p in partners" :key="p.partner_id">
            <li>
              <span class="avatar">{{ initials(p.org_name) }}</span>
              <span class="rec"><b>{{ p.org_name }}</b><small>{{ p.login_email ? 'login: ' + p.login_email + ' · ' : '' }}{{ p.contact_person || p.email || p.phone || 'no contact on file' }}</small></span>
              <span class="sponsor" :class="{ parent: p.partner_type === 'parent' }">{{ p.partner_type === 'parent' ? 'PARENT' : 'REAL' }}</span>
              <span class="sponsor">{{ p.sponsor_id }}</span>
              <button class="btn-remove" :disabled="removing[p.partner_id]" @click="removePartner(p)">{{ removing[p.partner_id] ? '…' : 'Remove' }}</button>
              <button class="btn-remove" @click="openLogin(p)">{{ p.login_email ? '🔑 Reset' : '🔑 Login' }}</button>
              <button class="btn-remove" :disabled="typing[p.partner_id]" @click="togglePartnerType(p)">{{ typing[p.partner_id] ? '…' : (p.partner_type === 'parent' ? '→ Real' : '→ Parent') }}</button>
              <button class="btn-remove" @click="openAgreements(p)">🤝 Fees</button>
            </li>
            <li v-if="loginFor === p.partner_id" class="login-row">
              <form @submit.prevent="saveLogin(p)">
                <input v-model="loginForm.email" type="email" placeholder="Login email" required />
                <input v-model="loginForm.password" type="password" placeholder="New password (min 6)" required />
                <button class="btn-primary-sm" type="submit" :disabled="loginBusy">{{ loginBusy ? 'Saving…' : 'Save login' }}</button>
                <button class="btn-remove" type="button" @click="loginFor = null">Cancel</button>
              </form>
            </li>
            <li v-if="feesFor === p.partner_id" class="login-row">
              <p class="kicker-sm">🤝 FEE AGREEMENTS — {{ p.sponsor_id }} · {{ p.org_name }}</p>
              <form class="fee-add" @submit.prevent="addAgreementFee(p)">
                <input v-model="agreeAdd.course" list="fee-candidates" placeholder="Course *" required />
                <input v-model="agreeAdd.amount" type="number" min="0" step="500" placeholder="Agreed fee (₦) *" required />
                <button class="btn-primary-sm" type="submit" :disabled="agreeBusy">{{ agreeBusy ? 'Saving…' : '+ Add / update' }}</button>
              </form>
              <div class="agree-list">
                <div class="agree-item" v-for="fee in agreeFees" :key="fee.id">
                  <b>{{ fee.course }}</b><span class="amount">₦{{ Number(fee.amount).toLocaleString('en-NG') }}</span>
                  <button class="btn-remove" :disabled="agreeBusy" @click="removeAgreementFee(p, fee)">{{ fee.active ? 'Deactivate' : 'Inactive' }}</button>
                </div>
                <p v-if="!agreeFees.length" class="empty">No fee agreements for this partner yet — add one above.</p>
              </div>
              <p v-if="agreeMsg" class="notice" :class="{ warn: !agreeMsg.ok }">{{ agreeMsg.text }}</p>
            </li>
          </template>
          <li v-if="!partners.length && !loadingLists" class="empty">No active partners yet — add the first one above.</li>
        </ul>
        <p v-if="loginMsg" class="notice" :class="{ warn: !loginMsg.ok }">{{ loginMsg.text }}</p>
        <p v-if="listError" class="notice warn">{{ listError }}</p>
      </article>
    </section>

    <section class="panel fees-panel">
      <div class="panel-head"><div><p class="kicker">SCHOOL FEES</p><h2>Course prices</h2></div><span class="count-chip">{{ fees.rows.length }} courses priced</span></div>
      <p class="muted small">The price you set here is exactly what the registration page charges for that course — both the Paystack checkout and the bank-transfer slip read it live. Amounts are in Naira.</p>
      <table class="fee-table" v-if="fees.rows.length">
        <thead><tr><th>Course</th><th>Fee (₦)</th><th>Updated</th><th></th></tr></thead>
        <tbody>
          <tr v-for="row in fees.rows" :key="row.course">
            <td>{{ row.course }}</td>
            <td><input class="fee-input" type="number" min="0" step="500" v-model.number="row.amount" /></td>
            <td><small>{{ row.updated_at ? new Date(row.updated_at).toLocaleDateString() : '—' }}</small></td>
            <td><button class="btn-primary-sm" :disabled="feeBusyId === row.course" @click="saveFee(row)">{{ feeBusyId === row.course ? 'Saving…' : 'Save' }}</button></td>
          </tr>
        </tbody>
      </table>
      <p v-if="!fees.rows.length && !fees.loading" class="empty">No course fees set yet — add the first price below.</p>
      <form class="fee-add" @submit.prevent="addFee">
        <input v-model="feeForm.course" list="fee-candidates" placeholder="Course name *" required />
        <datalist id="fee-candidates"><option v-for="c in fees.candidates" :key="c" :value="c" /></datalist>
        <input v-model="feeForm.amount" type="number" min="0" step="500" placeholder="Amount in ₦ *" required />
        <button class="btn-primary-sm" type="submit" :disabled="feeBusy">{{ feeBusy ? 'Saving…' : '+ Set fee' }}</button>
      </form>
      <p v-if="feeMsg" class="notice" :class="{ warn: !feeMsg.ok }">{{ feeMsg.text }}</p>
      <p v-if="fees.error" class="notice warn">{{ fees.error }}</p>
    </section>

    <section class="panel fees-panel">
      <div class="panel-head"><div><p class="kicker">LIBRARY PDFS</p><h2>Textbook prices &amp; access</h2></div><span class="count-chip">{{ books.rows.length }} textbooks</span></div>
      <p class="muted small">Set the price of any PDF textbook in the student library (0 = free) and lock it <b>read-only</b> — students can open and read the book in the viewer, but the download button is removed and the server refuses file downloads. Amounts are in Naira.</p>
      <p v-if="books.loading" class="muted small">Loading textbooks from the learning server…</p>
      <table class="fee-table" v-if="books.rows.length">
        <thead><tr><th>Textbook</th><th>Course</th><th>Price (₦)</th><th>Access</th><th></th></tr></thead>
        <tbody>
          <tr v-for="row in books.rows" :key="row.id">
            <td><b>{{ row.title }}</b><br /><small>{{ row.pages }}p · {{ row.size }}</small></td>
            <td><small>{{ row.course || '—' }}</small></td>
            <td><input class="fee-input" type="number" min="0" step="500" v-model.number="row.price" /></td>
            <td class="ro-cell"><label class="ro-toggle"><input type="checkbox" v-model="row.read_only" /><span>{{ row.read_only ? '🔒 Read-only' : 'Downloadable' }}</span></label></td>
            <td><button class="btn-primary-sm" :disabled="bookBusyId === row.id" @click="saveBook(row)">{{ bookBusyId === row.id ? 'Saving…' : 'Save' }}</button></td>
          </tr>
        </tbody>
      </table>
      <p v-if="!books.rows.length && !books.loading" class="empty">No PDF textbooks uploaded yet — teachers add them from the classroom, then they appear here for pricing.</p>
      <p v-if="bookMsg" class="notice" :class="{ warn: !bookMsg.ok }">{{ bookMsg.text }}</p>
      <p v-if="books.error" class="notice warn">{{ books.error }}</p>
    </section>

    <section class="analytics">
      <div class="analytics-head">
        <div><p class="kicker">INTELLIGENCE</p><h2>Analytics &amp; oversight</h2><p class="muted">A live picture of the data behind registration, the student dashboard, the AI learning system and the classrooms.</p></div>
        <div class="tabbar">
          <button v-for="tab in tabs" :key="tab.id" :class="{ active: analyticsTab === tab.id }" @click="analyticsTab = tab.id">{{ tab.label }}</button>
        </div>
      </div>

      <article v-show="analyticsTab === 'registration'" class="panel">
        <div class="panel-head"><div><p class="kicker">REGISTRATION PAGE</p><h2>Enrolment funnel</h2></div><a class="open-link" href="/registration" target="_blank">Open registration &rarr;</a></div>
        <div class="stat-grid">
          <div class="stat"><span>Total registrations</span><strong>{{ reg.loading ? '…' : reg.total }}</strong><small>{{ reg.error || 'all time' }}</small></div>
          <div class="stat"><span>Last 30 days</span><strong>{{ reg.loading ? '…' : reg.last30 }}</strong><small>{{ reg.error ? '—' : 'new sign-ups' }}</small></div>
          <div class="stat"><span>Paid</span><strong>{{ reg.loading ? '…' : reg.paid }}</strong><small>{{ reg.error ? '—' : 'payment confirmed' }}</small></div>
          <div class="stat"><span>Unpaid</span><strong>{{ reg.loading ? '…' : reg.unpaid }}</strong><small>{{ reg.error ? '—' : 'awaiting payment' }}</small></div>
        </div>
        <div class="bar-groups" v-if="!reg.error">
          <div class="bar-group"><h3>Top courses</h3>
            <div class="bar-row" v-for="[k, n] in reg.courses" :key="k"><span class="lbl">{{ k }}</span><span class="bar-track"><i :style="barStyle(n, reg.courses)"></i></span><b>{{ n }}</b></div>
            <p v-if="!reg.courses.length" class="empty">No registrations yet.</p>
          </div>
          <div class="bar-group"><h3>Top locations</h3>
            <div class="bar-row" v-for="[k, n] in reg.locations" :key="k"><span class="lbl">{{ k }}</span><span class="bar-track"><i :style="barStyle(n, reg.locations)"></i></span><b>{{ n }}</b></div>
            <p v-if="!reg.locations.length" class="empty">—</p>
          </div>
          <div class="bar-group"><h3>Gender</h3>
            <div class="bar-row" v-for="[k, n] in reg.gender" :key="k"><span class="lbl">{{ k }}</span><span class="bar-track"><i :style="barStyle(n, reg.gender)"></i></span><b>{{ n }}</b></div>
            <p v-if="!reg.gender.length" class="empty">—</p>
          </div>
          <div class="bar-group"><h3>Tracks</h3>
            <div class="bar-row" v-for="[k, n] in reg.tracks" :key="k"><span class="lbl">{{ k }}</span><span class="bar-track"><i :style="barStyle(n, reg.tracks)"></i></span><b>{{ n }}</b></div>
            <p v-if="!reg.tracks.length" class="empty">—</p>
          </div>
        </div>
        <!-- Live roster — the cards above are aggregates, so this is where an
             individual student shows up. It refreshes on the same 20s timer as
             the stats, so a student who finishes registration.vue appears here
             without anyone touching this page. -->
        <h3 class="roster-title">Latest registrations</h3>
        <ul class="record-list roster">
          <li v-for="s in reg.latest" :key="s.student_id || s.email">
            <span class="avatar">{{ initials(s.name) }}</span>
            <span class="rec">
              <b>{{ s.name || 'Unnamed student' }}</b>
              <small>{{ s.student_id || '—' }} · {{ s.course_name || 'no course yet' }} · {{ s.gender || '—' }} · {{ s.location || '—' }}</small>
            </span>
            <span class="sponsor" :class="{ paid: (s.payment_status || '').toLowerCase() === 'paid' }">{{ (s.payment_status || 'unpaid').toUpperCase() }}</span>
            <small class="joined">{{ s.created_at ? new Date(s.created_at).toLocaleDateString() : '—' }}</small>
          </li>
          <li v-if="!(reg.latest || []).length && !reg.loading" class="empty">No registrations yet — students appear here the moment they finish the registration page.</li>
        </ul>
        <p v-if="reg.latestError" class="notice warn">{{ reg.latestError }}</p>
        <p v-if="reg.error" class="notice warn">{{ reg.error }}</p>
      </article>
      <article v-show="analyticsTab === 'learning'" class="panel">
        <div class="panel-head"><div><p class="kicker">STUDENT DASHBOARD + BOIRSU ENGINE</p><h2>Learning progress</h2></div><a class="open-link" href="/dashboard" target="_blank">Open student dashboard &rarr;</a></div>
        <div class="stat-grid">
          <div class="stat"><span>Course enrolments</span><strong>{{ learn.loading ? '…' : learn.enrollments }}</strong><small>student_courses table</small></div>
          <div class="stat"><span>Avg progress</span><strong>{{ learn.loading ? '…' : learn.avgProgress + '%' }}</strong><small>across all enrolments</small></div>
          <div class="stat"><span>Completed</span><strong>{{ learn.loading ? '…' : learn.completed }}</strong><small>courses finished</small></div>
          <div class="stat"><span>Attendance rate</span><strong>{{ learn.loading ? '…' : learn.attendanceRate + '%' }}</strong><small>classes attended</small></div>
          <div class="stat"><span>Avg quiz score</span><strong>{{ learn.loading ? '…' : learn.avgQuiz + '%' }}</strong><small>{{ learn.quizzes }} quizzes taken</small></div>
          <div class="stat"><span>Assignments in</span><strong>{{ learn.loading ? '…' : learn.submitted }}</strong><small>{{ learn.graded }} graded</small></div>
        </div>
        <div class="bar-group wide" v-if="!learn.error">
          <h3>Quiz score bands</h3>
          <div class="bar-row" v-for="[k, n] in learn.quizBands" :key="k"><span class="lbl">{{ k }}</span><span class="bar-track"><i :style="barStyle(n, learn.quizBands)"></i></span><b>{{ n }}</b></div>
        </div>
        <p v-if="learn.error" class="notice warn">{{ learn.error }}</p>
      </article>
      <article v-show="analyticsTab === 'ai'" class="panel">
        <div class="panel-head"><div><p class="kicker">AI LEARNING SYSTEM</p><h2>Courses &amp; content engine</h2></div><a class="open-link" href="/boirsu" target="_blank">Open BOI RSU &rarr;</a></div>
        <div class="stat-grid">
          <div class="stat"><span>Courses in database</span><strong>{{ ai.loading ? '…' : ai.courses }}</strong><small>courses table</small></div>
          <div class="stat"><span>AI-generated</span><strong>{{ ai.loading ? '…' : ai.aiCourses }}</strong><small>built by the learning system</small></div>
          <div class="stat"><span>Learning server</span><strong>{{ ai.serverOnline ? 'Online' : 'Offline' }}</strong><small>api_server · port 5055</small></div>
          <div class="stat"><span>PDF textbooks</span><strong>{{ ai.loading ? '…' : ai.textbooks }}</strong><small>available to students</small></div>
        </div>
        <div class="course-list" v-if="ai.serverCourses.length">
          <h3>Generated courses (live from the learning server)</h3>
          <div class="course-row" v-for="c in ai.serverCourses" :key="c.id"><b>{{ c.title }}</b><span>{{ c.sections !== null && c.sections !== undefined ? c.sections + ' sections' : 'course' }}</span></div>
        </div>
        <p v-if="ai.error" class="notice warn">{{ ai.error }}</p>
        <p class="muted small">Courses, quizzes and PDF textbooks generated by the AI learning system are stored in the courses table and on the server (backend/uploads), then served to every student dashboard. Start the backend to see live server data here.</p>
      </article>
      <article v-show="analyticsTab === 'classroom'" class="panel">
        <div class="panel-head"><div><p class="kicker">LIVE CLASSROOM</p><h2>Rooms &amp; presence</h2></div><div class="head-actions"><button class="btn-remove" @click="loadClassroom()">Refresh now</button><a class="open-link" href="/classroom/teacher" target="_blank">Open teacher classroom &rarr;</a></div></div>
        <div class="stat-grid">
          <div class="stat"><span>Classroom server</span><strong>{{ live.serverOnline ? 'Online' : 'Offline' }}</strong><small>api_server · port 5055</small></div>
          <div class="stat"><span>Students online</span><strong>{{ live.onlineNow }}</strong><small>across all cohorts</small></div>
          <div class="stat"><span>Rooms live</span><strong>{{ live.roomsLive }}</strong><small>active right now</small></div>
          <div class="stat"><span>Hands raised</span><strong>{{ live.raised }}</strong><small>waiting to speak</small></div>
        </div>
        <ul class="record-list" v-if="live.rooms.length">
          <li v-for="r in live.rooms" :key="r.course">
            <span class="avatar">{{ initials(r.course) }}</span>
            <span class="rec"><b>{{ r.course }}</b><small>{{ r.online < 0 ? 'room idle — nobody has joined yet' : r.online + ' online · ' + (r.teachers ? 'teacher present' : 'no teacher in room') + (r.chatOpen ? ' · chat open' : ' · chat closed') + (r.lesson ? ' · lesson published' : '') }}</small></span>
            <span class="sponsor">{{ r.online < 0 ? '0 online' : r.online + ' online' }}</span>
          </li>
        </ul>
        <p v-if="live.error" class="notice warn">{{ live.error }}</p>
        <p class="muted small">Presence auto-refreshes every 20s while this tab is open. Mic and chat approvals are teacher-gated inside each room for safety — use “Open teacher classroom” to join any cohort as the teacher and control it from there.</p>
      </article>
    </section>
  </main>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAdminData } from './useAdminData.js'
import { pgCount, pgInsert, pgSelect, pgUpdate } from '../../lib/pgdb.js'

// PostgreSQL access — every call goes through the whitelisted portal API
// (/api/portal/* on the learning server, see src/lib/pgdb.js). The server
// connects to PostgreSQL with psycopg2 and auto-applies the schema.
const notice = ref('')
function announce(label) { notice.value = `${label} is ready to connect to the school control API.` }

// ---- Live counts from PostgreSQL ---------------------------------------
// dbStatus: 'checking' | 'live' | 'unconfigured' | 'missing' | 'error'
const dbStatus = ref('checking')
const dbDetail = ref('')
const loading = ref(true)

// Every table the dashboard reports on. counts values are null until the
// query for that table succeeds (so the UI can tell "loading" from "0").
const counts = ref({ students: null, teachers: null, partners: null, hub_spaces: null, admins: null })

async function countRows(table, activeOnly = false) {
  const { count, error } = await pgCount(table, activeOnly ? { status: 'active' } : {})
  if (error) {
    const err = new Error(error.message)
    err.code = error.code
    throw err
  }
  return count ?? 0
}

const statusLabel = computed(() => ({
  checking: 'Checking database…',
  live: 'All systems live',
  unconfigured: 'Database not configured',
  missing: 'Database tables missing',
  error: 'Database error',
}[dbStatus.value]))

function fmt(value) { return value === null ? '—' : String(value) }
function note(value) {
  if (value === null) return loading.value ? 'loading…' : 'unavailable'
  return value === 1 ? '1 record' : `${value} records`
}

const metrics = computed(() => [
  { label: 'Active students', value: fmt(counts.value.students), note: note(counts.value.students) },
  { label: 'Teachers available', value: fmt(counts.value.teachers), note: note(counts.value.teachers) },
  { label: 'Partners', value: fmt(counts.value.partners), note: note(counts.value.partners) },
  { label: 'Hub spaces', value: fmt(counts.value.hub_spaces), note: note(counts.value.hub_spaces) },
])

const roles = computed(() => [
  { initial: 'A', name: 'Admin', access: 'Everything', count: fmt(counts.value.admins) },
  { initial: 'T', name: 'Teachers', access: 'Classes + content', count: fmt(counts.value.teachers) },
  { initial: 'P', name: 'Partners', access: 'Sponsored students only', count: fmt(counts.value.partners) },
  { initial: 'F', name: 'Affiliates', access: 'Referrals + earnings', count: '—' },
])

async function loadCounts() {
  loading.value = true
  let anySuccess = false
  for (const table of Object.keys(counts.value)) {
    try {
      counts.value[table] = await countRows(table, table === 'teachers' || table === 'partners')
      anySuccess = true
    } catch (err) {
      counts.value[table] = null
      if (err.code === 'PGRST205' || /Could not find the table/.test(err.message || '')) {
        dbStatus.value = 'missing'
        dbDetail.value = 'Tables not created yet — start the backend (api_server.py auto-applies backend/POSTGRES_SCHEMA.sql), then refresh this page.'
      } else {
        dbStatus.value = 'error'
        dbDetail.value = `Could not read "${table}" from PostgreSQL: ${err.message}`
      }
    }
  }
  if (anySuccess && dbStatus.value === 'checking') dbStatus.value = 'live'
  loading.value = false
}

// ---- Manage teachers & partners ---------------------------------------
// Lists show ACTIVE records only. "Remove" performs a soft delete: the row's
// status flips to 'inactive' (via the portal API's update endpoint) — the
// record vanishes from this page and from the live counts while its history
// stays in PostgreSQL. Restore by setting status back to 'active' in the DB.
const teachers = ref([])
const partners = ref([])
const listError = ref('')
const loadingLists = ref(true)
const removing = ref({})

const teacherForm = reactive({ name: '', email: '', phone: '', specialty: '', loginEmail: '', password: '' })
const teacherBusy = ref(false)
const teacherMsg = ref(null)

const partnerForm = reactive({ org: '', contact: '', email: '', phone: '', loginEmail: '', password: '', ptype: 'partner' })
const partnerBusy = ref(false)
const partnerMsg = ref(null)

function initials(name) {
  return (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

// Matches the style of the sample "BOI-ORBIT-247": BOI-XXXX-NNN.
// Unambiguous characters only (no I/L/O/0/1) so IDs are easy to read aloud.
function newSponsorId() {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let tail = ''
  for (let i = 0; i < 4; i++) tail += abc[Math.floor(Math.random() * abc.length)]
  return `BOI-${tail}-${Math.floor(100 + Math.random() * 900)}`
}

function friendlyError(err) {
  if (err.code === '23505' || /duplicate key/i.test(err.message || '')) {
    return 'That record already exists — a teacher/partner with this email or sponsor ID is registered.'
  }
  if (err.code === 'PGRST205' || /Could not find the table/.test(err.message || '')) {
    return 'Database tables are missing — start the backend (api_server.py auto-applies backend/POSTGRES_SCHEMA.sql), then refresh this page.'
  }
  return err.message || 'Something went wrong.'
}

async function loadLists() {
  loadingLists.value = true
  try {
    const [t, p] = await Promise.all([
      pgSelect('teachers', {
        select: 'teacher_id,name,email,phone,specialty,status,login_email',
        eq: { status: 'active' },
        order: 'created_at', ascending: false,
      }),
      pgSelect('partners', {
        select: 'partner_id,sponsor_id,org_name,contact_person,email,phone,status,partner_type',
        eq: { status: 'active' },
        order: 'created_at', ascending: false,
      }),
    ])
    if (t.error) throw t.error
    if (p.error) throw p.error
    teachers.value = t.data || []
    partners.value = p.data || []
    listError.value = ''
  } catch (err) {
    listError.value = friendlyError(err)
  } finally {
    loadingLists.value = false
  }
}

// ---- Analytics & oversight (useAdminData.js) ---------------------------
const { registration: reg, learning: learn, ai, classroom: live, fees, loadAll, loadRegistration, loadLearning, loadClassroom, loadFees, setFee, makePartnerCreds, setPartnerLogin, makeTeacherCreds, setTeacherLogin, setPartnerType, loadPartnerFees, setPartnerFee, removePartnerFee, startPolling, stopPolling } = useAdminData()
const analyticsTab = ref('registration')
const tabs = [
  { id: 'registration', label: 'Registration' },
  { id: 'learning', label: 'Learning' },
  { id: 'ai', label: 'AI courses' },
  { id: 'classroom', label: 'Classroom live' },
]
// Bar widths are relative to the biggest value in their group.
function barStyle(n, rows) {
  const max = Math.max(...rows.map((r) => r[1]), 1)
  return { width: Math.max(6, Math.round((n / max) * 100)) + '%' }
}
// The live classroom tab polls presence every 20s while it is open.
watch(analyticsTab, (tab) => {
  if (tab === 'classroom') { loadClassroom(); startPolling(20000) } else { stopPolling() }
})

onMounted(() => { loadCounts(); loadLists(); loadAll(); loadBooks() })
// Real-time-ish dashboard: refresh counts + lists every 20s so new
// registrations and account creations from other tabs/devices show up
// without a manual page reload. loadRegistration()/loadLearning() MUST be
// in this interval too — they were missing before, so the Registration
// analytics tab stayed frozen on whatever was loaded at page mount and a
// student who registered while this page was open never appeared.
const adminRefreshTimer = setInterval(() => { loadCounts(); loadLists(); loadRegistration(); loadLearning() }, 20000)
onUnmounted(() => { stopPolling(); clearInterval(adminRefreshTimer) })

const controls = [
  { icon: '01', label: 'Manage users and roles', detail: 'Approve, suspend or change access' },
  { icon: '02', label: 'Review school content', detail: 'Courses, lessons, PDFs and recordings' },
  { icon: '03', label: 'Sponsor and affiliate ledger', detail: 'IDs, referrals, commissions and payouts' },
  { icon: '04', label: 'Platform settings', detail: 'Registration, classroom and integrations' },
]

async function addTeacher() {
  if (!teacherForm.name.trim()) { teacherMsg.value = { ok: false, text: 'The teacher name is required.' }; return }
  teacherBusy.value = true
  teacherMsg.value = null
  try {
    // A teacher account IS a classroom login: credentials are required here,
    // and this is the only way a teacher login ever comes into existence.
    const creds = await makeTeacherCreds(teacherForm.loginEmail, teacherForm.password)
    const { error } = await pgInsert('teachers', {
      name: teacherForm.name.trim(),
      email: teacherForm.email.trim() || null,
      phone: teacherForm.phone.trim() || null,
      specialty: teacherForm.specialty.trim() || null,
      ...creds,
    })
    if (error) throw error
    teacherMsg.value = { ok: true, text: `${teacherForm.name.trim()} added — they can now sign in to /classroom/teacher with the login you created.` }
    teacherForm.name = ''; teacherForm.email = ''; teacherForm.phone = ''; teacherForm.specialty = ''; teacherForm.loginEmail = ''; teacherForm.password = ''
    await Promise.all([loadCounts(), loadLists()])
  } catch (err) {
    teacherMsg.value = { ok: false, text: friendlyError(err) }
  } finally {
    teacherBusy.value = false
  }
}

async function removeTeacher(teacher) {
  if (!window.confirm(`Remove ${teacher.name} from the active teachers list?`)) return
  removing.value = { ...removing.value, [teacher.teacher_id]: true }
  try {
    const { error } = await pgUpdate('teachers', { status: 'inactive', session_token: null }, { teacher_id: teacher.teacher_id })
    if (error) throw error
    await Promise.all([loadCounts(), loadLists()])
  } catch (err) {
    listError.value = friendlyError(err)
  } finally {
    removing.value = { ...removing.value, [teacher.teacher_id]: false }
  }
}

async function addPartner() {
  if (!partnerForm.org.trim()) { partnerMsg.value = { ok: false, text: 'The organisation name is required.' }; return }
  partnerBusy.value = true
  partnerMsg.value = null
  try {
    // Optional login credentials: hashed with the same PBKDF2 scheme the
    // student logins use, then stored on the partner row.
    const creds = partnerForm.password
      ? await makePartnerCreds(partnerForm.loginEmail || partnerForm.email, partnerForm.password)
      : {}
    // sponsor_id is UNIQUE in the database — regenerate and retry on the rare
    // collision (error 23505 on that column) instead of failing the request.
    let inserted = false
    let lastErr = null
    for (let attempt = 0; attempt < 3 && !inserted; attempt++) {
      const { error } = await pgInsert('partners', {
        org_name: partnerForm.org.trim(),
        contact_person: partnerForm.contact.trim() || null,
        email: partnerForm.email.trim() || null,
        phone: partnerForm.phone.trim() || null,
        sponsor_id: newSponsorId(),
        partner_type: partnerForm.ptype,
        ...creds,
      })
      if (!error) {
        inserted = true
      } else if (error.code === '23505' && /sponsor_id/.test(error.message || '')) {
        lastErr = error
      } else {
        throw error
      }
    }
    if (!inserted) throw lastErr || new Error('Could not generate a unique sponsor ID.')
    partnerMsg.value = { ok: true, text: `${partnerForm.org.trim()} added — share their new sponsor ID with them.` }
    partnerForm.org = ''; partnerForm.contact = ''; partnerForm.email = ''; partnerForm.phone = ''; partnerForm.loginEmail = ''; partnerForm.password = ''; partnerForm.ptype = 'partner'
    await Promise.all([loadCounts(), loadLists()])
  } catch (err) {
    partnerMsg.value = { ok: false, text: friendlyError(err) }
  } finally {
    partnerBusy.value = false
  }
}

async function removePartner(partner) {
  if (!window.confirm(`Remove ${partner.org_name} (sponsor ${partner.sponsor_id}) from the active partners list?`)) return
  removing.value = { ...removing.value, [partner.partner_id]: true }
  try {
    const { error } = await pgUpdate('partners', { status: 'inactive' }, { partner_id: partner.partner_id })
    if (error) throw error
    await Promise.all([loadCounts(), loadLists()])
  } catch (err) {
    listError.value = friendlyError(err)
  } finally {
    removing.value = { ...removing.value, [partner.partner_id]: false }
  }
}

// ---- Course school fees -------------------------------------------------
const feeForm = reactive({ course: '', amount: '' })
const feeBusy = ref(false)
const feeBusyId = ref('')
const feeMsg = ref(null)

async function saveFee(row) {
  feeBusyId.value = row.course
  feeMsg.value = null
  try {
    await setFee(row.course, row.amount)
    feeMsg.value = { ok: true, text: `Fee for "${row.course}" saved — registration now charges ₦${Number(row.amount).toLocaleString('en-NG')}.` }
  } catch (err) {
    feeMsg.value = { ok: false, text: friendlyError(err) }
  } finally {
    feeBusyId.value = ''
  }
}

async function addFee() {
  feeBusy.value = true
  feeMsg.value = null
  try {
    await setFee(feeForm.course, feeForm.amount)
    feeMsg.value = { ok: true, text: `Fee for "${feeForm.course}" saved.` }
    feeForm.course = ''; feeForm.amount = ''
  } catch (err) {
    feeMsg.value = { ok: false, text: friendlyError(err) }
  } finally {
    feeBusy.value = false
  }
}

// ---- Library PDF textbooks (price + read-only access) --------------------
// PDF textbooks live on the learning server (:5055) in its JSON library
// index, so pricing goes through /api/textbooks/settings/<id> — not the
// portal SQL API. 0 = free. read_only removes the students' download and
// serves the file viewer-only.
const books = ref({ loading: true, error: '', rows: [] })
const bookBusyId = ref('')
const bookMsg = ref(null)

async function loadBooks() {
  books.value.loading = true
  try {
    const r = await fetch('/api/textbooks', { headers: { Accept: 'application/json' } })
    const j = await r.json().catch(() => null)
    if (!r.ok || !j || j.success === false) throw new Error('Learning server unreachable — start api_server.py (port 5055), then refresh.')
    // Only teacher PDF uploads are priceable — AI-course and roadmap rows
    // have no single downloadable file.
    books.value = { loading: false, error: '', rows: (j.textbooks || []).filter((b) => b && b.kind === 'pdf-textbook') }
  } catch (err) {
    books.value = { loading: false, error: err.message || 'Could not load the textbook library.', rows: books.value.rows }
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
        role: 'admin',
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
  } catch (err) {
    bookMsg.value = { ok: false, text: err.message || 'Could not save the textbook settings.' }
  } finally {
    bookBusyId.value = ''
  }
}

// ---- Partner login credentials -----------------------------------------
const loginFor = ref(null)
const loginForm = reactive({ email: '', password: '' })
const loginBusy = ref(false)
const loginMsg = ref(null)

function openLogin(p) {
  loginFor.value = p.partner_id
  loginForm.email = p.login_email || ''
  loginForm.password = ''
  loginMsg.value = null
}

async function saveLogin(p) {
  loginBusy.value = true
  loginMsg.value = null
  try {
    await setPartnerLogin(p.partner_id, loginForm.email, loginForm.password)
    loginMsg.value = { ok: true, text: `Login saved for ${p.org_name} — they can now sign in with that email and password.` }
    loginFor.value = null
  } catch (err) {
    loginMsg.value = { ok: false, text: friendlyError(err) }
  } finally {
    loginBusy.value = false
  }
}

// ---- Partner type (real vs parent) --------------------------------------
// Real partners manage teacher accounts; parent partners get the read-only
// monitoring view only. The admin can switch a partner's type at any time.
const typing = ref({})
async function togglePartnerType(p) {
  const next = p.partner_type === 'parent' ? 'partner' : 'parent'
  typing.value = { ...typing.value, [p.partner_id]: true }
  try {
    await setPartnerType(p.partner_id, next)
    p.partner_type = next
  } catch (err) {
    listError.value = friendlyError(err)
  } finally {
    typing.value = { ...typing.value, [p.partner_id]: false }
  }
}

// ---- Partner fee agreements (sponsor-ID pricing) -------------------------
// Real partners collaborate with the academy: the admin and partner agree
// special course prices, stored against the partner's sponsor ID. Any
// student who registers with that code pays the agreed amount.
const feesFor = ref('')
const agreeFees = ref([])
const agreeMsg = ref(null)
const agreeBusy = ref(false)
const agreeAdd = reactive({ course: '', amount: '' })

async function openAgreements(p) {
  agreeMsg.value = null
  if (feesFor.value === p.partner_id) { feesFor.value = ''; return }
  feesFor.value = p.partner_id
  agreeAdd.course = ''; agreeAdd.amount = ''
  try {
    agreeFees.value = await loadPartnerFees(p.sponsor_id)
  } catch (err) {
    agreeMsg.value = { ok: false, text: friendlyError(err) }
  }
}

async function addAgreementFee(p) {
  agreeBusy.value = true
  agreeMsg.value = null
  try {
    await setPartnerFee(p.sponsor_id, agreeAdd.course, agreeAdd.amount)
    agreeFees.value = await loadPartnerFees(p.sponsor_id)
    agreeAdd.course = ''; agreeAdd.amount = ''
    agreeMsg.value = { ok: true, text: `Agreed fee saved — students using ${p.sponsor_id} for that course pay it at registration.` }
  } catch (err) {
    agreeMsg.value = { ok: false, text: friendlyError(err) }
  } finally {
    agreeBusy.value = false
  }
}

async function removeAgreementFee(p, fee) {
  if (!window.confirm(`Deactivate the ${fee.course} agreement for ${p.sponsor_id}? Students will fall back to the standard course fee.`)) return
  agreeBusy.value = true
  agreeMsg.value = null
  try {
    await removePartnerFee(fee.id)
    agreeFees.value = await loadPartnerFees(p.sponsor_id)
    agreeMsg.value = { ok: true, text: `Agreement for "${fee.course}" deactivated — standard course fee applies again.` }
  } catch (err) {
    agreeMsg.value = { ok: false, text: friendlyError(err) }
  } finally {
    agreeBusy.value = false
  }
}

// ---- Teacher login credentials -----------------------------------------
// Mirrors the partner flow: set or rotate the login that the teacher uses on
// /classroom/teacher. Rotating credentials also revokes any active device
// session (session_token is cleared by makeTeacherCreds).
const teachLoginFor = ref(null)
const teachLoginForm = reactive({ email: '', password: '' })
const teachLoginBusy = ref(false)
const teachLoginMsg = ref(null)

function openTeacherLogin(t) {
  teachLoginFor.value = t.teacher_id
  teachLoginForm.email = t.login_email || ''
  teachLoginForm.password = ''
  teachLoginMsg.value = null
}

async function saveTeacherLogin(t) {
  teachLoginBusy.value = true
  teachLoginMsg.value = null
  try {
    await setTeacherLogin(t.teacher_id, teachLoginForm.email, teachLoginForm.password)
    teachLoginMsg.value = { ok: true, text: `Login saved for ${t.name} — any signed-in device was signed out.` }
    teachLoginFor.value = null
  } catch (err) {
    teachLoginMsg.value = { ok: false, text: friendlyError(err) }
  } finally {
    teachLoginBusy.value = false
  }
}
</script>

<style scoped>
.portal{min-height:100vh;padding:clamp(28px,5vw,72px);color:#102321;background:#f3f5ed;font-family:'Space Grotesk',system-ui,sans-serif}.portal-head{display:flex;justify-content:space-between;gap:28px;align-items:flex-start;max-width:1180px;margin:0 auto 42px}.kicker{margin:0 0 10px;color:#8a5b32;font:600 11px/1.2 monospace;letter-spacing:.14em}.portal h1{margin:0;font:500 clamp(40px,6vw,76px)/.95 Georgia,serif;letter-spacing:0}.portal h2{margin:0;font:500 25px Georgia,serif}.muted{max-width:480px;color:#64706a}.role-pill{padding:10px 14px;border:1px solid #b8c2b3;color:#61715e;font:600 11px monospace;letter-spacing:.12em}.metric-grid,.content-grid{max-width:1180px;margin:0 auto;display:grid;gap:14px}.metric-grid{grid-template-columns:repeat(4,1fr);margin-bottom:14px}.metric{padding:20px;background:#fff;border:1px solid #dce2d8}.metric span,.metric small,.role-row small{display:block;color:#78827c;font-size:12px}.metric strong{display:block;margin:18px 0 5px;font:500 34px Georgia,serif}.content-grid{grid-template-columns:1.5fr 1fr}.panel{padding:28px;background:#fff;border:1px solid #dce2d8}.panel-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px}.status-dot{color:#387251;font-size:12px}.status-dot:before{content:'';display:inline-block;width:7px;height:7px;margin-right:7px;background:#3c9a65;border-radius:50%}.control-list{display:grid;gap:8px}.control{display:flex;align-items:center;gap:14px;width:100%;padding:14px;text-align:left;background:#f7f8f4;border:1px solid transparent;color:inherit;cursor:pointer}.control:hover{border-color:#b8c2b3}.control-icon{color:#8a5b32;font:12px monospace}.control span:nth-child(2){flex:1}.control b,.control small{display:block}.control small{margin-top:4px;color:#78827c;font-size:12px}.arrow{font-size:18px}.notice{margin:16px 0 0;padding:10px;background:#edf5e9;color:#387251;font-size:13px}.role-row{display:flex;align-items:center;gap:12px;padding:16px 0;border-bottom:1px solid #e7ebe4}.role-row:last-child{border:0}.role-avatar{display:grid;place-items:center;width:34px;height:34px;background:#193d38;color:#e9f0de;font:600 14px Georgia,serif}.role-row span:nth-child(2){flex:1}.role-row em{font-style:normal;font-family:monospace;color:#8a5b32}@media(max-width:760px){.portal{padding:26px 18px}.portal-head{display:block}.role-pill{display:inline-block;margin-top:20px}.metric-grid{grid-template-columns:repeat(2,1fr)}.content-grid{grid-template-columns:1fr}.metric strong{font-size:28px}}
.status-dot.offline:before{background:#c0532f}
.notice.warn{background:#fdf0e7;color:#a3542c}
.count-chip{color:#387251;font-size:12px}
.manage-grid{grid-template-columns:1fr 1fr}
.add-form{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:4px 0 14px}
.add-form input{padding:11px;background:#f7f8f4;border:1px solid #dce2d8;color:#102321;font:inherit;font-size:13px}
.add-form input:focus{outline:none;border-color:#8aa893}
.add-form button{grid-column:1/-1;justify-self:start;padding:11px 16px;border:none;background:#2f5d46;color:#f3f5ed;font:600 11px monospace;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
.add-form button:disabled{opacity:.6;cursor:wait}
.record-list{list-style:none;margin:0;padding:0}
.record-list li{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #e7ebe4}
.record-list .avatar{display:grid;place-items:center;flex:none;width:34px;height:34px;background:#2f5d46;color:#fff;font:600 11px monospace}
.record-list .rec{flex:1;min-width:0}
.record-list .rec b{display:block;font:500 15px Georgia,serif}
.record-list .rec small{display:block;margin-top:3px;color:#78827c;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.record-list .sponsor{flex:none;padding:4px 7px;background:#f8ecdd;color:#ae653d;font:600 10px monospace;letter-spacing:.08em}
.record-list .sponsor.parent{background:#e7e0c8;color:#7c5a06}
.add-form select{padding:11px;background:#f7f8f4;border:1px solid #dce2d8;color:#102321;font:inherit;font-size:13px}
.record-list .empty{border-bottom:none;color:#78827c;font-size:13px;padding:16px 0}
.btn-remove{flex:none;padding:7px 11px;border:1px solid #dcc3b4;background:transparent;color:#a3542c;font:600 11px monospace;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
.btn-remove:hover{background:#fdf0e7}
.btn-remove:disabled{opacity:.5;cursor:wait}
@media(max-width:900px){.manage-grid{grid-template-columns:1fr}}
.fees-panel{max-width:1180px;margin:14px auto 0}
.fee-table{width:100%;border-collapse:collapse;margin-top:14px}
.fee-table th{text-align:left;padding:9px 8px;border-bottom:2px solid #dce2d8;font:600 10px monospace;letter-spacing:.1em;text-transform:uppercase;color:#8a5b32}
.fee-table td{padding:9px 8px;border-bottom:1px solid #e7ebe4;font-size:13px;vertical-align:middle}
.fee-table td small{color:#78827c;font-size:12px}
.fee-input{width:140px;padding:8px 10px;background:#f7f8f4;border:1px solid #dce2d8;color:#102321;font:inherit;font-size:13px}
/* Library-PDF pricing rows: read-only toggle in the Access column. */
.ro-cell label.ro-toggle{display:inline-flex;align-items:center;gap:7px;cursor:pointer;color:#102321;font-size:12.5px;white-space:nowrap}
.ro-cell label.ro-toggle input{width:15px;height:15px;accent-color:#2f5d46;cursor:pointer}
.fee-add{display:grid;grid-template-columns:1fr 170px auto;gap:8px;margin-top:16px}
.fee-add input{padding:11px;background:#f7f8f4;border:1px solid #dce2d8;color:#102321;font:inherit;font-size:13px}
.btn-primary-sm{padding:9px 13px;border:none;background:#2f5d46;color:#f3f5ed;font:600 11px monospace;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
.btn-primary-sm:disabled{opacity:.6;cursor:wait}
.login-row{background:#f7f8f4;border:1px solid #dce2d8;border-bottom:none;padding:12px}
.login-row form{display:grid;grid-template-columns:1fr 1fr auto auto;gap:8px}
.login-row input{padding:9px;background:#fff;border:1px solid #dce2d8;color:#102321;font:inherit;font-size:12px}
.login-row .notice{margin-top:10px}
.kicker-sm{margin:0 0 8px;color:#8a5b32;font:600 10px monospace;letter-spacing:.12em}
.agree-list{display:grid;gap:6px;margin:4px 0 10px}
.agree-item{display:flex;align-items:center;gap:10px;padding:8px 10px;background:#fff;border:1px solid #dce2d8;font-size:13px}
.agree-item b{flex:1}
.agree-item .amount{color:#2f5d46;font:700 12px monospace}
@media(max-width:900px){.fee-add{grid-template-columns:1fr}}
.analytics{max-width:1180px;margin:14px auto 0}
.analytics-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;margin-bottom:14px}
.analytics-head h2{margin:0;font:500 25px Georgia,serif}
.analytics-head .muted{max-width:560px;margin-top:6px;color:#64706a;font-size:13px}
.tabbar{display:flex;gap:6px;flex-wrap:wrap}
.tabbar button{padding:10px 14px;border:1px solid #b8c2b3;background:transparent;color:#61715e;font:600 11px monospace;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
.tabbar button.active{background:#2f5d46;border-color:#2f5d46;color:#f3f5ed}
.analytics .panel{margin-bottom:14px}
.open-link{color:#2f5d46;font:600 11px monospace;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;border-bottom:1px solid #2f5d46;padding-bottom:2px}
.head-actions{display:flex;gap:14px;align-items:center}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:16px}
.stat{padding:14px;background:#f7f8f4;border:1px solid #dce2d8}
.stat span{font-size:11px;color:#78827c}
.stat strong{display:block;margin:8px 0 4px;font:500 26px Georgia,serif;color:#102321}
.stat small{color:#9aa59d;font-size:11px}
.bar-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px}
.bar-group h3{margin:0 0 10px;font:500 15px Georgia,serif}
.bar-group.wide{max-width:560px}
.bar-row{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12px}
.bar-row .lbl{width:110px;flex:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#4d5a52}
.bar-track{flex:1;height:8px;background:#e7ebe4;overflow:hidden}
.bar-track i{display:block;height:100%;background:#2f5d46}
.bar-row b{width:32px;flex:none;text-align:right;font:600 12px monospace;color:#102321}
.course-list h3{margin:0 0 8px;font:500 15px Georgia,serif}
.course-row{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid #e7ebe4;font-size:13px}
.course-row span{color:#78827c;font-size:12px}
.muted.small{font-size:12px;color:#78827c;margin-top:12px}
.empty{color:#78827c;font-size:12px}
/* Latest-registrations roster on the Registration analytics tab. Reuses the
   .record-list look from the partners/teachers management lists. */
.roster-title{margin:22px 0 4px;font:500 15px Georgia,serif}
.record-list.roster .sponsor.paid{background:#e6f2e6;color:#2f6b46}
.record-list.roster .joined{flex:none;color:#78827c;font-size:11px;white-space:nowrap}
</style>