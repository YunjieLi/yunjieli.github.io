import yi from './assets/壹.svg?raw'
import er from './assets/贰.svg?raw'
import san from './assets/叁.svg?raw'
import si from './assets/肆.svg?raw'
import templatesYi from './assets/templates-壹.json'
import templatesEr from './assets/templates-贰.json'
import templatesSan from './assets/templates-叁.json'
import templatesSi from './assets/templates-肆.json'
import type { DunhuangTemplate } from './dunhuang-templates'

export interface DunhuangGraphic {
  id: string
  label: string
  svgRaw: string
  ringIds: string[]
  paintColorKeys: string[]
  defaultBackground: string
  templates: Record<string, DunhuangTemplate>
}

const SVG_BY_ID: Record<string, string> = {
  壹: yi,
  贰: er,
  叁: san,
  肆: si,
}

const RING_IDS_BY_GRAPHIC: Record<string, string[]> = {
  壹: ['ring1', 'ring2', 'ring3', 'ring4', 'ring5', 'ring6', 'ring7'],
  贰: ['ring1', 'ring2', 'ring3', 'ring4', 'ring5', 'ring6', 'ring7'],
  叁: ['ring1', 'ring2', 'ring3', 'ring4', 'ring5', 'ring6'],
  肆: ['ring1', 'ring2', 'ring3', 'ring4-A', 'ring4-B', 'ring4-C', 'ring4', 'ring5'],
}

const PAINT_COLOR_KEYS_BY_GRAPHIC: Record<string, string[]> = {
  壹: ['#606d86', '#845b5e', '#aa7e73', '#b8bcad', '#ded7ca', '#e7c7af'],
  贰: ['#765c5c', '#8896ad', '#8a766c', '#a0b4b4', '#aa867e'],
  叁: ['#78514e', '#8ab0b0', '#c77964', '#e8dbd4'],
  肆: ['#78514e', '#8ab0b0', '#b7b5c1', '#c77964', '#e8dbd4'],
}

const TEMPLATES_BY_ID: Record<string, Record<string, DunhuangTemplate>> = {
  壹: templatesYi as Record<string, DunhuangTemplate>,
  贰: templatesEr as Record<string, DunhuangTemplate>,
  叁: templatesSan as Record<string, DunhuangTemplate>,
  肆: templatesSi as Record<string, DunhuangTemplate>,
}

const GRAPHIC_ORDER = ['贰', '壹', '叁', '肆'] as const

function buildGraphic(id: string): DunhuangGraphic | null {
  const templates = TEMPLATES_BY_ID[id]
  const ringIds = RING_IDS_BY_GRAPHIC[id]
  const paintColorKeys = PAINT_COLOR_KEYS_BY_GRAPHIC[id]
  const svgRaw = SVG_BY_ID[id]
  if (!templates || !ringIds || !paintColorKeys || !svgRaw) return null

  const firstTemplate = Object.values(templates)[0]

  return {
    id,
    label: id,
    svgRaw,
    ringIds,
    paintColorKeys,
    defaultBackground: firstTemplate?.background ?? '#e7d6bb',
    templates,
  }
}

export const DUNHUANG_GRAPHICS: DunhuangGraphic[] = GRAPHIC_ORDER.map(buildGraphic).filter(
  (graphic): graphic is DunhuangGraphic => graphic !== null,
)

export const DUNHUANG_GRAPHIC_IDS = DUNHUANG_GRAPHICS.map(graphic => graphic.id)

export function defaultGraphicId(): string {
  return '贰'
}

export function getGraphic(graphicId: string): DunhuangGraphic | undefined {
  return DUNHUANG_GRAPHICS.find(graphic => graphic.id === graphicId)
}

export function getGraphicOrThrow(graphicId: string): DunhuangGraphic {
  const graphic = getGraphic(graphicId)
  if (!graphic) throw new Error(`Unknown Dunhuang graphic: ${graphicId}`)
  return graphic
}

export function discoverPresentRingIds(svg: SVGSVGElement, ringIds: string[]): string[] {
  const present = new Set([...svg.querySelectorAll('g[id]')].map(el => el.id))
  return ringIds.filter(id => present.has(id))
}

export function querySvgGroup(svg: SVGSVGElement, groupId: string): SVGGElement | null {
  const group = svg.querySelector(`#${CSS.escape(groupId)}`)
  return group instanceof SVGGElement ? group : null
}
