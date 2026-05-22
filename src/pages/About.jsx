import { Link } from 'react-router-dom'
import { Globe2, Users, BrainCircuit, Briefcase, Heart, Award, ArrowRight } from 'lucide-react'
import PageHero from '../components/PageHero'

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About the Program"
        title="A dream worth four years of your life"
        subtitle="The Global Business AI Major at CHA University is more than a degree —
          it is a journey designed for ambitious international students who want to lead
          business transformation in the age of AI."
      />

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center mb-20">
            <div className="lg:col-span-7">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0a1e3f] mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Our Vision
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We empower global students to become AI-driven business leaders who can navigate
                cross-cultural markets, design ethical AI products, and shape industries that don't
                yet exist. Our graduates will not just adapt to the future of work — they will define it.
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
                Why this major?
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                The intersection of AI and business is the defining career space of the next decade.
                From healthcare to finance, from marketing to operations — every industry is being
                rewritten by AI. Yet most undergraduate programs treat these as separate disciplines.
                We don't.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Hosted by the <strong className="text-[#0a1e3f]">School of Global Convergence</strong>,
                part of Korea's pioneering CHA Bio-Group, you'll have unmatched access to hospital
                networks, biotech labs, and a thriving startup ecosystem.
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
              { icon: Globe2,       title: 'English-only Curriculum', desc: 'Every course taught fully in English, by faculty with international experience.' },
              { icon: Users,        title: 'Small Class Size',         desc: 'Maximum 25 students per cohort. You will know every classmate and every professor.' },
              { icon: BrainCircuit, title: 'Hands-on AI Projects',     desc: 'Build real AI products from Year 2. No more theoretical learning without practice.' },
              { icon: Briefcase,    title: 'Industry Internships',     desc: 'Partner with CHA Bio-Group and 30+ Korean and global companies.' },
              { icon: Heart,        title: 'Cultural Support',         desc: 'Korean language classes, peer mentors, and visa support for international students.' },
              { icon: Award,        title: 'Career Pathway',           desc: 'E-7 visa support for graduates who want to launch their career in Korea.' },
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
