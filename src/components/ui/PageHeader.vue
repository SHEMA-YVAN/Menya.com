<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <section class="relative overflow-hidden border-b border-ink-100 bg-ink-50/50 dark:border-ink-800 dark:bg-ink-900/40">
    <div class="pointer-events-none absolute inset-0 bg-grid opacity-60 dark:hidden mask-fade-b" aria-hidden="true" />
    <div class="pointer-events-none absolute inset-0 hidden bg-grid-dark dark:block mask-fade-b" aria-hidden="true" />
    <div
      class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl dark:bg-brand-600/10"
      aria-hidden="true"
    />
    <div class="container-page relative py-14 sm:py-20">
      <div class="max-w-3xl">
        <span v-if="eyebrow" class="eyebrow mb-4">{{ eyebrow }}</span>
        <h1 class="font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl dark:text-white">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="mt-4 text-lg leading-relaxed text-ink-500 dark:text-ink-300">
          {{ subtitle }}
        </p>
        <slot />
      </div>
    </div>
  </section>
</template>
