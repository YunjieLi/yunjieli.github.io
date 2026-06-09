import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { colorsEqual, normalizeSvgColor } from './dunhuang-colors'
import {
  paletteColorKeysInOrder,
  paletteColorLabel,
  type DunhuangPalette,
} from './dunhuang-palettes'

interface DunhuangColorPickerProps {
  label: string
  value: string
  palettes: DunhuangPalette[]
  onChange: (color: string) => void
}

function activeSwatchId(value: string, palettes: DunhuangPalette[]) {
  for (const palette of palettes) {
    const colorKeys = paletteColorKeysInOrder(palette)

    for (const colorKey of colorKeys) {
      if (colorsEqual(palette.colors[colorKey], value)) return `${palette.id}-${colorKey}`
    }

    if (colorsEqual(palette.background, value)) return `${palette.id}-background`
  }

  return null
}

export default function DunhuangColorPicker({ label, value, palettes, onChange }: DunhuangColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [customMode, setCustomMode] = useState(false)

  const selectedSwatchId = useMemo(() => activeSwatchId(value, palettes), [palettes, value])

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
              {palettes.map(palette => {
                const colorKeys = paletteColorKeysInOrder(palette)
                const backgroundSwatchId = `${palette.id}-background`

                return (
                  <div key={palette.id} className="dunhuang-color-picker__palette">
                    <div className="dunhuang-color-picker__swatches">
                      {colorKeys.map(colorKey => {
                        const swatch = palette.colors[colorKey]
                        const swatchId = `${palette.id}-${colorKey}`
                        return (
                          <button
                            key={swatchId}
                            type="button"
                            className={cn(
                              'dunhuang-color-picker__swatch',
                              selectedSwatchId === swatchId && 'dunhuang-color-picker__swatch--active',
                            )}
                            style={{ backgroundColor: swatch }}
                            aria-label={paletteColorLabel(palette, colorKey)}
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
            <label className="dunhuang-color-picker__custom-input">
              <input
                type="color"
                value={value}
                aria-label={`Custom color for ${label}`}
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
