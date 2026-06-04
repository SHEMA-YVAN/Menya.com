import { ref, watch } from 'vue'

const STORAGE_KEY = 'menya-theme'

// Singleton state shared across all components
const theme = ref('light')
let initialized = false

function applyTheme(value) {
  const root = document.documentElement
  if (value === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

/**
 * Theme composable — light/dark with localStorage persistence
 * and system-preference fallback. State is shared (singleton).
 */
export function useTheme() {
  if (!initialized && typeof window !== 'undefined') {
    initialized = true
    const stored = localStorage.getItem(STORAGE_KEY)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.value = stored || (prefersDark ? 'dark' : 'light')
    applyTheme(theme.value)

    watch(theme, (val) => {
      applyTheme(val)
      localStorage.setItem(STORAGE_KEY, val)
    })

    // Respond to OS changes only when user hasn't explicitly chosen
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        theme.value = e.matches ? 'dark' : 'light'
      }
    })
  }

  const isDark = () => theme.value === 'dark'

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  const setTheme = (val) => {
    theme.value = val
  }

  return { theme, isDark, toggleTheme, setTheme }
}
