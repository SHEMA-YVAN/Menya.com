<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  LayoutDashboard, Bookmark, Settings, BookOpen, FileText, Brain,
  ArrowRight, Lock, Save, CheckCircle2, ShieldCheck, Trash2, Eye, Download, AlertTriangle,
  Activity, Trophy, Bell, Award,
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useContentStore } from '@/composables/useContentStore'
import { useAuthModal } from '@/composables/useAuthModal'
import { useToast } from '@/composables/useToast'
import { useMeta } from '@/composables/useMeta'
import { useDownload } from '@/composables/useDownload'
import { api } from '@/lib/api'
import Spinner from '@/components/ui/Spinner.vue'
import ToastHost from '@/components/ui/ToastHost.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'

useMeta({ title: 'My Dashboard' })
const route = useRoute()
const router = useRouter()
const { user, isAuthed, ready, isAdmin, bookmarks, updateName, changePassword, deleteAccount, toggleBookmark, loadBookmarks } = useAuth()
const { books, pastPapers } = useContentStore()
const { openAuth } = useAuthModal()
const { notify } = useToast()
const { download } = useDownload()

const tab = ref(route.query.tab || 'overview')
watch(() => route.query.tab, (t) => { if (t) tab.value = t })
function setTab(t) {
  tab.value = t
  router.replace({ query: { ...route.query, tab: t } })
}

// Real activity data
const downloads = ref([])
const scores = ref([])
const notifyEnabled = ref(true)

async function loadActivity() {
  if (!isAuthed.value) return
  try {
    const [dl, sc] = await Promise.all([
      api.authGet('/users/me/downloads'),
      api.authGet('/users/me/scores'),
    ])
    downloads.value = dl
    scores.value = sc
    notifyEnabled.value = user.value?.notifyEnabled !== false
  } catch { /* ignore */ }
}

onMounted(() => {
  if (isAuthed.value) { loadBookmarks(); loadActivity() }
})
watch(ready, (r) => { if (r && isAuthed.value) { loadBookmarks(); loadActivity() } })

const bestScore = computed(() => {
  if (!scores.value.length) return null
  return Math.max(...scores.value.map((s) => Math.round((s.correct / s.total) * 100)))
})
const avgScore = computed(() => {
  if (!scores.value.length) return null
  const pcts = scores.value.map((s) => (s.correct / s.total) * 100)
  return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)
})

async function toggleNotify() {
  notifyEnabled.value = !notifyEnabled.value
  try {
    await api.authPatch('/users/me', { notifyEnabled: notifyEnabled.value })
    notify(notifyEnabled.value ? 'Notifications enabled.' : 'Notifications disabled.')
  } catch {
    notifyEnabled.value = !notifyEnabled.value
    notify('Could not update setting.', 'info')
  }
}

function fmtDate(d) {
  return d ? new Date(d.replace(' ', 'T') + 'Z').toLocaleDateString() : ''
}

// Resolve bookmarked items to full records
const savedBooks = computed(() =>
  bookmarks.value
    .filter((b) => b.item_type === 'book')
    .map((b) => books.value.find((x) => String(x.id) === String(b.item_id)))
    .filter(Boolean)
)
const savedPapers = computed(() =>
  bookmarks.value
    .filter((b) => b.item_type === 'paper')
    .map((b) => pastPapers.value.find((x) => String(x.id) === String(b.item_id)))
    .filter(Boolean)
)

const initials = computed(() => {
  const base = user.value?.name || user.value?.email || '?'
  return base.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
})

const firstName = computed(() => (user.value?.name || 'Learner').split(' ')[0])
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
})

// --- settings: name ---
const nameForm = ref('')
const savingName = ref(false)
watch(user, (u) => { if (u) nameForm.value = u.name || '' }, { immediate: true })
async function saveName() {
  savingName.value = true
  try { await updateName(nameForm.value); notify('Profile updated.') }
  catch (e) { notify(e.message || 'Could not update.', 'info') }
  finally { savingName.value = false }
}

// --- settings: password ---
const pw = ref({ current: '', next: '', confirm: '' })
const pwError = ref('')
const savingPw = ref(false)
async function savePassword() {
  pwError.value = ''
  if (pw.value.next !== pw.value.confirm) { pwError.value = 'New passwords do not match.'; return }
  if (pw.value.next.length < 6) { pwError.value = 'New password must be at least 6 characters.'; return }
  savingPw.value = true
  const res = await changePassword(pw.value.current, pw.value.next)
  savingPw.value = false
  if (res.ok) { notify('Password changed.'); pw.value = { current: '', next: '', confirm: '' } }
  else pwError.value = res.error
}

function dl(type, item) {
  download(type === 'book' ? 'books' : 'papers', item, item.title || item.subject)
}
async function removeBookmark(type, id) {
  await toggleBookmark(type, id)
  notify('Removed from bookmarks.')
}

// --- delete account ---
const confirmDelete = ref(false)
const deletingAccount = ref(false)
async function doDeleteAccount() {
  deletingAccount.value = true
  const res = await deleteAccount()
  deletingAccount.value = false
  confirmDelete.value = false
  if (res.ok) {
    notify('Your account has been deleted.')
    router.push('/')
  } else {
    notify(res.error || 'Could not delete account.', 'info')
  }
}

const privileges = computed(() => {
  const base = [
    { icon: Download, title: 'Download resources', desc: 'Download any book or past paper as a PDF — unlimited and free.' },
    { icon: Bookmark, title: 'Save bookmarks', desc: 'Bookmark books & papers and find them instantly in your dashboard.' },
    { icon: Trophy, title: 'Track quiz scores', desc: 'Your exercise results are saved so you can watch your progress.' },
    { icon: Bell, title: 'Get notified', desc: 'Be the first to know when new books and papers are added.' },
  ]
  if (isAdmin.value) {
    base.push({ icon: ShieldCheck, title: 'Admin access', desc: 'Manage all books, papers, exercises and content from the admin panel.' })
  }
  return base
})

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
]
</script>

<template>
  <div class="container-page py-10 lg:py-14">
    <!-- Loading session -->
    <div v-if="!ready" class="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" />
    </div>

    <!-- Not logged in -->
    <div v-else-if="!isAuthed" class="mx-auto max-w-md py-16 text-center">
      <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300">
        <Lock class="h-8 w-8" />
      </span>
      <h1 class="mt-5 font-display text-2xl font-extrabold text-ink-900 dark:text-white">Please log in</h1>
      <p class="mt-2 text-ink-500 dark:text-ink-400">Log in to view your dashboard, bookmarks and settings.</p>
      <button @click="openAuth('login')" class="btn btn-primary btn-lg mt-6">Log in or sign up</button>
    </div>

    <!-- Dashboard -->
    <div v-else>
      <!-- Welcome banner -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-600 to-brand-700 p-6 text-white shadow-glow sm:p-8">
        <div class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-12 right-16 h-40 w-40 rounded-full bg-accent-400/20 blur-3xl" aria-hidden="true" />
        <div class="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold text-white backdrop-blur ring-2 ring-white/20">
              {{ initials }}
            </span>
            <div>
              <p class="text-sm font-medium text-brand-50">{{ greeting }},</p>
              <h1 class="font-display text-2xl font-extrabold text-white sm:text-3xl">{{ firstName }} 👋</h1>
              <p class="mt-0.5 text-sm text-brand-100">{{ user.email }}</p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wide backdrop-blur">
              <component :is="isAdmin ? ShieldCheck : Award" class="h-3.5 w-3.5" />
              {{ isAdmin ? 'Administrator' : 'Member' }}
            </span>
            <RouterLink v-if="isAdmin" to="/admin" class="btn btn-md bg-white text-brand-700 hover:bg-brand-50">
              <ShieldCheck class="h-4 w-4" /> Admin Panel
            </RouterLink>
          </div>
        </div>

        <!-- quick stats inline -->
        <div class="relative mt-6 grid grid-cols-3 gap-3">
          <div class="rounded-2xl bg-white/10 p-3 text-center backdrop-blur">
            <p class="font-display text-2xl font-extrabold">{{ savedBooks.length + savedPapers.length }}</p>
            <p class="text-[11px] font-medium text-brand-100">Saved</p>
          </div>
          <div class="rounded-2xl bg-white/10 p-3 text-center backdrop-blur">
            <p class="font-display text-2xl font-extrabold">{{ downloads.length }}</p>
            <p class="text-[11px] font-medium text-brand-100">Downloads</p>
          </div>
          <div class="rounded-2xl bg-white/10 p-3 text-center backdrop-blur">
            <p class="font-display text-2xl font-extrabold">{{ scores.length }}</p>
            <p class="text-[11px] font-medium text-brand-100">Quizzes</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mt-8 flex gap-1 border-b border-ink-100 dark:border-ink-800">
        <button
          v-for="tb in tabs"
          :key="tb.id"
          @click="setTab(tb.id)"
          class="relative inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors"
          :class="tab === tb.id ? 'text-brand-700 dark:text-brand-300' : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100'"
        >
          <component :is="tb.icon" class="h-4.5 w-4.5" /> {{ tb.label }}
          <span v-if="tab === tb.id" class="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" />
        </button>
      </div>

      <!-- OVERVIEW -->
      <div v-if="tab === 'overview'" class="mt-8">
        <div class="grid gap-5 sm:grid-cols-3">
          <div class="card p-6">
            <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300"><Bookmark class="h-5 w-5" /></span>
            <p class="mt-4 font-display text-3xl font-extrabold text-ink-900 dark:text-white">{{ savedBooks.length + savedPapers.length }}</p>
            <p class="text-sm font-semibold text-ink-600 dark:text-ink-300">Saved items</p>
          </div>
          <RouterLink to="/books" class="card card-hover group p-6">
            <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-950/50 dark:text-accent-300"><BookOpen class="h-5 w-5" /></span>
            <p class="mt-4 font-semibold text-ink-900 dark:text-white">Browse Books</p>
            <span class="mt-1 inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400">Explore <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </RouterLink>
          <RouterLink to="/exercises" class="card card-hover group p-6">
            <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-600 dark:bg-gold-600/15 dark:text-gold-300"><Brain class="h-5 w-5" /></span>
            <p class="mt-4 font-semibold text-ink-900 dark:text-white">Practice Exercises</p>
            <span class="mt-1 inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400">Start <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </RouterLink>
        </div>
        <div class="mt-6">
          <h3 class="font-display text-lg font-bold text-ink-900 dark:text-white">Your member privileges</h3>
          <p class="mt-1 text-sm text-ink-500 dark:text-ink-400">As a logged-in member you unlock:</p>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div v-for="p in privileges" :key="p.title" class="card flex items-start gap-3 p-5">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300">
                <component :is="p.icon" class="h-5 w-5" />
              </span>
              <div>
                <p class="font-semibold text-ink-900 dark:text-white">{{ p.title }}</p>
                <p class="mt-0.5 text-sm text-ink-500 dark:text-ink-400">{{ p.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- BOOKMARKS -->
      <div v-else-if="tab === 'bookmarks'" class="mt-8 space-y-8">
        <section>
          <h3 class="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink-900 dark:text-white"><BookOpen class="h-5 w-5 text-brand-600" /> Saved books ({{ savedBooks.length }})</h3>
          <div v-if="savedBooks.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="b in savedBooks" :key="b.id" class="card flex flex-col p-5">
              <span class="badge badge-brand self-start">{{ b.level }}</span>
              <p class="mt-2 font-bold text-ink-900 dark:text-white">{{ b.title }}</p>
              <p class="text-xs text-ink-400">{{ b.subject }} · {{ b.year }}</p>
              <div class="mt-4 flex gap-2 border-t border-ink-100 pt-3 dark:border-ink-800">
                <button @click="dl('book', b)" class="btn btn-primary btn-sm flex-1"><Download class="h-4 w-4" /> Download</button>
                <button @click="removeBookmark('book', b.id)" class="btn btn-outline btn-sm" aria-label="Remove"><Trash2 class="h-4 w-4" /></button>
              </div>
            </div>
          </div>
          <p v-else class="rounded-2xl border border-dashed border-ink-200 py-10 text-center text-sm text-ink-400 dark:border-ink-700">
            No saved books yet. Tap the bookmark icon on any book to save it here.
          </p>
        </section>

        <section>
          <h3 class="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink-900 dark:text-white"><FileText class="h-5 w-5 text-accent-600" /> Saved past papers ({{ savedPapers.length }})</h3>
          <div v-if="savedPapers.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="p in savedPapers" :key="p.id" class="card flex flex-col p-5">
              <span class="badge badge-accent self-start">{{ p.level }}</span>
              <p class="mt-2 font-bold text-ink-900 dark:text-white">{{ p.subject }}</p>
              <p class="text-xs text-ink-400">{{ p.type }} · {{ p.year }}</p>
              <div class="mt-4 flex gap-2 border-t border-ink-100 pt-3 dark:border-ink-800">
                <button @click="dl('paper', p)" class="btn btn-secondary btn-sm flex-1"><Download class="h-4 w-4" /> Download</button>
                <button @click="removeBookmark('paper', p.id)" class="btn btn-outline btn-sm" aria-label="Remove"><Trash2 class="h-4 w-4" /></button>
              </div>
            </div>
          </div>
          <p v-else class="rounded-2xl border border-dashed border-ink-200 py-10 text-center text-sm text-ink-400 dark:border-ink-700">
            No saved past papers yet.
          </p>
        </section>
      </div>

      <!-- ACTIVITY -->
      <div v-else-if="tab === 'activity'" class="mt-8 space-y-8">
        <!-- Quiz performance -->
        <section>
          <h3 class="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink-900 dark:text-white"><Trophy class="h-5 w-5 text-gold-500" /> Quiz performance</h3>
          <div v-if="scores.length" class="grid gap-4 sm:grid-cols-3">
            <div class="card p-5">
              <p class="text-xs text-ink-400">Quizzes taken</p>
              <p class="mt-1 font-display text-2xl font-extrabold text-ink-900 dark:text-white">{{ scores.length }}</p>
            </div>
            <div class="card p-5">
              <p class="text-xs text-ink-400">Average score</p>
              <p class="mt-1 font-display text-2xl font-extrabold text-brand-600 dark:text-brand-400">{{ avgScore }}%</p>
            </div>
            <div class="card p-5">
              <p class="text-xs text-ink-400">Best score</p>
              <p class="mt-1 font-display text-2xl font-extrabold text-gold-500">{{ bestScore }}%</p>
            </div>
          </div>
          <div v-if="scores.length" class="card mt-4 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead><tr class="border-b border-ink-100 bg-ink-50/60 text-left dark:border-ink-800 dark:bg-ink-800/40">
                  <th class="px-4 py-2.5 font-semibold text-ink-600 dark:text-ink-300">Subject</th>
                  <th class="px-4 py-2.5 font-semibold text-ink-600 dark:text-ink-300">Level</th>
                  <th class="px-4 py-2.5 font-semibold text-ink-600 dark:text-ink-300">Score</th>
                  <th class="px-4 py-2.5 font-semibold text-ink-600 dark:text-ink-300">Date</th>
                </tr></thead>
                <tbody>
                  <tr v-for="(s, i) in scores.slice(0, 10)" :key="i" class="border-b border-ink-50 last:border-0 dark:border-ink-800/60">
                    <td class="px-4 py-2.5 font-medium text-ink-800 dark:text-ink-100">{{ s.subject || 'Mixed' }}</td>
                    <td class="px-4 py-2.5 text-ink-600 dark:text-ink-300">{{ s.level || '—' }}</td>
                    <td class="px-4 py-2.5"><span class="badge" :class="(s.correct/s.total)>=0.7 ? 'badge-brand' : 'badge-gold'">{{ s.correct }}/{{ s.total }} · {{ Math.round((s.correct/s.total)*100) }}%</span></td>
                    <td class="px-4 py-2.5 text-ink-500 dark:text-ink-400">{{ fmtDate(s.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p v-else class="rounded-2xl border border-dashed border-ink-200 py-10 text-center text-sm text-ink-400 dark:border-ink-700">
            No quizzes yet. <RouterLink to="/exercises" class="font-semibold text-brand-600 hover:underline dark:text-brand-400">Try an exercise →</RouterLink>
          </p>
        </section>

        <!-- Download history -->
        <section>
          <h3 class="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink-900 dark:text-white"><Download class="h-5 w-5 text-brand-600" /> Download history ({{ downloads.length }})</h3>
          <div v-if="downloads.length" class="card divide-y divide-ink-100 dark:divide-ink-800">
            <div v-for="(d, i) in downloads.slice(0, 20)" :key="i" class="flex items-center gap-3 px-4 py-3">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" :class="d.item_type === 'book' ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300' : 'bg-accent-50 text-accent-600 dark:bg-accent-950/50 dark:text-accent-300'">
                <component :is="d.item_type === 'book' ? BookOpen : FileText" class="h-4.5 w-4.5" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{{ d.title }}</p>
                <p class="text-xs text-ink-400">{{ d.item_type }} · {{ fmtDate(d.created_at) }}</p>
              </div>
            </div>
          </div>
          <p v-else class="rounded-2xl border border-dashed border-ink-200 py-10 text-center text-sm text-ink-400 dark:border-ink-700">
            No downloads yet. Your downloaded books &amp; papers will appear here.
          </p>
        </section>
      </div>

      <!-- SETTINGS -->
      <div v-else-if="tab === 'settings'" class="mt-8 grid gap-6 lg:grid-cols-2">
        <div class="card p-6">
          <h3 class="font-display text-lg font-bold text-ink-900 dark:text-white">Profile</h3>
          <div class="mt-4 space-y-4">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Full name</label>
              <input v-model="nameForm" type="text" class="input" placeholder="Your name" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Email</label>
              <input :value="user.email" type="email" class="input opacity-60" disabled />
              <p class="mt-1 text-xs text-ink-400">Email can't be changed.</p>
            </div>
            <button @click="saveName" class="btn btn-primary btn-md" :disabled="savingName"><Save class="h-4 w-4" /> {{ savingName ? 'Saving…' : 'Save changes' }}</button>

            <!-- Notification preference -->
            <div class="mt-2 flex items-center justify-between rounded-xl border border-ink-100 p-3.5 dark:border-ink-800">
              <div class="flex items-center gap-3">
                <Bell class="h-5 w-5 text-ink-400" />
                <div>
                  <p class="text-sm font-semibold text-ink-800 dark:text-ink-100">Notifications</p>
                  <p class="text-xs text-ink-400">Get notified about new books &amp; papers.</p>
                </div>
              </div>
              <button
                @click="toggleNotify"
                role="switch"
                :aria-checked="notifyEnabled"
                class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
                :class="notifyEnabled ? 'bg-brand-600' : 'bg-ink-300 dark:bg-ink-700'"
              >
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="notifyEnabled ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h3 class="font-display text-lg font-bold text-ink-900 dark:text-white">Change password</h3>
          <div class="mt-4 space-y-4">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Current password</label>
              <PasswordInput v-model="pw.current" autocomplete="current-password" :with-icon="false" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">New password</label>
              <PasswordInput v-model="pw.next" autocomplete="new-password" :with-icon="false" show-strength />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Confirm new password</label>
              <PasswordInput v-model="pw.confirm" autocomplete="new-password" :with-icon="false" :invalid="!!pw.confirm && pw.confirm !== pw.next" />
            </div>
            <p v-if="pwError" class="text-sm font-medium text-red-500">{{ pwError }}</p>
            <button @click="savePassword" class="btn btn-primary btn-md" :disabled="savingPw"><Lock class="h-4 w-4" /> {{ savingPw ? 'Updating…' : 'Update password' }}</button>
          </div>
        </div>
      </div>

      <!-- Danger zone -->
      <div v-if="tab === 'settings'" class="mt-6">
        <div class="card border-red-200 p-6 dark:border-red-900/50">
          <h3 class="flex items-center gap-2 font-display text-lg font-bold text-red-600 dark:text-red-400">
            <AlertTriangle class="h-5 w-5" /> Danger zone
          </h3>
          <p class="mt-2 text-sm text-ink-500 dark:text-ink-400">
            Permanently delete your account and all your bookmarks. This cannot be undone.
          </p>
          <button @click="confirmDelete = true" class="btn btn-md mt-4 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            <Trash2 class="h-4 w-4" /> Delete my account
          </button>
        </div>
      </div>
    </div>

    <!-- Delete-account confirm -->
    <Transition name="welcome">
      <div v-if="confirmDelete" class="fixed inset-0 z-[80] flex items-center justify-center p-5">
        <div class="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" @click="confirmDelete = false" />
        <div class="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-soft dark:bg-ink-900">
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/40">
            <AlertTriangle class="h-6 w-6" />
          </span>
          <h3 class="mt-4 font-display text-lg font-bold text-ink-900 dark:text-white">Delete your account?</h3>
          <p class="mt-2 text-sm text-ink-500 dark:text-ink-400">This permanently removes your account and bookmarks. This action can't be undone.</p>
          <div class="mt-6 flex gap-2">
            <button @click="confirmDelete = false" class="btn btn-ghost btn-md flex-1">Cancel</button>
            <button @click="doDeleteAccount" class="btn btn-md flex-1 bg-red-600 text-white hover:bg-red-700" :disabled="deletingAccount">
              {{ deletingAccount ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <ToastHost />
  </div>
</template>
