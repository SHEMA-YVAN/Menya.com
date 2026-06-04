<script setup>
import { computed, ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { BookOpen, FileText, Brain, Users, Plus, Info, ArrowRight, Wifi, WifiOff } from 'lucide-vue-next'
import Spinner from '@/components/ui/Spinner.vue'
import { useContentStore } from '@/composables/useContentStore'
import { api } from '@/lib/api'

const { stats, online, loading } = useContentStore()

const userCount = ref(null)
onMounted(async () => {
  try { userCount.value = (await api.authGet('/users')).length } catch { userCount.value = null }
})

const cards = computed(() => [
  { name: 'Books', to: '/admin/books', icon: BookOpen, total: stats.value.books.total, accent: 'brand' },
  { name: 'Past Papers', to: '/admin/past-papers', icon: FileText, total: stats.value.papers.total, accent: 'accent' },
  { name: 'Exercises', to: '/admin/exercises', icon: Brain, total: stats.value.exercises.total, accent: 'gold' },
  { name: 'Users', to: '/admin/users', icon: Users, total: userCount.value, accent: 'indigo' },
])

const accentMap = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300',
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-950/50 dark:text-accent-300',
  gold: 'bg-gold-50 text-gold-600 dark:bg-gold-600/15 dark:text-gold-300',
  indigo: 'bg-accent-50 text-accent-600 dark:bg-accent-950/50 dark:text-accent-300',
}
</script>

<template>
  <div>
    <div class="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="font-display text-2xl font-extrabold text-ink-900 dark:text-white">Dashboard</h1>
        <p class="mt-1 text-ink-500 dark:text-ink-400">Content you manage here is live for every visitor.</p>
      </div>
      <span class="badge" :class="online ? 'badge-brand' : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'">
        <component :is="online ? Wifi : WifiOff" class="h-3.5 w-3.5" />
        {{ online ? 'Connected to server' : 'Server offline' }}
      </span>
    </div>

    <div v-if="!online" class="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm dark:border-red-900/50 dark:bg-red-950/30">
      <WifiOff class="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
      <div class="text-ink-700 dark:text-ink-200">
        <p class="font-semibold">Can't reach the backend API.</p>
        <p class="mt-1 text-ink-500 dark:text-ink-400">Start it with <code>npm start</code> in the <code>/server</code> folder, then refresh.</p>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <RouterLink v-for="c in cards" :key="c.name" :to="c.to" class="card card-hover group p-6">
        <div class="flex items-start justify-between">
          <span class="flex h-12 w-12 items-center justify-center rounded-xl" :class="accentMap[c.accent]">
            <component :is="c.icon" class="h-6 w-6" />
          </span>
          <ArrowRight class="h-5 w-5 text-ink-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-500" />
        </div>
        <div class="mt-4 flex h-9 items-center">
          <Spinner v-if="(c.name !== 'Users' && loading) || (c.name === 'Users' && c.total === null)" size="sm" />
          <p v-else class="font-display text-3xl font-extrabold text-ink-900 dark:text-white">{{ c.total }}</p>
        </div>
        <p class="text-sm font-semibold text-ink-600 dark:text-ink-300">{{ c.name }}</p>
        <p class="mt-1 text-xs text-ink-400">{{ c.name === 'Users' ? 'registered members' : 'in the live database' }}</p>
      </RouterLink>
    </div>

    <!-- Quick add -->
    <div class="mt-8">
      <h2 class="mb-4 text-sm font-bold uppercase tracking-wide text-ink-500 dark:text-ink-400">Quick add</h2>
      <div class="grid gap-3 sm:grid-cols-3">
        <RouterLink to="/admin/books" class="btn btn-outline btn-md justify-start"><Plus class="h-4 w-4" /> Add a book</RouterLink>
        <RouterLink to="/admin/past-papers" class="btn btn-outline btn-md justify-start"><Plus class="h-4 w-4" /> Add a past paper</RouterLink>
        <RouterLink to="/admin/exercises" class="btn btn-outline btn-md justify-start"><Plus class="h-4 w-4" /> Add exercises</RouterLink>
      </div>
    </div>

    <!-- Info -->
    <div class="mt-8 card p-6">
      <h2 class="font-display text-lg font-bold text-ink-900 dark:text-white">How content works</h2>
      <div class="mt-3 flex items-start gap-3 rounded-xl bg-brand-50 p-4 text-sm dark:bg-brand-950/30">
        <Info class="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
        <div class="text-ink-600 dark:text-ink-300">
          <p class="font-semibold text-ink-800 dark:text-ink-100">Everything is saved to a real database (Express + SQLite).</p>
          <ul class="mt-2 list-disc space-y-1 pl-5">
            <li>Books &amp; Past Papers support real <strong>PDF + cover uploads</strong>.</li>
            <li>Exercises let you add <strong>many questions at once</strong> (bulk) or one at a time.</li>
            <li>Anything you add appears on the public site for <strong>all visitors</strong>.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
