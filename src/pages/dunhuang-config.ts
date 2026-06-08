export const RING_IDS = ['ring1', 'ring2', 'ring3', 'ring4', 'ring5', 'ring6', 'ring7'] as const
export type RingId = (typeof RING_IDS)[number]
export type RotationMode = 'none' | 'cw' | 'ccw'
export type ScaleMode = 'none' | 'pingpong'

export interface RingConfig {
  rotation: RotationMode
  rotationSpeed: number
  scale: ScaleMode
  scaleSpeed: number
  scaleMinPercent: number
}

export interface RingAnimationTemplate {
  rings: Partial<Record<RingId, Partial<RingConfig>>>
}

export const ROTATION_SPEED_MIN = 0.1
export const ROTATION_SPEED_MAX = 100
export const SCALE_SPEED_MIN = 1
export const SCALE_SPEED_MAX = 100
export const SCALE_MIN_PERCENT_MIN = 10
export const SCALE_MIN_PERCENT_MAX = 99

export function defaultRingConfig(): RingConfig {
  return {
    rotation: 'none',
    rotationSpeed: 50,
    scale: 'none',
    scaleSpeed: 50,
    scaleMinPercent: 80,
  }
}

function isRotationMode(value: unknown): value is RotationMode {
  return value === 'none' || value === 'cw' || value === 'ccw'
}

function isScaleMode(value: unknown): value is ScaleMode {
  return value === 'none' || value === 'pingpong'
}

function clampRotationSpeed(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return 50
  const clamped = Math.min(ROTATION_SPEED_MAX, Math.max(ROTATION_SPEED_MIN, n))
  return Math.round(clamped * 10) / 10
}

function clampScaleSpeed(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return 50
  return Math.min(SCALE_SPEED_MAX, Math.max(SCALE_SPEED_MIN, Math.round(n)))
}

function clampScaleMinPercent(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return 80
  return Math.min(SCALE_MIN_PERCENT_MAX, Math.max(SCALE_MIN_PERCENT_MIN, Math.round(n)))
}

export function scaleMinPercentToFactor(percent: number) {
  return (clampScaleMinPercent(percent) / 100).toFixed(2)
}

export function rotationSpeedToDuration(speed: number) {
  const clamped = clampRotationSpeed(speed)
  const t =
    (clamped - ROTATION_SPEED_MIN) / (ROTATION_SPEED_MAX - ROTATION_SPEED_MIN)
  const minSec = 2
  const maxSec = 120
  return `${(maxSec - t * (maxSec - minSec)).toFixed(2)}s`
}

export function scaleSpeedToDuration(speed: number) {
  const clamped = clampScaleSpeed(speed)
  const t = (clamped - SCALE_SPEED_MIN) / (SCALE_SPEED_MAX - SCALE_SPEED_MIN)
  const minSec = 1
  const maxSec = 12
  return `${(maxSec - t * (maxSec - minSec)).toFixed(2)}s`
}

function parseRingConfig(value: unknown): RingConfig {
  if (!value || typeof value !== 'object') return defaultRingConfig()
  const v = value as Partial<RingConfig>
  return {
    rotation: isRotationMode(v.rotation) ? v.rotation : 'none',
    rotationSpeed: clampRotationSpeed(v.rotationSpeed),
    scale: isScaleMode(v.scale) ? v.scale : 'none',
    scaleSpeed: clampScaleSpeed(v.scaleSpeed),
    scaleMinPercent: clampScaleMinPercent(v.scaleMinPercent),
  }
}

export function defaultRingConfigs(): Record<RingId, RingConfig> {
  return Object.fromEntries(RING_IDS.map(ring => [ring, defaultRingConfig()])) as Record<RingId, RingConfig>
}

export function templateToRingConfigs(template: RingAnimationTemplate): Record<RingId, RingConfig> {
  const configs = defaultRingConfigs()
  for (const ring of RING_IDS) {
    const partial = template.rings[ring]
    if (partial !== undefined) {
      configs[ring] = parseRingConfig({ ...configs[ring], ...partial })
    }
  }
  return configs
}
