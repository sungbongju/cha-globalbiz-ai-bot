// src/lib/tts.js
// Browser-side TTS helper for Voice Mode (STS).
// Sends text to /api/tts (which proxies to the Middleton OmniVoice server,
// NOT LiveAvatar) and plays the returned WAV audio through a single reusable
// <Audio> element.
//
// Flow:
//   speak(text) -> POST /api/tts { text } -> audio/wav Blob -> HTMLAudioElement
//
// The returned promise resolves when playback finishes (or rejects on error),
// so callers can sequence "speaking" -> "listening" state transitions.

let sharedAudio = null

function getAudioEl() {
  if (typeof Audio === 'undefined') return null
  if (!sharedAudio) {
    sharedAudio = new Audio()
    sharedAudio.preload = 'auto'
  }
  return sharedAudio
}

// Light TTS text cleanup so OmniVoice doesn't read URLs / markdown noise aloud.
function sanitizeForTTS(text) {
  if (!text) return ''
  return String(text)
    .replace(/https?:\/\/[^\s)\]]+/gi, '')
    .replace(/\bwww\.[^\s)\]]+/gi, '')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '')
    .replace(/[*_`#>]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/**
 * Fetch TTS audio for `text` from /api/tts and play it.
 * @param {string} text                 Text to speak.
 * @param {object} [opts]
 * @param {string} [opts.endpoint]      TTS endpoint (default '/api/tts').
 * @param {string} [opts.instruct]      OmniVoice instruct override (optional).
 * @param {AbortSignal} [opts.signal]   Abort the fetch (optional).
 * @returns {Promise<void>}             Resolves when playback ends.
 */
export async function speak(text, opts = {}) {
  const clean = sanitizeForTTS(text)
  if (!clean) return

  const endpoint = opts.endpoint || '/api/tts'
  const body = { text: clean }
  if (opts.instruct) body.instruct = opts.instruct

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: opts.signal,
  })
  if (!res.ok) {
    let detail = ''
    try { detail = (await res.json()).error || '' } catch { /* ignore */ }
    throw new Error('tts http ' + res.status + (detail ? ' — ' + detail : ''))
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const audio = getAudioEl()
  if (!audio) {
    URL.revokeObjectURL(url)
    return
  }

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      URL.revokeObjectURL(url)
    }
    const onEnded = () => { cleanup(); resolve() }
    const onError = () => { cleanup(); reject(new Error('audio playback failed')) }
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    audio.src = url
    audio.play().catch((e) => { cleanup(); reject(e) })
  })
}

/** Stop any in-flight TTS playback immediately. */
export function stopSpeaking() {
  const audio = sharedAudio
  if (!audio) return
  try {
    audio.pause()
    audio.currentTime = 0
  } catch { /* ignore */ }
}
