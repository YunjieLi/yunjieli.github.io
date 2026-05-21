import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LegacyPage from './pages/LegacyPage'
import Home from './pages/Home'
import Toc from './pages/Toc'
import FlipGame from './games/flip-game'
import DinosaurGame from './games/dinosaur-game'
import WackAVirus from './games/wack-a-virus'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/toc" element={<Toc />} />

        {/* Legacy HTML pages */}
        <Route path="/studio"          element={<LegacyPage src="/studio/index.html"          title="Studio" />} />
        <Route path="/kings"           element={<LegacyPage src="/kings/index.html"           title="Kings" />} />
        <Route path="/swordsmen"       element={<LegacyPage src="/swordsmen/index.html"       title="Swordsmen" />} />
        <Route path="/deck-tests"      element={<LegacyPage src="/deck-tests/index.html"      title="Deck Tests" />} />
        <Route path="/tuner"           element={<LegacyPage src="/tuner/index.html"           title="Tuner" />} />
        <Route path="/quip-insights"   element={<LegacyPage src="/quip-insights/index.html"   title="Quip Insights" />} />
        <Route path="/chinese-names"   element={<LegacyPage src="/chinese-names/index.html"   title="Chinese Names" />} />
        <Route path="/vanilla-english" element={<LegacyPage src="/vanilla-english/index.html" title="Vanilla English" />} />
        <Route path="/lily"            element={<LegacyPage src="/lily/index.html"            title="Lily" />} />
        <Route path="/press-here"      element={<LegacyPage src="/press-here/index.html"      title="Press Here" />} />
        <Route path="/turbines"        element={<LegacyPage src="/turbines/index.html"        title="Turbines" />} />

        {/* Games */}
        <Route path="/flip-game"    element={<FlipGame />} />
        <Route path="/dinosaur-game" element={<DinosaurGame />} />
        <Route path="/wack-a-virus" element={<WackAVirus />} />
      </Routes>
    </BrowserRouter>
  )
}
