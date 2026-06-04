<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Globe, Check, ChevronDown } from 'lucide-vue-next'
import { useI18n } from '@/composables/useI18n'

const { lang, setLang, currentLanguage, languages } = useI18n()
const open = ref(false)
const root = ref(null)

function choose(code) {
  setLang(code)
  open.value = false
}
function onClickOutside(e) {
  if (root.value && !root.value.contains(e.target)) open.value = false
}
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="root" class="relative">
    <button
      @click="open = !open"
      class="inline-flex h-10 items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-2.5 text-sm font-semibold text-ink-600 transition-all hover:border-brand-300 hover:text-brand-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300 dark:hover:border-brand-700 dark:hover:text-brand-300"
      :aria-expanded="open"
      aria-haspopup="listbox"
      aria-label="Change language"
    >
      <Globe class="h-4.5 w-4.5" />
      <span class="hidden sm:inline">{{ currentLanguage.short }}</span>
      <ChevronDown class="h-3.5 w-3.5 transition-transform" :class="open ? 'rotate-180' : ''" />
    </button>

    <Transition name="lang">
      <ul
        v-if="open"
        class="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-ink-100 bg-white p-1 shadow-soft dark:border-ink-800 dark:bg-ink-900"
        role="listbox"
      >
        <li v-for="l in languages" :key="l.code">
          <button
            @click="choose(l.code)"
            class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            :class="lang === l.code ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300' : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'"
            role="option"
            :aria-selected="lang === l.code"
          >
            {{ l.label }}
            <Check v-if="lang === l.code" class="h-4 w-4" />
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.lang-enter-active,
.lang-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.lang-enter-from,
.lang-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
