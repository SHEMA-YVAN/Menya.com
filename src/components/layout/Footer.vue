<script setup>
import { GraduationCap, Mail, Phone, MapPin, Github, Twitter, Linkedin, Lock } from 'lucide-vue-next'
import { navLinks, contactInfo } from '@/data/site'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
const year = new Date().getFullYear()
const resourceLinks = [
  { name: 'Curriculum Books', to: '/books' },
  { name: 'Past Papers', to: '/past-papers' },
  { name: 'Exercises', to: '/exercises' },
]
const companyLinks = [
  { name: 'About Us', to: '/about' },
  { name: 'Contact', to: '/contact' },
  { name: 'FAQ', to: '/contact#faq' },
]
</script>

<template>
  <footer class="border-t border-ink-100 bg-ink-50/60 dark:border-ink-800 dark:bg-ink-950">
    <div class="container-page py-14 lg:py-16">
      <div class="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
        <!-- Brand -->
        <div class="col-span-2">
          <RouterLink to="/" class="flex items-center gap-2.5">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <GraduationCap class="h-5 w-5" />
            </span>
            <span class="font-display text-xl font-extrabold text-ink-900 dark:text-white">MENYA</span>
          </RouterLink>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-ink-500 dark:text-ink-400">
            {{ t('footer.tagline') }}
          </p>
          <div class="mt-5 flex gap-2">
            <a v-for="s in [{i: Github, l: 'GitHub'}, {i: Twitter, l: 'Twitter'}, {i: Linkedin, l: 'LinkedIn'}]" :key="s.l"
               href="#" :aria-label="s.l"
               class="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition-all hover:border-brand-300 hover:text-brand-600 dark:border-ink-700 dark:text-ink-400 dark:hover:border-brand-700 dark:hover:text-brand-300">
              <component :is="s.i" class="h-4 w-4" />
            </a>
          </div>
        </div>

        <!-- Resources -->
        <div>
          <h4 class="text-sm font-bold text-ink-800 dark:text-ink-100">{{ t('footer.resources') }}</h4>
          <ul class="mt-4 space-y-3">
            <li v-for="l in resourceLinks" :key="l.to">
              <RouterLink :to="l.to" class="text-sm text-ink-500 transition-colors hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-300">{{ l.name }}</RouterLink>
            </li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <h4 class="text-sm font-bold text-ink-800 dark:text-ink-100">{{ t('footer.platform') }}</h4>
          <ul class="mt-4 space-y-3">
            <li v-for="l in companyLinks" :key="l.name">
              <RouterLink :to="l.to" class="text-sm text-ink-500 transition-colors hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-300">{{ l.name }}</RouterLink>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="col-span-2 md:col-span-1">
          <h4 class="text-sm font-bold text-ink-800 dark:text-ink-100">{{ t('footer.getInTouch') }}</h4>
          <ul class="mt-4 space-y-3 text-sm text-ink-500 dark:text-ink-400">
            <li class="flex items-start gap-2.5">
              <Mail class="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <a :href="`mailto:${contactInfo.email}`" class="hover:text-brand-600 dark:hover:text-brand-300">{{ contactInfo.email }}</a>
            </li>
            <li class="flex items-start gap-2.5">
              <Phone class="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <span>{{ contactInfo.phone }}</span>
            </li>
            <li class="flex items-start gap-2.5">
              <MapPin class="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <span>{{ contactInfo.address }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-200 pt-8 sm:flex-row dark:border-ink-800">
        <p class="text-sm text-ink-500 dark:text-ink-400">© {{ year }} MENYA. {{ t('footer.rights') }}</p>
        <nav class="flex flex-wrap items-center gap-x-5 gap-y-2">
          <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to"
            class="text-sm text-ink-500 transition-colors hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-300">
            {{ t(link.key) }}
          </RouterLink>
          <RouterLink to="/admin"
            class="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-300">
            <Lock class="h-3.5 w-3.5" /> {{ t('footer.admin') }}
          </RouterLink>
        </nav>
      </div>
    </div>
  </footer>
</template>
