import { useState, useCallback } from 'react'
import '@fontsource-variable/nunito'
import { RotateCcw } from 'lucide-react'

// ─── Sprite sheet (1017 × 549) ───────────────────────────────────────────────
const SHEET_W = 1017
const SHEET_H = 549

type Sprite = { id: string; cx: number; cy: number; cw: number; ch: number }

const SPRITES: Sprite[] = [
  { id: 'lemon',     cx: 100, cy: 101, cw:  90, ch: 158 },
  { id: 'icecream',  cx: 604, cy: 112, cw:  72, ch: 168 },
  { id: 'girl',      cx: 932, cy: 105, cw: 168, ch: 154 },
  { id: 'sun',       cx:  88, cy: 284, cw: 150, ch: 164 },
  { id: 'octopus',   cx: 761, cy: 289, cw: 202, ch: 158 },
  { id: 'pineapple', cx: 428, cy: 458, cw: 100, ch: 140 },
]

const CARD_SIZE = 160
const SPRITE_PX = 118   // max dimension the sprite occupies inside the card

function spriteStyle(s: Sprite): React.CSSProperties {
  const scale = SPRITE_PX / Math.max(s.cw, s.ch)
  const sw = (SHEET_W * scale).toFixed(1)
  const sh = (SHEET_H * scale).toFixed(1)
  const bx = (-(s.cx * scale) + CARD_SIZE / 2).toFixed(1)
  const by = (-(s.cy * scale) + CARD_SIZE / 2).toFixed(1)
  return {
    backgroundImage: 'url(/flip-game/1-1.jpg)',
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

function makeCards(): Card[] {
  return shuffle(SPRITES.flatMap(s => [s.id, s.id])).map((spriteId, i) => ({
    uid: i, spriteId, flipped: false, matched: false,
  }))
}

// ─── FlipCard ─────────────────────────────────────────────────────────────────
function FlipCard({ card, onClick }: { card: Card; onClick: () => void }) {
  const sprite = SPRITES.find(s => s.id === card.spriteId)!
  const revealed = card.flipped || card.matched

  return (
    <div
      onClick={revealed ? undefined : onClick}
      style={{
        width: CARD_SIZE, height: CARD_SIZE,
        perspective: '700px',
        cursor: revealed ? 'default' : 'pointer',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 0.45s ease',
      }}>
        {/* Back face */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          borderRadius: 18,
          background: '#FF6B9D',
          boxShadow: '0 4px 14px rgba(0,0,0,0.13)',
        }} />

        {/* Front face */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: 18,
          background: '#fff',
          boxShadow: card.matched
            ? '0 0 0 3px #4ade80, 0 4px 14px rgba(0,0,0,0.1)'
            : '0 4px 14px rgba(0,0,0,0.1)',
          ...spriteStyle(sprite),
        }} />
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function FlipGame() {
  const [cards, setCards] = useState<Card[]>(makeCards)
  const [pending, setPending] = useState<number | null>(null)   // uid of first flipped card
  const [locked, setLocked] = useState(false)

  const won = cards.every(c => c.matched)

  const handleFlip = useCallback((uid: number) => {
    if (locked) return
    if (uid === pending) return   // don't allow clicking the same card twice

    setCards(prev => {
      const card = prev.find(c => c.uid === uid)!
      if (card.flipped || card.matched) return prev
      return prev.map(c => c.uid === uid ? { ...c, flipped: true } : c)
    })

    if (pending === null) {
      setPending(uid)
      return
    }

    // Second card — check match
    const firstUid = pending
    setLocked(true)
    setPending(null)

    setCards(prev => {
      const first = prev.find(c => c.uid === firstUid)!
      const second = prev.find(c => c.uid === uid)!
      if (first.spriteId === second.spriteId) {
        return prev.map(c =>
          c.uid === firstUid || c.uid === uid ? { ...c, matched: true } : c
        )
      }
      return prev
    })

    setTimeout(() => {
      setCards(prev => {
        const first = prev.find(c => c.uid === firstUid)!
        if (first.matched) return prev
        return prev.map(c =>
          c.uid === firstUid || c.uid === uid ? { ...c, flipped: false } : c
        )
      })
      setLocked(false)
    }, 900)
  }, [locked, pending])

  const reset = () => {
    setCards(makeCards())
    setPending(null)
    setLocked(false)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #e0f7ff 0%, #fff9e6 60%, #ffe0f0 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 28,
      fontFamily: '"Nunito Variable", Nunito, sans-serif',
      userSelect: 'none', padding: '24px 16px',
      position: 'relative',
    }}>
      {/* Restart button — top right */}
      <button
        onClick={reset}
        title="Shuffle & restart"
        style={{
          position: 'absolute', top: 20, right: 20,
          width: 44, height: 44, borderRadius: '50%', border: 'none',
          background: won ? '#4ade80' : '#FF6B9D',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
          transition: 'transform 0.1s ease, background 0.3s ease',
        }}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.88)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <RotateCcw size={20} strokeWidth={2.5} />
      </button>

      {/* Title */}
      <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1, color: '#333', textAlign: 'center' }}>
        {won ? '🎉 You matched them all!' : 'Summer Match!'}
      </div>

      {/* Grid: 4 × 3 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(4, ${CARD_SIZE}px)`,
        gap: 12,
      }}>
        {cards.map(card => (
          <FlipCard key={card.uid} card={card} onClick={() => handleFlip(card.uid)} />
        ))}
      </div>
    </div>
  )
}
