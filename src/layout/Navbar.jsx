import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location.pathname])

  const links = [
    { to: '/about',      label: 'About' },
    { to: '/major',      label: 'Major' },
    { to: '/curriculum', label: 'Curriculum' },
    { to: '/faculty',    label: 'Faculty' },
    { to: '/career',     label: 'Career' },
    { to: '/assistant',  label: 'AI Assistant' },
  ]

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

        <ul className="hidden lg:flex items-center gap-7">
          {links.map(l => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={`text-sm font-medium hover:text-[#d4a574] transition
                  ${location.pathname === l.to
                    ? 'text-[#d4a574]'
                    : transparent ? 'text-white/90' : 'text-gray-700'}`}>
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/admission" className="ml-2 px-5 py-2.5 rounded-full bg-[#d4a574] text-white
              text-sm font-semibold shadow-lg shadow-[#d4a574]/30 hover:bg-[#c19463] transition">
              Apply Now
            </Link>
          </li>
        </ul>

        <button onClick={() => setOpen(!open)} className={`lg:hidden ${transparent ? 'text-white' : 'text-[#0a1e3f]'}`}>
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className="block py-3 text-gray-700 font-medium border-b border-gray-100 last:border-0">
              {l.label}
            </Link>
          ))}
          <Link to="/admission"
            className="mt-4 block text-center px-5 py-3 rounded-full bg-[#d4a574] text-white font-semibold">
            Apply Now
          </Link>
        </div>
      )}
    </header>
  )
}
