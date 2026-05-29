// GBA Assistant chat (streaming SSE) — Middleton team 90 RAG + Gemma4 proxy.
//
// This site is a single bot, so the team id is hardcoded to 90 (no TEAM_ID env).
// The endpoint streams LLM tokens straight through as SSE so the browser can
// render a live "typing" effect and avoid the nginx 60s batch timeout.
//
// Response format (SSE), passed through untouched from upstream:
//   data: {"token":"..."}\n\n      (repeated)
//   data: {"done":true,"fullText":"...","ragHits":N}\n\n
//   data: [DONE]\n\n
const UPSTREAM =
  process.env.ONPREMISE_CHAT_STREAM_URL ||
  'https://middleton.p-e.kr/finbot/api/team/90/chat-stream'

export const config = {
  // Node function — keep bodyParser on, disable the response limit for streaming.
  api: { bodyParser: true, responseLimit: false },
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })

  const { message, history = [], images = [] } = req.body || {}
  if (!message) return res.status(400).json({ error: 'message required' })

  // SSE response headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders?.()

  let upstream
  try {
    upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, images }),
    })
  } catch (e) {
    res.write(`data: ${JSON.stringify({ error: 'upstream connect failed: ' + e.message })}\n\n`)
    return res.end()
  }

  if (!upstream.ok || !upstream.body) {
    res.write(`data: ${JSON.stringify({ error: 'upstream status ' + upstream.status })}\n\n`)
    return res.end()
  }

  // Web Streams API (Node 18+ on Vercel). Upstream is already SSE — pass through.
  const reader = upstream.body.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(decoder.decode(value, { stream: true }))
    }
  } catch (e) {
    try { res.write(`data: ${JSON.stringify({ error: 'stream broken: ' + e.message })}\n\n`) } catch { /* ignore */ }
  } finally {
    try { res.end() } catch { /* ignore */ }
  }
}
