import { useState } from 'react'

const YELLOW = '#FDD302'
const RED = '#F63664'
const BLUE = '#5CCBF8'
const DOT_SIZE = 88

// The 3 fixed horizontal positions, vertically centered
const POSITIONS = [
  { x: 25, y: 50 },
  { x: 50, y: 50 },
  { x: 75, y: 50 },
]

type DotSpec = { pos: number; color: string; onClick: () => void }

// ─── Page 1 ────────────────────────────────────────────────────────────────
function Page1() {
  const [count, setCount] = useState(1)

  const bump = () => setCount(c => Math.min(c + 1, 3))
  const dots: DotSpec[] = Array.from({ length: count }, (_, i) => ({
    pos: i,
    color: YELLOW,
    onClick: bump,
  }))

  const intro =
    count === 1 ? 'Press the dot!'
    : count === 2 ? 'Now press one of them!'
    : 'Three yellow dots! 🌟'

  return <PageCanvas dots={dots} intro={intro} />
}

// ─── Page 2 ────────────────────────────────────────────────────────────────
function Page2() {
  const [leftColor, setLeft] = useState(YELLOW)
  const [rightColor, setRight] = useState(YELLOW)

  const dots: DotSpec[] = [
    { pos: 0, color: leftColor,  onClick: () => setLeft(RED) },
    { pos: 1, color: YELLOW,     onClick: () => {} },
    { pos: 2, color: rightColor, onClick: () => setRight(BLUE) },
  ]

  const leftDone = leftColor === RED
  const rightDone = rightColor === BLUE
  const intro =
    leftDone && rightDone ? 'Red, yellow, blue! 🎨'
    : leftDone            ? 'Now try the right dot!'
    : rightDone           ? 'Now try the left dot!'
    :                       'Press the left dot, then the right!'

  return <PageCanvas dots={dots} intro={intro} />
}

// ─── Shared canvas ─────────────────────────────────────────────────────────
function PageCanvas({ dots, intro }: { dots: DotSpec[]; intro: string }) {
  const [popped, setPopped] = useState<number | null>(null)

  function handleClick(spec: DotSpec) {
    spec.onClick()
    setPopped(spec.pos)
    setTimeout(() => setPopped(null), 200)
  }

  return (
    <>
      {/* dot canvas */}
      <div style={{
        flex: 1, width: '100%', maxWidth: 480, maxHeight: 520,
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 8px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.08)',
        border: '3px solid #f0e8d8',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {dots.map(spec => {
          const { x, y } = POSITIONS[spec.pos]
          const isPopped = popped === spec.pos
          return (
            <div
              key={spec.pos}
              onClick={() => handleClick(spec)}
              style={{
                position: 'absolute',
                left: `${x}%`, top: `${y}%`,
                transform: `translate(-50%, -50%) scale(${isPopped ? 1.3 : 1})`,
                width: DOT_SIZE, height: DOT_SIZE,
                borderRadius: '50%',
                background: spec.color,
                cursor: 'pointer',
                transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), background 0.25s ease',
                boxShadow: `0 4px 16px ${spec.color}88`,
                WebkitTapHighlightColor: 'transparent',
              }}
            />
          )
        })}
      </div>

      {/* intro text */}
      <div style={{
        marginTop: 20, marginBottom: 20,
        fontSize: 'clamp(16px, 4vw, 22px)',
        color: '#444', textAlign: 'center',
        maxWidth: 480,
        lineHeight: 1.4,
        minHeight: '2.8em',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'inherit',
      }}>
        {intro}
      </div>
    </>
  )
}

// ─── Shell ─────────────────────────────────────────────────────────────────
const PAGES = [Page1, Page2]
const TOTAL = PAGES.length

export default function PressHere() {
  const [page, setPage] = useState(0)
  // key forces page component to remount (resetting its state) on navigation
  const [key, setKey] = useState(0)

  const isFirst = page === 0
  const isLast = page === TOTAL - 1
  const PageComponent = PAGES[page]

  function nav(next: number) {
    setPage(next)
    setKey(k => k + 1)
  }

  const btnBase: React.CSSProperties = {
    flex: 1, height: 60, borderRadius: 16, border: 'none',
    fontSize: 24, fontFamily: 'inherit', cursor: 'pointer',
    transition: 'transform 0.1s',
  }

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#fef9f0', padding: '16px', boxSizing: 'border-box',
      fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
    }}>
      <div style={{ fontSize: 14, color: '#bbb', marginBottom: 10, letterSpacing: '0.05em' }}>
        {page + 1} / {TOTAL}
      </div>

      <PageComponent key={key} />

      {/* nav buttons */}
      <div style={{ display: 'flex', gap: 12, maxWidth: 480, width: '100%' }}>
        <button
          onClick={() => nav(page - 1)}
          disabled={isFirst}
          style={{
            ...btnBase,
            background: isFirst ? '#e8e8e8' : '#FDD302',
            color: isFirst ? '#aaa' : '#333',
            cursor: isFirst ? 'default' : 'pointer',
            boxShadow: isFirst ? 'none' : '0 4px 12px #FDD30255',
          }}
          onPointerDown={e => { if (!isFirst) (e.currentTarget.style.transform = 'scale(0.95)') }}
          onPointerUp={e => { (e.currentTarget.style.transform = 'scale(1)') }}
        >←</button>
        <button
          onClick={() => nav(0)}
          style={{
            ...btnBase,
            background: '#5CCBF8', color: '#fff',
            boxShadow: '0 4px 12px #5CCBF855',
          }}
          onPointerDown={e => { (e.currentTarget.style.transform = 'scale(0.95)') }}
          onPointerUp={e => { (e.currentTarget.style.transform = 'scale(1)') }}
        >↺</button>
        <button
          onClick={() => nav(page + 1)}
          disabled={isLast}
          style={{
            ...btnBase,
            background: isLast ? '#e8e8e8' : '#F63664',
            color: isLast ? '#aaa' : '#fff',
            cursor: isLast ? 'default' : 'pointer',
            boxShadow: isLast ? 'none' : '0 4px 12px #F6366455',
          }}
          onPointerDown={e => { if (!isLast) (e.currentTarget.style.transform = 'scale(0.95)') }}
          onPointerUp={e => { (e.currentTarget.style.transform = 'scale(1)') }}
        >→</button>
      </div>
    </div>
  )
}
