<script setup>
import { FileText } from 'lucide-vue-next'
import AdminManager from '@/components/admin/AdminManager.vue'
import ToastHost from '@/components/ui/ToastHost.vue'
import { useContentStore } from '@/composables/useContentStore'
import { useToast } from '@/composables/useToast'
import { EXAM_LEVELS, EXAM_YEARS, SUBJECTS } from '@/data/constants'

const { pastPapers, loading, addItem, updateItem, deleteItem } = useContentStore()
const { notify } = useToast()

const columns = [
  { key: 'subject', label: 'Subject' },
  { key: 'level', label: 'Level', badge: true },
  { key: 'year', label: 'Year' },
  { key: 'type', label: 'Type' },
  { key: 'pdfUrl', label: 'PDF' },
]

const fields = [
  { key: 'subject', label: 'Subject', type: 'select', required: true, options: SUBJECTS },
  { key: 'level', label: 'Examination level', type: 'select', required: true, options: EXAM_LEVELS },
  { key: 'year', label: 'Year', type: 'select', required: true, options: EXAM_YEARS },
  { key: 'type', label: 'Type', type: 'text', placeholder: 'National Exam' },
  { key: 'duration', label: 'Duration', type: 'text', placeholder: '2h 00' },
  { key: 'questions', label: 'Number of questions', type: 'number', placeholder: '50' },
  { key: 'pdf', label: 'Paper PDF', type: 'file', fileKind: 'pdf', accept: '.pdf', help: 'Optional. The downloadable exam paper.' },
]

async function onAdd(data) {
  try { await addItem('papers', data); notify('Past paper added.') }
  catch (e) { notify(e.message, 'info'); throw e }
}
async function onEdit(id, data) {
  try { await updateItem('papers', id, data); notify('Past paper updated.') }
  catch (e) { notify(e.message, 'info'); throw e }
}
async function onDelete(id) {
  try { await deleteItem('papers', id); notify('Past paper deleted.') }
  catch (e) { notify(e.message, 'info'); throw e }
}
</script>

<template>
  <div>
    <AdminManager
      title="Past Papers"
      subtitle="Add, edit and remove national exam papers (P6, S3, S6) — with PDF uploads."
      :icon="FileText"
      :items="pastPapers"
      :loading="loading"
      :columns="columns"
      :fields="fields"
      :search-keys="['subject', 'level', 'year', 'type']"
      :on-add="onAdd"
      :on-edit="onEdit"
      :on-delete="onDelete"
    />
    <ToastHost />
  </div>
</template>
