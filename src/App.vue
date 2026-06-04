<script setup>
import { computed, ref, watch, onErrorCaptured } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import RouteProgress from '@/components/ui/RouteProgress.vue'
import BackToTop from '@/components/ui/BackToTop.vue'
import AuthModal from '@/components/auth/AuthModal.vue'
import GlobalOfflineBanner from '@/components/ui/GlobalOfflineBanner.vue'
import { useTheme } from '@/composables/useTheme'
import { useAuthModal } from '@/composables/useAuthModal'

// Initialise theme singleton
useTheme()
const { open: authOpen, mode: authMode, closeAuth } = useAuthModal()

const route = useRoute()
const router = useRouter()
// Admin routes render their own chrome (AdminShell); hide the public shell there.
const isAdmin = computed(() => route.path.startsWith('/admin'))

function onAuthSuccess() {
  closeAuth()
  router.push('/dashboard')
}

// Error boundary: if a page throws, show a friendly fallback instead of a blank screen.
const renderError = ref(null)
onErrorCaptured((err) => {
  renderError.value = err
  console.error('[MENYA] Page error captured:', err)
  return false // stop it from propagating / crashing the app
})
// Clear the error when the user navigates away.
watch(() => route.fullPath, () => { renderError.value = null })

function reloadPage() {
  window.location.reload()
}
</script>

<template>
  <!-- Top navigation progress bar (all routes) -->
  <RouteProgress />

  <!--
    A single RouterView drives the whole app so SPA navigation always works.
    We key the transition on the route name (not fullPath) so switching between
    public ↔ admin remounts cleanly without a blank frame, while same-page query
    changes (e.g. /books?subject=...) do NOT force a full remount.
  -->
  <div class="flex min-h-screen flex-col bg-white dark:bg-ink-950">
    <a
      v-if="!isAdmin"
      href="#main"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
    >
      Skip to content
    </a>

    <Navbar v-if="!isAdmin" />
    <GlobalOfflineBanner v-if="!isAdmin" />

    <main id="main" class="flex-1">
      <!-- Friendly error fallback (never a blank white screen) -->
      <div v-if="renderError" class="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/40">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>
        </div>
        <h1 class="mt-5 font-display text-2xl font-extrabold text-ink-900 dark:text-white">Something went wrong</h1>
        <p class="mt-2 max-w-md text-ink-500 dark:text-ink-400">
          An unexpected error occurred on this page. You can reload, or head back to the homepage.
        </p>
        <div class="mt-6 flex gap-3">
          <button @click="reloadPage" class="btn btn-primary btn-md">Reload page</button>
          <RouterLink to="/" class="btn btn-outline btn-md">Go home</RouterLink>
        </div>
      </div>

      <RouterView v-else v-slot="{ Component }">
        <Transition name="route">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <Footer v-if="!isAdmin" />

    <!-- Back-to-top (public pages only) -->
    <BackToTop v-if="!isAdmin" />

    <!-- Global login / sign-up modal -->
    <AuthModal :open="authOpen" :initial-mode="authMode" @close="closeAuth" @success="onAuthSuccess" />
  </div>
</template>

