import { downloadUrl, getToken } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import { useAuthModal } from '@/composables/useAuthModal'
import { useToast } from '@/composables/useToast'

/**
 * Centralised, professional download flow:
 *  - Browsing & preview are open to everyone.
 *  - DOWNLOADING requires a logged-in account (drives sign-ups, lets us
 *    associate downloads with users later). Logged-out users get the auth modal.
 *  - The download is sent with the user's token so the server can authorise/track it.
 */
export function useDownload() {
  const { isAuthed } = useAuth()
  const { openAuth } = useAuthModal()
  const { notify } = useToast()

  /**
   * @param {'books'|'papers'} resource
   * @param {object} item   the book/paper record (needs id, pdfUrl, label)
   * @param {string} label  human label for toasts
   * @returns {boolean} whether a download started
   */
  function download(resource, item, label) {
    // Not logged in → prompt to log in (we don't reveal PDF availability to guests).
    if (!isAuthed.value) {
      notify('Please log in to download — it’s free and quick.', 'info')
      openAuth('login')
      return false
    }
    // Logged in but the item genuinely has no file
    if (!item?.pdfUrl) {
      notify(`${label || 'This item'} has no PDF available yet.`)
      return false
    }
    // Append the token so the server authorises the download (and records history).
    const token = getToken()
    const url = `${downloadUrl(resource, item.id)}${token ? `?token=${encodeURIComponent(token)}` : ''}`
    window.location.href = url
    notify(`Downloading ${label || ''}…`.trim())
    return true
  }

  return { download }
}
