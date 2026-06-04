<script setup>
import { stats } from '@/data/site'
import CountUp from '@/components/ui/CountUp.vue'
</script>

<template>
  <section class="relative overflow-hidden bg-ink-900 dark:bg-ink-900/60">
    <div class="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" aria-hidden="true" />
    <div class="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
    <div class="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-accent-500/15 blur-3xl" aria-hidden="true" />

    <div class="container-page relative py-14 lg:py-16">
      <div class="grid grid-cols-2 gap-8 sm:gap-6 lg:grid-cols-4">
        <div v-for="(s, i) in stats" :key="s.label" data-reveal :data-reveal-delay="i * 80" class="text-center">
          <p class="font-display text-4xl font-extrabold text-white sm:text-5xl">
            <CountUp :to="s.value" :suffix="s.suffix" />
          </p>
          <p class="mt-2 text-sm font-medium text-ink-300">{{ s.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
