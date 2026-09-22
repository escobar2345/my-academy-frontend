<template>
  <!-- Coming-soon page for the Tech-Team. The nav's "Tech-Team" item lands here.
       Reuses the shared .boi-page shell so it matches the other satellite pages
       and the nav works with no extra setup. -->
  <div class="boi-page">
    <AcademyNav />

    <main class="partners-hero">
      <div class="partners-body">
        <div class="p-eyebrow">Tech-Team</div>
        <span class="coming-badge">
          <span class="badge-dot" aria-hidden="true"></span>Coming soon
        </span>
        <h1 class="p-title">Meet the <em>Tech-Team.</em></h1>
        <p class="p-sub">
          We're putting together the team page — the builders, mentors, and
          instructors behind BOI Academy. It isn't live yet, but it's coming.
          Check back shortly.
        </p>
        <div class="partners-actions">
          <router-link :to="ACADEMY_URL" class="p-btn p-btn-solid">
            Apply to the Academy<span class="p-btn-arrow" aria-hidden="true">→</span>
          </router-link>
          <router-link :to="TOUR_URL" class="p-btn">Back to the tour</router-link>
        </div>
      </div>

      <div class="p-foot">BOI Academy · Lagos Innovation Hub · Supporting African Entrepreneurship</div>
    </main>
  </div>
</template>

<script setup>
import AcademyNav from '../components/AcademyNav.vue'
import { ACADEMY_URL, TOUR_URL } from '../constants/academy'
</script>

<style src="../assets/boi-page.css"></style>

<style scoped>
/* One screen, content centred. The body block takes auto margins top and bottom
   (the same trick the tour hero uses) so it sits in the middle while the footer
   is pushed to the bottom of the column — no absolute positioning, so the two
   can't overlap on a short laptop. */
.partners-hero {
  max-width: 820px;
  margin: 0 auto;
  min-height: calc(100vh - var(--nav-h));
  min-height: calc(100dvh - var(--nav-h));
  display: flex;
  flex-direction: column;
  padding: 0 clamp(20px, 5vw, 64px) clamp(28px, 5vh, 56px);
}
.partners-body { margin: auto 0; }
.partners-hero .p-title { margin-top: 0; }

.coming-badge {
  display: inline-flex; align-items: center; gap: 9px; align-self: flex-start;
  margin-bottom: 22px; padding: 7px 14px;
  border: 1px solid rgba(210, 166, 59, 0.4); border-radius: 999px;
  font-family: 'Space Grotesk', sans-serif; font-size: 11px;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold);
}
.coming-badge .badge-dot {
  width: 7px; height: 7px; border-radius: 50%; background: var(--gold);
  animation: badge-pulse 2.4s var(--ease-calm) infinite;
}
@keyframes badge-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(210, 166, 59, 0.5); }
  70%  { box-shadow: 0 0 0 9px rgba(210, 166, 59, 0); }
  100% { box-shadow: 0 0 0 0 rgba(210, 166, 59, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .coming-badge .badge-dot { animation: none; }
}

.partners-actions {
  display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 36px;
}

/* This footer is not inside a .p-cta, so it owns its own clearance from the
   floating mobile bar (the shared sheet only pads .p-cta). Measured at rest —
   the bar sits ~76px up from the bottom edge. */
@media (max-width: 780px) {
  .partners-hero { padding-bottom: calc(100px + env(safe-area-inset-bottom)); }
}
</style>
