import { useState, useCallback } from 'react'
import '@fontsource-variable/nunito'
import { RotateCcw, ChevronRight, Star } from 'lucide-react'
import { LEVELS, type Level, type Sprite } from './sprites'

// ─── Card size scales down for larger grids ───────────────────────────────────
function cardSize(pairCount: number) {
  if (pairCount <= 6)  return 160
  if (pairCount <= 8)  return 150
  if (pairCount <= 10) return 140
  if (pairCount <= 12) return 128
  return 110
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
  return shuffle(level.sprites.flatMap((s: Sprite) => [s.id, s.id])).map((spriteId, i) => ({
    uid: i, spriteId, flipped: false, matched: false,
  }))
}

// ─── FlipCard ─────────────────────────────────────────────────────────────────
function FlipCard({ card, level, size, onClick }: {
  card: Card; level: Level; size: number; onClick: () => void
}) {
  const sprite = level.sprites.find(s => s.id === card.spriteId)!
  const revealed = card.flipped || card.matched
  return (
    <div
      onClick={revealed ? undefined : onClick}
      style={{ width: size, height: size, perspective: '700px', cursor: revealed ? 'default' : 'pointer' }}
    >
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 0.4s ease',
      }}>
        {/* Back */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          borderRadius: 14, background: level.backColor,
          boxShadow: '0 4px 12px rgba(0,0,0,0.13)',
        }} />
        {/* Front */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)', borderRadius: 14, background: '#fff',
          boxShadow: card.matched
            ? `0 0 0 3px ${level.backColor}, 0 4px 12px rgba(0,0,0,0.08)`
            : '0 4px 12px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img
            src={`/flip-game/${sprite.file}.jpg`}
            draggable={false}
            style={{ width: '88%', height: '88%', objectFit: 'contain' }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Icon button ──────────────────────────────────────────────────────────────
function IconBtn({ onClick, title, color, side, children }: {
  onClick: () => void; title: string; color: string; side: 'left' | 'right'; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        position: 'absolute', top: 20, [side]: 20,
        width: 44, height: 44, borderRadius: '50%', border: 'none',
        background: color, color: '#fff', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 3px 10px rgba(0,0,0,0.18)',
      }}
    >
      {children}
    </button>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function FlipGame() {
  const [levelIdx, setLevelIdx] = useState(0)
  const level = LEVELS[levelIdx]
  const size = cardSize(level.sprites.length)

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
      justifyContent: 'center', gap: 20,
      fontFamily: '"Nunito Variable", Nunito, sans-serif',
      userSelect: 'none', padding: '60px 16px 32px',
      position: 'relative',
    }}>
      {/* Restart — top left, theme color */}
      <IconBtn onClick={() => reset(level)} title="Restart" color={level.backColor} side="left">
        <RotateCcw size={20} strokeWidth={2.5} />
      </IconBtn>

      {/* Next — top right, next level's color, only when won */}
      {won && hasNext && (
        <IconBtn onClick={goNext} title="Next level" color={level.backColor} side="right">
          <ChevronRight size={22} strokeWidth={2.5} />
        </IconBtn>
      )}

      {/* Title + stars */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5, color: '#333' }}>
          {won ? '🎉 All matched!' : `${level.emoji} ${level.title}`}
        </div>
        {!won && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            marginTop: 6, padding: '3px 10px', borderRadius: 999,
            background: level.backColor + '22', border: `1.5px solid ${level.backColor}55`,
          }}>
            {Array.from({ length: level.stars }, (_, i) => (
              <Star key={i} size={13} strokeWidth={2} fill={level.backColor} color={level.backColor} />
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${level.cols}, ${size}px)`,
        gridTemplateRows: `repeat(${rows}, ${size}px)`,
        gap: 10,
      }}>
        {cards.map(card => (
          <FlipCard key={card.uid} card={card} level={level} size={size} onClick={() => handleFlip(card.uid)} />
        ))}
      </div>
    </div>
  )
}
