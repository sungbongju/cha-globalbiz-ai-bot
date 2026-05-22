import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Globe2, BrainCircuit, Sparkles, ArrowRight,
  Users, Briefcase, MessageCircle, ChevronRight, Award, Play
} from 'lucide-react'
import VideoModal from '../components/VideoModal'

// ── Hero ──
function Hero({ onWatchVideo }) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0a1e3f]">
      {/* 배경 이미지: 다국적 학생 협업 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1920&q=80&auto=format&fit=crop')`,
        }}
      />
      {/* 다크 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1e3f]/95 via-[#0a1e3f]/85 to-[#1a3567]/80" />
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `radial-gradient(circle at 20% 30%, rgba(212,165,116,0.4) 0%, transparent 50%),
                                   radial-gradient(circle at 80% 70%, rgba(232,119,92,0.3) 0%, transparent 50%)` }} />
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-40 pb-20 lg:pt-48">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md
            border border-white/20 text-white/90 text-sm mb-8">
            <Sparkles size={14} className="text-[#d4a574]" />
            New Major · Opening 2026
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl xl:text-[88px] font-bold leading-[1.05] tracking-tight text-white mb-6"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Where global business<br />
          meets <span className="italic text-[#d4a574]">artificial intelligence</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed mb-10">
          An English-taught major at CHA University, where AI co-designs strategy and
          bio-healthcare anchors expertise — preparing the next generation of leaders who can
          bridge strategic intent and technological execution across cultures and markets.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap gap-4">
          <button onClick={onWatchVideo} className="group inline-flex items-center gap-2 px-7 py-4 rounded-full
            bg-[#d4a574] text-white font-semibold shadow-2xl shadow-[#d4a574]/30
            hover:bg-[#c19463] transition">
            <Play size={18} className="fill-white" />
            Watch Welcome Message
            <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
          </button>
          <Link to="/assistant" className="inline-flex items-center gap-2 px-7 py-4 rounded-full
            bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold
            hover:bg-white/20 transition">
            <MessageCircle size={18} />
            Ask our AI Assistant
          </Link>
          <Link to="/about" className="inline-flex items-center gap-2 px-7 py-4 rounded-full
            bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold
            hover:bg-white/20 transition">
            Learn About the Program
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl">
          {[
            { title: 'English-taught',     sub: 'Every course in English' },
            { title: 'AI as Strategic Lens', sub: 'Not a supporting tool' },
            { title: 'Bio-Healthcare Anchor', sub: 'CHA hospital ecosystem' },
            { title: 'Global Career Pathway', sub: 'Korea + Asian markets' },
          ].map(s => (
            <div key={s.title} className="border-l-2 border-[#d4a574] pl-4">
              <div className="text-lg md:text-xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {s.title}
              </div>
              <div className="text-xs md:text-sm text-white/70 mt-2 uppercase tracking-wider">{s.sub}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs uppercase tracking-widest">
        <div className="flex flex-col items-center gap-2">
          Scroll
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronRight className="rotate-90" size={16} />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

// ── Preview Sections (각 페이지 미리보기 + 더 보기 링크) ──
function PreviewAbout() {
  return (
    <section className="py-32 bg-[#faf8f3]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* 사진 — 다국적 학생 토론 */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&q=80&auto=format&fit=crop"
                alt="International students collaborating"
                className="w-full h-[440px] object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur p-5 rounded-2xl shadow-lg">
                <div className="text-xs text-[#d4a574] font-bold uppercase tracking-widest mb-1">Class of 2026</div>
                <div className="text-sm text-[#0a1e3f] font-semibold">Students from 12+ countries, one shared dream</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="text-sm uppercase tracking-widest text-[#d4a574] font-semibold mb-4">
              About the Program
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-[#0a1e3f] mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              The convergence<br />that defines tomorrow
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Leaders who command only conventional management knowledge — or only technical
              expertise — can no longer navigate environments in which AI <strong className="text-[#0a1e3f]">co-designs strategy</strong> and
              global volatility has become the operating norm. At CHA, you become fluent in both.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {[
                { icon: Globe2,       label: 'English-only curriculum' },
                { icon: BrainCircuit, label: 'AI as strategic lens' },
                { icon: Briefcase,    label: 'Bio-healthcare ecosystem' },
                { icon: Users,        label: 'Live laboratory of Korea\'s industries' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm">
                  <f.icon className="text-[#d4a574]" size={20} />
                  <span className="font-semibold text-[#0a1e3f] text-sm">{f.label}</span>
                </div>
              ))}
            </div>
            <Link to="/about" className="inline-flex items-center gap-2 text-[#d4a574] font-semibold
              hover:gap-3 transition-all">
              Read more about the program <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Pillars() {
  const pillars = [
    { icon: BrainCircuit, title: 'AI Fluency',           desc: 'Master AI as a strategic lens, not a supporting tool — from algorithmic competition to platform economics that define modern enterprise.', to: '/major', color: 'from-[#0a1e3f] to-[#1a3567]' },
    { icon: Briefcase,    title: 'Global Business',      desc: 'Strategic judgment across cultures, markets, and disciplines — grounded in Korea\'s most dynamic export-driven economy.',                to: '/major', color: 'from-[#d4a574] to-[#c19463]' },
    { icon: Globe2,       title: 'Bio-Healthcare Anchor', desc: 'Direct engagement with CHA\'s hospital networks, biotech ventures, and clinical research — Korea\'s frontier of life sciences.',           to: '/career', color: 'from-[#e8775c] to-[#c95a44]' },
  ]
  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="text-sm uppercase tracking-widest text-[#d4a574] font-semibold mb-4">Three Pillars</div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0a1e3f]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Built on what tomorrow needs
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <motion.div key={p.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}>
              <Link to={p.to}
                className="block group p-8 lg:p-10 rounded-2xl border border-gray-100 hover:border-transparent
                  hover:shadow-2xl transition-all duration-300 bg-white relative overflow-hidden">
                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${p.color}
                  opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color}
                  flex items-center justify-center text-white mb-6 shadow-lg`}>
                  <p.icon size={26} />
                </div>
                <h3 className="text-2xl font-bold text-[#0a1e3f] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {p.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{p.desc}</p>
                <div className="mt-4 text-[#d4a574] text-sm font-semibold inline-flex items-center gap-1
                  opacity-0 group-hover:opacity-100 transition">
                  Explore <ArrowRight size={14} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AssistantCTA() {
  return (
    <section className="py-32 bg-gradient-to-br from-[#0a1e3f] via-[#1a3567] to-[#0a1e3f] relative overflow-hidden">
      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(212,165,116,0.5) 0%, transparent 50%)' }} />
      <div className="relative max-w-5xl mx-auto px-6 lg:px-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10
          backdrop-blur-md border border-white/20 text-white/90 text-sm mb-8">
          <Sparkles size={14} className="text-[#d4a574]" />
          Powered by LiveAvatar AI
        </div>
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Have a question?<br />
          <span className="italic text-[#d4a574]">Just ask.</span>
        </h2>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-10">
          Our AI assistant is trained on every detail of the program. Available 24/7, in English.
        </p>
        <Link to="/assistant" className="group inline-flex items-center gap-3 px-8 py-5 rounded-full
          bg-[#d4a574] text-white text-lg font-semibold shadow-2xl shadow-[#d4a574]/30
          hover:bg-[#c19463] transition hover:scale-105">
          <MessageCircle size={22} />
          Start a Conversation
          <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
        </Link>
        <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-white/70">
          {['👤 Avatar Mode', '🎙 Voice Mode', '💬 Text Chat'].map(m => (
            <span key={m} className="px-4 py-2 rounded-full bg-white/10 border border-white/20">{m}</span>
          ))}
        </div>
        <div className="mt-12 inline-flex items-center gap-2 text-white/60 text-sm">
          <Award size={14} className="text-[#d4a574]" />
          Or apply directly →
          <Link to="/admission" className="ml-1 underline hover:text-white">Admission</Link>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <>
      <Hero onWatchVideo={() => setVideoOpen(true)} />
      <PreviewAbout />
      <Pillars />
      <AssistantCTA />
      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </>
  )
}
