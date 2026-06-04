import { ref, computed } from 'vue'

/**
 * Quiz engine. Feeds on a reactive list of questions and tracks the learner's
 * progress, selected answers, score and per-question correctness.
 */
export function useQuiz(questionsRef) {
  const current = ref(0)
  const selectedIndex = ref(null)
  const answered = ref(false)
  // Map of questionId -> { selected, correct }
  const responses = ref({})
  const finished = ref(false)

  const questions = computed(() => questionsRef.value || [])
  const total = computed(() => questions.value.length)
  const currentQuestion = computed(() => questions.value[current.value] || null)

  const score = computed(() => Object.values(responses.value).filter((r) => r.correct).length)
  const answeredCount = computed(() => Object.keys(responses.value).length)
  const progress = computed(() => (total.value ? Math.round((answeredCount.value / total.value) * 100) : 0))
  const isLast = computed(() => current.value === total.value - 1)
  const scorePercent = computed(() => (total.value ? Math.round((score.value / total.value) * 100) : 0))

  function select(index) {
    if (answered.value) return
    selectedIndex.value = index
    answered.value = true
    const q = currentQuestion.value
    const correct = index === q.answer
    responses.value = { ...responses.value, [q.id]: { selected: index, correct } }
  }

  function next() {
    if (isLast.value) {
      finished.value = true
      return
    }
    current.value++
    restoreState()
  }

  function prev() {
    if (current.value === 0) return
    current.value--
    restoreState()
  }

  function goTo(index) {
    current.value = index
    finished.value = false
    restoreState()
  }

  function restoreState() {
    const q = currentQuestion.value
    const r = q ? responses.value[q.id] : null
    if (r) {
      selectedIndex.value = r.selected
      answered.value = true
    } else {
      selectedIndex.value = null
      answered.value = false
    }
  }

  function reset() {
    current.value = 0
    selectedIndex.value = null
    answered.value = false
    responses.value = {}
    finished.value = false
  }

  return {
    questions, total, current, currentQuestion, selectedIndex, answered, responses,
    score, scorePercent, answeredCount, progress, isLast, finished,
    select, next, prev, goTo, reset,
  }
}
