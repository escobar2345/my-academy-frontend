<template>
  <div class="tcg" :class="{ active: authed }">
    <div v-if="state === 'checking'" class="tcg-card">
      <p class="kicker">BOIRSU SCHOOL / TEACHER SIGN-IN</p>
      <p class="muted">Checking your teacher session…</p>
    </div>

    <div v-else-if="!authed" class="tcg-card">
      <p class="kicker">BOIRSU SCHOOL / TEACHER SIGN-IN</p>
      <h1>Teacher classroom access</h1>
      <p class="muted">
        Teacher accounts are created by the school admin or a partner in the
        school portal — there is no self-signup. Ask them for your login
        (email + password), then sign in below.
      </p>
      <form @submit.prevent="signIn">
        <label>Email <input v-model="email" type="email" required autocomplete="username" placeholder="teacher@school.com" /></label>
        <label>Password <input v-model="password" type="password" required autocomplete="current-password" placeholder="••••••••" /></label>
        <button type="submit" class="tcg-btn" :disabled="busy">{{ busy ? 'Signing in…' : 'Sign in to the classroom' }}</button>
      </form>
      <p v-if="msg" class="msg" :class="{ warn: !msg.ok }">{{ msg.text }}</p>
      <p v-if="kicked" class="msg warn">You were signed out because this account was used on another device. Sign in again to continue here.</p>
    </div>

    <template v-else>
      <Classroom role="teacher" :display-name="teacherName" />
      <button class="tcg-signout" :disabled="signingOut" @click="signOut">{{ signingOut ? 'Signing out…' : 'Sign out · ' + teacherName }}</button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Classroom from '../Classroom.vue'
import { verifyPassword, newSessionToken } from './schoolAuth.js'
import { pgSelect, pgUpdate } from '../../lib/pgdb.js'

const state = ref('checking') // checking | login | active
const authed = ref(false)
const email = ref('')
const password = ref('')
const busy = ref(false)
const msg = ref(null)
const kicked = ref(false)
const teacher = ref(null)
const signingOut = ref(false)
const teacherName = computed(() => teacher.value?.name || 'Teacher')

const LS_KEY = 'boi_teacher_session'

// Resume: our stored token must still be the one on the account row. If a
// newer login replaced it, or the teacher was removed or deactivated, the
// session is dead — that is the single-device rule.
async function sessionTeacher() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const { id, token } = JSON.parse(raw) || {}
    if (!id || !token) return null
    const { data, error } = await pgSelect('teachers', {
      select: 'teacher_id,name,login_email,status,session_token',
      eq: { teacher_id: id },
      single: true,
    })
    if (error || !data) return null
    if (data.status !== 'active' || data.session_token !== token) return null
    return data
  } catch {
    return null
  }
}

async function resume() {
  state.value = 'checking'
  const t = await sessionTeacher()
  if (t) {
    teacher.value = t
    authed.value = true
    state.value = 'active'
    startPolling()
  } else {
    localStorage.removeItem(LS_KEY)
    state.value = 'login'
  }
}

async function signIn() {
  busy.value = true
  msg.value = null
  kicked.value = false
  try {
    const mail = email.value.trim().toLowerCase()
    const { data, error } = await pgSelect('teachers', {
      select: 'teacher_id,name,login_email,status,password_salt,password_hash',
      eq: { login_email: mail },
      single: true,
    })
    if (error) throw error
    if (!data || !data.password_hash) throw new Error('No teacher account with that email. Ask the admin or a partner to create your teacher account.')
    if (data.status !== 'active') throw new Error('This teacher account has been deactivated.')
    const ok = await verifyPassword(password.value, data.password_salt, data.password_hash)
    if (!ok) throw new Error('Wrong email or password.')
    // Single device per teacher: the newest login replaces the stored session
    // token, so every older device is signed out within 30 seconds.
    const token = newSessionToken()
    const { error: upErr } = await pgUpdate('teachers', { session_token: token, session_active_at: new Date().toISOString() }, { teacher_id: data.teacher_id })
    if (upErr) throw upErr
    localStorage.setItem(LS_KEY, JSON.stringify({ id: data.teacher_id, token }))
    teacher.value = { teacher_id: data.teacher_id, name: data.name, login_email: data.login_email }
    authed.value = true
    state.value = 'active'
    startPolling()
  } catch (e) {
    msg.value = { ok: false, text: e.message || 'Sign-in failed.' }
  } finally {
    busy.value = false
  }
}

async function signOut() {
  signingOut.value = true
  try {
    if (teacher.value) {
      await pgUpdate('teachers', { session_token: null }, { teacher_id: teacher.value.teacher_id })
    }
  } catch { /* best effort */ }
  localStorage.removeItem(LS_KEY)
  teacher.value = null
  authed.value = false
  state.value = 'login'
  stopPolling()
  signingOut.value = false
}

let poll = null
function startPolling() {
  stopPolling()
  poll = setInterval(async () => {
    if (!authed.value) { stopPolling(); return }
    const t = await sessionTeacher()
    if (!t) {
      kicked.value = true
      authed.value = false
      state.value = 'login'
      teacher.value = null
      localStorage.removeItem(LS_KEY)
      stopPolling()
    }
  }, 30000)
}
function stopPolling() { if (poll) { clearInterval(poll); poll = null } }

onMounted(resume)
onUnmounted(stopPolling)
</script>

<style scoped>
.tcg { min-height: 100vh; background: #0c1f16; display: grid; place-items: center; padding: 24px; color: #f3ecd6; font-family: 'Space Grotesk', system-ui, sans-serif; }
.tcg.active { display: block; padding: 0; }
.tcg-card { width: min(460px, 100%); background: #102321; border: 1px solid #34534a; border-radius: 14px; padding: 30px; }
.kicker { margin: 0 0 10px; color: #e3a65e; font: 600 11px monospace; letter-spacing: .14em; }
.tcg-card h1 { margin: 0 0 12px; font: 500 30px Georgia, serif; color: #f4f1e8; }
.muted { color: #aebcb0; font-size: 13px; line-height: 1.6; }
.tcg-card form { display: grid; gap: 12px; margin-top: 18px; }
.tcg-card label { display: grid; gap: 6px; color: #c7d1c7; font-size: 12.5px; }
.tcg-card input { padding: 12px; background: #102b27; border: 1px solid #45635b; color: #f4f1e8; font: inherit; }
.tcg-btn { margin-top: 4px; padding: 13px; border: none; background: #e3a65e; color: #102321; font-weight: 700; cursor: pointer; }
.tcg-btn:disabled { opacity: .6; cursor: wait; }
.msg { margin-top: 14px; padding: 10px 12px; font-size: 12.5px; background: #244d3c; color: #bce0bd; }
.msg.warn { background: #4d2b24; color: #f0b4a4; }
.tcg-signout { position: fixed; left: 14px; bottom: 14px; z-index: 60; padding: 9px 13px; border: 1px solid #45635b; background: #102321; color: #aebcb0; font: 600 11px monospace; cursor: pointer; }
.tcg-signout:hover { color: #f4f1e8; }
</style>
