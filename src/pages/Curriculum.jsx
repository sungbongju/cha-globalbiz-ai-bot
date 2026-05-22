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

const moduleColor = {
  'Business Core':              'bg-[#d4a574]/15 text-[#a06d3d]',
  'Marketing':                  'bg-[#e8775c]/15 text-[#a64534]',
  'Accounting & Finance':       'bg-[#0a1e3f]/10 text-[#0a1e3f]',
  'Management Strategy':        'bg-[#1a3567]/15 text-[#1a3567]',
  'Data Analytics Core':        'bg-emerald-500/15 text-emerald-700',
  'Data Analytics':             'bg-emerald-500/10 text-emerald-700',
  'AI Applications Core':       'bg-purple-500/15 text-purple-700',
  'AI Applications':            'bg-purple-500/10 text-purple-700',
}

function CourseCard({ name, module, prof, isTBA }) {
  return (
    <div className={`p-3 rounded-lg border ${isTBA ? 'border-dashed border-gray-300 bg-gray-50' : 'border-gray-200 bg-white'}
      hover:border-[#d4a574] transition`}>
      <div className={`text-sm font-semibold ${isTBA ? 'text-gray-400 italic' : 'text-[#0a1e3f]'}`}>
        {name}
      </div>
      <div className="flex items-center justify-between mt-2 gap-2">
        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${moduleColor[module] || 'bg-gray-100 text-gray-600'}`}>
          {module}
        </span>
        <span className="text-[10px] text-gray-500">{prof}</span>
      </div>
    </div>
  )
}

function TrackColumn({ icon: Icon, title, subtitle, color, sem1, sem2 }) {
  return (
    <div className={`rounded-2xl border-2 ${color} p-5`}>
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-current/20">
        <Icon className="text-current" size={22} />
        <div>
          <div className="font-bold text-white">{title}</div>
          <div className="text-xs text-white/60">{subtitle}</div>
        </div>
      </div>

      {sem1 && (
        <div className="mb-5">
          <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">Semester 1</div>
          <div className="space-y-2">
            {sem1.map((c, i) => (
              <CourseCard key={i} {...c} isTBA={c.name === 'TBA'} />
            ))}
          </div>
        </div>
      )}

      {sem2 && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">Semester 2</div>
          <div className="space-y-2">
            {sem2.map((c, i) => (
              <CourseCard key={i} {...c} isTBA={c.name === 'TBA'} />
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

      <section className="py-24 bg-[#0a1e3f] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
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
              <div className="max-w-3xl mx-auto rounded-2xl border-2 border-[#d4a574]/40 p-8">
                <div className="flex items-center gap-3 mb-5">
                  <BookOpen className="text-[#d4a574]" size={22} />
                  <div className="font-bold">Open Major · Common Foundations</div>
                </div>
                <p className="text-sm text-white/70 mb-5">
                  All Year 1 students take a common liberal arts and quantitative foundation —
                  no major declared yet. Specialization begins in Year 2.
                </p>
                <div className="space-y-2">
                  {y.common.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                      <ChevronRight size={14} className="text-[#d4a574]" />
                      <span className="text-sm">{c}</span>
                    </div>
                  ))}
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
                  color="border-[#d4a574]/40 text-[#d4a574]"
                  sem1={y.business?.sem1}
                  sem2={y.business?.sem2}
                />
                <TrackColumn
                  icon={BrainCircuit}
                  title="AI Medical Data Science Track"
                  subtitle="AI의료데이터학전공"
                  color="border-purple-400/40 text-purple-300"
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
              <div key={m.name} className="flex items-center justify-between p-4 rounded-xl bg-[#faf8f3]
                border border-gray-100">
                <span className="font-semibold text-[#0a1e3f]">{m.name}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${moduleColor[m.name] || 'bg-gray-100 text-gray-600'}`}>
                  {m.track}
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
