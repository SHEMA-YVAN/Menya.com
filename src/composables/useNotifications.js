import { ref, computed } from 'vue'
import { api } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

/**
 * Notifications: bell dropdown data + live polling + toast on new arrivals.
 * Shared singleton across the app.
 */
const items = ref([])
const unread = ref(0)
const loaded = ref(false)
let poll = null
let lastSeenId = 0

const { notify } = useToast()

async function refresh(announce = false) {
  const { isAuthed } = useAuth()
  if (!isAuthed.value) { items.value = []; unread.value = 0; return }
  try {
    const data = await api.authGet('/notifications')
    // Toast for genuinely new notifications (after first load)
    if (announce && loaded.value && data.items.length) {
      const newest = data.items[0]
      if (newest && newest.id > lastSeenId) {
        notify(newest.title)
      }
    }
    if (data.items.length) lastSeenId = Math.max(lastSeenId, data.items[0].id)
    items.value = data.items
    unread.value = data.unread
    loaded.value = true
  } catch {
    /* ignore transient errors */
  }
}

export function useNotifications() {
  const { isAuthed } = useAuth()

  function start() {
    stop()
    refresh()
    poll = setInterval(() => refresh(true), 20000)
  }
  function stop() {
    if (poll) clearInterval(poll)
    poll = null
  }

  async function markAllRead() {
    await api.authPost('/notifications/read-all', {})
    items.value = items.value.map((n) => ({ ...n, is_read: 1 }))
    unread.value = 0
  }
  async function markRead(id) {
    await api.authPost(`/notifications/${id}/read`, {})
    items.value = items.value.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
    unread.value = Math.max(0, unread.value - 1)
  }
  async function clearAll() {
    await api.authDelete('/notifications')
    items.value = []
    unread.value = 0
  }

  return { items, unread, loaded, refresh, start, stop, markAllRead, markRead, clearAll, isAuthed }
}
