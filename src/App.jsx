import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './layout/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Major from './pages/Major'
import Curriculum from './pages/Curriculum'
import Faculty from './pages/Faculty'
import Career from './pages/Career'
import Admission from './pages/Admission'
import Assistant from './pages/Assistant'

// 하위 경로 배포(학교 서버 /gba/)와 루트 배포(Vercel)를 한 소스로 지원한다.
// basename 에는 vite 의 --base 값이 BASE_URL 로 그대로 들어온다.
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"            element={<Home />} />
          <Route path="/about"       element={<About />} />
          <Route path="/major"       element={<Major />} />
          <Route path="/curriculum"  element={<Curriculum />} />
          <Route path="/faculty"     element={<Faculty />} />
          <Route path="/career"      element={<Career />} />
          <Route path="/admission"   element={<Admission />} />
          <Route path="/assistant"   element={<Assistant />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
