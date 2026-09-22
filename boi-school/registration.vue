<template>
  <div class="reg-page relative min-h-screen overflow-x-hidden bg-[#f5f1e6] text-[#1b211c]"
       style="font-family:'Karla',sans-serif;background-image:radial-gradient(rgba(20,67,46,.07) 1px,transparent 1px);background-size:26px 26px">

    <!-- ===== Site navigation (AcademyNav) — desktop bar + clearance ===== -->
    <div class="hidden md:block">
      <AcademyNav />
    </div>
    <div class="hidden md:block" style="height:86px"></div>

    <!-- ===== Pre-registration gate: Google signup or returning login ===== -->
    <Transition name="modal-fade">
      <div v-if="regGate" class="fixed inset-0 z-[95] flex items-center justify-center bg-[#0d3321]/85 backdrop-blur-[3px] px-4">
        <div class="w-full max-w-[430px] rounded-[18px] border border-[#d9d1bc] bg-[#fffdf6] p-6 shadow-[0_24px_60px_rgba(0,0,0,.35)]" style="animation:rise .45s cubic-bezier(.22,.9,.3,1) both">
          <span class="font-bold text-[10px] uppercase tracking-[.2em] text-[#cf3f2b]" style="font-family:'JetBrains Mono',monospace">Cohort 12 · Admission</span>
          <h3 class="mt-2 text-[26px] font-black text-[#14432e]" style="font-family:'Fraunces',serif">Before you start…</h3>

          <!-- Choose: Google / Login -->
          <template v-if="gateMode === 'choose' || gateMode === 'login'">
            <p class="text-[13.5px] text-[#6d6f63] leading-[1.65] mt-2">Sign up with Google in one click, or log in if you've already registered.</p>

            <button type="button" :disabled="gateBusy" @click="startGoogleSignup"
                    class="mt-5 w-full flex items-center justify-center gap-3 rounded-[11px] bg-white border-[1.8px] border-[#d9d1bc] py-[14px] font-bold text-[14.5px] text-[#1b211c] transition-all hover:border-[#14432e] hover:-translate-y-[2px] disabled:opacity-50 disabled:hover:translate-y-0">
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 40.4 44 35 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
              {{ gateBusy ? 'Checking…' : 'Continue with Google' }}
            </button>

            <div class="flex items-center gap-3 my-4">
              <span class="flex-1 border-t border-dashed border-[#d9d1bc]"></span>
              <span class="text-[10.5px] font-bold uppercase tracking-[.14em] text-[#a49f8c]" style="font-family:'JetBrains Mono',monospace">or</span>
              <span class="flex-1 border-t border-dashed border-[#d9d1bc]"></span>
            </div>

            <template v-if="gateMode === 'login'">
              <input v-model="gateEmail" type="email" placeholder="you@example.com"
                     class="w-full text-[15px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none focus:border-[#1d5a3f] mb-2">
              <input v-model="gatePw" type="password" placeholder="Your password" @keyup.enter="doGateLogin"
                     class="w-full text-[15px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none focus:border-[#1d5a3f] mb-3">
              <button type="button" :disabled="gateBusy" @click="doGateLogin"
                      class="w-full rounded-[11px] bg-[#14432e] text-white py-[14px] font-extrabold text-[14px] hover:bg-[#1d5a3f] transition-all disabled:opacity-50">{{ gateBusy ? 'Signing in…' : 'Log in → Dashboard' }}</button>
              <button type="button" @click="gateMode = 'choose'" class="mt-2 w-full text-[12px] font-bold text-[#6d6f63] underline">Back</button>
            </template>
            <button v-else type="button" @click="gateMode = 'login'"
                    class="w-full rounded-[11px] bg-[#14432e] text-white py-[14px] font-extrabold text-[14px] hover:bg-[#1d5a3f] transition-all">I already registered — Log in</button>

            <p v-if="gateMsg" class="mt-3 text-[12px] font-bold leading-relaxed" :class="gateOk ? 'text-[#0d7a45]' : 'text-[#cf3f2b]'">{{ gateMsg }}</p>
          </template>

          <!-- Verified via Google: route by account existence -->
          <template v-else>
            <div class="rounded-[12px] border border-[#17b565]/40 bg-[#e7f7ee] p-4 flex items-start gap-3">
              <span class="text-[20px] leading-none mt-0.5">✓</span>
              <div class="min-w-0">
                <b class="block text-[14.5px] text-[#0d7a45]">Google account verified</b>
                <span class="text-[12.5px] text-[#1b211c] break-all">{{ gateEmail }}</span>
              </div>
            </div>

            <template v-if="gateAccountFound">
              <p class="text-[13px] text-[#6d6f63] mt-3 leading-relaxed">Welcome back! This Gmail is already registered with us.</p>
              <button type="button" @click="goDashboard()"
                      class="mt-4 w-full rounded-[11px] bg-[#14432e] text-white py-[14px] font-extrabold text-[14px] hover:bg-[#1d5a3f] transition-all">Go to my student dashboard →</button>
            </template>
            <template v-else>
              <p class="text-[13px] text-[#6d6f63] mt-3 leading-relaxed">No existing account for this email yet — your verified email has been dropped into the form below. Pick your course, pay the fee, then create your password.</p>
              <button type="button" @click="closeGate(true)"
                      class="mt-4 w-full rounded-[11px] bg-[#14432e] text-white py-[14px] font-extrabold text-[14px] hover:bg-[#1d5a3f] transition-all">Continue to the registration form ✓</button>
            </template>
          </template>

          <button type="button" @click="closeGate(false)" class="mt-4 w-full text-center text-[12px] font-bold text-[#6d6f63] underline hover:text-[#14432e] transition-colors">Skip for now — just fill the form</button>
        </div>
      </div>
    </Transition>

    <!-- ambient background -->
    <div class="pointer-events-none fixed inset-0 z-0">
      <span class="absolute font-bold text-[rgba(20,67,46,.045)] leading-none select-none"
            style="font-family:'Fraunces',serif;font-size:30vw;top:-8vw;right:-6vw;transform:rotate(8deg)">{ }</span>
      <span class="absolute font-bold text-[rgba(232,165,36,.10)] leading-none select-none"
            style="font-family:'JetBrains Mono',monospace;font-size:12vw;bottom:-3vw;left:-2vw;transform:rotate(-6deg)">~/boi-tech</span>
      <span class="absolute w-[220px] h-[220px] rounded-full border-2 border-dashed border-[rgba(232,165,36,.5)] opacity-50"
            style="top:15%;left:3%;animation:spin 60s linear infinite"></span>
      <span class="absolute w-[120px] h-[120px] rounded-full opacity-60"
            style="bottom:12%;right:5%;background:radial-gradient(circle at 35% 35%,rgba(23,181,101,.22),transparent 65%);animation:bob 9s ease-in-out infinite alternate"></span>
    </div>

    <!-- mobile header -->
    <header class="sticky top-[56px] z-40 flex items-center gap-[10px] px-4 py-3 border-b border-[#d9d1bc] bg-[rgba(245,241,230,.96)] backdrop-blur-[16px] shadow-[0_2px_12px_rgba(0,0,0,.04)] md:hidden">
<svg width="36" height="42" viewBox="0 0 62 70" aria-hidden="true" class="shrink-0">
        <path d="M31 2 58 10v26c0 16-12 26-27 32C16 62 4 52 4 36V10L31 2z" fill="#14432e" stroke="#e8a524" stroke-width="2.5"/>
        <text x="31" y="36" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="19" fill="#f5f1e6">{{ '</>' }}</text>
        <text x="31" y="54" text-anchor="middle" font-family="Fraunces,serif" font-weight="900" font-size="11" fill="#e8a524">BOI</text>
      </svg>
      <div class="min-w-0">
        <h1 class="text-[20px] leading-none font-black" style="font-family:'Fraunces',serif;color:#14432e">Boi <i class="italic font-semibold text-[#cf3f2b]">Tech Academy</i></h1>
        <p class="font-bold uppercase tracking-[.15em] text-[9px] mt-[2px] text-[#6d6f63]" style="font-family:'JetBrains Mono',monospace">Code · Build · Get Hired</p>
      </div>
      <span class="ml-auto bg-[#e8a524] text-[#0d3321] font-bold text-[9px] px-2 py-1 rounded-[4px] tracking-[.1em] -rotate-[1.5deg]" style="font-family:'JetBrains Mono',monospace">COHORT 12</span>
    </header>

    <!-- mobile progress -->
    <div class="sticky z-[39] bg-[#fffdf6] px-4 pt-[10px] pb-3 border-b border-[#d9d1bc] shadow-[0_2px_8px_rgba(0,0,0,.03)] md:hidden" style="top:120px">
      <div class="flex gap-1 mb-[6px]">
        <div v-for="(s,i) in 4" :key="i" class="flex-1 h-1 rounded-[2px] overflow-hidden"
             :class="i < current ? 'bg-[#14432e]' : (i === current ? 'bg-[#14432e]' : 'bg-[#d9d1bc]')"></div>
      </div>
      <div class="flex justify-between font-bold text-[10px] uppercase tracking-[.1em]" style="font-family:'JetBrains Mono',monospace">
        <span class="text-[#14432e] font-bold">{{ stepLabels[current] }}</span>
        <span class="text-[#6d6f63] font-semibold">Step {{ current+1 }} of 4</span>
      </div>
    </div>

    <!-- ticker -->
    <div class="relative z-[5] bg-[#0d3321] text-[#f3ecd6] overflow-hidden border-b-[3px] border-[#e8a524] hidden md:block">
      <div class="inline-flex whitespace-nowrap py-2 font-semibold text-[12px] uppercase tracking-[.08em]"
           style="font-family:'JetBrains Mono',monospace;animation:tick 40s linear infinite">
        <span class="flex items-center gap-[22px] px-[22px]">Boi Tech Academy · Cohort 12 open <em class="not-italic text-[#e8a524]">✦</em> {{ formatNaira(courseFee) }} registration <em class="not-italic text-[#e8a524]">✦</em> 16 tracks to pick from <em class="not-italic text-[#e8a524]">✦</em> Mon 21 Sept 2026 <em class="not-italic text-[#e8a524]">✦</em> SSCE to PhD welcome <em class="not-italic text-[#e8a524]">✦</em> Mentorship for life <em class="not-italic text-[#e8a524]">✦</em></span>
        <span class="flex items-center gap-[22px] px-[22px]">Boi Tech Academy · Cohort 12 open <em class="not-italic text-[#e8a524]">✦</em> {{ formatNaira(courseFee) }} registration <em class="not-italic text-[#e8a524]">✦</em> 16 tracks to pick from <em class="not-italic text-[#e8a524]">✦</em> Mon 21 Sept 2026 <em class="not-italic text-[#e8a524]">✦</em> SSCE to PhD welcome <em class="not-italic text-[#e8a524]">✦</em> Mentorship for life <em class="not-italic text-[#e8a524]">✦</em></span>
      </div>
    </div>

    <!-- desktop header -->
    <header class="relative z-[4] hidden md:flex items-center gap-[18px] flex-wrap max-w-[1200px] mx-auto px-[22px] pt-[26px] pb-2">
<svg width="58" height="66" viewBox="0 0 62 70" aria-hidden="true">
        <path d="M31 2 58 10v26c0 16-12 26-27 32C16 62 4 52 4 36V10L31 2z" fill="#14432e" stroke="#e8a524" stroke-width="2.5"/>
        <text x="31" y="36" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="19" fill="#f5f1e6">{{ '</>' }}</text>
        <text x="31" y="54" text-anchor="middle" font-family="Fraunces,serif" font-weight="900" font-size="11" fill="#e8a524">BOI</text>
      </svg>
      <div>
        <h1 class="text-[clamp(26px,3.4vw,38px)] leading-none font-black text-[#14432e]" style="font-family:'Fraunces',serif">Boi <i class="italic font-semibold text-[#cf3f2b]">Tech Academy</i></h1>
        <p class="font-semibold text-[11.5px] uppercase tracking-[.18em] text-[#6d6f63] mt-[6px]" style="font-family:'JetBrains Mono',monospace">Code · Build · Get Hired</p>
      </div>
      <div class="ml-auto text-right text-[13px] text-[#6d6f63] leading-[1.7]">
        <b class="text-[#14432e] text-[14px]">{{ todayDate }}</b><br>
        <span class="inline-block bg-[#e8a524] text-[#0d3321] font-bold text-[11px] tracking-[.14em] px-[10px] py-1 rounded-[4px] -rotate-[1.5deg] mt-1" style="font-family:'JetBrains Mono',monospace">COHORT 12 · REGISTRATION FORM</span>
      </div>
    </header>

    <div class="relative z-[2] max-w-[1200px] mx-auto my-[18px] mb-[70px] px-[22px] grid gap-[28px] items-start grid-cols-1 md:grid-cols-[330px_1fr]">

      <!-- sidebar -->
      <aside class="bg-[linear-gradient(168deg,#14432e,#0d3321_90%)] text-[#efe9d4] rounded-[16px] p-[28px] overflow-hidden relative border border-[rgba(232,165,36,.35)] md:sticky md:top-[22px]"
             :class="{ 'mobile-expanded': sidebarOpen }">
        <span class="absolute -top-[46px] -right-[46px] w-[150px] h-[150px] rounded-full border-[22px] border-[rgba(232,165,36,.14)]"></span>
        <h2 class="text-[21px] font-bold text-white" style="font-family:'Fraunces',serif">Admissions Desk</h2>
        <div class="font-bold text-[11px] uppercase tracking-[.18em] text-[#e8a524] mt-1 mb-[18px]" style="font-family:'JetBrains Mono',monospace">// four quick steps · ~4 min</div>

        <!-- 2x2 on phones: as a horizontal scroller the last two steps sat off
             the right edge and read as clipped rather than scrollable. Reverts
             to the vertical list from md up. -->
        <ul class="grid grid-cols-2 md:flex md:flex-col gap-2 md:overflow-visible">
          <li v-for="(s,i) in stepLabels" :key="i" @click="go(i)"
              class="flex items-center gap-2 md:gap-3 px-3 py-[11px] md:mb-[6px] rounded-[10px] cursor-pointer text-[13px] md:text-[14.5px] font-medium transition-all hover:bg-white/5 md:hover:translate-x-[3px]"
              :class="i === current ? 'bg-[rgba(232,165,36,.16)]' : ''">
            <span class="w-7 h-7 shrink-0 grid place-items-center rounded-full border-[1.6px] border-[rgba(239,233,212,.5)] font-bold text-[11.5px] transition-all"
                  style="font-family:'JetBrains Mono',monospace"
                  :class="i === current ? 'bg-[#e8a524] border-[#e8a524] text-[#0d3321]' : (i < current ? 'bg-[#efe9d4] border-[#efe9d4] text-[#0d3321]' : '')">
              <span v-if="i < current">✓</span>
              <span v-else>{{ String(i+1).padStart(2,'0') }}</span>
            </span>
            {{ s }}
          </li>
        </ul>

        <!-- mobile sidebar toggle -->
        <div class="flex items-center justify-between bg-[rgba(232,165,36,.18)] text-[#e8a524] px-3.5 py-[10px] rounded-[10px] mt-3 font-bold text-[11px] uppercase tracking-[.1em] cursor-pointer border-[1.5px] border-[rgba(232,165,36,.4)] md:hidden"
             style="font-family:'JetBrains Mono',monospace" @click="toggleSidebar">
          <span>{{ sidebarOpen ? 'Hide info & perks' : 'Show info & perks' }}</span>
          <span :class="sidebarOpen ? 'rotate-180' : ''" class="transition-transform">↓</span>
        </div>

        <hr class="border-t border-dashed border-[rgba(239,233,212,.3)] my-[18px] hidden md:block">
        <div class="hidden md:block">
          <div class="flex gap-[10px] text-[13px] leading-[1.55] mb-[11px] text-[#d9d4bd]"><span class="text-[#e8a524] font-extrabold">▸</span><span><b class="text-white">Registration fee:</b> {{ formatNaira(courseFee) }} — paid securely via Paystack or bank transfer.</span></div>
          <div class="flex gap-[10px] text-[13px] leading-[1.55] mb-[11px] text-[#d9d4bd]"><span class="text-[#e8a524] font-extrabold">▸</span><span><b class="text-white">Who is this for?</b> Beginners, graduates, PhD holders, career switchers — everyone is welcome.</span></div>
          <div class="flex gap-[10px] text-[13px] leading-[1.55] mb-[11px] text-[#d9d4bd]"><span class="text-[#e8a524] font-extrabold">▸</span><span><b class="text-white">16 tech tracks</b> to choose from — from coding to content to cloud.</span></div>
          <div class="flex gap-[10px] text-[13px] leading-[1.55] mb-[11px] text-[#d9d4bd]"><span class="text-[#e8a524] font-extrabold">▸</span><span><b class="text-white">Cohort 12 starts</b> Monday 21 September 2026. Orientation: Sat 19 Sept.</span></div>
          <div class="mt-1 bg-black/20 rounded-[10px] p-[13px] text-[12.5px] leading-[2]">
            <b class="block text-[11px] tracking-[.2em] uppercase text-[#e8a524] mb-1">Your {{ formatNaira(courseFee) }} covers</b>
            <span class="text-[#efe9d4]">Admission processing</span><br>
            <span class="text-[#efe9d4]">Course materials &amp; toolkits</span><br>
            <span class="text-[#efe9d4]">Student portal access</span><br>
            <span class="text-[#efe9d4]">Mentorship &amp; community</span><br>
            <span class="text-[#efe9d4]">Certificate eligibility</span>
          </div>
          <div class="mt-[14px] text-[12.5px] leading-[1.7]">
            Questions? Reach the admissions desk:<br>
            ✉ <a href="mailto:boirsuhub@gmail.com" class="text-[#e8a524] font-bold no-underline">boirsuhub@gmail.com</a><br>
            WhatsApp: <a href="tel:+2348000000000" class="text-[#e8a524] font-bold no-underline">0800 BOI TECH</a>
          </div>
        </div>
      </aside>

      <!-- form shell -->
      <main class="bg-[#fffdf6] border border-[#e6dfca] rounded-[16px] overflow-hidden">
        <div class="bg-[#0c1f16] text-[#8fe3b4] text-[12.5px] px-7 py-[11px] flex gap-2 items-center overflow-x-auto whitespace-nowrap" style="font-family:'JetBrains Mono',monospace">
          <span class="text-[#17b565] font-bold">student@boitech</span>:~$ ./enroll --cohort 12 --fee {{ courseFee }} --currency NGN <span class="inline-block w-2 h-[14px] bg-[#8fe3b4]" style="animation:blink 1s steps(1) infinite"></span>
        </div>

        <div class="flex items-center gap-4 flex-wrap px-7 py-[18px] border-b-2 border-[#14432e]"
             style="background:repeating-linear-gradient(0deg,#fbf7ea 0 26px,rgba(20,67,46,.06) 26px 27px)">
          <div>
            <div class="text-[22px] font-black text-[#14432e]" style="font-family:'Fraunces',serif">Cohort 12 Registration</div>
            <small class="block font-semibold text-[10.5px] tracking-[.2em] text-[#cf3f2b] mt-[3px]" style="font-family:'JetBrains Mono',monospace">ADULT LEARNER APPLICATION · 2026 SESSION</small>
          </div>
          <div class="ml-auto text-right hidden md:block">
            <span class="block font-bold text-[10px] tracking-[.18em] uppercase text-[#6d6f63]" style="font-family:'JetBrains Mono',monospace">Applicant Ref.</span>
            <b class="text-[14px] tracking-[.05em]" style="font-family:'JetBrains Mono',monospace">{{ refNum }}</b>
            <div class="h-[28px] w-[104px] mx-auto mt-[5px]" style="background:repeating-linear-gradient(90deg,#1b211c 0 2px,transparent 2px 4px,#1b211c 4px 7px,transparent 7px 9px,#1b211c 9px 10px,transparent 10px 14px)"></div>
          </div>
        </div>

        <!-- desktop progress -->
        <div class="hidden md:flex px-7 pt-5">
          <div v-for="(s,i) in stepLabels" :key="i" @click="go(i)"
               class="flex-1 flex items-center gap-2 font-bold text-[10.5px] uppercase tracking-[.08em] relative cursor-pointer"
               style="font-family:'JetBrains Mono',monospace"
               :class="i === current ? 'text-[#14432e]' : (i < current ? 'text-[#1d5a3f]' : 'text-[#b6b09c]')">
            <span v-if="i>0" class="h-[2px] bg-[#ddd6c2] mr-[2px] flex-1"></span>
            <span class="w-[26px] h-[26px] rounded-full border-2 grid place-items-center text-[11px] transition-all"
                  :class="i === current ? 'border-[#14432e] bg-[#14432e] text-white shadow-[0_0_0_5px_rgba(20,67,46,.12)]' : (i < current ? 'border-[#1d5a3f] bg-[#1d5a3f] text-white' : 'border-[#ddd6c2] bg-white')">
              {{ i < current ? '✓' : String(i+1).padStart(2,'0') }}
            </span>
            <small>{{ s }}</small>
          </div>
        </div>

        <!-- form -->
        <form class="px-[18px] sm:px-[30px] py-[26px] pb-[34px]" @submit.prevent="handleSubmit" novalidate>
          <!-- Inline validation banner: Continue never fails silently — if a step
               is incomplete this names the exact fields and the fields themselves
               get a red outline. -->
          <div v-if="stepProblems.length" class="mb-5 rounded-[10px] border-[1.5px] border-[#f0b4a4] bg-[#fdeeec] px-4 py-3" role="alert">
            <b class="block text-[13px] font-bold text-[#cf3f2b] mb-1">⚠ Finish the highlighted field{{ stepProblems.length > 1 ? 's' : '' }} before continuing:</b>
            <ul class="list-disc pl-5 text-[12.5px] font-semibold leading-relaxed text-[#a33a26]">
              <li v-for="(p, pi) in stepProblems" :key="pi">{{ p.msg }}</li>
            </ul>
          </div>
          <!-- STEP 0 -->
          <section v-if="current === 0" style="animation:rise .45s cubic-bezier(.22,.9,.3,1) both">
            <div class="flex items-baseline gap-[14px] flex-wrap mb-[6px]">
              <span class="font-bold text-[10px] tracking-[.22em] text-[#cf3f2b] border-[1.5px] border-[#cf3f2b] px-[9px] py-[3px] rounded-[4px] -rotate-1" style="font-family:'JetBrains Mono',monospace">01 / PROFILE</span>
              <h3 class="text-[clamp(22px,2.6vw,29px)] font-black text-[#14432e]" style="font-family:'Fraunces',serif">About You</h3>
              <p class="basis-full text-[14px] text-[#6d6f63] -mt-[2px]">Let's start with who you are. All applicants welcome — from first-time learners to PhD holders.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-[16px] mt-5">
              <div class="md:col-span-2">
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Full name *</label>
                <input v-model="form.fullname" id="f-fullname" type="text" placeholder="e.g. Adaeze Nkiru Okafor" class="w-full text-[15.5px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)] hover:border-[#bcb49c]">
              </div>
              <div>
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Email address *</label>
                <input v-model="form.email" id="f-email" type="email" placeholder="you@example.com" class="w-full text-[15.5px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)] hover:border-[#bcb49c]">
              </div>
              <div>
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Phone / WhatsApp *</label>
                <input v-model="form.phone" id="f-phone" type="tel" placeholder="e.g. 0803 555 0192" class="w-full text-[15.5px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)] hover:border-[#bcb49c]">
              </div>
              <div>
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">City &amp; state *</label>
                <input v-model="form.location" id="f-location" type="text" placeholder="e.g. Yaba, Lagos" class="w-full text-[15.5px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)] hover:border-[#bcb49c]">
              </div>
              <div>
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Country *</label>
                <input v-model="form.country" id="f-country" type="text" value="Nigeria" class="w-full text-[15.5px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)] hover:border-[#bcb49c]">
              </div>
              <div class="md:col-span-2">
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Gender <span class="text-[#a49f8c] font-normal">(optional)</span></label>
                <div class="flex gap-[10px] flex-wrap">
                  <label v-for="g in ['Female','Male','Prefer not to say']" :key="g" @click="form.gender = g" class="inline-block px-[18px] py-[10px] border-[1.6px] border-[#d9d1bc] rounded-[100px] bg-white font-bold text-[13.5px] cursor-pointer transition-all hover:border-[#1d5a3f] hover:-translate-y-[2px]"
                         :class="form.gender === g ? 'bg-[#14432e] border-[#14432e] text-white shadow-[0_6px_14px_rgba(20,67,46,.25)]' : ''">
                    <input type="radio" v-model="form.gender" :value="g" class="hidden">
                    {{ g }}
                  </label>
                </div>
              </div>
              <div>
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Date of birth <span class="text-[#a49f8c] font-normal">(optional)</span></label>
                <input v-model="form.dob" type="date" class="w-full text-[15.5px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)] hover:border-[#bcb49c]">
              </div>
              <div>
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Current occupation <span class="text-[#a49f8c] font-normal">(optional)</span></label>
                <input v-model="form.occupation" type="text" placeholder="e.g. Student, NYSC, banker, designer…" class="w-full text-[15.5px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)] hover:border-[#bcb49c]">
              </div>
            </div>
          </section>

          <!-- STEP 1 -->
          <section v-if="current === 1" style="animation:rise .45s cubic-bezier(.22,.9,.3,1) both">
            <div class="flex items-baseline gap-[14px] flex-wrap mb-[6px]">
              <span class="font-bold text-[10px] tracking-[.22em] text-[#cf3f2b] border-[1.5px] border-[#cf3f2b] px-[9px] py-[3px] rounded-[4px] -rotate-1" style="font-family:'JetBrains Mono',monospace">02 / BACKGROUND</span>
              <h3 class="text-[clamp(22px,2.6vw,29px)] font-black text-[#14432e]" style="font-family:'Fraunces',serif">Your Education &amp; Skills</h3>
              <p class="basis-full text-[14px] text-[#6d6f63] -mt-[2px]">This helps us place you on the right starting line. No wrong answers — beginners are our favourite people.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-[16px] mt-5">
              <div class="md:col-span-2">
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Highest qualification *</label>
                <select id="f-qualification" v-model="form.qualification" @change="onQualChange" class="w-full text-[15.5px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)] hover:border-[#bcb49c]">
                  <option value="">— Select —</option>
                  <option>No certificate yet</option>
                  <option>SSCE / WAEC / NECO</option>
                  <option>OND</option>
                  <option>HND</option>
                  <option>BSc / BA / BTech / BEng</option>
                  <option>PGD</option>
                  <option>MSc / MA / MBA</option>
                  <option>PhD</option>
                  <option>Other</option>
                </select>
              </div>

              <div class="md:col-span-2 overflow-hidden" :class="eduOpen ?'max-h-[400px] opacity-100 mt-4' : 'max-h-0 opacity-0'" style="transition:max-height .45s ease,opacity .4s ease">
                <div class="bg-[#eef5ee] border-[1.6px] border-[#cfe0d2] rounded-[12px] p-5">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                    <div>
                      <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Field of study *</label>
                      <input v-model="form.fieldStudy" id="f-fieldstudy" type="text" placeholder="e.g. Biochemistry, Accounting…" class="w-full text-[15.5px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)] hover:border-[#bcb49c]">
                    </div>
                    <div>
                      <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Institution <span class="text-[#a49f8c] font-normal">(optional)</span></label>
                      <input v-model="form.institution" type="text" placeholder="e.g. University of Lagos" class="w-full text-[15.5px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)] hover:border-[#bcb49c]">
                    </div>
                    <div v-if="form.qualification === 'PhD'" class="md:col-span-2">
                      <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Research / thesis focus <span class="text-[#a49f8c] font-normal">(optional — we love curiosity!)</span></label>
                      <input v-model="form.research" type="text" placeholder="e.g. Machine learning for crop yield prediction" class="w-full text-[15.5px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)] hover:border-[#bcb49c]">
                    </div>
                  </div>
                </div>
              </div>

              <div class="md:col-span-2">
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Tech skills you already have <span class="text-[#a49f8c] font-normal">(pick any that apply)</span></label>
                <div class="flex gap-[9px] flex-wrap">
                  <label v-for="s in skills" :key="s.value" class="inline-block px-[15px] py-2 border-[1.5px] border-dashed border-[#d9d1bc] rounded-[100px] text-[13px] font-bold cursor-pointer transition-all hover:border-[#e8a524] hover:text-[#1b211c] hover:-translate-y-[2px] bg-white"
                         :class="form.skills.includes(s.value) ? 'bg-[#fdf3d7] border-[#e8a524] text-[#7c5a06] border-solid' : ''">
                    <input type="checkbox" :value="s.value" v-model="form.skills" class="hidden">
                    <span v-if="form.skills.includes(s.value)">✓ </span>{{ s.label }}
                  </label>
                </div>
              </div>

              <div class="md:col-span-2">
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">How would you rate your overall tech skill? *</label>
                <div id="f-skilllevel" class="flex gap-[10px] flex-wrap">
                  <label v-for="l in skillLevels" :key="l.value" @click="form.skillLevel = l.value" class="inline-block px-[18px] py-[10px] border-[1.6px] border-[#d9d1bc] rounded-[100px] bg-white font-bold text-[13.5px] cursor-pointer transition-all hover:border-[#1d5a3f] hover:-translate-y-[2px]"
                         :class="form.skillLevel === l.value ? 'bg-[#14432e] border-[#14432e] text-white shadow-[0_6px_14px_rgba(20,67,46,.25)]' : ''">
                    <input type="radio" v-model="form.skillLevel" :value="l.value" class="hidden">
                    {{ l.value }}
                  </label>
                </div>
              </div>

              <div class="md:col-span-2">
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Tell us more about your skills &amp; experience <span class="text-[#a49f8c] font-normal">(optional but very helpful)</span></label>
                <textarea v-model="form.skillNotes" maxlength="500" placeholder="Anything you've built, tools you've used, projects, hobbies, self-learning — everything counts." class="w-full text-[15.5px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)] hover:border-[#bcb49c] resize-y" style="min-height:96px"></textarea>
                <p class="text-[12.5px] text-[#6d6f63] mt-[6px]"><b class="text-[#14432e]">{{ form.skillNotes.length }}</b>/500 characters</p>
              </div>
            </div>
          </section>

          <!-- STEP 2 -->
          <section v-if="current === 2" style="animation:rise .45s cubic-bezier(.22,.9,.3,1) both">
            <div class="flex items-baseline gap-[14px] flex-wrap mb-[6px]">
              <span class="font-bold text-[10px] tracking-[.22em] text-[#cf3f2b] border-[1.5px] border-[#cf3f2b] px-[9px] py-[3px] rounded-[4px] -rotate-1" style="font-family:'JetBrains Mono',monospace">03 / PROGRAMME</span>
              <h3 class="text-[clamp(22px,2.6vw,29px)] font-black text-[#14432e]" style="font-family:'Fraunces',serif">Choose Your Course</h3>
              <p class="basis-full text-[14px] text-[#6d6f63] -mt-[2px]">We teach <b class="text-[#14432e]">21 tech tracks</b> — and your search reaches <b class="text-[#14432e]">any course in the world</b> (Coursera, edX, Udemy, Stanford, MIT…). Pick what you want to master this cohort.</p>
            </div>

            <!-- Course search: filter the 16 tracks down instantly -->
            <div class="mt-[18px] mb-[14px]">
              <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Search for the course you want 🔍</label>
              <input v-model="courseSearch" type="search" placeholder="Search any course — our 21 tracks or anything worldwide (e.g. astronomy, Korean, architecture…)…"
                     class="w-full text-[15.5px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)] hover:border-[#bcb49c]">
              <p class="text-[11.5px] text-[#6d6f63] mt-[6px] font-bold">Showing {{ visibleCourses.length }} of {{ filteredCourses.length }} {{ courseSearch ? 'matching' : 'available' }} courses<span v-if="hiddenCourseCount" class="text-[#cf3f2b]"> — {{ courseSearch ? 'refine your search' : 'use the search box' }} to see the rest</span></p>
            </div>

            <div id="f-course" class="grid gap-[14px] mt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <p v-if="!filteredCourses.length" class="md:col-span-2 lg:col-span-3 text-center text-[13.5px] text-[#6d6f63] bg-white border border-dashed border-[#d9d1bc] rounded-[12px] py-8">
                No course matches "<b>{{ courseSearch }}</b>" — try a shorter word like "data", "web", or "design".
              </p>
              <label v-for="c in visibleCourses" :key="c.name" @click="form.course = c.name" class="relative cursor-pointer">
                <input type="radio" v-model="form.course" :value="c.name" class="absolute opacity-0 pointer-events-none">
                <span class="flex flex-col gap-[6px] bg-white border-[1.6px] border-[#d9d1bc] rounded-[12px] p-4 pb-[14px] h-full transition-all hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(27,33,28,.1)] hover:border-[#b9b198]"
                      :class="form.course === c.name ? 'border-[#14432e] bg-[#eef5ee] shadow-[0_8px_20px_rgba(20,67,46,.14)] -translate-y-[3px]' : ''">
                  <span class="text-[24px]">{{ c.em }}</span>
                  <b class="text-[15.5px] font-bold" style="font-family:'Fraunces',serif">{{ c.name }}</b>
                  <small class="text-[12px] text-[#6d6f63] leading-[1.5]">{{ c.desc }}</small>
                  <span class="mt-auto flex gap-2 flex-wrap pt-[9px]">
                    <span class="font-bold text-[10px] tracking-[.06em] px-2 py-[3px] rounded-[4px] bg-[#f5f1e6] text-[#6d6f63]" style="font-family:'JetBrains Mono',monospace">{{ c.wks }}</span>
                    <span class="font-bold text-[10px] tracking-[.06em] px-2 py-[3px] rounded-[4px] bg-[#fdf3d7] text-[#7c5a06]" style="font-family:'JetBrains Mono',monospace">{{ c.lvl }}</span>
                  </span>
                </span>
                <span class="absolute -top-[9px] -right-[9px] w-[26px] h-[26px] rounded-full bg-[#e8a524] text-[#0d3321] grid place-items-center font-extrabold text-[13px] shadow-[0_3px_8px_rgba(0,0,0,.2)] transition-transform"
                      :class="form.course === c.name ? 'scale-100' : 'scale-0'" style="transition:transform .3s cubic-bezier(.34,1.6,.5,1)">✓</span>
              </label>
            </div>

            <!-- WORLD COURSE RESULTS: anything beyond the local tracks, live
                 from Class Central (Coursera, edX, Udemy, MIT, Stanford…).
                 Clicking a card selects it like any other course; the "View
                 course" link opens the provider page without selecting. -->
            <div v-if="courseSearch.trim().length >= 3" class="mt-7">
              <div class="flex items-baseline gap-[12px] flex-wrap mb-[4px]">
                <span class="font-bold text-[10px] tracking-[.22em] text-[#0d7a45] border-[1.5px] border-[#0d7a45] px-[9px] py-[3px] rounded-[4px]" style="font-family:'JetBrains Mono',monospace">🌍 WORLD RESULTS</span>
                <p class="text-[13px] text-[#6d6f63]">Real courses from Coursera, edX, Udemy, Stanford, MIT &amp; more — pick one to enroll.</p>
              </div>
              <p v-if="worldLoading" class="text-[13.5px] text-[#6d6f63] mt-3">🔎 Searching the world's course catalogs for “<b>{{ courseSearch.trim() }}</b>”…</p>
              <p v-else-if="worldError" class="text-[13px] text-[#cf3f2b] bg-[#fdeeec] border border-[#f3c2ba] rounded-[9px] px-4 py-3 mt-3">{{ worldError }}</p>
              <p v-else-if="!worldResults.length" class="text-[13.5px] text-[#6d6f63] mt-3">No world matches for “<b>{{ worldSearched }}</b>” — try fewer or broader words.</p>
              <div v-else class="grid gap-[14px] mt-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <label v-for="w in worldResults" :key="w.url" @click="form.course = w.name" class="relative cursor-pointer">
                  <input type="radio" v-model="form.course" :value="w.name" class="absolute opacity-0 pointer-events-none">
                  <span class="flex flex-col gap-[6px] bg-white border-[1.6px] border-[#d9d1bc] rounded-[12px] p-4 pb-[14px] h-full transition-all hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(27,33,28,.1)] hover:border-[#b9b198]"
                        :class="form.course === w.name ? 'border-[#14432e] bg-[#eef5ee] shadow-[0_8px_20px_rgba(20,67,46,.14)] -translate-y-[3px]' : ''">
                    <span class="text-[24px]">🌍</span>
                    <b class="text-[15.5px] font-bold leading-snug" style="font-family:'Fraunces',serif">{{ w.name }}</b>
                    <small class="text-[12px] text-[#6d6f63] leading-[1.5]">{{ w.institution || w.desc }}</small>
                    <span class="mt-auto flex gap-2 flex-wrap pt-[9px]">
                      <span class="font-bold text-[10px] tracking-[.06em] px-2 py-[3px] rounded-[4px] bg-[#f5f1e6] text-[#6d6f63]" style="font-family:'JetBrains Mono',monospace">{{ w.provider }}</span>
                      <span v-if="w.rating" class="font-bold text-[10px] tracking-[.06em] px-2 py-[3px] rounded-[4px] bg-[#fdf3d7] text-[#7c5a06]" style="font-family:'JetBrains Mono',monospace">★ {{ w.rating }}<template v-if="w.reviews"> ({{ w.reviews }})</template></span>
                      <span v-if="w.duration" class="font-bold text-[10px] tracking-[.06em] px-2 py-[3px] rounded-[4px] bg-[#eef5ee] text-[#0d7a45]" style="font-family:'JetBrains Mono',monospace">{{ w.duration }}</span>
                    </span>
                    <a :href="w.url" target="_blank" rel="noopener" @click.stop class="text-[12px] font-bold text-[#14432e] underline underline-offset-2 mt-[2px]">View course ↗</a>
                  </span>
                  <span class="absolute -top-[9px] -right-[9px] w-[26px] h-[26px] rounded-full bg-[#e8a524] text-[#0d3321] grid place-items-center font-extrabold text-[13px] shadow-[0_3px_8px_rgba(0,0,0,.2)] transition-transform"
                        :class="form.course === w.name ? 'scale-100' : 'scale-0'" style="transition:transform .3s cubic-bezier(.34,1.6,.5,1)">✓</span>
                </label>
              </div>
            </div>

            <div class="mt-5 grid grid-cols-1 gap-[14px] bg-[#faf7ee] border-[1.6px] border-dashed border-[#d9d1bc] rounded-[12px] p-5">
              <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e]" style="font-family:'JetBrains Mono',monospace">Partner / sponsor code <span class="text-[#a49f8c] font-normal">(optional)</span></label>
              <input v-model="form.sponsorId" type="text" placeholder="e.g. BOI-ORBIT-247 — enter if a partner or sponsor referred you" class="w-full text-[15.5px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)] hover:border-[#bcb49c]" style="text-transform:uppercase">
              <p class="text-[12.5px] text-[#6d6f63] leading-[1.5]">Enter the code a partner or sponsor gave you — if an agreement covers your course, your fee adjusts automatically at payment.</p>
              <p v-if="sponsorDiscount" class="text-[13px] font-bold text-[#0d7a45] bg-[#e7f7ee] border border-[#9adcb8] rounded-[9px] px-4 py-3">🎉 Partner pricing applied! Your fee for this course is {{ formatNaira(courseFee) }} (standard is {{ formatNaira(baseFeeFor?.standard ?? 0) }}).</p>
            </div>

            <div class="grid grid-cols-1 gap-[16px] mt-6">
              <div>
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Preferred class track *</label>
                <div class="flex gap-[10px] flex-wrap">
                  <label v-for="t in tracks" :key="t.value" @click="form.track = t.value" class="inline-block px-[18px] py-[10px] border-[1.6px] border-[#d9d1bc] rounded-[100px] bg-white font-bold text-[13.5px] cursor-pointer transition-all hover:border-[#1d5a3f] hover:-translate-y-[2px]"
                         :class="form.track === t.value ? 'bg-[#14432e] border-[#14432e] text-white shadow-[0_6px_14px_rgba(20,67,46,.25)]' : ''">
                    <input type="radio" v-model="form.track" :value="t.value" class="hidden">
                    {{ t.value }}
                  </label>
                </div>
              </div>
              <div>
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Your class days & times * <span class="text-[#a49f8c] font-normal normal-case tracking-normal">(daily classes are ON by default — pick the hour per day, or untick any day you want off)</span></label>
                <div id="f-days" class="grid grid-cols-2 sm:grid-cols-4 gap-[14px]">
                  <div v-for="day in weekDays" :key="day.name" class="border-[1.6px] border-[#d9d1bc] rounded-[14px] bg-white p-[12px] flex flex-col gap-[8px]">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-[13.5px] text-[#14432e]">{{ day.label }}</span>
                      <input type="checkbox" v-model="form.dayActive[day.name]" :true-value="'1'" :false-value="'0'"
                             class="w-[16px] h-[16px] accent-[#1d5a3f]">
                    </div>
                    <div v-if="form.dayActive[day.name] === '1'" class="flex items-center gap-[8px]">
                      <select v-model="form.dayTime[day.name]" class="flex-1 border-[1.4px] border-[#d9d1bc] rounded-[10px] bg-white font-bold text-[13px] px-[8px] py-[7px] text-center focus:border-[#1d5a3f] focus:outline-none"
                              :disabled="form.dayActive[day.name] !== '1'">
                        <option v-for="t in classTimes" :key="t.value" :value="t.value">{{ t.label }}</option>
                      </select>
                    </div>
                    <div v-else class="text-center text-[12px] text-[#7d735c] font-bold">No class that day</div>
                  </div>
                </div>
                <p class="text-[12.5px] text-[#6d6f63] leading-[1.5] mt-[6px]"><b class="text-[#14432e]">Daily classes are ON by default</b> — every day is scheduled at the chosen hour unless you untick it. Your whole timetable — dashboard, roadmap and AI lesson plan — follows exactly the days and hours above.</p>
              </div>
              <div>
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">What are you hoping this course helps you do? <span class="text-[#a49f8c] font-normal">(pick any)</span></label>
                <div class="flex gap-[9px] flex-wrap">
                  <label v-for="g in goals" :key="g.value" class="inline-block px-[15px] py-2 border-[1.5px] border-dashed border-[#d9d1bc] rounded-[100px] text-[13px] font-bold cursor-pointer transition-all hover:border-[#e8a524] hover:text-[#1b211c] hover:-translate-y-[2px] bg-white"
                         :class="form.goals.includes(g.value) ? 'bg-[#fdf3d7] border-[#e8a524] text-[#7c5a06] border-solid' : ''">
                    <input type="checkbox" :value="g.value" v-model="form.goals" class="hidden">
                    <span v-if="form.goals.includes(g.value)">✓ </span>{{ g.value }}
                  </label>
                </div>
              </div>
              <div>
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">What are you looking forward to from Boi Tech Academy? *</label>
                <textarea id="f-expect" v-model="form.expect" maxlength="600" placeholder="Tell us honestly — what do you want to walk away with? Skills, mentorship, a job, community, confidence…?" class="w-full text-[15.5px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)] hover:border-[#bcb49c] resize-y" style="min-height:96px"></textarea>
                <p class="text-[12.5px] text-[#6d6f63] mt-[6px]"><span class="text-[#14432e] font-bold">{{ form.expect.length }}</span>/600 characters</p>
              </div>
              <div>
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">How did you hear about us? <span class="text-[#a49f8c] font-normal">(optional)</span></label>
                <select v-model="form.heard" class="w-full text-[15.5px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)] hover:border-[#bcb49c]">
                  <option value="">— Select —</option>
                  <option>WhatsApp</option><option>Instagram</option><option>Twitter / X</option>
                  <option>LinkedIn</option><option>Friend or family</option><option>Google search</option><option>Other</option>
                </select>
              </div>
            </div>
          </section>

          <!-- STEP 3 -->
          <section v-if="current === 3" style="animation:rise .45s cubic-bezier(.22,.9,.3,1) both">
            <div class="flex items-baseline gap-[14px] flex-wrap mb-[6px]">
              <span class="font-bold text-[10px] tracking-[.22em] text-[#cf3f2b] border-[1.5px] border-[#cf3f2b] px-[9px] py-[3px] rounded-[4px] -rotate-1" style="font-family:'JetBrains Mono',monospace">04 / PAYMENT</span>
              <h3 class="text-[clamp(22px,2.6vw,29px)] font-black text-[#14432e]" style="font-family:'Fraunces',serif">Confirm &amp; Pay</h3>
              <p class="basis-full text-[14px] text-[#6d6f63] -mt-[2px]">Review your application, pay the {{ formatNaira(courseFee) }} registration fee, and you're officially in the pipeline.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-[16px] mt-5">
              <div class="bg-white border-[1.6px] border-[#d9d1bc] rounded-[12px] p-5">
                <h5 class="font-bold text-[10.5px] uppercase tracking-[.2em] text-[#cf3f2b] mb-3 flex justify-between items-center" style="font-family:'JetBrains Mono',monospace">Applicant <button type="button" class="bg-none border-none font-bold text-[12px] text-[#1d5a3f] underline cursor-pointer" @click="go(0)">Edit</button></h5>
                <dl class="grid grid-cols-[auto_1fr] gap-[7px_14px] text-[13.5px]">
                  <dt class="text-[#6d6f63] font-bold">Name</dt><dd class="font-semibold">{{ form.fullname || '—' }}</dd>
                  <dt class="text-[#6d6f63] font-bold">Email</dt><dd class="font-semibold">{{ form.email || '—' }}</dd>
                  <dt class="text-[#6d6f63] font-bold">Phone</dt><dd class="font-semibold">{{ form.phone || '—' }}</dd>
                  <dt class="text-[#6d6f63] font-bold">Location</dt><dd class="font-semibold">{{ form.location }}, {{ form.country }}</dd>
                  <dt class="text-[#6d6f63] font-bold">Gender</dt><dd class="font-semibold">{{ form.gender || '—' }}</dd>
                  <dt class="text-[#6d6f63] font-bold">Occupation</dt><dd class="font-semibold">{{ form.occupation || '—' }}</dd>
                </dl>
              </div>
              <div class="bg-white border-[1.6px] border-[#d9d1bc] rounded-[12px] p-5">
                <h5 class="font-bold text-[10.5px] uppercase tracking-[.2em] text-[#cf3f2b] mb-3 flex justify-between items-center" style="font-family:'JetBrains Mono',monospace">Education &amp; Skills <button type="button" class="bg-none border-none font-bold text-[12px] text-[#1d5a3f] underline cursor-pointer" @click="go(1)">Edit</button></h5>
                <dl class="grid grid-cols-[auto_1fr] gap-[7px_14px] text-[13.5px]">
                  <dt class="text-[#6d6f63] font-bold">Qualification</dt><dd class="font-semibold">{{ form.qualification || '—' }}</dd>
                  <dt class="text-[#6d6f63] font-bold">Skill level</dt><dd class="font-semibold">{{ form.skillLevel || '—' }}</dd>
                  <dt class="text-[#6d6f63] font-bold">Skills</dt><dd class="font-semibold">{{ form.skills.length ? form.skills.join(', ') : '—' }}</dd>
                </dl>
              </div>
              <div class="bg-white border-[1.6px] border-[#d9d1bc] rounded-[12px] p-5 md:col-span-2">
                <h5 class="font-bold text-[10.5px] uppercase tracking-[.2em] text-[#cf3f2b] mb-3 flex justify-between items-center" style="font-family:'JetBrains Mono',monospace">Programme <button type="button" class="bg-none border-none font-bold text-[12px] text-[#1d5a3f] underline cursor-pointer" @click="go(2)">Edit</button></h5>
                <dl class="grid grid-cols-[auto_1fr] gap-[7px_14px] text-[13.5px]">
                  <dt class="text-[#6d6f63] font-bold">Course</dt><dd class="font-semibold">{{ form.course || '—' }}</dd>
                  <dt class="text-[#6d6f63] font-bold">Track</dt><dd class="font-semibold">{{ form.track || '—' }}</dd>
                  <dt class="text-[#6d6f63] font-bold">Class days & times</dt><dd class="font-semibold">{{ classTimeSummary(form.dailyTimes, form.classTime) }}</dd>
                  <dt class="text-[#6d6f63] font-bold">Goals</dt><dd class="font-semibold">{{ form.goals.length ? form.goals.join(', ') : '—' }}</dd>
                  <dt class="text-[#6d6f63] font-bold">Expectations</dt><dd class="font-semibold">{{ form.expect || '—' }}</dd>
                  <dt class="text-[#6d6f63] font-bold">Heard via</dt><dd class="font-semibold">{{ form.heard || '—' }}</dd>
                </dl>
              </div>
            </div>

            <div class="mt-[22px] bg-[#fdf3d7] border-[1.6px] border-dashed border-[#e8a524] rounded-[12px] p-5">
              <h4 class="text-[17px] font-black text-[#7c5a06] mb-3" style="font-family:'Fraunces',serif">🧾 Registration Fee</h4>
              <div class="flex items-baseline text-[14px] py-[5px]"><span class="font-bold">Cohort 12 registration &amp; admission processing</span><span class="flex-1 border-b-2 border-dotted border-[#d8c58a] mx-[10px] -translate-y-1"></span><span class="font-extrabold">{{ formatNaira(courseFee) }}</span></div>
              <div v-if="sponsorDiscount" class="flex items-baseline text-[12.5px] py-[4px] text-[#0d7a45]"><span class="font-bold">Partner agreement applied (sponsor)</span><span class="flex-1 border-b-2 border-dotted border-[#d8c58a] mx-[10px] -translate-y-1"></span><span class="font-extrabold">✓ {{ feeSource }}</span></div>
              <div class="flex items-baseline text-[14px] py-[5px]"><span class="font-bold">Course materials, portal &amp; mentorship access</span><span class="flex-1 border-b-2 border-dotted border-[#d8c58a] mx-[10px] -translate-y-1"></span><span class="font-extrabold">Included</span></div>
              <div class="flex items-baseline text-[16px] py-[12px] mt-[10px] pt-3 border-t-2 border-[#cfae55]"><span class="font-bold">Total due now</span><span class="flex-1 border-b-2 border-dotted border-[#d8c58a] mx-[10px] -translate-y-1"></span><span class="font-black text-[21px] text-[#14432e]" style="font-family:'Fraunces',serif">{{ formatNaira(courseFee) }}</span></div>
              <p class="text-[12px] text-[#8a7a45] mt-[10px] leading-[1.6]">Course tuition is billed separately after admission. This fee secures your assessment slot and is non-refundable once processed.</p>
            </div>

            <!-- SECURITY: If already paid, show confirmation only; no payment re-entry -->
            <div v-if="payment.status === 'paid'" class="rounded-[14px] border-[1.6px] border-[#17b565] bg-[#e7f7ee] p-6 mt-[22px]" style="animation:rise .4s both">
              <div class="flex items-start gap-3 mb-3">
                <span class="text-[22px]">✓</span>
                <div>
                  <h4 class="font-black text-[16px] text-[#0d7a45]">Payment confirmed</h4>
                  <p class="text-[13px] text-[#1b211c] leading-[1.5] mt-1">Your {{ formatNaira(courseFee) }} registration fee has been processed. Now create your student account to complete enrollment.</p>
                  <p class="text-[11.5px] text-[#6d6f63] mt-2 font-mono">Reference: <b>{{ payment.ref }}</b></p>
                </div>
              </div>
            </div>

            <!-- Show payment options only if NOT already paid -->
            <div v-if="payment.status !== 'paid'" class="grid grid-cols-1 md:grid-cols-2 gap-[14px] mt-[22px]" style="animation:rise .4s both">
              <label class="bg-white border-[1.8px] border-[#d9d1bc] rounded-[12px] p-5 cursor-pointer transition-all hover:-translate-y-[3px] hover:shadow-[0_10px_20px_rgba(27,33,28,.09)] hover:border-[#b9b198]"
                     :class="form.paymethod === 'card' ? 'border-[#14432e] bg-[#eef5ee] shadow-[0_8px_20px_rgba(20,67,46,.13)]' : ''">
                <input type="radio" v-model="form.paymethod" value="card" class="hidden">
                <b class="flex items-center gap-[9px] text-[15.5px] mb-[5px]">💳 Pay now — Paystack</b>
                <small class="text-[12.5px] text-[#6d6f63] leading-[1.5] block">Pay instantly with card, bank transfer or USSD inside a secure Paystack popup. Fastest confirmation.</small>
              </label>
              <label class="bg-white border-[1.8px] border-[#d9d1bc] rounded-[12px] p-5 cursor-pointer transition-all hover:-translate-y-[3px] hover:shadow-[0_10px_20px_rgba(27,33,28,.09)] hover:border-[#b9b198]"
                     :class="form.paymethod === 'bank' ? 'border-[#14432e] bg-[#eef5ee] shadow-[0_8px_20px_rgba(20,67,46,.13)]' : ''">
                <input type="radio" v-model="form.paymethod" value="bank" class="hidden">
                <b class="flex items-center gap-[9px] text-[15.5px] mb-[5px]">🏦 Manual bank transfer</b>
                <small class="text-[12.5px] text-[#6d6f63] leading-[1.5] block">Already sent the money by transfer? Paste your receipt reference and we'll verify it manually.</small>
              </label>
            </div>

            <div v-if="payment.status !== 'paid' && form.paymethod === 'card'" class="mt-4" style="animation:rise .4s both">
              <button type="button" class="w-full font-extrabold text-[15px] tracking-[.04em] bg-[#e8a524] text-[#0d3321] rounded-[11px] py-[17px] cursor-pointer shadow-[0_8px_18px_rgba(232,165,36,.4)] transition-all hover:brightness-[1.07] hover:-translate-y-[3px] flex items-center justify-center gap-[10px]"
                      :disabled="payLoading" @click="payWithCard">🔐 Pay {{ formatNaira(courseFee) }} securely with Paystack</button>
              <div v-if="payStatus.show" class="mt-3 font-bold text-[12.5px] px-[15px] py-[11px] rounded-[9px]" :class="payStatus.cls">{{ payStatus.msg }}</div>
              <p class="text-[12.5px] text-[#6d6f63] mt-[10px]">Payments are processed by Paystack. Boi Tech Academy never sees your card details.</p>
            </div>

            <div v-if="payment.status !== 'paid' && form.paymethod === 'bank'" class="mt-4" style="animation:rise .4s both">
              <div class="bg-white border-[1.6px] border-[#d9d1bc] rounded-[12px] p-5">
                <div class="flex justify-between gap-3 text-[14px] py-[6px] border-b border-dashed border-[#d9d1bc]"><span class="text-[#6d6f63] font-bold text-[12.5px]">Bank name</span><b class="text-[13.5px]" style="font-family:'JetBrains Mono',monospace">Your Bank Name</b></div>
                <div class="flex justify-between gap-3 text-[14px] py-[6px] border-b border-dashed border-[#d9d1bc]"><span class="text-[#6d6f63] font-bold text-[12.5px]">Account number</span><b class="text-[13.5px]" style="font-family:'JetBrains Mono',monospace">0123 456 789</b></div>
                <div class="flex justify-between gap-3 text-[14px] py-[6px] border-b border-dashed border-[#d9d1bc]"><span class="text-[#6d6f63] font-bold text-[12.5px]">Account name</span><b class="text-[13.5px]" style="font-family:'JetBrains Mono',monospace">Boi Tech Academy</b></div>
                <div class="flex justify-between gap-3 text-[14px] py-[6px]"><span class="text-[#6d6f63] font-bold text-[12.5px]">Amount</span><b class="text-[13.5px]" style="font-family:'JetBrains Mono',monospace">{{ formatNaira(courseFee) }} exactly</b></div>
                <p class="text-[10.5px] text-[#6d6f63] mt-2" style="font-family:'JetBrains Mono',monospace">// please use your full name as the transfer narration</p>
              </div>
              <div class="mt-[14px]">
                <label class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Your transfer reference / receipt code *</label>
                <input v-model="form.transferRef" type="text" placeholder="e.g. TRF/2026/00841234" class="w-full text-[15.5px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)] hover:border-[#bcb49c]">
              </div>
            </div>

            <label class="flex items-start gap-[11px] text-[14px] leading-[1.55] cursor-pointer mt-[18px] p-[14px] bg-[#faf7ea] rounded-[10px] md:p-0 md:bg-transparent">
              <input type="checkbox" v-model="form.declare" class="w-[19px] h-[19px] mt-[2px] cursor-pointer shrink-0" style="accent-color:#14432e">
              <span>I confirm the information I've provided is accurate, and I understand the {{ formatNaira(courseFee) }} registration fee secures my place in Cohort 12 at <b>Boi Tech Academy</b>. <b style="color:#cf3f2b">*</b></span>
            </label>

            <!-- AUTO-TRIGGER ACCOUNT MODAL: If payment confirmed, show account creation button -->
            <div v-if="payment.status === 'paid'" class="mt-[22px] text-center" style="animation:rise .4s both">
              <button type="button" class="inline-flex items-center gap-[8px] font-extrabold text-[15px] tracking-[.04em] bg-[#14432e] text-white rounded-[11px] py-[16px] px-[28px] cursor-pointer shadow-[0_8px_18px_rgba(20,67,46,.3)] transition-all hover:bg-[#1d5a3f] hover:-translate-y-[3px]"
                      @click="goToAccountCreation">
                ✓ Create account now
              </button>
              <p class="text-[12.5px] text-[#6d6f63] mt-[10px]">Next step: Set up your student account and confirm enrollment details.</p>
            </div>
          </section>

          <!-- nav — desktop only. On phones the fixed bottom bar below carries
               the same Back/Continue/Submit actions, so showing this too gave
               two Continue buttons on one screen. -->
          <div class="hidden md:flex items-center gap-[14px] mt-8 pt-[22px] border-t border-dashed border-[#d9d1bc]">
            <button type="button" class="font-extrabold text-[14px] tracking-[.08em] uppercase cursor-pointer px-7 py-[14px] rounded-[10px] bg-transparent text-[#14432e] border-[1.8px] border-[#d9d1bc] transition-all hover:border-[#14432e] hover:bg-[#eef5ee] hover:-translate-y-[2px]"
                    :class="current === 0 ? 'pointer-events-none opacity-0' : ''" @click="go(current-1)">← Back</button>
            <span class="flex-1"></span>
            <span class="text-[12.5px] text-[#6d6f63] mr-[6px]">Step {{ current+1 }} of 4</span>
            <button v-if="current < 3" type="button" class="font-extrabold text-[14px] tracking-[.08em] uppercase cursor-pointer px-7 py-[14px] rounded-[10px] bg-[#14432e] text-white shadow-[0_8px_18px_rgba(20,67,46,.3)] transition-all hover:bg-[#1d5a3f] hover:-translate-y-[3px]" @click="handleNext">Continue →</button>
            <button v-else type="submit" class="font-extrabold text-[14px] tracking-[.08em] uppercase cursor-pointer px-7 py-[14px] rounded-[10px] bg-[#e8a524] text-[#0d3321] shadow-[0_8px_18px_rgba(232,165,36,.4)] transition-all hover:brightness-[1.07] hover:-translate-y-[3px]">🎓 Complete Registration</button>
          </div>
        </form>

        <!-- success -->
        <div v-if="success" class="text-center px-[30px] py-[60px] pb-[66px]" style="animation:rise .5s both">
          <div class="inline-block font-black text-[clamp(24px,4vw,40px)] text-[#17b565] border-4 border-double border-[#17b565] rounded-lg px-[30px] py-3 -rotate-6 tracking-[.06em] mb-[26px]"
               style="font-family:'Fraunces',serif;animation:stampIn .55s cubic-bezier(.2,1.6,.4,1) both">REGISTERED&nbsp;✓</div>
          <h3 class="text-[30px] font-black text-[#14432e] mb-2" style="font-family:'Fraunces',serif">You're in the pipeline!</h3>
          <div class="text-[18px] font-bold tracking-[.06em] bg-[#fdf3d7] inline-block px-5 py-2 rounded-lg border-[1.5px] border-dashed border-[#e8a524] my-3" style="font-family:'JetBrains Mono',monospace">{{ refNum }}</div>
          <p class="text-[14.5px] text-[#6d6f63] max-w-[540px] mx-auto mb-6 leading-[1.7]">Well done, <b class="text-[#1b211c]">{{ form.fullname }}</b>. {{ successMsg }} Your receipt and next steps are on the way to <b class="text-[#1b211c]">{{ form.email }}</b>. Welcome to Cohort 12 at Boi Tech Academy! 🎉</p>
          <div class="flex gap-[14px] justify-center flex-wrap mb-8">
            <div class="bg-white border-[1.6px] border-[#d9d1bc] rounded-[12px] p-4 text-left w-[210px] transition-all hover:-translate-y-[5px] hover:shadow-[0_12px_22px_rgba(27,33,28,.1)]"><span class="text-[20px] font-black text-[#e8a524]" style="font-family:'Fraunces',serif">01</span><b class="block text-[13.5px] text-[#14432e] my-[6px]">Check your inbox</b><span class="text-[12.5px] text-[#6d6f63] leading-[1.5] block">Your receipt and applicant guide arrive by email within minutes.</span></div>
            <div class="bg-white border-[1.6px] border-[#d9d1bc] rounded-[12px] p-4 text-left w-[210px] transition-all hover:-translate-y-[5px] hover:shadow-[0_12px_22px_rgba(27,33,28,.1)]"><span class="text-[20px] font-black text-[#e8a524]" style="font-family:'Fraunces',serif">02</span><b class="block text-[13.5px] text-[#14432e] my-[6px]">Orientation day</b><span class="text-[12.5px] text-[#6d6f63] leading-[1.5] block">Saturday 19 Sept 2026 — meet your mentors and cohort mates.</span></div>
            <div class="bg-white border-[1.6px] border-[#d9d1bc] rounded-[12px] p-4 text-left w-[210px] transition-all hover:-translate-y-[5px] hover:shadow-[0_12px_22px_rgba(27,33,28,.1)]"><span class="text-[20px] font-black text-[#e8a524]" style="font-family:'Fraunces',serif">03</span><b class="block text-[13.5px] text-[#14432e] my-[6px]">Classes begin</b><span class="text-[12.5px] text-[#6d6f63] leading-[1.5] block">Monday 21 Sept 2026. Bring your curiosity — we handle the rest.</span></div>
          </div>
          <button class="font-extrabold text-[14px] tracking-[.08em] uppercase cursor-pointer px-7 py-[14px] rounded-[10px] bg-[#14432e] text-white shadow-[0_8px_18px_rgba(20,67,46,.3)] transition-all hover:bg-[#1d5a3f] hover:-translate-y-[3px] mr-2" @click="window.print()">🖨 Print receipt</button>
          <button class="font-extrabold text-[14px] tracking-[.08em] uppercase cursor-pointer px-7 py-[14px] rounded-[10px] bg-transparent text-[#14432e] border-[1.8px] border-[#d9d1bc] transition-all hover:border-[#14432e] hover:bg-[#eef5ee] hover:-translate-y-[2px]" @click="resetForm">Register another applicant</button>
          <button class="font-extrabold text-[14px] tracking-[.08em] uppercase cursor-pointer px-7 py-[14px] rounded-[10px] bg-[#e8a524] text-[#1b211c] shadow-[0_8px_18px_rgba(232,165,36,.35)] transition-all hover:-translate-y-[3px] hover:brightness-105 ml-2" @click="goToDashboard">Open my dashboard →</button>
        </div>
      </main>
    </div>

    <Transition name="modal-fade">
      <div v-if="accountModalOpen" class="fixed inset-0 z-[80] flex items-center justify-center bg-[#0d3321]/70 backdrop-blur-[2px] px-4">
        <!-- prevent accidental backdrop close without payment confirmation -->
        <div class="w-full max-w-[500px] rounded-[18px] border border-[#d9d1bc] bg-[#fffdf6] p-6 shadow-[0_20px_50px_rgba(0,0,0,.25)]">
          <div class="flex items-start justify-between gap-4 mb-4">
            <div>
              <span class="font-bold text-[10px] uppercase tracking-[.2em] text-[#cf3f2b]" style="font-family:'JetBrains Mono',monospace">Account setup</span>
              <h3 class="mt-2 text-[28px] font-black text-[#14432e]" style="font-family:'Fraunces',serif">Create your account</h3>
            </div>
            <button type="button" class="w-[34px] h-[34px] rounded-full border border-[#d9d1bc] bg-white text-[#14432e] font-bold text-[18px] hover:border-[#14432e] transition" @click="closeModalWithPaymentCheck" :title="payment.status !== 'paid' ? 'Complete payment first' : 'Close'">×</button>
          </div>

          <div class="rounded-[12px] border border-dashed border-[#e8a524] bg-[#fdf3d7] p-4 text-[14px] leading-[1.7] text-[#1b211c]">
            <p class="font-bold text-[#7c5a06] mb-2">Payment successful.</p>
            <p>To complete your admission, create a new student account and confirm your details before continuing to the student portal.</p>
          </div>

          <div class="mt-5 space-y-3 text-[14px] text-[#1b211c]">
            <div class="flex items-start gap-3 rounded-[10px] bg-[#eef5ee] border border-[#cfe0d2] p-3">
              <span class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#14432e] text-[11px] font-bold text-white">1</span>
              <span>Create a new account with your email and password.</span>
            </div>
            <div class="flex items-start gap-3 rounded-[10px] bg-[#f5f1e6] border border-[#d9d1bc] p-3">
              <span class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8a524] text-[11px] font-bold text-[#0d3321]">2</span>
              <span>Confirm your personal details and selected course before you finish enrollment.</span>
            </div>
          </div>

          <div class="mt-5 space-y-3">
            <label class="block">
              <span class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Choose a password *</span>
              <input v-model="accountPw" type="password" autocomplete="new-password" placeholder="At least 6 characters"
                     class="w-full text-[15px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)]">
            </label>
            <label class="block">
              <span class="block font-bold text-[11px] uppercase tracking-[.12em] text-[#14432e] mb-[7px]" style="font-family:'JetBrains Mono',monospace">Confirm password *</span>
              <input v-model="accountPw2" type="password" autocomplete="new-password" placeholder="Repeat it"
                     class="w-full text-[15px] text-[#1b211c] bg-white border-[1.6px] border-[#d9d1bc] rounded-[9px] px-[14px] py-3 outline-none transition-all focus:border-[#1d5a3f] focus:shadow-[0_0_0_4px_rgba(29,90,63,.14)]">
            </label>
            <p v-if="accountPwMsg" class="text-[12.5px] font-bold" :class="accountPwOk ? 'text-[#0d7a45]' : 'text-[#cf3f2b]'">{{ accountPwMsg }}</p>
            <p class="text-[12px] text-[#6d6f63] leading-[1.6]">You'll sign in at <b>/login</b> with this password and your email (<b>{{ form.email || 'your email' }}</b>).</p>
          </div>

          <div class="mt-6 flex flex-col sm:flex-row gap-3">
            <button type="button" class="flex-1 rounded-[10px] px-4 py-3 text-[13px] font-extrabold uppercase tracking-[.08em] text-white shadow-[0_8px_18px_rgba(20,67,46,.22)] transition" 
                    :class="payment.status === 'paid' ? 'bg-[#14432e] hover:bg-[#1d5a3f] cursor-pointer' : 'bg-[#9f9a8a] opacity-60 cursor-not-allowed'"
                    :disabled="payment.status !== 'paid'" 
                    @click="createStudentAccount" 
                    :title="payment.status !== 'paid' ? 'Payment must be confirmed first' : 'Create your student account'">
              Create account
            </button>
            <button type="button" class="flex-1 rounded-[10px] border border-[#d9d1bc] bg-white px-4 py-3 text-[13px] font-extrabold uppercase tracking-[.08em] text-[#14432e] transition hover:border-[#14432e] hover:bg-[#eef5ee]" @click="closeModalWithPaymentCheck">
              Confirm details
            </button>
          </div>

          <!-- security notice: payment verification -->
          <div v-if="payment.status === 'paid'" class="mt-4 text-[11px] text-[#6d6f63] text-center border-t border-[#e0dcd0] pt-3">
            ✓ Payment verified · Ref: <b class="font-mono text-[#14432e]">{{ payment.ref }}</b>
          </div>
        </div>
      </div>
    </Transition>

    <!-- mobile bottom nav -->
    <div class="fixed bottom-0 left-0 right-0 z-50 flex gap-[10px] px-4 pt-3 border-t border-[#d9d1bc] shadow-[0_-4px_20px_rgba(0,0,0,.06)] md:hidden"
         style="background:rgba(255,253,246,.98);backdrop-filter:blur(20px);padding-bottom:calc(12px + env(safe-area-inset-bottom,0px))">
      <button type="button" class="w-[52px] shrink-0 font-extrabold text-[13px] uppercase cursor-pointer px-4 py-[14px] rounded-[10px] bg-transparent text-[#14432e] border-[1.8px] border-[#d9d1bc] transition-all hover:border-[#14432e] hover:bg-[#eef5ee] flex items-center justify-center"
              :class="current === 0 ? 'pointer-events-none opacity-0' : ''" @click="go(current-1)">←</button>
      <button v-if="current < 3" type="button" class="flex-1 font-extrabold text-[13px] uppercase cursor-pointer px-4 py-[14px] rounded-[10px] bg-[#14432e] text-white shadow-[0_8px_18px_rgba(20,67,46,.3)] transition-all hover:bg-[#1d5a3f] flex items-center justify-center gap-[6px]" @click="handleNext">Continue →</button>
      <button v-else type="button" class="flex-1 font-extrabold text-[13px] uppercase cursor-pointer px-4 py-[14px] rounded-[10px] bg-[#e8a524] text-[#0d3321] shadow-[0_8px_18px_rgba(232,165,36,.4)] transition-all hover:brightness-[1.07] flex items-center justify-center gap-[6px]" @click="handleSubmit">🎓 Complete</button>
    </div>

    <div class="fixed bottom-[80px] right-4 left-4 z-50 text-center md:bottom-[22px] md:right-[22px] md:left-auto font-bold text-[11.5px] text-[#efe9d4] px-4 py-[10px] rounded-[100px] transition-all pointer-events-none shadow-[0_8px_20px_rgba(0,0,0,.25)]"
         style="font-family:'JetBrains Mono',monospace;background:#0d3321;transition:opacity .35s" :style="draftOn ? 'opacity:1' : 'opacity:0'">
      ● progress saved <em class="text-[#e8a524] not-italic">{{ draftTime }}</em>
    </div>

    <footer class="relative z-[2] text-center py-[26px] pb-[100px] md:pb-[26px] font-bold text-[11px] uppercase tracking-[.14em] text-[#a29d8a]" style="font-family:'JetBrains Mono',monospace">Boi Tech Academy · Learn · Build · Get Hired · © 2026 · boirsuhub@gmail.com</footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import * as api from './aiClient.js'
import AcademyNav from '../src/components/AcademyNav.vue'
import { pgSelect, pgUpsert } from '../src/lib/pgdb.js'
// The course catalog is shared: the school portal reads the same list to show a
// parent how long their child's course runs. Imported as `courses` so every use
// below (template picker + course filters) is unchanged.
import { COURSES as courses } from '../src/constants/courses.js'

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const WEEKDAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' }
const GOOD_TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']
const NO_CLASS = ''

function defaultDailyTimes_impl(givenTime) {
  const t = givenTime || '18:00'
  const out = {}
  for (const day of WEEKDAYS) out[day] = t
  return out
}
// Export the name the rest of the file uses. (There were two declarations —
// this is the canonical one; the other is an alias below.)
const registration_vue_defaultDailyTimes_ref = defaultDailyTimes_impl
const defaultDailyTimes = registration_vue_defaultDailyTimes_ref

function dailyTimesFlat(d) {
  const out = []
  for (const day of WEEKDAYS) out.push({ weekday: day, short: WEEKDAY_SHORT[day], time: d[day] || '' })
  return out
}

function classTimeSummary(dailyTimes, globalTime) {
  if (!dailyTimes || typeof dailyTimes !== 'object') {
    return globalTime ? `${globalTime} · every day` : 'not set'
  }
  const chosen = WEEKDAYS.filter(d => dailyTimes[d])
  if (!chosen.length) return 'no class days chosen'
  return WEEKDAYS.map(d => dailyTimes[d] ? `${WEEKDAY_SHORT[d]} ${dailyTimes[d]}` : `${WEEKDAY_SHORT[d]} · off`).join(', ')
}

const todayDate = ref('')
const refNum = ref('')
const current = ref(0)
const eduOpen = ref(false)
const sidebarOpen = ref(false)
const success = ref(false)
const successMsg = ref('')
const payLoading = ref(false)
const payStatus = ref({ show: false, cls: '', msg: '' })
const accountModalOpen = ref(false)
// Account-creation credentials collected inside the paid-only modal.
const accountPw = ref('')
const accountPw2 = ref('')
const accountPwMsg = ref('')
const accountPwOk = ref(false)
const creatingAccount = ref(false)

// ---- Pre-registration gate (Google signup / returning login) ----
const regGate = ref(false)
const gateMode = ref('choose')   // 'choose' | 'login' | 'verified'
const gateEmail = ref('')
const gatePw = ref('')
const gateMsg = ref('')
const gateOk = ref(false)
const gateBusy = ref(false)
const gateAccountFound = ref(false)

// Per-day class schedule chosen on the registration form. Each day the student
// activates gets its own class hour; days left deactivated have no class.
const weekDays = [
  { name: 'Monday',    label: 'Mon' },
  { name: 'Tuesday',   label: 'Tue' },
  { name: 'Wednesday', label: 'Wed' },
  { name: 'Thursday',  label: 'Thu' },
  { name: 'Friday',    label: 'Fri' },
  { name: 'Saturday',  label: 'Sat' },
  { name: 'Sunday',    label: 'Sun' },
]
// defaultDailyTimes() is defined above (line ~743) as a function and is the
// only declaration — earlier duplicate declarations were removed.

// Course search (step 3): every word typed must match the course's name,
// description, level or duration — so "data", "beginner", "16 weeks",
// "web development" all find their tracks.
const courseSearch = ref('')
const filteredCourses = computed(() => {
  const q = courseSearch.value.trim().toLowerCase()
  if (!q) return courses
  const words = q.split(/\s+/).filter(Boolean)
  return courses.filter(c => {
    const hay = `${c.name} ${c.desc} ${c.lvl} ${c.wks}`.toLowerCase()
    return words.every(w => hay.includes(w))
  })
})

// Only 6 course cards render at a time — the search box is how you reach the
// rest, so the step never grows into a long scroll. If the applicant already
// picked a course that falls outside the first 6 (e.g. they searched, chose,
// then cleared the box), it is swapped into the last slot so their selection
// stays visible.
const MAX_VISIBLE_COURSES = 6
const visibleCourses = computed(() => {
  const list = filteredCourses.value
  const top = list.slice(0, MAX_VISIBLE_COURSES)
  if (form.course && !top.some(c => c.name === form.course)) {
    const chosen = list.find(c => c.name === form.course)
    if (chosen) top[MAX_VISIBLE_COURSES - 1] = chosen
  }
  return top
})
// How many matches are currently not rendered (drives the "see the rest" hint).
const hiddenCourseCount = computed(() =>
  Math.max(0, filteredCourses.value.length - visibleCourses.value.length))

// ---- World course search (step 3) -----------------------------------------
// The 21 local tracks filter instantly above; anything else (astronomy,
// Korean, quantum computing…) queries the Flask backend at
// /api/courses/search, which searches Class Central — the aggregator that
// indexes Coursera, edX, Udemy, MIT, Stanford and 250k+ other courses.
// Debounced so typing doesn't fire a request per keystroke, and cleared as
// soon as the query is shorter than 3 chars.
const worldResults = ref([])
const worldLoading = ref(false)
const worldError = ref('')
const worldSearched = ref('')
let worldTimer = null

async function fetchWorldCourses(q) {
  worldLoading.value = true
  worldError.value = ''
  try {
    const res = await fetch(`/api/courses/search?q=${encodeURIComponent(q)}`)
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(json.error || `HTTP ${res.status}`)
    worldResults.value = json.results || []
    worldSearched.value = q
  } catch (e) {
    worldError.value = `World search failed: ${e.message}`
    worldResults.value = []
  } finally {
    worldLoading.value = false
  }
}

watch(courseSearch, (q) => {
  clearTimeout(worldTimer)
  const t = (q || '').trim()
  if (t.length < 3) {
    worldResults.value = []
    worldSearched.value = ''
    worldError.value = ''
    worldLoading.value = false
    return
  }
  worldTimer = setTimeout(() => fetchWorldCourses(t), 450)
})

const draftOn = ref(false)
const draftTime = ref('')
let draftTimer = null

// Validation problems for the current step, shown in the inline banner.
const stepProblems = ref([])

const stepLabels = ['About you', 'Education', 'Course', 'Payment']

// Pre-fill the registration form from a saved snapshot (e.g. a returning Google
// login, or a draft the browser remembered). The per-day class times must be
// rebuilt into the form's per-day shape even when the snapshot only has the old
// single `preferred_time`.
async function prefillFromSnapshot() {
  const raw = localStorage.getItem('boi_student_profile')
  if (!raw) return
  let s = null
  try { s = JSON.parse(raw) } catch { return }
  if (!s || !s.email) return
  if (s.name) form.fullname = String(s.name).trim()
  if (s.email) form.email = String(s.email).trim().toLowerCase()
  if (s.phone) form.phone = String(s.phone).trim()
  if (s.location) form.location = String(s.location).trim()
  if (s.country) form.country = String(s.country).trim()
  if (s.qualification) form.qualification = String(s.qualification).trim()
  if (s.fieldStudy) form.fieldStudy = String(s.fieldStudy).trim()
  if (s.institution) form.institution = String(s.institution).trim()
  if (s.goals && Array.isArray(s.goals)) form.goals = s.goals
  if (s.skillLevel) form.skillLevel = String(s.skillLevel).trim()
  // Keep the conditional "Field of study" panel in sync with a restored
  // qualification — @change never fires for pre-filled (snapshot) values.
  onQualChange()
  if (s.track) form.track = String(s.track).trim()
  if (s.course_name) form.course = String(s.course_name).trim()
  if (s.expectations) form.expect = String(s.expectations).trim()
  if (s.heard) form.heard = String(s.heard).trim()
  // Rebuild the per-day schedule from the snapshot. The snapshot may already carry
  // a per-day dict (new registration flow), or fall back to the legacy single time.
  const dt = s.preferred_daily_times
  if (dt && typeof dt === 'object' && !Array.isArray(dt)) {
    form.dailyTimes = { ...defaultDailyTimes('18:00'), ...dt }
    // Activate the days that had a class and set their hour.
    weekDays.forEach(d => {
      const v = dt[d.name]
      if (v && String(v).trim()) {
        form.dayActive[d.name] = '1'
        form.dayTime[d.name] = String(v).trim()
      } else {
        form.dayActive[d.name] = '0'
        form.dayTime[d.name] = '18:00'
      }
    })
    // Back-fill form.classTime so any remaining single-time UI stays consistent.
    const vals = Object.values(dt).filter(Boolean)
    if (vals.length) form.classTime = vals[0]
    return
  }
  const single = s.preferred_time || s.preferredTime || form.classTime || '18:00'
  if (single) {
    form.classTime = single
    form.dailyTimes = defaultDailyTimes(single)
    // Older snapshot — everything active at that hour.
    weekDays.forEach(d => {
      form.dayActive[d.name] = '1'
      form.dayTime[d.name] = single
    })
  }
}

const form = reactive({
  fullname: '', email: '', phone: '', location: '', country: 'Nigeria',
  gender: '', dob: '', occupation: '',
  qualification: '', fieldStudy: '', institution: '', research: '',
  skills: [], skillLevel: '', skillNotes: '',
  course: '', track: 'Weekday · evenings', classTime: '18:00',
  // Per-day schedule: which days have a class, and at what hour. Defaults to all
  // days active at 18:00 so the form "just works" until the student edits it.
  dayActive: defaultDailyTimes('1'), dayTime: defaultDailyTimes('18:00'),
  // The plain {Monday: "18:00", ...} dict used by validation, the review panel
  // summary and the enrollment payload.
  dailyTimes: defaultDailyTimes('18:00'),
  goals: [], expect: '', heard: '',
  sponsorId: '',
  paymethod: 'card', transferRef: '', declare: false
})

// Called AFTER `form` exists (a saved snapshot must never touch the form before
// it is declared). Rebuilds the per-day schedule from the stored profile.
prefillFromSnapshot()

// Keep form.dailyTimes in sync with the day-by-day grid the student edits:
// active days -> the chosen clock, deactivated days -> no class (""). This is
// what validation, the review summary and the enrollment payload all read.
watch(
  () => weekDays.map(d => `${d.name}=${form.dayActive[d.name]}|${form.dayTime[d.name]}`).join(';'),
  () => {
    weekDays.forEach(d => {
      form.dailyTimes[d.name] = form.dayActive[d.name] === '1'
        ? (form.dayTime[d.name] || form.classTime || '18:00')
        : ''
    })
  }
)

// ---- School fee (admin-controlled) --------------------------------------
// The price for the selected course is read from the course_fees table,
// which the admin edits in the school portal. ₦20,000 stays as the default
// for any course the admin has not priced yet.
// A sponsor ID with an ACTIVE fee agreement for the course overrides it —
// that's the agreed partner pricing (admin + partner), applied automatically
// when the applicant enters the partner's code.
const courseFee = ref(20000)
const baseFeeFor = ref(null)
const feeSource = ref('standard')
const sponsorDiscount = ref(false)
const formatNaira = (n) => '₦' + Number(n || 0).toLocaleString('en-NG')

async function findSponsorFee() {
  sponsorDiscount.value = false
  const code = (form.sponsorId || '').trim().toUpperCase()
  if (!code) return null
  try {
    const { data, error } = await pgSelect('partner_fees', {
      select: 'course,amount,active',
      eq: { sponsor_id: code, active: true },
    })
    if (!error && data && data.length) {
      const match = data.find((r) => r.course.trim().toLowerCase() === (form.course || '').trim().toLowerCase())
      if (match && match.amount) {
        courseFee.value = Number(match.amount)
        feeSource.value = 'partner'
        sponsorDiscount.value = true
        return match
      }
    }
  } catch (e) { /* fall through to standard pricing */ }
  return null
}

async function loadCourseFee() {
  if (!form.course) return
  try {
    const { data, error } = await pgSelect('course_fees', {
      select: 'amount',
      eq: { course: form.course },
      single: true,
    })
    let standard = 20000
    if (!error && data && data.amount) standard = Number(data.amount)
    baseFeeFor.value = { standard }
    courseFee.value = standard
    feeSource.value = 'standard'
    sponsorDiscount.value = false
  } catch (e) { /* keep the last known fee */ }
  await findSponsorFee()
}
watch([() => form.course, () => form.sponsorId], () => { if (form.course) loadCourseFee() })

const skills = [
  { value: "None yet — I'm a beginner", label: "🌱 None yet — I'm a beginner" },
  { value: 'HTML/CSS', label: 'HTML / CSS' },
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'Python', label: 'Python' },
  { value: 'Data analysis', label: 'Data analysis' },
  { value: 'UI/UX design', label: 'UI/UX design' },
  { value: 'Graphic design', label: 'Graphic design' },
  { value: 'Digital marketing', label: 'Digital marketing' },
  { value: 'MS Office / Docs', label: 'MS Office / Docs' },
  { value: 'Video editing', label: 'Video editing' },
  { value: 'Networking/IT support', label: 'Networking / IT support' }
]

const skillLevels = [
  { value: '🌱 Complete beginner' },
  { value: "🔍 I've dabbled a bit" },
  { value: '⚙️ Comfortable' },
  { value: '🚀 Advanced' }
]

// The course picker's catalog lives in src/constants/courses.js (imported as
// `courses` at the top of this file) so the school portal reads the same list.

const tracks = [
  { value: '☀️ Weekday · daytime' },
  { value: '🌆 Weekday · evenings' },
  { value: '🗓️ Weekends' }
]

// Per-day class times: each weekday (Mon–Sun) gets its own HH:MM, or "no class"
// when left blank / "none".  The dashboard timetable and the AI daily plan both
// schedule themselves around exactly these days and hours.
const classTimes = [
  { value: '09:00', label: '🌅 Morning · 9:00 AM' },
  { value: '14:00', label: '☀️ Afternoon · 2:00 PM' },
  { value: '18:00', label: '🌆 Evening · 6:00 PM' },
  { value: '20:00', label: '🌙 Night · 8:00 PM' },
  { value: '',    label: 'No class that day' }
]

// Default: every day at 18:00 (matches the legacy single `classTime` default so
// existing registrations and the API keep behaving sensibly).
// (defaultDailyTimes is the function declared at the top of the script block.)

const goals = [
  { value: '💼 Get a tech job' },
  { value: '🔁 Switch careers' },
  { value: '🌍 Freelance / remote income' },
  { value: '💡 Build my startup / product' },
  { value: '📈 Level up in current job' },
  { value: '✈️ Relocate abroad' },
  { value: '🧭 Just exploring' }
]

// Per-day class times: one clock per weekday (Mon-Sun). Days left blank / "none"
// have no class that day. The dashboard timetable and the AI daily lesson plan
// both schedule themselves around exactly these days and hours.
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const classDayOptions = [
  { value: '09:00', label: '🌅 Morning · 9:00 AM' },
  { value: '11:00', label: '🕚 Late morning · 11:00 AM' },
  { value: '14:00', label: '☀️ Afternoon · 2:00 PM' },
  { value: '16:00', label: '🌤️ Late afternoon · 4:00 PM' },
  { value: '18:00', label: '🌆 Evening · 6:00 PM' },
  { value: '20:00', label: '🌙 Night · 8:00 PM' },
  { value: 'none', label: '🚫 No class this day' }
]

function trackDefaultTime(track) {
  const t = (track || '').toLowerCase()
  if (t.includes('daytime')) return '10:00'
  if (t.includes('weekend')) return '11:00'
  return '18:00'
}

/** Convert the per-day grid back to the legacy single-clock form so any code that
 *  still reads `form.classTime` (submit payload, confirm screen etc.) keeps working.
 *  Returns the first non-"none" day's clock, or "18:00". */
function legacyClassTimeFromGrid(grid) {
  for (const day of WEEKDAY_NAMES) {
    const v = (grid && grid[day]) || ''
    if (v && v !== 'none') return v
  }
  return '18:00'
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRe = /^[\d+\-\s()]{7,}$/
const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ''
let maxReached = 0
const payment = { status: 'unpaid', ref: '' }

// ---- Gate actions ----
function closeGate(prefill = false) {
  if (prefill && gateEmail.value && !form.email.trim()) form.email = gateEmail.value
  regGate.value = false
}

function goDashboard() {
  window.location.href = '/dashboard'
}

function startGoogleSignup() {
  // Google OAuth used to be a Supabase-Auth feature. With the move to plain
  // PostgreSQL the school signs students up with email + password instead —
  // the backend already verifies and stores those (boirsu.set_student_password).
  gateMsg.value = 'Google sign-up is no longer available. Continue with your email below — registration and login use email + password.'
}

// After a Google-verified email: does it already belong to a student?
async function checkRegisteredEmail() {
  gateBusy.value = true
  const res = await api.checkGoogleEmail(gateEmail.value)
  gateBusy.value = false
  if (res && res.registered) {
    gateAccountFound.value = true
    const s = res.student || {}
    if (s.student_id) localStorage.setItem('boi_student_id', s.student_id)
    localStorage.setItem('boi_student_email', s.email || gateEmail.value.toLowerCase())
    if (s.career_path) localStorage.setItem('boi_career_path', s.career_path)
    try { localStorage.setItem('boi_student_profile', JSON.stringify(s)) } catch {}
    window.dispatchEvent(new Event('boi:profile-updated'))
    gateOk.value = true
    gateMsg.value = ''
  } else {
    gateAccountFound.value = false
  }
}

async function doGateLogin() {
  if (!gateEmail.value.trim() || !gatePw.value) {
    gateMsg.value = 'Enter your email and password.'
    return
  }
  gateBusy.value = true
  gateMsg.value = ''
  const res = await api.loginStudent({ email: gateEmail.value.trim(), password: gatePw.value })
  gateBusy.value = false
  if (res && res.success && res.student) {
    const s = res.student
    localStorage.setItem('boi_student_id', s.student_id || '')
    localStorage.setItem('boi_student_email', (s.email || gateEmail.value).toLowerCase())
    if (s.career_path) localStorage.setItem('boi_career_path', s.career_path)
    try { localStorage.setItem('boi_student_profile', JSON.stringify(s)) } catch {}
    window.dispatchEvent(new Event('boi:profile-updated'))
    goDashboard()
  } else {
    gateMsg.value = (res && res.error) || 'Login failed — check your details or start a fresh registration.'
  }
}

onMounted(() => {
  const today = new Date()
  todayDate.value = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  // NOTE: dashes only — Paystack rejects references containing "/" or other
  // special characters ("Invalid character in transaction reference").
  refNum.value = 'BOI-C12-' + Math.floor(1000 + Math.random() * 9000)

  // ---- Pre-registration gate: returning-student login ----
  // (Google/Supabase auth was retired with the PostgreSQL migration — the
  //  dead `if (supabase)` reference here used to crash the mounted hook and
  //  take the whole component's interactivity down with it.)
  if (!localStorage.getItem('boi_student_id')) regGate.value = true
})

function go(n) {
  if (n < 0 || n > 3) return
  clearFieldErrors()
  stepProblems.value = []
  current.value = n
  maxReached = Math.max(maxReached, n)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function onQualChange() {
  const higher = ['OND', 'HND', 'BSc / BA / BTech / BEng', 'PGD', 'MSc / MA / MBA', 'PhD'].indexOf(form.qualification) > -1
  eduOpen.value = higher
}

// Collects the problems in the given step as { id, msg } so the alert can name
// the exact fields AND the page can scroll-to/highlight the failing control.
// Returns [] when the step is valid.
function stepErrors(i) {
  const errs = []
  if (i === 0) {
    if (!form.fullname.trim()) errs.push({ id: 'f-fullname', msg: 'Full name' })
    if (!form.email.trim()) errs.push({ id: 'f-email', msg: 'Email address' })
    else if (!emailRe.test(form.email)) errs.push({ id: 'f-email', msg: 'Email address (looks invalid — use a format like you@example.com)' })
    if (!form.phone.trim()) errs.push({ id: 'f-phone', msg: 'Phone / WhatsApp' })
    else if (!phoneRe.test(form.phone)) errs.push({ id: 'f-phone', msg: 'Phone / WhatsApp (digits, spaces, + - ( ) only — e.g. 0803 555 0192)' })
    if (!form.location.trim()) errs.push({ id: 'f-location', msg: 'City & state' })
    if (!form.country.trim()) errs.push({ id: 'f-country', msg: 'Country' })
  }
  if (i === 1) {
    if (!form.qualification) errs.push({ id: 'f-qualification', msg: 'Highest qualification (the dropdown at the top of this step)' })
    if (eduOpen.value && !form.fieldStudy.trim()) errs.push({ id: 'f-fieldstudy', msg: 'Field of study' })
    if (!form.skillLevel) errs.push({ id: 'f-skilllevel', msg: 'Tech skill rating (pick one of the pills)' })
  }
  if (i === 2) {
    if (!form.course) errs.push({ id: 'f-course', msg: 'Course selection (tap a course card)' })
    if (!form.expect.trim()) errs.push({ id: 'f-expect', msg: 'What are you looking forward to from Boi Tech Academy?' })
    // At least one day of the week must have a class time selected.
    if (!form.dailyTimes || typeof form.dailyTimes !== 'object' ||
        !WEEKDAYS.some(d => form.dailyTimes[d] && String(form.dailyTimes[d]).trim())) {
      errs.push({ id: 'f-days', msg: 'Class days & times (at least one day must be ticked ON with a class hour)' })
    }
  }
  return errs
}

// Keeps validateStep() working for existing callers.
function validateStep(i) {
  return stepErrors(i).length === 0
}

function clearFieldErrors() {
  document.querySelectorAll('.reg-page .reg-err').forEach(el => el.classList.remove('reg-err'))
}

// Outline every failing control in red and scroll the first one into view so
// the applicant can SEE what is blocking them instead of guessing.
function flagFieldErrors(errs) {
  clearFieldErrors()
  errs.forEach(e => {
    const el = document.getElementById(e.id)
    if (el) el.classList.add('reg-err')
  })
  const first = errs.map(e => document.getElementById(e.id)).find(Boolean)
  if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function handleNext() {
  try {
    const errs = stepErrors(current.value)
    if (!errs.length) {
      stepProblems.value = []
      clearFieldErrors()
      go(current.value + 1)
      return
    }
    // Never silent: the inline banner names every missing field, the fields
    // themselves get a red outline, and the first one scrolls into view.
    stepProblems.value = errs
    nextTick(() => flagFieldErrors(errs))
  } catch (e) {
    // A bug must never look like a dead button — surface it on the page.
    console.error('Continue failed:', e)
    stepProblems.value = [{ id: '', msg: 'Unexpected error: ' + (e && e.message ? e.message : e) }]
  }
}

// Sidebar / progress steps navigate freely (original behaviour) — validation
// runs on the Continue button only, where it names the exact missing fields.

function slugFromCourse(courseName) {
  const map = {
    'frontend web development': 'frontend-developer',
    'backend & apis': 'backend-developer',
    'full-stack web development': 'backend-developer',
    'mobile app development': 'mobile-developer',
    'ui/ux product design': 'ui-ux-designer',
    'data analysis': 'data-scientist',
    'data science & ai': 'data-scientist',
    'cloud computing & devops': 'backend-developer',
    'cybersecurity': 'cybersecurity',
    'ai prompt engineering': 'data-scientist',
    'product management': 'ui-ux-designer',
    'graphic design & branding': 'graphic-design-branding',
    'seo & content writing': 'seo-content-writing',
    'digital marketing': 'seo-content-writing',
    'video editing & content creation': 'seo-content-writing',
    'motion graphics & animation': 'graphic-design-branding',
    'no-code / low-code apps': 'frontend-developer',
    'game development': 'backend-developer',
    'software testing / qa': 'backend-developer',
    'blockchain & web3': 'backend-developer',
    'virtual assistant & tech admin': 'seo-content-writing'
  }
  const normalized = (courseName || '').toLowerCase().trim()
  return map[normalized] || normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'frontend-developer'
}

async function saveRegistrationToDb() {
  const studentId = `STU-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const profile = {
    student_id: studentId,
    name: form.fullname.trim(),
    phone: form.phone.trim(),
    email: form.email.trim().toLowerCase(),
    career_path: slugFromCourse(form.course),
    experience_level: form.skillLevel || 'beginner',
    intake_month: new Date().toISOString().slice(0, 7),
    class_type: form.track || 'Weekday · evenings',
    preferred_time: form.classTime || '18:00',
    // Per-day class times the student chose at registration
    // ( {"Monday":"18:00","Tuesday":"14:00","Wednesday":"","Saturday":"09:00",...} ).
    // Days left blank / deactivated have no class.
    preferred_daily_times: dailyTimes,
    class_group: form.course || null,
    payment_status: payment.status === 'paid' ? 'paid' : 'pending',
    personal_notes: JSON.stringify({
      location: form.location,
      country: form.country,
      gender: form.gender,
      dob: form.dob,
      occupation: form.occupation,
      qualification: form.qualification,
      field_study: form.fieldStudy,
      institution: form.institution,
      research: form.research,
      skills: form.skills,
      skill_level: form.skillLevel,
      skill_notes: form.skillNotes,
      course: form.course,
      goals: form.goals,
      expectations: form.expect,
      heard: form.heard,
      transfer_ref: form.transferRef,
      paymethod: form.paymethod,
      declare: form.declare,
      ref_number: refNum.value,
      // Per-day class times the student chose at registration
      // ( {"Monday":"18:00","Tuesday":"14:00","Wednesday":"","Saturday":"09:00",...} ).
      // Days left blank / "none" have no class. Serialized as JSON on the database row.
      preferred_daily_times: form.dailyTimes ? JSON.stringify(form.dailyTimes) : null
    }, null, 2),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { error } = await pgUpsert('students', [profile], 'email')

  if (error) {
    console.error('[PostgreSQL] registration save failed:', error)
    return { ok: false, reason: error.message }
  }

  localStorage.setItem('boi_supabase_student_id', studentId)
  localStorage.setItem('boi_supabase_email', profile.email)
  return { ok: true, student_id: studentId }
}

// Enroll the applicant exactly once per session. Called from BOTH the
// paid-only "Create account" modal and the final Complete Registration
// submit, so nobody ends up with duplicate records.
let enrollmentCache = null
// Last enrollment failure reason (from aiClient.enrollStudent) — shown in the
// account modal so "Could not reach the backend" can say WHY (timeout, offline,
// or the backend's own error text) instead of always blaming api_server.py.
let enrollError = ''
async function ensureEnrollment() {
  if (enrollmentCache) return enrollmentCache

  const careerPath = slugFromCourse(form.course)
  // Build the per-day class-time dict from the grid the student filled. Days left
  // deactivated have no class (empty string); days activated get the chosen clock.
  const dailyTimes = {}
  weekDays.forEach(d => {
    if (form.dayActive[d.name] === '1') {
      dailyTimes[d.name] = form.dayTime[d.name] || form.classTime || '18:00'
    } else {
      dailyTimes[d.name] = ''
    }
  })
  const payload = {
    name: form.fullname,
    phone: form.phone,
    email: form.email,
    career_path: careerPath,
    course_name: form.course,
    experience_level: form.skillLevel || 'beginner',
    track: form.track || 'Weekday · evenings',
    // Legacy single clock — still used as the fallback hour for any day the student
    // did not specify (the backend prefers the per-day dict when present).
    preferred_time: form.classTime || '18:00',
    // Per-day class times the student chose at registration
    // ( {"Monday":"18:00","Tuesday":"14:00","Wednesday":"","Saturday":"09:00",...} ).
    // Days left blank / deactivated have no class.
    preferred_daily_times: dailyTimes,
    goals: form.goals || [],
    class_minutes: 60,
    location: form.location,
    country: form.country,
    gender: form.gender,
    dob: form.dob,
    occupation: form.occupation,
    qualification: form.qualification,
    field_study: form.fieldStudy,
    institution: form.institution,
    research: form.research,
    sponsor_id: (form.sponsorId || '').trim().toUpperCase()
  }

  const enrolled = await api.enrollStudent(payload)
  if (enrolled && enrolled.student_id) {
    localStorage.setItem('boi_student_id', enrolled.student_id)
    localStorage.setItem('boi_career_path', careerPath)
    // The backend resolves the sponsor's org name from the partners table —
    // persist it so the dashboard + roadmap can brand the portal with it.
    const sponsorOrg = String(enrolled.sponsor_org || '').trim()
    if (sponsorOrg) localStorage.setItem('boi_sponsor_org', sponsorOrg)
    else localStorage.removeItem('boi_sponsor_org')
    // Instant handoff: the student dashboard renders THESE submitted details
    // immediately, then confirms them against the boirsu record on load.
    localStorage.setItem('boi_student_profile', JSON.stringify({
      student_id: enrolled.student_id,
      name: form.fullname.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      career_path: careerPath,
      sponsor_org: String(enrolled.sponsor_org || '').trim(),
      course_name: form.course,
      experience_level: form.skillLevel || 'beginner',
      track: form.track || 'Weekday · evenings',
      preferred_time: form.classTime || '18:00',
      // Per-day class times the student chose at registration
      // ( {"Monday":"18:00","Tuesday":"14:00","Wednesday":"","Saturday":"09:00",...} ).
      // Days left blank / deactivated have no class — exactly what the student set
      // on the new days & times grid, so the timetable and AI plan follow it.
      preferred_daily_times: dailyTimes,
      location: form.location,
      country: form.country,
      cohort: 'Cohort 12',
      // The ₦20,000 here is the ADMISSION fee only — tuition is billed
      // MONTHLY inside the dashboard, so do NOT mark this profile paid.
      payment_status: 'pending_tuition'
    }))
    // Tell any open studentdashboard (same tab or another) to re-hydrate NOW
    // instead of waiting for its 4s poll — this is the real-time handoff.
    window.dispatchEvent(new Event('boi:profile-updated'))
    enrollmentCache = enrolled
    enrollError = ''
    return enrollmentCache
  }
  // Failure — do NOT cache it, so the next click retries fresh, and remember
  // the reason for the error message in the account modal.
  enrollError = (enrolled && enrolled.error) || ''
  return null
}

async function handleSubmit() {
  let ok = true
  if (!form.declare) ok = false
  if (form.paymethod === 'card') {
    if (payment.status !== 'paid') {
      payStatus.value = { show: true, cls: 'bg-[#fdf0ec] text-[#cf3f2b] border-[1.5px] border-[#f0b4a4]', msg: '⚠ Payment not completed yet — click the Paystack button above, or switch to the bank transfer option.' }
      ok = false
    }
  } else {
    if (!form.transferRef.trim()) {
      payStatus.value = { show: true, cls: 'bg-[#fdf0ec] text-[#cf3f2b] border-[1.5px] border-[#f0b4a4]', msg: '⚠ Please enter your bank transfer reference.' }
      ok = false
    } else {
      payment.status = 'transfer'
      payment.ref = form.transferRef.trim()
    }
  }
  if (!ok) return

  // Enroll once (the paid-only "Create account" modal may already have done it).
  const enrolled = await ensureEnrollment()

  // Persist the Paystack truth server-side so the dashboard never re-asks
  // for payment on the next visit.
  if (payment.status === 'paid' && enrolled && enrolled.student_id && payment.ref) {
    try { await api.verifyPaystackPayment({ studentId: enrolled.student_id, reference: payment.ref }) } catch (e) { /* non-fatal */ }
  }

  const dbResult = await saveRegistrationToDb()
  const syncMessage = dbResult.ok
    ? 'Applicant profile synced to PostgreSQL.'
    : 'Applicant profile stored locally; the database could not be reached (' + (dbResult.reason || 'unknown reason') + ').'

  successMsg.value = payment.status === 'paid'
    ? 'Payment of ' + formatNaira(courseFee.value) + ' confirmed (ref ' + payment.ref + '). ' + syncMessage
    : "Bank transfer received (ref " + payment.ref + ") — we'll confirm it within a few hours. " + syncMessage
  success.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goToDashboard() {
  // The student's submitted details are already in boi_student_profile /
  // boi_student_id, so /dashboard renders the real person immediately.
  window.location.href = '/dashboard'
}

function resetForm() {
  Object.keys(form).forEach(k => {
    if (Array.isArray(form[k])) form[k] = []
    else if (typeof form[k] === 'boolean') form[k] = false
    else form[k] = k === 'country' ? 'Nigeria' : k === 'track' ? 'Weekday · evenings' : k === 'classTime' ? '18:00' : k === 'paymethod' ? 'card' : ''
  })
  success.value = false
  current.value = 0
  payment.status = 'unpaid'
  payment.ref = ''
  payStatus.value = { show: false, cls: '', msg: '' }
  refNum.value = 'BOI-C12-' + Math.floor(1000 + Math.random() * 9000)
}

function goToAccountCreation() {
  // User clicked "Create account now" button after payment confirmed
  openAccountModal()
}

function openAccountModal() {
  // SECURITY: Only allow modal open if payment is confirmed
  if (payment.status !== 'paid') {
    console.warn('[Security] Account modal blocked: payment not confirmed. Status:', payment.status)
    payStatus.value = { show: true, cls: 'bg-[#fdf0ec] text-[#cf3f2b] border-[1.5px] border-[#f0b4a4]', msg: '⚠ Payment must be confirmed before creating an account.' }
    return
  }
  accountModalOpen.value = true
}

function closeAccountModal() {
  accountModalOpen.value = false
}

function closeModalWithPaymentCheck() {
  // SECURITY: Warn user if closing before account creation after payment
  if (payment.status === 'paid') {
    const confirm = window.confirm('You\'ve paid but haven\'t created your account yet. Close and lose access to account creation? You can re-open registration and try again.')
    if (confirm) {
      closeAccountModal()
    }
  } else {
    closeAccountModal()
  }
}

async function createStudentAccount() {
  // SECURITY: Strict payment verification before account creation
  if (payment.status !== 'paid') {
    console.error('[Security] Account creation blocked: payment not confirmed. Status:', payment.status)
    payStatus.value = { show: true, cls: 'bg-[#fdf0ec] text-[#cf3f2b] border-[1.5px] border-[#f0b4a4]', msg: '⚠ Payment verification failed. Only paid applicants can create accounts. Please complete payment first.' }
    return
  }

  // Validate the login credentials being created
  if ((accountPw.value || '').length < 6) {
    accountPwOk.value = false
    accountPwMsg.value = 'Password must be at least 6 characters.'
    return
  }
  if (accountPw.value !== accountPw2.value) {
    accountPwOk.value = false
    accountPwMsg.value = 'The two passwords do not match.'
    return
  }

  creatingAccount.value = true
  accountPwMsg.value = ''

  // Enroll now (idempotent) so we have a real backend record to attach
  // the password to — even before "Complete Registration" is pressed.
  const enrolled = await ensureEnrollment()
  if (!enrolled || !enrolled.student_id) {
    creatingAccount.value = false
    accountPwOk.value = false
    accountPwMsg.value = enrollError
      ? 'Enrollment could not be saved — ' + enrollError + '. Your details are safe; retry in a moment.'
      : 'Could not reach the backend to create the account — is api_server.py running? Your details are safe; retry in a moment.'
    return
  }

  const pwRes = await api.setStudentPassword({ studentId: enrolled.student_id, password: accountPw.value })
  creatingAccount.value = false
  if (!pwRes || !pwRes.ok) {
    accountPwOk.value = false
    accountPwMsg.value = (pwRes && pwRes.error) || 'Could not save your password — please retry.'
    return
  }

  // Mark the record paid on the server too (card payments only — bank
  // transfers are verified manually by staff).
  if (form.paymethod === 'card' && payment.ref) {
    // Admission fee only — months:0 means NO dashboard access is granted here;
    // tuition is paid monthly inside the dashboard.
    try { await api.verifyPaystackPayment({ studentId: enrolled.student_id, reference: payment.ref, months: 0, kind: 'registration' }) } catch (e) { /* non-fatal */ }
  }

  accountPwOk.value = true
  // AUTO-REDIRECT: the student record AND password are both saved at this
  // point (enrollment + setStudentPassword + payment verified), so send the
  // student straight to /login to sign in to their dashboard.
  let secs = 5
  const showCountdown = () => {
    accountPwMsg.value = secs > 0
      ? '✓ Account created with ' + form.email + '! Taking you to /login to sign in, in ' + secs + 's…'
      : '✓ Redirecting you to /login now…'
  }
  showCountdown()
  const loginCountdown = setInterval(() => {
    secs -= 1
    if (secs <= 0) {
      clearInterval(loginCountdown)
      window.location.assign('/login')
      return
    }
    showCountdown()
  }, 1000)
}

function payWithCard() {
  if (!emailRe.test(form.email)) {
    payStatus.value = { show: true, cls: 'bg-[#fdf0ec] text-[#cf3f2b] border-[1.5px] border-[#f0b4a4]', msg: '⚠ Please go back to step 1 and enter a valid email — Paystack sends your receipt there.' }
    return
  }
  if (!paystackPublicKey) {
    payStatus.value = { show: true, cls: 'bg-[#fdf0ec] text-[#cf3f2b] border-[1.5px] border-[#f0b4a4]', msg: '⚠ Paystack public key is not configured. Add VITE_PAYSTACK_PUBLIC_KEY to the frontend environment.' }
    return
  }
  if (typeof window.PaystackPop === 'undefined') {
    payStatus.value = { show: true, cls: 'bg-[#fdf0ec] text-[#cf3f2b] border-[1.5px] border-[#f0b4a4]', msg: "⚠ Card payments aren't configured yet. Add your Paystack library/public key — or choose the bank transfer option." }
    return
  }
  payLoading.value = true
  payStatus.value = { show: true, cls: 'bg-[#eef3fb] text-[#2b5aa7] border-[1.5px] border-[#b7cdf0]', msg: '⏳ Launching Paystack secure window…' }
  // Paystack only allows letters/numbers/-/_ in references — never "/" etc.
  const safeRef = ('BOI-C12-' + Date.now()).replace(/[^A-Za-z0-9_-]/g, '')
  const handler = window.PaystackPop.setup({
    key: paystackPublicKey,
    email: form.email,
    amount: courseFee.value * 100,
    currency: 'NGN',
    ref: safeRef,
    metadata: { custom_fields: [
      { display_name: 'Full name', variable_name: 'full_name', value: form.fullname },
      { display_name: 'Phone', variable_name: 'phone', value: form.phone },
      { display_name: 'Course', variable_name: 'course', value: form.course }
    ] },
    callback: function (response) {
      payment.status = 'paid'
      payment.ref = response.reference
      payStatus.value = { show: true, cls: 'bg-[#e7f7ee] text-[#0d7a45] border-[1.5px] border-[#9adcb8]', msg: '✓ Payment of ' + formatNaira(courseFee.value) + ' received · Ref: ' + response.reference + ' — you may now complete registration.' }
      payLoading.value = false
      openAccountModal()
    },
    onClose: function () {
      payLoading.value = false
      if (payment.status !== 'paid') {
        payStatus.value = { show: true, cls: 'bg-[#eef3fb] text-[#2b5aa7] border-[1.5px] border-[#b7cdf0]', msg: 'ℹ Checkout closed — you can retry anytime, or switch to bank transfer.' }
      }
    }
  })
  handler.openIframe()
}
</script>

<style>
  /* Design tokens AcademyNav expects (it normally inherits them from
     .boi-page / .boi-academy roots) — defined here on .reg-page so the nav
     renders correctly on this light parchment page too. */
  .reg-page{--gold:#e8a524;--ink:#1b211c;--ease-calm:cubic-bezier(.25,.46,.45,.94);--ease-spring:cubic-bezier(.34,1.56,.64,1)}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes bob { from { transform: translateY(0); } to { transform: translateY(-26px); } }
@keyframes tick { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes blink { 50% { opacity: 0; } }
@keyframes rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes stampIn { from { transform: rotate(-6deg) scale(2.4); opacity: 0; } to { transform: rotate(-6deg) scale(1); opacity: 1; } }

/* This block is NOT scoped — it compiles to bare selectors that would reach any
   component's markup, so everything below is namespaced under .reg-page (the
   root div) rather than styling `input` globally. */

/* iOS Safari zooms the whole viewport when a focused control's font-size is
   under 16px, which shunts the layout sideways mid-typing. The fields are
   15.5px by design on desktop, so this lifts them to 16px only below the md
   breakpoint, where the zoom rule actually applies. 16px is the threshold — it
   has to be exactly this or higher, not 15.9px. */
@media (max-width: 767px) {
  .reg-page input,
  .reg-page select,
  .reg-page textarea {
    font-size: 16px;
  }
  /* Long placeholders ("e.g. Student, NYSC, banker, designer…") get clipped
     mid-word on a narrow field; an ellipsis reads as deliberate instead. */
  .reg-page input::placeholder,
  .reg-page textarea::placeholder {
    text-overflow: ellipsis;
  }
}

/* A date input renders its own native control, which on mobile Safari sizes to
   its content rather than the box — leaving the field visibly narrower than the
   text inputs above it. This forces it back to the full column width. */
.reg-page input[type="date"] {
  min-height: 46px;
  -webkit-appearance: none;
  appearance: none;
}

/* Validation highlight: JS adds .reg-err to any required control that failed
   step validation (and removes it once fixed / on navigation), then scrolls
   the first failing field into view. Purely additive — no layout shift. */
.reg-page .reg-err {
  outline: 3px solid #cf3f2b !important;
  outline-offset: 2px;
  border-radius: 10px;
}

/* Clearance for the fixed AcademyNav (z-50, ~70px tall at the top of the page,
   ~55px once scrolled). Without this the bar floated ON TOP of the page's own
   header and the first form row, and taps meant for controls scrolled near the
   top of the viewport (e.g. the gender pills) landed on the nav overlay
   instead of the form. The nav is fixed, so it is unaffected by this padding. */
.reg-page { padding-top: 72px; }
@media (max-width: 767px) { .reg-page { padding-top: 70px; } }

/* ---- AcademyNav on this light parchment page (scoped with .reg-page — every
   other page keeps its own look). The shared bar was designed against dark
   page roots: once scrolled it went near-black while still inheriting this
   page's dark-ink text (dark-on-dark), and at rest it floated with no
   definition. A real navbar instead: solid parchment bar with a hairline
   border at rest, deep green with cream text once scrolled. ---- */
.reg-page .nav {
  background: rgba(245, 241, 230, 0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(217, 209, 188, 0.9);
  box-shadow: 0 2px 14px rgba(27, 33, 28, 0.07);
  color: #1b211c;
  padding-top: 14px;
  padding-bottom: 14px;
}
.reg-page .nav .nav-cta {
  background: #14432e;
  color: #f5f1e6;
  border-color: #14432e;
}
.reg-page .nav .nav-cta:hover {
  background: var(--gold);
  color: var(--ink);
  border-color: var(--gold);
}
.reg-page .nav.nav--scrolled {
  background: rgba(13, 51, 33, 0.97);
  border-bottom-color: rgba(232, 165, 36, 0.45);
  color: #f5f1e6;
  box-shadow: 0 6px 22px rgba(7, 20, 13, 0.28);
  padding-top: 14px;
  padding-bottom: 14px;
}
.reg-page .nav.nav--scrolled .nav-cta {
  background: transparent;
  color: #f5f1e6;
  border-color: rgba(245, 241, 230, 0.55);
}
.reg-page .nav.nav--scrolled .nav-cta:hover {
  background: var(--gold);
  color: var(--ink);
  border-color: var(--gold);
}



</style>
