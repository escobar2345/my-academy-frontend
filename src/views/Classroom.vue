<template>
  <div class="app" :class="{ presenting: sharing }">

    <!-- ===== TOP BAR ===== -->
    <header class="topbar">
      <span class="live-badge">LIVE</span>
      <div class="title-wrap"><h1>{{ roomCourse || 'Live class' }} — Live Session</h1></div>
      <div class="top-right">
        <div class="avatars">
          <span v-for="p in visibleRoster" :key="p.id" class="avatar" :style="{ '--h': p.hue }">{{ initialsOf(p.name) }}</span>
          <span v-if="roster.length > 4" class="avatar more">+{{ roster.length - 4 }}</span>
        </div>
        <div class="hands">
          <svg class="icon" viewBox="0 0 24 24"><path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
          <span><b>{{ raisedCount }}</b> raised</span>
        </div>
        <!-- Teacher control: enable / disable live class chat -->
        <button v-if="isTeacher && !quiz.launched" class="chat-toggle" :class="{ on: chatOpen }" @click="toggleChatPermission"
                :title="chatOpen ? 'Disable live chat' : 'Enable live chat'">
          <svg class="icon small" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path v-if="!chatOpen" d="m10 9 4 4M14 9l-4 4"/></svg>
          <span>{{ chatOpen ? 'Disable Live Chat' : 'Enable Live Chat' }}</span>
        </button>
        <!-- Teacher control: classroom toolkit (textbook / quiz / assignment) -->
        <button v-if="isTeacher" class="chat-toggle tools-toggle" @click="openTeacherTools" title="Teacher tools — upload textbook, set quiz, give assignment">
          <svg class="icon small" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          <span>Teacher Tools</span>
        </button>
        <span class="chip people-chip">👥 {{ roster.length }}</span>
        <span class="chip">{{ sessionTime }}</span>
        <button class="icon-btn" :class="{ done: quiz.phase === 'done' }" v-show="quiz.launched" @click="openQuiz">
          <svg class="icon small" viewBox="0 0 24 24"><path d="M4 6h9M4 12h9M4 18h6"/><path d="m15 7 2 2 4-4"/><path d="m15 16 2 2 4-4"/></svg>
          <span class="ping" v-if="quiz.phase !== 'done'"></span>
        </button>
      </div>
    </header>

    <!-- ===== MAIN ===== -->
    <main class="content">
      <section class="stage" ref="stageRef" @touchstart.passive="swipeStart" @touchend.passive="swipeEnd">
        <div class="share-chip" v-show="sharing"><span class="dot"></span> Sharing</div>

        <!-- View: my screen — Meet-style presenter view. The captured feed is
             NOT painted full-size back into this page while presenting (that
             feedback loop is what causes hall-of-mirrors). Participants get the
             full stream; the presenter gets this panel + optional tiny preview. -->
        <div class="stage-view" v-show="shareStageVisible">
          <!-- Teacher SCREEN MANAGER: monitors student screens ONLY. Pick which
               student's screen to watch and see the live class size. The
               teacher's own share action now lives in the Teacher's Lesson popup. -->
          <div v-if="isTeacher" class="teacher-screen-manager">
            <div class="tsm-layout">
              <div class="tsm-main">
                <!-- Selected student's screen, shown large -->
                <div v-if="selectedStudentScreen" class="tsm-viewer">
                  <video :ref="el => setRemoteVideo(el, selectedStudentScreen)" autoplay playsinline></video>
                  <span class="tsm-viewer-label">🎦 Watching {{ studentNameFor(selectedStudentScreen) }}</span>
                  <button type="button" class="tsm-x" @click="selectedStudentScreen = ''">✕ Stop watching</button>
                </div>
                <!-- Classroom live view: student screens + class size only.
                     The teacher's own Share My Screen action now lives in the
                     "Teacher's Lesson" popup (Go Live / Share My Screen). -->
                <div v-else class="tsm-self">
                  <div class="pp-icon">👥</div>
                  <b>{{ classroomCount }} {{ classroomCount === 1 ? 'student' : 'students' }} in your classroom</b>
                  <p>This section only monitors student screens. Pick any student who is sharing on the right to watch them live — and share your own screen from the <b>Teacher's Lesson</b> popup whenever you decide to go live.</p>
                </div>
              </div>

              <aside class="tsm-rail">
                <div class="tsm-count-panel">
                  <p class="tsm-kicker">CLASSROOM</p>
                  <div class="tsm-count-row">
                    <span>👥 Students in class</span>
                    <b>{{ classroomCount }}</b>
                  </div>
                </div>

                <div class="tsm-students">
                  <div class="tsm-subtitle">
                    <span>Students sharing</span>
                    <b>{{ studentScreenStreamers.length }}</b>
                  </div>
                  <div v-if="studentScreenStreamers.length" class="tsm-student-list">
                    <button v-for="s in studentScreenStreamers" :key="s.id" type="button"
                            class="tsm-student" :class="{ active: selectedStudentScreen === s.id }"
                            @click="selectedStudentScreen = (selectedStudentScreen === s.id ? '' : s.id)">
                      <video :ref="el => setRemoteVideo(el, s.id)" class="tsm-student-video" autoplay playsinline muted></video>
                      <span class="tsm-name">{{ s.name }}</span>
                      <span class="tsm-watch">{{ selectedStudentScreen === s.id ? '● Watching' : '▶ View' }}</span>
                    </button>
                  </div>
                  <div v-else class="tsm-empty">🖥 No students are sharing their screens right now.</div>
                </div>

                <div class="mirror-warn rail-warn" v-show="mirrorWarn && sharing">
                  <span>⚠️ You picked your <b>entire screen</b> — prefer a single window/tab for the sharpest look.</span>
                </div>
              </aside>
            </div>
          </div>

          <!-- Students: existing presenter view -->
          <template v-else>
            <div class="presenting-panel" v-show="!screenStream">
              <div class="pp-icon">📺</div>
              <b>Share your screen with the class</b>
              <p>Hit the screen-share control in the bottom bar, then pick a window, tab or full screen. While you present, your lesson video keeps playing big on stage and your shared {{ shareSurfaceLabel }} rides along as a corner preview — swap any time.</p>
            </div>
            <div class="mirror-warn" v-show="mirrorWarn">
              <span>⚠️ You picked your <b>entire screen</b> — your lesson stays big on stage and the corner preview is the only thing this page renders, so the feed stays clean. Prefer a <b>single app window or tab</b> for the sharpest look.</span>
              <button type="button" class="mw-close" @click="mirrorWarn = false">✕</button>
            </div>
          </template>
        </div>

        <!-- View: LIVE — the live video meeting (Go Live).
             Teacher : their own camera goes on air for the whole class.
             Student : the teacher's live video takes the stage with every
                       classmate's camera in the strip below, so teacher and
                       students all see each other in real time. -->
        <div class="stage-view live-stage-view" v-if="liveStageOn">
          <!-- Teacher: own camera + on-air controls -->
          <div class="live-room" v-if="isTeacher && cameraStream">
            <video ref="liveCameraVideoRef" class="live-camera-video" autoplay muted playsinline></video>
            <span class="live-air"><span class="dot"></span> YOU'RE LIVE</span>
            <button type="button" class="live-end" @click="endLive">⏹ End Live</button>
          </div>

          <!-- Student: the teacher's live video, big -->
          <div class="live-room" v-else-if="!isTeacher && teacherLiveStream">
            <video :ref="el => setRemoteVideo(el, teacherLiveStream.id)" class="live-camera-video" autoplay playsinline></video>
            <span class="live-air"><span class="dot"></span> {{ liveTeacherName }} IS LIVE</span>
          </div>

          <div class="presenting-panel" v-else-if="isTeacher">
            <div class="pp-icon">🎥</div>
            <b>Getting you on air…</b>
            <p>Allow camera &amp; microphone when the browser asks, and your live video will appear here for the whole class to see.</p>
            <button type="button" class="live-end cancel" @click="endLive">Cancel</button>
          </div>

          <div class="presenting-panel" v-else>
            <div class="pp-icon">🎥</div>
            <b>{{ liveTeacherName }} is live</b>
            <p>Connecting to their video… make sure your browser is allowed to play media, and turn your own camera on below to be seen by the class.</p>
          </div>

          <!-- Student <-> student video wall: every classmate broadcasting -->
          <div class="live-wall" v-if="classmateStreams.length">
            <div v-for="c in classmateStreams" :key="c.id" class="live-wall-tile">
              <video :ref="el => setRemoteVideo(el, c.id)" autoplay playsinline></video>
              <span class="live-wall-name">{{ c.name }}</span>
            </div>
          </div>
        </div>

        <!-- View: teacher's lesson (dockable: full stage ⇄ floating PiP) -->
        <div class="stage-view teacher-stage-view" v-show="teacherStageVisible && !liveStageOn" :class="{ solo: lessonSmall }">
          <div class="board">
            <div class="board-head">
              <span class="t-cam"><svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="4"/><path d="M4 20c1.6-4.2 5-6 8-6s6.4 1.8 8 6z"/></svg></span>
            </div>
            <div class="teacher-video">
              <div v-if="selectedLessonVideo" class="video-shell" :class="{ floating: lessonSmall }">
                <div v-if="lessonSmall" class="shell-float-bar">
                  <span>🎓 Teacher's lesson</span>
                  <button type="button" @click="lessonPip = false; lessonBigOnShare = true">⤢ Back to tab</button>
                </div>
                <button v-if="!lessonSmall" type="button" class="shell-popout"
                        @click="lessonPip = true" title="Pop out to picture-in-picture">⧉ PiP</button>
                <!-- Managed by the YouTube IFrame API so we know the exact
                     moment the video ENDS -> that launches the AI quiz. -->
                <div ref="ytHostRef" class="yt-host"></div>
                <!-- Class-start gate: covers the loaded-but-paused player
                     until the teacher goes live or publishes the lesson. -->
                <div v-if="!classStarted" class="class-wait-overlay">
                  <div class="cwo-card">
                    <span class="cwo-dot"></span>
                    <b>Class hasn't started yet</b>
                    <p>The lesson is loaded and will start playing automatically when your teacher begins the class.</p>
                  </div>
                </div>
              </div>
              <div v-else class="video-loading">
                {{ videoError || 'Loading...' }}
              </div>
              <div v-if="lessonVideos.length > 1" class="video-list">
                <button
                  v-for="(video, index) in lessonVideos"
                  :key="video.id || index"
                  class="video-choice"
                  :class="{ active: selectedLessonVideo && selectedLessonVideo.id === video.id }"
                  @click="selectedLessonVideo = video"
                >
                  <img :src="video.thumbnail || placeholderThumb" :alt="video.title || 'Teacher lesson video'" />
                </button>
              </div>
            </div>
          </div>
          <div class="pip-hint" v-show="currentView === 'teacher' && lessonSmall">
            🎓 Lesson playing in picture-in-picture — hit <b>⤢ Back to tab</b> on the mini-player to restore it full size.
          </div>
        </div>

        <!-- Single capture element: corner preview by default (lesson stays big),
             full stage when the shared screen wins the swap. -->
        <div v-show="shareFloatVisible" class="share-float" :class="{ big: shareFloatBig }">
          <video ref="screenVideoRef" class="screen-video" autoplay playsinline muted></video>
          <button v-if="sharing" type="button" class="sf-label" @click="swapShareBig">
            {{ shareFloatBig ? '⤢ Lesson big' : '⤢ Screen big' }}
          </button>
        </div>

        <!-- While sharing: flip which feed owns the big stage -->
        <div v-show="sharing" class="share-swap">
          <button type="button" @click="lessonBigOnShare = !lessonBigOnShare">
            {{ lessonBigOnShare ? '🖥 Show my shared screen big' : '🎓 Show the lesson big' }}
          </button>
        </div>

        <div v-if="cameraStream && !liveMode" class="camera-tile">
          <video ref="cameraVideoRef" class="camera-video" autoplay muted playsinline></video>
        </div>
        <div v-if="gridStreams.length && !(isTeacher && currentView === 'share')" class="remote-video-grid">
          <div v-for="remote in gridStreams" :key="remote.id" class="remote-video-tile">
            <video :ref="el => setRemoteVideo(el, remote.id)" autoplay playsinline></video>
            <button v-if="isTeacher && remote.kind === 'screen'" type="button" @click="selectedStudentScreen = remote.id">Watch {{ remote.name }}</button>
            <span v-else>{{ remote.name }}</span>
          </div>
        </div>
        <!-- Big view of the chosen student's screen (outside the My Screen view) -->
        <div v-if="isTeacher && selectedStudentScreen && currentView !== 'share'" class="selected-student-screen">
          <video :ref="el => setRemoteVideo(el, selectedStudentScreen)" autoplay playsinline></video>
          <span>Student screen: {{ studentNameFor(selectedStudentScreen) }}</span>
        </div>

        <span v-for="f in floats" :key="f.id" class="float-emoji" :style="{ left: f.left }">{{ f.char }}</span>
        <div class="swipe-hint" :class="{ fade: hintFaded }">👈 Swipe to switch views 👉</div>

        <div class="view-switch">
          <button class="vs-btn" :class="{ active: currentView === 'share' }" @click="setView('share')">
            <svg class="icon small" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="12" rx="2"/><path d="M12 15v6"/><path d="M8 21h8"/></svg>
            {{ isTeacher ? 'Student Screens' : 'My Screen' }}
          </button>
          <button class="vs-btn" :class="{ active: currentView === 'teacher' }" @click="openTeacherSetup">
            <svg class="icon small" viewBox="0 0 24 24"><path d="M22 9 12 4 2 9l10 5 10-5z"/><path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5"/></svg>
            Teacher's Lesson
          </button>
        </div>
      </section>

      <!-- ===== CHAT (sidebar / bottom sheet) ===== -->
      <aside class="chat" :class="{ expanded: sheetOpen }" :style="sheetStyle" ref="chatRef">
        <div class="handle" @pointerdown="sheetDown" @pointermove="sheetMove" @pointerup="sheetUp"></div>
        <div class="chat-tabs">
          <!-- Realtime group chat completely shuts down while a quiz runs -->
          <button v-if="!chatLocked" class="tab" :class="{ active: currentTab === 'class' }" @click="setTab('class')">
            💬 Class Chat <span class="tab-badge" v-show="unread.class">{{ unread.class }}</span>
          </button>
          <button v-else class="tab locked-tab" disabled title="Class chat is closed by the teacher">
            🔒 {{ isTeacher ? 'Student chat closed' : 'Chat closed by teacher' }}
          </button>
          <button v-if="!isTeacher" class="voice-request" @click="toggleVoiceRequest">
            {{ voiceApproved ? 'Microphone approved' : voiceRequested ? 'Speaking request sent' : 'Request to speak' }}
          </button>
          <div v-if="isTeacher && voiceRequests.length" class="voice-requests">
            <span>Speaking requests</span>
            <button v-for="student in voiceRequests" :key="student.id" @click="decideVoice(student.id, true)">
              {{ student.name }}: Allow microphone
            </button>
          </div>
          <button class="tab" :class="{ active: currentTab === 'ai' }" @click="setTab('ai')">
            🤖 AI Chat <span class="tab-badge" v-show="unread.ai">{{ unread.ai }}</span>
          </button>
        </div>
        <div class="peek-preview">{{ peekPreview }}</div>

        <div class="messages" ref="classBoxRef" v-show="currentTab === 'class'">
          <div v-for="m in classMessages" :key="m.key" class="msg" :class="m.kind === 'system' ? 'system' : m.kind">
            <div v-if="m.kind === 'system'" class="sys-note">{{ m.text }}</div>
            <template v-else>
              <span v-if="m.kind === 'teacher'" class="tag-teacher">{{ m.name || 'Teacher' }}</span>
              <span v-if="m.kind === 'other'" class="mini-av" :style="{ '--h': m.hue }">{{ m.initial }}</span>
              <div class="bubble"><span v-if="m.kind !== 'you'" class="sender-name">{{ m.name || 'Classmate' }}</span>{{ m.text }}</div>
            </template>
          </div>
        </div>

        <div class="messages" ref="aiBoxRef" v-show="currentTab === 'ai'">
          <div v-for="(m, i) in aiMessages" :key="i" class="msg ai">
            <span class="mini-av bot">🤖</span><div class="bubble">{{ m.text }}</div>
          </div>
          <div class="msg ai" v-if="aiTyping">
            <span class="mini-av bot">🤖</span>
            <div class="bubble typing"><span></span><span></span><span></span></div>
          </div>
        </div>

        <div class="emoji-row" v-show="currentTab === 'class' && !chatLocked">
          <button v-for="e in emojis" :key="e" class="emoji-btn" @click="sendChat(e)">{{ e }}</button>
        </div>
        <div class="ai-grounding" v-show="currentTab === 'ai'">
          <span class="g-chip" :class="{ on: !!selectedLessonVideo }">
            {{ selectedLessonVideo ? '📚 Lesson connected' : '📚 No lesson yet' }}
          </span>
          <span class="g-chip" :class="{ on: sharing && screenStream }">
            {{ sharing && screenStream ? '🖥️ Screen visible to AI' : '🖥️ Screen off' }}
          </span>
        </div>
        <form class="chat-input" @submit.prevent="sendMessage">
          <input v-model="chatInput" :placeholder="placeholder" autocomplete="off" enterkeyhint="send">
          <button class="send-btn" type="submit"><svg class="icon" viewBox="0 0 24 24"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4Z"/></svg></button>
        </form>
      </aside>
    </main>

    <!-- ===== CONTROLS ===== -->
    <footer class="controls">
      <div class="foot-note">
        <svg class="icon" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        <span>Your AI quiz launches automatically when the lesson video ends · chat pauses during quizzes</span>
      </div>
      <div class="ctrl-group">
        <button class="ctrl" :class="{ off: !micOn }" @click="toggle('mic')"><svg class="icon" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg></button>
        <button class="ctrl" :class="{ off: !camOn }" @click="toggle('cam')"><svg class="icon" viewBox="0 0 24 24"><rect x="2" y="6" width="13" height="12" rx="2"/><path d="M15 10.5 21 7v10l-6-3.5"/></svg></button>
        <button class="ctrl" :class="{ active: sharing }" @click="toggle('share')"><svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="12" rx="2"/><path d="M12 12V7"/><path d="m9.5 9.5 2.5-2.5 2.5 2.5"/><path d="M12 15v6"/><path d="M8 21h8"/></svg></button>
        <button class="ctrl" :class="{ active: raised }" @click="toggle('hand')"><svg class="icon" viewBox="0 0 24 24"><path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg></button>
        <button class="ctrl" @click="react"><svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.5 14a4.5 4.5 0 0 0 7 0"/><path d="M9.3 9.3h.01"/><path d="M14.7 9.3h.01"/></svg></button>
        <button class="ctrl only-desktop"><svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9 19 19M19 5l-2.1 2.1M7.1 16.9 5 19"/></svg></button>
      </div>
      <button class="leave" @click="leave">
        <svg class="icon small" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>
        Leave
      </button>
    </footer>
  </div>

  <!-- ===== QUIZ TOAST + POPUP ===== -->
  <div class="toast" :class="{ show: toastShown }">
    <div><b>{{ quiz.toastTitle }}</b><small>{{ quiz.toastSub }}</small></div>
    <button @click="openQuizFromToast">Open Quiz</button>
  </div>
  <div class="quiz-scrim" :class="{ show: quiz.open }" @click="closeQuiz"></div>
  <section class="quiz-card" :class="{ open: quiz.open }">
    <div class="handle"></div>
    <div class="quiz-head">
      <div><b>{{ quizHead }}</b><div class="q-sub">{{ quizSub }}</div></div>
      <span class="q-timer" v-if="quiz.phase === 'active'" :class="{ danger: quiz.sec <= 10 }">{{ quizTime }}</span>
      <button class="q-close" v-if="quiz.phase !== 'generating'" @click="closeQuiz"><svg class="icon small" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
    <div class="quiz-body">
      <!-- Phase: the AI is writing the quiz right after the video ended -->
      <div v-if="quiz.phase === 'generating'" class="quiz-generating">
        <span class="spinner"></span>
        <p>🎬 Lesson finished!</p>
        <p class="gen-sub">Your AI teacher is reviewing today's video and writing your personal quiz…</p>
        <div class="typing"><span></span><span></span><span></span></div>
      </div>

      <!-- Phase: answering questions -->
      <template v-else-if="quiz.phase === 'active' && currentQuestion">
        <div class="progress"><div class="progress-fill" :style="{ width: progressPct + '%' }"></div></div>
        <p class="question">{{ quiz.index + 1 }}. {{ currentQuestion.q }}</p>
        <div class="options" :class="{ warn }">
          <button v-for="(o, i) in currentQuestion.options" :key="i" class="option"
            :class="{ selected: quiz.picked === i && !quiz.revealed, correct: quiz.revealed && i === currentQuestion.answer, missed: quiz.revealed && quiz.picked === i && i !== currentQuestion.answer }"
            :disabled="quiz.revealed" @click="pick(i)">
            {{ optionLabel(i) }} {{ o }}
          </button>
        </div>
        <p class="feedback" v-if="quiz.revealed" :class="{ good: quiz.lastCorrect }">{{ quiz.feedbackText }}</p>
        <button class="submit" v-if="!quiz.revealed" :disabled="quiz.picked == null" @click="submitAnswer">Submit Answer</button>
        <button class="submit done" v-else @click="nextQuestion">{{ quiz.index === quiz.questions.length - 1 ? 'See My Score 🏁' : 'Next Question →' }}</button>
      </template>

      <!-- Phase: results -->
      <div v-else-if="quiz.phase === 'done'" class="score-panel">
        <div class="score-big">{{ quiz.score }}/{{ quiz.questions.length }}</div>
        <p class="score-msg">{{ scoreMessage }}</p>
        <small class="score-note">💬 Class chat has been unlocked</small>
        <button class="submit done" @click="closeQuiz">Done</button>
      </div>
    </div>
  </section>

  <!-- ===== TEACHER LESSON SETUP POPUP (Go Live / AI Video) =====
       Shown automatically when a teacher enters /classroom/teacher.
       - "Go Live"    : starts camera + mic -> live teacher meeting.
       - "AI Video"   : teacher pastes a YouTube URL, or (empty) MiroFish
                        auto-picks a lesson for the course topic. -->
  <div v-if="teacherSetupOpen && isTeacher" class="ts-scrim" @click.self="closeTeacherSetup">
    <div class="ts-card">
      <div class="ts-head">
        <div class="ts-icon">🎓</div>
        <div class="ts-txt">
          <p class="ts-kicker">TEACHER STUDIO</p>
          <h2>Start today's lesson</h2>
          <p class="ts-sub">Teach live with your camera &amp; mic, or queue an AI / YouTube video lesson for the class.</p>
        </div>
        <button class="ts-close" @click="closeTeacherSetup" aria-label="Close">✕</button>
      </div>

      <div class="ts-options">
        <button class="ts-option" :class="{ picked: teacherSetup.selected === 'live' }" @click="beginLive">
          <span class="ts-radio">●</span>
          <span class="ts-opt-icon">🎥</span>
          <span class="ts-opt-txt">
            <b>Go Live</b>
            <small>Turn on your camera &amp; mic and teach the class in real time — just like a live video meeting.</small>
          </span>
          <span class="ts-arrow">→</span>
        </button>

        <button class="ts-option" :class="{ picked: teacherSetup.selected === 'video' }" @click="teacherSetup.selected = 'video'">
          <span class="ts-radio">●</span>
          <span class="ts-opt-icon">📺</span>
          <span class="ts-opt-txt">
            <b>AI Video Lesson</b>
            <small>Paste a YouTube URL everyone learns along with. Leave it empty and MiroFish auto-picks a lesson for the course topic.</small>
          </span>
          <span class="ts-arrow">↓</span>
        </button>
      </div>

      <div v-if="teacherSetup.selected === 'video'" class="ts-video-form">
        <label class="ts-label">YouTube video URL</label>
        <input v-model="teacherSetup.videoUrl"
               placeholder="https://www.youtube.com/watch?v=…  (leave empty for MiroFish auto)"
               @keyup.enter="startVideoLesson" />
        <div class="ts-actions">
          <button class="ts-btn ghost" @click="teacherSetup.videoUrl = ''">Clear</button>
          <button class="ts-btn primary" @click="startVideoLesson">Start video lesson →</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ===== TEACHER TOOLS POPUP (upload textbook / set quiz / give assignment) =====
       A dedicated studio — opened from the "Teacher Tools" button in the top bar.
       Not tied to any lesson mode: works before, during or after going live. -->
  <div v-if="toolsOpen && isTeacher" class="tt-scrim" @click.self="closeTeacherTools">
    <div class="tt-card">
      <div class="ts-head">
        <div class="ts-icon">🧰</div>
        <div class="ts-txt">
          <p class="ts-kicker">CLASSROOM STUDIO</p>
          <h2>Teacher Tools</h2>
          <p class="ts-sub">Share material and work with your class — everything lands on their dashboards instantly.</p>
        </div>
        <button class="ts-close" @click="closeTeacherTools" aria-label="Close">✕</button>
      </div>

      <!-- Tabs -->
      <div class="tt-tabs">
        <button class="tt-tab" :class="{ on: teacherTool === 'textbook' }" @click="teacherTool = 'textbook'">
          <span class="tt-tab-ico">📄</span> TextBook
        </button>
        <button class="tt-tab" :class="{ on: teacherTool === 'quiz' }" @click="teacherTool = 'quiz'">
          <span class="tt-tab-ico">📝</span> Quiz
        </button>
        <button class="tt-tab" :class="{ on: teacherTool === 'assignment' }" @click="teacherTool = 'assignment'">
          <span class="tt-tab-ico">📋</span> Assignment
        </button>
        <button class="tt-tab" :class="{ on: teacherTool === 'timetable' }" @click="teacherTool = 'timetable'">
          <span class="tt-tab-ico">🗓️</span> Timetable
        </button>
      </div>

      <!-- TextBook tab -->
      <div v-if="teacherTool === 'textbook'" class="tt-panel">
        <div class="tt-seg">
          <button class="tt-seg-btn" :class="{ on: teacherTb.mode === 'pdf' }" @click="teacherTb.mode = 'pdf'">📄 Upload PDF</button>
          <button class="tt-seg-btn" :class="{ on: teacherTb.mode === 'ai' }" @click="teacherTb.mode = 'ai'">🤖 MiroFish AI</button>
        </div>

        <template v-if="teacherTb.mode === 'pdf'">
          <div class="tt-drop" :class="{ filled: teacherPdf.file }" @click="pdfInputRef && pdfInputRef.click()">
            <input ref="pdfInputRef" type="file" accept="application/pdf,.pdf" @change="onPdfPicked" hidden />
            <span class="tt-drop-ico">{{ teacherPdf.file ? '✅' : '📄' }}</span>
            <b v-if="teacherPdf.file">{{ teacherPdf.fileName }} <small>({{ (teacherPdf.fileSize / 1048576).toFixed(1) }} MB)</small></b>
            <template v-else>
              <b>Click to choose a PDF textbook</b>
              <small>It lands in every student's Library the moment you upload.</small>
            </template>
          </div>
          <label class="tt-label">Title shown to students</label>
          <input class="tt-input" v-model="teacherPdf.title" placeholder="e.g. Cell Biology — Chapter 3" />
          <div class="tt-actions">
            <button class="ts-btn ghost" @click="resetTeacherTool">Clear</button>
            <button class="ts-btn primary" :disabled="teacherPdf.busy || !teacherPdf.file" @click="uploadTextbook">
              {{ teacherPdf.busy ? 'Uploading…' : 'Upload to class →' }}
            </button>
          </div>
          <p v-if="teacherPdf.msg" class="tt-msg" :class="{ ok: teacherPdf.ok }">{{ teacherPdf.msg }}</p>
        </template>

        <template v-else>
          <div class="tt-ai">
            <p><b>MiroFish AI writes a full textbook</b> for your class — chapters and lessons built from your topic, delivered straight to every student's Library when it's done.</p>
            <label class="tt-label">Topic <b class="req">*</b></label>
            <input class="tt-input" v-model="teacherTb.aiTopic" placeholder="e.g. Introduction to Algebra — basics and first steps" @keyup.enter="teacherGenerateTextbookAI" />
            <div class="tt-actions">
              <button class="ts-btn ghost" @click="resetTeacherTool">Clear</button>
              <button class="ts-btn ai" :disabled="teacherTb.aiBusy || !teacherTb.aiTopic.trim()" @click="teacherGenerateTextbookAI">
                {{ teacherTb.aiBusy ? '🤖 Writing…' : '✨ Generate textbook with MiroFish AI' }}
              </button>
            </div>
            <p v-if="teacherTb.msg" class="tt-msg" :class="{ ok: teacherTb.ok }">{{ teacherTb.msg }}</p>
          </div>
          <p class="tt-note">📌 AI textbooks take a few minutes — you can keep teaching; the book appears in the class Library automatically.</p>
        </template>
      </div>

      <!-- Quiz tab -->
      <div v-else-if="teacherTool === 'quiz'" class="tt-panel">
        <!-- FIRST: the teacher sets every question by hand -->
        <!-- SECOND: MiroFish AI drafts the questions for review -->
        <div class="tt-seg">
          <button class="tt-seg-btn" :class="{ on: teacherQuiz.mode === 'manual' }" @click="teacherQuiz.mode = 'manual'">✍️ Set my own questions</button>
          <button class="tt-seg-btn" :class="{ on: teacherQuiz.mode === 'ai' }" @click="teacherQuiz.mode = 'ai'">🤖 MiroFish AI</button>
        </div>

        <template v-if="teacherQuiz.mode === 'manual'">
          <label class="tt-label">Quiz title <small>(optional)</small></label>
          <input class="tt-input" v-model="teacherQuiz.title" placeholder="e.g. Cell Biology checkpoint" />
          <div class="tt-qcard">
            <label class="tt-label">Question <b class="req">*</b></label>
            <input class="tt-input" v-model="teacherQuiz.draft.q" placeholder="Ask your question…" @keyup.enter="addQuizDraftQuestion" />
            <label class="tt-label">Answer options — tick the correct one <b class="req">*</b></label>
            <div v-for="(opt, i) in teacherQuiz.draft.options" :key="i" class="tt-opt" :class="{ correct: teacherQuiz.draft.answer === i }">
              <button class="tt-opt-radio" :class="{ on: teacherQuiz.draft.answer === i }" @click="teacherQuiz.draft.answer = i" :aria-label="'Mark option ' + optionLabel(i) + ' correct'"></button>
              <span class="tt-opt-letter">{{ optionLabel(i) }}</span>
              <input class="tt-input opt" v-model="teacherQuiz.draft.options[i]" :placeholder="'Option ' + optionLabel(i)" @keyup.enter="addQuizDraftQuestion" />
            </div>
            <label class="tt-label">Why is it correct? <small>(optional — shown after answering)</small></label>
            <input class="tt-input" v-model="teacherQuiz.draft.why" placeholder="One short sentence of explanation" @keyup.enter="addQuizDraftQuestion" />
            <button class="ts-btn ghost tt-add" :disabled="!quizDraftReady" @click="addQuizDraftQuestion">➕ Add question</button>
          </div>
        </template>

        <template v-else>
          <div class="tt-ai">
            <p><b>MiroFish AI drafts the questions</b> from a topic — you review them below (remove any you dislike), then launch.</p>
            <label class="tt-label">Topic <b class="req">*</b></label>
            <input class="tt-input" v-model="teacherQuiz.aiTopic" placeholder="e.g. Photosynthesis — light and dark reactions" @keyup.enter="teacherGenerateQuizAI" />
            <label class="tt-label">How many questions?</label>
            <select class="tt-input" v-model.number="teacherQuiz.aiCount">
              <option :value="5">5 questions</option>
              <option :value="8">8 questions</option>
              <option :value="10">10 questions</option>
              <option :value="12">12 questions</option>
            </select>
            <button class="ts-btn ai tt-ai-btn" :disabled="teacherQuiz.aiBusy || !teacherQuiz.aiTopic.trim()" @click="teacherGenerateQuizAI">
              {{ teacherQuiz.aiBusy ? '🤖 Writing your questions…' : '✨ Draft with MiroFish AI' }}
            </button>
            <p v-if="teacherQuiz.aiMsg" class="tt-msg" :class="{ ok: teacherQuiz.aiOk }">{{ teacherQuiz.aiMsg }}</p>
          </div>
        </template>

        <div v-if="teacherQuiz.questions.length" class="tt-qlist">
          <div class="tt-qlist-head">Your quiz — {{ teacherQuiz.questions.length }} question{{ teacherQuiz.questions.length === 1 ? '' : 's' }}</div>
          <div v-for="(q, i) in teacherQuiz.questions" :key="i" class="tt-qrow">
            <span class="tt-qnum">{{ i + 1 }}.</span>
            <span class="tt-qtext">{{ q.q }}</span>
            <button class="tt-qdel" @click="teacherQuiz.questions.splice(i, 1)" aria-label="Remove question">✕</button>
          </div>
        </div>

        <div class="tt-actions">
          <button class="ts-btn ghost" @click="closeTeacherTools">Close</button>
          <button class="ts-btn primary" :disabled="teacherQuiz.busy || !teacherQuiz.questions.length" @click="teacherSetQuiz">
            {{ teacherQuiz.busy ? 'Launching…' : 'Launch quiz for everyone →' }}
          </button>
        </div>
        <p v-if="teacherQuiz.msg" class="tt-msg" :class="{ ok: teacherQuiz.ok }">{{ teacherQuiz.msg }}</p>
        <p class="tt-note">📌 Every student's screen opens the same quiz at the same time — class chat pauses while it runs.</p>
      </div>

      <!-- Assignment tab -->
      <div v-else-if="teacherTool === 'assignment'" class="tt-panel">
        <label class="tt-label">Assignment title <b class="req">*</b></label>
        <input class="tt-input" v-model="teacherAsg.title" placeholder="e.g. Problem Set 4 — Data Structures" />
        <label class="tt-label">Instructions</label>
        <textarea class="tt-input area" v-model="teacherAsg.instructions" rows="3" placeholder="What should students turn in? Add any links or page references."></textarea>
        <div class="tt-row2">
          <div>
            <label class="tt-label">Due date <small>(optional)</small></label>
            <input class="tt-input" v-model="teacherAsg.due" type="date" />
          </div>
        </div>
        <div class="tt-actions">
          <button class="ts-btn ghost" @click="resetTeacherTool">Clear</button>
          <button class="ts-btn primary" :disabled="teacherAsg.busy || !teacherAsg.title.trim()" @click="teacherGiveAssignment">
            {{ teacherAsg.busy ? 'Sending…' : 'Give to class →' }}
          </button>
        </div>
        <p v-if="teacherAsg.msg" class="tt-msg" :class="{ ok: teacherAsg.ok }">{{ teacherAsg.msg }}</p>
        <!-- SECOND option: MiroFish AI drafts the assignment, teacher edits and sends -->
        <div class="tt-ai">
          <p><b>Need help writing it?</b> MiroFish AI drafts the title and instructions from a topic — you edit the draft above, then send.</p>
          <div class="tt-ai-row">
            <input class="tt-input" v-model="teacherAsg.aiTopic" placeholder="e.g. The water cycle — homework for the week" @keyup.enter="teacherDraftAssignmentAI" />
            <button class="ts-btn ai" :disabled="teacherAsg.aiBusy || !teacherAsg.aiTopic.trim()" @click="teacherDraftAssignmentAI">
              {{ teacherAsg.aiBusy ? '🤖 Drafting…' : '✨ Draft' }}
            </button>
          </div>
          <p v-if="teacherAsg.aiMsg" class="tt-msg" :class="{ ok: teacherAsg.aiOk }">{{ teacherAsg.aiMsg }}</p>
        </div>
        <p class="tt-note">📌 Assignments appear on every student dashboard under <b>Assignments</b> — instantly and after reload.</p>
      </div>

      <!-- Timetable tab -->
      <div v-else-if="teacherTool === 'timetable'" class="tt-panel">
        <!-- FIRST: the teacher builds the weekly schedule by hand -->
        <!-- SECOND: MiroFish AI drafts it (ai_learning_system_v4 engine) -->
        <div class="tt-seg">
          <button class="tt-seg-btn" :class="{ on: teacherTt.mode === 'manual' }" @click="teacherTt.mode = 'manual'">✍️ Build it myself</button>
          <button class="tt-seg-btn" :class="{ on: teacherTt.mode === 'ai' }" @click="teacherTt.mode = 'ai'">🤖 MiroFish AI</button>
        </div>

        <template v-if="teacherTt.mode === 'manual'">
          <div class="tt-callout">
            <span>🗓️</span>
            <p><b>Set your weekly class schedule.</b> One row per class day — students see it on their dashboard's Timetable page.</p>
          </div>
        </template>

        <template v-else>
          <div class="tt-ai">
            <p><b>MiroFish AI drafts the weekly schedule</b> with the same engine that builds student timetables — track-aware class days and times. Review the rows below, edit anything, then publish.</p>
            <div class="tt-row2">
              <div>
                <label class="tt-label">Track</label>
                <select class="tt-input" v-model="teacherTt.track">
                  <option>Weekday · evenings</option>
                  <option>Weekday · daytime</option>
                  <option>Weekend</option>
                </select>
              </div>
              <div>
                <label class="tt-label">Duration</label>
                <select class="tt-input" v-model.number="teacherTt.durationMonths">
                  <option :value="3">3 months</option>
                  <option :value="4">4 months</option>
                  <option :value="5">5 months</option>
                  <option :value="6">6 months</option>
                </select>
              </div>
              <div>
                <label class="tt-label">Class length</label>
                <select class="tt-input" v-model.number="teacherTt.classMinutes">
                  <option :value="45">45 min</option>
                  <option :value="60">60 min</option>
                  <option :value="90">90 min</option>
                </select>
              </div>
              <div>
                <label class="tt-label">Start date <small>(optional)</small></label>
                <input class="tt-input" type="date" v-model="teacherTt.startDate" />
              </div>
            </div>
            <button class="ts-btn ai tt-ai-btn" :disabled="teacherTt.aiBusy" @click="teacherDraftTimetableAI">
              {{ teacherTt.aiBusy ? '🤖 Building your timetable…' : '✨ Draft with MiroFish AI' }}
            </button>
            <p v-if="teacherTt.aiMsg" class="tt-msg" :class="{ ok: teacherTt.aiOk }">{{ teacherTt.aiMsg }}</p>
          </div>
        </template>

        <label class="tt-label">Timetable title</label>
        <input class="tt-input" v-model="teacherTt.title" placeholder="e.g. Weekday evenings — this term" />
        <label class="tt-label">Weekly sessions <small>(day · time · subject)</small></label>
        <div v-for="(s, i) in teacherTt.sessions" :key="i" class="tt-tt-row">
          <select class="tt-input day" v-model="s.day" :aria-label="'Day for session ' + (i + 1)">
            <option v-for="d in WEEK_DAYS" :key="d" :value="d">{{ d }}</option>
          </select>
          <input class="tt-input time" type="time" v-model="s.time" :aria-label="'Start time for session ' + (i + 1)" />
          <input class="tt-input subj" v-model="s.subject" :placeholder="'Subject / topic — session ' + (i + 1)" />
          <button class="tt-qdel" @click="teacherTt.sessions.splice(i, 1)" aria-label="Remove session">✕</button>
        </div>
        <button class="ts-btn ghost tt-add" @click="addTimetableRow">➕ Add a class day</button>
        <div class="tt-actions">
          <button class="ts-btn ghost" @click="closeTeacherTools">Close</button>
          <button class="ts-btn primary" :disabled="teacherTt.busy || !validTimetableRows" @click="publishTimetable">
            {{ teacherTt.busy ? 'Publishing…' : 'Publish to class →' }}
          </button>
        </div>
        <p v-if="teacherTt.msg" class="tt-msg" :class="{ ok: teacherTt.ok }">{{ teacherTt.msg }}</p>
        <p class="tt-note">📌 Published timetables show on every student dashboard under <b>Timetable</b> — instantly and after reload.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { getTopicVideos, askClassroomTutor, generateLessonQuiz, generateClassTextbook, getStudent, joinClassroom, pingClassroom,
         sayToClassroom, leaveClassroom, publishClassroomLesson, publishClassroomLive, signalClassroom, setClassroomChatPermission,
         requestClassroomVoice, setClassroomVoicePermission, publishClassroomTextbook, giveClassroomAssignment,
         publishClassroomQuiz, generateAssignmentDraft, getTextbookJob, subscribe,
         generateTimetableDraft, publishClassroomTimetable } from '../../boi-school/aiClient.js'

/* ---------- helpers ---------- */
const fmt = (t) => String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0')
const buzz = (ms = 10) => { if (navigator.vibrate) navigator.vibrate(ms) }
const isMobile = () => window.matchMedia('(max-width:900px)').matches

// The course the student wants to learn is resolved in real time from
// boirsu records (via boi_student_id) BEFORE any YouTube/Apify search;
// URL params and localStorage are only fallbacks.
const roomCourse = ref(
  new URLSearchParams(window.location.search).get('course')
  || new URLSearchParams(window.location.search).get('topic')
  || localStorage.getItem('boi_course_topic')
  || ''
)
// Topic handed to the AI tutor for lesson grounding. NOTE: this was previously
// *referenced* in currentLessonContext() but never defined anywhere, which made
// every tutor/quiz call throw a ReferenceError.
const lessonTopic = computed(() => roomCourse.value || '')
const lessonVideos = ref([])
const selectedLessonVideo = ref(null)
const loadingVideos = ref(false)
const videoError = ref('')
const placeholderThumb = 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=900&q=80'

function extractVideoId(url) {
  if (!url) return ''
  if (/^[A-Za-z0-9_-]{11}$/.test(String(url))) return String(url)
  const match = String(url).match(/(?:v=|\/)([A-Za-z0-9_-]{11})(?:[?&]|$)/)
  return match ? match[1] : ''
}

function videoEmbedUrl(video) {
  const id = extractVideoId(video?.embed_url || video?.watch_url || video?.url || '')
  if (!id) return ''
  // Class-start gate: no autoplay until the class has actually started.
  const start = classStarted.value ? '1&mute=1' : '0&mute=0'
  return `https://www.youtube.com/embed/${id}?autoplay=${start}&rel=0&modestbranding=1&controls=1&playsinline=1&showinfo=0&iv_load_policy=3`
}

async function loadLessonVideos() {
  loadingVideos.value = true
  videoError.value = ''
  const videos = await getTopicVideos(roomCourse.value || 'Biology 101', 'beginner', 3)
  lessonVideos.value = Array.isArray(videos) ? videos : []
  selectedLessonVideo.value = lessonVideos.value[0] || null
  if (selectedLessonVideo.value) {
    currentView.value = 'teacher'
  }
  if (!selectedLessonVideo.value) {
    videoError.value = 'No live YouTube lesson was returned. Check APIFY_TOKEN and the backend logs.'
  }
  loadingVideos.value = false
}

/* ---------- YouTube playback + end-of-video detection ----------
   The lesson plays through the official IFrame API instead of a plain iframe
   so we can detect the exact moment it finishes (PlayerState.ENDED === 0).
   That moment launches the AI-generated quiz. */
const ytHostRef = ref(null)
let ytPlayer = null
let ytApiPromise = null

function loadYouTubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT)
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === 'function') { try { prev() } catch {} }
        resolve(window.YT)
      }
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    })
  }
  return ytApiPromise
}

async function syncYtPlayer() {
  const v = selectedLessonVideo.value
  const id = extractVideoId(v?.embed_url || v?.watch_url || v?.url || '')
  if (!id) return
  const YT = await loadYouTubeApi()
  if (!ytHostRef.value) return // view torn down while the API was loading
  // Class-start gate: before the class starts the video is CUED (loaded and
  // paused, thumbnail visible) instead of autoplaying; once the class has
  // started, new videos load AND play.
  const start = classStarted.value
  if (!ytPlayer) {
    ytPlayer = new YT.Player(ytHostRef.value, {
      videoId: id,
      playerVars: { autoplay: start ? 1 : 0, mute: start ? 1 : 0, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3 },
      events: {
        onReady: (e) => { if (classStarted.value) { try { e.target.playVideo() } catch {} } },
        onStateChange: onYtStateChange
      }
    })
  } else {
    try {
      if (classStarted.value) ytPlayer.loadVideoById(id)  // class is on -> swap + play
      else ytPlayer.cueVideoById(id)                      // waiting -> swap but stay paused
    } catch {}
  }
}

function onYtStateChange(e) {
  // e.data === 0 is YT.PlayerState.ENDED -> the video finished playing.
  if (e && e.data === 0) onVideoEnded()
}

function onVideoEnded() {
  if (chatLocked.value) return // a quiz run is already live for this cohort member
  // After each class: fire-and-forget the W3Schools textbook pipeline so this
  // video lands as reference material in the studentdashboard.vue library.
  const v = selectedLessonVideo.value
  generateClassTextbook({
    course: roomCourse.value,
    topic: lessonTopic.value || roomCourse.value,
    video: {
      title: v?.title || '',
      url: v?.watch_url || v?.url || '',
      video_id: extractVideoId(v?.embed_url || v?.watch_url || v?.url || '')
    }
  }).catch(() => {})
  launchQuiz()
}

// Any video swap (own pick or remote lesson from the cohort) re-targets the player.
watch(selectedLessonVideo, () => { nextTick(syncYtPlayer) })

/* ---------- session timer ---------- */
const sessionSec = ref(24 * 60 + 18)
const sessionTime = computed(() => fmt(sessionSec.value))

/* ---------- views / swipe / pip ---------- */
const currentView = ref('share')
// Teacher mode: the setup popup that lets an educator "Go Live" or queue an
// AI/YouTube video lesson. Live mode puts the teacher's camera on the big stage.
const liveMode = ref(false)
const teacherSetupOpen = ref(false)
const teacherSetup = reactive({ selected: '', videoUrl: '' })
const liveCameraVideoRef = ref(null)
const screenStream = ref(null)
const cameraStream = ref(null)
const microphoneStream = ref(null)
const selectedStudentScreen = ref('')
const cameraVideoRef = ref(null)
const screenVideoRef = ref(null)
// ---- Room Go-Live state ------------------------------------------------
// The teacher's "Go Live" is published to the whole room (POST
// /api/classroom/live) and echoed back to everyone over SSE, so students
// switch to the live teacher video automatically instead of waiting on a
// refresh. `liveMode` stays the teacher's own local on-air flag.
const roomLive = ref(null)
const teacherLive = computed(() => !!roomLive.value?.active)
const liveTeacherName = computed(() => roomLive.value?.teacher_name || 'Your teacher')

// role is supplied (in priority order) by the route prop (/classroom/teacher &
// /classroom/student), the ?role=... query string, then localStorage, then defaults
// to 'student' so a bare /classroom link always behaves as the learner view.
// NOTE: declared up here, BEFORE the class-start gate below — classStarted reads
// isTeacher.value and its watch() evaluates eagerly during setup, so a later
// declaration hits the temporal dead zone and blanks the whole page with
// "Cannot access 'isTeacher' before initialization".
const props = defineProps({ role: { type: String, default: '' }, displayName: { type: String, default: '' } })
const requestedRole = props.role || new URLSearchParams(window.location.search).get('role') || localStorage.getItem('boi_role') || 'student'
const isTeacher = computed(() => requestedRole === 'teacher')

/* ---------- CLASS-START GATE ----------
/* ---------- CLASS-START GATE ----------
   Lesson videos LOAD immediately (thumbnail + controls ready) but never
   PLAY until the class actually starts. For a student the class has
   started when:
     - the teacher goes on air (classroom_live -> roomLive.active), or
     - the teacher publishes a lesson video (classroom_lesson).
   Teachers themselves are never gated. When the gate opens, the loaded
   video starts automatically (muted first, satisfying autoplay rules);
   if the teacher takes the room off air with no published lesson, the
   player pauses again. */
const remoteLessonActive = ref(false)
const classStarted = computed(() => isTeacher.value || teacherLive.value || remoteLessonActive.value)
watch(classStarted, (started) => {
  if (!ytPlayer || !ytPlayer.playVideo) return
  try {
    if (started) { ytPlayer.mute(); ytPlayer.playVideo() }
    else ytPlayer.pauseVideo()
  } catch {}
})
// The teacher's live camera as seen by a student (their tile in the mesh).
const teacherLiveStream = computed(() => {
  const tid = roomLive.value?.teacher_id
  return remoteStreams.value.find(r => r.kind === 'camera' && r.peerId === tid)
    || remoteStreams.value.find(r => r.kind === 'camera' && participantById(r.peerId)?.role === 'teacher')
    || null
})
// Classmates' cameras — this is the student-to-student video wall.
const classmateStreams = computed(() =>
  remoteStreams.value.filter(r => r.kind === 'camera' && r.peerId !== roomLive.value?.teacher_id
    && participantById(r.peerId)?.role !== 'teacher'))
// The big live stage is on for the on-air teacher, and for every student while
// the teacher is broadcasting.
const liveStageOn = computed(() => liveMode.value || (!isTeacher.value && teacherLive.value))
// Floating tile grid: normally every remote feed. While the live stage is up,
// cameras already have a home (teacher big + classmate wall), so only screen
// shares still need a tile.
const gridStreams = computed(() => liveStageOn.value
  ? remoteStreams.value.filter(r => r.kind === 'screen')
  : remoteStreams.value)
// Entire-screen shares include this very page (hall of mirrors). We can't
// hide the page from the OS capture — Google Meet can't either — so we warn
// the presenter and declutter the UI while presenting.
const mirrorWarn = ref(false)
let mirrorWarnTimer = null
// Meet-style presenter view: while presenting, the captured feed is never
// The single local render of the capture is the .share-float element below
// (corner preview, or full stage when it wins the swap) — participants always
// receive the untouched full feed.
const shareSurface = ref('')
const shareSurfaceLabel = computed(() =>
  ({ monitor: 'screen', window: 'window', browser: 'tab' }[shareSurface.value] || 'screen'))

// ---- Dockable lesson layout ---------------------------------------
// lessonBigOnShare : while sharing, the YouTube lesson owns the big stage and
//                    the shared screen becomes the small corner preview.
// lessonPip        : pop the lesson out as a floating PiP over any view
//                    (works with sharing on OR off). "Back to tab" re-docks it.
const lessonPip = ref(false)
const lessonBigOnShare = ref(true)
const lessonSmall = computed(() =>
  lessonPip.value || (sharing.value && !lessonBigOnShare.value))
/* Which big surface each stage paints:
   - teacher view: full when docked & owning the stage; "solo" (transparent,
     floating-shell-only) whenever the lesson rides as a mini-player. */
const teacherStageVisible = computed(() =>
  !liveMode.value && (currentView.value === 'teacher' || lessonSmall.value ||
  (sharing.value && !!selectedLessonVideo.value)))
const shareStageVisible = computed(() =>
  currentView.value === 'share' || (sharing.value && !!screenStream.value))
/* One <video> for the whole capture: corner preview normally, full stage
   when the shared screen wins the swap. */
const shareFloatVisible = computed(() => !!screenStream.value)
const shareFloatBig = computed(() =>
  sharing.value && !!screenStream.value && !lessonBigOnShare.value)
function swapShareBig() { lessonBigOnShare.value = !lessonBigOnShare.value }
const stageRef = ref(null)
const pipStyle = ref({})
const hintFaded = ref(false)
let pDrag = null, touchX = null

const setView = (v) => { currentView.value = v; buzz(8) }

function swipeStart(e) {
  if (e.target.closest('.pip-wrap,.view-switch,.share-chip,button')) return
  touchX = e.touches[0].clientX
}
function swipeEnd(e) {
  if (touchX == null) return
  const dx = e.changedTouches[0].clientX - touchX
  if (dx > 60) setView('share'); else if (dx < -60) setView('teacher')
  touchX = null
}
function pipDown(e) {
  const sr = stageRef.value.getBoundingClientRect()
  const pr = e.currentTarget.getBoundingClientRect()
  pDrag = { sx: e.clientX, sy: e.clientY, x: pr.left - sr.left, y: pr.top - sr.top, moved: false }
  e.currentTarget.setPointerCapture(e.pointerId)
}
function pipMove(e) {
  if (!pDrag) return
  const dx = e.clientX - pDrag.sx, dy = e.clientY - pDrag.sy
  if (Math.abs(dx) + Math.abs(dy) > 8) pDrag.moved = true
  if (!pDrag.moved) return
  const sr = stageRef.value.getBoundingClientRect()
  const x = Math.min(Math.max(8, pDrag.x + dx), sr.width - e.currentTarget.offsetWidth - 8)
  const y = Math.min(Math.max(8, pDrag.y + dy), sr.height - e.currentTarget.offsetHeight - 8)
  pipStyle.value = { right: 'auto', left: x + 'px', top: y + 'px' }
}
function pipUp() {
  if (pDrag && !pDrag.moved) setView(currentView.value === 'share' ? 'teacher' : 'share')
  pDrag = null
}

/* ---------- chat sheet ---------- */
const sheetOpen = ref(false)
const sheetStyle = ref({})
const chatRef = ref(null)
const peek = 122
let sDrag = null

function sheetDown(e) { sDrag = { y: e.clientY, moved: false }; e.currentTarget.setPointerCapture(e.pointerId) }
function sheetMove(e) {
  if (!sDrag) return
  const dy = e.clientY - sDrag.y
  if (Math.abs(dy) > 6) sDrag.moved = true
  if (!sDrag.moved) return
  const base = chatRef.value.offsetHeight - peek
  const ty = sheetOpen.value ? Math.max(0, dy) : Math.min(base, base + dy)
  sheetStyle.value = { transition: 'none', transform: `translateY(${ty}px)` }
}
function sheetUp(e) {
  if (!sDrag) return
  const dy = e.clientY - sDrag.y
  sheetStyle.value = {}
  if (!sDrag.moved) sheetOpen.value = !sheetOpen.value
  else if (dy < -40) sheetOpen.value = true
  else if (dy > 40) sheetOpen.value = false
  sDrag = null; buzz(8)
}

/* ---------- chat tabs / messages / AI ---------- */
const currentTab = ref('class')
const chatInput = ref('')
const peekPreview = ref('You: Sharing my notes in a sec!')
const aiTyping = ref(false)
const unread = reactive({ class: 0, ai: 0 })
const emojis = ['😀', '', '❤️', '']
const classBoxRef = ref(null), aiBoxRef = ref(null)
const placeholder = computed(() => currentTab.value === 'class' ? 'Message the class…' : 'Ask the AI tutor…')

const classMessages = ref([
  { key: 'seed-teacher', kind: 'teacher', name: 'Teacher', text: 'Welcome everyone! Ask questions here - your whole cohort sees them live.' }
])
const aiMessages = ref([
  { kind: 'ai', text: "Hi! I'm your AI teacher (Nemotron via NVIDIA Build). Ask me anything about today's YouTube lesson — and if you share your screen, I can see it and help with what's on it." }
])
const previewNames = { you: 'You', teacher: 'Teacher', ai: 'AI Tutor', other: 'Classmate' }

/* ---------- live classroom: cohort presence + chat + synced lesson ---------- */
const me = reactive({ id: '', name: '', hue: 210 })
const roster = ref([])
const chatOpen = ref(false)
// (role/props/isTeacher moved above the CLASS-START GATE — they must exist
// before classStarted's eager watch() reads isTeacher.value.)
const voiceApproved = ref(false)
const voiceRequested = ref(false)
const remoteStreams = ref([])
const remoteScreenIds = new Set()
const peers = new Map()
const remoteVideoEls = new Map()
let pingInt = null
let stopStream = null
let applyingRemoteLesson = false
let lastLessonKey = ''
const seenMsgIds = new Set()
const visibleRoster = computed(() => roster.value.slice(0, 4))
const raisedCount = computed(() => roster.value.filter(p => p.raised).length)
const voiceRequests = computed(() => roster.value.filter(p => p.role === 'student' && p.voice_requested))
/* Every participant who is currently sharing a screen, as selectable tiles.
   Each entry carries the remote stream id (e.g. `${peerId}:screen`), so the
   tile preview and the selected viewer can both bind the same <video>. */
const studentScreenStreamers = computed(() =>
  remoteStreams.value
    .filter(r => r.kind === 'screen')
    .map(r => ({ id: r.id, peerId: r.peerId, name: r.name, stream: r.stream }))
)
// Students currently in this classroom (the teacher's own entry is excluded).
// Shown on the teacher's live screen monitor so the class size is always visible.
const classroomCount = computed(() =>
  roster.value.filter(p => p.role !== 'teacher').length)

function studentNameFor(streamId) {
  const remote = remoteStreams.value.find(r => r.id === streamId)
  if (remote && remote.name) return remote.name
  const peerId = String(streamId || '').split(':')[0]
  const p = participantById(peerId)
  return p?.name || 'Student'
}
watch(voiceApproved, approved => {
  if (approved && !isTeacher.value && !microphoneStream.value) startMicrophone().catch(error => { videoError.value = error.message })
  if (!approved && microphoneStream.value) stopMicrophone()
})
const normRoom = (c) => String(c || '').trim().toLowerCase()

function initialsOf(name) {
  return String(name || '?').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
}
function pushServerMessage(m) {
  // Quiz mode: the realtime group chat is COMPLETELY shut down — incoming
  // cohort messages are dropped on the floor until the quiz is finished.
  if (chatLocked.value) return
  if (!m || !m.id || seenMsgIds.has(m.id)) return
  seenMsgIds.add(m.id)
  if (seenMsgIds.size > 600) {
    seenMsgIds.clear()
    classMessages.value.forEach(x => x.key && seenMsgIds.add(x.key))
  }
  if (m.kind === 'system') {
    classMessages.value.push({ key: m.id, kind: 'system', text: m.text })
    nextTick(() => scrollBox('class'))
    return
  }
  const kind = m.pid === me.id ? 'you' : (m.name === 'Teacher' ? 'teacher' : 'other')
  classMessages.value.push({
    key: m.id, kind, text: m.text, name: m.name,
    initial: String(m.name || '?')[0].toUpperCase(), hue: m.hue ?? 330
  })
  peekPreview.value = (kind === 'you' ? 'You' : (m.name || 'Classmate')) + ': ' + m.text
  if (currentTab.value !== 'class') unread.class++
  nextTick(() => scrollBox('class'))
}
async function initLiveClassroom() {
  // 1) Identity + course come from boirsu records FIRST (via boi_student_id),
  //    so the Apify YouTube search below runs for the right course without
  //    anyone typing anything. URL/localStorage were only fallbacks above.
  const sid = localStorage.getItem('boi_student_id') || ''
  if (sid) {
    const s = await getStudent(sid).catch(() => null)
    if (s) {
      if (!me.name) me.name = s.name || ''
      if (!roomCourse.value) roomCourse.value = s.career_path || ''
    }
  }
  if (!roomCourse.value) roomCourse.value = localStorage.getItem('boi_career_path') || ''
  // The teacher signs in via TeacherClassroomGate — that real name wins over
  // the student-record / guest fallbacks below.
  if (isTeacher.value && props.displayName) me.name = props.displayName
  if (!me.name) {
    const handle = (localStorage.getItem('boi_student_email') || '').split('@')[0]
    me.name = handle || ('Guest-' + Math.random().toString(36).slice(2, 6))
  }
  me.hue = [...me.name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  if (!roomCourse.value) roomCourse.value = 'Biology 101'
  // 2) Join this course's cohort room (sized for 20-30 seats; closed tabs
  //    stop pinging and are swept server-side after 45s).
  try {
    const res = await joinClassroom({ course: roomCourse.value, name: me.name, studentId: sid, role: requestedRole })
    if (!res || !res.you) throw new Error('join failed')
    me.id = res.you.id
    me.name = res.you.name || me.name
    me.hue = res.you.hue ?? me.hue
    roster.value = res.participants || []
    const self = roster.value.find(participant => participant.id === me.id)
    voiceRequested.value = !!self?.voice_requested
    voiceApproved.value = isTeacher.value || !!self?.voice_approved
    chatOpen.value = !!res.chat_open
    roomLive.value = res.live || null
    ;(res.messages || []).forEach(pushServerMessage)
    if (res.lesson && res.lesson.video) applyRemoteLesson(res.lesson.video)
    // A student joining mid-broadcast lands straight on the live teacher video.
    if (!isTeacher.value && res.live?.active) {
      currentView.value = 'teacher'
      lessonPip.value = false
      lessonBigOnShare.value = true
    }
  } catch {
    classMessages.value.push({ key: 'off-' + Date.now(), kind: 'system', text: 'Live sync unavailable — running in offline demo mode.' })
  }
  // 3) Live fan-out over the existing SSE hub + 15s presence heartbeat.
  stopStream = subscribe(onLiveEvent)
  pingInt = setInterval(sendPing, 15000)
}
function sendPing() {
  if (!me.id) return
  // cam/mic ride along so every peer knows who has video/audio on — that is
  // what draws the participant tiles before any track has arrived.
  pingClassroom(roomCourse.value, me.id, {
    raised: raised.value, sharing: sharing.value,
    cam: camOn.value, mic: micOn.value
  }).catch(() => {})
}
function onLiveEvent(evt) {
  const { event, data } = evt || {}
  if (!data || normRoom(data.room) !== normRoom(roomCourse.value)) return
  if (event === 'classroom_chat') pushServerMessage(data)
  else if (event === 'classroom_roster') {
    roster.value = data.participants || []
    const self = roster.value.find(participant => participant.id === me.id)
    voiceRequested.value = !!self?.voice_requested
    voiceApproved.value = isTeacher.value || !!self?.voice_approved
  }
  else if (event === 'classroom_lesson') applyRemoteLesson(data.video)
  else if (event === 'classroom_quiz') applyRemoteQuiz(data)
  else if (event === 'classroom_signal' && data.target === me.id) handleSignal(data)
  else if (event === 'classroom_live') {
    // The teacher went on/off air. Students jump straight to (or away from)
    // the live teacher video; the system chat line already comes from the
    // server, so only the local view has to move.
    const wasLive = teacherLive.value
    roomLive.value = data.live || null
    if (!isTeacher.value) {
      if (data.active) {
        currentView.value = 'teacher'
        lessonPip.value = false
        lessonBigOnShare.value = true
        if (!wasLive) buzz(30)
      } else if (wasLive) {
        currentView.value = 'share'
      }
    }
  }
  else if (event === 'classroom_chat_permission') {
    chatOpen.value = !!data.chat_open
    classMessages.value.push({ key: 'chatperm-' + Date.now(), kind: 'system',
      text: data.chat_open
        ? '💬 Class chat is open — everyone in the cohort can send messages.'
        : '🔒 The teacher closed the class chat.' })
  }
}

async function toggleChatPermission() {
  const next = !chatOpen.value
  // Optimistically flip the toggle right away so the teacher ALWAYS sees the
  // button respond — even when the live backend (api_server.py :5055) is
  // unreachable and the classroom is running in offline demo mode.
  chatOpen.value = next
  const result = await setClassroomChatPermission(roomCourse.value, me.id, next)
  if (result) chatOpen.value = !!result.chat_open
  const note = chatOpen.value
    ? '💬 Live chat is now ENABLED — everyone can talk.'
    : '🔇 Live chat is now DISABLED by the teacher.'
  const offline = result ? '' : '  (Live sync offline — this change applies locally until the backend reconnects.)'
  classMessages.value.push({ key: 'chat-toggle-' + Date.now(), kind: 'system', text: note + offline })
  buzz(15)
}

async function toggleVoiceRequest() {
  if (voiceApproved.value) return
  const result = await requestClassroomVoice(roomCourse.value, me.id, !voiceRequested.value)
  if (result) voiceRequested.value = !!result.voice_requested
}

async function decideVoice(studentPid, approved) {
  await setClassroomVoicePermission(roomCourse.value, me.id, studentPid, approved)
}

function setRemoteVideo(el, id) {
  if (!el) return
  remoteVideoEls.set(id, el)
  const remote = remoteStreams.value.find(item => item.id === id)
  if (remote) { el.srcObject = remote.stream; el.play?.().catch(() => {}) }
}
function participantById(id) { return roster.value.find(p => p.id === id) }
async function sendSignal(target, kind, payload) {
  await signalClassroom({ course: roomCourse.value, sender: me.id, target, kind, payload })
}
/* ---------- WebRTC mesh -------------------------------------------------
   Every participant connects to every OTHER participant (a full mesh), so
   teacher<->student AND student<->student video/audio flow in real time.
   Media goes peer-to-peer; only SDP + ICE setup ride the classroom SSE relay.

   The SSE relay gives no ordering guarantee, so three things are handled here:
     1. ICE candidates that arrive before their offer/answer are QUEUED, not
        dropped — the old code called removePeer() on that error, which killed
        the connection for good.
     2. Negotiation uses the browser's own offer/rollback ("perfect
        negotiation") so two simultaneous offers cannot strand a link.
     3. A failed link is rebuilt automatically instead of staying dead.
*/
const pendingIce = new Map()      // peerId -> RTCIceCandidateInit[]
const remoteReady = new Set()     // peerIds whose remote description is applied
const peerFlags = new Map()       // peerId -> {polite, makingOffer}
const reconnectTimers = new Map() // peerId -> timeout id

function flushIce(id) {
  if (!remoteReady.has(id)) return
  const peer = peers.get(id)
  const queued = pendingIce.get(id) || []
  pendingIce.set(id, [])
  if (!peer) return
  queued.forEach(candidate => { peer.addIceCandidate(candidate).catch(() => {}) })
}

function removePeer(id) {
  const peer = peers.get(id)
  if (peer) { try { peer.close() } catch { /* already closed */ } }
  peers.delete(id)
  peerFlags.delete(id)
  pendingIce.delete(id)
  remoteReady.delete(id)
  const timer = reconnectTimers.get(id)
  if (timer) { clearTimeout(timer); reconnectTimers.delete(id) }
  remoteVideoEls.forEach((el, key) => {
    if (String(key).split(':')[0] === id) { el.srcObject = null; remoteVideoEls.delete(key) }
  })
  remoteStreams.value = remoteStreams.value.filter(item => item.peerId !== id)
  remoteScreenIds.delete(id)
  if (String(selectedStudentScreen.value).split(':')[0] === id) selectedStudentScreen.value = ''
}

/* A dropped link is rebuilt from scratch after a short pause. Without this a
   Wi-Fi blip, a tab waking from sleep or a failed ICE pass left two
   participants permanently unable to see each other — the old code removed
   the peer and only ever recreated it if the roster happened to change. */
function scheduleReconnect(id) {
  if (reconnectTimers.has(id)) return
  if (!roster.value.some(p => p.id === id)) return
  reconnectTimers.set(id, setTimeout(() => {
    reconnectTimers.delete(id)
    if (!roster.value.some(p => p.id === id)) return
    removePeer(id)
    connectToParticipants()
  }, 2000))
}

function rebuildPeerTracks() {
  peers.forEach(peer => {
    peer.getSenders().forEach(sender => { if (sender.track) peer.removeTrack(sender) })
    cameraStream.value?.getTracks().forEach(track => peer.addTrack(track, cameraStream.value))
    microphoneStream.value?.getTracks().forEach(track => peer.addTrack(track, microphoneStream.value))
    screenStream.value?.getTracks().forEach(track => peer.addTrack(track, screenStream.value))
  })
}
function createPeer(id) {
  if (peers.has(id)) return peers.get(id)
  const peer = new RTCPeerConnection({
    // A public STUN server is enough for peers on ordinary home/office
    // networks. Add a TURN server here for strict / symmetric NATs.
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    // One bundle keeps a peer's camera, mic and screen on a single transport.
    bundlePolicy: 'max-bundle'
  })
  peers.set(id, peer)
  // Perfect negotiation needs exactly one "polite" side per pair; both sides
  // compare the same two ids, so they always agree on who yields.
  peerFlags.set(id, { polite: me.id > id, makingOffer: false })
  cameraStream.value?.getTracks().forEach(track => peer.addTrack(track, cameraStream.value))
  microphoneStream.value?.getTracks().forEach(track => peer.addTrack(track, microphoneStream.value))
  screenStream.value?.getTracks().forEach(track => peer.addTrack(track, screenStream.value))

  // Let the browser write the offer (setLocalDescription with no argument).
  // The old hand-rolled createOffer() path returned early whenever the
  // signaling state was not 'stable' — exactly the case when a camera, mic or
  // screen is switched on after the first handshake — so the new track never
  // reached the other side.
  peer.onnegotiationneeded = async () => {
    const flags = peerFlags.get(id)
    if (!flags) return
    try {
      flags.makingOffer = true
      await peer.setLocalDescription()
      await sendSignal(id, 'offer', peer.localDescription.toJSON())
    } catch { /* a newer negotiation superseded this one */ }
    finally { flags.makingOffer = false }
  }
  peer.onicecandidate = event => {
    if (event.candidate) sendSignal(id, 'ice', event.candidate.toJSON()).catch(() => {})
  }
  // Tiles are keyed by the media stream's own id, so a peer that publishes a
  // camera AND a screen keeps two separate tiles. The old code keyed by a
  // guess, so a screen share arriving before its announcement overwrote the
  // camera tile and the student vanished from the video wall.
  peer.ontrack = event => {
    const stream = event.streams && event.streams[0]
    if (!stream) return
    const entry = remoteStreams.value.find(item => item.streamId === stream.id)
    if (entry) { entry.stream = stream }
    else {
      remoteStreams.value.push({
        id: `${id}:${stream.id}`, streamId: stream.id, peerId: id,
        kind: remoteScreenIds.has(id) ? 'screen' : 'camera',
        name: participantById(id)?.name || 'Classmate', stream
      })
    }
    nextTick(() => {
      const tile = remoteStreams.value.find(item => item.streamId === stream.id)
      const el = tile && remoteVideoEls.get(tile.id)
      if (el) { el.srcObject = stream; el.play?.().catch(() => {}) }
    })
  }
  peer.onconnectionstatechange = () => {
    // 'disconnected' is usually transient — ICE frequently recovers on its
    // own, so only 'failed' triggers a rebuild. Tearing down on 'disconnected'
    // (as the old code did) killed links that were about to come back.
    if (peer.connectionState === 'failed') { removePeer(id); scheduleReconnect(id) }
    else if (peer.connectionState === 'closed') removePeer(id)
  }
  return peer
}
function connectToParticipants() {
  if (!window.RTCPeerConnection || !me.id) return
  roster.value.filter(p => p.id !== me.id).forEach(p => {
    if (!reconnectTimers.has(p.id)) createPeer(p.id)
  })
}
async function handleSignal(data) {
  if (!window.RTCPeerConnection || data.sender === me.id) return
  if (data.kind === 'screen-state') {
    if (data.payload?.active) {
      remoteScreenIds.add(data.sender)
      // The screen stream can beat its own announcement here. A peer whose
      // roster camera is off cannot have published a camera, so re-label that
      // tile as the screen it really is.
      if (!participantById(data.sender)?.cam) {
        remoteStreams.value
          .filter(item => item.peerId === data.sender && item.kind === 'camera')
          .forEach(item => { item.kind = 'screen' })
      }
    } else {
      remoteScreenIds.delete(data.sender)
    }
    return
  }
  const peer = createPeer(data.sender)
  const flags = peerFlags.get(data.sender)
  try {
    if (data.kind === 'offer' || data.kind === 'answer') {
      const description = data.payload
      // Perfect negotiation: an offer that collides with one of ours is only
      // ignored by the impolite side; the polite side accepts it (the browser
      // implicitly rolls our offer back).
      const collision = description.type === 'offer'
        && (flags?.makingOffer || peer.signalingState !== 'stable')
      if (collision && !flags?.polite) return
      await peer.setRemoteDescription(description)
      remoteReady.add(data.sender)
      flushIce(data.sender)
      if (description.type === 'offer') {
        await peer.setLocalDescription()
        await sendSignal(data.sender, 'answer', peer.localDescription.toJSON())
      }
    } else if (data.kind === 'ice') {
      // Queue candidates that arrive before the SDP they belong to. Throwing
      // here (the old behaviour) destroyed a connection that was working.
      if (!remoteReady.has(data.sender)) {
        const queue = pendingIce.get(data.sender) || []
        queue.push(data.payload)
        pendingIce.set(data.sender, queue)
        return
      }
      await peer.addIceCandidate(data.payload)
    }
  } catch {
    // A genuinely broken handshake gets rebuilt rather than abandoned.
    removePeer(data.sender)
    scheduleReconnect(data.sender)
  }
}
watch(roster, (nextRoster) => {
  const ids = new Set(nextRoster.map(p => p.id))
  peers.forEach((_, id) => { if (!ids.has(id)) removePeer(id) })
  connectToParticipants()
})
function videoKey(v) {
  return String((v && (v.url || v.watch_url || v.embed_url || v.id)) || '')
}
function applyRemoteLesson(video) {
  if (video) remoteLessonActive.value = true // a published lesson means the class has started
  if (!video || videoKey(video) === videoKey(selectedLessonVideo.value)) return
  applyingRemoteLesson = true
  selectedLessonVideo.value = {
    title: video.title || '', url: video.url || video.watch_url || '',
    embed_url: video.embed_url || '', thumbnail: video.thumbnail || '',
    watch_url: video.url || video.watch_url || ''
  }
  currentView.value = 'teacher'
  nextTick(() => { applyingRemoteLesson = false })
}
// Whoever picks a lesson video shares it with the whole cohort instantly.
watch(selectedLessonVideo, (v) => {
  if (!v || applyingRemoteLesson || !me.id) return
  const k = videoKey(v)
  if (!k || k === lastLessonKey) return
  lastLessonKey = k
  publishClassroomLesson(roomCourse.value, me.id, {
    title: v.title || '', url: v.url || v.watch_url || '',
    embed_url: v.embed_url || '', thumbnail: v.thumbnail || ''
  }).catch(() => {})
})

function scrollBox(target) {
  const el = target === 'ai' ? aiBoxRef.value : classBoxRef.value
  if (el) el.scrollTop = el.scrollHeight
}
function setTab(tab) {
  currentTab.value = tab; buzz(8)
  unread[tab] = 0
  nextTick(() => scrollBox(tab))
}
function addMsg(kind, text, target) {
  (target === 'ai' ? aiMessages : classMessages).value.push({ kind, text })
  peekPreview.value = previewNames[kind] + ': ' + text
  if (currentTab.value !== target) unread[target]++
  nextTick(() => scrollBox(target))
}
function sendMessage() {
  const v = chatInput.value.trim()
  if (!v) return
  if (isMobile() && !sheetOpen.value) sheetOpen.value = true
  if (currentTab.value === 'class') sendChat(v)
  else { addMsg('you', v, 'ai'); aiReply(v) }
  chatInput.value = ''
}
async function sendChat(text) {
  if (chatLocked.value) return // quiz mode: no outgoing class messages either
  // Optimistic local bubble; the server fans the message out to the cohort.
  addMsg('you', text, 'class')
  try { await sayToClassroom(roomCourse.value, me.id, text) } catch { /* offline demo keeps the local bubble */ }
}
function aiAnswer(q) {
  const s = q.toLowerCase()
  if (s.includes('ribosome')) return 'Ribosomes are the protein builders of the cell — they translate mRNA into polypeptide chains. 🧬'
  if (s.includes('mitochondria')) return 'Mitochondria produce ATP through cellular respiration — the “powerhouse” of the cell. ⚡'
  if (s.includes('nucleus')) return 'The nucleus stores DNA and coordinates cell activities like growth and reproduction.'
  if (s.includes('quiz')) return 'Tip: ribosome = protein synthesis. That one loves showing up on quizzes 😉'
  const g = ["Great question! Focus on each organelle's function.", "Check the teacher's lesson — step 3 covers translation.", 'Which organelle are you asking about? I can help!']
  return g[Math.floor(Math.random() * g.length)]
}
function aiReply(q) {
  aiTyping.value = true
  buzz(8)
  nextTick(() => scrollBox('ai'))
  askClassroomTutor({
    question: q,
    lesson: currentLessonContext(),
    history: recentAiHistory(),
    image: (sharing.value && screenStream.value) ? grabScreenFrame() : undefined
  }).then(res => {
    // Backend down / key missing -> keep the canned demo answers alive so a
    // dead backend never blanks the AI tab (same rule as aiClient.js).
    const answer = res?.answer || aiAnswer(q)
    aiTyping.value = false
    addMsg('ai', answer, 'ai')
  })
}

/* --- grounding: what the AI teacher can currently see --- */
function currentLessonContext() {
  const v = selectedLessonVideo.value
  if (!v) return null
  return {
    topic: lessonTopic,
    title: v.title || '',
    channel: v.channel || '',
    url: v.watch_url || v.url || v.embed_url || '',
    duration_display: v.duration_display || ''
  }
}
function recentAiHistory() {
  return aiMessages.value.slice(-8).map(m => ({
    role: m.kind === 'you' ? 'user' : 'assistant',
    content: m.text
  }))
}

// Hidden <video> tap on the live screen stream so each question can grab a
// fresh snapshot of exactly what the student is sharing right now.
let captureVideoEl = null
function ensureCaptureVideo() {
  if (!captureVideoEl) {
    captureVideoEl = document.createElement('video')
    captureVideoEl.muted = true
    captureVideoEl.playsInline = true
    Object.assign(captureVideoEl.style, { position: 'fixed', width: '2px', height: '2px', opacity: '0', pointerEvents: 'none' })
    document.body.appendChild(captureVideoEl)
  }
  if (captureVideoEl.srcObject !== screenStream.value) captureVideoEl.srcObject = screenStream.value
  if (captureVideoEl.paused) captureVideoEl.play().catch(() => {})
  return captureVideoEl
}
function grabScreenFrame() {
  try {
    const video = ensureCaptureVideo()
    if (!screenStream.value || !video.videoWidth || !video.videoHeight) return ''
    const scale = Math.min(1, 1280 / video.videoWidth)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.7).split(',')[1] || ''
  } catch { return '' }
}
function releaseCaptureVideo() {
  if (captureVideoEl) {
    captureVideoEl.srcObject = null
    captureVideoEl.remove()
    captureVideoEl = null
  }
}

/* ---------- end-of-video AI quiz ----------
   The moment the lesson video ENDS, the AI tutor builds a fresh multiple-
   choice quiz strictly from that video's transcript (/api/ai/classroom/quiz).
   While a run is live (launched -> done) the realtime class chat is COMPLETELY
   shut down: chatLocked hides the Class Chat tab, drops incoming cohort
   messages, and blocks anything outgoing. */
const QUIZ_REQUEST_COUNT = 12   // ask for 12 so a weak question still leaves >=10
const QUIZ_MIN_QUESTIONS = 10   // hard floor: at least ten questions, always
const QUESTION_SECONDS = 30

const quiz = reactive({
  launched: false, open: false, unlocked: false,
  phase: 'idle',            // idle -> generating -> active -> done
  questions: [], index: 0,
  picked: null, revealed: false, lastCorrect: false, feedbackText: '',
  score: 0, sec: QUESTION_SECONDS,
  toastTitle: '', toastSub: ''
})
const toastShown = ref(false)
const warn = ref(false)
let quizInt = null

const chatLocked = computed(() => (quiz.launched && !quiz.unlocked) || (!isTeacher.value && !chatOpen.value))
const quizTime = computed(() => fmt(Math.max(0, quiz.sec)))
const currentQuestion = computed(() => quiz.questions[quiz.index] || null)
const progressPct = computed(() => quiz.questions.length ? Math.round((quiz.index / quiz.questions.length) * 100) : 0)
const quizHead = computed(() => quiz.phase === 'done' ? 'Quiz Complete 🏁' : (quiz.customTitle ? '📝 ' + quiz.customTitle : '🤖 AI Video Quiz'))
const quizSub = computed(() => {
  if (quiz.phase === 'generating') return 'Writing questions from today’s video…'
  if (quiz.phase === 'active') return `Question ${quiz.index + 1} of ${quiz.questions.length}`
  return `${quiz.score} of ${quiz.questions.length} correct`
})
const scoreMessage = computed(() => {
  const pct = quiz.score / Math.max(1, quiz.questions.length)
  if (pct >= 0.8) return 'Outstanding! You clearly paid attention to this lesson. 🌟'
  if (pct >= 0.5) return 'Good work! Rewatch the tricky parts to sharpen up. 💪'
  return 'Keep going — rewatch the lesson and try again anytime.'
})
function optionLabel(i) { return String.fromCharCode(65 + i) + '.' }

/* --- realtime chat shutdown while the quiz runs --- */
function lockClassChat() {
  if (currentTab.value === 'class') currentTab.value = 'ai' // force students onto the AI tab
  unread.class = 0
  classMessages.value.push({ key: 'lock-' + Date.now(), kind: 'system', text: '🔒 Quiz time! Class chat is locked until you finish.' })
}
function unlockClassChat() {
  if (!chatLocked.value) return
  quiz.unlocked = true
  classMessages.value.push({ key: 'unlock-' + Date.now(), kind: 'system', text: '💬 Quiz finished — class chat is back!' })
}
function showToast(title, sub, ms = 6000) {
  quiz.toastTitle = title; quiz.toastSub = sub
  toastShown.value = true
  setTimeout(() => { toastShown.value = false }, ms)
}

/* --- launch + generation --- */
function launchQuiz() {
  if (chatLocked.value || quiz.phase === 'generating') return
  buzz(30)
  quiz.launched = true; quiz.unlocked = false
  quiz.phase = 'generating'; quiz.open = true
  quiz.customTitle = ''   // video-end quiz uses the default AI heading, not a teacher-set title
  quiz.questions = []; quiz.index = 0; quiz.score = 0
  quiz.picked = null; quiz.revealed = false; quiz.feedbackText = ''
  lockClassChat()
  showToast('🎬 Lesson finished!', 'The AI is setting your quiz — class chat paused.')
  generateQuizQuestions()
}

async function generateQuizQuestions() {
  let qs = []
  const res = await generateLessonQuiz({ lesson: currentLessonContext(), count: QUIZ_REQUEST_COUNT })
  if (res && Array.isArray(res.questions)) qs = normalizeQuestions(res.questions)
  if (qs.length < QUIZ_MIN_QUESTIONS) {
    // Backend unreachable or a thin response -> offline practice set keeps the
    // "at least ten questions" rule alive (same fallback philosophy as aiClient.js).
    qs = fallbackQuestions()
  }
  quiz.questions = qs.slice(0, QUIZ_REQUEST_COUNT)
  quiz.phase = 'active'; quiz.sec = QUESTION_SECONDS
  showToast('📝 Your AI quiz is ready!', `${quiz.questions.length} questions from today's video.`)
  if (quiz.open) startQuestionTimer()
  else openQuiz() // nobody should miss it
}

function normalizeQuestions(raw) {
  const out = []
  for (const q of raw || []) {
    const opts = Array.isArray(q?.options) ? q.options.map(o => String(o)).filter(Boolean) : []
    if (!q?.q || opts.length < 2) continue
    let ans = Number(q?.answer)
    if (!Number.isInteger(ans) || ans < 0 || ans >= opts.length) ans = 0
    out.push({ q: String(q.q), options: opts.slice(0, 4), answer: ans, why: String(q?.why || '') })
  }
  return out
}

/* Offline/demo fallback: ten comprehension questions framed around whatever
   lesson just played. Only shown when the AI/backend cannot answer. */
function fallbackQuestions() {
  const title = String(selectedLessonVideo.value?.title || roomCourse.value || 'this lesson').replace(/\s+/g, ' ').trim().slice(0, 90)
  const topic = roomCourse.value || 'the course topic'
  return [
    { q: `What was the main subject of the lesson video you just watched ("${title}")?`, options: ['A cooking recipe', 'A travel vlog', `The key ideas of ${topic}`, 'A music playlist'], answer: 2, why: `Today's session streamed this lesson for ${topic}.` },
    { q: 'When is the best time to take notes while watching a lesson video?', options: ['Never — notes are a distraction', 'Throughout, pausing at key explanations', 'Only after deleting the video', 'Only if someone forces you'], answer: 1, why: 'Active note-taking during the video boosts recall.' },
    { q: 'What is the best first move right after a lesson video ends?', options: ['Close everything immediately', 'Test yourself on what was just covered', 'Start an unrelated show', 'Clear your browser history'], answer: 1, why: 'Immediate self-testing (like this quiz) strengthens memory.' },
    { q: 'Which of these best describes "active watching"?', options: ['Playing it muted while gaming', 'Letting it autoplay overnight', 'Watching at 3x speed without sound', 'Pausing, rewinding and noting key points'], answer: 3, why: 'Engaging with the content beats passive playback.' },
    { q: 'You missed one explanation in the video. What should you do?', options: ['Rewind and rewatch that part', 'Skip it forever', 'Guess on every future question', 'Blame your Wi-Fi'], answer: 0, why: 'Rewinding fills the exact gap you noticed.' },
    { q: 'Why does a quiz come right after the video finishes?', options: ['To punish students', 'To check what you learned while it is still fresh', 'Because videos are too short', 'To collect email addresses'], answer: 1, why: 'Testing immediately after learning improves retention.' },
    { q: 'Which study habit helps knowledge stick longest?', options: ['One giant cram session', 'Avoiding all reviews', 'Short spaced reviews over several days', 'Reading notes once and hoping'], answer: 2, why: 'Spaced repetition beats cramming for long-term memory.' },
    { q: 'If you get stuck on a question in this classroom, who can help?', options: ['Nobody at all', 'Only a tutor abroad', 'The AI tutor in the AI Chat tab', 'The scrollbar'], answer: 2, why: 'The AI tutor saw the same lesson and can explain any part.' },
    { q: 'What should you do before starting the next lesson?', options: ['Forget everything from this one', 'Quickly review your notes from this lesson', 'Watch random videos instead', 'Reset your progress'], answer: 1, why: 'A quick review links new material to what you already know.' },
    { q: 'What is the best way to remember key terms from the video?', options: ['Read them once and hope', 'Avoid using them', 'Memorize only their first letters', 'Say or write them in your own words and revisit them'], answer: 3, why: 'Restating ideas in your own words locks them in.' }
  ]
}

/* --- per-question flow --- */
function startQuestionTimer() {
  stopQuestionTimer()
  quiz.sec = QUESTION_SECONDS
  quizInt = setInterval(() => {
    quiz.sec--
    if (quiz.sec <= 0) revealAnswer(null) // timed out
  }, 1000)
}
function stopQuestionTimer() { if (quizInt) { clearInterval(quizInt); quizInt = null } }

const openQuiz = () => {
  quiz.open = true
  if (isMobile()) sheetOpen.value = false
  buzz(8)
  if (quiz.phase === 'active' && !quiz.revealed && !quizInt) startQuestionTimer()
}
const openQuizFromToast = () => { toastShown.value = false; openQuiz() }
const closeQuiz = () => { quiz.open = false }

function pick(i) {
  if (quiz.revealed) return
  quiz.picked = i; buzz(8)
}
function submitAnswer() {
  const cur = currentQuestion.value
  if (!cur || quiz.revealed) return
  if (quiz.picked == null) { warn.value = true; setTimeout(() => warn.value = false, 500); return }
  revealAnswer(quiz.picked)
}
function revealAnswer(pickedIdx) {
  const cur = currentQuestion.value
  if (!cur || quiz.revealed) return
  stopQuestionTimer()
  quiz.revealed = true
  const correct = pickedIdx === cur.answer
  if (correct) quiz.score++
  quiz.lastCorrect = correct
  const letter = optionLabel(cur.answer)
  quiz.feedbackText = pickedIdx == null
    ? `⏱ Time's up — the answer was ${letter} ${cur.options[cur.answer]}.${cur.why ? ' ' + cur.why : ''}`
    : correct
      ? `✅ Correct!${cur.why ? ' ' + cur.why : ''}`
      : `❌ Not quite — the answer is ${letter} ${cur.options[cur.answer]}.${cur.why ? ' ' + cur.why : ''}`
  buzz(correct ? 20 : 40)
}
function nextQuestion() {
  if (quiz.index < quiz.questions.length - 1) {
    quiz.index++; quiz.picked = null; quiz.revealed = false
    startQuestionTimer(); buzz(8)
  } else {
    finishQuiz()
  }
}
function finishQuiz() {
  stopQuestionTimer()
  quiz.phase = 'done'
  unlockClassChat() // quiz section over -> realtime group chat comes back
  buzz(30)
}

/* ---------- controls / reactions ---------- */
const micOn = ref(true), camOn = ref(false), sharing = ref(false), raised = ref(false)
const floats = ref([])
async function startScreenShare() {
  // Guard: never two captures at once — stop any previous stream first.
  if (screenStream.value) stopScreenShare()
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('Screen sharing is not supported by this browser.')
  }
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      displaySurface: 'window',
      selfBrowserSurface: 'exclude',   // the picker itself hides this classroom tab
      surfaceSwitching: 'include'
    },
    audio: true
  })
  const track = stream.getVideoTracks()[0]
  screenStream.value = stream
  sharing.value = true
  videoError.value = ''
  await attachScreenStream()
  peers.forEach((peer, id) => {
    sendSignal(id, 'screen-state', { active: true }).catch(() => {})
    stream.getTracks().forEach(track => peer.addTrack(track, stream))
  })
  track.addEventListener('ended', stopScreenShare, { once: true })

  // Meet-style guidance: sharing the ENTIRE screen captures this page too.
  const surface = track?.getSettings?.().displaySurface || ''
  shareSurface.value = surface
  lessonBigOnShare.value = true   // default: lesson plays BIG, screen goes corner
  mirrorWarn.value = surface === 'monitor'
  clearTimeout(mirrorWarnTimer)
  if (mirrorWarn.value) {
    mirrorWarnTimer = setTimeout(() => { mirrorWarn.value = false }, 9000)
  }
}

// Wire the live capture into the on-screen <video>. Without this the stream
// existed but nothing ever rendered it — "My Screen" showed only status text.
async function attachScreenStream() {
  await nextTick()
  const el = screenVideoRef.value
  if (el && screenStream.value && el.srcObject !== screenStream.value) {
    el.srcObject = screenStream.value
    el.play?.().catch(() => {})
  }
}

watch(screenStream, (s) => {
  if (s) attachScreenStream()
  else if (screenVideoRef.value) screenVideoRef.value.srcObject = null
})

function stopScreenShare() {
  screenStream.value?.getTracks().forEach(track => track.stop())
  screenStream.value = null
  sharing.value = false
  if (screenVideoRef.value) screenVideoRef.value.srcObject = null
  peers.forEach((peer, id) => {
    peer.getSenders().filter(sender => sender.track?.kind === 'video' && sender.track !== cameraStream.value?.getVideoTracks?.()[0]).forEach(sender => peer.removeTrack(sender))
    sendSignal(id, 'screen-state', { active: false }).catch(() => {})
  })
  releaseCaptureVideo()
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera access is not supported by this browser.')
  }
  const stream = await navigator.mediaDevices.getUserMedia({ video: true })
  cameraStream.value = stream
  camOn.value = true
  await nextTick()
  if (cameraVideoRef.value) cameraVideoRef.value.srcObject = stream
  if (liveCameraVideoRef.value) liveCameraVideoRef.value.srcObject = stream
  peers.forEach(peer => stream.getTracks().forEach(track => peer.addTrack(track, stream)))
  connectToParticipants()
}

function stopCamera() {
  cameraStream.value?.getTracks().forEach(track => track.stop())
  cameraStream.value = null
  camOn.value = false
  peers.forEach(peer => peer.getSenders().filter(sender => sender.track?.kind === 'video').forEach(sender => peer.removeTrack(sender)))
}

async function startMicrophone() {
  if (!voiceApproved.value) return
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  microphoneStream.value = stream
  micOn.value = true
  peers.forEach(peer => stream.getTracks().forEach(track => peer.addTrack(track, stream)))
  connectToParticipants()
}

function stopMicrophone() {
  microphoneStream.value?.getTracks().forEach(track => track.stop())
  microphoneStream.value = null
  micOn.value = false
  peers.forEach(peer => peer.getSenders().filter(sender => sender.track?.kind === 'audio').forEach(sender => peer.removeTrack(sender)))
}

async function toggle(which) {
  buzz(8)
  if (which === 'mic') {
    if (!voiceApproved.value) { await toggleVoiceRequest(); return }
    try { if (microphoneStream.value) stopMicrophone(); else await startMicrophone() }
    catch (error) { videoError.value = error.message }
  }
  if (which === 'cam') {
    try {
      if (cameraStream.value) stopCamera()
      else await startCamera()
    } catch (error) {
      videoError.value = error.message
    }
  }
  if (which === 'share') {
    try {
      if (screenStream.value) stopScreenShare()
      else await startScreenShare()
    } catch (error) {
      videoError.value = error.message
    }
  }
  if (which === 'hand') raised.value = !raised.value
  // Push raised-hand / sharing / cam / mic state to the cohort immediately, so
  // everyone's participant tiles update without waiting for the next heartbeat.
  if (me.id && ['hand', 'share', 'cam', 'mic'].includes(which)) sendPing()
}
function react() {
  buzz(8)
  const f = { id: Date.now(), left: (15 + Math.random() * 70) + '%', char: ['👍', '❤️', '😂', '🎉', ''][Math.floor(Math.random() * 5)] }
  floats.value.push(f)
  setTimeout(() => { floats.value = floats.value.filter(x => x.id !== f.id) }, 2500)
}
const leave = () => alert('You left the session (demo)')

/* ---------- teacher lesson setup: Go Live vs AI Video ---------- */
function closeTeacherSetup() { teacherSetupOpen.value = false }
/* "Teacher's Lesson" button behavior:
   - Teacher : opens the setup popup (Go Live / AI Video Lesson).
   - Student : opens the lesson view directly (and restores it full-screen
               if it was floating in picture-in-picture / corner preview). */
function openTeacherSetup() {
  if (isTeacher.value) {
    teacherSetupOpen.value = true
  } else {
    currentView.value = 'teacher'
    lessonPip.value = false
    lessonBigOnShare.value = true
  }
}

/* ---------- teacher tools: upload PDF textbook / set quiz / give assignment ----------
   Every tool has a manual option FIRST and a MiroFish AI assist SECOND. */
const toolsOpen = ref(false)        // dedicated Teacher Tools popup
const teacherTool = ref('textbook') // active tab: 'textbook' | 'quiz' | 'assignment'
const pdfInputRef = ref(null)
const teacherPdf = reactive({ title: '', file: null, fileName: '', fileSize: 0, busy: false, msg: '', ok: false })
const teacherTb = reactive({ mode: 'pdf', aiTopic: '', aiBusy: false, msg: '', ok: false })
const teacherQuiz = reactive({
  title: '', busy: false, msg: '', ok: false,
  mode: 'manual',          // 'manual' first (teacher sets questions) | 'ai' second (MiroFish drafts)
  questions: [],           // the set being built — manual adds and AI drafts land here
  draft: { q: '', options: ['', '', '', ''], answer: 0, why: '' },
  aiTopic: '', aiCount: 10, aiBusy: false, aiMsg: '', aiOk: false
})
const teacherAsg = reactive({
  title: '', instructions: '', due: '', busy: false, msg: '', ok: false,
  aiTopic: '', aiBusy: false, aiMsg: '', aiOk: false
})
/* Weekly class timetable — manual rows first, MiroFish AI draft second */
const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const teacherTt = reactive({
  mode: 'manual', title: '', sessions: [],
  track: 'Weekday · evenings', durationMonths: 3, classMinutes: 60, startDate: '',
  aiBusy: false, aiMsg: '', aiOk: false, busy: false, msg: '', ok: false
})

function openTeacherTools() {
  buzz(10)
  toolsOpen.value = true
  if (!teacherTool.value) teacherTool.value = 'textbook'
}
function closeTeacherTools() { toolsOpen.value = false }
function pickToolTab(which) { teacherTool.value = which }

/* Clear the active form without closing the popup (the "Clear" buttons). */
function resetTeacherTool() {
  teacherPdf.msg = ''; teacherPdf.ok = false; teacherPdf.file = null; teacherPdf.title = ''
  teacherTb.aiTopic = ''; teacherTb.msg = ''; teacherTb.ok = false
  teacherQuiz.title = ''; teacherQuiz.questions = []; teacherQuiz.msg = ''; teacherQuiz.ok = false
  teacherQuiz.draft = { q: '', options: ['', '', '', ''], answer: 0, why: '' }
  teacherQuiz.aiTopic = ''; teacherQuiz.aiMsg = ''; teacherQuiz.aiOk = false
  teacherAsg.title = ''; teacherAsg.instructions = ''; teacherAsg.due = ''
  teacherAsg.aiTopic = ''; teacherAsg.aiMsg = ''; teacherAsg.aiOk = false
  teacherTt.title = ''; teacherTt.sessions = []
  teacherTt.aiMsg = ''; teacherTt.aiOk = false; teacherTt.msg = ''; teacherTt.ok = false
  if (pdfInputRef.value) pdfInputRef.value.value = ''
}

function onPdfPicked(e) {
  const f = e.target.files && e.target.files[0]
  if (!f) return
  if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) {
    teacherPdf.msg = 'That does not look like a PDF — please choose a .pdf file.'
    teacherPdf.ok = false
    return
  }
  teacherPdf.file = f
  teacherPdf.fileName = f.name
  teacherPdf.fileSize = f.size
  if (!teacherPdf.title.trim()) teacherPdf.title = f.name.replace(/\.pdf$/i, '')
  teacherPdf.msg = ''
  teacherPdf.ok = false
}

function base64FromBuffer(buf) {
  const bytes = new Uint8Array(buf)
  let bin = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK))
  }
  return btoa(bin)
}

async function uploadTextbook() {
  if (!teacherPdf.file) return
  teacherPdf.busy = true
  teacherPdf.msg = ''
  try {
    const buf = await teacherPdf.file.arrayBuffer()
    const res = await publishClassroomTextbook({
      course: roomCourse.value, pid: me.id,
      title: teacherPdf.title.trim() || teacherPdf.fileName,
      fileName: teacherPdf.fileName,
      fileSize: teacherPdf.fileSize,
      fileData: base64FromBuffer(buf)
    })
    if (res && res.success) {
      teacherPdf.msg = '✅ Published to the class library — students can download it now.'
      teacherPdf.ok = true
      classMessages.value.push({
        key: 'tb-' + Date.now(), kind: 'system',
        text: '📄 Teacher uploaded a textbook: "' + res.textbook.title + '" — check your Library.'
      })
      teacherPdf.file = null
      if (pdfInputRef.value) pdfInputRef.value.value = ''
    } else {
      teacherPdf.msg = 'Upload failed. Is the backend running (python api_server.py on :5055)?'
      teacherPdf.ok = false
    }
  } catch (err) {
    teacherPdf.msg = 'Upload failed — ' + (err.message || err)
    teacherPdf.ok = false
  } finally {
    teacherPdf.busy = false
  }
}

/* --- quiz builder — FIRST option: the teacher sets every question by hand --- */
const quizDraftReady = computed(() => {
  const d = teacherQuiz.draft
  return !!d.q.trim() && d.options.filter(o => o.trim()).length >= 2
})

function addQuizDraftQuestion() {
  const d = teacherQuiz.draft
  const kept = []
  d.options.forEach((o, i) => { if (o.trim()) kept.push(i) })
  if (!d.q.trim() || kept.length < 2) return
  const opts = kept.map(i => d.options[i].trim())
  const ans = Math.max(0, kept.indexOf(d.answer)) // re-map the ticked option after blanks are dropped
  teacherQuiz.questions.push({ q: d.q.trim(), options: opts, answer: ans, why: d.why.trim() })
  teacherQuiz.draft = { q: '', options: ['', '', '', ''], answer: 0, why: '' }
  buzz(8)
}

/* --- quiz builder — SECOND option: MiroFish AI drafts, the teacher reviews --- */
async function teacherGenerateQuizAI() {
  const topic = teacherQuiz.aiTopic.trim()
  if (!topic || teacherQuiz.aiBusy) return
  teacherQuiz.aiBusy = true
  teacherQuiz.aiMsg = '🤖 MiroFish AI is writing your questions…'
  teacherQuiz.aiOk = false
  const res = await generateLessonQuiz({ topic, count: teacherQuiz.aiCount })
  teacherQuiz.aiBusy = false
  const qs = res && Array.isArray(res.questions) ? normalizeQuestions(res.questions) : []
  if (qs.length) {
    teacherQuiz.questions = teacherQuiz.questions.concat(qs)
    teacherQuiz.aiMsg = `✅ ${qs.length} questions drafted — review the list below (switch to "Set my own questions" to tweak), then launch.`
    teacherQuiz.aiOk = true
    buzz(20)
  } else {
    teacherQuiz.aiMsg = 'MiroFish AI could not write questions right now — check the backend is running on :5055.'
    teacherQuiz.aiOk = false
  }
}

/* Local start of a concrete question set — used by the launching teacher and
   by every student receiving it over SSE, so everyone runs the SAME quiz. */
function startTeacherQuiz(title, questions) {
  stopQuestionTimer()
  quiz.customTitle = title
  quiz.launched = true; quiz.unlocked = false
  quiz.phase = 'active'; quiz.open = true
  quiz.questions = questions; quiz.index = 0; quiz.score = 0
  quiz.picked = null; quiz.revealed = false; quiz.feedbackText = ''
  startQuestionTimer()
  if (isMobile()) sheetOpen.value = false
  buzz(30)
}

/* Student side: the teacher broadcast classroom_quiz — open the same quiz. */
function applyRemoteQuiz(data) {
  if (!data || data.from === me.id) return   // the launching teacher already has it
  const qs = normalizeQuestions(data.questions)
  if (!qs.length) return
  startTeacherQuiz(String(data.title || 'Live Quiz'), qs)
  lockClassChat()
  showToast('📝 ' + (data.title || 'Live quiz'), 'Your teacher just launched a quiz — chat is paused until you finish.')
}

/* Launch: broadcast the teacher's set to the whole class, then run it locally. */
async function teacherSetQuiz() {
  if (!teacherQuiz.questions.length) return
  teacherQuiz.busy = true
  teacherQuiz.msg = ''; teacherQuiz.ok = false
  const title = teacherQuiz.title.trim() || 'Live Quiz'
  const questions = teacherQuiz.questions.map(q => ({ ...q }))
  const res = await publishClassroomQuiz({ course: roomCourse.value, pid: me.id, title, questions })
  teacherQuiz.busy = false
  if (res && res.success) {
    startTeacherQuiz(title, questions)
    classMessages.value.push({
      key: 'quiz-set-' + Date.now(), kind: 'system',
      text: `📝 Teacher launched "${title}" — ${questions.length} question${questions.length === 1 ? '' : 's'}. Chat is paused until you finish!`
    })
    toolsOpen.value = false   // close the tools popup — the quiz popup takes over
  } else {
    teacherQuiz.msg = 'Could not launch the quiz. Is the backend running on :5055 (and are you joined as the teacher)?'
    teacherQuiz.ok = false
  }
}

/* --- textbook — SECOND option: MiroFish AI writes the book for the Library --- */
let tbJobPoll = null
function clearTbJobPoll() { if (tbJobPoll) { clearInterval(tbJobPoll); tbJobPoll = null } }

async function teacherGenerateTextbookAI() {
  const topic = teacherTb.aiTopic.trim()
  if (!topic || teacherTb.aiBusy) return
  teacherTb.aiBusy = true
  teacherTb.msg = '🤖 MiroFish AI is writing the textbook… this can take a few minutes.'
  teacherTb.ok = false
  const res = await generateClassTextbook({ course: roomCourse.value, topic })
  if (!res || !res.jobId) {
    teacherTb.aiBusy = false
    teacherTb.msg = 'Could not start generation — is the backend running on :5055 with an API key?'
    return
  }
  clearTbJobPoll()
  tbJobPoll = setInterval(async () => {
    const job = await getTextbookJob(res.jobId)
    if (job && job.status === 'done') {
      clearTbJobPoll()
      teacherTb.aiBusy = false
      if (job.row) {
        teacherTb.msg = `✅ "${job.row.title}" is ready — it is now in every student's Library.`
        teacherTb.ok = true
        classMessages.value.push({
          key: 'tb-ai-' + Date.now(), kind: 'system',
          text: '🤖 New AI textbook in your Library: "' + job.row.title + '"'
        })
        buzz(30)
      } else {
        teacherTb.msg = 'Generation finished but produced no book — try a more specific topic.'
      }
    } else if (job && job.status === 'error') {
      clearTbJobPoll()
      teacherTb.aiBusy = false
      teacherTb.msg = 'Generation failed — ' + (job.error || 'unknown error')
    }
  }, 6000)
}

async function teacherGiveAssignment() {
  const title = teacherAsg.title.trim()
  if (!title) return
  teacherAsg.busy = true
  teacherAsg.msg = ''
  const res = await giveClassroomAssignment({
    course: roomCourse.value, pid: me.id, title,
    instructions: teacherAsg.instructions.trim(), due: teacherAsg.due
  })
  teacherAsg.busy = false
  if (res && res.success) {
    teacherAsg.msg = '✅ Assignment sent to your class — it now shows on every student dashboard.'
    teacherAsg.ok = true
    classMessages.value.push({
      key: 'asg-' + Date.now(), kind: 'system',
      text: '📋 Teacher gave an assignment: "' + res.assignment.title + '"' +
        (res.assignment.due ? ' · due ' + res.assignment.due : '')
    })
    teacherAsg.title = ''; teacherAsg.instructions = ''; teacherAsg.due = ''
    buzz(30)
  } else {
    teacherAsg.msg = 'Could not send the assignment. Is the backend running on :5055?'
    teacherAsg.ok = false
  }
}

/* --- assignment — SECOND option: MiroFish AI fills the form, teacher sends --- */
async function teacherDraftAssignmentAI() {
  const topic = teacherAsg.aiTopic.trim()
  if (!topic || teacherAsg.aiBusy) return
  teacherAsg.aiBusy = true
  teacherAsg.aiMsg = '🤖 Drafting…'
  teacherAsg.aiOk = false
  const res = await generateAssignmentDraft({ topic })
  teacherAsg.aiBusy = false
  if (res && (res.title || res.instructions)) {
    if (res.title) teacherAsg.title = res.title
    if (res.instructions) teacherAsg.instructions = res.instructions
    teacherAsg.aiMsg = '✅ Draft filled in above — edit it if you like, then send.'
    teacherAsg.aiOk = true
    buzz(20)
  } else {
    teacherAsg.aiMsg = 'MiroFish AI could not draft it right now — check the backend on :5055.'
    teacherAsg.aiOk = false
  }
}

/* --- timetable — FIRST option: the teacher builds the weekly rows by hand --- */
function addTimetableRow(day = 'Monday', time = '18:00', subject = '') {
  teacherTt.sessions.push({ day, time, subject })
  buzz(8)
}

const validTimetableRows = computed(() =>
  teacherTt.sessions.some(s => s.day && s.time && s.subject.trim()))

/* --- timetable — SECOND option: MiroFish AI drafts, the teacher reviews --- */
async function teacherDraftTimetableAI() {
  if (teacherTt.aiBusy) return
  teacherTt.aiBusy = true
  teacherTt.aiMsg = '🤖 MiroFish AI is building your timetable…'
  teacherTt.aiOk = false
  const res = await generateTimetableDraft({
    course: roomCourse.value, track: teacherTt.track,
    durationMonths: teacherTt.durationMonths, classMinutes: teacherTt.classMinutes,
    startDate: teacherTt.startDate || undefined
  })
  teacherTt.aiBusy = false
  if (res && res.sessions && res.sessions.length) {
    teacherTt.sessions = res.sessions.map(s => ({
      day: s.day || 'Monday', time: s.time || '18:00', subject: s.subject || ''
    }))
    if (res.title) teacherTt.title = res.title
    teacherTt.aiMsg = `✅ ${res.sessions.length} class days drafted — review the rows below (edit any subject), then publish.`
    teacherTt.aiOk = true
    buzz(20)
  } else {
    teacherTt.aiMsg = 'MiroFish AI could not build a timetable right now — check the backend on :5055.'
    teacherTt.aiOk = false
  }
}

/* Publish: persist via boirsu and broadcast to every student dashboard. */
async function publishTimetable() {
  const sessions = teacherTt.sessions
    .filter(s => s.day && s.time && s.subject.trim())
    .map(s => ({ day: s.day, time: s.time, subject: s.subject.trim() }))
  if (!sessions.length) return
  teacherTt.busy = true
  teacherTt.msg = ''; teacherTt.ok = false
  const title = teacherTt.title.trim() || 'Weekly class schedule'
  const res = await publishClassroomTimetable({ course: roomCourse.value, pid: me.id, title, sessions })
  teacherTt.busy = false
  if (res && res.success) {
    teacherTt.msg = '✅ Timetable published — every student dashboard shows it now.'
    teacherTt.ok = true
    classMessages.value.push({
      key: 'ttb-' + Date.now(), kind: 'system',
      text: `🗓️ Teacher published the class timetable: "${title}" — ${sessions.length} class day${sessions.length === 1 ? '' : 's'} a week.`
    })
    buzz(30)
  } else {
    teacherTt.msg = 'Could not publish the timetable. Is the backend running on :5055 (and are you joined as the teacher)?'
    teacherTt.ok = false
  }
}

async function beginLive() {
  closeTeacherSetup()
  liveMode.value = true
  currentView.value = 'teacher'
  voiceApproved.value = true // teachers always have the mic
  micOn.value = true
  // A live meeting for teachers: camera first, then microphone.
  try { await startCamera() } catch (error) { videoError.value = error.message }
  try { await startMicrophone() } catch (error) { videoError.value = error.message }
  // Put the whole ROOM on air. The server broadcasts classroom_live, so every
  // student switches to this live video and receives the system message —
  // previously this only changed the teacher's own screen.
  publishClassroomLive(roomCourse.value, me.id, true).catch(() => {})
  sendPing()
  buzz(30)
}

/* Ends the Go Live session: stops camera/mic/screen, exits live mode and
   drops everyone back onto the student-screen monitor. */
function endLive() {
  try { if (screenStream.value) stopScreenShare() } catch {}
  try { if (cameraStream.value) stopCamera() } catch {}
  try { if (microphoneStream.value) stopMicrophone() } catch {}
  liveMode.value = false
  currentView.value = 'share'
  micOn.value = false
  // Take the room off air so every student drops back to the lesson view.
  publishClassroomLive(roomCourse.value, me.id, false).catch(() => {})
  sendPing()
  buzz(30)
}

function startVideoLesson() {
  // Switching to a video lesson means ending any live meeting first.
  const wasLive = liveMode.value
  try { if (cameraStream.value) stopCamera() } catch {}
  try { if (microphoneStream.value) stopMicrophone() } catch {}
  liveMode.value = false
  if (wasLive) { publishClassroomLive(roomCourse.value, me.id, false).catch(() => {}); sendPing() }
  closeTeacherSetup()
  const url = (teacherSetup.videoUrl || '').trim()
  const id = extractVideoId(url)
  if (id) {
    // Teacher pasted a valid YouTube URL -> play + publish it to the whole cohort.
    selectedLessonVideo.value = {
      id, title: "Teacher's lesson", url: 'https://www.youtube.com/watch?v=' + id,
      watch_url: 'https://www.youtube.com/watch?v=' + id, embed_url: '', thumbnail: ''
    }
    currentView.value = 'teacher'
  } else {
    // No usable URL -> automated mode from MiroFish for the class topic.
    if (url) videoError.value = 'That YouTube link didn\'t include a valid ID — loading the automated lesson instead.'
    loadLessonVideos()
  }
}

/* ---------- lifecycle ---------- */
const mq = window.matchMedia('(max-width:900px)')
const onBreak = () => { pipStyle.value = {}; sheetStyle.value = {}; sheetOpen.value = false }
let sessionInt = null
onMounted(async () => {
  sessionInt = setInterval(() => sessionSec.value++, 1000)
  // Resolve course via boirsu + join the cohort BEFORE searching YouTube,
  // so the Apify search runs for exactly the course this student is taking.
  await initLiveClassroom()
  // NOTE: the teacher lesson setup popup no longer opens automatically — it
  // only appears when the educator clicks the "Teacher Lesson" button above.
  if (!isTeacher.value) loadLessonVideos()
  // NOTE: no timer-launched demo quiz anymore — the quiz now fires when the
  // lesson video actually ENDS (onYtStateChange -> onVideoEnded -> launchQuiz).
  setTimeout(() => hintFaded.value = true, 5000)
  mq.addEventListener('change', onBreak)
})
onUnmounted(() => {
  stopScreenShare()
  stopCamera()
  stopMicrophone()
  peers.forEach(peer => peer.close())
  peers.clear()
  try { ytPlayer && ytPlayer.destroy && ytPlayer.destroy() } catch {}
  ytPlayer = null
  if (pingInt) clearInterval(pingInt)
  if (stopStream) stopStream()
  clearTbJobPoll()
  if (me.id) leaveClassroom(roomCourse.value, me.id).catch(() => {})
  clearInterval(sessionInt); clearInterval(quizInt)
  mq.removeEventListener('change', onBreak)
})
</script>

<style>
  /* global reset */
  :root{--bg:#131a2e;--panel:#202946;--panel2:#2a3557;--border:#3d4a73;--text:#f4f6ff;--muted:#c0c8e8;--accent:#8b7cff;--accent-soft:rgba(139,124,255,.22);--live:#ef4444;--green:#22c55e;--gold:#eab308;--radius:14px;--safe-b:env(safe-area-inset-bottom,0px);--safe-t:env(safe-area-inset-top,0px);--controlsH:70px;--peek:122px}
  *{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;-webkit-tap-highlight-color:transparent}
  button{cursor:pointer;border:none;background:none;color:inherit;touch-action:manipulation}
  html,body{overscroll-behavior:none}
  body{background:radial-gradient(1100px 500px at 85% -10%,rgba(124,108,249,.14),transparent),var(--bg);color:var(--text)}
</style>

<style scoped>
  .icon{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .icon.small{width:14px;height:14px}
.app{height:100vh;display:flex;flex-direction:column;gap:14px;padding:18px 22px;background:radial-gradient(1100px 500px at 85% -10%,rgba(124,108,249,.14),transparent),var(--bg)}
  .topbar{display:flex;justify-content:space-between;align-items:center;gap:12px}
  .title-wrap{display:flex;align-items:center;gap:12px;min-width:0}
  h1{font-size:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .live-badge{background:var(--live);padding:4px 10px;border-radius:6px;font-size:11px;font-weight:800;letter-spacing:.5px;animation:pulse 2s infinite;flex:none}
  .live-badge.small{padding:2px 7px;font-size:9px;animation:none}
  @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(239,68,68,.5)}70%{box-shadow:0 0 0 9px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}
  .top-right{display:flex;align-items:center;gap:12px}
  .avatars{display:flex}
  .avatar{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:700;color:#fff;border:2px solid var(--bg);margin-left:-8px;background:linear-gradient(135deg,hsl(var(--h) 70% 55%),hsl(calc(var(--h) + 40) 70% 42%))}
  .avatar:first-child{margin-left:0}
  .avatar.more{background:var(--panel2);color:var(--muted);font-size:9.5px;border-color:var(--border)}
  .hands{display:flex;align-items:center;gap:7px;color:var(--muted);font-size:12.5px}
  .hands .icon{color:var(--gold)}
  /* Teacher enable/disable live chat toggle (prominent pill, top bar) */
  .chat-toggle{display:flex;align-items:center;gap:7px;background:rgba(34,197,94,.16);border:1px solid rgba(34,197,94,.55);color:#bbf7d0;padding:8px 14px;border-radius:999px;font-size:12px;font-weight:800;white-space:nowrap;transition:.15s;cursor:pointer}
  .chat-toggle .icon{color:inherit}
  .chat-toggle:hover{filter:brightness(1.12)}
  .chat-toggle.on{background:rgba(239,68,68,.16);border-color:rgba(239,68,68,.55);color:#fecaca}
  .chip{display:flex;align-items:center;gap:6px;background:var(--panel2);border:1px solid var(--border);border-radius:999px;padding:7px 13px;font-size:12px;font-weight:700;font-variant-numeric:tabular-nums}
  .people-chip{display:none}
  .icon-btn{width:38px;height:38px;border-radius:50%;background:var(--panel2);border:1px solid var(--border);display:grid;place-items:center;color:var(--muted);position:relative;flex:none}
  .icon-btn .ping{position:absolute;top:2px;right:2px;width:9px;height:9px;border-radius:50%;background:var(--live);animation:pulse 1.5s infinite}
  .icon-btn.done{color:var(--green);border-color:rgba(34,197,94,.5)}
  .content{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 350px;gap:14px}
  .stage{position:relative;grid-column:1;min-height:0;border-radius:var(--radius);border:1px solid var(--border);background:linear-gradient(160deg,#283252,#1e2745);overflow:hidden;user-select:none}
  .stage-view{position:absolute;inset:0;display:grid;place-items:center;padding:58px 16px 16px}
  .teacher-stage-view{display:block;padding:12px}
  .share-chip{position:absolute;top:12px;left:12px;display:flex;align-items:center;gap:7px;background:rgba(24,32,58,.85);backdrop-filter:blur(8px);border:1px solid var(--border);padding:6px 12px;border-radius:999px;font-size:11px;color:#dfe5ff;z-index:5}
  .dot{width:8px;height:8px;border-radius:50%;background:var(--green)}
  .slide{text-align:center}
  .screen-share-status{display:grid;place-items:center;width:100%;height:100%;padding:24px;color:#dfe5ff;font-size:13.5px;text-align:center}
  .screen-video{width:100%;height:100%;object-fit:contain;background:#000;border-radius:12px;display:block}
  .share-live-chip{position:absolute;top:12px;left:12px;display:flex;align-items:center;gap:7px;background:rgba(16,181,106,.92);color:#fff;padding:6px 12px;border-radius:999px;font-size:11px;font-weight:700;z-index:5;box-shadow:0 6px 18px rgba(0,0,0,.35)}
  .mirror-warn{position:absolute;top:12px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:10px;background:rgba(234,165,36,.96);color:#241a02;padding:9px 12px 9px 14px;border-radius:10px;font-size:12px;font-weight:600;line-height:1.45;z-index:6;max-width:72%;box-shadow:0 10px 26px rgba(0,0,0,.4)}
  .mirror-warn .mw-close{background:none;border:none;color:#241a02;font-size:14px;font-weight:800;cursor:pointer;padding:2px 4px;border-radius:6px}
  .mirror-warn .mw-close:hover{background:rgba(0,0,0,.12)}
  /* Presentation mode: while sharing, fade our own chrome so an Entire-Screen
     share looks clean (the same trick Meet uses) — hover any bar to use it. */
  .app.presenting .topbar,
  .app.presenting .controls{opacity:.22;transition:opacity .35s ease}
  .app.presenting .topbar:hover,
  .app.presenting .controls:hover{opacity:1}
  .app.presenting .view-switch,
  .app.presenting .pip-wrap{display:none}
  /* Presenter panel replaces the big feed — this is the anti-mirror trick */
  .presenting-panel{display:flex;flex-direction:column;align-items:center;gap:10px;max-width:460px;text-align:center;padding:34px 30px;border-radius:18px;background:linear-gradient(165deg,rgba(124,108,249,.10),rgba(10,13,22,.55));border:1px solid var(--border);box-shadow:0 18px 50px rgba(0,0,0,.45)}
  .presenting-panel .pp-icon{font-size:38px;line-height:1}
  .presenting-panel b{font-size:19px;color:var(--text)}
  .presenting-panel p{font-size:13px;color:var(--muted);line-height:1.65}
  .pp-preview,.preview-hide{background:var(--panel2);border:1px solid var(--border);color:var(--text);padding:9px 16px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;transition:.15s}
  .pp-preview:hover,.preview-hide:hover{border-color:var(--accent);background:var(--accent-soft)}
  .screen-video.preview-box{position:absolute;right:16px;bottom:16px;left:auto;top:auto;width:250px;height:146px;border:2px solid rgba(124,108,249,.55);border-radius:12px;box-shadow:0 14px 36px rgba(0,0,0,.55)}

  /* ---- Teacher SCREEN MANAGER: monitor student screens + live class size ---- */
  .teacher-screen-manager{width:100%;height:100%;display:grid;place-items:center;padding:14px}
  .tsm-layout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:12px;width:100%;max-width:1200px;height:100%;min-height:0}
  .tsm-main{position:relative;background:linear-gradient(160deg,#2c3760,#222c4e);border:1px solid var(--border);border-radius:14px;overflow:hidden;display:grid;place-items:center;min-height:0}
  .tsm-viewer{position:absolute;inset:0;background:#000}
  .tsm-viewer video{width:100%;height:100%;object-fit:contain;display:block}
  .tsm-viewer-label{position:absolute;top:12px;left:12px;display:inline-flex;align-items:center;gap:7px;background:rgba(24,32,58,.86);backdrop-filter:blur(8px);border:1px solid var(--border);color:#dfe5ff;padding:7px 13px;border-radius:999px;font-size:11.5px;font-weight:700;z-index:2}
  .tsm-x{position:absolute;top:12px;right:12px;background:rgba(239,68,68,.9);color:#fff;border:none;padding:7px 13px;border-radius:999px;font-size:11.5px;font-weight:700;cursor:pointer;z-index:2;transition:.15s}
  .tsm-x:hover{filter:brightness(1.12)}
  .tsm-self{display:flex;flex-direction:column;align-items:center;gap:10px;max-width:460px;text-align:center;padding:32px 30px;border-radius:18px;background:linear-gradient(165deg,rgba(124,108,249,.10),rgba(10,13,22,.55));border:1px solid var(--border);box-shadow:0 18px 50px rgba(0,0,0,.45)}
  .tsm-self .pp-icon{font-size:38px;line-height:1}
  .tsm-self b{font-size:18px;color:var(--text)}
  .tsm-self p{font-size:13px;color:var(--muted);line-height:1.65;max-width:400px}
  .tsm-rail{display:flex;flex-direction:column;gap:12px;background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:14px;min-height:0;overflow:hidden}
  .tsm-kicker{font-size:10px;letter-spacing:.13em;text-transform:uppercase;font-weight:800;color:#a5b4fc}
  .tsm-count-panel{display:flex;flex-direction:column;gap:8px;background:var(--panel2);border:1px solid var(--border);border-radius:12px;padding:12px}
  .tsm-count-row{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;font-weight:700;color:var(--text)}
  .tsm-count-row b{background:var(--accent);color:#fff;min-width:28px;height:28px;padding:0 9px;border-radius:999px;display:grid;place-items:center;font-size:13px;font-variant-numeric:tabular-nums}
  .tsm-students{display:flex;flex-direction:column;gap:8px;min-height:0;flex:1}
  .tsm-subtitle{display:flex;align-items:center;justify-content:space-between;font-size:12px;color:var(--muted);font-weight:700}
  .tsm-subtitle b{background:var(--accent);color:#fff;min-width:20px;height:20px;padding:0 6px;border-radius:999px;display:grid;place-items:center;font-size:11px}
  .tsm-student-list{display:flex;flex-direction:column;gap:8px;overflow-y:auto;min-height:0;padding-right:2px}
  .tsm-student-list::-webkit-scrollbar{width:6px}.tsm-student-list::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
  .tsm-student{position:relative;display:grid;grid-template-columns:60px 1fr auto;align-items:center;gap:10px;text-align:left;background:var(--panel2);border:1px solid var(--border);border-radius:12px;padding:8px;cursor:pointer;transition:.15s;overflow:hidden}
  .tsm-student:hover{border-color:var(--accent)}
  .tsm-student.active{border-color:var(--accent);background:var(--accent-soft);box-shadow:0 0 0 1px var(--accent)}
  .tsm-student-video{width:60px;height:48px;object-fit:cover;border-radius:8px;background:#000;display:block}
  .tsm-name{font-size:12.5px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .tsm-watch{font-size:10.5px;font-weight:800;color:var(--muted);white-space:nowrap}
  .tsm-student.active .tsm-watch{color:#86efac}
  .tsm-empty{font-size:12px;color:var(--muted);text-align:center;padding:14px 8px;border:1px dashed var(--border);border-radius:10px}
  .mirror-warn.rail-warn{position:static;transform:none;max-width:none;margin:0}
  /* Teacher's "Watch <name>" affordance on the remote tiles */
  .remote-video-tile button{position:absolute;right:5px;bottom:5px;background:var(--accent);color:#fff;border:none;padding:4px 9px;border-radius:7px;font-size:10px;font-weight:700;cursor:pointer;z-index:2;max-width:calc(100% - 10px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .remote-video-tile button:hover{filter:brightness(1.12)}
  /* Big view of the selected student's screen (My Screen / Teacher's Lesson views) */
  .selected-student-screen{position:absolute;left:50%;top:58px;transform:translateX(-50%);width:min(560px,88%);z-index:40;overflow:hidden;border:1px solid var(--accent);border-radius:12px;background:#000;box-shadow:0 16px 42px rgba(0,0,0,.55)}
  .selected-student-screen video{width:100%;height:auto;display:block;object-fit:contain;max-height:60vh}
  .selected-student-screen span{position:absolute;left:10px;bottom:8px;background:rgba(20,27,50,.85);backdrop-filter:blur(6px);color:#fff;font-size:11px;font-weight:700;padding:5px 11px;border-radius:999px}
  @media (max-width:900px){
    .tsm-layout{grid-template-columns:1fr;grid-template-rows:auto 1fr;overflow-y:auto}
    .tsm-viewer{position:static;min-height:200px}
    .teacher-screen-manager{padding:10px}
    .selected-student-screen{width:92%}
  }

  /* ---- Dockable lesson ⇄ share layout (Meet-style) ---- */
  /* The single capture element: corner preview by default… */
  .share-float{position:absolute;right:16px;bottom:16px;width:min(300px,32vw);aspect-ratio:16/9;z-index:40;border-radius:12px;overflow:hidden;border:2px solid rgba(124,108,249,.55);box-shadow:0 14px 36px rgba(0,0,0,.55);background:#000}
  /* …or full-stage owner when the shared screen wins the swap */
  .share-float.big{inset:0;width:auto;height:auto;aspect-ratio:auto;border-radius:var(--radius);border:none;z-index:6}
  .share-float .screen-video{width:100%;height:100%;object-fit:contain;background:#000;border-radius:0}
  .sf-label{position:absolute;top:8px;right:8px;z-index:2;background:rgba(20,27,50,.88);backdrop-filter:blur(6px);border:1px solid var(--border);color:#dfe5ff;padding:5px 11px;border-radius:999px;font-size:11px;font-weight:800;cursor:pointer;transition:.15s}
  .sf-label:hover{border-color:var(--accent);color:#fff}
  .share-float.big .sf-label{top:54px}
  /* Lesson shell as a floating mini-player (same DOM node, pure CSS move) */
  .video-shell.floating{position:fixed;right:14px;bottom:96px;width:min(340px,42vw);flex:none;aspect-ratio:16/9;z-index:70;border-color:rgba(124,108,249,.65);box-shadow:0 18px 46px rgba(0,0,0,.62)}
  .shell-float-bar{position:absolute;top:0;left:0;right:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px;background:linear-gradient(180deg,rgba(12,16,30,.94),rgba(12,16,30,.45));font-size:11px;font-weight:800;color:#dfe5ff}
  .shell-float-bar button{background:var(--accent);border:none;color:#fff;font-size:10.5px;font-weight:800;padding:4px 10px;border-radius:999px;cursor:pointer}
  .shell-float-bar button:hover{filter:brightness(1.15)}
  .shell-popout{position:absolute;top:8px;right:8px;z-index:3;background:rgba(20,27,50,.88);backdrop-filter:blur(6px);border:1px solid var(--border);color:#dfe5ff;font-size:11px;font-weight:700;padding:5px 11px;border-radius:999px;cursor:pointer;transition:.15s}
  .shell-popout:hover{border-color:var(--accent);color:#fff}
  /* Solo mode: teacher view steps aside — only the floating shell shows */
  .teacher-stage-view.solo{pointer-events:none;background:transparent;border-color:transparent;box-shadow:none}
  .teacher-stage-view.solo .board{background:transparent;border-color:transparent;box-shadow:none;padding:0;overflow:visible;width:100%;height:100%}
  .teacher-stage-view.solo .board-head,
  .teacher-stage-view.solo .video-list,
  .teacher-stage-view.solo .video-loading{display:none}
  .teacher-stage-view.solo .video-shell.floating{pointer-events:auto}
  .pip-hint{position:absolute;inset:0;display:grid;place-items:center;padding:0 30px;text-align:center;color:#aab4dc;font-size:13px;line-height:1.6;pointer-events:none}
  .preview-hide{position:absolute;right:16px;bottom:170px;padding:5px 12px;font-size:11px}
  .slide h2{margin-top:10px;font-size:19px}
  .slide p{color:var(--muted);font-size:13px;margin-top:4px}
  .cell{width:min(42vw,400px)}
  .teacher-stage-view .board{width:100%;height:100%;max-height:none;display:flex;flex-direction:column;overflow:hidden;border-radius:12px;padding:14px;background:#1b3a30}
  .board-head{display:flex;align-items:center;gap:10px;margin-bottom:14px;font-family:'Segoe UI',system-ui,sans-serif}
  .t-cam{width:36px;height:36px;border-radius:50%;background:linear-gradient(160deg,#3a4470,#252e4e);display:grid;place-items:center;border:1px solid var(--border);flex:none}
  .t-cam svg{width:20px;height:20px;fill:#b7c1e6}
  .t-name{font-size:12.5px;font-weight:700;color:var(--text)}
  .board-title{margin-left:auto;color:var(--muted);font-size:11.5px}
  .board h3{font-size:21px;margin-bottom:12px}
  .board ul{list-style:none;display:flex;flex-direction:column;gap:9px;font-size:15px;line-height:1.5}
  .board li::before{content:"▸ ";color:#4ade80}
  .lesson-kicker{display:inline-block;color:#a5b4fc;font-size:10px;letter-spacing:.12em;text-transform:uppercase;font-weight:800}
  .teacher-video{font-family:'Segoe UI',system-ui,sans-serif;margin-top:12px;display:flex;flex:1;min-height:0;flex-direction:column}
  .video-shell{position:relative;width:100%;flex:1;min-height:0;aspect-ratio:auto;border-radius:12px;overflow:hidden;border:1px solid var(--border);background:linear-gradient(135deg,#2a3557,#3a4770)}
  .yt-host{position:absolute;inset:0}
  .video-shell iframe,.video-shell .yt-host iframe{width:100%;height:100%;border:0;background:#000;display:block}
  .video-loading{display:grid;place-items:center;min-height:160px;border:1px dashed var(--border);border-radius:12px;color:#dfe5ff;font-size:13.5px;background:rgba(255,255,255,.07)}
  .video-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
  .video-choice{display:flex;align-items:center;gap:10px;padding:8px;border-radius:12px;border:1px solid var(--border);background:rgba(255,255,255,.05);text-align:left;transition:.15s}
  .video-choice:hover,.video-choice.active{border-color:var(--accent);background:var(--accent-soft)}
  .video-choice img{width:92px;height:56px;object-fit:cover;border-radius:8px;flex:none}
  .view-switch{position:absolute;top:12px;left:50%;transform:translateX(-50%);display:flex;gap:4px;background:rgba(22,29,52,.9);backdrop-filter:blur(10px);border:1px solid var(--border);border-radius:999px;padding:4px;z-index:6}
  .vs-btn{display:flex;align-items:center;gap:7px;padding:8px 14px;border-radius:999px;font-size:12px;font-weight:700;color:#cdd5f4;transition:.15s}
  .vs-btn:hover{color:var(--text)}
  .vs-btn.active{background:var(--accent);color:#fff}
  .swipe-hint{display:none}
  .pip-wrap{position:absolute;bottom:14px;right:14px;z-index:7;touch-action:none;cursor:grab}
  .pip-wrap:active{cursor:grabbing}
  .pip{width:235px;border-radius:12px;overflow:hidden;border:1px solid var(--border);background:#000;box-shadow:0 12px 32px rgba(0,0,0,.55)}
  .pip-video{height:132px;display:grid;place-items:center;background:linear-gradient(160deg,#3a4470,#252e4e);position:relative}
  .pip-video iframe{width:100%;height:100%;border:0;background:#000}
  .camera-video{width:100%;height:100%;object-fit:cover}
  .camera-tile{position:absolute;right:14px;top:14px;width:150px;height:94px;z-index:8;overflow:hidden;border:1px solid var(--border);border-radius:10px;background:#000;box-shadow:0 10px 24px rgba(0,0,0,.45)}
  .remote-video-grid{position:absolute;left:14px;top:14px;z-index:8;display:flex;gap:8px;max-width:calc(100% - 180px);overflow:auto}
  .remote-video-tile{position:relative;flex:0 0 150px;height:94px;overflow:hidden;border:1px solid var(--border);border-radius:10px;background:#000;box-shadow:0 10px 24px rgba(0,0,0,.45)}
  .remote-video-tile video{width:100%;height:100%;object-fit:cover}
  .remote-video-tile span{position:absolute;left:6px;right:6px;bottom:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#fff;font-size:11px;text-shadow:0 1px 3px #000}
  .pip-video svg{width:64px;height:64px;fill:#9aa6d4}
  .pip-video.share-thumb{background:linear-gradient(160deg,#283252,#1e2745)}
  .pip-video.share-thumb svg{width:70%;height:78%;fill:none}
  .pip-video .speak-ring{position:absolute;inset:0;margin:auto;width:76px;height:76px;border-radius:50%;border:2px solid rgba(124,108,249,.7);animation:ring 1.6s ease-out infinite}
  @keyframes ring{0%{transform:scale(.7);opacity:.9}100%{transform:scale(1.25);opacity:0}}
  .pip-bar{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 9px;background:rgba(19,26,46,.94);font-size:11px}
  .float-emoji{position:absolute;bottom:80px;font-size:26px;pointer-events:none;animation:rise 2.5s ease-out forwards;z-index:8}
  @keyframes rise{to{transform:translateY(-60vh);opacity:0}}
  .chat{grid-column:2;height:100%;background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);display:flex;flex-direction:column;min-height:0;overflow:hidden}
  .handle,.peek-preview{display:none}
  .chat-tabs{display:flex;border-bottom:1px solid var(--border)}
  .tab{flex:1;padding:12px 8px;color:var(--muted);font-weight:700;font-size:12.5px;display:flex;align-items:center;justify-content:center;gap:7px;position:relative;transition:.15s}
  .tab:hover{color:var(--text)}
  .tab.active{color:var(--text)}
  .tab.active::after{content:"";position:absolute;left:20%;right:20%;bottom:-1px;height:2px;background:var(--accent);border-radius:2px}
  .tab-badge{min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:var(--live);color:#fff;font-size:10px;font-weight:800;display:grid;place-items:center}
  .messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px}
  .messages::-webkit-scrollbar{width:6px}.messages::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
  .msg{display:flex;align-items:flex-end;gap:8px}
  .msg.you{flex-direction:row-reverse}
.bubble{background:var(--panel2);border:1px solid var(--border);padding:8px 12px;border-radius:12px;max-width:82%;font-size:13px;line-height:1.45;color:var(--text)}
  .msg.you .bubble{background:var(--accent-soft);border-color:rgba(124,108,249,.45)}
  .msg.teacher .bubble{border-color:rgba(234,179,8,.45)}
  .msg.ai .bubble{border-color:rgba(34,211,238,.4)}
  .msg.system{justify-content:center}
  .msg.system .sys-note{color:#ccd4f5;font-size:10.5px;background:rgba(255,255,255,.07);border:1px solid var(--border);border-radius:999px;padding:4px 12px}
  .sender-name{display:block;font-size:9.5px;font-weight:700;color:#aab4dd;margin-bottom:2px}
  .msg.you .sender-name,.msg.teacher .sender-name{display:none}
  .tag-teacher{background:linear-gradient(135deg,#facc15,#ca8a04);color:#151515;font-size:9.5px;font-weight:800;padding:3px 8px;border-radius:999px}
  .mini-av{width:25px;height:25px;border-radius:50%;flex:none;display:grid;place-items:center;font-size:10px;font-weight:700;color:#fff;background:linear-gradient(135deg,hsl(var(--h) 70% 55%),hsl(calc(var(--h) + 40) 70% 42%))}
  .mini-av.bot{background:linear-gradient(135deg,#22d3ee,#7c6cf9);font-size:12px}
  .typing{display:flex;gap:4px;align-items:center}
  .typing span{width:6px;height:6px;border-radius:50%;background:var(--muted);animation:blink 1s infinite}
  .typing span:nth-child(2){animation-delay:.2s}.typing span:nth-child(3){animation-delay:.4s}
  @keyframes blink{0%,100%{opacity:.3}50%{opacity:1}}
  .emoji-row{display:flex;gap:6px;padding:8px 12px;border-top:1px solid var(--border)}
  .emoji-btn{width:32px;height:32px;border-radius:50%;background:var(--panel2);border:1px solid var(--border);font-size:14px}
  .emoji-btn:hover{border-color:var(--accent)}
  .chat-input{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--border)}
  .chat-input input{flex:1;background:var(--panel2);border:1px solid var(--border);border-radius:999px;padding:9px 14px;color:var(--text);font-size:13px;outline:none}
  .chat-input input:focus{border-color:var(--accent)}
  .send-btn{width:38px;height:38px;border-radius:50%;background:var(--accent);display:grid;place-items:center;color:#fff;flex:none}
  .ai-grounding{display:flex;gap:6px;padding:8px 12px;border-top:1px solid var(--border);flex-wrap:wrap}
  .g-chip{display:inline-flex;align-items:center;font-size:10.5px;font-weight:700;color:var(--muted);background:var(--panel2);border:1px solid var(--border);border-radius:999px;padding:4px 10px}
  .g-chip.on{color:#bbf7d0;border-color:rgba(34,197,94,.4)}
  .controls{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px}
  .foot-note{display:flex;align-items:center;gap:7px;color:var(--muted);font-size:12.5px}
  .foot-note .icon{color:var(--accent)}
  .ctrl-group{display:flex;gap:10px}
  .ctrl{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:var(--panel2);border:1px solid var(--border);color:var(--muted);position:relative;transition:.15s}
  .ctrl:hover{color:var(--text);border-color:var(--accent)}
  .ctrl.active{background:var(--accent);border-color:transparent;color:#fff;box-shadow:0 0 16px rgba(124,108,249,.5)}
  .ctrl.off{color:#f87171;background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.4)}
  .ctrl.off::after{content:"";position:absolute;inset:0;margin:auto;width:22px;height:2px;background:#f87171;transform:rotate(-45deg);border-radius:2px}
  .leave{justify-self:end;display:flex;align-items:center;gap:8px;background:var(--live);color:#fff;padding:11px 22px;border-radius:999px;font-weight:700;font-size:13.5px}
  .toast{position:fixed;left:50%;bottom:96px;transform:translateX(-50%) translateY(16px);background:var(--panel);border:1px solid var(--accent);border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 12px 40px rgba(0,0,0,.6);opacity:0;pointer-events:none;transition:.3s;z-index:90}
  .toast.show{opacity:1;transform:translateX(-50%);pointer-events:auto}
  .toast b{font-size:13px}
  .toast small{display:block;color:var(--muted);font-size:11px;margin-top:2px}
  .toast button{background:var(--accent);color:#fff;padding:9px 14px;border-radius:9px;font-weight:700;font-size:12px}
  .quiz-scrim{position:fixed;inset:0;background:rgba(12,17,32,.55);backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:.3s;z-index:70}
  .quiz-scrim.show{opacity:1;pointer-events:auto}
  .quiz-card{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%) scale(.94);opacity:0;pointer-events:none;width:min(480px,92vw);background:linear-gradient(180deg,#2b3760,#243056);border:1px solid var(--accent);border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,.55),0 0 0 4px rgba(139,124,255,.08);transition:.25s ease;z-index:80}
  .quiz-card.open{transform:translate(-50%,-50%) scale(1);opacity:1;pointer-events:auto}
  .quiz-head{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border)}
  .quiz-head b{font-size:15.5px;color:#fff}
  .q-sub{color:#ccd4f5;font-size:11.5px;margin-top:2px}
  .q-timer{margin-left:auto;background:rgba(139,124,255,.25);color:#d6cdff;padding:5px 11px;border-radius:9px;font-size:13px;font-weight:800;font-variant-numeric:tabular-nums}
  .q-timer.danger{background:rgba(239,68,68,.2);color:#fca5a5}
  .q-close{width:32px;height:32px;border-radius:8px;background:var(--panel2);border:1px solid var(--border);color:var(--muted);display:grid;place-items:center}
  .q-close:hover{color:var(--text);border-color:var(--accent)}
  .quiz-body{padding:16px}
  .progress{height:5px;background:rgba(255,255,255,.12);border-radius:99px;margin-bottom:12px}
  .progress-fill{height:100%;width:60%;background:var(--accent);border-radius:99px}
  .question{font-size:15px;margin-bottom:12px;line-height:1.5;color:#fff;font-weight:600}
  .options{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .options.warn{outline:1px solid var(--live);border-radius:10px}
  .option{background:var(--panel2);border:1px solid var(--border);border-radius:10px;padding:11px 12px;font-size:13.5px;line-height:1.45;text-align:left;color:#eef1ff;transition:.15s}
  .option:hover{border-color:var(--accent);background:#33406b}
  .option.selected{border-color:var(--accent);background:var(--accent-soft);box-shadow:0 0 0 1px var(--accent)}
  .submit{width:100%;margin-top:12px;background:var(--accent);color:#fff;padding:11px;border-radius:10px;font-weight:700;font-size:13px}
  .submit.done{background:var(--green)}
  .submit:disabled{cursor:default;opacity:.55}

  /* ============ END-OF-VIDEO AI QUIZ ============ */
  .tab.locked-tab{opacity:.75;color:#dfe5ff;cursor:not-allowed}
  .tab.locked-tab:hover{color:#dfe5ff}
  .quiz-generating{display:flex;flex-direction:column;align-items:center;gap:9px;padding:26px 8px;text-align:center}
  .quiz-generating p{font-size:15px;font-weight:800;color:#fff}
  .quiz-generating .gen-sub{font-size:12.5px;font-weight:400;color:#ccd4f5}
  .spinner{width:30px;height:30px;border-radius:50%;border:3px solid var(--border);border-top-color:var(--accent);animation:spin .9s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .option.correct,.option.missed{cursor:default}
  .option.correct{border-color:var(--green)!important;background:rgba(34,197,94,.24)!important;box-shadow:0 0 0 1px var(--green)!important}
  .option.missed{border-color:var(--live)!important;background:rgba(239,68,68,.18)!important;box-shadow:0 0 0 1px var(--live)!important;opacity:.85}
  .feedback{margin-top:10px;font-size:13px;line-height:1.5;color:#fca5a5}
  .feedback.good{color:#86efac}
  .score-panel{display:flex;flex-direction:column;align-items:center;gap:10px;padding:18px 6px;text-align:center}
  .score-big{font-size:40px;font-weight:800;color:#b9adff}
  .score-msg{font-size:13.5px;line-height:1.5;color:#eef1ff}
  .score-note{color:#ccd4f5;font-size:11.5px}
  .progress-fill{transition:width .3s ease}
  @media (max-width:900px){.options{grid-template-columns:1fr}}

  /* ============ MOBILE ============ */
  @media (max-width:900px){
    :root{--controlsH:calc(66px + var(--safe-b))}
    .app{height:100dvh;padding:0;gap:0}
    .topbar{padding:calc(10px + var(--safe-t)) 14px 10px;background:rgba(19,26,46,.88);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);justify-content:flex-start;gap:9px}
    h1{font-size:15px;font-weight:800;flex:1}
    .avatars,.hands,.foot-note,.only-desktop{display:none}
    .chat-toggle{padding:8px;flex:none}
    .chat-toggle span{display:none}
    .people-chip{display:flex}
    .chip{padding:6px 11px;font-size:11.5px}
    .content{display:flex;flex-direction:column}
    .stage,.chat{grid-column:auto;grid-row:auto}
    .stage{flex:1;border-radius:0;border:none}
    .stage-view{padding:52px 14px 76px}
    .slide h2{font-size:16px}.slide p{font-size:11.5px}
    .cell{width:min(72vw,340px)}
    .board{width:100%;border-radius:14px;padding:14px 16px}
    .board h3{font-size:17px;margin-bottom:8px}
    .board ul{font-size:13px;gap:7px}
    .board-title{display:none}
    .view-switch{top:auto;bottom:12px}
    .vs-btn{padding:8px 13px;font-size:11.5px}
    .swipe-hint{display:block;position:absolute;bottom:62px;left:50%;transform:translateX(-50%);background:rgba(22,29,52,.9);border:1px solid var(--border);border-radius:999px;padding:6px 12px;font-size:10.5px;color:#dfe5ff;z-index:6;transition:opacity .6s;pointer-events:none}
    .swipe-hint.fade{opacity:0}
    .pip-wrap{bottom:auto;top:10px;right:10px}
    .pip{width:150px}
    .pip-video{height:92px}
    .pip-video svg{width:44px;height:44px}
    .pip-video .speak-ring{width:56px;height:56px}
    .camera-tile{right:10px;top:10px;width:112px;height:72px}
    .pip-bar{font-size:9.5px;padding:5px 7px}
    .chat{position:fixed;left:0;right:0;bottom:var(--controlsH);height:min(68dvh,620px);background:rgba(20,25,39,.94);backdrop-filter:blur(16px);border:1px solid var(--border);border-radius:20px 20px 0 0;transform:translateY(calc(100% - var(--peek)));transition:transform .35s cubic-bezier(.2,.8,.2,1);z-index:30;box-shadow:0 -12px 40px rgba(0,0,0,.5)}
    .chat.expanded{transform:translateY(0)}
    .handle{display:grid;place-items:center;padding:10px 0 6px;touch-action:none;cursor:grab}
    .handle::before{content:"";width:44px;height:5px;border-radius:99px;background:var(--border)}
    .peek-preview{display:block;padding:9px 16px 0;font-size:11.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .chat.expanded .peek-preview{display:none}
    .chat-input input{padding:11px 16px;font-size:14px}
    .send-btn{width:42px;height:42px}
    .controls{display:flex;justify-content:space-between;padding:11px 12px calc(11px + var(--safe-b));background:rgba(19,26,46,.92);backdrop-filter:blur(12px);border-top:1px solid var(--border)}
    .ctrl-group{gap:8px}
    .ctrl{width:44px;height:44px}
    .leave{padding:12px 18px;font-size:13px}
    .toast{top:calc(var(--safe-t) + 62px);bottom:auto;left:12px;right:12px;transform:translateY(-250%)}
    .toast.show{transform:none}
    .quiz-card{left:0;top:auto;bottom:0;width:100%;max-height:82dvh;border-radius:22px 22px 0 0;border-top:1px solid var(--accent);transform:translateY(105%);opacity:1;transition:transform .4s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column}
    .quiz-card.open{transform:translateY(0)}
    .quiz-body{overflow-y:auto;padding:14px 16px calc(16px + var(--safe-b))}
    .options{grid-template-columns:1fr;gap:9px}
    .option{padding:14px;font-size:13.5px}
    .submit{padding:14px;font-size:14px;font-weight:800}
  }

  /* ===== Teacher lesson setup popup (Go Live / AI Video) ===== */
  .ts-scrim{position:fixed;inset:0;z-index:70;display:grid;place-items:center;padding:18px;background:rgba(8,11,22,.72);backdrop-filter:blur(10px);animation:tsIn .25s ease}
  @keyframes tsIn{from{opacity:0}to{opacity:1}}
  .ts-card{width:min(560px,100%);max-height:92dvh;overflow:auto;background:linear-gradient(165deg,#25305a,#141b30);border:1px solid var(--accent);border-radius:20px;padding:24px;box-shadow:0 30px 80px rgba(0,0,0,.6)}
  .ts-head{display:flex;gap:14px;align-items:flex-start;margin-bottom:20px}
  .ts-icon{flex:none;width:52px;height:52px;border-radius:14px;background:var(--accent-soft);border:1px solid var(--accent);display:grid;place-items:center;font-size:26px}
  .ts-txt{flex:1;min-width:0}
  .ts-kicker{margin:0 0 4px;color:var(--accent);font:800 11px monospace;letter-spacing:.16em}
  .ts-txt h2{margin:0;font-size:22px;line-height:1.15}
  .ts-sub{margin:6px 0 0;color:var(--muted);font-size:13px;line-height:1.5}
  .ts-close{flex:none;width:34px;height:34px;border-radius:50%;background:var(--panel2);border:1px solid var(--border);color:var(--muted);font-size:15px;line-height:1;display:grid;place-items:center}
  .ts-close:hover{color:#fff;border-color:var(--accent)}
  .ts-options{display:grid;gap:12px}
  .ts-option{display:flex;align-items:center;gap:12px;text-align:left;padding:16px;border:1px solid var(--border);border-radius:14px;background:var(--panel);transition:.15s}
  .ts-option:hover{border-color:var(--accent);background:var(--panel2)}
  .ts-option.picked{border-color:var(--accent);background:var(--accent-soft)}
  .ts-radio{flex:none;width:20px;height:20px;border-radius:50%;border:2px solid var(--border);display:grid;place-items:center;font-size:11px;color:transparent}
  .ts-option.picked .ts-radio{border-color:var(--accent);color:var(--accent)}
  .ts-opt-icon{flex:none;width:40px;height:40px;border-radius:11px;background:rgba(139,124,255,.12);display:grid;place-items:center;font-size:20px}
  .ts-opt-txt{flex:1;min-width:0}
  .ts-opt-txt b{display:block;font-size:15px;margin-bottom:3px}
  .ts-opt-txt small{color:var(--muted);font-size:12px;line-height:1.5;display:block}
  .ts-arrow{flex:none;color:var(--accent);font-size:15px}
  .ts-video-form{margin-top:14px;padding:16px;border:1px solid var(--border);border-radius:14px;background:var(--panel);display:grid;gap:10px;animation:tsIn .2s ease}
  .ts-label{font:800 11px monospace;letter-spacing:.1em;color:var(--muted)}
  .ts-video-form input{width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:10px;background:var(--panel2);color:var(--text);font:inherit;font-size:13px}
  .ts-video-form input::placeholder{color:var(--muted)}
  .ts-actions{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap}
  .ts-btn{padding:12px 18px;border-radius:10px;font-size:13px;font-weight:800;border:1px solid var(--accent)}
  .ts-btn.ghost{background:transparent;color:var(--muted);border-color:var(--border)}
  .ts-btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
  .setup-btn{color:var(--accent)}

  /* ============ TEACHER TOOLS POPUP ============ */
  .tt-scrim{position:fixed;inset:0;z-index:72;display:grid;place-items:center;padding:18px;background:rgba(8,11,22,.72);backdrop-filter:blur(10px);animation:tsIn .25s ease}
  .tt-card{width:min(540px,100%);max-height:92dvh;overflow:auto;background:linear-gradient(165deg,#25305a,#141b30);border:1px solid var(--accent);border-radius:20px;padding:24px;box-shadow:0 30px 80px rgba(0,0,0,.6)}
  .tt-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
  .tt-tab{display:flex;align-items:center;justify-content:center;gap:7px;padding:12px 8px;border-radius:12px;border:1px solid var(--border);background:var(--panel);color:var(--muted);font-weight:800;font-size:13px;transition:.15s}
  .tt-tab:hover{border-color:var(--accent);color:var(--text)}
  .tt-tab.on{background:var(--accent-soft);border-color:var(--accent);color:#fff;box-shadow:0 0 0 1px var(--accent)}
  .tt-tab-ico{font-size:16px}
  .tt-panel{display:grid;gap:11px;animation:tsIn .2s ease}
  .tt-drop{display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;padding:22px 16px;border:1.5px dashed var(--border);border-radius:14px;background:var(--panel);cursor:pointer;transition:.15s}
  .tt-drop:hover{border-color:var(--accent);background:var(--panel2)}
  .tt-drop.filled{border-style:solid;border-color:var(--green);background:rgba(34,197,94,.08)}
  .tt-drop-ico{font-size:28px}
  .tt-drop b{font-size:13.5px;color:var(--text)}
  .tt-drop small{color:var(--muted);font-size:11.5px}
  .tt-label{font:800 11px monospace;letter-spacing:.1em;color:var(--muted)}
  .tt-label small{font-weight:600;text-transform:none;letter-spacing:0;color:var(--muted)}
  .tt-label .req{color:var(--live)}
  .tt-input{width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:10px;background:var(--panel2);color:var(--text);font:inherit;font-size:13.5px}
  .tt-input::placeholder{color:var(--muted)}
  .tt-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(124,108,249,.15)}
  .tt-input.area{resize:vertical;min-height:74px;line-height:1.5}
  .tt-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .tt-actions{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;margin-top:4px}
  .tt-msg{font-size:12.5px;line-height:1.5;color:#fca5a5}
  .tt-msg.ok{color:#86efac}
  .tt-callout{display:flex;gap:11px;align-items:flex-start;padding:13px 14px;border:1px solid rgba(124,108,249,.35);border-radius:12px;background:var(--accent-soft)}
  .tt-callout span{font-size:19px;flex:none}
  .tt-callout p{margin:0;font-size:12.5px;line-height:1.55;color:#e6e2ff}
  .tt-note{margin:2px 0 0;font-size:11.5px;line-height:1.5;color:var(--muted)}
  /* Manual-vs-AI segmented switch (first / second option in each tool) */
  .tt-seg{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:4px;border:1px solid var(--border);border-radius:12px;background:var(--panel)}
  .tt-seg-btn{padding:10px 8px;border:none;border-radius:9px;background:transparent;color:var(--muted);font-weight:800;font-size:12.5px;cursor:pointer;transition:.15s}
  .tt-seg-btn:hover{color:var(--text)}
  .tt-seg-btn.on{background:var(--accent);color:#fff;box-shadow:0 4px 14px rgba(124,108,249,.35)}
  /* MiroFish AI assist blocks */
  .tt-ai{display:grid;gap:10px;padding:14px;border:1px solid rgba(124,108,249,.4);border-radius:14px;background:linear-gradient(160deg,rgba(124,108,249,.14),rgba(124,108,249,.05))}
  .tt-ai p{margin:0;font-size:12.5px;line-height:1.55;color:#e6e2ff}
  .tt-ai-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}
  .ts-btn.ai{background:linear-gradient(135deg,#7c6cf9,#5b8def);border-color:transparent;color:#fff}
  .ts-btn.ai:disabled{opacity:.5;cursor:not-allowed}
  /* Manual quiz builder */
  .tt-qcard{display:grid;gap:10px;padding:14px;border:1px solid var(--border);border-radius:14px;background:var(--panel)}
  .tt-opt{display:grid;grid-template-columns:auto auto 1fr;gap:9px;align-items:center;padding:7px 9px;border:1px solid var(--border);border-radius:10px;transition:.15s}
  .tt-opt.correct{border-color:var(--green);background:rgba(34,197,94,.08)}
  .tt-opt-radio{width:20px;height:20px;border-radius:50%;border:2px solid var(--muted);background:transparent;cursor:pointer;padding:0;transition:.15s}
  .tt-opt-radio.on{border-color:var(--green);background:var(--green);box-shadow:inset 0 0 0 3px var(--panel)}
  .tt-opt-letter{font:800 12px monospace;color:var(--muted)}
  .tt-opt.correct .tt-opt-letter{color:var(--green)}
  .tt-input.opt{padding:9px 11px}
  .tt-add{justify-self:start;margin-top:2px}
  /* Review list of the questions being launched */
  .tt-qlist{display:grid;gap:7px;padding:12px;border:1px solid var(--accent);border-radius:14px;background:var(--accent-soft)}
  .tt-qlist-head{font:800 11px monospace;letter-spacing:.08em;color:var(--text)}
  .tt-qrow{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border:1px solid var(--border);border-radius:10px;background:var(--panel)}
  .tt-qnum{font:800 12px monospace;color:var(--accent);flex:none}
  .tt-qtext{flex:1;font-size:12.5px;line-height:1.5;color:var(--text)}
  .tt-qdel{flex:none;width:24px;height:24px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--muted);font-size:11px;cursor:pointer;transition:.15s}
  .tt-qdel:hover{border-color:var(--live);color:var(--live)}
  /* Timetable rows editor (day · time · subject) */
  .tt-tt-row{display:grid;grid-template-columns:118px 104px 1fr auto;gap:8px;align-items:center}
  .tt-tt-row .tt-input{padding:10px 11px}
  @media (max-width:900px){
    .tt-card{padding:18px}
    .tt-tab span.txt{display:none}
    .tt-row2{grid-template-columns:1fr}
  }
  /* Live meeting stage for the teacher */
  .live-stage-view{position:absolute;inset:24px;border-radius:var(--radius)}
  .live-room{position:relative;width:100%;height:100%;background:#000;border-radius:var(--radius);overflow:hidden}
  .live-camera-video{width:100%;height:100%;object-fit:contain}
  .live-air{position:absolute;top:14px;left:14px;display:flex;align-items:center;gap:8px;background:rgba(239,68,68,.92);color:#fff;padding:7px 13px;border-radius:999px;font-size:12px;font-weight:800;letter-spacing:.06em;box-shadow:0 6px 18px rgba(0,0,0,.4)}
  .live-air .dot{width:9px;height:9px;border-radius:50%;background:#fff;animation:pulse 1.5s infinite}
  .live-end{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:8px;background:var(--live);color:#fff;border:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.5);transition:.15s;z-index:3}
  .live-end:hover{filter:brightness(1.12)}
  .live-end.cancel{position:static;transform:none;margin-top:6px;background:var(--panel2);border:1px solid var(--border)}
/* Live stage is a column: the big video on top, the student video wall below. */
.live-stage-view{display:flex;flex-direction:column;gap:10px}
.live-room{flex:1 1 auto;height:auto;min-height:0}
/* Student <-> student video wall inside the live class */
.live-wall{display:flex;gap:10px;overflow-x:auto;flex:0 0 auto;padding-bottom:2px}
.live-wall-tile{position:relative;flex:0 0 auto;width:180px;height:108px;border-radius:10px;overflow:hidden;background:#000;border:1px solid var(--border)}
.live-wall-tile video{width:100%;height:100%;object-fit:cover}
.live-wall-name{position:absolute;left:0;right:0;bottom:0;padding:4px 8px;font-size:11px;font-weight:700;color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.78))}
@media (max-width:900px){.live-wall-tile{width:132px;height:82px}}

  /* ---- Class-start gate overlay (lesson loaded, waiting for the teacher) ---- */
  .video-shell{position:relative}
  .class-wait-overlay{position:absolute;inset:0;display:grid;place-items:center;background:rgba(10,14,28,.74);backdrop-filter:blur(3px);z-index:5;border-radius:inherit}
  .cwo-card{max-width:340px;text-align:center;padding:22px 26px;background:var(--panel);border:1px solid var(--border);border-radius:14px;color:var(--text);box-shadow:0 12px 34px rgba(0,0,0,.45)}
  .cwo-card b{display:block;font-size:15px;margin-bottom:8px}
  .cwo-card p{margin:0;font-size:12.5px;line-height:1.55;color:var(--muted)}
  .cwo-dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--gold);margin-bottom:10px;box-shadow:0 0 0 4px rgba(234,179,8,.16);animation:cwo-pulse 1.6s ease-in-out infinite}
  @keyframes cwo-pulse{0%,100%{opacity:.55}50%{opacity:1}}
</style>