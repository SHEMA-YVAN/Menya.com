<script setup>
import { computed } from 'vue'
import { WifiOff, RefreshCw } from 'lucide-vue-next'
import { useContentStore } from '@/composables/useContentStore'

const { online, loaded, loading, loadAll } = useContentStore()

// Only warn once the first load attempt has finished and failed.
const show = computed(() => loaded.value === false && online.value === false && !loading.value)
</script>

<template>
  <Transition name="banner">
    <div v-if="show" class="sticky top-16 z-30 border-b border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/40">
      <div class="container-page flex flex-wrap items-center justify-between gap-2 py-2.5">
        <p class="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
          <WifiOff class="h-4 w-4 shrink-0" />
          Some content can't be loaded right now. We're trying to reconnect.
        </p>
        <button @click="loadAll(true)" class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900/40">
          <RefreshCw class="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.banner-enter-active,
.banner-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.banner-enter-from,
.banner-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
