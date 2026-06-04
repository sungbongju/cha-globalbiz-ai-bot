import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { emailLogin, emailSignup } from '../lib/auth'

// 이메일 + 비밀번호 + 닉네임(이름) 회원가입/로그인 모달.
// navy(#0a1e3f) / gold(#d4a574) 테마. 카카오 로그인 없음.
export default function AuthModal({ open, onClose, onSuccess }) {
  const [mode, setMode]         = useState('login')  // 'login' | 'signup'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // 모달 열릴 때 상태 리셋
  useEffect(() => {
    if (open) {
      setMode('login')
      setError('')
      setLoading(false)
      setEmail(''); setPassword(''); setName('')
    }
  }, [open])

  if (!open) return null

  const submit = async () => {
    setError('')
    if (!email || !password) { setError('Please enter your email and password.'); return }
    if (mode === 'signup' && !name) { setError('Please enter your name (nickname).'); return }
    if (mode === 'signup' && password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const r = mode === 'login'
        ? await emailLogin(email, password)
        : await emailSignup(email, password, name)
      if (!r.success) { setError(r.error || 'Something went wrong. Please try again.'); setLoading(false); return }
      onSuccess?.(r.user)
      onClose?.()
    } catch {
      setError('A network error occurred.')
    } finally {
      setLoading(false)
    }
  }

  // Portal to <body> so the overlay isn't trapped by the navbar's
  // backdrop-filter (which would make `fixed inset-0` resolve against the
  // header box instead of the viewport, hiding the modal when scrolled).
  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* min-h-full + items-center: centered when it fits, scrolls when the
          modal is taller than the viewport (e.g. signup on short screens). */}
      <div className="flex min-h-dvh items-center justify-center p-4">
        <div
          className="relative w-full max-w-md my-4 rounded-2xl bg-white shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
        {/* navy header */}
        <div className="bg-gradient-to-br from-[#0a1e3f] to-[#1a3567] px-8 pt-8 pb-10 text-center">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-white/70 hover:text-white transition"
          >
            <X size={22} />
          </button>
          <div className="mx-auto w-12 h-12 rounded-xl bg-[#d4a574] flex items-center justify-center text-white font-bold text-lg shadow-lg">
            CHA
          </div>
          <h3 className="mt-4 text-white text-xl font-bold tracking-wide">
            {mode === 'login' ? 'Sign in' : 'Sign up'}
          </h3>
          <p className="mt-1 text-white/70 text-sm">
            Global Business AI · CHA University
          </p>
        </div>

        <div className="px-8 py-7">
          {/* tabs */}
          <div className="flex rounded-full bg-[#faf8f3] p-1 mb-6">
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-full transition
                ${mode === 'login' ? 'bg-[#0a1e3f] text-white shadow' : 'text-gray-500 hover:text-[#0a1e3f]'}`}
              onClick={() => { setMode('login'); setError('') }}
            >Sign in</button>
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-full transition
                ${mode === 'signup' ? 'bg-[#0a1e3f] text-white shadow' : 'text-gray-500 hover:text-[#0a1e3f]'}`}
              onClick={() => { setMode('signup'); setError('') }}
            >Sign up</button>
          </div>

          {mode === 'signup' && (
            <input
              className="w-full mb-3 px-4 py-3 rounded-xl border border-gray-200 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#d4a574]/60 focus:border-[#d4a574]"
              placeholder="Name (nickname)"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          )}
          <input
            className="w-full mb-3 px-4 py-3 rounded-xl border border-gray-200 text-sm
              focus:outline-none focus:ring-2 focus:ring-[#d4a574]/60 focus:border-[#d4a574]"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="w-full mb-3 px-4 py-3 rounded-xl border border-gray-200 text-sm
              focus:outline-none focus:ring-2 focus:ring-[#d4a574]/60 focus:border-[#d4a574]"
            type="password"
            placeholder="Password (6+ characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />

          {error && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#d4a574] text-white text-sm font-semibold
              shadow-lg shadow-[#d4a574]/30 hover:bg-[#c19463] transition disabled:opacity-60"
          >
            {loading ? 'Processing…' : (mode === 'login' ? 'Sign in' : 'Sign up')}
          </button>

          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-[#0a1e3f] transition"
          >
            Continue without signing in
          </button>
        </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
