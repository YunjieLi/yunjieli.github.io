import { useState } from 'react'

const YELLOW = '#FDD302'
const RED    = '#F63664'
const BLUE   = '#5CCBF8'
const DOT_SIZE = 80

// Fixed column x-positions (%)
const COL_X = [25, 50, 75]
// Fixed row y-positions, bottom → top (%)
const ROW_Y = [84, 67, 50, 33, 16]

type DotSpec = {
  id: string
  color: string
  x: number  // % from left
  y: number  // % from top
  onClick: () => void
}

// ─── Shared canvas ─────────────────────────────────────────────────────────
function PageCanvas({ dots, intro }: { dots: DotSpec[]; intro: string }) {
  const [popped, setPopped] = useState<string | null>(null)

  function handleClick(spec: DotSpec) {
    spec.onClick()
    setPopped(spec.id)
    setTimeout(() => setPopped(null), 200)
  }

  return (
    <>
      <div style={{
        flex: 1, width: '100%', maxWidth: 480, maxHeight: 520,
        background: '#fff', borderRadius: 24,
        boxShadow: '0 8px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.08)',
        border: '3px solid #f0e8d8',
        position: 'relative', overflow: 'hidden',
      }}>
        {dots.map(spec => {
          const isPopped = popped === spec.id
          return (
            <div
              key={spec.id}
              onClick={() => handleClick(spec)}
              style={{
                position: 'absolute',
                left: `${spec.x}%`, top: `${spec.y}%`,
                transform: `translate(-50%, -50%) scale(${isPopped ? 1.28 : 1})`,
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

      <div style={{
        marginTop: 20, marginBottom: 20,
        fontSize: 'clamp(16px, 4vw, 22px)',
        color: '#444', textAlign: 'center', maxWidth: 480,
        lineHeight: 1.4, minHeight: '2.8em',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'inherit',
      }}>
        {intro}
      </div>
    </>
  )
}

// ─── Page 1 ────────────────────────────────────────────────────────────────
// Starts: 1 yellow dot. Press → 2. Press → 3. All at fixed row y=ROW_Y[0].
function Page1() {
  const [count, setCount] = useState(1)
  const bump = () => setCount(c => Math.min(c + 1, 3))

  const dots: DotSpec[] = Array.from({ length: count }, (_, i) => ({
    id: `p1-${i}`,
    color: YELLOW,
    x: COL_X[i],
    y: ROW_Y[0],
    onClick: bump,
  }))

  const intro =
    count === 1 ? 'Press the dot!'
    : count === 2 ? 'Now press one of them!'
    : 'Three yellow dots! 🌟'

  return <PageCanvas dots={dots} intro={intro} />
}

// ─── Page 2 ────────────────────────────────────────────────────────────────
// Starts: 3 yellow dots. Left → red, right → blue.
function Page2() {
  const [leftColor,  setLeft]  = useState(YELLOW)
  const [rightColor, setRight] = useState(YELLOW)

  const dots: DotSpec[] = [
    { id: 'p2-0', color: leftColor,  x: COL_X[0], y: ROW_Y[0], onClick: () => setLeft(RED)  },
    { id: 'p2-1', color: YELLOW,     x: COL_X[1], y: ROW_Y[0], onClick: () => {}             },
    { id: 'p2-2', color: rightColor, x: COL_X[2], y: ROW_Y[0], onClick: () => setRight(BLUE) },
  ]

  const leftDone  = leftColor  === RED
  const rightDone = rightColor === BLUE
  const intro =
    leftDone && rightDone ? 'Red, yellow, blue! 🎨'
    : leftDone            ? 'Now try the right dot!'
    : rightDone           ? 'Now try the left dot!'
    :                       'Press the left dot, then the right!'

  return <PageCanvas dots={dots} intro={intro} />
}

// ─── Page 3 ────────────────────────────────────────────────────────────────
// Starts: end-state of Page 2 (red, yellow, blue, 1 dot each).
// Press any dot → adds a dot above that column (up to 5 per column → 5×3 grid).
function Page3() {
  const [counts, setCounts] = useState([1, 1, 1])

  const COL_COLORS = [RED, YELLOW, BLUE]

  function pressCol(col: number) {
    setCounts(prev => {
      if (prev[col] >= 5) return prev
      const next = [...prev]
      next[col]++
      return next
    })
  }

  const dots: DotSpec[] = []
  COL_COLORS.forEach((color, ci) => {
    for (let row = 0; row < counts[ci]; row++) {
      dots.push({
        id: `p3-${ci}-${row}`,
        color,
        x: COL_X[ci],
        y: ROW_Y[row],
        onClick: () => pressCol(ci),
      })
    }
  })

  const total = counts.reduce((a, b) => a + b, 0)
  const allDone = counts.every(c => c === 5)
  const intro =
    allDone        ? 'A 5×3 rainbow matrix! 🌈'
    : total > 6    ? 'Almost there — keep pressing!'
    :                'Press any dot to grow its column!'

  return <PageCanvas dots={dots} intro={intro} />
}

// ─── Shell ─────────────────────────────────────────────────────────────────
const PAGES = [Page1, Page2, Page3]
const TOTAL = PAGES.length

export default function PressHere() {
  const [page, setPage] = useState(0)
  const [key,  setKey]  = useState(0)

  const isFirst = page === 0
  const isLast  = page === TOTAL - 1
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

      <div style={{ display: 'flex', gap: 12, maxWidth: 480, width: '100%' }}>
        <button
          onClick={() => nav(page - 1)} disabled={isFirst}
          style={{ ...btnBase, background: isFirst ? '#e8e8e8' : YELLOW, color: isFirst ? '#aaa' : '#333', cursor: isFirst ? 'default' : 'pointer', boxShadow: isFirst ? 'none' : `0 4px 12px ${YELLOW}55` }}
          onPointerDown={e => { if (!isFirst) e.currentTarget.style.transform = 'scale(0.95)' }}
          onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
        >←</button>
        <button
          onClick={() => nav(0)}
          style={{ ...btnBase, background: BLUE, color: '#fff', boxShadow: `0 4px 12px ${BLUE}55` }}
          onPointerDown={e => { e.currentTarget.style.transform = 'scale(0.95)' }}
          onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
        >↺</button>
        <button
          onClick={() => nav(page + 1)} disabled={isLast}
          style={{ ...btnBase, background: isLast ? '#e8e8e8' : RED, color: isLast ? '#aaa' : '#fff', cursor: isLast ? 'default' : 'pointer', boxShadow: isLast ? 'none' : `0 4px 12px ${RED}55` }}
          onPointerDown={e => { if (!isLast) e.currentTarget.style.transform = 'scale(0.95)' }}
          onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
        >→</button>
      </div>
    </div>
  )
}
