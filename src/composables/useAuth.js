import { ref, computed } from 'vue'
import { api, getToken, setToken } from '@/lib/api'

/**
 * Unified authentication for MENYA (students + admins).
 * - JWT stored in localStorage; role is read from the token + /me.
 * - Shared singleton so navbar, dashboards and guards stay in sync.
 */

const user = ref(null)        // { id, name, email, role, username }
const ready = ref(false)      // initial /me check finished
const bookmarks = ref([])     // [{ item_type, item_id }]

function decode(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}
function isExpired(token) {
  const p = decode(token)
  return !p || (p.exp && p.exp * 1000 <= Date.now())
}

const isAuthed = computed(() => !!user.value)
const isAdmin = computed(() => user.value?.role === 'admin')

let initPromise = null
async function init() {
  if (initPromise) return initPromise
  initPromise = (async () => {
    const token = getToken()
    if (!token || isExpired(token)) {
      setToken(null)
      ready.value = true
      return
    }
    try {
      user.value = await api.authGet('/users/me')
      await loadBookmarks()
    } catch {
      setToken(null)
      user.value = null
    } finally {
      ready.value = true
    }
  })()
  return initPromise
}

async function loadBookmarks() {
  if (!isAuthed.value) { bookmarks.value = []; return }
  try {
    bookmarks.value = await api.authGet('/users/me/bookmarks')
  } catch {
    bookmarks.value = []
  }
}

export function useAuth() {
  if (!ready.value && !initPromise) init()

  async function login(identifier, password, remember = true) {
    try {
      const { token, user: u } = await api.login(identifier, password)
      setToken(token, remember)
      user.value = u
      await loadBookmarks()
      return { ok: true, user: u }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }

  async function register(payload, remember = true) {
    try {
      const { token, user: u } = await api.register(payload)
      setToken(token, remember)
      user.value = u
      await loadBookmarks()
      return { ok: true, user: u }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }

  function logout() {
    setToken(null)
    user.value = null
    bookmarks.value = []
  }

  async function updateName(name) {
    user.value = await api.authPatch('/users/me', { name })
    return user.value
  }

  async function changePassword(currentPassword, newPassword) {
    try {
      await api.authPost('/users/me/password', { currentPassword, newPassword })
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }

  async function deleteAccount() {
    try {
      await api.authDelete('/users/me')
      logout()
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }

  // --- bookmarks ---
  function isBookmarked(type, id) {
    return bookmarks.value.some((b) => b.item_type === type && String(b.item_id) === String(id))
  }
  async function toggleBookmark(type, id) {
    if (!isAuthed.value) return { ok: false, needsAuth: true }
    if (isBookmarked(type, id)) {
      await api.authDelete(`/users/me/bookmarks/${type}/${id}`)
    } else {
      await api.authPost('/users/me/bookmarks', { itemType: type, itemId: id })
    }
    await loadBookmarks()
    return { ok: true }
  }

  return {
    user, ready, isAuthed, isAdmin, bookmarks,
    init, login, register, logout, updateName, changePassword, deleteAccount,
    isBookmarked, toggleBookmark, loadBookmarks,
  }
}
