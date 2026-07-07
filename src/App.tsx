import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LegacyPage from './pages/LegacyPage'
import Home from './pages/Home'
import Dunhuang from './pages/dunhuang/Dunhuang'
import Toc from './pages/Toc'
import FlipGame from './games/flip'
import WackAVirus from './games/whack'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/toc" element={<Toc />} />
        <Route path="/dunhuang" element={<Dunhuang />} />

        {/* Legacy HTML pages */}
        <Route path="/studio"          element={<LegacyPage src="/studio/index.html"          title="Studio" />} />
        <Route path="/tuner"           element={<LegacyPage src="/tuner/index.html"           title="Tuner" />} />
        <Route path="/quip-insights"   element={<LegacyPage src="/quip-insights/index.html"   title="Quip Insights" />} />
        <Route path="/chinese-names"   element={<LegacyPage src="/chinese-names/index.html"   title="Chinese Names" />} />
        <Route path="/vanilla-english" element={<LegacyPage src="/vanilla-english/index.html" title="Vanilla English" />} />
        <Route path="/lily"            element={<LegacyPage src="/lily/index.html"            title="Lily" />} />
<Route path="/turbines"        element={<LegacyPage src="/turbines/index.html"        title="Turbines" />} />

        {/* Games */}
        <Route path="/flip"    element={<FlipGame />} />
        <Route path="/flip-game" element={<Navigate to="/flip" replace />} />
        <Route path="/wack-a-virus" element={<WackAVirus />} />
      </Routes>
    </BrowserRouter>
  )
}
