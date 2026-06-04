<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  seed: { type: [Number, String], default: 1 },
})

const palettes = [
  ['#1ab262', '#0e7141'],
  ['#6366f1', '#4338ca'],
  ['#f59e0b', '#d97706'],
  ['#0ea5e9', '#1d4ed8'],
]

const idx = computed(() => {
  const n = typeof props.seed === 'number' ? props.seed : String(props.seed).length
  return Math.abs(n) % palettes.length
})
const colors = computed(() => palettes[idx.value])
const uid = computed(() => `av-${props.seed}`)
const initials = computed(() =>
  props.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
)
</script>

<template>
  <svg viewBox="0 0 200 200" class="h-full w-full" role="img" :aria-label="name">
    <defs>
      <linearGradient :id="uid" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" :stop-color="colors[0]" />
        <stop offset="1" :stop-color="colors[1]" />
      </linearGradient>
    </defs>
    <rect width="200" height="200" :fill="`url(#${uid})`" />
    <g opacity="0.18" fill="#fff">
      <circle cx="40" cy="170" r="50" />
      <circle cx="170" cy="30" r="40" />
    </g>
    <text x="100" y="100" dy="0.35em" text-anchor="middle" fill="#fff" font-size="74" font-weight="800" font-family="Sora, sans-serif">
      {{ initials }}
    </text>
  </svg>
</template>
