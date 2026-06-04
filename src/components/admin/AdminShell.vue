<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import {
  LayoutDashboard, BookOpen, FileText, Brain, Users,
  GraduationCap, ShieldCheck, Menu, X, Lock, Info,
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useContentStore } from '@/composables/useContentStore'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import NotificationBell from '@/components/ui/NotificationBell.vue'
import AdminProfileMenu from '@/components/admin/AdminProfileMenu.vue'

const router = useRouter()
const { isAdmin, ready, login, logout } = useAuth()
useContentStore() // kick off data load once for the whole admin area
const mobileOpen = ref(false)

const nav = [
  { name: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Books', to: '/admin/books', icon: BookOpen },
  { name: 'Past Papers', to: '/admin/past-papers', icon: FileText },
  { name: 'Exercises', to: '/admin/exercises', icon: Brain },
  { name: 'Users', to: '/admin/users', icon: Users },
]

function doLogout() {
  logout()
  router.push('/')
}

// --- Login ---
const username = ref('')
const password = ref('')
const remember = ref(true)
const loginError = ref('')
const loggingIn = ref(false)
async function doLogin() {
  loggingIn.value = true
  loginError.value = ''
  const res = await login(username.value, password.value, remember.value)
  loggingIn.value = false
  if (res.ok) {
    if (res.user?.role !== 'admin') {
      // Logged in, but not an admin — block access to the admin area.
      logout()
      loginError.value = 'This account does not have admin access.'
      return
    }
    username.value = ''
    password.value = ''
  } else {
    loginError.value = res.error || 'Login failed. Check your credentials.'
  }
}

function isActive(item, path) {
  return path === item.to || (!item.exact && path.startsWith(item.to) && item.to !== '/admin')
}
</script>

<template>
  <!-- Initial session check -->
  <div v-if="!ready" class="flex min-h-screen items-center justify-center bg-ink-50/60 dark:bg-ink-950">
    <span class="h-10 w-10 animate-spin rounded-full border-4 border-ink-200 border-t-brand-600 dark:border-ink-700 dark:border-t-brand-400" />
  </div>

  <!-- LOGIN GATE -->
  <div v-else-if="!isAdmin" class="flex min-h-screen items-center justify-center bg-ink-50/60 px-5 dark:bg-ink-950">
    <div class="w-full max-w-md">
      <div class="card p-8 text-center">
        <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ink-900 to-ink-700 text-white dark:from-brand-500 dark:to-brand-700">
          <Lock class="h-7 w-7" />
        </span>
        <h1 class="mt-5 font-display text-2xl font-extrabold text-ink-900 dark:text-white">Admin login</h1>
        <p class="mt-2 text-sm text-ink-500 dark:text-ink-400">Sign in to manage MENYA content.</p>

        <form @submit.prevent="doLogin" class="mt-6 space-y-3 text-left">
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-ink-500 dark:text-ink-400">Username</label>
            <input v-model="username" type="text" placeholder="admin" class="input" autocomplete="username" autofocus />
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-ink-500 dark:text-ink-400">Password</label>
            <PasswordInput v-model="password" :with-icon="false" :invalid="!!loginError" />
          </div>
          <label class="flex cursor-pointer items-center gap-2 text-sm text-ink-600 dark:text-ink-300">
            <input v-model="remember" type="checkbox" class="h-4 w-4 rounded border-ink-300 accent-brand-600" />
            Remember me
          </label>
          <p v-if="loginError" class="text-xs font-medium text-red-500">{{ loginError }}</p>
          <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="loggingIn">
            <span v-if="loggingIn">Signing in…</span>
            <span v-else>Sign in</span>
          </button>
        </form>

        <div class="mt-5 flex items-start gap-2 rounded-xl bg-ink-50 p-3 text-left text-xs text-ink-500 dark:bg-ink-800/60 dark:text-ink-400">
          <Info class="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
          <span>Default account: <strong class="text-ink-700 dark:text-ink-200">admin / menya2026</strong>. Change it in <code>server/.env</code>. The backend must be running.</span>
        </div>
        <RouterLink to="/" class="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">← Back to MENYA</RouterLink>
      </div>
    </div>
  </div>

  <!-- AUTHENTICATED SHELL (persistent — only the inner content swaps on nav) -->
  <div v-else class="min-h-screen bg-ink-50/60 dark:bg-ink-950">
    <!-- Top bar -->
    <header class="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur-xl dark:border-ink-800 dark:bg-ink-950/85">
      <div class="flex h-16 items-center justify-between px-4 sm:px-6">
        <div class="flex items-center gap-3">
          <button class="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden dark:text-ink-300 dark:hover:bg-ink-800" @click="mobileOpen = !mobileOpen" aria-label="Toggle menu">
            <Menu v-if="!mobileOpen" class="h-5 w-5" />
            <X v-else class="h-5 w-5" />
          </button>
          <RouterLink to="/admin" class="flex items-center gap-2.5">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ink-900 to-ink-700 text-white dark:from-brand-500 dark:to-brand-700">
              <ShieldCheck class="h-5 w-5" />
            </span>
            <div class="leading-tight">
              <p class="font-display text-base font-extrabold text-ink-900 dark:text-white">MENYA Admin</p>
              <p class="text-[11px] text-ink-400">Content management</p>
            </div>
          </RouterLink>
        </div>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell />
          <AdminProfileMenu />
        </div>
      </div>
    </header>

    <div class="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:py-8">
      <!-- Sidebar (desktop) -->
      <aside class="hidden w-60 shrink-0 lg:block">
        <nav class="sticky top-24 space-y-1">
          <RouterLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            :class="[
              'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
              isActive(item, $route.path)
                ? 'bg-brand-600 text-white shadow-soft'
                : 'text-ink-600 hover:bg-white hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-900 dark:hover:text-white',
            ]"
          >
            <component :is="item.icon" class="h-4.5 w-4.5" />
            {{ item.name }}
          </RouterLink>

          <RouterLink to="/" class="mt-4 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink-500 hover:bg-white hover:text-brand-700 dark:text-ink-400 dark:hover:bg-ink-900">
            <GraduationCap class="h-4.5 w-4.5" /> Back to MENYA
          </RouterLink>
        </nav>
      </aside>

      <!-- Sidebar (mobile drawer) -->
      <Transition name="fade">
        <div v-if="mobileOpen" class="fixed inset-0 top-16 z-30 lg:hidden">
          <div class="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" @click="mobileOpen = false" />
          <nav class="absolute left-0 top-0 h-full w-64 space-y-1 border-r border-ink-100 bg-white p-4 dark:border-ink-800 dark:bg-ink-950" @click="mobileOpen = false">
            <RouterLink
              v-for="item in nav"
              :key="item.to"
              :to="item.to"
              :class="[
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
                isActive(item, $route.path)
                  ? 'bg-brand-600 text-white'
                  : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800',
              ]"
            >
              <component :is="item.icon" class="h-4.5 w-4.5" /> {{ item.name }}
            </RouterLink>
            <RouterLink to="/" class="mt-4 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink-500 dark:text-ink-400">
              <GraduationCap class="h-4.5 w-4.5" /> Back to MENYA
            </RouterLink>
          </nav>
        </div>
      </Transition>

      <!-- Main content: nested routed pages (shell stays mounted → instant nav) -->
      <main class="min-w-0 flex-1">
        <RouterView v-slot="{ Component }">
          <Transition name="route" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
