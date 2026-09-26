<template>
  <div class="learning-app">
    <div class="roadmap-shell">
      <!-- Sidebar markup + classes are kept byte-identical to studentdashboard.vue's
           desktop aside (same Tailwind strings, same SVG icons, same live identity)
           so moving between /dashboard and /roadmap does not change the nav. -->
      <aside class="roadmap-shell__sidebar">
        <div class="flex items-center gap-3 px-1.5">
          <div class="w-10 h-10 rounded-xl bg-[conic-gradient(from_210deg,#3ce6c3,#7db1ff,#ffb454,#3ce6c3)] grid place-items-center font-serif text-[#08131f] text-lg font-semibold shadow-lg shadow-[#3ce6c3]/30">{{ brandInitial }}</div>
          <div>
            <div class="font-serif text-xl tracking-tight truncate max-w-[200px]">{{ brandFirst }}<i v-if="brandAccent" class="text-[#3ce6c3]">{{ brandAccent }}</i></div>
            <div class="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Student Portal</div>
          </div>
        </div>

        <div class="flex items-center gap-3 p-3 border border-white/[0.06] rounded-2xl bg-gradient-to-br from-[#3ce6c3]/5 to-transparent">
          <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1d3a5f] to-[#122544] border border-white/[0.1] grid place-items-center font-mono text-sm text-[#3ce6c3] shrink-0">{{ studentInitials }}</div>
          <div class="min-w-0">
            <div class="font-semibold text-[14.5px] tracking-tight truncate">{{ studentNameLine }}</div>
            <div class="text-[11px] font-mono tracking-wide text-slate-400 truncate">{{ studentIdLine }}</div>
            <span class="inline-block mt-1 text-[9.5px] font-bold tracking-[0.14em] uppercase px-2 py-0.5 rounded-md bg-[#ffb454]/15 text-[#ffb454]">{{ studentCohort }}</span>
          </div>
        </div>

        <div class="px-2 text-[10px] uppercase tracking-[0.26em] text-slate-500 font-semibold mt-2">Navigate</div>

        <nav class="flex flex-col gap-1 overflow-y-auto pr-1" aria-label="Student routes">
          <button
            v-for="item in navItems"
            :key="item.id"
            type="button"
            @click="item.id === 'roadmap' ? goRoadmap() : go(item.id)"
            :class="[
              'flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl font-medium text-[13.5px] border transition-all duration-300',
              currentView === item.id
                ? 'text-[#05221b] bg-gradient-to-br from-[#3ce6c3] to-[#8ff2da] font-semibold shadow-lg shadow-[#3ce6c3]/30'
                : 'text-slate-400 border-transparent hover:text-white hover:bg-[#3ce6c3]/5 hover:border-white/[0.06] hover:translate-x-1'
            ]"
          >
            <component :is="item.icon" class="w-[18px] h-[18px] shrink-0" />
            <span>{{ item.label }}</span>
            <span v-if="item.pill" :class="['ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full', currentView === item.id ? 'bg-black/20 text-[#05221b]' : 'bg-[#ff7a6b]/20 text-[#ff7a6b]']">{{ item.pill }}</span>
          </button>
        </nav>

        <div class="mt-auto flex flex-col gap-2">
          <button type="button" @click="go('chat')" class="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-br from-[#25d366] to-[#128c5e] text-[#04140b] font-semibold text-[13.5px] shadow-lg shadow-[#25d366]/25 hover:-translate-y-0.5 hover:shadow-[#25d366]/40 transition-all duration-300">
            <WhatsAppIcon class="w-[17px] h-[17px]" /> Cohort WhatsApp
          </button>
          <button type="button" @click="leaveRoadmap" class="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 text-[12.5px] font-medium hover:text-[#ff7a6b] hover:bg-[#ff7a6b]/5 transition">
            <LogOutIcon class="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>

      <div class="content-wrapper">
        <Transition name="modal">
          <div v-if="paymentGate.open" class="payment-gate">
            <div class="payment-card">
              <p class="gate-kicker">Access required</p>
              <h2>Complete payment to unlock this roadmap</h2>
              <p class="gate-copy">Your BOI RSU learning path is locked until payment is confirmed.</p>

              <div class="gate-summary">
                <span>Course</span>
                <strong>{{ paymentGate.course }}</strong>
              </div>
              <div class="gate-summary">
                <span>Fee</span>
                <strong>₦{{ formatMoney(paymentGate.amount) }}</strong>
              </div>

              <button class="pay-btn" :disabled="paymentGate.loading" @click="openPaystackCheckout">
                {{ paymentGate.loading ? 'Opening Paystack...' : 'Pay with Paystack' }}
              </button>

              <button class="secondary-btn" @click="closePaymentGate">
                Pay later
              </button>
            </div>
          </div>
        </Transition>

        <canvas ref="starfieldCanvas" class="starfield"></canvas>
        <div class="aurora aurora-1"></div>
        <div class="aurora aurora-2"></div>
        <div class="aurora aurora-3"></div>
        <div class="grid-overlay"></div>

        <header class="app-header">
          <h1>📚 Your Learning Path</h1>
          <p>Follow the trail — complete each topic to unlock the next.</p>
        </header>

        <div class="layout">
          <div class="path-wrap" ref="pathWrap">
            <div class="legend">
              <span><i class="dot g"></i>Completed</span>
              <span><i class="dot o"></i>Current topic</span>
              <span><i class="dot l"></i>Locked</span>
            </div>

            <svg ref="svgEl" viewBox="0 0 420 980" class="path-svg">
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#F97316" />
                  <stop offset="100%" stop-color="#FBBF24" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path ref="trailPath" :d="pathData" class="trail" />
              <path ref="progressPath" :d="pathData" class="trail-progress" />
              <g ref="nodesGroup"></g>
              <circle ref="traveler" r="10" class="traveler" />
            </svg>

            <div ref="taskOrbit" class="task-orbit"></div>
          </div>

          <aside class="details-sidebar" v-if="topics[current]">
            <Transition name="sidebar-fade" mode="out-in">
              <div class="sidebar-content" :key="current">
                <div class="sidebar-header">
                  <div class="sidebar-badge">
                    <span class="badge-icon" :class="topicStateClass">●</span>
                    Topic {{ current + 1 }} of {{ topics.length }}
                  </div>
                  <h2 class="sidebar-title">{{ topics[current].title }}</h2>
                  <p class="sidebar-blurb">{{ topics[current].blurb }}</p>
                </div>

                <div class="sidebar-progress">
                  <div class="progress-label">
                    <span>Progress</span>
                    <span class="progress-percent">{{ progressPercent }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ completedTaskCount }} / {{ topics[current].tasks.length }} tasks completed</span>
                </div>

                <div class="sidebar-section">
                  <h3 class="section-title">
                    <span class="section-icon">🎯</span>
                    What You'll Learn
                  </h3>
                  <ul class="learning-points">
                    <li>{{ topics[current].blurb }}</li>
                    <li>Master the core concepts and practical applications</li>
                    <li>Build confidence through guided practice</li>
                  </ul>
                </div>

                <div class="sidebar-section">
                  <h3 class="section-title">
                    <span class="section-icon">📋</span>
                    Tasks & Activities
                  </h3>
                  <ul class="sidebar-tasks">
                    <li
                      v-for="(task, idx) in topics[current].tasks"
                      :key="idx"
                      :class="{ done: done[current]?.[idx] }"
                    >
                      <span class="task-icon">{{ getTaskIcon(task) }}</span>
                      <span class="task-name">{{ task }}</span>
                      <span class="task-check">
                        <svg v-if="done[current]?.[idx]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                    </li>
                  </ul>
                </div>

                <div class="sidebar-section">
                  <h3 class="section-title">
                    <span class="section-icon">🗓️</span>
                    Day-by-day Class Plan
                  </h3>
                  <p v-if="dailyPlanLoading" class="sidebar-blurb">Loading this month's class-by-class plan…</p>
                  <template v-else-if="dailyPlanDays.length">
                    <ol class="daily-plan-list">
                      <li v-for="d in dailyPlanDays" :key="d.n" class="daily-plan-item">
                        <div class="dp-head">
                          <span class="dp-date">{{ dpShortDay(d.weekday) }} {{ dpPrettyDate(d.date) }} · {{ d.time }}</span>
                          <span class="dp-num">Day {{ d.n }}</span>
                        </div>
                        <b class="dp-topic">{{ d.topic }}</b>
                        <p v-if="d.task" class="dp-task">🎯 {{ d.task }}</p>
                        <div v-if="d.breakdown && d.breakdown.length" class="dp-break">
                          <span v-for="(b, bi) in d.breakdown.slice(0, 3)" :key="bi">▸ {{ b }}</span>
                        </div>
                      </li>
                    </ol>
                    <p class="dp-source" :class="dailyPlanSource === 'ai' ? 'is-ai' : ''">
                      {{ dailyPlanSource === 'ai' ? '✨ Written by MiroFish AI' : 'Standard roadmap breakdown' }}
                    </p>
                    <button v-if="dailyPlanAiReady" class="plan-ai-btn" :disabled="dailyPlanBusy" @click="generateDailyPlanForRoadmap">
                      {{ dailyPlanBusy ? dailyPlanStep + '…' : (dailyPlanSource === 'ai' ? '✨ Regenerate with AI' : '✨ Make every day detailed with MiroFish AI') }}
                    </button>
                  </template>
                  <template v-else>
                    <p class="sidebar-blurb">No daily plan stored for this month yet.</p>
                    <button class="plan-ai-btn" :disabled="dailyPlanBusy || !dailyPlanAiReady" @click="generateDailyPlanForRoadmap">
                      {{ dailyPlanBusy ? dailyPlanStep + '…' : '✨ Generate with MiroFish AI' }}
                    </button>
                    <p v-if="!dailyPlanAiReady" class="dp-note">Set NVIDIA_API_KEY on the server to let the AI write each day's lesson.</p>
                  </template>
                  <p v-if="dailyPlanNote" class="dp-note">{{ dailyPlanNote }}</p>
                </div>

                <button class="sidebar-action" @click="focusCurrentLesson">
                  <span>View on Path</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </Transition>
          </aside>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div class="complete-overlay" :class="{ show: showCompletion }">
        <div class="complete">
          <div class="emoji">🎉</div>
          <h2>Course Complete!</h2>
          <p>Outstanding work — you finished every topic.</p>
          <button @click="restart">Restart Demo</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, computed, watch, h } from 'vue'
import { useRouter } from 'vue-router'
import * as api from './aiClient.js'

const router = useRouter()

// Partner-aware branding — mirrors studentdashboard.vue: a student who
// registered with a partner's sponsor ID sees that partner's org name (stored
// by registration.vue / studentdashboard.vue at handoff); everyone else sees
// the default "devsphere academy".
const storedOrg = String(localStorage.getItem('boi_sponsor_org') || '').trim();
const brandFull = storedOrg || 'devsphere academy';
const brandSpace = brandFull.lastIndexOf(' ');
const brandFirst = brandSpace > 0 ? brandFull.slice(0, brandSpace) : brandFull;
const brandAccent = brandSpace > 0 ? brandFull.slice(brandSpace + 1) : '';
const brandInitial = (brandFull[0] || 'D').toUpperCase();

/* ---------------- LIVE IDENTITY - same source as studentdashboard.vue --------
 * The sidebar profile card used to be hardcoded ("Ada Nwosu", "NU/CS/24/0157",
 * "Cohort 24-B", "AN") - a persona that never matched the signed-in student, so
 * the card looked different depending on whether you were on /dashboard or
 * /roadmap. These now read the same two sources the dashboard does:
 *   1. the registration snapshot registration.vue wrote (boi_student_profile /
 *      boi_student_id), applied synchronously so the card is correct on the
 *      very first paint - no flash of the demo persona;
 *   2. the live boirsu record (accessStudent), which overrides it once
 *      fetchAccessStudent() resolves. That is the same server truth the payment
 *      gate below already trusts.
 * The demo strings survive only as a last-resort fallback when nobody has
 * registered on this browser, exactly like the dashboard. */
const studentId = ref(localStorage.getItem('boi_student_id') || '')
const student = reactive({ fullname: '', name: '', cohort: '' })

function hydrateProfileSnapshot() {
  let p = null
  try { p = JSON.parse(localStorage.getItem('boi_student_profile') || 'null') } catch { p = null }
  if (!p || typeof p !== 'object') return
  const full = String(p.fullname || p.name || '').trim()
  if (full) student.fullname = full
  const nm = String(p.name || '').trim()
  if (nm) student.name = nm
  const cohort = String(p.cohort || '').trim()
  if (cohort) student.cohort = cohort
  const sid = String(p.student_id || '').trim()
  if (sid) studentId.value = sid
}

/** Merge the authoritative boirsu record over the snapshot. Fields the record
 *  does not carry are left untouched, so a partial payload can never blank the
 *  card out. */
function applyStudent(s) {
  if (!s) return
  const full = String(s.fullname || s.name || '').trim()
  if (full) student.fullname = full
  const nm = String(s.name || '').trim()
  if (nm) student.name = nm
  const cohort = String(s.cohort || '').trim()
  if (cohort) student.cohort = cohort
  const sid = String(s.student_id || '').trim()
  if (sid) studentId.value = sid
}

hydrateProfileSnapshot()

const studentInitials = computed(() => {
  const n = String(student.fullname || '').trim()
  if (!n) return 'AN'
  const parts = n.split(/\s+/).filter(Boolean)
  const ini = ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
  return ini || n.slice(0, 2).toUpperCase()
})
const studentNameLine = computed(() => String(student.fullname || '').trim() || 'Ada Nwosu')
const studentIdLine = computed(() => String(studentId.value || '').trim() || 'NU/CS/24/0157')
const studentCohort = computed(() => String(student.cohort || '').trim() || 'Cohort 24-B')


/* ---------------- SIDEBAR — the SAME nav as studentdashboard.vue ----------------
 * These used to be a text-glyph list whose every entry pushed '/dashboard', so the
 * roadmap's nav looked (and behaved) nothing like the dashboard's. Both now share
 * one source of truth: the same SVG icons, the same 8 items in the same order, the
 * same pills, and the same real destinations (/dashboard?view=<id>, which
 * studentdashboard.vue reads on mount) so the chosen page actually opens instead of
 * always landing on the dashboard's default view. */
const mkIcon = (path, filled = false) => ({
  setup() {
    const ds = typeof path === 'string' ? [path] : path
    return () => h(
      'svg',
      { viewBox: '0 0 24 24', fill: filled ? 'currentColor' : 'none', stroke: filled ? 'none' : 'currentColor', 'stroke-width': '1.9', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
      ds.map(d => h('path', { d }))
    )
  }
})

const DashboardIcon = mkIcon(['M3 10.5 12 3l9 7.5', 'M5 9.5V21h14V9.5', 'M9.5 21v-6h5v6'])
const CalendarIcon = mkIcon(['M3 5h18v16H3z', 'M8 3v4', 'M16 3v4', 'M3 10h18'])
const BookIcon = mkIcon(['M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h13', 'M9 7h6'])
const ChartIcon = mkIcon(['M4 20V10', 'M10 20V4', 'M16 20v-7', 'M21 20H3'])
const ChatIcon = mkIcon('M21 12a8 8 0 0 1-8 8H4l2.4-3A8 8 0 1 1 21 12Z')
const FileIcon = mkIcon(['M5 4h14v17H5z', 'M9 9h6', 'M9 13h6', 'M9 17h4'])
const SettingsIcon = mkIcon(['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M12 2v2', 'M12 20v2', 'M4.93 4.93l1.41 1.41', 'M17.66 17.66l1.41 1.41', 'M2 12h2', 'M20 12h2', 'M4.93 19.07l1.41-1.41', 'M17.66 6.34l1.41-1.41'])
const WhatsAppIcon = mkIcon('M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z', true)
const LogOutIcon = mkIcon(['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'])

// Same 8 items, order, icons and pills as studentdashboard.vue's `navItems`,
// except the Assignments badge: that one counts REAL rows from the backend
// instead of the hardcoded '3' the sidebar used to show.
const assignments = ref([])

// Mirrors studentdashboard.vue's assignmentStatus() rule — anything not
// submitted and not graded counts as pending, so both sidebars agree.
function isPendingAssignment(a) {
  const k = String(a?.status || 'Pending').toLowerCase()
  return k !== 'submitted' && !k.startsWith('graded')
}

async function loadAssignmentsForNav() {
  const course = accessStudent.value?.course_name || careerTitle.value || ''
  const rows = await api.listClassroomAssignments(course)
  if (rows) assignments.value = rows
}

// A computed (not a plain array) so the badge fills in when the rows arrive.
// The template needs no change: `v-for="item in navItems"` auto-unwraps it.
const navItems = computed(() => [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'timetable', label: 'My Timetable', icon: CalendarIcon },
  { id: 'library', label: 'Library', icon: BookIcon },
  { id: 'roadmap', label: 'Roadmap', icon: BookIcon, pill: 'New' },
  { id: 'grades', label: 'Grades & CGPA', icon: ChartIcon },
  { id: 'chat', label: 'Cohort Chat', icon: ChatIcon, pill: '24-B' },
  { id: 'assignments', label: 'Assignments', icon: FileIcon, pill: String(assignments.value.filter(isPendingAssignment).length || '') },
  { id: 'settings', label: 'Settings', icon: SettingsIcon }
])

// The page id this route highlights. /roadmap IS the roadmap, so the active pill
// is always 'roadmap' here — matching what the dashboard shows while you are on
// /roadmap (its own nav marks Roadmap active before it pushes this route).
const currentView = ref('roadmap')

// Every entry hands off to the dashboard with the target view in the query, so
// clicking "Library" opens Library rather than the dashboard's default tab.
function dashboardTarget(id) {
  return id === 'dashboard' ? '/dashboard' : '/dashboard?view=' + id
}

function go(id) {
  router.push(dashboardTarget(id))
}

function goRoadmap() {
  router.push('/roadmap')
}

function leaveRoadmap() {
  localStorage.removeItem('boi_student_id')
  localStorage.removeItem('boi_student_profile')
  router.push('/login')
}

const careerPath = ref('frontend-developer')
const careerTitle = ref('Frontend Developer')
const progressMap = reactive({})
const accessStudent = ref(null)   // live boirsu record driving the access gate
let stopLive = null               // SSE unsubscribe for real-time progress sync
const paymentGate = reactive({
  open: false,
  loading: false,
  amount: 50000,
  course: 'BOI RSU monthly school fees',
  error: ''
})

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ''

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US')
}

/* ---------------- ACCESS GATE — server truth, not localStorage ----------------
 * The dashboard unlocks ONLY while boirsu says payment_status === 'paid'
 * AND days_left > 0 (the monthly school-fees window). No local flag can
 * bypass it, so paying here lands in the same record the dashboard reads. */
function hasActiveAccess(s) {
  return !!s && s.payment_status === 'paid' && !s.access_locked
    && Number(s.access_days_left ?? 0) > 0;
}

async function fetchAccessStudent() {
  const sid = localStorage.getItem('boi_student_id');
  if (!sid) return null;
  return await api.getStudent(sid);
}

async function ensurePaidAccess() {
  const s = await fetchAccessStudent();
  accessStudent.value = s;
  applyStudent(s);   // live boirsu record wins over the localStorage snapshot
  if (hasActiveAccess(s)) {
    paymentGate.open = false;
    paymentGate.error = '';
    return true;
  }
  paymentGate.amount = Number(s?.monthly_fee ?? 50000);
  if (!s) {
    paymentGate.error = 'Register (or log in) first so your fees attach to your account.';
  } else {
    paymentGate.error = `Your ${s.course_name || 'course'} fees are due — pay this month to unlock the live roadmap.`;
  }
  paymentGate.open = true;
  return false;
}

function closePaymentGate() {
  paymentGate.error = '';
  // Re-check the server instead of trusting a local flag.
  ensurePaidAccess();
}

async function openPaystackCheckout() {
  const s = accessStudent.value;
  if (!s || !s.student_id) {
    paymentGate.error = 'No enrolled account found — complete registration first.';
    return;
  }
  if (!window.PaystackPop) {
    paymentGate.error = 'Paystack is not configured in this environment.';
    return;
  }

  paymentGate.loading = true;
  paymentGate.error = '';

  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: s.email || localStorage.getItem('boi_student_email') || 'student@boirsu.com',
    amount: Math.round(Number(paymentGate.amount || 50000) * 100),
    currency: 'NGN',
    ref: ('BOI-TUIT-' + Date.now()).replace(/[^A-Za-z0-9_-]/g, ''),
    callback: async (response) => {
      paymentGate.loading = true;
      localStorage.setItem('boi_paystack_ref', response.reference || '');
      // Server verifies against Paystack AND extends monthly access.
      await api.verifyPaystackPayment({
        studentId: s.student_id,
        reference: response.reference || '',
        months: 1,
        kind: 'tuition'
      });
      const ok = await ensurePaidAccess();
      paymentGate.loading = false;
      if (ok) {
        await bootRoadmapData();          // live data, no page reload
      } else {
        paymentGate.open = true;
        paymentGate.error = 'Verification failed — contact support with ref ' +
                            (response.reference || '(none)');
      }
    },
    onClose: () => {
      paymentGate.loading = false;
      paymentGate.error = 'Checkout was closed before payment was completed.';
    }
  });

  handler.openIframe();
}

/* ---------------- LIVE ROADMAP BOOT ---------------- */
async function bootRoadmapData() {
  const s = accessStudent.value;
  // Server record wins over a stale localStorage hint.
  const preferred = (s && s.career_path) ||
                    localStorage.getItem('boi_career_path') || 'frontend-developer';
  await loadRoadmap(preferred);
  nextTick(() => {
    initStarfield();
    buildNodes();
    renderStates();
    animatePath(0, current.value / (topics.length - 1), 1400, () => {
      showTasks();
      setTimeout(() => scrollToNodeSmooth(current.value, 800), 200);
    });
  });
}

/** Real-time alignment: another tab/device ticking a task updates here too,
 *  and ATTENDED CLASSES flip roadmap tasks green automatically (the backend
 *  recomputes the progress map from attendance and broadcasts a snapshot). */
function startLiveSync() {
  stopLive = api.subscribe((event, data) => {
    if (event === 'progress_snapshot' && data && data.progress
        && (!data.career_path || data.career_path === careerPath.value)) {
      // Full progress map refreshed server-side (attendance-driven completion).
      progressMap[careerPath.value] = data.progress;
      rebuildDoneState();
      renderStates();
      return;
    }
    if (event === 'attendance_marked') {
      // A class was attended somewhere: re-read the server progress so this
      // tab's nodes go green without any click.
      api.getProgress(careerPath.value).then((saved) => {
        if (!saved) return;
        progressMap[careerPath.value] = saved;
        rebuildDoneState();
        renderStates();
      });
      return;
    }
    if (event !== 'progress_updated') return;
    if (data.career_path !== careerPath.value) return;
    if (!progressMap[careerPath.value]) progressMap[careerPath.value] = {};
    const row = progressMap[careerPath.value][String(data.topicIndex)] || [];
    while (row.length <= data.taskIndex) row.push(false);
    row[data.taskIndex] = !!data.done;
    progressMap[careerPath.value][String(data.topicIndex)] = row;
    rebuildDoneState();
    renderStates();
  });
}

// ===== COURSE DATA =====
// Offline fallback, used only when GET /api/roadmap fails. It mirrors the live
// shape: `topics[0]` is Month 1 ("each roadmap topic is a month"), and the
// server's own `month.short` labels are "Month 1" ... so `current` can be a
// straight index into either list. The labels used to be
// Orientation / Lesson 1 / Lesson 2 / Lesson 3 / Quiz / Project, which no longer
// matched the live nodes ("Month 1" ... "Month 6") once the journey started at
// index 0.
const topics = [
  { short: 'Month 1', title: 'Month 1 – Web Foundations', blurb: 'Get set up and ready to learn.',
    tasks: ['Watch the welcome video', 'Read the course syllabus', 'Introduce yourself in the forum'] },
  { short: 'Month 2', title: 'Month 2 – Core Skills', blurb: 'Build your base knowledge.',
    tasks: ['Read: Foundations guide', 'Watch: Key ideas explained', 'Activity: knowledge check'] },
  { short: 'Month 3', title: 'Month 3 – Applying Knowledge', blurb: 'Practise the core skills.',
    tasks: ['Read: core skills walkthrough', 'Practice exercise set A', 'Practice exercise set B'] },
  { short: 'Month 4', title: 'Month 4 – Building Projects', blurb: 'Apply what you have learned.',
    tasks: ['Case-study analysis', 'Submit reflection notes'] },
  { short: 'Month 5', title: 'Month 5 – Assessment', blurb: 'Prove your understanding.',
    tasks: ['Pass the 10-question quiz (≥ 70%)'] },
  { short: 'Month 6', title: 'Month 6 – Final Project & Certificate', blurb: 'Finish strong and get certified.',
    tasks: ['Submit your final project', 'Peer-review two classmates', 'Download your certificate'] },
]

const taskIcons = {
  'Watch': '📺', 'Read': '📖', 'Activity': '⚡', 'Practice': '🎯',
  'Case-study': '📊', 'Submit': '✉️', 'Pass': '✅', 'Peer-review': '👥',
  'Download': '⬇️', 'Introduce': '👋'
}

const pathData = `M 80 70 C 190 20, 320 40, 340 130 C 355 200, 260 235, 185 225
  C 110 215, 70 265, 95 330 C 120 395, 260 380, 315 415 C 375 452, 355 540, 275 560
  C 195 580, 115 565, 95 640 C 75 715, 170 750, 250 745 C 330 740, 360 810, 320 880
  C 290 935, 180 940, 120 910`

// ===== REFS =====
const starfieldCanvas = ref(null)
const svgEl = ref(null)
const trailPath = ref(null)
const progressPath = ref(null)
const nodesGroup = ref(null)
const traveler = ref(null)
const taskOrbit = ref(null)
const pathWrap = ref(null)

// ===== STATE =====
// `current` / `furthest` are INDEXES into `topics`, and topics[0] is Month 1
// (each roadmap topic is a month). Both start at 0 so the roadmap opens on
// Month 1 with the later months locked. They used to start at 1, which skipped
// Month 1 completely and opened the journey on Month 2.
const current = ref(0)
const furthest = ref(0)
const finished = ref(false)
const animating = ref(false)
const showCompletion = ref(false)

let orbitAngle = 0
let orbitAnimationFrame = null
let starfieldAnimationId = null
let pathLength = 0
let nodeElements = []
let stars = []
let shootingStars = []

const done = reactive([])
rebuildDoneState()

// ===== SIDEBAR COMPUTED PROPERTIES =====
const completedTaskCount = computed(() => {
  if (!done[current.value]) return 0
  return done[current.value].filter(Boolean).length
})

const progressPercent = computed(() => {
  if (!topics[current.value]) return 0
  const total = topics[current.value].tasks.length
  return total === 0 ? 0 : Math.round((completedTaskCount.value / total) * 100)
})

const topicStateClass = computed(() => {
  if (finished.value) return 'state-done'
  if (current.value < furthest.value || (done[current.value] && done[current.value].every(Boolean))) return 'state-done'
  if (current.value === furthest.value) return 'state-current'
  return 'state-locked'
})

function focusCurrentLesson() {
  if (!animating.value) {
    hideTasks()
    scrollToNodeSmooth(current.value, 800)
    setTimeout(() => {
      showTasks()
    }, 900)
  }
}

// ===== HELPERS =====
function getTaskIcon(task) {
  for (const key in taskIcons) {
    if (task.toLowerCase().includes(key.toLowerCase())) return taskIcons[key]
  }
  return '📋'
}

function getScrollOffset() {
  const isMobile = window.innerWidth <= 860
  return isMobile ? window.innerHeight * 0.35 : window.innerHeight * 0.4
}

function getOrbitRadius() {
  const width = window.innerWidth
  if (width <= 480) return 95
  if (width <= 860) return 110
  return 150
}

const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

function rebuildDoneState() {
  const rows = topics.map((t, i) => {
    const saved = progressMap[careerPath.value]?.[String(i)] || []
    return t.tasks.map((_, taskIndex) => saved[taskIndex] === true)
  })
  if (!done.length) {
    done.push(...rows)
    return
  }
  done.splice(0, done.length, ...rows)
}

async function loadRoadmap(slug = 'frontend-developer') {
  careerPath.value = slug
  const response = await api.getRoadmap(slug)
  if (response && response.length) {
    topics.splice(0, topics.length, ...response)
  }
  const saved = await api.getProgress(slug)
  if (saved) {
    progressMap[slug] = saved
  }
  rebuildDoneState()
  if (topics.length) {
    // Clamp to a real index: 0 = Month 1 ... topics.length - 1 = last month.
    current.value = Math.min(Math.max(current.value, 0), topics.length - 1)
    // NOTE: the old code also force-ticked Month 1's first task right here
    // (`done[0] = done[0].map((_, idx) => idx < 1)`). That existed only to fake
    // a completed month behind the Month-2 start. Now that Month 1 IS the
    // starting month it would over-report progress, so it has been removed.
  }
}

/* ---------------- day-by-day class plan (AI daily-plan engine) ----------------
 * Each roadmap topic is a month; the daily plan says exactly what happens in
 * every class meeting of the selected month — topic, breakdown, deliverable
 * and the YouTube search for its lesson video. MiroFish AI can rewrite it. */
const dailyPlan = ref(null)
const dailyPlanLoading = ref(false)
const dailyPlanAiReady = ref(false)
const dailyPlanBusy = ref(false)
const dailyPlanStep = ref('')
const dailyPlanNote = ref('')
const dailyPlanSource = computed(() => dailyPlan.value?.source || '')
const dailyPlanDays = computed(() => (dailyPlan.value?.days) || [])

function dpCurrentMonth() {
  const t = topics[current.value]
  return Number(t?.month) || (current.value + 1)
}

function dpShortDay(name) {
  return String(name || '').slice(0, 3)
}

function dpPrettyDate(iso) {
  try { return new Date(String(iso) + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) }
  catch { return iso || '' }
}

async function loadDailyPlanForRoadmap() {
  dailyPlanLoading.value = true
  const track = accessStudent.value?.track || ''
  const time = accessStudent.value?.preferred_time || ''
  const dt = accessStudent.value?.preferred_daily_times || null
  const sid = accessStudent.value?.student_id || localStorage.getItem('boi_student_id') || ''
  const r = await api.getDailyPlan(careerPath.value, dpCurrentMonth(), track, time, dt, sid)
  dailyPlanLoading.value = false
  if (r && r.plan) {
    dailyPlan.value = r.plan
    dailyPlanAiReady.value = !!r.ai_available
  }
}

async function generateDailyPlanForRoadmap() {
  if (dailyPlanBusy.value) return
  dailyPlanBusy.value = true
  dailyPlanNote.value = ''
  dailyPlanStep.value = 'AI is writing'
  const track = accessStudent.value?.track || ''
  const time = accessStudent.value?.preferred_time || ''
  const dailyTimes = accessStudent.value?.preferred_daily_times || null
  const r = await api.generateDailyPlan(careerPath.value, { month: dpCurrentMonth(), track, time, dailyTimes })
  if (!r || r.error || !r.job_id) {
    dailyPlanBusy.value = false
    dailyPlanNote.value = r?.error || 'Could not start the AI planner.'
    return
  }
  const timer = setInterval(async () => {
    const j = await api.getDailyPlanJob(r.job_id)
    if (!j) return
    dailyPlanStep.value = j.step || j.status
    if (j.status === 'done') {
      clearInterval(timer)
      dailyPlanBusy.value = false
      dailyPlanNote.value = 'Fresh AI plan loaded.'
      await loadDailyPlanForRoadmap()
    } else if (j.status === 'error') {
      clearInterval(timer)
      dailyPlanBusy.value = false
      dailyPlanNote.value = 'AI planner failed: ' + (j.error || 'unknown error')
    }
  }, 3000)
}

// Selecting another month on the path pulls that month's daily plan.
watch(current, () => { loadDailyPlanForRoadmap() })

async function saveTaskState(topicIndex, taskIndex, value) {
  if (!careerPath.value) return
  const fresh = await api.saveProgress(careerPath.value, topicIndex, taskIndex, value)
  if (fresh) {
    if (!progressMap[careerPath.value]) progressMap[careerPath.value] = {}
    progressMap[careerPath.value][String(topicIndex)] = fresh[String(topicIndex)] || []
  }
}

// ===== STARFIELD BACKGROUND =====
function initStarfield() {
  const canvas = starfieldCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  
  function resizeCanvas() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  
  function createStars() {
    stars = []
    const isMobile = window.innerWidth <= 860
    const count = isMobile ? 80 : 180
    
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.3,
        opacity: Math.random(),
        speed: Math.random() * 0.02 + 0.005,
        direction: Math.random() > 0.5 ? 1 : -1
      })
    }
  }
  
  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Twinkling stars
    stars.forEach(star => {
      star.opacity += star.speed * star.direction
      if (star.opacity >= 1 || star.opacity <= 0.1) star.direction *= -1
      
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.8})`
      ctx.fill()
    })
    
    // Shooting stars
    if (Math.random() < 0.005 && shootingStars.length < 2) {
      shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        length: Math.random() * 80 + 40,
        speed: Math.random() * 8 + 6,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        opacity: 1
      })
    }
    
    shootingStars = shootingStars.filter(ss => ss.opacity > 0)
    
    shootingStars.forEach(ss => {
      const gradient = ctx.createLinearGradient(
        ss.x, ss.y,
        ss.x - Math.cos(ss.angle) * ss.length,
        ss.y - Math.sin(ss.angle) * ss.length
      )
      gradient.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`)
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      
      ctx.beginPath()
      ctx.moveTo(ss.x, ss.y)
      ctx.lineTo(
        ss.x - Math.cos(ss.angle) * ss.length,
        ss.y - Math.sin(ss.angle) * ss.length
      )
      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.stroke()
      
      ss.x += Math.cos(ss.angle) * ss.speed
      ss.y += Math.sin(ss.angle) * ss.speed
      ss.opacity -= 0.015
    })
    
    starfieldAnimationId = requestAnimationFrame(drawStars)
  }
  
  resizeCanvas()
  createStars()
  drawStars()
  
  window.addEventListener('resize', () => {
    resizeCanvas()
    createStars()
  })
}

// ===== BUILD SVG NODES =====
function buildNodes() {
  const NS = 'http://www.w3.org/2000/svg'
  const trail = trailPath.value
  pathLength = trail.getTotalLength()
  
  progressPath.value.setAttribute('stroke-dasharray', pathLength)
  progressPath.value.setAttribute('stroke-dashoffset', pathLength)
  
  const frac = topics.map((_, i) => i / (topics.length - 1))
  nodeElements = []
  
  topics.forEach((t, i) => {
    const p = trail.getPointAtLength(pathLength * frac[i])
    const g = document.createElementNS(NS, 'g')
    g.setAttribute('class', 'node locked')
    
    const hitArea = document.createElementNS(NS, 'circle')
    hitArea.setAttribute('cx', p.x)
    hitArea.setAttribute('cy', p.y)
    hitArea.setAttribute('r', 45)
    hitArea.setAttribute('fill', 'transparent')
    g.appendChild(hitArea)
    
    const halo = document.createElementNS(NS, 'circle')
    halo.setAttribute('class', 'halo')
    halo.setAttribute('cx', p.x)
    halo.setAttribute('cy', p.y)
    halo.setAttribute('r', 26)
    g.appendChild(halo)
    
    for (let a = 0; a < 12; a++) {
      const ang = a * Math.PI / 6
      const line = document.createElementNS(NS, 'line')
      line.setAttribute('x1', p.x + Math.cos(ang) * 5)
      line.setAttribute('y1', p.y + Math.sin(ang) * 5)
      line.setAttribute('x2', p.x + Math.cos(ang) * 17)
      line.setAttribute('y2', p.y + Math.sin(ang) * 17)
      g.appendChild(line)
    }
    
    const label = document.createElementNS(NS, 'text')
    label.setAttribute('x', p.x)
    label.setAttribute('y', p.y + 38)
    label.textContent = t.short
    g.appendChild(label)
    
    g.addEventListener('click', () => handleNodeClick(i))
    
    nodesGroup.value.appendChild(g)
    nodeElements.push(g)
  })
}

function handleNodeClick(index) {
  if (index <= furthest.value && !animating.value && index !== current.value) {
    animating.value = true
    hideTasks()
    scrollToNodeSmooth(index, 1000)
    animatePath(
      current.value / (topics.length - 1),
      index / (topics.length - 1),
      1000,
      () => {
        current.value = index
        renderStates()
        setTimeout(() => {
          showTasks()
          animating.value = false
        }, 100)
      }
    )
  }
}

// ===== RENDER NODE STATES =====
function renderStates() {
  nodeElements.forEach((g, i) => {
    let state = 'locked'
    if (finished.value) state = 'done'
    else if (i < current.value) state = 'done'
    else if (i === current.value) state = 'current'
    else if (i <= furthest.value) state = 'done'
    g.setAttribute('class', `node ${state}`)
  })
}

// ===== SCROLLING =====
function scrollToNodeSmooth(index, duration) {
  const node = nodeElements[index]
  if (!node) return
  
  const rect = node.getBoundingClientRect()
  const offset = getScrollOffset()
  const targetY = window.scrollY + rect.top - offset
  
  const startY = window.scrollY
  const diff = targetY - startY
  const startTime = performance.now()
  
  function step(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = 1 - Math.pow(1 - progress, 3)
    window.scrollTo(0, startY + diff * easeProgress)
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

// ===== ORBIT SYSTEM =====
function showTasks() {
  const container = taskOrbit.value
  if (!container) return
  
  container.innerHTML = ''
  if (orbitAnimationFrame) cancelAnimationFrame(orbitAnimationFrame)
  
  const tasks = topics[current.value].tasks
  const nodeEl = nodeElements[current.value]
  if (!nodeEl) return
  
  const bbox = nodeEl.getBBox()
  const pt = new DOMPoint(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2)
  const screenPt = pt.matrixTransform(svgEl.value.getScreenCTM())
  
  const pathWrapRect = pathWrap.value.getBoundingClientRect()
  const centerX = screenPt.x - pathWrapRect.left
  const centerY = screenPt.y - pathWrapRect.top
  
  const radius = getOrbitRadius()
  const ringSize = radius * 2 + 40
  
  // Orbit ring
  const ring = document.createElement('div')
  ring.className = 'orbit-ring'
  ring.style.left = `${centerX}px`
  ring.style.top = `${centerY}px`
  ring.style.width = `${ringSize}px`
  ring.style.height = `${ringSize}px`
  ring.style.transform = `translate(-50%, -50%)`
  container.appendChild(ring)
  setTimeout(() => ring.classList.add('show'), 100)
  
  // Task cards
  const taskCards = []
  tasks.forEach((task, idx) => {
    const card = document.createElement('div')
    card.className = 'task-card'
    if (done[current.value][idx]) card.classList.add('done')
    
    card.innerHTML = `
      <div class="task-checkbox">✓</div>
      <div class="task-card-icon">${getTaskIcon(task)}</div>
      <div class="task-text">${task}</div>
    `
    
    card.addEventListener('click', async (e) => {
      e.stopPropagation()
      done[current.value][idx] = !done[current.value][idx]
      card.classList.toggle('done', done[current.value][idx])
      if (done[current.value][idx]) createParticles(e.clientX, e.clientY)
      await saveTaskState(current.value, idx, done[current.value][idx])
      checkCompletion()
    })
    
    container.appendChild(card)
    taskCards.push(card)
    
    setTimeout(() => card.classList.add('show'), 200 + idx * 150)
  })
  
  // Animate orbit
  const angleStep = (Math.PI * 2) / tasks.length
  const speed = 0.0004
  
  function animateOrbit() {
    orbitAngle += speed
    
    taskCards.forEach((card, idx) => {
      const angle = orbitAngle + (idx * angleStep)
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      
      card.style.left = `${x}px`
      card.style.top = `${y}px`
      card.style.transform = 'translate(-50%, -50%)'
    })
    
    orbitAnimationFrame = requestAnimationFrame(animateOrbit)
  }
  
  orbitAnimationFrame = requestAnimationFrame(animateOrbit)
  checkCompletion()
}

function hideTasks() {
  if (orbitAnimationFrame) {
    cancelAnimationFrame(orbitAnimationFrame)
    orbitAnimationFrame = null
  }
  
  const container = taskOrbit.value
  if (!container) return
  
  const cards = container.querySelectorAll('.task-card, .continue-btn, .orbit-ring')
  cards.forEach((card) => {
    card.classList.remove('show')
    setTimeout(() => card.remove(), 500)
  })
}

function checkCompletion() {
  const allDone = done[current.value].every(Boolean)
  const container = taskOrbit.value
  let continueBtn = container?.querySelector('.continue-btn')
  
  if (allDone && !continueBtn) {
    const nodeEl = nodeElements[current.value]
    const bbox = nodeEl.getBBox()
    const pt = new DOMPoint(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2)
    const screenPt = pt.matrixTransform(svgEl.value.getScreenCTM())
    
    const pathWrapRect = pathWrap.value.getBoundingClientRect()
    const centerX = screenPt.x - pathWrapRect.left
    const centerY = screenPt.y - pathWrapRect.top
    
    const radius = getOrbitRadius()
    const isMobile = window.innerWidth <= 860
    const continueY = centerY + radius + (isMobile ? 70 : 90)
    
    continueBtn = document.createElement('button')
    continueBtn.className = 'continue-btn'
    continueBtn.textContent = current.value === topics.length - 1 ? 'Finish Course 🎉' : 'Continue Journey →'
    continueBtn.style.left = `${centerX}px`
    continueBtn.style.top = `${continueY}px`
    continueBtn.style.transform = 'translate(-50%, -50%)'
    
    continueBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      if (animating.value) return
      animating.value = true
      hideTasks()
      
      if (current.value < topics.length - 1) {
        const nextIndex = current.value + 1
        scrollToNodeSmooth(nextIndex, 1600)
        
        animatePath(
          current.value / (topics.length - 1),
          nextIndex / (topics.length - 1),
          1600,
          () => {
            current.value = nextIndex
            if (current.value > furthest.value) furthest.value = current.value
            renderStates()
            setTimeout(() => {
              showTasks()
              animating.value = false
            }, 150)
          }
        )
      } else {
        finished.value = true
        renderStates()
        traveler.value.style.opacity = 0
        animating.value = false
        celebrate()
        setTimeout(() => { showCompletion.value = true }, 300)
      }
    })
    
    container.appendChild(continueBtn)
    setTimeout(() => continueBtn.classList.add('show'), 200)
  } else if (!allDone && continueBtn) {
    continueBtn.classList.remove('show')
    setTimeout(() => continueBtn.remove(), 400)
  }
}

// ===== PATH ANIMATION =====
function animatePath(from, to, dur, cb) {
  traveler.value.style.opacity = 1
  const t0 = performance.now()
  let lastParticleTime = 0
  
  function frame(now) {
    const t = Math.min((now - t0) / dur, 1)
    const f = from + (to - from) * ease(t)
    const p = trailPath.value.getPointAtLength(pathLength * f)
    
    traveler.value.setAttribute('cx', p.x)
    traveler.value.setAttribute('cy', p.y)
    progressPath.value.setAttribute('stroke-dashoffset', pathLength * (1 - f))
    
    if (now - lastParticleTime > 50 && t > 0 && t < 1) {
      emitTravelerParticle(p.x, p.y)
      lastParticleTime = now
    }
    
    if (t < 1) {
      requestAnimationFrame(frame)
    } else {
      cb && cb()
    }
  }
  
  requestAnimationFrame(frame)
}

// ===== PARTICLE EFFECTS =====
function createParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div')
    p.style.cssText = `position:fixed; left:${x}px; top:${y}px; width:6px; height:6px; background:var(--green); border-radius:50%; pointer-events:none; z-index:9999; box-shadow: 0 0 10px var(--green);`
    document.body.appendChild(p)
    
    const angle = (Math.PI * 2 * i) / 10 + (Math.random() - 0.5) * 0.5
    const velocity = 50 + Math.random() * 50
    const dx = Math.cos(angle) * velocity
    const dy = Math.sin(angle) * velocity
    
    p.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
    ], { duration: 800, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' }).onfinish = () => p.remove()
  }
}

function emitTravelerParticle(x, y) {
  const pt = new DOMPoint(x, y)
  const screenPt = pt.matrixTransform(svgEl.value.getScreenCTM())
  
  const p = document.createElement('div')
  p.style.cssText = `position:fixed; left:${screenPt.x}px; top:${screenPt.y}px; width:10px; height:10px; background:var(--primary); border-radius:50%; pointer-events:none; z-index:9999; box-shadow: 0 0 14px var(--primary);`
  document.body.appendChild(p)
  
  const dx = (Math.random() - 0.5) * 50
  const dy = (Math.random() - 0.5) * 50
  
  p.animate([
    { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.9 },
    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
  ], { duration: 900, easing: 'ease-out' }).onfinish = () => p.remove()
}

function celebrate() {
  const colors = ['#F97316', '#10b981', '#8b5cf6', '#FBBF24', '#3b82f6', '#ec4899']
  for (let i = 0; i < 100; i++) {
    const p = document.createElement('div')
    const color = colors[Math.floor(Math.random() * colors.length)]
    const size = 6 + Math.random() * 10
    const isCircle = Math.random() > 0.5
    p.style.cssText = `position:fixed; left:50%; top:50%; width:${size}px; height:${isCircle ? size : size * 2}px; background:${color}; border-radius:${isCircle ? '50%' : '3px'}; pointer-events:none; z-index:9999; box-shadow: 0 0 12px ${color};`
    document.body.appendChild(p)
    
    const angle = Math.random() * Math.PI * 2
    const velocity = 150 + Math.random() * 300
    const dx = Math.cos(angle) * velocity
    const dy = Math.sin(angle) * velocity - 150
    
    p.animate([
      { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 350}px)) scale(0.2) rotate(${Math.random() * 720}deg)`, opacity: 0 }
    ], { duration: 1800 + Math.random() * 1200, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' }).onfinish = () => p.remove()
  }
}

// ===== RESTART =====
function restart() {
  location.reload()
}

// ===== LIFECYCLE =====
// Keep the sidebar identity in step with registration.vue and the dashboard:
// same tab (the custom "boi:profile-updated" event) and another tab ("storage").
// Mirrors studentdashboard.vue's syncFromRegistration() so /dashboard and
// /roadmap can never disagree about who is signed in, without a reload.
let lastProfileFingerprint = null
function syncProfileFromRegistration() {
  const raw = localStorage.getItem('boi_student_profile') || ''
  const sid = localStorage.getItem('boi_student_id') || ''
  const fingerprint = sid + '|' + raw
  if (fingerprint === lastProfileFingerprint) return
  lastProfileFingerprint = fingerprint
  hydrateProfileSnapshot()
  if (sid) studentId.value = sid
}

onMounted(async () => {
  syncProfileFromRegistration()
  addEventListener('storage', syncProfileFromRegistration)
  addEventListener('boi:profile-updated', syncProfileFromRegistration)

  if (!(await ensurePaidAccess())) return;

  await bootRoadmapData();
  loadDailyPlanForRoadmap();   // day-by-day lessons for the selected month
  loadAssignmentsForNav();     // real pending count for the Assignments pill
  startLiveSync();
  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('resize', handleResize);
})

onUnmounted(() => {
  if (starfieldAnimationId) cancelAnimationFrame(starfieldAnimationId)
  if (orbitAnimationFrame) cancelAnimationFrame(orbitAnimationFrame)
  if (stopLive) stopLive()
  removeEventListener('storage', syncProfileFromRegistration)
  removeEventListener('boi:profile-updated', syncProfileFromRegistration)
  document.removeEventListener('visibilitychange', handleVisibility)
  window.removeEventListener('resize', handleResize)
})

function handleVisibility() {
  if (document.hidden) {
    if (starfieldAnimationId) cancelAnimationFrame(starfieldAnimationId)
  } else {
    initStarfield()
  }
}

function handleResize() {
  if (!animating.value) {
    hideTasks()
    setTimeout(showTasks, 200)
  }
}
</script>

<style scoped>
.learning-app {
  --primary: #F97316;
  --primary-glow: rgba(249, 115, 22, 0.6);
  --accent: #8b5cf6;
  --accent-glow: rgba(139, 92, 246, 0.5);
  --bg: #060913;
  --surface: #0f1420;
  --surface-light: #1a2130;
  --green: #10b981;
  --green-glow: rgba(16, 185, 129, 0.5);
  --locked: #2d3748;
  --muted: #8b95a8;
  --ink: #F8FAFC;
  --border: #222b3d;
  
  background: var(--bg);
  color: var(--ink);
  min-height: 100vh;
  /* Contain horizontal overflow with `clip`, not `hidden`. `overflow-x: hidden`
     computes overflow-y to `auto`, which turns .learning-app into a scroll
     container — and since it grows to fit its content (never scrolling
     internally), position: sticky on .roadmap-shell__sidebar resolves against
     it instead of the viewport, so the nav never pins and scrolls away with the
     page. `clip` contains the same overflow without creating a scroll container,
     keeping the sidebar pinned. `hidden` stays first as a fallback for pre-2022
     browsers without `clip` support. */
  overflow-x: hidden;
  overflow-x: clip;
  position: relative;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* ===== ANIMATED BACKGROUND ===== */
.starfield {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.aurora {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.18;
  z-index: 0;
  pointer-events: none;
  will-change: transform;
}

.aurora-1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #8b5cf6, transparent 70%);
  top: -10%; left: -10%;
  animation: float1 20s ease-in-out infinite alternate;
}

.aurora-2 {
  width: 450px; height: 450px;
  background: radial-gradient(circle, #F97316, transparent 70%);
  bottom: -10%; right: -10%;
  animation: float2 25s ease-in-out infinite alternate;
}

.aurora-3 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #06b6d4, transparent 70%);
  top: 40%; left: 50%;
  opacity: 0.12;
  animation: float3 30s ease-in-out infinite alternate;
}

@keyframes float1 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(60px, 80px) scale(1.2); }
  100% { transform: translate(-30px, 40px) scale(0.9); }
}

@keyframes float2 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-80px, -60px) scale(1.3); }
  100% { transform: translate(40px, -90px) scale(1.1); }
}

@keyframes float3 {
  0% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-30%, -60%) scale(1.4); }
  100% { transform: translate(-60%, -40%) scale(0.8); }
}

.grid-overlay {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: 
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 80%);
}

/* ===== PAYMENT GATE ===== */
.payment-gate {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(2, 6, 23, 0.78);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: 20px;
}

.payment-card {
  width: min(460px, 100%);
  background: rgba(15, 23, 42, 0.96);
  border: 1px solid rgba(52, 211, 153, 0.34);
  border-radius: 28px;
  padding: 26px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
}

.gate-kicker {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #5eead4;
  font-size: 11px;
  font-weight: 800;
  margin-bottom: 10px;
}

.payment-card h2 {
  font-size: clamp(28px, 4vw, 38px);
  line-height: 1.08;
  margin-bottom: 12px;
}

.gate-copy {
  color: #c7d2fe;
  line-height: 1.7;
  margin-bottom: 18px;
}

.gate-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: rgba(15, 118, 110, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.17);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 10px;
  color: #cbd5e1;
}

.gate-summary strong {
  color: #fff;
}

.pay-btn, .secondary-btn {
  width: 100%;
  border-radius: 12px;
  padding: 14px 16px;
  font-weight: 700;
  margin-top: 14px;
  transition: transform 0.2s ease;
}

.pay-btn {
  background: linear-gradient(135deg, #34d399, #5eead4);
  color: #052e2b;
}

.secondary-btn {
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #e2e8f0;
}

.pay-btn:hover, .secondary-btn:hover {
  transform: translateY(-1px);
}

/* ===== MAIN CONTENT ===== */
.roadmap-shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.roadmap-shell__sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 24px 16px 20px;
  background: linear-gradient(180deg, rgba(13, 20, 36, 0.96), rgba(8, 12, 22, 0.9));
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 8px 12px;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 700;
  font-size: 1.3rem;
  background: linear-gradient(135deg, #3ce6c3, #7db1ff, #ffb454);
  color: #07131f;
}

.brand-name {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.35rem;
  letter-spacing: -0.04em;
  color: #fff;
}

.brand-name span {
  color: #3ce6c3;
  font-style: italic;
}

.brand-subtitle {
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.8);
}

.sidebar-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10px;
  background: rgba(60, 230, 195, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
}

.profile-avatar {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #1d3a5f, #122544);
  color: #3ce6c3;
  font-weight: 700;
  font-size: 0.75rem;
}

.profile-name {
  font-weight: 700;
  font-size: 0.92rem;
}

.profile-meta {
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  color: rgba(148, 163, 184, 0.8);
  text-transform: uppercase;
}

.profile-badge {
  display: inline-block;
  margin-top: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 180, 84, 0.12);
  color: #ffb454;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.sidebar-label {
  padding: 0 8px;
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.8);
  font-weight: 700;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding-right: 4px;
}

.sidebar-nav__button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: rgba(148, 163, 184, 0.9);
  text-align: left;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-nav__button:hover,
.sidebar-nav__button.is-active {
  background: linear-gradient(135deg, rgba(60, 230, 195, 0.15), rgba(60, 230, 195, 0.05));
  color: #fff;
  border-color: rgba(255, 255, 255, 0.08);
}

.sidebar-nav__icon {
  width: 18px;
  text-align: center;
  color: inherit;
}

.sidebar-nav__pill {
  margin-left: auto;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(255, 122, 107, 0.12);
  color: #ff7a6b;
  font-size: 0.56rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sidebar-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-action__primary,
.sidebar-action__secondary {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.sidebar-action__primary {
  background: linear-gradient(135deg, #25d366, #128c5e);
  color: #04140b;
}

.sidebar-action__secondary {
  background: rgba(255, 255, 255, 0.04);
  color: rgba(148, 163, 184, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.content-wrapper {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.app-header {
  text-align: center;
  padding: 40px 16px 16px;
  animation: fadeInUp 1s ease-out 0.2s backwards;
}

.app-header h1 {
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 800;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #fff 0%, #F97316 50%, #8b5cf6 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s linear infinite;
}

@keyframes shimmer {
  to { background-position: 200% center; }
}

.app-header p {
  color: var(--muted);
  font-size: clamp(13px, 3vw, 15px);
  margin-top: 8px;
}

.layout {
  display: flex;
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  align-items: flex-start;
  position: relative;
}

.path-wrap {
  flex: 1;
  min-width: 0;
  position: relative;
}

.legend {
  display: flex;
  gap: clamp(12px, 3vw, 24px);
  justify-content: center;
  font-size: clamp(11px, 2.5vw, 13px);
  color: var(--muted);
  margin-bottom: 16px;
  animation: fadeInUp 1s ease-out 0.4s backwards;
}

.legend span { display: flex; align-items: center; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 8px currentColor; }
.dot.g { background: var(--green); color: var(--green); }
.dot.o { background: var(--primary); color: var(--primary); }
.dot.l { background: var(--locked); color: var(--locked); box-shadow: none; }

.path-svg { width: 100%; height: auto; display: block; overflow: visible; }
.trail { fill: none; stroke: #1a2130; stroke-width: 8; stroke-linecap: round; stroke-dasharray: 1 16; }
.trail-progress { fill: none; stroke: url(#progressGrad); stroke-width: 8; stroke-linecap: round; filter: url(#glow); }

/* ===== NODES ===== */
:deep(.node) { cursor: pointer; transform-box: fill-box; transform-origin: center; transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
:deep(.node:hover) { transform: scale(1.2); }
:deep(.node line) { stroke: var(--primary); stroke-width: 4.5; stroke-linecap: round; transition: stroke 0.4s, filter 0.4s; }
:deep(.node .halo) { fill: var(--primary); opacity: 0; transform-box: fill-box; transform-origin: center; }
:deep(.node text) { font-size: 13px; font-weight: 600; fill: var(--muted); text-anchor: middle; transition: fill 0.3s; pointer-events: none; }

:deep(.node.locked line) { stroke: var(--locked); }
:deep(.node.locked text) { fill: #4a5568; }

:deep(.node.done line) { stroke: var(--green); filter: drop-shadow(0 0 8px var(--green-glow)); }
:deep(.node.done text) { fill: var(--green); }

:deep(.node.current) { animation: pulse 2s ease-in-out infinite; }
:deep(.node.current line) { stroke: var(--primary); filter: drop-shadow(0 0 12px var(--primary-glow)); }
:deep(.node.current .halo) { animation: halo 2s ease-out infinite; }
:deep(.node.current text) { fill: var(--ink); font-weight: 700; }

@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }
@keyframes halo { 0% { opacity: 0.5; transform: scale(0.6); } 100% { opacity: 0; transform: scale(2); } }

.traveler { fill: var(--primary); stroke: #fff; stroke-width: 3; opacity: 0; transition: opacity 0.4s; filter: url(#glow); }

/* ===== ORBIT CARDS ===== */
.task-orbit {
  position: absolute;
  pointer-events: none;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 10;
}

:deep(.task-card) {
  position: absolute;
  background: linear-gradient(145deg, rgba(15, 20, 32, 0.95), rgba(10, 14, 24, 0.98));
  backdrop-filter: blur(20px);
  border: 1.5px solid rgba(249, 115, 22, 0.2);
  border-radius: 14px;
  padding: 14px 12px;
  width: clamp(110px, 14vw, 150px);
  min-height: 90px;
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.6), 
    inset 0 1px 0 rgba(255,255,255,0.05),
    0 0 0 1px rgba(249, 115, 22, 0.05);
  opacity: 0;
  transform: scale(0);
  transition: 
    opacity 0.5s, 
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), 
    border-color 0.3s, 
    box-shadow 0.3s;
  pointer-events: auto;
}

:deep(.task-card.show) { opacity: 1; transform: scale(1); }

:deep(.task-card:hover) {
  border-color: rgba(249, 115, 22, 0.6);
  box-shadow: 
    0 12px 40px rgba(0,0,0,0.7),
    0 0 30px rgba(249, 115, 22, 0.2),
    inset 0 1px 0 rgba(255,255,255,0.1);
  z-index: 20;
}

:deep(.task-card:active) { transform: scale(0.95) !important; }

:deep(.task-card.done) {
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.6),
    0 0 25px rgba(16, 185, 129, 0.15);
}

:deep(.task-card.done .task-text) { color: var(--muted); text-decoration: line-through; text-decoration-color: rgba(16, 185, 129, 0.6); }

:deep(.task-card-icon) {
  width: clamp(36px, 5vw, 44px);
  height: clamp(36px, 5vw, 44px);
  border-radius: 12px;
  background: linear-gradient(145deg, var(--surface-light), var(--surface));
  display: grid; place-items: center;
  font-size: clamp(18px, 3vw, 22px);
  flex: none;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
  transition: all 0.3s;
}

:deep(.task-card.done .task-card-icon) {
  background: linear-gradient(145deg, var(--green), #059669);
  box-shadow: 0 4px 20px var(--green-glow);
}

:deep(.task-text) {
  font-size: clamp(10px, 1.8vw, 12px);
  font-weight: 600;
  color: var(--ink);
  text-align: center;
  line-height: 1.3;
}

:deep(.task-checkbox) {
  position: absolute; top: 8px; right: 8px;
  width: 20px; height: 20px;
  border: 2px solid #4a5568; border-radius: 6px;
  display: grid; place-items: center;
  color: transparent; font-weight: 900; font-size: 13px;
  transition: all 0.3s;
}

:deep(.task-card.done .task-checkbox) { background: var(--green); border-color: var(--green); color: #fff; box-shadow: 0 0 12px var(--green-glow); }

:deep(.orbit-ring) {
  position: absolute;
  border: 1.5px dashed rgba(249, 115, 22, 0.25);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.6s;
}

:deep(.orbit-ring.show) { opacity: 1; }

:deep(.continue-btn) {
  position: absolute;
  background: linear-gradient(135deg, #fb923c, #ea580c);
  border: none; border-radius: 16px;
  padding: clamp(12px, 2vw, 16px) clamp(20px, 4vw, 32px);
  cursor: pointer; user-select: none;
  font-size: clamp(13px, 2vw, 15px);
  font-weight: 700; color: #fff; white-space: nowrap;
  box-shadow: 0 10px 40px rgba(249, 115, 22, 0.5);
  opacity: 0; transform: scale(0);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: auto;
  animation: btnPulse 2s infinite;
  z-index: 30;
}

:deep(.continue-btn.show) { opacity: 1; transform: scale(1); }
:deep(.continue-btn:hover) { transform: scale(1.08) translateY(-2px); }
:deep(.continue-btn:active) { transform: scale(0.95); }

@keyframes btnPulse {
  0%, 100% { box-shadow: 0 10px 40px rgba(249, 115, 22, 0.4); }
  50% { box-shadow: 0 15px 50px rgba(249, 115, 22, 0.7); }
}

/* ========== DESKTOP DETAILS SIDEBAR ========== */
.details-sidebar {
  width: 360px;
  flex-shrink: 0;
  position: sticky;
  top: 40px;
  height: fit-content;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(165deg, rgba(15, 20, 32, 0.85), rgba(10, 14, 24, 0.92));
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  animation: sidebarEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.details-sidebar::-webkit-scrollbar {
  width: 6px;
}

.details-sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 3px;
}

.details-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 3px;
}

.details-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes sidebarEnter {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.sidebar-fade-enter-active,
.sidebar-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.sidebar-fade-enter-from,
.sidebar-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.sidebar-header {
  margin-bottom: 24px;
}

.sidebar-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.25);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #F97316;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

.badge-icon {
  font-size: 8px;
  line-height: 1;
}

.badge-icon.state-done { color: var(--green); text-shadow: 0 0 8px var(--green-glow); }
.badge-icon.state-current { color: var(--primary); text-shadow: 0 0 8px var(--primary-glow); }
.badge-icon.state-locked { color: var(--locked); }

.sidebar-title {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.3px;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #fff 30%, #F97316 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.3;
}

.sidebar-blurb {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.sidebar-progress {
  margin-bottom: 28px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
}

.progress-percent {
  color: var(--primary);
  font-weight: 800;
  font-size: 15px;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #F97316, #FBBF24);
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 12px rgba(249, 115, 22, 0.5);
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmerBar 2s infinite;
}

@keyframes shimmerBar {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  font-size: 12px;
  color: var(--muted);
  font-weight: 500;
}

.sidebar-section {
  margin-bottom: 28px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.section-icon {
  font-size: 14px;
}

.learning-points {
  list-style: none;
  padding: 0;
  margin: 0;
}

.learning-points li {
  position: relative;
  padding-left: 24px;
  margin-bottom: 10px;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.6;
}

.learning-points li::before {
  content: '✦';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--accent);
  font-size: 10px;
  line-height: 1.6;
}

.sidebar-tasks {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-tasks li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.sidebar-tasks li:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

.sidebar-tasks li.done {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.2);
}

.sidebar-tasks li.done .task-name {
  color: var(--muted);
  text-decoration: line-through;
}

.task-icon {
  font-size: 18px;
  flex-shrink: 0;
  width: 28px;
  text-align: center;
}

.task-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  line-height: 1.4;
}

.task-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  border: 2px solid var(--green);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.task-check svg {
  width: 12px;
  height: 12px;
  color: var(--green);
  stroke-width: 3;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar-tasks li.done .task-check {
  background: var(--green);
  box-shadow: 0 0 12px var(--green-glow);
}

.sidebar-tasks li.done .task-check svg {
  opacity: 1;
  color: #fff;
}

.sidebar-action {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05));
  border: 1.5px solid rgba(249, 115, 22, 0.3);
  border-radius: 14px;
  color: #F97316;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.sidebar-action:hover {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(249, 115, 22, 0.1));
  border-color: rgba(249, 115, 22, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.2);
}

.sidebar-action svg {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.sidebar-action:hover svg {
  transform: translateX(4px);
}

.sidebar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  color: var(--muted);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.sidebar-empty h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 10px;
}

.sidebar-empty p {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

/* ========== HIDE SIDEBAR ON MOBILE ========== */
@media (max-width: 860px) {
  .roadmap-shell {
    grid-template-columns: 1fr;
  }

  .roadmap-shell__sidebar {
    display: none;
  }

  .details-sidebar {
    display: none !important;
  }
}

/* ===== COMPLETION OVERLAY ===== */
.complete-overlay {
  position: fixed; inset: 0;
  background: rgba(6, 9, 19, 0.96);
  backdrop-filter: blur(24px);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  z-index: 1000;
  opacity: 0; pointer-events: none;
  transition: opacity 0.5s;
}

.complete-overlay.show { opacity: 1; pointer-events: auto; }

.complete { text-align: center; padding: 40px 20px; animation: fadeInUp 0.6s ease-out; }
.complete .emoji { font-size: clamp(56px, 10vw, 80px); margin-bottom: 20px; animation: bounce 1s infinite alternate; }

@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-15px); } }

.complete h2 {
  font-size: clamp(26px, 5vw, 36px);
  margin-bottom: 12px;
  background: linear-gradient(135deg, #fff, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.complete p { color: var(--muted); font-size: clamp(14px, 3vw, 16px); margin-bottom: 28px; }

.complete button {
  padding: clamp(14px, 3vw, 18px) clamp(28px, 5vw, 40px);
  border: none; border-radius: 16px; cursor: pointer;
  background: linear-gradient(135deg, var(--green), #059669);
  color: #fff; font-weight: 700; font-size: clamp(14px, 3vw, 16px);
  box-shadow: 0 10px 30px var(--green-glow);
  transition: all 0.3s;
}

.complete button:hover { transform: translateY(-3px); box-shadow: 0 15px 40px var(--green-glow); }
.complete button:active { transform: scale(0.97); }

/* ===== MOBILE OPTIMIZATIONS ===== */
/* The mobile layout is treated as the hero experience: a sticky frosted
   header, glassy legend chips, punchier nodes, and larger, easier-to-tap
   orbit cards — tuned to feel native on a phone. */
@media (max-width: 860px) {
  /* Sticky frosted header so the title/progress stays in view while the
     long trail scrolls underneath it. */
  .app-header {
    position: sticky;
    top: 0;
    z-index: 5;
    padding: calc(16px + env(safe-area-inset-top)) 16px 12px;
    background: linear-gradient(180deg, rgba(6,9,19,0.92) 0%, rgba(6,9,19,0.75) 65%, transparent 100%);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
  .app-header h1 { letter-spacing: -0.3px; }
  .app-header p { max-width: 34ch; margin: 6px auto 0; }

  .layout { flex-direction: column; padding: 6px 10px 48px; gap: 6px; }

  /* Legend reads as frosted pills that wrap cleanly on any width. */
  .legend {
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }
  .legend span {
    background: rgba(15,20,32,0.62);
    border: 1px solid var(--border);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 7px 13px;
    border-radius: 999px;
    font-weight: 600;
  }

  /* Warmer, softer aurora + finer grid so the background feels premium
     rather than busy on a small screen. */
  .aurora-1 { width: 300px; height: 300px; }
  .aurora-2 { width: 280px; height: 280px; }
  .aurora-3 { width: 250px; height: 250px; }
  .aurora { opacity: 0.24; filter: blur(64px); }
  .grid-overlay { background-size: 40px 40px; }

  .learning-app { padding-bottom: env(safe-area-inset-bottom); }

  /* Node labels are larger and brighter so they stay legible at phone size. */
  :deep(.node text) { font-size: 15px; font-weight: 700; }
  :deep(.node line) { stroke-width: 5.5; }

  /* Orbit cards: frostier, rounder, with a real pressed state for touch. */
  :deep(.task-card) {
    border-radius: 18px;
    box-shadow:
      0 12px 34px rgba(0,0,0,0.6),
      0 0 0 1px rgba(249,115,22,0.08),
      inset 0 1px 0 rgba(255,255,255,0.07);
  }
  :deep(.task-card:active) {
    transform: scale(0.9) !important;
    border-color: rgba(249,115,22,0.7);
  }

  /* Continue button = a big, thumb-friendly target. */
  :deep(.continue-btn) {
    padding: 16px 30px;
    border-radius: 18px;
    font-size: 15px;
    box-shadow: 0 12px 44px rgba(249,115,22,0.55);
  }
}

@media (max-width: 480px) {
  .app-header h1 { font-size: clamp(22px, 6.5vw, 28px); }

  :deep(.task-card) {
    width: clamp(96px, 32vw, 122px);
    min-height: 82px;
    padding: 12px 9px;
    gap: 7px;
    border-radius: 16px;
  }
  :deep(.task-card-icon) { width: 38px; height: 38px; font-size: 18px; border-radius: 11px; }
  :deep(.task-text) { font-size: 11px; line-height: 1.35; }
  :deep(.task-checkbox) { width: 20px; height: 20px; font-size: 12px; top: 7px; right: 7px; }
}

/* Extra-small phones: keep cards from crowding the orbit. */
@media (max-width: 360px) {
  :deep(.task-card) { width: clamp(88px, 30vw, 104px); min-height: 76px; padding: 10px 7px; }
  :deep(.task-text) { font-size: 10px; }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ===== DAY-BY-DAY CLASS PLAN (AI daily-plan engine) ===== */
.daily-plan-list {
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.daily-plan-item {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
}

.dp-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
  color: #94a3b8;
}

.dp-num {
  font-weight: 700;
  color: #64748b;
}

.dp-topic {
  display: block;
  font-size: 12.5px;
  margin-top: 5px;
  line-height: 1.35;
  color: #f1f5f9;
}

.dp-task {
  margin: 6px 0 0;
  font-size: 11px;
  color: #fbbf24;
  line-height: 1.45;
}

.dp-break {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 7px;
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.45;
}

.dp-source {
  margin-top: 10px;
  font-size: 11px;
  color: #94a3b8;
}

.dp-source.is-ai {
  color: #5eead4;
  font-weight: 600;
}

.plan-ai-btn {
  margin-top: 10px;
  width: 100%;
  border: 1px solid rgba(94, 234, 212, 0.4);
  background: rgba(94, 234, 212, 0.08);
  color: #5eead4;
  font-weight: 700;
  font-size: 12px;
  padding: 9px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.plan-ai-btn:hover:not(:disabled) {
  background: rgba(94, 234, 212, 0.16);
}

.plan-ai-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.dp-note {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 8px;
  line-height: 1.5;
}
</style>