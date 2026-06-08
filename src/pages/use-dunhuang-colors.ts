import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import {
  applySvgColorOverrides,
  clearSvgBackgroundRect,
  normalizeSvgColor,
  tagSvgBackground,
  tagSvgColorOrigins,
} from './dunhuang-colors'
import {
  defaultTemplate,
  DUNHUANG_PAINT_COLOR_KEYS,
  loadDefaultColorState,
  templateToBackgroundColor,
  templateToColorOverrides,
} from './dunhuang-templates'

export function useDunhuangColors(svgHostRef: RefObject<HTMLDivElement | null>) {
  const svgReadyRef = useRef(false)
  const colorOverridesRef = useRef<Record<string, string>>({})
  const originalOverridesRef = useRef<Record<string, string>>({})
  const originalBackgroundRef = useRef(loadDefaultColorState().backgroundColor)
  const [paintColorKeys] = useState<string[]>(() => [...DUNHUANG_PAINT_COLOR_KEYS])
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>(
    () => loadDefaultColorState().colorOverrides,
  )
  const [backgroundColor, setBackgroundColor] = useState(() => loadDefaultColorState().backgroundColor)

  colorOverridesRef.current = colorOverrides

  const syncColorsToSvg = useCallback(() => {
    const svg = svgHostRef.current?.querySelector('svg')
    if (!svg) return
    applySvgColorOverrides(svg, colorOverridesRef.current)
  }, [svgHostRef])

  const initFromSvg = useCallback(
    (svg: SVGSVGElement) => {
      tagSvgBackground(svg)
      tagSvgColorOrigins(svg, paintColorKeys)

      const template = defaultTemplate()
      const overrides = templateToColorOverrides(template)

      originalOverridesRef.current = { ...overrides }
      originalBackgroundRef.current = templateToBackgroundColor(template)

      setColorOverrides(overrides)
      setBackgroundColor(templateToBackgroundColor(template))

      applySvgColorOverrides(svg, overrides)
      clearSvgBackgroundRect(svg)
      svgReadyRef.current = true
    },
    [paintColorKeys],
  )

  const updateColor = useCallback((originKey: string, next: string) => {
    const normalized = normalizeSvgColor(next)
    if (!normalized) return

    setColorOverrides(prev => {
      const nextOverrides = { ...prev, [originKey]: normalized }
      colorOverridesRef.current = nextOverrides
      return nextOverrides
    })
  }, [])

  const updateBackgroundColor = useCallback((next: string) => {
    const normalized = normalizeSvgColor(next)
    if (!normalized) return
    setBackgroundColor(normalized)
  }, [])

  const resetColors = useCallback(() => {
    const overrides = { ...originalOverridesRef.current }
    colorOverridesRef.current = overrides
    setColorOverrides(overrides)
    setBackgroundColor(originalBackgroundRef.current)
  }, [])

  useEffect(() => {
    if (!svgReadyRef.current) return
    syncColorsToSvg()
  }, [colorOverrides, syncColorsToSvg])

  return {
    paintColorKeys,
    colorOverrides,
    backgroundColor,
    initFromSvg,
    syncColorsToSvg,
    updateColor,
    updateBackgroundColor,
    resetColors,
  }
}
