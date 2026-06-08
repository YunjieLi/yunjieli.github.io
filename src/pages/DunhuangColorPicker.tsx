import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { colorsEqual, formatColorLabel, normalizeSvgColor } from './dunhuang-colors'
import {
  DUNHUANG_PALETTES,
  paletteSwatchLabel,
  paletteSwatchesInOrder,
} from './dunhuang-palettes'

interface DunhuangColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
}

function activeSwatchId(value: string) {
  for (const palette of DUNHUANG_PALETTES) {
    const swatches = paletteSwatchesInOrder(palette)

    for (let index = 0; index < swatches.length; index += 1) {
      if (colorsEqual(swatches[index], value)) return `${palette.id}-${index}`
    }

    if (colorsEqual(palette.background, value)) return `${palette.id}-background`
  }

  return null
}

export default function DunhuangColorPicker({ label, value, onChange }: DunhuangColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [customMode, setCustomMode] = useState(false)

  const selectedSwatchId = useMemo(() => activeSwatchId(value), [value])

  const close = () => {
    setOpen(false)
    setCustomMode(false)
  }

  const selectColor = (raw: string) => {
    const normalized = normalizeSvgColor(raw)
    if (!normalized) return
    onChange(normalized)
    close()
  }

  return (
    <Popover
      open={open}
      onOpenChange={nextOpen => {
        setOpen(nextOpen)
        if (!nextOpen) setCustomMode(false)
      }}
    >
      <PopoverTrigger
        type="button"
        className="dunhuang-color-row__picker-trigger"
        style={{ backgroundColor: value }}
        aria-label={`Pick color for ${label}`}
      />
      <PopoverContent align="end" side="left" className="dunhuang-color-picker">
        {!customMode ? (
          <>
            <div className="dunhuang-color-picker__palettes">
              {DUNHUANG_PALETTES.map(palette => {
                const swatches = paletteSwatchesInOrder(palette)
                const backgroundSwatchId = `${palette.id}-background`

                return (
                  <div key={palette.id} className="dunhuang-color-picker__palette">
                    <span className="dunhuang-color-picker__palette-label">{palette.label}</span>
                    <div className="dunhuang-color-picker__swatches">
                      {swatches.map((swatch, index) => {
                        const swatchId = `${palette.id}-${index}`
                        return (
                          <button
                            key={swatchId}
                            type="button"
                            className={cn(
                              'dunhuang-color-picker__swatch',
                              selectedSwatchId === swatchId && 'dunhuang-color-picker__swatch--active',
                            )}
                            style={{ backgroundColor: swatch }}
                            aria-label={paletteSwatchLabel(palette, index)}
                            aria-pressed={selectedSwatchId === swatchId}
                            onClick={() => selectColor(swatch)}
                          />
                        )
                      })}
                      <button
                        type="button"
                        className={cn(
                          'dunhuang-color-picker__swatch dunhuang-color-picker__swatch--background',
                          selectedSwatchId === backgroundSwatchId && 'dunhuang-color-picker__swatch--active',
                        )}
                        style={{ backgroundColor: palette.background }}
                        aria-label={
                          palette.colorLabels?.background
                            ? `${palette.colorLabels.background} (${palette.label} background)`
                            : `${palette.label} background`
                        }
                        aria-pressed={selectedSwatchId === backgroundSwatchId}
                        onClick={() => selectColor(palette.background)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="dunhuang-color-picker__customize"
              onClick={() => setCustomMode(true)}
            >
              Customize
            </Button>
          </>
        ) : (
          <div className="dunhuang-color-picker__custom">
            <p className="dunhuang-color-picker__custom-label">{label}</p>
            <label className="dunhuang-color-picker__custom-input">
              <span className="dunhuang-color-picker__custom-value">{formatColorLabel(value)}</span>
              <input
                type="color"
                value={value}
                onChange={e => selectColor(e.target.value)}
              />
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="dunhuang-color-picker__back"
              onClick={() => setCustomMode(false)}
            >
              Back to palettes
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
