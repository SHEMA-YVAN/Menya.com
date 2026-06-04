<script setup>
import { CheckCircle2, Info, X } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed bottom-5 left-1/2 z-[80] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4" role="status" aria-live="polite" aria-atomic="true">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-soft dark:border-ink-800 dark:bg-ink-900"
        >
          <CheckCircle2 v-if="t.type === 'success'" class="h-5 w-5 shrink-0 text-brand-600" />
          <Info v-else class="h-5 w-5 shrink-0 text-accent-600" />
          <p class="flex-1 text-sm font-medium text-ink-800 dark:text-ink-100">{{ t.message }}</p>
          <button @click="dismiss(t.id)" class="rounded-md p-1 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200" aria-label="Dismiss">
            <X class="h-4 w-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>
