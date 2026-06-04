<script setup>
import { watch, onBeforeUnmount, computed } from 'vue'
import { X, Download, FileText, ExternalLink } from 'lucide-vue-next'
import { fileUrl } from '@/lib/api'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  meta: { type: Array, default: () => [] }, // [{label, value}]
  pdfUrl: { type: String, default: '' },    // real uploaded PDF path (if any)
})
const emit = defineEmits(['close', 'download'])

// Absolute URL to the uploaded PDF (or empty if none was uploaded)
const resolvedPdf = computed(() => (props.pdfUrl ? fileUrl(props.pdfUrl) : ''))

function openInNewTab() {
  if (resolvedPdf.value) window.open(resolvedPdf.value, '_blank', 'noopener')
}

function onKey(e) {
  if (e.key === 'Escape') emit('close')
}
watch(
  () => props.open,
  (v) => {
    document.body.style.overflow = v ? 'hidden' : ''
    if (v) window.addEventListener('keydown', onKey)
    else window.removeEventListener('keydown', onKey)
  }
)
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Transition name="modal">
    <div v-if="open" class="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div class="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" @click="emit('close')" />
      <div class="relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-soft sm:rounded-3xl dark:bg-ink-900 modal-panel">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 border-b border-ink-100 p-5 dark:border-ink-800">
          <div class="flex items-center gap-3">
            <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300">
              <FileText class="h-5 w-5" />
            </span>
            <div>
              <h3 class="font-display text-lg font-bold text-ink-900 dark:text-white">{{ title }}</h3>
              <p v-if="subtitle" class="text-sm text-ink-500 dark:text-ink-400">{{ subtitle }}</p>
            </div>
          </div>
          <button @click="emit('close')" class="rounded-lg p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-200" aria-label="Close">
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- PDF viewer -->
        <div class="flex-1 overflow-y-auto p-5">
          <!-- Real uploaded PDF → embed it -->
          <div v-if="resolvedPdf" class="overflow-hidden rounded-2xl border border-ink-100 dark:border-ink-800">
            <iframe
              :src="`${resolvedPdf}#view=FitH`"
              :title="title"
              class="h-[55vh] w-full bg-ink-50 dark:bg-ink-950"
              loading="lazy"
            />
          </div>

          <!-- No PDF uploaded → friendly placeholder -->
          <div v-else class="relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-2xl border border-ink-100 bg-ink-50 dark:border-ink-800 dark:bg-ink-950/60">
            <div class="absolute inset-0 bg-grid opacity-50 dark:bg-grid-dark" aria-hidden="true" />
            <div class="relative flex flex-col items-center text-center">
              <span class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-soft dark:bg-ink-800">
                <FileText class="h-8 w-8 text-brand-600" />
              </span>
              <p class="mt-4 text-sm font-semibold text-ink-700 dark:text-ink-200">No file uploaded yet</p>
              <p class="mt-1 max-w-xs text-xs text-ink-400">
                This item has no PDF attached. Add one from the Admin Portal to enable preview &amp; download.
              </p>
            </div>
          </div>

          <div v-if="meta.length" class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div v-for="m in meta" :key="m.label" class="rounded-xl bg-ink-50 p-3 text-center dark:bg-ink-800/60">
              <p class="text-xs text-ink-400">{{ m.label }}</p>
              <p class="mt-0.5 text-sm font-bold text-ink-800 dark:text-ink-100">{{ m.value }}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2 border-t border-ink-100 p-5 dark:border-ink-800">
          <button @click="emit('close')" class="btn btn-ghost btn-md">Close</button>
          <button v-if="resolvedPdf" @click="openInNewTab" class="btn btn-outline btn-md">
            <ExternalLink class="h-4 w-4" /> Open in new tab
          </button>
          <button @click="emit('download')" class="btn btn-primary btn-md">
            <Download class="h-4 w-4" /> Download
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal-panel {
  animation: pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes pop {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
}
</style>
