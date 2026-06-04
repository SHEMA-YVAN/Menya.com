<script setup>
import { RouterLink } from 'vue-router'
import {
  Target, Eye, Flag, Heart, BookOpen, Users, Globe2, Sparkles, ArrowRight, CheckCircle2,
} from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import TeamMemberCard from '@/components/cards/TeamMemberCard.vue'
import StatisticsSection from '@/components/sections/StatisticsSection.vue'
import { useScrollReveal } from '@/composables/useScrollReveal'
import { useMeta } from '@/composables/useMeta'
useMeta({ title: 'About', description: "Learn about MENYA's mission to make quality education accessible to every Rwandan learner from P1 to S6." })
import { team } from '@/data/team'

useScrollReveal()

const objectives = [
  { icon: BookOpen, text: 'Centralize curriculum books, past papers and exercises in one trusted place.' },
  { icon: Globe2, text: 'Make quality learning resources freely accessible to every Rwandan learner.' },
  { icon: Sparkles, text: 'Turn passive studying into active learning with interactive practice.' },
  { icon: Users, text: 'Support teachers, parents and students with reliable, curriculum-aligned content.' },
]

const values = [
  { icon: Heart, title: 'Accessibility', desc: 'Free, fast and usable on any device — because learning should never be gated.' },
  { icon: CheckCircle2, title: 'Quality', desc: 'Curriculum-aligned, verified content you can fully trust.' },
  { icon: Sparkles, title: 'Innovation', desc: 'Modern tools that make studying engaging and effective.' },
]
</script>

<template>
  <div>
    <PageHeader
      eyebrow="About MENYA"
      title="Empowering Rwandan learners, one resource at a time"
      subtitle="MENYA exists to make quality education accessible to every student in Rwanda — from Primary 1 to Senior 6."
    />

    <!-- Story -->
    <section class="container-page py-16 lg:py-24">
      <div class="grid items-center gap-12 lg:grid-cols-2">
        <div data-reveal>
          <span class="eyebrow">Our story</span>
          <h2 class="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl dark:text-white">
            Born from a simple problem
          </h2>
          <div class="mt-6 space-y-4 text-lg leading-relaxed text-ink-500 dark:text-ink-300">
            <p>
              Across Rwanda, students spend hours hunting for the right textbook, a past paper from the
              correct year, or a way to practise what they've learned. The resources exist — but they're
              scattered, hard to find and often locked away.
            </p>
            <p>
              <strong class="text-ink-700 dark:text-ink-100">MENYA</strong> — meaning
              <em>“to know”</em> in Kinyarwanda — brings everything together. One platform, every level,
              every subject, completely free. We believe a learner's success should never depend on how
              easily they can find materials.
            </p>
          </div>
          <div class="mt-8 flex flex-wrap gap-3">
            <RouterLink to="/books" class="btn btn-primary btn-md">Explore resources <ArrowRight class="h-4 w-4" /></RouterLink>
            <RouterLink to="/contact" class="btn btn-outline btn-md">Get in touch</RouterLink>
          </div>
        </div>

        <div class="relative" data-reveal data-reveal-delay="120">
          <div class="grid grid-cols-2 gap-4">
            <div class="card flex flex-col gap-2 p-6">
              <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300"><BookOpen class="h-5 w-5" /></span>
              <p class="mt-2 font-display text-2xl font-extrabold text-ink-900 dark:text-white">P1–S6</p>
              <p class="text-sm text-ink-500 dark:text-ink-400">Full curriculum coverage</p>
            </div>
            <div class="card mt-8 flex flex-col gap-2 p-6">
              <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-950/50 dark:text-accent-300"><Globe2 class="h-5 w-5" /></span>
              <p class="mt-2 font-display text-2xl font-extrabold text-ink-900 dark:text-white">100%</p>
              <p class="text-sm text-ink-500 dark:text-ink-400">Free access, always</p>
            </div>
            <div class="card flex flex-col gap-2 p-6">
              <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-600 dark:bg-gold-600/15 dark:text-gold-300"><Sparkles class="h-5 w-5" /></span>
              <p class="mt-2 font-display text-2xl font-extrabold text-ink-900 dark:text-white">Interactive</p>
              <p class="text-sm text-ink-500 dark:text-ink-400">Learn by doing</p>
            </div>
            <div class="card mt-8 flex flex-col gap-2 p-6">
              <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300"><Users class="h-5 w-5" /></span>
              <p class="mt-2 font-display text-2xl font-extrabold text-ink-900 dark:text-white">For all</p>
              <p class="text-sm text-ink-500 dark:text-ink-400">Students & teachers</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission & Vision -->
    <section class="bg-ink-50/50 py-16 lg:py-24 dark:bg-ink-900/30">
      <div class="container-page">
        <div class="grid gap-6 md:grid-cols-2">
          <div class="card p-8 lg:p-10" data-reveal>
            <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white"><Target class="h-6 w-6" /></span>
            <h3 class="mt-5 font-display text-2xl font-extrabold text-ink-900 dark:text-white">Our Mission</h3>
            <p class="mt-3 text-lg leading-relaxed text-ink-500 dark:text-ink-300">
              To democratize access to quality educational resources for every Rwandan learner by
              centralizing curriculum books, examination papers and interactive practice in one free,
              easy-to-use platform.
            </p>
          </div>
          <div class="card p-8 lg:p-10" data-reveal data-reveal-delay="100">
            <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-600 text-white"><Eye class="h-6 w-6" /></span>
            <h3 class="mt-5 font-display text-2xl font-extrabold text-ink-900 dark:text-white">Our Vision</h3>
            <p class="mt-3 text-lg leading-relaxed text-ink-500 dark:text-ink-300">
              A Rwanda where every student — regardless of location or means — can learn, practise and
              excel using world-class digital resources, building a generation ready to lead.
            </p>
          </div>
        </div>

        <!-- Objectives -->
        <div class="mt-16">
          <div class="mx-auto max-w-2xl text-center" data-reveal>
            <span class="eyebrow"><Flag class="h-3.5 w-3.5" /> Objectives</span>
            <h2 class="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl dark:text-white">
              What we set out to achieve
            </h2>
          </div>
          <div class="mt-10 grid gap-5 sm:grid-cols-2">
            <div v-for="(o, i) in objectives" :key="i" class="card card-hover flex items-start gap-4 p-6" data-reveal :data-reveal-delay="i * 70">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300">
                <component :is="o.icon" class="h-5 w-5" />
              </span>
              <p class="pt-1.5 text-ink-600 dark:text-ink-300">{{ o.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <StatisticsSection />

    <!-- Values -->
    <section class="container-page py-16 lg:py-24">
      <div class="mx-auto max-w-2xl text-center" data-reveal>
        <span class="eyebrow">Our values</span>
        <h2 class="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl dark:text-white">
          What guides everything we build
        </h2>
      </div>
      <div class="mt-12 grid gap-6 md:grid-cols-3">
        <div v-for="(v, i) in values" :key="v.title" class="card card-hover p-7 text-center" data-reveal :data-reveal-delay="i * 80">
          <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
            <component :is="v.icon" class="h-7 w-7" />
          </span>
          <h3 class="mt-5 font-display text-lg font-bold text-ink-900 dark:text-white">{{ v.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{{ v.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="bg-ink-50/50 py-16 lg:py-24 dark:bg-ink-900/30">
      <div class="container-page">
        <div class="mx-auto max-w-2xl text-center" data-reveal>
          <span class="eyebrow"><Users class="h-3.5 w-3.5" /> Meet the team</span>
          <h2 class="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl dark:text-white">
            The people behind MENYA
          </h2>
          <p class="mt-4 text-lg text-ink-500 dark:text-ink-300">
            A small, passionate team building better learning experiences for Rwanda.
          </p>
        </div>
        <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="(m, i) in team" :key="m.id" data-reveal :data-reveal-delay="i * 80">
            <TeamMemberCard :member="m" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
