<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, BookOpen, FileText, UserPlus, Check, Trash2, BellOff } from 'lucide-vue-next'
import { useNotifications } from '@/composables/useNotifications'

const router = useRouter()
const { items, unread, start, stop, markAllRead, markRead, clearAll } = useNotifications()

const open = ref(false)
const root = ref(null)

const iconFor = (t) => ({ new_book: BookOpen, new_paper: FileText, new_user: UserPlus }[t] || Bell)

function timeAgo(d) {
  if (!d) return ''
  const then = new Date(d.replace(' ', 'T') + 'Z').getTime()
  const s = Math.floor((Date.now() - then) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

async function onItem(n) {
  if (!n.is_read) await markRead(n.id)
  open.value = false
  if (n.link) router.push(n.link)
}

function onClickOutside(e) {
  if (root.value && !root.value.contains(e.target)) open.value = false
}
onMounted(() => {
  start()
  document.addEventListener('click', onClickOutside)
})
onBeforeUnmount(() => {
  stop()
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      @click="open = !open"
      class="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-600 transition-all hover:border-brand-300 hover:text-brand-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300 dark:hover:border-brand-700 dark:hover:text-brand-300"
      :aria-label="`Notifications${unread ? ' (' + unread + ' unread)' : ''}`"
    >
      <Bell class="h-5 w-5" />
      <span
        v-if="unread"
        class="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
      >
        {{ unread > 9 ? '9+' : unread }}
      </span>
    </button>

    <Transition name="menu">
      <div
        v-if="open"
        class="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft dark:border-ink-800 dark:bg-ink-900"
        role="menu"
      >
        <div class="flex items-center justify-between border-b border-ink-100 px-4 py-3 dark:border-ink-800">
          <p class="font-display text-sm font-bold text-ink-900 dark:text-white">Notifications</p>
          <div class="flex items-center gap-1">
            <button v-if="unread" @click="markAllRead" class="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-brand-600 dark:hover:bg-ink-800" title="Mark all read"><Check class="h-4 w-4" /></button>
            <button v-if="items.length" @click="clearAll" class="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-red-600 dark:hover:bg-ink-800" title="Clear all"><Trash2 class="h-4 w-4" /></button>
          </div>
        </div>

        <div class="max-h-96 overflow-y-auto">
          <div v-if="!items.length" class="flex flex-col items-center px-4 py-10 text-center">
            <BellOff class="h-7 w-7 text-ink-300" />
            <p class="mt-2 text-sm text-ink-400">No notifications yet</p>
          </div>
          <button
            v-for="n in items"
            :key="n.id"
            @click="onItem(n)"
            class="flex w-full items-start gap-3 border-b border-ink-50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-ink-50/60 dark:border-ink-800/60 dark:hover:bg-ink-800/40"
            :class="!n.is_read ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''"
          >
            <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300">
              <component :is="iconFor(n.type)" class="h-4 w-4" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-semibold text-ink-800 dark:text-ink-100">{{ n.title }}</span>
              <span class="block truncate text-xs text-ink-500 dark:text-ink-400">{{ n.body }}</span>
              <span class="mt-0.5 block text-[11px] text-ink-400">{{ timeAgo(n.created_at) }}</span>
            </span>
            <span v-if="!n.is_read" class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
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
