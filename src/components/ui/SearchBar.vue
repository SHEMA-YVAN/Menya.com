<script setup>
import { Search, X } from 'lucide-vue-next'

defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search…' },
  size: { type: String, default: 'md' }, // 'md' | 'lg'
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="relative">
    <Search
      class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
      :class="size === 'lg' ? 'h-5 w-5' : 'h-4.5 w-4.5'"
    />
    <input
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      type="search"
      :placeholder="placeholder"
      class="w-full rounded-2xl border border-ink-200 bg-white text-ink-900 placeholder-ink-400
             transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15
             dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 dark:placeholder-ink-500"
      :class="size === 'lg' ? 'py-4 pl-12 pr-12 text-base' : 'py-3 pl-11 pr-10 text-sm'"
      aria-label="Search"
    />
    <button
      v-if="modelValue"
      @click="emit('update:modelValue', '')"
      type="button"
      class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-ink-400 transition-colors
             hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-200"
      aria-label="Clear search"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>
