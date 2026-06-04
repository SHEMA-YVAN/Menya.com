<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  to: { type: Number, required: true },
  suffix: { type: String, default: '' },
  duration: { type: Number, default: 1600 },
})

const display = ref(0)
const el = ref(null)
let started = false
let observer = null

function format(n) {
  return Math.round(n).toLocaleString('en-US')
}

function run() {
  if (started) return
  started = true
  const start = performance.now()
  const step = (now) => {
    const p = Math.min((now - start) / props.duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    display.value = eased * props.to
    if (p < 1) requestAnimationFrame(step)
    else display.value = props.to
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  if (!('IntersectionObserver' in window)) return run()
  observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && run()),
    { threshold: 0.4 }
  )
  if (el.value) observer.observe(el.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <span ref="el">{{ format(display) }}{{ suffix }}</span>
</template>
