import palettesFile from '@/assets/dunhuang/palettes.json'

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

export interface DunhuangPalette {
  id: string
  label: string
  swatchOrder: string[]
  colors: Record<string, string>
  background: string
  colorLabels?: Record<string, string>
}

export const DUNHUANG_PALETTES = palettesFile as unknown as DunhuangPalette[]

export function paletteColorLabel(palette: DunhuangPalette, colorKey: string) {
  return palette.colorLabels?.[colorKey] ?? colorKey
}

export function paletteColorKeysInOrder(palette: DunhuangPalette): string[] {
  return palette.swatchOrder.filter(colorKey => normalizeHexColor(palette.colors[colorKey]) !== null)
}

export function paletteSwatchesInOrder(palette: DunhuangPalette): string[] {
  return palette.swatchOrder
    .map(colorKey => normalizeHexColor(palette.colors[colorKey]))
    .filter((color): color is string => color !== null)
}
