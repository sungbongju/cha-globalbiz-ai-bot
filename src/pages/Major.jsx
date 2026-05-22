import { Link } from 'react-router-dom'
import { BrainCircuit, Briefcase, Globe2, ArrowRight } from 'lucide-react'
import PageHero from '../components/PageHero'

export default function Major() {
  const pillars = [
    {
      icon: BrainCircuit,
      title: 'AI Foundations',
      desc: 'Machine learning, NLP, computer vision, generative AI — all built around real business cases, not abstract theory.',
      details: [
        'Python & Machine Learning',
        'Natural Language Processing',
        'Generative AI & LLMs',
        'AI Ethics & Governance',
      ],
      img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80&auto=format&fit=crop',
      color: 'from-[#0a1e3f] to-[#1a3567]'
    },
    {
      icon: Briefcase,
      title: 'Business Strategy',
      desc: 'Marketing, finance, operations, entrepreneurship — taught through global case studies from Asian and Western markets.',
      details: [
        'Digital Marketing & Analytics',
        'Strategic Management',
        'Global Finance & FinTech',
        'Operations & Supply Chain AI',
      ],
      img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80&auto=format&fit=crop',
      color: 'from-[#d4a574] to-[#c19463]'
    },
    {
      icon: Globe2,
      title: 'Global Fluency',
      desc: 'Multilingual communication, cross-cultural leadership, international internships — your network spans 12+ countries.',
      details: [
        'Cross-Cultural Communication',
        'International Business Law',
        'Korean Language (optional)',
        'Global Internship Program',
      ],
      img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80&auto=format&fit=crop',
      color: 'from-[#e8775c] to-[#c95a44]'
    },
  ]

  return (
    <>
      <PageHero
        eyebrow="Major Overview"
        title="Global Business AI"
        subtitle="An interdisciplinary undergraduate major combining AI engineering,
          business strategy, and global perspectives — designed exclusively for international students."
      />

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-sm uppercase tracking-widest text-[#d4a574] font-semibold mb-4">
              Three Core Pillars
            </div>
            <h2 className="text-4xl font-bold text-[#0a1e3f]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Built on what tomorrow needs
            </h2>
          </div>

          <div className="space-y-20">
            {pillars.map((p, i) => (
              <div key={p.title}
                className="grid lg:grid-cols-12 gap-10 items-center">
                {/* 사진 — 짝수는 왼쪽, 홀수는 오른쪽 */}
                <div className={`lg:col-span-6 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                    <img
                      src={p.img}
                      alt={p.title}
                      className="w-full h-[360px] object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-tr ${p.color} opacity-30 mix-blend-multiply`} />
                    <div className={`absolute top-6 left-6 w-16 h-16 rounded-2xl bg-gradient-to-br ${p.color}
                      flex items-center justify-center text-white shadow-xl`}>
                      <p.icon size={28} />
                    </div>
                  </div>
                </div>

                {/* 텍스트 + 세부 과목 */}
                <div className={`lg:col-span-6 ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <h3 className="text-3xl md:text-4xl font-bold text-[#0a1e3f] mb-4"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    {p.title}
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">{p.desc}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {p.details.map(d => (
                      <div key={d} className="p-4 rounded-xl bg-[#faf8f3] border border-gray-100
                        text-sm font-semibold text-[#0a1e3f] hover:border-[#d4a574] transition">
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#0a1e3f] text-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Want to see the full 4-year journey?
          </h2>
          <Link to="/curriculum"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#d4a574]
              text-white font-semibold hover:bg-[#c19463] transition">
            See the Curriculum
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}
