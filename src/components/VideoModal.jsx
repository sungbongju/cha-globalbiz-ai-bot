import { useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'

// HeyGen 비디오 — 실제 embed URL은 HeyGen 대시보드에서 "Share" → "Embed" 받아서 교체 권장
// 현재 fallback: HeyGen 직접 링크
const HEYGEN_VIDEO_ID = '20da7e9eb6744407b710bf226ec0ee43'
const HEYGEN_EMBED_URL = `https://app.heygen.com/embeds/${HEYGEN_VIDEO_ID}`
const HEYGEN_DIRECT_URL = `https://app.heygen.com/videos/welcome-to-global-business-ai-at-cha-university-${HEYGEN_VIDEO_ID}`

export default function VideoModal({ open, onClose }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      const onEsc = (e) => e.key === 'Escape' && onClose()
      window.addEventListener('keydown', onEsc)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', onEsc)
      }
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl"
        onClick={e => e.stopPropagation()}
      >
        {/* 닫기 */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/70 hover:text-white flex items-center gap-2 text-sm"
        >
          Close <X size={20} />
        </button>

        {/* 비디오 컨테이너 (16:9) */}
        <div className="relative w-full pb-[56.25%] rounded-2xl overflow-hidden shadow-2xl bg-black">
          <iframe
            src={HEYGEN_EMBED_URL}
            title="Welcome to Global Business AI at CHA University"
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          />
        </div>

        {/* Fallback (만약 iframe 안 뜨면) */}
        <div className="mt-4 text-center text-white/60 text-sm">
          비디오가 안 보이시나요?{' '}
          <a
            href={HEYGEN_DIRECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#d4a574] hover:underline"
          >
            HeyGen에서 직접 보기 <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  )
}
