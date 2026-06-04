import { onMounted, onBeforeUnmount } from 'vue'

/**
 * Reveal-on-scroll directive-like composable.
 * Adds the `is-visible` class to elements with [data-reveal] when they enter the viewport.
 * Usage: call useScrollReveal() in a page, add `data-reveal` to elements,
 * and style with the helper classes below (injected once).
 */
let styleInjected = false

function injectStyles() {
  if (styleInjected || typeof document === 'undefined') return
  styleInjected = true
  const style = document.createElement('style')
  style.textContent = `
    [data-reveal]{opacity:0;transform:translateY(22px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1);}
    [data-reveal].is-visible{opacity:1;transform:none;}
    @media (prefers-reduced-motion: reduce){[data-reveal]{opacity:1!important;transform:none!important;transition:none!important;}}
  `
  document.head.appendChild(style)
}

export function useScrollReveal(options = {}) {
  let observer = null

  onMounted(() => {
    injectStyles()
    const els = Array.from(document.querySelectorAll('[data-reveal]'))
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'))
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.getAttribute('data-reveal-delay')
            if (delay) entry.target.style.transitionDelay = `${delay}ms`
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px', ...options }
    )
    els.forEach((el) => observer.observe(el))
  })

  onBeforeUnmount(() => observer?.disconnect())
}
