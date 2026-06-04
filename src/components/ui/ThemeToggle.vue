<script setup>
import { Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    @click="toggleTheme"
    class="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200
           bg-white text-ink-600 transition-all hover:border-brand-300 hover:text-brand-600
           dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300 dark:hover:border-brand-700 dark:hover:text-brand-300"
    :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="theme === 'dark' ? 'Light mode' : 'Dark mode'"
  >
    <Transition name="theme-icon" mode="out-in">
      <Sun v-if="theme === 'dark'" key="sun" class="h-5 w-5" />
      <Moon v-else key="moon" class="h-5 w-5" />
    </Transition>
  </button>
</template>

<style scoped>
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}
.theme-icon-enter-from {
  transform: rotate(-90deg) scale(0.5);
  opacity: 0;
}
.theme-icon-leave-to {
  transform: rotate(90deg) scale(0.5);
  opacity: 0;
}
</style>
