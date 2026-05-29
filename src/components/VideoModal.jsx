import { useEffect } from 'react'
import { X } from 'lucide-react'

// 박교수님 환영 영상 — 자체 호스팅 (HeyGen 서버 의존 제거)
const WELCOME_VIDEO_SRC = '/welcome-prof-park.mp4'

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
          <video
            src={WELCOME_VIDEO_SRC}
            title="Welcome to Global Business AI at CHA University"
            className="absolute inset-0 w-full h-full object-contain"
            controls
            autoPlay
            playsInline
          />
        </div>
      </div>
    </div>
  )
}
