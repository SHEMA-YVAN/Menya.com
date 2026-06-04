<script setup>
import { ref, reactive, watch, onBeforeUnmount } from 'vue'
import { X, GraduationCap, Mail, User } from 'lucide-vue-next'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  open: { type: Boolean, default: false },
  initialMode: { type: String, default: 'login' }, // 'login' | 'signup'
})
const emit = defineEmits(['close', 'success'])

const { login, register } = useAuth()
const { notify } = useToast()

const mode = ref('login')
const form = reactive({ name: '', email: '', password: '' })
const remember = ref(true)
const error = ref('')
const busy = ref(false)

watch(
  () => props.open,
  (v) => {
    if (v) {
      mode.value = props.initialMode
      form.name = ''
      form.email = ''
      form.password = ''
      error.value = ''
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

function switchMode(m) {
  mode.value = m
  error.value = ''
}

async function submit() {
  error.value = ''
  busy.value = true
  let res
  if (mode.value === 'signup') {
    res = await register({ name: form.name, email: form.email, password: form.password }, remember.value)
  } else {
    res = await login(form.email, form.password, remember.value)
  }
  busy.value = false
  if (res.ok) {
    const fn = (res.user.name || '').split(' ')[0]
    notify(mode.value === 'signup' ? `Welcome to MENYA, ${fn}! 🎉` : `Welcome back, ${fn}!`)
    emit('success', res.user)
    emit('close')
  } else {
    error.value = res.error || 'Something went wrong. Please try again.'
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="open" class="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div class="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" @click="emit('close')" />
      <div class="relative w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-soft sm:rounded-3xl dark:bg-ink-900 modal-panel">
        <!-- Header -->
        <div class="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-700 px-6 pb-8 pt-7 text-center text-white">
          <div class="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
          <button @click="emit('close')" class="absolute right-4 top-4 rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white" aria-label="Close">
            <X class="h-5 w-5" />
          </button>
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <GraduationCap class="h-6 w-6" />
          </span>
          <h2 class="mt-4 font-display text-xl font-extrabold">
            {{ mode === 'signup' ? 'Create your account' : 'Welcome back' }}
          </h2>
          <p class="mt-1 text-sm text-brand-50">
            {{ mode === 'signup' ? 'Join MENYA to save and track your learning.' : 'Log in to your MENYA account.' }}
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="submit" class="space-y-4 p-6">
          <div v-if="mode === 'signup'">
            <label class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Full name</label>
            <div class="relative">
              <User class="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400" />
              <input v-model="form.name" type="text" class="input pl-10" placeholder="Your name" autocomplete="name" />
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Email</label>
            <div class="relative">
              <Mail class="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400" />
              <input v-model="form.email" type="email" class="input pl-10" placeholder="you@example.com" autocomplete="email" />
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Password</label>
            <PasswordInput
              v-model="form.password"
              :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
              :show-strength="mode === 'signup'"
            />
          </div>

          <label class="flex cursor-pointer items-center gap-2 text-sm text-ink-600 dark:text-ink-300">
            <input v-model="remember" type="checkbox" class="h-4 w-4 rounded border-ink-300 text-brand-600 accent-brand-600" />
            Remember me on this device
          </label>

          <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">{{ error }}</p>

          <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="busy">
            <span v-if="busy">Please wait…</span>
            <span v-else>{{ mode === 'signup' ? 'Create account' : 'Log in' }}</span>
          </button>

          <p class="text-center text-sm text-ink-500 dark:text-ink-400">
            <template v-if="mode === 'signup'">
              Already have an account?
              <button type="button" @click="switchMode('login')" class="font-semibold text-brand-600 hover:underline dark:text-brand-400">Log in</button>
            </template>
            <template v-else>
              New to MENYA?
              <button type="button" @click="switchMode('signup')" class="font-semibold text-brand-600 hover:underline dark:text-brand-400">Create an account</button>
            </template>
          </p>
        </form>
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
