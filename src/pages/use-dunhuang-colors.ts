import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import {
  applySvgColorOverrides,
  clearSvgBackgroundRect,
  normalizeSvgColor,
  tagSvgBackground,
  tagSvgColorOrigins,
} from './dunhuang-colors'
import { getGraphicOrThrow } from './dunhuang-graphics'
import {
  defaultTemplate,
  loadDefaultColorState,
  swatchOrderForGraphic,
  templateToBackgroundColor,
  templateToColorOverrides,
} from './dunhuang-templates'

export interface DunhuangColorSession {
  colorOverrides: Record<string, string>
  backgroundColor: string
}

export function createDefaultColorSession(graphicId: string): DunhuangColorSession {
  return loadDefaultColorState(graphicId)
}

export function useDunhuangColors(svgHostRef: RefObject<HTMLDivElement | null>, graphicId: string) {
  const svgReadyRef = useRef(false)
  const colorOverridesRef = useRef<Record<string, string>>({})
  const originalOverridesRef = useRef<Record<string, string>>({})
  const originalBackgroundRef = useRef(loadDefaultColorState(graphicId).backgroundColor)
  const graphic = getGraphicOrThrow(graphicId)
  const [paintColorKeys, setPaintColorKeys] = useState<string[]>(() => [...graphic.paintColorKeys])
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>(
    () => loadDefaultColorState(graphicId).colorOverrides,
  )
  const [backgroundColor, setBackgroundColor] = useState(
    () => loadDefaultColorState(graphicId).backgroundColor,
  )

  colorOverridesRef.current = colorOverrides

  const syncColorsToSvg = useCallback(() => {
    const svg = svgHostRef.current?.querySelector('svg')
    if (!svg) return
    applySvgColorOverrides(svg, colorOverridesRef.current)
  }, [svgHostRef])

  const applySession = useCallback(
    (session: DunhuangColorSession, options?: { rememberOriginal?: boolean }) => {
      colorOverridesRef.current = session.colorOverrides
      setColorOverrides(session.colorOverrides)
      setBackgroundColor(session.backgroundColor)

      if (options?.rememberOriginal) {
        originalOverridesRef.current = { ...session.colorOverrides }
        originalBackgroundRef.current = session.backgroundColor
      }
    },
    [],
  )

  const initFromSvg = useCallback(
    (svg: SVGSVGElement, session?: DunhuangColorSession) => {
      const keys = getGraphicOrThrow(graphicId).paintColorKeys
      setPaintColorKeys([...keys])
      tagSvgBackground(svg)
      tagSvgColorOrigins(svg, keys)

      const nextSession = session ?? createDefaultColorSession(graphicId)
      applySession(nextSession, { rememberOriginal: true })

      applySvgColorOverrides(svg, nextSession.colorOverrides)
      clearSvgBackgroundRect(svg)
      svgReadyRef.current = true
    },
    [applySession, graphicId],
  )

  const loadGraphicColors = useCallback(
    (nextGraphicId: string, svg: SVGSVGElement, session?: DunhuangColorSession) => {
      svgReadyRef.current = false
      const keys = getGraphicOrThrow(nextGraphicId).paintColorKeys
      setPaintColorKeys([...keys])

      const resolvedSession = session ?? createDefaultColorSession(nextGraphicId)
      tagSvgBackground(svg)
      tagSvgColorOrigins(svg, keys)
      applySession(resolvedSession, { rememberOriginal: !session })

      applySvgColorOverrides(svg, resolvedSession.colorOverrides)
      clearSvgBackgroundRect(svg)
      svgReadyRef.current = true
    },
    [applySession],
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
    const template = defaultTemplate(graphicId)
    const graphic = getGraphicOrThrow(graphicId)
    const overrides = templateToColorOverrides(template, graphic.paintColorKeys, swatchOrderForGraphic(graphic))
    const background = templateToBackgroundColor(template, graphicId)
    originalOverridesRef.current = { ...overrides }
    originalBackgroundRef.current = background
    colorOverridesRef.current = overrides
    setColorOverrides(overrides)
    setBackgroundColor(background)
  }, [graphicId])

  useEffect(() => {
    if (!svgReadyRef.current) return
    syncColorsToSvg()
  }, [colorOverrides, syncColorsToSvg])

  return {
    paintColorKeys,
    colorOverrides,
    backgroundColor,
    initFromSvg,
    loadGraphicColors,
    syncColorsToSvg,
    updateColor,
    updateBackgroundColor,
    resetColors,
    getColorSession: (): DunhuangColorSession => ({
      colorOverrides: { ...colorOverridesRef.current },
      backgroundColor,
    }),
  }
}
