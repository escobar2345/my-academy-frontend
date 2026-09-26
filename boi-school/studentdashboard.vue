<template>
  <div class="min-h-screen bg-[#070b15] text-white font-sans antialiased overflow-x-hidden selection:bg-[#3ce6c3]/30">
    <!-- Three.js canvas -->
    <canvas ref="threeCanvas" class="fixed inset-0 w-full h-full pointer-events-none z-0" />
    <!-- Grid overlay -->
    <div class="fixed inset-0 z-0 pointer-events-none opacity-40 bg-[linear-gradient(to_right,rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_90%_70%_at_50%_20%,black_30%,transparent_75%)]" />
    <!-- Ambient glows -->
    <div class="fixed -left-40 -top-32 w-[520px] h-[520px] rounded-full blur-[100px] bg-[#3ce6c3]/10 pointer-events-none z-0" />
    <div class="fixed -right-44 -bottom-40 w-[560px] h-[560px] rounded-full blur-[100px] bg-[#ffb454]/10 pointer-events-none z-0" />

    <!-- Progress bar -->
    <div
      ref="progressBar"
      class="fixed top-0 left-0 h-[3px] w-0 z-50 bg-gradient-to-r from-[#3ce6c3] to-[#ffb454] transition-[width] duration-500"
    />

    <!-- Mobile header -->
    <header class="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-[#090e1a]/95 backdrop-blur-xl">
      <button @click="mobileMenuOpen = true" class="w-10 h-10 rounded-xl border border-white/[0.06] bg-[#101a2e] grid place-items-center">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-[conic-gradient(from_210deg,#3ce6c3,#7db1ff,#ffb454,#3ce6c3)] grid place-items-center font-serif text-[#08131f] text-sm font-semibold">{{ brandInitial }}</div>
        <span class="font-serif text-lg tracking-tight truncate max-w-[180px]">{{ brandFirst }}<i v-if="brandAccent" class="text-[#3ce6c3]">{{ brandAccent }}</i></span>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <div class="relative">
          <button @click.stop="bellOpen = !bellOpen" class="w-10 h-10 rounded-xl border border-white/[0.06] bg-[#101a2e] grid place-items-center">
            <BellIcon class="w-[18px] h-[18px] text-slate-400" />
            <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 min-w-[17px] h-[17px] rounded-full bg-[#ff7a6b] text-white text-[10px] font-bold grid place-items-center px-1">{{ unreadCount }}</span>
          </button>
          <Transition name="pop">
            <div v-if="bellOpen" class="absolute right-0 top-12 w-[300px] bg-[#101a2e] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/60 p-2 z-50">
              <div v-for="(n, i) in notifications" :key="i" @click="readNotif(i)" class="flex gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-[#3ce6c3]/5 transition">
                <span :class="['w-2 h-2 rounded-full mt-2 shrink-0', n.read ? 'bg-slate-500' : 'bg-[#3ce6c3]']"></span>
                <div class="min-w-0">
                  <p class="text-[13px] font-semibold truncate">{{ n.text }}</p>
                  <small class="text-slate-500 text-[11px]">{{ n.meta }}</small>
                </div>
              </div>
            </div>
          </Transition>
        </div>
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1d3a5f] to-[#122544] border border-white/[0.1] grid place-items-center font-serif text-[#3ce6c3] text-[13px]">{{ studentInitials }}</div>
      </div>
    </header>

    <!-- Mobile menu overlay -->
    <Transition name="slide">
      <div v-if="mobileMenuOpen" class="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" @click="mobileMenuOpen = false">
        <div class="w-[280px] h-full bg-gradient-to-b from-[#0d1424] to-[#080c16] border-r border-white/[0.06] p-5 overflow-y-auto" @click.stop>
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[conic-gradient(from_210deg,#3ce6c3,#7db1ff,#ffb454,#3ce6c3)] grid place-items-center font-serif text-[#08131f] text-lg font-semibold">{{ brandInitial }}</div>
              <div>
                <div class="font-serif text-xl tracking-tight truncate max-w-[200px]">{{ brandFirst }}<i v-if="brandAccent" class="text-[#3ce6c3]">{{ brandAccent }}</i></div>
                <div class="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Student Portal</div>
              </div>
            </div>
            <button @click="mobileMenuOpen = false" class="w-10 h-10 rounded-xl border border-white/[0.06] grid place-items-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="flex items-center gap-3 p-3 border border-white/[0.06] rounded-2xl bg-gradient-to-br from-[#3ce6c3]/5 to-transparent mb-6">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1d3a5f] to-[#122544] border border-white/[0.1] grid place-items-center font-mono text-sm text-[#3ce6c3] shrink-0">{{ studentInitials }}</div>
            <div class="min-w-0">
              <div class="font-semibold text-[14.5px] tracking-tight">{{ studentNameLine }}</div>
              <div class="text-[11px] font-mono tracking-wide text-slate-400">{{ studentIdLine }}</div>
              <span class="inline-block mt-1 text-[9.5px] font-bold tracking-[0.14em] uppercase px-2 py-0.5 rounded-md bg-[#ffb454]/15 text-[#ffb454]">{{ studentCohort }}</span>
            </div>
          </div>

          <nav class="flex flex-col gap-1 mb-6">
            <button
              v-for="item in navItems"
              :key="item.id"
              @click="item.id === 'roadmap' ? goRoadmap() : go(item.id); mobileMenuOpen = false"
              :class="[
                'flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl font-medium text-[14px] border transition-all duration-300',
                currentView === item.id
                  ? 'text-[#05221b] bg-gradient-to-br from-[#3ce6c3] to-[#8ff2da] font-semibold shadow-lg shadow-[#3ce6c3]/30'
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-[#3ce6c3]/5'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5 shrink-0" />
              <span>{{ item.label }}</span>
              <span v-if="item.pill" :class="['ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full', currentView === item.id ? 'bg-black/20 text-[#05221b]' : 'bg-[#ff7a6b]/20 text-[#ff7a6b]']">{{ item.pill }}</span>
            </button>
          </nav>

          <button @click="go('chat'); mobileMenuOpen = false" class="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-br from-[#25d366] to-[#128c5e] text-[#04140b] font-semibold text-[14px] shadow-lg shadow-[#25d366]/25 mb-3">
            <WhatsAppIcon class="w-[17px] h-[17px]" /> Cohort WhatsApp
          </button>
          <button @click="toast('You have been signed out.', 'warn'); mobileMenuOpen = false" class="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-500 text-[13px] font-medium hover:text-[#ff7a6b]">
            <LogOutIcon class="w-4 h-4" /> Log out
          </button>
        </div>
      </div>
    </Transition>

    <!-- Main grid -->
    <div class="relative z-10 grid lg:grid-cols-[280px_1fr] max-w-[1580px] mx-auto min-h-screen">
      <!-- ================= SIDEBAR (Desktop only) ================= -->
      <aside class="hidden lg:flex sticky top-0 h-screen flex-col gap-4 p-5 border-r border-white/[0.06] bg-gradient-to-b from-[#0d1424]/95 to-[#080c16]/85 backdrop-blur-xl overflow-hidden">
        <div class="flex items-center gap-3 px-1.5">
          <div class="w-10 h-10 rounded-xl bg-[conic-gradient(from_210deg,#3ce6c3,#7db1ff,#ffb454,#3ce6c3)] grid place-items-center font-serif text-[#08131f] text-lg font-semibold shadow-lg shadow-[#3ce6c3]/30">{{ brandInitial }}</div>
          <div>
            <div class="font-serif text-xl tracking-tight truncate max-w-[200px]">{{ brandFirst }}<i v-if="brandAccent" class="text-[#3ce6c3]">{{ brandAccent }}</i></div>
            <div class="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Student Portal</div>
          </div>
        </div>

        <div class="flex items-center gap-3 p-3 border border-white/[0.06] rounded-2xl bg-gradient-to-br from-[#3ce6c3]/5 to-transparent">
          <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1d3a5f] to-[#122544] border border-white/[0.1] grid place-items-center font-mono text-sm text-[#3ce6c3] shrink-0">{{ studentInitials }}</div>
          <div>
            <div class="font-semibold text-[14.5px] tracking-tight">{{ studentNameLine }}</div>
            <div class="text-[11px] font-mono tracking-wide text-slate-400">{{ studentIdLine }}</div>
            <span class="inline-block mt-1 text-[9.5px] font-bold tracking-[0.14em] uppercase px-2 py-0.5 rounded-md bg-[#ffb454]/15 text-[#ffb454]">{{ studentCohort }}</span>
          </div>
        </div>

        <div class="px-2 text-[10px] uppercase tracking-[0.26em] text-slate-500 font-semibold mt-2">Navigate</div>

        <nav class="flex flex-col gap-1 overflow-y-auto pr-1">
          <button
            v-for="item in navItems"
            :key="item.id"
            @click="item.id === 'roadmap' ? goRoadmap() : go(item.id)"
            :class="[
              'flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl font-medium text-[13.5px] border transition-all duration-300',
              currentView === item.id
                ? 'text-[#05221b] bg-gradient-to-br from-[#3ce6c3] to-[#8ff2da] font-semibold shadow-lg shadow-[#3ce6c3]/30'
                : 'text-slate-400 border-transparent hover:text-white hover:bg-[#3ce6c3]/5 hover:border-white/[0.06] hover:translate-x-1'
            ]"
          >
            <component :is="item.icon" class="w-[18px] h-[18px] shrink-0" />
            <span>{{ item.label }}</span>
            <span v-if="item.pill" :class="['ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full', currentView === item.id ? 'bg-black/20 text-[#05221b]' : 'bg-[#ff7a6b]/20 text-[#ff7a6b]']">{{ item.pill }}</span>
          </button>
        </nav>

        <div class="mt-auto flex flex-col gap-2">
          <button @click="go('chat')" class="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-br from-[#25d366] to-[#128c5e] text-[#04140b] font-semibold text-[13.5px] shadow-lg shadow-[#25d366]/25 hover:-translate-y-0.5 hover:shadow-[#25d366]/40 transition-all duration-300">
            <WhatsAppIcon class="w-[17px] h-[17px]" /> Cohort WhatsApp
          </button>
          <button @click="toast('You have been signed out.', 'warn')" class="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 text-[12.5px] font-medium hover:text-[#ff7a6b] hover:bg-[#ff7a6b]/5 transition">
            <LogOutIcon class="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>

      <!-- ================= MAIN ================= -->
      <main class="flex flex-col min-w-0 h-screen overflow-hidden">
        <!-- Topbar (Desktop only) -->
        <header class="hidden lg:flex sticky top-0 z-30 items-center gap-4 px-7 py-3.5 border-b border-white/[0.06] bg-[#090e1a]/80 backdrop-blur-xl">
          <div class="text-[13px] text-slate-500 font-medium">
            Portal / <span class="font-serif text-white text-base tracking-tight">{{ pageTitle }}</span>
          </div>
          <div class="ml-auto flex items-center gap-2 bg-[#101a2e] border border-white/[0.06] rounded-xl px-3 py-2 w-[250px] focus-within:border-[#3ce6c3]/50 focus-within:ring-4 focus-within:ring-[#3ce6c3]/10 transition">
            <SearchIcon class="w-4 h-4 text-slate-500" />
            <input v-model="globalSearch" @keydown.enter="jumpToLibrary" type="text" placeholder="Search materials, classes…" class="bg-transparent border-none outline-none text-[13px] text-white w-full placeholder:text-slate-500" />
          </div>
          <div class="font-mono text-[13px] text-[#3ce6c3] bg-[#3ce6c3]/8 border border-[#3ce6c3]/25 px-3 py-1.5 rounded-lg tracking-[0.1em] tabular-nums">{{ clockTime }}</div>
          <div class="relative" ref="bellWrap">
            <button @click.stop="bellOpen = !bellOpen" class="relative w-[38px] h-[38px] rounded-xl border border-white/[0.06] bg-[#101a2e] grid place-items-center hover:-translate-y-0.5 hover:border-white/[0.12] transition">
              <BellIcon class="w-[17px] h-[17px] text-slate-400" />
              <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 min-w-[17px] h-[17px] rounded-full bg-[#ff7a6b] text-white text-[10px] font-bold grid place-items-center px-1">{{ unreadCount }}</span>
            </button>
            <Transition name="pop">
              <div v-if="bellOpen" class="absolute right-0 top-12 w-[320px] bg-[#101a2e] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/60 p-2 z-40">
                <div v-for="(n, i) in notifications" :key="i" @click="readNotif(i)" class="flex gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-[#3ce6c3]/5 transition">
                  <span :class="['w-2 h-2 rounded-full mt-2 shrink-0', n.read ? 'bg-slate-500' : 'bg-[#3ce6c3]']"></span>
                  <div>
                    <p class="text-[13px] font-semibold">{{ n.text }}</p>
                    <small class="text-slate-500 text-[11px]">{{ n.meta }}</small>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
          <div class="w-[38px] h-[38px] rounded-xl bg-gradient-to-br from-[#1d3a5f] to-[#122544] border border-white/[0.1] grid place-items-center font-serif text-[#3ce6c3] text-[13px]">{{ studentInitials }}</div>
        </header>

        <!-- Content -->
        <div class="p-4 lg:p-7 flex-1 min-w-0 overflow-y-auto h-full">
          <!-- ========== DASHBOARD ========== -->
          <section v-show="currentView === 'dashboard'" class="space-y-4 lg:space-y-5">
            <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div>
                <div class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">{{ dateStr }}</div>
                <h1 class="font-serif text-[clamp(24px,5vw,40px)] tracking-tight leading-tight mt-1">
                  {{ greeting }}, <span class="italic text-[#3ce6c3]">{{ student.name }}</span>
                </h1>
                <div v-if="realData" class="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-2.5 text-[11px] font-mono tracking-[0.14em] uppercase text-slate-500">
                  <span class="text-[#3ce6c3] font-semibold">{{ student.course_name }}</span>
                  <template v-if="student.experience_level"><span class="text-slate-600">·</span><span>{{ student.experience_level }}</span></template>
                  <template v-if="student.track"><span class="text-slate-600">·</span><span>{{ student.track }}</span></template>
                  <template v-if="student.current_month"><span class="text-slate-600">·</span><span>Month {{ student.current_month }}</span></template>
                  <template v-if="student.email"><span class="text-slate-600">·</span><span class="normal-case tracking-normal">{{ student.email }}</span></template>
                </div>
              </div>
              <span class="inline-flex items-center gap-2 text-[#ffb454] bg-[#ffb454]/10 border border-[#ffb454]/30 px-4 py-1.5 rounded-full text-[12.5px] font-semibold shrink-0">
                <FlameIcon class="w-4 h-4" /> 12-day study streak
              </span>
            </div>

            <div class="grid lg:grid-cols-[1.55fr_1fr] gap-4">
              <!-- Hero next class -->
              <div class="relative overflow-hidden bg-gradient-to-b from-[#101a2e] to-[#101a2e]/65 border border-white/[0.06] rounded-2xl p-4 lg:p-5 hover:border-white/[0.12] transition">
                <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#3ce6c3] to-transparent" />
                <div class="flex justify-between items-start flex-wrap gap-3">
                  <span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">{{ heroKicker }}</span>
                  <span :class="[
                    'inline-flex items-center gap-2 text-[10.5px] font-bold tracking-[0.16em] px-3 py-1 rounded-full border',
                    heroChip === 'live'
                      ? 'bg-[#ff7a6b]/15 text-[#ff7a6b] border-[#ff7a6b]/35'
                      : 'bg-[#3ce6c3]/10 text-[#3ce6c3] border-[#3ce6c3]/30'
                  ]">
                    <span :class="['w-2 h-2 rounded-full animate-pulse', heroChip === 'live' ? 'bg-[#ff7a6b]' : 'bg-[#3ce6c3]']"></span>
                    {{ heroChip === 'live' ? 'LIVE' : 'UPCOMING' }}
                  </span>
                </div>
                <div class="mt-3">
                  <span class="text-[#7db1ff] font-mono font-semibold text-[12px] tracking-[0.18em]">{{ heroClass.code }}</span>
                  <h2 class="font-serif text-[clamp(20px,5vw,34px)] tracking-tight mt-0.5">{{ heroClass.name }}</h2>
                </div>
                <div class="flex flex-wrap gap-x-5 gap-y-2 text-slate-400 text-[13.5px] mt-3 mb-5">
                  <span class="flex items-center gap-1.5">
                    <ClockIcon class="w-4 h-4 text-[#3ce6c3]" />
                    <span class="font-mono text-white">{{ fmt12(heroClass.start) }} – {{ fmt12(heroClass.end) }}</span>
                  </span>
                  <span class="flex items-center gap-1.5">
                    <PinIcon class="w-4 h-4 text-[#3ce6c3]" />
                    Room <span class="font-mono text-white">{{ heroClass.room }}</span>
                  </span>
                </div>
                <div class="flex gap-2 items-stretch flex-wrap mb-5">
                  <span class="self-center text-[12.5px] text-slate-400 leading-snug">{{ cdLabel }}</span>
                  <div class="bg-[#3ce6c3]/5 border border-[#3ce6c3]/20 rounded-xl px-3 py-2 text-center min-w-[68px]">
                    <b class="block font-mono tabular-nums text-xl lg:text-2xl text-[#3ce6c3]">{{ countdown.h }}</b>
                    <span class="text-[9px] uppercase tracking-[0.22em] text-slate-500 font-bold">Hours</span>
                  </div>
                  <div class="bg-[#3ce6c3]/5 border border-[#3ce6c3]/20 rounded-xl px-3 py-2 text-center min-w-[68px]">
                    <b class="block font-mono tabular-nums text-xl lg:text-2xl text-[#3ce6c3]">{{ countdown.m }}</b>
                    <span class="text-[9px] uppercase tracking-[0.22em] text-slate-500 font-bold">Min</span>
                  </div>
                  <div class="bg-[#3ce6c3]/5 border border-[#3ce6c3]/20 rounded-xl px-3 py-2 text-center min-w-[68px]">
                    <b class="block font-mono tabular-nums text-xl lg:text-2xl text-[#3ce6c3]">{{ countdown.s }}</b>
                    <span class="text-[9px] uppercase tracking-[0.22em] text-slate-500 font-bold">Sec</span>
                  </div>
                </div>
                <div class="flex flex-col sm:flex-row gap-2.5">
                  <button @click="goToClassroom()" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#3ce6c3] to-[#7ceecd] text-[#05231b] font-semibold text-[13px] shadow-lg shadow-[#3ce6c3]/25 hover:-translate-y-0.5 hover:shadow-[#3ce6c3]/40 transition-all">
                    <RoomIcon class="w-4 h-4" /> {{ heroClass.room === 'Live Online' ? 'Go to Classroom' : 'Go to Classroom ' + heroClass.room }}
                  </button>
                  <button @click="go('library')" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 hover:bg-[#3ce6c3]/5 transition-all text-[13px]">
                    <BookIcon class="w-4 h-4" /> Lab materials
                  </button>
                  <button @click="go('chat')" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 transition-all text-[13px]">
                    <ChatIcon class="w-4 h-4" /> Ask cohort
                  </button>
                </div>
              </div>

              <!-- CGPA card -->
              <div class="relative overflow-hidden bg-gradient-to-b from-[#101a2e] to-[#101a2e]/65 border border-white/[0.06] rounded-2xl p-4 lg:p-5 hover:border-white/[0.12] transition flex flex-col gap-3.5">
                <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#ffb454] to-transparent" />
                <div class="flex justify-between items-center">
                  <span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Academic Performance</span>
                  <button @click="go('grades')" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 hover:border-[#3ce6c3]/50 transition-all text-[12px]">Full report →</button>
                </div>
                <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div class="relative w-[128px] h-[128px] shrink-0">
                    <svg class="-rotate-90" width="128" height="128" viewBox="0 0 128 128">
                      <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(148,163,184,0.12)" stroke-width="10" />
                      <circle cx="64" cy="64" r="54" fill="none" stroke="url(#gradArc)" stroke-width="10" stroke-linecap="round" stroke-dasharray="339.3" :stroke-dashoffset="dial1Offset" class="transition-[stroke-dashoffset] duration-[1600ms] ease-out" />
                      <defs>
                        <linearGradient id="gradArc" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stop-color="#ffb454" /><stop offset="100%" stop-color="#3ce6c3" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div class="absolute inset-0 grid place-items-center text-center">
                      <div>
                        <b class="font-serif text-[27px] text-[#ffb454] font-semibold tabular-nums">{{ dial1Num }}</b>
                        <small class="block text-[8.5px] uppercase tracking-[0.2em] text-slate-500 font-bold mt-0.5">CGPA / 4.00</small>
                      </div>
                    </div>
                  </div>
                  <div class="text-center sm:text-left">
                    <div class="text-[#3ce6c3] font-semibold text-[13px]">▲ +0.14 this semester</div>
                    <p class="text-slate-400 text-[12.5px] mt-1 leading-relaxed">Top 8% of {{ studentCohort }}</p>
                    <div class="flex gap-2 items-end h-[62px] mt-3 justify-center sm:justify-start">
                      <div v-for="(s, i) in semesters" :key="i" class="w-[22px] rounded-t transition-all duration-[1200ms] ease-out relative" :class="i === 3 ? 'bg-gradient-to-t from-[#ffb454]/30 to-[#ffb454]' : 'bg-gradient-to-t from-[#7db1ff]/25 to-[#7db1ff]/85'" :style="{ height: (s.g / 4 * 100) + '%' }">
                        <small class="absolute bottom-[-17px] left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-500 font-semibold">{{ s.l }}</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2 mt-1">
                  <button @click="go('grades')" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-br from-[#ffb454] to-[#ffd08d] text-[#241300] font-semibold text-[12px] shadow-lg shadow-[#ffb454]/25 hover:-translate-y-0.5 transition-all">View course grades</button>
                  <button @click="toast('Transcript request sent to Records Office.')" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 transition-all text-[12px]">Request transcript</button>
                </div>
              </div>
            </div>

            <div class="grid lg:grid-cols-[1.55fr_1fr] gap-4">
              <!-- Today's classes -->
              <div class="bg-gradient-to-b from-[#101a2e] to-[#101a2e]/65 border border-white/[0.06] rounded-2xl p-4 lg:p-5 hover:border-white/[0.12] transition">
                <div class="flex justify-between items-center mb-3">
                  <h3 class="font-serif text-[18px] lg:text-[19px] tracking-tight">Today's Classes</h3>
                  <button @click="go('timetable')" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 transition-all text-[12px]">Full week →</button>
                </div>
                <div v-if="today.length" class="space-y-2">
                  <div v-for="(c, ci) in today" :key="c.code" class="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-white/[0.06] last:border-b-0">
                    <div class="font-mono tabular-nums text-[11.5px] text-slate-400 sm:w-[96px] shrink-0">
                      <b class="block text-white text-[14px] font-semibold">{{ fmt12(c.start) }}</b>
                      {{ fmt12(c.end) }}
                    </div>
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                      <span :class="['w-2.5 h-2.5 rounded-[3px] rotate-45 shrink-0', dotClass[c.color]]"></span>
                      <div class="min-w-0 flex-1">
                        <div class="font-semibold text-[14px] truncate">{{ c.name }}</div>
                        <small class="text-slate-500 text-[11.5px]">{{ c.code }} · {{ c.building }}</small>
                      </div>
                      <span :class="[
                        'text-[9.5px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded-full shrink-0',
                        classStatus(c) === 'done' ? 'bg-slate-400/10 text-slate-500' :
                        classStatus(c) === 'live' ? 'bg-[#ff7a6b]/15 text-[#ff7a6b] animate-pulse' :
                        classStatus(c) === 'up' ? 'bg-[#3ce6c3]/15 text-[#3ce6c3]' :
                        'bg-[#7db1ff]/10 text-[#7db1ff]'
                      ]">
                        {{ classStatus(c) === 'done' ? 'Done' : classStatus(c) === 'live' ? '● Live' : classStatus(c) === 'up' ? 'Up next' : 'Later' }}
                      </span>
                    </div>
                    <div class="flex gap-2 sm:ml-auto">
                      <button @click="openRoom(c.room, c.name)" class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 hover:border-[#3ce6c3]/50 transition-all text-[12px] flex-1 sm:flex-none">
                        <PinIcon class="w-3.5 h-3.5" /> {{ c.room }}
                      </button>
                      <button v-if="classStatus(c) === 'live'" @click="joinClass(c.room, c.name, ci + 1)" class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-[#3ce6c3] to-[#7ceecd] text-[#05231b] font-semibold text-[12px] hover:-translate-y-0.5 transition-all flex-1 sm:flex-none">Join →</button>
                    </div>
                  </div>
                </div>
                <p v-else class="text-slate-500 text-[12.5px] py-6 text-center leading-relaxed">No classes scheduled for today from your {{ student.course_name || 'course' }} timetable.<br />Sessions land here automatically as soon as the school server publishes them.</p>
              </div>

              <div class="flex flex-col gap-4 min-w-0">
                <!-- Quick actions -->
                <div class="bg-gradient-to-b from-[#101a2e] to-[#101a2e]/65 border border-white/[0.06] rounded-2xl p-4 lg:p-5 hover:border-white/[0.12] transition">
                  <span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Quick Actions</span>
                  <div class="grid grid-cols-2 gap-2.5 mt-3">
                    <button v-for="(q, i) in quickActions" :key="i" @click="q.action()" class="group relative flex flex-col items-start gap-2 p-3 border border-white/[0.06] rounded-xl bg-white/[0.015] text-left hover:-translate-y-0.5 hover:border-[#3ce6c3]/40 hover:bg-[#3ce6c3]/5 transition-all overflow-hidden">
                      <span :class="['w-[34px] h-[34px] rounded-lg grid place-items-center', q.bgClass]">
                        <component :is="q.icon" class="w-[17px] h-[17px]" :class="q.iconColor" />
                      </span>
                      <b class="text-[13px]">{{ q.title }}</b>
                      <small class="text-slate-500 text-[11px] -mt-1">{{ q.sub }}</small>
                      <span class="absolute right-3 top-3 text-slate-500 group-hover:text-[#3ce6c3] group-hover:translate-x-1 transition">→</span>
                    </button>
                  </div>
                </div>

                <!-- Saved -->
                <div class="bg-gradient-to-b from-[#101a2e] to-[#101a2e]/65 border border-white/[0.06] rounded-2xl p-4 lg:p-5 hover:border-white/[0.12] transition">
                  <div class="flex justify-between items-center">
                    <span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Saved For Later</span>
                    <button @click="go('library')" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 transition-all text-[12px]">Library</button>
                  </div>
                  <div class="flex gap-2 flex-wrap mt-3">
                    <template v-if="savedDocs.length">
                      <button v-for="d in savedDocs" :key="d.id" @click="goAndHighlight(d.id)" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#ffb454]/35 bg-[#ffb454]/10 text-[#ffb454] text-[12px] font-semibold hover:-translate-y-0.5 hover:bg-[#ffb454]/20 transition">
                        <StarIcon class="w-3 h-3 fill-current" /> {{ truncate(d.title, 20) }}
                      </button>
                    </template>
                    <p v-else class="text-slate-500 text-[12.5px] py-2">Nothing saved yet — use the ★ button on any library document.</p>
                  </div>
                </div>

                <!-- Announcements -->
                <div class="bg-gradient-to-b from-[#101a2e] to-[#101a2e]/65 border border-white/[0.06] rounded-2xl p-4 lg:p-5 hover:border-white/[0.12] transition">
                  <span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Announcements</span>
                  <div class="mt-2">
                    <div v-for="(a, i) in announcements" :key="i" class="flex gap-3 py-3 border-b border-dashed border-white/[0.06] last:border-b-0">
                      <span class="w-2 h-2 rounded-full mt-[9px] shrink-0" :class="dotClass[a.color]"></span>
                      <div class="min-w-0">
                        <p class="text-[13px] font-semibold leading-snug">{{ a.text }}</p>
                        <small class="text-slate-500 text-[11px]">{{ a.meta }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ========== TIMETABLE ========== -->
          <section v-if="currentView === 'timetable'" class="space-y-4 lg:space-y-5">
            <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div>
                <span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Schedule · {{ timetable && timetable.month_title ? timetable.month_title : 'Current month' }}</span>
                <h1 class="font-serif text-[clamp(24px,5vw,40px)] tracking-tight mt-1">My <i class="text-[#3ce6c3]">Timetable</i></h1>
                <p class="text-slate-400 text-[13.5px] mt-1.5 leading-relaxed max-w-xl hidden sm:block">Daily live classes — every day at <span class="text-slate-300">{{ student.preferred_time || '18:00' }} WAT</span>, the hour you chose at registration — each one from your <span class="text-slate-300">{{ student.course_name || 'registered course' }}</span> roadmap.</p>
              </div>
              <div class="flex gap-2 w-full sm:w-auto">
                <button @click="toast('Timetable synced to your calendar.')" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 transition-all text-[13px] font-semibold">
                  <CalendarIcon class="w-4 h-4" /> <span class="hidden sm:inline">Sync</span>
                </button>
                <button @click="toast('Generating your course timetable PDF…')" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#3ce6c3] to-[#7ceecd] text-[#05231b] font-semibold text-[13px] shadow-lg shadow-[#3ce6c3]/25 hover:-translate-y-0.5 transition-all">
                  <DownloadIcon class="w-4 h-4" /> <span class="hidden sm:inline">Download PDF</span>
                </button>
              </div>
            </div>


            <!-- Weekly grid — at-a-glance daily class schedule (shown first) -->
            <div class="bg-gradient-to-b from-[#101a2e] to-[#101a2e]/65 border border-white/[0.06] rounded-2xl p-3 lg:p-5 hover:border-white/[0.12] transition">
              <div class="overflow-x-auto -mx-3 lg:-mx-5 px-3 lg:px-5">
                <div v-if="weekHasSessions" class="grid grid-cols-7 gap-2 lg:gap-3 min-w-[1050px]">
                  <div v-for="(blocks, day) in week" :key="day" :class="['border rounded-xl lg:rounded-2xl p-2 lg:p-3 flex flex-col gap-2 min-h-[360px] lg:min-h-[420px]', day === todayShort ? 'bg-[#3ce6c3]/5 border-[#3ce6c3]/50 shadow-xl shadow-black/40 ring-1 ring-[#3ce6c3]/30' : 'bg-white/[0.015] border-white/[0.06]']">
                    <div class="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                      <span class="font-serif text-[13px] lg:text-[15px] tracking-tight font-semibold">{{ day }}</span>
                      <span v-if="day === todayShort" class="text-[9px] tracking-[0.16em] text-[#3ce6c3] font-bold">● TODAY</span>
                    </div>
                    <div v-for="b in blocks" :key="b[0] + b[1]" @click="openScheduledClass(b[2], b[1])" class="border-l-[3px] rounded-lg p-2 lg:p-2.5 cursor-pointer hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/50 transition-all" :class="hueBlock[b[3]]">
                      <b class="text-[11px] lg:text-[12.5px] font-semibold block leading-snug">{{ b[1] }}</b>
                      <span class="text-[9px] lg:text-[10.5px] text-slate-400 font-mono mt-1 block">🕐 {{ b[0] }}</span>
                      <span class="inline-flex items-center gap-1 mt-1.5 text-[9px] lg:text-[10px] font-bold px-1.5 lg:px-2 py-0.5 rounded" :class="hueChip[b[3]]">
                        <PinIcon class="w-2.5 h-2.5" /> {{ b[2] }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-else class="py-10 text-center">
                  <p class="text-slate-300 text-[14px] font-semibold">No classes on the timetable yet</p>
                  <p class="text-slate-500 text-[12.5px] mt-1.5 max-w-md mx-auto leading-relaxed">Your {{ student.course_name || 'registered course' }} schedule builds itself from the course roadmap as soon as the school server publishes it — it updates live, nothing to refresh.</p>
                  <button @click="refreshStudent(); loadTimetable(); loadClassTimetable()" class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 transition text-[12px]">Re-check now</button>
                </div>
              </div>
              <div v-if="weekHasSessions" class="flex gap-4 flex-wrap mt-4 text-[11px] lg:text-[12px] text-slate-400">
                <span class="flex items-center gap-2"><i class="w-2.5 h-2.5 rounded-[3px] rotate-45 bg-[#3ce6c3] inline-block"></i>Live class</span>
                <span class="flex items-center gap-2"><i class="w-2.5 h-2.5 rounded-[3px] rotate-45 bg-[#7db1ff] inline-block"></i>Hands-on lab</span>
                <span class="flex items-center gap-2"><i class="w-2.5 h-2.5 rounded-[3px] rotate-45 bg-[#ffb454] inline-block"></i>Project work</span>
                <span class="flex items-center gap-2"><i class="w-2.5 h-2.5 rounded-[3px] rotate-45 bg-[#ff7a6b] inline-block"></i>Review &amp; Q&amp;A</span>
              </div>
            </div>
            <!-- The teacher's published weekly class schedule (live from boirsu) -->
            <div v-if="classTimetable && classTimetable.sessions && classTimetable.sessions.length" class="border border-[#ffb454]/25 bg-[#ffb454]/[0.04] rounded-2xl p-3.5 lg:p-4">
              <div class="flex items-center justify-between gap-3 flex-wrap mb-3">
                <b class="text-[13px] font-semibold text-[#ffb454]">🗓️ {{ classTimetable.title || "Your teacher's class schedule" }}</b>
                <span class="text-[10px] text-slate-500">{{ classTimetable.teacher ? 'by ' + classTimetable.teacher + ' · ' : '' }}updated {{ classTimetable.updated || 'recently' }}</span>
              </div>
              <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <div v-for="(s, i) in classTimetable.sessions" :key="i" class="flex items-center gap-3 border border-white/[0.06] bg-white/[0.02] rounded-xl px-3 py-2.5 hover:border-[#ffb454]/40 transition">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[#ffb454] w-16 shrink-0">{{ s.day ? s.day.slice(0, 3) : '—' }}</span>
                  <span class="text-[11px] font-mono text-slate-400 w-12 shrink-0">🕐 {{ s.time }}</span>
                  <span class="text-[12.5px] text-white font-medium truncate">{{ s.subject }}</span>
                </div>
              </div>
            </div>

            <!-- AI daily lesson plan — what the student learns, class by class -->
            <div class="bg-gradient-to-b from-[#101a2e] to-[#101a2e]/65 border border-white/[0.06] rounded-2xl p-3 lg:p-5 hover:border-white/[0.12] transition">
              <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div class="min-w-0">
                  <span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Day by day · {{ dailyPlan ? (dailyPlan.month_title || 'this month') : 'this month' }}</span>
                  <h3 class="font-serif text-lg lg:text-xl tracking-tight mt-0.5">What you'll learn, <i class="text-[#3ce6c3]">class by class</i></h3>
                  <p v-if="dailyPlan && dailyPlan.days" class="text-[11.5px] text-slate-500 mt-1">
                    <span :class="dailyPlan.source === 'ai' ? 'text-[#3ce6c3] font-semibold' : 'text-[#ffb454] font-semibold'">{{ dailyPlan.source === 'ai' ? '✨ Written by MiroFish AI' : 'Standard roadmap breakdown' }}</span>
                    · {{ dailyPlan.days.length }} live classes this month
                    <span v-if="dailyPlan.track"> · {{ dailyPlan.track }}</span>
                  </p>
                </div>
                <div class="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
                  <button v-if="!planJob" @click="generateDailyPlan()" :disabled="!backendOnline || !planAiAvailable"
                    class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-[#3ce6c3] to-[#7ceecd] text-[#05231b] font-semibold text-[12px] shadow-lg shadow-[#3ce6c3]/25 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none">
                    ✨ {{ dailyPlan && dailyPlan.source === 'ai' ? 'Regenerate with AI' : 'Make it detailed with MiroFish AI' }}
                  </button>
                  <small v-if="backendOnline && !planAiAvailable && !planJob" class="text-[10px] text-slate-500 max-w-[280px] sm:text-right leading-snug">Set NVIDIA_API_KEY on the server and MiroFish AI will write each day's lesson details itself.</small>
                  <div v-if="planJob" class="sm:text-right">
                    <span class="text-[11px] text-[#3ce6c3] font-semibold">{{ planJob.step }}…</span>
                    <div class="h-[5px] w-[190px] rounded-full bg-white/[0.06] overflow-hidden mt-1">
                      <div class="h-full bg-gradient-to-r from-[#3ce6c3] to-[#7ceecd] transition-[width] duration-700" :style="{ width: (planJob.pct || 8) + '%' }"></div>
                    </div>
                    <button @click="stopPlanJob" class="text-[10px] text-slate-500 underline mt-1">hide</button>
                  </div>
                </div>
              </div>

              <p v-if="!dailyPlan || !dailyPlan.days || !dailyPlan.days.length" class="text-[12px] text-slate-400 italic py-4 text-center">Your day-by-day plan appears as soon as your registered course syncs from the school server…</p>
              <div v-else class="space-y-5">
                <div v-for="w in planWeeks" :key="w.week" class="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                  <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3ce6c3] mb-2.5">Week {{ w.week }} <span v-if="w.days.length && w.days[0].date" class="text-slate-500 font-normal normal-case tracking-normal">· starting {{ prettyDate(w.days[0].date) }}</span></p>
                  <div class="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                    <div v-for="d in w.days" :key="d.n" class="border border-white/[0.06] bg-[#0b1120]/60 rounded-xl p-3 hover:border-[#3ce6c3]/40 transition flex flex-col gap-2">
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-[10px] font-mono text-slate-400">{{ prettyDate(d.date) }} · {{ d.weekday ? d.weekday.slice(0, 3) : '—' }} {{ d.time }}</span>
                        <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-white/[0.05] text-slate-400 shrink-0">Day {{ d.n }}</span>
                      </div>
                      <b class="text-[13px] font-semibold leading-snug">{{ d.topic }}</b>
                      <span class="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded self-start" :class="hueChip[topicHue(d.topic || d.parent)]">{{ d.parent }}</span>
                      <ul v-if="d.breakdown && d.breakdown.length" class="space-y-1">
                        <li v-for="(b, bi) in d.breakdown" :key="bi" class="text-[11.5px] text-slate-400 leading-snug flex gap-1.5"><span class="text-[#3ce6c3] mt-[1px] shrink-0">▸</span><span>{{ b }}</span></li>
                      </ul>
                      <p v-if="d.task" class="text-[11px] text-[#ffb454]/90 leading-snug bg-[#ffb454]/[0.06] border border-[#ffb454]/20 rounded-lg px-2.5 py-1.5">🎯 {{ d.task }}</p>
                      <div class="flex gap-2 mt-auto pt-1">
                        <button @click="watchDayVideo(d)" :disabled="dayVideoBusy === 'd' + d.n"
                          class="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.12] text-white bg-white/[0.02] hover:border-[#3ce6c3]/50 transition text-[11px] disabled:opacity-50">
                          <EyeIcon class="w-3.5 h-3.5" /> {{ dayVideoBusy === 'd' + d.n ? 'Searching…' : 'Lesson video' }}
                        </button>
                        <button @click="openScheduledClass('Live Online', d.topic)"
                          class="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 transition text-[11px]">
                          <PinIcon class="w-3.5 h-3.5" /> Join class
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </section>

          <!-- ========== LIBRARY ========== -->
          <section v-if="currentView === 'library'" class="space-y-4 lg:space-y-5">
            <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div>
                <span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Digital Library</span>
                <h1 class="font-serif text-[clamp(24px,5vw,40px)] tracking-tight mt-1">Course <i class="text-[#3ce6c3]">Materials</i></h1>
                <p class="text-slate-400 text-[13.5px] mt-1.5 leading-relaxed max-w-xl hidden sm:block">Read materials in-app, save them for later, or download PDFs to your device.</p>
              </div>
              <button @click="toast('Queueing all new materials for download…')" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#ffb454] to-[#ffd08d] text-[#241300] font-semibold text-[13px] shadow-lg shadow-[#ffb454]/25 hover:-translate-y-0.5 transition-all">
                <DownloadIcon class="w-4 h-4" /> <span class="hidden sm:inline">Download all new</span>
              </button>
            </div>
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-2 bg-[#101a2e] border border-white/[0.06] rounded-xl px-3.5 py-2.5 w-full focus-within:border-[#3ce6c3]/50 focus-within:ring-4 focus-within:ring-[#3ce6c3]/10 transition">
                <SearchIcon class="w-4 h-4 text-slate-500" />
                <input v-model="searchQuery" type="text" placeholder="Search PDFs…" class="bg-transparent border-none outline-none text-[13.5px] text-white w-full placeholder:text-slate-500" />
              </div>
              <div class="flex gap-2 flex-wrap">
                <button v-for="t in libTags" :key="t" @click="activeTag = t" :class="['px-4 py-2 rounded-full border text-[12.5px] transition', activeTag === t ? 'bg-[#3ce6c3] text-[#05231b] border-[#3ce6c3] font-bold' : 'border-white/[0.06] text-slate-400 hover:text-white hover:border-white/[0.12]']">{{ t }}</button>
              </div>
            </div>
            <!-- Generate a course with the AI learning system (backend :5055) -->
            <div class="border rounded-2xl p-3.5 lg:p-4" :class="backendOnline ? 'border-[#3ce6c3]/25 bg-[#3ce6c3]/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'">
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <div class="min-w-0">
                  <b class="block text-[13px] font-semibold">Generate a lesson with AI</b>
                  <small class="text-[11.5px] text-slate-400">Researches the topic, writes the sections, finds videos, then quizzes you on it.</small>
                </div>
                <span class="text-[9.5px] font-bold tracking-[0.16em] uppercase px-2 py-1 rounded shrink-0" :class="backendOnline ? (aiReady ? 'bg-[#3ce6c3]/15 text-[#3ce6c3]' : 'bg-[#ffb454]/15 text-[#ffb454]') : 'bg-white/[0.06] text-slate-500'">
                  {{ backendOnline ? (aiReady ? 'Connected' : 'No API key') : 'Backend offline' }}
                </span>
              </div>
              <div v-if="genJob" class="mt-3">
                <div class="flex justify-between text-[11.5px] mb-1.5">
                  <span class="text-slate-300 truncate pr-2">{{ genJob.step }}<span class="text-slate-500"> · {{ genJob.topic }}</span></span>
                  <span class="font-mono text-[#3ce6c3] tabular-nums shrink-0">{{ genJob.pct || 0 }}%</span>
                </div>
                <div class="h-[5px] rounded-full bg-white/[0.06] overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-[#3ce6c3] to-[#7ceecd] transition-[width] duration-700 ease-out" :style="{ width: (genJob.pct || 2) + '%' }"></div>
                </div>
                <small class="block text-[10.5px] text-slate-500 mt-1.5">This runs on the server and takes a few minutes — you can keep using the dashboard.</small>
              </div>
              <div v-else class="flex flex-col sm:flex-row gap-2 mt-3">
                <input v-model="genTopic" @keyup.enter="generateCourse()" type="text" placeholder="e.g. Photosynthesis, Recursion, Normal forms…" :disabled="!backendOnline"
                  class="flex-1 bg-[#101a2e] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-[13px] text-white outline-none placeholder:text-slate-500 focus:border-[#3ce6c3]/50 transition disabled:opacity-50" />
                <select v-model="genLevel" :disabled="!backendOnline" class="bg-[#101a2e] border border-white/[0.06] rounded-xl px-3 py-2.5 text-[13px] text-white outline-none focus:border-[#3ce6c3]/50 disabled:opacity-50">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <button @click="generateCourse()" :disabled="!backendOnline"
                  class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#3ce6c3] to-[#7ceecd] text-[#05231b] font-semibold text-[13px] shadow-lg shadow-[#3ce6c3]/25 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none">
                  <BookIcon class="w-4 h-4" /> Build lesson
                </button>
              </div>
              <small v-if="!backendOnline" class="block text-[10.5px] text-slate-500 mt-2">Start it with <code class="font-mono text-slate-400">python backend/app/boi-rsu/api_server.py</code> to enable AI lessons, audio mode and live grades.</small>
            </div>
            <div v-if="filteredDocs.length" class="grid gap-3 lg:gap-4" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
              <div v-for="d in filteredDocs" :key="d.id" :id="'doc-' + d.id" class="border border-white/[0.06] rounded-2xl overflow-hidden bg-[#101a2e] hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 flex flex-col">
                <div class="h-[100px] lg:h-[126px] relative grid place-items-center overflow-hidden" :class="'hue-' + d.hue + '-cover'">
                  <div class="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent_0_14px,rgba(255,255,255,0.03)_14px_15px)]"></div>
                  <span class="relative font-serif italic font-semibold text-[36px] lg:text-[46px] tracking-tight drop-shadow-lg" :class="coverClass[d.hue]">{{ d.big }}</span>
                  <span class="absolute top-2 right-2 text-[9px] font-bold tracking-[0.16em] px-2 py-0.5 rounded" :class="d.ai ? 'bg-[#3ce6c3]/90 text-[#05231b]' : 'bg-[#ff7a6b]/90 text-white'">{{ d.ai ? 'AI' : 'PDF' }}</span>
                  <span v-if="d.price > 0" class="absolute top-2 left-2 text-[9px] font-bold tracking-[0.08em] px-2 py-0.5 rounded bg-[#ffb454]/95 text-[#3b2a05]">₦{{ formatMoney(d.price) }}</span>
                  <span v-if="d.read_only" class="absolute bottom-2 right-2 text-[8.5px] font-bold tracking-[0.14em] px-2 py-0.5 rounded bg-black/65 text-white/90 border border-white/25">🔒 READ-ONLY</span>
                </div>
                <div class="p-3 flex flex-col gap-1.5 flex-1">
                  <h3 class="text-[13px] lg:text-[13.5px] font-semibold leading-snug line-clamp-2">{{ d.title }}</h3>
                  <div class="flex gap-2 text-slate-500 text-[10px] lg:text-[11px] font-medium flex-wrap">
                    <span>{{ d.tag }}</span><span>·</span><span>{{ d.pages }}p</span><span>·</span><span>{{ d.size }}</span>
                  </div>
                  <div class="flex gap-1 mt-auto pt-2">
                    <!-- Admin/partner priced book: must be bought via Paystack
                         before Read/Download unlock (server enforces it too). -->
                    <template v-if="d.price > 0 && !isBought(d)">
                      <button @click="openBookCheckout(d)" :title="'Buy this book — ₦' + formatMoney(d.price)"
                        class="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-gradient-to-br from-[#ffb454] to-[#ffd58a] text-[#3b2a05] font-bold hover:-translate-y-0.5 transition text-[11px] shadow-lg shadow-[#ffb454]/20">
                        <CartIcon class="w-3.5 h-3.5" /> Buy ₦{{ formatMoney(d.price) }}
                      </button>
                      <button @click="toggleSave(d.id)" :class="['flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border text-[11px] transition', saved.has(d.id) ? 'bg-[#ffb454]/15 border-[#ffb454]/50 text-[#ffb454]' : 'border-white/[0.12] text-white bg-white/[0.02] hover:border-[#ffb454]/50']">
                        <StarIcon class="w-3.5 h-3.5" :class="saved.has(d.id) ? 'fill-current' : ''" />
                        {{ saved.has(d.id) ? 'Saved' : 'Save' }}
                      </button>
                    </template>
                    <template v-else>
                      <button @click="openReader(d.id)" class="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-white/[0.12] text-white bg-white/[0.02] hover:border-[#3ce6c3]/50 hover:bg-[#3ce6c3]/5 transition text-[11px]">
                        <EyeIcon class="w-3.5 h-3.5" /> Read
                      </button>
                      <button @click="toggleSave(d.id)" :class="['flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border text-[11px] transition', saved.has(d.id) ? 'bg-[#ffb454]/15 border-[#ffb454]/50 text-[#ffb454]' : 'border-white/[0.12] text-white bg-white/[0.02] hover:border-[#ffb454]/50']">
                        <StarIcon class="w-3.5 h-3.5" :class="saved.has(d.id) ? 'fill-current' : ''" />
                        {{ saved.has(d.id) ? 'Saved' : 'Save' }}
                      </button>
                      <button @click="downloadDoc(d)" :disabled="!!d.read_only" :title="d.read_only ? 'Read-only — downloads are disabled by the school' : 'Download PDF'" class="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-gradient-to-br from-[#3ce6c3] to-[#7ceecd] text-[#05231b] font-semibold hover:-translate-y-0.5 transition text-[11px] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                        <DownloadIcon class="w-3.5 h-3.5" />
                      </button>
                    </template>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-slate-500 text-[13px] py-10 text-center leading-relaxed">No textbooks in your library yet. Your course textbook is written by <span class="text-slate-300">MiroFish AI</span> right after each class ends — please wait until after class. If your teacher uploads a PDF, it appears here instantly.</p>
          </section>

          <!-- ========== CLASS TIMETABLE ========== -->
          <section v-if="currentView === 'home'" class="space-y-3">
            <div class="rounded-2xl border border-white/[0.06] bg-[#101a2e] p-4 lg:p-5">
              <div class="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Class timetable</span>
                  <h3 class="font-serif text-lg lg:text-xl tracking-tight mt-0.5">This month · synced with BOI RSU</h3>
                </div>
                <span v-if="timetable" class="shrink-0 text-[10px] px-2 py-1 rounded-md border border-[#3ce6c3]/30 text-[#3ce6c3] font-semibold">{{ timetable.month_title }}</span>
              </div>
              <p v-if="!timetable" class="text-[12px] text-slate-400 italic">Your weekly schedule appears here as soon as your registered course syncs from the school server…</p>
              <div v-else class="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <div v-for="w in timetable.weeks" :key="w.week" class="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                  <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3ce6c3] mb-2">{{ w.week }}</p>
                  <ul class="space-y-2">
                    <li v-for="(s, i) in w.sessions" :key="i" class="text-[11.5px] leading-snug">
                      <span class="inline-block min-w-[76px] font-bold text-slate-200">{{ s.day }}</span>
                      <span class="text-slate-400">{{ s.time }} WAT</span>
                      <span class="block text-slate-300 mt-0.5">{{ s.topic }}</span>
                    </li>
                  </ul>
                </div>
              </div>
              <p v-if="timetable" class="text-[10px] text-slate-500 mt-3">Times in {{ timetable.timezone }} · {{ timetable.duration_mins }}-minute live classes · updates automatically when your course changes</p>
            </div>
          </section>

          <!-- ========== GRADES ========== -->
          <section v-if="currentView === 'grades'" class="space-y-4 lg:space-y-5">
            <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div>
                <span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Academic Record</span>
                <h1 class="font-serif text-[clamp(24px,5vw,40px)] tracking-tight mt-1">Grades &amp; <i class="text-[#3ce6c3]">CGPA</i></h1>
                <p class="text-slate-400 text-[13.5px] mt-1.5 leading-relaxed max-w-xl hidden sm:block">Cumulative performance across all registered semesters.</p>
              </div>
              <div class="flex gap-2 w-full sm:w-auto">
                <button @click="toast('Grade review form opened.')" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 transition-all text-[13px] font-semibold">Request review</button>
                <button @click="toast('Downloading official transcript…')" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#ffb454] to-[#ffd08d] text-[#241300] font-semibold text-[13px] shadow-lg shadow-[#ffb454]/25 hover:-translate-y-0.5 transition-all"><DownloadIcon class="w-4 h-4" /> <span class="hidden sm:inline">Transcript</span></button>
              </div>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3.5">
              <div v-for="s in stats" :key="s.label" class="bg-gradient-to-b from-[#101a2e] to-[#101a2e]/65 border border-white/[0.06] rounded-xl lg:rounded-2xl p-3 lg:p-4 hover:border-white/[0.12] transition">
                <span class="text-[9px] lg:text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">{{ s.label }}</span>
                <div class="font-serif text-[20px] lg:text-[27px] mt-1 tracking-tight" :class="statClass[s.color]">
                  {{ s.value }}<small v-if="s.sub" class="text-[12px] lg:text-[14px] text-slate-500 font-normal">{{ s.sub }}</small>
                </div>
                <div class="text-[10px] lg:text-[11.5px] text-slate-500 mt-0.5">{{ s.desc }}</div>
              </div>
            </div>
            <div class="grid lg:grid-cols-[340px_1fr] gap-4">
              <div class="relative overflow-hidden bg-gradient-to-b from-[#101a2e] to-[#101a2e]/65 border border-white/[0.06] rounded-2xl p-4 lg:p-5 hover:border-white/[0.12] transition">
                <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#ffb454] to-transparent" />
                <span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Cumulative Grade Point</span>
                <div class="relative w-[140px] lg:w-[180px] h-[140px] lg:h-[180px] mx-auto my-4">
                  <svg class="-rotate-90" width="100%" height="100%" viewBox="0 0 180 180">
                    <circle cx="90" cy="90" r="76" fill="none" stroke="rgba(148,163,184,0.12)" stroke-width="13" />
                    <circle cx="90" cy="90" r="76" fill="none" stroke="url(#gradArc)" stroke-width="13" stroke-linecap="round" stroke-dasharray="477.5" :stroke-dashoffset="dial2Offset" class="transition-[stroke-dashoffset] duration-[1600ms] ease-out" />
                  </svg>
                  <div class="absolute inset-0 grid place-items-center">
                    <div class="text-center">
                      <b class="font-serif text-[32px] lg:text-[42px] text-[#ffb454] font-semibold tabular-nums">{{ dial2Num }}</b>
                      <small class="block text-[8px] lg:text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold mt-0.5">CGPA / 4.00</small>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 items-end h-[50px] lg:h-[62px] justify-center mb-4 lg:mb-5">
                  <div v-for="(s, i) in semesters" :key="i" class="w-[18px] lg:w-[22px] rounded-t transition-all duration-[1200ms] ease-out relative" :class="i === 3 ? 'bg-gradient-to-t from-[#ffb454]/30 to-[#ffb454]' : 'bg-gradient-to-t from-[#7db1ff]/25 to-[#7db1ff]/85'" :style="{ height: (s.g / 4 * 100) + '%' }">
                    <small class="absolute bottom-[-17px] left-1/2 -translate-x-1/2 text-[8px] lg:text-[9px] font-mono text-slate-500 font-semibold">{{ s.l }}</small>
                  </div>
                </div>
                <button @click="toast('Advisor notified — booking request sent.')" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#3ce6c3] to-[#7ceecd] text-[#05231b] font-semibold text-[13px] shadow-lg shadow-[#3ce6c3]/25 hover:-translate-y-0.5 transition-all">Book advisor session</button>
              </div>
              <div class="bg-gradient-to-b from-[#101a2e] to-[#101a2e]/65 border border-white/[0.06] rounded-2xl p-3 lg:p-5 hover:border-white/[0.12] transition overflow-x-auto">
                <span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">{{ realData ? 'Quiz performance by topic' : 'Current Semester · 2026/27' }}</span>
                <table class="w-full border-collapse mt-2.5 min-w-[500px]">
                  <thead>
                    <tr>
                      <th class="text-left text-[9px] lg:text-[10px] uppercase tracking-[0.18em] text-slate-500 py-2.5 px-2 lg:px-3 border-b border-white/[0.12] font-bold">Code</th>
                      <th class="text-left text-[9px] lg:text-[10px] uppercase tracking-[0.18em] text-slate-500 py-2.5 px-2 lg:px-3 border-b border-white/[0.12] font-bold">Course</th>
                      <th class="text-left text-[9px] lg:text-[10px] uppercase tracking-[0.18em] text-slate-500 py-2.5 px-2 lg:px-3 border-b border-white/[0.12] font-bold">{{ gradesUnitLabel }}</th>
                      <th class="text-left text-[9px] lg:text-[10px] uppercase tracking-[0.18em] text-slate-500 py-2.5 px-2 lg:px-3 border-b border-white/[0.12] font-bold">Score</th>
                      <th class="text-left text-[9px] lg:text-[10px] uppercase tracking-[0.18em] text-slate-500 py-2.5 px-2 lg:px-3 border-b border-white/[0.12] font-bold">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="c in courses" :key="c[0]" class="hover:bg-[#3ce6c3]/5 transition">
                      <td class="py-2.5 lg:py-3 px-2 lg:px-3 border-b border-white/[0.06] font-mono font-semibold text-[11px] lg:text-[13px]">{{ c[0] }}</td>
                      <td class="py-2.5 lg:py-3 px-2 lg:px-3 border-b border-white/[0.06] text-[11px] lg:text-[13px]">{{ c[1] }}</td>
                      <td class="py-2.5 lg:py-3 px-2 lg:px-3 border-b border-white/[0.06] font-mono text-[11px] lg:text-[13px]">{{ c[2] }}</td>
                      <td class="py-2.5 lg:py-3 px-2 lg:px-3 border-b border-white/[0.06] font-mono text-[11px] lg:text-[13px]">{{ c[3] }}%</td>
                      <td class="py-2.5 lg:py-3 px-2 lg:px-3 border-b border-white/[0.06]"><span :class="gradeClass(c[4])">{{ c[4] }}</span></td>
                    </tr>
                    <tr v-if="!courses.length">
                      <td colspan="5" class="py-6 px-3 text-center text-[12px] text-slate-500 leading-relaxed">No quiz results yet — take your first class quiz and your real grades appear here, one row per topic.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- ========== CHAT ========== -->
          <section v-if="currentView === 'chat'" class="space-y-4 lg:space-y-5">
            <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div>
                <span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">WhatsApp Cohort Group</span>
                <h1 class="font-serif text-[clamp(24px,5vw,40px)] tracking-tight mt-1">Cohort <i class="text-[#3ce6c3]">24-B</i> Chat</h1>
                <p class="text-slate-400 text-[13.5px] mt-1.5 leading-relaxed max-w-xl hidden sm:block">Enable anonymous mode to contribute without revealing your name.</p>
              </div>
              <button @click="toast('Opening group in WhatsApp… (demo)', 'warn')" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#25d366] to-[#128c5e] text-[#04140b] font-semibold text-[13px] shadow-lg shadow-[#25d366]/25 hover:-translate-y-0.5 transition-all">
                <WhatsAppIcon class="w-4 h-4" /> Open in WhatsApp
              </button>
            </div>
            <div class="grid lg:grid-cols-[280px_1fr] gap-4" style="height: calc(100vh - 180px); min-height: 480px;">
              <div class="hidden lg:flex flex-col gap-3.5 overflow-y-auto">
                <div class="relative overflow-hidden bg-gradient-to-b from-[#101a2e] to-[#101a2e]/65 border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition">
                  <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#25d366] to-transparent" />
                  <div class="flex gap-3 items-center mb-3">
                    <div class="w-[42px] h-[42px] rounded-xl bg-[#25d366]/15 grid place-items-center"><GroupIcon class="w-5 h-5 text-[#25d366]" /></div>
                    <div><b class="font-semibold text-[14px]">Cohort 24-B</b><div class="text-[11px] text-slate-400">Web Development Track · 24 members</div></div>
                  </div>
                  <div v-for="m in members" :key="m[1]" class="flex gap-2.5 items-center py-2">
                    <div class="w-8 h-8 rounded-lg grid place-items-center text-[11px] font-bold text-[#08131f] shrink-0" :style="{ background: m[2] }">{{ m[0] }}</div>
                    <div><div class="text-[13px] font-semibold">{{ m[1] }}</div><div class="text-[10.5px] text-slate-500">{{ m[3] }}</div></div>
                  </div>
                  <div class="text-[11px] text-slate-500 pt-1.5">and 19 more members</div>
                </div>
                <div class="bg-[#7db1ff]/5 border border-dashed border-[#7db1ff]/40 rounded-2xl p-5">
                  <h4 class="text-[13px] font-bold flex gap-2 items-center"><MaskIcon class="w-4 h-4 fill-[#7db1ff]" /> Anonymous mode</h4>
                  <p class="text-[11.5px] text-slate-400 mt-1.5 leading-relaxed">When enabled, your messages appear as "Anonymous".</p>
                  <div class="flex justify-between items-center mt-2.5">
                    <span class="text-[12px] font-bold">Post anonymously</span>
                    <label class="relative inline-block w-[42px] h-[23px] shrink-0">
                      <input v-model="anonMode" type="checkbox" class="opacity-0 w-0 h-0 peer" />
                      <span class="absolute inset-0 bg-[#22304d] rounded-full cursor-pointer transition peer-checked:bg-[#7db1ff]"></span>
                      <span class="absolute left-[3px] top-[3px] w-[17px] h-[17px] bg-slate-400 rounded-full transition peer-checked:translate-x-[19px] peer-checked:bg-[#06121f]"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="flex flex-col border border-white/[0.06] rounded-2xl overflow-hidden bg-gradient-to-b from-[#0d1727] to-[#0a1220]">
                <div class="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-[#25d366]/5">
                  <div class="w-[38px] h-[38px] rounded-xl bg-[#25d366]/15 grid place-items-center"><ChatIcon class="w-[18px] h-[18px] text-[#25d366]" /></div>
                  <div class="min-w-0 flex-1">
                    <div class="font-bold text-[13px] lg:text-[14.5px] truncate">Cohort 24-B · General</div>
                    <div class="text-[10px] lg:text-[11px] text-[#25d366] font-semibold tracking-[0.04em]">Group · Anonymous permitted</div>
                  </div>
                  <div class="flex items-center gap-1.5 text-[10px] lg:text-[11.5px] text-slate-400 shrink-0"><i class="w-2 h-2 rounded-full bg-[#25d366] inline-block animate-pulse"></i> 18</div>
                </div>
                <div ref="threadRef" class="flex-1 overflow-y-auto p-3 lg:p-5 flex flex-col gap-3 bg-[radial-gradient(rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:22px_22px]">
                  <div v-for="(m, i) in messages" :key="i" :class="['flex gap-2 max-w-[85%] lg:max-w-[76%]', m.me ? 'self-end flex-row-reverse' : '', m.anon ? 'anon-msg' : '']">
                    <div class="w-7 h-7 lg:w-8 lg:h-8 rounded-lg grid place-items-center text-[10px] lg:text-[11px] font-bold text-[#08131f] shrink-0" :style="{ background: m.anon ? 'linear-gradient(135deg,#7db1ff,#4d7fd6)' : m.color }">
                      <template v-if="m.anon">🎭</template>
                      <template v-else>{{ initials(m.who) }}</template>
                    </div>
                    <div :class="['border rounded-2xl px-3 py-2', m.me ? 'bg-[#0f3d2c] border-[#25d366]/30 !rounded-br-sm' : m.anon ? 'bg-[#17233c] border-dashed border-[#7db1ff]/45 !rounded-tl-sm' : 'bg-[#17233c] border-white/[0.06] !rounded-tl-sm']">
                      <div class="text-[10px] lg:text-[11.5px] font-bold mb-0.5" :style="{ color: m.anon ? '#7db1ff' : m.color }">{{ m.anon ? '🎭 Anonymous' : m.who }}</div>
                      <p class="text-[12.5px] lg:text-[13.5px] leading-relaxed">{{ m.text }}</p>
                      <span class="block text-right text-[9px] lg:text-[10px] text-slate-500 mt-1 font-mono">{{ m.time }}{{ m.me ? ' ✓✓' : '' }}</span>
                    </div>
                  </div>
                  <div v-if="typing" class="flex gap-2">
                    <div class="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-[#7db1ff] grid place-items-center text-[10px] lg:text-[11px] font-bold text-[#08131f] shrink-0">TA</div>
                    <div class="bg-[#17233c] border border-white/[0.06] rounded-tl-sm rounded-tr-2xl rounded-br-2xl rounded-bl-2xl px-4 py-3 flex gap-1">
                      <i v-for="n in 3" :key="n" class="w-1.5 h-1.5 rounded-full bg-slate-400 typing-dot" :style="{ animationDelay: (n-1) * 0.18 + 's' }"></i>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 items-center p-3 border-t border-white/[0.06] bg-[#080d18]/60">
                  <button @click="anonMode = !anonMode" :class="['inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-2 rounded-full border text-[10px] lg:text-[11.5px] font-bold transition shrink-0', anonMode ? 'border-[#7db1ff] text-[#7db1ff] bg-[#7db1ff]/10' : 'border-white/[0.06] text-slate-500']">
                    <MaskIcon class="w-3 h-3 lg:w-3.5 lg:h-3.5 fill-current" />
                    <span class="hidden sm:inline">{{ anonMode ? 'Anonymous' : 'Named' }}</span>
                  </button>
                  <input v-model="chatInput" @keydown.enter="sendMsg" :placeholder="anonMode ? 'Message anonymously…' : 'Message Cohort 24-B…'" class="flex-1 bg-[#152238] border border-white/[0.06] rounded-xl px-3 lg:px-4 py-2.5 text-[13px] lg:text-[13.5px] text-white outline-none placeholder:text-slate-500 focus:border-[#25d366]/50 focus:ring-4 focus:ring-[#25d366]/10 transition" />
                  <button @click="sendMsg" class="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br from-[#25d366] to-[#128c5e] grid place-items-center shadow-lg shadow-[#25d366]/30 hover:-translate-y-0.5 hover:scale-105 transition">
                    <SendIcon class="w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] fill-[#04140b]" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- ========== ASSIGNMENTS ========== -->
          <section v-if="currentView === 'assignments'" class="space-y-4 lg:space-y-5">
            <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div>
                <span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Coursework</span>
                <h1 class="font-serif text-[clamp(24px,5vw,40px)] tracking-tight mt-1">My <i class="text-[#3ce6c3]">Assignments</i></h1>
                <p class="text-slate-400 text-[13.5px] mt-1.5 leading-relaxed max-w-xl hidden sm:block">Assignments your teacher has given to the class — new ones appear here instantly.</p>
              </div>
              <div class="flex gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.12] text-white bg-white/[0.02] text-[12px] font-semibold"><span class="w-2 h-2 rounded-full bg-[#ffb454]"></span>{{ assignments.filter(a => a.status[0] === 'Pending').length }} pending</span>
                <button @click="loadClassroomAssignments()" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 transition-all text-[13px] font-semibold"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg> Refresh</button>
              </div>
            </div>
            <div v-if="assignments.length === 0" class="text-slate-500 text-[13px] py-10 text-center border border-dashed border-white/[0.06] rounded-2xl">No assignments yet — your teacher hasn't given any to the class.</div>
            <div v-else class="space-y-3">
              <div v-for="a in assignments" :key="a.id" class="bg-gradient-to-b from-[#101a2e] to-[#101a2e]/65 border border-white/[0.06] rounded-xl lg:rounded-2xl p-3 lg:p-4 hover:border-white/[0.12] transition">
                <div class="flex items-start gap-3">
                  <div class="text-center bg-[#7db1ff]/8 border border-[#7db1ff]/25 rounded-xl px-3 py-2 min-w-[56px] lg:min-w-[64px] shrink-0">
                    <b class="block font-serif text-lg lg:text-xl text-[#7db1ff] tracking-tight">{{ a.d }}</b>
                    <small class="text-[8px] lg:text-[9px] uppercase tracking-[0.18em] text-slate-500 font-bold">{{ a.m }}</small>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-[13px] lg:text-[14.5px] font-semibold">{{ a.title }}</h3>
                    <small class="text-slate-500 text-[11px] lg:text-[12px]">{{ a.course }} · by {{ a.teacher }}</small>
                    <p v-if="a.instructions" class="text-slate-400 text-[11px] lg:text-[12px] mt-1 leading-snug">{{ a.instructions }}</p>
                    <p v-if="a.due" class="text-[#ffb454] text-[11px] lg:text-[12px] mt-1 font-semibold">📅 Due: {{ a.due }}</p>
                  </div>
                  <span :class="['text-[9px] lg:text-[10px] font-bold tracking-[0.14em] uppercase px-2 lg:px-3 py-1 lg:py-1.5 rounded-full shrink-0', a.status[1]]">{{ a.status[0] }}</span>
                </div>
                <button @click="toast(a.status[0] === 'Pending' ? 'Opening submission form…' : 'Opening graded feedback…')" :class="['w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-[13px] transition hover:-translate-y-0.5', a.status[0] === 'Pending' ? 'bg-gradient-to-br from-[#3ce6c3] to-[#7ceecd] text-[#05231b] shadow-lg shadow-[#3ce6c3]/25' : 'border border-white/[0.12] text-white bg-white/[0.02]']">{{ a.status[0] === 'Pending' ? 'Start →' : 'View' }}</button>
              </div>
            </div>
          </section>

          <!-- ========== SETTINGS ========== -->
          <section v-if="currentView === 'settings'" class="space-y-4 lg:space-y-5">
            <div>
              <span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Account</span>
              <h1 class="font-serif text-[clamp(24px,5vw,40px)] tracking-tight mt-1">Profile &amp; <i class="text-[#3ce6c3]">Settings</i></h1>
            </div>
            <div class="grid lg:grid-cols-2 gap-4">
              <div class="bg-gradient-to-b from-[#101a2e] to-[#101a2e]/65 border border-white/[0.06] rounded-2xl p-4 lg:p-5 hover:border-white/[0.12] transition">
                <span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Profile</span>
                <div class="mt-3.5 space-y-3.5">
                  <div v-for="f in profileFields" :key="f.label">
                    <label class="block text-[10.5px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-1.5">{{ f.label }}</label>
                    <input :value="f.value" class="w-full bg-[#152238] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-[13.5px] text-white outline-none focus:border-[#3ce6c3]/50 transition" />
                  </div>
                  <div>
                    <label class="block text-[10.5px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-1.5">Cohort</label>
                    <select class="w-full bg-[#152238] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-[13.5px] text-white outline-none focus:border-[#3ce6c3]/50 transition">
                      <option>Cohort 24-B (current)</option>
                      <option>Cohort 25-A</option>
                    </select>
                  </div>
                  <button @click="toast('Profile saved.')" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#3ce6c3] to-[#7ceecd] text-[#05231b] font-semibold text-[13px] shadow-lg shadow-[#3ce6c3]/25 hover:-translate-y-0.5 transition-all">Save changes</button>
                </div>
              </div>
              <div class="bg-gradient-to-b from-[#101a2e] to-[#101a2e]/65 border border-white/[0.06] rounded-2xl p-4 lg:p-5 hover:border-white/[0.12] transition">
                <span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Preferences</span>
                <div class="mt-2">
                  <div v-for="p in preferences" :key="p.title" class="flex justify-between items-center py-3.5 border-b border-dashed border-white/[0.06] last:border-b-0">
                    <div class="min-w-0 pr-3"><b class="text-[12px] lg:text-[13.5px] font-semibold block">{{ p.title }}</b><small class="text-slate-500 text-[10px] lg:text-[11.5px]">{{ p.sub }}</small></div>
                    <label class="relative inline-block w-[42px] h-[23px] shrink-0">
                      <input v-model="p.on" type="checkbox" class="opacity-0 w-0 h-0 peer" />
                      <span class="absolute inset-0 bg-[#22304d] rounded-full cursor-pointer transition peer-checked:bg-[#3ce6c3]"></span>
                      <span class="absolute left-[3px] top-[3px] w-[17px] h-[17px] bg-slate-400 rounded-full transition peer-checked:translate-x-[19px] peer-checked:bg-[#06121f]"></span>
                    </label>
                  </div>
                  <div class="flex justify-between items-center py-3.5">
                    <div><b class="text-[12px] lg:text-[13.5px] font-semibold block">Theme</b><small class="text-slate-500 text-[10px] lg:text-[11.5px]">Low-light study sessions</small></div>
                    <span class="inline-block text-[9px] lg:text-[9.5px] font-bold tracking-[0.14em] uppercase px-2 py-1 rounded-md bg-[#ffb454]/15 text-[#ffb454]">Dark</span>
                  </div>
                  <div class="flex flex-col sm:flex-row gap-2 mt-4">
                    <button @click="toast('Password reset link sent to your email.')" class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 transition text-[12px] lg:text-[13px] font-semibold">Change password</button>
                    <button @click="toast('Account deletion requires administrator approval.', 'warn')" class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#ff7a6b]/40 text-[#ff7a6b] bg-white/[0.02] hover:-translate-y-0.5 transition text-[12px] lg:text-[13px] font-semibold">Delete account</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Footer -->
        <footer class="p-4 px-4 lg:px-7 border-t border-white/[0.06] text-slate-500 text-[10px] lg:text-[11.5px] flex flex-wrap gap-2 lg:gap-3.5">
          <span><b class="text-slate-400">devsphere academy</b> · v2.6</span>
          <span class="hidden sm:inline">Semester: 2026/27 Harmattan</span>
          <span>Need help? <a href="#" @click.prevent="go('chat')" class="text-[#3ce6c3] font-bold no-underline">Ask the cohort →</a></span>
          <span class="ml-auto hidden sm:inline">© 2026 {{ brandName }}</span>
        </footer>
      </main>
    </div>

    <!-- FAB (hidden on mobile chat view) -->
    <button v-if="currentView !== 'chat'" @click="go('chat')" class="fixed right-4 lg:right-6 bottom-4 lg:bottom-6 z-50 w-[52px] h-[52px] lg:w-[58px] lg:h-[58px] rounded-2xl bg-gradient-to-br from-[#25d366] to-[#0f8c56] grid place-items-center shadow-xl shadow-[#25d366]/40 hover:-translate-y-1 hover:scale-105 transition-all fab-ping">
      <WhatsAppIcon class="w-6 h-6 lg:w-7 lg:h-7 fill-[#04140b]" />
      <span class="absolute -top-1 -right-1 min-w-[15px] h-[15px] lg:min-w-[17px] lg:h-[17px] rounded-full bg-[#ff7a6b] text-white text-[9px] lg:text-[10px] font-bold grid place-items-center px-1">5</span>
    </button>

    <!-- Toasts -->
    <div class="fixed left-4 lg:left-6 bottom-4 lg:bottom-6 z-[70] flex flex-col gap-2.5 max-w-[calc(100vw-2rem)]">
      <TransitionGroup name="toast">
        <div v-for="t in toasts" :key="t.id" :class="['flex items-center gap-2.5 bg-[#101a2e] border rounded-xl px-4 py-3 text-[12px] lg:text-[13px] font-medium shadow-2xl shadow-black/60 max-w-full', t.type === 'warn' ? 'border-l-[3px] border-l-[#ffb454] border-white/[0.12]' : 'border-l-[3px] border-l-[#3ce6c3] border-white/[0.12]']">
          <i :class="['w-2 h-2 rounded-full shrink-0', t.type === 'warn' ? 'bg-[#ffb454]' : 'bg-[#3ce6c3]']"></i>
          <span>{{ t.msg }}</span>
        </div>
      </TransitionGroup>
    </div>

    <!-- Reader Modal -->
    <Transition name="modal">
      <div v-if="readerModal" @click.self="readerModal = null" class="fixed inset-0 z-[80] grid place-items-center bg-black/75 backdrop-blur-md p-4">
        <div class="w-full max-w-[680px] max-h-[88vh] overflow-auto bg-[#0b1120] border border-white/[0.12] rounded-2xl p-4 lg:p-6">
          <div class="flex justify-between items-start mb-4">
            <div class="min-w-0 pr-3"><span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">{{ readerCourse ? 'AI Lesson · ' + readerCourse.level : 'PDF Reader' }}</span><h3 class="font-serif text-lg lg:text-xl tracking-tight mt-1 truncate">{{ readerModal.title }}</h3></div>
            <button @click="readerModal = null" class="w-[34px] h-[34px] rounded-lg border border-white/[0.06] grid place-items-center text-slate-400 hover:text-[#ff7a6b] hover:border-[#ff7a6b] transition shrink-0">✕</button>
          </div>
          <div class="bg-[#f4f0e6] text-[#25231c] rounded-xl p-4 lg:p-8 min-h-[280px] lg:min-h-[340px] transition-transform origin-top" :style="{ transform: 'scale(' + readerZoom + ')' }">
            <!-- ===== W3Schools-style textbook renderer ===== -->
            <template v-if="readerTextbook">
              <div class="flex gap-1.5 flex-wrap mb-4">
                <button v-for="(ch, ci) in tbChapters" :key="'ch' + ci" @click="tbChapter = ci; tbLesson = null"
                  :class="['px-3 py-1.5 rounded-lg text-[11px] font-bold border transition', tbChapter === ci ? 'bg-[#1b3a30] text-white border-[#1b3a30]' : 'bg-white/70 text-[#25231c] border-[#25231c]/20 hover:border-[#25231c]/50']">{{ ch.chapter }}</button>
              </div>
              <template v-if="!tbLesson">
                <h4 class="font-serif text-lg lg:text-[22px] tracking-tight mb-1">{{ tbChapters[tbChapter]?.chapter }}</h4>
                <p class="text-[11px] font-mono text-[#8a836d] mb-4">Reference-first · {{ tbChapters[tbChapter]?.lessons.length || 0 }} lessons · from "{{ readerTextbook.video_title || 'class video' }}"</p>
                <button v-for="l in (tbChapters[tbChapter]?.lessons || [])" :key="l.lesson_num" @click="openTbLesson(l)"
                  class="w-full text-left border border-[#25231c]/15 bg-white/70 hover:bg-white hover:border-[#0a7a4d]/50 rounded-xl px-3.5 py-3 mb-2 transition">
                  <b class="block text-[13.5px] text-[#1b3a30] mb-0.5">{{ l.title }}</b>
                  <span class="text-[12px] text-[#5a5443] leading-snug block mb-1.5">{{ l.intro.slice(0, 140) }}{{ l.intro.length > 140 ? '…' : '' }}</span>
                  <span class="text-[10.5px] font-bold text-[#0a7a4d]">Try it Yourself »</span>
                </button>
              </template>
              <template v-else>
                <button @click="tbLesson = null" class="text-[11.5px] font-bold text-[#0a7a4d] mb-2.5 block">← Back to {{ tbChapters[tbChapter]?.chapter }}</button>
                <h4 class="font-serif text-lg lg:text-[22px] tracking-tight mb-3">{{ tbLesson.title }}</h4>
                <p class="text-[13px] leading-[1.85] text-[#3a362b] mb-4 whitespace-pre-line">{{ tbLesson.intro }}</p>
                <!-- Deep teaching text from the combined author prompt, split
                     into short paragraphs so the page never becomes a wall. -->
                <div v-if="tbParagraphs.length" class="mb-4 space-y-3">
                  <p v-for="(para, pi) in tbParagraphs" :key="'para' + pi"
                    class="text-[13px] leading-[1.85] text-[#3a362b] whitespace-pre-line">{{ para }}</p>
                </div>
                <!-- One live example immediately (code, or image when non-coding) -->
                <div v-if="tbLesson.example && tbLesson.example.lang !== 'image'" class="mb-4">
                  <div class="flex items-center justify-between bg-[#25231c] text-[#e8e3d3] rounded-t-xl px-3.5 py-2 gap-2">
                    <span class="text-[10px] font-mono uppercase tracking-widest">{{ tbLesson.example.lang }}</span>
                    <span class="text-[10.5px] text-[#b9b29a] truncate">{{ tbLesson.example.caption }}</span>
                  </div>
                  <pre class="bg-[#2d2a20] text-[#ffe89c] rounded-b-xl p-3.5 overflow-x-auto text-[11.5px] leading-relaxed font-mono">{{ tbLesson.example.code }}</pre>
                </div>
                <figure v-else-if="tbLesson.example" class="mb-4">
                  <img v-if="tbLesson.example.url" :src="tbLesson.example.url" :alt="tbLesson.example.caption || 'lesson illustration'" class="rounded-xl w-full border border-[#25231c]/10" />
                  <div v-else class="rounded-xl bg-gradient-to-br from-[#dff0e6] to-[#c4e2d2] border border-[#25231c]/10 grid place-items-center py-10 px-6 text-center">
                    <span class="text-3xl mb-1">🖼️</span>
                    <span class="text-[12px] text-[#2c4a3c] font-medium max-w-md">{{ tbLesson.example.caption }}</span>
                  </div>
                </figure>
                <!-- Line-by-line walkthrough of the example above -->
                <div v-if="tbLesson.example_explanation" class="bg-[#f7f4ea] border border-[#25231c]/10 rounded-xl px-3.5 py-3 mb-4">
                  <b class="text-[11.5px] text-[#1b3a30] block mb-1">🔍 How the example works</b>
                  <p class="text-[12.5px] leading-[1.8] text-[#3a362b] whitespace-pre-line">{{ tbLesson.example_explanation }}</p>
                </div>
                <!-- "Try it Yourself" editable sandbox -->
                <div class="border-2 border-[#0a7a4d]/40 rounded-xl overflow-hidden mb-4 bg-white">
                  <div class="flex items-center justify-between bg-[#e7f5ee] px-3.5 py-2 border-b border-[#0a7a4d]/20 gap-2">
                    <b class="text-[12px] text-[#0a7a4d] whitespace-nowrap">✏️ Try it Yourself »</b>
                    <small class="text-[10.5px] text-[#4a6a58] truncate">{{ tbLesson.try_it.task }}</small>
                  </div>
                  <textarea v-model="tryCode" spellcheck="false" rows="6"
                    class="w-full bg-[#fffdf5] text-[#25231c] font-mono text-[12px] leading-relaxed p-3.5 outline-none resize-y border-none block"></textarea>
                  <div class="flex items-center gap-2 px-3.5 pb-3 flex-wrap">
                    <button @click="runTryIt()" class="px-4 py-1.5 rounded-lg bg-[#0a7a4d] text-white text-[11.5px] font-bold hover:bg-[#086541] transition">Run »</button>
                    <button @click="resetTryIt()" class="px-3 py-1.5 rounded-lg border border-[#0a7a4d]/30 text-[#0a7a4d] text-[11px] font-semibold hover:bg-[#e7f5ee] transition">Reset</button>
                  </div>
                  <iframe v-if="tryRan && trySrcDoc" :key="tryKey" :srcdoc="trySrcDoc"
                    class="w-full h-[190px] border-t border-[#0a7a4d]/20 bg-white block" sandbox="allow-scripts"></iframe>
                  <p v-if="tryRan && !trySrcDoc" class="px-3.5 pb-3 pt-1 text-[11px] text-[#8a836d] italic">This sandbox runs web code live — paste this {{ tbLesson.try_it.lang }} snippet into your editor to try it yourself.</p>
                </div>

                <!-- Second worked example: the prompt always asks for two -->
                <div v-if="tbLesson.second_example" class="mb-4">
                  <template v-if="tbLesson.second_example.lang !== 'image'">
                    <div class="flex items-center justify-between bg-[#25231c] text-[#e8e3d3] rounded-t-xl px-3.5 py-2 gap-2">
                      <span class="text-[10px] font-mono uppercase tracking-widest">Example 2 · {{ tbLesson.second_example.lang }}</span>
                      <span class="text-[10.5px] text-[#b9b29a] truncate">{{ tbLesson.second_example.caption }}</span>
                    </div>
                    <pre class="bg-[#2d2a20] text-[#ffe89c] rounded-b-xl p-3.5 overflow-x-auto text-[11.5px] leading-relaxed font-mono">{{ tbLesson.second_example.code }}</pre>
                  </template>
                  <figure v-else>
                    <img v-if="tbLesson.second_example.url" :src="tbLesson.second_example.url" :alt="tbLesson.second_example.caption || 'second lesson illustration'" class="rounded-xl w-full border border-[#25231c]/10" />
                    <div v-else class="rounded-xl bg-gradient-to-br from-[#dff0e6] to-[#c4e2d2] border border-[#25231c]/10 grid place-items-center py-10 px-6 text-center">
                      <span class="text-3xl mb-1">🖼️</span>
                      <span class="text-[12px] text-[#2c4a3c] font-medium max-w-md">{{ tbLesson.second_example.caption }}</span>
                    </div>
                  </figure>
                  <p v-if="tbLesson.second_example_explanation" class="text-[12.5px] leading-[1.8] text-[#5a5443] mt-2 whitespace-pre-line">{{ tbLesson.second_example_explanation }}</p>
                </div>
                <!-- Progressive sub-examples: basic -> edge cases -> variations -->
                <div v-for="(v, vi) in (tbLesson.variations || [])" :key="'v' + vi" class="border-l-[3px] border-[#b8860b] bg-[#fdf6e3] rounded-r-xl px-3.5 py-2.5 mb-2">
                  <b class="text-[11.5px] text-[#8a6508] block">{{ v.label }}</b>
                  <pre v-if="v.code" class="bg-[#2d2a20] text-[#ffe89c] rounded-lg p-3 mt-1.5 overflow-x-auto text-[11px] font-mono">{{ v.code }}</pre>
                  <p v-if="v.text" class="text-[12px] text-[#5a5443] leading-relaxed mt-1">{{ v.text }}</p>
                </div>

                <!-- Common Mistakes / Key Points (document-designer blocks) -->
                <div v-if="(tbLesson.common_mistakes || []).length" class="bg-[#fdecec] border border-[#e57373]/40 rounded-xl px-3.5 py-2.5 mb-2">
                  <b class="text-[12px] text-[#a02c2c] block mb-1">⚠️ Common Mistakes</b>
                  <ul class="list-disc pl-5 text-[12px] leading-relaxed text-[#7a3030]">
                    <li v-for="(m, mi) in tbLesson.common_mistakes" :key="'m' + mi">{{ m }}</li>
                  </ul>
                </div>
                <div v-if="(tbLesson.key_points || []).length" class="bg-[#eef7ee] border border-[#7bc47f]/40 rounded-xl px-3.5 py-2.5 mb-2">
                  <b class="text-[12px] text-[#1f6b2c] block mb-1">✅ Key Points</b>
                  <ul class="list-disc pl-5 text-[12px] leading-relaxed text-[#2c4a2f]">
                    <li v-for="(k, ki) in tbLesson.key_points" :key="'k' + ki">{{ k }}</li>
                  </ul>
                </div>
                <!-- Note / Tip callout boxes -->
                <div v-if="tbLesson.note" class="bg-[#e8f0fb] border border-[#7db1ff]/40 rounded-xl px-3.5 py-2.5 mb-2 text-[12px] leading-relaxed text-[#274a77]"><b>📝 Note:</b> {{ tbLesson.note }}</div>
                <div v-if="tbLesson.tip" class="bg-[#fef4dc] border border-[#ffb454]/40 rounded-xl px-3.5 py-2.5 mb-2 text-[12px] leading-relaxed text-[#7a5518]"><b>💡 Tip:</b> {{ tbLesson.tip }}</div>

                <!-- End-of-page reinforcement: exercise + quiz link -->
                <div class="mt-4 border border-[#25231c]/15 rounded-xl p-3.5 bg-white/70">
                  <b class="text-[12.5px] text-[#25231c] block mb-1">🏋️ Exercise</b>
                  <p class="text-[12.5px] text-[#3a362b] leading-relaxed">{{ tbLesson.exercise.prompt }}</p>
                  <details class="mt-1.5">
                    <summary class="text-[11.5px] font-bold text-[#0a7a4d] cursor-pointer">Show hint</summary>
                    <p class="text-[12px] text-[#5a5443] mt-1">{{ tbLesson.exercise.hint }}</p>
                  </details>
                  <button @click="takeChapterQuiz()" class="mt-2.5 text-[11.5px] font-bold text-[#0a7a4d] underline">Take the chapter quiz »</button>
                </div>
              </template>
            </template>
            <!--W3ELSE-->
            <template v-else>
              <h4 class="font-serif text-lg lg:text-[22px] tracking-tight mb-3 lg:mb-4">{{ readerSection ? readerSection.title : readerModal.title }}</h4>
            <p v-if="readerLoading" class="text-[12px] lg:text-[13.5px] leading-[1.9] text-[#6b6553] italic">Loading this lesson from the AI backend…</p>
            <template v-else-if="readerParas.length">
              <p v-for="(p, i) in readerParas" :key="i" class="text-[12px] lg:text-[13.5px] leading-[1.8] lg:leading-[1.9] text-[#3a362b] mb-2 lg:mb-3 whitespace-pre-line">{{ p }}</p>
              <p class="text-[10px] lg:text-[11px] font-mono text-[#8a836d] mt-4 pt-3 border-t border-[#25231c]/10">Section {{ readerSection.section_num }} · {{ readerSection.word_count || 0 }} words · about {{ readerSection.duration || 5 }} min</p>
            </template>
            <template v-else>
              <p class="text-[12px] lg:text-[13.5px] leading-[1.8] lg:leading-[1.9] text-[#3a362b] mb-2 lg:mb-3">Chapter {{ readerPage }}. This is an in-app preview of "{{ readerModal.title }}".</p>
              <p class="text-[12px] lg:text-[13.5px] leading-[1.8] lg:leading-[1.9] text-[#3a362b]">Key ideas in this section are covered in class. Use the Save (★) button to pin this document to your dashboard for revision.</p>
              </template>
            </template>
          </div>

          <!-- Audio mode — Deepgram Aura-2 narrates exactly the text above, which
               is also the text the downloaded PDF contains. -->
          <div v-if="readerCourse" class="flex items-center gap-2.5 flex-wrap mt-3 bg-[#101a2e] border border-white/[0.06] rounded-xl px-3 py-2.5">
            <button @click="toggleAudio()" :disabled="!audioOk"
              :class="['w-[36px] h-[36px] rounded-full grid place-items-center shrink-0 transition', audioOk ? 'bg-gradient-to-br from-[#3ce6c3] to-[#7ceecd] text-[#05231b] hover:-translate-y-0.5' : 'bg-white/[0.06] text-slate-500 cursor-not-allowed']">
              <span v-if="audioLoading" class="text-[13px] font-bold animate-pulse">…</span>
              <span v-else-if="audioPlaying" class="text-[13px] font-bold">❙❙</span>
              <span v-else class="text-[13px] font-bold">▶</span>
            </button>
            <div class="min-w-0 flex-1">
              <b class="block text-[12px] font-semibold">Audio mode</b>
              <small v-if="audioOk" class="text-[10.5px] text-slate-500">{{ audioPlaying ? 'Reading section ' + readerPage + ' aloud…' : audioLoading ? 'Synthesising narration…' : 'Listen to this section instead of reading it' }}</small>
              <small v-else class="text-[10.5px] text-[#ffb454]">Unavailable — {{ audioReason || 'backend offline' }}</small>
            </div>
            <audio ref="audioEl" :src="audioSrc" preload="none" class="hidden"
              @play="audioPlaying = true; audioLoading = false"
              @playing="audioLoading = false"
              @pause="audioPlaying = false"
              @ended="audioPlaying = false"
              @error="onAudioError()" />
          </div>

          <!-- Per-section extras, each fetched on first open -->
          <div v-if="readerCourse" class="flex gap-1.5 flex-wrap mt-3">
            <button v-for="t in readerTabs" :key="t.k" @click="openTab(t.k)"
              :class="['px-3 py-1.5 rounded-lg border text-[11.5px] transition', readerTab === t.k ? 'bg-[#3ce6c3] border-[#3ce6c3] text-[#05231b] font-bold' : 'border-white/[0.12] text-slate-300 hover:border-[#3ce6c3]/40']">{{ t.label }}</button>
          </div>

          <div v-if="readerCourse && readerTab !== 'read'" class="mt-3 border border-white/[0.06] rounded-xl p-3 lg:p-4 bg-white/[0.02]">
            <p v-if="secBusy" class="text-[12px] text-slate-400 italic">Asking the AI…</p>

            <p v-else-if="readerTab === 'summary'" class="text-[12px] lg:text-[13px] leading-[1.8] text-slate-300 whitespace-pre-line">{{ secSummary }}</p>

            <div v-else-if="readerTab === 'resources'">
              <p v-if="secResources && secResources.explanation" class="text-[12px] leading-[1.8] text-slate-300 mb-2.5 whitespace-pre-line">{{ secResources.explanation }}</p>
              <ul v-if="secResources && secResources.resources.length" class="space-y-1.5">
                <li v-for="(r, i) in secResources.resources" :key="i">
                  <a :href="r.url" target="_blank" rel="noopener" class="text-[12px] text-[#7db1ff] hover:underline break-words">{{ r.title || r.url }}</a>
                </li>
              </ul>
              <p v-else class="text-[12px] text-slate-500">No web resources — {{ (secResources && secResources.reason) || 'nothing came back for this section' }}.</p>
            </div>

            <div v-else-if="readerTab === 'videos'">
              <div v-if="secVideos && secVideos.videos.length" class="grid gap-2" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));">
                <a v-for="(v, i) in secVideos.videos" :key="i" :href="v.url" target="_blank" rel="noopener" class="border border-white/[0.06] rounded-xl overflow-hidden hover:border-[#3ce6c3]/40 transition block">
                  <img v-if="v.thumbnail" :src="v.thumbnail" :alt="v.title" class="w-full h-[92px] object-cover" loading="lazy" />
                  <div class="p-2">
                    <b class="block text-[11.5px] font-semibold leading-snug line-clamp-2">{{ v.title }}</b>
                    <small class="text-[10px] text-slate-500">{{ v.channel }}<span v-if="v.duration"> · {{ v.duration }}</span></small>
                  </div>
                </a>
              </div>
              <p v-else class="text-[12px] text-slate-500">No teaching videos — {{ (secVideos && secVideos.reason) || 'nothing came back for this section' }}.</p>
            </div>

            <div v-else-if="readerTab === 'quiz'">
              <div v-if="quizBusy && !quiz" class="flex items-center gap-2 text-[12px] text-slate-400">
                <span class="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-[#3ce6c3] animate-spin"></span>
                Building your quiz…
              </div>
              <div v-else-if="quiz" class="space-y-2.5">
                <div v-for="(q, qi) in quiz.questions" :key="qi" class="rounded-xl border border-white/[0.06] bg-[#101a2e] p-3">
                  <p class="text-[12.5px] font-semibold mb-2 leading-snug">{{ qi + 1 }}. {{ q.q }}</p>
                  <div class="grid gap-1.5">
                    <button v-for="(o, oi) in q.options" :key="oi" :disabled="!!quizResult" @click="quizPicks[qi] = LETTERS[oi]"
                      :class="['text-left px-2.5 py-1.5 rounded-lg border text-[11.5px] transition flex gap-2 items-start', optionClass(qi, oi)]">
                      <span class="font-mono font-bold shrink-0">{{ LETTERS[oi] }}</span>
                      <span class="min-w-0">{{ optionText(o) }}</span>
                    </button>
                  </div>
                  <p v-if="resultFor(qi) && resultFor(qi).explanation" class="text-[11px] text-slate-400 mt-2 leading-relaxed">{{ resultFor(qi).explanation }}</p>
                </div>
                <div class="flex items-center gap-2 flex-wrap pt-1">
                  <button v-if="!quizResult" @click="submitQuizNow()" :disabled="quizBusy" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-br from-[#3ce6c3] to-[#7ceecd] text-[#05231b] font-semibold text-[12px] hover:-translate-y-0.5 transition disabled:opacity-50">{{ quizBusy ? 'Marking…' : 'Submit answers' }}</button>
                  <button v-else @click="loadQuiz(true)" :disabled="quizBusy" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/[0.12] text-white bg-white/[0.02] text-[12px] hover:-translate-y-0.5 transition disabled:opacity-50">{{ quizBusy ? 'Building…' : 'Try another quiz' }}</button>
                  <span v-if="quizResult" class="text-[12px] font-semibold font-mono" :class="quizResult.percentage >= 70 ? 'text-[#3ce6c3]' : 'text-[#ffb454]'">
                    {{ quizResult.score }}/{{ quizResult.total }} · {{ quizResult.percentage }}%<span v-if="quizResult.recorded"> · saved to your grade</span>
                  </span>
                </div>
                <p v-if="!studentId" class="text-[11px] text-slate-500">Not linked to a student record, so this score is not counted towards a grade.</p>
              </div>
              <p v-else class="text-[12px] text-slate-500">No quiz could be built for this section.</p>
            </div>
          </div>

          <div class="flex items-center gap-2 mt-4 flex-wrap">
            <button @click="readerZoom = Math.max(0.7, readerZoom - 0.1)" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 transition text-[11px] lg:text-[12px]">－</button>
            <button @click="readerZoom = Math.min(1.4, readerZoom + 0.1)" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 transition text-[11px] lg:text-[12px]">＋</button>
            <span class="mx-auto text-[11px] lg:text-[12px] text-slate-400 font-semibold font-mono tabular-nums">Page {{ readerPage }} / {{ readerModal.pages }}</span>
            <button @click="readerPage = Math.max(1, readerPage - 1)" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 transition text-[11px] lg:text-[12px]">← Prev</button>
            <button @click="readerPage = Math.min(readerModal.pages, readerPage + 1)" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 transition text-[11px] lg:text-[12px]">Next →</button>
            <button v-if="!readerModal.read_only" @click="downloadDoc(readerModal)" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-[#3ce6c3] to-[#7ceecd] text-[#05231b] font-semibold text-[11px] lg:text-[12px] hover:-translate-y-0.5 transition"><DownloadIcon class="w-3 h-3 lg:w-3.5 lg:h-3.5" /> Download</button>
            <span v-else class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.12] text-white/60 bg-white/[0.02] text-[11px] lg:text-[12px]" title="The school locked this book read-only">🔒 Read-only</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Protected Reader — read-only books the school locked. The file is
         fetched as a blob (raw URL never exposed) and shown with the browser
         PDF toolbar hidden, an identity watermark and screenshot deterrence. -->
    <Transition name="modal">
      <div v-if="pdfShield" class="fixed inset-0 z-[85] grid place-items-center bg-black/85 backdrop-blur-md p-3 lg:p-6 select-none"
           @contextmenu.prevent @copy.prevent @cut.prevent @dragstart.prevent>
        <div class="w-full max-w-[920px] h-[88vh] bg-[#0b1120] border border-white/[0.12] rounded-2xl flex flex-col overflow-hidden">
          <div class="flex justify-between items-center gap-3 px-4 py-3 border-b border-white/[0.08] shrink-0">
            <div class="min-w-0 flex items-center gap-2.5">
              <span class="shrink-0 inline-flex items-center gap-1.5 text-[9.5px] font-bold tracking-[0.16em] px-2 py-1 rounded bg-[#ff7a6b]/15 text-[#ff7a6b] border border-[#ff7a6b]/30"><LockIcon class="w-3 h-3" /> READ-ONLY</span>
              <h3 class="font-serif text-base lg:text-lg tracking-tight truncate text-white">{{ pdfShield.doc.title }}</h3>
            </div>
            <button @click="closeProtectedPdf()" class="w-[34px] h-[34px] shrink-0 rounded-lg border border-white/[0.06] grid place-items-center text-slate-400 hover:text-[#ff7a6b] hover:border-[#ff7a6b] transition">✕</button>
          </div>

          <div class="relative flex-1 min-h-0 bg-[#1a2436]">
            <div v-if="pdfShield.loading" class="absolute inset-0 grid place-items-center text-slate-400 text-[13px] gap-3">
              <span class="w-6 h-6 rounded-full border-2 border-white/20 border-t-[#3ce6c3] animate-spin"></span>
              Opening the protected reader…
            </div>
            <div v-else-if="pdfShield.error" class="absolute inset-0 grid place-items-center text-slate-400 text-[13px] text-center px-6">{{ pdfShield.error }}</div>
            <iframe v-else-if="pdfShield.blobUrl" :src="pdfShield.blobUrl" title="Protected read-only document"
                    class="absolute inset-0 w-full h-full bg-white" :style="{ filter: shieldHidden ? 'blur(18px)' : 'none' }"></iframe>

            <!-- Screenshot deterrence cover — appears on PrintScreen / window blur -->
            <div v-if="shieldHidden && !pdfShield.loading && !pdfShield.error" @click="shieldHidden = false"
                 class="absolute inset-0 z-10 grid place-items-center bg-[#0b1120]/95 text-center px-8 cursor-pointer">
              <div>
                <div class="text-[30px] mb-2">🔒</div>
                <p class="text-white font-semibold text-[14px]">Content hidden</p>
                <p class="text-slate-400 text-[12px] mt-1.5 max-w-[380px] mx-auto leading-relaxed">This book is read-only — screenshots, printing and copying are disabled. Click anywhere to keep reading.</p>
              </div>
            </div>

            <!-- Identity watermark: every screenshot stays traceable -->
            <div v-else-if="!shieldHidden && !pdfShield.loading && !pdfShield.error" class="absolute inset-0 z-[5] pointer-events-none overflow-hidden opacity-[0.13]">
              <div class="absolute inset-[-40%] grid grid-cols-3 gap-8 rotate-[-24deg] place-content-center">
                <span v-for="n in 12" :key="'wm' + n" class="text-white font-bold text-[15px] whitespace-nowrap tracking-wide">{{ shieldWatermark }}</span>
              </div>
            </div>
          </div>

          <div class="px-4 py-2.5 border-t border-white/[0.08] shrink-0 flex items-center justify-between gap-3 flex-wrap">
            <p class="text-[11px] text-slate-400 leading-relaxed">Read-only · downloading, printing and screenshots are disabled by the school. Copies are watermarked with your student ID.</p>
            <span class="text-[10px] text-slate-500 font-mono">{{ studentIdLine }}</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Room Modal -->
    <Transition name="modal">
      <div v-if="roomModal" @click.self="roomModal = null" class="fixed inset-0 z-[80] grid place-items-center bg-black/75 backdrop-blur-md p-4">
        <div class="w-full max-w-[480px] bg-[#0b1120] border border-white/[0.12] rounded-2xl p-4 lg:p-6">
          <div class="flex justify-between items-start mb-4">
            <div><span class="text-[10.5px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Your Classroom</span><h3 class="font-serif text-lg lg:text-xl tracking-tight mt-1">Attend class here</h3></div>
            <button @click="roomModal = null" class="w-[34px] h-[34px] rounded-lg border border-white/[0.06] grid place-items-center text-slate-400 hover:text-[#ff7a6b] hover:border-[#ff7a6b] transition">✕</button>
          </div>
          <div class="flex gap-4 items-center bg-[#3ce6c3]/5 border border-[#3ce6c3]/25 rounded-xl lg:rounded-2xl p-4 mb-3.5">
            <div class="w-[48px] h-[48px] lg:w-[58px] lg:h-[58px] rounded-xl lg:rounded-2xl bg-gradient-to-br from-[#3ce6c3] to-[#7ceecd] grid place-items-center shrink-0">
              <RoomIcon class="w-6 h-6 lg:w-7 lg:h-7 text-[#05231b]" />
            </div>
            <div class="min-w-0"><b class="font-serif text-xl lg:text-2xl tracking-tight block">{{ roomModal.room }}</b><small class="text-slate-400 text-[12px] lg:text-[13px]">{{ roomModal.building }} · {{ roomModal.class }}</small></div>
          </div>
          <div class="grid grid-cols-3 gap-2 lg:gap-2.5 mb-4">
            <div class="bg-[#101a2e] border border-white/[0.06] rounded-xl p-2 lg:p-3 text-center">
              <b class="block text-[13px] lg:text-[15px] font-bold">{{ roomModal.floor }}</b>
              <small class="text-[8px] lg:text-[9.5px] uppercase tracking-[0.16em] text-slate-500 font-bold">Floor</small>
            </div>
            <div class="bg-[#101a2e] border border-white/[0.06] rounded-xl p-2 lg:p-3 text-center">
              <b class="block text-[13px] lg:text-[15px] font-bold">{{ roomModal.cap }}</b>
              <small class="text-[8px] lg:text-[9.5px] uppercase tracking-[0.16em] text-slate-500 font-bold">Capacity</small>
            </div>
            <div class="bg-[#101a2e] border border-white/[0.06] rounded-xl p-2 lg:p-3 text-center">
              <b class="block text-[13px] lg:text-[15px] font-bold">{{ roomModal.class }}</b>
              <small class="text-[8px] lg:text-[9.5px] uppercase tracking-[0.16em] text-slate-500 font-bold">Class</small>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <button @click="toast(roomModal.room === 'Live Online' ? 'Live class — the Join button opens the session at class time.' : 'Opening campus directions to ' + roomModal.room + '…')" class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#3ce6c3] to-[#7ceecd] text-[#05231b] font-semibold text-[12px] lg:text-[13px] shadow-lg shadow-[#3ce6c3]/25 hover:-translate-y-0.5 transition-all"><RoomIcon class="w-4 h-4" /> {{ roomModal.room === 'Live Online' ? 'Class details' : 'Get directions' }}</button>
            <button @click="go('timetable'); roomModal = null" class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.12] text-white bg-white/[0.02] hover:-translate-y-0.5 transition text-[12px] lg:text-[13px] font-semibold">Timetable</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Payment gate -->
    <Transition name="modal">
      <div v-if="paymentGate.open" class="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="w-full max-w-[480px] rounded-[28px] border border-[#3ce6c3]/20 bg-[#0b1220] p-5 shadow-2xl shadow-black/70">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="text-[10px] uppercase tracking-[0.2em] text-[#3ce6c3] font-bold">Access required</div>
              <h3 class="font-serif text-3xl tracking-tight mt-1">Complete payment</h3>
            </div>
            <button v-if="paymentGate.dismissable" @click="closePaymentGate" class="w-10 h-10 rounded-xl border border-white/[0.1] hover:border-[#ff7a6b]/40 hover:text-[#ff7a6b] transition">✕</button>
          </div>

          <div class="rounded-2xl border border-[#ffb454]/20 bg-[#ffb454]/8 p-4 mb-4">
            <p class="text-[13px] text-slate-300 leading-6">
              Access is <b>monthly</b>: pay your school fees for the months you want, and the dashboard unlocks until they run out.
            </p>
          </div>

          <div class="grid gap-3 mb-4">
            <div class="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#101a2e] px-3 py-2.5">
              <span class="text-slate-400 text-[12px] uppercase tracking-[0.14em]">Course</span>
              <span class="font-semibold text-white">{{ paymentGate.course }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#101a2e] px-3 py-2.5">
              <span class="text-slate-400 text-[12px] uppercase tracking-[0.14em]">Monthly fee</span>
              <span class="font-semibold text-[#3ce6c3]">₦{{ formatMoney(paymentGate.amount) }}<small class="text-slate-500 font-normal">/month</small></span>
            </div>
            <div class="rounded-xl border border-white/[0.08] bg-[#101a2e] px-3 py-3">
              <span class="text-slate-400 text-[12px] uppercase tracking-[0.14em] block mb-2">Pay for how many months?</span>
              <div class="flex gap-2">
                <button v-for="n in [1, 3, 6]" :key="'m' + n" type="button" @click="setGateMonths(n)"
                        :class="['flex-1 py-2 rounded-lg border text-[12.5px] font-bold transition', gateMonths === n ? 'bg-[#3ce6c3] border-[#3ce6c3] text-[#05221b]' : 'border-white/[0.12] text-slate-300 hover:border-[#3ce6c3]/40']">{{ n }} {{ n === 1 ? 'month' : 'months' }}</button>
              </div>
            </div>
            <div class="flex items-center justify-between rounded-xl border border-[#3ce6c3]/30 bg-[#3ce6c3]/5 px-3 py-2.5">
              <span class="text-slate-300 text-[12px] uppercase tracking-[0.14em]">Due now</span>
              <span class="font-black text-[16px] text-[#3ce6c3]">₦{{ formatMoney(gateTotal) }}</span>
            </div>
          </div>

          <p v-if="paymentGate.error" class="mb-3 rounded-xl border border-[#ff7a6b]/35 bg-[#ff7a6b]/10 px-3 py-2 text-[12.5px] text-[#ffb7b2]">
            {{ paymentGate.error }}
          </p>

          <button
            @click="openPaystackCheckout"
            :disabled="paymentGate.loading"
            class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3ce6c3] to-[#7ceecd] text-[#05221b] font-bold text-[14px] py-3.5 shadow-lg shadow-[#3ce6c3]/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span v-if="paymentGate.loading" class="inline-block w-4 h-4 border-2 border-[#05221b]/40 border-t-[#05221b] rounded-full animate-spin"></span>
            {{ paymentGate.loading ? 'Opening Paystack...' : `Pay ₦${formatMoney(gateTotal)} securely` }}
          </button>

          <button @click="closePaymentGate" class="mt-3 w-full border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.02] rounded-xl py-2.5 text-[12.5px] font-semibold tracking-[0.14em] uppercase">
            Pay later
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import * as THREE from 'three';
// Talks to backend/app/boi-rsu/api_server.py (port 5055), which wraps the AI
// learning system and the boirsu student records. Every call in there resolves
// to null on failure, so each call site below falls back to the demo data that
// was already here — a dead backend leaves this page looking exactly as it did.
import * as api from './aiClient.js';

// ===================== ICON COMPONENTS (inline SVG) =====================
// `path` is a single SVG path string or a list of them. Each entry has to be
// turned into a real <path> vnode — handing Vue the raw array of strings makes
// it render them as text nodes inside the <svg>, so every multi-path icon here
// drew nothing at all. `class` is deliberately NOT declared as a prop: leaving
// it off lets Vue's attribute fallthrough merge the caller's class onto the root
// <svg>, which also keeps combined `class` + `:class` bindings working.
const mkIcon = (path, filled = false) => ({
  setup() {
    const ds = typeof path === 'string' ? [path] : path;
    return () => h(
      'svg',
      { viewBox: '0 0 24 24', fill: filled ? 'currentColor' : 'none', stroke: filled ? 'none' : 'currentColor', 'stroke-width': '1.9', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
      ds.map(d => h('path', { d }))
    );
  }
});

const DashboardIcon = mkIcon(['M3 10.5 12 3l9 7.5', 'M5 9.5V21h14V9.5', 'M9.5 21v-6h5v6']);
const CalendarIcon = mkIcon(['M3 5h18v16H3z', 'M8 3v4', 'M16 3v4', 'M3 10h18']);
const BookIcon = mkIcon(['M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h13', 'M9 7h6']);
const ChartIcon = mkIcon(['M4 20V10', 'M10 20V4', 'M16 20v-7', 'M21 20H3']);
const ChatIcon = mkIcon('M21 12a8 8 0 0 1-8 8H4l2.4-3A8 8 0 1 1 21 12Z');
const FileIcon = mkIcon(['M5 4h14v17H5z', 'M9 9h6', 'M9 13h6', 'M9 17h4']);
const SettingsIcon = mkIcon(['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M12 2v2', 'M12 20v2', 'M4.93 4.93l1.41 1.41', 'M17.66 17.66l1.41 1.41', 'M2 12h2', 'M20 12h2', 'M4.93 19.07l1.41-1.41', 'M17.66 6.34l1.41-1.41']);
const WhatsAppIcon = mkIcon('M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z', true);
const LogOutIcon = mkIcon(['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9']);
const SearchIcon = mkIcon(['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z', 'm21 21-4.3-4.3']);
const BellIcon = mkIcon(['M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8', 'M13.7 21a2 2 0 0 1-3.4 0']);
const ClockIcon = mkIcon(['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 7v5l3 3']);
const PinIcon = mkIcon(['M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z', 'M12 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z']);
const RoomIcon = mkIcon(['M3 21V5a2 2 0 0 1 2-2h9v18', 'M14 3h5a2 2 0 0 1 2 2v16']);
const DownloadIcon = mkIcon(['M12 3v12', 'M8 11l4 4 4-4', 'M4 21h16']);
const CartIcon = mkIcon(['M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5L21 8H6', 'M10.5 21a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6Z', 'M17.5 21a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6Z']);
const LockIcon = mkIcon(['M6 11h12v10H6z', 'M9 11V8a3 3 0 0 1 6 0v3']);
const FlameIcon = mkIcon('M12 3s5 4.5 5 9.5a5 5 0 0 1-10 0c0-2 1-3.7 2-5 .3 1.2 1 2 2 2.3C11 7.6 11.5 5 12 3Z');
const EyeIcon = mkIcon(['M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z', 'M12 14.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z']);
const StarIcon = mkIcon('M12 2l3 7 7 .6-5.3 4.7L18 22l-6-4-6 4 1.3-7.7L2 9.6 9 9Z', true);
const SendIcon = mkIcon('M2.5 12 21 3l-4 18-6.5-7L2.5 12Zm8 1 8.5-8', true);
const GroupIcon = mkIcon(['M9 11a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z', 'M3 20c.5-3.4 3-5 6-5s5.5 1.6 6 5', 'M17 9.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z', 'M16.5 15.2c2.4.4 4 1.9 4.4 4.3']);
const MaskIcon = mkIcon('M2 9c3-2 6-2 10-2s7 0 10 2c0 4-2 8-5 8-2 0-3-1.5-5-1.5S9 17 7 17c-3 0-5-4-5-8Z', true);

// ===================== STATE =====================
const router = useRouter();
const route = useRoute();
const threeCanvas = ref(null);
const progressBar = ref(null);
const bellWrap = ref(null);
const threadRef = ref(null);

const mobileMenuOpen = ref(false);
const currentView = ref('dashboard');
const clockTime = ref('--:--:--');
const bellOpen = ref(false);
const searchQuery = ref('');
const globalSearch = ref('');
const activeTag = ref('All');
const anonMode = ref(false);
const chatInput = ref('');
const typing = ref(false);
const toasts = reactive([]);
const saved = reactive(new Set());
// Priced-library commerce: ids of PDF textbooks this student has PAID for
// (admin/partner priced books). Backed by the server's purchased_by list —
// a Paystack reference verified server-side adds the id here.
const purchasedBooks = reactive(new Set());
// Protected read-only reader (pdfShield): the school-locked PDF view. The
// file is fetched as a blob (its raw URL is never exposed) and rendered with
// the browser's PDF toolbar hidden, a student-identity watermark, and
// PrintScreen/copy/print shielding. See openProtectedPdf()/armShield().
const pdfShield = ref(null);
const shieldHidden = ref(false);   // true while the content is covered
const messages = reactive([]);
const notifications = reactive([
  { text: 'Dashboard connected — grades, classes and library sync live from the school server.', meta: 'Just now · System', read: false },
  { text: 'New assignments show up here the moment your teacher posts them.', meta: 'Always on · Classroom', read: true },
  { text: 'Your timetable follows your registered course roadmap automatically.', meta: 'Auto · Timetable', read: true }
]);

const readerModal = ref(null);
const readerPage = ref(1);
const readerZoom = ref(1);
const roomModal = ref(null);

const student = reactive({
  name: '', fullname: '', cgpa: null, payment_status: 'pending', email: '',
  phone: '', career_path: '', course_name: 'BOI RSU course', experience_level: '',
  track: '', preferred_time: '', preferred_daily_times: null, current_month: null,
  location: '', country: '', cohort: '',
  // Monthly school-fee access window (server truth — no localStorage bypass)
  access_locked: true, access_paid_through: '', access_days_left: 0,
  monthly_fee: 50000, months_paid: 0
});
const paymentGate = reactive({
  open: false,
  loading: false,
  amount: 50000,          // per-MONTH fee for the student's course
  course: 'BOI RSU course',
  status: 'unpaid',
  error: '',
  dismissable: true
});
// How many months the student is paying for in this checkout session.
const gateMonths = ref(1);
const gateTotal = computed(() => Number(paymentGate.amount || 0) * Number(gateMonths.value));
function setGateMonths(n) { gateMonths.value = n; }

/**
 * The one and only lock rule: the dashboard is unlocked while a paid
 * monthly-fee window exists on the SERVER record. No localStorage flags.
 */
function hasActiveAccess() {
  return student.payment_status === 'paid'
    && !student.access_locked
    && student.access_days_left > 0;
}

function applyAccessState(a) {
  if (!a) return;
  student.access_locked = !!a.locked;
  student.access_paid_through = a.paid_through || '';
  student.access_days_left = Number(a.days_left || 0);
  if (a.monthly_fee) {
    student.monthly_fee = Number(a.monthly_fee);
    paymentGate.amount = student.monthly_fee;   // price depends on the course
  }
}

// Today's Classes is DERIVED from the live backend timetable in
// syncScheduleFromTimetable() — the old hardcoded "CS university" list
// (CS 214 Data Structures, MTH 210 Discrete Math…) is gone. Empty until the
// school server publishes the student's registered course schedule.
const today = reactive([]);

const rooms = {};

// The week grid starts EMPTY and is rebuilt from the live backend timetable
// (/api/timetable/<career_path>) in syncScheduleFromTimetable() — every
// subject on the Timetable page is now from the student's registered course
// (e.g. HTML5, CSS3, JavaScript, React for a front-end student), never demo data.
const week = reactive({ Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] });

// Library: starts empty and fills from the school server (teacher-uploaded PDF
// textbooks + AI course textbooks) and live SSE — the old fake documents
// ("Python Lab Manual", "Trees & Graphs notes"…) no longer shadow real ones.
const docs = reactive([]);

// Rows are [code, name, units, score, grade]. Filled only from the student's
// real per-topic quiz records when their record loads (see applyStudent) —
// an empty table now honestly means "no quizzes yet" (see the Grades template).
const courses = reactive([]);

const semesters = reactive([
  { l: 'S1', g: null }, { l: 'S2', g: null }, { l: 'S3', g: null }, { l: 'S4', g: null }
]);

// Classroom assignments — loaded from the backend and updated live via SSE.
// The teacher gives these in /classroom/teacher and they appear here instantly.
const assignments = ref([]);

const assignmentStatus = (s) => {
  const k = String(s || 'Pending').toLowerCase();
  if (k === 'submitted') return ['Submitted', 'bg-[#7db1ff]/15 text-[#7db1ff]'];
  if (k.startsWith('graded')) return [s, 'bg-[#3ce6c3]/15 text-[#3ce6c3]'];
  return ['Pending', 'bg-[#ffb454]/15 text-[#ffb454]'];
};

const assignmentDate = (ts) => {
  try {
    const d = new Date(ts);
    return { d: d.getDate(), m: d.toLocaleString('en', { month: 'short' }) };
  } catch { return { d: '—', m: '—' }; }
};

/* ---------------- teacher's published class timetable ---------------- */
const classTimetable = ref(null);

async function loadClassTimetable() {
  const course = student.course_name || student.career_path || '';
  if (!course) return;
  const t = await api.listClassroomTimetable(course);
  classTimetable.value = t || null;
  syncScheduleFromTimetable();   // fold the teacher's sessions into the week grid
}

async function loadClassroomAssignments() {
  const course = student.course_name || student.career_path || '';
  const rows = await api.listClassroomAssignments(course);
  if (!rows || !rows.length) return;
  assignments.value = rows.map(a => {
    const dt = assignmentDate(a.ts);
    return {
      id: a.id,
      title: a.title,
      course: a.course || course,
      instructions: a.instructions || '',
      due: a.due || '',
      teacher: a.teacher || 'Teacher',
      status: assignmentStatus(a.status),
      d: dt.d, m: dt.m, ts: a.ts || ''
    };
  });
}

const members = [
  ['TA', 'Tobi Adeleke', '#7db1ff', 'Class representative'],
  ['AM', 'Amara Obi', '#3ce6c3', 'Study group lead'],
  ['MD', 'Mr. Adeyemi', '#ffb454', 'Course instructor'],
  ['FK', 'Fatima Khan', '#ff7a6b', 'Member'],
  ['CN', 'Chen Lu', '#b7a6ff', 'Member']
];

const announcements = [
  { text: 'Your weekly classes follow your registered course roadmap, month by month — see My Timetable.', meta: 'Today · Academic Office', color: 'coral' },
  { text: 'Every class pairs with its YouTube lesson; the AI textbook lands in your Library after class.', meta: 'This week · Learning System', color: 'teal' },
  { text: 'Assignments your teacher posts in the classroom appear on this dashboard instantly.', meta: 'Live · Classroom', color: 'amber' }
];

const profileFields = [
  { label: 'Full name', value: 'Ada Nwosu' },
  { label: 'Student email', value: 'ada.nwosu@devsphere.edu' },
  { label: 'Programme', value: 'B.Sc. Computer Science' }
];

const preferences = reactive([
  { title: 'Push notifications', sub: 'Class reminders & grade alerts', on: true },
  { title: 'Email digest', sub: 'Weekly summary every Monday', on: false },
  { title: 'Default anonymous in chat', sub: 'Always post as Anonymous', on: false }
]);

const libTags = ['All', 'Notes', 'Slides', 'Past Papers', 'Manuals'];
const replies = ['Noted — thank you.', 'Could you share the page number as well?', 'I will review it right after the lab.', 'Adding it to my notes now.', 'Has anyone else attempted question 4?', 'I will save it to the shared folder.'];

// A computed (not a plain array) so the Assignments badge reflects rows that
// arrive after mount: loadClassroomAssignments() resolves asynchronously, so as a
// plain array the pill was evaluated once during setup and always rendered empty.
// boi-school/roadmap.vue's sidebar uses the identical computed shape, so both
// sidebars show the same count. The templates need no change — `v-for="item in
// navItems"` unwraps a computed automatically.
const navItems = computed(() => [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'timetable', label: 'My Timetable', icon: CalendarIcon },
  { id: 'library', label: 'Library', icon: BookIcon },
  { id: 'roadmap', label: 'Roadmap', icon: BookIcon, pill: 'New' },
  { id: 'grades', label: 'Grades & CGPA', icon: ChartIcon },
  { id: 'chat', label: 'Cohort Chat', icon: ChatIcon, pill: '24-B' },
  { id: 'assignments', label: 'Assignments', icon: FileIcon, pill: String(assignments.value.filter(a => a.status[0] === 'Pending').length || '') },
  { id: 'settings', label: 'Settings', icon: SettingsIcon }
]);

const pageTitles = {
  dashboard: 'Dashboard', timetable: 'My Timetable', library: 'Library', roadmap: 'Roadmap',
  grades: 'Grades & CGPA', chat: 'Cohort Chat', assignments: 'Assignments', settings: 'Settings'
};

// Complete utility strings rather than fragments to concatenate. Tailwind only
// emits a class it can literally see in the source, so the old `'bg-' + fragment`
// built the right-looking name at runtime for a rule that was never in the
// stylesheet — those dots and cover letters rendered uncoloured.
const dotClass = {
  teal: 'bg-[#3ce6c3]', amber: 'bg-[#ffb454]', coral: 'bg-[#ff7a6b]', sky: 'bg-[#7db1ff]'
};

const statClass = {
  teal: 'text-[#3ce6c3]', amber: 'text-[#ffb454]', coral: 'text-[#ff7a6b]', sky: 'text-[#7db1ff]'
};

const coverClass = {
  teal: 'text-[#3ce6c3]/90', amber: 'text-[#ffb454]/90', coral: 'text-[#ff7a6b]/90', sky: 'text-[#7db1ff]/90'
};

// Split in two: the timetable block's own styling, and the room chip inside it.
// These used to be one string with '-chip' appended at the call site, which both
// produced a dangling `hue-teal-chip-chip` class and re-applied the block's
// gradient and left border to the chip.
const hueBlock = {
  teal: 'border-l-[#3ce6c3] bg-gradient-to-br from-[#3ce6c3]/15 to-[#3ce6c3]/5 hover:from-[#3ce6c3]/25 hover:to-[#3ce6c3]/10 text-[#3ce6c3]',
  amber: 'border-l-[#ffb454] bg-gradient-to-br from-[#ffb454]/15 to-[#ffb454]/5 hover:from-[#ffb454]/25 hover:to-[#ffb454]/10 text-[#ffb454]',
  coral: 'border-l-[#ff7a6b] bg-gradient-to-br from-[#ff7a6b]/15 to-[#ff7a6b]/5 hover:from-[#ff7a6b]/25 hover:to-[#ff7a6b]/10 text-[#ff7a6b]',
  sky: 'border-l-[#7db1ff] bg-gradient-to-br from-[#7db1ff]/15 to-[#7db1ff]/5 hover:from-[#7db1ff]/25 hover:to-[#7db1ff]/10 text-[#7db1ff]'
};

const hueChip = {
  teal: 'bg-[#3ce6c3]/15 text-[#3ce6c3]',
  amber: 'bg-[#ffb454]/15 text-[#ffb454]',
  coral: 'bg-[#ff7a6b]/15 text-[#ff7a6b]',
  sky: 'bg-[#7db1ff]/15 text-[#7db1ff]'
};

// Computed so the Assignments tile always shows the REAL number of live
// assignments from the backend (replaced the hardcoded "3 pending").
const quickActions = computed(() => [
  { title: 'Timetable', sub: 'Weekly schedule', icon: CalendarIcon, bgClass: 'bg-[#ffb454]/15', iconColor: 'text-[#ffb454]', action: () => go('timetable') },
  { title: 'Library', sub: 'PDFs & notes', icon: BookIcon, bgClass: 'bg-[#ff7a6b]/15', iconColor: 'text-[#ff7a6b]', action: () => go('library') },
  { title: 'My CGPA', sub: 'Performance', icon: ChartIcon, bgClass: 'bg-[#25d366]/15', iconColor: 'text-[#25d366]', action: () => go('grades') },
  { title: 'Cohort Chat', sub: 'WhatsApp group', icon: ChatIcon, bgClass: 'bg-[#7db1ff]/15', iconColor: 'text-[#7db1ff]', action: () => go('chat') },
  { title: 'Assignments', sub: assignments.value.length ? assignments.value.length + ' from your teacher' : 'None posted yet', icon: FileIcon, bgClass: 'bg-[#3ce6c3]/15', iconColor: 'text-[#3ce6c3]', action: () => go('assignments') },
  { title: 'Book Study Room', sub: 'Reserve a space', icon: RoomIcon, bgClass: 'bg-[#3ce6c3]/15', iconColor: 'text-[#3ce6c3]', action: () => toast('Study room B-107 reserved for 4:00 PM.') }
]);

// Reactive so applyStudent() can swap in the real CGPA, quiz average and
// attendance rate without the Grades template knowing anything changed.
const stats = reactive([
  { label: 'CGPA', value: 'N/A', sub: '', desc: 'No grade data yet', color: 'teal' },
  { label: 'Credits', value: '58', sub: '/120', desc: '48% complete', color: 'sky' },
  { label: 'Rank', value: '#7', sub: '/86', desc: 'Top 8%', color: 'amber' },
  { label: 'Attendance', value: '92%', sub: '', desc: 'Min: 75%', color: 'coral' }
]);

// ===================== COMPUTED =====================
const pageTitle = computed(() => pageTitles[currentView.value] || 'Dashboard');
const unreadCount = computed(() => notifications.filter(n => !n.read).length);
const savedDocs = computed(() => [...saved].map(id => docs.find(d => d.id === id)).filter(Boolean));
const filteredDocs = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return docs.filter(d => (activeTag.value === 'All' || d.tag === activeTag.value) && d.title.toLowerCase().includes(q));
});

const dateStr = computed(() => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
const greeting = computed(() => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
});
const todayShort = computed(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]);

const countdown = reactive({ h: '00', m: '00', s: '00' });
const cdLabel = ref('Class starts in');
const heroKicker = ref('Up next today');
const heroChip = ref('up');
const heroClass = reactive({ code: '', name: '', start: '', end: '', room: '' });

const dial1Offset = ref(339.3);
const dial1Num = ref('0.00');
const dial2Offset = ref(477.5);
const dial2Num = ref('0.00');

// ===================== HELPERS =====================
const toMin = t => { const [a, b] = String(t).split(':').map(Number); return (a || 0) * 60 + (b || 0); };
const fmt12 = t => {
  if (!t) return '—';                       // empty slots (no class yet) render a dash
  let [h, m] = String(t).split(':').map(Number);
  const ap = (h || 0) >= 12 ? 'PM' : 'AM';
  h = (h || 0) % 12 || 12;
  return h + ':' + String(m || 0).padStart(2, '0') + ' ' + ap;
};
const initials = who => who.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const truncate = (s, n) => s.length > n ? s.slice(0, n) + '…' : s;
const formatMoney = (value) => Number(value || 0).toLocaleString('en-US');
const nowTime = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

function closePaymentGate() {
  paymentGate.dismissable = true;
  paymentGate.error = '';
  paymentGate.open = false;
  if (!hasActiveAccess()) {
    toast('Monthly fees must be paid before you can unlock the dashboard.', 'warn');
  }
}

function requirePaidAccess() {
  if (hasActiveAccess()) {
    paymentGate.status = 'paid';
    paymentGate.open = false;
    paymentGate.error = '';
    return true;
  }

  paymentGate.status = 'unpaid';
  paymentGate.course = student.course_name || paymentGate.course;
  paymentGate.open = true;
  paymentGate.error = 'Your monthly school fees are due — pay to unlock the dashboard.';
  return false;
}

function validateStudentPaymentState(studentRecord) {
  const status = String(studentRecord?.payment_status || studentRecord?.paymentStatus || '').toLowerCase();
  const fee = Number(studentRecord?.monthly_fee) || Number(paymentGate.amount) || 50000;
  const course = studentRecord?.course_name || studentRecord?.career_path || 'BOI RSU course';

  paymentGate.amount = fee;                       // per-month, by course
  paymentGate.course = course;
  student.email = studentRecord?.email || student.email || '';
  student.course_name = course;
  student.payment_status = status === 'paid' ? 'paid' : 'pending';

  applyAccessState({
    locked: studentRecord?.access_locked != null ? !!studentRecord.access_locked : true,
    paid_through: studentRecord?.access_paid_through || '',
    days_left: Number(studentRecord?.access_days_left || 0),
    monthly_fee: fee
  });

  if (hasActiveAccess()) {
    paymentGate.status = 'paid';
    paymentGate.open = false;
    paymentGate.error = '';
    localStorage.removeItem('boi_dashboard_paid');   // legacy bypass flag — gone
    return;
  }

  student.payment_status = 'pending';
  paymentGate.status = 'unpaid';
  paymentGate.open = true;
  paymentGate.error = 'Your monthly school fees are due — pay to unlock the dashboard.';
  localStorage.removeItem('boi_dashboard_paid');     // legacy bypass flag — gone
}

function openPaystackCheckout() {
  const publicKey = (import.meta.env && import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) || '';
  if (!publicKey) {
    paymentGate.error = 'Paystack public key is not configured. Add VITE_PAYSTACK_PUBLIC_KEY to the frontend environment.';
    return;
  }
  if (!window.PaystackPop) {
    paymentGate.error = 'Paystack is not configured in this environment. Add VITE_PAYSTACK_PUBLIC_KEY or enable the script on this page.';
    return;
  }

  paymentGate.loading = true;
  paymentGate.error = '';

  const handler = window.PaystackPop.setup({
    key: publicKey,
    email: student.email || 'student@boirsu.com',
    amount: Math.round(Number(gateTotal.value || 0) * 100),
    currency: 'NGN',
    ref: 'BOIRSU-' + Date.now(),
    metadata: {
      custom_fields: [
        { display_name: 'Student name', variable_name: 'student_name', value: student.name || 'Student' },
        { display_name: 'Course', variable_name: 'course', value: paymentGate.course },
        { display_name: 'Months paid', variable_name: 'months', value: String(gateMonths.value) }
      ]
    },
    callback: (response) => {
      // Do NOT unlock yet — only the SERVER (secret-key verification +
      // monthly-window extension) can open the dashboard.
      paymentGate.loading = true;
      paymentGate.status = 'verifying';
      paymentGate.error = '';
      paymentGate.course = paymentGate.course;
      localStorage.setItem('boi_paystack_ref', response.reference || '');
      toast('Payment received — verifying with Paystack…', 'ok');

      api.verifyPaystackPayment({
        studentId: localStorage.getItem('boi_student_id') || '',
        reference: response.reference || '',
        months: gateMonths.value,
        kind: 'monthly-fees'
      }).then(v => {
        paymentGate.loading = false;
        if (v && v.verified && v.access && !v.access.locked) {
          student.payment_status = 'paid';
          applyAccessState(v.access);
          paymentGate.status = 'paid';
          paymentGate.open = false;
          paymentGate.error = '';
          toast(`Fees confirmed 🎉 Dashboard unlocked through ${(v.access.paid_through || '').slice(0, 10)}.`, 'ok');
        } else {
          paymentGate.status = 'unpaid';
          paymentGate.open = true;
          paymentGate.error = (v && v.error)
            ? ('Verification failed: ' + v.error)
            : ('Could not verify this payment. Save ref ' + (response.reference || '') + ' and contact support.');
        }
      }).catch(() => {
        paymentGate.loading = false;
        paymentGate.status = 'unpaid';
        paymentGate.open = true;
        paymentGate.error = 'Network hiccup while verifying — your ref is saved and will be reconciled automatically on next load.';
      });
    },
    onClose: () => {
      paymentGate.loading = false;
      if (!hasActiveAccess()) {
        paymentGate.error = 'Checkout closed before verification completed — complete payment to unlock the dashboard.';
      }
    }
  });

  handler.openIframe();
}

const classStatus = c => {
  const now = new Date();
  const nm = now.getHours() * 60 + now.getMinutes();
  if (nm < toMin(c.start)) return 'up';
  if (nm >= toMin(c.end)) return 'done';
  return 'live';
};

const gradeClass = g => {
  const base = 'inline-block min-w-[34px] text-center font-bold text-[10px] lg:text-[12px] px-2 py-1 rounded-lg';
  if (g === 'A') return base + ' bg-[#3ce6c3]/15 text-[#3ce6c3]';
  if (g === 'B+') return base + ' bg-[#7db1ff]/15 text-[#7db1ff]';
  if (g === 'B') return base + ' bg-[#ffb454]/15 text-[#ffb454]';
  return base + ' bg-[#ff7a6b]/15 text-[#ff7a6b]';
};

// ===================== NAVIGATION =====================
function go(p) {
  if (!pageTitles[p]) p = 'dashboard';
  if (!hasActiveAccess()) {
    requirePaidAccess();   // opens the monthly-fees gate
    return;
  }
  currentView.value = p;
  bellOpen.value = false;
  mobileMenuOpen.value = false;
  const panel = document.querySelector('.overflow-y-auto');
  if (panel) panel.scrollTop = 0;
  document.title = pageTitles[p] + ' · ' + brandName.value;
  flashProgress();
  if (p === 'dashboard') animateDial(1);
  if (p === 'grades') animateDial(2);
}

function goRoadmap() {
  if (!requirePaidAccess()) return;
  bellOpen.value = false;
  mobileMenuOpen.value = false;
  router.push('/roadmap')
}

/**
 * Deep links: /dashboard?view=<id>. The roadmap sidebar hands off here (see
 * dashboardTarget() in boi-school/roadmap.vue) so clicking "Library" while on
 * /roadmap opens Library rather than the dashboard's default tab — that is what
 * makes the two sidebars behave identically instead of only looking identical.
 *
 * Routed through go() on purpose: a query string must respect the same
 * monthly-fees gate every nav click does, so it can never be used to bypass the
 * paywall. Unknown ids and 'roadmap' (which is its own route) are ignored.
 */
function applyViewFromQuery() {
  const v = String(route.query.view || '');
  if (!v || !pageTitles[v] || v === 'roadmap') return;
  go(v);
}

function flashProgress() {
  const bar = progressBar.value;
  if (!bar) return;
  bar.style.width = '72%';
  setTimeout(() => {
    bar.style.width = '100%';
    setTimeout(() => {
      bar.style.transition = 'none';
      bar.style.width = '0';
      requestAnimationFrame(() => (bar.style.transition = ''));
    }, 460);
  }, 30);
}

// ===================== TOASTS =====================
let toastId = 0;
function toast(msg, type = 'ok') {
  const id = ++toastId;
  toasts.push({ id, msg, type });
  setTimeout(() => {
    const idx = toasts.findIndex(t => t.id === id);
    if (idx > -1) toasts.splice(idx, 1);
  }, 3400);
}

// ===================== LIBRARY =====================
function toggleSave(id) {
  const d = docs.find(x => x.id === id);
  if (saved.has(id)) {
    saved.delete(id);
    toast('Removed from your saved items.', 'warn');
  } else {
    saved.add(id);
    toast('Saved "' + d.title + '" to your library.');
  }
}

function goAndHighlight(id) {
  go('library');
  nextTick(() => {
    setTimeout(() => {
      const el = document.getElementById('doc-' + id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-[#ffb454]');
        setTimeout(() => el.classList.remove('ring-2', 'ring-[#ffb454]'), 1800);
      }
    }, 350);
  });
}

function jumpToLibrary() {
  searchQuery.value = globalSearch.value;
  go('library');
}

// ===================== PDF GENERATOR =====================
// Non-ASCII is folded to ASCII on purpose: the Blob encodes the string as
// UTF-8, so a curly quote or em-dash from the AI would make the byte count
// disagree with /Length and some readers reject the file outright.
function esc(s) {
  return String(s)
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[•●·]/g, '*')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

// Soft-wrap prose to a column width, preserving blank lines between paragraphs.
function wrapLines(text, width = 92) {
  const out = [];
  String(text).split(/\n/).forEach(para => {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (!words.length) { out.push(''); return; }
    let line = '';
    words.forEach(w => {
      if (line && (line + ' ' + w).length > width) { out.push(line); line = w; }
      else line = line ? line + ' ' + w : w;
    });
    if (line) out.push(line);
  });
  return out;
}

const PDF_LINES_PER_PAGE = 44;

function makePdf(title, lines) {
  // Paginated: a generated course runs to thousands of words, and a single
  // fixed page silently dropped everything past the first screenful.
  const pages = [];
  for (let i = 0; i < lines.length; i += PDF_LINES_PER_PAGE) {
    pages.push(lines.slice(i, i + PDF_LINES_PER_PAGE));
  }
  if (!pages.length) pages.push([]);

  const streams = pages.map((pageLines, p) => {
    let s = 'BT\n/F1 ' + (p === 0 ? 18 : 11) + ' Tf 16 TL\n72 740 Td\n';
    if (p === 0) s += '(' + esc(title) + ') Tj T*\n/F1 11 Tf\n';
    pageLines.forEach(l => { s += '(' + esc(l) + ') Tj T*\n'; });
    return s + 'ET';
  });

  // 1 catalog · 2 pages · 3 font · then (page, contents) pairs from object 4.
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [' + pages.map((_, i) => (4 + i * 2) + ' 0 R').join(' ') + '] /Count ' + pages.length + ' >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];
  streams.forEach((st, i) => {
    const n = 4 + i * 2;
    objs[n - 1] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ' + (n + 1) + ' 0 R /Resources << /Font << /F1 3 0 R >> >> >>';
    objs[n] = '<< /Length ' + st.length + ' >>\nstream\n' + st + '\nendstream';
  });

  let pdf = '%PDF-1.4\n';
  const offs = [];
  objs.forEach((o, i) => { offs[i] = pdf.length; pdf += (i + 1) + ' 0 obj\n' + o + '\nendobj\n'; });
  const xref = pdf.length;
  pdf += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n';
  offs.forEach(o => { pdf += String(o).padStart(10, '0') + ' 00000 n \n'; });
  pdf += 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
  return new Blob([pdf], { type: 'application/pdf' });
}

function savePdf(blob, title) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = title.replace(/[^\w]+/g, '_').slice(0, 80) + '.pdf';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('Downloading "' + title + '"…');
}

async function downloadDoc(d) {
  // Admin/partner commerce rules come first: a read-only book can be read in
  // the viewer but is never downloadable, whatever else it is.
  if (d && d.read_only) {
    toast('"' + d.title + '" is read-only — open it with Read instead.', 'warn');
    return;
  }
  // A priced book the student has not bought yet — send them to the Buy flow.
  if (d && d.price > 0 && !isBought(d)) {
    toast('"' + d.title + '" costs ₦' + formatMoney(d.price) + ' — tap Buy on its library card first.', 'warn');
    return;
  }
  // Teacher-uploaded PDF textbooks save the REAL uploaded file.
  if (d && d.kind === 'pdf-textbook' && d.pdf_id) {
    const blob = await api.downloadTextbookPdf(d.pdf_id, currentStudentId());
    if (blob) { savePdf(blob, d.file_name || d.title); return; }
    toast('Could not fetch the PDF file — check that the backend is running.', 'warn');
    return;
  }
  // Roadmap course textbooks download the REAL server-generated PDF.
  if (d && d.download) {
    const a = document.createElement('a');
    a.href = d.download;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast('Downloading \"' + d.title + '\"…');
    return;
  }
  // AI courses download their real lesson text — the same text audio mode
  // narrates. Everything else keeps the original demo cover sheet.
  if (d && d.kind === 'textbook') {
    // Flatten every chapter/lesson of the W3Schools book into printable text.
    const tb = await api.getTextbook(d.id);
    if (tb && (tb.chapters || []).length) {
      const lines = ['', brandName.value + ' · W3Schools-style class textbook',
        'Source video: ' + (tb.video_title || ''), ''];
      // Cover + introduction + contents written by the combined author prompt.
      if (tb.subtitle) lines.push(tb.subtitle, '');
      if (tb.introduction) {
        lines.push('INTRODUCTION', '');
        wrapLines(tb.introduction).forEach(x => lines.push(x));
        lines.push('', '');
      }
      if ((tb.toc || []).length) {
        lines.push('CONTENTS', '');
        tb.toc.forEach((row, i) => lines.push('  ' + (i + 1) + '. ' + (row.chapter || '')));
        lines.push('', '');
      }
      (tb.chapters || []).forEach(ch => {
        lines.push('CHAPTER — ' + ch.chapter, '');
        if (ch.overview) { wrapLines(ch.overview).forEach(x => lines.push(x)); lines.push(''); }
        (ch.lessons || []).forEach(l => {
          lines.push(l.lesson_num + '. ' + l.title, '');
          wrapLines(l.intro || '').forEach(x => lines.push(x));
          if (l.content) { lines.push(''); wrapLines(l.content).forEach(x => lines.push(x)); }
          if (l.example && l.example.code) {
            lines.push('', 'Example (' + l.example.lang + '):');
            wrapLines(l.example.code).forEach(x => lines.push('    ' + x));
          }
          if (l.example_explanation) {
            lines.push('', 'How it works:');
            wrapLines(l.example_explanation).forEach(x => lines.push(x));
          }
          if (l.second_example && l.second_example.code) {
            lines.push('', 'Example 2 (' + l.second_example.lang + '):');
            wrapLines(l.second_example.code).forEach(x => lines.push('    ' + x));
          }
          if (l.second_example_explanation) {
            wrapLines(l.second_example_explanation).forEach(x => lines.push(x));
          }
          if ((l.common_mistakes || []).length) {
            lines.push('', 'Common Mistakes:');
            l.common_mistakes.forEach(m => lines.push('  - ' + m));
          }
          if ((l.key_points || []).length) {
            lines.push('', 'Key Points:');
            l.key_points.forEach(k => lines.push('  - ' + k));
          }
          if (l.note) lines.push('', 'Note: ' + l.note);
          if (l.tip) lines.push('Tip: ' + l.tip);
          if (l.exercise && l.exercise.prompt) {
            lines.push('', 'Exercise: ' + l.exercise.prompt);
            if (l.exercise.hint) lines.push('Hint: ' + l.exercise.hint);
          }
          lines.push('', '');
        });
      });
      const ps = tb.practice_section || {};
      if ((ps.exercises || []).length) {
        lines.push('PRACTICE', '');
        ps.exercises.forEach(e => {
          wrapLines((e.number || '') + '. ' + (e.prompt || '')).forEach(x => lines.push(x));
          lines.push('');
        });
      }
      if ((ps.answers || []).length) {
        lines.push('ANSWERS', '');
        ps.answers.forEach(a => {
          wrapLines((a.number || '') + '. ' + (a.answer || '')).forEach(x => lines.push(x));
          lines.push('');
        });
      }
      if (tb.conclusion) {
        lines.push('CONCLUSION', '');
        wrapLines(tb.conclusion).forEach(x => lines.push(x));
        lines.push('', '');
      }
      if ((tb.glossary || []).length) {
        lines.push('GLOSSARY', '');
        tb.glossary.forEach(g => {
          wrapLines((g.term || '') + ' — ' + (g.definition || '')).forEach(x => lines.push(x));
        });
        lines.push('');
      }
      savePdf(makePdf(tb.title || 'Class textbook', lines), d.title);
      return;
    }
    toast('Could not fetch the textbook text — saving the cover sheet instead.', 'warn');
  }
  if (d && d.ai) {
    const c = readerCourse.value && readerCourse.value.id === d.id
      ? readerCourse.value
      : await api.getCourse(d.id);
    if (c && (c.sections || []).length) {
      const lines = ['', brandName.value + ' · AI-generated course', 'Topic: ' + (c.topic || ''),
                     'Sections: ' + c.sections.length, ''];
      c.sections.forEach(s => {
        lines.push('Section ' + s.section_num + ' — ' + (s.title || ''), '');
        wrapLines(s.content || '').forEach(l => lines.push(l));
        lines.push('', '');
      });
      savePdf(makePdf(c.title || c.topic || 'AI course', lines), d.title);
      return;
    }
    toast('Could not fetch the lesson text — saving the cover sheet instead.', 'warn');
  }
  const blob = makePdf(d.title, ['', brandName.value + ' Digital Library', 'Category: ' + d.tag + '  ·  ' + d.pages + ' pages', 'Uploaded: ' + d.updated + '  ·  ' + d.size, '', 'This is a demo document generated by the student portal.', '', 'Happy studying.']);
  savePdf(blob, d.title);
}

// ===================== READER =====================
function openReader(id) {
  const d = docs.find(x => x.id === id);
  // Teacher-uploaded PDF textbooks: priced books go through the Buy flow
  // first; READ-ONLY books (admin/partner lock) open in the protected
  // in-dashboard reader — never the raw URL, which would hand the student a
  // browser PDF toolbar with its own Download/Print buttons.
  if (d && d.kind === 'pdf-textbook' && d.pdf_id) {
    if (d.price > 0 && !isBought(d)) {
      toast('"' + d.title + '" costs ₦' + formatMoney(d.price) + ' — tap Buy on its library card first.', 'warn');
      return;
    }
    if (d.read_only) { openProtectedPdf(d); return; }
    const join = d.download.includes('?') ? '&' : '?';
    window.open(d.download + join + 'student_id=' + encodeURIComponent(currentStudentId()) + '&inline=1', '_blank', 'noopener');
    toast('Opening "' + d.title + '"…');
    return;
  }
  // Roadmap course textbooks are REAL PDFs generated from the student's own
  // career roadmap — open the actual document instead of the demo preview.
  if (d && d.download) {
    window.open(d.download + '?inline=1', '_blank', 'noopener');
    toast('Opening \"' + d.title + '\"…');
    return;
  }
  readerModal.value = d;
  readerPage.value = 1;
  readerZoom.value = 1;
  readerCourse.value = null;
  readerTab.value = 'read';
  resetSectionExtras();
  readerTextbook.value = null;
  tbChapter.value = 0;
  tbLesson.value = null;
  if (d && d.kind === 'textbook') openTextbook(d);   // W3Schools renderer
  if (d && d.ai && d.kind !== 'textbook') openAiCourse(d);
}

// ===================== ROOM MODAL =====================
// BOI RSU classes stream live online — there is no campus room map, so an
// unknown "room" means an online session, not a fake Block A.
function openRoom(room, cls) {
  const r = rooms[room] || { building: 'Live online class', floor: 'Join from anywhere — link opens in the classroom', cap: 'Your cohort' };
  roomModal.value = { room, building: r.building, floor: r.floor, cap: r.cap, class: String(cls || '').split(' ').slice(0, 2).join(' ') };
}

// ===================== NOTIFICATIONS =====================
function readNotif(i) {
  notifications[i].read = true;
  bellOpen.value = false;
  toast('Marked as read.');
}

// ===================== CHAT =====================
function seedChat() {
  [
    { who: 'Mr. Adeyemi', color: '#ffb454', text: 'Reminder: this week\'s live class follows the timetable on your dashboard — check the Timetable page for the exact day and time.' },
    { who: 'Tobi Adeleke', color: '#7db1ff', text: 'Just finished this week\'s lesson video — the AI textbook for it is already in the Library.' },
    { who: 'Amara Obi', color: '#3ce6c3', text: 'Same here. Search the Library for the topic title and it opens right in the app.' },
    { who: 'Anon', color: '', anon: true, text: 'Could we schedule an extra review session before this month\'s project milestone?' },
    { who: 'Fatima Khan', color: '#ff7a6b', text: 'Adding my voice to that. Mr. Adeyemi, would Saturday afternoon work for you?' }
  ].forEach(addMsg);
}

function addMsg(m) {
  messages.push({ ...m, time: nowTime() });
  nextTick(() => {
    if (threadRef.value) threadRef.value.scrollTop = threadRef.value.scrollHeight;
  });
}

async function sendMsg() {
  const v = chatInput.value.trim();
  if (!v) return;
  addMsg({ who: 'You', color: '#3ce6c3', text: v, me: true, anon: anonMode.value });
  chatInput.value = '';
  typing.value = true;

  // Grounded in whatever section the reader has open, when one is.
  const c = readerCourse.value;
  const answer = await api.ask(v, c ? c.id : null, c ? readerPage.value : null);
  typing.value = false;
  if (answer) {
    addMsg({ who: 'AI Tutor', color: '#3ce6c3', text: answer });
    return;
  }
  // Backend down or no NVIDIA key — fall back to the canned cohort replies so
  // the thread never dead-ends on a spinner.
  addMsg({ who: 'Tobi Adeleke', color: '#7db1ff', text: replies[Math.floor(Math.random() * replies.length)] });
}

// ===================== BACKEND (boi-rsu) =====================
// Talks to api_server.py on :5055, which bridges "ai_learning_system_v4 (14).py"
// (courses, quizzes, Deepgram narration, YouTube) and boirsu.py (student
// records, attendance, grades). Every loader here returns early on a null
// response, so a backend that is down or keyless leaves the demo data above
// exactly as it was — this page can never blank out because of a fetch.

const backendOnline = ref(false);
const aiReady = ref(false);            // NVIDIA key present -> generation works
const audioOk = ref(false);            // Deepgram key present -> audio mode works
const audioReason = ref('');
const studentId = ref('');

// ---- Live identity, real-time with registration.vue ----------------------
// The sidebar / mobile-menu / header cards used to be HARDCODED ("Ada Nwosu",
// "NU/CS/24/0157", "Cohort 24-B", "AN") — a demo persona that never changed.
// They now derive from the registered student state that
// hydrateProfileSnapshot()/applyStudent() keep updated; the demo strings are
// only a fallback while nobody has registered on this browser.
const studentInitials = computed(() => {
  const n = String(student.fullname || '').trim();
  if (!n) return 'AN';
  const parts = n.split(/\s+/).filter(Boolean);
  const ini = ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  return ini || n.slice(0, 2).toUpperCase();
});
const studentNameLine = computed(() => String(student.fullname || '').trim() || 'Ada Nwosu');
const studentIdLine = computed(() => String(studentId.value || '').trim() || 'NU/CS/24/0157');
const studentCohort = computed(() => String(student.cohort || '').trim() || 'Cohort 24-B');

// ---- Library commerce: priced PDF textbooks (admin/partner pricing) -------
// Buy button on a priced library card opens the SAME Paystack inline popup
// the monthly-fees gate uses, but the reference is verified against the
// BOOK's price server-side (POST /api/paystack/verify-textbook) and unlocks
// only that book for only this student.

/** The signed-in student id (ref first, registration's localStorage second). */
function currentStudentId() {
  return String(studentId.value || localStorage.getItem('boi_student_id') || '').trim();
}

/** Has this student already paid for the (priced) book? */
function isBought(d) {
  return !!d && (!!(d.purchased) || purchasedBooks.has(d.id));
}

function openBookCheckout(d) {
  const publicKey = (import.meta.env && import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) || '';
  if (!publicKey) {
    toast('Paystack public key is not configured. Add VITE_PAYSTACK_PUBLIC_KEY to the frontend environment.', 'warn');
    return;
  }
  if (!window.PaystackPop) {
    toast('Paystack is not available in this environment — the payment library did not load.', 'warn');
    return;
  }
  const reference = 'BOIBOOK-' + Date.now();   // Paystack-safe charset only
  const handler = window.PaystackPop.setup({
    key: publicKey,
    email: student.email || 'student@boirsu.com',
    amount: Math.round(Number(d.price || 0) * 100),
    currency: 'NGN',
    ref: reference,
    metadata: {
      custom_fields: [
        { display_name: 'Student name', variable_name: 'student_name', value: student.name || 'Student' },
        { display_name: 'Student ID', variable_name: 'student_id', value: currentStudentId() },
        { display_name: 'Textbook', variable_name: 'textbook', value: d.title || '' },
        { display_name: 'Textbook ID', variable_name: 'textbook_id', value: d.id || '' }
      ]
    },
    callback: (response) => {
      toast('Payment received — verifying with Paystack…', 'ok');
      api.verifyPaystackBookPayment({
        studentId: currentStudentId(),
        reference: response.reference || reference,
        textbookId: d.id
      }).then(v => {
        if (v && v.verified) {
          purchasedBooks.add(d.id);
          const row = docs.find(x => x.id === d.id);
          if (row) row.purchased = true;
          toast('"' + d.title + '" is yours now — Read or Download it anytime.', 'ok');
        } else {
          toast((v && v.error)
            ? ('Could not unlock: ' + v.error)
            : ('Could not verify this purchase. Save ref ' + (response.reference || reference) + ' and contact support.'), 'warn');
        }
      }).catch(() => {
        toast('Network hiccup while verifying — your ref is saved; reload the Library to retry.', 'warn');
      });
    },
    onClose: () => {
      if (!isBought(d)) toast('Checkout closed before payment completed — the book is still locked.', 'warn');
    },
  });
  handler.openIframe();
}

// ---- Protected read-only reader --------------------------------------------
// For books the admin/partner locked. Best-effort hardening (no web page can
// make OS screenshots impossible): the PDF is fetched as a blob so its raw
// URL is never exposed, rendered with the browser's PDF toolbar hidden, a
// student-identity watermark overlaid, and PrintScreen/copy/print/devtools
// shortcuts intercepted with a content blackout while the window loses focus
// (Snipping-Tool-style capture) — the watermark keeps every leak traceable.

const shieldWatermark = computed(() => {
  const id = studentIdLine.value || '';
  const name = studentNameLine.value || '';
  const both = (name && id) ? (name + ' · ' + id) : (id || name || 'Protected copy');
  return both + '  ·  read-only';
});

async function openProtectedPdf(d) {
  shieldHidden.value = false;
  pdfShield.value = { doc: d, blobUrl: '', loading: true, error: '' };
  const blob = await api.downloadTextbookPdf(d.pdf_id, currentStudentId());
  if (!blob || !(pdfShield.value && pdfShield.value.doc && pdfShield.value.doc.id === d.id)) {
    pdfShield.value = { doc: d, blobUrl: '', loading: false,
      error: 'Could not fetch the PDF — check that the backend (api_server.py) is running.' };
    return;
  }
  // '#toolbar=0&navpanes=0' hides Chrome/Edge's built-in PDF toolbar — the
  // one that carries its own Download and Print buttons.
  pdfShield.value.blobUrl = URL.createObjectURL(blob) + '#toolbar=0&navpanes=0';
  armShield();
}

function closeProtectedPdf() {
  disarmShield();
  const cur = pdfShield.value;
  if (cur && cur.blobUrl) {
    try { URL.revokeObjectURL(cur.blobUrl.split('#')[0]); } catch { /* noop */ }
  }
  pdfShield.value = null;
  shieldHidden.value = false;
}

let shieldRevealTimer = null;
function onShieldKey(e) {
  const key = String(e.key || '').toLowerCase();
  if (key === 'printscreen') {
    shieldHidden.value = true;
    try { if (navigator.clipboard) navigator.clipboard.writeText(' '); } catch { /* permission denied — fine */ }
    toast('Screenshots are disabled for this read-only book.', 'warn');
    e.preventDefault();
    return;
  }
  const mod = e.ctrlKey || e.metaKey;
  if (mod && ['p', 's', 'c', 'u'].includes(key)) {   // print / save / copy / view-source
    shieldHidden.value = true;
    e.preventDefault();
    return;
  }
  if (key === 'f12' || (mod && e.shiftKey && ['i', 'j', 'c'].includes(key))) {
    e.preventDefault();
  }
}
function onShieldBlur() { shieldHidden.value = true; }   // alt-tab / Snipping Tool / OBS
function onShieldFocus() {
  clearTimeout(shieldRevealTimer);
  shieldRevealTimer = setTimeout(() => { shieldHidden.value = false; }, 600);
}
function onShieldVisibility() { if (document.hidden) shieldHidden.value = true; }

function armShield() {
  window.addEventListener('keydown', onShieldKey, true);
  window.addEventListener('blur', onShieldBlur);
  window.addEventListener('focus', onShieldFocus);
  document.addEventListener('visibilitychange', onShieldVisibility);
}
function disarmShield() {
  window.removeEventListener('keydown', onShieldKey, true);
  window.removeEventListener('blur', onShieldBlur);
  window.removeEventListener('focus', onShieldFocus);
  document.removeEventListener('visibilitychange', onShieldVisibility);
  clearTimeout(shieldRevealTimer);
}

// ---- Partner-aware branding ----------------------------------------------
// The brand is "devsphere academy" by default. When a student registered with
// a partner's sponsor ID, the backend resolves that partner's org_name (the
// name the admin entered when registering the partner on the admin dashboard)
// and this portal shows it instead — sponsored students wear their sponsor's
// brand; everyone else sees the default.
const DEFAULT_BRAND = 'devsphere academy';
const brandName = ref(DEFAULT_BRAND);
const brandInitial = computed(() => (brandName.value.trim()[0] || 'D').toUpperCase());
const brandSplit = computed(() => {
  const n = brandName.value.trim() || DEFAULT_BRAND;
  const sp = n.lastIndexOf(' ');
  return sp > 0 ? [n.slice(0, sp), n.slice(sp + 1)] : [n, ''];
});
const brandFirst = computed(() => brandSplit.value[0]);
const brandAccent = computed(() => brandSplit.value[1]);
function setBrand(org) {
  const name = String(org || '').trim();
  brandName.value = name || DEFAULT_BRAND;
  // roadmap.vue reads this on mount, so both student pages stay in sync.
  try { localStorage.setItem('boi_sponsor_org', name); } catch {}
  document.title = (pageTitles[currentView.value] || 'Dashboard') + ' · ' + brandName.value;
}

// ---- Real-time sync with registration.vue --------------------------------
// Re-read the registration snapshot whenever it changes — same tab (custom
// "boi:profile-updated" event), another tab ("storage" event), or anything
// else (4s fingerprint poll). The timetable follows the newly-registered
// course immediately, and the identity card updates without a reload.
let lastSnapshotFingerprint = null;
let syncInt = null;
function syncFromRegistration() {
  const raw = localStorage.getItem('boi_student_profile') || '';
  const sid = localStorage.getItem('boi_student_id') || '';
  const fingerprint = sid + '|' + raw;
  const isFirstRead = lastSnapshotFingerprint === null;
  if (fingerprint === lastSnapshotFingerprint) return;
  lastSnapshotFingerprint = fingerprint;
  if (!raw && !sid) return;
  hydrateProfileSnapshot();
  if (sid) studentId.value = sid;
  loadTimetable();   // course may have changed — pull its live timetable
  if (!isFirstRead) toast('Profile updated from registration ✓', 'ok');
}
const realData = ref(false);
const gradesUnitLabel = ref('Units');  // becomes "Attempts" once quizzes drive the table

// Library: course generation panel
const genTopic = ref('');
const genLevel = ref('beginner');
const genJob = ref(null);              // { job_id, status, step, pct, topic }

// Reader: the AI course behind the open document, if any
const readerCourse = ref(null);
const readerLoading = ref(false);
const readerTab = ref('read');         // read | summary | quiz | resources | videos
const secSummary = ref('');
const secResources = ref(null);
const secVideos = ref(null);
const secBusy = ref('');

// Reader: quiz
const quiz = ref(null);
const quizPicks = reactive({});
const quizResult = ref(null);
const quizBusy = ref(false);

// Reader: audio mode
const audioEl = ref(null);
const audioPlaying = ref(false);
const audioLoading = ref(false);

let stopStream = null;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Page N of the reader IS section N, so the existing prev/next controls and the
// "Page x / y" counter navigate real lessons with no changes.
const readerSection = computed(() => {
  const c = readerCourse.value;
  if (!c) return null;
  return (c.sections || []).find(s => Number(s.section_num) === readerPage.value) || null;
});

const readerParas = computed(() => {
  const s = readerSection.value;
  if (!s || !s.content) return [];
  return String(s.content).split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
});

/* ---------------- W3Schools-style textbook renderer ----------------
   Chapter sidebar -> micro-lesson pages: intro -> example (code or image)
   -> editable "Try it Yourself »" sandbox -> variations -> Note/Tip ->
   Exercise + quiz link. Web langs (html/css/js) actually run in an iframe. */
const readerTextbook = ref(null);
const tbChapter = ref(0);
const tbLesson = ref(null);
const tryCode = ref('');
const tryRan = ref(false);
const tryKey = ref(0);

const tbChapters = computed(() => readerTextbook.value?.chapters || []);

// The combined author prompt writes the lesson's deep teaching text as
// `content`. Split it into short paragraphs so the reader page and the
// downloaded PDF show many small blocks instead of one wall of text.
const tbParagraphs = computed(() => {
  const raw = String(tbLesson.value?.content || '').trim();
  if (!raw) return [];
  return raw.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
});

async function openTextbook(d) {
  readerTextbook.value = null;
  tbChapter.value = 0;
  tbLesson.value = null;
  const tb = await api.getTextbook(d.id);
  readerTextbook.value = tb || null;
  if (!tb) toast('Could not load this textbook from the backend.', 'warn');
}

function openTbLesson(l) {
  tbLesson.value = l;
  resetTryIt();
}

function resetTryIt() {
  tryCode.value = tbLesson.value?.try_it?.starter || '';
  tryRan.value = false;
}

// Wrap edited code into a full document the sandbox iframe can execute.
function buildSandboxDoc(lang, code) {
  const l = String(lang || '').toLowerCase();
  if (l === 'html') {
    return '<!doctype html><html><body style="font-family:sans-serif;padding:12px">' + code + '</body></html>';
  }
  if (l === 'css') {
    return '<!doctype html><html><head><style>body{font-family:sans-serif;padding:12px}' + code + '</style></head>' +
      '<body><div class="demo"><h3>Demo box</h3><p>Edit the CSS to restyle me.</p></div></body></html>';
  }
  if (l === 'javascript' || l === 'js') {
    return '<!doctype html><html><head><style>body{font-family:ui-monospace,monospace;padding:10px;background:#fffdf5;font-size:13px}div{margin-bottom:2px}</style></head>' +
      '<body><div id="out"></div><script>(function(){var out=document.getElementById("out");' +
      'var log=console.log;console.log=function(){var a=[].slice.call(arguments).join(" ");' +
      'var d=document.createElement("div");d.textContent=a;out.appendChild(d);log.apply(console,arguments)};' +
      'try{' + code + '\n}catch(e){console.log("Error: "+e.message)}})();<\/scr' + 'ipt></body></html>';
  }
  return ''; // non-web langs show a "copy into your editor" note instead
}

const trySrcDoc = computed(() =>
  tryRan.value ? buildSandboxDoc(tbLesson.value?.try_it?.lang, tryCode.value) : ''
);

function runTryIt() {
  tryRan.value = true;
  tryKey.value++; // remount the iframe so every Run is a fresh page
}

function takeChapterQuiz() {
  toast('Chapter quiz coming from this class video — try the exercise above first!');
}

const audioSrc = computed(() => {
  const c = readerCourse.value;
  return c ? api.speakUrl(c.id, readerPage.value) : '';
});

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
// Options arrive either bare or already prefixed ("A) …", "B. …") depending on
// whether the model or boirsu's canned bank produced them. Strip the prefix and
// render the letter badge from the index so both look the same.
const optionText = o => String(o).replace(/^\s*[A-Fa-f]\s*[).:-]\s*/, '').trim();

const readerTabs = [
  { k: 'summary', label: 'AI summary' },
  { k: 'quiz', label: 'Quiz' },
  { k: 'resources', label: 'Resources' },
  { k: 'videos', label: 'Videos' }
];

function optionClass(qi, oi) {
  const letter = LETTERS[oi];
  const r = resultFor(qi);
  if (r) {
    if (letter === r.answer) return 'border-[#3ce6c3]/60 bg-[#3ce6c3]/10 text-[#3ce6c3]';
    if (letter === r.picked) return 'border-[#ff7a6b]/60 bg-[#ff7a6b]/10 text-[#ff7a6b]';
    return 'border-white/[0.06] text-slate-500';
  }
  return quizPicks[qi] === letter
    ? 'border-[#3ce6c3] bg-[#3ce6c3]/10 text-white'
    : 'border-white/[0.12] text-slate-300 hover:border-[#3ce6c3]/40';
}

/* ---------------- bootstrap ---------------- */

async function initBackend() {
  const s = await api.status();
  if (!s || s.error) {
    audioReason.value = 'backend offline';
    return;
  }
  backendOnline.value = true;
  aiReady.value = !!(s.keys && s.keys.nvidia);
  audioOk.value = !!(s.keys && s.keys.deepgram);
  audioReason.value = audioOk.value ? '' : 'DEEPGRAM_API_KEY not set';

  await Promise.all([loadAiCourses(), loadTextbooks(), loadRoadmapLibrary(), initStudent(), loadClassroomAssignments(), loadClassTimetable(), loadTimetable(), loadDailyPlan()]);
  reconcilePayment(); // silent: re-verify stored Paystack ref if record unpaid
  stopStream = api.subscribe(onServerEvent);
}

/**
 * If a Paystack reference exists but the backend record still says unpaid,
 * re-verify it once on load. This is the fix for "why am I asked to pay
 * again" — paid status now survives restarts because it lives in the
 * student record, not just in localStorage.
 */
async function reconcilePayment() {
  try {
    const sid = localStorage.getItem('boi_student_id');
    const ref = localStorage.getItem('boi_paystack_ref');
    if (!sid || !ref || hasActiveAccess()) return;   // already unlocked
    // months:0 on purpose — the server remembers this reference was already
    // granted, so a reconcile can never double-extend the window.
    const res = await api.verifyPaystackPayment({ studentId: sid, reference: ref, months: 0, kind: 'reconcile' });
    if (res && res.verified && res.access) {
      applyAccessState(res.access);
      if (!res.access.locked) toast(`Fee payment confirmed — unlocked through ${(res.access.paid_through || '').slice(0, 10)}.`);
    }
  } catch { /* silent — gate simply stays as-is */ }
}

/* ---------------- courses in the Library ---------------- */

async function loadAiCourses() {
  const rows = await api.listCourses();
  if (!rows || !rows.length) return;
  // Newest first, above the demo material. Replace-in-place on reload so a
  // second call can never duplicate a card.
  rows.slice().reverse().forEach(mergeDoc);
}

/**
 * Post-class W3Schools textbooks (one per watched class video) land here as
 * regular library cards; the reader renders their chapters/sandboxes below.
 */
async function loadTextbooks() {
  const rows = await api.listTextbooks(currentStudentId());
  if (!rows || !rows.length) return;
  rows.slice().reverse().forEach(mergeDoc);
}

/**
 * The student's OWN course reading material: one real PDF textbook per month,
 * generated server-side from their career roadmap (chapters, objectives, key
 * terms, quizzes, month project) and cached. This is what replaces the demo
 * shelf for a paid student — never another cohort's random topics.
 */
let libraryLoadedFor = '';
async function loadRoadmapLibrary() {
  const cp = student.career_path || localStorage.getItem('boi_career_path') || '';
  if (!cp || libraryLoadedFor === cp) return;
  const rows = await api.listRoadmapLibrary(cp);
  if (!rows || !rows.length) return;
  libraryLoadedFor = cp;
  rows.forEach(mergeDoc);
}

function mergeDoc(row) {
  if (!row || !row.id) return;
  // Cover styling fallbacks — roadmap PDF rows may arrive without the hue
  // class / big cover letter the shelf card renders. Textbook + AI rows set
  // their own; this only fills genuine gaps.
  if (!row.hue) row.hue = ['teal', 'amber', 'coral', 'sky'][docs.length % 4];
  if (!row.big) row.big = String(row.month || (row.title || 'B').trim()[0]).toUpperCase();
  const i = docs.findIndex(d => d.id === row.id);
  if (i > -1) docs.splice(i, 1, row);
  else docs.unshift(row);
}

async function generateCourse() {
  const topic = genTopic.value.trim();
  if (!topic) { toast('Type a topic first.', 'warn'); return; }
  if (genJob.value) return;

  genJob.value = { job_id: '', status: 'queued', step: 'Queued', pct: 0, topic };
  const started = await api.startCourse(topic, genLevel.value);
  if (!started || started.error) {
    genJob.value = null;
    toast(started && started.error ? started.error : 'Could not reach the AI backend.', 'warn');
    return;
  }
  genJob.value = { ...genJob.value, job_id: started.jobId };
  genTopic.value = '';
  toast('Researching "' + topic + '" — this takes a few minutes.');
  pollJob(started.jobId);
}

// SSE normally drives the progress text; this poll is the fallback for when
// EventSource is blocked or the stream drops mid-build.
async function pollJob(jobId) {
  for (let i = 0; i < 260; i++) {              // 260 * 3s ≈ 13 min ceiling
    await sleep(3000);
    if (!genJob.value || genJob.value.job_id !== jobId) return;
    const j = await api.getJob(jobId);
    if (!j) continue;
    if (j.status === 'done') {
      genJob.value = null;
      await loadAiCourses();
      toast('Course ready — open it from the Library.');
      return;
    }
    if (j.status === 'error') {
      genJob.value = null;
      toast('Generation failed: ' + (j.error || 'unknown error'), 'warn');
      return;
    }
    genJob.value = { ...genJob.value, status: j.status, step: j.step, pct: j.pct };
  }
}

/* ---------------- student record -> grades & attendance ---------------- */

async function initStudent() {
  // Registration writes a snapshot of exactly what the applicant submitted;
  // render it instantly so the dashboard is never a fake persona.
  hydrateProfileSnapshot();
  // Registration handoff: the moment we know the registered course, pull its
  // live timetable so the schedule matches the course BEFORE the full server
  // record arrives — this is what keeps registration.vue and this dashboard
  // in real time instead of showing stale demo subjects.
  if (student.career_path || localStorage.getItem('boi_career_path')) loadTimetable();
  const stored = localStorage.getItem('boi_student_id');
  if (stored) {
    const s = await api.getStudent(stored);
    if (s) {
      applyStudent(s);
      // The snapshot's course/grid may differ from the server truth — rebuild
      // everything that was prefetched from the snapshot, now with the REAL
      // saved per-day grid (Monday/Thursday stay off for this student).
      loadTimetable();
      loadDailyPlan();
      loadRoadmapLibrary();
      return;
    }
    localStorage.removeItem('boi_student_id');   // stale id (workspace wiped)
  }
  const roster = await api.listStudents();
  if (!roster || !roster.length) return;         // nobody enrolled yet -> demo data
  // Match THIS user by the email they registered with — never grab an
  // arbitrary roster[0] and show somebody else's name.
  let snapEmail = '';
  try { snapEmail = (JSON.parse(localStorage.getItem('boi_student_profile') || 'null')?.email || '').toLowerCase(); } catch {}
  const mine = snapEmail
    ? roster.find(r => String(r.email || '').toLowerCase() === snapEmail)
    : null;
  const pick = mine || roster[0];
  const s = await api.getStudent(pick.student_id);
  if (s) applyStudent(s);
}

/* Registration -> dashboard handoff: the details the applicant submitted are
 * stored by registration.vue and rendered here immediately; initStudent's
 * server refresh then confirms/corrects against the boirsu record. */
function hydrateProfileSnapshot() {
  let p = null;
  try { p = JSON.parse(localStorage.getItem('boi_student_profile') || 'null'); } catch { p = null; }
  if (!p) return;
  realData.value = true;
  // The identity card shows the REAL registered id (e.g. STU-…) instead of
  // the hardcoded demo matric, even while the backend is offline.
  if (p.student_id) studentId.value = String(p.student_id);
  applyStudentFields(p);
  // SECURITY: never trust a locally-stored payment flag. Only the server's
  // monthly-fee window (validateStudentPaymentState after refresh) unlocks
  // the dashboard — registration alone does not grant access.
}

/* ---------------- class timetable (live from boirsu) ---------------- */
// The Timetable page's week grid ("week") and the dashboard's "Today's
// Classes" ("today") are BOTH derived from this backend response — no demo
// data anymore. Everything shown comes from the student's registered course.
const timetable = ref(null);

async function loadTimetable() {
  const cp = student.career_path || localStorage.getItem('boi_career_path') || '';
  if (!cp) return;
  // Schedule the timetable around the exact days and hours the student chose on
  // their registration form (per-day dict). Legacy single hour kept as a fallback.
  // The id lets the server use the SAVED grid when this fires before hydration.
  const sid = student.student_id || localStorage.getItem('boi_student_id') || '';
  const t = await api.getTimetable(cp, Number(student.current_month) || null,
    student.track || '', student.preferred_time || '', student.preferred_daily_times || null, sid);
  if (t && t.weeks) timetable.value = t;
  syncScheduleFromTimetable();
}

/* Schedule derivation — every class block is built from the student's
 * REGISTERED course roadmap (/api/timetable/<career_path>), the exact same
 * topics the Classroom plays YouTube lessons for, so the dashboard, classroom,
 * roadmap and library all describe one syllabus instead of unrelated ones. */
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_KEY = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };
const DAY_LABEL = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };

const weekHasSessions = computed(() => Object.values(week).some(blocks => blocks.length));

// Colour a session by WHAT it is (keyword in the topic), not a rotating palette:
// teal = live class · sky = hands-on lab · amber = project work · coral = review.
function topicHue(topic) {
  const t = String(topic || '').toLowerCase();
  if (/project|portfolio|capstone|build /.test(t)) return 'amber';
  if (/review|recap|quiz|assessment|clinic|q&a/.test(t)) return 'coral';
  if (/lab|practice|workshop|exercise|studio|hands/.test(t)) return 'sky';
  return 'teal';
}

function endOfSlot(time, mins) {
  const [h, m] = String(time).split(':').map(Number);
  const total = (h || 0) * 60 + (m || 0) + (Number(mins) || 60);
  return String(Math.floor(total / 60) % 24).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}

function shortTag(topic) {
  const words = String(topic || '').split(/[^A-Za-z0-9]+/).filter(Boolean);
  const tag = words.length > 1 ? words.map(w => w[0]).join('') : (words[0] || 'Cls');
  return tag.slice(0, 3).toUpperCase();
}

function syncScheduleFromTimetable() {
  // Rebuild the week grid + today's list from LIVE backend data.
  WEEK_DAYS.forEach(d => { week[d] = []; });

  // Preferred source: the AI daily lesson plan (one fine-grained lesson per
  // class day). Falls back to the roadmap week split when no plan exists yet.
  const planDays = (dailyPlan.value && Array.isArray(dailyPlan.value.days)) ? dailyPlan.value.days : null;
  if (planDays && planDays.length) {
    const mins = Number(dailyPlan.value.duration_mins) || 60;
    for (const d of planDays) {
      const day = DAY_KEY[String(d.weekday || '').trim()];
      if (!day) continue;
      week[day].push([
        `${d.time}–${endOfSlot(d.time, mins)}`,
        d.topic || d.parent || 'Class session',
        'Live Online',
        topicHue(d.topic || d.parent)
      ]);
    }
  } else if (timetable.value && Array.isArray(timetable.value.weeks)) {
    const seen = new Set();
    const mins = Number(timetable.value.duration_mins) || 60;
    for (const w of timetable.value.weeks) {
      for (const s of (w.sessions || [])) {
        const key = `${s.day}|${s.time}|${s.topic}`;
        if (seen.has(key)) continue;              // same slot repeats across weeks
        seen.add(key);
        const day = DAY_KEY[String(s.day || '').trim()] || 'Mon';
        week[day].push([
          `${s.time}–${endOfSlot(s.time, mins)}`,
          s.topic || 'Class session',
          'Live Online',
          topicHue(s.topic)
        ]);
      }
    }
  }

  // The teacher's hand-published sessions (published in /classroom/teacher,
  // arrives here live over SSE) layer on top of the roadmap-derived ones.
  if (classTimetable.value && Array.isArray(classTimetable.value.sessions)) {
    for (const s of classTimetable.value.sessions) {
      const day = DAY_KEY[String(s.day || '').trim()];
      if (!day) continue;
      const slot = String(s.time || '').slice(0, 5) || '18:00';
      week[day].push([
        `${slot}–${endOfSlot(slot, 60)}`,
        s.subject || s.topic || 'Class session',
        'Live Online',
        topicHue(s.subject || s.topic)
      ]);
    }
  }

  WEEK_DAYS.forEach(d => {
    week[d].sort((a, b) => toMin(a[0].split('–')[0]) - toMin(b[0].split('–')[0]));
  });

  // Today's Classes mirrors the real grid for the current weekday.
  today.splice(0, today.length, ...(week[todayShort.value] || []).map((b, i) => ({
    code: shortTag(b[1]) + ' ' + (101 + i),
    name: b[1],
    start: b[0].split('–')[0],
    end: b[0].split('–')[1],
    room: b[2],
    building: 'Live online class · times in WAT',
    color: b[3]
  })));
}

/* ---------------- AI daily lesson plan (the detailed timetable) ----------------
 * MiroFish AI expands the month's roadmap topics into one concrete lesson per
 * class day: exact topic, teaching breakdown, deliverable and video search.
 * Cached server-side; regenerated on demand; arrives live over SSE. */
const dailyPlan = ref(null);
const planAiAvailable = ref(false);
const planJob = ref(null);
const dayVideoBusy = ref('');
let planJobTimer = null;

const planWeeks = computed(() => {
  const days = (dailyPlan.value && dailyPlan.value.days) || [];
  const byWeek = new Map();
  for (const d of days) {
    const w = d.week || 1;
    if (!byWeek.has(w)) byWeek.set(w, []);
    byWeek.get(w).push(d);
  }
  return [...byWeek.entries()].sort((a, b) => a[0] - b[0]).map(([weekNo, ds]) => ({ week: weekNo, days: ds }));
});

const prettyDate = (iso) => {
  try { return new Date(String(iso) + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); }
  catch { return iso || ''; }
};

async function loadDailyPlan() {
  const cp = student.career_path || localStorage.getItem('boi_career_path') || '';
  if (!cp) return;
  // Schedule the day-by-day lesson plan around the exact days and hours the
  // student chose on their registration form (per-day dict). When a day is left
  // blank / "none" on registration, it has no class in the plan.
  // The id lets the server use the SAVED grid when this fires before hydration.
  const sid = student.student_id || localStorage.getItem('boi_student_id') || '';
  const r = await api.getDailyPlan(cp, Number(student.current_month) || null,
    student.track || '', student.preferred_time || '', student.preferred_daily_times || null, sid);
  if (r && r.plan) {
    dailyPlan.value = r.plan;
    planAiAvailable.value = !!r.ai_available;
    syncScheduleFromTimetable();   // the week grid upgrades to the AI plan's finer topics
  }
}

function stopPlanJob() {
  if (planJobTimer) { clearInterval(planJobTimer); planJobTimer = null; }
  planJob.value = null;
}

function generateDailyPlan() {
  if (planJob.value) return;
  const cp = student.career_path || localStorage.getItem('boi_career_path') || '';
  if (!cp) return;
  api.generateDailyPlan(cp, {
    month: Number(student.current_month) || null,
    track: student.track || '',
    course: student.course_name || '',
    time: student.preferred_time || '',
    dailyTimes: student.preferred_daily_times || null
  }).then((r) => {
    if (!r || r.error || !r.job_id) {
      toast(r && r.error ? r.error : 'Could not start the AI planner.', 'warn');
      return;
    }
    planJob.value = { status: 'queued', step: 'Queued', pct: 5 };
    // SSE usually announces completion first; this poller is the fallback.
    planJobTimer = setInterval(async () => {
      const j = await api.getDailyPlanJob(r.job_id);
      if (!j) return;
      planJob.value = { status: j.status, step: j.step || j.status, pct: Number(j.pct) || planJob.value.pct };
      if (j.status === 'done') {
        stopPlanJob();
        await loadDailyPlan();
        toast('✨ MiroFish AI rebuilt your day-by-day lesson plan.');
      } else if (j.status === 'error') {
        stopPlanJob();
        toast('AI planner failed: ' + (j.error || 'unknown error'), 'warn');
      }
    }, 3000);
  });
}

async function watchDayVideo(day) {
  if (!day) return;
  const query = day.video_query || day.topic || day.parent || '';
  dayVideoBusy.value = 'd' + day.n;
  const vids = await api.getTopicVideos(query, 'beginner', 1);
  dayVideoBusy.value = '';
  const url = (vids && vids.length && vids[0].url)
    ? vids[0].url
    : 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query);
  const label = (vids && vids.length && vids[0].title) ? vids[0].title : query;
  toast('📺 Day ' + day.n + ' lesson video: ' + label);
  try { window.open(url, '_blank'); } catch { toast('Open in a new tab: ' + url, 'warn'); }
}

const prettifyPath = (p) => String(p || '')
  .replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();

function applyStudentFields(s) {
  if (!s) return;
  if (s.name) {
    student.fullname = String(s.name).trim();
    student.name = student.fullname.split(/\s+/)[0];   // friendly greeting
  }
  student.email = s.email || student.email || '';
  student.phone = s.phone || student.phone || '';
  student.career_path = s.career_path || student.career_path || '';
  student.course_name = s.course_name || prettifyPath(s.career_path) || student.course_name;
  student.experience_level = s.experience_level || student.experience_level || '';
  student.track = s.track || s.class_type || student.track || '';
  // Daily class hour chosen on the registration form (WAT "HH:MM")
  student.preferred_time = s.preferred_time || student.preferred_time || '';
  // Per-day class times the student chose at registration
  // ( {"Monday":"18:00","Tuesday":"14:00","Wednesday":"","Saturday":"09:00",...} ).
  // When the server returns a single string (legacy registration), wrap it for the
  // new API shape so the timetable and AI plan keep working seamlessly.
  const dt = s.preferred_daily_times;
  if (dt && typeof dt === 'object' && !Array.isArray(dt)) {
    student.preferred_daily_times = dt;
  } else if (typeof dt === 'string' && dt) {
    // Legacy server payload: a bare "HH:MM" meant daily classes under the old
    // registration contract, so wrap it for the new API shape.
    student.preferred_daily_times = { Monday: dt, Tuesday: dt, Wednesday: dt, Thursday: dt, Friday: dt, Saturday: dt, Sunday: dt };
  } else {
    // NO per-day grid known yet: leave it null so the fetches send only the
    // student_id and the server answers with the student's SAVED registration
    // grid. Never fabricate a 7-day week from preferred_time — that is exactly
    // how opted-out days (Monday/Thursday) used to reappear on the timetable.
    student.preferred_daily_times = null;
  }
  if (s.current_month != null && s.current_month !== '') student.current_month = Number(s.current_month);
  student.location = s.location || s.personal_location || student.location || '';
  student.country = s.country || student.country || '';
  student.cohort = s.cohort || student.cohort || '';
  // Partner branding: the server payload always carries sponsor_org (null when
  // the student has no sponsor); the registration handoff snapshot falls back
  // to the boi_sponsor_org key registration.vue stores at enroll time.
  setBrand('sponsor_org' in s ? s.sponsor_org : (localStorage.getItem('boi_sponsor_org') || ''));
}

async function refreshStudent() {
  if (!studentId.value) return;
  const s = await api.getStudent(studentId.value);
  if (s) applyStudent(s);
}

function applyStudent(s) {
  if (!s) return;
  studentId.value = s.student_id || '';
  if (studentId.value) localStorage.setItem('boi_student_id', studentId.value);
  realData.value = true;

  applyStudentFields(s);   // full submitted identity, not just a placeholder
  student.cgpa = s.cgpa == null || s.cgpa === '' ? null : Number(s.cgpa);
  validateStudentPaymentState(s);

  // Keep the demo rows when the student has not been quizzed yet, so Grades is
  // never an empty table.
  if (s.courses && s.courses.length) {
    courses.splice(0, courses.length, ...s.courses);
    gradesUnitLabel.value = 'Attempts';
  }

  const taken = Number(s.quizzes_taken) || 0;
  stats.splice(0, stats.length,
    { label: 'CGPA', value: student.cgpa.toFixed(2), sub: ' /4.00', desc: 'Grade ' + (s.overall_grade || 'N/A'), color: 'teal' },
    { label: 'Quiz average', value: Math.round(s.avg_quiz_score || 0) + '%', sub: '', desc: taken + (taken === 1 ? ' quiz' : ' quizzes') + ' taken', color: 'sky' },
    { label: 'Assignments', value: String(s.assignments_submitted || 0), sub: '', desc: 'Submitted', color: 'amber' },
    { label: 'Attendance', value: Math.round(s.attendance_rate || 0) + '%', sub: '', desc: (s.classes_attended || 0) + '/' + (s.total_classes || 0) + ' classes', color: 'coral' }
  );

  // The bar chart tracks the last four quiz attempts as grade points (0-4), so
  // it shows something real instead of the canned semester trend.
  const recent = (s.quiz_records || []).slice(-4);
  if (recent.length) {
    semesters.splice(0, semesters.length, ...recent.map((r, i) => ({
      l: 'Q' + (i + 1),
      g: Math.round(((Number(r.percentage) || 0) / 25) * 100) / 100
    })));
  }

  animateDial(currentView.value === 'grades' ? 2 : 1);

  // Keep the weekly schedule aligned with whichever course is on record.
  if (student.career_path &&
      (!timetable.value || timetable.value.career_path !== student.career_path)) {
    loadTimetable();
    loadDailyPlan();
  }
  // The teacher's published timetable is keyed by course — re-check it too.
  loadClassTimetable();
  // Real reading material: the student's own course textbooks, once their
  // identity (and career path) is known from the server.
  loadRoadmapLibrary();
}

async function joinClass(room, cls, classNumber) {
  openRoom(room, cls);
  if (!studentId.value) return;                  // no real student -> demo only
  const r = await api.markAttendance(studentId.value, classNumber);
  if (!r) return;
  toast(r.duplicate ? 'Attendance for this class was already recorded today.'
                    : 'Attendance marked for ' + cls + '.');
  if (r.student) applyStudent(r.student);
  else refreshStudent();
}

/**
 * Joining a scheduled class from the weekly grid / day-by-day plan counts as
 * attending it: record attendance (server-side, stored server-side),
 * which auto-completes the next roadmap task and broadcasts live over SSE so
 * the roadmap page turns green without the student ever clicking a checkbox.
 */
async function noteAttendance(cls, classNumber) {
  if (!studentId.value) return;
  const r = await api.markAttendance(studentId.value, classNumber);
  if (!r) return;
  if (r.student) applyStudent(r.student);
  else refreshStudent();
}

function openScheduledClass(room, cls) {
  openRoom(room, cls);
  noteAttendance(cls, (student.classes_attended || 0) + 1);
}

function goToClassroom() {
  if (!requirePaidAccess()) return;

  // Only a live class counts as attendance — marking one that has not started
  // yet would inflate total_classes and skew attendance_rate.
  const i = today.findIndex(c => c.code === heroClass.code);
  if (heroChip.value === 'live') {
    joinClass(heroClass.room, heroClass.name, i + 1)
  }

  router.push('/classroom/student')
}

/* ---------------- live server events ---------------- */

function onServerEvent(name, data) {
  backendOnline.value = true;
  const mine = genJob.value && data && genJob.value.job_id === data.job_id;

  if (name === 'ai_course_progress' && mine) {
    genJob.value = { ...genJob.value, status: 'running', step: data.step, pct: data.pct };
  } else if (name === 'ai_course_done') {
    mergeDoc(data.course);
    if (mine) {
      genJob.value = null;
      toast('Course ready: "' + ((data.course && data.course.title) || data.topic) + '"');
    }
  } else if (name === 'ai_course_error' && mine) {
    genJob.value = null;
    toast('Generation failed: ' + (data.error || 'unknown error'), 'warn');
  } else if (name === 'quiz_recorded' && data.student_id && data.student_id === studentId.value) {
    refreshStudent();
  } else if (name === 'attendance_marked' && data.student_id === studentId.value) {
    refreshStudent();
  } else if (name === 'classroom_assignment') {
    // Teacher gave a new assignment — reload the list so it appears instantly
    loadClassroomAssignments();
    toast('📋 New assignment from ' + (data.teacher || 'your teacher') + ': "' + (data.title || '') + '"');
  } else if (name === 'classroom_textbook') {
    // Teacher uploaded a PDF textbook — add it to the library
    mergeDoc({
      id: data.id, kind: 'pdf-textbook', title: data.title,
      tag: 'PDF TextBook', pages: data.pages || 1, size: data.size || '',
      updated: data.updated || new Date().toLocaleDateString(), hue: 'teal', big: 'PDF',
      ai: false, course: data.course, pdf_id: data.pdf_id || data.id,
      file_name: data.file_name || '',
      // Admin/partner pricing + read-only lock ride on the same event, and the
      // serve URL lets Read open the real PDF straight away. A book this
      // student already bought keeps its unlocked state across re-merges.
      price: data.price || 0, read_only: !!data.read_only,
      purchased: purchasedBooks.has(data.id) || !!data.purchased,
      download: (data.pdf_id || data.id) ? '/api/textbooks/pdf/' + (data.pdf_id || data.id) : ''
    });
    toast('📄 New textbook uploaded: "' + (data.title || 'PDF textbook') + '" — check your Library.');
  } else if (name === 'classroom_timetable') {
    // Teacher published/updated the weekly class timetable
    classTimetable.value = {
      course: data.course, title: data.title, teacher: data.teacher,
      sessions: Array.isArray(data.sessions) ? data.sessions : [], updated: data.updated
    };
    syncScheduleFromTimetable();   // the week grid re-syncs live — no reload
    toast('🗓️ Your teacher published the class timetable — check the Timetable page.');
  } else if (name === 'daily_plan_updated') {
    // MiroFish AI finished writing the day-by-day lessons (or an admin did)
    if (!data.career_path || data.career_path === student.career_path) {
      loadDailyPlan();
      toast('✨ Your day-by-day lesson plan was updated — see My Timetable.');
    }
  }
}

/* ---------------- reader: sections, extras, audio ---------------- */

async function openAiCourse(row) {
  readerLoading.value = true;
  const c = await api.getCourse(row.id);
  readerLoading.value = false;
  if (!c) {
    toast('Could not load that lesson from the backend.', 'warn');
    return;
  }
  readerCourse.value = c;
}

function resetSectionExtras() {
  secSummary.value = '';
  secResources.value = null;
  secVideos.value = null;
  secBusy.value = '';
  quiz.value = null;
  quizResult.value = null;
  Object.keys(quizPicks).forEach(k => delete quizPicks[k]);
  stopAudio();
}

async function openTab(tab) {
  // Clicking the open tab again collapses the panel back to plain reading.
  if (readerTab.value === tab) { readerTab.value = 'read'; return; }
  readerTab.value = tab;
  const c = readerCourse.value;
  if (!c) return;

  if (tab === 'summary' && !secSummary.value) {
    secBusy.value = 'summary';
    const t = await api.getSummary(c.id, readerPage.value);
    secBusy.value = '';
    secSummary.value = t || 'The AI summary is unavailable right now.';
  } else if (tab === 'resources' && !secResources.value) {
    secBusy.value = 'resources';
    const r = await api.getResources(c.id, readerPage.value);
    secBusy.value = '';
    secResources.value = r || { resources: [], explanation: '', reason: 'backend unreachable' };
  } else if (tab === 'videos' && !secVideos.value) {
    secBusy.value = 'videos';
    // Sections are enriched at generation time; fall back to a live search.
    const pre = (readerSection.value && readerSection.value.videos) || null;
    const v = (pre && pre.length) ? { videos: pre, reason: '' }
                                  : await api.getVideos(c.id, readerPage.value);
    secBusy.value = '';
    secVideos.value = v || { videos: [], reason: 'backend unreachable' };
  } else if (tab === 'quiz' && !quiz.value) {
    loadQuiz();
  }
}

async function loadQuiz(fresh = false) {
  const c = readerCourse.value;
  if (!c) return;
  quizBusy.value = true;
  quizResult.value = null;
  quiz.value = null;
  Object.keys(quizPicks).forEach(k => delete quizPicks[k]);
  const q = await api.getQuiz(c.id, readerPage.value, fresh);
  quizBusy.value = false;
  if (!q || q.error) {
    // The server warms quizzes in the background after a course is built. A
    // miss here means this section's turn has not come round yet — it keeps
    // building, so retrying shortly is genuinely the fix, not a platitude.
    toast(q && q.error ? q.error : 'This quiz is still being prepared — try again in a moment.', 'warn');
    return;
  }
  quiz.value = q;
}

async function submitQuizNow() {
  const q = quiz.value;
  if (!q || quizBusy.value) return;
  const answers = q.questions.map((_, i) => quizPicks[i] || null);
  if (answers.some(a => !a)) { toast('Answer every question first.', 'warn'); return; }

  quizBusy.value = true;
  const r = await api.submitQuiz(q.quizId, answers, studentId.value);
  quizBusy.value = false;
  if (!r) { toast('Could not submit — the backend did not answer.', 'warn'); return; }

  quizResult.value = r;
  if (r.student) {
    applyStudent(r.student);
    toast('Scored ' + r.score + '/' + r.total + ' — your grade is now ' + r.student.overall_grade + '.');
  } else {
    toast('Scored ' + r.score + '/' + r.total + '. Enrol a student to record it against a grade.', 'warn');
  }
}

function resultFor(i) {
  const r = quizResult.value;
  if (!r || !r.results) return null;
  return r.results.find(x => x.index === i) || null;
}

// Audio mode: the browser plays the MP3 that Deepgram Aura-2 renders from this
// section's text — the same text the downloaded PDF contains.
function toggleAudio() {
  const el = audioEl.value;
  if (!el) return;
  if (audioPlaying.value) { el.pause(); return; }
  audioLoading.value = true;
  const p = el.play();
  if (p && p.catch) p.catch(() => { audioLoading.value = false; });
}

function stopAudio() {
  const el = audioEl.value;
  audioPlaying.value = false;
  audioLoading.value = false;
  if (el) {
    try { el.pause(); el.currentTime = 0; } catch { /* nothing loaded yet */ }
  }
}

function onAudioError() {
  audioLoading.value = false;
  audioPlaying.value = false;
  toast('Audio mode unavailable — ' + (audioReason.value || 'the server could not narrate this section') + '.', 'warn');
}

// ===================== DIALS =====================
function animateDial(which) {
  const C = which === 1 ? 339.3 : 477.5;
  const offRef = which === 1 ? dial1Offset : dial2Offset;
  const numRef = which === 1 ? dial1Num : dial2Num;
  offRef.value = C;
  setTimeout(() => {
    offRef.value = C * (1 - student.cgpa / 4);
  }, 100);
  const t0 = performance.now();
  const dur = 1500;
  function step(t) {
    const p = Math.min(1, (t - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    numRef.value = (student.cgpa * e).toFixed(2);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ===================== HERO TARGET =====================
function heroTarget() {
  const live = today.find(c => classStatus(c) === 'live');
  if (live) {
    const d = new Date();
    d.setHours(Math.floor(toMin(live.end) / 60), toMin(live.end) % 60, 0, 0);
    return { c: live, mode: 'end', at: d };
  }
  const up = today.find(c => classStatus(c) === 'up');
  if (up) {
    const d = new Date();
    d.setHours(Math.floor(toMin(up.start) / 60), toMin(up.start) % 60, 0, 0);
    return { c: up, mode: 'start', at: d };
  }
  // Nothing live or upcoming today: count down to the first session still
  // ahead THIS WEEK, taken straight from the live timetable — no fake fallback.
  const order = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startIdx = new Date().getDay();
  for (let step = 1; step <= 7; step++) {
    const day = order[(startIdx + step) % 7];
    const blocks = week[day] || [];
    if (!blocks.length) continue;
    const b = blocks[0];
    const [h, m] = b[0].split('–')[0].split(':').map(Number);
    const d = new Date();
    d.setDate(d.getDate() + step);
    d.setHours(h || 0, m || 0, 0, 0);
    return {
      c: { code: shortTag(b[1]) + ' ·', name: b[1], start: b[0].split('–')[0], end: b[0].split('–')[1], room: b[2] },
      mode: 'start',
      at: d,
      note: DAY_LABEL[day]
    };
  }
  return null;   // no classes published anywhere this week
}

// ===================== INTERVALS =====================
let clockInt, countdownInt, threeAnim;

function tickClock() {
  clockTime.value = new Date().toLocaleTimeString('en-GB');
}

function tickCountdown() {
  const t = heroTarget();
  if (!t) {
    // Honest empty state instead of inventing a fake class.
    heroKicker.value = 'No classes scheduled';
    heroChip.value = 'up';
    cdLabel.value = 'Your next live class appears here';
    heroClass.code = '';
    heroClass.name = student.course_name || 'Your registered course';
    heroClass.start = '';
    heroClass.end = '';
    heroClass.room = 'Live Online';
    countdown.h = countdown.m = countdown.s = '00';
    return;
  }
  const c = t.c;
  heroClass.code = c.code || '';
  heroClass.name = c.name;
  heroClass.start = c.start;
  heroClass.end = c.end;
  heroClass.room = c.room;
  if (t.mode === 'end') {
    heroKicker.value = 'Happening now';
    heroChip.value = 'live';
    cdLabel.value = 'Class ends in';
  } else {
    heroKicker.value = t.note ? 'Next · ' + t.note : 'Up next today';
    heroChip.value = 'up';
    cdLabel.value = 'Class starts in';
  }
  const diff = Math.max(0, t.at - new Date());
  countdown.h = String(Math.floor(diff / 3.6e6)).padStart(2, '0');
  countdown.m = String(Math.floor((diff % 3.6e6) / 6e4)).padStart(2, '0');
  countdown.s = String(Math.floor((diff % 6e4) / 1e3)).padStart(2, '0');
}

// ===================== THREE.JS =====================
function initThree() {
  const canvas = threeCanvas.value;
  if (!canvas || !window.THREE && !THREE) return;
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 120);
    cam.position.z = 15;

    const N = 1100;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const pal = [[0.24, 0.9, 0.76], [1, 0.71, 0.33], [0.49, 0.69, 1], [1, 0.48, 0.42]];
    for (let i = 0; i < N; i++) {
      const r = 8 + Math.random() * 26;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.6;
      pos[i * 3 + 2] = r * Math.cos(ph) - 8;
      const c = pal[Math.floor(Math.random() * pal.length)];
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.09, vertexColors: true, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(pts);

    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(4.8, 1), new THREE.MeshBasicMaterial({ color: 0x3ce6c3, wireframe: true, transparent: true, opacity: 0.14 }));
    ico.position.set(-5.5, 1.2, -4); scene.add(ico);
    const oct = new THREE.Mesh(new THREE.OctahedronGeometry(1.7), new THREE.MeshBasicMaterial({ color: 0xffb454, wireframe: true, transparent: true, opacity: 0.2 }));
    oct.position.set(7, 2.4, -3); scene.add(oct);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(8.2, 0.015, 8, 90), new THREE.MeshBasicMaterial({ color: 0x7db1ff, transparent: true, opacity: 0.1 }));
    ring.rotation.x = Math.PI / 2.4; ring.position.y = -2; scene.add(ring);

    let mx = 0, my = 0;
    const onMove = e => { mx = (e.clientX / innerWidth - 0.5) * 2; my = (e.clientY / innerHeight - 0.5) * 2; };
    const onResize = () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };
    addEventListener('mousemove', onMove);
    addEventListener('resize', onResize);

    let t = 0;
    function loop() {
      t += 0.004;
      pts.rotation.y = t * 0.14;
      pts.rotation.x = Math.sin(t * 0.3) * 0.05;
      ico.rotation.x += 0.0021; ico.rotation.y += 0.0032;
      oct.rotation.y -= 0.006; oct.position.y = 2.4 + Math.sin(t * 2) * 0.4;
      ring.rotation.z += 0.0011;
      cam.position.x += (mx * 1.8 - cam.position.x) * 0.03;
      cam.position.y += (-my * 1.2 - cam.position.y) * 0.03;
      cam.lookAt(0, 0, 0);
      renderer.render(scene, cam);
      threeAnim = requestAnimationFrame(loop);
    }
    loop();

    onUnmounted(() => {
      cancelAnimationFrame(threeAnim);
      removeEventListener('mousemove', onMove);
      removeEventListener('resize', onResize);
      renderer.dispose();
    });
  } catch (e) {
    console.warn('3D scene unavailable:', e);
  }
}

// ===================== LIFECYCLE =====================
onMounted(() => {
  // Render the registered identity IMMEDIATELY from registration's snapshot —
  // even if the backend is offline — instead of showing a demo persona.
  syncFromRegistration();
  tickClock();
  clockInt = setInterval(tickClock, 1000);
  tickCountdown();
  countdownInt = setInterval(tickCountdown, 1000);
  seedChat();
  initThree();
  animateDial(1);
  // Deliberately not awaited: the whole view is already rendered on demo data,
  // and initBackend() swaps in real values as they arrive. The ?view= deep link
  // is applied straight away from the registration snapshot, then re-applied
  // once the server record lands, so a student whose fees were confirmed after
  // their last registration still opens the tab they actually asked for.
  applyViewFromQuery();
  initBackend().then(applyViewFromQuery);
  // Live link with registration.vue: a new/updated registration (same tab via
  // the custom event, another tab via the storage event, or anything else via
  // the poll) re-hydrates this dashboard instantly — no reload needed.
  addEventListener('storage', syncFromRegistration);
  addEventListener('boi:profile-updated', syncFromRegistration);
  syncInt = setInterval(syncFromRegistration, 4000);
});

onUnmounted(() => {
  clearInterval(clockInt);
  clearInterval(countdownInt);
  disarmShield();   // read-only PDF protections must never outlive the page
  clearInterval(syncInt);
  removeEventListener('storage', syncFromRegistration);
  removeEventListener('boi:profile-updated', syncFromRegistration);
  stopPlanJob();
  if (stopStream) stopStream();
});

watch(anonMode, (v) => {
  if (v) toast('Anonymous mode enabled — your name is hidden.');
});

watch(readerModal, (v) => {
  if (!v) {
    readerPage.value = 1;
    readerZoom.value = 1;
    readerCourse.value = null;
    resetSectionExtras();
  }
});

// Page N is section N, so turning the page invalidates every per-section extra.
watch(readerPage, () => {
  if (!readerCourse.value) return;
  resetSectionExtras();
  if (readerTab.value !== 'read') openTab(readerTab.value);
});

// Browser back/forward between /dashboard and /dashboard?view=library reuses
// this same component instance, so the query has to be watched — reading it once
// on mount would leave the second navigation showing the old tab.
watch(() => route.query.view, (v, old) => {
  if (v === old) return;
  applyViewFromQuery();
});
</script>

<style>
/* Base font stack */
.font-sans { font-family: 'Inter', system-ui, -apple-system, sans-serif; font-optical-sizing: auto; }
.font-serif { font-family: 'Instrument Serif', Georgia, serif; font-optical-sizing: auto; }
.font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }

/* Hue-tinted doc covers */
.hue-teal-cover { background: linear-gradient(140deg, rgba(60,230,195,0.3), rgba(60,230,195,0.06) 55%, #0c1526); }
.hue-amber-cover { background: linear-gradient(140deg, rgba(255,180,84,0.3), rgba(255,180,84,0.06) 55%, #0c1526); }
.hue-coral-cover { background: linear-gradient(140deg, rgba(255,122,107,0.3), rgba(255,122,107,0.06) 55%, #0c1526); }
.hue-sky-cover { background: linear-gradient(140deg, rgba(125,177,255,0.3), rgba(125,177,255,0.06) 55%, #0c1526); }

/* Custom scrollbars */
::-webkit-scrollbar { width: 9px; height: 9px; }
::-webkit-scrollbar-thumb { background: #243350; border-radius: 8px; }
::-webkit-scrollbar-track { background: transparent; }

/* FAB ping */
.fab-ping::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 1rem;
  border: 2px solid rgba(37,211,102,0.7);
  animation: fabPing 2.2s infinite;
}
@keyframes fabPing {
  0% { transform: scale(1); opacity: 1; }
  80%, 100% { transform: scale(1.5); opacity: 0; }
}

/* Typing dots */
.typing-dot { animation: tp 1.2s infinite; }
@keyframes tp { 30% { transform: translateY(-6px); opacity: 0.5; } }

/* Pop animation for bell panel */
.pop-enter-active { animation: pop 0.28s cubic-bezier(0.3, 1.4, 0.5, 1); }
@keyframes pop { from { opacity: 0; transform: translateY(-8px) scale(0.97); } }

/* Modal */
.modal-enter-active { animation: modalIn 0.3s ease-out; }
.modal-leave-active { animation: modalIn 0.2s ease-in reverse; }
@keyframes modalIn { from { opacity: 0; } to { opacity: 1; } }

/* Slide for mobile menu */
.slide-enter-active { animation: slideIn 0.3s ease-out; }
.slide-leave-active { animation: slideIn 0.2s ease-in reverse; }
@keyframes slideIn { from { opacity: 0; } to { opacity: 1; } }

/* Toasts */
.toast-enter-active { transition: all 0.4s cubic-bezier(0.2, 0.9, 0.3, 1.2); }
.toast-leave-active { transition: all 0.3s ease-in; }
.toast-enter-from { opacity: 0; transform: translateX(-24px); }
.toast-leave-to { opacity: 0; transform: translateX(-24px); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
</style>