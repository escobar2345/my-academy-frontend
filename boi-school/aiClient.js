/**
 * boi-school AI client
 * ====================
 * Thin fetch wrapper around api_server.py (port 5055) — the AI learning
 * bridge and the boirsu student records.
 *
 * Two rules make the dashboard safe to wire up:
 *   1. Every call resolves to `null` on any failure (offline, 404, 503,
 *      timeout, bad JSON) instead of throwing. Call sites fall back to their
 *      demo data with a single `if (!data) return`, so a dead backend can
 *      never blank the page.
 *   2. Nothing here throws, so no unhandled rejections reach the console.
 *
 * Deliberately not using frontend/src/api/ — that axios layer belongs to a
 * different app (ontology/simulation) with a 300s timeout.
 */

// Same-origin by default so Vite's proxy handles it in dev. Override with
// VITE_BOI_API when the built app is served from somewhere else.
const BASE = (import.meta.env?.VITE_BOI_API || '').replace(/\/$/, '');

const DEFAULT_TIMEOUT = 15000;

function url(path) {
  return BASE + path;
}

async function call(path, { method = 'GET', body, timeout = DEFAULT_TIMEOUT, returnError = false } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url(path), {
      method,
      signal: ctrl.signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => null);
    // A 503 from the bridge carries a readable reason (missing API key, etc.).
    // Surface it rather than discarding it — some call sites show it.
    if (!res.ok) return data && data.error ? { error: data.error, status: res.status } : null;
    return data;
  } catch (err) {
    // Default contract stays "null on any failure" (see the header comment).
    // Call sites that must show the user WHY it failed opt in returnError and
    // get a human-readable reason instead of a silent null.
    if (returnError) {
      const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
      const reason = offline
        ? 'you appear to be offline'
        : (err && err.name === 'AbortError')
          ? 'the request timed out after ' + Math.round(timeout / 1000) + 's'
          : 'the backend could not be reached';
      return { error: reason, status: 0 };
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const failed = (r) => !r || r.error;

/* ---------------- diagnostics ---------------- */

export async function status() {
  return call('/api/ai/status', { timeout: 6000 });
}

/* ---------------- courses ---------------- */

export async function listCourses() {
  const r = await call('/api/ai/courses');
  return failed(r) ? null : (r.courses || []);
}

export async function getCourse(id) {
  const r = await call(`/api/ai/course/${encodeURIComponent(id)}`);
  return failed(r) ? null : r.course;
}

/** Generation takes minutes — returns a job id to follow, not a course. */
export async function startCourse(topic, level = 'beginner') {
  const r = await call('/api/ai/course', { method: 'POST', body: { topic, level } });
  if (!r) return null;
  if (r.error) return { error: r.error };
  return { jobId: r.job_id, topic: r.topic };
}

export async function getJob(jobId) {
  const r = await call(`/api/ai/job/${encodeURIComponent(jobId)}`, { timeout: 8000 });
  return failed(r) ? null : r;
}

/* ---------------- per-section extras ---------------- */

const section = (id, n, leaf) =>
  `/api/ai/course/${encodeURIComponent(id)}/section/${Number(n)}/${leaf}`;

export async function getSummary(id, n) {
  // The model writes this on first request, so allow longer than the default.
  const r = await call(section(id, n, 'summary'), { timeout: 60000 });
  return failed(r) ? null : r.summary;
}

export async function getResources(id, n) {
  const r = await call(section(id, n, 'resources'), { timeout: 60000 });
  if (failed(r)) return null;
  return { resources: r.resources || [], explanation: r.explanation || '', reason: r.reason || '' };
}

export async function getVideos(id, n) {
  const r = await call(section(id, n, 'videos'));
  if (failed(r)) return null;
  return { videos: r.videos || [], reason: r.reason || '' };
}

export async function getTopicVideos(topic, level = 'beginner', limit = 3) {
  const q = `?topic=${encodeURIComponent(topic)}&level=${encodeURIComponent(level)}&limit=${limit}`;
  const r = await call('/api/videos' + q, { timeout: 120000 });
  return failed(r) ? null : (r.videos || []);
}

/* ---------------- AI daily lesson plan (detailed timetable & roadmap) ----------------
 * Day-by-day lessons for one course month: exact topic per class day, what gets
 * taught, the hands-on deliverable and the YouTube search for the lesson video.
 * `source` is "ai" when MiroFish AI wrote it, "standard" for the roadmap split.
 *
 * `time`         — legacy single daily hour (every day at that time).
 * `dailyTimes`   — per-day dict, e.g. {"Monday":"18:00","Tuesday":"14:00",
 *                   "Wednesday":"","Thursday":"20:00",...}. Days blank/"none"
 *                   have no class. The timetable, roadmap and AI plan all schedule
 *                   themselves around exactly the days and hours the student chose.
 *   When `dailyTimes` is given it takes precedence and `time` is only used as a
 *   fallback for days the student did not specify. */

export async function getDailyPlan(careerPath, month = null, track = '', time = '', dailyTimes = null, studentId = '') {
  const q = new URLSearchParams();
  if (month != null) q.set('month', String(month));
  if (track) q.set('track', track);
  if (time) q.set('time', time);
  if (dailyTimes && typeof dailyTimes === 'object') {
    try { q.set('daily_times', JSON.stringify(dailyTimes)); } catch { /* leave it out */ }
  }
  // Lets the server fall back to the student's SAVED registration grid when
  // the caller could not send `dailyTimes` yet (first paint before hydration).
  if (studentId) q.set('student_id', String(studentId));
  const qs = q.toString() ? `?${q.toString()}` : '';
  const r = await call(`/api/ai/daily-plan/${encodeURIComponent(careerPath)}${qs}`, { timeout: 15000 });
  return failed(r) ? null : r;
}

export async function generateDailyPlan(careerPath, { month, track, course, time, dailyTimes } = {}) {
  const r = await call(`/api/ai/daily-plan/${encodeURIComponent(careerPath)}/generate`, {
    method: 'POST',
    timeout: 20000,
    body: { month: month ?? null, track: track || '', course: course || '', time: time || '', daily_times: dailyTimes || undefined },
    returnError: true,
  });
  return r || { success: false, error: 'Could not reach the server.' };
}

export async function getDailyPlanJob(jobId) {
  const r = await call(`/api/ai/daily-plan/job/${encodeURIComponent(jobId)}`, { timeout: 10000 });
  return failed(r) ? null : r;
}

/* ---------------- live classroom tutor ---------------- */

/**
 * Ask the NVIDIA-Build tutor about the YouTube lesson playing in the
 * classroom and/or the student's shared screen. `image` is a raw base64
 * JPEG frame of the shared screen; `history` is recent
 * [{role:'user'|'assistant', content}] turns. The first question on a video
 * warms its transcript server-side, hence the long timeout. Resolves null
 * on any failure so call sites can keep their demo answers alive.
 */
export async function askClassroomTutor({ question, lesson, history, image } = {}) {
  const r = await call('/api/ai/classroom/ask', {
    method: 'POST',
    timeout: 120000,
    body: {
      question,
      lesson: lesson || undefined,
      history: Array.isArray(history) ? history.slice(-8) : undefined,
      image: image || undefined
    }
  });
  return failed(r) ? null : { answer: r.answer || '' };
}

/**
 * End-of-video assessment: ask the tutor to build a multiple-choice quiz
 * strictly from the YouTube lesson that just finished (the server grounds it
 * in the video transcript and allows a larger token budget than chat).
 * Resolves null on any failure so the caller can use its offline fallback
 * set — same rule as everywhere else in this file.
 */
export async function generateLessonQuiz({ lesson, topic, count = 12 } = {}) {
  const r = await call('/api/ai/classroom/quiz', {
    method: 'POST',
    timeout: 180000,
    body: { lesson: lesson || undefined, topic: topic || undefined, count }
  });
  if (failed(r)) return null;
  return { questions: Array.isArray(r.questions) ? r.questions : [] };
}

/* ---------------- post-class W3Schools textbooks ---------------- */

/**
 * Library rows for the class-textbook shelf of the student dashboard.
 * Rows are shaped exactly like `docs` entries ({id,title,tag,pages,...}).
 * Pass studentId to get a per-student `purchased` flag on priced rows (the
 * server also hides the raw buyer list — the dashboard never sees other
 * students' ids).
 */
export async function listTextbooks(studentId = '') {
  const qs = studentId ? '?student_id=' + encodeURIComponent(studentId) : '';
  const r = await call('/api/textbooks' + qs, { timeout: 10000 });
  if (failed(r)) return null;
  // Teacher PDF uploads carry their serve URL so the shelf's Read button opens
  // the real document (?inline=1) and the download/reader flows can honour the
  // admin/partner read-only lock the server enforces on the same URL.
  return (r.textbooks || []).map((b) => (b && b.kind === 'pdf-textbook' && b.pdf_id && !b.download)
    ? { ...b, download: '/api/textbooks/pdf/' + b.pdf_id } : b);
}

/** Full textbook body (chapters -> lessons) for the reader modal. */
export async function getTextbook(id) {
  const r = await call(`/api/textbooks/${encodeURIComponent(id)}`, { timeout: 15000 });
  return failed(r) ? null : r.textbook;
}

/**
 * The student's OWN course reading material: one PDF textbook per month,
 * generated from their career roadmap and cached on the server. Rows carry
 * `download` URLs for the real PDF — never another cohort's random topics.
 */
export async function listRoadmapLibrary(careerPath) {
  if (!careerPath) return null;
  const r = await call(`/api/library/${encodeURIComponent(careerPath)}`, { timeout: 30000 });
  return failed(r) ? null : (r.library || []);
}

/**
 * Fire the post-class pipeline: video transcript -> W3Schools-format
 * chapters/lessons -> boirsu store -> dashboard library. Resolves
 * { jobId } immediately; generation runs server-side in the background.
 */
export async function generateClassTextbook({ course, topic, video, classNumber } = {}) {
  const r = await call('/api/textbooks/generate', {
    method: 'POST',
    timeout: 15000,
    body: {
      course,
      topic,
      video,
      class_number: classNumber
    }
  });
  if (failed(r)) return null;
  return { jobId: r.job_id };
}

/** Poll a post-class textbook generation job (status: queued|running|done|error).
 *  Returns the job ({status, row, error}) or null when unknown/failed. */
export async function getTextbookJob(jobId) {
  const r = await call(`/api/textbooks/job/${encodeURIComponent(jobId)}`, { timeout: 8000 });
  return failed(r) ? null : r;
}

/* ---------------- student accounts (email + password) ---------------- */

/** Email+password sign-in. Returns {student:{student_id,name,...}} or null. */
export async function loginStudent({ email, password } = {}) {
  // Real HTTP responses carry a readable reason — 401 wrong email/password,
  // 401 account that has no password set yet, 500 backend error. Pass those
  // through so Login.vue / the registration gate can show them (both already
  // read res.error). Only pure network failures (status 0) collapse to null,
  // so the pages keep their "start api_server.py" fallback for a dead backend.
  // 30s: the database-backed lookup normally takes ~1s but can spike.
  const r = await call('/api/student/login', {
    method: 'POST',
    timeout: 30000,
    returnError: true,
    body: { email, password }
  });
  if (!r) return null;
  if (r.error) return r.status ? r : null;
  return r;
}

/** Attach a login password to an enrolled student during registration. */
export async function setStudentPassword({ studentId, password } = {}) {
  const r = await call('/api/student/set-password', {
    method: 'POST',
    timeout: 30000,
    body: { student_id: studentId, password }
  });
  return failed(r) ? null : r;
}

/**
 * Ask the backend to verify a Paystack reference with the SECRET key and
 * permanently mark the student's record paid. This is what makes the
 * dashboard stop asking for payment on every visit.
 * Returns the server verdict — including its `error` reason on failure —
 * or null only when the backend is unreachable.
 */
export async function verifyPaystackPayment({ studentId, reference, months = 0, kind = '' } = {}) {
  const r = await call('/api/paystack/verify', {
    method: 'POST',
    timeout: 25000,
    body: { student_id: studentId || undefined, reference, months, kind }
  });
  return r || null;
}

/** Verify a Paystack reference as a PRICED textbook purchase (secret key on
 *  the server; writes the buyer onto the book row so the PDF unlocks only
 *  for this student). Returns the server verdict — including its `error`
 *  reason on failure — or null when the backend is unreachable. */
export async function verifyPaystackBookPayment({ studentId, reference, textbookId } = {}) {
  const r = await call('/api/paystack/verify-textbook', {
    method: 'POST',
    timeout: 25000,
    body: { student_id: studentId || undefined, reference, textbook_id: textbookId || undefined }
  });
  return r || null;
}

/**
 * After a Google account is verified on the registration gate: does this
 * email already belong to a registered student? Returns
 * {registered:false} or {registered:true, student:{...}, has_password}.
 */
export async function checkGoogleEmail(email) {
  const r = await call('/api/student/google-check', {
    method: 'POST',
    timeout: 12000,
    body: { email }
  });
  return failed(r) ? null : r;
}

/* ---------------- live classroom (cohort presence + chat) ---------------- */

/** Full room snapshot: roster, recent messages, synced lesson. */
export async function fetchClassroomState(course) {
  const r = await call(`/api/classroom/state?course=${encodeURIComponent(course || '')}`, { timeout: 10000 });
  return failed(r) ? null : r;
}

/** Join the room for this course. Server resolves name/course from boirsu
 *  records when studentId is known. Returns {you, participants, messages,
 *  lesson} or null. */
export async function joinClassroom({ course, name, studentId, hue, role } = {}) {
  const r = await call('/api/classroom/join', {
    method: 'POST',
    timeout: 10000,
    body: { course, name: name || undefined, student_id: studentId || undefined, hue, role }
  });
  return failed(r) ? null : r;
}

export async function setClassroomChatPermission(course, pid, open) {
  const r = await call('/api/classroom/chat-permission', {
    method: 'POST', timeout: 8000, body: { course, pid, open: !!open }
  });
  return failed(r) ? null : r;
}

export async function requestClassroomVoice(course, pid, requested = true) {
  const r = await call('/api/classroom/voice-request', {
    method: 'POST', timeout: 8000, body: { course, pid, requested }
  });
  return failed(r) ? null : r;
}

export async function setClassroomVoicePermission(course, teacherPid, studentPid, approved) {
  const r = await call('/api/classroom/voice-permission', {
    method: 'POST', timeout: 8000,
    body: { course, teacher_pid: teacherPid, student_pid: studentPid, approved }
  });
  return failed(r) ? null : r;
}

/** Heartbeat every ~15s; also carries raised-hand / sharing / cam / mic flags. */
export async function pingClassroom(course, pid, flags = {}) {
  const r = await call('/api/classroom/ping', {
    method: 'POST',
    timeout: 8000,
    body: {
      course, pid,
      raised: !!flags.raised, sharing: !!flags.sharing,
      cam: !!flags.cam, mic: !!flags.mic
    }
  });
  return failed(r) ? null : r;
}

/** One cohort chat message; fan-out happens over SSE. */
export async function sayToClassroom(course, pid, text) {
  const r = await call('/api/classroom/say', {
    method: 'POST',
    timeout: 8000,
    body: { course, pid, text }
  });
  return failed(r) ? null : r;
}

export async function leaveClassroom(course, pid) {
  const r = await call('/api/classroom/leave', {
    method: 'POST',
    timeout: 8000,
    body: { course, pid }
  });
  return failed(r) ? null : r;
}

/** Relay WebRTC offer, answer, or ICE candidate through the classroom SSE hub. */
export async function signalClassroom({ course, sender, target, kind, payload } = {}) {
  const r = await call('/api/classroom/signal', {
    method: 'POST', timeout: 8000,
    body: { course, sender, target, kind, payload }
  });
  return failed(r) ? null : r;
}

/** Publish the lesson video the whole cohort should watch. */
export async function publishClassroomLesson(course, pid, video) {
  const r = await call('/api/classroom/lesson', {
    method: 'POST',
    timeout: 8000,
    body: { course, pid, video }
  });
  return failed(r) ? null : r;
}

/**
 * Teacher Go-Live switch. `active: true` tells every student in the cohort to
 * switch to the live teacher-video stage; `false` drops them back to the
 * lesson view. State is also kept on the room, so late joiners land on it too.
 */
export async function publishClassroomLive(course, pid, active = true) {
  const r = await call('/api/classroom/live', {
    method: 'POST',
    timeout: 8000,
    body: { course, pid, active: !!active }
  });
  return failed(r) ? null : r;
}

/* ---------------- quizzes -> grades ---------------- */

/**
 * Questions arrive without answers; grading happens server-side.
 *
 * The server pre-builds and caches quizzes, so the normal path is a fast cache
 * hit. A miss means a live model call, which measured ~4 minutes — hence the
 * long timeout. Pass fresh=true to deliberately re-roll a new one.
 */
export async function getQuiz(id, n, fresh = false) {
  const path = section(id, n, 'quiz') + (fresh ? '?fresh=1' : '');
  const r = await call(path, { timeout: fresh ? 300000 : 45000 });
  if (!r) return null;
  if (r.error) return { error: r.error };
  return { quizId: r.quiz_id, title: r.title, source: r.source, questions: r.questions || [] };
}

export async function submitQuiz(quizId, answers, studentId) {
  const r = await call(`/api/ai/quiz/${encodeURIComponent(quizId)}/submit`, {
    method: 'POST',
    body: { answers, student_id: studentId || undefined },
    timeout: 20000
  });
  return failed(r) ? null : r;
}

/* ---------------- tutor ---------------- */

export async function ask(question, courseId = null, sectionNum = null) {
  const r = await call('/api/ai/ask', {
    method: 'POST',
    body: { question, course_id: courseId || undefined, section: sectionNum || undefined },
    timeout: 60000
  });
  if (failed(r)) return null;
  return r.answer;
}

/* ---------------- audio mode ---------------- */

/** URL for an <audio> element. 503 + JSON when DEEPGRAM_API_KEY is missing. */
export function speakUrl(courseId, sectionNum) {
  return url(`/api/ai/speak?course=${encodeURIComponent(courseId)}&section=${Number(sectionNum)}`);
}

/** Probe before showing the play button, so a keyless server degrades cleanly. */
export async function audioAvailable() {
  const s = await status();
  if (!s || s.error) return { ok: false, reason: 'backend unreachable' };
  if (!s.keys?.deepgram) return { ok: false, reason: 'DEEPGRAM_API_KEY not set' };
  return { ok: true, reason: '' };
}

/* ---------------- students, attendance, assignments ---------------- */

export async function listStudents() {
  const r = await call('/api/students');
  return failed(r) ? null : (r.students || []);
}

export async function getStudent(id) {
  const r = await call(`/api/student/${encodeURIComponent(id)}`);
  return failed(r) ? null : r.student;
}

export async function getCareers() {
  const r = await call('/api/careers');
  return failed(r) ? null : (r.careers || []);
}

export async function getRoadmap(careerPath) {
  const r = await call(`/api/roadmap/${encodeURIComponent(careerPath)}`);
  return failed(r) ? null : (r.topics || []);
}

export async function getProgress(careerPath) {
  const r = await call(`/api/progress/${encodeURIComponent(careerPath)}`);
  return failed(r) ? null : (r.progress || {});
}

export async function saveProgress(careerPath, topicIndex, taskIndex, done) {
  const r = await call(`/api/progress/${encodeURIComponent(careerPath)}`, {
    method: 'POST',
    body: { topicIndex, taskIndex, done }
  });
  return failed(r) ? null : (r.progress || {});
}

/** Weekly class schedule derived from boirsu's monthly plan.

 * `time`         — legacy single daily hour (every day at that time).
 * `dailyTimes`   — per-day dict, e.g. {"Monday":"18:00","Tuesday":"14:00",
 *                   "Wednesday":"","Thursday":"20:00",...}. Days blank/"none"
 *                   have no class. When given, takes precedence over `time`. */
export async function getTimetable(careerPath, month = null, track = '', time = '', dailyTimes = null, studentId = '') {
  const q = new URLSearchParams();
  if (month != null) q.set('month', String(month));
  if (track) q.set('track', track);
  if (time) q.set('time', time);
  if (dailyTimes && typeof dailyTimes === 'object') {
    try { q.set('daily_times', JSON.stringify(dailyTimes)); } catch { /* leave it out */ }
  }
  // Lets the server fall back to the student's SAVED registration grid when
  // the caller could not send `dailyTimes` yet (first paint before hydration).
  if (studentId) q.set('student_id', String(studentId));
  const qs = q.toString() ? `?${q.toString()}` : '';
  const r = await call(`/api/timetable/${encodeURIComponent(careerPath)}${qs}`);
  return failed(r) ? null : r;
}

export async function startAiClass(topic, careerPath = '', month = null) {
  const r = await call('/api/start-ai-class', {
    method: 'POST',
    body: { topic, career_path: careerPath || undefined, month: month ?? undefined }
  });
  if (!r) return null;
  if (r.error) return { error: r.error };
  return { success: true, status: r.status };
}

export async function enrollStudent(payload) {
  // Enrollment writes through to PostgreSQL (full roster load + insert), so it
  // is the slowest call in this file; 45s keeps a slow-but-alive backend from
  // being mistaken for "api_server.py not running". On any failure it returns
  // { error, status } so the registration UI can show the real reason.
  // `payload` may carry `preferred_daily_times` (the new per-day grid shape) so
  // the enrolled student's timetable, roadmap and AI plan follow their chosen days.
  const r = await call('/api/student/enroll', { method: 'POST', body: payload, timeout: 45000, returnError: true });
  if (r && r.error) return r;
  return (r && r.student) || null;
}

export async function markAttendance(studentId, classNumber) {
  const r = await call('/api/attendance', {
    method: 'POST',
    body: { student_id: studentId, class_number: classNumber }
  });
  return failed(r) ? null : r;
}

export async function submitAssignment(studentId, assignmentNumber, submission) {
  const r = await call('/api/assignment', {
    method: 'POST',
    body: { student_id: studentId, assignment_number: assignmentNumber, submission }
  });
  return failed(r) ? null : r.student;
}

/* ---------------- teacher classroom tools (textbooks + assignments) ---------------- */

/** Teacher uploads a PDF textbook for the class (base64 body). Returns the
 *  library row so it can appear immediately. */
export async function publishClassroomTextbook({ course, pid, title, fileName, fileSize, fileData }) {
  const r = await call('/api/classroom/textbook', {
    method: 'POST', timeout: 30000,
    body: { course, pid, title, file_name: fileName, file_size: fileSize, file_data: fileData }
  });
  return failed(r) ? null : r;
}

/** Fetch a teacher-uploaded PDF as a Blob. Pass studentId so PRICED books
 *  (admin/partner commerce) authorize the buyer; free/read-only books ignore
 *  it. Returns null when the server refuses (402 = buy first) or is offline. */
export async function downloadTextbookPdf(pdfId, studentId = '') {
  try {
    const qs = studentId ? '?student_id=' + encodeURIComponent(studentId) : '';
    const res = await fetch(url('/api/textbooks/pdf/' + encodeURIComponent(pdfId) + qs));
    if (!res.ok) return null;
    return await res.blob();
  } catch { return null; }
}

/** Teacher gives an assignment to the class (broadcast on SSE). */
export async function giveClassroomAssignment({ course, pid, title, instructions, due }) {
  const r = await call('/api/classroom/assignment', {
    method: 'POST', timeout: 12000,
    body: { course, pid, title, instructions, due }
  });
  return failed(r) ? null : r;
}

/** Assignments given so far for a course — students load these on startup. */
export async function listClassroomAssignments(course) {
  const r = await call('/api/classroom/assignments?course=' + encodeURIComponent(course || ''), { timeout: 10000 });
  return failed(r) ? null : (r.assignments || []);
}

/** Teacher launches the quiz they set (their own questions, or a MiroFish AI
 *  draft they reviewed). The full question set is broadcast on the
 *  classroom_quiz SSE event so every student opens the same quiz at once. */
export async function publishClassroomQuiz({ course, pid, title, questions }) {
  const r = await call('/api/classroom/quiz', {
    method: 'POST', timeout: 15000,
    body: { course, pid, title, questions }
  });
  return failed(r) ? null : r;
}

/** Teacher tool: MiroFish AI drafts an assignment (title + instructions)
 *  from a topic. The teacher edits the draft before sending it. */
export async function generateAssignmentDraft({ topic } = {}) {
  const r = await call('/api/ai/classroom/assignment', {
    method: 'POST', timeout: 120000,
    body: { topic }
  });
  if (failed(r)) return null;
  return { title: r.title || '', instructions: r.instructions || '' };
}

/** Teacher tool: MiroFish AI drafts a weekly class timetable with the same
 *  engine that builds student schedules (ai_learning_system_v4). The teacher
 *  reviews the {day,time,subject} rows, then publishes. */
export async function generateTimetableDraft({ course, track, durationMonths, classMinutes, startDate } = {}) {
  const r = await call('/api/ai/classroom/timetable', {
    method: 'POST', timeout: 60000,
    body: {
      course,
      track: track || undefined,
      duration_months: durationMonths || undefined,
      class_minutes: classMinutes || undefined,
      start_date: startDate || undefined
    }
  });
  if (failed(r)) return null;
  return { title: r.title || 'Weekly class schedule', sessions: Array.isArray(r.sessions) ? r.sessions : [] };
}

/** Teacher publishes the weekly class timetable — persisted via boirsu and
 *  broadcast on classroom_timetable so every student dashboard picks it up. */
export async function publishClassroomTimetable({ course, pid, title, sessions }) {
  const r = await call('/api/classroom/timetable', {
    method: 'POST', timeout: 15000,
    body: { course, pid, title, sessions }
  });
  return failed(r) ? null : r;
}

/** The teacher's published weekly timetable for a course, if any. */
export async function listClassroomTimetable(course) {
  const r = await call('/api/classroom/timetable?course=' + encodeURIComponent(course || ''), { timeout: 10000 });
  return failed(r) ? null : (r.timetable || null);
}

/* ---------------- live updates ---------------- */

/**
 * Subscribe to the server's SSE hub. Returns a stop() function.
 * Reconnects with backoff; never throws. onEvent(name, data).
 */
export function subscribe(onEvent) {
  let es = null;
  let stopped = false;
  let delay = 2000;

  const open = () => {
    if (stopped) return;
    try {
      es = new EventSource(url('/api/stream'));
    } catch {
      return; // no EventSource support — callers poll instead
    }
    es.onopen = () => { delay = 2000; };
    es.onmessage = (e) => {
      let msg = null;
      try { msg = JSON.parse(e.data); } catch { return; }
      if (msg && msg.event) {
        try { onEvent(msg.event, msg.data || {}); } catch { /* caller's problem, not ours */ }
      }
    };
    es.onerror = () => {
      // EventSource retries on its own, but a server restart can leave it
      // wedged; tear down and rebuild with backoff.
      try { es.close(); } catch { /* already closed */ }
      es = null;
      if (stopped) return;
      setTimeout(open, delay);
      delay = Math.min(delay * 2, 30000);
    };
  };

  open();

  return () => {
    stopped = true;
    if (es) { try { es.close(); } catch { /* already closed */ } }
    es = null;
  };
}
