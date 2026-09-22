<template>
  <div class="boi-page">
    <AcademyNav />

    <header class="phero">
      <div class="p-eyebrow">Membership</div>
      <h1 class="p-title">One card.<em>The whole floor.</em></h1>
      <p class="p-sub">
        Membership is how you belong here — the desk, the fibre, the lounge, the events,
        and the people who show up every day. Pick the tier that matches how you work.
      </p>
      <router-link :to="APPLY_URL" class="p-btn">
        Apply for membership<span class="p-btn-arrow" aria-hidden="true">→</span>
      </router-link>
    </header>

    <section class="p-section">
      <div class="p-kicker">01 — Tiers</div>
      <h2 class="p-h2">Three ways to belong</h2>
      <div class="p-grid">
        <article v-for="tier in tiers" :key="tier.name" class="p-card">
          <div class="p-card-top">
            <h3>{{ tier.name }}</h3>
            <span class="p-tag">{{ tier.term }}</span>
          </div>
          <p>{{ tier.copy }}</p>
          <ul>
            <li v-for="perk in tier.perks" :key="perk">{{ perk }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="p-section">
      <div class="p-kicker">02 — Every tier carries</div>
      <h2 class="p-h2">The part that doesn't change</h2>
      <p class="p-lede">
        Whatever tier you pick, the floor treats you the same. These are not upsells —
        they come with the card.
      </p>
      <ul class="p-specs">
        <li v-for="item in included" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section class="p-cta">
      <h2 class="p-cta-title">Start with a day pass.</h2>
      <p class="p-cta-sub">
        Spend a day on the floor before committing to anything. If it fits how you work,
        we'll move you onto a membership and credit the day.
      </p>
      <div class="p-cta-row">
        <router-link :to="APPLY_URL" class="p-btn p-btn-solid">
          Apply for membership
        </router-link>
        <router-link to="/workspace" class="p-btn">See work-space</router-link>
        <router-link to="/internet" class="p-btn">See the network</router-link>
      </div>
      <div class="p-foot">BOI Academy · Lagos Innovation Hub · Supporting African Entrepreneurship</div>
    </section>
  </div>
</template>

<script setup>
import AcademyNav from '../components/AcademyNav.vue'
import { APPLY_URL } from '../constants/academy'

const tiers = [
  {
    name: 'Floor',
    term: 'Monthly',
    copy: 'Come and go, take any open desk. For people whose week refuses to sit still.',
    perks: ['Hot desk access', 'Weekday hours', 'Lounge and events', 'Guest pass each month'],
  },
  {
    name: 'Resident',
    term: 'Monthly',
    copy: 'Your own desk, kept as you left it, with the door open around the clock.',
    perks: ['Dedicated desk and drawer', '24/7 access', 'Mail and parcel handling', 'Meeting room credits'],
  },
  {
    name: 'Studio',
    term: 'Yearly',
    copy: 'A private room for a team that has outgrown sharing a table.',
    perks: ['2–12 person office', 'Lockable and brandable', 'Priority room booking', 'Named front-desk support'],
  },
]

const included = [
  'Symmetric fibre with automatic failover',
  'Generator and inverter backed power',
  'Lounge, pods, and events floor access',
  'Front desk and guest reception',
  'Printing, scanning, and secure disposal',
  'Tea, coffee, and filtered water all day',
  'Invitations to demo nights and workshops',
  'Introductions across the BOI Academy network',
]
</script>

<style src="../assets/boi-page.css"></style>
