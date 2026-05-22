import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, User, Bot, Video, Mic, MessageSquare } from 'lucide-react'
import PageHero from '../components/PageHero'

const SAMPLE_REPLIES = [
  "Great question! The Global Business AI major rests on three pillars: AI Fluency, Global Business, and Bio-Healthcare Anchor. AI is treated as the strategic lens of modern enterprise — not a supporting tool — and bio-healthcare grounds your expertise in CHA's hospital and biotech ecosystem.",
  "Our curriculum is taught entirely in English. Learning here means immersion in Korea's most advanced export industries — semiconductors, batteries, biopharmaceuticals, K-content, and more — with bio-healthcare as the anchoring domain.",
  "Through CHA's deep specialization in bio-healthcare, students directly engage with university hospitals, fertility centers, biotech ventures, and clinical research institutes operating on the global frontier of life sciences.",
  "Career pathways extend across global pharmaceutical and biotech corporations, digital health ventures, semiconductor and battery enterprises, healthcare consulting firms, life-science investment, and public policy agencies. International students gain a strategic gateway to Korean and broader Asian markets.",
  "Specific admission cycle dates, quotas, and tuition details are confirmed each cycle. Please contact our admissions team or reach out through the contact form on the Admission page — we respond within 48 hours.",
]

export default function Assistant() {
  const [mode, setMode] = useState('ttt')   // 'ftf' | 'sts' | 'ttt'
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm GBA Assistant — trained on everything about the Global Business AI major. Ask me anything: courses, faculty, application, career outcomes, life in Korea... anything." },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef(null)

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

            {/* FTF/STS placeholder */}
            {mode === 'ftf' && (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#0a1e3f] to-[#1a3567] text-white">
                <div className="text-center p-8">
                  <div className="w-40 h-40 mx-auto rounded-2xl bg-white/10 backdrop-blur-md
                    border border-white/20 flex items-center justify-center text-6xl mb-6">
                    👨‍🏫
                  </div>
                  <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Avatar Mode
                  </h3>
                  <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
                    Coming soon — real-time AI avatar that sees you and responds in real time, just like a face-to-face conversation.
                  </p>
                  <button onClick={() => setMode('ttt')}
                    className="px-6 py-3 rounded-full bg-[#d4a574] text-white font-semibold hover:bg-[#c19463] transition">
                    Try Text Chat instead
                  </button>
                </div>
              </div>
            )}

            {mode === 'sts' && (
              <div className="flex-1 flex items-center justify-center bg-[#faf8f3]">
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#d4a574] to-[#c19463]
                    flex items-center justify-center mb-6 shadow-2xl">
                    <Mic className="text-white" size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0a1e3f] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Voice Mode
                  </h3>
                  <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                    Coming soon — speak naturally and get instant voice responses.
                  </p>
                  <button onClick={() => setMode('ttt')}
                    className="px-6 py-3 rounded-full bg-[#0a1e3f] text-white font-semibold hover:bg-[#1a3567] transition">
                    Try Text Chat instead
                  </button>
                </div>
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
