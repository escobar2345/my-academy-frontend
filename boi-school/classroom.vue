<template>
  <div class="classroom-page">
    <Transition name="modal">
      <div v-if="paymentGate.open" class="payment-gate">
        <div class="payment-card">
          <p class="gate-kicker">Access required</p>
          <h2>Complete payment to unlock this classroom</h2>
          <p class="gate-copy">
            Your BOI RSU lessons and live course content are locked until
            payment is confirmed.
          </p>

          <div class="gate-summary">
            <span>Course</span>
            <strong>{{ paymentGate.course }}</strong>
          </div>
          <div class="gate-summary">
            <span>Fee</span>
            <strong>₦{{ formatMoney(paymentGate.amount) }}</strong>
          </div>

          <button
            class="pay-btn"
            :disabled="paymentGate.loading"
            @click="openPaystackCheckout"
          >
            {{
              paymentGate.loading ? "Opening Paystack..." : "Pay with Paystack"
            }}
          </button>

          <button class="secondary-btn" @click="closePaymentGate">
            Pay later
          </button>
        </div>
      </div>
    </Transition>

    <div class="topbar">
      <div>
        <p class="eyebrow">BOI Classroom</p>
        <h1>{{ course?.title || "Live AI Classroom" }}</h1>
      </div>
      <div
        class="status-pill"
        :class="{ online: backendOnline, offline: !backendOnline }"
      >
        {{ backendOnline ? "Backend online" : "Backend offline" }}
      </div>
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>

    <div class="layout">
      <aside class="sidebar">
        <div class="student-card">
          <div class="avatar">{{ studentInitials }}</div>
          <div>
            <strong>{{ student.name || "Guest Student" }}</strong>
            <p>{{ student.student_id || "No student id yet" }}</p>
          </div>
        </div>

        <div class="metrics">
          <div>
            <span>Overall grade</span>
            <strong>{{ student.overall_grade || "N/A" }}</strong>
          </div>
          <div>
            <span>Quiz avg</span>
            <strong>{{ student.avg_quiz_score || 0 }}%</strong>
          </div>
          <div>
            <span>Attendance</span>
            <strong>{{ student.attendance_rate || 0 }}%</strong>
          </div>
        </div>

        <div class="panel">
          <h3>Course library</h3>
          <select v-model="selectedCourseId" @change="loadSelectedCourse">
            <option value="" disabled>Select a course</option>
            <option v-for="item in courses" :key="item.id" :value="item.id">
              {{ item.title || item.topic || "Untitled course" }}
            </option>
          </select>
        </div>

        <div class="panel">
          <h3>Sections</h3>
          <ul v-if="course?.sections?.length" class="section-list">
            <li
              v-for="section in course.sections"
              :key="section.section_num"
              :class="{
                active: Number(section.section_num) === selectedSection,
              }"
              @click="selectSection(section.section_num)"
            >
              <span>Section {{ section.section_num }}</span>
              <strong>{{ section.title || "Lesson" }}</strong>
            </li>
          </ul>
          <p v-else class="empty">
            No sections yet. Generate a lesson from the dashboard or backend.
          </p>
        </div>
      </aside>

      <main class="content">
        <div v-if="loading" class="loading">Loading classroom content...</div>

        <div v-if="course && course.sections?.length" class="lesson-box">
          <div class="lesson-header">
            <div>
              <p class="eyebrow">Current lesson</p>
              <h2>{{ currentSection?.title || "Lesson content" }}</h2>
            </div>
            <button class="primary" @click="loadQuiz(false)">
              Refresh quiz
            </button>
          </div>

          <div class="section-content">
            <div v-if="currentSection?.content" class="content-block">
              <p v-for="(paragraph, idx) in readableContent" :key="idx">
                {{ paragraph }}
              </p>
            </div>
            <div v-else class="empty">
              This section has no lecture text yet. Generate or warm the course
              to populate it.
            </div>
          </div>

          <div class="lesson-video" aria-live="polite">
            <div class="lesson-video-head">
              <div>
                <p class="eyebrow">Recommended lesson video</p>
                <h3>{{ selectedVideo?.title || "Finding a matching YouTube lesson..." }}</h3>
              </div>
              <span v-if="selectedVideo" class="video-ready">Ready to watch</span>
            </div>
            <div v-if="selectedVideo" class="video-frame">
              <iframe
                :src="videoEmbedUrl(selectedVideo)"
                :title="selectedVideo.title || 'YouTube lesson'"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
                referrerpolicy="strict-origin-when-cross-origin"
              ></iframe>
            </div>
            <p v-else class="video-message">
              {{ videoError || "Apify is checking the actual YouTube lesson content. This may take up to two minutes." }}
            </p>
            <div v-if="lessonVideos.length > 1" class="video-choices">
              <button
                v-for="video in lessonVideos"
                :key="video.id"
                class="video-choice"
                :class="{ active: selectedVideo?.id === video.id }"
                @click="selectedVideo = video"
              >
                {{ video.title }}
              </button>
            </div>
          </div>
        </div>

        <div class="quiz-box" v-if="quiz">
          <div class="quiz-header">
            <div>
              <p class="eyebrow">Quiz</p>
              <h3>{{ quiz.title || "Knowledge check" }}</h3>
            </div>
            <button class="secondary" @click="loadQuiz(true)">New quiz</button>
          </div>

          <div
            v-for="(question, qIndex) in quiz.questions"
            :key="qIndex"
            class="question-card"
          >
            <p class="question-text">
              {{ qIndex + 1 }}. {{ question.question || question.q }}
            </p>
            <div class="answers">
              <button
                v-for="(option, oIndex) in question.options"
                :key="oIndex"
                class="answer-btn"
                :class="getAnswerClass(qIndex, oIndex)"
                @click="pickAnswer(qIndex, LETTERS[oIndex])"
              >
                <span class="letter">{{ LETTERS[oIndex] }}</span>
                <span>{{ optionText(option) }}</span>
              </button>
            </div>
          </div>

          <div class="quiz-actions">
            <button
              class="primary"
              :disabled="submitting"
              @click="submitCurrentQuiz"
            >
              {{ submitting ? "Submitting..." : "Submit quiz" }}
            </button>
          </div>
        </div>

        <div v-else-if="course && selectedCourseId" class="quiz-box neutral">
          <p>
            No quiz is ready yet for this section. The backend is still building
            it.
          </p>
        </div>

        <div v-if="quizResult" class="result-box">
          <h3>Results</h3>
          <div class="score-row">
            <span>Score</span>
            <strong>{{ quizResult.score }} / {{ quizResult.total }}</strong>
          </div>
          <div class="score-row">
            <span>Percentage</span>
            <strong>{{ quizResult.percentage }}%</strong>
          </div>
          <div class="score-row">
            <span>Overall grade</span>
            <strong>{{
              quizResult.student?.overall_grade ||
              student.overall_grade ||
              "N/A"
            }}</strong>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import * as api from "./aiClient.js";
import { getTopicVideos } from "./aiClient.js";

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

const paymentGate = ref({
  open: false,
  loading: false,
  amount: 200000,
  course: "BOI RSU classroom",
});

const backendOnline = ref(false);
const loading = ref(false);
const submitting = ref(false);
const error = ref("");
const courses = ref([]);
const course = ref(null);
const selectedCourseId = ref("");
const selectedSection = ref(1);
const quiz = ref(null);
const quizResult = ref(null);
const student = ref({
  name: "Guest Student",
  student_id: "",
  overall_grade: "N/A",
  avg_quiz_score: 0,
  attendance_rate: 0,
});
const studentId = ref("");
const lessonVideos = ref([]);
const selectedVideo = ref(null);
const videoError = ref("");

const currentSection = computed(() => {
  return (
    (course.value?.sections || []).find(
      (s) => Number(s.section_num) === Number(selectedSection.value),
    ) || null
  );
});

const readableContent = computed(() => {
  const text = currentSection.value?.content || "";
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
});

const studentInitials = computed(() => {
  const name = String(student.value.name || "Guest Student").trim();
  if (!name) return "GS";
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
});

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function closePaymentGate() {
  paymentGate.value.open = false;
  if (localStorage.getItem("boi_dashboard_paid") !== "true") {
    paymentGate.value.open = true;
  }
}

function ensurePaidAccess() {
  if (localStorage.getItem("boi_dashboard_paid") === "true") {
    paymentGate.value.open = false;
    return true;
  }

  paymentGate.value.open = true;
  return false;
}

function openPaystackCheckout() {
  if (!PAYSTACK_PUBLIC_KEY) {
    error.value = 'Paystack public key is not configured. Add VITE_PAYSTACK_PUBLIC_KEY to the frontend environment.';
    return;
  }
  if (!window.PaystackPop) {
    error.value = "Paystack is not configured in this environment.";
    return;
  }

  paymentGate.value.loading = true;
  error.value = "";

  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: localStorage.getItem("boi_student_email") || "student@boirsu.com",
    amount: Math.round(Number(paymentGate.value.amount || 200000) * 100),
    currency: "NGN",
    ref: "BOIRSU-CLASSROOM-" + Date.now(),
    callback: async (response) => {
      // Server is the truth: verify the reference with the SECRET key and
      // extend the monthly access window — the dashboard/roadmap lock reads
      // exactly that. Local flags alone must never unlock paid content.
      error.value = "";
      const verified = await api.verifyPaystackPayment({
        studentId: localStorage.getItem("boi_student_id") || "",
        reference: response.reference || "",
        months: 1,
        kind: "monthly-fees",
      });
      paymentGate.value.loading = false;
      if (verified && verified.verified) {
        paymentGate.value.open = false;
        localStorage.setItem("boi_dashboard_paid", "true");
        localStorage.setItem("boi_paystack_ref", response.reference || "");
        window.location.reload();
      } else {
        error.value = (verified && verified.error)
          ? ("Verification failed: " + verified.error)
          : ("Could not verify this payment. Save ref " + (response.reference || "") + " and contact support.");
      }
    },
    onClose: () => {
      paymentGate.value.loading = false;
      error.value = "Checkout was closed before payment was completed.";
    },
  });

  handler.openIframe();
}

function optionText(option) {
  return String(option || "")
    .replace(/^\s*[A-Fa-f]\s*[).:-]\s*/, "")
    .trim();
}

function videoEmbedUrl(video) {
  const source = video?.embed_url || video?.watch_url || video?.url || "";
  const match = source.match(/(?:v=|\/)([A-Za-z0-9_-]{11})(?:[?&]|$)/);
  return match
    ? `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&controls=1`
    : "";
}

async function loadLessonVideos() {
  const topic = course.value?.topic || course.value?.title || "BOI RSU lesson";
  const section = currentSection.value?.title || "";
  videoError.value = "";
  const videos = await getTopicVideos(`${topic} ${section}`.trim(), "beginner", 3);
  lessonVideos.value = Array.isArray(videos) ? videos : [];
  selectedVideo.value = lessonVideos.value[0] || null;
  if (!selectedVideo.value) {
    videoError.value = "No matching YouTube lesson was returned. Check APIFY_TOKEN and the backend logs.";
  }
}

function getAnswerClass(qIndex, oIndex) {
  const selected = quizResult.value?.results?.find((r) => r.index === qIndex);
  if (selected) {
    if (LETTERS[oIndex] === selected.answer) return "correct";
    if (
      LETTERS[oIndex] === selected.picked &&
      selected.answer !== selected.picked
    )
      return "wrong";
    return "muted";
  }

  const picked =
    quiz.value && quiz.value.questions?.[qIndex]
      ? (window.__picked || {})[qIndex]
      : null;
  return picked === LETTERS[oIndex] ? "selected" : "plain";
}

function pickAnswer(qIndex, letter) {
  if (!quiz.value) return;
  const q = quiz.value.questions?.[qIndex];
  if (!q) return;
  const map = window.__picked || {};
  map[qIndex] = letter;
  window.__picked = map;
  quizResult.value = null;
}

async function loadStudent() {
  const storedId = localStorage.getItem("boi_student_id");
  if (storedId) {
    const found = await api.getStudent(storedId);
    if (found) {
      student.value = found;
      studentId.value = found.student_id;
      return;
    }
    localStorage.removeItem("boi_student_id");
  }

  const roster = await api.listStudents();
  if (!roster || !roster.length) return;
  const first = await api.getStudent(roster[0].student_id);
  if (first) {
    student.value = first;
    studentId.value = first.student_id;
    localStorage.setItem("boi_student_id", first.student_id);
  }
}

async function loadCourses() {
  const rows = await api.listCourses();
  if (!rows || !rows.length) return;
  courses.value = rows.slice().reverse();
  if (!selectedCourseId.value && courses.value.length) {
    selectedCourseId.value = courses.value[0].id;
    await loadSelectedCourse();
  }
}

async function loadSelectedCourse() {
  if (!selectedCourseId.value) return;
  loading.value = true;
  const result = await api.getCourse(selectedCourseId.value);
  loading.value = false;

  if (!result) {
    error.value = "Unable to load the selected course from the backend.";
    return;
  }

  course.value = result;
  if (course.value.sections?.length) {
    selectedSection.value = Number(course.value.sections[0].section_num);
    await loadQuiz(false);
    await loadLessonVideos();
  }
}

async function selectSection(sectionNum) {
  selectedSection.value = Number(sectionNum);
  await loadQuiz(false);
  await loadLessonVideos();
}

async function loadQuiz(fresh = false) {
  if (!course.value || !selectedCourseId.value) return;
  loading.value = true;
  const q = await api.getQuiz(course.value.id, selectedSection.value, fresh);
  loading.value = false;

  if (!q || q.error) {
    quiz.value = null;
    error.value =
      q && q.error
        ? q.error
        : "This quiz is not ready yet. Try again in a moment.";
    return;
  }

  quiz.value = q;
  error.value = "";
  quizResult.value = null;
  window.__picked = {};
}

async function submitCurrentQuiz() {
  if (!quiz.value) return;

  const answers = quiz.value.questions.map(
    (_, idx) => window.__picked?.[idx] || null,
  );
  if (answers.some((value) => !value)) {
    error.value = "Please answer every question before submitting.";
    return;
  }

  submitting.value = true;
  const result = await api.submitQuiz(
    quiz.value.quizId,
    answers,
    studentId.value,
  );
  submitting.value = false;

  if (!result) {
    error.value = "The backend could not grade your quiz.";
    return;
  }

  quizResult.value = result;
  error.value = "";

  if (result.student) {
    student.value = result.student;
    localStorage.setItem("boi_student_id", result.student.student_id);
  }
}

async function init() {
  loading.value = true;
  const status = await api.status();
  backendOnline.value = !!status && !status.error;

  if (!status || status.error) {
    error.value =
      "Backend is offline. Start python api_server.py on port 5055 to enable live quiz loading.";
    loading.value = false;
    return;
  }

  await loadStudent();
  await loadCourses();
  loading.value = false;
}

onMounted(() => {
  if (!ensurePaidAccess()) return;
  init();
});
</script>

<style scoped>
.classroom-page {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(180deg, #07131d 0%, #0b1320 100%);
  color: #e5edf8;
  font-family: Inter, Arial, sans-serif;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
  color: #7cc7ff;
  margin: 0 0 8px;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  font-size: clamp(28px, 3vw, 42px);
  font-weight: 800;
}

.status-pill {
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
}

.status-pill.online {
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.35);
  color: #86efac;
}

.status-pill.offline {
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.38);
  color: #fca5a5;
}

.layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
}

.sidebar,
.lesson-box,
.quiz-box,
.result-box,
.student-card,
.panel,
.metrics,
.content-block {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 20px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px;
}

.student-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #3b82f6, #34d399);
  color: white;
  font-weight: 800;
}

.student-card p {
  color: #9ca9bb;
  font-size: 12px;
  margin-top: 4px;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 12px;
}

.metrics div {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: rgba(15, 118, 110, 0.08);
  border-radius: 14px;
}

.metrics span {
  color: #9ca9bb;
  font-size: 11px;
}

.metrics strong {
  font-size: 16px;
}

.panel {
  padding: 14px;
}

.panel h3 {
  margin-bottom: 10px;
  font-size: 15px;
}

select {
  width: 100%;
  background: #0b1220;
  color: white;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  padding: 10px 12px;
}

.section-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.section-list li {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.45);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-list li.active {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(96, 165, 250, 0.35);
}

.section-list span {
  color: #9ca9bb;
  font-size: 11px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.lesson-video {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
}

.lesson-video-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 12px;
}

.lesson-video h3 {
  font-size: 18px;
  line-height: 1.3;
}

.video-ready {
  flex: none;
  color: #86efac;
  font-size: 11px;
  font-weight: 700;
}

.video-frame {
  overflow: hidden;
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  background: #020617;
}

.video-frame iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.video-message {
  color: #9ca9bb;
  font-size: 13px;
}

.video-choices {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin-top: 12px;
}

.video-choice {
  max-width: 260px;
  padding: 8px 10px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #cbd5e1;
  font-size: 12px;
  text-align: left;
}

.video-choice.active {
  border-color: #7cc7ff;
  color: #e5edf8;
}

.lesson-box,
.quiz-box,
.result-box {
  padding: 20px;
}

.lesson-header,
.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.section-content {
  line-height: 1.8;
}

.content-block {
  padding: 18px;
}

.content-block p {
  margin-bottom: 12px;
  color: #dfeaf8;
}

button {
  border: none;
  font: inherit;
  cursor: pointer;
}

.primary,
.secondary {
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 700;
}

.primary {
  background: linear-gradient(135deg, #34d399 0%, #60a5fa 100%);
  color: #07131d;
}

.secondary {
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #edf6ff;
}

.quiz-box {
  display: grid;
  gap: 16px;
}

.question-card {
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 16px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.5);
}

.question-text {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 14px;
}

.answers {
  display: grid;
  gap: 12px;
}

.answer-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.18);
  color: #edf6ff;
}

.answer-btn.selected,
.answer-btn.correct,
.answer-btn.wrong,
.answer-btn.muted,
.answer-btn.plain {
  border-width: 1px;
}

.answer-btn.selected {
  border-color: #60a5fa;
  background: rgba(96, 165, 250, 0.12);
}

.answer-btn.correct {
  border-color: rgba(34, 197, 94, 0.7);
  background: rgba(34, 197, 94, 0.12);
  color: #d1fae5;
}

.answer-btn.wrong {
  border-color: rgba(248, 113, 113, 0.7);
  background: rgba(248, 113, 113, 0.12);
  color: #fee2e2;
}

.answer-btn.muted {
  opacity: 0.7;
}

.letter {
  width: 28px;
  height: 28px;
  border-radius: 9px;
  display: inline-grid;
  place-items: center;
  background: rgba(96, 165, 250, 0.12);
  color: #93c5fd;
  font-weight: 800;
}

.quiz-actions {
  display: flex;
  justify-content: flex-end;
}

.result-box {
  display: grid;
  gap: 8px;
}

.score-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.alert {
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 14px;
}

.alert.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fecaca;
}

.empty {
  color: #9ca9bb;
  line-height: 1.6;
}

.loading {
  color: #cfe8ff;
  padding: 16px 0;
}

.neutral {
  border-style: dashed;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .topbar,
  .lesson-header,
  .quiz-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
