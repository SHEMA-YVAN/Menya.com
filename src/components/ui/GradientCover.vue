<script setup>
import { computed } from 'vue'

/**
 * Deterministic decorative cover for books / resources.
 * Renders an inline SVG (works in sandboxed previews, no external assets).
 */
const props = defineProps({
  seed: { type: [Number, String], default: 1 },
  label: { type: String, default: '' },
  subject: { type: String, default: '' },
})

const palettes = [
  ['#1ab262', '#0e7141'],
  ['#6366f1', '#4338ca'],
  ['#f59e0b', '#d97706'],
  ['#0ea5e9', '#1d4ed8'],
  ['#ec4899', '#be185d'],
  ['#14b8a6', '#0f766e'],
  ['#8b5cf6', '#6d28d9'],
  ['#ef4444', '#b91c1c'],
]

const idx = computed(() => {
  const n = typeof props.seed === 'number' ? props.seed : String(props.seed).length
  return Math.abs(n) % palettes.length
})
const colors = computed(() => palettes[idx.value])
const uid = computed(() => `gc-${props.seed}-${idx.value}`)
</script>

<template>
  <svg viewBox="0 0 320 200" class="h-full w-full" preserveAspectRatio="xMidYMid slice" role="img" :aria-label="label">
    <defs>
      <linearGradient :id="uid" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" :stop-color="colors[0]" />
        <stop offset="1" :stop-color="colors[1]" />
      </linearGradient>
    </defs>
    <rect width="320" height="200" :fill="`url(#${uid})`" />
    <g opacity="0.16" fill="#fff">
      <circle cx="40" cy="40" r="60" />
      <circle cx="290" cy="170" r="80" />
    </g>
    <g opacity="0.12" stroke="#fff" stroke-width="1.5" fill="none">
      <path d="M0 150 Q80 110 160 150 T320 150" />
      <path d="M0 170 Q80 130 160 170 T320 170" />
    </g>
    <text v-if="subject" x="20" y="40" fill="#ffffff" opacity="0.85" font-size="13" font-weight="700" font-family="Plus Jakarta Sans, sans-serif" letter-spacing="1.5" style="text-transform: uppercase">
      {{ subject }}
    </text>
  </svg>
</template>
