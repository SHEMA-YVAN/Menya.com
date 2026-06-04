<script setup>
import { ref, computed } from 'vue'
import { Lock, Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '••••••••' },
  autocomplete: { type: String, default: 'current-password' },
  showStrength: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  withIcon: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue'])

const visible = ref(false)

// Simple strength heuristic (0–4)
const strength = computed(() => {
  const v = props.modelValue || ''
  let s = 0
  if (v.length >= 6) s++
  if (v.length >= 10) s++
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++
  if (/\d/.test(v) || /[^A-Za-z0-9]/.test(v)) s++
  return Math.min(s, 4)
})
const strengthLabel = computed(() => ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][strength.value])
const strengthColor = computed(
  () => ['bg-ink-200', 'bg-red-500', 'bg-gold-500', 'bg-brand-400', 'bg-brand-600'][strength.value]
)
</script>

<template>
  <div>
    <div class="relative">
      <Lock v-if="withIcon" class="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400" />
      <input
        :value="modelValue"
        @input="emit('update:modelValue', $event.target.value)"
        :type="visible ? 'text' : 'password'"
        class="input pr-11"
        :class="[withIcon ? 'pl-10' : '', invalid ? '!border-red-500 !ring-red-500/30' : '']"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
      />
      <button
        type="button"
        @click="visible = !visible"
        class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-200"
        :aria-label="visible ? 'Hide password' : 'Show password'"
        :title="visible ? 'Hide' : 'Show'"
        tabindex="-1"
      >
        <EyeOff v-if="visible" class="h-4.5 w-4.5" />
        <Eye v-else class="h-4.5 w-4.5" />
      </button>
    </div>

    <!-- Strength meter -->
    <div v-if="showStrength && modelValue" class="mt-2">
      <div class="flex gap-1">
        <span
          v-for="i in 4"
          :key="i"
          class="h-1.5 flex-1 rounded-full transition-colors"
          :class="i <= strength ? strengthColor : 'bg-ink-200 dark:bg-ink-700'"
        />
      </div>
      <p class="mt-1 text-xs font-medium" :class="strength >= 3 ? 'text-brand-600 dark:text-brand-400' : 'text-ink-400'">
        {{ strengthLabel }}
      </p>
    </div>
  </div>
</template>
