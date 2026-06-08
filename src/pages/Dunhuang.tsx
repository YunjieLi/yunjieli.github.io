import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import zaojing1 from '@/assets/dunhuang/zaojing1.svg?raw'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DunhuangColorPicker from './DunhuangColorPicker'
import { colorSlotLabel } from './dunhuang-palettes'
import { useDunhuangColors } from './use-dunhuang-colors'
import {
  defaultRingConfig,
  rotationSpeedToDuration,
  ROTATION_SPEED_MAX,
  ROTATION_SPEED_MIN,
  RING_IDS,
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
import { buildTemplateFromState, loadTemplateConfigs, templateToJsonSnippet } from './dunhuang-templates'
import './dunhuang.css'

const ANIMATION_SETTLE_MS = 600

function discoverRingOrder(svg: SVGSVGElement): RingId[] {
  return [...svg.querySelectorAll('g[id^="ring"]')]
    .map(el => el.id)
    .filter((id): id is RingId => (RING_IDS as readonly string[]).includes(id))
}

function ensureAnimationHooks(group: SVGGElement) {
  if (group.querySelector('.dunhuang-rot-wrap')) return

  const rotWrap = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  rotWrap.setAttribute('class', 'dunhuang-rot-wrap')

  const scaleWrap = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  scaleWrap.setAttribute('class', 'dunhuang-scale-wrap')

  while (group.firstChild) {
    scaleWrap.appendChild(group.firstChild)
  }

  rotWrap.appendChild(scaleWrap)
  group.appendChild(rotWrap)
}

function resetWrapTransformState(wrap: SVGGElement) {
  wrap.style.transform = ''
  wrap.classList.remove('dunhuang-transform-settling')
}

function applyRingAnimation(group: SVGGElement, config: RingConfig) {
  ensureAnimationHooks(group)

  const rotWrap = group.querySelector('.dunhuang-rot-wrap') as SVGGElement
  const scaleWrap = group.querySelector('.dunhuang-scale-wrap') as SVGGElement

  resetWrapTransformState(rotWrap)
  resetWrapTransformState(scaleWrap)

  rotWrap.classList.remove('dunhuang-rot-cw', 'dunhuang-rot-ccw')
  scaleWrap.classList.remove('dunhuang-scale-pingpong')

  if (config.rotation === 'cw') {
    rotWrap.classList.add('dunhuang-rot-cw')
    rotWrap.style.setProperty('--dunhuang-rot-duration', rotationSpeedToDuration(config.rotationSpeed))
  } else if (config.rotation === 'ccw') {
    rotWrap.classList.add('dunhuang-rot-ccw')
    rotWrap.style.setProperty('--dunhuang-rot-duration', rotationSpeedToDuration(config.rotationSpeed))
  } else {
    rotWrap.style.removeProperty('--dunhuang-rot-duration')
  }

  if (config.scale === 'pingpong') {
    scaleWrap.classList.add('dunhuang-scale-pingpong')
    scaleWrap.style.setProperty('--dunhuang-scale-duration', scaleSpeedToDuration(config.scaleSpeed))
    scaleWrap.style.setProperty('--dunhuang-scale-min', scaleMinPercentToFactor(config.scaleMinPercent))
  } else {
    scaleWrap.style.removeProperty('--dunhuang-scale-duration')
    scaleWrap.style.removeProperty('--dunhuang-scale-min')
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
    const group = svg.querySelector(`#${ring}`)
    if (!(group instanceof SVGGElement)) return Promise.resolve()
    return settleRingAnimation(group)
  })

  return Promise.all(transitions).then(() => undefined)
}

function clearAllRingAnimations(svg: SVGSVGElement, ringOrder: RingId[]) {
  for (const ring of ringOrder) {
    const group = svg.querySelector(`#${ring}`)
    if (group instanceof SVGGElement) {
      clearRingAnimation(group)
    }
  }
}

function applyAllRingAnimations(
  svg: SVGSVGElement,
  ringOrder: RingId[],
  configs: Record<RingId, RingConfig>,
) {
  for (const ring of ringOrder) {
    const group = svg.querySelector(`#${ring}`)
    if (group instanceof SVGGElement) {
      applyRingAnimation(group, configs[ring] ?? defaultRingConfig())
    }
  }
}

export default function Dunhuang() {
  const svgHostRef = useRef<HTMLDivElement>(null)
  const svgReadyRef = useRef(false)
  const prevAnimationEnabledRef = useRef(true)
  const [ringOrder, setRingOrder] = useState<RingId[]>([])
  const [ringConfigs, setRingConfigs] = useState<Record<RingId, RingConfig>>(() =>
    loadTemplateConfigs(),
  )
  const [controlsOpen, setControlsOpen] = useState(false)
  const [animationEnabled, setAnimationEnabled] = useState(true)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const {
    paintColorKeys,
    colorOverrides,
    backgroundColor,
    initFromSvg,
    syncColorsToSvg,
    updateColor,
    updateBackgroundColor,
    resetColors,
  } = useDunhuangColors(svgHostRef)

  useLayoutEffect(() => {
    const host = svgHostRef.current
    if (!host) return

    host.innerHTML = zaojing1
    const svg = host.querySelector('svg')
    if (!svg) return

    svg.classList.add('dunhuang-svg')
    initFromSvg(svg)

    const order = discoverRingOrder(svg)
    setRingOrder(order)
    if (animationEnabled) {
      applyAllRingAnimations(svg, order, ringConfigs)
    } else {
      clearAllRingAnimations(svg, order)
    }
    svgReadyRef.current = true
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
      [ring]: { ...prev[ring], ...patch },
    }))
  }

  const copyTemplateSnippet = async () => {
    const template = buildTemplateFromState(ringConfigs, colorOverrides, backgroundColor)
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
        aria-controls="dunhuang-layer-controls"
        onClick={() => setControlsOpen(open => !open)}
      >
        Layers
      </button>

      <button
        type="button"
        className={`dunhuang-page__controls-backdrop${controlsOpen ? ' is-visible' : ''}`}
        aria-label="Close layer controls"
        tabIndex={controlsOpen ? 0 : -1}
        onClick={() => setControlsOpen(false)}
      />

      <aside
        id="dunhuang-layer-controls"
        className={`dunhuang-page__controls${controlsOpen ? ' is-open' : ''}`}
      >
        <div className="dunhuang-page__controls-handle" aria-hidden="true" />

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
              aria-label="Close layer controls"
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
              const slotLabel = colorSlotLabel(index)
              return (
                <div key={colorKey} className="dunhuang-color-row">
                  <span className="dunhuang-color-row__label">{slotLabel}</span>
                  <DunhuangColorPicker
                    label={slotLabel}
                    value={current}
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
            const config = ringConfigs[ring]
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
          </TabsContent>
        </Tabs>
      </aside>
    </div>
  )
}
