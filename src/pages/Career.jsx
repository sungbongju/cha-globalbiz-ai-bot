import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Award, ArrowRight, TrendingUp, Building2, Rocket } from 'lucide-react'
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

const tracks = [
  {
    icon: Building2,
    title: 'Bio-Healthcare Industry',
    desc: 'Global pharmaceutical and biotech corporations, digital health ventures, and healthcare consulting firms — the frontier where life sciences meet AI strategy.',
    companies: ['Pharma & Biotech', 'Digital Health', 'Hospital Networks', 'Clinical Research'],
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80&auto=format&fit=crop',
    color: 'from-[#0a1e3f] to-[#1a3567]'
  },
  {
    icon: Rocket,
    title: 'Advanced Manufacturing & Tech',
    desc: 'Semiconductor and battery enterprises, platform companies, and K-content & K-beauty global brands — leveraging your bilingual fluency in business and AI.',
    companies: ['Semiconductors', 'Batteries', 'Platform Enterprises', 'K-Content / K-Beauty'],
    img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80&auto=format&fit=crop',
    color: 'from-[#d4a574] to-[#c19463]'
  },
  {
    icon: TrendingUp,
    title: 'Investment & Policy',
    desc: 'Life-science investment institutions and public agencies shaping technology and trade policy across borders — the strategic architects of national competitiveness.',
    companies: ['Life-Science VC', 'Policy Agencies', 'Cross-border Trade', 'Strategic Consulting'],
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80&auto=format&fit=crop',
    color: 'from-[#e8775c] to-[#c95a44]'
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

      <section className="py-20 bg-[#0a1e3f] text-white">
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
