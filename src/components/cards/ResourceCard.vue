<script setup>
import { ArrowRight } from 'lucide-vue-next'

defineProps({
  icon: { type: [Object, Function], required: true },
  name: { type: String, required: true },
  desc: { type: String, required: true },
  to: { type: String, default: '/' },
  accent: { type: String, default: 'brand' }, // brand | accent | gold
})

const accentMap = {
  brand: 'bg-brand-50 text-brand-600 group-hover:bg-brand-600 dark:bg-brand-950/50 dark:text-brand-300',
  accent: 'bg-accent-50 text-accent-600 group-hover:bg-accent-600 dark:bg-accent-950/50 dark:text-accent-300',
  gold: 'bg-gold-50 text-gold-600 group-hover:bg-gold-500 dark:bg-gold-600/15 dark:text-gold-300',
}
</script>

<template>
  <RouterLink :to="to" class="card card-hover group flex flex-col p-6">
    <div
      class="flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300 group-hover:text-white"
      :class="accentMap[accent]"
    >
      <component :is="icon" class="h-6 w-6" />
    </div>
    <h3 class="mt-5 font-display text-lg font-bold text-ink-900 dark:text-white">{{ name }}</h3>
    <p class="mt-2 flex-1 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{{ desc }}</p>
    <span class="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
      Explore
      <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </span>
  </RouterLink>
</template>
