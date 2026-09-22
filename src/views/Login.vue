<template>
  <div class="boi-page login-page">
    <AcademyNav />

    <main class="login-wrap">
      <div class="login-card">
        <div class="p-eyebrow">Member access</div>
        <h1 class="login-title">Welcome back.</h1>
        <p class="login-sub">Sign in to reach your cohort, your roadmap, and the floor.</p>

        <!-- Real sign-in: POSTs /api/student/login on api_server.py and lands
             on /dashboard with the student's id stored for every other page. -->
        <form class="login-form" novalidate @submit.prevent="onSubmit">
          <label class="field">
            <span class="field-label">Email</span>
            <input
              v-model.trim="email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              :aria-invalid="!!errors.email"
            >
            <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
          </label>

          <label class="field">
            <span class="field-label">Password</span>
            <div class="field-pw">
              <input
                v-model="password"
                :type="showPw ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
                :aria-invalid="!!errors.password"
              >
              <button type="button" class="pw-toggle" @click="showPw = !showPw">
                {{ showPw ? 'Hide' : 'Show' }}
              </button>
            </div>
            <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
          </label>

          <div class="login-row">
            <label class="remember">
              <input v-model="remember" type="checkbox">
              <span>Keep me signed in</span>
            </label>
            <a href="#" class="login-link" @click.prevent="notice = 'Password reset is not connected yet.'">
              Forgot password?
            </a>
          </div>

          <button type="submit" class="p-btn p-btn-solid login-submit">Sign in</button>

          <p v-if="notice" class="login-notice" role="status">{{ notice }}</p>
        </form>

        <p class="login-alt">
          No account yet?
          <router-link :to="APPLY_URL" class="login-link">Apply for a place</router-link>
        </p>
      </div>

      <div class="p-foot login-foot">
        BOI Academy · Lagos Innovation Hub · Supporting African Entrepreneurship
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import AcademyNav from '../components/AcademyNav.vue'
import { APPLY_URL } from '../constants/academy'
import * as api from '../../boi-school/aiClient.js'

const router = useRouter()
const email = ref('')
const password = ref('')
const remember = ref(false)
const showPw = ref(false)
const signingIn = ref(false)
const notice = ref('')
const errors = reactive({ email: '', password: '' })

async function onSubmit() {
  errors.email = ''
  errors.password = ''
  notice.value = ''

  if (!email.value) errors.email = 'Enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) errors.email = 'That email does not look right.'
  if (!password.value) errors.password = 'Enter your password.'

  if (errors.email || errors.password) return

  signingIn.value = true
  const res = await api.loginStudent({ email: email.value.trim(), password: password.value })
  signingIn.value = false

  if (!res || !res.success || !res.student) {
    notice.value = (res && res.error)
      ? res.error
      : 'Could not reach the sign-in server. Start the backend (api_server.py) and retry.'
    return
  }

  const s = res.student
  localStorage.setItem('boi_student_id', s.student_id || '')
  localStorage.setItem('boi_student_email', (s.email || email.value).toLowerCase())
  if (s.career_path) localStorage.setItem('boi_career_path', s.career_path)
  localStorage.setItem('boi_student_profile', JSON.stringify(s))
  router.push('/dashboard')
}
</script>

<style src="../assets/boi-page.css"></style>

<style scoped>
/* Page-specific only — the shell, tokens, and .p-btn come from boi-page.css. */
.login-page { display: flex; flex-direction: column; }
.login-wrap {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 40px;
  padding: clamp(40px, 8vh, 90px) clamp(20px, 5vw, 64px) clamp(28px, 5vh, 56px);
}
.login-card {
  width: 100%; max-width: 452px; padding: clamp(28px, 4vw, 44px);
  border: 1px solid rgba(246, 244, 236, 0.12); border-radius: 20px;
  background: linear-gradient(160deg, rgba(246, 244, 236, 0.06), rgba(246, 244, 236, 0.015));
  backdrop-filter: blur(8px);
}
.login-title {
  font-family: 'Space Grotesk', sans-serif; font-weight: 400;
  font-size: clamp(30px, 4.4vw, 42px); line-height: 1.1;
  letter-spacing: -0.02em; margin: 0 0 12px;
}
.login-sub {
  margin: 0 0 32px; font-size: 15px; line-height: 1.68;
  color: rgba(246, 244, 236, 0.78);
}
.login-form { display: flex; flex-direction: column; gap: 18px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field-label {
  font-family: 'Space Grotesk', sans-serif; font-size: 11px;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: rgba(246, 244, 236, 0.62);
}
.field input[type="email"],
.field input[type="password"],
.field input[type="text"] {
  width: 100%; padding: 13px 15px; border-radius: 10px;
  border: 1px solid rgba(246, 244, 236, 0.18);
  background: rgba(14, 28, 20, 0.55);
  color: #F6F4EC; font-family: 'Inter', sans-serif; font-size: 15px;
  transition: border-color .2s cubic-bezier(0.4, 0, 0.2, 1),
              background .2s cubic-bezier(0.4, 0, 0.2, 1);
}
.field input::placeholder { color: rgba(246, 244, 236, 0.34); }
.field input:focus {
  outline: none; border-color: rgba(210, 166, 59, 0.7);
  background: rgba(14, 28, 20, 0.8);
}
.field input[aria-invalid="true"] { border-color: rgba(224, 122, 95, 0.8); }
.field-pw { position: relative; display: flex; }
.field-pw input { padding-right: 66px; }
.pw-toggle {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  border: 0; background: transparent; cursor: pointer; padding: 6px 9px;
  font-family: 'Space Grotesk', sans-serif; font-size: 11px;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(246, 244, 236, 0.66);
  transition: color .2s cubic-bezier(0.4, 0, 0.2, 1);
}
.pw-toggle:hover { color: #D2A63B; }
.field-error { font-size: 12.5px; color: #E07A5F; }
.login-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap; margin-top: 2px;
}
.remember {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13.5px; color: rgba(246, 244, 236, 0.78); cursor: pointer;
}
.remember input { accent-color: #D2A63B; width: 15px; height: 15px; cursor: pointer; }
.login-link {
  font-size: 13.5px; color: #D2A63B; text-decoration: none;
  border-bottom: 1px solid rgba(210, 166, 59, 0.36);
  transition: border-color .2s cubic-bezier(0.4, 0, 0.2, 1);
}
.login-link:hover { border-color: #D2A63B; }
.login-submit { width: 100%; margin-top: 8px; }
.login-notice {
  margin: 2px 0 0; padding: 11px 14px; border-radius: 10px;
  border: 1px solid rgba(210, 166, 59, 0.34);
  background: rgba(210, 166, 59, 0.09);
  font-size: 13.5px; line-height: 1.6; color: rgba(246, 244, 236, 0.9);
}
.login-alt {
  margin: 26px 0 0; padding-top: 22px;
  border-top: 1px solid rgba(246, 244, 236, 0.1);
  font-size: 14px; color: rgba(246, 244, 236, 0.78);
}
.login-foot { margin-top: 0; border-top: 0; padding-top: 0; text-align: center; }

/* This page has no .p-cta, so the shared bottom clearance for the floating
   mobile nav doesn't reach it — its footer is the last child of .login-wrap,
   and the bar would sit right on top of that text. Same breakpoint AcademyNav
   uses to reveal the bar.

   The top padding and gap are cut here as well, and that is the part that
   actually matters. Unlike every other page this one is a single card that
   nearly fills a phone, so whether the footer clears the bar comes down to
   whether the page overflows at all: with the card at ~566px, the desktop
   spacing pushed the document 70px past an 844px viewport, which left the
   footer sitting under the bar until you scrolled. Raising the bottom padding
   cannot fix that — it moves the footer and the document end by the same
   amount — so the room has to come from above it. */
@media (max-width: 780px) {
  .login-wrap {
    padding-top: clamp(14px, 2vh, 32px);
    padding-bottom: calc(100px + env(safe-area-inset-bottom));
    gap: 18px;
  }
}

@media (max-width: 480px) {
  .login-card { padding: 24px 20px; }
}
</style>
