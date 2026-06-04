<script setup>
import { Sparkles, BookOpen, FileText, Brain, Star, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-vue-next'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const quickLinks = [
  { label: 'Books', icon: BookOpen, to: '/books' },
  { label: 'Past Papers', icon: FileText, to: '/past-papers' },
  { label: 'Exercises', icon: Brain, to: '/exercises' },
]

// Snapshot of what the public library offers (no personal/login data)
const libraryRows = [
  { label: 'Curriculum Books', sub: 'Textbooks for every level', count: '1,200+', icon: BookOpen, tile: 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300' },
  { label: 'Past Papers', sub: 'National exams P6 · S3 · S6', count: '850+', icon: FileText, tile: 'bg-accent-50 text-accent-600 dark:bg-accent-950/50 dark:text-accent-300' },
  { label: 'Exercises', sub: 'Interactive practice questions', count: '5,000+', icon: Brain, tile: 'bg-gold-50 text-gold-600 dark:bg-gold-600/15 dark:text-gold-300' },
]
</script>

<template>
  <section class="relative overflow-hidden">
    <!-- Background -->
    <div class="pointer-events-none absolute inset-0 bg-grid opacity-70 dark:hidden mask-fade-b" aria-hidden="true" />
    <div class="pointer-events-none absolute inset-0 hidden bg-grid-dark dark:block mask-fade-b" aria-hidden="true" />
    <div class="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl dark:bg-brand-700/15" aria-hidden="true" />
    <div class="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-accent-400/15 blur-3xl dark:bg-accent-700/10" aria-hidden="true" />

    <div class="container-page relative pb-16 pt-14 sm:pt-20 lg:pb-24 lg:pt-28">
      <div class="grid items-center gap-12 lg:grid-cols-2">
        <!-- Copy -->
        <div class="animate-fade-up">
          <span class="eyebrow">
            <Sparkles class="h-3.5 w-3.5" /> {{ t('hero.eyebrow') }}
          </span>
          <h1 class="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl dark:text-white">
            {{ t('hero.title1') }}
            <span class="text-gradient">{{ t('hero.titleHighlight') }}</span>
            {{ t('hero.title2') }}
          </h1>
          <p class="mt-6 max-w-xl text-lg leading-relaxed text-ink-500 dark:text-ink-300">
            {{ t('hero.subtitle') }}
          </p>

          <!-- Primary CTAs -->
          <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <RouterLink to="/books" class="btn btn-primary btn-lg">
              <BookOpen class="h-5 w-5" /> {{ t('hero.ctaBooks') }}
              <ArrowRight class="h-4 w-4" />
            </RouterLink>
            <RouterLink to="/past-papers" class="btn btn-outline btn-lg">
              <FileText class="h-5 w-5" /> {{ t('hero.ctaPapers') }}
            </RouterLink>
          </div>

          <!-- Quick category links -->
          <div class="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span class="text-sm font-medium text-ink-400">{{ t('hero.explore') }}</span>
            <RouterLink v-for="q in quickLinks" :key="q.label" :to="q.to" class="chip chip-idle">
              <component :is="q.icon" class="h-4 w-4" /> {{ q.label }}
            </RouterLink>
          </div>

          <!-- Trust indicators -->
          <div class="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500 dark:text-ink-400">
            <span class="inline-flex items-center gap-1.5"><CheckCircle2 class="h-4 w-4 text-brand-600" /> {{ t('hero.trustFree') }}</span>
            <span class="inline-flex items-center gap-1.5"><CheckCircle2 class="h-4 w-4 text-brand-600" /> {{ t('hero.trustCurriculum') }}</span>
            <span class="inline-flex items-center gap-1.5"><CheckCircle2 class="h-4 w-4 text-brand-600" /> {{ t('hero.trustLevels') }}</span>
          </div>
        </div>

        <!-- Visual -->
        <div class="relative animate-fade-up [animation-delay:120ms]">
          <div class="relative mx-auto max-w-md">
            <!-- main card: a snapshot of the public resource library -->
            <div class="card overflow-hidden p-6 shadow-soft">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                    <GraduationCap class="h-5 w-5" />
                  </span>
                  <div>
                    <p class="text-sm font-bold text-ink-900 dark:text-white">{{ t('hero.library') }}</p>
                    <p class="text-xs text-ink-400">{{ t('hero.libraryScope') }}</p>
                  </div>
                </div>
                <span class="badge badge-brand">{{ t('hero.free') }}</span>
              </div>

              <!-- resource type rows -->
              <div class="mt-5 space-y-2.5">
                <div
                  v-for="row in libraryRows"
                  :key="row.label"
                  class="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50/60 p-3 dark:border-ink-800 dark:bg-ink-800/40"
                >
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" :class="row.tile">
                    <component :is="row.icon" class="h-4.5 w-4.5" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{{ row.label }}</p>
                    <p class="text-[11px] text-ink-400">{{ row.sub }}</p>
                  </div>
                  <span class="text-sm font-extrabold text-brand-600 dark:text-brand-400">{{ row.count }}</span>
                </div>
              </div>
            </div>

            <!-- floating badges -->
            <div class="absolute -left-6 -top-5 hidden animate-float rounded-2xl border border-ink-100 bg-white p-3 shadow-soft sm:flex sm:items-center sm:gap-2.5 dark:border-ink-800 dark:bg-ink-900">
              <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-50 text-gold-500 dark:bg-gold-600/15">
                <Star class="h-4.5 w-4.5 fill-current" />
              </span>
              <div>
                <p class="text-xs font-bold text-ink-900 dark:text-white">4.9 / 5</p>
                <p class="text-[10px] text-ink-400">Learner rating</p>
              </div>
            </div>
            <div class="absolute -bottom-5 -right-4 hidden animate-float [animation-delay:1.5s] rounded-2xl border border-ink-100 bg-white p-3 shadow-soft sm:flex sm:items-center sm:gap-2.5 dark:border-ink-800 dark:bg-ink-900">
              <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-950/50">
                <FileText class="h-4.5 w-4.5" />
              </span>
              <div>
                <p class="text-xs font-bold text-ink-900 dark:text-white">850+ papers</p>
                <p class="text-[10px] text-ink-400">Ready to practice</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
