import { useState, useCallback, useRef, useEffect } from 'react'

// ── Constants ──────────────────────────────────────────────────────────────────
const TOTAL = 16
const VIRUSES = ['🦠', '🧫', '🔬'] as const

// Speed ramps up as score climbs: up = ms between spawns, down = ms virus stays visible
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
type Cell = { up: boolean; emoji: string; whacked: boolean }
type Floater = { id: number; x: number; y: number }

const makeCell = (): Cell => ({ up: false, emoji: '🦠', whacked: false })
const makeCells = () => Array.from({ length: TOTAL }, makeCell)

// ── CSS (injected once) ────────────────────────────────────────────────────────
const CSS = `
  .wav-wrap {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    transform: translateY(110%);
    transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1);
    pointer-events: none;
  }
  .wav-up .wav-wrap { transform: translateY(0); }
  .wav-whacked .wav-wrap { transform: translateY(110%); transition: transform 0.1s ease-in; }
  .wav-virus { animation: wav-wobble 0.6s ease-in-out infinite alternate; }
  .wav-whacked .wav-virus { animation: wav-splat 0.25s ease forwards; }
  @keyframes wav-wobble {
    from { transform: rotate(-5deg) scale(1); }
    to   { transform: rotate(5deg) scale(1.08); }
  }
  @keyframes wav-splat {
    0%   { transform: scale(1); opacity: 1; }
    50%  { transform: scale(1.5) rotate(20deg); opacity: .7; }
    100% { transform: scale(.2) rotate(-30deg); opacity: 0; }
  }
  @keyframes wav-float {
    0%   { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-60px) scale(1.3); }
  }
  .wav-floater {
    position: fixed; font-size: 18px; font-weight: 800;
    color: #22c55e; pointer-events: none;
    animation: wav-float 0.8s ease forwards; z-index: 200;
  }
  .wav-btn {
    border: none; border-radius: 7px; padding: 7px 15px;
    font-size: 13px; font-weight: 700; cursor: pointer; color: #fff;
    transition: opacity .15s, transform .1s;
  }
  .wav-btn:hover  { opacity: .88; transform: scale(1.03); }
  .wav-btn:active { transform: scale(.97); }
`

// ── Hole ───────────────────────────────────────────────────────────────────────
function Hole({ cell, onWhack }: { cell: Cell; onWhack: (e: React.MouseEvent) => void }) {
  const cls = ['wav-hole', cell.up ? 'wav-up' : '', cell.whacked ? 'wav-whacked' : ''].join(' ')
  return (
    <div
      className={cls}
      onClick={cell.up && !cell.whacked ? onWhack : undefined}
      style={{
        aspectRatio: '1',
        background: '#0a0f1e',
        borderRadius: '50%',
        border: `3px solid ${cell.up ? '#ef4444' : cell.whacked ? '#22c55e' : '#334155'}`,
        position: 'relative',
        overflow: 'hidden',
        cursor: cell.up ? 'crosshair' : 'default',
        boxShadow: 'inset 0 6px 12px rgba(0,0,0,.6)',
        transition: 'border-color .15s',
      }}
    >
      <div className="wav-wrap">
        <span
          className="wav-virus"
          style={{
            fontSize: 'clamp(26px,7vw,48px)',
            userSelect: 'none',
            display: 'inline-block',
            filter: 'drop-shadow(0 0 8px rgba(239,68,68,.6))',
          }}
        >
          {cell.emoji}
        </span>
      </div>
    </div>
  )
}

// ── Stat chip ──────────────────────────────────────────────────────────────────
function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.1, color }}>{value}</div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function WackAVirus() {
  const [cells, setCells]     = useState<Cell[]>(makeCells)
  const [score, setScore]     = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [floaters, setFloaters] = useState<Floater[]>([])

  const scoreRef    = useRef(0)
  const runningRef  = useRef(false)
  const timersRef   = useRef<ReturnType<typeof setTimeout>[]>([])
  const scheduleRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clockRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const floaterIdRef = useRef(0)

  const clearAll = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    if (scheduleRef.current) { clearTimeout(scheduleRef.current); scheduleRef.current = null }
    if (clockRef.current)    { clearInterval(clockRef.current);   clockRef.current = null }
  }, [])

  const popVirus = useCallback(() => {
    if (!runningRef.current) return
    setCells(prev => {
      const avail = prev.reduce<number[]>((a, c, i) => (!c.up && !c.whacked ? [...a, i] : a), [])
      if (!avail.length) return prev
      const idx   = avail[Math.floor(Math.random() * avail.length)]
      const emoji = VIRUSES[Math.floor(Math.random() * VIRUSES.length)]
      const { down } = getLevel(scoreRef.current)
      const delay = down + Math.random() * 200 - 100
      const tid = setTimeout(() => {
        setCells(p => p.map((c, i) => i === idx && c.up && !c.whacked ? { ...c, up: false } : c))
      }, delay)
      timersRef.current.push(tid)
      return prev.map((c, i) => i === idx ? { ...c, up: true, emoji } : c)
    })
  }, [])

  const scheduleNext = useCallback(() => {
    if (!runningRef.current) return
    const { up } = getLevel(scoreRef.current)
    const delay = up + Math.random() * 300 - 150
    scheduleRef.current = setTimeout(() => { popVirus(); scheduleNext() }, delay)
  }, [popVirus])

  const start = useCallback(() => {
    runningRef.current = true
    setRunning(true)
    popVirus()
    setTimeout(() => { if (runningRef.current) popVirus() }, 300)
    scheduleNext()
    clockRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
  }, [popVirus, scheduleNext])

  const pause = useCallback(() => {
    runningRef.current = false
    setRunning(false)
    clearAll()
    setCells(prev => prev.map(c => ({ ...c, up: false, whacked: false })))
  }, [clearAll])

  const reset = useCallback(() => {
    runningRef.current = false
    scoreRef.current = 0
    setRunning(false)
    setScore(0)
    setElapsed(0)
    setFloaters([])
    clearAll()
    setCells(makeCells())
  }, [clearAll])

  const handleWhack = useCallback((idx: number, e: React.MouseEvent) => {
    if (!runningRef.current) return
    let hit = false
    setCells(prev => {
      if (!prev[idx].up || prev[idx].whacked) return prev
      hit = true
      return prev.map((c, i) => i === idx ? { ...c, whacked: true } : c)
    })
    if (!hit) return
    scoreRef.current++
    setScore(scoreRef.current)
    const id = ++floaterIdRef.current
    setFloaters(fs => [...fs, { id, x: e.clientX, y: e.clientY }])
    const tid = setTimeout(() => {
      setCells(p => p.map((c, i) => i === idx ? { ...c, up: false, whacked: false } : c))
      setFloaters(fs => fs.filter(f => f.id !== id))
    }, 280)
    timersRef.current.push(tid)
  }, [])

  // Cleanup on unmount
  useEffect(() => () => clearAll(), [clearAll])

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: '#0f172a', color: '#f1f5f9',
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
    }}>
      <style>{CSS}</style>

      {/* HUD */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', gap: 12, flexShrink: 0,
        borderBottom: '1px solid #334155', background: '#1e293b',
      }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
          Whack-a-<span style={{ color: '#38bdf8' }}>Virus</span>
        </h1>

        <div style={{ display: 'flex', gap: 20 }}>
          <Stat label="Score" value={score}              color="#fbbf24" />
          <Stat label="Time"  value={fmtTime(elapsed)}   color="#fb923c" />
          <Stat label="Level" value={getLevelNum(score)}  color="#38bdf8" />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="wav-btn"
            style={{ background: running ? '#f59e0b' : '#22c55e' }}
            onClick={running ? pause : start}
          >
            {running ? 'Pause' : 'Start'}
          </button>
          <button
            className="wav-btn"
            style={{ background: '#475569' }}
            onClick={reset}
          >
            Reset
          </button>
        </div>
      </header>

      {/* Grid */}
      <main style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14, width: '100%', maxWidth: 500,
        }}>
          {cells.map((cell, i) => (
            <Hole key={i} cell={cell} onWhack={e => handleWhack(i, e)} />
          ))}
        </div>
      </main>

      {/* +1 floaters */}
      {floaters.map(f => (
        <div key={f.id} className="wav-floater" style={{ left: f.x - 12, top: f.y - 12 }}>
          +1
        </div>
      ))}
    </div>
  )
}
