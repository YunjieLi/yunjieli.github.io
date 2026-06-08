const FALLBACK_BACKGROUND = '#e7d6bb'
const COLOR_ATTRS = ['fill', 'stroke'] as const
const BACKGROUND_SELECTOR = 'rect[data-dh-background]'

export function normalizeSvgColor(value: string | null | undefined): string | null {
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

export function formatColorLabel(color: string) {
  return `#${color.slice(1).toUpperCase()}`
}

export function colorsEqual(a: string, b: string) {
  return normalizeSvgColor(a) === normalizeSvgColor(b)
}

function collectSvgColors(svg: SVGSVGElement): string[] {
  const found = new Set<string>()

  for (const el of svg.querySelectorAll('[fill], [stroke]')) {
    for (const attr of COLOR_ATTRS) {
      const normalized = normalizeSvgColor(el.getAttribute(attr))
      if (normalized) found.add(normalized)
    }
  }

  return [...found].sort()
}

export function findBackgroundRect(svg: SVGSVGElement): SVGRectElement | null {
  const rects = [...svg.querySelectorAll('rect')]
  if (rects.length === 0) return null

  const fullCanvas = rects.find(rect => {
    const width = Number(rect.getAttribute('width'))
    const height = Number(rect.getAttribute('height'))
    return width >= 1300 && height >= 1300
  })

  return fullCanvas ?? rects[0] ?? null
}

export function tagSvgBackground(svg: SVGSVGElement) {
  const rect = findBackgroundRect(svg)
  if (rect) rect.setAttribute('data-dh-background', 'true')
}

export function extractSvgBackgroundColor(svg: SVGSVGElement): string {
  const rect = findBackgroundRect(svg)
  if (!rect) return FALLBACK_BACKGROUND
  return normalizeSvgColor(rect.getAttribute('fill')) ?? FALLBACK_BACKGROUND
}

export function extractSvgPaintColors(svg: SVGSVGElement): string[] {
  const background = extractSvgBackgroundColor(svg)
  return collectSvgColors(svg).filter(color => color !== background)
}

export function tagSvgColorOrigins(svg: SVGSVGElement, colors: string[]) {
  const colorSet = new Set(colors)

  for (const el of svg.querySelectorAll('[fill], [stroke]')) {
    if (el.matches(BACKGROUND_SELECTOR)) continue

    for (const attr of COLOR_ATTRS) {
      const normalized = normalizeSvgColor(el.getAttribute(attr))
      if (normalized && colorSet.has(normalized)) {
        el.setAttribute(`data-dh-origin-${attr}`, normalized)
      }
    }
  }
}

export function defaultColorOverrides(colors: string[]): Record<string, string> {
  return Object.fromEntries(colors.map(color => [color, color]))
}

export function applySvgColorOverrides(svg: SVGSVGElement, overrides: Record<string, string>) {
  for (const el of svg.querySelectorAll('[data-dh-origin-fill], [data-dh-origin-stroke]')) {
    for (const attr of COLOR_ATTRS) {
      const origin = el.getAttribute(`data-dh-origin-${attr}`)
      if (!origin) continue

      const next = overrides[origin] ?? origin
      el.setAttribute(attr, next)
    }
  }
}

export function clearSvgBackgroundRect(svg: SVGSVGElement) {
  const rect = svg.querySelector(BACKGROUND_SELECTOR)
  if (rect) rect.setAttribute('fill', 'none')
}
