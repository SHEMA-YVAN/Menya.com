<script setup>
import { RouterLink } from 'vue-router'
import { Home, Search, BookOpen, FileText, Brain } from 'lucide-vue-next'
import { useMeta } from '@/composables/useMeta'
useMeta({ title: 'Page not found', description: 'The page you are looking for could not be found.' })

const links = [
  { name: 'Books', to: '/books', icon: BookOpen },
  { name: 'Past Papers', to: '/past-papers', icon: FileText },
  { name: 'Exercises', to: '/exercises', icon: Brain },
]
</script>

<template>
  <section class="relative flex min-h-[70vh] items-center overflow-hidden">
    <div class="pointer-events-none absolute inset-0 bg-grid opacity-60 dark:bg-grid-dark mask-fade-b" aria-hidden="true" />
    <div class="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-400/15 blur-3xl dark:bg-brand-700/15" aria-hidden="true" />

    <div class="container-page relative text-center">
      <p class="font-display text-[7rem] font-extrabold leading-none text-gradient sm:text-[10rem]">404</p>
      <h1 class="mt-2 font-display text-2xl font-extrabold text-ink-900 sm:text-3xl dark:text-white">
        This page took a study break
      </h1>
      <p class="mx-auto mt-4 max-w-md text-lg text-ink-500 dark:text-ink-300">
        We couldn't find the page you're looking for. Let's get you back to learning.
      </p>

      <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <RouterLink to="/" class="btn btn-primary btn-lg"><Home class="h-4 w-4" /> Back to home</RouterLink>
        <RouterLink to="/books" class="btn btn-outline btn-lg"><Search class="h-4 w-4" /> Browse resources</RouterLink>
      </div>

      <div class="mx-auto mt-12 grid max-w-xl grid-cols-3 gap-4">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="card card-hover group flex flex-col items-center gap-2 p-5">
          <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-950/50 dark:text-brand-300">
            <component :is="l.icon" class="h-5 w-5" />
          </span>
          <span class="text-sm font-semibold text-ink-800 dark:text-ink-100">{{ l.name }}</span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
