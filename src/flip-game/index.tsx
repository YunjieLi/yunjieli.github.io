import { useState, useCallback } from 'react'
import '@fontsource-variable/nunito'
import { RotateCcw, ChevronRight } from 'lucide-react'
import { LEVELS, type Level, type Sprite } from './sprites'

// ─── Sprite rendering ─────────────────────────────────────────────────────────
const CARD_SIZE = 150
const SPRITE_PX = 110

function spriteStyle(s: Sprite, level: Level): React.CSSProperties {
  const scale = SPRITE_PX / Math.max(s.cw, s.ch)
  const sw = (level.sheetW * scale).toFixed(1)
  const sh = (level.sheetH * scale).toFixed(1)
  const bx = (-(s.cx * scale) + CARD_SIZE / 2).toFixed(1)
  const by = (-(s.cy * scale) + CARD_SIZE / 2).toFixed(1)
  return {
    backgroundImage: `url(/flip-game/${level.sheet}.jpg)`,
    backgroundSize: `${sw}px ${sh}px`,
    backgroundPosition: `${bx}px ${by}px`,
    backgroundRepeat: 'no-repeat',
  }
}

// ─── Game state ───────────────────────────────────────────────────────────────
type Card = { uid: number; spriteId: string; flipped: boolean; matched: boolean }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeCards(level: Level): Card[] {
  return shuffle(level.sprites.flatMap(s => [s.id, s.id])).map((spriteId, i) => ({
    uid: i, spriteId, flipped: false, matched: false,
  }))
}

// ─── FlipCard ─────────────────────────────────────────────────────────────────
function FlipCard({ card, level, onClick }: { card: Card; level: Level; onClick: () => void }) {
  const sprite = level.sprites.find(s => s.id === card.spriteId)!
  const revealed = card.flipped || card.matched
  return (
    <div
      onClick={revealed ? undefined : onClick}
      style={{ width: CARD_SIZE, height: CARD_SIZE, perspective: '700px', cursor: revealed ? 'default' : 'pointer' }}
    >
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 0.4s ease',
      }}>
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          borderRadius: 16, background: level.backColor,
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)', borderRadius: 16, background: '#fff',
          boxShadow: card.matched
            ? `0 0 0 3px ${level.backColor}, 0 4px 12px rgba(0,0,0,0.1)`
            : '0 4px 12px rgba(0,0,0,0.1)',
          ...spriteStyle(sprite, level),
        }} />
      </div>
    </div>
  )
}

// ─── Icon button ──────────────────────────────────────────────────────────────
const iconBtn = (bg: string, side: 'left' | 'right'): React.CSSProperties => ({
  position: 'absolute', top: 20,
  [side]: 20,
  width: 44, height: 44, borderRadius: '50%', border: 'none',
  background: bg, color: '#fff', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
})

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function FlipGame() {
  const [levelIdx, setLevelIdx] = useState(0)
  const level = LEVELS[levelIdx]

  const [cards, setCards] = useState<Card[]>(() => makeCards(level))
  const [pending, setPending] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)

  const won = cards.every(c => c.matched)
  const hasNext = levelIdx < LEVELS.length - 1

  const reset = useCallback((lvl: Level) => {
    setCards(makeCards(lvl))
    setPending(null)
    setLocked(false)
  }, [])

  const goNext = () => {
    const next = LEVELS[levelIdx + 1]
    setLevelIdx(levelIdx + 1)
    reset(next)
  }

  const handleFlip = useCallback((uid: number) => {
    if (locked || uid === pending) return
    setCards(prev => {
      const card = prev.find(c => c.uid === uid)!
      if (card.flipped || card.matched) return prev
      return prev.map(c => c.uid === uid ? { ...c, flipped: true } : c)
    })
    if (pending === null) { setPending(uid); return }

    const firstUid = pending
    setLocked(true); setPending(null)
    setCards(prev => {
      const first = prev.find(c => c.uid === firstUid)!
      const second = prev.find(c => c.uid === uid)!
      if (first.spriteId === second.spriteId)
        return prev.map(c => c.uid === firstUid || c.uid === uid ? { ...c, matched: true } : c)
      return prev
    })
    setTimeout(() => {
      setCards(prev => {
        const first = prev.find(c => c.uid === firstUid)!
        if (first.matched) return prev
        return prev.map(c => c.uid === firstUid || c.uid === uid ? { ...c, flipped: false } : c)
      })
      setLocked(false)
    }, 900)
  }, [locked, pending])

  const rows = (level.sprites.length * 2) / level.cols

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #e0f7ff 0%, #fff9e6 60%, #ffe0f0 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 24,
      fontFamily: '"Nunito Variable", Nunito, sans-serif',
      userSelect: 'none', padding: '60px 16px 32px',
      position: 'relative',
    }}>
      {/* Restart — top left */}
      <button onClick={() => reset(level)} title="Restart" style={iconBtn('#aaa', 'left')}>
        <RotateCcw size={20} strokeWidth={2.5} />
      </button>

      {/* Next — top right, only when won */}
      {won && hasNext && (
        <button onClick={goNext} title="Next level" style={iconBtn(LEVELS[levelIdx + 1].backColor, 'right')}>
          <ChevronRight size={22} strokeWidth={2.5} />
        </button>
      )}

      {/* Title */}
      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5, color: '#333' }}>
        {won ? '🎉 All matched!' : `${level.emoji} ${level.title}`}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${level.cols}, ${CARD_SIZE}px)`,
        gridTemplateRows: `repeat(${rows}, ${CARD_SIZE}px)`,
        gap: 10,
      }}>
        {cards.map(card => (
          <FlipCard key={card.uid} card={card} level={level} onClick={() => handleFlip(card.uid)} />
        ))}
      </div>
    </div>
  )
}
