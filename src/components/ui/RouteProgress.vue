<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Slim top progress bar that animates during route navigation
 * (like YouTube / GitHub). Gives instant feedback on every page change.
 */
const router = useRouter()
const visible = ref(false)
const progress = ref(0)
let timer = null

function start() {
  clearInterval(timer)
  visible.value = true
  progress.value = 8
  timer = setInterval(() => {
    // ease toward 90% while loading
    if (progress.value < 90) progress.value += (90 - progress.value) * 0.18
  }, 120)
}

function finish() {
  clearInterval(timer)
  progress.value = 100
  setTimeout(() => {
    visible.value = false
    progress.value = 0
  }, 280)
}

let removeBefore, removeAfter, removeError
onMounted(() => {
  removeBefore = router.beforeEach((to, from) => {
    if (to.path !== from.path) start()
    // returning nothing/true allows navigation (Vue Router 4 style)
  })
  removeAfter = router.afterEach(() => finish())
  removeError = router.onError(() => finish())
})
onBeforeUnmount(() => {
  removeBefore && removeBefore()
  removeAfter && removeAfter()
  removeError && removeError()
  clearInterval(timer)
})
</script>

<template>
  <Transition name="rp-fade">
    <div v-if="visible" class="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]" aria-hidden="true">
      <div
        class="h-full bg-gradient-to-r from-brand-500 via-brand-400 to-accent-500 shadow-[0_0_10px_rgba(26,178,98,0.6)] transition-[width] duration-200 ease-out"
        :style="{ width: progress + '%' }"
      />
    </div>
  </Transition>
</template>

<style scoped>
.rp-fade-leave-active { transition: opacity 0.3s ease; }
.rp-fade-leave-to { opacity: 0; }
</style>
