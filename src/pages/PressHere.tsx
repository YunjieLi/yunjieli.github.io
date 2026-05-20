import { useState, useRef, useEffect, useLayoutEffect, createContext, useContext } from 'react'
import '@fontsource-variable/nunito'
import { ChevronRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

const YELLOW = '#FDD302'
const RED    = '#F63664'
const BLUE   = '#5CCBF8'
const DOT_SIZE = 80

// Fixed horizontal positions for color baskets — same across all collection pages
const BASKET_LEFT: Record<string, string> = { [YELLOW]: '50%', [BLUE]: '25%', [RED]: '75%' }

const COL_X = [25, 50, 75]
const ROW_Y = [84, 67, 50, 33, 16]

// ─── Physics ────────────────────────────────────────────────────────────────
type PhysDot = { id: string; color: string; x: number; y: number; vx: number; vy: number; friction: number }

// RX/RY based on 960 wide canvas at min-width
const RX = (DOT_SIZE / 2 / 960) * 100   // ≈ 4.17 %
const RY = (DOT_SIZE / 2 / 520) * 100   // ≈ 7.69 %
const BASE_DAMPING = 0.96
const BOUNCE = 0.82

// ─── Dot positions ───────────────────────────────────────────────────────────
type DotSpec = { id: string; color: string; x: number; y: number; onClick: () => void; interactive?: boolean }

const SCATTERED: { x: number; y: number }[] = [
  { x: 72, y: 12 }, { x: 18, y: 45 }, { x: 55, y: 72 }, { x: 82, y: 52 }, { x: 35, y: 85 },
  { x: 48, y: 22 }, { x: 85, y: 35 }, { x: 22, y: 65 }, { x: 65, y: 80 }, { x: 12, y: 28 },
  { x: 62, y: 10 }, { x: 28, y: 50 }, { x: 78, y: 30 }, { x: 42, y: 90 }, { x: 90, y: 68 },
]

const PILE_Y = [12, 45, 72, 52, 85, 22, 35, 65, 80, 28, 10, 50, 30, 90, 68]
const PILED_LEFT:  { x: number; y: number }[] = PILE_Y.map(y => ({ x: RX,       y }))
const PILED_RIGHT: { x: number; y: number }[] = PILE_Y.map(y => ({ x: 100 - RX, y }))

// ─── Contexts ────────────────────────────────────────────────────────────────
const CaptionCtx    = createContext<(n: React.ReactNode) => void>(() => {})
const DoneCtx       = createContext<(done: boolean) => void>(() => {})
const PageActiveCtx = createContext<boolean>(true)

type Handoff = {
  page4Dots: { x: number; y: number }[] | null
  page5Dots: { x: number; y: number }[] | null
  page6Dots: { x: number; y: number }[] | null
}
const HandoffCtx = createContext<React.MutableRefObject<Handoff>>(
  { current: { page4Dots: null, page5Dots: null, page6Dots: null } }
)

// ─── Context consumers ────────────────────────────────────────────────────────
function IntroText({ children }: { children: React.ReactNode }) {
  const active     = useContext(PageActiveCtx)
  const setCaption = useContext(CaptionCtx)
  useLayoutEffect(() => { if (active) setCaption(children) })
  return null
}

function SetDone({ done }: { done: boolean }) {
  const active  = useContext(PageActiveCtx)
  const setDone = useContext(DoneCtx)
  useLayoutEffect(() => { if (active) setDone(done) })
  return null
}

// ─── Dot component (no entrance animation) ───────────────────────────────────
function DotMount({ color, x, y, onClick, interactive = true }: {
  color: string; x: number; y: number; onClick: () => void; interactive?: boolean
}) {
  return (
    <div
      onClick={onClick}
      style={{ ...dotStyle(color, interactive), left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}
    />
  )
}

// ─── Shared canvas ────────────────────────────────────────────────────────────
function PageCanvas({ dots, intro, done }: { dots: DotSpec[]; intro: string; done: boolean }) {
  return (
    <>
      <div style={canvasStyle}>
        {dots.map(s => (
          <DotMount key={s.id} color={s.color} x={s.x} y={s.y} onClick={s.onClick} interactive={s.interactive ?? true} />
        ))}
      </div>
      <IntroText>{intro}</IntroText>
      <SetDone done={done} />
    </>
  )
}

// ─── Page 1 ──────────────────────────────────────────────────────────────────
function Page1() {
  const [count, setCount] = useState(1)
  const done = count === 3
  const bump = () => setCount(c => Math.min(c + 1, 3))
  const dots: DotSpec[] = Array.from({ length: count }, (_, i) => ({
    id: `p1-${i}`, color: YELLOW, x: COL_X[i], y: ROW_Y[0], onClick: bump, interactive: !done,
  }))
  const intro = count === 1 ? 'Press the dot!' : count === 2 ? 'Now press one of them!' : 'Three yellow dots! 🌟'
  return <PageCanvas dots={dots} intro={intro} done={done} />
}

// ─── Page 2 — change colors ───────────────────────────────────────────────────
function Page2() {
  const [leftColor,  setLeftColor]  = useState(YELLOW)
  const [rightColor, setRightColor] = useState(YELLOW)
  const leftChanged  = leftColor  !== YELLOW
  const rightChanged = rightColor !== YELLOW
  const done = leftChanged && rightChanged

  const intro = done
    ? 'Red, yellow, blue! 🌈'
    : leftChanged
    ? 'Now press the right dot!'
    : rightChanged
    ? 'Now press the left dot!'
    : 'Press the outer dots to change their colors!'

  const dots: DotSpec[] = [
    { id: 'l', color: leftColor,  x: COL_X[0], y: ROW_Y[0], onClick: () => { if (!leftChanged)  setLeftColor(RED)  }, interactive: !leftChanged },
    { id: 'm', color: YELLOW,     x: COL_X[1], y: ROW_Y[0], onClick: () => {}, interactive: false },
    { id: 'r', color: rightColor, x: COL_X[2], y: ROW_Y[0], onClick: () => { if (!rightChanged) setRightColor(BLUE) }, interactive: !rightChanged },
  ]
  return <PageCanvas dots={dots} intro={intro} done={done} />
}

// ─── Page 3 — grow columns ────────────────────────────────────────────────────
function Page3() {
  const [leftCount,  setLeftCount]  = useState(1)
  const [midCount,   setMidCount]   = useState(1)
  const [rightCount, setRightCount] = useState(1)
  const done = leftCount === 5 && midCount === 5 && rightCount === 5

  const intro = done
    ? 'Red, yellow, blue — all full! 🌈'
    : 'Keep pressing each column to grow it!'

  return (
    <>
      <div style={canvasStyle}>
        {Array.from({ length: leftCount }, (_, row) => (
          <DotMount key={`l${row}`} color={RED}    x={COL_X[0]} y={ROW_Y[row]} onClick={() => setLeftCount(c => Math.min(c + 1, 5))}  interactive={leftCount  < 5} />
        ))}
        {Array.from({ length: midCount }, (_, row) => (
          <DotMount key={`m${row}`} color={YELLOW} x={COL_X[1]} y={ROW_Y[row]} onClick={() => setMidCount(c => Math.min(c + 1, 5))}   interactive={midCount   < 5} />
        ))}
        {Array.from({ length: rightCount }, (_, row) => (
          <DotMount key={`r${row}`} color={BLUE}   x={COL_X[2]} y={ROW_Y[row]} onClick={() => setRightCount(c => Math.min(c + 1, 5))} interactive={rightCount < 5} />
        ))}
      </div>
      <IntroText>{intro}</IntroText>
      <SetDone done={done} />
    </>
  )
}

// ─── Dot-dot collision resolution (elastic, equal mass) ─────────────────────
function resolveCollisions(dots: PhysDot[], cw: number, ch: number): PhysDot[] {
  const result = dots.map(d => ({ ...d }))
  const n = result.length
  const minDist = DOT_SIZE  // collision when centers are closer than 1 diameter

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = (result[i].x - result[j].x) * cw / 100  // px
      const dy = (result[i].y - result[j].y) * ch / 100  // px
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist >= minDist || dist < 0.001) continue

      // Unit normal pointing from j → i
      const nx = dx / dist
      const ny = dy / dist

      // Velocities in px/frame
      const v1x = result[i].vx * cw / 100,  v1y = result[i].vy * ch / 100
      const v2x = result[j].vx * cw / 100,  v2y = result[j].vy * ch / 100

      // Scalar normal components
      const v1n = v1x * nx + v1y * ny
      const v2n = v2x * nx + v2y * ny

      if (v1n - v2n > 0) continue  // already separating

      // Elastic equal-mass collision: swap normal components
      result[i].vx = (v1x - v1n * nx + v2n * nx) / cw * 100
      result[i].vy = (v1y - v1n * ny + v2n * ny) / ch * 100
      result[j].vx = (v2x - v2n * nx + v1n * nx) / cw * 100
      result[j].vy = (v2y - v2n * ny + v1n * ny) / ch * 100

      // Push apart so they no longer overlap
      const push = (minDist - dist) / 2
      result[i].x += nx * push / cw * 100
      result[i].y += ny * push / ch * 100
      result[j].x -= nx * push / cw * 100
      result[j].y -= ny * push / ch * 100
    }
  }
  return result
}

// ─── Page 4 ──────────────────────────────────────────────────────────────────
function initPhysDots(): PhysDot[] {
  return [RED, YELLOW, BLUE].flatMap((color, ci) =>
    Array.from({ length: 5 }, (_, row) => ({
      id: `p4-${ci}-${row}`, color, x: COL_X[ci], y: ROW_Y[row], vx: 0, vy: 0, friction: BASE_DAMPING,
    }))
  )
}

function Page4() {
  const dotsRef    = useRef<PhysDot[]>(initPhysDots())
  const rafRef     = useRef<number | null>(null)
  const running    = useRef(false)
  const canvasRef  = useRef<HTMLDivElement>(null)
  const [, tick]   = useState(0)
  const [clicks, setClicks] = useState(0)
  const done    = clicks >= 6
  const handoff = useContext(HandoffCtx)

  function startLoop() {
    if (running.current) return
    running.current = true
    const step = () => {
      let anyMoving = false
      dotsRef.current = dotsRef.current.map(({ x, y, vx, vy, friction, ...rest }) => {
        x += vx; y += vy
        if (x < RX)        { x = RX;        vx =  Math.abs(vx) * BOUNCE }
        if (x > 100 - RX)  { x = 100 - RX;  vx = -Math.abs(vx) * BOUNCE }
        if (y < RY)        { y = RY;        vy =  Math.abs(vy) * BOUNCE }
        if (y > 100 - RY)  { y = 100 - RY;  vy = -Math.abs(vy) * BOUNCE }
        vx *= friction; vy *= friction
        if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) anyMoving = true
        return { ...rest, x, y, vx, vy, friction }
      })
      const cw = canvasRef.current?.offsetWidth  ?? 960
      const ch = canvasRef.current?.offsetHeight ?? 520
      dotsRef.current = resolveCollisions(dotsRef.current, cw, ch)
      handoff.current.page4Dots = dotsRef.current.map(({ x, y }) => ({ x, y }))
      tick(n => n + 1)
      if (anyMoving) { rafRef.current = requestAnimationFrame(step) }
      else { running.current = false }
    }
    rafRef.current = requestAnimationFrame(step)
  }

  function handleClick() {
    const strength = Math.min(8 + clicks * 2.5, 28)
    dotsRef.current = dotsRef.current.map(dot => ({
      ...dot,
      vx: dot.vx + (Math.random() - 0.5) * strength,
      vy: dot.vy + (Math.random() - 0.5) * strength,
    }))
    setClicks(c => c + 1)
    startLoop()
  }

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  const intro = clicks === 0 ? 'Tap anywhere to shake!' : clicks < 3 ? 'Again! Shake harder! 💥' : clicks < 6 ? 'Keep going! 🌀' : 'What a mess! 🎉'

  return (
    <>
      <div ref={canvasRef} onClick={done ? undefined : handleClick} style={{ ...canvasStyle, cursor: done ? 'default' : 'pointer', userSelect: 'none' }}>
        {dotsRef.current.map(dot => (
          <div key={dot.id} style={{ ...dotStyle(dot.color, false), left: `${dot.x}%`, top: `${dot.y}%`, transform: 'translate(-50%,-50%)', transition: 'none', pointerEvents: 'none' }} />
        ))}
      </div>
      <IntroText>{intro}</IntroText>
      <SetDone done={done} />
    </>
  )
}

// ─── Pages 5+6 (merged) — 4-direction gravity ────────────────────────────────
function mkTiltDots(positions: { x: number; y: number }[]): PhysDot[] {
  return [RED, YELLOW, BLUE].flatMap((color, ci) =>
    Array.from({ length: 5 }, (_, i) => ({
      id: `tilt-${ci}-${i}`,
      color,
      x: positions[ci * 5 + i].x,
      y: positions[ci * 5 + i].y,
      vx: 0, vy: 0,
      friction: 0.93 + Math.random() * 0.05,
    }))
  )
}

type GravDir = 'left' | 'right' | 'up' | 'down'

function Page56() {
  const active    = useContext(PageActiveCtx)
  const handoff   = useContext(HandoffCtx)
  const dotsRef   = useRef<PhysDot[]>(mkTiltDots(SCATTERED))
  const rafRef    = useRef<number | null>(null)
  const running   = useRef(false)
  const gravRef   = useRef({ gx: 0, gy: 0 })
  const initedRef = useRef(false)
  const tapsRef   = useRef(0)
  const [, tick]  = useState(0)
  const [taps, setTaps] = useState(0)
  const done = taps >= 2

  useEffect(() => {
    if (!active || initedRef.current) return
    const src = handoff.current.page4Dots
    if (src && src.length === 15) {
      initedRef.current = true
      dotsRef.current = mkTiltDots(src)
      tick(n => n + 1)
    }
  }, [active])   // eslint-disable-line react-hooks/exhaustive-deps

  function applyDir(dir: GravDir) {
    const strength = Math.min(0.08 + tapsRef.current * 0.07, 0.45)
    const g = { left: { gx: -strength, gy: 0 }, right: { gx: strength, gy: 0 }, up: { gx: 0, gy: -strength }, down: { gx: 0, gy: strength } }
    gravRef.current = g[dir]
    dotsRef.current = dotsRef.current.map(dot => ({
      ...dot,
      vx: dot.vx + (Math.random() - 0.5) * 3.5,
      vy: dot.vy + (Math.random() - 0.5) * 3.5,
    }))
    tapsRef.current += 1
    setTaps(t => t + 1)
    if (!running.current) startLoop()
  }

  function startLoop() {
    running.current = true
    const step = () => {
      const { gx, gy } = gravRef.current
      let anyMoving = false
      dotsRef.current = dotsRef.current.map(({ x, y, vx, vy, friction, ...rest }) => {
        vx += gx; vy += gy
        x += vx; y += vy
        if (x < RX)       { x = RX;       vx =  Math.abs(vx) * BOUNCE }
        if (x > 100 - RX) { x = 100 - RX; vx = -Math.abs(vx) * BOUNCE }
        if (y < RY)       { y = RY;       vy =  Math.abs(vy) * BOUNCE }
        if (y > 100 - RY) { y = 100 - RY; vy = -Math.abs(vy) * BOUNCE }
        vx *= friction; vy *= friction
        if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) anyMoving = true
        return { ...rest, x, y, vx, vy, friction }
      })
      handoff.current.page6Dots = dotsRef.current.map(({ x, y }) => ({ x, y }))
      tick(n => n + 1)
      if (anyMoving) { rafRef.current = requestAnimationFrame(step) }
      else { running.current = false }
    }
    rafRef.current = requestAnimationFrame(step)
  }

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, GravDir> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }
      const dir = map[e.key]
      if (!dir) return
      e.preventDefault()
      applyDir(dir)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])   // eslint-disable-line react-hooks/exhaustive-deps

  const intro = taps === 0 ? 'Click an arrow to apply gravity!' : taps < 2 ? 'Try another direction! 🎯' : 'Gravity explorer! 🧲'

  const arrowBtn = (dir: GravDir, label: string, style: React.CSSProperties) => (
    <div
      onClick={() => applyDir(dir)}
      style={{
        position: 'absolute', ...style,
        width: 44, height: 44, borderRadius: '50%',
        background: 'rgba(0,0,0,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, cursor: 'pointer', userSelect: 'none',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.15)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.07)')}
    >{label}</div>
  )

  return (
    <>
      <div style={{ ...canvasStyle, userSelect: 'none' }}>
        {dotsRef.current.map(dot => (
          <div key={dot.id} style={{ ...dotStyle(dot.color, false), left: `${dot.x}%`, top: `${dot.y}%`, transform: 'translate(-50%,-50%)', transition: 'none', pointerEvents: 'none' }} />
        ))}
        {arrowBtn('left',  '←', { left: 10,       top: '50%',  transform: 'translateY(-50%)' })}
        {arrowBtn('right', '→', { right: 10,      top: '50%',  transform: 'translateY(-50%)' })}
        {arrowBtn('up',    '↑', { top: 10,        left: '50%', transform: 'translateX(-50%)' })}
        {arrowBtn('down',  '↓', { bottom: 10,     left: '50%', transform: 'translateX(-50%)' })}
      </div>
      <IntroText>{intro}</IntroText>
      <SetDone done={done} />
    </>
  )
}

// ─── Page 7 — lineup ──────────────────────────────────────────────────────────
const COLOR_ROW  = Array.from({ length: 15 }, (_, i) => [RED, YELLOW, BLUE][i % 3])
const ROW_MARGIN    = (DOT_SIZE / 2 / 960) * 100
const LINEUP_MARGIN = 8   // % horizontal padding for pages 7 & 8

// Two-row lineup: 8 dots on top, 7 on bottom
const LINEUP_TOP_N = 8
const LINEUP_BOT_N = COLOR_ROW.length - LINEUP_TOP_N  // 7
const LINEUP_Y     = [37, 63]
const LINEUP_TOP_X = Array.from({ length: LINEUP_TOP_N }, (_, i) => LINEUP_MARGIN + i * ((100 - 2 * LINEUP_MARGIN) / (LINEUP_TOP_N - 1)))
const LINEUP_BOT_X = Array.from({ length: LINEUP_BOT_N }, (_, i) => LINEUP_MARGIN + i * ((100 - 2 * LINEUP_MARGIN) / (LINEUP_BOT_N - 1)))
function lineupPos(i: number): { x: number; y: number } {
  return i < LINEUP_TOP_N
    ? { x: LINEUP_TOP_X[i],               y: LINEUP_Y[0] }
    : { x: LINEUP_BOT_X[i - LINEUP_TOP_N], y: LINEUP_Y[1] }
}

// ─── Four lineup shapes for Page 7 ───────────────────────────────────────────
const SHAPE_NAMES = ['2 lines', '3 lines', 'circle', 'arch'] as const
const TOTAL_SHAPES = SHAPE_NAMES.length

function shapePos(shape: number, i: number, cw: number, ch: number): { x: number; y: number } {
  switch (shape) {
    case 0:
      // 2 lines: 8 top, 7 bottom
      return lineupPos(i)
    case 1: {
      // 3 lines: 5+5+5, tight within-line (10% ≈ 96px gap) vs large between-line (32%)
      const row = Math.floor(i / 5), col = i % 5
      return { x: 30 + col * 10, y: [18, 50, 82][row] }
    }
    case 2: {
      // Real circle: R=250px, chord≈104px gives ~24px gap between dots
      const R = 250
      const θ = (2 * Math.PI * i / 15) - Math.PI / 2
      return { x: 50 + (R / cw * 100) * Math.cos(θ), y: 50 + (R / ch * 100) * Math.sin(θ) }
    }
    case 3: {
      // Real half-circle arch: R=420px, chord≈94px gives ~14px gap; cy=50+ry/2 centers vertically
      const R = 420
      const ry = R / ch * 100
      const cy = 50 + ry / 2   // midpoint of (cy-ry .. cy) sits at 50%
      const θ = Math.PI + (i / 14) * Math.PI   // π → 2π sweeps through top
      return { x: 50 + (R / cw * 100) * Math.cos(θ), y: cy + ry * Math.sin(θ) }
    }
    default:
      return lineupPos(i)
  }
}

function Page7() {
  const active    = useContext(PageActiveCtx)
  const handoff   = useContext(HandoffCtx)
  const [shapeIdx, setShapeIdx] = useState(-1)  // -1 = not yet clicked
  const [, tick]  = useState(0)
  const [dims, setDims] = useState({ cw: 960, ch: 640 })
  const startRef  = useRef<{ x: number; y: number }[]>(PILED_RIGHT)
  const initedRef = useRef(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const done = shapeIdx === TOTAL_SHAPES - 1

  useLayoutEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const { width: cw, height: ch } = entries[0].contentRect
      if (cw > 0 && ch > 0) setDims({ cw, ch })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!active || initedRef.current) return
    initedRef.current = true
    const src = handoff.current.page6Dots
    if (src && src.length === 15) { startRef.current = src; tick(n => n + 1) }
  }, [active])   // eslint-disable-line react-hooks/exhaustive-deps

  function handleClick() {
    if (done) return
    setShapeIdx(s => s + 1)
  }

  const intro = shapeIdx < 0
    ? 'Tap to line them up!'
    : shapeIdx < TOTAL_SHAPES - 1
    ? `${SHAPE_NAMES[shapeIdx]}! Tap for next shape →`
    : `${SHAPE_NAMES[shapeIdx]}! All shapes done! 🎨`

  return (
    <>
      <div ref={canvasRef} onClick={handleClick} style={{ ...canvasStyle, cursor: done ? 'default' : 'pointer' }}>
        {COLOR_ROW.map((color, i) => {
          const pos = shapeIdx < 0
            ? (startRef.current[i] ?? PILED_RIGHT[i])
            : shapePos(shapeIdx, i, dims.cw, dims.ch)
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${pos.x}%`, top: `${pos.y}%`,
              transform: 'translate(-50%,-50%)',
              width: DOT_SIZE, height: DOT_SIZE, borderRadius: '50%',
              background: color,
              transition: shapeIdx >= 0
                ? `left ${0.45 + i * 0.035}s cubic-bezier(0.34,1.1,0.64,1), top ${0.45 + i * 0.035}s cubic-bezier(0.34,1.1,0.64,1)`
                : 'none',
              pointerEvents: 'none',
            }} />
          )
        })}
      </div>
      <IntroText>{intro}</IntroText>
      <SetDone done={done} />
    </>
  )
}

// ─── Page 8 — lights out ──────────────────────────────────────────────────────
function Page8() {
  const [dark, setDark]           = useState(false)
  const [toggleCount, setToggleCount] = useState(0)
  const done8 = toggleCount >= 2   // off once + back on once
  const canvasRef = useRef<HTMLDivElement>(null)
  const dimsRef   = useRef({ cw: 960, ch: 640 })
  // Persistent dot positions (% coords); driven by RAF during swap
  const posRef   = useRef(COLOR_ROW.map((_, i) => shapePos(3, i, 960, 640)))
  const animRef  = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const swapping = useRef(false)
  const [, tick] = useState(0)

  useLayoutEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const { width: cw, height: ch } = entries[0].contentRect
      if (cw > 0 && ch > 0) {
        dimsRef.current = { cw, ch }
        posRef.current = COLOR_ROW.map((_, i) => shapePos(3, i, cw, ch))
        tick(n => n + 1)
      }
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  function doSwap() {
    if (swapping.current) return
    swapping.current = true

    const reds  = COLOR_ROW.flatMap((c, i) => c === RED  ? [i] : [])
    const blues = COLOR_ROW.flatMap((c, i) => c === BLUE ? [i] : [])
    const ri = reds[Math.floor(Math.random() * reds.length)]
    const bi = blues[Math.floor(Math.random() * blues.length)]

    const p0 = { ...posRef.current[ri] }   // red start → will move to p1
    const p1 = { ...posRef.current[bi] }   // blue start → will move to p0

    // Red travels via high route (above both lineup rows at y≈37% and y≈63%)
    // Blue travels via low route (below both rows)
    // This guarantees neither path crosses any static dot
    const wx = () => (Math.random() - 0.5) * 10   // ±5% organic x wobble
    const hiY = 3 + Math.random() * 3              // 3–6% (above arch top at ~8%)
    const loY = 69 + Math.random() * 7             // 69–76% (below arch endpoints at ~65%)

    // Cubic bezier: go up/across/down for red, down/across/up for blue
    const cpR1 = { x: p0.x + wx(), y: hiY }
    const cpR2 = { x: p1.x + wx(), y: hiY }
    const cpB1 = { x: p1.x + wx(), y: loY }
    const cpB2 = { x: p0.x + wx(), y: loY }

    const DURATION = 1100
    const t0 = performance.now()

    function cubic(t: number, a: number, b: number, c: number, d: number) {
      const u = 1 - t
      return u*u*u*a + 3*u*u*t*b + 3*u*t*t*c + t*t*t*d
    }

    function step(now: number) {
      const raw = Math.min((now - t0) / DURATION, 1)
      const t   = raw < 0.5 ? 2 * raw * raw : -1 + (4 - 2 * raw) * raw

      posRef.current = posRef.current.map((pos, i) => {
        if (i === ri) return {
          x: cubic(t, p0.x, cpR1.x, cpR2.x, p1.x),
          y: cubic(t, p0.y, cpR1.y, cpR2.y, p1.y),
        }
        if (i === bi) return {
          x: cubic(t, p1.x, cpB1.x, cpB2.x, p0.x),
          y: cubic(t, p1.y, cpB1.y, cpB2.y, p0.y),
        }
        return pos
      })
      tick(n => n + 1)

      if (raw < 1) { animRef.current = requestAnimationFrame(step) }
      else { swapping.current = false; scheduleSwap() }
    }

    animRef.current = requestAnimationFrame(step)
  }

  function scheduleSwap() {
    const delay = 4000 + Math.random() * 4000   // 4–8 s
    timerRef.current = setTimeout(doSwap, delay)
  }

  useEffect(() => {
    if (!dark) return
    const { cw, ch } = dimsRef.current
    posRef.current = COLOR_ROW.map((_, i) => shapePos(3, i, cw, ch))
    scheduleSwap()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (animRef.current)  cancelAnimationFrame(animRef.current)
      swapping.current = false
    }
  }, [dark])   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div ref={canvasRef} style={{ ...canvasStyle, background: dark ? '#111' : '#fff', border: `3px solid ${dark ? '#333' : '#f0e8d8'}`, transition: 'background 1.3s ease, border-color 1.3s ease' }}>
        {COLOR_ROW.map((color, i) => {
          const isYellow = color === YELLOW
          const dimmed   = dark && !isYellow
          const pos      = posRef.current[i]
          return (
            <div
              key={i}
              onClick={isYellow ? () => { setDark(d => !d); setToggleCount(c => c + 1) } : undefined}
              style={{
                position: 'absolute',
                left: `${pos.x}%`, top: `${pos.y}%`,
                transform: 'translate(-50%,-50%)',
                width: DOT_SIZE, height: DOT_SIZE, borderRadius: '50%',
                background: color,
                cursor: isYellow ? 'pointer' : 'default',
                opacity: dimmed ? 0.10 : 1,
                transition: 'opacity 1.3s ease',
              }}
            />
          )
        })}
      </div>
      <IntroText>{
        dark
          ? 'Lights out! 🌙 Click a yellow dot to turn them back on!'
          : toggleCount === 0
          ? 'Press a yellow dot to turn off the light!'
          : done8
          ? 'Lights are back! ✨'
          : 'Now press a yellow dot to turn the lights back on!'
      }</IntroText>
      <SetDone done={done8} />
    </>
  )
}

// ─── Clap celebration ─────────────────────────────────────────────────────────
function ClapCelebration() {
  useLayoutEffect(() => {
    const s = document.createElement('style')
    s.textContent = '@keyframes clapPop{0%{opacity:0;transform:translateX(-50%) scale(0.3)}25%{opacity:1;transform:translateX(-50%) scale(1.4)}65%{opacity:1;transform:translateX(-50%) scale(1)}100%{opacity:0;transform:translateX(-50%) scale(0.8)}}'
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])
  return (
    <div style={{
      position: 'absolute', left: '50%', bottom: 'calc(5% + 140px)',
      fontSize: 90, lineHeight: 1,
      animation: 'clapPop 1.4s ease forwards',
      pointerEvents: 'none', zIndex: 30,
    }}>👏</div>
  )
}

// ─── Page 9 — collect yellow dots ────────────────────────────────────────────
const YELLOW_IDXS = COLOR_ROW.flatMap((c, i) => c === YELLOW ? [i] : [])
type CollectPhase = 'arch' | 'flying' | 'gone'

function Page9() {
  const canvasRef     = useRef<HTMLDivElement>(null)
  const basketBodyRef = useRef<HTMLDivElement>(null)
  const [dims,   setDims]   = useState({ cw: 960, ch: 640 })
  const [target, setTarget] = useState({ x: 50, y: 90 })
  const [phases, setPhases] = useState<CollectPhase[]>(() => COLOR_ROW.map(() => 'arch'))

  const collected = phases.filter((p, i) => COLOR_ROW[i] === YELLOW && p !== 'arch').length
  const done      = phases.every((p, i) => COLOR_ROW[i] !== YELLOW || p === 'gone')

  useLayoutEffect(() => {
    const canvasEl = canvasRef.current
    const bodyEl   = basketBodyRef.current
    if (!canvasEl || !bodyEl) return
    const update = () => {
      const cr = canvasEl.getBoundingClientRect()
      const br = bodyEl.getBoundingClientRect()
      if (cr.width > 0 && cr.height > 0) {
        setDims({ cw: cr.width, ch: cr.height })
        setTarget({
          x: ((br.left + br.width  / 2) - cr.left) / cr.width  * 100,
          y: ((br.top  + br.height / 2) - cr.top)  / cr.height * 100,
        })
      }
    }
    const obs = new ResizeObserver(update)
    obs.observe(canvasEl)
    return () => obs.disconnect()
  }, [])

  // flying → gone after position animation completes
  useEffect(() => {
    const flyingIdxs = phases.flatMap((p, i) => p === 'flying' ? [i] : [])
    if (flyingIdxs.length === 0) return
    const t = setTimeout(() => {
      setPhases(prev => prev.map((p, i) => flyingIdxs.includes(i) && p === 'flying' ? 'gone' : p))
    }, 550)
    return () => clearTimeout(t)
  }, [phases])

  function collect(i: number) {
    setPhases(prev => prev.map((p, idx) => idx === i && p === 'arch' ? 'flying' : p))
  }

  const intro = done
    ? 'All yellow dots collected! 🎊'
    : collected > 0
    ? `${collected} / ${YELLOW_IDXS.length} in the basket — keep going!`
    : 'Click the yellow dots to collect them into the basket!'

  return (
    <>
      <div ref={canvasRef} style={{ ...canvasStyle }}>
        {COLOR_ROW.map((color, i) => {
          const phase    = phases[i]
          const isYellow = color === YELLOW
          const pos      = shapePos(3, i, dims.cw, dims.ch)
          const atTarget = phase !== 'arch'
          return (
            <div
              key={i}
              onClick={isYellow && phase === 'arch' ? () => collect(i) : undefined}
              style={{
                position: 'absolute',
                left:  `${atTarget ? target.x : pos.x}%`,
                top:   `${atTarget ? target.y : pos.y}%`,
                transform: 'translate(-50%,-50%)',
                width: DOT_SIZE + 40, height: DOT_SIZE + 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: phase === 'gone' ? 0 : 1,
                cursor: isYellow && phase === 'arch' ? 'pointer' : 'default',
                transition: phase === 'arch'
                  ? 'none'
                  : phase === 'flying'
                  ? 'left 0.5s ease-in, top 0.5s ease-in'
                  : 'opacity 0.2s ease',
                zIndex: phase !== 'arch' ? 10 : 1,
                pointerEvents: isYellow && phase === 'arch' ? 'auto' : 'none',
              }}
            >
              <div style={{ width: DOT_SIZE, height: DOT_SIZE, borderRadius: '50%', background: color, pointerEvents: 'none' }} />
            </div>
          )
        })}

        {/* Basket */}
        <div style={{
          position: 'absolute', left: BASKET_LEFT[YELLOW], bottom: '5%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none', zIndex: 0,
        }}>
          <div style={{
            margin: '0 auto', width: 70, height: 28,
            border: `5px solid ${YELLOW}`, borderBottom: 'none',
            borderRadius: '40px 40px 0 0',
          }} />
          <div ref={basketBodyRef} style={{
            width: 110, height: 72,
            border: `5px solid ${YELLOW}`,
            borderRadius: '0 0 18px 18px',
            background: YELLOW + '20',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: YELLOW,
          }}>
            {`${collected}/${YELLOW_IDXS.length}`}
          </div>
        </div>

        {done && <ClapCelebration />}
      </div>
      <IntroText>{intro}</IntroText>
      <SetDone done={done} />
    </>
  )
}

// ─── Brownian catch pages ─────────────────────────────────────────────────────
type BrownDot = { id: string; x: number; y: number; vx: number; vy: number; phase: CollectPhase }

function makeBrownDots(targetColor: string, cw: number, ch: number): BrownDot[] {
  return COLOR_ROW.flatMap((c, i) => {
    if (c !== targetColor) return []
    const pos = shapePos(3, i, cw, ch)
    return [{ id: `brown-${i}`, x: pos.x, y: pos.y, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, phase: 'arch' as CollectPhase }]
  })
}

function stepBrown(dots: BrownDot[], maxSpd: number, cw: number, ch: number): BrownDot[] {
  const rxPct = DOT_SIZE / 2 / cw * 100
  const ryPct = DOT_SIZE / 2 / ch * 100
  return dots.map(dot => {
    if (dot.phase !== 'arch') return dot
    let vx = dot.vx + (Math.random() - 0.5) * 0.12
    let vy = dot.vy + (Math.random() - 0.5) * 0.12
    const spd = Math.sqrt(vx * vx + vy * vy)
    if (spd > maxSpd) { vx = vx / spd * maxSpd; vy = vy / spd * maxSpd }
    let x = dot.x + vx
    let y = dot.y + vy
    if (x < rxPct)       { x = rxPct;       vx =  Math.abs(vx) }
    if (x > 100 - rxPct) { x = 100 - rxPct; vx = -Math.abs(vx) }
    if (y < ryPct)       { y = ryPct;       vy =  Math.abs(vy) }
    if (y > 100 - ryPct) { y = 100 - ryPct; vy = -Math.abs(vy) }
    return { ...dot, x, y, vx, vy }
  })
}

function BrownCatch({ targetColor, maxSpd, prevColors }: {
  targetColor: string; maxSpd: number; prevColors: string[]
}) {
  const active        = useContext(PageActiveCtx)
  const canvasRef     = useRef<HTMLDivElement>(null)
  const basketBodyRef = useRef<HTMLDivElement>(null)
  const dotsRef       = useRef<BrownDot[]>([])
  const rafRef        = useRef<number | null>(null)
  const dimsRef       = useRef({ cw: 960, ch: 640 })
  const [, tick]      = useState(0)
  const [phases, setPhases]       = useState<CollectPhase[]>([])
  const [targetPct, setTargetPct] = useState({ x: 50, y: 90 })

  const allColors    = [...prevColors, targetColor]
  const totalPerColor = (c: string) => COLOR_ROW.filter(r => r === c).length
  const targetTotal  = totalPerColor(targetColor)
  const collected    = phases.filter(p => p !== 'arch').length
  const done         = phases.length > 0 && phases.every(p => p === 'gone')

  useLayoutEffect(() => {
    const canvasEl = canvasRef.current
    const bodyEl   = basketBodyRef.current
    if (!canvasEl || !bodyEl) return
    const update = () => {
      const cr = canvasEl.getBoundingClientRect()
      const br = bodyEl.getBoundingClientRect()
      if (cr.width > 0 && cr.height > 0) {
        const { width: cw, height: ch } = cr
        dimsRef.current = { cw, ch }
        setTargetPct({
          x: ((br.left + br.width  / 2) - cr.left) / cw * 100,
          y: ((br.top  + br.height / 2) - cr.top)  / ch * 100,
        })
        if (dotsRef.current.length === 0) {
          const newDots = makeBrownDots(targetColor, cw, ch)
          dotsRef.current = newDots
          setPhases(newDots.map(() => 'arch'))
        }
      }
    }
    const obs = new ResizeObserver(update)
    obs.observe(canvasEl)
    return () => obs.disconnect()
  }, [targetColor])   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!active) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      return
    }
    let alive = true
    const step = () => {
      if (!alive) return
      dotsRef.current = stepBrown(dotsRef.current, maxSpd, dimsRef.current.cw, dimsRef.current.ch)
      tick(n => n + 1)
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      alive = false
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    }
  }, [active, maxSpd])

  useEffect(() => {
    const flyingIdxs = phases.flatMap((p, i) => p === 'flying' ? [i] : [])
    if (flyingIdxs.length === 0) return
    const t = setTimeout(() => {
      dotsRef.current = dotsRef.current.map((d, i) =>
        flyingIdxs.includes(i) ? { ...d, phase: 'gone' } : d
      )
      setPhases(prev => prev.map((p, i) => flyingIdxs.includes(i) && p === 'flying' ? 'gone' : p))
    }, 550)
    return () => clearTimeout(t)
  }, [phases])

  function collect(dotIdx: number) {
    dotsRef.current = dotsRef.current.map((d, i) =>
      i === dotIdx && d.phase === 'arch' ? { ...d, phase: 'flying' } : d
    )
    setPhases(prev => prev.map((p, i) => i === dotIdx && p === 'arch' ? 'flying' : p))
  }

  const colorName = targetColor === BLUE ? 'blue' : 'red'
  const intro = done
    ? `All ${colorName} dots collected! 🎊`
    : collected > 0
    ? `${collected} / ${targetTotal} caught — keep going!`
    : 'Click the moving dots to collect them!'

  return (
    <>
      <div ref={canvasRef} style={{ ...canvasStyle }}>
        {dotsRef.current.map((dot, i) => {
          const phase    = phases[i] ?? 'arch'
          const atTarget = phase !== 'arch'
          return (
            <div
              key={dot.id}
              onClick={phase === 'arch' ? () => collect(i) : undefined}
              style={{
                position: 'absolute',
                left: `${atTarget ? targetPct.x : dot.x}%`,
                top:  `${atTarget ? targetPct.y : dot.y}%`,
                transform: 'translate(-50%,-50%)',
                width: DOT_SIZE + 40, height: DOT_SIZE + 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: phase === 'gone' ? 0 : 1,
                cursor: phase === 'arch' ? 'pointer' : 'default',
                transition: phase === 'arch'
                  ? 'none'
                  : phase === 'flying'
                  ? 'left 0.5s ease-in, top 0.5s ease-in'
                  : 'opacity 0.2s ease',
                zIndex: phase !== 'arch' ? 10 : 1,
                pointerEvents: phase === 'arch' ? 'auto' : 'none',
              }}
            >
              <div style={{ width: DOT_SIZE, height: DOT_SIZE, borderRadius: '50%', background: targetColor, pointerEvents: 'none' }} />
            </div>
          )
        })}

        {/* Baskets — fixed positions by color so they don't shift between pages */}
        {allColors.map((color, bi) => {
          const isTarget = bi === allColors.length - 1
          const count    = isTarget ? collected : totalPerColor(color)
          const total    = totalPerColor(color)
          return (
            <div key={color} style={{
              position: 'absolute', left: BASKET_LEFT[color], bottom: '5%',
              transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              pointerEvents: 'none', zIndex: 0,
            }}>
              <div style={{
                margin: '0 auto', width: 70, height: 28,
                border: `5px solid ${color}`, borderBottom: 'none',
                borderRadius: '40px 40px 0 0',
              }} />
              <div ref={isTarget ? basketBodyRef : undefined} style={{
                width: 110, height: 72,
                border: `5px solid ${color}`,
                borderRadius: '0 0 18px 18px',
                background: color + '20',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700, color,
              }}>
                {`${count}/${total}`}
              </div>
            </div>
          )
        })}

        {done && <ClapCelebration />}
      </div>
      <IntroText>{intro}</IntroText>
      <SetDone done={done} />
    </>
  )
}

function Page10() { return <BrownCatch targetColor={BLUE} maxSpd={0.35} prevColors={[YELLOW]} /> }
function Page11() { return <BrownCatch targetColor={RED}  maxSpd={0.7}  prevColors={[YELLOW, BLUE]} /> }

// ─── Shared styles ────────────────────────────────────────────────────────────
const canvasStyle: React.CSSProperties = {
  flex: 1, minHeight: 0,
  width: '100%', minWidth: 960,
  background: '#fff', borderRadius: 18,
  border: '2px solid #ede8df',
  position: 'relative', overflow: 'hidden',
}

const dotStyle = (color: string, interactive = true): React.CSSProperties => ({
  position: 'absolute',
  width: DOT_SIZE, height: DOT_SIZE,
  borderRadius: '50%', background: color,
  cursor: interactive ? 'pointer' : 'default',
  WebkitTapHighlightColor: 'transparent',
})

// ─── Well Done screen ─────────────────────────────────────────────────────────
function WellDone({ onReset }: { onReset: () => void }) {
  useLayoutEffect(() => {
    const s = document.createElement('style')
    s.textContent = '@keyframes shineText{0%{background-position:200% center}100%{background-position:0% center}}'
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])
  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 36,
      background: '#fff',
      fontFamily: '"Nunito Variable", Nunito, sans-serif',
    }}>
      <img
        src="/press-here/well-done.gif"
        alt="Well done!"
        style={{ width: 320, height: 320, borderRadius: 28, objectFit: 'cover' }}
      />
      <div style={{
        fontSize: 'clamp(56px,8vw,96px)', fontWeight: 900, letterSpacing: -2,
        background: 'linear-gradient(90deg, #FDD302 0%, #F63664 30%, #5CCBF8 60%, #FDD302 100%)',
        backgroundSize: '300% auto',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'shineText 2.8s linear infinite',
      }}>
        Well done!
      </div>
      <button
        onClick={onReset}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 28px', borderRadius: 40,
          background: 'transparent', border: '2px solid #ccc',
          fontSize: 16, fontWeight: 700, color: '#888',
          fontFamily: 'inherit', cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#aaa'; e.currentTarget.style.color = '#555' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#ccc'; e.currentTarget.style.color = '#888' }}
      >
        <RotateCcw size={16} /> Play again
      </button>
    </div>
  )
}

// ─── Shell ────────────────────────────────────────────────────────────────────
const PAGES = [Page1, Page2, Page3, Page4, Page56, Page7, Page8, Page9, Page10, Page11]
const TOTAL = PAGES.length

export default function PressHere() {
  const [page,      setPage]      = useState(0)
  const [caption,   setCaption]   = useState<React.ReactNode>('')
  const [done,      setDone]      = useState(false)
  const [globalKey, setGlobalKey] = useState(0)
  const [wellDone,  setWellDone]  = useState(false)
  const handoffRef     = useRef<Handoff>({ page4Dots: null, page5Dots: null, page6Dots: null })
  const canvasAreaRef  = useRef<HTMLDivElement>(null)
  const firstRenderRef = useRef(true)

  const isFirst = page === 0
  const isLast  = page === TOTAL - 1

  function nav(next: number) {
    setPage(next)
    setDone(false)
  }

  function reset() {
    setGlobalKey(k => k + 1)
    setPage(0)
    setDone(false)
    setWellDone(false)
    handoffRef.current = { page4Dots: null, page5Dots: null, page6Dots: null }
  }

  // Page-change shadow lift animation
  useLayoutEffect(() => {
    if (firstRenderRef.current) { firstRenderRef.current = false; return }
    const el = canvasAreaRef.current
    if (!el) return
    el.animate(
      [{ boxShadow: 'none' }, { boxShadow: '0 20px 56px rgba(0,0,0,0.18)' }, { boxShadow: 'none' }],
      { duration: 360, easing: 'ease-out' }
    )
  }, [page])

  // Spacebar → Next / Done when available
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code !== 'Space' || !done) return
      e.preventDefault()
      if (isLast) setWellDone(true)
      else nav(page + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done, isLast, page])   // eslint-disable-line react-hooks/exhaustive-deps

  // Secret shortcut: X finishes the current page
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'x' || e.key === 'X') setDone(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  if (wellDone) return <WellDone onReset={reset} />

  return (
    <CaptionCtx.Provider value={setCaption}>
      <DoneCtx.Provider value={setDone}>
        <HandoffCtx.Provider value={handoffRef}>
          <div style={{
            height: '100dvh', display: 'flex', flexDirection: 'column',
            background: '#fef9f0', padding: '12px 32px 16px', boxSizing: 'border-box',
            fontFamily: '"Nunito Variable", Nunito, sans-serif', overflowX: 'auto',
          }}>

            {/* Canvas area — all pages mounted; opacity+pointer-events for transition */}
            <div ref={canvasAreaRef} key={globalKey} style={{ flex: 1, minHeight: 0, position: 'relative', minWidth: 960 }}>
              {PAGES.map((P, i) => (
                <PageActiveCtx.Provider key={i} value={i === page}>
                  <div style={{
                    position: 'absolute', inset: 0, display: i === page ? 'flex' : 'none', flexDirection: 'column',
                  }}>
                    <P />
                  </div>
                </PageActiveCtx.Provider>
              ))}
            </div>

            {/* Caption row — button reserves space via visibility */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 960, marginTop: 14, gap: 16 }}>
              <div style={{ fontSize: 'clamp(14px,2vw,18px)', fontWeight: 600, color: '#444', lineHeight: 1.4 }}>
                {caption}
              </div>
              <button
                onClick={isLast ? () => setWellDone(true) : () => nav(page + 1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 28px', borderRadius: 40,
                  background: '#FDD302', border: 'none',
                  fontSize: 20, fontWeight: 800, color: '#333',
                  fontFamily: 'inherit', cursor: 'pointer',
                  flexShrink: 0,
                  visibility: done ? 'visible' : 'hidden',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#ffc700')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FDD302')}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {isLast ? 'Done' : <>Next <ChevronRight size={22} strokeWidth={3} /></>}
              </button>
            </div>

            {/* Footer pagination + reset */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 960, marginTop: 10, gap: 4 }}>
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious text="" onClick={() => !isFirst && nav(page - 1)} className={cn(isFirst && 'opacity-30 pointer-events-none')} />
                  </PaginationItem>
                  {Array.from({ length: TOTAL }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink isActive={i === page} onClick={() => nav(i)}>{i + 1}</PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext text="" onClick={() => !isLast && nav(page + 1)} className={cn(isLast && 'opacity-30 pointer-events-none')} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <Button variant="ghost" size="icon-sm" onClick={reset} className="text-muted-foreground shrink-0" title="Reset">
                <RotateCcw />
              </Button>
            </div>

          </div>
        </HandoffCtx.Provider>
      </DoneCtx.Provider>
    </CaptionCtx.Provider>
  )
}
