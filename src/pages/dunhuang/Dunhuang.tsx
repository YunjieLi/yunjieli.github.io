import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DunhuangColorPicker from './DunhuangColorPicker'
import {
  defaultRingConfig,
  defaultRingConfigs,
  mergeRingConfigs,
  resolveRingConfig,
  rotationSpeedToDuration,
  ROTATION_SPEED_MAX,
  ROTATION_SPEED_MIN,
  scaleMinPercentToFactor,
  scaleSpeedToDuration,
  SCALE_MIN_PERCENT_MAX,
  SCALE_MIN_PERCENT_MIN,
  SCALE_SPEED_MAX,
  SCALE_SPEED_MIN,
  type RingConfig,
  type RingId,
  type RotationMode,
  type ScaleMode,
} from './dunhuang-config'
import {
  DUNHUANG_GRAPHICS,
  defaultGraphicId,
  discoverPresentRingIds,
  getGraphicOrThrow,
  querySvgGroup,
} from './dunhuang-graphics'
import { colorSlotLabel, defaultTemplate } from './dunhuang-templates'
import { DUNHUANG_PALETTES } from './dunhuang-palettes'
import {
  buildTemplateFromState,
  loadTemplateRingConfigs,
  templateToJsonSnippet,
} from './dunhuang-templates'
import {
  createDefaultColorSession,
  useDunhuangColors,
  type DunhuangColorSession,
} from './use-dunhuang-colors'
import './dunhuang.css'

const ANIMATION_SETTLE_MS = 600

interface GraphicSession {
  ringConfigs: Record<RingId, RingConfig>
  colorSession: DunhuangColorSession
  animationEnabled: boolean
}

function createDefaultGraphicSession(graphicId: string): GraphicSession {
  return {
    ringConfigs: loadTemplateRingConfigs(graphicId),
    colorSession: createDefaultColorSession(graphicId),
    animationEnabled: true,
  }
}

function ensureAnimationHooks(group: SVGGElement) {
  if (group.querySelector('.dunhuang-scale-wrap')) return

  const rotWrap = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  rotWrap.setAttribute('class', 'dunhuang-rot-wrap')

  const scaleWrap = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  scaleWrap.setAttribute('class', 'dunhuang-scale-wrap')

  while (group.firstChild) {
    rotWrap.appendChild(group.firstChild)
  }

  scaleWrap.appendChild(rotWrap)
  group.appendChild(scaleWrap)
}

function resetWrapTransformState(wrap: SVGGElement) {
  wrap.style.transform = ''
  wrap.classList.remove('dunhuang-transform-settling')
}

function restartWrapAnimation(wrap: SVGGElement) {
  wrap.style.animation = 'none'
  wrap.getBBox()
  wrap.style.removeProperty('animation')
}

function applyRingAnimation(group: SVGGElement, config: RingConfig) {
  ensureAnimationHooks(group)

  const rotWrap = group.querySelector('.dunhuang-rot-wrap') as SVGGElement
  const scaleWrap = group.querySelector('.dunhuang-scale-wrap') as SVGGElement

  resetWrapTransformState(rotWrap)
  resetWrapTransformState(scaleWrap)

  rotWrap.classList.remove('dunhuang-rot-cw', 'dunhuang-rot-ccw')
  scaleWrap.classList.remove('dunhuang-scale-pingpong')
  rotWrap.style.removeProperty('--dunhuang-rot-duration')
  scaleWrap.style.removeProperty('--dunhuang-scale-duration')
  scaleWrap.style.removeProperty('--dunhuang-scale-min')

  if (config.rotation === 'cw' || config.rotation === 'ccw') {
    rotWrap.style.setProperty('--dunhuang-rot-duration', rotationSpeedToDuration(config.rotationSpeed))
    rotWrap.classList.add(config.rotation === 'cw' ? 'dunhuang-rot-cw' : 'dunhuang-rot-ccw')
    restartWrapAnimation(rotWrap)
  }

  if (config.scale === 'pingpong') {
    scaleWrap.style.setProperty('--dunhuang-scale-duration', scaleSpeedToDuration(config.scaleSpeed))
    scaleWrap.style.setProperty('--dunhuang-scale-min', scaleMinPercentToFactor(config.scaleMinPercent))
    scaleWrap.classList.add('dunhuang-scale-pingpong')
    restartWrapAnimation(scaleWrap)
  }
}

function clearRingAnimation(group: SVGGElement) {
  const rotWrap = group.querySelector('.dunhuang-rot-wrap') as SVGGElement | null
  const scaleWrap = group.querySelector('.dunhuang-scale-wrap') as SVGGElement | null
  if (!rotWrap || !scaleWrap) return

  rotWrap.classList.remove('dunhuang-rot-cw', 'dunhuang-rot-ccw')
  scaleWrap.classList.remove('dunhuang-scale-pingpong')
  rotWrap.style.removeProperty('--dunhuang-rot-duration')
  scaleWrap.style.removeProperty('--dunhuang-scale-duration')
  scaleWrap.style.removeProperty('--dunhuang-scale-min')
  resetWrapTransformState(rotWrap)
  resetWrapTransformState(scaleWrap)
}

function transitionWrapToIdentity(wrap: SVGGElement, frozenTransform: string) {
  if (frozenTransform === 'none') return Promise.resolve()

  wrap.style.transform = frozenTransform
  wrap.classList.add('dunhuang-transform-settling')

  return new Promise<void>(resolve => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      wrap.removeEventListener('transitionend', onTransitionEnd)
      resetWrapTransformState(wrap)
      resolve()
    }

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === wrap && event.propertyName === 'transform') finish()
    }

    wrap.addEventListener('transitionend', onTransitionEnd)
    window.setTimeout(finish, ANIMATION_SETTLE_MS + 50)

    requestAnimationFrame(() => {
      wrap.style.transform = ''
    })
  })
}

function settleRingAnimation(group: SVGGElement) {
  const rotWrap = group.querySelector('.dunhuang-rot-wrap') as SVGGElement | null
  const scaleWrap = group.querySelector('.dunhuang-scale-wrap') as SVGGElement | null
  if (!rotWrap || !scaleWrap) return Promise.resolve()

  const rotFrozen = getComputedStyle(rotWrap).transform
  const scaleFrozen = getComputedStyle(scaleWrap).transform

  rotWrap.classList.remove('dunhuang-rot-cw', 'dunhuang-rot-ccw')
  scaleWrap.classList.remove('dunhuang-scale-pingpong')
  rotWrap.style.removeProperty('--dunhuang-rot-duration')
  scaleWrap.style.removeProperty('--dunhuang-scale-duration')
  scaleWrap.style.removeProperty('--dunhuang-scale-min')

  const transitions = [
    transitionWrapToIdentity(rotWrap, rotFrozen),
    transitionWrapToIdentity(scaleWrap, scaleFrozen),
  ]

  return Promise.all(transitions).then(() => undefined)
}

function settleAllRingAnimations(svg: SVGSVGElement, ringOrder: RingId[]) {
  const transitions = ringOrder.map(ring => {
    const group = querySvgGroup(svg, ring)
    if (!group) return Promise.resolve()
    return settleRingAnimation(group)
  })

  return Promise.all(transitions).then(() => undefined)
}

function clearAllRingAnimations(svg: SVGSVGElement, ringOrder: RingId[]) {
  for (const ring of ringOrder) {
    const group = querySvgGroup(svg, ring)
    if (group) clearRingAnimation(group)
  }
}

function applyAllRingAnimations(
  svg: SVGSVGElement,
  ringOrder: RingId[],
  configs: Record<RingId, RingConfig>,
) {
  for (const ring of ringOrder) {
    const group = querySvgGroup(svg, ring)
    if (group) {
      applyRingAnimation(group, resolveRingConfig(configs[ring]))
    }
  }
}

function mountSvg(host: HTMLDivElement, svgRaw: string) {
  host.innerHTML = svgRaw
  const svg = host.querySelector('svg')
  if (!svg) throw new Error('SVG markup missing root <svg>')
  svg.classList.add('dunhuang-svg')
  return svg
}

export default function Dunhuang() {
  const svgHostRef = useRef<HTMLDivElement>(null)
  const svgReadyRef = useRef(false)
  const prevAnimationEnabledRef = useRef(true)
  const sessionsRef = useRef<Record<string, GraphicSession>>({})
  const [activeGraphicId, setActiveGraphicId] = useState(defaultGraphicId)
  const [ringOrder, setRingOrder] = useState<RingId[]>([])
  const [ringConfigs, setRingConfigs] = useState<Record<RingId, RingConfig>>(() =>
    loadTemplateRingConfigs(defaultGraphicId()),
  )
  const [controlsOpen, setControlsOpen] = useState(false)
  const [animationEnabled, setAnimationEnabled] = useState(true)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  const activeGraphic = getGraphicOrThrow(activeGraphicId)
  const palettes = DUNHUANG_PALETTES

  const {
    paintColorKeys,
    colorOverrides,
    backgroundColor,
    initFromSvg,
    loadGraphicColors,
    syncColorsToSvg,
    updateColor,
    updateBackgroundColor,
    resetColors,
    getColorSession,
  } = useDunhuangColors(svgHostRef, activeGraphicId)

  const persistActiveSession = () => {
    sessionsRef.current[activeGraphicId] = {
      ringConfigs,
      colorSession: getColorSession(),
      animationEnabled,
    }
  }

  const loadGraphic = (graphicId: string, session = sessionsRef.current[graphicId]) => {
    const graphic = getGraphicOrThrow(graphicId)
    const host = svgHostRef.current
    if (!host) return

    const resolvedSession = session ?? createDefaultGraphicSession(graphicId)
    const svg = mountSvg(host, graphic.svgRaw)
    const order = discoverPresentRingIds(svg, graphic.ringIds)
    const templateConfigs = loadTemplateRingConfigs(graphicId)
    const mergedRingConfigs = mergeRingConfigs(order, templateConfigs, resolvedSession.ringConfigs)

    loadGraphicColors(graphicId, svg, resolvedSession.colorSession)
    setRingOrder(order)
    setRingConfigs(mergedRingConfigs)
    setAnimationEnabled(resolvedSession.animationEnabled)
    prevAnimationEnabledRef.current = resolvedSession.animationEnabled

    if (resolvedSession.animationEnabled) {
      applyAllRingAnimations(svg, order, mergedRingConfigs)
    } else {
      clearAllRingAnimations(svg, order)
    }

    svgReadyRef.current = true
  }

  const switchGraphic = (graphicId: string) => {
    if (graphicId === activeGraphicId) return
    persistActiveSession()
    setActiveGraphicId(graphicId)
    loadGraphic(graphicId)
  }

  useLayoutEffect(() => {
    const host = svgHostRef.current
    if (!host) return

    const session = sessionsRef.current[activeGraphicId]
    if (session) {
      loadGraphic(activeGraphicId, session)
    } else {
      const svg = mountSvg(host, activeGraphic.svgRaw)
      initFromSvg(svg)
      const order = discoverPresentRingIds(svg, activeGraphic.ringIds)
      setRingOrder(order)
      if (animationEnabled) {
        applyAllRingAnimations(svg, order, ringConfigs)
      }
      svgReadyRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!svgReadyRef.current) return

    const svg = svgHostRef.current?.querySelector('svg')
    if (!svg || ringOrder.length === 0) return

    if (animationEnabled) {
      applyAllRingAnimations(svg, ringOrder, ringConfigs)
      syncColorsToSvg()
    } else if (prevAnimationEnabledRef.current) {
      void settleAllRingAnimations(svg, ringOrder).then(() => syncColorsToSvg())
    } else {
      clearAllRingAnimations(svg, ringOrder)
      syncColorsToSvg()
    }

    prevAnimationEnabledRef.current = animationEnabled
  }, [ringConfigs, ringOrder, syncColorsToSvg, animationEnabled])

  const updateRing = (ring: RingId, patch: Partial<RingConfig>) => {
    setRingConfigs(prev => ({
      ...prev,
      [ring]: resolveRingConfig({ ...defaultRingConfig(), ...prev[ring], ...patch }),
    }))
  }

  const clearAllAnimations = () => {
    setRingConfigs(defaultRingConfigs(ringOrder))
  }

  const copyTemplateSnippet = async () => {
    const template = buildTemplateFromState(
      activeGraphic,
      ringOrder,
      ringConfigs,
      colorOverrides,
      backgroundColor,
    )
    const snippet = templateToJsonSnippet(template)
    try {
      await navigator.clipboard.writeText(snippet)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
    window.setTimeout(() => setCopyStatus('idle'), 2000)
  }

  return (
    <div className="dunhuang-page">
      <div
        ref={svgHostRef}
        className="dunhuang-page__canvas"
        style={{ backgroundColor }}
      />

      <button
        type="button"
        className="dunhuang-page__controls-toggle"
        aria-expanded={controlsOpen}
        aria-controls="dunhuang-sidebar"
        onClick={() => setControlsOpen(open => !open)}
      >
        Controls
      </button>

      <button
        type="button"
        className={`dunhuang-page__controls-backdrop${controlsOpen ? ' is-visible' : ''}`}
        aria-label="Close controls"
        tabIndex={controlsOpen ? 0 : -1}
        onClick={() => setControlsOpen(false)}
      />

      <aside
        id="dunhuang-sidebar"
        className={`dunhuang-page__sidebar${controlsOpen ? ' is-open' : ''}`}
      >
        <div className="dunhuang-page__controls-handle" aria-hidden="true" />

        <section className="dunhuang-page__gallery">
          <h2 className="dunhuang-page__panel-header">Gallery</h2>
          <div className="dunhuang-page__gallery-grid">
            {DUNHUANG_GRAPHICS.map(graphic => (
              <button
                key={graphic.id}
                type="button"
                className={`dunhuang-page__gallery-item${graphic.id === activeGraphicId ? ' is-active' : ''}`}
                aria-pressed={graphic.id === activeGraphicId}
                onClick={() => switchGraphic(graphic.id)}
              >
                <span className="dunhuang-page__gallery-item-label">{graphic.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="dunhuang-page__controls">
          <div className="dunhuang-page__controls-header-row">
            <h2 className="dunhuang-page__controls-header">Layer Controls</h2>
            <div className="dunhuang-page__controls-header-actions">
              <button
                type="button"
                className="dunhuang-page__controls-copy"
                aria-label={
                  copyStatus === 'copied'
                    ? 'Template copied'
                    : copyStatus === 'error'
                      ? 'Copy failed'
                      : 'Copy template'
                }
                title={
                  copyStatus === 'copied'
                    ? 'Copied!'
                    : copyStatus === 'error'
                      ? 'Copy failed'
                      : 'Copy template'
                }
                onClick={copyTemplateSnippet}
              >
                {copyStatus === 'copied' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              </button>
              <button
                type="button"
                className="dunhuang-page__controls-close"
                aria-label="Close controls"
                onClick={() => setControlsOpen(false)}
              >
                ×
              </button>
            </div>
          </div>

          <Tabs defaultValue="color" className="dunhuang-page__controls-tabs-root">
            <div className="dunhuang-page__controls-tabs-header">
              <TabsList className="w-full">
                <TabsTrigger value="color">Color</TabsTrigger>
                <TabsTrigger value="animation">Animation</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="color" className="dunhuang-page__tab-panel dunhuang-page__tab-panel--color">
              {paintColorKeys.map((colorKey, index) => {
                const current = colorOverrides[colorKey] ?? colorKey
                const slotLabel = colorSlotLabel(activeGraphicId, index, defaultTemplate(activeGraphicId).colorLabels)
                return (
                  <div key={colorKey} className="dunhuang-color-row">
                    <span className="dunhuang-color-row__label">{slotLabel}</span>
                    <DunhuangColorPicker
                      label={slotLabel}
                      value={current}
                      palettes={palettes}
                      onChange={next => updateColor(colorKey, next)}
                    />
                  </div>
                )
              })}

              <div className="dunhuang-color-row">
                <span className="dunhuang-color-row__label">background</span>
                <DunhuangColorPicker
                  label="background"
                  value={backgroundColor}
                  palettes={palettes}
                  onChange={updateBackgroundColor}
                />
              </div>

              <div className="dunhuang-color-actions dunhuang-color-actions--bottom">
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={resetColors}>
                  Reset
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="animation" className="dunhuang-page__tab-panel dunhuang-page__tab-panel--animation">
              <div className="dunhuang-animation-toolbar">
                <label className="dunhuang-animation-toggle">
                  <span>Animation</span>
                  <Switch checked={animationEnabled} onCheckedChange={setAnimationEnabled} />
                </label>
              </div>

              {ringOrder.map(ring => {
                const config = resolveRingConfig(ringConfigs[ring])
                return (
                  <details key={ring} className="dunhuang-ring-panel">
                    <summary>#{ring}</summary>

                    <div className="dunhuang-ring-panel__body">
                      <label>
                        <span>Rotation</span>
                        <select
                          value={config.rotation}
                          onChange={e => updateRing(ring, { rotation: e.target.value as RotationMode })}
                        >
                          <option value="none">None</option>
                          <option value="cw">Clockwise</option>
                          <option value="ccw">Counterclockwise</option>
                        </select>
                      </label>

                      <label>
                        <span>
                          Rotation speed ({config.rotationSpeed})
                          {config.rotation === 'none' ? ' (disabled)' : ''}
                        </span>
                        <input
                          type="range"
                          min={ROTATION_SPEED_MIN}
                          max={ROTATION_SPEED_MAX}
                          step={0.1}
                          value={config.rotationSpeed}
                          disabled={config.rotation === 'none'}
                          className="disabled:opacity-40"
                          onChange={e => updateRing(ring, { rotationSpeed: Number(e.target.value) })}
                        />
                      </label>

                      <label>
                        <span>Scaling</span>
                        <select
                          value={config.scale}
                          onChange={e => updateRing(ring, { scale: e.target.value as ScaleMode })}
                        >
                          <option value="none">None</option>
                          <option value="pingpong">Ping-pong</option>
                        </select>
                      </label>

                      <label>
                        <span>
                          Min scale ({config.scaleMinPercent}%)
                          {config.scale === 'none' ? ' (disabled)' : ''}
                        </span>
                        <input
                          type="range"
                          min={SCALE_MIN_PERCENT_MIN}
                          max={SCALE_MIN_PERCENT_MAX}
                          value={config.scaleMinPercent}
                          disabled={config.scale === 'none'}
                          className="disabled:opacity-40"
                          onChange={e => updateRing(ring, { scaleMinPercent: Number(e.target.value) })}
                        />
                      </label>

                      <label>
                        <span>
                          Scale speed
                          {config.scale === 'none' ? ' (disabled)' : ''}
                        </span>
                        <input
                          type="range"
                          min={SCALE_SPEED_MIN}
                          max={SCALE_SPEED_MAX}
                          value={config.scaleSpeed}
                          disabled={config.scale === 'none'}
                          className="disabled:opacity-40"
                          onChange={e => updateRing(ring, { scaleSpeed: Number(e.target.value) })}
                        />
                      </label>
                    </div>
                  </details>
                )
              })}

              <div className="dunhuang-color-actions dunhuang-color-actions--bottom">
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={clearAllAnimations}>
                  Clear all
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </aside>
    </div>
  )
}
