<script setup>
import { ref } from 'vue'
import { Globe, Github, Linkedin, Twitter } from 'lucide-vue-next'
import Avatar from '@/components/ui/Avatar.vue'

defineProps({ member: { type: Object, required: true } })

// Fall back to the generated SVG avatar if the photo fails to load
const imgError = ref(false)
</script>

<template>
  <article class="card card-hover group flex flex-col items-center overflow-hidden p-6 text-center">
    <div class="relative">
      <div class="h-24 w-24 overflow-hidden rounded-2xl shadow-soft ring-4 ring-white transition-transform duration-300 group-hover:scale-105 dark:ring-ink-900">
        <img
          v-if="member.photo && !imgError"
          :src="member.photo"
          :alt="member.name"
          class="h-full w-full object-cover"
          loading="lazy"
          @error="imgError = true"
        />
        <Avatar v-else :name="member.name" :seed="member.avatar" />
      </div>
      <span class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-soft">
        Team
      </span>
    </div>

    <h3 class="mt-5 font-display text-lg font-bold text-ink-900 dark:text-white">{{ member.name }}</h3>
    <p class="mt-1 text-sm font-semibold text-brand-600 dark:text-brand-400">{{ member.role }}</p>
    <p class="mt-3 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{{ member.bio }}</p>

    <div class="mt-5 flex items-center gap-2">
      <a v-if="member.socials.portfolio" :href="member.socials.portfolio" target="_blank" rel="noopener"
         class="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition-all hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 dark:border-ink-700 dark:text-ink-400 dark:hover:border-brand-700 dark:hover:bg-ink-800 dark:hover:text-brand-300"
         aria-label="Portfolio">
        <Globe class="h-4 w-4" />
      </a>
      <a v-if="member.socials.github" :href="member.socials.github" target="_blank" rel="noopener"
         class="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition-all hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 dark:border-ink-700 dark:text-ink-400 dark:hover:border-brand-700 dark:hover:bg-ink-800 dark:hover:text-brand-300"
         aria-label="GitHub">
        <Github class="h-4 w-4" />
      </a>
      <a v-if="member.socials.linkedin" :href="member.socials.linkedin" target="_blank" rel="noopener"
         class="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition-all hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 dark:border-ink-700 dark:text-ink-400 dark:hover:border-brand-700 dark:hover:bg-ink-800 dark:hover:text-brand-300"
         aria-label="LinkedIn">
        <Linkedin class="h-4 w-4" />
      </a>
      <a v-if="member.socials.twitter" :href="member.socials.twitter" target="_blank" rel="noopener"
         class="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition-all hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 dark:border-ink-700 dark:text-ink-400 dark:hover:border-brand-700 dark:hover:bg-ink-800 dark:hover:text-brand-300"
         aria-label="Twitter">
        <Twitter class="h-4 w-4" />
      </a>
    </div>
  </article>
</template>
