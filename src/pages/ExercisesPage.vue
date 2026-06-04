<script setup>
import { ref, computed, watch } from 'vue'
import {
  Brain, CheckCircle2, XCircle, Lightbulb, ChevronLeft, ChevronRight,
  RotateCcw, Trophy, Target, Award, Sparkles,
} from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import OfflineState from '@/components/ui/OfflineState.vue'
import { useQuiz } from '@/composables/useQuiz'
import { useContentStore } from '@/composables/useContentStore'
import { useMeta } from '@/composables/useMeta'
import { useI18n } from '@/composables/useI18n'
import { useAuth } from '@/composables/useAuth'
import { api } from '@/lib/api'
const { t } = useI18n()
const { isAuthed } = useAuth()

useMeta({ title: 'Interactive Exercises', description: 'Test yourself with instant-feedback multiple-choice questions and clear explanations across subjects and levels.' })

const { exercises, loading: storeLoading, online, loadAll } = useContentStore()

// ---- Filters ----
const subjectFilter = ref('all')
const levelFilter = ref('all')

const availableSubjects = computed(() => [...new Set(exercises.value.map((e) => e.subject))].sort())
const availableLevels = computed(() => [...new Set(exercises.value.map((e) => e.level))].sort())

const filtered = computed(() =>
  exercises.value.filter(
    (e) =>
      (subjectFilter.value === 'all' || e.subject === subjectFilter.value) &&
      (levelFilter.value === 'all' || e.level === levelFilter.value)
  )
)

const quiz = useQuiz(filtered)
const started = ref(false)

// Save the score to the user's account when a quiz finishes (if logged in).
watch(
  () => quiz.finished.value,
  async (done) => {
    if (!done || !isAuthed.value) return
    try {
      await api.authPost('/users/me/scores', {
        subject: subjectFilter.value === 'all' ? 'Mixed' : subjectFilter.value,
        level: levelFilter.value === 'all' ? '' : levelFilter.value,
        total: quiz.total.value,
        correct: quiz.score.value,
      })
    } catch { /* non-blocking */ }
  }
)

// Restart quiz when filters change
watch(filtered, () => {
  quiz.reset()
  started.value = false
})

function start() {
  if (!filtered.value.length) return
  quiz.reset()
  started.value = true
}

const difficultyBadge = {
  Easy: 'badge-brand',
  Medium: 'badge-gold',
  Hard: 'badge-accent',
}

const resultMessage = computed(() => {
  const p = quiz.scorePercent.value
  if (p >= 90) return { title: 'Outstanding!', text: 'You\u2019ve mastered this set. Keep up the brilliant work!' }
  if (p >= 70) return { title: 'Great job!', text: 'Strong performance — review the few you missed and you\u2019re set.' }
  if (p >= 50) return { title: 'Good effort!', text: 'You\u2019re getting there. Revisit the explanations and try again.' }
  return { title: 'Keep practising!', text: 'Every attempt helps you improve. Review the explanations and retry.' }
})

function optionState(i) {
  if (!quiz.answered.value) return 'idle'
  if (i === quiz.currentQuestion.value.answer) return 'correct'
  if (i === quiz.selectedIndex.value) return 'wrong'
  return 'dim'
}
</script>

<template>
  <div>
    <PageHeader
      :eyebrow="t('nav.exercises')"
      :title="t('pages.exercisesTitle')"
      :subtitle="t('pages.exercisesDesc')"
    />

    <section class="container-page py-12 lg:py-16">
      <!-- Filters -->
      <div class="card mb-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-ink-500 dark:text-ink-400">Subject</label>
            <div class="relative">
              <select v-model="subjectFilter" class="select min-w-[180px]">
                <option value="all">All subjects</option>
                <option v-for="s in availableSubjects" :key="s" :value="s">{{ s }}</option>
              </select>
              <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-ink-500 dark:text-ink-400">Level</label>
            <div class="flex flex-wrap gap-2">
              <button @click="levelFilter = 'all'" class="chip" :class="levelFilter === 'all' ? 'chip-active' : 'chip-idle'">All</button>
              <button v-for="l in availableLevels" :key="l" @click="levelFilter = l" class="chip" :class="levelFilter === l ? 'chip-active' : 'chip-idle'">{{ l }}</button>
            </div>
          </div>
        </div>
        <span class="badge badge-brand self-start sm:self-auto"><Brain class="h-3.5 w-3.5" /> {{ filtered.length }} questions</span>
      </div>

      <!-- Loading -->
      <div v-if="storeLoading && !exercises.length" class="card p-14 text-center">
        <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-ink-200 border-t-brand-600 dark:border-ink-700 dark:border-t-brand-400" />
        <p class="mt-4 text-sm text-ink-500 dark:text-ink-400">Loading questions…</p>
      </div>

      <!-- Offline / backend problem -->
      <OfflineState
        v-else-if="!online && !exercises.length"
        :retrying="storeLoading"
        message="The exercises service is temporarily unavailable. Please try again shortly."
        @retry="loadAll(true)"
      />

      <!-- Empty -->
      <EmptyState
        v-else-if="!filtered.length"
        title="No questions for this combination"
        message="Try a different subject or level to start practising."
        @reset="subjectFilter = 'all'; levelFilter = 'all'"
      />

      <!-- Start screen -->
      <div v-else-if="!started" class="card relative overflow-hidden p-8 text-center sm:p-14">
        <div class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-400/10 blur-3xl" aria-hidden="true" />
        <div class="relative mx-auto max-w-lg">
          <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
            <Sparkles class="h-8 w-8" />
          </span>
          <h2 class="mt-6 font-display text-2xl font-extrabold text-ink-900 dark:text-white">Ready to practise?</h2>
          <p class="mt-3 text-ink-500 dark:text-ink-400">
            You\u2019ll answer <strong class="text-ink-700 dark:text-ink-200">{{ filtered.length }}</strong> multiple-choice
            questions. Get instant feedback and a clear explanation after each one.
          </p>
          <div class="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-ink-500 dark:text-ink-400">
            <span class="inline-flex items-center gap-1.5"><CheckCircle2 class="h-4 w-4 text-brand-600" /> Instant feedback</span>
            <span class="inline-flex items-center gap-1.5"><Lightbulb class="h-4 w-4 text-gold-500" /> Explanations</span>
            <span class="inline-flex items-center gap-1.5"><Trophy class="h-4 w-4 text-accent-600" /> Score tracking</span>
          </div>
          <button @click="start" class="btn btn-primary btn-lg mt-8">
            Start exercise <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Results screen -->
      <div v-else-if="quiz.finished.value" class="card relative overflow-hidden p-8 text-center sm:p-14">
        <div class="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-gold-400/10 blur-3xl" aria-hidden="true" />
        <div class="relative mx-auto max-w-lg">
          <span class="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-soft">
            <Award class="h-10 w-10" />
          </span>
          <h2 class="mt-6 font-display text-3xl font-extrabold text-ink-900 dark:text-white">{{ resultMessage.title }}</h2>
          <p class="mt-2 text-ink-500 dark:text-ink-400">{{ resultMessage.text }}</p>

          <div class="mx-auto mt-8 flex max-w-xs items-center justify-center">
            <div class="relative h-40 w-40">
              <svg viewBox="0 0 120 120" class="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" stroke-width="12" class="text-ink-100 dark:text-ink-800" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round"
                  class="text-brand-600 transition-all duration-1000"
                  :stroke-dasharray="2 * Math.PI * 52"
                  :stroke-dashoffset="2 * Math.PI * 52 * (1 - quiz.scorePercent.value / 100)"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="font-display text-3xl font-extrabold text-ink-900 dark:text-white">{{ quiz.scorePercent.value }}%</span>
                <span class="text-xs font-medium text-ink-400">score</span>
              </div>
            </div>
          </div>

          <div class="mt-8 grid grid-cols-3 gap-3">
            <div class="rounded-xl bg-brand-50 p-4 dark:bg-brand-950/40">
              <p class="font-display text-2xl font-extrabold text-brand-600 dark:text-brand-300">{{ quiz.score.value }}</p>
              <p class="text-xs font-medium text-ink-500 dark:text-ink-400">Correct</p>
            </div>
            <div class="rounded-xl bg-accent-50 p-4 dark:bg-accent-950/40">
              <p class="font-display text-2xl font-extrabold text-accent-600 dark:text-accent-300">{{ quiz.total.value - quiz.score.value }}</p>
              <p class="text-xs font-medium text-ink-500 dark:text-ink-400">Incorrect</p>
            </div>
            <div class="rounded-xl bg-ink-100 p-4 dark:bg-ink-800">
              <p class="font-display text-2xl font-extrabold text-ink-800 dark:text-ink-100">{{ quiz.total.value }}</p>
              <p class="text-xs font-medium text-ink-500 dark:text-ink-400">Total</p>
            </div>
          </div>

          <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button @click="start" class="btn btn-primary btn-lg">
              <RotateCcw class="h-4 w-4" /> Try again
            </button>
            <button @click="quiz.goTo(0)" class="btn btn-outline btn-lg">Review answers</button>
          </div>
        </div>
      </div>

      <!-- Quiz screen -->
      <div v-else class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <!-- Question card -->
        <div class="card p-6 sm:p-8">
          <!-- Progress -->
          <div class="mb-6">
            <div class="mb-2 flex items-center justify-between text-sm">
              <span class="font-semibold text-ink-700 dark:text-ink-200">
                Question {{ quiz.current.value + 1 }} <span class="text-ink-400">of {{ quiz.total.value }}</span>
              </span>
              <span class="inline-flex items-center gap-1.5 font-semibold text-brand-600 dark:text-brand-400">
                <Target class="h-4 w-4" /> {{ quiz.score.value }} correct
              </span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
              <div class="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500" :style="{ width: `${quiz.progress.value}%` }" />
            </div>
          </div>

          <!-- Tags -->
          <div class="mb-4 flex flex-wrap items-center gap-2">
            <span class="badge badge-ink">{{ quiz.currentQuestion.value.subject }}</span>
            <span class="badge badge-ink">{{ quiz.currentQuestion.value.level }}</span>
            <span class="badge" :class="difficultyBadge[quiz.currentQuestion.value.difficulty]">{{ quiz.currentQuestion.value.difficulty }}</span>
          </div>

          <!-- Question -->
          <h2 class="font-display text-xl font-bold leading-snug text-ink-900 sm:text-2xl dark:text-white">
            {{ quiz.currentQuestion.value.question }}
          </h2>

          <!-- Options -->
          <div class="mt-6 space-y-3">
            <button
              v-for="(opt, i) in quiz.currentQuestion.value.options"
              :key="i"
              @click="quiz.select(i)"
              :disabled="quiz.answered.value"
              class="group flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition-all duration-200"
              :class="{
                'border-ink-200 bg-white hover:border-brand-400 hover:bg-brand-50/50 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-brand-700 dark:hover:bg-ink-800': optionState(i) === 'idle',
                'border-brand-500 bg-brand-50 dark:border-brand-600 dark:bg-brand-950/40': optionState(i) === 'correct',
                'border-red-500 bg-red-50 dark:border-red-600 dark:bg-red-950/30': optionState(i) === 'wrong',
                'border-ink-200 bg-white opacity-50 dark:border-ink-800 dark:bg-ink-900': optionState(i) === 'dim',
              }"
            >
              <span
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-bold transition-colors"
                :class="{
                  'border-ink-200 text-ink-500 group-hover:border-brand-400 group-hover:text-brand-600 dark:border-ink-700 dark:text-ink-400': optionState(i) === 'idle',
                  'border-brand-500 bg-brand-500 text-white': optionState(i) === 'correct',
                  'border-red-500 bg-red-500 text-white': optionState(i) === 'wrong',
                  'border-ink-200 text-ink-400 dark:border-ink-700': optionState(i) === 'dim',
                }"
              >
                {{ ['A', 'B', 'C', 'D'][i] }}
              </span>
              <span class="flex-1 font-medium text-ink-800 dark:text-ink-100">{{ opt }}</span>
              <CheckCircle2 v-if="optionState(i) === 'correct'" class="h-5 w-5 shrink-0 text-brand-600" />
              <XCircle v-else-if="optionState(i) === 'wrong'" class="h-5 w-5 shrink-0 text-red-500" />
            </button>
          </div>

          <!-- Explanation -->
          <Transition name="explain">
            <div
              v-if="quiz.answered.value"
              class="mt-5 rounded-2xl border p-4"
              :class="quiz.responses.value[quiz.currentQuestion.value.id]?.correct
                ? 'border-brand-200 bg-brand-50 dark:border-brand-800/50 dark:bg-brand-950/30'
                : 'border-gold-200 bg-gold-50 dark:border-gold-600/30 dark:bg-gold-600/10'"
            >
              <div class="flex items-start gap-3">
                <Lightbulb class="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
                <div>
                  <p class="text-sm font-bold text-ink-800 dark:text-ink-100">
                    {{ quiz.responses.value[quiz.currentQuestion.value.id]?.correct ? 'Correct! Well done.' : 'Not quite — here\u2019s why:' }}
                  </p>
                  <p class="mt-1 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                    {{ quiz.currentQuestion.value.explanation }}
                  </p>
                </div>
              </div>
            </div>
          </Transition>

          <!-- Nav -->
          <div class="mt-6 flex items-center justify-between gap-3">
            <button @click="quiz.prev()" :disabled="quiz.current.value === 0" class="btn btn-ghost btn-md">
              <ChevronLeft class="h-4 w-4" /> Previous
            </button>
            <button @click="quiz.next()" :disabled="!quiz.answered.value" class="btn btn-primary btn-md">
              {{ quiz.isLast.value ? 'Finish' : 'Next' }}
              <ChevronRight v-if="!quiz.isLast.value" class="h-4 w-4" />
              <Trophy v-else class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Sidebar: progress + navigator -->
        <aside class="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div class="card p-6">
            <h3 class="text-sm font-bold uppercase tracking-wide text-ink-700 dark:text-ink-200">Your progress</h3>
            <div class="mt-4 space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-ink-500 dark:text-ink-400">Answered</span>
                <span class="font-bold text-ink-800 dark:text-ink-100">{{ quiz.answeredCount.value }} / {{ quiz.total.value }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-ink-500 dark:text-ink-400">Correct</span>
                <span class="font-bold text-brand-600 dark:text-brand-400">{{ quiz.score.value }}</span>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                <div class="h-full rounded-full bg-brand-600 transition-all duration-500" :style="{ width: `${quiz.progress.value}%` }" />
              </div>
            </div>
          </div>

          <div class="card p-6">
            <h3 class="text-sm font-bold uppercase tracking-wide text-ink-700 dark:text-ink-200">Questions</h3>
            <div class="mt-4 grid grid-cols-6 gap-2 lg:grid-cols-5">
              <button
                v-for="(q, i) in quiz.questions.value"
                :key="q.id"
                @click="quiz.goTo(i)"
                class="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition-all"
                :class="[
                  i === quiz.current.value ? 'ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-ink-900' : '',
                  quiz.responses.value[q.id]
                    ? (quiz.responses.value[q.id].correct ? 'bg-brand-600 text-white' : 'bg-red-500 text-white')
                    : 'bg-ink-100 text-ink-500 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700'
                ]"
              >
                {{ i + 1 }}
              </button>
            </div>
            <button @click="start" class="btn btn-outline btn-sm mt-5 w-full">
              <RotateCcw class="h-4 w-4" /> Restart
            </button>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.explain-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.explain-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
