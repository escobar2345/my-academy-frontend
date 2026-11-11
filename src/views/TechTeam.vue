<template>
  <div
    ref="root"
    class="lip-landing relative min-h-screen text-slate-300 antialiased overflow-x-hidden selection:bg-brand-500 selection:text-white"
  >
    <!-- Floating background orbs -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] animate-float"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-float-delayed"></div>
    </div>

    <!-- Site nav (shared across the Academy pages) -->
    <AcademyNav />

    <!-- Hero -->
    <section class="relative z-10 pt-32 md:pt-40 pb-16 md:pb-20 px-4 sm:px-6">
      <div class="max-w-5xl mx-auto text-center">
        <div class="reveal inline-flex items-center justify-center gap-2 max-w-full px-4 py-2 rounded-full glass border border-brand-500/20 bg-brand-500/5 text-brand-300 text-xs sm:text-sm font-medium text-center mb-6 md:mb-8">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          $100 off for the first 8,460 customers (14 left)
        </div>

        <h1 class="reveal text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6" style="transition-delay: 100ms">
          Launch your <span class="text-gradient">business idea</span><br />
          in days, not weeks.
        </h1>

        <p class="reveal text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed" style="transition-delay: 200ms">
          The ultimate platform with everything you need to build your online business, process payments, and make your first $ online fast.
        </p>

        <div class="reveal flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-4 mb-10 md:mb-12" style="transition-delay: 300ms">
          <a
            href="#pricing"
            class="btn-shimmer w-full sm:w-auto justify-center px-8 py-4 rounded-full text-white font-bold text-base sm:text-lg shadow-[0_0_40px_-10px_rgba(244,63,94,0.5)] hover:shadow-[0_0_60px_-10px_rgba(244,63,94,0.7)] hover:scale-105 transition-all duration-300 flex items-center gap-2"
            @click.prevent="scrollToSection('pricing')"
          >
            Launch with Lip now
            <Zap class="w-5 h-5 fill-white" />
          </a>
          <div class="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-400">
            <div class="flex -space-x-2">
              <img
                v-for="n in 3"
                :key="n"
                :src="`https://i.pravatar.cc/100?img=${n}`"
                class="w-8 h-8 rounded-full border-2 border-slate-950"
                alt="User"
              />
            </div>
            <span><strong class="text-white">8,446</strong> creators launch faster</span>
          </div>
        </div>

        <!-- Social proof logos -->
        <div class="reveal flex flex-wrap justify-center items-center gap-x-6 gap-y-4 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500" style="transition-delay: 400ms">
          <span v-for="logo in socialProof" :key="logo.label" class="text-base sm:text-xl font-bold text-white flex items-center gap-2">
            <component :is="logo.icon" class="fill-white" /> {{ logo.label }}
          </span>
        </div>
      </div>
    </section>

    <!-- Problem vs Solution -->
    <section class="relative z-10 py-12 md:py-20 px-4 sm:px-6">
      <div class="max-w-6xl mx-auto">
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Problem -->
          <div class="reveal glass-card rounded-3xl p-6 sm:p-8 md:p-10 border-red-500/10">
            <h3 class="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <XCircle class="text-red-400" /> The Hard Way
            </h3>
            <ul class="space-y-4 text-slate-400">
              <li v-for="item in hardWay" :key="item.text" class="flex items-center gap-3">
                <span class="text-red-400 font-mono">{{ item.time }}</span> {{ item.text }}
              </li>
            </ul>
            <div class="mt-8 pt-6 border-t border-white/10 flex flex-wrap justify-between items-center gap-2">
              <span class="text-slate-400">Total</span>
              <span class="text-xl sm:text-2xl font-bold text-red-400">22+ hours of headaches</span>
            </div>
          </div>

          <!-- Solution -->
          <div class="reveal glass-card rounded-3xl p-6 sm:p-8 md:p-10 border-brand-500/30 bg-brand-500/5" style="transition-delay: 100ms">
            <h3 class="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <CheckCircle2 class="text-brand-400" /> The Lip Academy Way
            </h3>
            <div class="space-y-4">
              <div v-for="item in ourWay" :key="item.title" class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                  <component :is="item.icon" />
                </div>
                <div>
                  <h4 class="text-white font-semibold">{{ item.title }}</h4>
                  <p class="text-sm text-slate-400">{{ item.text }}</p>
                </div>
              </div>
            </div>
            <div class="mt-8 pt-6 border-t border-white/10 flex flex-wrap justify-between items-center gap-2">
              <span class="text-slate-400">Total</span>
              <span class="text-xl sm:text-2xl font-bold text-brand-400">Launch in 1 afternoon</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features bento grid -->
    <section id="features" class="relative z-10 py-16 md:py-24 px-4 sm:px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-10 md:mb-16 reveal">
          <h2 class="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4">Supercharge your business instantly</h2>
          <p class="text-slate-400 max-w-2xl mx-auto">Spend your time building your curriculum and business, not integrating APIs.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="(f, i) in features"
            :key="f.title"
            class="reveal glass-card rounded-3xl p-6 sm:p-8 group"
            :class="f.wide ? 'md:col-span-2' : ''"
            :style="i ? { transitionDelay: `${i * 100}ms` } : null"
          >
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" :class="f.tint">
              <component :is="f.icon" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold text-white mb-2">{{ f.title }}</h3>
            <p class="text-slate-400">{{ f.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Founder story -->
    <section class="relative z-10 py-16 md:py-24 px-4 sm:px-6 border-y border-white/5 bg-white/[0.01]">
      <div class="max-w-4xl mx-auto reveal">
        <div class="flex flex-col md:flex-row gap-8 items-start">
          <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-3xl shrink-0 shadow-2xl shadow-brand-500/20">
            👋
          </div>
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-white mb-4">Hey, it's the founder of Lip Academy</h2>
            <p class="text-slate-400 text-base sm:text-lg leading-relaxed mb-6">
              I used to spend weeks setting up DNS records, listening to Stripe webhooks, and designing pricing sections for every new project. It was killing my momentum.
            </p>
            <p class="text-slate-400 text-base sm:text-lg leading-relaxed mb-6">
              So I built <strong class="text-white">Lip Academy</strong> for 3 reasons:
            </p>
            <ul class="space-y-3 mb-8">
              <li v-for="reason in reasons" :key="reason" class="flex items-center gap-3 text-slate-300">
                <Check class="w-5 h-5 text-brand-400" /> {{ reason }}
              </li>
            </ul>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
              <span class="flex items-center gap-1"><XIcon class="w-4 h-4" /> 135k+ followers</span>
              <span class="flex items-center gap-1"><Award class="w-4 h-4" /> Maker of the Year</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="relative z-10 py-16 md:py-24 px-4 sm:px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-10 md:mb-16 reveal">
          <h2 class="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4">Save hours, ship fast, get profitable</h2>
          <p class="text-brand-300 font-medium">Pay once. Build unlimited projects. Lifetime updates.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 items-start">
          <a
            v-for="(plan, i) in plans"
            :key="plan.name"
            :href="whatsappLink(plan)"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`Get ${plan.name} on WhatsApp`"
            class="reveal glass-card rounded-3xl p-6 sm:p-8 flex flex-col cursor-pointer"
            :class="plan.popular ? 'relative border-brand-500/50 bg-brand-500/5 md:scale-105 shadow-2xl shadow-brand-500/10 mt-4 md:mt-0' : ''"
            :style="i ? { transitionDelay: `${i * 100}ms` } : null"
          >
            <div
              v-if="plan.popular"
              class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-500 text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap"
            >
              Most Popular
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">{{ plan.name }}</h3>
            <div class="flex items-baseline gap-2 mb-6">
              <span class="text-4xl font-bold text-white">{{ plan.price }}</span>
              <span class="text-slate-500 line-through">{{ plan.was }}</span>
            </div>
            <ul class="space-y-4 mb-8 flex-1">
              <li v-for="(feat, j) in plan.features" :key="feat" class="flex items-start gap-3 text-sm text-slate-300">
                <Check class="w-4 h-4 mt-0.5 shrink-0 text-brand-400" />
                <strong v-if="plan.boldFirst && j === 0">{{ feat }}</strong>
                <template v-else>{{ feat }}</template>
              </li>
            </ul>
            <span
              class="block w-full py-3 rounded-xl font-semibold text-center transition-colors"
              :class="plan.popular
                ? 'btn-shimmer text-white font-bold shadow-lg hover:shadow-brand-500/25'
                : 'border border-white/10 text-white hover:bg-white/5'"
            >
              Get {{ plan.name }}
            </span>
          </a>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section id="testimonials" class="relative z-10 py-16 md:py-24 px-4 sm:px-6 border-t border-white/5">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-10 md:mb-16 reveal">
          8,446 creators built their dream with Lip Academy
        </h2>

        <div class="grid md:grid-cols-3 gap-6">
          <div
            v-for="(t, i) in testimonials"
            :key="t.name"
            class="reveal glass-card rounded-2xl p-6"
            :style="i ? { transitionDelay: `${i * 100}ms` } : null"
          >
            <div class="flex items-center gap-3 mb-4">
              <img :src="`https://i.pravatar.cc/100?img=${t.img}`" class="w-10 h-10 rounded-full" alt="User" />
              <div>
                <div class="text-white font-semibold text-sm">{{ t.name }}</div>
                <div class="text-slate-500 text-xs">{{ t.role }}</div>
              </div>
            </div>
            <p class="text-slate-300 text-sm leading-relaxed">"{{ t.quote }}"</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="relative z-10 py-16 md:py-24 px-4 sm:px-6">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-8 md:mb-12 reveal">Frequently Asked Questions</h2>

        <div class="space-y-4 reveal">
          <div v-for="(item, i) in faqs" :key="item.q" class="glass-card rounded-2xl overflow-hidden">
            <button
              type="button"
              class="w-full px-4 sm:px-6 py-4 sm:py-5 gap-4 text-left flex justify-between items-center text-white font-semibold hover:bg-white/5 transition-colors"
              :aria-expanded="openFaq === i"
              @click="toggleFaq(i)"
            >
              {{ item.q }}
              <ChevronDown
                class="w-5 h-5 shrink-0 transition-transform duration-300"
                :style="{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }"
              />
            </button>
            <div v-show="openFaq === i" class="px-4 sm:px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
              <p v-for="(para, k) in item.a" :key="k" :class="k ? 'mt-4' : ''">{{ para }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="relative z-10 py-20 md:py-32 px-4 sm:px-6 text-center">
      <div class="absolute inset-0 bg-gradient-to-t from-brand-900/20 to-transparent pointer-events-none"></div>
      <div class="max-w-3xl mx-auto reveal">
        <h2 class="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6">Boost your app, launch, earn.</h2>
        <p class="text-base sm:text-xl text-slate-400 mb-8 md:mb-10">Don't waste time on Stripe subscriptions or designing a pricing section...</p>
        <a
          href="#pricing"
          class="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 rounded-full btn-shimmer text-white font-bold text-lg sm:text-xl shadow-[0_0_50px_-10px_rgba(244,63,94,0.6)] hover:scale-105 transition-transform"
          @click.prevent="scrollToSection('pricing')"
        >
          Get Lip Academy Now
          <ArrowRight class="w-6 h-6" />
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative z-10 border-t border-white/5 py-10 md:py-12 px-4 sm:px-6 text-center text-slate-500 text-sm">
      <p>© {{ year }} Lip Academy. All rights reserved. Built to ship fast.</p>
    </footer>
  </div>
</template>

<script setup>
import { h, ref, onMounted, onBeforeUnmount } from 'vue'
import {
  ArrowRight, Award, Check, CheckCircle2, ChevronDown, Code2, CreditCard,
  Hexagon, Mail, MessageCircle, Palette, Search, Sparkles, Triangle, Users,
  XCircle, Zap,
} from 'lucide-vue-next'
import AcademyNav from '../components/AcademyNav.vue'

/* lucide-vue-next no longer ships brand logos, so the X logo is a tiny
   functional component (class/size fall through like a normal icon). */
const XIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': 'true' }, [
    h('path', {
      d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    }),
  ])

const year = new Date().getFullYear()

/* ---------------- Content ---------------- */
const socialProof = [
  { icon: Triangle, label: 'Product Hunt' },
  { icon: Hexagon, label: 'Hacker News' },
  { icon: XIcon, label: 'X.com' },
  { icon: MessageCircle, label: 'Reddit' },
]

const hardWay = [
  { time: '4 hrs', text: 'designing a landing page' },
  { time: '6 hrs', text: 'to handle Stripe webhooks' },
  { time: '3 hrs', text: 'for DNS records & SEO tags' },
  { time: '2 hrs', text: 'applying for Google Oauth' },
  { time: '∞ hrs', text: 'overthinking...' },
]

const ourWay = [
  { icon: Mail, title: 'Emails & DNS', text: 'Pre-configured DKIM, DMARC, SPF to avoid spam folders.' },
  { icon: CreditCard, title: 'Payments', text: 'Stripe & Lemon Squeezy webhooks handled out of the box.' },
  { icon: Users, title: 'Auth & Database', text: 'Google OAuth, Magic Links, MongoDB/Supabase ready.' },
]

const features = [
  {
    icon: Code2, tint: 'bg-blue-500/10 text-blue-400', wide: true,
    title: 'Production-Ready Codebase',
    text: 'NextJS boilerplate with App Router, Typescript, and Tailwind CSS. Copy, paste, and customize sections like pricing, FAQs, and blogs in seconds.',
  },
  {
    icon: Search, tint: 'bg-green-500/10 text-green-400', wide: false,
    title: 'SEO Optimized',
    text: 'Pre-configured meta tags, sitemap, and OpenGraph images to rank higher from day one.',
  },
  {
    icon: Sparkles, tint: 'bg-purple-500/10 text-purple-400', wide: false,
    title: 'AI-Ready',
    text: 'Built to work perfectly with Cursor, Copilot, and other AI editors. Real context for instant feature generation.',
  },
  {
    icon: Palette, tint: 'bg-brand-500/10 text-brand-400', wide: true,
    title: 'Beautiful UI Components',
    text: 'Dozens of pre-built, animated components: modals, popovers, pricing tables, and testimonial grids. Fully responsive and accessible.',
  },
]

const reasons = [
  'Save time and focus on what matters: building a business',
  'Avoid headaches like emails ending in spam',
  'Get profitable fast—the more you ship, the more you earn',
]

const plans = [
  {
    name: 'Starter', price: '$199', was: '$299', popular: false, boldFirst: false,
    features: ['NextJS Boilerplate', 'SEO & Blog Setup', 'Mailgun / Resend Emails', 'Stripe / Lemon Squeezy', 'Discord Community Access'],
  },
  {
    name: 'All-in', price: '$249', was: '$349', popular: true, boldFirst: true,
    features: ['Everything in Starter', '$1,210 worth of discounts', 'Leaderboard Access', 'Priority Support', 'Lifetime Updates'],
  },
  {
    name: 'Bundle', price: '$299', was: '$648', popular: false, boldFirst: true,
    features: ['Everything in All-in', '+ CodeFast Course ($299 value)', '12 hours of video content', 'Build a SaaS from 0 to 1'],
  },
]

const testimonials = [
  {
    img: 11, name: 'Jack F.', role: 'Built an AI tool',
    quote: 'I shipped in 6 days as a noob coder... This is awesome. I made more in 6 days than the minimum wage here. I wanna cry 🥲',
  },
  {
    img: 12, name: 'Mateus De Nardo', role: 'Built a SaaS',
    quote: "I was able to launch my project in just one day! I made $170 already. Best investment I've made since I started indie hacking.",
  },
  {
    img: 13, name: 'Álex Martinez', role: 'SaaS Founder',
    quote: "Everything you need to ship your SaaS ASAP. Even though it's Christmas, I'm shipping anyway! Lip Academy was my best purchase in 2023! 🚀",
  },
]

const faqs = [
  {
    q: 'What do I get exactly?',
    a: [
      '1/ The NextJS starter with all the boilerplate code you need to run an online business: a payment system, a database, login, a blog, UI components, and much more.',
      '2/ The documentation helps you set up your app from scratch, write copy that sells, and ship fast.',
      '3/ With the Premium plan, access to our Discord with 5,000+ makers, the Leaderboards, and $1,210 worth of unique discounts.',
    ],
  },
  {
    q: 'Does Lip Academy work with AI (Cursor, Copilot)?',
    a: [
      "It does not only work with AI, it's built for it. Lip Academy comes with a complete, well-structured codebase—which gives your AI code editor real context to build full features in seconds using your naming conventions and best practices.",
    ],
  },
  {
    q: 'Can I get a refund?',
    a: [
      "After you've got access to the repo, Lip Academy is yours forever, so it can't be refunded. But rest assured, users ship startups in 7 days on average and make their first $ online in record time.",
    ],
  },
]

/* ---------------- WhatsApp ---------------- */
// 08076789825 in international format (Nigeria +234, leading 0 dropped).
const WHATSAPP_NUMBER = '2348076789825'
const whatsappLink = (plan) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi, I'd like to get the ${plan.name} plan (${plan.price}).`,
  )}`

/* ---------------- Behaviour ---------------- */
const root = ref(null)
const openFaq = ref(null)
const toggleFaq = (i) => { openFaq.value = openFaq.value === i ? null : i }

// In-page anchors without touching the router/hash.
const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Scroll-reveal: add .active the first time an element enters the viewport.
let observer = null
onMounted(() => {
  const els = root.value ? root.value.querySelectorAll('.reveal') : []
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('active'))
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 },
  )
  els.forEach((el) => observer.observe(el))
})
onBeforeUnmount(() => observer && observer.disconnect())
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
</style>

<style scoped>
/* The shared AcademyNav reads these tokens from an ancestor (.boi-page /
   .boi-academy normally provide them), so this page supplies the same set. */
.lip-landing {
  --ink: #0E1C14;
  --gold: #D2A63B;
  --paper: #F6F4EC;
  --paper-dim: rgba(246, 244, 236, 0.78);
  --ease-calm: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: #020617;
  background-image:
    radial-gradient(at 0% 0%, rgba(244, 63, 94, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(236, 72, 153, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(244, 63, 94, 0.1) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(236, 72, 153, 0.1) 0px, transparent 50%);
}
/* Preflight/global rules shouldn't recolour links inside the page. */
.lip-landing a { color: inherit; text-decoration: none; }

/* Scroll reveal */
.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal.active {
  opacity: 1;
  transform: translateY(0);
}

/* Gradient headline text */
.text-gradient {
  background: linear-gradient(135deg, #ffffff 0%, #fda4af 50%, #f43f5e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glass surfaces */
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.glass-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
@media (hover: hover) {
  .glass-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(244, 63, 94, 0.4);
    transform: translateY(-8px);
    box-shadow: 0 25px 50px -12px rgba(244, 63, 94, 0.15);
  }
}

/* Shimmer button */
.btn-shimmer {
  background: linear-gradient(90deg, #e11d48 0%, #f43f5e 50%, #e11d48 100%);
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .reveal { transition: none; }
  .btn-shimmer { animation: none; }
}
</style>
