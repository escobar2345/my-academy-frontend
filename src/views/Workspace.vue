<template>
  <div class="ws-page">
    <AcademyNav />

    <header class="phero">
      <div class="phero-bg" :style="{ backgroundImage: `url(${brandedDesksImg})` }" aria-hidden="true"></div>
      <canvas ref="heroCanvas" class="phero-canvas" aria-hidden="true"></canvas>
      <div class="p-eyebrow">Work-space</div>
      <h1 class="p-title">A desk that works<em>as hard as you do.</em></h1>
      <p class="p-sub">
        Room to build, on the floor where it happens. Take a desk for a month or a
        private office for a year — the fibre, the power, and the people come with it.
      </p>
      <router-link :to="APPLY_URL" class="p-btn">
        Get an office space<span class="p-btn-arrow" aria-hidden="true">→</span>
      </router-link>
    </header>

    <section class="p-section">
      <div class="p-section-bg" :style="{ backgroundImage: `url(${officeFloorImg})` }" aria-hidden="true"></div>
      <div class="p-kicker">01 — What you can take</div>
      <h2 class="p-h2">Four ways to sit with us</h2>
      <div class="p-grid">
        <article v-for="opt in options" :key="opt.name" class="p-card">
          <div class="p-card-top">
            <h3>{{ opt.name }}</h3>
            <span class="p-tag">{{ opt.term }}</span>
          </div>
          <p>{{ opt.copy }}</p>
          <ul>
            <li v-for="f in opt.features" :key="f">{{ f }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="p-section">
      <div class="p-section-bg" :style="{ backgroundImage: `url(${meetingPodsImg})` }" aria-hidden="true"></div>
      <div class="p-kicker">02 — Included, not extra</div>
      <h2 class="p-h2">The things that quietly ruin a workday</h2>
      <p class="p-lede">
        Every plan carries the same floor: uninterrupted power, symmetric fibre, and a
        front desk that knows your name. You should never be thinking about any of it.
      </p>
      <ul class="p-specs">
        <li v-for="item in included" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section class="p-cta">
      <div class="p-cta-bg" :style="{ backgroundImage: `url(${creativeHubImg})` }" aria-hidden="true"></div>
      <h2 class="p-cta-title">Come see the floor first.</h2>
      <p class="p-cta-sub">
        Walk the space, sit at a desk, test the internet. Bring a laptop and stay the
        afternoon — no one will rush you.
      </p>
      <div class="p-cta-row">
        <router-link :to="APPLY_URL" class="p-btn p-btn-solid">
          Get an office space
        </router-link>
        <router-link to="/membership" class="p-btn">See membership</router-link>
      </div>
      <div class="p-foot">BOI Academy · Lagos Innovation Hub · Supporting African Entrepreneurship</div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import AcademyNav from '../components/AcademyNav.vue'
import { APPLY_URL } from '../constants/academy'

// Background photos from the actual space, imported from src/assets/ so Vite
// fingerprints and bundles them. To swap one, change the import path — the four
// names below are what the template binds to, so nothing else needs touching.
import brandedDesksImg from '../assets/Gemini_Generated_Image_z1n0xez1n0xez1n0.png'
import officeFloorImg from '../assets/Gemini_Generated_Image_cyq9vqcyq9vqcyq9.png'
import meetingPodsImg from '../assets/Gemini_Generated_Image_sjwuaqsjwuaqsjwu.png'
import creativeHubImg from '../assets/Gemini_Generated_Image_cnykmdcnykmdcnyk.png'

gsap.registerPlugin(ScrollTrigger)

// Shared with AcademyNav and every other page — see src/constants/academy.js.
// This page used to keep its own copies alongside a hand-copied nav, which is
// how its "Academy" link ended up pointing somewhere different from the tour's.

const options = [
  {
    name: 'Hot desk',
    term: 'Monthly',
    copy: 'Any open desk, any day. Best if your week moves around.',
    features: ['Shared floor access', 'Weekday hours', 'Locker on request'],
  },
  {
    name: 'Dedicated desk',
    term: 'Monthly',
    copy: 'The same desk every morning, left exactly as you found it.',
    features: ['Your own desk and drawer', '24/7 access', 'Mail handling'],
  },
  {
    name: 'Private office',
    term: 'Yearly',
    copy: 'A door that closes, for teams that have outgrown the open floor.',
    features: ['2–12 person rooms', 'Lockable and brandable', 'Meeting room credits'],
  },
  {
    name: 'Meeting room',
    term: 'Hourly',
    copy: 'Book by the hour when you need a table and a screen.',
    features: ['Seats 4–14', 'Display and whiteboard', 'Front-desk reception'],
  },
]

const included = [
  'Symmetric fibre with a redundant second line',
  'Generator and inverter backup — no dark desks',
  'Air conditioning throughout the floor',
  'Printing, scanning, and secure document disposal',
  'Front desk, guest reception, and parcel handling',
  'Tea, coffee, and filtered water all day',
  'Access to the lounge, pods, and events floor',
]

/* ------------------------------------------------------------------
 * Three.js hero scene: a floating grid of blocks echoing the desk
 * layout on the actual floor, with a gentle mouse-driven parallax.
 * ------------------------------------------------------------------ */
const heroCanvas = ref(null)

let renderer = null
let scene = null
let camera = null
let animationId = null
let blocks = []
let mouseX = 0
let mouseY = 0
let resizeObserver = null

const BLOCK_COLORS = [0x1f6b4c, 0xa9673b, 0xc9a227, 0x2f8863]

function initHeroScene() {
  const canvas = heroCanvas.value
  if (!canvas) return

  const width = canvas.clientWidth || canvas.parentElement.clientWidth
  const height = canvas.clientHeight || canvas.parentElement.clientHeight

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100)
  camera.position.set(0, 6.5, 15)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  // Third arg false: don't let three.js write inline width/height onto the
  // canvas. workspace.css already sizes it to fill .phero, and an inline style
  // would beat that — then handleResize reads clientHeight back, sees three's
  // own stale value, and locks the canvas to whatever height the hero had
  // before the webfont loaded and reflowed the title.
  renderer.setSize(width, height, false)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

  scene.add(new THREE.AmbientLight(0xffffff, 0.55))

  const key = new THREE.PointLight(0xffcf9a, 1.4, 60)
  key.position.set(6, 10, 8)
  scene.add(key)

  const rim = new THREE.PointLight(0x3fae7c, 1.1, 60)
  rim.position.set(-8, 4, -6)
  scene.add(rim)

  const cols = 7
  const rows = 5
  const geometry = new THREE.BoxGeometry(0.85, 0.16, 0.85)

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const color = BLOCK_COLORS[(i + j) % BLOCK_COLORS.length]
      const material = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.08 })
      const block = new THREE.Mesh(geometry, material)

      block.position.x = (i - (cols - 1) / 2) * 1.7
      block.position.z = (j - (rows - 1) / 2) * 1.7
      block.position.y = Math.random() * 0.3

      block.userData.baseY = block.position.y
      block.userData.phase = Math.random() * Math.PI * 2
      block.userData.speed = 0.5 + Math.random() * 0.4

      scene.add(block)
      blocks.push(block)
    }
  }

  renderHeroFrame()
}

function renderHeroFrame() {
  animationId = requestAnimationFrame(renderHeroFrame)
  const t = performance.now() * 0.001

  blocks.forEach((block) => {
    block.position.y = block.userData.baseY + Math.sin(t * block.userData.speed + block.userData.phase) * 0.18
    block.rotation.y = Math.sin(t * 0.15 + block.userData.phase) * 0.05
  })

  if (camera) {
    camera.position.x += (mouseX * 2.4 - camera.position.x) * 0.03
    camera.position.y += (6.5 - mouseY * 1.6 - camera.position.y) * 0.03
    camera.lookAt(0, 0, 0)
  }

  if (renderer && scene && camera) renderer.render(scene, camera)
}

function handleMouseMove(event) {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1
  mouseY = (event.clientY / window.innerHeight) * 2 - 1
}

function handleResize() {
  const canvas = heroCanvas.value
  if (!renderer || !camera || !canvas) return
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  if (!width || !height) return
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height, false)
}

function teardownHeroScene() {
  if (animationId) cancelAnimationFrame(animationId)
  blocks.forEach((block) => {
    block.geometry.dispose()
    block.material.dispose()
  })
  blocks = []
  if (renderer) renderer.dispose()
  renderer = null
  scene = null
  camera = null
}

/* ------------------------------------------------------------------
 * GSAP: page-load reveal + scroll-triggered section reveals +
 * background image parallax
 * ------------------------------------------------------------------ */
function runEntranceAnimation() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  // Scoped to .ws-page: '.nav' is a generic enough class name that a bare
  // selector could pick up someone else's nav later. The rest of the targets
  // below are page-specific already.
  tl.from('.ws-page .nav', { y: -20, opacity: 0, duration: 0.6 })
    .from('.p-eyebrow', { y: 20, opacity: 0, duration: 0.5 }, '-=0.25')
    .from('.p-title', { y: 30, opacity: 0, duration: 0.7 }, '-=0.3')
    .from('.p-sub', { y: 20, opacity: 0, duration: 0.6 }, '-=0.45')
    .from('.p-btn', { y: 16, opacity: 0, duration: 0.5 }, '-=0.4')
}

function runScrollAnimations() {
  // The nav floats transparently over the hero and picks up a dark blurred
  // backing once you scroll off the top — same behaviour as the tour page.
  const nav = document.querySelector('.ws-page .nav')
  if (nav) {
    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      toggleClass: { targets: nav, className: 'nav--scrolled' },
    })
  }

  gsap.utils.toArray('.p-section').forEach((section) => {
    const targets = section.querySelectorAll('.p-kicker, .p-h2, .p-lede')
    if (!targets.length) return
    gsap.from(targets, {
      scrollTrigger: { trigger: section, start: 'top 80%' },
      y: 28,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power3.out',
    })
  })

  gsap.from('.p-card', {
    scrollTrigger: { trigger: '.p-grid', start: 'top 85%' },
    y: 36,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power3.out',
  })

  gsap.from('.p-specs li', {
    scrollTrigger: { trigger: '.p-specs', start: 'top 88%' },
    x: -16,
    opacity: 0,
    duration: 0.4,
    stagger: 0.05,
    ease: 'power2.out',
  })

  gsap.from('.p-cta-title, .p-cta-sub, .p-cta-row, .p-foot', {
    scrollTrigger: { trigger: '.p-cta', start: 'top 75%' },
    y: 26,
    opacity: 0,
    duration: 0.6,
    stagger: 0.08,
    ease: 'power3.out',
  })

  // Each section photo gets its own scroll-linked drift, tied to its own
  // section as the trigger — not just the first '.p-section-bg' in the DOM.
  gsap.utils.toArray('.p-section-bg').forEach((bg) => {
    gsap.to(bg, {
      yPercent: 14,
      ease: 'none',
      scrollTrigger: {
        trigger: bg.closest('.p-section'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
  })

  gsap.to('.p-cta-bg', {
    yPercent: 10,
    ease: 'none',
    scrollTrigger: {
      trigger: '.p-cta',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  })

  // Hero photo drifts slightly slower than the page scroll, sitting behind
  // the three.js grid, so it recedes as you scroll into the first section.
  gsap.to('.phero-bg', {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: {
      trigger: '.phero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  })
}

onMounted(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!prefersReducedMotion) {
    initHeroScene()
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)

    if (typeof ResizeObserver !== 'undefined' && heroCanvas.value) {
      resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(heroCanvas.value)
    }
  }

  runEntranceAnimation()
  runScrollAnimations()
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', handleResize)
  if (resizeObserver) resizeObserver.disconnect()
  teardownHeroScene()
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
})
</script>

<style src="../assets/workspace.css"></style>