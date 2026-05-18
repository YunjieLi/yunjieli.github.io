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

type DotSpec = {
  id: string
  color: string
  x: number
  y: number
  onClick: () => void
  interactive?: boolean   // false → default cursor, no pointer
}

// ─── Dot entrance animation ────────────────────────────────────────────────
function DotMount({ color, x, y, onClick, interactive = true }: {
  color: string; x: number; y: number; onClick: () => void; interactive?: boolean
}) {
  const [active, setActive] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setActive(true))
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <div
      onClick={onClick}
      style={{
        ...dotStyle(color, interactive),
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
function PageCanvas({ dots, intro, done }: { dots: DotSpec[]; intro: string; done: boolean }) {
  return (
    <>
      <div style={canvasStyle}>
        {dots.map(spec => (
          <DotMount
            key={spec.id}
            color={spec.color}
            x={spec.x}
            y={spec.y}
            onClick={spec.onClick}
            interactive={spec.interactive ?? true}
          />
        ))}
      </div>
      <IntroText>{intro}</IntroText>
      <SetDone done={done} />
    </>
  )
}

// ─── Page 1 ────────────────────────────────────────────────────────────────
function Page1() {
  const [count, setCount] = useState(1)
  const done = count === 3
  const bump = () => setCount(c => Math.min(c + 1, 3))

  const dots: DotSpec[] = Array.from({ length: count }, (_, i) => ({
    id: `p1-${i}`,
    color: YELLOW,
    x: COL_X[i],
    y: ROW_Y[0],
    onClick: bump,
    interactive: !done,
  }))

  const intro =
    count === 1 ? 'Press the dot!'
    : count === 2 ? 'Now press one of them!'
    : 'Three yellow dots! 🌟'

  return <PageCanvas dots={dots} intro={intro} done={done} />
}

// ─── Page 2 ────────────────────────────────────────────────────────────────
function Page2() {
  const [leftColor,  setLeft]  = useState(YELLOW)
  const [rightColor, setRight] = useState(YELLOW)

  const leftDone  = leftColor  === RED
  const rightDone = rightColor === BLUE
  const done = leftDone && rightDone

  const dots: DotSpec[] = [
    { id: 'p2-0', color: leftColor,  x: COL_X[0], y: ROW_Y[0], onClick: () => setLeft(RED),  interactive: !leftDone  },
    { id: 'p2-1', color: YELLOW,     x: COL_X[1], y: ROW_Y[0], onClick: () => {},              interactive: false      },
    { id: 'p2-2', color: rightColor, x: COL_X[2], y: ROW_Y[0], onClick: () => setRight(BLUE), interactive: !rightDone },
  ]

  const intro =
    done        ? 'Red, yellow, blue! 🎨'
    : leftDone  ? 'Now try the right dot!'
    : rightDone ? 'Now try the left dot!'
    :             'Press the left dot, then the right!'

  return <PageCanvas dots={dots} intro={intro} done={done} />
}

// ─── Page 3 ────────────────────────────────────────────────────────────────
function Page3() {
  const [counts, setCounts] = useState([1, 1, 1])
  const COL_COLORS = [RED, YELLOW, BLUE]
  const done = counts.every(c => c === 5)

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
      interactive: counts[ci] < 5,
    }))
  )

  const total = counts.reduce((a, b) => a + b, 0)
  const intro =
    done        ? 'A 5×3 rainbow matrix! 🌈'
    : total > 6 ? 'Almost there — keep pressing!'
    :             'Press any dot to grow its column!'

  return <PageCanvas dots={dots} intro={intro} done={done} />
}

// ─── Page 4 ────────────────────────────────────────────────────────────────
type PhysDot = { id: string; color: string; x: number; y: number; vx: number; vy: number }

const RX = (DOT_SIZE / 2 / 480) * 100
const RY = (DOT_SIZE / 2 / 520) * 100
const GRAVITY = 0
const DAMPING = 0.96
const BOUNCE  = 0.82

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
  const done = clicks >= 6

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
      if (anyMoving) { rafRef.current = requestAnimationFrame(step) }
      else { running.current = false }
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
      <div onClick={handleClick} style={{ ...canvasStyle, cursor: done ? 'default' : 'pointer', userSelect: 'none' }}>
        {dotsRef.current.map(dot => (
          <div key={dot.id} style={{
            ...dotStyle(dot.color, false),
            left: `${dot.x}%`, top: `${dot.y}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'none',
            pointerEvents: 'none',
          }} />
        ))}
      </div>
      <IntroText>{intro}</IntroText>
      <SetDone done={done} />
    </>
  )
}

// ─── Pages 5 & 6 — tilt ────────────────────────────────────────────────────
const SCATTERED: { x: number; y: number }[] = [
  { x: 72, y: 12 }, { x: 18, y: 45 }, { x: 55, y: 72 }, { x: 82, y: 52 }, { x: 35, y: 85 },
  { x: 48, y: 22 }, { x: 85, y: 35 }, { x: 22, y: 65 }, { x: 65, y: 80 }, { x: 12, y: 28 },
  { x: 62, y: 10 }, { x: 28, y: 50 }, { x: 78, y: 30 }, { x: 42, y: 90 }, { x: 90, y: 68 },
]

const PILED_LEFT: { x: number; y: number }[] = [
  { x: 8.3, y: 12 }, { x: 8.3, y: 45 }, { x: 8.3, y: 72 }, { x: 8.3, y: 52 }, { x: 8.3, y: 85 },
  { x: 8.3, y: 22 }, { x: 8.3, y: 35 }, { x: 8.3, y: 65 }, { x: 8.3, y: 80 }, { x: 8.3, y: 28 },
  { x: 8.3, y: 10 }, { x: 8.3, y: 50 }, { x: 8.3, y: 30 }, { x: 8.3, y: 90 }, { x: 8.3, y: 68 },
]

function initTiltDots(positions: { x: number; y: number }[] = SCATTERED): PhysDot[] {
  return [RED, YELLOW, BLUE].flatMap((color, ci) =>
    Array.from({ length: 5 }, (_, i) => ({
      id: `tilt-${ci}-${i}`,
      color,
      x: positions[ci * 5 + i].x,
      y: positions[ci * 5 + i].y,
      vx: 0,
      vy: 0,
    }))
  )
}

function TiltPage({ direction, initPositions }: { direction: 'left' | 'right'; initPositions?: { x: number; y: number }[] }) {
  const dotsRef  = useRef<PhysDot[]>(initTiltDots(initPositions))
  const rafRef   = useRef<number | null>(null)
  const running  = useRef(false)
  const gravRef  = useRef(0)
  const [, tick] = useState(0)
  const [taps,   setTaps] = useState(0)
  const done = taps >= 3

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
      <div onClick={done ? undefined : handleTap} style={{ ...canvasStyle, cursor: done ? 'default' : 'pointer', userSelect: 'none' }}>
        {dotsRef.current.map(dot => (
          <div key={dot.id} style={{
            ...dotStyle(dot.color, false),
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
      <SetDone done={done} />
    </>
  )
}

function Page5() { return <TiltPage direction="left" /> }
function Page6() { return <TiltPage direction="right" initPositions={PILED_LEFT} /> }

// ─── Page 7 — lineup ───────────────────────────────────────────────────────
const COLOR_ROW = Array.from({ length: 15 }, (_, i) => [RED, YELLOW, BLUE][i % 3])
const ROW_CENTER_Y = 50
const ROW_MARGIN = (DOT_SIZE / 2 / 960) * 100
const ROW_X = Array.from({ length: 15 }, (_, i) =>
  ROW_MARGIN + i * ((100 - 2 * ROW_MARGIN) / 14)
)

const SCATTERED_6 = [
  {x:72,y:25},{x:45,y:15},{x:20,y:42},
  {x:88,y:62},{x:15,y:72},{x:55,y:82},
  {x:30,y:55},{x:70,y:78},{x:10,y:22},
  {x:50,y:45},{x:85,y:32},{x:40,y:90},
  {x:25,y:10},{x:60,y:62},{x:80,y:50},
]

function Page7() {
  const [lined, setLined] = useState(false)
  return (
    <>
      <div onClick={lined ? undefined : () => setLined(true)} style={{ ...canvasStyle, cursor: lined ? 'default' : 'pointer' }}>
        {COLOR_ROW.map((color, i) => {
          const pos = lined ? { x: ROW_X[i], y: ROW_CENTER_Y } : SCATTERED_6[i]
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${pos.x}%`, top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
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

// ─── Page 8 — lights out ───────────────────────────────────────────────────
function Page8() {
  const [dark, setDark] = useState(false)
  return (
    <>
      <div style={{
        ...canvasStyle,
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

// ─── Shared style helpers ───────────────────────────────────────────────────
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
  borderRadius: '50%',
  background: color,
  cursor: interactive ? 'pointer' : 'default',
  WebkitTapHighlightColor: 'transparent',
})

// ─── Caption context ────────────────────────────────────────────────────────
const CaptionCtx = createContext<(n: React.ReactNode) => void>(() => {})

function IntroText({ children }: { children: React.ReactNode }) {
  const setCaption = useContext(CaptionCtx)
  useLayoutEffect(() => { setCaption(children) })
  return null
}

// ─── Done context ───────────────────────────────────────────────────────────
const DoneCtx = createContext<(done: boolean) => void>(() => {})

function SetDone({ done }: { done: boolean }) {
  const setDone = useContext(DoneCtx)
  useLayoutEffect(() => { setDone(done) })
  return null
}

// ─── Shell ─────────────────────────────────────────────────────────────────
const PAGES = [Page1, Page2, Page3, Page4, Page5, Page6, Page7, Page8]
const TOTAL = PAGES.length

export default function PressHere() {
  const [page,    setPage]    = useState(0)
  const [key,     setKey]     = useState(0)
  const [caption, setCaption] = useState<React.ReactNode>('')
  const [done,    setDone]    = useState(false)

  const isFirst = page === 0
  const isLast  = page === TOTAL - 1
  const PageComponent = PAGES[page]

  function nav(next: number) {
    setPage(next)
    setKey(k => k + 1)
    setDone(false)
  }

  return (
    <CaptionCtx.Provider value={setCaption}>
      <DoneCtx.Provider value={setDone}>
        <div style={{
          height: '100dvh', display: 'flex', flexDirection: 'column',
          background: '#fef9f0', padding: '12px 32px 16px', boxSizing: 'border-box',
          fontFamily: '"Nunito Variable", Nunito, sans-serif',
          overflowX: 'auto',
        }}>
          <PageComponent key={key} />

          {/* Caption row — left: caption text, right: Next button when done */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            minWidth: 960, marginTop: 14, gap: 16,
          }}>
            <div style={{
              fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 600,
              color: '#444', lineHeight: 1.4,
            }}>
              {caption}
            </div>

            {done && !isLast && (
              <button
                onClick={() => nav(page + 1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 28px', borderRadius: 40,
                  background: '#FDD302', border: 'none',
                  fontSize: 20, fontWeight: 800, color: '#333',
                  fontFamily: 'inherit', cursor: 'pointer',
                  transition: 'background 0.15s ease, transform 0.1s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#ffc700')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FDD302')}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Next <ChevronRight size={22} strokeWidth={3} />
              </button>
            )}
          </div>

          {/* Footer — pagination only */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            minWidth: 960, marginTop: 10,
          }}>
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => !isFirst && nav(page - 1)}
                    className={cn(isFirst && 'opacity-30 pointer-events-none')}
                  />
                </PaginationItem>
                {Array.from({ length: TOTAL }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink isActive={i === page} onClick={() => nav(i)}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => !isLast && nav(page + 1)}
                    className={cn(isLast && 'opacity-30 pointer-events-none')}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </DoneCtx.Provider>
    </CaptionCtx.Provider>
  )
}
