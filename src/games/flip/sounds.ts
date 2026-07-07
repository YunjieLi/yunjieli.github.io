// Tiny Web Audio synth for the game's sound effects — no audio assets needed.
// The AudioContext is created lazily on the first sound, which always happens
// inside a user gesture (a card click), so autoplay policies are satisfied.

let ctx: AudioContext | null = null

function ac(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

type Blip = {
  from: number        // start frequency (Hz)
  to?: number         // end frequency — defaults to `from`
  at?: number         // seconds from now
  dur?: number        // seconds
  type?: OscillatorType
  vol?: number        // peak gain
}

function blip({ from, to = from, at = 0, dur = 0.15, type = 'triangle', vol = 0.12 }: Blip) {
  const c = ac()
  const t0 = c.currentTime + at
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(from, t0)
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(gain).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

// soft bubble pop when a card flips — a quick, quiet rising "bloop"
export function playFlip() {
  const c = ac()
  const t0 = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(330, t0)
  osc.frequency.exponentialRampToValueAtTime(900, t0 + 0.08)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09)
  osc.connect(g).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + 0.1)
}

// sparkly ascending arpeggio when a pair matches
export function playMatch() {
  const notes = [523.25, 659.25, 783.99] // C5 E5 G5
  notes.forEach((f, i) => blip({ from: f, at: i * 0.09, dur: 0.2, vol: 0.11 }))
  blip({ from: 1046.5, at: 0.27, dur: 0.3, type: 'sine', vol: 0.09 }) // C6 sparkle on top
}

// single clave "tock" when the turn passes to the next player
export function playTurn() {
  const c = ac()
  const t0 = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(2500, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(0.15, t0 + 0.003)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06)
  osc.connect(g).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + 0.08)
}

// little fanfare when the board is cleared
export function playWin() {
  const run = [523.25, 659.25, 783.99, 1046.5, 1318.5] // C5 E5 G5 C6 E6
  run.forEach((f, i) => blip({ from: f, at: i * 0.11, dur: 0.28, vol: 0.11 }))
  // closing chord
  ;[523.25, 659.25, 783.99, 1046.5].forEach(f =>
    blip({ from: f, at: 0.58, dur: 0.9, type: 'sine', vol: 0.05 }))
}
