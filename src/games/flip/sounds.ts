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

// cached white-noise buffer for organic, papery textures
let noiseBuf: AudioBuffer | null = null
function noise(c: AudioContext): AudioBuffer {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 0.3, c.sampleRate)
    const data = noiseBuf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  return noiseBuf
}

// papery "swish" + soft tap, like a real card being turned over
export function playFlip() {
  const c = ac()
  const t0 = c.currentTime
  const dur = 0.13
  const src = c.createBufferSource()
  src.buffer = noise(c)
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 1.1
  bp.frequency.setValueAtTime(800, t0)
  bp.frequency.exponentialRampToValueAtTime(2600, t0 + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.025)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(bp).connect(g).connect(c.destination)
  src.start(t0)
  src.stop(t0 + dur + 0.02)
  // soft landing tap as the card settles
  blip({ from: 300, to: 240, at: dur * 0.55, dur: 0.06, type: 'sine', vol: 0.05 })
}

// sparkly ascending arpeggio when a pair matches
export function playMatch() {
  const notes = [523.25, 659.25, 783.99] // C5 E5 G5
  notes.forEach((f, i) => blip({ from: f, at: i * 0.09, dur: 0.2, vol: 0.11 }))
  blip({ from: 1046.5, at: 0.27, dur: 0.3, type: 'sine', vol: 0.09 }) // C6 sparkle on top
}

// gentle, non-punishing "hmm" when the pair doesn't match
export function playMismatch() {
  blip({ from: 220, to: 180, dur: 0.18, type: 'sine', vol: 0.07 })
  blip({ from: 170, to: 140, at: 0.16, dur: 0.22, type: 'sine', vol: 0.06 })
}

// friendly two-note nudge when the turn passes to the next player
export function playTurn() {
  blip({ from: 392, dur: 0.12, type: 'sine', vol: 0.09 })              // G4
  blip({ from: 587.33, at: 0.11, dur: 0.22, type: 'sine', vol: 0.1 })  // D5
}

// little fanfare when the board is cleared
export function playWin() {
  const run = [523.25, 659.25, 783.99, 1046.5, 1318.5] // C5 E5 G5 C6 E6
  run.forEach((f, i) => blip({ from: f, at: i * 0.11, dur: 0.28, vol: 0.11 }))
  // closing chord
  ;[523.25, 659.25, 783.99, 1046.5].forEach(f =>
    blip({ from: f, at: 0.58, dur: 0.9, type: 'sine', vol: 0.05 }))
}
