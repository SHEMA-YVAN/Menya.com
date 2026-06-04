<script setup>
import { ref, reactive, computed } from 'vue'
import {
  Mail, Phone, MapPin, Send, MessageSquare, ChevronDown, CheckCircle2, Clock,
} from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useScrollReveal } from '@/composables/useScrollReveal'
import { useMeta } from '@/composables/useMeta'
useMeta({ title: 'Contact', description: 'Get in touch with the MENYA team — questions, feedback or partnership ideas. We reply within 24–48 hours.' })
import { contactInfo, faqs } from '@/data/site'

useScrollReveal()

const form = reactive({ name: '', email: '', subject: '', message: '' })
const errors = reactive({})
const submitted = ref(false)
const sending = ref(false)

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name.trim()) errors.name = 'Please enter your name.'
  if (!form.email.trim()) errors.email = 'Please enter your email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Please enter a valid email.'
  if (!form.message.trim()) errors.message = 'Please enter a message.'
  return Object.keys(errors).length === 0
}

function submit() {
  if (!validate()) return
  sending.value = true
  // Simulated async submit (no backend)
  setTimeout(() => {
    sending.value = false
    submitted.value = true
    form.name = ''
    form.email = ''
    form.subject = ''
    form.message = ''
  }, 900)
}

const contactCards = computed(() => [
  { icon: Mail, label: 'Email us', value: contactInfo.email, href: `mailto:${contactInfo.email}` },
  { icon: Phone, label: 'Call us', value: contactInfo.phone, href: `tel:${contactInfo.phone.replace(/\s/g, '')}` },
  { icon: MapPin, label: 'Visit us', value: contactInfo.address, href: null },
])

const openFaq = ref(0)
function toggleFaq(i) {
  openFaq.value = openFaq.value === i ? -1 : i
}
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Get in touch"
      title="We\u2019d love to hear from you"
      subtitle="Questions, feedback or partnership ideas? Reach out and our team will get back to you soon."
    />

    <section class="container-page py-12 lg:py-16">
      <div class="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <!-- Left: info -->
        <div class="space-y-5" data-reveal>
          <a
            v-for="c in contactCards"
            :key="c.label"
            :href="c.href || undefined"
            class="card card-hover group flex items-start gap-4 p-6"
            :class="c.href ? 'cursor-pointer' : 'cursor-default'"
          >
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-950/50 dark:text-brand-300">
              <component :is="c.icon" class="h-6 w-6" />
            </span>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-ink-400">{{ c.label }}</p>
              <p class="mt-1 font-semibold text-ink-900 dark:text-white">{{ c.value }}</p>
            </div>
          </a>

          <div class="card p-6">
            <div class="flex items-center gap-3">
              <Clock class="h-5 w-5 text-brand-600" />
              <p class="text-sm font-bold text-ink-800 dark:text-ink-100">Response time</p>
            </div>
            <p class="mt-2 text-sm text-ink-500 dark:text-ink-400">
              We typically reply within <strong class="text-ink-700 dark:text-ink-200">24–48 hours</strong> on business days.
            </p>
          </div>

          <!-- Map placeholder -->
          <div class="card relative aspect-[16/9] overflow-hidden p-0">
            <div class="absolute inset-0 bg-grid opacity-60 dark:bg-grid-dark" aria-hidden="true" />
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-soft">
                <MapPin class="h-6 w-6" />
              </span>
              <p class="mt-3 text-sm font-semibold text-ink-700 dark:text-ink-200">Kigali, Rwanda</p>
              <p class="text-xs text-ink-400">Kigali Innovation City</p>
            </div>
          </div>
        </div>

        <!-- Right: form -->
        <div class="card p-6 sm:p-8" data-reveal data-reveal-delay="100">
          <div class="mb-6 flex items-center gap-3">
            <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300">
              <MessageSquare class="h-5 w-5" />
            </span>
            <div>
              <h2 class="font-display text-xl font-bold text-ink-900 dark:text-white">Send us a message</h2>
              <p class="text-sm text-ink-500 dark:text-ink-400">Fill in the form and we\u2019ll be in touch.</p>
            </div>
          </div>

          <!-- Success state -->
          <Transition name="explain">
            <div v-if="submitted" class="mb-6 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800/50 dark:bg-brand-950/30">
              <CheckCircle2 class="h-5 w-5 shrink-0 text-brand-600" />
              <p class="text-sm font-medium text-ink-700 dark:text-ink-200">
                Thanks! Your message has been sent. We\u2019ll get back to you soon.
              </p>
            </div>
          </Transition>

          <form @submit.prevent="submit" novalidate class="space-y-5">
            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <label for="name" class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Full name</label>
                <input id="name" v-model="form.name" type="text" class="input" :class="errors.name ? '!border-red-500 !ring-red-500/30' : ''" placeholder="Your name" />
                <p v-if="errors.name" class="mt-1 text-xs font-medium text-red-500">{{ errors.name }}</p>
              </div>
              <div>
                <label for="email" class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Email</label>
                <input id="email" v-model="form.email" type="email" class="input" :class="errors.email ? '!border-red-500 !ring-red-500/30' : ''" placeholder="you@example.com" />
                <p v-if="errors.email" class="mt-1 text-xs font-medium text-red-500">{{ errors.email }}</p>
              </div>
            </div>
            <div>
              <label for="subject" class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Subject <span class="font-normal text-ink-400">(optional)</span></label>
              <input id="subject" v-model="form.subject" type="text" class="input" placeholder="What\u2019s this about?" />
            </div>
            <div>
              <label for="message" class="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-200">Message</label>
              <textarea id="message" v-model="form.message" rows="5" class="input resize-none" :class="errors.message ? '!border-red-500 !ring-red-500/30' : ''" placeholder="Tell us how we can help…" />
              <p v-if="errors.message" class="mt-1 text-xs font-medium text-red-500">{{ errors.message }}</p>
            </div>
            <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="sending">
              <template v-if="sending">
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" /></svg>
                Sending…
              </template>
              <template v-else>Send message <Send class="h-4 w-4" /></template>
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="bg-ink-50/50 py-16 lg:py-24 dark:bg-ink-900/30 scroll-mt-24">
      <div class="container-page">
        <div class="mx-auto max-w-2xl text-center" data-reveal>
          <span class="eyebrow">FAQ</span>
          <h2 class="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl dark:text-white">
            Frequently asked questions
          </h2>
          <p class="mt-4 text-lg text-ink-500 dark:text-ink-300">Everything you need to know about using MENYA.</p>
        </div>

        <div class="mx-auto mt-12 max-w-3xl space-y-3" data-reveal>
          <div v-for="(f, i) in faqs" :key="i" class="card overflow-hidden">
            <button
              @click="toggleFaq(i)"
              class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              :aria-expanded="openFaq === i"
            >
              <span class="font-display text-base font-bold text-ink-900 dark:text-white">{{ f.q }}</span>
              <ChevronDown class="h-5 w-5 shrink-0 text-ink-400 transition-transform duration-300" :class="openFaq === i ? 'rotate-180 text-brand-600' : ''" />
            </button>
            <Transition name="faq">
              <div v-if="openFaq === i" class="px-6 pb-5">
                <p class="text-ink-500 dark:text-ink-400">{{ f.a }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.faq-enter-active,
.faq-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.faq-enter-from,
.faq-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-6px);
}
.faq-enter-to,
.faq-leave-from {
  max-height: 200px;
}
.explain-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.explain-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
