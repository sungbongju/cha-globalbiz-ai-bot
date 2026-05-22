import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, X, Sparkles, ArrowRight } from 'lucide-react'

// 모든 페이지 우하단에 떠다니는 챗봇 위젯 (placeholder)
export default function AssistantWidget() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* 떠다니는 버튼 */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 group"
        aria-label="Open AI Assistant"
      >
        <div className={`absolute -inset-2 rounded-full bg-[#d4a574] opacity-30 blur-xl
          group-hover:opacity-50 transition ${open ? 'opacity-0' : ''}`} />
        <div className={`relative w-14 h-14 rounded-full shadow-2xl
          flex items-center justify-center transition-all
          ${open ? 'bg-[#0a1e3f] rotate-90' : 'bg-gradient-to-br from-[#d4a574] to-[#c19463] hover:scale-110'}`}>
          {open ? <X className="text-white" size={22} /> : <MessageCircle className="text-white" size={22} />}
        </div>
      </button>

      {/* 챗 패널 */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 rounded-2xl bg-white
          shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-br from-[#0a1e3f] to-[#1a3567] p-5 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#d4a574] flex items-center justify-center font-bold">
                AI
              </div>
              <div>
                <div className="font-bold">GBA Assistant</div>
                <div className="text-xs text-white/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  Online
                </div>
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Hi! I'm trained on everything about the Global Business AI major.
              How can I help you?
            </p>
          </div>

          <div className="p-5 space-y-3">
            <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
              Quick Questions
            </div>
            {[
              'What can I become after graduating?',
              'Tell me about the curriculum',
              'How do I apply as an international student?',
              'Who teaches in this major?',
            ].map(q => (
              <button key={q}
                className="w-full text-left p-3 rounded-lg bg-[#faf8f3] hover:bg-[#f0eadf]
                  text-sm text-[#0a1e3f] transition border border-transparent
                  hover:border-[#d4a574] group flex items-center justify-between">
                <span>{q}</span>
                <ArrowRight size={14} className="text-[#d4a574] opacity-0 group-hover:opacity-100 transition" />
              </button>
            ))}

            <Link to="/assistant"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 w-full p-3 rounded-lg
                bg-[#d4a574] text-white text-sm font-semibold hover:bg-[#c19463] transition">
              <Sparkles size={14} />
              Start Full Conversation
            </Link>

            <div className="text-xs text-gray-400 text-center pt-2">
              Powered by LiveAvatar AI · CHA University
            </div>
          </div>
        </div>
      )}
    </>
  )
}
