/**
 * API client for the MENYA backend.
 *
 * BASE resolution:
 *  - If VITE_API_URL is set (e.g. local split-dev with Vite on :5173 talking to
 *    the API on :4000), use it.
 *  - Otherwise default to SAME-ORIGIN ('') — used in production where one server
 *    serves both the website and the API, so requests go to /api/... directly.
 */
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const API = `${BASE}/api`

const TOKEN_KEY = 'menya-token'

/**
 * "Remember me" token storage:
 *  - remember=true  → localStorage (survives browser close)
 *  - remember=false → sessionStorage (cleared when the tab/browser closes)
 * getToken() checks both so either kind of session works.
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}
export function setToken(t, remember = true) {
  // Always clear both first to avoid stale duplicates
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  if (t) {
    if (remember) localStorage.setItem(TOKEN_KEY, t)
    else sessionStorage.setItem(TOKEN_KEY, t)
  }
}

function authHeaders(extra = {}) {
  const t = getToken()
  return t ? { ...extra, Authorization: `Bearer ${t}` } : extra
}

async function handle(res) {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`
    try {
      const body = await res.json()
      msg = body.error || msg
    } catch {}
    throw new Error(msg)
  }
  return res.status === 204 ? null : res.json()
}

/** fetch() with a timeout so a hung/dead backend never freezes the UI. */
async function fetchWithTimeout(url, options = {}, ms = 10000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('The server took too long to respond.')
    throw new Error('Could not reach the server. Please check your connection.')
  } finally {
    clearTimeout(timer)
  }
}

/** Resolve a server file path (e.g. /uploads/...) to an absolute URL. */
export function fileUrl(p) {
  if (!p) return null
  return p.startsWith('http') ? p : `${BASE}${p}`
}

/** Absolute URL that force-downloads the stored PDF with a clean filename. */
export function downloadUrl(resource, id) {
  return `${API}/${resource}/${id}/file`
}

export const api = {
  base: BASE,

  async health() {
    const res = await fetch(`${API}/health`)
    return handle(res)
  },

  async login(identifier, password) {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    })
    return handle(res)
  },

  async register(payload) {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return handle(res)
  },

  // Authenticated helpers
  authGet(path) {
    return fetch(`${API}${path}`, { headers: authHeaders() }).then(handle)
  },
  authPost(path, body) {
    return fetch(`${API}${path}`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body || {}),
    }).then(handle)
  },
  authPatch(path, body) {
    return fetch(`${API}${path}`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body || {}),
    }).then(handle)
  },
  authDelete(path) {
    return fetch(`${API}${path}`, { method: 'DELETE', headers: authHeaders() }).then(handle)
  },

  // Generic list/get
  list(resource) {
    return fetchWithTimeout(`${API}/${resource}`).then(handle)
  },

  // JSON create/update (exercises)
  createJSON(resource, data) {
    return fetch(`${API}/${resource}`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then(handle)
  },
  updateJSON(resource, id, data) {
    return fetch(`${API}/${resource}/${id}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then(handle)
  },

  // Multipart create/update (books, papers — support file uploads)
  createForm(resource, formData) {
    return fetch(`${API}/${resource}`, {
      method: 'POST',
      headers: authHeaders(), // do NOT set Content-Type; browser sets multipart boundary
      body: formData,
    }).then(handle)
  },
  updateForm(resource, id, formData) {
    return fetch(`${API}/${resource}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: formData,
    }).then(handle)
  },

  remove(resource, id) {
    return fetch(`${API}/${resource}/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handle)
  },

  trackDownload(resource, id) {
    return fetch(`${API}/${resource}/${id}/download`, { method: 'POST' }).then(handle).catch(() => {})
  },

  /** Absolute URL that force-downloads the stored PDF with a clean filename. */
  downloadUrl(resource, id) {
    return `${API}/${resource}/${id}/file`
  },
}
