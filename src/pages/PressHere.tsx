import { useState, useRef, useEffect } from 'react'

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
  x: number
  y: number
  onClick: () => void
}

// ─── Dot entrance animation ────────────────────────────────────────────────
function DotMount({ color, x, y, onClick }: { color: string; x: number; y: number; onClick: () => void }) {
  const [active, setActive] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setActive(true))
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <div
      onClick={onClick}
      style={{
        ...dotStyle(color),
        left: `${x}%`, top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${active ? 1 : 0.1})`,
        opacity: active ? 1 : 0,
        transition: active
          ? 'opacity 0.22s ease, transform 0.22s cubic-bezier(0.34,1.5,0.64,1), background 0.25s ease'
          : 'none',
      }}
    />
  )
}

// ─── Shared canvas ─────────────────────────────────────────────────────────
function PageCanvas({ dots, intro }: { dots: DotSpec[]; intro: string }) {
  return (
    <>
      <div style={canvasStyle}>
        {dots.map(spec => (
          <DotMount key={spec.id} color={spec.color} x={spec.x} y={spec.y} onClick={spec.onClick} />
        ))}
      </div>
      <IntroText>{intro}</IntroText>
    </>
  )
}

// ─── Page 1 ────────────────────────────────────────────────────────────────
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

  const dots: DotSpec[] = COL_COLORS.flatMap((color, ci) =>
    Array.from({ length: counts[ci] }, (_, row) => ({
      id: `p3-${ci}-${row}`,
      color,
      x: COL_X[ci],
      y: ROW_Y[row],
      onClick: () => pressCol(ci),
    }))
  )

  const total = counts.reduce((a, b) => a + b, 0)
  const intro =
    counts.every(c => c === 5) ? 'A 5×3 rainbow matrix! 🌈'
    : total > 6                ? 'Almost there — keep pressing!'
    :                            'Press any dot to grow its column!'

  return <PageCanvas dots={dots} intro={intro} />
}

// ─── Page 4 ────────────────────────────────────────────────────────────────
type PhysDot = { id: string; color: string; x: number; y: number; vx: number; vy: number }

const RX = (DOT_SIZE / 2 / 480) * 100  // dot radius as % of canvas width
const RY = (DOT_SIZE / 2 / 520) * 100  // dot radius as % of canvas height
const GRAVITY  = 0       // no gravity — dots scatter and rest at all heights
const DAMPING  = 0.96    // friction brings them to rest
const BOUNCE   = 0.82

function initPhysDots(): PhysDot[] {
  return [RED, YELLOW, BLUE].flatMap((color, ci) =>
    Array.from({ length: 5 }, (_, row) => ({
      id: `p4-${ci}-${row}`,
      color,
      x: COL_X[ci],
      y: ROW_Y[row],
      vx: 0,
      vy: 0,
    }))
  )
}

function Page4() {
  const dotsRef  = useRef<PhysDot[]>(initPhysDots())
  const rafRef   = useRef<number | null>(null)
  const running  = useRef(false)
  const [, tick] = useState(0)
  const [clicks, setClicks] = useState(0)

  function applyShake(strength: number) {
    dotsRef.current = dotsRef.current.map(dot => ({
      ...dot,
      vx: dot.vx + (Math.random() - 0.5) * strength,
      vy: dot.vy + (Math.random() - 0.5) * strength,
    }))
  }

  function startLoop() {
    if (running.current) return
    running.current = true

    const step = () => {
      let anyMoving = false
      dotsRef.current = dotsRef.current.map(({ x, y, vx, vy, ...rest }) => {
        vy += GRAVITY
        x += vx; y += vy
        if (x < RX)        { x = RX;        vx =  Math.abs(vx) * BOUNCE }
        if (x > 100 - RX)  { x = 100 - RX;  vx = -Math.abs(vx) * BOUNCE }
        if (y < RY)        { y = RY;        vy =  Math.abs(vy) * BOUNCE }
        if (y > 100 - RY)  { y = 100 - RY;  vy = -Math.abs(vy) * BOUNCE }
        vx *= DAMPING; vy *= DAMPING
        if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) anyMoving = true
        return { ...rest, x, y, vx, vy }
      })
      tick(n => n + 1)
      if (anyMoving) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        running.current = false
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }

  function handleClick() {
    setClicks(c => c + 1)
    const strength = Math.min(8 + clicks * 2.5, 28)
    applyShake(strength)
    startLoop()
  }

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  const intro =
    clicks === 0 ? 'Tap anywhere to shake!'
    : clicks < 3 ? 'Again! Shake harder! 💥'
    : clicks < 6 ? 'Keep going! 🌀'
    :              'What a mess! 🎉'

  return (
    <>
      <div
        onClick={handleClick}
        style={{ ...canvasStyle, cursor: 'pointer', userSelect: 'none' }}
      >
        {dotsRef.current.map(dot => (
          <div
            key={dot.id}
            style={{
              ...dotStyle(dot.color),
              left: `${dot.x}%`, top: `${dot.y}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'none',
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>
      <IntroText>{intro}</IntroText>
    </>
  )
}

// ─── Pages 5 & 6 — tilt ────────────────────────────────────────────────────
// Scattered starting positions that mimic end state of Page 4
const SCATTERED: { x: number; y: number }[] = [
  // red
  { x: 72, y: 12 }, { x: 18, y: 45 }, { x: 55, y: 72 }, { x: 82, y: 52 }, { x: 35, y: 85 },
  // yellow
  { x: 48, y: 22 }, { x: 85, y: 35 }, { x: 22, y: 65 }, { x: 65, y: 80 }, { x: 12, y: 28 },
  // blue
  { x: 62, y: 10 }, { x: 28, y: 50 }, { x: 78, y: 30 }, { x: 42, y: 90 }, { x: 90, y: 68 },
]

function initTiltDots(): PhysDot[] {
  return [RED, YELLOW, BLUE].flatMap((color, ci) =>
    Array.from({ length: 5 }, (_, i) => ({
      id: `tilt-${ci}-${i}`,
      color,
      x: SCATTERED[ci * 5 + i].x,
      y: SCATTERED[ci * 5 + i].y,
      vx: 0,
      vy: 0,
    }))
  )
}

function TiltPage({ direction }: { direction: 'left' | 'right' }) {
  const dotsRef  = useRef<PhysDot[]>(initTiltDots())
  const rafRef   = useRef<number | null>(null)
  const running  = useRef(false)
  const gravRef  = useRef(0)   // sideways gravity strength, grows with taps
  const [, tick] = useState(0)
  const [taps,   setTaps] = useState(0)

  const sign = direction === 'left' ? -1 : 1

  function handleTap() {
    setTaps(t => {
      const next = t + 1
      gravRef.current = Math.min(0.08 + next * 0.07, 0.45)
      return next
    })
    if (!running.current) startLoop()
  }

  function startLoop() {
    running.current = true
    const step = () => {
      const gx = sign * gravRef.current
      let anyMoving = false
      dotsRef.current = dotsRef.current.map(({ x, y, vx, vy, ...rest }) => {
        vx += gx
        x += vx; y += vy
        if (x < RX)       { x = RX;       vx =  Math.abs(vx) * BOUNCE }
        if (x > 100 - RX) { x = 100 - RX; vx = -Math.abs(vx) * BOUNCE }
        if (y < RY)       { y = RY;       vy =  Math.abs(vy) * BOUNCE }
        if (y > 100 - RY) { y = 100 - RY; vy = -Math.abs(vy) * BOUNCE }
        vx *= DAMPING; vy *= DAMPING
        if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) anyMoving = true
        return { ...rest, x, y, vx, vy }
      })
      tick(n => n + 1)
      if (anyMoving) { rafRef.current = requestAnimationFrame(step) }
      else { running.current = false }
    }
    rafRef.current = requestAnimationFrame(step)
  }

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  const side  = direction === 'left' ? 'left' : 'right'
  const arrow = direction === 'left' ? '←' : '→'
  const intro =
    taps === 0 ? `Tap to tilt ${side}!`
    : taps < 3 ? 'Again! Tilt more! 📐'
    :            `They\'re all sliding! 🎪`

  return (
    <>
      <div onClick={handleTap} style={{ ...canvasStyle, cursor: 'pointer', userSelect: 'none' }}>
        {dotsRef.current.map(dot => (
          <div key={dot.id} style={{
            ...dotStyle(dot.color),
            left: `${dot.x}%`, top: `${dot.y}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'none',
            pointerEvents: 'none',
          }} />
        ))}
        <span style={{
          position: 'absolute', [side]: 14, top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 30, opacity: Math.min(0.15 + taps * 0.08, 0.5),
          pointerEvents: 'none', userSelect: 'none',
        }}>
          {arrow}
        </span>
      </div>
      <IntroText>{intro}</IntroText>
    </>
  )
}

function Page5() { return <TiltPage direction="left" /> }
function Page6() { return <TiltPage direction="right" /> }

// ─── Page 7 — lineup ───────────────────────────────────────────────────────
// 15 dots in r,y,b pattern, scattered → animate to a horizontal row
const COLOR_ROW = Array.from({ length: 15 }, (_, i) => [RED, YELLOW, BLUE][i % 3])
const DOT_SM    = 42   // smaller dot for the wide row
const ROW_CENTER_Y = 50   // vertical center (%)
const ROW_X     = Array.from({ length: 15 }, (_, i) => (i + 0.5) / 15 * 100)

const SCATTERED_6 = [
  {x:72,y:25},{x:45,y:15},{x:20,y:42},
  {x:88,y:62},{x:15,y:72},{x:55,y:82},
  {x:30,y:55},{x:70,y:78},{x:10,y:22},
  {x:50,y:45},{x:85,y:32},{x:40,y:90},
  {x:25,y:10},{x:60,y:62},{x:80,y:50},
]

const wideCanvas: React.CSSProperties = {
  width: '100%', height: 200,
  background: '#fff', borderRadius: 24,
  border: '3px solid #f0e8d8',
  position: 'relative', overflow: 'hidden', flexShrink: 0,
}

function Page7() {
  const [lined, setLined] = useState(false)
  return (
    <>
      <div style={{ flex: 1, width: '100%', maxWidth: 680, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div onClick={() => setLined(true)} style={{ ...wideCanvas, cursor: lined ? 'default' : 'pointer' }}>
          {COLOR_ROW.map((color, i) => {
            const pos = lined ? { x: ROW_X[i], y: ROW_CENTER_Y } : SCATTERED_6[i]
            return (
              <div key={i} style={{
                position: 'absolute',
                left: `${pos.x}%`, top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                width: DOT_SM, height: DOT_SM, borderRadius: '50%',
                background: color,
                transition: lined
                  ? `left ${0.45 + i * 0.035}s cubic-bezier(0.34,1.1,0.64,1), top ${0.45 + i * 0.035}s cubic-bezier(0.34,1.1,0.64,1)`
                  : 'none',
                pointerEvents: 'none',
              }} />
            )
          })}
        </div>
      </div>
      <IntroText>{lined ? 'All lined up! 🎉' : 'Tap anywhere to line them up!'}</IntroText>
    </>
  )
}

// ─── Page 8 — lights out ───────────────────────────────────────────────────
function Page8() {
  const [dark, setDark] = useState(false)
  return (
    <>
      <div style={{ flex: 1, width: '100%', maxWidth: 680, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          ...wideCanvas,
          background: dark ? '#111' : '#fff',
          border: `3px solid ${dark ? '#333' : '#f0e8d8'}`,
          transition: 'background 1.3s ease, border-color 1.3s ease',
        }}>
          {COLOR_ROW.map((color, i) => {
            const isYellow = color === YELLOW
            const dimmed = dark && !isYellow
            return (
              <div
                key={i}
                onClick={isYellow && !dark ? () => setDark(true) : undefined}
                style={{
                  position: 'absolute',
                  left: `${ROW_X[i]}%`, top: `${ROW_CENTER_Y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: DOT_SM, height: DOT_SM, borderRadius: '50%',
                  background: color,
                  cursor: isYellow && !dark ? 'pointer' : 'default',
                  opacity: dimmed ? 0.05 : 1,
                  transition: 'opacity 1.3s ease',
                }}
              />
            )
          })}
        </div>
      </div>
      <IntroText>{dark ? 'You turned off the lights! 🌙' : 'Press a yellow dot to turn off the light!'}</IntroText>
    </>
  )
}

// ─── Shared style helpers ───────────────────────────────────────────────────
const canvasStyle: React.CSSProperties = {
  flex: 1, width: '100%', maxWidth: 480, maxHeight: 520,
  background: '#fff', borderRadius: 24,
  border: '3px solid #f0e8d8',
  position: 'relative', overflow: 'hidden',
}

const dotStyle = (color: string): React.CSSProperties => ({
  position: 'absolute',
  width: DOT_SIZE, height: DOT_SIZE,
  borderRadius: '50%',
  background: color,
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
})

function IntroText({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      marginTop: 20, marginBottom: 20,
      fontSize: 'clamp(16px, 4vw, 22px)',
      color: '#444', textAlign: 'center', maxWidth: 480,
      lineHeight: 1.4, minHeight: '2.8em',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'inherit',
    }}>
      {children}
    </div>
  )
}

// ─── Shell ─────────────────────────────────────────────────────────────────
const PAGES = [Page1, Page2, Page3, Page4, Page5, Page6, Page7, Page8]
// Page1=1dot→3, Page2=colors, Page3=grow cols, Page4=shake, Page5=tilt left, Page6=tilt right, Page7=lineup, Page8=lights-out
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
          style={{ ...btnBase, background: isFirst ? '#e8e8e8' : YELLOW, color: isFirst ? '#aaa' : '#333', cursor: isFirst ? 'default' : 'pointer' }}
          onPointerDown={e => { if (!isFirst) e.currentTarget.style.transform = 'scale(0.95)' }}
          onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
        >←</button>
        <button
          onClick={() => nav(0)}
          style={{ ...btnBase, background: BLUE, color: '#fff' }}
          onPointerDown={e => { e.currentTarget.style.transform = 'scale(0.95)' }}
          onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
        >↺</button>
        <button
          onClick={() => nav(page + 1)} disabled={isLast}
          style={{ ...btnBase, background: isLast ? '#e8e8e8' : RED, color: isLast ? '#aaa' : '#fff', cursor: isLast ? 'default' : 'pointer' }}
          onPointerDown={e => { if (!isLast) e.currentTarget.style.transform = 'scale(0.95)' }}
          onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
        >→</button>
      </div>
    </div>
  )
}
