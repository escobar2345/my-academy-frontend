<template>
  <div class="boi-page">
    <canvas ref="canvas" class="dark-canvas" aria-hidden="true"></canvas>
    <AcademyNav />
    <header class="job-header">
      <div class="job-brand">
        BOI <span class="job-brand-accent">CAREERS</span>
      </div>
      <h1 class="job-title">Explore Job Opportunities</h1>
    </header>
    <section class="job-search-section">
      <div class="search-wrap">
        <Search :size="20" class="shrink-0 text-gray-500" />
        <input v-model="search" placeholder="Job title, Location" class="search-input" />
      </div>
      <div class="job-stats">
        <span class="job-stat">{{ jobs.length }} {{ sampleMode ? 'sample listings' : 'live jobs found' }}</span>
        <span class="job-stat">{{ currentCategory }}</span>
      </div>
    </section>
    <p v-if="sampleMode" class="job-fallback-notice" role="status">
      Live listings are temporarily unavailable. These sample roles are for preview only.
    </p>
    <section class="job-section">
      <div class="job-grid">
        <article v-for="job in filteredJobs" :key="jobKey(job)" class="job-card" :class="{ 'job-card-expanded': isExpanded(job) }">
          <div class="job-header-row">
            <button
              type="button"
              class="job-expand-button"
              :aria-expanded="isExpanded(job)"
              :aria-controls="jobDetailsId(job)"
              :aria-label="`${isExpanded(job) ? 'Hide' : 'Show'} details for ${job.title}`"
              @click="toggleJob(job)"
            >
              <span class="job-info">
                <span class="job-title-card">{{ job.title }}</span>
              <div class="job-meta">
                <span class="job-location">{{ job.location }}</span>
                <span class="job-type">{{ job.type }}</span>
              </div>
              </span>
              <span class="job-price">{{ job.price || 'Compensation varies' }}</span>
              <ChevronDown :size="18" class="job-expand-icon" :class="{ 'job-expand-icon-open': isExpanded(job) }" aria-hidden="true" />
            </button>
          </div>
          <p class="job-description">{{ job.description }}</p>
          <div v-if="isExpanded(job)" :id="jobDetailsId(job)" class="job-details">
            <div class="job-detail-heading">Role details</div>
            <p v-if="job.company" class="job-detail-line"><strong>Company</strong>{{ job.company }}</p>
            <p v-if="job.experienceLevel || job.experience" class="job-detail-line"><strong>Experience</strong>{{ job.experienceLevel || job.experience }}</p>
            <p v-if="detailText(job.responsibilities || job.roleDetails || job.requirements)" class="job-detail-copy">
              {{ detailText(job.responsibilities || job.roleDetails || job.requirements) }}
            </p>
            <div class="job-skills-block">
              <div class="job-detail-heading">Skills required</div>
              <ul class="job-skills">
                <li v-for="skill in requiredSkills(job)" :key="skill">{{ skill }}</li>
              </ul>
            </div>
          </div>
          <div class="job-footer">
            <div class="job-tags">
              <span class="job-tag">{{ job.category }}</span>
              <span class="job-tag">{{ sampleMode ? 'Sample listing' : 'AI Verified' }}</span>
            </div>
            <router-link :to="LOGIN_URL" class="apply-btn">
              Apply Now <span class="apply-arrow">&#8594;</span>
            </router-link>
          </div>
        </article>
      </div>
      <div v-if="loading && jobs.length === 0" class="empty-state">
        <h3 class="empty-title">Loading job listings…</h3>
      </div>
      <div v-else-if="error && jobs.length === 0" class="empty-state">
        <h3 class="empty-title">Job listings unavailable</h3>
        <p class="empty-text">{{ error }}</p>
        <button type="button" class="retry-btn" @click="fetchJobs">Try again</button>
      </div>
      <div v-else-if="filteredJobs.length === 0" class="empty-state">
        <div class="empty-icon">&#128269;</div>
        <h3 class="empty-title">No jobs found</h3>
        <p class="empty-text">Adjust your search or try a different category.</p>
      </div>
    </section>
    <footer class="job-footer">
      <p>BOI Tech Academy | AI-Powered Career Portal</p>
    </footer>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { ChevronDown, Search } from 'lucide-vue-next'
import AcademyNav from '../components/AcademyNav.vue'
import { LOGIN_URL } from '../constants/academy'

const search = ref('')
const jobs = ref([])
const loading = ref(false)
const error = ref(null)
const sampleMode = ref(false)
const currentCategory = ref('all')
const expandedJobId = ref(null)

const sampleJobs = [
  {
    id: 'sample-frontend-developer',
    title: 'Junior Frontend Developer',
    company: 'Example Digital Studio',
    location: 'Remote · Nigeria',
    type: 'Full-time',
    price: '₦180,000–₦280,000 / month',
    description: 'Build accessible, responsive web interfaces with a product team and senior engineering support.',
    responsibilities: 'Implement interface components, fix UI issues, and collaborate with design and backend teams.',
    requiredSkills: ['HTML/CSS', 'JavaScript', 'Vue or React', 'Responsive design', 'Git'],
    experienceLevel: 'Entry level · 0–2 years',
    category: 'frontend',
  },
  {
    id: 'sample-backend-developer',
    title: 'Backend Developer',
    company: 'Example Software Works',
    location: 'Hybrid · Port Harcourt, Nigeria',
    type: 'Full-time',
    price: '₦250,000–₦400,000 / month',
    description: 'Develop and maintain APIs and data services for customer-facing web applications.',
    responsibilities: 'Build REST endpoints, write tests, review database queries, and document service behavior.',
    requiredSkills: ['Python or Node.js', 'REST APIs', 'SQL', 'Automated testing', 'Git'],
    experienceLevel: 'Junior · 1–3 years',
    category: 'backend',
  },
  {
    id: 'sample-ai-automation',
    title: 'AI Workflow Automation Associate',
    company: 'Example Operations Lab',
    location: 'Remote · West Africa',
    type: 'Contract',
    price: '₦200,000–₦350,000 / month',
    description: 'Help teams automate repetitive workflows using APIs, language models, and no-code tools.',
    responsibilities: 'Map business processes, prototype automations, test outputs, and maintain clear documentation.',
    requiredSkills: ['Python basics', 'API integration', 'Prompt evaluation', 'Workflow tools', 'Documentation'],
    experienceLevel: 'Entry level · portfolio welcome',
    category: 'ai',
  },
  {
    id: 'sample-product-designer',
    title: 'Product Designer (UI/UX)',
    company: 'Example Product Team',
    location: 'Remote',
    type: 'Full-time',
    price: '₦220,000–₦360,000 / month',
    description: 'Shape clear user journeys and polished product interfaces for web and mobile experiences.',
    responsibilities: 'Create flows and prototypes, contribute to design reviews, and refine work based on user feedback.',
    requiredSkills: ['Figma', 'Prototyping', 'User research', 'Design systems', 'Accessibility basics'],
    experienceLevel: 'Junior · 1–3 years',
    category: 'uiux',
  },
  {
    id: 'sample-data-analyst',
    title: 'Data Analyst',
    company: 'Example Insights Group',
    location: 'Hybrid · Lagos, Nigeria',
    type: 'Full-time',
    price: '₦200,000–₦330,000 / month',
    description: 'Turn operational data into useful reports and recommendations for business teams.',
    responsibilities: 'Clean datasets, build dashboards, investigate trends, and present findings to stakeholders.',
    requiredSkills: ['SQL', 'Excel', 'Data visualization', 'Basic statistics', 'Communication'],
    experienceLevel: 'Entry to junior · 0–2 years',
    category: 'data',
  },
]

const roleSkillSets = [
  { pattern: /front.?end|web developer|react|vue|next\.js/, skills: ['HTML/CSS', 'JavaScript or TypeScript', 'React or Vue', 'Responsive design', 'Git'] },
  { pattern: /back.?end|api developer|server.?side/, skills: ['Node.js or Python', 'REST APIs', 'SQL and data modeling', 'Authentication', 'Git'] },
  { pattern: /mobile|ios|android|react native|flutter/, skills: ['Mobile app development', 'React Native or Flutter', 'API integration', 'App testing', 'Git'] },
  { pattern: /ai|automation|machine learning/, skills: ['Python', 'LLM or machine-learning fundamentals', 'API integration', 'Automation workflows', 'Data handling'] },
  { pattern: /marketing|seo|social media|content/, skills: ['Content strategy', 'SEO fundamentals', 'Social media analytics', 'Copywriting', 'Campaign reporting'] },
  { pattern: /data|analyst|analytics/, skills: ['SQL', 'Excel or spreadsheets', 'Data visualization', 'Statistics fundamentals', 'Analytical communication'] },
  { pattern: /ui.?ux|product design|user experience/, skills: ['Figma', 'Wireframing', 'Prototyping', 'User research', 'Accessibility fundamentals'] },
  { pattern: /graphic|visual design/, skills: ['Adobe Creative Suite or equivalent', 'Typography', 'Layout and composition', 'Brand systems', 'File preparation'] },
]

function jobKey(job) {
  return String(job.id || job.url || job.title || 'job')
}

function jobDetailsId(job) {
  return `job-details-${jobKey(job).replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

function isExpanded(job) {
  return expandedJobId.value === jobKey(job)
}

function toggleJob(job) {
  const key = jobKey(job)
  expandedJobId.value = expandedJobId.value === key ? null : key
}

function detailText(value) {
  if (Array.isArray(value)) return value.map(item => typeof item === 'string' ? item : item?.description || item?.title || '').filter(Boolean).join(' ')
  if (typeof value === 'string') return value.trim()
  return ''
}

function requiredSkills(job) {
  const supplied = job.requiredSkills || job.required_skills || job.skillRequirements || job.skills
  const normalized = (Array.isArray(supplied) ? supplied : typeof supplied === 'string' ? supplied.split(/[,;\n•]+/) : [])
    .map(skill => typeof skill === 'string' ? skill.trim() : skill?.name || skill?.skill || '')
    .filter(Boolean)
  if (normalized.length) return normalized

  const role = `${job.title || ''} ${job.category || ''}`.toLowerCase()
  return roleSkillSets.find(group => group.pattern.test(role))?.skills || ['Communication', 'Problem-solving', 'Relevant role experience', 'Collaboration']
}

const categories = [
  { id: 'all', label: 'All Categories' },
  { id: 'frontend', label: 'Frontend Dev' },
  { id: 'backend', label: 'Backend Dev' },
  { id: 'mobile', label: 'Mobile App Dev' },
  { id: 'ai', label: 'AI Automation' },
  { id: 'marketing', label: 'Digital Marketing' },
  { id: 'data', label: 'Data Analysis' },
  { id: 'uiux', label: 'UI/UX Design' },
  { id: 'graphic', label: 'Graphic Design' },
]

const filteredJobs = computed(() => {
  if (!jobs.value || jobs.value.length === 0) return []
  let filtered = jobs.value
  if (currentCategory.value !== 'all') {
    filtered = filtered.filter(j => j.category.toLowerCase() === currentCategory.value)
  }
  if (search.value) {
    const term = search.value.toLowerCase()
    filtered = filtered.filter(j =>
      (j.title || '').toLowerCase().includes(term) ||
      (j.description || '').toLowerCase().includes(term) ||
      (j.location || '').toLowerCase().includes(term)
    )
  }
  return filtered
})

const fetchJobs = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('/api/jobs')
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.error || `Job listings failed (HTTP ${response.status}).`)
    const liveJobs = Array.isArray(payload.jobs) ? payload.jobs : []
    sampleMode.value = liveJobs.length === 0
    jobs.value = liveJobs.length ? liveJobs : sampleJobs
    if (payload.warnings?.length) console.warn('Job listing providers:', payload.warnings.join(' '))
  } catch (err) {
    console.error('Error loading jobs:', err)
    error.value = err.message || 'Failed to load jobs. Please try again later.'
    if (jobs.value.length === 0) {
      jobs.value = sampleJobs
      sampleMode.value = true
    }
  } finally {
    loading.value = false
  }
}

// Auto-refresh job listings every 12 hours (twice daily)
const REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000

const scheduleRefresh = () => {
  setInterval(() => {
    console.log('Refreshing job listings...')
    fetchJobs()
  }, REFRESH_INTERVAL_MS)
}

// Start auto-refresh after initial load
onMounted(() => {
  fetchJobs()
  scheduleRefresh()
})
</script>
<style scoped>
.job-search-section {
  position: relative;
  z-index: 1;
  padding: 0 clamp(20px, 5vw, 64px) 24px clamp(20px, 5vw, 64px);
}
.job-fallback-notice {
  margin: 0 clamp(20px, 5vw, 64px);
  padding: 12px 14px;
  border-left: 3px solid var(--gold);
  background: rgba(210, 166, 59, 0.08);
  color: var(--paper-dim);
  font-size: 13px;
  line-height: 1.5;
}
.search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 640px;
  border-radius: 12px;
  border: 1px solid rgba(246, 244, 236, 0.12);
  background: rgba(246, 244, 236, 0.05);
  padding: 10px 14px;
}
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--paper);
  font-size: 14px;
}
.search-input::placeholder { color: var(--paper-dim); }
.job-stats {
  margin-top: 12px;
  font-size: 13px;
  color: var(--paper-dim);
  display: flex;
  gap: 16px;
}
.job-section {
  position: relative;
  z-index: 1;
  padding: 24px clamp(20px, 5vw, 64px) 40px clamp(20px, 5vw, 64px);
}
.job-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
.job-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(246, 244, 236, 0.1);
  border-radius: 16px;
  padding: 20px;
  transition: none;
}
.job-card:hover {
  border-color: rgba(210, 166, 59, 0.4);
  transform: none;
}
.job-header-row {
  display: flex;
  margin-bottom: 12px;
}
.job-expand-button {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: none;
}
.job-expand-button:focus-visible { outline: 2px solid var(--gold); outline-offset: 4px; border-radius: 4px; }
.job-info { flex: 1; min-width: 0; }
.job-title-card {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--paper);
  margin: 0 0 6px 0;
}
.job-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.job-location {
  font-size: 13px;
  color: var(--paper-dim);
}
.job-type {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(210, 166, 59, 0.1);
  color: #d4a373;
  padding: 2px 8px;
  border-radius: 6px;
}
.job-price {
  flex: none;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gold);
}
.job-expand-icon { flex: none; margin-top: 2px; color: var(--paper-dim); transition: transform .2s ease, color .2s ease; }
.job-expand-icon-open { transform: rotate(180deg); color: var(--gold); }
.job-description {
  font-size: 14px;
  color: var(--paper-dim);
  line-height: 1.6;
  margin-bottom: 16px;
}
.job-details {
  margin: 0 0 18px;
  padding: 16px;
  border: 1px solid rgba(210, 166, 59, 0.22);
  border-radius: 10px;
  background: rgba(11, 90, 49, 0.16);
  animation: details-in .18s ease-out;
}
@keyframes details-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.job-detail-heading { margin-bottom: 10px; color: var(--gold); font: 600 11px 'Space Grotesk', sans-serif; letter-spacing: .12em; text-transform: uppercase; }
.job-detail-line { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 8px; color: var(--paper-dim); font-size: 13px; }
.job-detail-line strong { min-width: 82px; color: var(--paper); }
.job-detail-copy { margin: 10px 0 16px; color: var(--paper-dim); font-size: 13px; line-height: 1.6; }
.job-skills-block { margin-top: 12px; }
.job-skills { display: flex; flex-wrap: wrap; gap: 7px; margin: 0; padding: 0; list-style: none; }
.job-skills li { padding: 5px 9px; border: 1px solid rgba(246, 244, 236, 0.15); border-radius: 6px; color: var(--paper); background: rgba(246, 244, 236, 0.06); font-size: 11px; line-height: 1.35; }
.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}
.job-tags {
  display: flex;
  gap: 8px;
}
.job-tag {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(246, 244, 236, 0.1);
  color: var(--gold);
  border: 1px solid rgba(210, 166, 59, 0.2);
}
.apply-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: rgba(210, 166, 59, 0.1);
  border: 1px solid rgba(210, 166, 59, 0.3);
  border-radius: 8px;
  color: #e8a52f;
  font-weight: 600;
  font-size: 13px;
  text-decoration: none;
  transition: all 0.2s ease;
}
.apply-btn:hover {
  background: rgba(210, 166, 59, 0.2);
  border-color: var(--gold);
}
.apply-arrow { font-size: 10px; }
@media (max-width: 480px) {
  .job-card { padding: 16px; }
  .job-expand-button { gap: 8px; }
  .job-price { font-size: .95rem; }
  .job-footer { align-items: flex-start; gap: 12px; flex-direction: column; }
}
.empty-state {
  text-align: center;
  padding: 60px 20px;
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--paper);
  margin-bottom: 8px;
}
.empty-text { color: var(--paper-dim); font-size: 14px; }
.retry-btn { margin-top: 16px; padding: 10px 16px; border: 1px solid rgba(210, 166, 59, 0.45); border-radius: 8px; color: var(--gold); background: rgba(210, 166, 59, 0.08); font: 600 12px 'Space Grotesk', sans-serif; cursor: pointer; }
.retry-btn:hover { background: rgba(210, 166, 59, 0.16); }
</style>
