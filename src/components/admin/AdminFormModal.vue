<script setup>
import { reactive, watch, onBeforeUnmount, ref } from 'vue'
import { X, Save, Upload, FileText, Image as ImageIcon } from 'lucide-vue-next'

/**
 * Generic admin form modal.
 * `fields` = [{ key, label, type, options?, required?, placeholder?, help?, full? }]
 *   type: 'text' | 'number' | 'select' | 'textarea' | 'options-list' | 'file'
 *   for 'file': add `accept` (e.g. '.pdf' or 'image/*') and `fileKind` ('pdf'|'image')
 *
 * If any 'file' field exists, save() emits a FormData; otherwise a plain object.
 */
const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Add item' },
  fields: { type: Array, required: true },
  model: { type: Object, default: () => ({}) },
  saving: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'save'])

const form = reactive({})
const files = reactive({}) // key -> File
const errors = reactive({})

watch(
  () => props.open,
  (v) => {
    if (v) {
      Object.keys(errors).forEach((k) => delete errors[k])
      Object.keys(files).forEach((k) => delete files[k])
      props.fields.forEach((f) => {
        if (f.type === 'options-list') {
          form[f.key] = Array.isArray(props.model[f.key]) ? [...props.model[f.key]] : ['', '', '', '']
        } else if (f.type === 'file') {
          form[f.key] = '' // not used for value, just placeholder
        } else {
          form[f.key] = props.model[f.key] ?? (f.type === 'number' ? '' : '')
        }
      })
      if (props.fields.some((f) => f.type === 'options-list')) {
        form.answer = props.model.answer != null ? props.model.answer : 0
      }
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKey)
    } else {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }
)
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
function onKey(e) { if (e.key === 'Escape') emit('close') }

function onFileChange(key, e) {
  const file = e.target.files?.[0]
  if (file) files[key] = file
}

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  props.fields.forEach((f) => {
    if (!f.required) return
    if (f.type === 'options-list') {
      const v = form[f.key]
      if (!v || v.filter((o) => String(o).trim()).length < 2) errors[f.key] = 'Provide at least 2 options.'
    } else if (f.type === 'file') {
      // required file only enforced when creating (no existing model id)
      if (!props.model.id && !files[f.key]) errors[f.key] = `${f.label} is required.`
    } else if (form[f.key] === '' || form[f.key] == null) {
      errors[f.key] = `${f.label} is required.`
    }
  })
  return Object.keys(errors).length === 0
}

function submit() {
  if (!validate()) return
  const hasFiles = props.fields.some((f) => f.type === 'file')
  const hasOptions = props.fields.some((f) => f.type === 'options-list')

  if (hasFiles) {
    const fd = new FormData()
    props.fields.forEach((f) => {
      if (f.type === 'file') {
        if (files[f.key]) fd.append(f.key, files[f.key])
      } else if (f.type === 'options-list') {
        // not expected together with files, but handle anyway
        fd.append(f.key, JSON.stringify(form[f.key].map((o) => String(o).trim()).filter(Boolean)))
      } else {
        let v = form[f.key]
        if (f.type === 'number') v = v === '' ? 0 : Number(v)
        fd.append(f.key, v ?? '')
      }
    })
    emit('save', fd)
    return
  }

  const out = {}
  props.fields.forEach((f) => {
    let v = form[f.key]
    if (f.type === 'number') v = v === '' ? 0 : Number(v)
    if (f.type === 'options-list') v = v.map((o) => String(o).trim()).filter(Boolean)
    out[f.key] = v
  })
  if (hasOptions) out.answer = Number(form.answer) || 0
  emit('save', out)
}
</script>

<template>
  <Transition name="modal">
    <div v-if="open" class="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div class="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" @click="emit('close')" />
      <div class="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-soft sm:rounded-3xl dark:bg-ink-900 modal-panel">
        <div class="flex items-center justify-between border-b border-ink-100 p-5 dark:border-ink-800">
          <h3 class="font-display text-lg font-bold text-ink-900 dark:text-white">{{ title }}</h3>
          <button @click="emit('close')" class="rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-200" aria-label="Close">
            <X class="h-5 w-5" />
          </button>
        </div>

        <form @submit.prevent="submit" class="grid gap-5 overflow-y-auto p-5 sm:grid-cols-2">
          <div v-for="f in fields" :key="f.key" :class="f.full || ['textarea','options-list','file'].includes(f.type) ? 'sm:col-span-2' : ''">
            <label :for="f.key" class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">
              {{ f.label }} <span v-if="f.required" class="text-red-500">*</span>
            </label>

            <input
              v-if="f.type === 'text' || f.type === 'number'"
              :id="f.key" v-model="form[f.key]" :type="f.type" :placeholder="f.placeholder"
              class="input" :class="errors[f.key] ? '!border-red-500 !ring-red-500/30' : ''"
            />

            <select
              v-else-if="f.type === 'select'"
              :id="f.key" v-model="form[f.key]" class="select"
              :class="errors[f.key] ? '!border-red-500 !ring-red-500/30' : ''"
            >
              <option value="" disabled>Choose…</option>
              <option v-for="opt in f.options" :key="opt.value ?? opt" :value="opt.value ?? opt">{{ opt.label ?? opt }}</option>
            </select>

            <textarea
              v-else-if="f.type === 'textarea'"
              :id="f.key" v-model="form[f.key]" rows="3" :placeholder="f.placeholder"
              class="input resize-none" :class="errors[f.key] ? '!border-red-500 !ring-red-500/30' : ''"
            />

            <!-- file upload -->
            <div v-else-if="f.type === 'file'">
              <label
                :for="f.key"
                class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-ink-300 bg-ink-50/60 px-4 py-3 transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-ink-700 dark:bg-ink-800/40 dark:hover:border-brand-600"
                :class="errors[f.key] ? '!border-red-500' : ''"
              >
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-soft dark:bg-ink-900">
                  <component :is="f.fileKind === 'image' ? ImageIcon : FileText" class="h-5 w-5" />
                </span>
                <span class="min-w-0 flex-1 truncate text-sm text-ink-600 dark:text-ink-300">
                  {{ files[f.key]?.name || (model[f.key + 'Url'] ? 'Current file kept (choose to replace)' : f.placeholder || 'Choose a file…') }}
                </span>
                <Upload class="h-4 w-4 shrink-0 text-ink-400" />
                <input :id="f.key" type="file" :accept="f.accept" class="hidden" @change="(e) => onFileChange(f.key, e)" />
              </label>
            </div>

            <!-- MCQ options + correct selector -->
            <div v-else-if="f.type === 'options-list'" class="space-y-2">
              <div v-for="(opt, i) in form[f.key]" :key="i" class="flex items-center gap-2">
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-sm font-bold text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                  {{ ['A','B','C','D','E'][i] }}
                </span>
                <input v-model="form[f.key][i]" type="text" class="input" :placeholder="`Option ${['A','B','C','D','E'][i]}`" />
                <label class="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-ink-500">
                  <input type="radio" :value="i" v-model="form.answer" class="accent-brand-600" /> Correct
                </label>
              </div>
            </div>

            <p v-if="errors[f.key]" class="mt-1 text-xs font-medium text-red-500">{{ errors[f.key] }}</p>
            <p v-else-if="f.help" class="mt-1 text-xs text-ink-400">{{ f.help }}</p>
          </div>
        </form>

        <div class="flex items-center justify-end gap-2 border-t border-ink-100 p-5 dark:border-ink-800">
          <button @click="emit('close')" class="btn btn-ghost btn-md">Cancel</button>
          <button @click="submit" class="btn btn-primary btn-md" :disabled="saving">
            <Save class="h-4 w-4" /> {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
.modal-enter-active .modal-panel { animation: pop 0.3s cubic-bezier(0.16,1,0.3,1) both; }
@keyframes pop { from { opacity: 0; transform: translateY(20px) scale(0.97); } }
</style>
