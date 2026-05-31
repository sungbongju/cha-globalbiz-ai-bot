import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { getVisitCount, getUser } from '../lib/auth'

// 재방문 인사 토스트 — 앱 로드 시 visit_count 조회 후 count>=2 면 표시.
// 첫 방문자는 아무것도 안 봄. navy/gold, 우하단, 8초 후 자동 사라짐(클릭 시 즉시).
export default function ReturnGreeting() {
  const [info, setInfo] = useState(null) // { count, user }
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    let alive = true
    getVisitCount().then(r => {
      if (!alive || !r) return
      // count = 서로 다른 방문 일수. 2 이상이면 "재방문".
      if ((r.count || 0) >= 2) {
        setInfo({ count: r.count, user: getUser() })
      }
    })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!info) return
    const t = setTimeout(() => dismiss(), 8000)
    return () => clearTimeout(t)
  }, [info])

  function dismiss() {
    setClosing(true)
    setTimeout(() => setInfo(null), 250)
  }

  if (!info) return null

  const nickname = info.user && info.user.name ? info.user.name : null
  const text = nickname
    ? `Welcome back, ${nickname} — visit #${info.count}`
    : `Welcome back — this is visit #${info.count}`

  return (
    <div
      role="status"
      onClick={dismiss}
      className={`fixed bottom-6 left-6 z-50 cursor-pointer select-none
        max-w-xs rounded-xl shadow-2xl border border-[#d4a574]/40
        bg-gradient-to-br from-[#0a1e3f] to-[#1a3567] text-white
        px-4 py-3 pr-9 transition-all duration-250
        ${closing ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); dismiss() }}
        aria-label="Dismiss"
        className="absolute top-2 right-2 text-white/60 hover:text-white transition"
      >
        <X size={16} />
      </button>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#d4a574]" />
        <span className="text-xs uppercase tracking-widest text-[#d4a574] font-semibold">
          Welcome back
        </span>
      </div>
      <p className="mt-1 text-sm leading-snug">{text}</p>
    </div>
  )
}
