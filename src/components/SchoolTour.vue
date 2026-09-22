<template>
  <section class="school-tour" aria-label="A scroll-driven walk through the campus">
    <video ref="videoA" class="tour-video" muted playsinline preload="auto"></video>
    <video ref="videoB" class="tour-video" muted playsinline preload="auto"></video>

    <!-- Overlay copy fades out as you walk in -->
    <div class="overlay">
      <p class="eyebrow">Step inside the campus</p>
      <h2 class="title">Walk the halls of BOI RSU.</h2>
      <p class="sub">
        This isn't a video that plays on its own — it moves as you do.
        Scroll and the campus walks past you.
      </p>
      <div class="hint">
        <span class="chevron">⌄</span>
        <span>Keep scrolling — walk forward</span>
      </div>
    </div>

    <!-- Progress through the walk -->
    <div class="progress">
      <div ref="progressFillEl" class="progress-fill"></div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Two stitched tour clips live under /public/school.
const VIDEOS = ['/school/tour-1.mp4', '/school/tour-2.mp4']

const videoA = ref(null)
const videoB = ref(null)
const progressFillEl = ref(null)

let videos = []
let current = -1      // index of the video that is currently active
let rafId = null
let rafLocked = false

function setActive(i) {
  if (i === current) return
  // Pause whatever is showing and hide it; show the new clip.
  videos.forEach((v, vi) => {
    if (vi === i) {
      v.classList.add('is-active')
      v.currentTime = 0
      v.play().catch(() => {})
    } else {
      v.classList.remove('is-active')
      v.pause()
    }
  })
  current = i
}

// Smoothed scrub: we ask the browser to target a time and ease toward it in
// requestAnimationFrame, so even a fast scroll glides instead of snapping.
function scrub(targetTime) {
  if (rafLocked) return
  rafLocked = true
  rafId = requestAnimationFrame(() => {
    rafLocked = false
    const v = videos[current]
    if (!v || !v.duration || Number.isNaN(targetTime)) return
    const diff = targetTime - v.currentTime
    if (Math.abs(diff) > 0.001) {
      // Ease toward the target; clamp so we never go out of range.
      v.currentTime = Math.max(0, Math.min(v.duration - 0.001, v.currentTime + diff * 0.4))
      // If scrubbing away from the last frame the video is likely paused;
      // keep it "playing" so the seek actually renders.
      if (v.paused && Math.abs(v.currentTime - targetTime) > 0.02) {
        v.play().catch(() => {})
      }
    }
  })
}

let scrollCtx = null

onMounted(async () => {
  videos = [videoA.value, videoB.value]

  // Load both videos' metadata (duration) before wiring the scrub.
  await Promise.all(videos.map((v) => new Promise((resolve) => {
    if (v.readyState >= 1) return resolve()
    v.onloadedmetadata = resolve
    v.load()
  })))

  const total = videos.reduce((s, v) => s + v.duration, 0)

  // Start on clip 1, paused on its first frame.
  setActive(0)
  videos[0].currentTime = 0.001

  scrollCtx = gsap.context(() => {
    // The whole walk is one continuous scroll, split across both clips.
    gsap.timeline({
      scrollTrigger: {
        trigger: '.school-tour',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true
      },
      onUpdate(self) {
        const t = self.progress
        let acc = 0
        for (let i = 0; i < videos.length; i++) {
          const d = videos[i].duration
          const span = d / total
          if (t >= acc && t <= acc + span) {
            setActive(i)
            const p = (t - acc) / span
            scrub(p * d)
            break
          }
        }
      }
    })

    // Overlay copy drifts away as the walk begins.
    gsap.to('.overlay', {
      opacity: 0,
      y: -60,
      ease: 'none',
      scrollTrigger: { trigger: '.school-tour', start: 'top top', end: 'top+=40%', scrub: 0.5 }
    })

    // Fill the progress bar with the walk.
    gsap.to(progressFillEl.value, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: '.school-tour', start: 'top top', end: 'bottom bottom', scrub: 0.5 }
    })
  })
})

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (scrollCtx) scrollCtx.revert()
  videos.forEach((v) => v.pause())
})
</script>

<style scoped>
.school-tour {
  position: relative;
  height: 600vh;
  background: #0b1120;
}

.tour-video {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  object-fit: cover;
  opacity: 0;
  pointer-events: none;
  background: #0b1120;
}

.tour-video.is-active {
  opacity: 1;
}

.overlay {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #f8fafc;
  pointer-events: none;
  font-family: 'Space Grotesk', 'Inter', Arial, sans-serif;
  z-index: 2;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.75rem;
  opacity: 0.8;
  margin-bottom: 12px;
}

.title {
  font-size: clamp(2rem, 5.5vw, 4.2rem);
  line-height: 1.05;
  font-weight: 700;
  margin: 0 0 16px;
}

.sub {
  max-width: 480px;
  font-size: 1.05rem;
  line-height: 1.6;
  opacity: 0.85;
  margin: 0 0 32px;
}

.hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  opacity: 0.75;
}

.chevron {
  animation: nudge 1.4s ease-in-out infinite;
  font-size: 1.1rem;
}

@keyframes nudge {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

.progress {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: rgba(255,255,255,0.08);
  z-index: 10;
}

.progress-fill {
  height: 100%;
  transform: scaleX(0);
  transform-origin: left;
  background: linear-gradient(90deg, #22c55e, #f59e0b);
}
</style>
