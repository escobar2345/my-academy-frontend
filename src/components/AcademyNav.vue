<template>
  <!-- Desktop / top bar. Fixed, so it overlays the page rather than taking
       layout space — pages that need clearance add their own top padding. -->
  <nav class="nav" :class="{ 'nav--scrolled': scrolled }">
    <!-- On the tour this is plain text: a link back to the page you are already
         on is a dead link. Everywhere else it is the way home. -->
    <component
      :is="isTour ? 'div' : 'router-link'"
      :to="isTour ? undefined : TOUR_URL"
      class="nav-mark"
    >
      <span class="dot"></span>DEVSPHERE
    </component>

    <!-- Same NAV_ITEMS list drives this row and the mobile bar below, so the
         two can never show different things again. -->
    <div class="nav-links">
      <template v-for="item in NAV_ITEMS" :key="item.label">
        <a
          v-if="item.programs"
          :href="programsHref"
          @click.prevent="goToPrograms"
          >{{ item.label }}</a
        >
        <router-link v-else :to="item.to">{{ item.label }}</router-link>
      </template>
    </div>

    <div class="nav-actions">
      <router-link :to="LOGIN_URL" class="nav-login">Login</router-link>
      <router-link :to="APPLY_URL" class="nav-cta">Apply now</router-link>
    </div>
  </nav>

  <!-- Mobile floating bottom bar. Hidden above the breakpoint; below it, it
       carries the navigation the top bar drops. Same NAV_ITEMS as the top bar. -->
  <nav class="mobile-navbar" aria-label="Mobile navigation">
    <template v-for="item in NAV_ITEMS" :key="item.label">
      <a
        v-if="item.programs"
        :href="programsHref"
        @click.prevent="goToPrograms"
        class="mnav-item"
      >
        <span class="mnav-icon" aria-hidden="true">{{ item.icon }}</span>
        <span class="mnav-label">{{ item.label }}</span>
      </a>
      <router-link v-else :to="item.to" class="mnav-item">
        <span class="mnav-icon" aria-hidden="true">{{ item.icon }}</span>
        <span class="mnav-label">{{ item.label }}</span>
      </router-link>
    </template>
  </nav>
</template>

<script setup>
/* The site nav, in one place. Previously this markup and its ~100 lines of CSS
   lived only in BoiAcademy.vue while the other pages carried a reduced two-link
   bar; every page now mounts this instead, so the two can no longer drift.

   It is deliberately self-sufficient: no GSAP, no props, no page setup. Drop it
   inside a .boi-page or .boi-academy root — it inherits the design tokens from
   whichever one — and it works. */
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  APPLY_URL,
  LOGIN_URL,
  ACADEMY_URL,
  PARTNERS_URL,
  TECH_TEAM_URL,
  TOUR_URL,
  TOUR_ROUTE_NAME,
} from "../constants/academy";

const route = useRoute();
const router = useRouter();

// The one list both bars render. Keeping it here (rather than as markup in two
// places) is what stops the desktop row and the mobile bar from drifting apart.
// "Tech-Team" navigates to the TECH_TEAM_URL coming-soon page instead of
// scrolling — it used to carry `programs: true`, which rendered it as an <a>
// that called goToPrograms().
const NAV_ITEMS = [
  { label: "Academy", icon: "🏛", to: ACADEMY_URL },
  { label: "Work-space", icon: "🖥", to: "/workspace" },
  { label: "Internet", icon: "🌐", to: "/internet" },
  { label: "Tech-Team", icon: "🧑‍💼", to: TECH_TEAM_URL },
  { label: "Partners", icon: "🤝", to: PARTNERS_URL },
];

// By route name, not path: /academy also answers to /BoiAcademy, /boiacademy
// and /boi-academy, and comparing paths would miss all three.
const isTour = computed(() => route.name === TOUR_ROUTE_NAME);

// A real href either way, so middle-click and "open in new tab" still work.
const programsHref = computed(() =>
  isTour.value ? "#apply" : `${TOUR_URL}#apply`,
);

function goToPrograms() {
  if (!isTour.value) {
    // Off the tour there is nothing to scroll to — go there, and let the
    // router's scrollBehavior handle the #apply hash on arrival.
    router.push(`${TOUR_URL}#apply`);
    return;
  }
  // On the tour, scroll to the page end rather than to #apply itself: the
  // footer is the last element, so this lands on it while leaving the closing
  // section's own bottom padding as breathing room instead of pinning the text
  // flush to the screen edge. Reduced-motion jumps instead.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: reduce ? "auto" : "smooth",
  });
}

/* The bar darkens once you leave the top of the page. This used to be a GSAP
   ScrollTrigger registered by BoiAcademy, which meant the class simply never
   appeared on any other page. A passive scroll listener does the same job and
   travels with the component. */
const scrolled = ref(false);
// Matches the old trigger's `start: 'top -80'`.
const SCROLL_THRESHOLD = 80;

function handleScroll() {
  scrolled.value = window.scrollY > SCROLL_THRESHOLD;
}

onMounted(() => {
  // Seed it: a page restored mid-scroll (back button) must not start clear.
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
/* Scoped, so these bare selectors cannot collide with anything on the pages
   that mount this. Colours and easing curves are inherited custom properties —
   both .boi-page and .boi-academy define the same set. */

/* ---------------- DESKTOP / TOP BAR ---------------- */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px clamp(20px, 4vw, 56px);
  transition:
    background 0.3s ease,
    backdrop-filter 0.3s ease,
    padding 0.3s ease;
}
.nav.nav--scrolled {
  background: rgba(7, 20, 13, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding-top: 16px;
  padding-bottom: 16px;
}
.nav-mark {
  font-family: "Space Grotesk", sans-serif;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.01em;
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
}
.nav-mark .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gold);
}
.nav-links {
  display: flex;
  gap: 32px;
  font-size: 13px;
  letter-spacing: 0.04em;
}
.nav-links a {
  position: relative;
  text-decoration: none;
  opacity: 0.8;
  padding-bottom: 3px;
  transition: opacity 0.2s var(--ease-calm);
}
.nav-links a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1.5px;
  background: var(--gold);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.28s var(--ease-calm);
}
.nav-links a:hover {
  opacity: 1;
}
.nav-links a:hover::after {
  transform: scaleX(1);
}
/* The page you are on stays underlined — on the tour every link went somewhere
   else, but now that the bar rides along it should say where "here" is. */
.nav-links a.router-link-active {
  opacity: 1;
}
.nav-links a.router-link-active::after {
  transform: scaleX(1);
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
/* Text link, deliberately quieter than the Apply pill: sign-in is the return
   path for people who already joined, so it sits beside the primary CTA without
   competing with it. Stays visible at every width — on mobile the top bar is the
   only place Login lives, since the bottom bar carries the section links. */
.nav-login {
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  color: inherit;
  opacity: 0.82;
  white-space: nowrap;
  padding: 9px 6px;
  transition: opacity 0.2s var(--ease-calm);
}
.nav-login:hover {
  opacity: 1;
}
.nav-login.router-link-active {
  opacity: 1;
}
.nav-cta {
  border: 1px solid rgba(246, 244, 236, 0.5);
  padding: 9px 18px;
  border-radius: 999px;
  white-space: nowrap;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  transition:
    background 0.2s var(--ease-calm),
    color 0.2s var(--ease-calm),
    border-color 0.2s var(--ease-calm),
    transform 0.12s var(--ease-spring);
}
.nav-cta:hover {
  background: var(--gold);
  color: var(--ink);
  border-color: var(--gold);
}
.nav-cta:active {
  transform: scale(0.96);
}
@media (max-width: 780px) {
  .nav-links {
    display: none;
  }
}
/* One pill beside the wordmark — keep it comfortable on a narrow phone. */
@media (max-width: 430px) {
  .nav-cta {
    padding: 8px 12px;
    letter-spacing: 0.04em;
  }
  .nav-login {
    padding: 8px 2px;
    letter-spacing: 0.03em;
  }
  .nav-mark {
    font-size: 14px;
  }
}

/* ---------------- MOBILE FLOATING BOTTOM NAV (mobile only) ---------------- */
/* Hidden on desktop by default; only revealed within the mobile breakpoint. */
.mobile-navbar {
  display: none;
}

@media (max-width: 780px) {
  .mobile-navbar {
    display: flex;
    align-items: center;
    justify-content: space-around;
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: 12px;
    z-index: 60;
    padding: 8px 10px;
    background: rgba(7, 20, 13, 0.82);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(246, 244, 236, 0.14);
    border-radius: 20px;
    box-shadow: 0 12px 34px -10px rgba(0, 0, 0, 0.6);
    /* Keyboard/safe-area inset so the bar clears iPhone home indicator */
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
  }
  .mobile-navbar .mnav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    text-decoration: none;
    color: var(--paper-dim);
    padding: 6px 8px;
    border-radius: 12px;
    transition:
      color 0.2s var(--ease-calm),
      background 0.2s var(--ease-calm),
      transform 0.12s var(--ease-spring);
    min-width: 0;
    flex: 0 1 auto;
  }
  .mobile-navbar .mnav-icon {
    font-size: 18px;
    line-height: 1;
    color: var(--gold);
  }
  .mobile-navbar .mnav-label {
    font-family: "Space Grotesk", sans-serif;
    font-size: 10px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .mobile-navbar .mnav-item:hover {
    color: var(--paper);
  }
  .mobile-navbar .mnav-item:active {
    transform: scale(0.94);
  }
  .mobile-navbar .mnav-item.router-link-active {
    color: var(--paper);
    background: rgba(210, 166, 59, 0.16);
  }
  .mobile-navbar .mnav-item.router-link-active .mnav-icon {
    color: var(--gold);
  }
}
</style>
