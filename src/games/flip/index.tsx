import { useState, useCallback, useEffect } from 'react'
import '@fontsource-variable/nunito'
import {
  RotateCcw, ChevronRight, ChevronDown, X, Plus, Minus, Star,
  Apple, Banana, Carrot, Cherry, Citrus, Cookie, Ham, IceCreamCone, LeafyGreen, Lollipop,
  type LucideIcon,
} from 'lucide-react'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { LEVELS, type Level, type Sprite } from './sprites'
import { playFlip, playMatch, playTurn, playWin } from './sounds'

// ─── Responsive layout ────────────────────────────────────────────────────────
// the page never scrolls, so the floor has to stay small enough that the
// biggest board (32 cards) still fits a short phone rather than getting clipped
const MIN_CARD = 48
const MAX_CARD = 160
const GRID_GAP = 10

function getDivisors(n: number): number[] {
  const divs: number[] = []
  for (let i = 2; i <= Math.min(n, 12); i++) {
    if (n % i === 0) divs.push(i)
  }
  return divs
}

function calcLayout(totalCards: number, headerH: number) {
  const availW = window.innerWidth - 32
  const availH = window.innerHeight - headerH
  let bestCols = Math.min(4, totalCards), bestSize = -Infinity
  for (const cols of getDivisors(totalCards)) {
    const rows = totalCards / cols
    const byW = (availW - GRID_GAP * (cols - 1)) / cols
    const byH = (availH - GRID_GAP * (rows - 1)) / rows
    const size = Math.min(byW, byH)
    if (size > bestSize) { bestCols = cols; bestSize = size }
  }
  const rows = totalCards / bestCols
  return { cols: bestCols, rows, size: Math.max(MIN_CARD, Math.min(MAX_CARD, bestSize)) }
}

function useLayout(totalCards: number, headerH: number) {
  const [layout, setLayout] = useState(() => calcLayout(totalCards, headerH))
  useEffect(() => {
    const update = () => setLayout(calcLayout(totalCards, headerH))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [totalCards, headerH])
  return layout
}

// ─── Game state ───────────────────────────────────────────────────────────────
type Card = { uid: number; spriteId: string; flipped: boolean; matched: boolean; claimedBy: number | null }

// rainbow order, pinks after purple, cookie last. hues are spaced far enough apart
// that any four picked together stay tellable apart at badge size
const PLAYER_ICONS: { id: string; name: string; color: string; Icon: LucideIcon }[] = [
  { id: 'apple',       name: 'Apple',  color: '#E03131', Icon: Apple },        // red
  { id: 'carrot',      name: 'Carol',  color: '#F76707', Icon: Carrot },       // orange
  { id: 'banana',      name: 'Banana', color: '#FFC400', Icon: Banana },       // bright yellow
  { id: 'citrus',      name: 'Citrus', color: '#A0B816', Icon: Citrus },       // greenish yellow
  { id: 'leafy-green', name: 'Leafy',  color: '#2F9E44', Icon: LeafyGreen },   // green
  { id: 'ice-cream',   name: 'Icey',   color: '#1C7ED6', Icon: IceCreamCone }, // blue
  { id: 'cherry',      name: 'Cherry', color: '#7950F2', Icon: Cherry },       // violet
  { id: 'ham',         name: 'Ham',    color: '#E85D9E', Icon: Ham },          // deep pink
  { id: 'lollipop',    name: 'Lolli',  color: '#F58BB6', Icon: Lollipop },     // light pink
  { id: 'cookie',      name: 'Cookie', color: '#8D6E63', Icon: Cookie },       // brown
]

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 640px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setMobile(mq.matches)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return mobile
}

// the board is always sized to the viewport — pin the page so it can't scroll or
// rubber-band, and swallow the long-press/right-click menu, while the game is mounted
function usePageLock() {
  useEffect(() => {
    const html = document.documentElement
    const { body } = document
    const prev = {
      htmlOverflow: html.style.overflow,
      overflow: body.style.overflow,
      overscroll: body.style.overscrollBehavior,
      position: body.style.position,
      width: body.style.width,
      height: body.style.height,
    }
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'
    body.style.position = 'fixed'  // iOS won't rubber-band a fixed body
    body.style.width = '100%'
    body.style.height = '100%'

    const swallow = (e: Event) => e.preventDefault()
    document.addEventListener('contextmenu', swallow)
    return () => {
      html.style.overflow = prev.htmlOverflow
      body.style.overflow = prev.overflow
      body.style.overscrollBehavior = prev.overscroll
      body.style.position = prev.position
      body.style.width = prev.width
      body.style.height = prev.height
      document.removeEventListener('contextmenu', swallow)
    }
  }, [])
}

// difficulty as a fixed row of 5 stars: `count` filled in light yellow, the rest hollow
// (sized explicitly so menu-item svg rules don't inflate them)
function StarRow({ count, style }: { count: number; style?: React.CSSProperties }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center', ...style }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="size-3"
          strokeWidth={2}
          fill={i < count ? '#FFD666' : 'transparent'}
          color={i < count ? '#FFD666' : '#CFCFCF'}
        />
      ))}
    </span>
  )
}

// solid colored disc + white icon — the one way player symbols render everywhere
function IconBadge({ entry, size }: { entry: typeof PLAYER_ICONS[number]; size: number }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%', background: entry.color,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <entry.Icon size={size * 0.62} color="#fff" strokeWidth={2.75} />
    </span>
  )
}

// multiplayer unlocks with difficulty: 1★ solo only, 2★ up to 2P, 3★+ up to 4P
const maxPlayersFor = (lvl: Level) => lvl.stars === 1 ? 1 : lvl.stars === 2 ? 2 : 4

// system navigation chrome is neutral — color coding is reserved for players
const NAV_COLOR = '#71717A'

// v2: the icon list grew mid-order, so old saved indices no longer mean the same
// icon — start those players fresh on the defaults instead of remapping them
const ICONS_STORAGE_KEY = 'flip-player-icons-v2'

// default assignment: pink, blue, yellow, green — high contrast in any subset
const DEFAULT_ICONS = ['ham', 'ice-cream', 'banana', 'leafy-green']

// ensure the first `count` slots hold distinct icons — a hidden slot can clash
// with a pick made while it was out of the game
function dedupeIcons(icons: number[], count: number): number[] {
  const out = [...icons]
  const used = new Set<number>()
  for (let q = 0; q < count; q++) {
    if (used.has(out[q])) {
      const all = PLAYER_ICONS.map((_, i) => i)
      out[q] = all.find(i => !used.has(i) && !out.includes(i)) ?? all.find(i => !used.has(i))!
    }
    used.add(out[q])
  }
  return out
}

function loadPlayerIcons(): number[] {
  try {
    const saved = JSON.parse(localStorage.getItem(ICONS_STORAGE_KEY) || 'null')
    if (
      Array.isArray(saved) && saved.length === 4 &&
      saved.every(i => Number.isInteger(i) && i >= 0 && i < PLAYER_ICONS.length) &&
      new Set(saved).size === 4
    ) return saved
  } catch { /* fall through to defaults */ }
  return DEFAULT_ICONS.map(id => PLAYER_ICONS.findIndex(p => p.id === id))
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeCards(level: Level): Card[] {
  const picked = shuffle(level.sprites).slice(0, level.setSize)
  return shuffle(picked.flatMap((s: Sprite) => [s.id, s.id])).map((spriteId, i) => ({
    uid: i, spriteId, flipped: false, matched: false, claimedBy: null,
  }))
}

// ─── FlipCard ─────────────────────────────────────────────────────────────────
function FlipCard({ card, level, size, playerIcons, onClick }: {
  card: Card; level: Level; size: number; playerIcons: number[]; onClick: () => void
}) {
  const sprite = level.sprites.find(s => s.id === card.spriteId)!
  const revealed = card.flipped || card.matched
  const claim = card.claimedBy !== null ? PLAYER_ICONS[playerIcons[card.claimedBy]] : null
  const ringColor = claim ? claim.color : level.backColor
  return (
    <div
      onClick={revealed ? undefined : onClick}
      style={{ width: size, height: size, perspective: '700px', cursor: revealed ? 'default' : 'pointer' }}
    >
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 0.4s ease',
      }}>
        {/* Back */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          borderRadius: 14, background: level.backColor,
          boxShadow: '0 4px 12px rgba(0,0,0,0.13)',
        }} />
        {/* Front */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)', borderRadius: 14, background: '#fff',
          boxShadow: card.matched
            ? `0 0 0 3px ${ringColor}, 0 4px 12px rgba(0,0,0,0.08)`
            : '0 4px 12px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img
            src={`/src/games/flip/${sprite.file}.jpg`}
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Claim stamp — multiplayer */}
          {claim && (
            <div style={{
              position: 'absolute', top: '5%', right: '5%',
              width: size * 0.3, height: size * 0.3, borderRadius: '50%',
              background: claim.color + 'E6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: 'rotate(12deg)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              animation: 'stamp-in 0.35s ease-out',
            }}>
              <claim.Icon size={size * 0.17} color="#fff" strokeWidth={2.5} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ghost stepper button for the player-count switcher
function StepBtn({ disabled, onClick, title, children }: {
  disabled: boolean; onClick: () => void; title: string; children: React.ReactNode
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      title={title}
      style={{
        width: 30, height: 30, borderRadius: '50%', border: 'none',
        background: 'transparent', color: '#666',
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.25 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </button>
  )
}

// ─── Icon button ──────────────────────────────────────────────────────────────
function IconBtn({ onClick, title, children }: {
  onClick: () => void; title: string; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 40, height: 40, borderRadius: '50%', border: 'none',
        background: 'rgba(255,255,255,0.75)', color: '#555', cursor: 'pointer', flexShrink: 0,
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </button>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function FlipGame() {
  const [levelIdx, setLevelIdx] = useState(() => Math.max(0, LEVELS.findIndex(l => l.title === 'Nature')))
  const level = LEVELS[levelIdx]

  const isMobile = useIsMobile()
  usePageLock()
  const [players, setPlayers] = useState(1)   // 1 = solo, 2-4 = take turns
  const [turn, setTurn] = useState(0)
  const multi = players > 1

  // icon per player slot — random by default, kept across games via localStorage
  const [playerIcons, setPlayerIcons] = useState<number[]>(loadPlayerIcons)
  const [pickerFor, setPickerFor] = useState<number | null>(null)
  useEffect(() => {
    localStorage.setItem(ICONS_STORAGE_KEY, JSON.stringify(playerIcons))
  }, [playerIcons])
  // multi reserves extra room for the fixed turn indicator at the bottom
  const { cols, rows, size } = useLayout(level.setSize * 2, multi ? 260 : 180)

  const [cards, setCards] = useState<Card[]>(() => makeCards(level))
  const [pending, setPending] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)
  const [modalDismissed, setModalDismissed] = useState(false)

  const won = cards.every(c => c.matched)
  // next level = next difficulty tier, random theme within it
  const nextLevels = LEVELS.filter(l => l.stars === level.stars + 1)
  const hasNext = nextLevels.length > 0

  const scores = Array.from({ length: players }, (_, p) => cards.filter(c => c.claimedBy === p).length)
  const topScore = Math.max(...scores)
  const winners = scores.flatMap((s, p) => s === topScore ? [p] : [])

  const reset = useCallback((lvl: Level) => {
    setCards(makeCards(lvl))
    setPending(null)
    setLocked(false)
    setTurn(0)
    setModalDismissed(false)
  }, [])

  const changePlayers = (n: number) => {
    if (n === players) return
    if (n > players) setPlayerIcons(prev => dedupeIcons(prev, n))
    setPlayers(n)
    setPickerFor(null)
    reset(level)
  }

  const gotoLevel = (idx: number) => {
    const lvl = LEVELS[idx]
    setLevelIdx(idx)
    setPlayers(p => Math.min(p, maxPlayersFor(lvl)))
    setPickerFor(null)
    reset(lvl)
  }

  const goNext = () => {
    const next = nextLevels[Math.floor(Math.random() * nextLevels.length)]
    gotoLevel(LEVELS.indexOf(next))
  }

  // celebratory fanfare when the board is cleared
  useEffect(() => {
    if (!won) return
    const t = setTimeout(playWin, 450)
    return () => clearTimeout(t)
  }, [won])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'x' || e.key === 'X')
        setCards(prev => prev.map(c => ({ ...c, flipped: true, matched: true })))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleFlip = useCallback((uid: number) => {
    if (locked || uid === pending) return
    const card = cards.find(c => c.uid === uid)!
    if (card.flipped || card.matched) return
    playFlip()
    setCards(prev => prev.map(c => c.uid === uid ? { ...c, flipped: true } : c))
    if (pending === null) { setPending(uid); return }

    const firstUid = pending
    const first = cards.find(c => c.uid === firstUid)!
    const isMatch = first.spriteId === card.spriteId
    setLocked(true); setPending(null)

    if (isMatch) {
      // matched pair: in multiplayer the current player claims it and keeps the turn
      const owner = multi ? turn : null
      setCards(prev => prev.map(c =>
        c.uid === firstUid || c.uid === uid ? { ...c, matched: true, claimedBy: owner } : c))
      setTimeout(playMatch, 250)   // after the flip animation reveals the pair
    }
    setTimeout(() => {
      if (!isMatch) {
        setCards(prev => prev.map(c =>
          c.uid === firstUid || c.uid === uid ? { ...c, flipped: false } : c))
        if (multi) {
          setTurn(t => (t + 1) % players)
          setTimeout(playTurn, 200) // reminder for the next player, after the cards flip back
        }
      }
      setLocked(false)
    }, 900)
  }, [locked, pending, cards, multi, turn, players])

  return (
    <div style={{
      height: '100dvh', overflow: 'hidden',
      background: 'linear-gradient(160deg, #e0f7ff 0%, #fff9e6 60%, #ffe0f0 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 20,
      fontFamily: '"Nunito Variable", Nunito, sans-serif',
      userSelect: 'none', padding: '60px 16px 32px',
      position: 'relative',
    }}>
      {/* Header — restart | mode + level switchers | next, all vertically centered */}
      <div style={{
        position: 'absolute', top: 16, left: isMobile ? 10 : 20, right: isMobile ? 10 : 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: isMobile ? 6 : 12,
      }}>
        <IconBtn onClick={() => reset(level)} title="Restart">
          <RotateCcw size={20} strokeWidth={2.5} />
        </IconBtn>

        <div style={{ display: 'flex', gap: isMobile ? 6 : 10, alignItems: 'center', flexWrap: 'nowrap', justifyContent: 'center' }}>
          {/* player-count stepper: ( − 👤👤 + ) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2, padding: 4, borderRadius: 999,
            background: 'rgba(255,255,255,0.75)', boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          }}>
            <StepBtn
              disabled={players <= 1}
              onClick={() => changePlayers(players - 1)}
              title="Remove player"
            >
              <Minus size={16} strokeWidth={2.75} />
            </StepBtn>
            <span style={{ fontSize: isMobile ? 13 : 15, padding: isMobile ? '0 2px' : '0 4px', letterSpacing: 1, whiteSpace: 'nowrap' }}>
              {'👤'.repeat(players)}
            </span>
            <StepBtn
              disabled={players >= maxPlayersFor(level)}
              onClick={() => changePlayers(players + 1)}
              title="Add player"
            >
              <Plus size={16} strokeWidth={2.75} />
            </StepBtn>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger style={{
              display: 'inline-flex', alignItems: 'center', gap: isMobile ? 4 : 7,
              border: 'none', borderRadius: 999, padding: isMobile ? '10px 12px' : '10px 16px',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 800, color: '#555',
              cursor: 'pointer', background: 'rgba(255,255,255,0.75)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)', whiteSpace: 'nowrap',
            }}>
              {isMobile ? level.emoji : `${level.emoji} ${level.title}`}
              <ChevronDown className="size-4" strokeWidth={2.75} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="w-auto min-w-44 rounded-xl"
              style={{ fontFamily: '"Nunito Variable", Nunito, sans-serif' }}
            >
              {LEVELS.map((lvl, i) => (
                <DropdownMenuItem
                  key={lvl.id}
                  onClick={() => gotoLevel(i)}
                  className={`cursor-pointer py-1.5 ${i === levelIdx ? 'bg-accent font-extrabold' : 'font-bold'}`}
                >
                  <span>{lvl.emoji} {lvl.title}</span>
                  <StarRow count={lvl.stars} style={{ marginLeft: 'auto', paddingLeft: 16 }} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right slot — next / replay when won (multi: after the modal is dismissed); else a spacer to keep the center balanced */}
        {won && (!multi || modalDismissed) && hasNext ? (
          <IconBtn onClick={goNext} title="Next level">
            <ChevronRight size={22} strokeWidth={2.5} />
          </IconBtn>
        ) : won && (!multi || modalDismissed) && !hasNext ? (
          <IconBtn onClick={() => gotoLevel(0)} title="Play again from start">
            <span style={{ fontSize: 20 }}>👏</span>
          </IconBtn>
        ) : (
          <div style={{ width: 40, height: 40, flexShrink: 0 }} />
        )}
      </div>

      {/* Title + stars */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5, color: '#333' }}>
          {won && !multi ? '🎉 All matched!' : `${level.emoji} ${level.title}`}
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${size}px)`,
        gridTemplateRows: `repeat(${rows}, ${size}px)`,
        gap: 10,
      }}>
        {cards.map(card => (
          <FlipCard key={card.uid} card={card} level={level} size={size} playerIcons={playerIcons} onClick={() => handleFlip(card.uid)} />
        ))}
      </div>

      {/* Players / turn indicator — multiplayer only, pinned to the bottom center */}
      {multi && (
        <div style={{
          position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'nowrap',
          justifyContent: 'center', zIndex: 5, whiteSpace: 'nowrap', maxWidth: '100vw',
        }}>
          {Array.from({ length: players }, (_, p) => {
            const active = !won && p === turn
            const isWinner = won && winners.includes(p)
            const entry = PLAYER_ICONS[playerIcons[p]]
            const { name, color } = entry
            return (
              <Popover key={p} open={pickerFor === p} onOpenChange={open => setPickerFor(open ? p : null)}>
                <PopoverTrigger
                  title="Pick your icon"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: isMobile ? 6 : '6px 14px', borderRadius: 999, background: '#fff',
                    border: `2.5px solid ${active || isWinner ? color : 'transparent'}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    opacity: active || isWinner || won ? 1 : 0.55,
                    transform: active ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.25s ease',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <IconBadge entry={entry} size={20} />
                  {!isMobile && (
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#444' }}>
                      {name}
                    </span>
                  )}
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  sideOffset={8}
                  className="w-auto rounded-2xl p-3"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}
                >
                  {PLAYER_ICONS.map((opt, i) => {
                    // only icons held by players in the current game block a pick
                    const taken = playerIcons.some((v, q) => q !== p && q < players && v === i)
                    const selected = playerIcons[p] === i
                    return (
                      <button
                        key={opt.id}
                        disabled={taken}
                        title={opt.name}
                        onClick={() => {
                          setPlayerIcons(prev => prev.map((v, q) => q === p ? i : v))
                          setPickerFor(null)
                        }}
                        style={{
                          width: 38, height: 38, borderRadius: '50%', border: 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: opt.color,
                          boxShadow: selected ? `0 0 0 2.5px #fff, 0 0 0 5px ${opt.color}` : 'none',
                          cursor: taken ? 'not-allowed' : 'pointer',
                          opacity: taken ? 0.25 : 1,
                        }}
                      >
                        <opt.Icon size={20} strokeWidth={2.5} color="#fff" />
                      </button>
                    )
                  })}
                </PopoverContent>
              </Popover>
            )
          })}
        </div>
      )}

      {/* Winner modal — multiplayer */}
      {won && multi && !modalDismissed && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10,
          background: 'rgba(40,30,50,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fade-in 0.25s ease-out 0.7s backwards',
        }}>
          <div style={{
            position: 'relative',
            background: '#fff', borderRadius: 24, padding: '30px 40px 26px',
            textAlign: 'center', minWidth: 260,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s backwards',
          }}>
            <button
              onClick={() => setModalDismissed(true)}
              title="Close"
              style={{
                position: 'absolute', top: 12, right: 12,
                width: 30, height: 30, borderRadius: '50%', border: 'none',
                background: '#f0f0f0', color: '#888', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={16} strokeWidth={2.75} />
            </button>
            <div style={{ fontSize: 56, lineHeight: 1.2 }}>{winners.length > 1 ? '🤝' : '🏆'}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#333', marginBottom: 18 }}>
              {winners.length > 1 ? 'It\'s a tie!' : `${PLAYER_ICONS[playerIcons[winners[0]]].name} wins!`}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
              {scores
                .map((score, p) => ({ score, p }))
                .sort((a, b) => b.score - a.score)
                .map(({ score, p }) => {
                  const entry = PLAYER_ICONS[playerIcons[p]]
                  const { name, color } = entry
                  return (
                    <div key={p} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 14px', borderRadius: 12,
                      background: winners.includes(p) ? color + '1A' : '#f5f5f5',
                    }}>
                      <IconBadge entry={entry} size={20} />
                      <span style={{ flex: 1, textAlign: 'left', fontSize: 15, fontWeight: 800, color: '#444' }}>
                        {name}{winners.includes(p) && ' 🏆'}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 900, color }}>
                        {score}
                      </span>
                    </div>
                  )
                })}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => reset(level)}
                style={{
                  border: `2px solid ${NAV_COLOR}`, borderRadius: 999, padding: '9px 20px',
                  background: '#fff', color: NAV_COLOR,
                  fontFamily: 'inherit', fontSize: 15, fontWeight: 800, cursor: 'pointer',
                }}
              >
                Play again
              </button>
              {hasNext && (
                <button
                  onClick={goNext}
                  style={{
                    border: 'none', borderRadius: 999, padding: '9px 20px',
                    background: NAV_COLOR, color: '#fff',
                    fontFamily: 'inherit', fontSize: 15, fontWeight: 800, cursor: 'pointer',
                  }}
                >
                  Next level
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* nothing on the page is selectable or draggable — long-pressing a card
           should flip it, not pop the copy/share callout. body-level so the
           portalled menus and popovers are covered too. */
        body, body * {
          -webkit-user-select: none; user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }
        body img { -webkit-user-drag: none; }
        body { touch-action: manipulation; }
        @keyframes stamp-in { 0% { transform: rotate(12deg) scale(2); opacity: 0 } 100% { transform: rotate(12deg) scale(1); opacity: 1 } }
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pop-in { 0% { transform: scale(0.6); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
      `}</style>
    </div>
  )
}
