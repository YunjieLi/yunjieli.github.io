import templatesFile from '@/assets/dunhuang/templates.json'

export const RING_IDS = ['ring1', 'ring2', 'ring3', 'ring4', 'ring5', 'ring6', 'ring7'] as const
export type RingId = (typeof RING_IDS)[number]
export type RotationMode = 'none' | 'cw' | 'ccw'
export type ScaleMode = 'none' | 'pingpong'

export interface RingConfig {
  rotation: RotationMode
  rotationSpeed: number
  scale: ScaleMode
  scaleSpeed: number
}

export interface DunhuangTemplate {
  label: string
  rings: Partial<Record<RingId, RingConfig>>
}

export interface DunhuangTemplatesFile {
  defaultTemplate: string
  templates: Record<string, DunhuangTemplate>
}

export const dunhuangTemplates = templatesFile as DunhuangTemplatesFile

export function defaultRingConfig(): RingConfig {
  return {
    rotation: 'none',
    rotationSpeed: 50,
    scale: 'none',
    scaleSpeed: 50,
  }
}

function isRotationMode(value: unknown): value is RotationMode {
  return value === 'none' || value === 'cw' || value === 'ccw'
}

function isScaleMode(value: unknown): value is ScaleMode {
  return value === 'none' || value === 'pingpong'
}

function clampSpeed(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return 50
  return Math.min(100, Math.max(1, Math.round(n)))
}

function parseRingConfig(value: unknown): RingConfig {
  if (!value || typeof value !== 'object') return defaultRingConfig()
  const v = value as Partial<RingConfig>
  return {
    rotation: isRotationMode(v.rotation) ? v.rotation : 'none',
    rotationSpeed: clampSpeed(v.rotationSpeed),
    scale: isScaleMode(v.scale) ? v.scale : 'none',
    scaleSpeed: clampSpeed(v.scaleSpeed),
  }
}

export function defaultRingConfigs(): Record<RingId, RingConfig> {
  return Object.fromEntries(RING_IDS.map(ring => [ring, defaultRingConfig()])) as Record<RingId, RingConfig>
}

export function templateToRingConfigs(template: DunhuangTemplate): Record<RingId, RingConfig> {
  const configs = defaultRingConfigs()
  for (const ring of RING_IDS) {
    if (template.rings[ring] !== undefined) {
      configs[ring] = parseRingConfig(template.rings[ring])
    }
  }
  return configs
}

export function loadTemplateConfigs(templateId = dunhuangTemplates.defaultTemplate): Record<RingId, RingConfig> {
  const template = dunhuangTemplates.templates[templateId]
  if (!template) return defaultRingConfigs()
  return templateToRingConfigs(template)
}

export function listTemplateIds(): string[] {
  return Object.keys(dunhuangTemplates.templates)
}
