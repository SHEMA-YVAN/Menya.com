<script setup>
defineProps({
  size: { type: String, default: 'md' }, // 'sm' | 'md' | 'lg'
  label: { type: String, default: '' },
  center: { type: Boolean, default: false },
})

const sizes = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
}
</script>

<template>
  <div :class="['flex items-center gap-3', center ? 'flex-col justify-center py-16 text-center' : '']">
    <span
      :class="[
        'inline-block animate-spin rounded-full border-ink-200 border-t-brand-600 dark:border-ink-700 dark:border-t-brand-400',
        sizes[size],
      ]"
      role="status"
      aria-label="Loading"
    />
    <span v-if="label" class="text-sm font-medium text-ink-500 dark:text-ink-400">{{ label }}</span>
  </div>
</template>
