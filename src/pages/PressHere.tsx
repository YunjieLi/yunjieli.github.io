import { useState, useRef, useEffect, useLayoutEffect, createContext, useContext, useMemo } from 'react'
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

type Ch2DotState = { x: number; y: number; vx: number; vy: number; color: string }
type Ch2StaticDot = { id: string; color: string; x: number; y: number; vx?: number; vy?: number }
type Handoff = {
  page4Dots:     { x: number; y: number }[] | null
  page5Dots:     { x: number; y: number }[] | null
  page6Dots:     { x: number; y: number }[] | null
  ch2p2Dots:     Ch2DotState[]  | null
  ch2LatestDots: Ch2StaticDot[] | null   // written by each Ch2 dot-page; read by the next
}
const HandoffCtx = createContext<React.MutableRefObject<Handoff>>(
  { current: { page4Dots: null, page5Dots: null, page6Dots: null, ch2p2Dots: null, ch2LatestDots: null } }
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

// ─── Page 1 & 2 shared: RYB shimmer animation ────────────────────────────────
const GRAY = '#87898B'

// Injected once; both pages share the same keyframe name
function useRYBKeyframe() {
  useLayoutEffect(() => {
    const s = document.createElement('style')
    s.textContent = `@keyframes rybShimmer{
      0%  {background:${RED}}
      33% {background:${YELLOW}}
      67% {background:${BLUE}}
      100%{background:${RED}}
    }`
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])
}

function RainbowDot({ i, onClick, disabled }: { i: number; onClick: () => void; disabled?: boolean }) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        position: 'absolute',
        left: `${COL_X[i]}%`, top: `${ROW_Y[0]}%`,
        transform: 'translate(-50%,-50%)',
        width: DOT_SIZE, height: DOT_SIZE,
        borderRadius: '50%',
        cursor: disabled ? 'default' : 'pointer',
        WebkitTapHighlightColor: 'transparent',
        animation: 'rybShimmer 3s linear infinite',
        animationDelay: `${-i * 1}s`,
      }}
    />
  )
}

// ─── Page 1 ──────────────────────────────────────────────────────────────────
function Page1() {
  const [count, setCount] = useState(1)
  const done = count === 3
  const bump = () => setCount(c => Math.min(c + 1, 3))
  useRYBKeyframe()

  return (
    <>
      <div style={canvasStyle}>
        {Array.from({ length: count }, (_, i) => (
          <RainbowDot key={`p1-${i}`} i={i} onClick={bump} disabled={done} />
        ))}
      </div>
      <IntroText>Press the dot!</IntroText>
      <SetDone done={done} />
    </>
  )
}

// ─── Page 2+3 — reveal colors then grow columns ───────────────────────────────
function Page23() {
  const [counts, setCounts] = useState([0, 0, 0])
  const done        = counts.every(c => c === 5)
  const allRevealed = counts.every(c => c >= 1)
  const COLORS = [RED, YELLOW, BLUE]
  useRYBKeyframe()

  const bump = (i: number) =>
    setCounts(prev => prev.map((v, j) => j === i ? Math.min(v + 1, 5) : v))

  return (
    <>
      <div style={canvasStyle}>
        {COLORS.map((color, i) => {
          const count     = counts[i]
          const revealed  = count >= 1
          const clickable = count < 5
          return (
            <div key={i}>
              {/* Bottom dot: shimmer until first click reveals color */}
              <div
                onClick={clickable ? () => bump(i) : undefined}
                style={{
                  position: 'absolute',
                  left: `${COL_X[i]}%`, top: `${ROW_Y[0]}%`,
                  transform: 'translate(-50%,-50%)',
                  width: DOT_SIZE, height: DOT_SIZE,
                  borderRadius: '50%',
                  cursor: clickable ? 'pointer' : 'default',
                  WebkitTapHighlightColor: 'transparent',
                  animation: 'rybShimmer 3s linear infinite',
                  animationDelay: `${-i * 1}s`,
                }}
              >
                {/* Solid color overlay fades in on reveal */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: color,
                  opacity: revealed ? 1 : 0,
                  transition: 'opacity 0.55s ease',
                  pointerEvents: 'none',
                }} />
              </div>
              {/* Additional column dots grow upward after reveal */}
              {Array.from({ length: count - 1 }, (_, row) => (
                <DotMount
                  key={row}
                  color={color}
                  x={COL_X[i]}
                  y={ROW_Y[row + 1]}
                  onClick={() => bump(i)}
                  interactive={clickable}
                />
              ))}
            </div>
          )
        })}
      </div>
      <IntroText>
        {allRevealed ? 'Press each column to grow it!' : 'Press each dot to reveal its color!'}
      </IntroText>
      <SetDone done={done} />
    </>
  )
}

// ─── Dot-dot collision resolution (elastic, equal mass) ─────────────────────
function resolveCollisions(dots: PhysDot[], cw: number, ch: number, dotSize = DOT_SIZE): PhysDot[] {
  const result = dots.map(d => ({ ...d }))
  const n = result.length
  const minDist = dotSize  // collision when centers are closer than 1 diameter

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
  const done    = clicks >= 5
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

  const intro = 'Tap anywhere to shake!'

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
  const gravRef   = useRef({ gx: 0, gy: 0 })
  const modeRef   = useRef<'brownian' | 'gravity'>('brownian')
  const initedRef = useRef(false)
  const tapsRef   = useRef(0)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [, tick]  = useState(0)
  const [usedDirs, setUsedDirs] = useState<Set<GravDir>>(new Set())
  const done = usedDirs.size === 4

  // Load dot positions from previous page
  useEffect(() => {
    if (!active || initedRef.current) return
    const src = handoff.current.page4Dots
    if (src && src.length === 15) {
      initedRef.current = true
      dotsRef.current = mkTiltDots(src)
      tick(n => n + 1)
    }
  }, [active])   // eslint-disable-line react-hooks/exhaustive-deps

  // Always-running RAF: Brownian motion between gravity tilts
  useEffect(() => {
    if (!active) return
    let alive = true
    const step = () => {
      if (!alive) return
      const cw  = canvasRef.current?.clientWidth  ?? 960
      const ch  = canvasRef.current?.clientHeight ?? 520
      const { gx, gy } = gravRef.current
      const mode = modeRef.current
      let settling = true

      dotsRef.current = dotsRef.current.map(({ x, y, vx, vy, friction, ...rest }) => {
        if (mode === 'brownian') {
          // Gentle random walk between layouts
          vx += (Math.random() - 0.5) * 0.10
          vy += (Math.random() - 0.5) * 0.10
          const spd = Math.sqrt(vx * vx + vy * vy)
          if (spd > 0.45) { vx = vx / spd * 0.45; vy = vy / spd * 0.45 }
          settling = false   // brownian never "settles" — loop keeps running
        } else {
          // Gravity tilt
          vx += gx; vy += gy
          if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) settling = false
        }
        vx *= friction; vy *= friction
        x += vx; y += vy
        if (x < RX)       { x = RX;       vx =  Math.abs(vx) * BOUNCE }
        if (x > 100 - RX) { x = 100 - RX; vx = -Math.abs(vx) * BOUNCE }
        if (y < RY)       { y = RY;       vy =  Math.abs(vy) * BOUNCE }
        if (y > 100 - RY) { y = 100 - RY; vy = -Math.abs(vy) * BOUNCE }
        return { ...rest, x, y, vx, vy, friction }
      })

      dotsRef.current = resolveCollisions(dotsRef.current, cw, ch, DOT_SIZE)

      // Gravity settled → switch back to Brownian
      if (mode === 'gravity' && settling) {
        modeRef.current = 'brownian'
        gravRef.current = { gx: 0, gy: 0 }
      }

      handoff.current.page6Dots = dotsRef.current.map(({ x, y }) => ({ x, y }))
      tick(n => n + 1)
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      alive = false
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    }
  }, [active])   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  function applyDir(dir: GravDir) {
    const strength = Math.min(0.08 + tapsRef.current * 0.07, 0.45)
    const g = { left: { gx: -strength, gy: 0 }, right: { gx: strength, gy: 0 }, up: { gx: 0, gy: -strength }, down: { gx: 0, gy: strength } }
    gravRef.current = g[dir]
    modeRef.current = 'gravity'
    dotsRef.current = dotsRef.current.map(dot => ({
      ...dot,
      vx: dot.vx + (Math.random() - 0.5) * 3.5,
      vy: dot.vy + (Math.random() - 0.5) * 3.5,
    }))
    tapsRef.current += 1
    setUsedDirs(prev => { const next = new Set(prev); next.add(dir); return next })
  }

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

  const intro = 'Use the arrows (or keyboard) to tilt in all 4 directions!'

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
      <div ref={canvasRef} style={{ ...canvasStyle, userSelect: 'none' }}>
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

  const intro = 'Tap to cycle through different formations!'

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
      <IntroText>Press a yellow dot to toggle the lights!</IntroText>
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

  const intro = 'Click the yellow dots to collect them into the basket!'

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

function BrownCatch({ targetColor, maxSpd, prevColors, previewColor }: {
  targetColor: string; maxSpd: number; prevColors: string[]; previewColor?: string
}) {
  const active        = useContext(PageActiveCtx)
  const canvasRef     = useRef<HTMLDivElement>(null)
  const basketBodyRef = useRef<HTMLDivElement>(null)
  const dotsRef       = useRef<BrownDot[]>([])
  const previewRef    = useRef<BrownDot[]>([])
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
        if (previewColor && previewRef.current.length === 0) {
          previewRef.current = makeBrownDots(previewColor, cw, ch)
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
      dotsRef.current  = stepBrown(dotsRef.current,  maxSpd,        dimsRef.current.cw, dimsRef.current.ch)
      previewRef.current = stepBrown(previewRef.current, maxSpd * 2, dimsRef.current.cw, dimsRef.current.ch)
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

  const intro = targetColor === BLUE
    ? 'Catch all the moving blue dots!'
    : 'The red dots are even faster — catch them all!'

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

        {/* Preview dots — non-interactive, foreshadow next page */}
        {previewColor && previewRef.current.map(dot => (
          <div key={dot.id} style={{
            position: 'absolute',
            left: `${dot.x}%`, top: `${dot.y}%`,
            transform: 'translate(-50%,-50%)',
            width: DOT_SIZE, height: DOT_SIZE, borderRadius: '50%',
            background: previewColor,
            pointerEvents: 'none', zIndex: 1,
          }} />
        ))}

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

function Page10() { return <BrownCatch targetColor={BLUE} maxSpd={0.35} prevColors={[YELLOW]} previewColor={RED} /> }
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

// ─── Chapter 2 shared constants ───────────────────────────────────────────────
const BURST_COLORS = [
  '#ff2200','#ff6600','#ffaa00','#ffdd00','#aadd00',
  '#33bb33','#00bbaa','#00aaff','#4466ff','#8833ff',
  '#cc22ee','#ff22aa','#ff5588','#ff8833',
]
const BURST_COUNT = 70    // 5 per color × 14 colors
const MINI_PX     = 26   // dot diameter in px (ch2)
const RAINBOW_BG  = 'linear-gradient(90deg,#ff0000,#ff9900,#ffff00,#33dd33,#3399ff,#cc33ff,#ff0000)'

// ─── Chapter 2 Page 1 — merge + rainbow burst ────────────────────────────────
type Ch2P1Phase = 'idle' | 'merging' | 'merged' | 'shining' | 'lit' | 'rainbow' | 'bursting' | 'roaming'

function Chapter2Page1() {
  const active    = useContext(PageActiveCtx)
  const handoff   = useContext(HandoffCtx)
  const [phase, setPhase] = useState<Ch2P1Phase>('idle')
  const phaseRef  = useRef<Ch2P1Phase>('idle')
  const dotsRef   = useRef<PhysDot[]>([])
  const rafRef    = useRef<number | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const dimsRef   = useRef({ cw: 960, ch: 520 })
  const frameRef  = useRef(0)
  const [, tick]  = useState(0)

  useLayoutEffect(() => {
    const s = document.createElement('style')
    s.textContent = [
      '@keyframes beamReveal{0%{transform:scaleY(0);opacity:0}15%{opacity:1}65%{transform:scaleY(1);opacity:0.72}100%{transform:scaleY(1);opacity:0}}',
      `@keyframes rybShimmer{0%{background:${RED}}33%{background:${YELLOW}}67%{background:${BLUE}}100%{background:${RED}}}`,
      '@keyframes fadeIn{0%{opacity:0}100%{opacity:1}}',
    ].join('')
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])

  useLayoutEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const { width: cw, height: ch } = entries[0].contentRect
      if (cw > 0 && ch > 0) dimsRef.current = { cw, ch }
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // ── Merge sequence (auto-triggered on activation) ─────────────────────────
  function startMerge() {
    if (phaseRef.current !== 'idle') return
    phaseRef.current = 'merging'; setPhase('merging')
    setTimeout(() => {
      phaseRef.current = 'merged'; setPhase('merged')
      setTimeout(() => {
        phaseRef.current = 'shining'; setPhase('shining')
        // basket turns rainbow exactly when beam animation ends (1900ms)
        setTimeout(() => {
          phaseRef.current = 'lit'; setPhase('lit')
          setTimeout(() => {
            phaseRef.current = 'rainbow'; setPhase('rainbow')
          }, 350)   // brief pause then clickable
        }, 1900)   // beam animation duration
      }, 680)      // wait for basketPop
    }, 700)        // wait for slide
  }

  // Auto-trigger merge when page becomes active
  useEffect(() => {
    if (!active) return
    const t = setTimeout(startMerge, 400)   // small delay so page is visible first
    return () => clearTimeout(t)
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Firework burst ────────────────────────────────────────────────────────
  function handleRainbowBasketClick() {
    if (phaseRef.current !== 'rainbow') return
    const { ch } = dimsRef.current
    const bx = 50
    const by = 100 - 5 - (172 / ch * 100 / 2)
    frameRef.current = 0
    dotsRef.current = Array.from({ length: BURST_COUNT }, (_, i) => {
      // Fan upward: angles span from -140° to +140° around 12 o'clock
      const angle = -Math.PI / 2 + ((i / (BURST_COUNT - 1)) - 0.5) * (Math.PI * 1.55) + (Math.random() - 0.5) * 0.25
      const speed = 2.8 + Math.random() * 2.6
      return {
        id:       `rdot-${i}`,
        color:    BURST_COLORS[i % BURST_COLORS.length],
        x:        bx + (Math.random() - 0.5) * 4,
        y:        by + (Math.random() - 0.5) * 4,
        vx:       Math.cos(angle) * speed,
        vy:       Math.sin(angle) * speed,   // negative = upward
        friction: 0.94 + Math.random() * 0.04,
      }
    })
    phaseRef.current = 'bursting'; setPhase('bursting')
  }

  // ── RAF loop (bursting → roaming) ─────────────────────────────────────────
  useEffect(() => {
    if (!active || (phaseRef.current !== 'bursting' && phaseRef.current !== 'roaming')) return
    let alive = true
    const step = () => {
      if (!alive) return
      const { cw, ch } = dimsRef.current
      const rx = MINI_PX / 2 / cw * 100
      const ry = MINI_PX / 2 / ch * 100
      const settling = frameRef.current < 55

      dotsRef.current = dotsRef.current.map(dot => {
        let { x, y, vx, vy, friction } = dot
        if (settling) {
          vy -= 0.03   // gentle upward lift — keeps dots in upper sky
        } else {
          vx += (Math.random() - 0.5) * 0.13
          vy += (Math.random() - 0.5) * 0.13
        }
        vx *= friction; vy *= friction
        const spd = Math.sqrt(vx * vx + vy * vy)
        const cap = settling ? 5.0 : 0.75
        if (spd > cap) { vx = vx / spd * cap; vy = vy / spd * cap }
        x += vx; y += vy
        if (x < rx)       { x = rx;       vx =  Math.abs(vx) * BOUNCE }
        if (x > 100 - rx) { x = 100 - rx; vx = -Math.abs(vx) * BOUNCE }
        if (y < ry)       { y = ry;       vy =  Math.abs(vy) * BOUNCE }
        if (y > 100 - ry) { y = 100 - ry; vy = -Math.abs(vy) * BOUNCE }
        return { ...dot, x, y, vx, vy }
      })

      dotsRef.current = resolveCollisions(dotsRef.current, cw, ch, MINI_PX)
      frameRef.current++

      if (frameRef.current === 55) {
        phaseRef.current = 'roaming'; setPhase('roaming')
      }
      if (frameRef.current >= 55) {
        handoff.current.ch2p2Dots = dotsRef.current.map(d => ({ x: d.x, y: d.y, vx: d.vx, vy: d.vy, color: d.color }))
      }

      tick(n => n + 1)
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { alive = false; if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null } }
  }, [active, phase])   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  // ── Derived display values ─────────────────────────────────────────────────
  const colors = [BLUE, YELLOW, RED]
  const bigBasketShown = phase === 'merged' || phase === 'shining' || phase === 'lit' || phase === 'rainbow'
  const isRainbow      = phase === 'lit' || phase === 'rainbow'
  const showBeam       = phase === 'shining' || phase === 'lit'
  // Small baskets only shown before the merge completes
  const showSmallBaskets = phase === 'idle' || phase === 'merging'

  const label =
    phase === 'idle'     ? 'Get ready…' :
    phase === 'merging'  ? 'Here they come…' :
    phase === 'merged'   ? 'All together now! 🎉' :
    phase === 'shining'  ? '✨ Rainbow power! ✨' :
    phase === 'lit'      ? '✨ Rainbow power! ✨' :
    phase === 'rainbow'  ? 'Tap the rainbow basket! 🌈' :
    phase === 'bursting' ? '🎆 Up, up, and away!' :
                           '🌈 Rainbow dots — free at last!'

  return (
    <>
      <div ref={canvasRef} style={canvasStyle}>

        {/* ── 3 small baskets (idle + merging only) ── */}
        {showSmallBaskets && colors.map(color => (
          <div
            key={color}
            style={{
              position: 'absolute',
              left: phase === 'idle' ? BASKET_LEFT[color] : '50%',
              bottom: '5%',
              transform: 'translateX(-50%)',
              transition: 'left 0.6s cubic-bezier(0.34,1.1,0.64,1)',
              display: 'flex',
              flexDirection: 'column', alignItems: 'center',
              cursor: 'default',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            <div style={{
              margin: '0 auto', width: 70, height: 28,
              border: `5px solid ${color}`, borderBottom: 'none',
              borderRadius: '40px 40px 0 0',
            }} />
            <div style={{
              width: 110, height: 72,
              border: `5px solid ${color}`,
              borderRadius: '0 0 18px 18px',
              background: color + '20',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color,
            }}>✓</div>
          </div>
        ))}

        {/* ── Rainbow beam ── */}
        {showBeam && (
          <div style={{
            position: 'absolute',
            left: '50%', marginLeft: -110,
            top: 0, bottom: '16%', width: 220,
            background: 'linear-gradient(to bottom,rgba(255,0,0,0.5) 0%,rgba(255,165,0,0.45) 16%,rgba(255,255,0,0.4) 32%,rgba(0,200,0,0.35) 48%,rgba(0,100,255,0.35) 64%,rgba(148,0,211,0.3) 82%,rgba(255,50,180,0.18) 100%)',
            clipPath: 'polygon(38% 0%,62% 0%,95% 100%,5% 100%)',
            transformOrigin: 'top center',
            animation: 'beamReveal 1.9s ease-out forwards',
            pointerEvents: 'none', zIndex: 10,
          }} />
        )}

        {/* ── Big merged basket ── */}
        {bigBasketShown && (
          <div
            onClick={handleRainbowBasketClick}
            style={{
              position: 'absolute', left: '50%', bottom: '5%',
              transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              animation: phase === 'merged' ? 'fadeIn 0.45s ease forwards' : 'none',
              cursor: phase === 'rainbow' ? 'pointer' : 'default',
              pointerEvents: phase === 'rainbow' ? 'auto' : 'none',
              zIndex: 11,
            }}
          >
            <div style={{
              margin: '0 auto', width: 120, height: 46,
              border: `6px solid ${isRainbow ? '#ffdd00' : '#888'}`,
              borderBottom: 'none', borderRadius: '60px 60px 0 0',
              animation:  isRainbow ? 'rybShimmer 2s linear infinite' : 'none',
              animationDelay: isRainbow ? '-0.5s' : '0s',
              boxShadow:  isRainbow ? '0 0 22px rgba(255,200,0,0.75)' : 'none',
              transition: 'box-shadow 0.4s ease',
            }} />
            <div style={{
              width: 190, height: 120,
              border: `6px solid ${isRainbow ? '#ffdd00' : '#888'}`,
              borderRadius: '0 0 28px 28px',
              background:  isRainbow ? undefined : '#88888818',
              animation:   isRainbow ? 'rybShimmer 2s linear infinite' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: isRainbow ? '0 0 32px 8px rgba(255,200,0,0.7),inset 0 0 18px rgba(255,255,255,0.25)' : 'none',
              transition: 'box-shadow 0.4s ease',
            }}>
              {!isRainbow && [YELLOW, BLUE, RED].map(c => (
                <div key={c} style={{ width: 30, height: 30, borderRadius: '50%', background: c }} />
              ))}
              {isRainbow && <span style={{ fontSize: 44, lineHeight: 1 }}>🌈</span>}
            </div>
          </div>
        )}

        {/* ── Dots (burst + roam) ── */}
        {(phase === 'bursting' || phase === 'roaming') && dotsRef.current.map(dot => (
          <div key={dot.id} style={{
            position: 'absolute',
            left: `${dot.x}%`, top: `${dot.y}%`,
            transform: 'translate(-50%,-50%)',
            width: MINI_PX, height: MINI_PX, borderRadius: '50%',
            background: dot.color, pointerEvents: 'none',
          }} />
        ))}

      </div>
      <IntroText>{label}</IntroText>
      <SetDone done={phase === 'roaming'} />
    </>
  )
}

// ─── Great Job screen (Ch2 completion) ───────────────────────────────────────
function GreatJob({ onReset }: { onReset: () => void }) {
  useLayoutEffect(() => {
    const s = document.createElement('style')
    s.textContent = '@keyframes shineText2{0%{background-position:200% center}100%{background-position:0% center}}'
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])
  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 36,
      background: '#fff',
      fontFamily: '"Nunito Variable", Nunito, sans-serif',
      userSelect: 'none',
    }}>
      <img
        src="/src/games/press-here/great-job.gif"
        alt="Great job!"
        style={{ width: 320, height: 320, borderRadius: 28, objectFit: 'cover' }}
      />
      <div style={{
        fontSize: 'clamp(56px,8vw,96px)', fontWeight: 900, letterSpacing: -2,
        background: 'linear-gradient(90deg, #FDD302 0%, #F63664 30%, #5CCBF8 60%, #FDD302 100%)',
        backgroundSize: '300% auto',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'shineText2 2.8s linear infinite',
      }}>
        Great job!
      </div>
      <button
        onClick={onReset}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 30px', borderRadius: 40,
          background: 'transparent', border: '2px solid #ccc',
          fontSize: 17, fontWeight: 700, color: '#888',
          fontFamily: 'inherit', cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#aaa'; e.currentTarget.style.color = '#555' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#ccc'; e.currentTarget.style.color = '#888' }}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <RotateCcw size={16} /> Play again
      </button>
    </div>
  )
}

// ─── Well Done screen ─────────────────────────────────────────────────────────
function WellDone({ onReset, onNextChapter }: { onReset: () => void; onNextChapter: () => void }) {
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
      userSelect: 'none',
    }}>
      <img
        src="/src/games/press-here/well-done.gif"
        alt="Well done!"
        style={{ maxWidth: 380, maxHeight: 340, width: '100%', borderRadius: 28, objectFit: 'contain', display: 'block' }}
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
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
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
        <button
          onClick={onNextChapter}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '14px 36px', borderRadius: 40,
            background: '#FDD302', border: 'none',
            fontSize: 20, fontWeight: 800, color: '#333',
            fontFamily: 'inherit', cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#ffc700')}
          onMouseLeave={e => (e.currentTarget.style.background = '#FDD302')}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Next Chapter <ChevronRight size={22} strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}

// ─── Chapter 2 Page 2 — circle ───────────────────────────────────────────────
type CirclePhase = 'roaming' | 'forming' | 'exploding'

const MAX_CIRCLE_R = 180   // px starting radius
const MIN_CIRCLE_R = 28    // px minimum after long hold
const SHRINK_MS    = 3000  // ms to shrink from max to min

function Chapter2Page3() {
  const active     = useContext(PageActiveCtx)
  const handoff    = useContext(HandoffCtx)
  const [phase, setPhase] = useState<CirclePhase>('roaming')
  const dotsRef    = useRef<PhysDot[]>([])
  const rafRef     = useRef<number | null>(null)
  const canvasRef  = useRef<HTMLDivElement>(null)
  const dimsRef    = useRef({ cw: 960, ch: 520 })
  const phaseRef   = useRef<CirclePhase>('roaming')
  const initedRef  = useRef(false)
  const [, tick]   = useState(0)

  const centerRef      = useRef({ x: 50, y: 50 })  // % coords of circle center
  const radiusPxRef    = useRef(MAX_CIRCLE_R)
  const pressTimeRef   = useRef(0)
  const explodeFrameRef = useRef(0)

  useLayoutEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const { width: cw, height: ch } = entries[0].contentRect
      if (cw > 0 && ch > 0) dimsRef.current = { cw, ch }
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!active || initedRef.current) return
    initedRef.current = true
    const src = handoff.current.ch2p2Dots
    if (src && src.length === BURST_COUNT) {
      dotsRef.current = src.map((d, i) => ({
        id: `c3-${i}`,
        color: d.color,
        x: d.x, y: d.y,
        vx: d.vx, vy: d.vy,
        friction: 0.92 + Math.random() * 0.06,
      }))
    } else {
      dotsRef.current = Array.from({ length: BURST_COUNT }, (_, i) => ({
        id: `c3-${i}`,
        color: BURST_COLORS[i % BURST_COLORS.length],
        x: 8 + Math.random() * 84,
        y: 8 + Math.random() * 84,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        friction: 0.92 + Math.random() * 0.06,
      }))
    }
    tick(n => n + 1)
  }, [active])   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!active) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      return
    }
    let alive = true
    const step = () => {
      if (!alive) return
      const { cw, ch } = dimsRef.current
      const rx = MINI_PX / 2 / cw * 100
      const ry = MINI_PX / 2 / ch * 100
      const ph = phaseRef.current

      if (ph === 'roaming') {
        dotsRef.current = dotsRef.current.map(dot => {
          let { x, y, vx, vy, friction } = dot
          vx += (Math.random() - 0.5) * 0.13
          vy += (Math.random() - 0.5) * 0.13
          vx *= friction; vy *= friction
          const spd = Math.sqrt(vx * vx + vy * vy)
          if (spd > 0.75) { vx = vx / spd * 0.75; vy = vy / spd * 0.75 }
          x += vx; y += vy
          if (x < rx)       { x = rx;       vx =  Math.abs(vx) * BOUNCE }
          if (x > 100 - rx) { x = 100 - rx; vx = -Math.abs(vx) * BOUNCE }
          if (y < ry)       { y = ry;       vy =  Math.abs(vy) * BOUNCE }
          if (y > 100 - ry) { y = 100 - ry; vy = -Math.abs(vy) * BOUNCE }
          return { ...dot, x, y, vx, vy }
        })
        dotsRef.current = resolveCollisions(dotsRef.current, cw, ch, MINI_PX)

      } else if (ph === 'forming') {
        // Shrink radius the longer the user holds
        const elapsed = Date.now() - pressTimeRef.current
        const t = Math.min(1, elapsed / SHRINK_MS)
        radiusPxRef.current = MAX_CIRCLE_R - t * (MAX_CIRCLE_R - MIN_CIRCLE_R)
        const cx = centerRef.current.x / 100 * cw
        const cy = centerRef.current.y / 100 * ch
        const baseR = radiusPxRef.current
        const noise = 0.10

        // Multi-ring donut: 3 concentric rings proportional to radius
        // Ring counts sum to BURST_COUNT=70; ratios scale with baseR
        const RINGS = [
          { count: 12, ratio: 0.33 },
          { count: 23, ratio: 0.65 },
          { count: 35, ratio: 1.00 },
        ]
        let ringOffset = 0
        const ringForDot: { angle: number; r: number }[] = []
        RINGS.forEach(({ count, ratio }) => {
          for (let j = 0; j < count; j++) {
            ringForDot.push({ angle: (j / count) * Math.PI * 2, r: baseR * ratio })
          }
          ringOffset += count
        })
        void ringOffset

        dotsRef.current = dotsRef.current.map((dot, i) => {
          const { angle, r } = ringForDot[i] ?? { angle: 0, r: baseR }
          const tx = (cx + Math.cos(angle) * r) / cw * 100
          const ty = (cy + Math.sin(angle) * r) / ch * 100
          let { x, y, vx, vy } = dot
          vx += (tx - x) * 0.06 + (Math.random() - 0.5) * noise
          vy += (ty - y) * 0.06 + (Math.random() - 0.5) * noise
          vx *= 0.82; vy *= 0.82
          x += vx; y += vy
          x = Math.max(rx, Math.min(100 - rx, x))
          y = Math.max(ry, Math.min(100 - ry, y))
          return { ...dot, x, y, vx, vy }
        })
        dotsRef.current = resolveCollisions(dotsRef.current, cw, ch, MINI_PX)

      } else if (ph === 'exploding') {
        explodeFrameRef.current++
        dotsRef.current = dotsRef.current.map(dot => {
          let { x, y, vx, vy, friction } = dot
          vx *= friction; vy *= friction
          const spd = Math.sqrt(vx * vx + vy * vy)
          if (spd > 10) { vx = vx / spd * 10; vy = vy / spd * 10 }
          x += vx; y += vy
          if (x < rx)       { x = rx;       vx =  Math.abs(vx) * BOUNCE }
          if (x > 100 - rx) { x = 100 - rx; vx = -Math.abs(vx) * BOUNCE }
          if (y < ry)       { y = ry;       vy =  Math.abs(vy) * BOUNCE }
          if (y > 100 - ry) { y = 100 - ry; vy = -Math.abs(vy) * BOUNCE }
          return { ...dot, x, y, vx, vy }
        })
        dotsRef.current = resolveCollisions(dotsRef.current, cw, ch, MINI_PX)
        if (explodeFrameRef.current >= 60) {
          // Snapshot final positions for static page 3
          handoff.current.ch2LatestDots = dotsRef.current.map(d => ({ id: d.id, color: d.color, x: d.x, y: d.y, vx: d.vx, vy: d.vy }))
          explodeFrameRef.current = 0
          phaseRef.current = 'roaming'
          setPhase('roaming')
        }
      }

      tick(n => n + 1)
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      alive = false
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    }
  }, [active])   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  function getPct(e: React.PointerEvent) {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return null
    return { x: (e.clientX - rect.left) / rect.width * 100, y: (e.clientY - rect.top) / rect.height * 100 }
  }

  function handlePointerDown(e: React.PointerEvent) {
    const pos = getPct(e)
    if (!pos) return
    e.currentTarget.setPointerCapture(e.pointerId)
    if (phaseRef.current !== 'roaming') return
    centerRef.current    = pos
    radiusPxRef.current  = MAX_CIRCLE_R
    pressTimeRef.current = Date.now()
    phaseRef.current     = 'forming'
    setPhase('forming')
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (phaseRef.current !== 'forming') return
    const pos = getPct(e)
    if (pos) centerRef.current = pos
  }

  function handlePointerUp() {
    if (phaseRef.current !== 'forming') return
    // Longer hold = more dramatic explosion
    const holdMs   = Date.now() - pressTimeRef.current
    const holdRatio = Math.min(1, holdMs / SHRINK_MS)  // 0 → 1
    const { cw, ch } = dimsRef.current
    const cx = centerRef.current.x / 100 * cw
    const cy = centerRef.current.y / 100 * ch
    dotsRef.current = dotsRef.current.map(dot => {
      const dx = dot.x / 100 * cw - cx
      const dy = dot.y / 100 * ch - cy
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      // Short hold: 6–14 px/frame  |  Long hold: 38–58 px/frame
      const base  = 6  + holdRatio * 32
      const extra = 8  + holdRatio * 20
      const speed = base + Math.random() * extra
      return {
        ...dot,
        vx: (dx / len) * speed / cw * 100,
        vy: (dy / len) * speed / ch * 100,
      }
    })
    explodeFrameRef.current = 0
    phaseRef.current = 'exploding'
    setPhase('exploding')
  }

  const label =
    phase === 'roaming'   ? 'Press and hold — make a circle!' :
    phase === 'forming'   ? '⭕ Hold longer for a smaller circle…' :
                            '💥 Boom!'

  return (
    <>
      <div
        ref={canvasRef}
        style={{ ...canvasStyle, cursor: 'crosshair', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {dotsRef.current.map(dot => (
          <div key={dot.id} style={{
            position: 'absolute',
            left: `${dot.x}%`, top: `${dot.y}%`,
            width: MINI_PX, height: MINI_PX,
            borderRadius: '50%',
            backgroundColor: dot.color,
            transform: 'translate(-50%,-50%)',
            pointerEvents: 'none',
          }} />
        ))}
      </div>
      <IntroText>{label}</IntroText>
      <SetDone done={phase === 'roaming'} />
    </>
  )
}

// ─── Ch2 shared: shape builders + generic dot-connection page ────────────────

// Scale/translate unit-space points [-1,1]² to canvas %-coords
// ── Scale SVG vertices (from a 720×720 viewBox) to canvas % coords ────────────
function svgToCanvas(
  pts: [number, number][], cw: number, ch: number, padFrac = 0.12
): { x: number; y: number }[] {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const sw = maxX - minX, sh = maxY - minY
  const pad = Math.min(cw, ch) * padFrac
  const scale = Math.min((cw - pad * 2) / sw, (ch - pad * 2) / sh)
  const ox = (cw - sw * scale) / 2 - minX * scale
  const oy = (ch - sh * scale) / 2 - minY * scale
  return pts.map(([px, py]) => ({ x: (px * scale + ox) / cw * 100, y: (py * scale + oy) / ch * 100 }))
}

// Closed polygon: N edges including wrap-around (N-1)→0
function buildEdges(n: number) {
  return Array.from({ length: n }, (_, i) => [i, (i + 1) % n] as [number, number])
}
// Open polyline: N-1 edges, no wrap-around
function buildEdgesOpen(n: number) {
  return Array.from({ length: n - 1 }, (_, i) => [i, i + 1] as [number, number])
}
function isNeighbor(a: number, b: number, n: number, open = false) {
  if (open) return Math.abs(a - b) === 1
  return Math.abs(a - b) === 1 || (Math.min(a, b) === 0 && Math.max(a, b) === n - 1)
}
function edgeKey(a: number, b: number) { return `${Math.min(a, b)}-${Math.max(a, b)}` }

// ── Raw SVG vertices in the 720×720 coordinate space ─────────────────────────
// red.svg — star (closed, 10 verts)
const SVG_RED: [number,number][] = [
  [293.5,298.5],[360,91],[428,298.5],[642.5,298.5],[468.5,424.5],
  [533.5,629.5],[360,502.5],[186,629.5],[252,424.5],[78,298.5],
]
// orange.svg — gem / shield (closed, 8 verts)
const SVG_ORANGE: [number,number][] = [
  [502.093,130],[359.273,234.949],[215.777,130],[80,205.187],
  [80,393.678],[359.273,590],[639,393.678],[639,205.187],
]
// yellow.svg — comet / lightning (closed, 11 verts)
const SVG_YELLOW: [number,number][] = [
  [410.929,325.658],[501.745,196.832],[538.546,106],[576.535,106],
  [553.386,169.523],[589,245.513],[501.745,451.516],[309.428,575],
  [72,526.319],[72,496.042],[259.568,451.516],
]
// green.svg — Y / tree (closed, 11 verts)
const SVG_GREEN: [number,number][] = [
  [344.09,474.299],[344.09,612],[378.238,612],[378.238,474.299],
  [569.153,377.053],[639,160],[444.981,251.022],[360.388,429.955],
  [273.467,251.022],[81,160],[149.295,377.053],
]
// blue.svg — spiral (OPEN, 12 verts)
const SVG_BLUE: [number,number][] = [
  [405.504,326.324],[351.837,372.934],[413.663,441.184],[493.285,385.923],
  [413.592,263.654],[278.33,334.955],[307.05,490.673],[505.733,527.341],
  [617.202,301.83],[463.275,121.986],[146.546,195.544],[82.644,543.242],
]
// indigo.svg — staircase (OPEN, 10 verts)
const SVG_INDIGO: [number,number][] = [
  [64,596],[181.383,596],[181.383,478.846],[300.461,478.846],[300.461,360],
  [418.691,360],[418.691,240.731],[536.922,240.731],[536.922,124],[656,124],
]
// purple.svg — arch / goblet (closed, 11 verts)
const SVG_PURPLE: [number,number][] = [
  [254.664,182.986],[360.684,71],[467.388,182.986],[467.388,362.573],
  [531,435.637],[531,648],[477.648,584.496],[254.664,584.496],
  [189,648],[189,435.637],[254.664,362.573],
]

// ── buildVertices helpers — map raw SVG coords to canvas % ────────────────────
function buildRedVertices    (cw: number, ch: number) { return svgToCanvas(SVG_RED,    cw, ch) }
function buildOrangeVertices (cw: number, ch: number) { return svgToCanvas(SVG_ORANGE, cw, ch) }
function buildYellowVertices (cw: number, ch: number) { return svgToCanvas(SVG_YELLOW, cw, ch) }
function buildGreenVertices  (cw: number, ch: number) { return svgToCanvas(SVG_GREEN,  cw, ch) }
function buildBlueVertices   (cw: number, ch: number) { return svgToCanvas(SVG_BLUE,   cw, ch) }
function buildIndigoVertices (cw: number, ch: number) { return svgToCanvas(SVG_INDIGO, cw, ch) }
function buildPurpleVertices (cw: number, ch: number) { return svgToCanvas(SVG_PURPLE, cw, ch) }

// ── Shape color palette matching SVG stroke colors ────────────────────────────
const SHAPE_COLORS = {
  red:    '#FF383C',
  orange: '#FF8D28',
  yellow: '#FFCC00',
  green:  '#34C759',
  blue:   '#0088FF',
  indigo: '#6155F5',
  purple: '#CB30E0',
} as const

// Progress palette (rainbow order, one per dot-connection page)
const COLOR_PALETTE: string[] = [
  SHAPE_COLORS.red, SHAPE_COLORS.orange, SHAPE_COLORS.yellow, SHAPE_COLORS.green,
  SHAPE_COLORS.blue, SHAPE_COLORS.indigo, SHAPE_COLORS.purple,
]

// ─── Generic Chapter 2 dot-connection page ───────────────────────────────────
// Compatible with PhysDot so resolveCollisions works directly
type P4Dot = { id: string; color: string; x: number; y: number; vx: number; vy: number; friction: number; vertexIdx?: number; targetX?: number; targetY?: number }
type P4Phase = 'roaming' | 'forming' | 'interactive'
const P4_FRICTION = 0.985, P4_BOUNCE = 0.7, P4_LERP = 0.18, P4_CLOSE_DIST = 0.6

interface DotPageProps {
  shapeColor:    string
  buildVertices: (cw: number, ch: number) => { x: number; y: number }[]
  emoji:         string
  connectLabel:  string
  open?:         boolean   // true for paths that don't close back to vertex 0
}

function Chapter2DotPage({ shapeColor, buildVertices, emoji, connectLabel, open = false }: DotPageProps) {
  const active    = useContext(PageActiveCtx)
  const handoff   = useContext(HandoffCtx)
  const canvasRef = useRef<HTMLDivElement>(null)
  const initedRef = useRef(false)
  const dotsRef   = useRef<P4Dot[]>([])
  const phaseRef  = useRef<P4Phase>('roaming')
  const roamTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [dots,       setDots]       = useState<P4Dot[]>([])
  const [phase,      setPhase]      = useState<P4Phase>('roaming')
  const [pathHead,   setPathHead]   = useState<string | null>(null)
  const [drawnEdges, setDrawnEdges] = useState<Set<string>>(() => new Set())
  const [complete,   setComplete]   = useState(false)
  const drawnEdgesRef = useRef<Set<string>>(new Set())

  // Edges for this shape — stable since buildVertices is a module-level function
  const nVerts     = useMemo(() => buildVertices(100, 100).length, [buildVertices]) // eslint-disable-line
  const shapeEdges = useMemo(() => open ? buildEdgesOpen(nVerts) : buildEdges(nVerts), [nVerts, open]) // eslint-disable-line
  const nEdges     = shapeEdges.length

  // Persist dot positions so the next page picks up from here
  useEffect(() => {
    if (!complete) return
    handoff.current.ch2LatestDots = dotsRef.current.map(d => ({
      id: d.id, color: d.color, x: d.x, y: d.y, vx: d.vx, vy: d.vy,
    }))
  }, [complete]) // eslint-disable-line

  useEffect(() => {
    if (!active || initedRef.current) return
    initedRef.current = true

    const src = handoff.current.ch2LatestDots
    const seed: P4Dot[] = src && src.length === BURST_COUNT
      ? src.map(d => ({
          id: d.id, color: d.color, x: d.x, y: d.y,
          vx: (d.vx ?? 0) * 0.6,
          vy: (d.vy ?? 0) * 0.6,
          friction: P4_FRICTION,
        }))
      : Array.from({ length: BURST_COUNT }, (_, i) => ({
          id: `dp-${i}`, color: BURST_COLORS[i % BURST_COLORS.length],
          x: 10 + Math.random() * 80, y: 10 + Math.random() * 80,
          vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2,
          friction: P4_FRICTION,
        }))
    dotsRef.current = seed
    setDots([...seed])

    roamTimer.current = setTimeout(() => {  // short roam before forming
      const rect = canvasRef.current?.getBoundingClientRect()
      const cw = rect?.width  ?? 960
      const ch = rect?.height ?? 520
      const vertices = buildVertices(cw, ch)

      const taken    = new Array(vertices.length).fill(false)
      const isTarget = new Array(BURST_COUNT).fill(false)
      const target: Record<number, number> = {}

      // Pass 1: existing target-color dots → nearest vertex
      dotsRef.current.forEach((d, di) => {
        if (d.color !== shapeColor) return
        let best = -1, bestD = Infinity
        vertices.forEach((v, vi) => {
          if (taken[vi]) return
          const d2 = (d.x - v.x) ** 2 + (d.y - v.y) ** 2
          if (d2 < bestD) { bestD = d2; best = vi }
        })
        if (best >= 0) { taken[best] = true; target[di] = best; isTarget[di] = true }
      })

      // Pass 2: remaining vertices → nearest non-target dot (recolored to shapeColor)
      vertices.forEach((v, vi) => {
        if (taken[vi]) return
        let best = -1, bestD = Infinity
        dotsRef.current.forEach((d, di) => {
          if (isTarget[di]) return
          const d2 = (d.x - v.x) ** 2 + (d.y - v.y) ** 2
          if (d2 < bestD) { bestD = d2; best = di }
        })
        if (best >= 0) { taken[vi] = true; target[best] = vi; isTarget[best] = true }
      })

      // Non-shape dots use palette indicator colors — every color except the current shapeColor
      const nonShapePalette = COLOR_PALETTE.filter(c => c !== shapeColor)
      dotsRef.current = dotsRef.current.map((d, di) => {
        if (target[di] !== undefined) {
          const v = vertices[target[di]]
          return { ...d, color: shapeColor, vertexIdx: target[di], targetX: v.x, targetY: v.y }
        }
        // Assign a stable random rainbow color (excluding the shape color)
        const randColor = nonShapePalette[Math.floor(Math.random() * nonShapePalette.length)]
        const spd = Math.sqrt(d.vx * d.vx + d.vy * d.vy)
        if (spd < 0.25) {
          const ang = Math.random() * Math.PI * 2
          return { ...d, color: randColor, vx: Math.cos(ang) * 0.5, vy: Math.sin(ang) * 0.5 }
        }
        return { ...d, color: randColor }
      })

      phaseRef.current = 'forming'
      setPhase('forming')
    }, 300)

    let alive = true, rafId = 0
    function tick() {
      if (!alive) return
      const canvas = canvasRef.current
      const cw = canvas?.clientWidth  ?? 960
      const ch = canvas?.clientHeight ?? 520
      const rx = MINI_PX / 2 / cw * 100
      const ry = MINI_PX / 2 / ch * 100
      const ph = phaseRef.current

      if (ph === 'roaming' || ph === 'forming') {
        dotsRef.current = dotsRef.current.map(d => {
          const isShape = d.vertexIdx !== undefined
          let { x, y, vx, vy, friction } = d

          if (ph === 'forming' && isShape && d.targetX !== undefined && d.targetY !== undefined) {
            vx += (d.targetX - x) * P4_LERP
            vy += (d.targetY - y) * P4_LERP
          }
          if (ph === 'forming' && !isShape) {
            vx += (Math.random() - 0.5) * 0.12
            vy += (Math.random() - 0.5) * 0.12
            const spd = Math.sqrt(vx * vx + vy * vy)
            if (spd > 0.9) { vx = vx / spd * 0.9; vy = vy / spd * 0.9 }
          }

          vx *= friction; vy *= friction; x += vx; y += vy
          if (x < rx)        { x = rx;        vx =  Math.abs(vx) * P4_BOUNCE }
          if (x > 100 - rx)  { x = 100 - rx;  vx = -Math.abs(vx) * P4_BOUNCE }
          if (y < ry)        { y = ry;         vy =  Math.abs(vy) * P4_BOUNCE }
          if (y > 100 - ry)  { y = 100 - ry;  vy = -Math.abs(vy) * P4_BOUNCE }
          return { ...d, x, y, vx, vy }
        })

        dotsRef.current = resolveCollisions(dotsRef.current as PhysDot[], cw, ch, MINI_PX) as P4Dot[]

        if (ph === 'forming') {
          const allClose = dotsRef.current.every(d => {
            if (d.vertexIdx === undefined || d.targetX === undefined || d.targetY === undefined) return true
            const dx = d.x - d.targetX, dy = d.y - d.targetY
            return Math.sqrt(dx * dx + dy * dy) < P4_CLOSE_DIST
          })
          if (allClose) {
            dotsRef.current = dotsRef.current.map(d =>
              d.targetX !== undefined ? { ...d, x: d.targetX, y: d.targetY!, vx: 0, vy: 0 } : d
            )
            phaseRef.current = 'interactive'
            setPhase('interactive')
          }
        }
        setDots([...dotsRef.current])

      } else if (ph === 'interactive') {
        dotsRef.current = dotsRef.current.map(d => {
          if (d.vertexIdx !== undefined) return { ...d, vx: 0, vy: 0 }
          let { x, y, vx, vy, friction } = d
          vx *= friction; vy *= friction; x += vx; y += vy
          if (x < rx)        { x = rx;        vx =  Math.abs(vx) * P4_BOUNCE }
          if (x > 100 - rx)  { x = 100 - rx;  vx = -Math.abs(vx) * P4_BOUNCE }
          if (y < ry)        { y = ry;         vy =  Math.abs(vy) * P4_BOUNCE }
          if (y > 100 - ry)  { y = 100 - ry;  vy = -Math.abs(vy) * P4_BOUNCE }
          return { ...d, x, y, vx, vy }
        })
        const nonShape  = dotsRef.current.filter(d => d.vertexIdx === undefined) as PhysDot[]
        const resolved  = resolveCollisions(nonShape, cw, ch, MINI_PX)
        const resolvedMap = new Map(resolved.map(d => [d.id, d]))
        dotsRef.current = dotsRef.current.map(d =>
          d.vertexIdx === undefined ? { ...d, ...(resolvedMap.get(d.id) ?? {}) } as P4Dot : d
        )
        setDots([...dotsRef.current])
      }

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      alive = false
      cancelAnimationFrame(rafId)
      if (roamTimer.current) clearTimeout(roamTimer.current)
      initedRef.current = false
      phaseRef.current  = 'roaming'
      dotsRef.current   = []
      drawnEdgesRef.current = new Set()
      setDots([]); setPhase('roaming'); setPathHead(null)
      setDrawnEdges(new Set()); setComplete(false)
    }
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select the start vertex when the page becomes interactive
  useEffect(() => {
    if (phase !== 'interactive') return
    const startDot = dotsRef.current.find(d => d.vertexIdx === 0)
    if (startDot) setPathHead(startDot.id)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleDotClick(dot: P4Dot) {
    if (phase !== 'interactive' || complete || dot.vertexIdx === undefined) return
    const dotVtx = dot.vertexIdx

    if (pathHead === null)     { setPathHead(dot.id); return }
    if (pathHead === dot.id)   { setPathHead(null);   return }

    const headDot = dotsRef.current.find(d => d.id === pathHead)
    if (!headDot || headDot.vertexIdx === undefined) { setPathHead(dot.id); return }

    const a = headDot.vertexIdx, b = dotVtx
    const key = edgeKey(a, b)
    if (isNeighbor(a, b, nVerts, open) && !drawnEdges.has(key)) {
      const next = new Set(drawnEdges)
      next.add(key)
      drawnEdgesRef.current = next
      setDrawnEdges(next)
      setPathHead(dot.id)
      if (next.size === nEdges) setComplete(true)
    }
  }

  const paletteIdx  = COLOR_PALETTE.indexOf(shapeColor)
  const headDot     = pathHead ? (dots.find(d => d.id === pathHead) ?? null) : null
  const headVtx     = headDot?.vertexIdx
  let connArr: number[] = headVtx !== undefined
    ? shapeEdges
        .filter(([a, b]: [number,number]) =>
          (a === headVtx || b === headVtx) &&
          !drawnEdges.has(edgeKey(a, b)) &&
          isNeighbor(a, b, nVerts, open)
        )
        .map(([a, b]: [number,number]) => a === headVtx ? b : a)
    : []
  // Enforce single forward direction: if both directions are open (only at start of closed shape),
  // keep only the forward vertex (headVtx+1) % nVerts
  if (connArr.length > 1 && headVtx !== undefined) {
    const forward = (headVtx + 1) % nVerts
    const fwd = connArr.filter(v => v === forward)
    if (fwd.length > 0) connArr = fwd
  }
  const connectable = new Set(connArr)

  return (
    <>
      <div ref={canvasRef} style={canvasStyle}>

        {/* ── Rainbow color progress indicator ── */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          display: 'flex', gap: 7, alignItems: 'center',
          zIndex: 20, pointerEvents: 'none',
          background: 'rgba(30,30,40,0.82)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          borderRadius: 28,
          padding: '7px 12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.28)',
        }}>
          {COLOR_PALETTE.map((c, i) => {
            const isCurrent = i === paletteIdx
            const isPast    = i < paletteIdx
            return (
              <div key={c} style={{
                width:  isCurrent ? 22 : 13,
                height: isCurrent ? 22 : 13,
                borderRadius: '50%',
                background: c,
                opacity: isPast ? 0.55 : isCurrent ? 1 : 0.30,
                boxShadow: isCurrent ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : 'none',
                transition: 'all 0.3s ease',
                flexShrink: 0,
              }} />
            )
          })}
        </div>

        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {shapeEdges.filter(([a, b]: [number,number]) => drawnEdges.has(edgeKey(a, b))).map(([a, b]: [number,number]) => {
            const da = dots.find(d => d.vertexIdx === a)
            const db = dots.find(d => d.vertexIdx === b)
            if (!da || !db) return null
            return (
              <line
                key={edgeKey(a, b)}
                x1={da.x} y1={da.y} x2={db.x} y2={db.y}
                stroke={shapeColor}
                strokeWidth={complete ? '1.6' : '0.55'}
                strokeLinecap="round"
                style={{ transition: 'stroke-width 0.4s ease' }}
              />
            )
          })}
        </svg>

        {dots.map(dot => {
          const isShape   = dot.vertexIdx !== undefined
          const isHead    = dot.id === pathHead
          const isConn    = isShape && !isHead && connectable.has(dot.vertexIdx!)
          const opacity   = complete && !isShape ? 0.08 : 1
          const clickable = isShape && phase === 'interactive' && !complete
          return (
            <div
              key={dot.id}
              onClick={() => handleDotClick(dot)}
              style={{
                position: 'absolute',
                left: `${dot.x}%`, top: `${dot.y}%`,
                transform: 'translate(-50%,-50%)',
                width: MINI_PX, height: MINI_PX, borderRadius: '50%',
                background: dot.color,
                opacity,
                zIndex: isShape ? 10 : 1,
                cursor: clickable ? 'pointer' : 'default',
                pointerEvents: clickable ? 'auto' : 'none',
                boxShadow: isHead
                  ? `0 0 0 4px #fff, 0 0 0 6px ${shapeColor}`
                  : isConn
                  ? `0 0 0 3px #fff, 0 0 10px 4px ${shapeColor}cc`
                  : complete && isShape
                  ? `0 0 8px 2px ${shapeColor}88`
                  : 'none',
                transition: 'opacity 0.6s ease, box-shadow 0.25s ease',
              }}
            />
          )
        })}

      </div>
      <IntroText>
        {complete
          ? emoji
          : phase === 'interactive'
          ? `${connectLabel} (${drawnEdges.size}/${nEdges})`
          : '✨'}
      </IntroText>
      <SetDone done={complete} />
    </>
  )
}

// ── Per-shape wrapper components (must be module-level for stable identity) ───
function Ch2StarPage()   { return <Chapter2DotPage shapeColor={SHAPE_COLORS.red}    buildVertices={buildRedVertices}    emoji="⭐" connectLabel="Connect the star!"      /> }
function Ch2GemPage()    { return <Chapter2DotPage shapeColor={SHAPE_COLORS.orange} buildVertices={buildOrangeVertices} emoji="💎" connectLabel="Connect the gem!"       /> }
function Ch2CometPage()  { return <Chapter2DotPage shapeColor={SHAPE_COLORS.yellow} buildVertices={buildYellowVertices} emoji="☄️" connectLabel="Connect the comet!"     /> }
function Ch2TreePage()   { return <Chapter2DotPage shapeColor={SHAPE_COLORS.green}  buildVertices={buildGreenVertices}  emoji="🌿" connectLabel="Connect the tree!"      /> }
function Ch2WavePage()   { return <Chapter2DotPage shapeColor={SHAPE_COLORS.blue}   buildVertices={buildBlueVertices}   emoji="🌊" connectLabel="Connect the wave!"   open /> }
function Ch2StairPage()  { return <Chapter2DotPage shapeColor={SHAPE_COLORS.indigo} buildVertices={buildIndigoVertices} emoji="📶" connectLabel="Connect the stairs!" open /> }
function Ch2ArchPage()   { return <Chapter2DotPage shapeColor={SHAPE_COLORS.purple} buildVertices={buildPurpleVertices} emoji="🏆" connectLabel="Connect the arch!"      /> }

// ─── Shell ────────────────────────────────────────────────────────────────────
const CHAPTER1_PAGES = [Page1, Page23, Page4, Page56, Page7, Page8, Page9, Page10, Page11]
const CHAPTER2_PAGES = [
  Chapter2Page1, Chapter2Page3,
  Ch2StarPage, Ch2GemPage, Ch2CometPage, Ch2TreePage,
  Ch2WavePage, Ch2StairPage, Ch2ArchPage,
]

export default function PressHere() {
  const [page,      setPage]      = useState(0)
  const [caption,   setCaption]   = useState<React.ReactNode>('')
  const [done,      setDone]      = useState(false)
  const [globalKey, setGlobalKey] = useState(0)
  const [wellDone,  setWellDone]  = useState(false)
  const [chapter,   setChapter]   = useState(1)
  const handoffRef     = useRef<Handoff>({ page4Dots: null, page5Dots: null, page6Dots: null, ch2p2Dots: null, ch2LatestDots: null })
  const canvasAreaRef  = useRef<HTMLDivElement>(null)
  const firstRenderRef = useRef(true)

  const activePages = chapter === 1 ? CHAPTER1_PAGES : CHAPTER2_PAGES
  const TOTAL = activePages.length
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
    setChapter(1)
    handoffRef.current = { page4Dots: null, page5Dots: null, page6Dots: null, ch2p2Dots: null, ch2LatestDots: null }
  }

  function startChapter2() {
    setGlobalKey(k => k + 1)
    setPage(0)
    setDone(false)
    setWellDone(false)
    setChapter(2)
    handoffRef.current = { page4Dots: null, page5Dots: null, page6Dots: null, ch2p2Dots: null, ch2LatestDots: null }
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

  // Prevent page scrolling
  useLayoutEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
  }, [])

  if (wellDone && chapter === 2) return <GreatJob onReset={reset} />
  if (wellDone) return <WellDone onReset={reset} onNextChapter={startChapter2} />

  return (
    <CaptionCtx.Provider value={setCaption}>
      <DoneCtx.Provider value={setDone}>
        <HandoffCtx.Provider value={handoffRef}>
          <div style={{
            height: '100dvh', display: 'flex', flexDirection: 'column',
            background: '#fef9f0', padding: '12px 32px 16px', boxSizing: 'border-box',
            fontFamily: '"Nunito Variable", Nunito, sans-serif', overflow: 'hidden',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            touchAction: 'manipulation',
          }}>

            {/* Canvas area — all pages mounted; opacity+pointer-events for transition */}
            <div ref={canvasAreaRef} key={globalKey} style={{ flex: 1, minHeight: 0, position: 'relative', minWidth: 960 }}>
              {activePages.map((P, i) => (
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
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 960, marginTop: 10, gap: 4 }}>
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

              {/* Chapter switcher */}
              <div style={{ position: 'absolute', right: 0, display: 'flex', gap: 3, alignItems: 'center' }}>
                {([1, 2] as const).map(ch => (
                  <button
                    key={ch}
                    onClick={() => ch === 1 ? reset() : startChapter2()}
                    style={{
                      padding: '3px 11px', borderRadius: 12,
                      background: chapter === ch ? '#555' : 'transparent',
                      border: '1px solid',
                      borderColor: chapter === ch ? '#555' : '#ddd',
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
                      color: chapter === ch ? '#fff' : '#bbb',
                      fontFamily: 'inherit',
                      cursor: chapter === ch ? 'default' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { if (chapter !== ch) { e.currentTarget.style.borderColor = '#aaa'; e.currentTarget.style.color = '#888' } }}
                    onMouseLeave={e => { if (chapter !== ch) { e.currentTarget.style.borderColor = '#ddd'; e.currentTarget.style.color = '#bbb' } }}
                  >
                    Ch {ch}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </HandoffCtx.Provider>
      </DoneCtx.Provider>
    </CaptionCtx.Provider>
  )
}
