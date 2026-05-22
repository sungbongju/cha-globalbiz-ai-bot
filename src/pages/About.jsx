import { Link } from 'react-router-dom'
import { Globe2, Users, BrainCircuit, Briefcase, Heart, Award, ArrowRight } from 'lucide-react'
import PageHero from '../components/PageHero'

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About the Program"
        title="The era when AI co-designs strategy"
        subtitle="Welcome to the Global Business AI Major at the College of Future Convergence,
          CHA University. We sincerely welcome everyone visiting our homepage."
      />

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center mb-20">
            <div className="lg:col-span-7">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0a1e3f] mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                The convergence that defines tomorrow
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                The global economy has entered an era in which artificial intelligence no longer
                plays a supporting role but actively reshapes how value is created, captured,
                and distributed across every industry on the planet.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Traditional boundaries between business strategy and technological capability have
                effectively dissolved. The convergence of <strong className="text-[#0a1e3f]">global business acumen and
                artificial intelligence fluency</strong> has emerged as the single most decisive
                competency for the next generation of executives, entrepreneurs, and policy architects worldwide.
              </p>
            </div>
            <div className="lg:col-span-5">
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80&auto=format&fit=crop"
                alt="Global students collaborating"
                className="rounded-2xl shadow-xl w-full h-[320px] object-cover"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80&auto=format&fit=crop"
                alt="AI and business"
                className="rounded-2xl shadow-xl w-full h-[320px] object-cover"
              />
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0a1e3f] mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Why CHA, why now?
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Korea today stands as a global leader in <strong className="text-[#0a1e3f]">semiconductors,
                secondary batteries, biopharmaceuticals, automobiles, displays, shipbuilding</strong>,
                and the rapidly expanding K-content and K-beauty industries — offering students an
                unparalleled live laboratory of globally competitive sectors at every stage of value creation.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Within this national ecosystem, CHA University occupies a distinctive position
                through its deep specialization in <strong className="text-[#0a1e3f]">bio-healthcare</strong>,
                providing direct engagement with university hospitals, fertility centers, biotech ventures,
                and clinical research institutes operating on the global frontier of life sciences.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#faf8f3]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold text-[#0a1e3f] mb-12 text-center"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            What makes us different
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Globe2,       title: 'English-Only Curriculum',  desc: 'Every course taught fully in English — learning not from textbook abstractions but from immersion in Korea\'s most advanced export industries.' },
              { icon: BrainCircuit, title: 'AI as Strategic Lens',      desc: 'AI is treated not as a supporting tool but as the cross-cutting strategic lens through which every business decision is examined.' },
              { icon: Heart,        title: 'Bio-Healthcare Anchor',     desc: 'Direct engagement with CHA hospitals, fertility centers, biotech ventures, and clinical research institutes on the global frontier of life sciences.' },
              { icon: Briefcase,    title: 'Korea\'s Industrial Ecosystem', desc: 'Live laboratory of semiconductors, batteries, biopharma, automobiles, displays, shipbuilding, K-content, and K-beauty — globally competitive at every stage of value creation.' },
              { icon: Users,        title: 'Bilingual Professionals',   desc: 'Graduates fluent in both the language of global business strategy and the language of artificial intelligence — a hybrid talent profile increasingly sought worldwide.' },
              { icon: Award,        title: 'Long-Arc Career Vision',    desc: 'Analytical judgment, executive vision, cross-cultural communication, and ethical sensibility required of those who lead in technology-driven industries over decades — not just first jobs.' },
            ].map(f => (
              <div key={f.title} className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg transition">
                <f.icon className="text-[#d4a574] mb-4" size={28} />
                <h3 className="text-lg font-bold text-[#0a1e3f] mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  {f.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a1e3f] mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to begin?
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Explore the curriculum, meet our faculty, or apply directly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/curriculum"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#0a1e3f]
                text-white font-semibold hover:bg-[#1a3567] transition">
              See the Curriculum
              <ArrowRight size={16} />
            </Link>
            <Link to="/admission"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#d4a574]
                text-white font-semibold hover:bg-[#c19463] transition">
              Apply Now
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
