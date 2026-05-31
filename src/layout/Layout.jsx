import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import AssistantWidget from '../components/AssistantWidget'
import { verifyToken } from '../lib/auth'

export default function Layout() {
  const { pathname, hash } = useLocation()

  // 앱 로드 시 저장된 토큰 검증 → 세션 복원 (Navbar는 gba-auth-changed로 동기화)
  useEffect(() => {
    verifyToken().then(() => {
      window.dispatchEvent(new Event('gba-auth-changed'))
    }).catch(() => {})
  }, [])

  // 해시가 없으면 페이지 전환 시 맨 위로. 해시가 있으면 해당 섹션으로 스크롤.
  useEffect(() => {
    if (hash) {
      // 라우트 전환 후 DOM이 마운트될 시간을 약간 확보
      const id = hash.replace('#', '')
      const scroll = () => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      // 페이지가 막 전환된 경우 한 프레임 뒤에 시도
      requestAnimationFrame(() => requestAnimationFrame(scroll))
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <AssistantWidget />
    </div>
  )
}
