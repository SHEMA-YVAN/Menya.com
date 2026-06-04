<script setup>
import { ref } from 'vue'
import { Eye, Download, Star, FileText, Layers, Bookmark } from 'lucide-vue-next'
import GradientCover from '@/components/ui/GradientCover.vue'
import { fileUrl } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import { useAuthModal } from '@/composables/useAuthModal'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  book: { type: Object, required: true },
})
defineEmits(['view', 'download'])

const imgError = ref(false)
const { isAuthed, isBookmarked, toggleBookmark } = useAuth()
const { openAuth } = useAuthModal()
const { notify } = useToast()

async function onBookmark() {
  if (!isAuthed.value) { openAuth('login'); return }
  const was = isBookmarked('book', props.book.id)
  await toggleBookmark('book', props.book.id)
  notify(was ? 'Removed from bookmarks.' : 'Saved to bookmarks.')
}

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}
</script>

<template>
  <article class="card card-hover group flex flex-col overflow-hidden">
    <!-- Cover -->
    <div class="relative aspect-[16/10] w-full overflow-hidden">
      <div class="h-full w-full transition-transform duration-500 group-hover:scale-105">
        <img
          v-if="book.coverUrl && !imgError"
          :src="fileUrl(book.coverUrl)"
          :alt="book.title"
          class="h-full w-full object-cover"
          loading="lazy"
          @error="imgError = true"
        />
        <GradientCover v-else :seed="book.cover" :subject="book.subject" :label="book.title" />
      </div>
      <span class="badge badge-brand absolute left-3 top-3 bg-white/90 !text-brand-700 backdrop-blur dark:bg-ink-900/80">
        {{ book.level }}
      </span>
      <span
        v-if="book.pdfUrl"
        class="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-brand-600/95 px-2.5 py-1 text-[11px] font-bold text-white shadow-soft backdrop-blur"
        title="PDF available"
      >
        <Download class="h-3 w-3" /> PDF
      </span>
      <!-- Bookmark toggle -->
      <button
        @click.stop="onBookmark"
        class="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-500 shadow-soft backdrop-blur transition-all hover:scale-110 hover:text-brand-600 dark:bg-ink-900/80 dark:text-ink-300"
        :aria-label="isBookmarked('book', book.id) ? 'Remove bookmark' : 'Save bookmark'"
        :title="isBookmarked('book', book.id) ? 'Saved' : 'Save'"
      >
        <Bookmark class="h-4 w-4" :class="isBookmarked('book', book.id) ? 'fill-brand-600 text-brand-600' : ''" />
      </button>
      <button
        @click="$emit('view', book)"
        class="absolute inset-0 flex items-center justify-center bg-ink-950/0 opacity-0 transition-all duration-300 group-hover:bg-ink-950/35 group-hover:opacity-100"
        aria-label="Preview book"
      >
        <span class="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-soft">
          <Eye class="h-4 w-4" /> Preview
        </span>
      </button>
    </div>

    <!-- Body -->
    <div class="flex flex-1 flex-col p-5">
      <div class="mb-2 flex items-center gap-2 text-xs font-semibold text-ink-400">
        <span class="badge badge-ink">{{ book.subject }}</span>
        <span class="ml-auto inline-flex items-center gap-1 text-gold-500">
          <Star class="h-3.5 w-3.5 fill-current" /> {{ book.rating }}
        </span>
      </div>
      <h3 class="font-display text-base font-bold leading-snug text-ink-900 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
        {{ book.title }}
      </h3>
      <div class="mt-3 flex items-center gap-4 text-xs text-ink-500 dark:text-ink-400">
        <span class="inline-flex items-center gap-1.5"><FileText class="h-3.5 w-3.5" /> {{ book.pages }} pages</span>
        <span class="inline-flex items-center gap-1.5"><Layers class="h-3.5 w-3.5" /> {{ book.lang }}</span>
        <span class="ml-auto">{{ book.year }}</span>
      </div>

      <p v-if="book.downloads" class="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-400">
        <Download class="h-3.5 w-3.5" /> {{ formatCount(book.downloads) }} downloads
      </p>

      <div class="mt-4 flex items-center gap-2 pt-4 border-t border-ink-100 dark:border-ink-800">
        <button @click="$emit('view', book)" class="btn btn-outline btn-sm flex-1">
          <Eye class="h-4 w-4" /> View
        </button>
        <button
          @click="$emit('download', book)"
          class="btn btn-primary btn-sm"
          title="Download PDF"
          aria-label="Download PDF"
        >
          <Download class="h-4 w-4" />
          <span class="hidden sm:inline">Download</span>
        </button>
      </div>
    </div>
  </article>
</template>
