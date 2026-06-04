<script setup>
import { computed } from 'vue'
import { SlidersHorizontal, RotateCcw } from 'lucide-vue-next'

/**
 * Generic filter panel.
 * `filters` = [{ key, label, options: [{value,label}], type? }]
 * `modelValue` = { [key]: selectedValue }
 */
const props = defineProps({
  filters: { type: Array, required: true },
  modelValue: { type: Object, required: true },
  activeCount: { type: Number, default: 0 },
})
const emit = defineEmits(['update:modelValue', 'reset'])

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const hasActive = computed(() => props.activeCount > 0)
</script>

<template>
  <div class="card p-5 sm:p-6">
    <div class="mb-5 flex items-center justify-between">
      <h3 class="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink-700 dark:text-ink-200">
        <SlidersHorizontal class="h-4 w-4 text-brand-600" />
        Filters
        <span v-if="hasActive" class="badge badge-brand !px-2 !py-0.5">{{ activeCount }}</span>
      </h3>
      <button
        v-if="hasActive"
        @click="emit('reset')"
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 transition-colors hover:text-brand-600 dark:hover:text-brand-300"
      >
        <RotateCcw class="h-3.5 w-3.5" /> Reset
      </button>
    </div>

    <div class="space-y-5">
      <div v-for="f in filters" :key="f.key">
        <label class="mb-2 block text-xs font-semibold text-ink-500 dark:text-ink-400">{{ f.label }}</label>

        <!-- Chip style for short option sets -->
        <div v-if="f.type === 'chips'" class="flex flex-wrap gap-2">
          <button
            v-for="opt in f.options"
            :key="opt.value"
            @click="update(f.key, opt.value)"
            class="chip"
            :class="modelValue[f.key] === opt.value ? 'chip-active' : 'chip-idle'"
          >
            {{ opt.label }}
          </button>
        </div>

        <!-- Select style otherwise -->
        <div v-else class="relative">
          <select
            :value="modelValue[f.key]"
            @change="update(f.key, $event.target.value)"
            class="select"
          >
            <option v-for="opt in f.options" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
