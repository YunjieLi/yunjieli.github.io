import {
  templateToRingConfigs,
  type RingConfig,
  type RingId,
} from './dunhuang-config'
import { defaultGraphicId, getGraphicOrThrow, type DunhuangGraphic } from './dunhuang-graphics'

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

export function swatchOrderForGraphic(graphic: Pick<DunhuangGraphic, 'paintColorKeys'>): string[] {
  return graphic.paintColorKeys.map((_, index) => `color${index + 1}`)
}

export function defaultTemplateId(graphicId = defaultGraphicId()): string {
  const graphic = getGraphicOrThrow(graphicId)
  return Object.keys(graphic.templates)[0]
}

export function defaultTemplate(graphicId = defaultGraphicId()): DunhuangTemplate {
  return getGraphicOrThrow(graphicId).templates[defaultTemplateId(graphicId)] as DunhuangTemplate
}

export function defaultBackgroundForGraphic(graphicId = defaultGraphicId()): string {
  return normalizeHexColor(getGraphicOrThrow(graphicId).defaultBackground) ?? '#e7d6bb'
}

export function colorSlotLabel(graphicId: string, index: number, labels?: Record<string, string>) {
  const graphic = getGraphicOrThrow(graphicId)
  const slot = swatchOrderForGraphic(graphic)[index]
  if (slot && labels?.[slot]) return labels[slot]
  return slot ?? `color${index + 1}`
}

export function templateToColorOverrides(
  template: DunhuangTemplate,
  paintColorKeys: string[],
  swatchOrder: string[],
): Record<string, string> {
  return Object.fromEntries(
    paintColorKeys.map((paintKey, index) => {
      const slot = swatchOrder[index]
      const color = slot ? template.colors[slot] : undefined
      return [paintKey, normalizeHexColor(color) ?? paintKey]
    }),
  )
}

export function templateToBackgroundColor(template: DunhuangTemplate, graphicId: string): string {
  return normalizeHexColor(template.background) ?? defaultBackgroundForGraphic(graphicId)
}

export function loadDefaultRingConfigs(graphicId = defaultGraphicId()): Record<RingId, RingConfig> {
  const graphic = getGraphicOrThrow(graphicId)
  return templateToRingConfigs(defaultTemplate(graphicId), graphic.ringIds)
}

export function loadTemplateRingConfigs(
  graphicId: string,
  templateId?: string,
): Record<RingId, RingConfig> {
  const graphic = getGraphicOrThrow(graphicId)
  const id = templateId ?? defaultTemplateId(graphicId)
  const template = (graphic.templates[id] ?? defaultTemplate(graphicId)) as DunhuangTemplate
  return templateToRingConfigs(template, graphic.ringIds)
}

export function loadDefaultColorState(graphicId = defaultGraphicId()) {
  const graphic = getGraphicOrThrow(graphicId)
  const template = defaultTemplate(graphicId)
  return {
    colorOverrides: templateToColorOverrides(template, graphic.paintColorKeys, swatchOrderForGraphic(graphic)),
    backgroundColor: templateToBackgroundColor(template, graphicId),
  }
}

export function buildTemplateFromState(
  graphic: DunhuangGraphic,
  ringOrder: RingId[],
  ringConfigs: Record<RingId, RingConfig>,
  colorOverrides: Record<string, string>,
  backgroundColor: string,
  label = 'New template',
): DunhuangTemplate {
  const colors = Object.fromEntries(
    swatchOrderForGraphic(graphic).map((slot, index) => {
      const paintKey = graphic.paintColorKeys[index]
      return [slot, colorOverrides[paintKey] ?? paintKey]
    }),
  )

  return {
    label,
    colors,
    background: backgroundColor,
    rings: Object.fromEntries(ringOrder.map(ring => [ring, ringConfigs[ring]])),
  }
}

export function templateToJsonSnippet(template: DunhuangTemplate, templateId = 'template'): string {
  const lines = JSON.stringify(template, null, 2).split('\n')
  return [`    "${templateId}": ${lines[0]}`, ...lines.slice(1).map(line => `    ${line}`)].join('\n')
}

// Backward-compatible exports for default graphic (贰)
export const DUNHUANG_PAINT_COLOR_KEYS = getGraphicOrThrow(defaultGraphicId()).paintColorKeys
export const DEFAULT_BACKGROUND = defaultBackgroundForGraphic(defaultGraphicId())
