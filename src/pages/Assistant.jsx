import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, Send, User, Bot, Video, Mic, MessageSquare, ArrowRight, LogIn, X } from 'lucide-react'
import PageHero from '../components/PageHero'
import AvatarPanel from '../components/AvatarPanel'
import {
  createLiveAvatarSession,
  sendAvatarCommand,
  stopLiveAvatarSession,
  keepAliveLiveAvatar,
} from '../lib/liveavatar'
import { MicRecorder, isMicRecorderSupported } from '../lib/stt'
import { speak as ttsSpeak, stopSpeaking as ttsStop } from '../lib/tts'
import { streamChat } from '../lib/chat'
import { getUser, logVisit } from '../lib/auth'

const FALLBACK_REPLY =
  "Sorry — I couldn't reach the assistant just now. Please try again in a moment."

const AVATAR_GREETING =
  "Hi! I'm the GBA Assistant. Ask me anything about the Global Business AI major — courses, faculty, careers, or life in Korea."

const INTERACTIVITY_TYPE = 'CONVERSATIONAL'

// Remember which modes a visitor has tried so the trust survey can gate
// voice/video-only questions. Stored client-side only (no PII).
function recordModeUsed(mode) {
  try {
    const raw = localStorage.getItem('gba_modes_used')
    const set = new Set(raw ? JSON.parse(raw) : [])
    set.add(mode)
    localStorage.setItem('gba_modes_used', JSON.stringify([...set]))
  } catch { /* localStorage unavailable — non-critical */ }
}

export default function Assistant() {
  const [mode, setMode] = useState('ftf')   // 'ftf' | 'sts' | 'ttt' — avatar-first (research core)
  const [user, setUser] = useState(() => { try { return getUser() } catch { return null } })
  const [avatarLoginPrompt, setAvatarLoginPrompt] = useState(false)  // sign-in before avatar
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm GBA Assistant — trained on everything about the Global Business AI major. Ask me anything: courses, faculty, application, career outcomes, life in Korea... anything." },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef(null)

  // ─── LiveAvatar (FTF) state ─────────────────────────
  const [avatarStatus, setAvatarStatus] = useState('idle') // idle | connecting | connected | speaking
  const [videoReady, setVideoReady] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const userVideoRef = useRef(null)
  const cameraStreamRef = useRef(null)
  const roomRef = useRef(null)
  const sessionRef = useRef(null)
  const avatarVideoTrackRef = useRef(null)
  const avatarAudioTrackRef = useRef(null)
  const keepAliveIntervalRef = useRef(null)
  const isSpeakingRef = useRef(false)
  // Avatar Mode voice input — Whisper STT (mic → /api/stt → Gemma4 → avatar speaks)
  const avatarMicRef = useRef(null)
  const avatarVoiceBusyRef = useRef(false)   // thinking/speaking guard (echo)
  const avatarSpeakSafetyRef = useRef(null)  // fallback resume if speak_ended is missed

  // ─── Voice Mode (STS) state — Middleton Whisper STT + OmniVoice TTS ───
  // No avatar / no LiveAvatar credits: mic → /api/stt → reply → /api/tts → play.
  const [voiceActive, setVoiceActive] = useState(false)        // mic session running
  const [voiceState, setVoiceState] = useState('idle')         // idle | listening | thinking | speaking
  const [voiceError, setVoiceError] = useState('')             // mic permission / support message
  const [voiceHeard, setVoiceHeard] = useState('')             // last transcribed user text
  const [voiceReply, setVoiceReply] = useState('')             // last spoken reply text
  const micRecorderRef = useRef(null)
  const voiceBusyRef = useRef(false)                           // thinking/speaking guard (echo)

  // ─── User webcam: start / stop / sync (ported from cha-interview-bot-liveavatar) ───
  const startUserCamera = useCallback(async () => {
    if (cameraStreamRef.current) return true
    if (!navigator.mediaDevices?.getUserMedia) {
      // Browser can't do getUserMedia — avatar still works, camera stays a placeholder.
      console.warn('[camera] getUserMedia unavailable in this browser')
      return false
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      cameraStreamRef.current = stream
      setCameraStream(stream)
      return true
    } catch (e) {
      // Permission denied or no device — don't crash, just leave the placeholder.
      console.warn('[camera] could not start user camera:', e)
      return false
    }
  }, [])

  const stopUserCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop())
      cameraStreamRef.current = null
    }
    setCameraStream(null)
  }, [])

  // Keep the <video> element's srcObject in sync with the active camera stream.
  useEffect(() => {
    if (userVideoRef.current) userVideoRef.current.srcObject = cameraStream || null
  }, [cameraStream])

  useEffect(() => {
    // 채팅 스크롤 컨테이너 내부만 맨 아래로 — scrollIntoView는 페이지 전체를
    // 아래로 점프시키므로 컨테이너의 scrollTop만 직접 조정한다.
    const c = endRef.current?.parentElement
    if (c) c.scrollTop = c.scrollHeight
  }, [messages])

  const send = useCallback(async () => {
    const userMsg = input.trim()
    if (!userMsg || typing) return
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setInput('')
    setTyping(true)

    // Reserve a bot bubble we update live as tokens stream in.
    let botIndex = -1
    setMessages(m => {
      botIndex = m.length
      return [...m, { role: 'bot', text: '' }]
    })

    try {
      const reply = await streamChat(userMsg, {
        onToken: (_token, soFar) => {
          // Stop the typing indicator once real text starts arriving.
          setTyping(false)
          setMessages(m => {
            const next = [...m]
            if (next[botIndex]) next[botIndex] = { role: 'bot', text: soFar }
            return next
          })
        },
      })
      setMessages(m => {
        const next = [...m]
        if (next[botIndex]) next[botIndex] = { role: 'bot', text: reply }
        return next
      })
    } catch (e) {
      console.warn('[chat] stream failed:', e)
      setMessages(m => {
        const next = [...m]
        if (next[botIndex]) next[botIndex] = { role: 'bot', text: FALLBACK_REPLY }
        return next
      })
    } finally {
      setTyping(false)
    }
  }, [input, typing])

  // ─── Voice Mode (STS): handle a finished transcript ──────────────────
  // user speech → text (already done by MicRecorder) → /api/chat-stream (RAG +
  // Gemma4) → fullText → OmniVoice → play.
  const handleVoiceTranscript = useCallback(async (rawText) => {
    const text = (rawText || '').trim()
    if (!text || text.length < 2) return
    // Echo guard: ignore mic input while we're thinking/speaking.
    if (voiceBusyRef.current) return

    voiceBusyRef.current = true
    setVoiceHeard(text)
    setVoiceReply('')
    setVoiceState('thinking')

    // Pause the mic so OmniVoice playback doesn't get re-transcribed.
    micRecorderRef.current?.pause()

    let reply
    try {
      reply = await streamChat(text)   // POST /api/chat-stream → RAG reply
    } catch (e) {
      console.warn('[voice] chat failed:', e)
      reply = FALLBACK_REPLY
    }
    setVoiceReply(reply)
    setVoiceState('speaking')

    try {
      await ttsSpeak(reply)   // POST /api/tts (Middleton OmniVoice) → play WAV
    } catch (e) {
      console.warn('[voice] TTS playback failed:', e)
      setVoiceError('Could not play the voice response. Please try again.')
    } finally {
      voiceBusyRef.current = false
      // Resume listening if the session is still active.
      const rec = micRecorderRef.current
      if (rec && rec.isRunning) {
        rec.resume()
        setVoiceState('listening')
      } else {
        setVoiceState('idle')
      }
    }
  }, [])

  // ─── Voice Mode: start mic session ───────────────────────────────────
  const startVoice = useCallback(async () => {
    setVoiceError('')
    if (!isMicRecorderSupported()) {
      setVoiceError('This browser does not support voice input. Try the latest Chrome or Safari, or use Text Chat.')
      return
    }
    const rec = new MicRecorder({
      sttEndpoint: '/api/stt',
      onTranscript: (t) => handleVoiceTranscript(t),
      onError: (err) => console.warn('[voice] MicRecorder error:', err),
      onStateChange: (st) => {
        // Reflect recorder state unless we're mid reply (thinking/speaking).
        if (voiceBusyRef.current) return
        if (st === 'listening' || st === 'recording' || st === 'transcribing') {
          setVoiceState('listening')
        }
      },
    })
    micRecorderRef.current = rec
    try {
      await rec.start()
      setVoiceActive(true)
      setVoiceState('listening')
    } catch (e) {
      console.warn('[voice] start failed:', e)
      micRecorderRef.current = null
      const denied = e?.name === 'NotAllowedError' || /denied|permission|allowed/i.test(e?.message || '')
      setVoiceError(
        denied
          ? 'Microphone permission is needed. Click the lock icon in your browser address bar and allow the microphone.'
          : 'Could not start the microphone. Make sure no other app is using it, then try again.'
      )
      setVoiceActive(false)
      setVoiceState('idle')
    }
  }, [handleVoiceTranscript])

  // ─── Voice Mode: stop mic session ────────────────────────────────────
  const stopVoice = useCallback(() => {
    try { ttsStop() } catch { /* ignore */ }
    const rec = micRecorderRef.current
    if (rec) {
      try { rec.stop() } catch { /* ignore */ }
      micRecorderRef.current = null
    }
    voiceBusyRef.current = false
    setVoiceActive(false)
    setVoiceState('idle')
  }, [])

  // Tear down the mic when leaving STS mode or unmounting.
  // Only act when a recorder actually exists so we don't call setState
  // synchronously on every unrelated mode render (cascading-render lint).
  useEffect(() => {
    if (mode !== 'sts' && micRecorderRef.current) stopVoice()
  }, [mode, stopVoice])
  useEffect(() => () => {
    if (micRecorderRef.current) stopVoice()
  }, [stopVoice])

  // ─── Avatar: speak helper ───────────────────────────
  // Sends the text; the on-screen status flips to 'speaking' only when LiveAvatar
  // fires the speak_started event (DataReceived) — so the display matches reality.
  const speakAvatar = useCallback((text) => {
    if (!roomRef.current || !sessionRef.current || !text) return
    isSpeakingRef.current = true
    sendAvatarCommand(roomRef.current, 'avatar.speak_text', { text })
  }, [])

  // ─── Avatar Mode: resume mic after the avatar finishes / is interrupted ───
  const resumeAvatarMic = useCallback(() => {
    if (avatarSpeakSafetyRef.current) {
      clearTimeout(avatarSpeakSafetyRef.current)
      avatarSpeakSafetyRef.current = null
    }
    avatarVoiceBusyRef.current = false
    const rec = avatarMicRef.current
    if (rec && rec.isRunning) rec.resume()
  }, [])

  // ─── Avatar: one conversation turn (shared by typed + spoken input) ───
  // text → 'thinking' → /api/chat-stream (RAG+Gemma4) → avatar.speak_text.
  // Event-driven status: speak_started → 'speaking', speak_ended → 'connected'(listening).
  const sendAvatarMessage = useCallback(async (userText) => {
    const text = (userText || '').trim()
    if (!text) return
    if (avatarVoiceBusyRef.current) return        // a turn is already in progress
    if (!roomRef.current || !sessionRef.current) return

    avatarVoiceBusyRef.current = true
    isSpeakingRef.current = true                  // turn in progress (echo guard)
    avatarMicRef.current?.pause()                 // stop listening while thinking + speaking
    setMessages(m => [...m, { role: 'user', text }])
    setAvatarStatus('thinking')

    let reply
    try {
      reply = await streamChat(text)
    } catch (e) {
      console.warn('[avatar] chat failed:', e)
      reply = FALLBACK_REPLY
    }
    setMessages(m => [...m, { role: 'bot', text: reply }])
    speakAvatar(reply)                            // speak_started → 'speaking', speak_ended → 'connected'

    // Safety: if the speak_ended event never arrives, recover after a max window.
    if (avatarSpeakSafetyRef.current) clearTimeout(avatarSpeakSafetyRef.current)
    avatarSpeakSafetyRef.current = setTimeout(() => {
      isSpeakingRef.current = false
      setAvatarStatus(s => (s === 'thinking' || s === 'speaking' ? 'connected' : s))
      resumeAvatarMic()
    }, 30000)
  }, [speakAvatar, resumeAvatarMic])

  // user speech → STT transcript → same turn handler.
  const handleAvatarVoiceTranscript = useCallback((rawText) => {
    const text = (rawText || '').trim()
    if (!text || text.length < 2) return
    if (avatarVoiceBusyRef.current) return        // already handling a turn
    if (isSpeakingRef.current) return             // avatar busy → ignore (echo)
    sendAvatarMessage(text)
  }, [sendAvatarMessage])

  // ─── Avatar Mode voice input: start the mic recorder ───
  const startAvatarMic = useCallback(async () => {
    if (avatarMicRef.current) return
    if (!isMicRecorderSupported()) {
      console.warn('[avatar-voice] mic not supported — Avatar Mode stays text-only')
      return
    }
    const rec = new MicRecorder({
      sttEndpoint: '/api/stt',
      onTranscript: (t) => handleAvatarVoiceTranscript(t),
      onError: (err) => console.warn('[avatar-voice] MicRecorder error:', err),
    })
    avatarMicRef.current = rec
    try {
      await rec.start()
      // The greeting is about to play — keep the mic paused until it ends.
      if (isSpeakingRef.current) rec.pause()
    } catch (e) {
      console.warn('[avatar-voice] mic start failed:', e)
      avatarMicRef.current = null
    }
  }, [handleAvatarVoiceTranscript])

  // ─── Avatar: attach subscribed tracks to media elements ───
  const attachAvatarTracks = useCallback(() => {
    if (avatarVideoTrackRef.current && videoRef.current) {
      try {
        avatarVideoTrackRef.current.attach(videoRef.current)
        setVideoReady(true)
      } catch (e) { console.warn('video attach error:', e) }
    }
    if (avatarAudioTrackRef.current && audioRef.current) {
      try {
        avatarAudioTrackRef.current.attach(audioRef.current)
        audioRef.current.play?.().catch(() => {})
      } catch (e) { console.warn('audio attach error:', e) }
    }
  }, [])

  // ─── Avatar: stop / cleanup ─────────────────────────
  const stopAvatar = useCallback(async () => {
    isSpeakingRef.current = false
    // Stop voice input
    if (avatarSpeakSafetyRef.current) {
      clearTimeout(avatarSpeakSafetyRef.current)
      avatarSpeakSafetyRef.current = null
    }
    avatarVoiceBusyRef.current = false
    if (avatarMicRef.current) {
      try { avatarMicRef.current.stop() } catch { /* ignore */ }
      avatarMicRef.current = null
    }
    stopUserCamera()
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current)
      keepAliveIntervalRef.current = null
    }
    if (sessionRef.current) {
      await stopLiveAvatarSession(sessionRef.current.session_id)
    }
    if (roomRef.current) {
      try { await roomRef.current.disconnect() } catch { /* ignore */ }
      roomRef.current = null
    }
    sessionRef.current = null
    avatarVideoTrackRef.current = null
    avatarAudioTrackRef.current = null
    setVideoReady(false)
    setAvatarStatus('idle')
  }, [stopUserCamera])

  // ─── Avatar: interrupt current speech ───────────────
  const interruptAvatar = useCallback(() => {
    if (sessionRef.current && roomRef.current) {
      try { sendAvatarCommand(roomRef.current, 'avatar.interrupt') } catch (e) { console.error('interrupt error:', e) }
    }
    isSpeakingRef.current = false
    setAvatarStatus('connected')
    // Reset listening so the user can speak again right away (speak_ended won't
    // fire on a manual interrupt). Mirrors cha-interview-bot-liveavatar.
    resumeAvatarMic()
  }, [resumeAvatarMic])

  // ─── Global ESC → interrupt the avatar (works anywhere, no click needed) ───
  // Bound to window with capture so it fires regardless of focus (input/iframe/etc).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape' && e.code !== 'Escape') return
      if (mode !== 'ftf' || !sessionRef.current) return
      e.preventDefault()
      e.stopPropagation()
      const t = e.target
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) t.blur()
      interruptAvatar()
    }
    window.addEventListener('keydown', onKey, true)
    document.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [mode, interruptAvatar])

  // ─── Avatar: start session ──────────────────────────
  const startAvatar = useCallback(async () => {
    if (!window.LivekitClient) {
      alert('LiveKit client failed to load. Please refresh and try again.')
      return
    }
    setAvatarStatus('connecting')
    // Kick off the user webcam alongside the session. Failure (no device,
    // permission denied, unsupported browser) is non-fatal — avatar still works.
    startUserCamera()
    try {
      // avatar_id omitted → server uses its hardcoded 박교수님 avatar
      const sess = await createLiveAvatarSession({ interactivityType: INTERACTIVITY_TYPE })
      sessionRef.current = sess

      const room = new window.LivekitClient.Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      roomRef.current = room

      room.on(window.LivekitClient.RoomEvent.DataReceived, (payload, _participant, _kind, topic) => {
        try {
          const evt = JSON.parse(new TextDecoder().decode(payload))
          const type = evt.event_type || evt.type || ''
          if (topic && topic !== 'agent-response') return
          if (type === 'avatar.speak_started') {
            isSpeakingRef.current = true
            setAvatarStatus('speaking')
            avatarMicRef.current?.pause()   // echo guard — don't transcribe the avatar
          }
          if (type === 'avatar.speak_ended') {
            isSpeakingRef.current = false
            setAvatarStatus('connected')
            resumeAvatarMic()               // listen for the user again
          }
        } catch (e) {
          console.warn('[LA] DataReceived parse error:', e)
        }
      })

      room.on(window.LivekitClient.RoomEvent.TrackSubscribed, (track, _pub, participant) => {
        if (track.kind === 'video') {
          avatarVideoTrackRef.current = track
          if (videoRef.current) {
            track.attach(videoRef.current)
            setVideoReady(true)
          }
        }
        if (track.kind === 'audio') {
          avatarAudioTrackRef.current = track
          // Each track gets its own hidden <audio> appended to body — multiple
          // audio tracks arrive and would otherwise overwrite one audioRef.
          const audioEl = track.attach()
          audioEl.autoplay = true
          audioEl.dataset.laTrack = participant?.identity || 'unknown'
          audioEl.style.display = 'none'
          document.body.appendChild(audioEl)
          audioEl.play?.().catch(() => {})
        }
      })

      room.on(window.LivekitClient.RoomEvent.Disconnected, () => {
        isSpeakingRef.current = false
        setAvatarStatus('connected')
      })

      await room.connect(sess.livekit_url, sess.livekit_client_token)

      // Note: we do NOT publish the mic to LiveKit. The user's voice is captured by
      // MicRecorder → /api/stt (Whisper) → Gemma4 → avatar.speak_text (see startAvatarMic).
      // Publishing here would double-capture the mic and isn't used (FULL mode + our own STT).

      // Periodic keep-alive — LiveAvatar sessions auto-close when idle.
      keepAliveIntervalRef.current = setInterval(() => {
        keepAliveLiveAvatar(sess.session_id)
      }, 60_000)

      setAvatarStatus('connected')

      // Greeting (proves the speak pipeline). Delay 800ms so the first
      // command isn't dropped before tracks finish attaching.
      // NOTE: status comes from the avatar.speak_started event, not set here.
      isSpeakingRef.current = true
      setTimeout(() => {
        try { sendAvatarCommand(roomRef.current, 'avatar.speak_text', { text: AVATAR_GREETING }) }
        catch (e) { console.error('greeting speak error:', e) }
      }, 800)

      // Voice input: mic → Whisper → Gemma4 → avatar speaks. Starts paused while
      // the greeting plays; the greeting's speak_ended resumes it.
      startAvatarMic()
    } catch (e) {
      console.error(e)
      stopUserCamera()
      if (roomRef.current) {
        try { await roomRef.current.disconnect() } catch { /* ignore */ }
        roomRef.current = null
      }
      sessionRef.current = null
      avatarVideoTrackRef.current = null
      avatarAudioTrackRef.current = null
      setVideoReady(false)
      setAvatarStatus('idle')
      alert('Could not start the avatar. Please try again later.')
    }
  }, [startUserCamera, stopUserCamera, startAvatarMic, resumeAvatarMic])

  // Re-attach tracks shortly after connect (timing safety from source).
  useEffect(() => {
    if (avatarStatus === 'idle' || avatarStatus === 'connecting') return
    let rafId = window.requestAnimationFrame(attachAvatarTracks)
    const t1 = window.setTimeout(attachAvatarTracks, 120)
    const t2 = window.setTimeout(attachAvatarTracks, 360)
    return () => {
      window.cancelAnimationFrame(rafId)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [avatarStatus, attachAvatarTracks])

  // Clean up the avatar session on unmount or when leaving FTF mode.
  useEffect(() => {
    if (mode !== 'ftf' && sessionRef.current) {
      stopAvatar()
    }
  }, [mode, stopAvatar])

  useEffect(() => () => { stopAvatar() }, [stopAvatar])

  // Login-before-avatar: the background-recognition treatment (name, country,
  // track) is only delivered to signed-in users, so it must happen BEFORE the
  // avatar conversation — not at survey time. If logged out, prompt sign-in first.
  const handleStartAvatar = useCallback(() => {
    let signedIn = false
    try { signedIn = Boolean(getUser()) } catch { signedIn = false }
    if (!signedIn) { setAvatarLoginPrompt(true); return }
    startAvatar()
  }, [startAvatar])

  const goSignInForAvatar = () => {
    try { sessionStorage.setItem('gba_pending_avatar', '1') } catch { /* ignore */ }
    setAvatarLoginPrompt(false)
    window.dispatchEvent(new Event('gba-open-auth'))
  }

  // Sync local user; after a sign-in that was triggered to start the avatar,
  // auto-start it so the student lands straight in the (now personalized) chat.
  useEffect(() => {
    const onAuth = () => {
      let u = null
      try { u = getUser() } catch { /* ignore */ }
      setUser(u)
      if (u) {
        try {
          if (sessionStorage.getItem('gba_pending_avatar')) {
            sessionStorage.removeItem('gba_pending_avatar')
            setAvatarLoginPrompt(false)
            startAvatar()
          }
        } catch { /* ignore */ }
      }
    }
    window.addEventListener('gba-auth-changed', onAuth)
    return () => window.removeEventListener('gba-auth-changed', onAuth)
  }, [startAvatar])

  const quickQuestions = [
    'What can I become after graduating?',
    'Tell me about the curriculum',
    'How do I apply as an international student?',
    'Tuition and scholarships?',
  ]

  return (
    <>
      <PageHero
        eyebrow="AI Assistant"
        title="Talk to our AI"
        subtitle="Meet the program's AI avatar. Start below and ask anything in English — then tell us about it in a quick survey."
      />

      <section className="py-12 bg-[#faf8f3] min-h-[600px]">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          {/* How it works — 3 simple steps (arrows aligned to the circle centers) */}
          <div className="max-w-md sm:max-w-2xl mx-auto mb-6 flex items-start justify-center gap-0.5 sm:gap-3">
            {[
              { n: '1', t: 'Press Start', s: 'pick Avatar' },
              { n: '2', t: 'Ask anything', s: 'talk or type' },
              { n: '3', t: 'Take survey', s: '2 minutes' },
            ].map((st, i) => (
              <div key={st.n} className="flex items-start gap-0.5 sm:gap-3">
                <div className="flex flex-col items-center w-[92px] sm:w-28">
                  <div className="w-9 h-9 rounded-full bg-[#0a1e3f] text-white text-base font-bold flex items-center justify-center shadow">
                    {st.n}
                  </div>
                  <div className="mt-1.5 text-[13px] sm:text-[14px] font-bold text-[#0a1e3f] leading-tight whitespace-nowrap">{st.t}</div>
                  <div className="text-[11px] sm:text-[12px] text-gray-500 leading-tight whitespace-nowrap">{st.s}</div>
                </div>
                {i < 2 && <ArrowRight size={16} className="text-[#d4a574] shrink-0 mt-3" />}
              </div>
            ))}
          </div>

          {/* Sign-in tip (optional, only when logged out) */}
          {!user && (
            <div className="max-w-xl mx-auto mb-5 flex items-center gap-2 justify-center text-center
              text-[13px] text-[#0a1e3f] bg-[#fef8ee] border border-[#ecd9a8] rounded-2xl px-4 py-2.5">
              <LogIn size={16} className="text-[#d4a574] shrink-0" />
              <span>Tip: <b>Sign in</b> (top-right) first, so the avatar can greet you by name.</span>
            </div>
          )}

          {/* Mode picker — Avatar first / recommended */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-2xl mx-auto mb-8">
            {[
              { id: 'ftf', icon: Video,         label: 'Avatar', desc: 'See & hear the AI', rec: true },
              { id: 'sts', icon: Mic,           label: 'Voice',  desc: 'Talk by voice' },
              { id: 'ttt', icon: MessageSquare, label: 'Text',   desc: 'Type questions' },
            ].map(m => (
              <button key={m.id} onClick={() => { setMode(m.id); recordModeUsed(m.id) }}
                className={`relative flex flex-col items-center text-center gap-1 px-2 py-3 sm:py-4 rounded-2xl border transition
                  ${mode === m.id
                    ? 'bg-[#0a1e3f] text-white border-[#0a1e3f] shadow-lg'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#d4a574]'}`}>
                {m.rec && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold
                    uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#d4a574] text-white shadow">
                    Recommended
                  </span>
                )}
                <m.icon size={24} />
                <span className="text-[15px] font-bold leading-none mt-0.5">{m.label}</span>
                <span className={`text-[11px] leading-tight ${mode === m.id ? 'text-white/70' : 'text-gray-500'}`}>
                  {m.desc}
                </span>
              </button>
            ))}
          </div>

          {/* 챗 컨테이너 */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-[600px]">
            {/* 헤더 */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#0a1e3f] to-[#1a3567] text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#d4a574] flex items-center justify-center font-bold">
                AI
              </div>
              <div>
                <div className="font-bold">GBA Assistant</div>
                <div className="text-xs text-white/70 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Online · Powered by LiveAvatar
                </div>
              </div>
            </div>

            {/* FTF — real LiveAvatar */}
            {mode === 'ftf' && (
              <div className="flex-1 flex flex-col bg-gradient-to-br from-[#0a1e3f] to-[#1a3567] min-h-0">
                <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                  {/* Avatar (hero) — fits the section height, no scroll */}
                  <div className="lg:w-[44%] shrink-0 flex items-center justify-center overflow-hidden min-h-0 p-2">
                    <AvatarPanel
                      status={avatarStatus}
                      videoRef={videoRef}
                      audioRef={audioRef}
                      userVideoRef={userVideoRef}
                      videoReady={videoReady}
                      cameraActive={Boolean(cameraStream)}
                      onStart={handleStartAvatar}
                      onStop={stopAvatar}
                      onInterrupt={interruptAvatar}
                    />
                  </div>

                  {/* Live conversation transcript */}
                  {(avatarStatus === 'connected' || avatarStatus === 'thinking' || avatarStatus === 'speaking') && (
                    <div className="flex-1 min-h-0 flex flex-col border-t lg:border-t-0 lg:border-l border-white/10">
                      <div className="px-5 py-3 flex items-center gap-2 border-b border-white/10">
                        <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">Conversation</span>
                        <span className="ml-auto inline-flex items-center gap-1.5 text-xs">
                          <span className={`w-2 h-2 rounded-full ${
                            avatarStatus === 'speaking' ? 'bg-blue-400 animate-pulse'
                              : avatarStatus === 'thinking' ? 'bg-[#d4a574] animate-pulse'
                              : 'bg-green-400'}`} />
                          <span className="text-white/60">{
                            avatarStatus === 'speaking' ? 'Speaking…'
                              : avatarStatus === 'thinking' ? 'Thinking…'
                              : 'Listening…'}</span>
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto scroll-navy px-4 py-4 space-y-3">
                        {messages.map((m, i) => (
                          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              m.role === 'user'
                                ? 'bg-[#d4a574] text-white rounded-br-sm'
                                : 'bg-white/10 text-white/90 border border-white/10 rounded-bl-sm'}`}>
                              {m.text || '…'}
                            </div>
                          </div>
                        ))}
                        {avatarStatus === 'thinking' && (
                          <div className="flex justify-start">
                            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white/10 border border-white/10">
                              <span className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#d4a574] animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-[#d4a574] animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-[#d4a574] animate-bounce" />
                              </span>
                            </div>
                          </div>
                        )}
                        <div ref={endRef} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Talk or type — full width, bottom */}
                {(avatarStatus === 'connected' || avatarStatus === 'thinking' || avatarStatus === 'speaking') && (
                  <div className="p-4 border-t border-white/10 bg-[#0a1e3f]">
                    <p className="text-white/40 text-xs mb-2 text-center">🎤 Speak to the avatar, or type below</p>
                    <div className="flex gap-2">
                      <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && input.trim()) {
                            sendAvatarMessage(input.trim())
                            setInput('')
                          }
                        }}
                        placeholder="Ask the avatar a question..."
                        className="flex-1 min-w-0 px-5 py-3 rounded-full border border-white/20 bg-white/10 text-white
                          placeholder:text-white/50 focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/30 outline-none"
                      />
                      <button
                        onClick={() => { if (input.trim()) { sendAvatarMessage(input.trim()); setInput('') } }}
                        disabled={!input.trim()}
                        className="px-5 py-3 rounded-full bg-[#d4a574] text-white font-semibold
                          hover:bg-[#c19463] transition disabled:opacity-50 disabled:cursor-not-allowed
                          flex items-center gap-2">
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === 'sts' && (
              <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1e3f] to-[#1a3567] p-8 overflow-y-auto">
                {/* Circular visualizer / mic button */}
                <button
                  type="button"
                  onClick={voiceActive ? stopVoice : startVoice}
                  aria-label={voiceActive ? 'Stop voice mode' : 'Start voice mode'}
                  className="relative w-36 h-36 rounded-full flex items-center justify-center mb-6
                    transition shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#d4a574]/40"
                  style={{
                    background:
                      voiceState === 'speaking'
                        ? 'radial-gradient(circle, #d4a574 0%, #c19463 100%)'
                        : 'radial-gradient(circle, #1a3567 0%, #0a1e3f 100%)',
                    border: '2px solid #d4a574',
                  }}
                >
                  {/* Pulsing rings while listening / speaking */}
                  {(voiceState === 'listening' || voiceState === 'speaking') && (
                    <>
                      <span className="absolute inset-0 rounded-full border-2 border-[#d4a574]/60 animate-ping" />
                      <span className="absolute -inset-3 rounded-full border border-[#d4a574]/30 animate-pulse" />
                    </>
                  )}
                  <Mic
                    className={voiceState === 'speaking' ? 'text-[#0a1e3f]' : 'text-[#d4a574]'}
                    size={52}
                  />
                </button>

                {/* Status indicator */}
                <div className="flex items-center gap-2 mb-2 text-white">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      voiceState === 'listening' ? 'bg-green-400 animate-pulse'
                        : voiceState === 'thinking' ? 'bg-yellow-400 animate-pulse'
                        : voiceState === 'speaking' ? 'bg-[#d4a574] animate-pulse'
                        : 'bg-gray-400'
                    }`}
                  />
                  <span className="text-sm font-semibold tracking-wide">
                    {voiceState === 'listening' ? 'Listening…'
                      : voiceState === 'thinking' ? 'Thinking…'
                      : voiceState === 'speaking' ? 'Speaking…'
                      : 'Tap the mic to start'}
                  </span>
                </div>

                <p className="text-white/60 text-xs mb-6 text-center max-w-sm">
                  {voiceActive
                    ? 'Speak naturally — pause when you\'re done and I\'ll respond.'
                    : 'Voice Mode uses on-prem Whisper + OmniVoice. Tap the mic and allow microphone access.'}
                </p>

                {/* Mic permission / error message */}
                {voiceError && (
                  <div className="mb-4 max-w-md text-center text-sm text-red-200 bg-red-900/40 border border-red-400/30 rounded-xl px-4 py-3">
                    {voiceError}
                  </div>
                )}

                {/* Transcript + reply so it's clear what was heard / said */}
                {(voiceHeard || voiceReply) && (
                  <div className="w-full max-w-md space-y-3">
                    {voiceHeard && (
                      <div className="flex gap-3 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-white text-[#0a1e3f] flex items-center justify-center flex-shrink-0">
                          <User size={14} />
                        </div>
                        <div className="max-w-[80%] p-3 rounded-2xl rounded-tr-sm bg-white text-[#0a1e3f] text-sm leading-relaxed">
                          {voiceHeard}
                        </div>
                      </div>
                    )}
                    {voiceReply && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4a574] to-[#c19463] text-white flex items-center justify-center flex-shrink-0">
                          <Bot size={14} />
                        </div>
                        <div className="max-w-[80%] p-3 rounded-2xl rounded-tl-sm bg-[#1a3567] text-white text-sm leading-relaxed">
                          {voiceReply}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stop button when active */}
                {voiceActive && (
                  <button
                    onClick={stopVoice}
                    className="mt-6 px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white
                      text-sm font-semibold hover:bg-white/20 transition"
                  >
                    End voice session
                  </button>
                )}
              </div>
            )}

            {/* TTT */}
            {mode === 'ttt' && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#faf8f3]">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                        ${m.role === 'user'
                          ? 'bg-[#0a1e3f] text-white'
                          : 'bg-gradient-to-br from-[#d4a574] to-[#c19463] text-white'}`}>
                        {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed
                        ${m.role === 'user'
                          ? 'bg-[#0a1e3f] text-white rounded-tr-sm'
                          : 'bg-white text-gray-800 shadow-sm rounded-tl-sm'}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {typing && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4a574] to-[#c19463]
                        flex items-center justify-center text-white">
                        <Bot size={14} />
                      </div>
                      <div className="p-4 rounded-2xl bg-white shadow-sm flex gap-1">
                        {[0, 1, 2].map(i => (
                          <span key={i} className="w-2 h-2 bg-[#d4a574] rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>

                {/* Quick questions (첫 메시지 후만) */}
                {messages.length === 1 && (
                  <div className="px-6 py-3 border-t border-gray-100 bg-white">
                    <div className="text-xs text-gray-400 mb-2">Try asking:</div>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.map(q => (
                        <button key={q}
                          onClick={() => { setInput(q); setTimeout(send, 100) }}
                          className="text-xs px-3 py-1.5 rounded-full bg-[#faf8f3]
                            hover:bg-[#f0eadf] text-[#0a1e3f] transition border border-gray-100">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 입력 */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && send()}
                      placeholder="Type your question..."
                      className="flex-1 px-5 py-3 rounded-full border border-gray-200
                        focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 outline-none"
                    />
                    <button onClick={send}
                      disabled={!input.trim()}
                      className="px-5 py-3 rounded-full bg-[#d4a574] text-white font-semibold
                        hover:bg-[#c19463] transition disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center gap-2">
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Finished trying it? → survey (so the survey isn't buried at the page bottom) */}
          <div className="mt-6 rounded-2xl border border-[#ecd9a8] bg-[#fef8ee] px-5 py-4 sm:px-6 sm:py-5
            flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex-1">
              <div className="text-[15px] font-bold text-[#0a1e3f]">Done trying the assistant?</div>
              <div className="text-[13px] text-gray-600">
                Please share your experience — about 2 minutes, and it supports our research.
              </div>
            </div>
            <button
              onClick={() => { logVisit('action', 'survey_open_assistant'); window.dispatchEvent(new Event('gba-open-survey')) }}
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0a1e3f] text-white
                text-sm font-semibold shadow-lg hover:bg-[#16335f] transition">
              Take the 2-min survey <ArrowRight size={16} />
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <Sparkles size={12} className="text-[#d4a574]" />
            Answers powered by on-prem RAG + Gemma4
          </div>
        </div>
      </section>

      {/* Sign in before starting the avatar — so background recognition is delivered
          during the conversation, not just linked at survey time. */}
      {avatarLoginPrompt && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto
          bg-black/50 backdrop-blur-sm px-4 py-6"
          onClick={() => setAvatarLoginPrompt(false)}>
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="relative bg-gradient-to-br from-[#0a1e3f] to-[#1a3567] px-6 py-6 text-center">
              <button onClick={() => setAvatarLoginPrompt(false)} aria-label="Close"
                className="absolute top-3.5 right-3.5 text-white/70 hover:text-white transition">
                <X size={22} />
              </button>
              <div className="mx-auto w-12 h-12 rounded-xl bg-[#d4a574] flex items-center justify-center text-white shadow-lg">
                <Video size={24} />
              </div>
              <h3 className="mt-3 text-white text-lg font-bold">Sign in to start the avatar</h3>
              <p className="mt-1 text-white/75 text-sm leading-relaxed">
                The avatar greets you by name and tailors answers to you — please sign in first.
              </p>
            </div>
            <div className="px-6 py-5">
              <button onClick={goSignInForAvatar}
                className="w-full py-3 rounded-xl bg-[#0a1e3f] text-white text-sm font-semibold
                  shadow-lg hover:bg-[#16335f] transition">
                Sign in &amp; start
              </button>
              <button onClick={() => { setAvatarLoginPrompt(false); startAvatar() }}
                className="w-full mt-2 py-2.5 text-sm text-gray-500 hover:text-[#0a1e3f] transition">
                Start without signing in
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
