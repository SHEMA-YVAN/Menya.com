<script setup>
import { FileText, Eye, Download, Clock, ListChecks, CalendarDays, Bookmark } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useAuthModal } from '@/composables/useAuthModal'
import { useToast } from '@/composables/useToast'

const props = defineProps({ paper: { type: Object, required: true } })
defineEmits(['preview', 'download'])

const { isAuthed, isBookmarked, toggleBookmark } = useAuth()
const { openAuth } = useAuthModal()
const { notify } = useToast()

async function onBookmark() {
  if (!isAuthed.value) { openAuth('login'); return }
  const was = isBookmarked('paper', props.paper.id)
  await toggleBookmark('paper', props.paper.id)
  notify(was ? 'Removed from bookmarks.' : 'Saved to bookmarks.')
}
</script>

<template>
  <article class="card card-hover group relative flex flex-col overflow-hidden p-5">
    <div class="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent-500/5 transition-all duration-500 group-hover:scale-150" aria-hidden="true" />

    <button
      @click.stop="onBookmark"
      class="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-all hover:scale-110 hover:bg-accent-50 hover:text-accent-600 dark:hover:bg-accent-950/40"
      :aria-label="isBookmarked('paper', paper.id) ? 'Remove bookmark' : 'Save bookmark'"
      :title="isBookmarked('paper', paper.id) ? 'Saved' : 'Save'"
    >
      <Bookmark class="h-4 w-4" :class="isBookmarked('paper', paper.id) ? 'fill-accent-600 text-accent-600' : ''" />
    </button>

    <div class="relative flex items-start justify-between">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent-600 group-hover:text-white dark:bg-accent-950/50 dark:text-accent-300">
        <FileText class="h-6 w-6" />
      </div>
      <div class="mr-9 flex flex-col items-end gap-1.5">
        <span class="badge badge-accent">{{ paper.level }}</span>
        <span class="inline-flex items-center gap-1 text-xs font-semibold text-ink-400">
          <CalendarDays class="h-3.5 w-3.5" /> {{ paper.year }}
        </span>
      </div>
    </div>

    <h3 class="relative mt-4 font-display text-lg font-bold text-ink-900 transition-colors group-hover:text-accent-700 dark:text-white dark:group-hover:text-accent-300">
      {{ paper.subject }}
    </h3>
    <p class="relative mt-1 flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
      {{ paper.type }}
      <span v-if="paper.pdfUrl" class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
        <Download class="h-3 w-3" /> PDF
      </span>
    </p>

    <div class="relative mt-4 grid grid-cols-2 gap-2 text-xs">
      <div class="flex items-center gap-1.5 rounded-lg bg-ink-50 px-2.5 py-2 text-ink-600 dark:bg-ink-800/60 dark:text-ink-300">
        <Clock class="h-3.5 w-3.5 text-ink-400" /> {{ paper.duration }}
      </div>
      <div class="flex items-center gap-1.5 rounded-lg bg-ink-50 px-2.5 py-2 text-ink-600 dark:bg-ink-800/60 dark:text-ink-300">
        <ListChecks class="h-3.5 w-3.5 text-ink-400" /> {{ paper.questions }} Qs
      </div>
    </div>

    <div class="relative mt-5 flex items-center gap-2 pt-4 border-t border-ink-100 dark:border-ink-800">
      <button @click="$emit('preview', paper)" class="btn btn-outline btn-sm flex-1">
        <Eye class="h-4 w-4" /> Preview
      </button>
      <button @click="$emit('download', paper)" class="btn btn-secondary btn-sm flex-1" title="Download">
        <Download class="h-4 w-4" /> Download
      </button>
    </div>
  </article>
</template>
