// src/lib/chat.js
// Browser-side client for the streaming chat proxy (/api/chat-stream), which
// fronts the Middleton team-90 RAG + Gemma4 backend.
//
// Reads the SSE stream token-by-token so callers can render a live typing
// effect, and resolves with the final full text when the stream completes.

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
  const endpoint = opts.endpoint || '/api/chat-stream'
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history: opts.history || [], images: [] }),
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
