<script setup>
import { BookOpen } from 'lucide-vue-next'
import AdminManager from '@/components/admin/AdminManager.vue'
import ToastHost from '@/components/ui/ToastHost.vue'
import { useContentStore } from '@/composables/useContentStore'
import { useToast } from '@/composables/useToast'
import { LEVELS, SUBJECTS } from '@/data/constants'

const { books, loading, addItem, updateItem, deleteItem } = useContentStore()
const { notify } = useToast()

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'subject', label: 'Subject' },
  { key: 'level', label: 'Level', badge: true },
  { key: 'year', label: 'Year' },
  { key: 'pdfUrl', label: 'PDF' },
]

const fields = [
  { key: 'title', label: 'Title', type: 'text', required: true, full: true, placeholder: 'e.g. Mathematics for Primary 5' },
  { key: 'subject', label: 'Subject', type: 'select', required: true, options: SUBJECTS },
  { key: 'level', label: 'Level', type: 'select', required: true, options: LEVELS.map((l) => ({ value: l.id, label: `${l.id} · ${l.label}` })) },
  { key: 'author', label: 'Author / Publisher', type: 'text', placeholder: 'REB' },
  { key: 'year', label: 'Year', type: 'number', placeholder: '2024' },
  { key: 'pages', label: 'Pages', type: 'number', placeholder: '120' },
  { key: 'lang', label: 'Language', type: 'select', options: ['English', 'Kinyarwanda', 'French'] },
  { key: 'rating', label: 'Rating (0–5)', type: 'number', placeholder: '4.7' },
  { key: 'cover', label: 'Cover image', type: 'file', fileKind: 'image', accept: 'image/*', help: 'Optional. JPG/PNG/WebP. If omitted, a generated cover is used.' },
  { key: 'pdf', label: 'Book PDF', type: 'file', fileKind: 'pdf', accept: '.pdf', help: 'Optional. The downloadable book file.' },
]

async function onAdd(data) {
  try { await addItem('books', data); notify('Book added.') }
  catch (e) { notify(e.message, 'info'); throw e }
}
async function onEdit(id, data) {
  try { await updateItem('books', id, data); notify('Book updated.') }
  catch (e) { notify(e.message, 'info'); throw e }
}
async function onDelete(id) {
  try { await deleteItem('books', id); notify('Book deleted.') }
  catch (e) { notify(e.message, 'info'); throw e }
}
</script>

<template>
  <div>
    <AdminManager
      title="Books"
      subtitle="Add, edit and remove curriculum books — with real PDF & cover uploads."
      :icon="BookOpen"
      :items="books"
      :loading="loading"
      :columns="columns"
      :fields="fields"
      :search-keys="['title', 'subject', 'level', 'author']"
      :on-add="onAdd"
      :on-edit="onEdit"
      :on-delete="onDelete"
    />
    <ToastHost />
  </div>
</template>
