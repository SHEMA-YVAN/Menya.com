<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ArrowUp } from 'lucide-vue-next'

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > 600
}
function toTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <Transition name="btt">
    <button
      v-if="visible"
      @click="toTop"
      class="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-glow transition-all hover:bg-brand-700 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:ring-offset-ink-950"
      aria-label="Back to top"
      title="Back to top"
    >
      <ArrowUp class="h-5 w-5" />
    </button>
  </Transition>
</template>

<style scoped>
.btt-enter-active,
.btt-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.btt-enter-from,
.btt-leave-to { opacity: 0; transform: translateY(16px) scale(0.8); }
</style>
