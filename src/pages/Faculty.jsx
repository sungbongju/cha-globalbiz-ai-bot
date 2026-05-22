import { Link } from 'react-router-dom'
import { Mail, ArrowRight, Phone } from 'lucide-react'
import PageHero from '../components/PageHero'

const faculty = [
  {
    name: 'Prof. Park Dae-Geun',
    role: 'Program Chair',
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80&auto=format&fit=crop',
    edu: 'Ph.D., Management Engineering, KAIST',
    research: 'AI for Business · Statistical Learning · Educational Chatbots · Time Series Forecasting',
    career: 'Accenture · KPMG · NICE',
    email: 'dkpark@cha.ac.kr',
    phone: '+82-31-850-8984',
  },
  {
    name: 'Faculty TBA',
    role: 'AI & Data Science',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&auto=format&fit=crop',
    edu: 'Coming soon',
    research: 'Machine Learning, NLP, Generative AI',
    career: '',
    email: '',
    phone: '',
  },
  {
    name: 'Faculty TBA',
    role: 'Global Business Strategy',
    img: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&q=80&auto=format&fit=crop',
    edu: 'Coming soon',
    research: 'International Marketing, Cross-cultural Management',
    career: '',
    email: '',
    phone: '',
  },
  {
    name: 'Faculty TBA',
    role: 'Industry Liaison',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&auto=format&fit=crop',
    edu: 'Coming soon',
    research: 'Startup Mentorship, Industry Partnerships',
    career: '',
    email: '',
    phone: '',
  },
]

export default function Faculty() {
  return (
    <>
      <PageHero
        eyebrow="Meet Your Mentors"
        title="Faculty who shape industry"
        subtitle="Our faculty bring decades of academic rigor and industry experience —
          from global consulting to AI research labs."
      />

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-6">
            {faculty.map(f => (
              <div key={f.name} className="p-8 rounded-2xl bg-[#faf8f3] border border-gray-100
                hover:shadow-xl transition">
                <div className="flex items-start gap-5">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg flex-shrink-0
                    ring-2 ring-[#d4a574]/30">
                    <img
                      src={f.img}
                      alt={f.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-[#0a1e3f] mb-1"
                      style={{ fontFamily: "'Playfair Display', serif" }}>
                      {f.name}
                    </h3>
                    <div className="text-sm text-[#d4a574] font-semibold mb-3">{f.role}</div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div><span className="font-semibold text-[#0a1e3f]">Education:</span> {f.edu}</div>
                      <div><span className="font-semibold text-[#0a1e3f]">Research:</span> {f.research}</div>
                      {f.career && (
                        <div><span className="font-semibold text-[#0a1e3f]">Career:</span> {f.career}</div>
                      )}
                    </div>
                    {(f.email || f.phone) && (
                      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-xs">
                        {f.email && (
                          <a href={`mailto:${f.email}`} className="inline-flex items-center gap-1 text-[#0a1e3f] hover:text-[#d4a574] transition">
                            <Mail size={12} /> {f.email}
                          </a>
                        )}
                        {f.phone && (
                          <a href={`tel:${f.phone.replace(/\D/g, '')}`} className="inline-flex items-center gap-1 text-[#0a1e3f] hover:text-[#d4a574] transition">
                            <Phone size={12} /> {f.phone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#faf8f3]">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl font-bold text-[#0a1e3f] mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Want to talk to a faculty member?
          </h2>
          <p className="text-gray-700 mb-8">
            Our AI assistant can answer faculty-related questions, or connect you for a 1:1 chat.
          </p>
          <Link to="/assistant" className="inline-flex items-center gap-2 px-7 py-4 rounded-full
            bg-[#d4a574] text-white font-semibold hover:bg-[#c19463] transition">
            Ask the AI Assistant <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}
