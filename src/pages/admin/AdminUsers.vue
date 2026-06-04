<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  Users, Search, Shield, ShieldOff, Trash2, UserRound, RefreshCw, KeyRound, UserPlus, X,
} from 'lucide-vue-next'
import Spinner from '@/components/ui/Spinner.vue'
import ToastHost from '@/components/ui/ToastHost.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import { api } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const { user: me } = useAuth()
const { notify } = useToast()

const users = ref([])
const loading = ref(true)
const query = ref('')
const roleFilter = ref('all')

async function load(silent = false) {
  if (!silent) loading.value = true
  try {
    users.value = await api.authGet('/users')
  } catch (e) {
    if (!silent) notify(e.message || 'Could not load users.', 'info')
  } finally {
    loading.value = false
  }
}

let poll = null
function onVisible() { if (document.visibilityState === 'visible') load(true) }
onMounted(() => {
  load()
  poll = setInterval(() => load(true), 20000)
  document.addEventListener('visibilitychange', onVisible)
})
onBeforeUnmount(() => { clearInterval(poll); document.removeEventListener('visibilitychange', onVisible) })

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return users.value.filter((u) => {
    const matchesRole = roleFilter.value === 'all' || u.role === roleFilter.value
    const matchesQ = !q || [u.name, u.email, u.username].some((v) => (v || '').toLowerCase().includes(q))
    return matchesRole && matchesQ
  })
})

const studentCount = computed(() => users.value.filter((u) => u.role === 'student').length)
const adminCount = computed(() => users.value.filter((u) => u.role === 'admin').length)

async function setRole(u, role) {
  try {
    await api.authPatch(`/users/${u.id}/role`, { role })
    notify(`${u.name || u.email} is now ${role === 'admin' ? 'an admin' : 'a student'}.`)
    await load(true)
  } catch (e) { notify(e.message || 'Could not change role.', 'info') }
}

/* ---- create user ---- */
const createOpen = ref(false)
const createForm = ref({ name: '', email: '', password: '', role: 'student' })
const createError = ref('')
const creating = ref(false)
function openCreate() {
  createForm.value = { name: '', email: '', password: '', role: 'student' }
  createError.value = ''
  createOpen.value = true
}
async function doCreate() {
  createError.value = ''
  creating.value = true
  try {
    await api.authPost('/users', createForm.value)
    notify('User created.')
    createOpen.value = false
    await load(true)
  } catch (e) {
    createError.value = e.message || 'Could not create user.'
  } finally {
    creating.value = false
  }
}

/* ---- reset password ---- */
const resetting = ref(null)
const newPass = ref('')
const resetError = ref('')
const resettingBusy = ref(false)
async function doReset() {
  resetError.value = ''
  if (!newPass.value || newPass.value.length < 6) { resetError.value = 'Password must be at least 6 characters.'; return }
  resettingBusy.value = true
  try {
    await api.authPost(`/users/${resetting.value.id}/reset-password`, { newPassword: newPass.value })
    notify(`Password reset for ${resetting.value.name || resetting.value.email}.`)
    resetting.value = null
    newPass.value = ''
  } catch (e) { resetError.value = e.message || 'Could not reset password.' }
  finally { resettingBusy.value = false }
}

/* ---- delete ---- */
const deleting = ref(null)
async function doDelete() {
  try {
    await api.authDelete(`/users/${deleting.value.id}`)
    notify('User deleted.')
    deleting.value = null
    await load(true)
  } catch (e) { notify(e.message || 'Could not delete user.', 'info') }
}

function initials(u) {
  const base = u.name || u.email || u.username || '?'
  return base.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}
function joined(d) {
  return d ? new Date(d.replace(' ', 'T') + 'Z').toLocaleDateString() : '—'
}
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="flex items-center gap-2 font-display text-2xl font-extrabold text-ink-900 dark:text-white">
          <Users class="h-6 w-6 text-brand-600" /> Users
        </h1>
        <p class="mt-1 text-ink-500 dark:text-ink-400">View and manage everyone with a MENYA account.</p>
      </div>
      <button @click="openCreate" class="btn btn-primary btn-md"><UserPlus class="h-4 w-4" /> Add user</button>
    </div>

    <!-- Stat row -->
    <div class="mb-5 grid grid-cols-3 gap-4">
      <div class="card p-4">
        <p class="text-xs text-ink-400">Total users</p>
        <p class="mt-1 font-display text-2xl font-extrabold text-ink-900 dark:text-white">{{ users.length }}</p>
      </div>
      <div class="card p-4">
        <p class="text-xs text-ink-400">Students</p>
        <p class="mt-1 font-display text-2xl font-extrabold text-brand-600 dark:text-brand-400">{{ studentCount }}</p>
      </div>
      <div class="card p-4">
        <p class="text-xs text-ink-400">Admins</p>
        <p class="mt-1 font-display text-2xl font-extrabold text-accent-600 dark:text-accent-400">{{ adminCount }}</p>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div class="relative w-full max-w-xs">
        <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input v-model="query" type="search" placeholder="Search users…" class="input !py-2.5 pl-10" />
      </div>
      <div class="flex items-center gap-2">
        <div class="flex rounded-xl border border-ink-200 p-0.5 dark:border-ink-700">
          <button v-for="r in ['all','student','admin']" :key="r" @click="roleFilter = r"
            class="rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors"
            :class="roleFilter === r ? 'bg-brand-600 text-white' : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100'">
            {{ r }}
          </button>
        </div>
        <button @click="load()" class="btn btn-outline btn-sm" title="Refresh">
          <RefreshCw class="h-4 w-4" :class="loading ? 'animate-spin' : ''" />
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-ink-100 bg-ink-50/60 text-left dark:border-ink-800 dark:bg-ink-800/40">
              <th class="px-4 py-3 font-semibold text-ink-600 dark:text-ink-300">User</th>
              <th class="px-4 py-3 font-semibold text-ink-600 dark:text-ink-300">Email</th>
              <th class="px-4 py-3 font-semibold text-ink-600 dark:text-ink-300">Role</th>
              <th class="px-4 py-3 font-semibold text-ink-600 dark:text-ink-300">Joined</th>
              <th class="px-4 py-3 text-right font-semibold text-ink-600 dark:text-ink-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="5" class="px-4 py-16"><Spinner center label="Loading users…" /></td></tr>
            <tr v-for="u in (loading ? [] : filtered)" :key="u.id" class="border-b border-ink-50 transition-colors last:border-0 hover:bg-ink-50/50 dark:border-ink-800/60 dark:hover:bg-ink-800/30">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">{{ initials(u) }}</span>
                  <p class="font-semibold text-ink-800 dark:text-ink-100">
                    {{ u.name || '—' }}
                    <span v-if="u.id === me?.id" class="ml-1 text-[10px] font-bold text-brand-600">(you)</span>
                  </p>
                </div>
              </td>
              <td class="px-4 py-3 text-ink-600 dark:text-ink-300">{{ u.email || u.username }}</td>
              <td class="px-4 py-3"><span class="badge" :class="u.role === 'admin' ? 'badge-accent' : 'badge-ink'">{{ u.role }}</span></td>
              <td class="px-4 py-3 text-ink-500 dark:text-ink-400">{{ joined(u.created_at) }}</td>
              <td class="px-4 py-3 text-right">
                <div class="inline-flex items-center gap-1">
                  <button v-if="u.role === 'student'" @click="setRole(u, 'admin')" class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-500 transition-colors hover:bg-accent-50 hover:text-accent-600 dark:hover:bg-accent-950/40" title="Make admin">
                    <Shield class="h-3.5 w-3.5" /> Make admin
                  </button>
                  <button v-else @click="setRole(u, 'student')" class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800" title="Make student">
                    <ShieldOff class="h-3.5 w-3.5" /> Make student
                  </button>
                  <button @click="resetting = u" class="rounded-lg p-2 text-ink-500 transition-colors hover:bg-accent-50 hover:text-accent-600 dark:hover:bg-accent-950/40" title="Reset password" aria-label="Reset password">
                    <KeyRound class="h-4 w-4" />
                  </button>
                  <button v-if="u.id !== me?.id" @click="deleting = u" class="rounded-lg p-2 text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40" title="Delete" aria-label="Delete user">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !filtered.length">
              <td colspan="5" class="px-4 py-14 text-center text-ink-400">
                <UserRound class="mx-auto mb-2 h-8 w-8 opacity-50" /> No users found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create user modal -->
    <Transition name="modal">
      <div v-if="createOpen" class="fixed inset-0 z-[70] flex items-center justify-center p-5">
        <div class="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" @click="createOpen = false" />
        <div class="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-soft dark:bg-ink-900">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="flex items-center gap-2 font-display text-lg font-bold text-ink-900 dark:text-white"><UserPlus class="h-5 w-5 text-brand-600" /> Add a user</h3>
            <button @click="createOpen = false" class="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"><X class="h-5 w-5" /></button>
          </div>
          <div class="space-y-3">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Full name</label>
              <input v-model="createForm.name" type="text" class="input" placeholder="Jane Doe" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Email</label>
              <input v-model="createForm.email" type="email" class="input" placeholder="jane@example.com" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Password</label>
              <PasswordInput v-model="createForm.password" :with-icon="false" autocomplete="new-password" show-strength />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Role</label>
              <select v-model="createForm.role" class="select">
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <p v-if="createError" class="text-sm font-medium text-red-500">{{ createError }}</p>
          </div>
          <div class="mt-5 flex gap-2">
            <button @click="createOpen = false" class="btn btn-ghost btn-md flex-1">Cancel</button>
            <button @click="doCreate" class="btn btn-primary btn-md flex-1" :disabled="creating">{{ creating ? 'Creating…' : 'Create user' }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Reset password modal -->
    <Transition name="modal">
      <div v-if="resetting" class="fixed inset-0 z-[70] flex items-center justify-center p-5">
        <div class="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" @click="resetting = null" />
        <div class="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-soft dark:bg-ink-900">
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-50 text-accent-600 dark:bg-accent-950/40"><KeyRound class="h-6 w-6" /></span>
          <h3 class="mt-4 text-center font-display text-lg font-bold text-ink-900 dark:text-white">Reset password</h3>
          <p class="mt-2 text-center text-sm text-ink-500 dark:text-ink-400">Set a new password for <strong class="text-ink-700 dark:text-ink-200">{{ resetting.name || resetting.email }}</strong>.</p>
          <PasswordInput v-model="newPass" :with-icon="false" autocomplete="new-password" class="mt-4" />
          <p v-if="resetError" class="mt-2 text-sm font-medium text-red-500">{{ resetError }}</p>
          <div class="mt-5 flex gap-2">
            <button @click="resetting = null" class="btn btn-ghost btn-md flex-1">Cancel</button>
            <button @click="doReset" class="btn btn-primary btn-md flex-1" :disabled="resettingBusy">{{ resettingBusy ? 'Saving…' : 'Set password' }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete modal -->
    <Transition name="modal">
      <div v-if="deleting" class="fixed inset-0 z-[70] flex items-center justify-center p-5">
        <div class="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" @click="deleting = null" />
        <div class="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-soft dark:bg-ink-900">
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/40"><Trash2 class="h-6 w-6" /></span>
          <h3 class="mt-4 font-display text-lg font-bold text-ink-900 dark:text-white">Delete this user?</h3>
          <p class="mt-2 text-sm text-ink-500 dark:text-ink-400">{{ deleting.name || deleting.email }} will be permanently removed.</p>
          <div class="mt-6 flex gap-2">
            <button @click="deleting = null" class="btn btn-ghost btn-md flex-1">Cancel</button>
            <button @click="doDelete" class="btn btn-md flex-1 bg-red-600 text-white hover:bg-red-700">Delete</button>
          </div>
        </div>
      </div>
    </Transition>

    <ToastHost />
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
</style>
