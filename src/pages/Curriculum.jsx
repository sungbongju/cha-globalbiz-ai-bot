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
      { name: 'Introduction to Global Business',   type: 'Core' },
      { name: 'Statistics for Business',           type: 'Core' },
      { name: 'Academic English',                  type: 'Core' },
      { name: 'Programming Foundations (Python)',  type: 'Core' },
      { name: 'Bio-Healthcare Industry Overview',  type: 'Core' },
      { name: 'Korean Society & Culture',          type: 'Elective' },
    ],
  },
  {
    year: 'Year 2',
    title: 'AI Core',
    theme: 'Master AI as the strategic lens of modern enterprise.',
    courses: [
      { name: 'Machine Learning for Business',     type: 'Core' },
      { name: 'Data Analytics & Visualization',    type: 'Core' },
      { name: 'Digital Marketing & Platform Economics', type: 'Core' },
      { name: 'Financial Accounting & FinTech',    type: 'Core' },
      { name: 'AI Ethics & Governance',            type: 'Core' },
      { name: 'Korean Language',                   type: 'Elective' },
    ],
  },
  {
    year: 'Year 3',
    title: 'Specialization',
    theme: 'Anchor your expertise in bio-healthcare or advanced manufacturing.',
    courses: [
      { name: 'Generative AI & LLMs',              type: 'Core' },
      { name: 'AI for Bio-Healthcare Business',    type: 'Specialization' },
      { name: 'Strategic Management Across Cultures', type: 'Core' },
      { name: 'Global Finance & Life-Science Investment', type: 'Specialization' },
      { name: 'Industry Internship Track',         type: 'Lab' },
    ],
  },
  {
    year: 'Year 4',
    title: 'Capstone',
    theme: 'Build the thing. Lead the industry.',
    courses: [
      { name: 'Capstone Project (Full Year)',      type: 'Lab' },
      { name: 'Entrepreneurship & Venture Building', type: 'Lab' },
      { name: 'Global Internship Program',         type: 'Lab' },
      { name: 'Career Studio & Portfolio',         type: 'Lab' },
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
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded
                    ${c.type === 'Core' ? 'bg-[#d4a574]/20 text-[#d4a574]'
                      : c.type === 'Specialization' ? 'bg-[#e8775c]/20 text-[#e8775c]'
                      : c.type === 'Lab' ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-white/10 text-white/60'}`}>
                    {c.type}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <div className="text-sm text-white/60 mb-4">
                Specific course catalogues are updated each academic year.
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
