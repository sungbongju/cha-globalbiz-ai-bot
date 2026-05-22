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

export default function App() {
  return (
    <BrowserRouter>
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
