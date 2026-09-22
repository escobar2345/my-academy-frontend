<template>
  <div class="boi-academy" ref="rootEl">
    <!-- ---------------- LOGO SPLASH (plays every visit) ---------------- -->
    <transition name="splash-fade">
      <div v-if="showSplash" class="splash" @click="dismissSplash">
        <video
          ref="splashVideo"
          class="splash-video"
          src="/academy/splash.mp4"
          muted
          autoplay
          playsinline
          preload="auto"
          @ended="dismissSplash"
          @error="dismissSplash"
          @stalled="dismissSplash"
        ></video>
        <button class="splash-skip" @click.stop="dismissSplash">Skip intro →</button>
      </div>
    </transition>

    <!-- ---------------- FIXED FULL-PAGE BACKGROUND ---------------- -->
    <div class="bg-stage">
      <canvas ref="bgCanvas" class="bg-canvas" aria-hidden="true"></canvas>
      <div
        v-for="(layer, li) in layers"
        :key="layer.id"
        :id="layer.id"
        class="bg-layer"
        :style="li === 0 ? 'opacity:1;' : null"
      >
        <img
          v-for="(src, si) in layer.src"
          :key="si"
          :src="src"
          class="bg-img"
          :style="{ opacity: layer.active === si ? 1 : 0 }"
          alt=""
          aria-hidden="true"
        >
      </div>
      <div class="bg-scrim"></div>
      <div class="bg-grain"></div>
    </div>

    <!-- progress rail — signature "tour" indicator -->
    <div class="tour-rail" id="tour-rail">
      <div class="stop active" data-label="Welcome"><span class="lbl"></span></div>
      <div class="stop" data-label="Boardroom"><span class="lbl"></span></div>
      <div class="stop" data-label="Work-space"><span class="lbl"></span></div>
      <div class="stop" data-label="Community"><span class="lbl"></span></div>
      <div class="stop" data-label="Hub Floor"><span class="lbl"></span></div>
      <div class="stop" data-label="Apply"><span class="lbl"></span></div>
    </div>

    <AcademyNav />

    <main class="content">

      <!-- ---------------- HERO ---------------- -->
      <section class="hero" data-stop="0">
        <!-- Main hero copy, centred in the space above the foot. Wrapping it
             (instead of leaving badge…stats loose beside absolutely-positioned
             siblings) is what stops the stats colliding with the marquee on
             short laptop screens: flexbox now reserves space for both groups,
             so they can never overlap at any viewport height. -->
        <div class="hero-main">
          <div class="hero-badge">
            <span class="pulse-dot"></span>
            Next Cohort: March 2025
          </div>
          <div class="hero-eyebrow">devsphere academy port harcourt</div>
          <h3 class="hero-title reveal-mask">The Future Isn't Coming.<br>We're Training <em class="shine">For It.</em></h3>
          <p class="hero-sub">An AI-first tech academy built to put Nigerian youth on the same table as Silicon Valley, London, and Singapore — not behind them, beside them.</p>

          <div class="hero-stats">
            <div class="hero-stat">
              <span class="stat-number">500+</span>
              <span class="stat-label">Builders Graduated</span>
            </div>
            <div class="stat-divider"></div>
            <div class="hero-stat">
              <span class="stat-number">$2M+</span>
              <span class="stat-label">Funding Raised</span>
            </div>
            <div class="stat-divider"></div>
            <div class="hero-stat">
              <span class="stat-number">94%</span>
              <span class="stat-label">Project Launch Rate</span>
            </div>
          </div>
        </div>

        <!-- Foot: the full-bleed programs ticker with the scroll cue beneath it,
             pinned to the bottom of the hero by the flex layout. -->
        <div class="hero-foot">
          <div class="programs-strip" id="programs" aria-label="Cohort programs">
            <div class="programs-track">
              <span v-for="(program, i) in marqueePrograms" :key="i">{{ program }}</span>
            </div>
          </div>
          <div class="hero-scroll-cue"><div class="cue-line"></div>Scroll to tour</div>
        </div>
      </section>

      <!-- ---------------- BOARDROOM ---------------- -->
      <section class="stop-section" id="boardroom" data-stop="1">
        <div class="stop-inner">
          <div class="stop-kicker">
            <span class="stop-num">01</span>
            <span class="stop-label">The Boardroom</span>
          </div>
          <h2 class="stop-title reveal-mask">Where Builders<br>Get <em class="shine">Competition-Ready.</em></h2>
          <p class="stop-text">Google. Microsoft. Meta. The hackathons that matter are already global — and we train Nigerian developers to walk in and win them. Real problems, real deadlines, real prize money, against the best builders in the world.</p>
          
          <ul class="stop-facts">
            <li>
              <span class="fact-icon">🎯</span>
              <h4>Live Investor Reviews</h4>
              <p>Present your deck to active angel investors and VCs who provide brutal, constructive feedback.</p>
            </li>
            <li>
              <span class="fact-icon">🧠</span>
              <h4>1:1 Mentor Sessions</h4>
              <p>Weekly dedicated time with industry veterans who have scaled companies from zero to one.</p>
            </li>
            <li>
              <span class="fact-icon">🔄</span>
              <h4>Weekly Rehearsals</h4>
              <p>Iterate your pitch until it's bulletproof. We don't let you leave until the narrative is flawless.</p>
            </li>
          </ul>
        </div>
      </section>

      <!-- ---------------- WORK-SPACE ---------------- -->
      <section class="stop-section" id="pods" data-stop="2">
        <div class="stop-inner">
          <div class="stop-kicker">
            <span class="stop-num">02</span>
            <span class="stop-label">Work-Space</span>
          </div>
          <h2 class="stop-title reveal-mask">Two seats.<br>Zero <em class="shine">distractions.</em></h2>
          <p class="stop-text">Timber-lined booths built for the work that needs quiet: a co-founder sync, an hour with your coach, or a spreadsheet that still won't balance. We provide the infrastructure; you provide the focus.</p>
          
          <ul class="stop-facts">
            <li>
              <span class="fact-icon">🪑</span>
              <h4>Ergonomic Setup</h4>
              <p>Herman Miller chairs and height-adjustable desks for all-day comfort.</p>
            </li>
            <li>
              <span class="fact-icon">⚡</span>
              <h4>1Gbps Fiber</h4>
              <p>Symmetric, enterprise-grade internet with redundant backup connections.</p>
            </li>
            <li>
              <span class="fact-icon">🔒</span>
              <h4>24/7 Secure Access</h4>
              <p>Biometric entry and CCTV monitoring so you can build late into the night.</p>
            </li>
            <li>
              <span class="fact-icon">☕</span>
              <h4>Premium Amenities</h4>
              <p>Unlimited specialty coffee, healthy snacks, and weekly catered lunches.</p>
            </li>
          </ul>
          
          <router-link :to="WORKSPACE_URL" class="stop-cta">
            Get an office space
            <span class="stop-cta-arrow" aria-hidden="true">→</span>
          </router-link>
        </div>
      </section>

      <!-- ---------------- LOUNGE ---------------- -->
      <section class="stop-section" id="lounge" data-stop="3">
        <div class="stop-inner">
          <div class="stop-kicker">
            <span class="stop-num">03</span>
            <span class="stop-label">The Community</span>
          </div>
          <h2 class="stop-title reveal-mask">Your network<br>is your <em class="shine">net worth here.</em></h2>
          <p class="stop-text">Skills get you in the room. Community is what gets you through it. This is where cohorts lean on each other, share what's working, and catch the ideas they'd have missed working alone — because no builder scales faster than the community around them.</p>
          
          <blockquote class="lounge-testimonial">
            <div class="quote-icon">“</div>
            <p class="quote-text">The Lounge is where the real magic happens. I met my co-founder over a random Tuesday night demo session. The environment naturally pushes you to share and collaborate.</p>
            <footer class="quote-author">
              <span class="author-name">Sarah O.</span>
              <span class="author-role">Cohort 4 Graduate, FinTech Founder</span>
            </footer>
          </blockquote>

          <ul class="stop-facts community-events">
            <li>
              <span class="fact-icon">🎤</span>
              <h4>Friday Demo Nights</h4>
              <p>Informal, low-stakes presentations of weekly progress with pizza and drinks.</p>
            </li>
            <li>
              <span class="fact-icon">🔥</span>
              <h4>Founder Fireside Chats</h4>
              <p>Candid, off-record conversations with founders who have been in your exact shoes.</p>
            </li>
            <li>
              <span class="fact-icon">🤝</span>
              <h4>Peer Accountability</h4>
              <p>Spontaneous mastermind groups that form over late-night coding sessions.</p>
            </li>
          </ul>
        </div>
      </section>

      <!-- ---------------- HUB FLOOR ---------------- -->
      <section class="stop-section" id="techfloor" data-stop="4">
        <div class="stop-inner">
          <div class="stop-kicker">
            <span class="stop-num">04</span>
            <span class="stop-label">The Hub Floor</span>
          </div>
          <h2 class="stop-title reveal-mask">Nigeria Tech Hub.<br><em class="shine">Est. 2024.</em></h2>
          <p class="stop-text">Rows of builders shipping side by side, under the banner that started it all. Every cohort ends up calling this room home — most keep a desk here long after graduation. This is where abstract concepts become deployed code.</p>
          
          <ul class="stop-facts hub-features-list">
            <li>
              <span class="fact-icon">🚀</span>
              <h4>Build in Public</h4>
              <p>Share your journey, bugs and all. The best feedback comes from peers building alongside you.</p>
            </li>
            <li>
              <span class="fact-icon">🚪</span>
              <h4>Open Door Policy</h4>
              <p>Alumni and active founders regularly drop by to review code, offer advice, or scout for talent.</p>
            </li>
            <li>
              <span class="fact-icon">🌍</span>
              <h4>Global Network</h4>
              <p>Tap into a growing diaspora of DTECH alumni working at top tech companies worldwide.</p>
            </li>
          </ul>

          <div class="tech-stack-cloud">
            <span class="tech-pill">React / Next.js</span>
            <span class="tech-pill">Node.js</span>
            <span class="tech-pill">Python</span>
            <span class="tech-pill">PostgreSQL</span>
            <span class="tech-pill">AWS / Vercel</span>
            <span class="tech-pill">Figma</span>
            <span class="tech-pill">Docker</span>
            <span class="tech-pill">TypeScript</span>
          </div>
        </div>
      </section>

      <!-- ---------------- CTA ---------------- -->
      <section class="cta-section" id="apply" data-stop="5">
        <div class="cta-glow"></div>
        <div class="cta-eyebrow">Ready when you are</div>
        <h2 class="cta-title reveal-mask">Your seat on the floor<br>is <em class="shine">still open.</em></h2>
        <p class="cta-sub">Applications for the next DTECH Academy cohort are open now. Bring the idea — we'll bring the boardroom, the pods, the lounge, and the floor.</p>
        
        <div class="cta-trust-badges">
          <span class="trust-badge">✓ Free to apply</span>
          <span class="trust-badge">✓ 6-month intensive</span>
          <span class="trust-badge">✓ 7 career tracks</span>
          <span class="trust-badge">✓ Lagos & Remote</span>
        </div>

        <div class="cta-buttons">
          <router-link :to="APPLY_URL" class="btn btn-solid">
            Apply for scholarship
            <span class="btn-arrow">→</span>
          </router-link>
          <router-link :to="LOGIN_URL" class="btn btn-ghost">Login to Dashboard</router-link>
        </div>
        
        <div class="foot-line">devsphere academy BOI RSU Innovation Hub · Supporting African Entrepreneurship</div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AcademyNav from '../components/AcademyNav.vue'
import { APPLY_URL, LOGIN_URL } from '../constants/academy'

const IMAGES = {
  'layer-welcome':    '/academy/boardroom.png',
  'layer-Academy':    '/academy/hero.jpg',
  'layer-WORK-SPACE': '/academy/pods.jpg',
  'layer-lounge':     '/academy/techfloor.jpg',
  'layer-techfloor':  '/academy/boardroom.jpg',
}

gsap.registerPlugin(ScrollTrigger)

// The tour's "Get an office space" CTA is an apply action, so it rides the same
// destination as every other Apply button — /registration via APPLY_URL. Kept
// as an alias (not inlined) so it stays in lockstep if APPLY_URL ever moves.
const WORKSPACE_URL = APPLY_URL

const PROGRAMS = [
  'Frontend Development', 'Backend Engineering', 'Data Analysis',
  'Product Design', 'AI Engineering', 'Mobile Development', 'Cybersecurity'
]
const marqueePrograms = computed(() => [...PROGRAMS, ...PROGRAMS])

const panel = (from, to, angle) =>
  'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900">` +
      `<defs><linearGradient id="g" gradientTransform="rotate(${angle})">` +
        `<stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>` +
      `</linearGradient></defs>` +
      `<rect width="1600" height="900" fill="url(#g)"/>` +
    `</svg>`
  )
const DEFAULT_IMAGES = [
  panel('#0E1C14', '#0B5A31', 20),
  panel('#073B20', '#0E1C14', 200),
  panel('#0B5A31', '#073B20', 70),
  panel('#0E1C14', '#1A3A26', 250),
  panel('#073B20', '#0B5A31', 130),
]

const LAYERS = [
  { id: 'layer-welcome'    },
  { id: 'layer-Academy'    },
  { id: 'layer-WORK-SPACE' },
  { id: 'layer-lounge'     },
  { id: 'layer-techfloor'  },
]

const layers = reactive(
  LAYERS.map(({ id }, i) => {
    const src = IMAGES[id] ?? DEFAULT_IMAGES[i]
    return { id, src: [src, src], active: 0 }
  })
)

function preload(src) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = src
  })
}

function fillMissingImages() {
  layers.forEach((layer, i) => {
    const src = IMAGES[layer.id]
    if (!src) return
    preload(src).then(ok => {
      if (ok) return
      const fallback = DEFAULT_IMAGES[i % DEFAULT_IMAGES.length]
      layer.src = [fallback, fallback]
      layer.active = 0
      console.warn(
        `[BoiAcademy] ${src} is not in /public/academy — ` +
        `"${layer.id}" is showing a placeholder panel.`
      )
    })
  })
}

const rootEl = ref(null)
const bgCanvas = ref(null)
let scrollCtx = null
let threeScene = null
let threeCamera = null
let threeRenderer = null
let threeParticles = null
let threeAnimationFrame = null

const showSplash = ref(true)
const splashVideo = ref(null)
let splashTimer = null

const dismissSplash = () => {
  if (!showSplash.value) return
  showSplash.value = false
  if (splashTimer) { clearTimeout(splashTimer); splashTimer = null }
}

const initThreeBackground = () => {
  const canvas = bgCanvas.value
  if (!canvas) return

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 18

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
  renderer.setClearColor(0x000000, 0)
  renderer.setSize(window.innerWidth, window.innerHeight)

  const particlesCount = 160
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particlesCount * 3)
  const scales = new Float32Array(particlesCount)

  for (let i = 0; i < particlesCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 28
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20
    positions[i * 3 + 2] = (Math.random() - 0.5) * 18
    scales[i] = Math.random() * 1.5 + 0.4
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

  const material = new THREE.PointsMaterial({
    color: 0xf2d58a,
    size: 0.08,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })

  const points = new THREE.Points(geometry, material)
  scene.add(points)

  const ambient = new THREE.AmbientLight(0xf7d77e, 0.7)
  scene.add(ambient)

  const animate = () => {
    if (!threeRenderer || !threeParticles) return

    const t = performance.now() * 0.0006
    points.rotation.y = t * 0.4
    points.rotation.x = Math.sin(t * 0.8) * 0.35

    const pos = points.geometry.attributes.position.array
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] += Math.sin(t * 2 + i) * 0.0008
      pos[i] += Math.cos(t * 1.3 + i) * 0.0007
    }
    points.geometry.attributes.position.needsUpdate = true

    threeRenderer.render(scene, camera)
    threeAnimationFrame = requestAnimationFrame(animate)
  }

  threeScene = scene
  threeCamera = camera
  threeRenderer = renderer
  threeParticles = points
  animate()

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  window.addEventListener('resize', handleResize)
  window.__boiAcademyResize = handleResize
}

onMounted(() => {
  const root = rootEl.value
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = window.matchMedia('(max-width: 700px)').matches
  const titleStart = isMobile ? 'top 88%' : 'top 78%'
  const titleDuration = isMobile ? 0.65 : 0.85

  fillMissingImages()
  initThreeBackground()

  const v = splashVideo.value
  if (v) { v.play().catch(() => dismissSplash()) }
  splashTimer = setTimeout(dismissSplash, 2500)

  scrollCtx = gsap.context(() => {
    if (!prefersReduced) {
      gsap.from('.hero-badge', { opacity: 0, y: 16, duration: 0.8, ease: 'power2.out', delay: 0.05 })
      gsap.from('.hero-eyebrow', { opacity: 0, y: 16, duration: 0.8, ease: 'power2.out', delay: 0.15 })
      gsap.fromTo('.hero-title',
        { clipPath: 'inset(0 0 100% 0)', y: 18 },
        { clipPath: 'inset(0 0 0% 0)', y: 0, duration: isMobile ? 0.85 : 1.05, ease: 'power4.out', delay: 0.28 }
      )
      gsap.from('.hero-sub', { opacity: 0, y: 22, duration: 0.9, ease: 'power2.out', delay: 0.6 })
      gsap.from('.hero-stats', { opacity: 0, y: 24, duration: 0.9, ease: 'power2.out', delay: 0.8 })
      gsap.from('.hero-stat', { opacity: 0, y: 16, duration: 0.7, stagger: 0.1, ease: 'power2.out', delay: 0.9 })
      gsap.from('.hero-scroll-cue', { opacity: 0, duration: 0.8, ease: 'power1.out', delay: 0.95 })
      gsap.from('.programs-strip', { opacity: 0, duration: 0.9, ease: 'power1.out', delay: 1.05 })
    } else {
      gsap.set('.hero-title', { clipPath: 'inset(0 0 0% 0)' })
    }

    const stops = [
      { section: '.hero' },
      { section: '#boardroom' },
      { section: '#pods' },
      { section: '#lounge' },
      { section: '#techfloor' }
    ].map((s, i) => ({ ...s, layer: '#' + LAYERS[i].id }))

    stops.forEach((stop, i) => {
      const sectionEl = root.querySelector(stop.section)
      const layerEl = root.querySelector(stop.layer)
      if (!sectionEl || !layerEl) return
      const imgEls = layerEl.querySelectorAll('img')

      gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.4
        }
      })
        .to(layerEl, { opacity: 1, duration: 0.35, ease: 'none' }, 0)
        .to(layerEl, { opacity: 1, duration: 0.3, ease: 'none' }, 0.35)
        .to(layerEl, { opacity: 0, duration: 0.35, ease: 'none' }, 0.65)

      gsap.fromTo(imgEls,
        { scale: 1.14, xPercent: i % 2 === 0 ? -1 : 1, yPercent: -1 },
        {
          scale: 1.0,
          xPercent: i % 2 === 0 ? 1 : -1,
          yPercent: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionEl,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6
          }
        }
      )
    })

    if (!prefersReduced) {
      const stopInners = root.querySelectorAll('.stop-inner')
      stopInners.forEach((inner) => {
        const kicker = inner.querySelector('.stop-kicker')
        const title = inner.querySelector('.stop-title')
        const text = inner.querySelector('.stop-text')
        const facts = inner.querySelectorAll('.stop-facts li')
        const cta = inner.querySelector('.stop-cta')
        const testimonial = inner.querySelector('.lounge-testimonial')
        const techStack = inner.querySelector('.tech-stack-cloud')

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: inner,
            start: titleStart,
            toggleActions: 'play none none reverse'
          }
        })
        if (kicker) tl.from(kicker, { opacity: 0, x: -16, duration: 0.5, ease: 'power2.out' }, 0)
        if (title) {
          tl.fromTo(title,
            { clipPath: 'inset(0 0 100% 0)', y: 20 },
            { clipPath: 'inset(0 0 0% 0)', y: 0, duration: titleDuration, ease: 'power4.out' },
            0.1
          )
        }
        if (text) tl.from(text, { opacity: 0, y: 18, duration: 0.6, ease: 'power2.out' }, 0.3)
        if (facts.length) tl.from(facts, { opacity: 0, y: 10, duration: 0.4, stagger: 0.08, ease: 'power1.out' }, 0.42)
        if (testimonial) tl.from(testimonial, { opacity: 0, y: 24, duration: 0.7, ease: 'power2.out' }, 0.6)
        if (techStack) tl.from(techStack, { opacity: 0, y: 20, duration: 0.7, ease: 'power2.out' }, 0.7)
        if (cta) tl.from(cta, { opacity: 0, y: 12, duration: 0.5, ease: 'power2.out' }, 0.5)
      })

      const ctaSection = root.querySelector('.cta-section')
      if (ctaSection) {
        const ctaTitle = ctaSection.querySelector('.cta-title')
        if (ctaTitle) {
          gsap.fromTo(ctaTitle,
            { clipPath: 'inset(0 0 100% 0)', y: 20 },
            {
              clipPath: 'inset(0 0 0% 0)', y: 0, duration: isMobile ? 0.7 : 0.9, ease: 'power4.out',
              scrollTrigger: { trigger: ctaSection, start: isMobile ? 'top 82%' : 'top 70%', toggleActions: 'play none none reverse' }
            }
          )
        }
        gsap.from(
          ['.cta-eyebrow', '.cta-sub', '.cta-trust-badges', '.cta-buttons', '.cta-partners', '.foot-line']
            .map(sel => ctaSection.querySelector(sel))
            .filter(Boolean),
          {
            opacity: 0, y: 20, duration: 0.7, stagger: 0.1, ease: 'power2.out',
            scrollTrigger: { trigger: ctaSection, start: 'top 70%', toggleActions: 'play none none reverse' }
          }
        )
      }
    } else {
      root.querySelectorAll('.stop-title, .cta-title').forEach(el => {
        gsap.set(el, { clipPath: 'inset(0 0 0% 0)' })
      })
    }

    const railStops = Array.from(root.querySelectorAll('.tour-rail .stop'))
    const stopSections = Array.from(root.querySelectorAll('[data-stop]'))

    const setActiveStop = (i) => {
      railStops.forEach((r, idx) => r.classList.toggle('active', idx === i))
    }

    stopSections.forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveStop(i),
        onEnterBack: () => setActiveStop(i)
      })
    })
  }, root)
})

onBeforeUnmount(() => {
  if (scrollCtx) scrollCtx.revert()
  if (splashTimer) clearTimeout(splashTimer)
  if (threeAnimationFrame) cancelAnimationFrame(threeAnimationFrame)
  if (threeRenderer) {
    threeRenderer.dispose()
    threeRenderer.forceContextLoss()
  }
  if (window.__boiAcademyResize) {
    window.removeEventListener('resize', window.__boiAcademyResize)
    delete window.__boiAcademyResize
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');

.boi-academy, .boi-academy *, .boi-academy *::before, .boi-academy *::after {
  box-sizing: border-box;
}

.boi-academy {
  --ink: #0E1C14;
  --green: #0B5A31;
  --green-deep: #073B20;
  --gold: #D2A63B;
  --gold-bright: #F0D488;
  --paper: #F6F4EC;
  --paper-dim: rgba(246, 244, 236, 0.78);
  --ease-calm: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  min-height: 100vh;
  background: var(--ink);
  color: var(--paper);
  font-family: 'Inter', sans-serif;
}
.boi-academy a { color: inherit; }
.boi-academy ::selection { background: var(--gold); color: var(--ink); }

.boi-academy a:focus-visible,
.boi-academy button:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 3px;
  border-radius: 4px;
}

/* ---------------- LOGO SPLASH ---------------- */
.splash {
  position: fixed; inset: 0; z-index: 200;
  background: #000;
  display: flex; align-items: center; justify-content: center;
}
.splash-video {
  width: 100%; height: 100%; object-fit: contain;
  background: #000;
}
.splash-skip {
  position: absolute; bottom: 32px; right: 32px;
  background: rgba(246,244,236,0.12); border: 1px solid rgba(246,244,236,0.4);
  color: var(--paper); padding: 10px 20px; border-radius: 999px;
  font-family: 'Space Grotesk', sans-serif; font-size: 13px; letter-spacing: 0.04em;
  cursor: pointer; backdrop-filter: blur(8px);
  transition: background .2s, border-color .2s, transform .12s;
}
.splash-skip:hover { background: var(--gold); color: var(--ink); border-color: var(--gold); }
.splash-skip:active { transform: scale(0.96); }
.splash-fade-leave-active { transition: opacity .6s ease; }
.splash-fade-leave-to { opacity: 0; }

/* ---------------- FIXED FULL-PAGE BACKGROUND ---------------- */
.bg-stage {
  position: fixed; inset: 0; z-index: 0; overflow: hidden; background: var(--green-deep);
}
.bg-canvas {
  position: absolute; inset: 0; width: 100%; height: 100%; display: block;
  z-index: 0; pointer-events: none; opacity: 0.7; mix-blend-mode: screen;
  filter: blur(0.6px);
}
.bg-layer {
  position: absolute; inset: 0; opacity: 0; will-change: opacity, transform;
}
.bg-layer img {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover; object-position: center; display: block;
  transform: scale(1.08);
  will-change: transform, opacity;
  transition: opacity 1.6s var(--ease-calm);
}
@media (prefers-reduced-motion: reduce) {
  .bg-layer img { transition-duration: 0.4s; }
}
.bg-scrim {
  position: absolute; inset: 0;
  background:
    linear-gradient(180deg, rgba(7,20,13,0.72) 0%, rgba(7,20,13,0.28) 22%, rgba(7,20,13,0.3) 60%, rgba(7,20,13,0.82) 100%),
    linear-gradient(90deg, rgba(7,20,13,0.55) 0%, rgba(7,20,13,0.05) 45%);
  z-index: 1;
}
.bg-grain {
  position: absolute; inset: 0; z-index: 2; opacity: 0.05; pointer-events: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
}

/* progress rail */
.tour-rail {
  position: fixed; right: clamp(14px, 3vw, 36px); top: 50%; transform: translateY(-50%);
  z-index: 40; display: flex; flex-direction: column; gap: 22px; align-items: center;
}
.tour-rail .stop {
  width: 9px; height: 9px; border-radius: 50%; background: rgba(246,244,236,0.3);
  position: relative; transition: background .3s var(--ease-calm),
    transform .3s var(--ease-spring), box-shadow .3s var(--ease-calm);
}
.tour-rail .stop.active {
  background: var(--gold); transform: scale(1.35);
  box-shadow: 0 0 0 4px rgba(210,166,59,0.16);
}
.tour-rail .stop .lbl {
  position: absolute; right: 20px; top: 50%; transform: translateY(-50%);
  font-family: 'Space Grotesk', sans-serif; font-size: 11px; letter-spacing: 0.08em;
  white-space: nowrap; color: var(--paper); opacity: 0; transition: opacity .25s ease;
  text-transform: uppercase;
}
.tour-rail .stop.active .lbl { opacity: 0.85; }
.tour-rail::before {
  content: ''; position: absolute; left: 50%; top: 0; bottom: 0; width: 1px;
  background: rgba(246,244,236,0.18); transform: translateX(-50%); z-index: -1;
}

/* ---------------- CONTENT LAYER ---------------- */
.content { position: relative; z-index: 10; }
.reveal-mask { will-change: clip-path, transform; }

.shine {
  font-style: normal; font-weight: 500; color: var(--gold);
  background: linear-gradient(100deg, var(--gold) 0%, var(--gold-bright) 42%, var(--gold) 60%, #B98A24 100%);
  background-size: 220% 100%;
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: goldSheen 6s ease-in-out infinite;
}
@keyframes goldSheen { 0%, 100% { background-position: 0% 0; } 50% { background-position: 100% 0; } }
@keyframes titleGlowFloat {
  0%, 100% { transform: translateY(0px); text-shadow: 0 0 12px rgba(240, 212, 136, 0.18), 0 0 28px rgba(210, 166, 59, 0.14); }
  50% { transform: translateY(-4px); text-shadow: 0 0 22px rgba(240, 212, 136, 0.46), 0 0 40px rgba(210, 166, 59, 0.28); }
}
@keyframes buttonBounce {
  0%, 100% { transform: translateY(0) scale(1); box-shadow: 0 12px 28px -12px rgba(210, 166, 59, 0.52); }
  50% { transform: translateY(-3px) scale(1.02); box-shadow: 0 18px 34px -14px rgba(210, 166, 59, 0.7); }
}
@keyframes softPulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}
@keyframes pulse-gold {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(210, 166, 59, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(210, 166, 59, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(210, 166, 59, 0); }
}

.stop-section {
  position: relative;
  min-height: 100vh; min-height: 100dvh; display: flex; align-items: center;
  padding: 120px clamp(20px, 6vw, 90px) 80px;
}
.stop-section::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(95deg,
    rgba(7,20,13,0.80) 0%, rgba(7,20,13,0.62) 30%,
    rgba(7,20,13,0.22) 58%, rgba(7,20,13,0) 80%);
}

.stop-inner {
  position: relative; z-index: 1;
  max-width: 47rem;
  padding-left: clamp(20px, 3vw, 40px);
}
.stop-inner::before {
  content: ''; position: absolute; left: 0; top: 4px; bottom: 4px; width: 1px;
  background: linear-gradient(180deg,
    rgba(210,166,59,0.95), rgba(210,166,59,0.20) 52%, rgba(210,166,59,0) 100%);
}

.stop-kicker {
  display: flex; align-items: center; gap: 14px; margin-bottom: 22px;
  font-family: 'Space Grotesk', sans-serif;
}
.stop-num {
  font-size: 12px; font-weight: 500; color: var(--gold); letter-spacing: 0.14em;
  font-feature-settings: "tnum" 1; font-variant-numeric: tabular-nums;
  text-shadow: 0 0 18px rgba(210,166,59,0.35);
}
.stop-label {
  display: flex; align-items: center; gap: 14px;
  font-size: 11.5px; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--paper-dim);
  transition: color .3s var(--ease-calm);
}
.stop-label::before {
  content: ''; width: 26px; height: 1px; background: rgba(246,244,236,0.32);
  transition: background .3s var(--ease-calm), width .3s var(--ease-calm);
}
.stop-inner:hover .stop-label { color: var(--paper); }
.stop-inner:hover .stop-label::before { background: var(--gold); width: 34px; }

.stop-title {
  font-family: 'Space Grotesk', sans-serif; font-weight: 500;
  font-size: clamp(35px, 5.1vw, 66px); line-height: 1.05; letter-spacing: -0.028em;
  margin-bottom: 24px; text-wrap: balance;
  animation: titleGlowFloat 5s ease-in-out infinite;
  text-shadow: 0 0 18px rgba(240, 212, 136, 0.20), 0 0 34px rgba(210, 166, 59, 0.12);
}

.stop-text {
  font-size: clamp(15.5px, 1.35vw, 18.5px); line-height: 1.68; font-weight: 300;
  color: var(--paper-dim); max-width: 46ch; text-wrap: pretty;
}

/* Upgraded Rich Cards for Facts */
.stop-facts {
  list-style: none; margin: 40px 0 0; padding: 24px 0 0;
  border-top: 1px solid rgba(246,244,236,0.12);
  display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px;
}
.stop-facts li {
  position: relative; padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(246, 244, 236, 0.08);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: transform .3s var(--ease-calm), border-color .3s var(--ease-calm), background .3s var(--ease-calm);
}
.stop-facts li:hover {
  transform: translateY(-4px);
  border-color: rgba(210, 166, 59, 0.4);
  background: rgba(255, 255, 255, 0.06);
}
.stop-facts li h4 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px; font-weight: 600; color: var(--paper);
  margin: 0 0 8px 0; display: flex; align-items: center; gap: 8px;
}
.stop-facts li p {
  font-size: 14px; line-height: 1.6; color: var(--paper-dim); margin: 0;
}
.stop-facts li .fact-icon {
  font-size: 20px; display: inline-block;
}
.stop-facts li::before, .stop-facts li::after { display: none; }

.boi-academy .stop-cta {
  display: inline-flex; align-items: center; gap: 10px;
  margin-top: 30px; padding: 14px 26px;
  border: 1px solid rgba(210,166,59,0.55); border-radius: 999px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11.5px; letter-spacing: 0.13em; text-transform: uppercase; font-weight: 500;
  color: var(--gold); text-decoration: none; white-space: nowrap;
  transition: background .25s var(--ease-calm), border-color .25s var(--ease-calm),
              color .25s var(--ease-calm), transform .18s var(--ease-spring),
              box-shadow .25s var(--ease-calm);
  animation: buttonBounce 3.8s ease-in-out infinite;
}
.boi-academy .stop-cta:hover {
  background: var(--gold); border-color: var(--gold); color: var(--ink);
  transform: translateY(-2px);
  box-shadow: 0 12px 30px -12px rgba(210,166,59,0.6);
}
.stop-cta:active {
  transform: translateY(-1px) scale(0.97);
  background: var(--gold); border-color: var(--gold); color: var(--ink);
}
.stop-cta:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
.stop-cta-arrow { transition: transform .25s var(--ease-calm); }
.stop-cta:hover .stop-cta-arrow { transform: translateX(4px); }

/* HERO */
.hero {
  position: relative;
  min-height: 100vh; min-height: 100dvh;
  display: flex; flex-direction: column;
  /* Vertical padding only: the top gap keeps the copy clear of the fixed nav
     when the hero is too short to centre; the sides are padded on .hero-main
     instead, so the marquee below can run edge-to-edge. */
  padding: 80px 0 40px;
}
/* The copy, centred in the free space above .hero-foot. Equal auto top/bottom
   margins split that space, so the block sits centred while the foot stays
   pinned to the bottom. When the content is taller than the viewport the auto
   margins collapse to zero and the two groups simply stack — the stats can
   never land on top of the marquee the way they did when it was absolute. */
.hero-main {
  margin: auto 0;
  padding: 0 clamp(20px, 6vw, 90px);
}
.hero-foot { width: 100%; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 14px; border-radius: 99px;
  background: rgba(210, 166, 59, 0.1); border: 1px solid rgba(210, 166, 59, 0.3);
  font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 500;
  color: var(--gold); letter-spacing: 0.05em; margin-bottom: 24px;
}
.pulse-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--gold);
  box-shadow: 0 0 0 0 rgba(210, 166, 59, 0.7);
  animation: pulse-gold 2s infinite;
}
.hero-eyebrow {
  font-family: 'Space Grotesk', sans-serif; font-size: 12px; letter-spacing: 0.24em;
  text-transform: uppercase; color: var(--gold); margin-bottom: 26px;
  display: flex; align-items: center; gap: 13px;
  animation: softPulse 4s ease-in-out infinite;
  text-shadow: 0 0 18px rgba(210, 166, 59, 0.32);
}
.hero-eyebrow::before { content: ''; width: 30px; height: 1px; background: var(--gold); }
.hero-title {
  font-family: 'Space Grotesk', sans-serif; font-weight: 500;
  font-size: clamp(26px, 3.6vw, 48px); line-height: 1.12; letter-spacing: -0.02em;
  max-width: 22ch; text-wrap: balance;
  animation: titleGlowFloat 4.8s ease-in-out infinite;
  text-shadow: 0 0 18px rgba(240, 212, 136, 0.28), 0 0 36px rgba(210, 166, 59, 0.16);
}
.hero::before {
  content: ''; position: absolute; z-index: -1;
  left: clamp(-60px, 2vw, 20px); top: 38%;
  width: min(620px, 70vw); height: min(620px, 70vw);
  background: radial-gradient(circle at center, rgba(210,166,59,0.20), rgba(210,166,59,0) 62%);
  filter: blur(10px); pointer-events: none;
  animation: heroGlow 7s ease-in-out infinite;
}
@keyframes heroGlow { 0%, 100% { opacity: 0.55; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.08); } }
.hero-sub {
  margin-top: 32px; max-width: 50ch; font-size: clamp(16px, 1.5vw, 19px);
  color: var(--paper-dim); line-height: 1.66; font-weight: 300; text-wrap: pretty;
}

.hero-stats {
  display: flex; align-items: center; gap: 32px; margin-top: 40px;
  padding-top: 28px; border-top: 1px solid rgba(246,244,236,0.12);
}
.hero-stat { display: flex; flex-direction: column; gap: 4px; }
.stat-number {
  font-family: 'Space Grotesk', sans-serif; font-size: 32px; font-weight: 700;
  color: var(--paper); letter-spacing: -0.02em;
}
.stat-label {
  font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--paper-dim);
}
.stat-divider { width: 1px; height: 40px; background: rgba(246,244,236,0.12); }

.hero-scroll-cue {
  display: flex; align-items: center; gap: 14px;
  margin-top: 20px; padding-left: clamp(20px, 6vw, 90px);
  font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--paper-dim);
}
.cue-line { width: 1px; height: 40px; background: rgba(246,244,236,0.3); position: relative; overflow: hidden; }
.cue-line::after {
  content: ''; position: absolute; top: -100%; left: 0; width: 100%; height: 100%; background: var(--gold);
  animation: cueDrop 1.8s ease-in-out infinite;
}
@keyframes cueDrop { 0% { top: -100%; } 60% { top: 100%; } 100% { top: 100%; } }

.programs-strip {
  border-top: 1px solid rgba(246,244,236,0.12); border-bottom: 1px solid rgba(246,244,236,0.12);
  padding: 13px 0; overflow: hidden; white-space: nowrap;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
}
.programs-track {
  display: inline-block; animation: programsScroll 32s linear infinite;
}
.programs-track span {
  font-family: 'Space Grotesk', sans-serif; font-size: 12px; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--paper-dim); margin: 0 26px;
  display: inline-flex; align-items: center; gap: 10px;
  transition: color .3s var(--ease-calm);
}
.programs-track span::before {
  content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--gold); flex-shrink: 0;
}
.programs-track span:hover { color: var(--gold-bright); }
@keyframes programsScroll { to { transform: translateX(-50%); } }

/* Lounge Testimonial */
.lounge-testimonial {
  margin-top: 40px; padding: 32px;
  background: linear-gradient(135deg, rgba(210,166,59,0.08), rgba(210,166,59,0.02));
  border-left: 3px solid var(--gold);
  border-radius: 0 12px 12px 0;
  position: relative;
}
.quote-icon {
  font-family: 'Space Grotesk', sans-serif; font-size: 64px; line-height: 1;
  color: var(--gold); opacity: 0.3; position: absolute; top: 16px; left: 24px;
  pointer-events: none;
}
.quote-text {
  font-size: 18px; line-height: 1.7; color: var(--paper); font-style: italic;
  margin: 0 0 20px 0; position: relative; z-index: 1;
}
.quote-author { display: flex; flex-direction: column; gap: 4px; }
.author-name { font-family: 'Space Grotesk', sans-serif; font-weight: 600; color: var(--gold); font-size: 15px; }
.author-role { font-size: 13px; color: var(--paper-dim); }

/* Tech Stack Cloud */
.tech-stack-cloud {
  display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px;
}
.tech-pill {
  padding: 10px 18px; border-radius: 99px;
  background: rgba(246, 244, 236, 0.04);
  border: 1px solid rgba(246, 244, 236, 0.1);
  font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 500; color: var(--paper-dim);
  transition: all .3s var(--ease-calm);
  cursor: default;
}
.tech-pill:hover {
  background: rgba(210, 166, 59, 0.15); border-color: var(--gold); color: var(--gold);
  transform: translateY(-2px);
}

/* Mobile Adjustments.
   Breakpoint is 780px to match AcademyNav: at exactly this width the top links
   collapse into the floating bottom bar, so the page must reflow in step with
   it — otherwise the 700–780px band keeps a desktop hero whose bottom-anchored
   scroll cue sits hidden behind the mobile bar. */
@media (max-width: 780px) {
  /* The right-hand tour rail is desktop furniture: on a phone it only crowds
     the screen edge and duplicates what scrolling already shows. */
  .tour-rail { display: none; }
  .stop-section { padding: 104px clamp(20px, 6vw, 90px) 96px; }
  .stop-section::before {
    background: linear-gradient(180deg,
      rgba(7,20,13,0.62) 0%, rgba(7,20,13,0.78) 45%, rgba(7,20,13,0.88) 100%);
  }
  .stop-inner { padding-left: 18px; }
  .stop-title { font-size: clamp(32px, 8.4vw, 46px); letter-spacing: -0.022em; }
  .stop-text { font-size: 15.5px; line-height: 1.66; max-width: none; }
  .stop-facts { gap: 16px; margin-top: 28px; }
  .stop-cta { margin-top: 26px; padding: 13px 22px; font-size: 11px; }
  .hero-title { letter-spacing: -0.02em; font-size: clamp(24px, 7vw, 34px); line-height: 1.15; }
  .hero-sub { margin-top: 26px; }
  /* Extra bottom padding clears the floating mobile nav so the programs strip
     (now in normal flow, below) is never tucked under it when scrolled to the
     hero's end. */
  .hero { padding-top: 100px; padding-bottom: calc(96px + env(safe-area-inset-bottom)); }
  /* The "scroll to explore" cue is desktop-only decoration. On a phone the hero
     content already overflows the viewport, so the page obviously scrolls — and
     the cue's resting spot lands behind the translucent bottom bar. Drop it. */
  .hero-scroll-cue { display: none; }
  /* The marquee already flows (it lives in .hero-foot); just give it a little
     air below the stacked stats. */
  .programs-strip { margin-top: 22px; }
  .hero-stats { flex-direction: column; align-items: flex-start; gap: 24px; }
  .stat-divider { width: 40px; height: 1px; }
  .stop-label::before {
    background: linear-gradient(90deg, rgba(210,166,59,0.85), rgba(210,166,59,0.15));
    width: 30px;
  }
  .stop-num { text-shadow: 0 0 22px rgba(210,166,59,0.4); }
  .shine { animation-duration: 8s; }
}
@media (prefers-reduced-motion: reduce) {
  .programs-track { animation: none; }
  .shine { animation: none; -webkit-text-fill-color: var(--gold); }
  .hero::before { animation: none; }
}

/* CLOSING CTA */
.cta-section {
  min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 80px 24px; position: relative;
}
.cta-glow {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  /* Capped to the viewport: a fixed 600px centred glow overhangs both edges of
     a phone screen and was the source of the page's horizontal scroll. min()
     keeps it 600px on desktop and shrinks it to fit narrower screens. */
  width: min(600px, 90vw); height: min(600px, 90vw);
  background: radial-gradient(circle, rgba(210,166,59,0.15) 0%, rgba(210,166,59,0) 70%);
  filter: blur(60px); pointer-events: none; z-index: 0;
}
.cta-eyebrow {
  font-family: 'Space Grotesk', sans-serif; font-size: 13px; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--gold); margin-bottom: 22px;
  animation: softPulse 4.2s ease-in-out infinite;
  text-shadow: 0 0 18px rgba(210, 166, 59, 0.32);
  position: relative; z-index: 1;
}
.cta-title {
  font-family: 'Space Grotesk', sans-serif; font-weight: 700;
  font-size: clamp(32px, 6vw, 72px); line-height: 1.02; max-width: 16ch; margin-bottom: 26px;
  animation: titleGlowFloat 5.2s ease-in-out infinite;
  text-shadow: 0 0 18px rgba(240, 212, 136, 0.22), 0 0 36px rgba(210, 166, 59, 0.16);
  position: relative; z-index: 1;
}
.cta-sub {
  max-width: 50ch; color: var(--paper-dim); font-size: 16px; line-height: 1.65; margin-bottom: 38px;
  position: relative; z-index: 1;
}
.cta-trust-badges {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; margin: 32px 0 40px;
  position: relative; z-index: 1;
}
.trust-badge {
  padding: 8px 16px; border-radius: 99px;
  background: rgba(210, 166, 59, 0.1); border: 1px solid rgba(210, 166, 59, 0.3);
  font-family: 'Space Grotesk', sans-serif; font-size: 13px; color: var(--gold);
  display: flex; align-items: center; gap: 6px;
}
.cta-buttons { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; position: relative; z-index: 1; }
.btn {
  padding: 15px 32px; border-radius: 999px; text-decoration: none;
  font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 600;
  transition: transform .18s var(--ease-spring), box-shadow .25s var(--ease-calm),
              background .2s var(--ease-calm), border-color .2s var(--ease-calm);
  animation: buttonBounce 3.4s ease-in-out infinite;
  display: inline-flex; align-items: center;
}
.btn:hover { transform: translateY(-2px); }
.btn:active { transform: translateY(-1px) scale(0.97); }
.btn-solid {
  background: var(--gold); color: var(--ink);
  box-shadow: 0 12px 30px -12px rgba(210,166,59,0.65);
}
.btn-solid:hover { box-shadow: 0 16px 38px -12px rgba(210,166,59,0.85); }
.btn-ghost {
  border: 1px solid rgba(246,244,236,0.5); color: var(--paper);
}
.btn-ghost:hover { border-color: var(--gold); color: var(--gold); }
.btn-arrow { display: inline-block; transition: transform .3s var(--ease-calm); margin-left: 4px; }
.btn-solid:hover .btn-arrow { transform: translateX(4px); }

.cta-partners { 
  margin-top: 60px; display: flex; flex-direction: column; align-items: center; gap: 16px; 
  position: relative; z-index: 1;
}
.partners-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--paper-dim); }
.partners-logos {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 32px;
  font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 600;
  color: rgba(246, 244, 236, 0.3); letter-spacing: -0.02em;
}
.foot-line {
  margin-top: 70px; font-size: 12px; color: var(--paper-dim); letter-spacing: 0.04em;
  position: relative; z-index: 1;
}

@media (max-width: 780px) {
  .cta-section { padding-bottom: calc(120px + env(safe-area-inset-bottom)); }
  .partners-logos { gap: 20px; font-size: 16px; }
}
</style>