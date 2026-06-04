import { useState, useEffect } from 'react'
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
  const [scrolled, setScrolled] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)  // 로그인 모달
  const [user, setUser] = useState(getUser())      // 로그인 사용자
  const location = useLocation()
  const isHome = location.pathname === '/'

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

  const handleAuthSuccess = (u) => {
    setUser(u)
    window.dispatchEvent(new Event('gba-auth-changed'))
  }
  const handleLogout = () => {
    clearAuth()
    setUser(null)
    window.dispatchEvent(new Event('gba-auth-changed'))
  }

  useEffect(() => { setOpen(false); setOpenAccordion(null) }, [location.pathname])

  // 홈 페이지에서 스크롤 전이면 투명 (Hero 위), 그 외엔 화이트
  const transparent = isHome && !scrolled

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${transparent ? 'bg-transparent' : 'bg-white/90 backdrop-blur-md shadow-sm'}`}>
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
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

        <ul className="hidden min-[1180px]:flex items-center gap-5 whitespace-nowrap">
          {menu.map(item => {
            const isActive = location.pathname === item.to
            const hasDropdown = !!item.children
            return (
              <li
                key={item.to}
                className="relative"
                onMouseEnter={() => setHovered(item.to)}
                onMouseLeave={() => setHovered(null)}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-1 text-sm font-medium hover:text-[#d4a574] transition
                    ${isActive
                      ? 'text-[#d4a574]'
                      : transparent ? 'text-white/90' : 'text-gray-700'}`}>
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
              </li>
            )
          })}
          <li>
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
                className={`flex items-center gap-1.5 text-sm font-medium hover:text-[#d4a574] transition
                  ${transparent ? 'text-white/90' : 'text-gray-700'}`}>
                <User size={16} />
                Sign in / Sign up
              </button>
            )}
          </li>
          <li>
            <Link to="/admission" onClick={() => logVisit('action', 'apply_click')}
              className="ml-2 px-5 py-2.5 rounded-full bg-[#d4a574] text-white
              text-sm font-semibold shadow-lg shadow-[#d4a574]/30 hover:bg-[#c19463] transition">
              Apply Now
            </Link>
          </li>
        </ul>

        <button onClick={() => setOpen(!open)} className={`min-[1180px]:hidden ${transparent ? 'text-white' : 'text-[#0a1e3f]'}`}>
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4 max-h-[80vh] overflow-y-auto">
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
