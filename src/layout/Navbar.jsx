import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react'
import AuthModal from '../components/AuthModal'
import { getUser, clearAuth, logVisit } from '../lib/auth'

// 상단 메뉴 구조 — children 이 있으면 호버 드롭다운, 없으면 단일 링크.
// 서브항목 hash 는 각 페이지 <section id="..."> 와 일치해야 함.
const menu = [
  {
    to: '/about', label: 'About',
    children: [
      { label: 'Overview',            hash: 'overview' },
      { label: 'Why CHA, Why Now',    hash: 'why-cha' },
      { label: 'What Makes Us Different', hash: 'differentiators' },
    ],
  },
  { to: '/major', label: 'Major' },
  {
    to: '/curriculum', label: 'Curriculum',
    children: [
      { label: 'The 4-Year Journey', hash: 'journey' },
      { label: 'Modular Structure',  hash: 'modules' },
    ],
  },
  { to: '/faculty', label: 'Faculty' },
  {
    to: '/career', label: 'Career',
    children: [
      { label: 'Career Tracks',    hash: 'tracks' },
      { label: 'Career Pathways',  hash: 'pathways' },
      { label: 'Global Advantage', hash: 'global-advantage' },
    ],
  },
  { to: '/assistant', label: 'AI Assistant' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)          // 모바일 메뉴
  const [openAccordion, setOpenAccordion] = useState(null) // 모바일 아코디언
  const [hovered, setHovered] = useState(null)     // 데스크탑 드롭다운
  const [moreOpen, setMoreOpen] = useState(false)  // Priority+ "More" 드롭다운
  const [scrolled, setScrolled] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)  // 로그인 모달
  const [user, setUser] = useState(getUser())      // 로그인 사용자
  const location = useLocation()
  const isHome = location.pathname === '/'

  // ─── Priority+ 오버플로우 측정 ───
  // 들어가는 만큼 메뉴를 보여주고, 넘치는 항목만 "More ▾" 로 접는다.
  const [visibleCount, setVisibleCount] = useState(menu.length)
  const navRef = useRef(null)
  const logoRef = useRef(null)
  const actionsRef = useRef(null)        // 우측 인증 + Apply 묶음
  const itemRefs = useRef([])            // 각 상단 항목 DOM
  const itemWidthsRef = useRef([])       // 항목 natural 폭(최초 1회 측정, 리사이즈와 무관)

  const recalc = useCallback(() => {
    const nav = navRef.current
    if (!nav || itemWidthsRef.current.length === 0) return
    const logoW = logoRef.current ? logoRef.current.offsetWidth : 0
    const actW = actionsRef.current ? actionsRef.current.offsetWidth : 0
    const cs = getComputedStyle(nav)
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
    const GAP = 20, MORE = 84, SLACK = 28
    const avail = nav.clientWidth - padX - logoW - actW - GAP * 2 - SLACK
    const widths = itemWidthsRef.current
    const all = widths.reduce((a, w, i) => a + w + (i > 0 ? GAP : 0), 0)
    if (all <= avail) { setVisibleCount(menu.length); return }
    let used = 0, count = 0
    for (let i = 0; i < widths.length; i++) {
      const add = widths[i] + (i > 0 ? GAP : 0)
      if (used + add + GAP + MORE <= avail) { used += add; count++ } else break
    }
    setVisibleCount(count)
  }, [])

  // 최초 레이아웃(모든 항목 렌더 상태)에서 항목 폭을 한 번 측정 → paint 전 trim (깜빡임 없음)
  useLayoutEffect(() => {
    if (itemWidthsRef.current.length === 0 && itemRefs.current.length) {
      const ws = itemRefs.current.map(el => (el ? el.getBoundingClientRect().width : 0))
      if (ws.length === menu.length && ws.every(w => w > 0)) {
        itemWidthsRef.current = ws
        recalc()
      }
    }
  }, [recalc])

  // 리사이즈 시 재계산 (ResizeObserver + 폰트 로드 후 1회)
  useEffect(() => {
    recalc()
    const ro = new ResizeObserver(() => recalc())
    if (navRef.current) ro.observe(navRef.current)
    window.addEventListener('resize', recalc)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => recalc()).catch(() => {})
    }
    return () => { ro.disconnect(); window.removeEventListener('resize', recalc) }
  }, [recalc, user])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 다른 곳(Layout의 verifyToken 등)에서 로그인 상태가 바뀌면 동기화
  useEffect(() => {
    const sync = () => setUser(getUser())
    window.addEventListener('gba-auth-changed', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('gba-auth-changed', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  // Open the login modal on demand (e.g. the survey's "Sign in & continue" gate).
  useEffect(() => {
    const openAuth = () => setAuthOpen(true)
    window.addEventListener('gba-open-auth', openAuth)
    return () => window.removeEventListener('gba-open-auth', openAuth)
  }, [])

  const handleAuthSuccess = (u) => {
    setUser(u)
    window.dispatchEvent(new Event('gba-auth-changed'))
    // If they came from the survey's sign-in gate, return them to the survey.
    try {
      if (sessionStorage.getItem('gba_pending_survey')) {
        sessionStorage.removeItem('gba_pending_survey')
        window.dispatchEvent(new Event('gba-open-survey'))
      }
    } catch { /* sessionStorage unavailable */ }
  }
  const handleLogout = () => {
    clearAuth()
    setUser(null)
    window.dispatchEvent(new Event('gba-auth-changed'))
  }

  useEffect(() => { setOpen(false); setOpenAccordion(null); setMoreOpen(false) }, [location.pathname])

  // 홈 페이지에서 스크롤 전이면 투명 (Hero 위), 그 외엔 화이트
  const transparent = isHome && !scrolled

  const linkColor = transparent ? 'text-white/90' : 'text-gray-700'

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${transparent ? 'bg-transparent' : 'bg-white/90 backdrop-blur-md shadow-sm'}`}>
      <nav ref={navRef} className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link ref={logoRef} to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a1e3f] to-[#1a3567]
            flex items-center justify-center text-white font-bold text-lg shadow-lg
            group-hover:scale-105 transition-transform">
            CHA
          </div>
          <div className="leading-tight">
            <div className={`font-bold text-sm tracking-wide ${transparent ? 'text-white' : 'text-[#0a1e3f]'}`}>
              GLOBAL BUSINESS AI
            </div>
            <div className={`text-xs ${transparent ? 'text-white/70' : 'text-gray-500'}`}>
              CHA University · School of Global Convergence
            </div>
          </div>
        </Link>

        {/* 데스크탑 Priority+ 내비 (≥ md). 좁아지면 넘치는 항목만 More 로 접힘. */}
        <div className="hidden md:flex items-center gap-5 whitespace-nowrap">
          <div className="flex items-center gap-5">
            {menu.map((item, idx) => {
              if (idx >= visibleCount) return null
              const isActive = location.pathname === item.to
              const hasDropdown = !!item.children
              return (
                <div
                  key={item.to}
                  ref={el => { itemRefs.current[idx] = el }}
                  className="relative"
                  onMouseEnter={() => setHovered(item.to)}
                  onMouseLeave={() => setHovered(null)}>
                  <Link
                    to={item.to}
                    className={`flex items-center gap-1 text-sm font-medium hover:text-[#d4a574] transition
                      ${isActive ? 'text-[#d4a574]' : linkColor}`}>
                    {item.label}
                    {hasDropdown && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${hovered === item.to ? 'rotate-180' : ''}`} />
                    )}
                  </Link>

                  {hasDropdown && (
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 w-60
                        transition-all duration-200 origin-top
                        ${hovered === item.to
                          ? 'opacity-100 translate-y-0 visible pointer-events-auto'
                          : 'opacity-0 -translate-y-2 invisible pointer-events-none'}`}>
                      <div className="rounded-xl bg-white shadow-xl ring-1 ring-black/5 border border-gray-100 py-2 overflow-hidden">
                        {item.children.map(sub => (
                          <Link
                            key={sub.hash}
                            to={`${item.to}#${sub.hash}`}
                            className="block px-5 py-2.5 text-sm font-medium text-[#0a1e3f]
                              hover:bg-[#faf8f3] hover:text-[#d4a574] transition-colors">
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* More ▾ — 넘친 항목 모음 (Priority+) */}
            {visibleCount < menu.length && (
              <div
                className="relative"
                onMouseEnter={() => setMoreOpen(true)}
                onMouseLeave={() => setMoreOpen(false)}>
                <button
                  type="button"
                  className={`flex items-center gap-1 text-sm font-medium hover:text-[#d4a574] transition ${linkColor}`}>
                  More
                  <ChevronDown size={14} className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`absolute right-0 top-full pt-3 w-64
                    transition-all duration-200 origin-top
                    ${moreOpen
                      ? 'opacity-100 translate-y-0 visible pointer-events-auto'
                      : 'opacity-0 -translate-y-2 invisible pointer-events-none'}`}>
                  <div className="rounded-xl bg-white shadow-xl ring-1 ring-black/5 border border-gray-100 py-2 overflow-hidden max-h-[70vh] overflow-y-auto">
                    {menu.slice(visibleCount).map(item => (
                      <div key={item.to}>
                        <Link
                          to={item.to}
                          className="block px-5 py-2.5 text-sm font-semibold text-[#0a1e3f]
                            hover:bg-[#faf8f3] hover:text-[#d4a574] transition-colors">
                          {item.label}
                        </Link>
                        {item.children && item.children.map(sub => (
                          <Link
                            key={sub.hash}
                            to={`${item.to}#${sub.hash}`}
                            className="block pl-8 pr-5 py-2 text-xs font-medium text-gray-500
                              hover:bg-[#faf8f3] hover:text-[#d4a574] transition-colors">
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 인증 + Apply (항상 표시, 측정 시 고정폭으로 취급) */}
          <div ref={actionsRef} className="flex items-center gap-5 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1.5 text-sm font-medium
                  ${transparent ? 'text-white/90' : 'text-[#0a1e3f]'}`}>
                  <User size={16} className="text-[#d4a574]" />
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  aria-label="Sign out"
                  title="Sign out"
                  className={`p-1.5 rounded-full transition hover:text-[#d4a574]
                    ${transparent ? 'text-white/70' : 'text-gray-500'}`}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className={`flex items-center gap-1.5 text-sm font-medium hover:text-[#d4a574] transition ${linkColor}`}>
                <User size={16} />
                Sign in / Sign up
              </button>
            )}
            <Link to="/admission" onClick={() => logVisit('action', 'apply_click')}
              className="px-5 py-2.5 rounded-full bg-[#d4a574] text-white
              text-sm font-semibold shadow-lg shadow-[#d4a574]/30 hover:bg-[#c19463] transition">
              Apply Now
            </Link>
          </div>
        </div>

        {/* 모바일 햄버거 (< md) — 아이콘만으론 놓치기 쉬워 'Menu' 라벨 동반 */}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          className={`md:hidden flex items-center gap-1.5 text-sm font-semibold
            ${transparent ? 'text-white' : 'text-[#0a1e3f]'}`}>
          {open ? <X size={26} /> : <Menu size={26} />}
          <span>{open ? '' : 'Menu'}</span>
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 max-h-[80vh] overflow-y-auto">
          {menu.map(item => {
            const hasDropdown = !!item.children
            const expanded = openAccordion === item.to
            return (
              <div key={item.to} className="border-b border-gray-100 last:border-0">
                <div className="flex items-center justify-between">
                  <Link to={item.to} className="block py-3 text-gray-700 font-medium flex-1">
                    {item.label}
                  </Link>
                  {hasDropdown && (
                    <button
                      onClick={() => setOpenAccordion(expanded ? null : item.to)}
                      aria-label={`Toggle ${item.label} submenu`}
                      className="p-2 text-gray-500">
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                {hasDropdown && expanded && (
                  <div className="pb-2 pl-3">
                    {item.children.map(sub => (
                      <Link
                        key={sub.hash}
                        to={`${item.to}#${sub.hash}`}
                        className="block py-2 text-sm text-gray-600 hover:text-[#d4a574]">
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {user ? (
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="flex items-center gap-1.5 text-sm font-medium text-[#0a1e3f]">
                <User size={16} className="text-[#d4a574]" />
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#d4a574]">
                <LogOut size={15} /> Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setOpen(false); setAuthOpen(true) }}
              className="mt-4 w-full flex items-center justify-center gap-1.5 px-5 py-3 rounded-full
                border border-[#0a1e3f] text-[#0a1e3f] font-semibold">
              <User size={16} /> Sign in / Sign up
            </button>
          )}
          <Link to="/admission"
            onClick={() => { setOpen(false); logVisit('action', 'apply_click') }}
            className="mt-3 block text-center px-5 py-3 rounded-full bg-[#d4a574] text-white font-semibold">
            Apply Now
          </Link>
        </div>
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
    </header>
  )
}
