<template>
  <div class="boirsu-page">
    <div class="hero">
      <div>
        <p class="eyebrow">BOI RSU • backend-driven demo</p>
        <h1>BOI RSU control panel</h1>
        <p class="intro">This view exercises the BOI RSU backend script from the browser so you can test student enrollment, roadmap generation, quiz tracking, assignment submission, attendance, and certificate generation.</p>
      </div>
      <button class="refresh-btn" @click="loadCourses">Refresh courses</button>
    </div>

    <div class="grid">
      <section class="card">
        <h2>1. Select a course</h2>
        <select v-model="selectedCourse">
          <option v-for="course in courses" :key="course.slug" :value="course.slug">{{ course.title }} ({{ course.duration }})</option>
        </select>
        <div class="row">
          <input v-model="studentName" placeholder="Student name" />
          <input v-model="studentPhone" placeholder="Phone" />
        </div>
        <div class="row">
          <input v-model="studentEmail" placeholder="Email" />
          <input v-model="experienceLevel" placeholder="Experience level" />
        </div>
        <button class="primary" @click="enrollStudent">Enroll student</button>
        <pre v-if="studentResult">{{ studentResult }}</pre>
      </section>

      <section class="card">
        <h2>2. Student workflow</h2>
        <div class="row">
          <input v-model="studentId" placeholder="Student ID" />
          <button @click="loadStudent">Load student</button>
        </div>
        <div class="actions">
          <button @click="generateRoadmap">Generate roadmap</button>
          <button @click="generateCertificate">Generate certificate</button>
        </div>
        <div class="actions">
          <button @click="submitQuiz">Record quiz</button>
          <button @click="submitAssignment">Submit assignment</button>
        </div>
        <div class="actions">
          <button @click="markAttendance">Mark attendance</button>
        </div>
        <pre v-if="workflowResult">{{ workflowResult }}</pre>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const courses = ref([])
const selectedCourse = ref('frontend-developer')
const studentName = ref('Ada Lovelace')
const studentPhone = ref('08012345678')
const studentEmail = ref('ada@example.com')
const experienceLevel = ref('beginner')
const studentId = ref('')
const studentResult = ref('')
const workflowResult = ref('')

const api = axios.create({
  // Same-origin by default (Vite proxy locally, production deploy server on
  // Railway). Set VITE_API_BASE_URL to target a different backend host.
  baseURL: (import.meta.env.VITE_API_BASE_URL ?? '') + '/api/boirsu',
  timeout: 300000
})

const loadCourses = async () => {
  const response = await api.get('/courses')
  courses.value = response.data.data || []
  if (courses.value.length && !courses.value.some((course) => course.slug === selectedCourse.value)) {
    selectedCourse.value = courses.value[0].slug
  }
}

const enrollStudent = async () => {
  const response = await api.post('/student', {
    name: studentName.value,
    phone: studentPhone.value,
    email: studentEmail.value,
    career_path: selectedCourse.value,
    experience_level: experienceLevel.value
  })
  const student = response.data.data
  studentId.value = student.student_id
  studentResult.value = JSON.stringify(student, null, 2)
}

const loadStudent = async () => {
  const response = await api.get(`/student/${studentId.value}`)
  workflowResult.value = JSON.stringify(response.data.data, null, 2)
}

const generateRoadmap = async () => {
  const response = await api.get(`/student/${studentId.value}/roadmap`)
  workflowResult.value = JSON.stringify(response.data.data, null, 2)
}

const submitQuiz = async () => {
  const response = await api.post(`/student/${studentId.value}/quiz`, {
    topic: 'Python Basics',
    score: 8,
    total_questions: 10
  })
  workflowResult.value = JSON.stringify(response.data.data, null, 2)
}

const submitAssignment = async () => {
  const response = await api.post(`/student/${studentId.value}/assignment`, {
    assignment_number: 1,
    submission_text: 'Completed the demo assignment from the browser UI.',
    score: 90
  })
  workflowResult.value = JSON.stringify(response.data.data, null, 2)
}

const markAttendance = async () => {
  const response = await api.post(`/student/${studentId.value}/attendance`, {
    class_number: 1,
    attended: true
  })
  workflowResult.value = JSON.stringify(response.data.data, null, 2)
}

const generateCertificate = async () => {
  const response = await api.get(`/student/${studentId.value}/certificate`)
  workflowResult.value = JSON.stringify(response.data.data, null, 2)
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.boirsu-page {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg, #0f172a, #1d4ed8);
  color: #f8fafc;
  font-family: Inter, Arial, sans-serif;
}
.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.8rem;
  opacity: 0.8;
}
.intro {
  max-width: 760px;
  line-height: 1.6;
  opacity: 0.9;
}
.grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}
.card {
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 16px;
  padding: 20px;
}
select, input, button {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.2);
  margin-bottom: 10px;
}
button {
  cursor: pointer;
  background: #f59e0b;
  color: #111827;
  font-weight: 600;
}
.primary {
  background: #22c55e;
}
.row, .actions {
  display: flex;
  gap: 10px;
}
.actions button {
  flex: 1;
}
pre {
  background: rgba(2,6,23,0.7);
  padding: 12px;
  border-radius: 10px;
  overflow: auto;
  white-space: pre-wrap;
}
.refresh-btn {
  max-width: 160px;
}
</style>
