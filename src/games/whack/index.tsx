import { useState, useCallback, useRef, useEffect } from 'react'

// ── Speed schedule (score-based within a round) ───────────────────────────────
const SPEED_TIERS = [
  { threshold:  0, up: 1200, down: 1400 },
  { threshold:  5, up: 1050, down: 1250 },
  { threshold: 10, up:  900, down: 1100 },
  { threshold: 18, up:  750, down:  950 },
  { threshold: 28, up:  620, down:  800 },
] as const

function getSpeedTier(score: number, mult: number) {
  let i = 0
  for (; i < SPEED_TIERS.length - 1; i++) if (score < SPEED_TIERS[i + 1].threshold) break
  const t = SPEED_TIERS[i]
  return { up: Math.round(t.up * mult), down: Math.round(t.down * mult) }
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

// ── Mole catalogue ────────────────────────────────────────────────────────────
const MOLES = [
  { kind: 'bauchling1', src: '/src/games/whack/bauchling1.gif', isVirus: false },
  { kind: 'bauchling2', src: '/src/games/whack/bauchling2.gif', isVirus: false },
  { kind: 'virus1',     src: '/src/games/whack/virus1.gif',     isVirus: true  },
  { kind: 'virus2',     src: '/src/games/whack/virus2.gif',     isVirus: true  },
] as const
type Mole = typeof MOLES[number]

const VIRUSES   = MOLES.filter(m => m.isVirus)  as Mole[]
const ALL_MOLES = [...MOLES]                     as Mole[]

// ── Level definitions ─────────────────────────────────────────────────────────
const GAME_LEVELS = [
  {
    num: 1, color: '#7c3aed',
    title: 'Virus Hunt!',
    tagline: 'Hit all the viruses!',
    moles: VIRUSES,
    speedMult: 1.0,
  },
  {
    num: 2, color: '#ea580c',
    title: 'Watch Out!',
    tagline: 'Hit viruses, dodge bauchlings!',
    moles: ALL_MOLES,
    speedMult: 1.0,
  },
  {
    num: 3, color: '#0891b2',
    title: '⚡ Speed Round!',
    tagline: 'Everything moves faster — stay sharp!',
    moles: ALL_MOLES,
    speedMult: 0.5,
  },
]
const LEVEL_DURATION = 60
const TOTAL = 9

// ── Types ─────────────────────────────────────────────────────────────────────
type Phase     = 'start' | 'intro' | 'playing' | 'recap' | 'final'
type Cell      = { up: boolean; whacked: boolean; mole: Mole }
type Floater   = { id: number; x: number; y: number; delta: number }
type LevelStat = { virusHits: number; bauchlingHits: number; net: number }

const makeCell  = (): Cell => ({ up: false, whacked: false, mole: MOLES[2] })
const makeCells = ()       => Array.from({ length: TOTAL }, makeCell)

// ── SVG assets ────────────────────────────────────────────────────────────────
const BG   = '#e3cbe1'
const HOLE = '#3a3640'

function HoleRear()   { return <svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" viewBox="0 0 112 58"  fill="none"><ellipse cx="56"   cy="29"   rx="56"   ry="29"   fill={HOLE}/></svg> }
function HoleMiddle() { return <svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" viewBox="0 0 123 74"  fill="none"><ellipse cx="61.5" cy="37"   rx="61.5" ry="37"   fill={HOLE}/></svg> }
function HoleFront()  { return <svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" viewBox="0 0 137 89"  fill="none"><ellipse cx="68.5" cy="44.5" rx="68.5" ry="44.5" fill={HOLE}/></svg> }
function MaskRear()   { return <svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" viewBox="0 0 636 518" fill="none"><path d="M114 0C114 16.0163 139.072 29 170 29C200.928 29 226 16.0163 226 0H258C258 16.0163 283.072 29 314 29C344.928 29 370 16.0163 370 0H402C402 16.0163 427.072 29 458 29C488.928 29 514 16.0163 514 0H636V518H0V0H114Z" fill={BG}/></svg> }
function MaskMiddle() { return <svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" viewBox="0 0 636 357" fill="none"><path d="M92.0889 0C93.8158 19.5045 120.65 35 153.5 35C186.35 35 213.184 19.5045 214.911 0H252C252 20.4345 279.534 37 313.5 37C347.466 37 375 20.4345 375 0H412.089C413.816 19.5045 440.65 35 473.5 35C506.35 35 533.184 19.5045 534.911 0H636V357H0V0H92.0889Z" fill={BG}/></svg> }
function MaskFront()  { return <svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" viewBox="0 0 636 155" fill="none"><path d="M66.0391 0C67.2567 23.8822 97.4412 43 134.5 43C171.559 43 201.743 23.8822 202.961 0H246.039C247.257 23.8822 277.441 43 314.5 43C351.559 43 381.743 23.8822 382.961 0H426.039C427.257 23.8822 457.441 43 494.5 43C531.559 43 561.743 23.8822 562.961 0H636V155H0V0H66.0391Z" fill={BG}/></svg> }

const CW = 636
const CH = 714

type RowCfg = {
  cellStart: number
  holes: Array<{ left: number; top: number; w: number; h: number }>
  maskTop: number; maskH: number
  moleW: number; moleH: number; moleRestTop: number; upPct: number
  holeZ: number; moleZ: number; maskZ: number
  HoleSvg: () => React.ReactElement
  MaskSvg: () => React.ReactElement
}

const ROWS: RowCfg[] = [
  {
    cellStart: 0,
    holes: [
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
    cellStart: 3,
    holes: [
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
    cellStart: 6,
    holes: [
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

const pct = (v: number, total: number) => `${(v / total * 100).toFixed(3)}%`

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
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
    object-fit: cover; object-position: top center;
    display: block;
    animation: wam-wobble 0.55s ease-in-out infinite alternate;
    user-select: none; pointer-events: none;
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
  @keyframes wam-pop-in {
    0%   { opacity: 0; transform: scale(0.85) translateY(18px); }
    100% { opacity: 1; transform: scale(1)    translateY(0);    }
  }
  .wam-card {
    animation: wam-pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .wam-btn {
    border: none; border-radius: 12px; padding: 12px 28px;
    font-size: 18px; font-weight: 800; cursor: pointer; color: #fff;
    transition: opacity .15s, transform .1s;
    letter-spacing: -0.01em;
  }
  .wam-btn:hover  { opacity: .88; transform: scale(1.04); }
  .wam-btn:active { transform: scale(.96); }
  .wam-btn-sm {
    border: none; border-radius: 8px; padding: 7px 15px;
    font-size: 13px; font-weight: 700; cursor: pointer; color: #fff;
    transition: opacity .15s, transform .1s;
  }
  .wam-btn-sm:hover  { opacity: .88; transform: scale(1.03); }
  .wam-btn-sm:active { transform: scale(.97); }
  .wam-floater {
    position: fixed; font-size: 20px; font-weight: 800;
    pointer-events: none;
    animation: wam-float 0.75s ease forwards; z-index: 999;
  }
  .wam-rule-card {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px; border-radius: 16px;
    background: rgba(255,255,255,0.08);
    border: 2px solid rgba(255,255,255,0.12);
  }
  .wam-gif-preview {
    width: 72px; height: 72px; object-fit: contain;
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
  }
  .wam-stat-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border-radius: 14px;
    background: rgba(255,255,255,0.06);
  }
`

// ── Stat chip (HUD) ───────────────────────────────────────────────────────────
function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: '#94a3b8' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.1, color }}>{value}</div>
    </div>
  )
}

// ── Overlay wrapper ───────────────────────────────────────────────────────────
function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(10,12,20,0.82)', backdropFilter: 'blur(6px)',
      padding: 24,
    }}>
      {children}
    </div>
  )
}

// ── Level Intro screen ────────────────────────────────────────────────────────
function LevelIntro({ levelIdx, onPlay }: { levelIdx: number; onPlay: () => void }) {
  const lvl = GAME_LEVELS[levelIdx]
  const isL1 = levelIdx === 0
  const isL3 = levelIdx === 2

  return (
    <Overlay>
      <div className="wam-card" style={{
        background: '#1a1f35', borderRadius: 28, padding: '36px 32px',
        maxWidth: 480, width: '100%', color: '#f1f5f9',
        border: `2px solid ${lvl.color}44`,
        boxShadow: `0 0 60px ${lvl.color}33`,
        display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'center',
      }}>
        {/* Badge */}
        <div>
          <div style={{
            display: 'inline-block', padding: '4px 16px', borderRadius: 999,
            background: lvl.color, fontSize: 13, fontWeight: 700,
            letterSpacing: '0.06em', marginBottom: 10,
          }}>
            LEVEL {lvl.num} OF 3
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.1,
                        letterSpacing: '-0.02em' }}>
            {lvl.title}
          </div>
          <div style={{ marginTop: 6, color: '#94a3b8', fontSize: 16 }}>
            {lvl.tagline}
          </div>
        </div>

        {/* Rule cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Viruses — always hit */}
          <div className="wam-rule-card">
            <div style={{ display: 'flex', gap: 6 }}>
              <img className="wam-gif-preview" src="/src/games/whack/virus1.gif" alt="virus" />
              <img className="wam-gif-preview" src="/src/games/whack/virus2.gif" alt="virus" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 22 }}>✅ Hit these!</div>
              <div style={{ color: '#4ade80', fontWeight: 700, fontSize: 15 }}>
                Viruses → <strong>+1 point</strong>
              </div>
            </div>
          </div>

          {/* Bauchlings — level 2 and 3 only */}
          {!isL1 && (
            <div className="wam-rule-card">
              <div style={{ display: 'flex', gap: 6 }}>
                <img className="wam-gif-preview" src="/src/games/whack/bauchling1.gif" alt="bauchling" />
                <img className="wam-gif-preview" src="/src/games/whack/bauchling2.gif" alt="bauchling" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 22 }}>❌ Avoid these!</div>
                <div style={{ color: '#f87171', fontWeight: 700, fontSize: 15 }}>
                  Bauchlings → <strong>−1 point</strong>
                </div>
              </div>
            </div>
          )}

          {/* Speed warning for level 3 */}
          {isL3 && (
            <div style={{
              padding: '10px 16px', borderRadius: 12,
              background: '#0e7490', fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ⚡ Moles pop up twice as fast this round!
            </div>
          )}
        </div>

        {/* Timer reminder */}
        <div style={{ color: '#64748b', fontSize: 14 }}>
          ⏱ You have <strong style={{ color: '#f1f5f9' }}>60 seconds</strong>
        </div>

        <button className="wam-btn" style={{ background: lvl.color }}
                onClick={onPlay}>
          Let's Go! 🚀
        </button>
      </div>
    </Overlay>
  )
}

// ── Level Recap screen ────────────────────────────────────────────────────────
function LevelRecap({
  levelIdx, stat, totalScore,
  onNext,
}: {
  levelIdx: number
  stat: LevelStat
  totalScore: number
  onNext: () => void
}) {
  const lvl      = GAME_LEVELS[levelIdx]
  const isLast   = levelIdx === GAME_LEVELS.length - 1
  const stars    = stat.net >= 10 ? 3 : stat.net >= 5 ? 2 : stat.net >= 1 ? 1 : 0
  const starStr  = '⭐'.repeat(stars) + '✩'.repeat(3 - stars)

  return (
    <Overlay>
      <div className="wam-card" style={{
        background: '#1a1f35', borderRadius: 28, padding: '36px 32px',
        maxWidth: 460, width: '100%', color: '#f1f5f9',
        border: `2px solid ${lvl.color}44`,
        boxShadow: `0 0 60px ${lvl.color}33`,
        display: 'flex', flexDirection: 'column', gap: 22, textAlign: 'center',
      }}>
        {/* Header */}
        <div>
          <div style={{ fontSize: 40, marginBottom: 4 }}>🎉</div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>
            Level {lvl.num} Done!
          </div>
          <div style={{ fontSize: 28, marginTop: 6, letterSpacing: 4 }}>{starStr}</div>
        </div>

        {/* Stats breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="wam-stat-row">
            <img style={{ width: 48, height: 48, objectFit: 'contain' }}
                 src="/src/games/whack/virus1.gif" alt="virus" />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 700 }}>Viruses hit</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>+1 point each</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#4ade80' }}>
              +{stat.virusHits}
            </div>
          </div>

          {stat.bauchlingHits > 0 && (
            <div className="wam-stat-row">
              <img style={{ width: 48, height: 48, objectFit: 'contain' }}
                   src="/src/games/whack/bauchling1.gif" alt="bauchling" />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 700 }}>Bauchlings hit</div>
                <div style={{ color: '#94a3b8', fontSize: 13 }}>−1 point each</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f87171' }}>
                −{stat.bauchlingHits}
              </div>
            </div>
          )}

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 16px', borderRadius: 12,
            background: `${lvl.color}22`, border: `1px solid ${lvl.color}55`,
          }}>
            <span style={{ fontWeight: 700 }}>This level</span>
            <span style={{ fontSize: 24, fontWeight: 900,
                           color: stat.net >= 0 ? '#4ade80' : '#f87171' }}>
              {stat.net >= 0 ? '+' : ''}{stat.net} pts
            </span>
          </div>
        </div>

        {/* Total */}
        <div style={{
          padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ color: '#94a3b8', fontWeight: 600 }}>Total score</span>
          <span style={{ fontSize: 28, fontWeight: 900, color: '#a78bfa' }}>
            {totalScore} pts
          </span>
        </div>

        <button className="wam-btn"
                style={{ background: isLast ? '#059669' : GAME_LEVELS[levelIdx + 1]?.color ?? lvl.color }}
                onClick={onNext}>
          {isLast ? '🏁 See Final Score!' : `Level ${lvl.num + 1} →`}
        </button>
      </div>
    </Overlay>
  )
}

// ── Final screen ──────────────────────────────────────────────────────────────
function FinalScreen({
  stats, totalScore, onRestart,
}: {
  stats: LevelStat[]
  totalScore: number
  onRestart: () => void
}) {
  const medal = totalScore >= 30 ? '🥇' : totalScore >= 15 ? '🥈' : totalScore >= 5 ? '🥉' : '🎮'

  return (
    <Overlay>
      <div className="wam-card" style={{
        background: '#1a1f35', borderRadius: 28, padding: '36px 32px',
        maxWidth: 460, width: '100%', color: '#f1f5f9',
        border: '2px solid #7c3aed44',
        boxShadow: '0 0 80px #7c3aed44',
        display: 'flex', flexDirection: 'column', gap: 22, textAlign: 'center',
      }}>
        <div>
          <div style={{ fontSize: 56 }}>{medal}</div>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.02em', marginTop: 6 }}>
            Game Over!
          </div>
          <div style={{ fontSize: 44, fontWeight: 900, color: '#a78bfa', marginTop: 4 }}>
            {totalScore} pts
          </div>
        </div>

        {/* Per-level breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 14px', borderRadius: 12,
              background: `${GAME_LEVELS[i].color}1a`,
              border: `1px solid ${GAME_LEVELS[i].color}44`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  padding: '2px 10px', borderRadius: 999, fontSize: 12,
                  fontWeight: 700, background: GAME_LEVELS[i].color,
                }}>
                  L{i + 1}
                </span>
                <span style={{ color: '#94a3b8', fontSize: 13 }}>
                  🦠×{s.virusHits}
                  {s.bauchlingHits > 0 ? `  💚×${s.bauchlingHits}` : ''}
                </span>
              </div>
              <span style={{
                fontWeight: 800, fontSize: 18,
                color: s.net >= 0 ? '#4ade80' : '#f87171',
              }}>
                {s.net >= 0 ? '+' : ''}{s.net}
              </span>
            </div>
          ))}
        </div>

        <button className="wam-btn" style={{ background: '#7c3aed' }}
                onClick={onRestart}>
          Play Again 🔄
        </button>
      </div>
    </Overlay>
  )
}

// ── Start screen ──────────────────────────────────────────────────────────────
function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <Overlay>
      <div className="wam-card" style={{
        background: '#1a1f35', borderRadius: 28, padding: '40px 32px',
        maxWidth: 440, width: '100%', color: '#f1f5f9',
        border: '2px solid #7c3aed44',
        boxShadow: '0 0 60px #7c3aed33',
        display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'center',
      }}>
        <div>
          <div style={{ fontSize: 42, marginBottom: 6 }}>🦠🎯</div>
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.02em' }}>
            Whack-a-Mole!
          </div>
          <div style={{ color: '#94a3b8', marginTop: 8, fontSize: 16, lineHeight: 1.5 }}>
            3 levels · 1 minute each
          </div>
        </div>

        {/* Preview of moles */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          {ALL_MOLES.map(m => (
            <img key={m.kind} src={m.src} alt={m.kind}
                 style={{ width: 64, height: 64, objectFit: 'contain',
                          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }} />
          ))}
        </div>

        {/* Level overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {GAME_LEVELS.map(lvl => (
            <div key={lvl.num} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 12,
              background: `${lvl.color}1a`, border: `1px solid ${lvl.color}44`,
              textAlign: 'left',
            }}>
              <span style={{
                padding: '2px 12px', borderRadius: 999,
                background: lvl.color, fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                Level {lvl.num}
              </span>
              <span style={{ color: '#cbd5e1', fontSize: 14 }}>{lvl.tagline}</span>
            </div>
          ))}
        </div>

        <button className="wam-btn" style={{ background: '#7c3aed' }}
                onClick={onStart}>
          Start Game! 🚀
        </button>
      </div>
    </Overlay>
  )
}

// ── Main game ─────────────────────────────────────────────────────────────────
export default function WackAVirus() {
  const [phase,      setPhase]      = useState<Phase>('start')
  const [levelIdx,   setLevelIdx]   = useState(0)
  const [cells,      setCells]      = useState<Cell[]>(makeCells)
  const [timeLeft,   setTimeLeft]   = useState(LEVEL_DURATION)
  const [totalScore, setTotalScore] = useState(0)
  const [levelStats, setLevelStats] = useState<LevelStat[]>([])
  const [floaters,   setFloaters]   = useState<Floater[]>([])

  // per-level accumulators in refs (avoid stale closures)
  const totalScoreRef    = useRef(0)
  const levelVirusRef    = useRef(0)
  const levelBauchRef    = useRef(0)
  const runningRef       = useRef(false)
  const timersRef        = useRef<ReturnType<typeof setTimeout>[]>([])
  const scheduleRef      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clockRef         = useRef<ReturnType<typeof setInterval> | null>(null)
  const floaterIdRef     = useRef(0)
  const upRef            = useRef<Set<number>>(new Set())
  const moleKindRef      = useRef<Mole[]>(Array.from({ length: TOTAL }, () => MOLES[2]))
  const levelIdxRef      = useRef(0)

  const clearAll = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    if (scheduleRef.current) { clearTimeout(scheduleRef.current); scheduleRef.current = null }
    if (clockRef.current)    { clearInterval(clockRef.current);   clockRef.current    = null }
  }, [])

  const stopBoard = useCallback(() => {
    runningRef.current = false
    clearAll()
    upRef.current.clear()
    setCells(prev => prev.map(c => ({ ...c, up: false, whacked: false })))
  }, [clearAll])

  const popMole = useCallback(() => {
    if (!runningRef.current) return
    const lvl = GAME_LEVELS[levelIdxRef.current]
    setCells(prev => {
      const avail = prev.reduce<number[]>((a, c, i) =>
        !c.up && !c.whacked ? [...a, i] : a, [])
      if (!avail.length) return prev
      const idx   = avail[Math.floor(Math.random() * avail.length)]
      const pool  = lvl.moles as Mole[]
      const mole  = pool[Math.floor(Math.random() * pool.length)]
      const { down } = getSpeedTier(totalScoreRef.current, lvl.speedMult)
      const delay = down + Math.random() * 200 - 100
      moleKindRef.current[idx] = mole
      upRef.current.add(idx)
      const tid = setTimeout(() => {
        setCells(p => p.map((c, i) =>
          i === idx && c.up && !c.whacked ? { ...c, up: false } : c))
        requestAnimationFrame(() => upRef.current.delete(idx))
      }, delay)
      timersRef.current.push(tid)
      return prev.map((c, i) => i === idx ? { ...c, up: true, mole } : c)
    })
  }, [])

  const scheduleNext = useCallback(() => {
    if (!runningRef.current) return
    const lvl   = GAME_LEVELS[levelIdxRef.current]
    const { up } = getSpeedTier(totalScoreRef.current, lvl.speedMult)
    const delay  = up + Math.random() * 300 - 150
    scheduleRef.current = setTimeout(() => { popMole(); scheduleNext() }, delay)
  }, [popMole])

  // Called when 60s runs out
  const endLevel = useCallback(() => {
    stopBoard()
    const stat: LevelStat = {
      virusHits:    levelVirusRef.current,
      bauchlingHits: levelBauchRef.current,
      net: levelVirusRef.current - levelBauchRef.current,
    }
    setLevelStats(prev => [...prev, stat])
    setPhase('recap')
  }, [stopBoard])

  const startPlaying = useCallback((idx: number) => {
    levelIdxRef.current  = idx
    levelVirusRef.current = 0
    levelBauchRef.current = 0
    runningRef.current = true
    setCells(makeCells())
    upRef.current.clear()
    setTimeLeft(LEVEL_DURATION)
    setPhase('playing')

    popMole()
    setTimeout(() => { if (runningRef.current) popMole() }, 400)
    scheduleNext()

    let remaining = LEVEL_DURATION
    clockRef.current = setInterval(() => {
      remaining--
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(clockRef.current!)
        clockRef.current = null
        endLevel()
      }
    }, 1000)
  }, [popMole, scheduleNext, endLevel])

  const handleWhack = useCallback((idx: number, e: React.MouseEvent) => {
    if (!runningRef.current) return
    if (!upRef.current.has(idx)) return
    upRef.current.delete(idx)
    const mole  = moleKindRef.current[idx]
    const delta = mole.isVirus ? 1 : -1
    if (mole.isVirus) levelVirusRef.current++
    else              levelBauchRef.current++
    setCells(prev => prev.map((c, i) => i === idx ? { ...c, whacked: true } : c))
    totalScoreRef.current = Math.max(0, totalScoreRef.current + delta)
    setTotalScore(totalScoreRef.current)
    const id = ++floaterIdRef.current
    setFloaters(fs => [...fs, { id, x: e.clientX, y: e.clientY, delta }])
    const tid = setTimeout(() => {
      setCells(p => p.map((c, i) => i === idx ? { ...c, up: false, whacked: false } : c))
      setFloaters(fs => fs.filter(f => f.id !== id))
    }, 300)
    timersRef.current.push(tid)
  }, [])

  const handleNext = useCallback(() => {
    const next = levelIdx + 1
    if (next >= GAME_LEVELS.length) {
      setPhase('final')
    } else {
      setLevelIdx(next)
      setPhase('intro')
    }
  }, [levelIdx])

  const handleRestart = useCallback(() => {
    clearAll()
    totalScoreRef.current = 0
    levelVirusRef.current = 0
    levelBauchRef.current = 0
    setLevelIdx(0)
    setTotalScore(0)
    setLevelStats([])
    setFloaters([])
    setCells(makeCells())
    setPhase('start')
  }, [clearAll])

  useEffect(() => () => clearAll(), [clearAll])

  const lvl = GAME_LEVELS[levelIdx]

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
          <Stat label="Score" value={totalScore}       color="#a855f7" />
          <Stat label="Time"  value={phase === 'playing' ? fmtTime(timeLeft) : '–'}
                color={timeLeft <= 10 && phase === 'playing' ? '#ef4444' : '#fb923c'} />
          <Stat label="Level" value={phase === 'start' ? '–' : `${levelIdx + 1} / 3`}
                color={lvl.color} />
        </div>
        <button className="wam-btn-sm" style={{ background: '#475569' }}
                onClick={handleRestart}>
          Restart
        </button>
      </header>

      {/* ── Board ── */}
      <main style={{
        flex: 1, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: BG,
      }}>
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
              {row.holes.map((hole, hi) => (
                <div key={hi} style={{
                  position: 'absolute',
                  left: pct(hole.left, CW), top: pct(hole.top, CH),
                  width: pct(hole.w, CW),   height: pct(hole.h, CH),
                  zIndex: row.holeZ, pointerEvents: 'none',
                }}>
                  <row.HoleSvg />
                </div>
              ))}

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
                  <div key={hi} className={cls} style={{
                    left:   pct(mLeft,          CW),
                    top:    pct(row.moleRestTop, CH),
                    width:  pct(row.moleW,       CW),
                    height: pct(row.moleH,       CH),
                    zIndex: row.moleZ,
                    pointerEvents: 'none',
                    transform: isUp ? `translateY(-${row.upPct}%)` : 'translateY(0%)',
                  }}>
                    <img className="wam-mole" src={cell.mole.src}
                         alt={cell.mole.kind} draggable={false} />
                  </div>
                )
              })}

              {row.holes.map((hole, hi) => {
                const cellIdx  = row.cellStart + hi
                const cell     = cells[cellIdx]
                const hzW      = row.moleW * 1.3
                const hzLeft   = hole.left + hole.w / 2 - hzW / 2
                const hzTop    = row.moleRestTop - (row.upPct / 100) * row.moleH
                const hzBottom = row.moleRestTop
                return (
                  <div key={`hz-${hi}`}
                    onClick={(e) => handleWhack(cellIdx, e)}
                    style={{
                      position: 'absolute',
                      left:   pct(hzLeft,          CW),
                      top:    pct(hzTop,            CH),
                      width:  pct(hzW,              CW),
                      height: pct(hzBottom - hzTop, CH),
                      zIndex: 50,
                      cursor: cell.up && !cell.whacked ? 'crosshair' : 'default',
                    }}
                  />
                )
              })}

              <div style={{
                position: 'absolute',
                left: '0', top: pct(row.maskTop, CH),
                width: '100%', height: pct(row.maskH, CH),
                zIndex: row.maskZ, pointerEvents: 'none',
              }}>
                <row.MaskSvg />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── Overlays ── */}
      {phase === 'start' && (
        <StartScreen onStart={() => { setLevelIdx(0); setPhase('intro') }} />
      )}
      {phase === 'intro' && (
        <LevelIntro levelIdx={levelIdx} onPlay={() => startPlaying(levelIdx)} />
      )}
      {phase === 'recap' && (
        <LevelRecap
          levelIdx={levelIdx}
          stat={levelStats[levelStats.length - 1]}
          totalScore={totalScore}
          onNext={handleNext}
        />
      )}
      {phase === 'final' && (
        <FinalScreen stats={levelStats} totalScore={totalScore} onRestart={handleRestart} />
      )}

      {/* score floaters */}
      {floaters.map(f => (
        <div key={f.id} className="wam-floater"
             style={{ left: f.x - 12, top: f.y - 20,
                      color: f.delta > 0 ? '#22c55e' : '#ef4444' }}>
          {f.delta > 0 ? '+1' : '−1'}
        </div>
      ))}
    </div>
  )
}
