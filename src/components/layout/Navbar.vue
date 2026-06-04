<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, X, GraduationCap } from 'lucide-vue-next'
import { navLinks } from '@/data/site'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import UserMenu from '@/components/auth/UserMenu.vue'
import NotificationBell from '@/components/ui/NotificationBell.vue'
import { useI18n } from '@/composables/useI18n'
import { useAuth } from '@/composables/useAuth'
import { useAuthModal } from '@/composables/useAuthModal'

const { t } = useI18n()
const { isAuthed } = useAuth()
const { openAuth } = useAuthModal()
const route = useRoute()
const mobileOpen = ref(false)
const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 8
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

watch(
  () => route.fullPath,
  () => (mobileOpen.value = false)
)
watch(mobileOpen, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})
</script>

<template>
  <header
    class="sticky top-0 z-50 transition-all duration-300"
    :class="
      scrolled
        ? 'border-b border-ink-100 bg-white/85 backdrop-blur-xl dark:border-ink-800 dark:bg-ink-950/80'
        : 'border-b border-transparent bg-white/0 dark:bg-transparent'
    "
  >
    <nav class="container-page flex h-16 items-center justify-between lg:h-[72px]">
      <!-- Logo -->
      <RouterLink to="/" class="group flex items-center gap-2.5" aria-label="MENYA home">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft transition-transform group-hover:scale-105">
          <GraduationCap class="h-5 w-5" />
        </span>
        <span class="font-display text-xl font-extrabold tracking-tight text-ink-900 dark:text-white">
          MENYA
        </span>
      </RouterLink>

      <!-- Desktop nav -->
      <ul class="hidden items-center gap-1 lg:flex">
        <li v-for="link in navLinks" :key="link.to">
          <RouterLink
            :to="link.to"
            class="relative rounded-lg px-3.5 py-2 text-sm font-semibold text-ink-600 transition-colors hover:text-brand-700 dark:text-ink-300 dark:hover:text-brand-300"
            active-class="!text-brand-700 dark:!text-brand-300"
          >
            {{ t(link.key) }}
          </RouterLink>
        </li>
      </ul>

      <!-- Right actions -->
      <div class="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />

        <!-- Logged in → profile menu; logged out → log in button -->
        <NotificationBell v-if="isAuthed" />
        <RouterLink v-if="isAuthed" to="/dashboard" class="btn btn-outline btn-md hidden sm:inline-flex">
          Dashboard
        </RouterLink>
        <UserMenu v-if="isAuthed" />
        <button
          v-else
          @click="openAuth('login')"
          class="btn btn-outline btn-md hidden sm:inline-flex"
        >
          {{ t('nav.login') }}
        </button>

        <RouterLink v-if="!isAuthed" to="/books" class="btn btn-primary btn-md hidden lg:inline-flex">
          {{ t('nav.start') }}
        </RouterLink>
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 text-ink-700 transition-colors hover:bg-ink-100 lg:hidden dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800"
          @click="mobileOpen = !mobileOpen"
          :aria-expanded="mobileOpen"
          aria-label="Toggle menu"
        >
          <Menu v-if="!mobileOpen" class="h-5 w-5" />
          <X v-else class="h-5 w-5" />
        </button>
      </div>
    </nav>

    <!-- Mobile menu -->
    <Transition name="mobile-menu">
      <div v-if="mobileOpen" class="lg:hidden">
        <div
          class="fixed inset-0 top-16 z-40 bg-ink-950/40 backdrop-blur-sm"
          @click="mobileOpen = false"
          aria-hidden="true"
        />
        <div class="fixed inset-x-0 top-16 z-50 border-b border-ink-100 bg-white px-5 pb-8 pt-4 shadow-soft dark:border-ink-800 dark:bg-ink-950">
          <ul class="flex flex-col gap-1">
            <li v-for="(link, i) in navLinks" :key="link.to" :style="{ transitionDelay: `${i * 40}ms` }" class="mobile-item">
              <RouterLink
                :to="link.to"
                class="flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-ink-200 dark:hover:bg-ink-800 dark:hover:text-brand-300"
                active-class="!bg-brand-50 !text-brand-700 dark:!bg-ink-800 dark:!text-brand-300"
              >
                {{ t(link.key) }}
              </RouterLink>
            </li>
          </ul>
          <button v-if="!isAuthed" @click="openAuth('login'); mobileOpen = false" class="btn btn-outline btn-lg mt-4 w-full">{{ t('nav.login') }}</button>
          <RouterLink v-if="isAuthed" to="/dashboard" class="btn btn-outline btn-lg mt-4 w-full">My Dashboard</RouterLink>
          <RouterLink to="/books" class="btn btn-primary btn-lg mt-2 w-full">{{ t('nav.start') }}</RouterLink>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.25s ease;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}
.mobile-menu-enter-active .mobile-item {
  animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
}
</style>
