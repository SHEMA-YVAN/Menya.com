<script setup>
defineProps({ variant: { type: String, default: 'book' } }) // 'book' | 'paper'
</script>

<template>
  <div class="card overflow-hidden">
    <div v-if="variant === 'book'" class="aspect-[16/10] w-full animate-pulse bg-ink-100 dark:bg-ink-800" />
    <div class="space-y-3 p-5">
      <div class="h-3 w-20 animate-pulse rounded-full bg-ink-100 dark:bg-ink-800" />
      <div class="h-4 w-4/5 animate-pulse rounded-full bg-ink-100 dark:bg-ink-800" />
      <div class="h-4 w-2/3 animate-pulse rounded-full bg-ink-100 dark:bg-ink-800" />
      <div class="flex gap-2 pt-2">
        <div class="h-8 flex-1 animate-pulse rounded-xl bg-ink-100 dark:bg-ink-800" />
        <div class="h-8 w-10 animate-pulse rounded-xl bg-ink-100 dark:bg-ink-800" />
      </div>
    </div>
  </div>
</template>
