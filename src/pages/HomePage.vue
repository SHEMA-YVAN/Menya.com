<script setup>
import { RouterLink } from 'vue-router'
import { ArrowRight, CheckCircle2, Quote, Star, WifiOff, RefreshCw, Sparkles } from 'lucide-vue-next'
import HeroSection from '@/components/sections/HeroSection.vue'
import StatisticsSection from '@/components/sections/StatisticsSection.vue'
import ResourceCard from '@/components/cards/ResourceCard.vue'
import BookCard from '@/components/cards/BookCard.vue'
import PreviewModal from '@/components/ui/PreviewModal.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import ToastHost from '@/components/ui/ToastHost.vue'
import { useScrollReveal } from '@/composables/useScrollReveal'
import { useToast } from '@/composables/useToast'
import { featureHighlights, benefits, popularSubjects } from '@/data/site'
import { LEVEL_GROUPS as GROUPS } from '@/data/constants'
import { useContentStore } from '@/composables/useContentStore'
import { ref, computed } from 'vue'

import { useMeta } from '@/composables/useMeta'
import { useI18n } from '@/composables/useI18n'
import { useDownload } from '@/composables/useDownload'
import { useAuth } from '@/composables/useAuth'

const { t } = useI18n()
const { download } = useDownload()
const { isAuthed, user } = useAuth()
const firstName = computed(() => (user.value?.name || 'there').split(' ')[0])

useMeta({ title: '', description: "Rwanda's free digital learning platform — curriculum books, national exam past papers and interactive exercises for P1 to S6." })
useScrollReveal()
const { notify } = useToast()
const { books, loading, online, loadAll } = useContentStore()

// Recently uploaded = newest first (API already returns created_at DESC).
const recent = computed(() => books.value.slice(0, 4))
const previewBook = ref(null)

function onView(book) {
  previewBook.value = book
}
function onDownload(book) {
  download('books', book, book.title)
  previewBook.value = null
}

const groupAccent = {
  brand: 'from-brand-500 to-brand-700',
  accent: 'from-accent-500 to-accent-700',
  gold: 'from-gold-400 to-gold-600',
}

// Icon tile colours for popular subjects (idle → fills on hover)
const subjectAccent = {
  brand: 'bg-brand-50 text-brand-600 group-hover:bg-brand-600 dark:bg-brand-950/50 dark:text-brand-300',
  accent: 'bg-accent-50 text-accent-600 group-hover:bg-accent-600 dark:bg-accent-950/50 dark:text-accent-300',
  gold: 'bg-gold-50 text-gold-600 group-hover:bg-gold-500 dark:bg-gold-600/15 dark:text-gold-300',
}
</script>

<template>
  <div>
    <!-- Personalized welcome strip for logged-in users -->
    <Transition name="welcome">
      <div v-if="isAuthed" class="border-b border-brand-100 bg-brand-50/70 dark:border-brand-900/40 dark:bg-brand-950/30">
        <div class="container-page flex flex-wrap items-center justify-between gap-3 py-3">
          <p class="flex items-center gap-2 text-sm font-medium text-brand-800 dark:text-brand-200">
            <Sparkles class="h-4 w-4 text-brand-600" />
            {{ t('home.welcomeBack', { name: firstName }) }}
          </p>
          <RouterLink to="/dashboard" class="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
            {{ t('home.goToDashboard') }} <ArrowRight class="h-4 w-4" />
          </RouterLink>
        </div>
      </div>
    </Transition>

    <HeroSection />

    <!-- Feature highlights -->
    <section class="section-pad">
      <div class="container-page">
        <div class="mx-auto max-w-2xl text-center" data-reveal>
          <span class="eyebrow">{{ t('sections.featuresEyebrow') }}</span>
          <h2 class="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl dark:text-white">
            {{ t('sections.featuresTitle') }}
          </h2>
          <p class="mt-4 text-lg text-ink-500 dark:text-ink-300">
            {{ t('sections.featuresSubtitle') }}
          </p>
        </div>
        <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="(f, i) in featureHighlights" :key="f.name" data-reveal :data-reveal-delay="i * 80">
            <ResourceCard v-bind="f" :icon="f.icon" />
          </div>
        </div>
      </div>
    </section>

    <!-- Browse by level -->
    <section class="section-pad bg-ink-50/50 dark:bg-ink-900/30">
      <div class="container-page">
        <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end" data-reveal>
          <div class="max-w-xl">
            <span class="eyebrow">{{ t('sections.levelsEyebrow') }}</span>
            <h2 class="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl dark:text-white">
              {{ t('sections.levelsTitle') }}
            </h2>
            <p class="mt-4 text-lg text-ink-500 dark:text-ink-300">
              {{ t('sections.levelsSubtitle') }}
            </p>
          </div>
          <RouterLink to="/books" class="link-underline shrink-0">View all levels</RouterLink>
        </div>

        <div class="mt-12 grid gap-6 lg:grid-cols-3">
          <RouterLink
            v-for="(g, i) in GROUPS"
            :key="g.id"
            :to="`/books?level=${g.levels[0]}`"
            class="card card-hover group relative overflow-hidden p-7"
            data-reveal
            :data-reveal-delay="i * 90"
          >
            <div class="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br opacity-10 transition-transform duration-500 group-hover:scale-125"
                 :class="groupAccent[g.accent]" aria-hidden="true" />
            <div class="relative">
              <span class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-3.5 py-1.5 text-xs font-bold text-white shadow-soft"
                    :class="groupAccent[g.accent]">
                {{ g.range }}
              </span>
              <h3 class="mt-5 font-display text-2xl font-extrabold text-ink-900 dark:text-white">{{ g.name }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{{ g.blurb }}</p>
              <div class="mt-5 flex flex-wrap gap-2">
                <span v-for="lvl in g.levels" :key="lvl" class="badge badge-ink">{{ lvl }}</span>
              </div>
              <span class="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
                Explore resources <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Recently uploaded -->
    <section class="section-pad">
      <div class="container-page">
        <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end" data-reveal>
          <div class="max-w-xl">
            <span class="eyebrow">{{ t('sections.recentEyebrow') }}</span>
            <h2 class="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl dark:text-white">
              {{ t('sections.recentTitle') }}
            </h2>
            <p class="mt-4 text-lg text-ink-500 dark:text-ink-300">
              {{ t('sections.recentSubtitle') }}
            </p>
          </div>
          <RouterLink to="/books" class="btn btn-outline btn-md shrink-0">
            {{ t('sections.browseAll') }} <ArrowRight class="h-4 w-4" />
          </RouterLink>
        </div>
        <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Loading skeletons -->
          <template v-if="loading && !recent.length">
            <SkeletonCard v-for="n in 4" :key="`s-${n}`" variant="book" />
          </template>
          <!-- Offline / error -->
          <div v-else-if="!online && !recent.length" class="col-span-full">
            <div class="flex flex-col items-center rounded-2xl border border-dashed border-ink-200 py-12 text-center dark:border-ink-700">
              <WifiOff class="h-8 w-8 text-ink-400" />
              <p class="mt-3 text-sm font-semibold text-ink-700 dark:text-ink-200">Couldn't load resources</p>
              <p class="mt-1 text-sm text-ink-400">The library service is temporarily unavailable.</p>
              <button @click="loadAll(true)" class="btn btn-outline btn-sm mt-4"><RefreshCw class="h-4 w-4" /> Try again</button>
            </div>
          </div>
          <!-- Loaded -->
          <template v-else>
            <div v-for="(b, i) in recent" :key="b.id" data-reveal :data-reveal-delay="i * 80">
              <BookCard :book="b" @view="onView" @download="onDownload" />
            </div>
            <p v-if="!recent.length" class="col-span-full rounded-2xl border border-dashed border-ink-200 py-12 text-center text-sm text-ink-400 dark:border-ink-700">
              No books yet — add some from the Admin Portal.
            </p>
          </template>
        </div>
      </div>
    </section>

    <StatisticsSection />

    <!-- Benefits -->
    <section class="section-pad">
      <div class="container-page">
        <div class="mx-auto max-w-2xl text-center" data-reveal>
          <span class="eyebrow">{{ t('sections.benefitsEyebrow') }}</span>
          <h2 class="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl dark:text-white">
            {{ t('sections.benefitsTitle') }}
          </h2>
          <p class="mt-4 text-lg text-ink-500 dark:text-ink-300">
            Thoughtful features that make studying simpler, faster and more effective.
          </p>
        </div>
        <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(b, i) in benefits"
            :key="b.title"
            class="card card-hover p-6"
            data-reveal
            :data-reveal-delay="i * 70"
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300">
              <component :is="b.icon" class="h-6 w-6" />
            </div>
            <h3 class="mt-5 font-display text-lg font-bold text-ink-900 dark:text-white">{{ b.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{{ b.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular subjects -->
    <section class="section-pad bg-ink-50/50 dark:bg-ink-900/30">
      <div class="container-page">
        <div class="mx-auto max-w-2xl text-center" data-reveal>
          <span class="eyebrow">{{ t('sections.subjectsEyebrow') }}</span>
          <h2 class="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl dark:text-white">
            {{ t('sections.subjectsTitle') }}
          </h2>
        </div>
        <div class="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <RouterLink
            v-for="(s, i) in popularSubjects"
            :key="s.name"
            :to="`/books?subject=${encodeURIComponent(s.name)}`"
            class="card card-hover group flex items-center gap-3.5 p-5"
            data-reveal
            :data-reveal-delay="i * 50"
          >
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:text-white"
              :class="subjectAccent[s.accent]"
            >
              <component :is="s.icon" class="h-5 w-5" />
            </span>
            <div class="min-w-0">
              <p class="truncate font-bold text-ink-900 dark:text-white">{{ s.name }}</p>
              <p class="text-xs text-ink-400">{{ s.count }} resources</p>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Testimonial / social proof -->
    <section class="section-pad">
      <div class="container-page">
        <div class="relative overflow-hidden rounded-3xl bg-ink-900 p-8 sm:p-12 lg:p-16 dark:bg-ink-900/60" data-reveal>
          <div class="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" aria-hidden="true" />
          <div class="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
          <div class="relative mx-auto max-w-3xl text-center">
            <Quote class="mx-auto h-10 w-10 text-brand-400" />
            <div class="mt-4 flex justify-center gap-1 text-gold-400">
              <Star v-for="n in 5" :key="n" class="h-5 w-5 fill-current" />
            </div>
            <blockquote class="mt-6 font-display text-2xl font-bold leading-snug text-white sm:text-3xl">
              “MENYA changed how I prepare for exams. Past papers, books and quizzes are finally in one place — and it's free.”
            </blockquote>
            <p class="mt-6 text-sm font-semibold text-ink-300">Keza I. — Senior 6 student, Kigali</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="pb-20 lg:pb-28">
      <div class="container-page">
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-600 to-brand-700 px-8 py-14 text-center shadow-glow sm:px-16 sm:py-20" data-reveal>
          <div class="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
          <div class="pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-accent-400/20 blur-3xl" aria-hidden="true" />
          <h2 class="relative font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {{ t('sections.ctaTitle') }}
          </h2>
          <p class="relative mx-auto mt-4 max-w-xl text-lg text-brand-50">
            {{ t('sections.ctaSubtitle') }}
          </p>
          <div class="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <RouterLink to="/books" class="btn btn-lg bg-white text-brand-700 hover:bg-brand-50 active:scale-[0.98]">
              Explore Books <ArrowRight class="h-4 w-4" />
            </RouterLink>
            <RouterLink to="/exercises" class="btn btn-lg border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20">
              Try Exercises
            </RouterLink>
          </div>
          <ul class="relative mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-brand-50">
            <li class="inline-flex items-center gap-1.5"><CheckCircle2 class="h-4 w-4" /> No account needed</li>
            <li class="inline-flex items-center gap-1.5"><CheckCircle2 class="h-4 w-4" /> 100% free</li>
            <li class="inline-flex items-center gap-1.5"><CheckCircle2 class="h-4 w-4" /> Works on any device</li>
          </ul>
        </div>
      </div>
    </section>

    <PreviewModal
      :open="!!previewBook"
      :title="previewBook?.title || ''"
      :subtitle="previewBook ? `${previewBook.subject} · ${previewBook.level}` : ''"
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

<style scoped>
.welcome-enter-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.welcome-enter-from { opacity: 0; transform: translateY(-100%); }
</style>
