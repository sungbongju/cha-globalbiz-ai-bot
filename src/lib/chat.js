// src/lib/chat.js
// Browser-side client for the streaming chat proxy (/api/chat-stream), which
// fronts the Middleton GBA RAG + Gemma4 backend (dedicated globalbiz route).
//
// Reads the SSE stream token-by-token so callers can render a live typing
// effect, and resolves with the final full text when the stream completes.
//
// Background recognition: if the visitor is logged in, we attach a small
// userContext (name + visit count) so the bot can greet them by name and
// acknowledge returning visitors. No PII beyond what the bot needs is sent.
import { getUser } from './auth'
import { apiUrl } from './endpoints'

const TRACK_LABELS = {
  business: 'Business Management',
  ai: 'Artificial Intelligence',
  both: 'Both Business & AI (undecided)',
}

function buildUserContext() {
  try {
    const u = getUser()
    if (!u) return null
    const ctx = {}
    if (u.name) ctx.name = u.name
    if (u.visit_count != null) ctx.visitCount = u.visit_count
    if (u.country) ctx.country = u.country
    if (u.track) ctx.track = TRACK_LABELS[u.track] || u.track
    return Object.keys(ctx).length ? ctx : null
  } catch { return null }
}

/**
 * Send a user message to /api/chat-stream and stream the reply.
 *
 * @param {string} message              The user's text.
 * @param {object} [opts]
 * @param {(token: string, soFar: string) => void} [opts.onToken]
 *        Called for each token as it arrives (soFar = accumulated text).
 * @param {Array} [opts.history]        Optional chat history passthrough.
 * @param {string} [opts.endpoint]      Override endpoint (default '/api/chat-stream').
 * @param {AbortSignal} [opts.signal]   Abort the request (optional).
 * @returns {Promise<string>}           The final full reply text.
 */
export async function streamChat(message, opts = {}) {
  const endpoint = opts.endpoint || apiUrl('chat-stream')
  const userContext = opts.userContext !== undefined ? opts.userContext : buildUserContext()
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history: opts.history || [], images: [], userContext }),
    signal: opts.signal,
  })
  if (!res.ok || !res.body) {
    let detail = ''
    try { detail = (await res.json()).error || '' } catch { /* ignore */ }
    throw new Error('chat http ' + res.status + (detail ? ' — ' + detail : ''))
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let accumulated = ''
  let fullText = ''
  let streamError = ''

  // Process whole SSE events ("...\n\n") out of the rolling buffer.
  const drain = () => {
    let sep
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)
      for (const line of rawEvent.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const data = trimmed.slice(5).trim()
        if (!data || data === '[DONE]') continue
        let evt
        try { evt = JSON.parse(data) } catch { continue }
        if (evt.error) { streamError = evt.error; continue }
        if (typeof evt.token === 'string') {
          accumulated += evt.token
          opts.onToken?.(evt.token, accumulated)
        }
        if (evt.done && typeof evt.fullText === 'string') {
          fullText = evt.fullText
        }
      }
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    drain()
  }
  buffer += decoder.decode()
  drain()

  const final = (fullText || accumulated).trim()
  if (!final) {
    throw new Error(streamError ? 'stream error — ' + streamError : 'empty reply')
  }
  return final
}
