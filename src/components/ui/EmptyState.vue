<script setup>
import { SearchX } from 'lucide-vue-next'
defineProps({
  title: { type: String, default: 'No results found' },
  message: { type: String, default: 'Try adjusting your search or filters to find what you\u2019re looking for.' },
})
defineEmits(['reset'])
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-200 bg-ink-50/40 px-6 py-20 text-center dark:border-ink-700 dark:bg-ink-900/40">
    <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-soft dark:bg-ink-800">
      <SearchX class="h-8 w-8 text-ink-400" />
    </div>
    <h3 class="text-lg font-bold text-ink-800 dark:text-ink-100">{{ title }}</h3>
    <p class="mt-2 max-w-sm text-sm text-ink-500 dark:text-ink-400">{{ message }}</p>
    <button @click="$emit('reset')" class="btn btn-outline btn-sm mt-6">Clear filters</button>
  </div>
</template>
