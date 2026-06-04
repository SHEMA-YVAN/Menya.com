/**
 * Lightweight per-page SEO meta manager (no extra dependency).
 * Sets <title>, description, and Open Graph / Twitter tags so pages share
 * nicely on social media and rank better in search.
 */
const SITE = 'MENYA'
const DEFAULT_DESC =
  "Rwanda's free digital learning platform — curriculum books, national exam past papers and interactive exercises for P1 to S6."

function setTag(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function useMeta({ title, description } = {}) {
  const fullTitle = title ? `${title} — ${SITE}` : `${SITE} — Learn. Practice. Excel.`
  const desc = description || DEFAULT_DESC

  document.title = fullTitle
  setTag('name', 'description', desc)

  // Open Graph
  setTag('property', 'og:title', fullTitle)
  setTag('property', 'og:description', desc)
  setTag('property', 'og:type', 'website')
  setTag('property', 'og:site_name', SITE)

  // Twitter
  setTag('name', 'twitter:card', 'summary_large_image')
  setTag('name', 'twitter:title', fullTitle)
  setTag('name', 'twitter:description', desc)
}
