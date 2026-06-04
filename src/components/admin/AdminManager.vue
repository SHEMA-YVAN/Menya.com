<script setup>
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, Search } from 'lucide-vue-next'
import AdminFormModal from '@/components/admin/AdminFormModal.vue'
import Spinner from '@/components/ui/Spinner.vue'

/**
 * Generic CRUD manager. Parent passes async callbacks (onAdd/onEdit/onDelete)
 * that hit the API; this component handles the table, modal and busy states.
 */
const props = defineProps({
  title: String,
  subtitle: String,
  icon: [Object, Function],
  items: { type: Array, required: true },
  columns: { type: Array, required: true },
  fields: { type: Array, required: true },
  searchKeys: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  onAdd: { type: Function, required: true },
  onEdit: { type: Function, required: true },
  onDelete: { type: Function, required: true },
})

const query = ref('')
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.items
  return props.items.filter((it) => props.searchKeys.some((k) => String(it[k] ?? '').toLowerCase().includes(q)))
})

const modalOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
function openAdd() { editing.value = null; modalOpen.value = true }
function openEdit(item) { editing.value = item; modalOpen.value = true }

async function handleSave(data) {
  saving.value = true
  try {
    if (editing.value) await props.onEdit(editing.value.id, data)
    else await props.onAdd(data)
    modalOpen.value = false
  } catch (err) {
    // error toast is shown by parent; keep modal open
    console.error(err)
  } finally {
    saving.value = false
  }
}

const deleting = ref(null)
const deletingBusy = ref(false)
function confirmDelete(item) { deleting.value = item }
async function handleDelete() {
  deletingBusy.value = true
  try {
    await props.onDelete(deleting.value.id)
    deleting.value = null
  } catch (err) {
    console.error(err)
  } finally {
    deletingBusy.value = false
  }
}

function cellValue(item, col) {
  const v = item[col.key]
  if (Array.isArray(v)) return `${v.length} options`
  if (col.key === 'pdfUrl') return v ? 'PDF ✓' : '—'
  return v
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="flex items-center gap-2 font-display text-2xl font-extrabold text-ink-900 dark:text-white">
          <component :is="icon" class="h-6 w-6 text-brand-600" /> {{ title }}
        </h1>
        <p class="mt-1 text-ink-500 dark:text-ink-400">{{ subtitle }}</p>
      </div>
      <button @click="openAdd" class="btn btn-primary btn-md shrink-0"><Plus class="h-4 w-4" /> Add new</button>
    </div>

    <!-- Search + count -->
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div class="relative w-full max-w-xs">
        <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input v-model="query" type="search" placeholder="Search…" class="input !py-2.5 pl-10" />
      </div>
      <span class="badge badge-ink">{{ filtered.length }} of {{ items.length }}</span>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-ink-100 bg-ink-50/60 text-left dark:border-ink-800 dark:bg-ink-800/40">
              <th v-for="col in columns" :key="col.key" class="px-4 py-3 font-semibold text-ink-600 dark:text-ink-300">{{ col.label }}</th>
              <th class="px-4 py-3 text-right font-semibold text-ink-600 dark:text-ink-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading state -->
            <tr v-if="loading && !items.length">
              <td :colspan="columns.length + 1" class="px-4 py-16">
                <Spinner center label="Loading…" />
              </td>
            </tr>
            <tr v-for="item in (loading && !items.length ? [] : filtered)" :key="item.id" class="border-b border-ink-50 transition-colors last:border-0 hover:bg-ink-50/50 dark:border-ink-800/60 dark:hover:bg-ink-800/30">
              <td v-for="(col, i) in columns" :key="col.key" class="px-4 py-3 align-middle">
                <span v-if="col.badge" class="badge badge-brand">{{ cellValue(item, col) }}</span>
                <span v-else :class="i === 0 ? 'font-semibold text-ink-800 dark:text-ink-100' : 'text-ink-600 dark:text-ink-300'">
                  {{ cellValue(item, col) }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="inline-flex gap-1">
                  <button @click="openEdit(item)" class="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-accent-600 dark:hover:bg-ink-800" aria-label="Edit">
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button @click="confirmDelete(item)" class="rounded-lg p-2 text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40" aria-label="Delete">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !filtered.length">
              <td :colspan="columns.length + 1" class="px-4 py-14 text-center text-ink-400">No items found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit modal -->
    <AdminFormModal
      :open="modalOpen"
      :title="editing ? `Edit ${title.toLowerCase().replace(/s$/, '')}` : `Add ${title.toLowerCase().replace(/s$/, '')}`"
      :fields="fields"
      :model="editing || {}"
      :saving="saving"
      @close="modalOpen = false"
      @save="handleSave"
    />

    <!-- Delete confirm -->
    <Transition name="modal">
      <div v-if="deleting" class="fixed inset-0 z-[70] flex items-center justify-center p-5">
        <div class="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" @click="deleting = null" />
        <div class="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-soft dark:bg-ink-900">
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/40">
            <Trash2 class="h-6 w-6" />
          </span>
          <h3 class="mt-4 font-display text-lg font-bold text-ink-900 dark:text-white">Delete this item?</h3>
          <p class="mt-2 text-sm text-ink-500 dark:text-ink-400">This permanently removes it from the database for all users.</p>
          <div class="mt-6 flex gap-2">
            <button @click="deleting = null" class="btn btn-ghost btn-md flex-1">Cancel</button>
            <button @click="handleDelete" class="btn btn-md flex-1 bg-red-600 text-white hover:bg-red-700" :disabled="deletingBusy">
              {{ deletingBusy ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
</style>
