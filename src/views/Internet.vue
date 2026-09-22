<template>
  <div class="boi-page">
    <!-- Fixed behind the whole page, not just the hero: the mesh is the page's
         subject matter, so it should still be there when you scroll into the
         failover copy. Decorative, hence aria-hidden. -->
    <canvas ref="netCanvas" class="net-canvas" aria-hidden="true"></canvas>

    <AcademyNav />

    <header class="phero">
      <div class="p-eyebrow">Internet</div>
      <h1 class="p-title">The connection<em>never blinks.</em></h1>
      <p class="p-sub">
        Symmetric fibre, a second line that takes over on its own, and power that
        outlasts the grid. You came here to build — the network is our problem, not yours.
      </p>
      <router-link to="/workspace" class="p-btn">
        See work-space plans<span class="p-btn-arrow" aria-hidden="true">→</span>
      </router-link>
    </header>

    <section class="p-section">
      <div class="p-kicker">01 — What you're plugging into</div>
      <h2 class="p-h2">Built for uploads, not just downloads</h2>
      <p class="p-lede">
        Most offices sell you a big download number and quietly starve the upload. That
        breaks the things you actually do: pushing builds, joining calls, moving assets.
        Ours runs symmetric, so up and down are the same.
      </p>
      <div class="p-grid">
        <article v-for="spec in specs" :key="spec.name" class="p-card">
          <div class="p-card-top">
            <h3>{{ spec.name }}</h3>
            <span class="p-tag">{{ spec.tag }}</span>
          </div>
          <p>{{ spec.copy }}</p>
        </article>
      </div>
    </section>

    <section class="p-section">
      <div class="p-kicker">02 — When something fails</div>
      <h2 class="p-h2">Two of everything that matters</h2>
      <p class="p-lede">
        Redundancy only counts if the switch-over is automatic. Every layer below has a
        standby that engages without anyone walking to a cupboard.
      </p>
      <ul class="p-specs">
        <li v-for="item in resilience" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section class="p-cta">
      <h2 class="p-cta-title">Test it yourself.</h2>
      <p class="p-cta-sub">
        Come in with your laptop and run whatever benchmark you trust. Push a build,
        start a call, pull a big repo. We would rather you measured than took our word.
      </p>
      <div class="p-cta-row">
        <router-link :to="APPLY_URL" class="p-btn p-btn-solid">
          Book a visit
        </router-link>
        <router-link to="/membership" class="p-btn">See membership</router-link>
      </div>
      <div class="p-foot">BOI Academy · Lagos Innovation Hub · Supporting African Entrepreneurship</div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import AcademyNav from '../components/AcademyNav.vue'
import { APPLY_URL } from '../constants/academy'

const specs = [
  {
    name: 'Symmetric fibre',
    tag: 'Primary',
    copy: 'Dedicated fibre to the building with matching upload and download, so pushing is as fast as pulling.',
  },
  {
    name: 'Second carrier',
    tag: 'Failover',
    copy: 'An independent line from a separate provider. If the first drops, traffic moves over on its own.',
  },
  {
    name: 'Managed Wi-Fi 6',
    tag: 'Floor-wide',
    copy: 'Access points placed per zone instead of one router fighting the whole floor. Roam without dropping a call.',
  },
  {
    name: 'Wired at every desk',
    tag: 'On request',
    copy: 'Gigabit ethernet at dedicated desks and in private offices, for when you want the cable, not the air.',
  },
]

const resilience = [
  'Dual carriers on separate physical routes into the building',
  'Automatic failover — no manual switch, no phone call',
  'Generator backup sized for the whole floor',
  'Inverter bridge so nothing blinks during the hand-over',
  'UPS on the network rack and the access points',
  'Segmented guest network, kept off the member network',
  'On-site technician during working hours',
]

/* ------------------------------------------------------------------
 * three.js background: a drifting node mesh with light pulses running
 * along the links — the page's own subject matter (fibre, and packets
 * that keep moving) rather than generic decoration.
 * ------------------------------------------------------------------ */
const netCanvas = ref(null)

let renderer = null
let scene = null
let camera = null
let animationId = null
let resizeObserver = null

// Everything disposable gets collected here so teardown is one loop and can't
// drift out of sync with the scene when the motif changes.
let disposables = []
let nodes = []
let packets = []
let linkGeometry = null
let linkPositions = null
let linkColors = null
let nodeGeometry = null
let packetGeometry = null

const NODE_COUNT = 88
// Box the nodes drift inside. Wider than tall so the mesh reads as a floor
// plan of the building rather than a cube floating in space.
const SPREAD = { x: 30, y: 17, z: 11 }
// Two nodes closer than this get a link. Squared, to keep the per-frame
// distance test off Math.sqrt.
const LINK_DIST_SQ = 4.4 * 4.4
// Preallocated ceiling: at this density the mesh never gets near it, and
// setDrawRange means an unused tail costs nothing.
const MAX_LINKS = NODE_COUNT * 7
const PACKET_COUNT = 26

// Mesh green and gold, straight off the page's tokens.
const LINK_RGB = { r: 0.18, g: 0.62, b: 0.42 }
const NODE_RGB = { r: 0.36, g: 0.78, b: 0.55 }
const PACKET_RGB = { r: 0.94, g: 0.74, b: 0.28 }

let pointerX = 0
let pointerY = 0

// A soft round dot, drawn once into a 2D canvas. Cheaper than shipping a
// sprite PNG, and it keeps the page self-contained.
function makeDotTexture() {
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.85)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  disposables.push(tex)
  return tex
}

function initScene() {
  const canvas = netCanvas.value
  if (!canvas) return

  const width = canvas.clientWidth || window.innerWidth
  const height = canvas.clientHeight || window.innerHeight

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 200)
  camera.position.set(0, 0, 26)
  camera.lookAt(0, 0, 0)

  // alpha: true so the .boi-page gradient shows through — the mesh sits in the
  // page's own light rather than on a black plate of its own.
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  // Third arg false: three.js must not write inline width/height onto the
  // canvas. The CSS below pins it to the viewport, and an inline style would
  // beat that — then handleResize reads clientHeight back, gets three's own
  // stale number, and the canvas locks to whatever size it had on first paint.
  renderer.setSize(width, height, false)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

  const dot = makeDotTexture()

  // ---- nodes -------------------------------------------------------
  const nodePositions = new Float32Array(NODE_COUNT * 3)
  for (let i = 0; i < NODE_COUNT; i++) {
    const node = {
      x: (Math.random() - 0.5) * SPREAD.x,
      y: (Math.random() - 0.5) * SPREAD.y,
      z: (Math.random() - 0.5) * SPREAD.z,
      // Slow, uneven drift. Fast enough to never look frozen, slow enough
      // that reading the page over it is comfortable.
      vx: (Math.random() - 0.5) * 0.016,
      vy: (Math.random() - 0.5) * 0.016,
      vz: (Math.random() - 0.5) * 0.010,
    }
    nodes.push(node)
    nodePositions[i * 3] = node.x
    nodePositions[i * 3 + 1] = node.y
    nodePositions[i * 3 + 2] = node.z
  }

  nodeGeometry = new THREE.BufferGeometry()
  nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3))
  const nodeMaterial = new THREE.PointsMaterial({
    size: 0.3,
    map: dot,
    color: new THREE.Color(NODE_RGB.r, NODE_RGB.g, NODE_RGB.b),
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })
  disposables.push(nodeGeometry, nodeMaterial)
  scene.add(new THREE.Points(nodeGeometry, nodeMaterial))

  // ---- links -------------------------------------------------------
  // One LineSegments rebuilt in place each frame. Per-vertex colour carries
  // the distance falloff, so a link fades out as its two nodes separate
  // instead of popping off at the threshold.
  linkPositions = new Float32Array(MAX_LINKS * 6)
  linkColors = new Float32Array(MAX_LINKS * 6)
  linkGeometry = new THREE.BufferGeometry()
  linkGeometry.setAttribute('position', new THREE.BufferAttribute(linkPositions, 3))
  linkGeometry.setAttribute('color', new THREE.BufferAttribute(linkColors, 3))
  const linkMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  disposables.push(linkGeometry, linkMaterial)
  scene.add(new THREE.LineSegments(linkGeometry, linkMaterial))

  // ---- packets -----------------------------------------------------
  // Gold sparks that ride a link from one node to the other, then pick a new
  // pair. This is the bit that sells "the connection never blinks".
  const packetPositions = new Float32Array(PACKET_COUNT * 3)
  for (let i = 0; i < PACKET_COUNT; i++) {
    packets.push({
      from: Math.floor(Math.random() * NODE_COUNT),
      to: Math.floor(Math.random() * NODE_COUNT),
      t: Math.random(),
      speed: 0.0035 + Math.random() * 0.006,
    })
  }
  packetGeometry = new THREE.BufferGeometry()
  packetGeometry.setAttribute('position', new THREE.BufferAttribute(packetPositions, 3))
  const packetMaterial = new THREE.PointsMaterial({
    size: 0.5,
    map: dot,
    color: new THREE.Color(PACKET_RGB.r, PACKET_RGB.g, PACKET_RGB.b),
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })
  disposables.push(packetGeometry, packetMaterial)
  scene.add(new THREE.Points(packetGeometry, packetMaterial))

  renderFrame()
}

function updateNodes() {
  const pos = nodeGeometry.attributes.position.array
  for (let i = 0; i < NODE_COUNT; i++) {
    const n = nodes[i]
    n.x += n.vx
    n.y += n.vy
    n.z += n.vz

    // Bounce off the box rather than wrapping — wrapping would teleport a node
    // across the mesh and snap every link attached to it.
    if (n.x < -SPREAD.x / 2 || n.x > SPREAD.x / 2) n.vx *= -1
    if (n.y < -SPREAD.y / 2 || n.y > SPREAD.y / 2) n.vy *= -1
    if (n.z < -SPREAD.z / 2 || n.z > SPREAD.z / 2) n.vz *= -1

    pos[i * 3] = n.x
    pos[i * 3 + 1] = n.y
    pos[i * 3 + 2] = n.z
  }
  nodeGeometry.attributes.position.needsUpdate = true
}

function updateLinks() {
  let v = 0 // vertex pair counter
  for (let i = 0; i < NODE_COUNT && v < MAX_LINKS; i++) {
    const a = nodes[i]
    for (let j = i + 1; j < NODE_COUNT && v < MAX_LINKS; j++) {
      const b = nodes[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dz = a.z - b.z
      const dSq = dx * dx + dy * dy + dz * dz
      if (dSq > LINK_DIST_SQ) continue

      // 1 when the nodes touch, 0 at the cutoff.
      const strength = 1 - dSq / LINK_DIST_SQ

      const p = v * 6
      linkPositions[p] = a.x
      linkPositions[p + 1] = a.y
      linkPositions[p + 2] = a.z
      linkPositions[p + 3] = b.x
      linkPositions[p + 4] = b.y
      linkPositions[p + 5] = b.z

      const r = LINK_RGB.r * strength
      const g = LINK_RGB.g * strength
      const bl = LINK_RGB.b * strength
      linkColors[p] = r; linkColors[p + 1] = g; linkColors[p + 2] = bl
      linkColors[p + 3] = r; linkColors[p + 4] = g; linkColors[p + 5] = bl

      v++
    }
  }
  // Only draw the pairs actually written this frame; the rest of the buffer is
  // stale data from a denser frame and would render as frozen lines.
  linkGeometry.setDrawRange(0, v * 2)
  linkGeometry.attributes.position.needsUpdate = true
  linkGeometry.attributes.color.needsUpdate = true
}

function updatePackets() {
  const pos = packetGeometry.attributes.position.array
  for (let i = 0; i < PACKET_COUNT; i++) {
    const p = packets[i]
    p.t += p.speed
    if (p.t >= 1) {
      // Arrived: hop onward from the node it landed on, so packets trace a
      // route through the mesh instead of restarting from nowhere.
      p.from = p.to
      p.to = Math.floor(Math.random() * NODE_COUNT)
      p.t = 0
      p.speed = 0.0035 + Math.random() * 0.006
    }
    const a = nodes[p.from]
    const b = nodes[p.to]
    pos[i * 3] = a.x + (b.x - a.x) * p.t
    pos[i * 3 + 1] = a.y + (b.y - a.y) * p.t
    pos[i * 3 + 2] = a.z + (b.z - a.z) * p.t
  }
  packetGeometry.attributes.position.needsUpdate = true
}

function renderFrame() {
  animationId = requestAnimationFrame(renderFrame)
  if (!renderer || !scene || !camera) return

  updateNodes()
  updateLinks()
  updatePackets()

  // Parallax toward the pointer, eased so it trails the cursor rather than
  // snapping to it.
  camera.position.x += (pointerX * 2.6 - camera.position.x) * 0.025
  camera.position.y += (-pointerY * 1.8 - camera.position.y) * 0.025
  camera.lookAt(0, 0, 0)

  scene.rotation.y = Math.sin(performance.now() * 0.00006) * 0.12

  renderer.render(scene, camera)
}

function handlePointerMove(event) {
  pointerX = (event.clientX / window.innerWidth) * 2 - 1
  pointerY = (event.clientY / window.innerHeight) * 2 - 1
}

function handleScroll() {
  // The mesh recedes as you scroll into the copy, so text always wins over
  // the background. Bottoms out at 0.25 instead of 0 — the page shouldn't
  // look like the animation died.
  const fade = 1 - Math.min(window.scrollY / (window.innerHeight * 1.15), 0.75)
  const canvas = netCanvas.value
  // Written as a custom property rather than opacity directly: the mobile rule
  // scales the mesh down further, and an inline opacity would outrank it.
  if (canvas) canvas.style.setProperty('--scroll-fade', String(fade))
}

function handleResize() {
  const canvas = netCanvas.value
  if (!renderer || !camera || !canvas) return
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  if (!width || !height) return
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height, false)
}

function teardownScene() {
  if (animationId) cancelAnimationFrame(animationId)
  animationId = null
  disposables.forEach((d) => d.dispose())
  disposables = []
  nodes = []
  packets = []
  linkGeometry = null
  nodeGeometry = null
  packetGeometry = null
  linkPositions = null
  linkColors = null
  if (renderer) renderer.dispose()
  renderer = null
  scene = null
  camera = null
}

onMounted(() => {
  // Respect the OS setting: no rAF loop at all for anyone who asked for less
  // motion. The static page below is complete without it.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  initScene()
  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize)

  if (typeof ResizeObserver !== 'undefined' && netCanvas.value) {
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(netCanvas.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  if (resizeObserver) resizeObserver.disconnect()
  resizeObserver = null
  teardownScene()
})
</script>

<style src="../assets/boi-page.css"></style>

<style scoped>
/* Fixed to the viewport so the mesh stays put while the page scrolls over it.
   It's a child of .boi-page, and a parent paints its own background beneath its
   children, so the ink gradient from boi-page.css sits behind the mesh without
   needing to be overridden here. */
.net-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 0;
  pointer-events: none;
  /* handleScroll writes --scroll-fade every scroll frame. No transition on it:
     easing a continuously-changing value just makes it trail the scroll.
     --mesh-max is the ceiling each breakpoint allows. */
  --scroll-fade: 1;
  --mesh-max: 1;
  opacity: calc(var(--scroll-fade) * var(--mesh-max));
  /* Every block of copy on this page is left-aligned, and links drawn across a
     paragraph cost more readability than they add atmosphere. Fade the mesh out
     on the left so the weight sits right — the same side boi-page.css already
     puts its radial gradient. */
  -webkit-mask-image: linear-gradient(90deg,
    rgba(0, 0, 0, 0.10) 0%,
    rgba(0, 0, 0, 0.10) 26%,
    rgba(0, 0, 0, 0.55) 44%,
    rgba(0, 0, 0, 1) 66%);
  mask-image: linear-gradient(90deg,
    rgba(0, 0, 0, 0.10) 0%,
    rgba(0, 0, 0, 0.10) 26%,
    rgba(0, 0, 0, 0.55) 44%,
    rgba(0, 0, 0, 1) 66%);
}

/* Narrow screens: the copy spans the full width, so there is no clear side to
   give the mesh. Drop it to a texture instead of masking a column out. */
@media (max-width: 860px) {
  .net-canvas {
    -webkit-mask-image: none;
    mask-image: none;
    --mesh-max: 0.4;
  }
}

/* Content rides above the canvas. Without this the mesh would paint over the
   copy, since both are children of the same stacking context. The content
   elements are named rather than matched with :not(.net-canvas) — that blanket
   form also caught AcademyNav and forced position:relative onto a bar that has
   to stay fixed, which drops it into the scroll flow. The nav carries its own
   z-index (50/60) and already clears the canvas. */
.boi-page > header,
.boi-page > section {
  position: relative;
  z-index: 1;
}
</style>
