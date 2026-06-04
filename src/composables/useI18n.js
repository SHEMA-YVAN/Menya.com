import { ref, computed } from 'vue'
import { messages } from '@/data/i18n'

/**
 * Lightweight i18n (no dependency). Language is persisted in localStorage.
 * Usage in components:
 *   const { t, lang, setLang } = useI18n()
 *   t('nav.books')
 */

const STORAGE_KEY = 'menya-lang'
const SUPPORTED = ['en', 'rw', 'fr']

function detect() {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && SUPPORTED.includes(stored)) return stored
  const nav = (navigator.language || 'en').slice(0, 2).toLowerCase()
  return SUPPORTED.includes(nav) ? nav : 'en'
}

const lang = ref(detect())

function applyLangAttr(l) {
  if (typeof document !== 'undefined') document.documentElement.setAttribute('lang', l)
}
applyLangAttr(lang.value)

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'rw', label: 'Kinyarwanda', short: 'RW' },
  { code: 'fr', label: 'Français', short: 'FR' },
]

export function useI18n() {
  function setLang(l) {
    if (!SUPPORTED.includes(l)) return
    lang.value = l
    localStorage.setItem(STORAGE_KEY, l)
    applyLangAttr(l)
  }

  // t('a.b.c') → looks up nested key; falls back to English, then the key itself.
  function t(key, vars) {
    const lookup = (obj) => key.split('.').reduce((o, k) => (o ? o[k] : undefined), obj)
    let val = lookup(messages[lang.value]) ?? lookup(messages.en) ?? key
    if (vars && typeof val === 'string') {
      val = val.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`))
    }
    return val
  }

  const currentLanguage = computed(() => LANGUAGES.find((l) => l.code === lang.value) || LANGUAGES[0])

  return { t, lang, setLang, currentLanguage, languages: LANGUAGES }
}
