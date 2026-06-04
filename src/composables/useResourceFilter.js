import { ref, computed } from 'vue'

/**
 * Generic search + multi-facet filter composable for resource lists.
 *
 * @param {import('vue').Ref<Array>|Array} source  The full dataset.
 * @param {Object} options
 * @param {string[]} options.searchKeys  Object keys to match the search query against.
 * @param {Object}   options.facets      Map of facetName -> item key, e.g. { level: 'level', subject: 'subject' }.
 */
export function useResourceFilter(source, { searchKeys = [], facets = {} } = {}) {
  const data = computed(() => (Array.isArray(source) ? source : source.value || []))

  const query = ref('')
  // Reactive selected value per facet (default 'all')
  const selected = ref(Object.fromEntries(Object.keys(facets).map((k) => [k, 'all'])))

  // Build the list of available options for each facet (unique, sorted)
  const facetOptions = computed(() => {
    const out = {}
    for (const [name, key] of Object.entries(facets)) {
      const values = [...new Set(data.value.map((d) => d[key]).filter(Boolean))]
      out[name] = values.sort((a, b) =>
        String(a).localeCompare(String(b), undefined, { numeric: true })
      )
    }
    return out
  })

  const results = computed(() => {
    const q = query.value.trim().toLowerCase()
    return data.value.filter((item) => {
      // Search match
      const matchesQuery =
        !q ||
        searchKeys.some((k) =>
          String(item[k] ?? '').toLowerCase().includes(q)
        )
      if (!matchesQuery) return false

      // Facet match
      for (const [name, key] of Object.entries(facets)) {
        const sel = selected.value[name]
        if (sel && sel !== 'all' && String(item[key]) !== String(sel)) {
          return false
        }
      }
      return true
    })
  })

  const activeFilterCount = computed(
    () =>
      (query.value.trim() ? 1 : 0) +
      Object.values(selected.value).filter((v) => v && v !== 'all').length
  )

  function setFacet(name, value) {
    selected.value = { ...selected.value, [name]: value }
  }

  function reset() {
    query.value = ''
    selected.value = Object.fromEntries(Object.keys(facets).map((k) => [k, 'all']))
  }

  return { query, selected, facetOptions, results, activeFilterCount, setFacet, reset }
}
