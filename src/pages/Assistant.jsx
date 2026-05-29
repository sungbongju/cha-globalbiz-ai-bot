import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, Send, User, Bot, Video, Mic, MessageSquare } from 'lucide-react'
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

const SAMPLE_REPLIES = [
  "Great question! The Global Business AI major rests on three pillars: AI Fluency, Global Business, and Bio-Healthcare Anchor. AI is treated as the strategic lens of modern enterprise — not a supporting tool — and bio-healthcare grounds your expertise in CHA's hospital and biotech ecosystem.",
  "Our curriculum is taught entirely in English. Learning here means immersion in Korea's most advanced export industries — semiconductors, batteries, biopharmaceuticals, K-content, and more — with bio-healthcare as the anchoring domain.",
  "Through CHA's deep specialization in bio-healthcare, students directly engage with university hospitals, fertility centers, biotech ventures, and clinical research institutes operating on the global frontier of life sciences.",
  "Career pathways extend across global pharmaceutical and biotech corporations, digital health ventures, semiconductor and battery enterprises, healthcare consulting firms, life-science investment, and public policy agencies. International students gain a strategic gateway to Korean and broader Asian markets.",
  "Specific admission cycle dates, quotas, and tuition details are confirmed each cycle. Please contact our admissions team or reach out through the contact form on the Admission page — we respond within 48 hours.",
]

const AVATAR_GREETING =
  "Hi! I'm the GBA Assistant. Ask me anything about the Global Business AI major — courses, faculty, careers, or life in Korea."

const INTERACTIVITY_TYPE = 'CONVERSATIONAL'

export default function Assistant() {
  const [mode, setMode] = useState('ttt')   // 'ftf' | 'sts' | 'ttt'
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
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const reply = SAMPLE_REPLIES[Math.floor(Math.random() * SAMPLE_REPLIES.length)]
      setMessages(m => [...m, { role: 'bot', text: reply }])
      setTyping(false)
    }, 1000 + Math.random() * 800)
  }

  // ─── Voice Mode (STS): handle a finished transcript ──────────────────
  // user speech → text (already done by MicRecorder) → reply → OmniVoice → play.
  // Reply text reuses SAMPLE_REPLIES for this pass (RAG/LLM hookup is later work).
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

    const reply = SAMPLE_REPLIES[Math.floor(Math.random() * SAMPLE_REPLIES.length)]
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
  const speakAvatar = useCallback((text) => {
    if (!roomRef.current || !sessionRef.current || !text) return
    isSpeakingRef.current = true
    setAvatarStatus('speaking')
    sendAvatarCommand(roomRef.current, 'avatar.speak_text', { text })
  }, [])

  // ─── Avatar: send a typed question while in avatar mode ───
  // No globalbiz LLM backend yet — reuse SAMPLE_REPLIES so the avatar talks.
  const sendAvatarMessage = useCallback((userText) => {
    const text = (userText || '').trim()
    if (!text) return
    const reply = SAMPLE_REPLIES[Math.floor(Math.random() * SAMPLE_REPLIES.length)]
    speakAvatar(reply)
  }, [speakAvatar])

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
  }, [])

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
          }
          if (type === 'avatar.speak_ended') {
            isSpeakingRef.current = false
            setAvatarStatus('connected')
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

      try {
        await room.localParticipant.setMicrophoneEnabled(true)
      } catch (e) {
        console.warn('[LA] setMicrophoneEnabled error:', e)
      }

      // Periodic keep-alive — LiveAvatar sessions auto-close when idle.
      keepAliveIntervalRef.current = setInterval(() => {
        keepAliveLiveAvatar(sess.session_id)
      }, 60_000)

      setAvatarStatus('connected')

      // Greeting (proves the speak pipeline). Delay 800ms so the first
      // command isn't dropped before tracks finish attaching.
      isSpeakingRef.current = true
      setAvatarStatus('speaking')
      setTimeout(() => {
        try { sendAvatarCommand(roomRef.current, 'avatar.speak_text', { text: AVATAR_GREETING }) }
        catch (e) { console.error('greeting speak error:', e) }
      }, 800)
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
  }, [startUserCamera, stopUserCamera])

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
        subtitle="Trained on every detail of the program. Choose your preferred mode: avatar, voice, or text."
      />

      <section className="py-12 bg-[#faf8f3] min-h-[600px]">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          {/* 모드 선택 */}
          <div className="flex justify-center gap-2 mb-8">
            {[
              { id: 'ftf', icon: Video,         label: 'Avatar Mode' },
              { id: 'sts', icon: Mic,           label: 'Voice Mode' },
              { id: 'ttt', icon: MessageSquare, label: 'Text Chat' },
            ].map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold
                  transition border ${mode === m.id
                    ? 'bg-[#0a1e3f] text-white border-[#0a1e3f] shadow-lg'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#d4a574]'}`}>
                <m.icon size={16} />
                {m.label}
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
              <div className="flex-1 flex flex-col bg-gradient-to-br from-[#0a1e3f] to-[#1a3567]">
                <div className="flex-1 flex items-center justify-center overflow-y-auto">
                  <AvatarPanel
                    status={avatarStatus}
                    videoRef={videoRef}
                    audioRef={audioRef}
                    userVideoRef={userVideoRef}
                    videoReady={videoReady}
                    cameraActive={Boolean(cameraStream)}
                    onStart={startAvatar}
                    onStop={stopAvatar}
                    onInterrupt={interruptAvatar}
                  />
                </div>

                {/* Type to the avatar (avatar speaks the reply) */}
                {(avatarStatus === 'connected' || avatarStatus === 'speaking') && (
                  <div className="p-4 border-t border-white/10 bg-[#0a1e3f]">
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
                        className="flex-1 px-5 py-3 rounded-full border border-white/20 bg-white/10 text-white
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

          <div className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <Sparkles size={12} className="text-[#d4a574]" />
            Prototype responses · Real LLM integration coming soon
          </div>
        </div>
      </section>
    </>
  )
}
