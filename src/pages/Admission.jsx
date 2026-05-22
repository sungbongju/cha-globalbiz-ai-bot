import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Calendar, FileText, Mail } from 'lucide-react'
import PageHero from '../components/PageHero'

export default function Admission() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', country: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
  }

  const steps = [
    { num: '01', title: 'Submit Online Application', desc: 'Complete the application form and upload your transcripts and personal statement.' },
    { num: '02', title: 'English Proficiency Test',   desc: 'TOEFL 80+, IELTS 6.5+, or equivalent. Waivers available for native English speakers.' },
    { num: '03', title: 'Interview (Online)',          desc: 'A 30-minute conversation with the program chair. We want to know who you are.' },
    { num: '04', title: 'Decision & Onboarding',       desc: 'Receive your decision within 4 weeks. Welcome package and visa support follow.' },
  ]

  return (
    <>
      <PageHero
        eyebrow="Admissions"
        title="Apply to Global Business AI"
        subtitle="We welcome students from all over the world. Application is open year-round
          with two cohorts per year (March and September)."
      />

      {/* 모집 일정 */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <Calendar className="mx-auto text-[#d4a574] mb-4" size={36} />
            <h2 className="text-3xl font-bold text-[#0a1e3f]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Next Cohorts
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0a1e3f] to-[#1a3567] text-white">
              <div className="text-xs uppercase tracking-widest text-[#d4a574] font-semibold mb-2">Spring 2027</div>
              <div className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                March 2027
              </div>
              <div className="text-sm text-white/70 mb-4">Application deadline: Nov 30, 2026</div>
              <div className="text-sm text-white/80">Quota: 25 international students</div>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#d4a574] to-[#c19463] text-white">
              <div className="text-xs uppercase tracking-widest text-white/80 font-semibold mb-2">Fall 2027</div>
              <div className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                September 2027
              </div>
              <div className="text-sm text-white/80 mb-4">Application deadline: Apr 30, 2027</div>
              <div className="text-sm text-white/90">Quota: 25 international students</div>
            </div>
          </div>
        </div>
      </section>

      {/* 단계 */}
      <section className="py-24 bg-[#faf8f3]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a1e3f]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Four steps to your seat
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className="relative p-6 rounded-2xl bg-white border border-gray-100">
                <div className="text-5xl font-bold text-[#d4a574]/30 mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  {s.num}
                </div>
                <h3 className="text-lg font-bold text-[#0a1e3f] mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  {s.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-[#d4a574]">
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 문의 폼 */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <FileText className="mx-auto text-[#d4a574] mb-4" size={36} />
            <h2 className="text-3xl font-bold text-[#0a1e3f] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Have questions?
            </h2>
            <p className="text-gray-600">Send us a message and we'll get back within 48 hours.</p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-green-50 border border-green-200 text-center">
              <CheckCircle2 className="mx-auto text-green-600 mb-3" size={48} />
              <h3 className="text-lg font-bold text-green-800 mb-2">Thank you!</h3>
              <p className="text-green-700 text-sm">We've received your message. We'll reply soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" placeholder="Your Name" required
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#d4a574]
                    focus:ring-2 focus:ring-[#d4a574]/20 outline-none transition" />
                <input type="email" placeholder="Email" required
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#d4a574]
                    focus:ring-2 focus:ring-[#d4a574]/20 outline-none transition" />
              </div>
              <input type="text" placeholder="Country"
                value={form.country} onChange={e => setForm({...form, country: e.target.value})}
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#d4a574]
                  focus:ring-2 focus:ring-[#d4a574]/20 outline-none transition" />
              <textarea placeholder="Your message" rows="5" required
                value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#d4a574]
                  focus:ring-2 focus:ring-[#d4a574]/20 outline-none transition resize-none" />
              <button type="submit"
                className="w-full p-4 rounded-xl bg-[#d4a574] text-white font-semibold
                  hover:bg-[#c19463] transition inline-flex items-center justify-center gap-2">
                <Mail size={18} /> Send Message
              </button>
            </form>
          )}

          <div className="mt-10 pt-10 border-t border-gray-100 text-center text-sm text-gray-500">
            Or contact us directly: <a href="mailto:gba@cha.ac.kr" className="text-[#d4a574] font-semibold hover:underline">gba@cha.ac.kr</a>
          </div>
        </div>
      </section>
    </>
  )
}
