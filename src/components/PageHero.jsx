// 일반 페이지용 상단 Hero 배너 (Home과 다른 컴팩트 버전)
export default function PageHero({ eyebrow, title, subtitle }) {
  return (
    <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#0a1e3f] via-[#1a3567] to-[#0a1e3f] overflow-hidden">
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(212,165,116,0.4) 0%, transparent 50%)' }} />
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        {eyebrow && (
          <div className="text-sm uppercase tracking-widest text-[#d4a574] font-semibold mb-4">
            {eyebrow}
          </div>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 text-lg text-white/80 max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
