import { useState, useCallback, useRef, useEffect } from 'react'

// ── Constants ──────────────────────────────────────────────────────────────────
const TOTAL = 9

const LEVELS = [
  { threshold: 0,  up: 1200, down: 1400 },
  { threshold: 5,  up: 1050, down: 1250 },
  { threshold: 10, up: 900,  down: 1100 },
  { threshold: 18, up: 750,  down: 950  },
  { threshold: 28, up: 620,  down: 800  },
  { threshold: 40, up: 500,  down: 680  },
  { threshold: 55, up: 400,  down: 560  },
  { threshold: 75, up: 320,  down: 440  },
] as const

function getLevel(score: number) {
  let i = 0
  for (; i < LEVELS.length - 1; i++) if (score < LEVELS[i + 1].threshold) break
  return LEVELS[i]
}
function getLevelNum(score: number) {
  let i = 0
  for (; i < LEVELS.length - 1; i++) if (score < LEVELS[i + 1].threshold) break
  return i + 1
}
function fmtTime(s: number) {
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

// ── Types ──────────────────────────────────────────────────────────────────────
type Cell    = { up: boolean; whacked: boolean }
type Floater = { id: number; x: number; y: number }

const makeCell  = (): Cell => ({ up: false, whacked: false })
const makeCells = ()       => Array.from({ length: TOTAL }, makeCell)

// ── Inline SVG assets ──────────────────────────────────────────────────────────
// Background and mask fill are the same pink so masks blend into the canvas.
const BG   = '#e3cbe1'   // canvas background + mask fill
const HOLE = '#3a3640'   // dark hole oval

function HoleRear()   { return <svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" viewBox="0 0 112 58"  fill="none"><ellipse cx="56"   cy="29"   rx="56"   ry="29"   fill={HOLE}/></svg> }
function HoleMiddle() { return <svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" viewBox="0 0 123 74"  fill="none"><ellipse cx="61.5" cy="37"   rx="61.5" ry="37"   fill={HOLE}/></svg> }
function HoleFront()  { return <svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" viewBox="0 0 137 89"  fill="none"><ellipse cx="68.5" cy="44.5" rx="68.5" ry="44.5" fill={HOLE}/></svg> }
function MaskRear()   { return <svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" viewBox="0 0 636 518" fill="none"><path d="M114 0C114 16.0163 139.072 29 170 29C200.928 29 226 16.0163 226 0H258C258 16.0163 283.072 29 314 29C344.928 29 370 16.0163 370 0H402C402 16.0163 427.072 29 458 29C488.928 29 514 16.0163 514 0H636V518H0V0H114Z" fill={BG}/></svg> }
function MaskMiddle() { return <svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" viewBox="0 0 636 357" fill="none"><path d="M92.0889 0C93.8158 19.5045 120.65 35 153.5 35C186.35 35 213.184 19.5045 214.911 0H252C252 20.4345 279.534 37 313.5 37C347.466 37 375 20.4345 375 0H412.089C413.816 19.5045 440.65 35 473.5 35C506.35 35 533.184 19.5045 534.911 0H636V357H0V0H92.0889Z" fill={BG}/></svg> }
function MaskFront()  { return <svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" viewBox="0 0 636 155" fill="none"><path d="M66.0391 0C67.2567 23.8822 97.4412 43 134.5 43C171.559 43 201.743 23.8822 202.961 0H246.039C247.257 23.8822 277.441 43 314.5 43C351.559 43 381.743 23.8822 382.961 0H426.039C427.257 23.8822 457.441 43 494.5 43C531.559 43 561.743 23.8822 562.961 0H636V155H0V0H66.0391Z" fill={BG}/></svg> }

// ── Canvas layout (636 × 714 coordinate space) ────────────────────────────────
//
//  Layer ordering per row:   hole images → mole wrappers → mask strip
//  z-indices:  rear  holes=10, moles=11, mask=12
//              mid   holes=13, moles=14, mask=15
//              front holes=16, moles=17, mask=18
//
//  Mole animation: translateY(0) = resting below the opaque mask (hidden).
//                  translateY(-upPct%) = mole rises above the mask cutout.
//  The mask's transparent semicircle cutouts (cutoutDepth px from mask top)
//  form the lower half of each hole oval; above that the mole is fully clear.
//
const CW = 636
const CH = 714

type RowCfg = {
  cellStart   : number
  holes       : Array<{ left: number; top: number; w: number; h: number }>
  maskTop     : number   // y where mask div starts
  maskH       : number
  moleW       : number
  moleH       : number
  moleRestTop : number   // y of wrapper when resting (fully behind opaque mask)
  upPct       : number   // % of moleH to translate upward when "up"
  holeZ: number; moleZ: number; maskZ: number
  HoleSvg: () => React.ReactElement
  MaskSvg: () => React.ReactElement
}

const ROWS: RowCfg[] = [
  {
    // mask-rear cutout depth = 29 px  →  moleRestTop = 196 + 29 = 225
    cellStart  : 0,
    holes      : [
      { left: 114, top: 167, w: 112, h: 58 },
      { left: 258, top: 167, w: 112, h: 58 },
      { left: 402, top: 167, w: 112, h: 58 },
    ],
    maskTop: 196, maskH: 518,
    moleW: 96, moleH: 180, moleRestTop: 225, upPct: 90,
    holeZ: 10, moleZ: 11, maskZ: 12,
    HoleSvg: HoleRear, MaskSvg: MaskRear,
  },
  {
    // mask-middle cutout max depth = 37 px  →  moleRestTop = 357 + 37 = 394
    cellStart  : 3,
    holes      : [
      { left: 92,  top: 318, w: 123, h: 74 },
      { left: 252, top: 320, w: 123, h: 74 },
      { left: 412, top: 318, w: 123, h: 74 },
    ],
    maskTop: 357, maskH: 357,
    moleW: 108, moleH: 200, moleRestTop: 394, upPct: 90,
    holeZ: 13, moleZ: 14, maskZ: 15,
    HoleSvg: HoleMiddle, MaskSvg: MaskMiddle,
  },
  {
    // mask-front cutout depth = 43 px  →  moleRestTop = 559 + 43 = 602
    cellStart  : 6,
    holes      : [
      { left: 66,  top: 513, w: 137, h: 89 },
      { left: 246, top: 513, w: 137, h: 89 },
      { left: 426, top: 513, w: 137, h: 89 },
    ],
    maskTop: 559, maskH: 155,
    moleW: 120, moleH: 220, moleRestTop: 602, upPct: 90,
    holeZ: 16, moleZ: 17, maskZ: 18,
    HoleSvg: HoleFront, MaskSvg: MaskFront,
  },
]

// Percentage of canvas dimension
const pct = (v: number, total: number) => `${(v / total * 100).toFixed(3)}%`

// ── CSS ────────────────────────────────────────────────────────────────────────
const CSS = `
  /*
   * Mole wrapper: translateY(0) = resting (hidden behind mask).
   * translateY(-N%) = rising above the mask.
   * Transition speed changes by state class.
   */
  .wam-mwrap {
    position: absolute;
    transition: transform 0.2s ease-in;
    cursor: default;
  }
  .wam-mwrap.wam-up {
    cursor: crosshair;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .wam-mwrap.wam-whacked {
    transition: transform 0.15s ease-in;
  }

  .wam-mole {
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: top center;
    display: block;
    animation: wam-wobble 0.55s ease-in-out infinite alternate;
    user-select: none;
    pointer-events: none;
  }
  .wam-mwrap.wam-whacked .wam-mole {
    animation: wam-splat 0.2s ease forwards;
  }

  @keyframes wam-wobble {
    from { transform: rotate(-3deg) scale(1);    }
    to   { transform: rotate( 3deg) scale(1.05); }
  }
  @keyframes wam-splat {
    0%   { transform: scale(1)   rotate(  0deg); opacity: 1;  }
    50%  { transform: scale(1.4) rotate( 12deg); opacity: .7; }
    100% { transform: scale(.1)  rotate(-25deg); opacity: 0;  }
  }
  @keyframes wam-float {
    0%   { opacity: 1; transform: translateY(0)     scale(1);   }
    100% { opacity: 0; transform: translateY(-55px) scale(1.3); }
  }

  .wam-btn {
    border: none; border-radius: 7px; padding: 7px 15px;
    font-size: 13px; font-weight: 700; cursor: pointer; color: #fff;
    transition: opacity .15s, transform .1s;
  }
  .wam-btn:hover  { opacity: .88; transform: scale(1.03); }
  .wam-btn:active { transform: scale(.97); }

  .wam-floater {
    position: fixed; font-size: 18px; font-weight: 800;
    color: #9333ea; pointer-events: none;
    animation: wam-float 0.75s ease forwards; z-index: 999;
  }
`

// ── Stat chip ──────────────────────────────────────────────────────────────────
function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: '#94a3b8' }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.1, color }}>{value}</div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function WackAVirus() {
  const [cells, setCells]       = useState<Cell[]>(makeCells)
  const [score, setScore]       = useState(0)
  const [elapsed, setElapsed]   = useState(0)
  const [running, setRunning]   = useState(false)
  const [floaters, setFloaters] = useState<Floater[]>([])

  const scoreRef     = useRef(0)
  const runningRef   = useRef(false)
  const timersRef    = useRef<ReturnType<typeof setTimeout>[]>([])
  const scheduleRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clockRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const floaterIdRef = useRef(0)
  const upRef        = useRef<Set<number>>(new Set())

  const clearAll = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    if (scheduleRef.current) { clearTimeout(scheduleRef.current); scheduleRef.current = null }
    if (clockRef.current)    { clearInterval(clockRef.current);   clockRef.current    = null }
  }, [])

  const popMole = useCallback(() => {
    if (!runningRef.current) return
    setCells(prev => {
      const avail = prev.reduce<number[]>((a, c, i) =>
        !c.up && !c.whacked ? [...a, i] : a, [])
      if (!avail.length) return prev
      const idx   = avail[Math.floor(Math.random() * avail.length)]
      const { down } = getLevel(scoreRef.current)
      const delay = down + Math.random() * 200 - 100
      upRef.current.add(idx)
      const tid = setTimeout(() => {
        // Start the visual sink first, then clear upRef after a rAF so any
        // click event already queued in this frame can still register.
        setCells(p => p.map((c, i) =>
          i === idx && c.up && !c.whacked ? { ...c, up: false } : c))
        requestAnimationFrame(() => upRef.current.delete(idx))
      }, delay)
      timersRef.current.push(tid)
      return prev.map((c, i) => i === idx ? { ...c, up: true } : c)
    })
  }, [])

  const scheduleNext = useCallback(() => {
    if (!runningRef.current) return
    const { up } = getLevel(scoreRef.current)
    const delay  = up + Math.random() * 300 - 150
    scheduleRef.current = setTimeout(() => { popMole(); scheduleNext() }, delay)
  }, [popMole])

  const start = useCallback(() => {
    runningRef.current = true
    setRunning(true)
    popMole()
    setTimeout(() => { if (runningRef.current) popMole() }, 400)
    scheduleNext()
    clockRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
  }, [popMole, scheduleNext])

  const pause = useCallback(() => {
    runningRef.current = false
    setRunning(false)
    clearAll()
    upRef.current.clear()
    setCells(prev => prev.map(c => ({ ...c, up: false, whacked: false })))
  }, [clearAll])

  const reset = useCallback(() => {
    runningRef.current = false
    scoreRef.current   = 0
    setRunning(false)
    setScore(0)
    setElapsed(0)
    setFloaters([])
    clearAll()
    upRef.current.clear()
    setCells(makeCells())
  }, [clearAll])

  const handleWhack = useCallback((idx: number, e: React.MouseEvent) => {
    if (!runningRef.current) return
    if (!upRef.current.has(idx)) return
    upRef.current.delete(idx)
    setCells(prev => prev.map((c, i) => i === idx ? { ...c, whacked: true } : c))
    scoreRef.current++
    setScore(scoreRef.current)
    const id = ++floaterIdRef.current
    setFloaters(fs => [...fs, { id, x: e.clientX, y: e.clientY }])
    const tid = setTimeout(() => {
      setCells(p => p.map((c, i) => i === idx ? { ...c, up: false, whacked: false } : c))
      setFloaters(fs => fs.filter(f => f.id !== id))
    }, 300)
    timersRef.current.push(tid)
  }, [])

  useEffect(() => () => clearAll(), [clearAll])

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: '#1e293b', color: '#f1f5f9',
      height: '100dvh', display: 'flex', flexDirection: 'column',
    }}>
      <style>{CSS}</style>

      {/* ── HUD ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', gap: 12, flexShrink: 0,
        borderBottom: '1px solid #334155', background: '#1e293b',
      }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700,
                     letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
          Whack-a-<span style={{ color: '#a855f7' }}>Mole</span>
        </h1>
        <div style={{ display: 'flex', gap: 20 }}>
          <Stat label="Score" value={score}              color="#a855f7" />
          <Stat label="Time"  value={fmtTime(elapsed)}   color="#fb923c" />
          <Stat label="Level" value={getLevelNum(score)}  color="#38bdf8" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="wam-btn"
            style={{ background: running ? '#f59e0b' : '#22c55e' }}
            onClick={running ? pause : start}
          >
            {running ? 'Pause' : 'Start'}
          </button>
          <button className="wam-btn" style={{ background: '#475569' }} onClick={reset}>
            Reset
          </button>
        </div>
      </header>

      {/* ── Board: fills remaining height, canvas centered with correct aspect ratio ── */}
      <main style={{
        flex: 1, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: BG,
      }}>
        {/* Canvas: height-driven, preserves 636×714 aspect ratio */}
        <div style={{
          position: 'relative',
          height: '100%',
          aspectRatio: `${CW} / ${CH}`,
          maxWidth: '100%',
          overflow: 'hidden',
          background: BG,
        }}>
          {ROWS.map((row, ri) => (
            <div key={ri}>
              {/* Hole ovals */}
              {row.holes.map((hole, hi) => (
                <div
                  key={hi}
                  style={{
                    position: 'absolute',
                    left: pct(hole.left, CW), top: pct(hole.top, CH),
                    width: pct(hole.w, CW),   height: pct(hole.h, CH),
                    zIndex: row.holeZ, pointerEvents: 'none',
                  }}
                >
                  <row.HoleSvg />
                </div>
              ))}

              {/* Per-cell moles — visual only, no pointer events */}
              {row.holes.map((hole, hi) => {
                const cellIdx = row.cellStart + hi
                const cell    = cells[cellIdx]
                const mLeft   = hole.left + hole.w / 2 - row.moleW / 2
                const isUp    = cell.up && !cell.whacked
                const cls     = ['wam-mwrap',
                  cell.up      ? 'wam-up'      : '',
                  cell.whacked ? 'wam-whacked' : '',
                ].join(' ')
                return (
                  <div
                    key={hi}
                    className={cls}
                    style={{
                      left:   pct(mLeft,           CW),
                      top:    pct(row.moleRestTop,  CH),
                      width:  pct(row.moleW,        CW),
                      height: pct(row.moleH,        CH),
                      zIndex: row.moleZ,
                      pointerEvents: 'none',
                      transform: isUp ? `translateY(-${row.upPct}%)` : 'translateY(0%)',
                    }}
                  >
                    <img
                      className="wam-mole"
                      src="/src/games/whack/bauchling1.gif"
                      alt="mole"
                      draggable={false}
                    />
                  </div>
                )
              })}

              {/* Permanent hit-zones — always pointer-events active; upRef gates scoring.
                  Covers the full mole visual area when risen, including the hole oval.
                  This keeps the click target alive during the sink animation and
                  catches clicks that arrive just after the hide timer fires. */}
              {row.holes.map((hole, hi) => {
                const cellIdx  = row.cellStart + hi
                const cell     = cells[cellIdx]
                const hzW      = row.moleW * 1.3   // 30% wider than mole for forgiveness
                const hzLeft   = hole.left + hole.w / 2 - hzW / 2
                // top = mole visual top when fully risen
                const hzTop    = row.moleRestTop - (row.upPct / 100) * row.moleH
                // bottom = just past the mask cutout (hole rim)
                const hzBottom = row.moleRestTop
                return (
                  <div
                    key={`hz-${hi}`}
                    onClick={(e) => handleWhack(cellIdx, e)}
                    style={{
                      position: 'absolute',
                      left:   pct(hzLeft,          CW),
                      top:    pct(hzTop,            CH),
                      width:  pct(hzW,              CW),
                      height: pct(hzBottom - hzTop, CH),
                      zIndex: 50,   // above all game layers
                      cursor: cell.up && !cell.whacked ? 'crosshair' : 'default',
                    }}
                  />
                )
              })}

              {/* Mask strip — same colour as background, hides mole bodies */}
              <div
                style={{
                  position: 'absolute',
                  left: '0', top: pct(row.maskTop, CH),
                  width: '100%', height: pct(row.maskH, CH),
                  zIndex: row.maskZ, pointerEvents: 'none',
                }}
              >
                <row.MaskSvg />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* +1 floaters */}
      {floaters.map(f => (
        <div key={f.id} className="wam-floater" style={{ left: f.x - 12, top: f.y - 20 }}>
          +1
        </div>
      ))}
    </div>
  )
}
