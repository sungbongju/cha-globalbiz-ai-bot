import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone, MessageSquareHeart } from 'lucide-react'
import { logVisit } from '../lib/auth'

export default function Footer() {
  const openSurvey = () => {
    logVisit('action', 'survey_open')
    window.dispatchEvent(new Event('gba-open-survey'))
  }
  return (
    <footer className="bg-[#08172e] text-white/70 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4a574] to-[#c19463]
                flex items-center justify-center text-white font-bold shadow-lg">
                CHA
              </div>
              <div>
                <div className="text-white font-bold tracking-wide">GLOBAL BUSINESS AI</div>
                <div className="text-xs text-white/60">CHA University · School of Global Convergence</div>
              </div>
            </Link>
            <p className="max-w-md text-sm leading-relaxed">
              A new English-taught undergraduate major at CHA University, designed for international
              students who want to lead the next era of AI-driven business.
            </p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-[#d4a574] font-semibold mb-4">Quick Links</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition">About</Link></li>
              <li><Link to="/curriculum" className="hover:text-white transition">Curriculum</Link></li>
              <li><Link to="/faculty" className="hover:text-white transition">Faculty</Link></li>
              <li><Link to="/admission" className="hover:text-white transition">Apply Now</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-[#d4a574] font-semibold mb-4">Contact</div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><MapPin size={14} className="mt-1 text-[#d4a574]" />
                120 Haeryong-ro, Pocheon, Gyeonggi-do, Korea</li>
              <li className="flex items-center gap-2"><Phone size={14} className="text-[#d4a574]" />
                +82-31-850-8984</li>
              <li className="flex items-center gap-2"><Mail size={14} className="text-[#d4a574]" />
                <a href="mailto:dkpark@cha.ac.kr" className="hover:text-white transition">dkpark@cha.ac.kr</a></li>
            </ul>
          </div>
        </div>

        {/* Survey invite — navy/gold, opens the trust-signals research survey */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
          rounded-2xl border border-[#d4a574]/30 bg-white/5 px-6 py-5">
          <div className="flex items-center gap-3">
            <MessageSquareHeart size={22} className="text-[#d4a574] shrink-0" />
            <div>
              <div className="text-white font-semibold text-sm">Help us improve</div>
              <div className="text-xs text-white/60">Share your experience with the AI assistant — about 2 minutes, fully anonymous.</div>
            </div>
          </div>
          <button
            onClick={openSurvey}
            className="shrink-0 rounded-xl bg-[#d4a574] px-5 py-2.5 text-sm font-semibold text-white
              shadow-lg shadow-[#d4a574]/20 hover:bg-[#c19463] transition"
          >
            Take the 2-min survey
          </button>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-wrap justify-between items-center gap-4 text-xs text-white/50">
          <div>© 2026 CHA University · School of Global Convergence. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
