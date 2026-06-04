import { ref } from 'vue'

// Global state to open the login/signup modal from anywhere (e.g. bookmark click).
const open = ref(false)
const mode = ref('login')

export function useAuthModal() {
  function openAuth(m = 'login') {
    mode.value = m
    open.value = true
  }
  function closeAuth() {
    open.value = false
  }
  return { open, mode, openAuth, closeAuth }
}
