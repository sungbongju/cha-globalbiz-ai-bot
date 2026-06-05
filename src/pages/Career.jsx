import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Award, ArrowRight, TrendingUp, Building2, Rocket,
  Layers, Compass, Megaphone, Calculator, Stethoscope, BarChart3 } from 'lucide-react'
import PageHero from '../components/PageHero'

const careers = [
  { name: 'Global Pharmaceutical & Biotech', industry: 'Bio-Healthcare' },
  { name: 'Digital Health Ventures',          industry: 'Health Tech' },
  { name: 'Semiconductor & Battery Industry', industry: 'Advanced Manufacturing' },
  { name: 'Healthcare Consulting',            industry: 'Consulting' },
  { name: 'Life-Science Investment',          industry: 'Finance' },
  { name: 'Technology & Trade Policy',        industry: 'Public Agency' },
  { name: 'AI Strategy in Bio-Healthcare',    industry: 'Bio-Healthcare' },
  { name: 'K-Content & K-Beauty Business',    industry: 'Global Brands' },
  { name: 'Cross-Border Platform Enterprise', industry: 'Tech' },
]

// Career tracks mirror the official 진로별 로드맵 (Business Management major),
// adapted to English. The last two are convergence tracks with the Digital
// Health / AI Medical Data Science majors.
const tracks = [
  {
    icon: Layers,
    title: 'Common Foundation',
    ko: '전공공통',
    desc: 'Every student starts here — a shared core that builds business fundamentals before you choose a specialization.',
    companies: ['Management', 'Economics', 'Marketing', 'Accounting', 'Finance', 'CHA Bio Capstone'],
    img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80&auto=format&fit=crop',
    color: 'from-[#0a1e3f] to-[#1a3567]'
  },
  {
    icon: Compass,
    title: 'Business Planning',
    ko: '경영기획',
    desc: 'Analyze business trends and design strategy — organizational & technology management and corporate strategy.',
    companies: ['Hospital Strategy Offices', 'Public Agencies', 'IT & Cloud', 'Manufacturing & Logistics', 'VC & Startups'],
    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80&auto=format&fit=crop',
    color: 'from-[#d4a574] to-[#c19463]'
  },
  {
    icon: Megaphone,
    title: 'Marketing',
    ko: '마케팅',
    desc: 'Consumer insight and marketing planning with a global-market lens — understanding and responding to markets worldwide.',
    companies: ['Pharma / Bio Marketing', 'Retail & E-commerce', 'Service Marketing', 'Global Markets'],
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop',
    color: 'from-[#e8775c] to-[#c95a44]'
  },
  {
    icon: Calculator,
    title: 'Accounting & Finance',
    ko: '회계재무',
    desc: 'Read financial statements and markets — accounting & tax practice, investment analysis and corporate valuation.',
    companies: ['Accounting & Tax Firms', 'Banks & Securities', 'Insurance & Asset Mgmt', 'FinTech'],
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80&auto=format&fit=crop',
    color: 'from-[#2a7f8f] to-[#1c5a66]'
  },
  {
    icon: Stethoscope,
    title: 'Healthcare Business',
    ko: '헬스케어 비즈니스 · 융합',
    desc: 'A convergence track with the Digital Health major — plan and run convergence research across the healthcare industry.',
    companies: ['Pharma & Bio', 'Hospitals', 'Beauty & Cosmetics', 'Medical Devices'],
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80&auto=format&fit=crop',
    color: 'from-[#4a8f6d] to-[#356b50]'
  },
  {
    icon: BarChart3,
    title: 'Business Analytics',
    ko: '비즈니스 애널리틱스 · 융합',
    desc: 'A convergence track with the AI Medical Data Science major — data-driven market analysis and business modeling.',
    companies: ['IT & Cloud', 'Financial Institutions', 'Gaming & Entertainment', 'BI & Machine Learning'],
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop',
    color: 'from-[#6d4a6e] to-[#4a3050]'
  },
]

export default function Career() {
  return (
    <>
      <PageHero
        eyebrow="Career Outcomes"
        title="Where strategic intent meets technological execution"
        subtitle="Companies competing in AI-driven bio-healthcare, advanced manufacturing, and platform
          industries are no longer asking whether to hire hybrid talent — but where to find enough of it."
      />

      <section id="tracks" className="py-24 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-sm uppercase tracking-widest text-[#d4a574] font-semibold mb-4">
              Career Tracks
            </div>
            <h2 className="text-4xl font-bold text-[#0a1e3f]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Six tracks, one global degree
            </h2>
            <p className="mt-4 text-gray-600">
              Specialization roadmaps from the Business Management major — including two convergence tracks
              shared with the Digital Health and AI Medical Data Science majors.
            </p>
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
                  <h3 className="text-2xl font-bold text-[#0a1e3f] mb-1"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    {t.title}
                  </h3>
                  {t.ko && (
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#d4a574] mb-3">
                      {t.ko}
                    </div>
                  )}
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

      <section id="pathways" className="py-24 bg-[#faf8f3] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a1e3f] mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Career pathways our graduates pursue
            </h2>
            <p className="text-gray-600 text-sm">
              Bilingual professionals — fluent in both the language of global business strategy
              and the language of artificial intelligence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {careers.map((c, i) => (
              <motion.div key={c.name}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }}
                className="p-5 rounded-2xl bg-white border border-gray-100 hover:border-[#d4a574]
                  hover:shadow-lg transition">
                <div className="font-bold text-[#0a1e3f] mb-2 leading-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  {c.name}
                </div>
                <div className="text-xs text-[#d4a574] font-semibold uppercase tracking-wider">
                  {c.industry}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="global-advantage" className="py-20 bg-[#0a1e3f] text-white scroll-mt-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <Award className="mx-auto text-[#d4a574] mb-6" size={48} />
          <h2 className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            A strategic gateway to Korean and Asian markets
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            International students gain cultural fluency, regional networks, and firsthand insight
            into the industries that global employers increasingly regard as essential — equipping
            you to lead in technology-driven industries over the long arc of a career.
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
