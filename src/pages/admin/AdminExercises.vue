<script setup>
import { ref } from 'vue'
import { Brain, Layers } from 'lucide-vue-next'
import AdminManager from '@/components/admin/AdminManager.vue'
import BulkExerciseModal from '@/components/admin/BulkExerciseModal.vue'
import ToastHost from '@/components/ui/ToastHost.vue'
import { useContentStore } from '@/composables/useContentStore'
import { useToast } from '@/composables/useToast'
import { SUBJECTS } from '@/data/constants'

const { exercises, loading, addItem, updateItem, deleteItem, addMany } = useContentStore()
const { notify } = useToast()

const LEVELS = ['P6', 'S3', 'S6']
const DIFFICULTY = ['Easy', 'Medium', 'Hard']

const columns = [
  { key: 'question', label: 'Question' },
  { key: 'subject', label: 'Subject' },
  { key: 'level', label: 'Level', badge: true },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'options', label: 'Options' },
]

const fields = [
  { key: 'question', label: 'Question', type: 'textarea', required: true, placeholder: 'What is 7 × 8?' },
  { key: 'subject', label: 'Subject', type: 'select', required: true, options: SUBJECTS },
  { key: 'level', label: 'Level', type: 'select', required: true, options: LEVELS },
  { key: 'difficulty', label: 'Difficulty', type: 'select', options: DIFFICULTY },
  { key: 'options', label: 'Answer options (select the correct one)', type: 'options-list', required: true },
  { key: 'explanation', label: 'Explanation (shown after answering)', type: 'textarea', placeholder: 'Why the answer is correct…' },
]

async function onAdd(data) {
  try { await addItem('exercises', data); notify('Exercise added.') }
  catch (e) { notify(e.message, 'info'); throw e }
}
async function onEdit(id, data) {
  try { await updateItem('exercises', id, data); notify('Exercise updated.') }
  catch (e) { notify(e.message, 'info'); throw e }
}
async function onDelete(id) {
  try { await deleteItem('exercises', id); notify('Exercise deleted.') }
  catch (e) { notify(e.message, 'info'); throw e }
}

// --- Bulk add ---
const bulkOpen = ref(false)
const bulkSaving = ref(false)
async function onBulkSave(items) {
  bulkSaving.value = true
  try {
    await addMany('exercises', items)
    notify(`${items.length} question${items.length === 1 ? '' : 's'} added.`)
    bulkOpen.value = false
  } catch (e) {
    notify(e.message || 'Bulk add failed.', 'info')
  } finally {
    bulkSaving.value = false
  }
}
</script>

<template>
  <div>
    <!-- Bulk-add banner -->
    <div class="mb-5 flex flex-col gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-brand-800/50 dark:bg-brand-950/20">
      <div class="flex items-start gap-3">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Layers class="h-5 w-5" />
        </span>
        <div>
          <p class="font-semibold text-ink-800 dark:text-ink-100">Add many questions at once</p>
          <p class="text-sm text-ink-500 dark:text-ink-400">Set the subject &amp; level once, then enter several questions in one go.</p>
        </div>
      </div>
      <button @click="bulkOpen = true" class="btn btn-primary btn-md shrink-0">
        <Layers class="h-4 w-4" /> Bulk add questions
      </button>
    </div>

    <AdminManager
      title="Exercises"
      subtitle="Add one question at a time below, or use “Bulk add” above for many."
      :icon="Brain"
      :items="exercises"
      :loading="loading"
      :columns="columns"
      :fields="fields"
      :search-keys="['question', 'subject', 'level']"
      :on-add="onAdd"
      :on-edit="onEdit"
      :on-delete="onDelete"
    />

    <BulkExerciseModal :open="bulkOpen" :saving="bulkSaving" @close="bulkOpen = false" @save="onBulkSave" />
    <ToastHost />
  </div>
</template>
