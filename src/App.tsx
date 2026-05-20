import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Toc from './pages/Toc'
import Studio from './pages/Studio'
import Kings from './pages/Kings'
import Swordsmen from './pages/Swordsmen'
import DeckTests from './pages/DeckTests'
import Tuner from './pages/Tuner'
import QuipInsights from './pages/QuipInsights'
import ChineseNames from './pages/ChineseNames'
import VanillaEnglish from './pages/VanillaEnglish'
import Lily from './pages/Lily'
import PressHere from './pages/PressHere'
import Turbines from './pages/Turbines'
import FlipGame from './flip-game'
import DinosaurGame from './pages/DinosaurGame'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/toc" element={<Toc />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/kings" element={<Kings />} />
        <Route path="/swordsmen" element={<Swordsmen />} />
        <Route path="/deck-tests" element={<DeckTests />} />
        <Route path="/tuner" element={<Tuner />} />
        <Route path="/quip-insights" element={<QuipInsights />} />
        <Route path="/chinese-names" element={<ChineseNames />} />
        <Route path="/vanilla-english" element={<VanillaEnglish />} />
        <Route path="/lily" element={<Lily />} />
        <Route path="/press-here" element={<PressHere />} />
        <Route path="/turbines" element={<Turbines />} />
        <Route path="/flip-game" element={<FlipGame />} />
        <Route path="/dinosaur-game" element={<DinosaurGame />} />
      </Routes>
    </BrowserRouter>
  )
}
