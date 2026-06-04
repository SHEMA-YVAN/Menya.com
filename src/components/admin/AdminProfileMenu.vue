<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Settings, KeyRound, ExternalLink, LogOut, ChevronDown } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { user, logout } = useAuth()
const { notify } = useToast()

const open = ref(false)
const root = ref(null)

const initials = computed(() => {
  const base = user.value?.name || user.value?.username || 'A'
  return base.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
})

function go(path) { open.value = false; router.push(path) }
function doLogout() {
  open.value = false
  logout()
  notify('You have been logged out.')
  router.push('/')
}
function onClickOutside(e) { if (root.value && !root.value.contains(e.target)) open.value = false }
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="root" class="relative">
    <button
      @click="open = !open"
      class="flex items-center gap-1.5 rounded-full border border-ink-200 bg-white py-1 pl-1 pr-2 transition-all hover:border-brand-300 hover:shadow-soft dark:border-ink-700 dark:bg-ink-900 dark:hover:border-brand-700"
      :aria-expanded="open"
      aria-label="Admin account menu"
    >
      <span class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-ink-900 to-ink-700 text-xs font-bold text-white dark:from-brand-500 dark:to-brand-700">
        {{ initials }}
      </span>
      <ChevronDown class="h-4 w-4 text-ink-400 transition-transform" :class="open ? 'rotate-180' : ''" />
    </button>

    <Transition name="menu">
      <div v-if="open" class="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft dark:border-ink-800 dark:bg-ink-900" role="menu">
        <div class="flex items-center gap-3 border-b border-ink-100 bg-ink-50/60 p-4 dark:border-ink-800 dark:bg-ink-800/40">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-900 to-ink-700 text-sm font-bold text-white dark:from-brand-500 dark:to-brand-700">{{ initials }}</span>
          <div class="min-w-0">
            <p class="truncate font-bold text-ink-900 dark:text-white">{{ user?.name || 'Administrator' }}</p>
            <p class="truncate text-xs text-ink-400">{{ user?.email || user?.username }}</p>
            <span class="mt-1 inline-flex rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold uppercase text-accent-600 dark:bg-accent-950/50 dark:text-accent-300">Admin</span>
          </div>
        </div>

        <div class="p-1.5">
          <button @click="go('/dashboard?tab=settings')" class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800" role="menuitem">
            <Settings class="h-4.5 w-4.5 text-ink-400" /> Account settings
          </button>
          <button @click="go('/dashboard?tab=settings')" class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800" role="menuitem">
            <KeyRound class="h-4.5 w-4.5 text-ink-400" /> Change password
          </button>
          <a href="/" target="_blank" class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800" role="menuitem">
            <ExternalLink class="h-4.5 w-4.5 text-ink-400" /> View site
          </a>
        </div>

        <div class="border-t border-ink-100 p-1.5 dark:border-ink-800">
          <button @click="doLogout" class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40" role="menuitem">
            <LogOut class="h-4.5 w-4.5" /> Log out
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.menu-enter-active,
.menu-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.menu-enter-from,
.menu-leave-to { opacity: 0; transform: translateY(-6px) scale(0.98); }
</style>
