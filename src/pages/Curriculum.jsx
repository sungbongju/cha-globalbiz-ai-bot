import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ArrowRight } from 'lucide-react'
import PageHero from '../components/PageHero'

const years = [
  {
    year: 'Year 1',
    title: 'Foundations',
    theme: 'Building the language of business and AI.',
    courses: [
      { name: 'Introduction to Business', credit: 3 },
      { name: 'Statistics for Business',  credit: 3 },
      { name: 'Academic English I & II',  credit: 6 },
      { name: 'Programming Basics (Python)', credit: 3 },
      { name: 'Korean Society & Culture',  credit: 2 },
      { name: 'Korean Language I',         credit: 3 },
    ],
  },
  {
    year: 'Year 2',
    title: 'AI Core',
    theme: 'Master the AI toolkit that powers modern business.',
    courses: [
      { name: 'Machine Learning',          credit: 3 },
      { name: 'Data Analytics & Visualization', credit: 3 },
      { name: 'Marketing in the Digital Age',   credit: 3 },
      { name: 'Financial Accounting',           credit: 3 },
      { name: 'AI Ethics & Society',            credit: 2 },
      { name: 'Korean Language II',             credit: 3 },
    ],
  },
  {
    year: 'Year 3',
    title: 'Specialization',
    theme: 'Choose your industry path and go deep.',
    courses: [
      { name: 'Natural Language Processing',     credit: 3 },
      { name: 'AI for Healthcare Business',      credit: 3 },
      { name: 'Strategic Management',            credit: 3 },
      { name: 'Global Finance & FinTech',        credit: 3 },
      { name: 'Industry Internship Track',       credit: 6 },
    ],
  },
  {
    year: 'Year 4',
    title: 'Capstone',
    theme: 'Build the thing. Launch the career.',
    courses: [
      { name: 'Capstone Project (Full Year)',    credit: 6 },
      { name: 'Entrepreneurship Lab',            credit: 3 },
      { name: 'Global Internship Program',       credit: 6 },
      { name: 'Career Studio & Portfolio',       credit: 3 },
    ],
  },
]

export default function Curriculum() {
  const [active, setActive] = useState(0)
  const y = years[active]

  return (
    <>
      <PageHero
        eyebrow="4-Year Journey"
        title="From foundations to mastery"
        subtitle="A carefully sequenced curriculum that builds technical depth,
          business intuition, and global perspective — one year at a time."
      />

      <section className="py-24 bg-[#0a1e3f] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* 연도 탭 */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {years.map((yr, i) => (
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
          <div className="max-w-4xl mx-auto">
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

            <div className="grid sm:grid-cols-2 gap-3">
              {y.courses.map(c => (
                <div key={c.name}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5
                    border border-white/10 hover:bg-white/10 transition">
                  <div className="flex items-center gap-3">
                    <ChevronRight size={16} className="text-[#d4a574]" />
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <span className="text-xs text-white/60 font-mono">{c.credit} credits</span>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <div className="text-sm text-white/60 mb-4">
                Total: {y.courses.reduce((s, c) => s + c.credit, 0)} credits
              </div>
              {active < years.length - 1 && (
                <button onClick={() => setActive(active + 1)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                    bg-white/10 hover:bg-white/20 transition text-sm font-semibold">
                  Next: {years[active + 1].title} <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white text-center">
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
