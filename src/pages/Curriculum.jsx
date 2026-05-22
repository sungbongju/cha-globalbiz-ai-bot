import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ArrowRight, BookOpen, Briefcase, BrainCircuit } from 'lucide-react'
import PageHero from '../components/PageHero'

// 차의대 글로벌융합학부 글로벌비즈니스AI 전공 — 실제 교육과정 편성표 v1 (영문화)
// 두 트랙 병렬 구조: 경영학(Business Management) + AI의료데이터학(AI Medical Data Science)
// 박교수님 5/22: "내용이 많이 없어서 계속 추가할 예정" — 일부 슬롯 TBA

const yearsData = [
  {
    year: 'Year 1',
    title: 'Foundations',
    theme: 'Open major — exploration before specialization.',
    common: [
      'Liberal Arts Foundation (Korean Language, Academic English, Critical Thinking)',
      'Quantitative Reasoning',
      'Introduction to Global Business & AI',
      'Korean Society & Culture',
    ],
    business: null,
    ai: null,
  },
  {
    year: 'Year 2',
    title: 'Core Modules',
    theme: 'Build the foundations of business and AI.',
    business: {
      sem1: [
        { name: 'Introduction to Business Management', module: 'Business Core', prof: 'Prof. Kim J.H.' },
        { name: 'Principles of Accounting',             module: 'Business Core', prof: 'Prof. Kim T.D.' },
        { name: 'Technology Management',                module: 'Business Core', prof: 'Prof. Kim J.S.' },
      ],
      sem2: [
        { name: 'Principles of Marketing',  module: 'Business Core', prof: 'Prof. Lee H.J.' },
        { name: 'Organizational Behavior',  module: 'Business Core', prof: 'Prof. Kim E.H.' },
        { name: 'Financial Management',     module: 'Business Core', prof: 'Prof. Park D.K.' },
      ],
    },
    ai: {
      sem1: [
        { name: 'Python Programming Basics', module: 'Data Analytics Core', prof: 'Prof. Lee S.M.' },
        { name: 'Data Mining',               module: 'Data Analytics',      prof: 'TBA' },
        { name: 'Data Visualization',        module: 'Data Analytics',      prof: 'TBA' },
      ],
      sem2: [
        { name: 'Text Mining',                  module: 'Data Analytics',  prof: 'TBA' },
        { name: 'Healthcare Data Analytics',    module: 'Data Analytics',  prof: 'Prof. Jung K.I.' },
        { name: 'Advanced Python Programming',  module: 'AI Applications Core', prof: 'Prof. Bae J.P.' },
      ],
    },
  },
  {
    year: 'Year 3',
    title: 'Specialization',
    theme: 'Anchor your expertise in industry modules.',
    business: {
      sem1: [
        { name: 'International Marketing',  module: 'Marketing',       prof: 'Prof. Kim J.H.' },
        { name: 'Financial Accounting',     module: 'Accounting & Finance', prof: 'Prof. Kim T.D.' },
        { name: 'Strategic Management',     module: 'Management Strategy',  prof: 'Prof. Kim J.S.' },
      ],
      sem2: [
        { name: 'Services Marketing',                  module: 'Marketing',           prof: 'Prof. Lee H.J.' },
        { name: 'Healthcare Management & Organization', module: 'Management Strategy', prof: 'Prof. Kim E.H.' },
        { name: 'Financial Markets',                   module: 'Accounting & Finance', prof: 'Prof. Park D.K.' },
      ],
    },
    ai: {
      sem1: [
        { name: 'Machine Learning Theory & Practice', module: 'AI Applications', prof: 'Prof. Bae J.P.' },
        { name: 'Introduction to AI',                 module: 'AI Applications', prof: 'Prof. Bae J.P.' },
        { name: 'App Development Programming',        module: 'AI Applications', prof: 'Prof. Bae J.P.' },
      ],
      sem2: [
        { name: 'TBA',                                module: 'AI Applications', prof: 'TBA' },
        { name: 'TBA',                                module: 'AI Applications', prof: 'TBA' },
        { name: 'TBA',                                module: 'AI Applications', prof: 'TBA' },
      ],
    },
  },
  {
    year: 'Year 4',
    title: 'Mastery & Capstone',
    theme: 'Lead the industry — capstone and global immersion.',
    business: {
      sem1: [
        { name: 'International Business',         module: 'Marketing',           prof: 'Prof. Kim J.H.' },
        { name: 'Cost & Managerial Accounting',   module: 'Accounting & Finance', prof: 'Prof. Kim T.D.' },
        { name: 'Business Innovation & Trends',   module: 'Management Strategy',  prof: 'Prof. Kim J.S.' },
      ],
      sem2: [
        { name: 'Consumer Psychology',         module: 'Marketing',           prof: 'Prof. Lee H.J.' },
        { name: 'Human Resource Management',   module: 'Management Strategy', prof: 'Prof. Kim E.H.' },
        { name: 'Investment Analysis',         module: 'Accounting & Finance', prof: 'Prof. Park D.K.' },
        { name: 'K-Studies (Required)',        module: 'Business Core',       prof: 'Team Teaching' },
      ],
    },
    ai: {
      sem1: [
        { name: 'TBA', module: 'AI Applications', prof: 'TBA' },
        { name: 'TBA', module: 'AI Applications', prof: 'TBA' },
        { name: 'TBA', module: 'AI Applications', prof: 'TBA' },
      ],
      sem2: [
        { name: 'TBA', module: 'AI Applications', prof: 'TBA' },
        { name: 'TBA', module: 'AI Applications', prof: 'TBA' },
        { name: 'TBA', module: 'AI Applications', prof: 'TBA' },
        { name: 'TBA', module: 'AI Applications', prof: 'TBA' },
      ],
    },
  },
]

// 다크 테마용 모듈 색상 (배경 위 글래스모피즘에 잘 어울리는 채도 + 골드 친화)
const moduleColor = {
  'Business Core':              'bg-[#d4a574]/20 text-[#e8c39a] ring-1 ring-[#d4a574]/30',
  'Marketing':                  'bg-[#e8775c]/20 text-[#f4a896] ring-1 ring-[#e8775c]/30',
  'Accounting & Finance':       'bg-slate-400/15 text-slate-300 ring-1 ring-slate-400/30',
  'Management Strategy':        'bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-400/30',
  'Data Analytics Core':        'bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-400/30',
  'Data Analytics':             'bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/30',
  'AI Applications Core':       'bg-fuchsia-400/20 text-fuchsia-200 ring-1 ring-fuchsia-400/30',
  'AI Applications':            'bg-fuchsia-400/15 text-fuchsia-200 ring-1 ring-fuchsia-400/30',
}

// 라이트 테마용 모듈 색상 (Modular Structure 섹션처럼 흰 배경에서 잘 보이도록)
const moduleColorLight = {
  'Business Core':              'bg-[#d4a574]/25 text-[#7a4f24] ring-1 ring-[#d4a574]/50',
  'Marketing':                  'bg-[#e8775c]/20 text-[#8a3a26] ring-1 ring-[#e8775c]/50',
  'Accounting & Finance':       'bg-slate-200 text-slate-800 ring-1 ring-slate-400',
  'Management Strategy':        'bg-cyan-100 text-cyan-900 ring-1 ring-cyan-400',
  'Data Analytics Core':        'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-500',
  'Data Analytics':             'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-400',
  'AI Applications Core':       'bg-fuchsia-100 text-fuchsia-900 ring-1 ring-fuchsia-500',
  'AI Applications':            'bg-fuchsia-50 text-fuchsia-800 ring-1 ring-fuchsia-400',
}

function CourseCard({ name, module, prof, isTBA, accent }) {
  return (
    <div className={`group relative overflow-hidden p-3.5 rounded-xl backdrop-blur-md transition-all duration-300
      ${isTBA
        ? 'bg-white/[0.03] border border-dashed border-white/15'
        : 'bg-white/[0.06] border border-white/10 hover:bg-white/[0.10] hover:border-white/25 hover:-translate-y-0.5'
      }`}>
      {/* 호버 시 좌측에 트랙 색 라인 */}
      {!isTBA && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
      )}
      <div className={`text-sm font-semibold leading-snug ${isTBA ? 'text-white/35 italic' : 'text-white'}`}>
        {name}
      </div>
      <div className="flex items-center justify-between mt-2.5 gap-2">
        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded
          ${moduleColor[module] || 'bg-white/10 text-white/60'}`}>
          {module}
        </span>
        <span className={`text-[10px] ${isTBA ? 'text-white/30' : 'text-white/50'} font-medium`}>
          {prof}
        </span>
      </div>
    </div>
  )
}

function TrackColumn({ icon: Icon, title, subtitle, gradient, iconColor, accent, sem1, sem2 }) {
  return (
    <div className="relative rounded-3xl p-6 overflow-hidden
      bg-gradient-to-br from-white/[0.04] to-white/[0.01]
      border border-white/10 backdrop-blur-sm">
      {/* 상단 그라데이션 stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      {/* 우상단 광원 효과 */}
      <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-3xl`} />

      <div className="relative flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="text-white" size={22} />
        </div>
        <div>
          <div className="font-bold text-white text-lg leading-tight">{title}</div>
          <div className="text-xs text-white/50 mt-0.5">{subtitle}</div>
        </div>
      </div>

      {sem1 && (
        <div className="mb-5">
          <div className={`text-[10px] uppercase tracking-[0.2em] ${iconColor} font-bold mb-3 flex items-center gap-2`}>
            <span className="w-6 h-px bg-current opacity-50" />
            Semester 1
          </div>
          <div className="space-y-2">
            {sem1.map((c, i) => (
              <CourseCard key={i} {...c} isTBA={c.name === 'TBA'} accent={`bg-gradient-to-b ${gradient}`} />
            ))}
          </div>
        </div>
      )}

      {sem2 && (
        <div>
          <div className={`text-[10px] uppercase tracking-[0.2em] ${iconColor} font-bold mb-3 flex items-center gap-2`}>
            <span className="w-6 h-px bg-current opacity-50" />
            Semester 2
          </div>
          <div className="space-y-2">
            {sem2.map((c, i) => (
              <CourseCard key={i} {...c} isTBA={c.name === 'TBA'} accent={`bg-gradient-to-b ${gradient}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Curriculum() {
  const [active, setActive] = useState(1)   // Year 2부터 (Year 1은 common)
  const y = yearsData[active]

  return (
    <>
      <PageHero
        eyebrow="4-Year Journey"
        title="From foundations to mastery"
        subtitle="Year 1 is open major (no specialization). From Year 2, students pursue both
          Business Management and AI Medical Data Science tracks in parallel."
      />

      <section className="relative py-24 text-white overflow-hidden
        bg-gradient-to-br from-[#060f23] via-[#0a1e3f] to-[#0f1024]">
        {/* 글로우 배경 효과 */}
        <div className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ backgroundImage: `radial-gradient(circle at 15% 10%, rgba(212,165,116,0.25) 0%, transparent 45%),
                                     radial-gradient(circle at 85% 90%, rgba(217,70,239,0.18) 0%, transparent 45%),
                                     radial-gradient(circle at 50% 50%, rgba(34,211,238,0.08) 0%, transparent 60%)` }} />
        {/* 그리드 텍스처 */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          {/* 연도 탭 */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {yearsData.map((yr, i) => (
              <button key={yr.year}
                onClick={() => setActive(i)}
                className={`px-5 py-3 rounded-full text-sm font-semibold transition
                  ${active === i
                    ? 'bg-[#d4a574] text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                {yr.year}: {yr.title}
              </button>
            ))}
          </div>

          {/* 활성 연도 내용 */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <div className="text-sm uppercase tracking-widest text-[#d4a574] font-semibold mb-3">
                {y.year}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                {y.title}
              </h2>
              <p className="text-lg text-white/70 italic">"{y.theme}"</p>
            </div>

            {/* Year 1: Common Foundations */}
            {active === 0 && y.common && (
              <div className="relative max-w-3xl mx-auto rounded-3xl p-8 overflow-hidden
                bg-gradient-to-br from-white/[0.04] to-white/[0.01]
                border border-white/10 backdrop-blur-sm">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4a574] via-[#e8775c] to-[#d4a574]" />
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#d4a574]/15 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4a574] to-[#e8775c]
                      flex items-center justify-center shadow-lg">
                      <BookOpen className="text-white" size={22} />
                    </div>
                    <div className="font-bold text-white text-lg">Open Major · Common Foundations</div>
                  </div>
                  <p className="text-sm text-white/70 mb-5 leading-relaxed">
                    All Year 1 students take a common liberal arts and quantitative foundation —
                    no major declared yet. Specialization begins in Year 2.
                  </p>
                  <div className="space-y-2">
                    {y.common.map((c, i) => (
                      <div key={i} className="group flex items-center gap-3 p-3.5 rounded-xl
                        bg-white/[0.06] border border-white/10 backdrop-blur-md
                        hover:bg-white/[0.10] hover:border-white/25 transition">
                        <ChevronRight size={14} className="text-[#e8c39a]" />
                        <span className="text-sm text-white">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Year 2-4: Two tracks */}
            {active > 0 && (
              <div className="grid lg:grid-cols-2 gap-6">
                <TrackColumn
                  icon={Briefcase}
                  title="Business Management Track"
                  subtitle="경영학전공"
                  gradient="from-[#d4a574] to-[#e8775c]"
                  iconColor="text-[#e8c39a]"
                  sem1={y.business?.sem1}
                  sem2={y.business?.sem2}
                />
                <TrackColumn
                  icon={BrainCircuit}
                  title="AI Medical Data Science Track"
                  subtitle="AI의료데이터학전공"
                  gradient="from-fuchsia-500 to-cyan-400"
                  iconColor="text-fuchsia-200"
                  sem1={y.ai?.sem1}
                  sem2={y.ai?.sem2}
                />
              </div>
            )}

            <div className="mt-12 text-center">
              <div className="text-sm text-white/60 mb-4">
                Curriculum is being actively developed — additional courses will be announced.
              </div>
              {active < yearsData.length - 1 && (
                <button onClick={() => setActive(active + 1)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                    bg-white/10 hover:bg-white/20 transition text-sm font-semibold">
                  Next: {yearsData[active + 1].title} <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 모듈 설명 */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <div className="text-sm uppercase tracking-widest text-[#d4a574] font-semibold mb-3">
              Modular Structure
            </div>
            <h2 className="text-3xl font-bold text-[#0a1e3f]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Two tracks, eight modules
            </h2>
            <p className="text-gray-600 mt-3">
              Courses are organized into modules — you can mix & match across tracks.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { name: 'Business Core',         track: 'Business' },
              { name: 'Marketing',             track: 'Business' },
              { name: 'Accounting & Finance',  track: 'Business' },
              { name: 'Management Strategy',   track: 'Business' },
              { name: 'Data Analytics Core',   track: 'AI' },
              { name: 'Data Analytics',        track: 'AI' },
              { name: 'AI Applications Core',  track: 'AI' },
              { name: 'AI Applications',       track: 'AI' },
            ].map(m => (
              <div key={m.name} className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#faf8f3]
                border border-gray-200 hover:border-[#d4a574]/50 hover:shadow-sm transition">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`flex-shrink-0 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded ${moduleColorLight[m.name] || 'bg-gray-100 text-gray-700'}`}>
                    {m.name}
                  </span>
                </div>
                <span className={`text-[10px] uppercase tracking-widest font-bold
                  ${m.track === 'Business' ? 'text-[#d4a574]' : 'text-fuchsia-600'}`}>
                  {m.track} Track
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#faf8f3] text-center">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold text-[#0a1e3f] mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Questions about specific courses?
          </h2>
          <p className="text-gray-700 mb-8">Our AI assistant can dive into the details.</p>
          <Link to="/assistant" className="inline-flex items-center gap-2 px-7 py-4 rounded-full
            bg-[#d4a574] text-white font-semibold hover:bg-[#c19463] transition">
            Ask the AI Assistant <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}
