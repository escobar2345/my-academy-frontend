<template>
  <main class="min-h-screen bg-[#06050a] p-0 text-white sm:p-5 lg:p-8 relative overflow-hidden">
    <canvas ref="canvas" class="fixed inset-0 z-0 w-full h-full block" aria-hidden="true"></canvas>

    <div class="mx-auto min-h-screen max-w-[1500px] overflow-hidden border border-white/10 bg-[#101013]/85 shadow-2xl sm:min-h-0 sm:rounded-2xl lg:min-h-[850px] relative z-10 backdrop-blur-md">
      <header class="sticky top-0 z-20 border-b border-white/10 bg-[#101013]/80 px-5 py-4 backdrop-blur-xl sm:px-8 lg:px-10">
        <div class="flex items-center justify-between">
          <a href="#home" class="text-xl font-extrabold tracking-tight sm:text-2xl">
            CAREER <span class="text-violet-400">HUB</span>
          </a>
          <h1 class="text-lg font-bold tracking-tight sm:text-xl text-center sm:ml-auto lg:ml-0">
            Explore Job Opportunities
          </h1>
          <div class="w-10 sm:w-20 lg:w-0" aria-hidden="true"></div>
        </div>
      </header>

      <section id="home" class="px-8 pt-7 lg:px-12">
        <div class="mx-auto mt-6 flex max-w-5xl items-center gap-3 rounded-xl border border-white/10 bg-[#1a1a20]/60 px-4 py-3 focus-within:border-violet-500/60 backdrop-blur-sm">
          <Search :size="20" class="shrink-0 text-gray-500" />
          <input v-model="search" placeholder="Job title, Location" class="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500" />
        </div>
      </section>

      {/* MOBILE HERO */}
      <section class="px-4 pt-4 lg:hidden">
        <div class="relative min-h-[150px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#7e35d5] via-[#6337c8] to-[#3d3bb0] p-4 sm:min-h-[190px] sm:p-6">
          <div class="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div class="absolute right-3 top-3 h-28 w-28 rounded-full bg-orange-300/20 blur-2xl" />
          <div class="relative z-10 max-w-[65%]">
            <p class="text-xl font-extrabold leading-tight sm:text-3xl">Find Your Next<br />Dream Job!</p>
            <p class="mt-2 text-xs text-purple-100 sm:text-sm">Welcome to Career Hub!</p>
          </div>
          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80" alt="Professional job seeker" class="absolute bottom-0 right-0 h-[125px] w-[42%] object-cover object-top [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)] sm:h-[170px]" />
          <div class="absolute bottom-3 left-3 right-3 z-20 flex items-center gap-2 rounded-xl border border-white/10 bg-[#17171d] px-3 py-2.5 sm:bottom-4 sm:left-5 sm:right-5">
            <Search size="17" class="shrink-0 text-gray-400" />
            <input v-model="search" placeholder="Job title, Location" class="w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-gray-500 sm:text-sm" />
          </div>
        </div>
      </section>

      {/* JOB CATEGORIES */}
      <section id="categories" class="mt-6 lg:mt-0 lg:px-12 lg:pt-7">
        <div class="mb-4 flex items-center justify-between px-4 lg:hidden">
          <h2 class="text-base font-bold">Job Categories</h2>
          <button class="text-xs text-violet-400">See all</button>
        </div>

        <div class="hidden lg:block">
          <div class="mx-auto max-w-5xl">
            <p class="mb-3 text-sm font-semibold text-gray-300">Browse by category</p>
            <div class="grid grid-cols-4 gap-4">
              <a v-for="category in categories" :key="category.name" href="#jobs" class="group relative flex h-24 items-end overflow-hidden rounded-xl border border-white/10 p-3">
                <img :src="category.image" alt="" class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                <div :class="`absolute inset-0 bg-gradient-to-t ${category.color} via-black/20 to-black/10`" />
                <span class="relative text-sm font-semibold">{{ category.name }}</span>
              </a>
            </div>
          </div>
        </div>

        <div class="flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
          <a v-for="category in categories" :key="category.name" href="#jobs" class="group relative h-[112px] min-w-[112px] flex-1 overflow-hidden rounded-xl border border-white/10 sm:h-36 sm:min-w-[150px]">
            <img :src="category.image" alt="" class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110" />
            <div :class="`absolute inset-0 bg-gradient-to-t ${category.color} via-black/20 to-black/10`" />
            <span class="absolute bottom-3 left-3 text-xs font-semibold sm:text-sm">{{ category.name }}</span>
          </a>
        </div>
      </section>


      {/* JOB LISTINGS */}
      <section id="jobs" class="px-4 pb-8 pt-7 sm:px-6 lg:px-12 lg:pt-8">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold sm:text-xl">
              <span class="lg:hidden">Recent Listings</span>
              <span class="hidden lg:inline">Featured Opportunities</span>
            </h2>
            <p class="mt-1 text-xs text-gray-500">{{ filteredJobs.length }} opportunities available</p>
          </div>
          <a href="#jobs" class="hidden items-center gap-1 text-sm text-violet-400 hover:text-violet-300 sm:flex">
            View all <ArrowUpRight size="16" />
          </a>
        </div>

        {/* DESKTOP JOB CARDS */}
        <div class="hidden grid-cols-2 gap-4 xl:grid-cols-3 lg:grid lg:grid-cols-2">
          <article v-for="(job, index) in filteredJobs" :key="`${job.title}-${index}`" class="group min-w-0 rounded-xl border border-white/10 bg-gradient-to-b from-[#222226] to-[#19191d] p-2 transition duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-950/20">
            <div class="relative h-36 overflow-hidden rounded-lg xl:h-32">
              <img :src="job.image" :alt="job.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <button @click="toggleSaved(job.title)" aria-label="Save job" class="absolute right-2 top-2 rounded-lg border border-white/10 p-2 backdrop-blur-md transition" :class="savedJobs.includes(job.title) ? 'bg-violet-600 text-white' : 'bg-black/40 text-white hover:bg-violet-600'">
                <Bookmark size="15" />
              </button>
            </div>
            <div class="p-2">
              <h3 class="truncate text-base font-semibold text-white">{{ job.title }}</h3>
              <p class="mt-1 truncate text-sm text-gray-400">Company: {{ job.company }}</p>
              <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-300">
                <span class="flex items-center gap-1.5"><MapPin size="13" class="text-gray-500" /> {{ job.location }}</span>
                <span class="flex items-center gap-1.5"><DollarSign size="13" class="text-gray-500" /> {{ job.salary }}</span>
              </div>
              <div class="mt-4 flex items-center justify-between gap-2">
                <div class="flex min-w-0 items-center gap-2">
                  <div :class="`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${job.color} font-bold text-white`">{{ job.logo }}</div>
                  <span class="rounded-md bg-white/[0.06] px-2 py-1 text-xs text-gray-300">{{ job.type }}</span>
                </div>
                <button @click="applyForJob(job.title)" class="shrink-0 rounded-lg border px-4 py-2 text-xs font-semibold transition" :class="appliedJobs.includes(job.title) ? 'border-violet-400 bg-violet-600 text-white' : 'border-white/40 text-white hover:border-violet-400 hover:bg-violet-600'">
                  {{ appliedJobs.includes(job.title) ? 'Applied ✓' : 'Apply Now' }}
                </button>
              </div>
            </div>
          </article>
        </div>


        {/* MOBILE JOB CARDS */}
        <div class="flex flex-col gap-3 lg:hidden">
          <article v-for="(job, index) in filteredJobs" :key="`${job.title}-${index}`" class="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-[#242428] to-[#19191d] p-3 transition hover:border-violet-500/40 sm:gap-4 sm:p-4">
            <div :class="`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${job.color} shadow-lg sm:h-14 sm:w-14`">
              <span class="text-2xl font-black text-white">{{ job.logo }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="truncate text-sm font-semibold text-white sm:text-base">{{ job.title }}</h3>
              <p class="mt-1 truncate text-xs text-gray-400">{{ job.company }}</p>
              <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400 sm:text-xs">
                <span class="flex items-center gap-1"><DollarSign size="12" /> {{ job.salary }}</span>
                <span class="flex items-center gap-1"><Clock3 size="12" /> {{ job.type }}</span>
              </div>
            </div>
            <button @click="applyForJob(job.title)" class="shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition sm:px-5 sm:py-2.5 sm:text-sm" :class="appliedJobs.includes(job.title) ? 'bg-violet-700 text-white' : 'bg-gradient-to-r from-[#bb8bff] to-[#d4a7ff] text-[#211333] hover:brightness-110'">
              {{ appliedJobs.includes(job.title) ? 'Applied' : 'Apply' }}
            </button>
          </article>
          <div v-if="filteredJobs.length === 0" class="rounded-xl border border-white/10 p-8 text-center">
            <Search class="mx-auto mb-3 text-gray-500" size="28" />
            <p class="font-semibold">No jobs found</p>
            <p class="mt-1 text-sm text-gray-500">Try a different job title or location.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="footer" class="border-t border-white/10 px-5 py-5 text-center text-xs text-gray-500">
        &copy; 2026 Career Hub. Find your next opportunity.
      </footer>
    </div>
  </main>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import * as THREE from "three"
import { Search, MapPin, Clock3, DollarSign, Menu, UserCircle, BriefcaseBusiness, X, Bookmark, ArrowUpRight } from "lucide-vue-next"

const canvas = ref(null)
const search = ref("")
const savedJobs = ref([])
const appliedJobs = ref([])

const jobs = [
  { title: "Senior UX Designer", company: "TechCorp", location: "NYC", salary: "$120k\u2013$145k", type: "Full-Time", image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&auto=format&fit=crop&q=80", logo: "T", color: "from-cyan-400 to-blue-600" },
  { title: "Full Stack Engineer", company: "Innovate Solutions", location: "Remote", salary: "$120k\u2013$145k", type: "Full-Time", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&auto=format&fit=crop&q=80", logo: "I", color: "from-emerald-400 to-green-700" },
  { title: "Digital UX Engineer", company: "TechCorp", location: "NYC", salary: "$110k\u2013$140k", type: "Full-Time", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop&q=80", logo: "D", color: "from-indigo-400 to-purple-600" },
  { title: "Senior UX Designer", company: "TechCorp", location: "Remote", salary: "$120k\u2013$145k", type: "Full-Time", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&auto=format&fit=crop&q=80", logo: "T", color: "from-cyan-400 to-blue-600" },
  { title: "Full Stack Engineer", company: "Innovate Solutions", location: "NYC", salary: "$120k\u2013$145k", type: "Full-Time", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=80", logo: "I", color: "from-emerald-400 to-green-700" },
  { title: "Product Manager", company: "TechCorp", location: "Remote", salary: "$115k\u2013$150k", type: "Full-Time", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80", logo: "P", color: "from-violet-400 to-blue-600" },
]

const categories = [
  { name: "Design", image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&auto=format&fit=crop&q=80", color: "from-purple-600/70" },
  { name: "Engineering", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80", color: "from-blue-950/80" },
  { name: "Marketing", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80", color: "from-orange-950/80" },
  { name: "Product", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&auto=format&fit=crop&q=80", color: "from-cyan-950/80" },
]

const filteredJobs = computed(() => jobs.filter((job) => `${job.title} ${job.company} ${job.location}`.toLowerCase().includes(search.value.toLowerCase())))

function toggleSaved(title) {
  if (savedJobs.value.includes(title)) {
    savedJobs.value = savedJobs.value.filter((item) => item !== title)
  } else {
    savedJobs.value = [...savedJobs.value, title]
  }
}

function applyForJob(title) {
  if (!appliedJobs.value.includes(title)) {
    appliedJobs.value = [...appliedJobs.value, title]
  }
}

/* Three.js dark constellation background */
let scene, camera, renderer, points, lines, vels
let rafId

function initThree() {
  const el = canvas.value
  if (!el) return

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x040307, 0.03)

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 120)
  camera.position.z = 50

  renderer = new THREE.WebGLRenderer({ canvas: el, alpha: true, antialias: true, powerPreference: "high-performance" })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x040307, 1)

  const count = 140
  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  vels = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 90
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50
    positions[i * 3 + 2] = (Math.random() - 0.5) * 70
    vels[i * 3] = (Math.random() - 0.5) * 0.014
    vels[i * 3 + 1] = (Math.random() - 0.5) * 0.014
    vels[i * 3 + 2] = (Math.random() - 0.5) * 0.014
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))

  const mat = new THREE.PointsMaterial({ size: 0.13, color: 0x8b5cf6, transparent: true, opacity: 0.75 })
  points = new THREE.Points(geo, mat)
  scene.add(points)

  const lineGeo = new THREE.BufferGeometry()
  lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * count * 6), 3))
  const lineMat = new THREE.LineBasicMaterial({ color: 0x4f46e5, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending })
  lines = new THREE.LineSegments(lineGeo, lineMat)
  scene.add(lines)

  window.addEventListener("resize", onResize)
  animate()
}

function onResize() {
  if (!renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  rafId = requestAnimationFrame(animate)

  const pos = points.geometry.attributes.position
  const cnt = pos.count

  for (let i = 0; i < cnt; i++) {
    pos.array[i * 3] += vels[i * 3]
    pos.array[i * 3 + 1] += vels[i * 3 + 1]
    pos.array[i * 3 + 2] += vels[i * 3 + 2]

    if (Math.abs(pos.array[i * 3]) > 45) vels[i * 3] *= -1
    if (Math.abs(pos.array[i * 3 + 1]) > 26) vels[i * 3 + 1] *= -1
    if (Math.abs(pos.array[i * 3 + 2]) > 36) vels[i * 3 + 2] *= -1
  }
  pos.needsUpdate = true

  points.rotation.y += 0.0015
  points.rotation.x = Math.sin(Date.now() * 0.001) * 0.05

  const linePos = lines.geometry.attributes.position
  let idx = 0
  const limit = 15
  for (let i = 0; i < cnt; i++) {
    for (let j = i + 1; j < cnt; j++) {
      const dx = pos.array[i * 3] - pos.array[j * 3]
      const dy = pos.array[i * 3 + 1] - pos.array[j * 3 + 1]
      const dz = pos.array[i * 3 + 2] - pos.array[j * 3 + 2]
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (d < limit) {
        linePos.array[idx++] = pos.array[i * 3]
        linePos.array[idx++] = pos.array[i * 3 + 1]
        linePos.array[idx++] = pos.array[i * 3 + 2]
        linePos.array[idx++] = pos.array[j * 3]
        linePos.array[idx++] = pos.array[j * 3 + 1]
        linePos.array[idx++] = pos.array[j * 3 + 2]
      }
    }
  }
  linePos.needsUpdate = true
  lines.geometry.setDrawRange(0, idx)

  renderer.render(scene, camera)
}

onMounted(() => {
  initThree()
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  window.removeEventListener("resize", onResize)
  if (renderer) {
    renderer.dispose()
    if (scene) scene.clear()
  }
})
</script>

