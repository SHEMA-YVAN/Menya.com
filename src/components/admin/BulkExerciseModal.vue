<script setup>
import { reactive, ref, watch, onBeforeUnmount } from 'vue'
import { X, Plus, Trash2, Save, Layers } from 'lucide-vue-next'
import { SUBJECTS } from '@/data/constants'

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'save'])

const LEVELS = ['P6', 'S3', 'S6']
const DIFFICULTY = ['Easy', 'Medium', 'Hard']

// Shared defaults applied to every question in this batch
const shared = reactive({ subject: '', level: '', difficulty: 'Medium' })

function blankQuestion() {
  return { question: '', options: ['', '', '', ''], answer: 0, explanation: '' }
}
const questions = ref([blankQuestion()])
const errors = ref('')

watch(
  () => props.open,
  (v) => {
    if (v) {
      shared.subject = ''
      shared.level = ''
      shared.difficulty = 'Medium'
      questions.value = [blankQuestion()]
      errors.value = ''
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

function addQuestion() {
  questions.value.push(blankQuestion())
}
function removeQuestion(i) {
  questions.value.splice(i, 1)
  if (!questions.value.length) questions.value.push(blankQuestion())
}

function validate() {
  errors.value = ''
  if (!shared.subject || !shared.level) {
    errors.value = 'Choose a subject and level for the batch.'
    return false
  }
  for (let i = 0; i < questions.value.length; i++) {
    const q = questions.value[i]
    if (!q.question.trim()) {
      errors.value = `Question ${i + 1} is empty.`
      return false
    }
    if (q.options.filter((o) => o.trim()).length < 2) {
      errors.value = `Question ${i + 1} needs at least 2 options.`
      return false
    }
  }
  return true
}

function submit() {
  if (!validate()) return
  const payload = questions.value.map((q) => ({
    question: q.question.trim(),
    subject: shared.subject,
    level: shared.level,
    difficulty: shared.difficulty,
    options: q.options.map((o) => o.trim()).filter(Boolean),
    answer: Number(q.answer) || 0,
    explanation: q.explanation.trim(),
  }))
  emit('save', payload)
}
</script>

<template>
  <Transition name="modal">
    <div v-if="open" class="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div class="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" @click="emit('close')" />
      <div class="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-soft sm:rounded-3xl dark:bg-ink-900 modal-panel">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-ink-100 p-5 dark:border-ink-800">
          <h3 class="flex items-center gap-2 font-display text-lg font-bold text-ink-900 dark:text-white">
            <Layers class="h-5 w-5 text-brand-600" /> Add multiple questions
          </h3>
          <button @click="emit('close')" class="rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-200" aria-label="Close">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="overflow-y-auto p-5">
          <!-- Shared settings -->
          <div class="grid gap-4 sm:grid-cols-3">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Subject <span class="text-red-500">*</span></label>
              <select v-model="shared.subject" class="select">
                <option value="" disabled>Choose…</option>
                <option v-for="s in SUBJECTS" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Level <span class="text-red-500">*</span></label>
              <select v-model="shared.level" class="select">
                <option value="" disabled>Choose…</option>
                <option v-for="l in LEVELS" :key="l" :value="l">{{ l }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Difficulty</label>
              <select v-model="shared.difficulty" class="select">
                <option v-for="d in DIFFICULTY" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
          </div>
          <p class="mt-2 text-xs text-ink-400">These apply to all {{ questions.length }} question{{ questions.length === 1 ? '' : 's' }} below.</p>

          <!-- Question blocks -->
          <div class="mt-5 space-y-4">
            <div v-for="(q, qi) in questions" :key="qi" class="rounded-2xl border border-ink-100 p-4 dark:border-ink-800">
              <div class="mb-3 flex items-center justify-between">
                <span class="badge badge-brand">Question {{ qi + 1 }}</span>
                <button v-if="questions.length > 1" @click="removeQuestion(qi)" class="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40" aria-label="Remove question">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>

              <textarea v-model="q.question" rows="2" class="input resize-none" placeholder="Type the question…" />

              <div class="mt-3 space-y-2">
                <div v-for="(opt, oi) in q.options" :key="oi" class="flex items-center gap-2">
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-sm font-bold text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                    {{ ['A','B','C','D'][oi] }}
                  </span>
                  <input v-model="q.options[oi]" type="text" class="input" :placeholder="`Option ${['A','B','C','D'][oi]}`" />
                  <label class="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-ink-500">
                    <input type="radio" :value="oi" v-model="q.answer" class="accent-brand-600" /> Correct
                  </label>
                </div>
              </div>

              <textarea v-model="q.explanation" rows="2" class="input mt-3 resize-none" placeholder="Explanation (optional)…" />
            </div>
          </div>

          <button @click="addQuestion" class="btn btn-outline btn-sm mt-4">
            <Plus class="h-4 w-4" /> Add another question
          </button>

          <p v-if="errors" class="mt-3 text-sm font-medium text-red-500">{{ errors }}</p>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between gap-2 border-t border-ink-100 p-5 dark:border-ink-800">
          <span class="text-sm text-ink-400">{{ questions.length }} question{{ questions.length === 1 ? '' : 's' }} ready</span>
          <div class="flex gap-2">
            <button @click="emit('close')" class="btn btn-ghost btn-md">Cancel</button>
            <button @click="submit" class="btn btn-primary btn-md" :disabled="saving">
              <Save class="h-4 w-4" /> {{ saving ? 'Saving…' : `Save ${questions.length} question${questions.length === 1 ? '' : 's'}` }}
            </button>
          </div>
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
