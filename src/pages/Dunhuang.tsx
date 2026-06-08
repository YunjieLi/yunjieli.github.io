import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import zaojing1 from '@/assets/dunhuang/zaojing1.svg?raw'
import {
  defaultRingConfig,
  dunhuangTemplates,
  loadTemplateConfigs,
  RING_IDS,
  type RingConfig,
  type RingId,
  type RotationMode,
  type ScaleMode,
} from './dunhuang-config'
import './dunhuang.css'

function speedToDuration(speed: number, minSec: number, maxSec: number) {
  const t = (speed - 1) / 99
  return `${(maxSec - t * (maxSec - minSec)).toFixed(2)}s`
}

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

function applyRingAnimation(group: SVGGElement, config: RingConfig) {
  ensureAnimationHooks(group)

  const rotWrap = group.querySelector('.dunhuang-rot-wrap') as SVGGElement
  const scaleWrap = group.querySelector('.dunhuang-scale-wrap') as SVGGElement

  rotWrap.classList.remove('dunhuang-rot-cw', 'dunhuang-rot-ccw')
  scaleWrap.classList.remove('dunhuang-scale-pingpong')

  if (config.rotation === 'cw') {
    rotWrap.classList.add('dunhuang-rot-cw')
    rotWrap.style.setProperty(
      '--dunhuang-rot-duration',
      speedToDuration(config.rotationSpeed, 2, 30),
    )
  } else if (config.rotation === 'ccw') {
    rotWrap.classList.add('dunhuang-rot-ccw')
    rotWrap.style.setProperty(
      '--dunhuang-rot-duration',
      speedToDuration(config.rotationSpeed, 2, 30),
    )
  } else {
    rotWrap.style.removeProperty('--dunhuang-rot-duration')
  }

  if (config.scale === 'pingpong') {
    scaleWrap.classList.add('dunhuang-scale-pingpong')
    scaleWrap.style.setProperty(
      '--dunhuang-scale-duration',
      speedToDuration(config.scaleSpeed, 1, 12),
    )
  } else {
    scaleWrap.style.removeProperty('--dunhuang-scale-duration')
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
  const [ringOrder, setRingOrder] = useState<RingId[]>([])
  const [ringConfigs, setRingConfigs] = useState<Record<RingId, RingConfig>>(() =>
    loadTemplateConfigs(dunhuangTemplates.defaultTemplate),
  )
  const [controlsOpen, setControlsOpen] = useState(false)

  useLayoutEffect(() => {
    const host = svgHostRef.current
    if (!host) return

    host.innerHTML = zaojing1
    const svg = host.querySelector('svg')
    if (!svg) return

    svg.classList.add('dunhuang-svg')

    const order = discoverRingOrder(svg)
    setRingOrder(order)
    applyAllRingAnimations(svg, order, ringConfigs)
    svgReadyRef.current = true
  }, [])

  useEffect(() => {
    if (!svgReadyRef.current) return

    const svg = svgHostRef.current?.querySelector('svg')
    if (!svg || ringOrder.length === 0) return

    applyAllRingAnimations(svg, ringOrder, ringConfigs)
  }, [ringConfigs, ringOrder])

  const updateRing = (ring: RingId, patch: Partial<RingConfig>) => {
    setRingConfigs(prev => ({
      ...prev,
      [ring]: { ...prev[ring], ...patch },
    }))
  }

  return (
    <div className="dunhuang-page">
      <div ref={svgHostRef} className="dunhuang-page__canvas" />

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
          <button
            type="button"
            className="dunhuang-page__controls-close"
            aria-label="Close layer controls"
            onClick={() => setControlsOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="dunhuang-page__panels">
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
                      Rotation speed
                      {config.rotation === 'none' ? ' (disabled)' : ''}
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={100}
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
                      <option value="pingpong">Ping-pong (1 → 0.8 → 1)</option>
                    </select>
                  </label>

                  <label>
                    <span>
                      Scale speed
                      {config.scale === 'none' ? ' (disabled)' : ''}
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={100}
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
        </div>
      </aside>
    </div>
  )
}
