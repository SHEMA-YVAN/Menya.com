<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { BookOpen, LayoutGrid } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import FilterPanel from '@/components/ui/FilterPanel.vue'
import BookCard from '@/components/cards/BookCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import OfflineState from '@/components/ui/OfflineState.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import PreviewModal from '@/components/ui/PreviewModal.vue'
import ToastHost from '@/components/ui/ToastHost.vue'
import { useResourceFilter } from '@/composables/useResourceFilter'
import { useToast } from '@/composables/useToast'
import { useContentStore } from '@/composables/useContentStore'
import { LEVELS, SUBJECTS } from '@/data/constants'

import { useMeta } from '@/composables/useMeta'
import { useI18n } from '@/composables/useI18n'
import { useDownload } from '@/composables/useDownload'
const { t } = useI18n()
const { download } = useDownload()

useMeta({ title: 'Curriculum Books', description: 'Browse and download curriculum-aligned textbooks for P1–S6 across every subject — free on MENYA.' })

const route = useRoute()
const { notify } = useToast()
const { books, loading: storeLoading, online, loadAll } = useContentStore()
const loading = ref(true)

const { query, selected, results, activeFilterCount, setFacet, reset } = useResourceFilter(books, {
  searchKeys: ['title', 'subject', 'level', 'author'],
  facets: { level: 'level', subject: 'subject', lang: 'lang' },
})

// Filter config for the panel
const filters = computed(() => [
  {
    key: 'level',
    label: 'Education level',
    options: [{ value: 'all', label: 'All levels' }, ...LEVELS.map((l) => ({ value: l.id, label: `${l.id} · ${l.label}` }))],
  },
  {
    key: 'subject',
    label: 'Subject',
    options: [{ value: 'all', label: 'All subjects' }, ...SUBJECTS.map((s) => ({ value: s, label: s }))],
  },
  {
    key: 'lang',
    label: 'Language',
    type: 'chips',
    options: [
      { value: 'all', label: 'All' },
      { value: 'English', label: 'English' },
      { value: 'Kinyarwanda', label: 'Kinyarwanda' },
      { value: 'French', label: 'French' },
    ],
  },
])

// Bridge FilterPanel's v-model (object) to composable's setFacet
const filterModel = computed({
  get: () => selected.value,
  set: (val) => {
    for (const k of Object.keys(val)) {
      if (val[k] !== selected.value[k]) setFacet(k, val[k])
    }
  },
})

// Hydrate from query params (?q= / ?level= / ?subject=)
onMounted(() => {
  if (route.query.q) query.value = String(route.query.q)
  if (route.query.level) setFacet('level', String(route.query.level))
  if (route.query.subject) setFacet('subject', String(route.query.subject))
})
// Reflect the store's load state (data is fetched from the API)
watch(
  storeLoading,
  (v) => { if (!v) loading.value = false },
  { immediate: true }
)
// Safety: never hang the skeleton forever
setTimeout(() => (loading.value = false), 4000)
watch(
  () => route.query,
  (q) => {
    if (q.level) setFacet('level', String(q.level))
    if (q.subject) setFacet('subject', String(q.subject))
    if (q.q) query.value = String(q.q)
  }
)

// Preview modal
const previewBook = ref(null)
function onView(b) { previewBook.value = b }
function onDownload(b) {
  download('books', b, b.title)
  previewBook.value = null
}
</script>

<template>
  <div>
    <PageHeader
      :eyebrow="t('nav.books')"
      :title="t('pages.booksTitle')"
      :subtitle="t('pages.booksDesc')"
    >
      <div class="mt-8 max-w-xl">
        <SearchBar v-model="query" size="lg" placeholder="Search by title, subject or author…" />
      </div>
    </PageHeader>

    <section class="container-page py-12 lg:py-16">
      <div class="grid gap-8 lg:grid-cols-[280px_1fr]">
        <!-- Sidebar filters -->
        <aside class="lg:sticky lg:top-24 lg:self-start">
          <FilterPanel :filters="filters" v-model="filterModel" :active-count="activeFilterCount" @reset="reset" />
        </aside>

        <!-- Results -->
        <div>
          <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p class="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
              <LayoutGrid class="h-4 w-4" />
              <span v-if="!loading"><strong class="text-ink-800 dark:text-ink-100">{{ results.length }}</strong> book{{ results.length === 1 ? '' : 's' }} found</span>
              <span v-else>Loading books…</span>
            </p>
            <span class="badge badge-brand"><BookOpen class="h-3.5 w-3.5" /> {{ books.length }} total</span>
            <!-- books is a computed ref; in template it auto-unwraps to the array -->
          </div>

          <!-- Loading -->
          <div v-if="loading" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard v-for="n in 6" :key="n" variant="book" />
          </div>

          <!-- Offline / backend problem -->
          <OfflineState
            v-else-if="!online && !books.length"
            :retrying="storeLoading"
            message="The library service is temporarily unavailable. Your books will appear here once it's reachable."
            @retry="loadAll(true)"
          />

          <!-- Results grid -->
          <div v-else-if="results.length" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <BookCard
              v-for="b in results"
              :key="b.id"
              :book="b"
              class="animate-fade-up"
              @view="onView"
              @download="onDownload"
            />
          </div>

          <!-- Empty -->
          <EmptyState
            v-else
            title="No books match your filters"
            message="We couldn't find any books for this combination. Try a different level, subject or search term."
            @reset="reset"
          />
        </div>
      </div>
    </section>

    <PreviewModal
      :open="!!previewBook"
      :title="previewBook?.title || ''"
      :subtitle="previewBook ? `${previewBook.subject} · ${previewBook.level} · ${previewBook.author}` : ''"
      :pdf-url="previewBook?.pdfUrl || ''"
      :meta="previewBook ? [
        { label: 'Pages', value: previewBook.pages },
        { label: 'Year', value: previewBook.year },
        { label: 'Language', value: previewBook.lang },
        { label: 'Rating', value: previewBook.rating },
      ] : []"
      @close="previewBook = null"
      @download="onDownload(previewBook)"
    />
    <ToastHost />
  </div>
</template>
