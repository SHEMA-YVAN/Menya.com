import { ref, computed } from 'vue'
import { api, fileUrl } from '@/lib/api'

/**
 * Backend-powered content store.
 *
 * Fetches books / past papers / exercises from the MENYA API (Express + SQLite),
 * so content added in the admin panel is GLOBAL — every visitor sees it.
 *
 * State is a shared singleton; the first component to use it triggers a load.
 * Write methods call the API then refresh the relevant collection.
 */

const books = ref([])
const pastPapers = ref([])
const exercises = ref([])

const loading = ref(false)
const loaded = ref(false)
const online = ref(true)
const error = ref(null)

let loadingPromise = null

async function loadAll(force = false) {
  if (loaded.value && !force) return
  if (loadingPromise) return loadingPromise
  loading.value = true
  error.value = null
  loadingPromise = (async () => {
    try {
      const [b, p, e] = await Promise.all([
        api.list('books'),
        api.list('papers'),
        api.list('exercises'),
      ])
      books.value = b
      pastPapers.value = p
      exercises.value = e
      online.value = true
      loaded.value = true
    } catch (err) {
      online.value = false
      error.value = err.message
      console.warn('[MENYA] Could not reach API — is the backend running?', err.message)
    } finally {
      loading.value = false
      loadingPromise = null
    }
  })()
  return loadingPromise
}

const RESOURCE = { books: 'books', papers: 'papers', exercises: 'exercises' }

async function refresh(coll) {
  const data = await api.list(RESOURCE[coll])
  if (coll === 'books') books.value = data
  else if (coll === 'papers') pastPapers.value = data
  else exercises.value = data
}

export function useContentStore() {
  // Kick off the initial load once
  if (!loaded.value && !loadingPromise) loadAll()

  /**
   * Create an item.
   * @param coll 'books' | 'papers' | 'exercises'
   * @param data plain object OR FormData (for file uploads on books/papers)
   */
  async function addItem(coll, data) {
    if (data instanceof FormData) {
      await api.createForm(RESOURCE[coll], data)
    } else {
      await api.createJSON(RESOURCE[coll], data)
    }
    await refresh(coll)
  }

  async function updateItem(coll, id, data) {
    if (data instanceof FormData) {
      await api.updateForm(RESOURCE[coll], id, data)
    } else {
      await api.updateJSON(RESOURCE[coll], id, data)
    }
    await refresh(coll)
  }

  async function deleteItem(coll, id) {
    await api.remove(RESOURCE[coll], id)
    await refresh(coll)
  }

  /** Create many JSON items at once (used for bulk exercise upload). */
  async function addMany(coll, items) {
    // Send sequentially to keep it simple & reliable; refresh once at the end.
    for (const item of items) {
      await api.createJSON(RESOURCE[coll], item)
    }
    await refresh(coll)
  }

  function trackDownload(coll, id) {
    api.trackDownload(RESOURCE[coll], id)
  }

  // Everything is server-managed now, so there are no "custom vs seed" items.
  function itemIsCustom() {
    return false
  }

  const stats = computed(() => ({
    books: { total: books.value.length, custom: books.value.length },
    papers: { total: pastPapers.value.length, custom: pastPapers.value.length },
    exercises: { total: exercises.value.length, custom: exercises.value.length },
  }))

  return {
    books, pastPapers, exercises,
    loading, loaded, online, error,
    loadAll, refresh,
    addItem, updateItem, deleteItem, addMany, trackDownload,
    itemIsCustom, stats,
    fileUrl,
  }
}
