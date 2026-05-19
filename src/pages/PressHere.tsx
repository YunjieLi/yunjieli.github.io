import { useState, useRef, useEffect, useLayoutEffect, createContext, useContext } from 'react'
import '@fontsource-variable/nunito'
import { ChevronRight } from 'lucide-react'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

const YELLOW = '#FDD302'
const RED    = '#F63664'
const BLUE   = '#5CCBF8'
const DOT_SIZE = 80

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

// ─── Page 2 ──────────────────────────────────────────────────────────────────
function Page2() {
  const [leftColor,  setLeft]  = useState(YELLOW)
  const [rightColor, setRight] = useState(YELLOW)
  const leftDone = leftColor === RED, rightDone = rightColor === BLUE
  const done = leftDone && rightDone
  const dots: DotSpec[] = [
    { id: 'p2-0', color: leftColor,  x: COL_X[0], y: ROW_Y[0], onClick: () => setLeft(RED),  interactive: !leftDone  },
    { id: 'p2-1', color: YELLOW,     x: COL_X[1], y: ROW_Y[0], onClick: () => {},              interactive: false      },
    { id: 'p2-2', color: rightColor, x: COL_X[2], y: ROW_Y[0], onClick: () => setRight(BLUE), interactive: !rightDone },
  ]
  const intro = done ? 'Red, yellow, blue! 🎨' : leftDone ? 'Now try the right dot!' : rightDone ? 'Now try the left dot!' : 'Press the left dot, then the right!'
  return <PageCanvas dots={dots} intro={intro} done={done} />
}

// ─── Page 3 ──────────────────────────────────────────────────────────────────
function Page3() {
  const [counts, setCounts] = useState([1, 1, 1])
  const COL_COLORS = [RED, YELLOW, BLUE]
  const done = counts.every(c => c === 5)
  function pressCol(col: number) {
    setCounts(prev => { if (prev[col] >= 5) return prev; const next = [...prev]; next[col]++; return next })
  }
  const dots: DotSpec[] = COL_COLORS.flatMap((color, ci) =>
    Array.from({ length: counts[ci] }, (_, row) => ({
      id: `p3-${ci}-${row}`, color, x: COL_X[ci], y: ROW_Y[row], onClick: () => pressCol(ci), interactive: counts[ci] < 5,
    }))
  )
  const total = counts.reduce((a, b) => a + b, 0)
  const intro = done ? 'A 5×3 rainbow matrix! 🌈' : total > 6 ? 'Almost there — keep pressing!' : 'Press any dot to grow its column!'
  return <PageCanvas dots={dots} intro={intro} done={done} />
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
  const dotsRef  = useRef<PhysDot[]>(initPhysDots())
  const rafRef   = useRef<number | null>(null)
  const running  = useRef(false)
  const [, tick] = useState(0)
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
      tick(n => n + 1)
      if (anyMoving) { rafRef.current = requestAnimationFrame(step) }
      else {
        running.current = false
        handoff.current.page4Dots = dotsRef.current.map(({ x, y }) => ({ x, y }))
      }
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
      <div onClick={done ? undefined : handleClick} style={{ ...canvasStyle, cursor: done ? 'default' : 'pointer', userSelect: 'none' }}>
        {dotsRef.current.map(dot => (
          <div key={dot.id} style={{ ...dotStyle(dot.color, false), left: `${dot.x}%`, top: `${dot.y}%`, transform: 'translate(-50%,-50%)', transition: 'none', pointerEvents: 'none' }} />
        ))}
      </div>
      <IntroText>{intro}</IntroText>
      <SetDone done={done} />
    </>
  )
}

// ─── Pages 5 & 6 — tilt ──────────────────────────────────────────────────────
function mkTiltDots(positions: { x: number; y: number }[]): PhysDot[] {
  return [RED, YELLOW, BLUE].flatMap((color, ci) =>
    Array.from({ length: 5 }, (_, i) => ({
      id: `tilt-${ci}-${i}`,
      color,
      x: positions[ci * 5 + i].x,
      y: positions[ci * 5 + i].y,
      vx: 0, vy: 0,
      friction: 0.93 + Math.random() * 0.05,   // 0.93–0.98 per dot
    }))
  )
}

function TiltPage({ direction, defaultPos }: { direction: 'left' | 'right'; defaultPos: { x: number; y: number }[] }) {
  const active   = useContext(PageActiveCtx)
  const handoff  = useContext(HandoffCtx)
  const dotsRef  = useRef<PhysDot[]>(mkTiltDots(defaultPos))
  const rafRef   = useRef<number | null>(null)
  const running  = useRef(false)
  const gravRef  = useRef(0)
  const initedRef = useRef(false)
  const [, tick] = useState(0)
  const [taps,   setTaps] = useState(0)
  const done = taps >= 3
  const sign = direction === 'left' ? -1 : 1

  // On first activation, inherit previous page's final dot positions
  useEffect(() => {
    if (!active || initedRef.current || taps > 0) return
    initedRef.current = true
    const src = direction === 'left' ? handoff.current.page4Dots : handoff.current.page5Dots
    if (src && src.length === 15) {
      dotsRef.current = mkTiltDots(src)
      tick(n => n + 1)
    }
  }, [active])   // eslint-disable-line react-hooks/exhaustive-deps

  function handleTap() {
    setTaps(t => {
      const next = t + 1
      gravRef.current = Math.min(0.08 + next * 0.07, 0.45)
      // random impulse per dot so they fall asynchronously
      dotsRef.current = dotsRef.current.map(dot => ({
        ...dot,
        vy: dot.vy + (Math.random() - 0.5) * 3.5,
        vx: dot.vx + (Math.random() - 0.5) * 1.5,
      }))
      return next
    })
    if (!running.current) startLoop()
  }

  function startLoop() {
    running.current = true
    const step = () => {
      const gx = sign * gravRef.current
      let anyMoving = false
      dotsRef.current = dotsRef.current.map(({ x, y, vx, vy, friction, ...rest }) => {
        vx += gx
        x += vx; y += vy
        if (x < RX)       { x = RX;       vx =  Math.abs(vx) * BOUNCE }
        if (x > 100 - RX) { x = 100 - RX; vx = -Math.abs(vx) * BOUNCE }
        if (y < RY)       { y = RY;       vy =  Math.abs(vy) * BOUNCE }
        if (y > 100 - RY) { y = 100 - RY; vy = -Math.abs(vy) * BOUNCE }
        vx *= friction; vy *= friction
        if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) anyMoving = true
        return { ...rest, x, y, vx, vy, friction }
      })
      tick(n => n + 1)
      if (anyMoving) { rafRef.current = requestAnimationFrame(step) }
      else {
        running.current = false
        const finalPos = dotsRef.current.map(({ x, y }) => ({ x, y }))
        if (direction === 'left')  handoff.current.page5Dots = finalPos
        else                       handoff.current.page6Dots = finalPos
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  const side  = direction === 'left' ? 'left' : 'right'
  const arrow = direction === 'left' ? '←' : '→'
  const intro = taps === 0 ? `Tap to tilt ${side}!` : taps < 3 ? 'Again! Tilt more! 📐' : 'They\'re all sliding! 🎪'

  return (
    <>
      <div onClick={done ? undefined : handleTap} style={{ ...canvasStyle, cursor: done ? 'default' : 'pointer', userSelect: 'none' }}>
        {dotsRef.current.map(dot => (
          <div key={dot.id} style={{ ...dotStyle(dot.color, false), left: `${dot.x}%`, top: `${dot.y}%`, transform: 'translate(-50%,-50%)', transition: 'none', pointerEvents: 'none' }} />
        ))}
        <span style={{ position: 'absolute', [side]: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 30, opacity: Math.min(0.15 + taps * 0.08, 0.5), pointerEvents: 'none', userSelect: 'none' }}>
          {arrow}
        </span>
      </div>
      <IntroText>{intro}</IntroText>
      <SetDone done={done} />
    </>
  )
}

function Page5() { return <TiltPage direction="left"  defaultPos={SCATTERED}    /> }
function Page6() { return <TiltPage direction="right" defaultPos={PILED_LEFT}   /> }

// ─── Page 7 — lineup ──────────────────────────────────────────────────────────
const COLOR_ROW  = Array.from({ length: 15 }, (_, i) => [RED, YELLOW, BLUE][i % 3])
const ROW_CENTER_Y = 50
const ROW_MARGIN = (DOT_SIZE / 2 / 960) * 100
const ROW_X      = Array.from({ length: 15 }, (_, i) => ROW_MARGIN + i * ((100 - 2 * ROW_MARGIN) / 14))

function Page7() {
  const active   = useContext(PageActiveCtx)
  const handoff  = useContext(HandoffCtx)
  const [lined,  setLined] = useState(false)
  const [, tick] = useState(0)
  const startRef = useRef<{ x: number; y: number }[]>(PILED_RIGHT)
  const initedRef = useRef(false)

  // On first activation, use Page6's actual final positions
  useEffect(() => {
    if (!active || initedRef.current) return
    initedRef.current = true
    const src = handoff.current.page6Dots
    if (src && src.length === 15) {
      startRef.current = src
      if (!lined) tick(n => n + 1)
    }
  }, [active])   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div onClick={lined ? undefined : () => setLined(true)} style={{ ...canvasStyle, cursor: lined ? 'default' : 'pointer' }}>
        {COLOR_ROW.map((color, i) => {
          const start = startRef.current[i] ?? PILED_RIGHT[i]
          const pos   = lined ? { x: ROW_X[i], y: ROW_CENTER_Y } : start
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${pos.x}%`, top: `${pos.y}%`,
              transform: 'translate(-50%,-50%)',
              width: DOT_SIZE, height: DOT_SIZE, borderRadius: '50%',
              background: color,
              transition: lined
                ? `left ${0.45 + i * 0.035}s cubic-bezier(0.34,1.1,0.64,1), top ${0.45 + i * 0.035}s cubic-bezier(0.34,1.1,0.64,1)`
                : 'none',
              pointerEvents: 'none',
            }} />
          )
        })}
      </div>
      <IntroText>{lined ? 'All lined up! 🎉' : 'Tap anywhere to line them up!'}</IntroText>
      <SetDone done={lined} />
    </>
  )
}

// ─── Page 8 — lights out ──────────────────────────────────────────────────────
function Page8() {
  const [dark, setDark] = useState(false)
  return (
    <>
      <div style={{ ...canvasStyle, background: dark ? '#111' : '#fff', border: `3px solid ${dark ? '#333' : '#f0e8d8'}`, transition: 'background 1.3s ease, border-color 1.3s ease' }}>
        {COLOR_ROW.map((color, i) => {
          const isYellow = color === YELLOW
          const dimmed   = dark && !isYellow
          return (
            <div
              key={i}
              onClick={isYellow && !dark ? () => setDark(true) : undefined}
              style={{
                position: 'absolute',
                left: `${ROW_X[i]}%`, top: `${ROW_CENTER_Y}%`,
                transform: 'translate(-50%,-50%)',
                width: DOT_SIZE, height: DOT_SIZE, borderRadius: '50%',
                background: color,
                cursor: isYellow && !dark ? 'pointer' : 'default',
                opacity: dimmed ? 0.15 : 1,
                transition: 'opacity 1.3s ease',
              }}
            />
          )
        })}
      </div>
      <IntroText>{dark ? 'You turned off the lights! 🌙' : 'Press a yellow dot to turn off the light!'}</IntroText>
      <SetDone done={dark} />
    </>
  )
}

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

// ─── Shell ────────────────────────────────────────────────────────────────────
const PAGES = [Page1, Page2, Page3, Page4, Page5, Page6, Page7, Page8]
const TOTAL = PAGES.length

export default function PressHere() {
  const [page,    setPage]    = useState(0)
  const [caption, setCaption] = useState<React.ReactNode>('')
  const [done,    setDone]    = useState(false)
  const handoffRef = useRef<Handoff>({ page4Dots: null, page5Dots: null, page6Dots: null })

  const isFirst = page === 0
  const isLast  = page === TOTAL - 1

  function nav(next: number) {
    setPage(next)
    setDone(false)
  }

  return (
    <CaptionCtx.Provider value={setCaption}>
      <DoneCtx.Provider value={setDone}>
        <HandoffCtx.Provider value={handoffRef}>
          <div style={{
            height: '100dvh', display: 'flex', flexDirection: 'column',
            background: '#fef9f0', padding: '12px 32px 16px', boxSizing: 'border-box',
            fontFamily: '"Nunito Variable", Nunito, sans-serif', overflowX: 'auto',
          }}>

            {/* Canvas area — all pages mounted, only active one shown */}
            <div style={{ flex: 1, minHeight: 0, position: 'relative', minWidth: 960 }}>
              {PAGES.map((P, i) => (
                <PageActiveCtx.Provider key={i} value={i === page}>
                  <div style={{ position: 'absolute', inset: 0, display: i === page ? 'flex' : 'none', flexDirection: 'column' }}>
                    <P />
                  </div>
                </PageActiveCtx.Provider>
              ))}
            </div>

            {/* Caption row — Next button always reserves space via visibility */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 960, marginTop: 14, gap: 16 }}>
              <div style={{ fontSize: 'clamp(14px,2vw,18px)', fontWeight: 600, color: '#444', lineHeight: 1.4 }}>
                {caption}
              </div>
              <button
                onClick={() => nav(page + 1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 28px', borderRadius: 40,
                  background: '#FDD302', border: 'none',
                  fontSize: 20, fontWeight: 800, color: '#333',
                  fontFamily: 'inherit', cursor: 'pointer',
                  flexShrink: 0,
                  visibility: (done && !isLast) ? 'visible' : 'hidden',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#ffc700')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FDD302')}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Next <ChevronRight size={22} strokeWidth={3} />
              </button>
            </div>

            {/* Footer pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', minWidth: 960, marginTop: 10 }}>
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => !isFirst && nav(page - 1)} className={cn(isFirst && 'opacity-30 pointer-events-none')} />
                  </PaginationItem>
                  {Array.from({ length: TOTAL }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink isActive={i === page} onClick={() => nav(i)}>{i + 1}</PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext onClick={() => !isLast && nav(page + 1)} className={cn(isLast && 'opacity-30 pointer-events-none')} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>

          </div>
        </HandoffCtx.Provider>
      </DoneCtx.Provider>
    </CaptionCtx.Provider>
  )
}
