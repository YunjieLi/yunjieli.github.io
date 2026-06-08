import templatesFile from '@/assets/dunhuang/templates.json'
import {
  RING_IDS,
  templateToRingConfigs,
  type RingConfig,
  type RingId,
} from './dunhuang-config'

function normalizeHexColor(value: string | null | undefined): string | null {
  if (!value || value === 'none' || value.startsWith('url(')) return null

  const trimmed = value.trim().toLowerCase()
  if (trimmed === 'white') return '#ffffff'
  if (trimmed === 'black') return '#000000'

  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    const [, r, g, b] = trimmed
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }

  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed

  return null
}

export interface DunhuangTemplate {
  label: string
  colors: Record<string, string>
  background: string
  colorLabels?: Record<string, string>
  rings: Partial<Record<RingId, Partial<RingConfig>>>
}

export interface DunhuangTemplatesFile {
  swatchOrder: string[]
  paintColorKeys: string[]
  templates: Record<string, DunhuangTemplate>
}

export interface DunhuangPalette {
  id: string
  label: string
  colors: Record<string, string>
  background: string
  colorLabels?: Record<string, string>
}

export const dunhuangTemplatesFile = templatesFile as DunhuangTemplatesFile

export const DUNHUANG_SWATCH_ORDER = dunhuangTemplatesFile.swatchOrder
export const DUNHUANG_PAINT_COLOR_KEYS = dunhuangTemplatesFile.paintColorKeys

export function defaultTemplateId(): string {
  return Object.keys(dunhuangTemplatesFile.templates)[0]
}

export function defaultTemplate(): DunhuangTemplate {
  return dunhuangTemplatesFile.templates[defaultTemplateId()]
}

export const DEFAULT_BACKGROUND = defaultTemplate().background

export const DUNHUANG_PALETTES: DunhuangPalette[] = Object.entries(dunhuangTemplatesFile.templates).map(
  ([id, template]) => ({
    id,
    label: template.label,
    colors: template.colors,
    background: template.background,
    colorLabels: template.colorLabels,
  }),
)

export function colorSlotLabel(index: number, labels?: Record<string, string>) {
  const slot = DUNHUANG_SWATCH_ORDER[index]
  if (slot && labels?.[slot]) return labels[slot]
  return slot ?? `color${index + 1}`
}

export function paletteSwatchLabel(palette: DunhuangPalette, index: number) {
  const slot = DUNHUANG_SWATCH_ORDER[index]
  if (slot && palette.colorLabels?.[slot]) return palette.colorLabels[slot]
  return colorSlotLabel(index)
}

export function paletteSwatchesInOrder(palette: DunhuangPalette): string[] {
  return DUNHUANG_SWATCH_ORDER.map(name => palette.colors[name])
}

export function paletteColorForPaintKey(palette: DunhuangPalette, paintColorKey: string): string | null {
  const index = DUNHUANG_PAINT_COLOR_KEYS.indexOf(paintColorKey)
  if (index === -1) return null

  const swatchName = DUNHUANG_SWATCH_ORDER[index]
  return palette.colors[swatchName] ?? null
}

export function templateToColorOverrides(template: DunhuangTemplate): Record<string, string> {
  return Object.fromEntries(
    DUNHUANG_PAINT_COLOR_KEYS.map((key, index) => {
      const slot = DUNHUANG_SWATCH_ORDER[index]
      const color = slot ? template.colors[slot] : undefined
      return [key, normalizeHexColor(color) ?? key]
    }),
  )
}

export function templateToBackgroundColor(template: DunhuangTemplate): string {
  return normalizeHexColor(template.background) ?? DEFAULT_BACKGROUND
}

export function loadDefaultRingConfigs(): Record<RingId, RingConfig> {
  return templateToRingConfigs(defaultTemplate())
}

export function loadTemplateConfigs(templateId?: string): Record<RingId, RingConfig> {
  const id = templateId ?? defaultTemplateId()
  const template = dunhuangTemplatesFile.templates[id]
  if (!template) return templateToRingConfigs(defaultTemplate())
  return templateToRingConfigs(template)
}

export function listTemplateIds(): string[] {
  return Object.keys(dunhuangTemplatesFile.templates)
}

export function loadDefaultColorState() {
  const template = defaultTemplate()
  return {
    colorOverrides: templateToColorOverrides(template),
    backgroundColor: templateToBackgroundColor(template),
  }
}

export function buildTemplateFromState(
  ringConfigs: Record<RingId, RingConfig>,
  colorOverrides: Record<string, string>,
  backgroundColor: string,
  label = 'New template',
): DunhuangTemplate {
  const colors = Object.fromEntries(
    DUNHUANG_SWATCH_ORDER.map((slot, index) => {
      const paintKey = DUNHUANG_PAINT_COLOR_KEYS[index]
      return [slot, colorOverrides[paintKey] ?? paintKey]
    }),
  )

  return {
    label,
    colors,
    background: backgroundColor,
    rings: Object.fromEntries(RING_IDS.map(ring => [ring, ringConfigs[ring]])),
  }
}

export function templateToJsonSnippet(template: DunhuangTemplate, templateId = 'template-new'): string {
  const lines = JSON.stringify(template, null, 2).split('\n')
  return [`    "${templateId}": ${lines[0]}`, ...lines.slice(1).map(line => `    ${line}`)].join('\n')
}
