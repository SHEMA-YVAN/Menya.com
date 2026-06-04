import { ref } from 'vue'

const toasts = ref([])
let id = 0

export function useToast() {
  function notify(message, type = 'success', timeout = 2800) {
    const t = { id: ++id, message, type }
    toasts.value.push(t)
    setTimeout(() => dismiss(t.id), timeout)
  }
  function dismiss(tid) {
    toasts.value = toasts.value.filter((t) => t.id !== tid)
  }
  return { toasts, notify, dismiss }
}
