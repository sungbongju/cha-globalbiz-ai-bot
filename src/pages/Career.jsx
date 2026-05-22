import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Award, ArrowRight, TrendingUp, Building2, Rocket } from 'lucide-react'
import PageHero from '../components/PageHero'

const careers = [
  { name: 'AI Product Manager',     industry: 'Tech', salary: '$80-120k' },
  { name: 'Data Scientist',         industry: 'Tech · Finance', salary: '$90-140k' },
  { name: 'Business Analyst',       industry: 'Consulting', salary: '$70-100k' },
  { name: 'Strategy Consultant',    industry: 'Consulting', salary: '$85-130k' },
  { name: 'Digital Marketing Lead', industry: 'Tech · Retail', salary: '$70-110k' },
  { name: 'Startup Founder',        industry: 'Tech', salary: '∞' },
  { name: 'AI Research Engineer',   industry: 'AI Lab', salary: '$95-150k' },
  { name: 'Investment Analyst',     industry: 'Finance', salary: '$80-130k' },
  { name: 'UX Researcher',          industry: 'Tech', salary: '$70-110k' },
]

const tracks = [
  {
    icon: Building2,
    title: 'Corporate Track',
    desc: 'Join Korean conglomerates (Samsung, LG, Hyundai) or global firms (McKinsey, Google).',
    companies: ['Samsung', 'LG', 'McKinsey', 'Google', 'Microsoft'],
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&auto=format&fit=crop',
    color: 'from-[#0a1e3f] to-[#1a3567]'
  },
  {
    icon: Rocket,
    title: 'Startup Track',
    desc: 'Launch your own venture with CHA Bio-Group network and Korean startup ecosystem.',
    companies: ['Y Combinator (KR)', 'Sparklabs', 'Primer', 'CHA Bio-Group'],
    img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80&auto=format&fit=crop',
    color: 'from-[#d4a574] to-[#c19463]'
  },
  {
    icon: TrendingUp,
    title: 'Graduate School Track',
    desc: 'Continue to top MBA or AI research programs worldwide.',
    companies: ['Stanford GSB', 'Wharton', 'MIT Sloan', 'INSEAD', 'KAIST'],
    img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80&auto=format&fit=crop',
    color: 'from-[#e8775c] to-[#c95a44]'
  },
]

export default function Career() {
  return (
    <>
      <PageHero
        eyebrow="Career Outcomes"
        title="Your career, without borders"
        subtitle="Graduates work at the intersection of technology, business, and global markets —
          from Silicon Valley to Singapore."
      />

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-sm uppercase tracking-widest text-[#d4a574] font-semibold mb-4">
              Career Tracks
            </div>
            <h2 className="text-4xl font-bold text-[#0a1e3f]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Three paths, infinite possibilities
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {tracks.map((t, i) => (
              <motion.div key={t.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}
                className="rounded-2xl border border-gray-100 hover:shadow-2xl
                  transition-all duration-300 bg-white overflow-hidden group">
                {/* 사진 헤더 */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={t.img}
                    alt={t.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-tr ${t.color} opacity-50 mix-blend-multiply`} />
                  <div className={`absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${t.color}
                    flex items-center justify-center text-white shadow-xl border-2 border-white/20`}>
                    <t.icon size={22} />
                  </div>
                </div>
                <div className="p-7">
                  <h3 className="text-2xl font-bold text-[#0a1e3f] mb-3"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    {t.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-5">{t.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {t.companies.map(c => (
                      <span key={c} className="px-3 py-1 rounded-full bg-[#faf8f3]
                        text-xs font-semibold text-[#0a1e3f] border border-gray-100">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#faf8f3]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a1e3f]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Roles our graduates take
            </h2>
            <p className="text-gray-600 mt-3 text-sm">Salary ranges are USD, entry-to-mid level (varies by region).</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {careers.map((c, i) => (
              <motion.div key={c.name}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }}
                className="p-5 rounded-2xl bg-white border border-gray-100 hover:border-[#d4a574]
                  hover:shadow-lg transition">
                <div className="font-bold text-[#0a1e3f] mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  {c.name}
                </div>
                <div className="text-xs text-gray-500 mb-2">{c.industry}</div>
                <div className="text-sm font-mono text-[#d4a574] font-semibold">{c.salary}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#0a1e3f] text-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <Award className="mx-auto text-[#d4a574] mb-6" size={48} />
          <h2 className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            E-7 Visa Pathway for International Graduates
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            For graduates who want to stay in Korea, we provide visa support, employer connections,
            and career counseling — all the way from graduation to employment.
          </p>
          <Link to="/admission" className="inline-flex items-center gap-2 px-7 py-4 rounded-full
            bg-[#d4a574] text-white font-semibold hover:bg-[#c19463] transition">
            Start Your Application <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}
