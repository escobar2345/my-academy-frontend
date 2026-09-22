<template>
  <div class="learning-app">
    <!-- Animated Background Layers -->
    <canvas ref="starfieldCanvas" class="starfield"></canvas>
    <div class="aurora aurora-1"></div>
    <div class="aurora aurora-2"></div>
    <div class="aurora aurora-3"></div>
    <div class="grid-overlay"></div>

    <!-- Main Content -->
    <div class="content-wrapper">
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

          <!-- Orbit Tasks Container -->
          <div ref="taskOrbit" class="task-orbit"></div>
        </div>
      </div>
    </div>

    <!-- Completion Overlay -->
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
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'

// ===== COURSE DATA =====
const topics = [
  { short: 'Orientation', title: 'Welcome & Orientation', blurb: 'Get set up and ready to learn.',
    tasks: ['Watch the welcome video', 'Read the course syllabus', 'Introduce yourself in the forum'] },
  { short: 'Lesson 1', title: 'Lesson 1 – Foundations', blurb: 'Build your base knowledge.',
    tasks: ['Read: Foundations guide', 'Watch: Key ideas explained', 'Activity: knowledge check'] },
  { short: 'Lesson 2', title: 'Lesson 2 – Core Skills', blurb: 'Practise the core skills.',
    tasks: ['Read: core skills walkthrough', 'Practice exercise set A', 'Practice exercise set B'] },
  { short: 'Lesson 3', title: 'Lesson 3 – Applying Knowledge', blurb: 'Apply what you have learned.',
    tasks: ['Case-study analysis', 'Submit reflection notes'] },
  { short: 'Quiz', title: 'Assessment – Topic Quiz', blurb: 'Prove your understanding.',
    tasks: ['Pass the 10-question quiz (≥ 70%)'] },
  { short: 'Project', title: 'Final Project & Certificate', blurb: 'Finish strong and get certified.',
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
const current = ref(1)
const furthest = ref(1)
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

const done = reactive(topics.map((t, i) => t.tasks.map(() => i < 1)))

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
    
    card.addEventListener('click', (e) => {
      e.stopPropagation()
      done[current.value][idx] = !done[current.value][idx]
      card.classList.toggle('done', done[current.value][idx])
      if (done[current.value][idx]) createParticles(e.clientX, e.clientY)
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
onMounted(() => {
  nextTick(() => {
    initStarfield()
    buildNodes()
    renderStates()
    animatePath(0, current.value / (topics.length - 1), 1400, () => {
      showTasks()
      setTimeout(() => scrollToNodeSmooth(current.value, 800), 200)
    })
  })
  document.addEventListener('visibilitychange', handleVisibility)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (starfieldAnimationId) cancelAnimationFrame(starfieldAnimationId)
  if (orbitAnimationFrame) cancelAnimationFrame(orbitAnimationFrame)
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
  overflow-x: hidden;
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

/* ===== MAIN CONTENT ===== */
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
  max-width: 1100px;
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
</style>