<script setup>
import { ref, computed, onMounted } from 'vue'
import { FileText, GraduationCap, Archive } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import FilterPanel from '@/components/ui/FilterPanel.vue'
import PastPaperCard from '@/components/cards/PastPaperCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import OfflineState from '@/components/ui/OfflineState.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import PreviewModal from '@/components/ui/PreviewModal.vue'
import ToastHost from '@/components/ui/ToastHost.vue'
import { useResourceFilter } from '@/composables/useResourceFilter'
import { useToast } from '@/composables/useToast'
import { useContentStore } from '@/composables/useContentStore'
import { EXAM_LEVELS, EXAM_YEARS, SUBJECTS } from '@/data/constants'

import { useMeta } from '@/composables/useMeta'
import { useDownload } from '@/composables/useDownload'
const { download } = useDownload()
import { useI18n } from '@/composables/useI18n'
const { t } = useI18n()
import { watch } from 'vue'

useMeta({ title: 'Past Papers', description: 'Practise with real P6, S3 and S6 national examination papers — free downloads on MENYA.' })

const { notify } = useToast()
const { pastPapers, loading: storeLoading, online, loadAll } = useContentStore()
const loading = ref(true)

const { query, selected, results, activeFilterCount, setFacet, reset } = useResourceFilter(pastPapers, {
  searchKeys: ['subject', 'level', 'year', 'type'],
  facets: { level: 'level', subject: 'subject', year: 'year' },
})

const filters = computed(() => [
  {
    key: 'level',
    label: 'Examination level',
    type: 'chips',
    options: [{ value: 'all', label: 'All' }, ...EXAM_LEVELS.map((l) => ({ value: l, label: l }))],
  },
  {
    key: 'year',
    label: 'Year',
    options: [{ value: 'all', label: 'All years' }, ...EXAM_YEARS.map((y) => ({ value: y, label: String(y) }))],
  },
  {
    key: 'subject',
    label: 'Subject',
    options: [{ value: 'all', label: 'All subjects' }, ...SUBJECTS.map((s) => ({ value: s, label: s }))],
  },
])

const filterModel = computed({
  get: () => selected.value,
  set: (val) => {
    for (const k of Object.keys(val)) {
      if (val[k] !== selected.value[k]) setFacet(k, val[k])
    }
  },
})

// Category summary cards
const categories = computed(() =>
  EXAM_LEVELS.map((lvl) => ({
    level: lvl,
    count: pastPapers.value.filter((p) => p.level === lvl).length,
  }))
)

function selectCategory(lvl) {
  setFacet('level', selected.value.level === lvl ? 'all' : lvl)
}

watch(storeLoading, (v) => { if (!v) loading.value = false }, { immediate: true })
onMounted(() => setTimeout(() => (loading.value = false), 4000))

const previewPaper = ref(null)
function onPreview(p) { previewPaper.value = p }
function onDownload(p) {
  download('papers', p, `${p.subject} ${p.level} (${p.year})`)
  previewPaper.value = null
}
</script>

<template>
  <div>
    <PageHeader
      :eyebrow="t('nav.papers')"
      :title="t('pages.papersTitle')"
      :subtitle="t('pages.papersDesc')"
    >
      <div class="mt-8 max-w-xl">
        <SearchBar v-model="query" size="lg" placeholder="Search by subject, level or year…" />
      </div>
    </PageHeader>

    <!-- Category tiles -->
    <section class="container-page pt-12">
      <div class="grid gap-4 sm:grid-cols-3">
        <button
          v-for="c in categories"
          :key="c.level"
          @click="selectCategory(c.level)"
          class="card card-hover group flex items-center gap-4 p-5 text-left"
          :class="selected.level === c.level ? '!border-accent-500 ring-2 ring-accent-500/20' : ''"
        >
          <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent-600 group-hover:text-white dark:bg-accent-950/50 dark:text-accent-300">
            <GraduationCap class="h-6 w-6" />
          </span>
          <div>
            <p class="font-display text-lg font-bold text-ink-900 dark:text-white">{{ c.level }} Exams</p>
            <p class="text-xs text-ink-400">{{ c.count }} papers available</p>
          </div>
        </button>
      </div>
    </section>

    <section class="container-page py-12 lg:py-16">
      <div class="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside class="lg:sticky lg:top-24 lg:self-start">
          <FilterPanel :filters="filters" v-model="filterModel" :active-count="activeFilterCount" @reset="reset" />
        </aside>

        <div>
          <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p class="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
              <FileText class="h-4 w-4" />
              <span v-if="!loading"><strong class="text-ink-800 dark:text-ink-100">{{ results.length }}</strong> paper{{ results.length === 1 ? '' : 's' }} found</span>
              <span v-else>Loading papers…</span>
            </p>
            <span class="badge badge-accent"><Archive class="h-3.5 w-3.5" /> {{ pastPapers.length }} total</span>
          </div>

          <div v-if="loading" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard v-for="n in 6" :key="n" variant="paper" />
          </div>

          <OfflineState
            v-else-if="!online && !pastPapers.length"
            :retrying="storeLoading"
            message="The papers service is temporarily unavailable. Please try again shortly."
            @retry="loadAll(true)"
          />

          <div v-else-if="results.length" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <PastPaperCard
              v-for="p in results"
              :key="p.id"
              :paper="p"
              class="animate-fade-up"
              @preview="onPreview"
              @download="onDownload"
            />
          </div>

          <EmptyState
            v-else
            title="No papers match your filters"
            message="Try a different examination level, year or subject."
            @reset="reset"
          />
        </div>
      </div>
    </section>

    <PreviewModal
      :open="!!previewPaper"
      :title="previewPaper ? `${previewPaper.subject} — ${previewPaper.level}` : ''"
      :subtitle="previewPaper ? `${previewPaper.type} · ${previewPaper.year}` : ''"
      :pdf-url="previewPaper?.pdfUrl || ''"
      :meta="previewPaper ? [
        { label: 'Year', value: previewPaper.year },
        { label: 'Duration', value: previewPaper.duration },
        { label: 'Questions', value: previewPaper.questions },
        { label: 'Level', value: previewPaper.level },
      ] : []"
      @close="previewPaper = null"
      @download="onDownload(previewPaper)"
    />
    <ToastHost />
  </div>
</template>
