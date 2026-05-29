// src/lib/liveavatar.js
// Minimal LiveAvatar client helpers ported from cha-interview-bot-liveavatar
// (src/App.jsx). Handles DataChannel commands + session keep-alive/stop.

// LiveAvatar DataChannel command — heygen-com/liveavatar-web-sdk spec.
// Every command requires an event_id (UUID); without it the agent drops it.
export function generateEventId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function sendAvatarCommand(room, eventType, data) {
  if (!room || !room.localParticipant) {
    console.warn('[LA] sendAvatarCommand skipped: no room/localParticipant', { eventType, hasRoom: !!room })
    return
  }
  const cmd = Object.assign(
    { event_id: generateEventId(), event_type: eventType },
    data || {}
  )
  const encoded = new TextEncoder().encode(JSON.stringify(cmd))
  try {
    room.localParticipant.publishData(encoded, { reliable: true, topic: 'agent-control' })
    console.log('[LA] sendAvatarCommand:', eventType, 'event_id:', cmd.event_id.slice(0, 8))
  } catch (e) {
    console.error('[LA] publishData error:', e)
  }
}

export async function stopLiveAvatarSession(sessionId) {
  if (!sessionId) return
  try {
    await fetch('/api/liveavatar-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop', session_id: sessionId, reason: 'USER_CLOSED' }),
    })
  } catch (e) { console.warn('[LA] stop failed:', e) }
}

export async function keepAliveLiveAvatar(sessionId) {
  if (!sessionId) return
  try {
    await fetch('/api/liveavatar-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'keep-alive', session_id: sessionId }),
    })
  } catch (e) { console.warn('[LA] keep-alive failed:', e) }
}

// Request a LiveAvatar session (token + start) from our serverless function.
// avatar_id is intentionally omitted so the server uses LIVEAVATAR_AVATAR_ID.
export async function createLiveAvatarSession({ avatarId, interactivityType = 'CONVERSATIONAL' } = {}) {
  const body = { interactivity_type: interactivityType }
  if (avatarId) body.avatar_id = avatarId
  const sess = await fetch('/api/liveavatar-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json())
  if (!sess.livekit_url || !sess.livekit_client_token) {
    throw new Error('LiveAvatar session creation failed: ' + JSON.stringify(sess))
  }
  return sess // { session_id, session_token, livekit_url, livekit_client_token }
}
