import { Link } from 'react-router-dom'
import { Mail, ArrowRight, Phone } from 'lucide-react'
import PageHero from '../components/PageHero'

// 차의대 글로벌융합학부 글로벌비즈AI 전공 — 공식 교수진 9명
// 사진: 실제 차의대 사진으로 교체 권장 (현재 placeholder)
// 박교수님이 보내주시면 public/faculty/ 에 저장 후 경로 변경

const faculty = [
  // ─── Business Management Track ───
  {
    name: 'Prof. Dae Keun Park',
    nameKo: '박대근',
    role: 'Program Chair',
    track: 'Business Management',
    img: '/faculty/park-dae-keun.png',
    edu: 'Ph.D., Management Engineering, KAIST',
    research: 'Finance · Time Series Forecasting · Generative AI · Healthcare Convergence',
    career: 'Accenture · KPMG · NICE',
    teaches: 'Financial Management · Financial Markets · Investment Analysis',
    email: 'dkpark@cha.ac.kr',
    phone: '+82-31-850-8984',
  },
  {
    name: 'Prof. Tae Dong Kim',
    nameKo: '김태동',
    role: 'Dean of Graduate School',
    track: 'Business Management',
    img: '/faculty/kim-tae-dong.jpg',
    edu: 'Ph.D., Accounting & Taxation',
    research: 'Accounting · Taxation · Financial Reporting',
    career: '',
    teaches: 'Principles of Accounting · Financial Accounting · Cost & Managerial Accounting',
    email: 'ktdong@cha.ac.kr',
    phone: '+82-31-850-8967',
  },
  {
    name: 'Prof. Joo Hun Kim',
    nameKo: '김주헌',
    role: 'Professor',
    track: 'Business Management',
    img: '/faculty/kim-joo-hun.png',
    edu: 'Ph.D., International Business',
    research: 'International Business · International Marketing',
    career: '',
    teaches: 'Introduction to Business · International Marketing · International Business',
    email: 'jkim@cha.ac.kr',
    phone: '+82-31-850-8966',
  },
  {
    name: 'Prof. Eok Hwan Kim',
    nameKo: '김억환',
    role: 'Professor',
    track: 'Business Management',
    img: '/faculty/kim-eok-hwan.png',
    edu: 'Ph.D., Human Resources & Strategy',
    research: 'Human Resources · Organizational Behavior · Strategic Management',
    career: '',
    teaches: 'Organizational Behavior · Healthcare Management · Human Resource Management',
    email: 'ekim@cha.ac.kr',
    phone: '+82-31-850-8968',
  },
  {
    name: 'Prof. Hee Jung Lee',
    nameKo: '이희정',
    role: 'Professor',
    track: 'Business Management',
    img: '/faculty/lee-hee-jung.png',
    edu: 'Ph.D., Marketing',
    research: 'Marketing · Tourism Psychology · Services',
    career: '',
    teaches: 'Principles of Marketing · Services Marketing · Consumer Psychology',
    email: 'hjlee@cha.ac.kr',
    phone: '+82-31-850-8969',
  },
  // ─── AI Medical Data Science Track ───
  {
    name: 'Prof. Jang Pyo Bae',
    nameKo: '배장표',
    role: 'Professor',
    track: 'AI Medical Data Science',
    img: '/faculty/bae-jang-pyo.jpg',
    edu: 'Ph.D., AI Biomedical Engineering',
    research: 'AI Biomedical Engineering · Machine Learning · Generative AI',
    career: '',
    teaches: 'Advanced Python · Machine Learning · Introduction to AI · App Development',
    email: 'haizzzi@cha.ac.kr',
    phone: '+82-31-850-8956',
  },
  {
    name: 'Prof. Sang Min Lee',
    nameKo: '이상민',
    role: 'Professor (Joint)',
    track: 'AI · Business (Bridge)',
    img: '/faculty/lee-sang-min.png',
    edu: 'Ph.D., Data Science',
    research: 'Data Science · Business Analytics · Management Science',
    career: '',
    teaches: 'Python Programming Basics (cross-track foundation)',
    email: 'slee@cha.ac.kr',
    phone: '+82-31-850-8993',
  },
  {
    name: 'Prof. Kyung In Jung',
    nameKo: '정경인',
    role: 'Professor',
    track: 'AI Medical Data Science',
    img: '/faculty/jung-kyung-in.jpg',
    edu: 'Ph.D., Public Health · Pharmacy',
    research: 'Public Health · Epidemiology · Healthcare Data Analytics',
    career: 'Researcher, Seoul National University Institute of Health and Environment',
    teaches: 'Healthcare Data Analytics',
    email: 'jki0515@cha.ac.kr',
    phone: '+82-31-850-9087',
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
            {faculty.map(f => {
              const isAI = f.track.includes('AI Medical')
              const isBridge = f.track.includes('Bridge')
              const trackColor = isBridge
                ? 'from-fuchsia-500 to-[#d4a574]'
                : isAI
                  ? 'from-fuchsia-500 to-cyan-400'
                  : 'from-[#d4a574] to-[#e8775c]'
              const trackTag = isBridge
                ? 'bg-gradient-to-r from-fuchsia-100 to-amber-100 text-[#0a1e3f]'
                : isAI
                  ? 'bg-fuchsia-100 text-fuchsia-900 ring-1 ring-fuchsia-300'
                  : 'bg-[#d4a574]/20 text-[#7a4f24] ring-1 ring-[#d4a574]/40'
              return (
                <div key={f.name} className="group relative p-7 rounded-2xl bg-white border border-gray-100
                  hover:shadow-2xl hover:border-[#d4a574]/40 transition-all duration-300 overflow-hidden">
                  {/* 트랙 stripe */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${trackColor}`} />

                  <div className="flex items-start gap-5">
                    <div className={`w-24 h-24 rounded-2xl overflow-hidden shadow-lg flex-shrink-0
                      ring-2 ring-offset-2 ${isAI ? 'ring-fuchsia-300' : 'ring-[#d4a574]/40'}`}>
                      <img
                        src={f.img}
                        alt={f.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2 mb-1">
                        <h3 className="text-xl font-bold text-[#0a1e3f]"
                          style={{ fontFamily: "'Playfair Display', serif" }}>
                          {f.name}
                        </h3>
                        <span className="text-sm text-gray-400 font-normal">({f.nameKo})</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-sm text-[#d4a574] font-semibold">{f.role}</span>
                      </div>
                      <span className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded mb-3 ${trackTag}`}>
                        {f.track}
                      </span>
                      <div className="space-y-1.5 text-sm text-gray-600">
                        <div><span className="font-semibold text-[#0a1e3f]">Education:</span> {f.edu}</div>
                        <div><span className="font-semibold text-[#0a1e3f]">Research:</span> {f.research}</div>
                        {f.teaches && (
                          <div><span className="font-semibold text-[#0a1e3f]">Teaches:</span> {f.teaches}</div>
                        )}
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
              )
            })}
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
