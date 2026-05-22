import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Trash2 } from 'lucide-react'
import {
  clampZone,
  createZone,
  SUPPORT_KIND_LABELS,
  ZONE_STYLES,
  ZONE_TYPE_LABELS,
} from '../../lib/venueLayout'
import { darkInput, darkLabel } from '../ui/darkForm'
import type {
  SupportStationKind,
  VenueLayout,
  VenueLayoutZone,
  VenueZoneType,
} from '../../types'

interface Props {
  layout: VenueLayout
  onChange: (layout: VenueLayout) => void
}

type DragMode = 'move' | 'resize' | null

interface DragState {
  zoneId: string
  mode: 'move' | 'resize'
  startX: number
  startY: number
  origin: VenueLayoutZone
}

function pct(value: number, total: number) {
  return `${(value / total) * 100}%`
}

export function VenueLayoutEditor({ layout, onChange }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const dragRef = useRef<DragState | null>(null)

  const selected = layout.zones.find((z) => z.id === selectedId) ?? null
  const cw = layout.canvas_width
  const ch = layout.canvas_height

  const updateZones = useCallback(
    (zones: VenueLayoutZone[]) => {
      onChange({ ...layout, zones })
    },
    [layout, onChange],
  )

  const updateZone = useCallback(
    (id: string, patch: Partial<VenueLayoutZone>) => {
      updateZones(
        layout.zones.map((z) =>
          z.id === id ? clampZone({ ...z, ...patch }, cw, ch) : z,
        ),
      )
    },
    [layout.zones, updateZones, cw, ch],
  )

  const addZone = (type: VenueZoneType, supportKind?: SupportStationKind) => {
    const zone = createZone(type, { supportKind })
    updateZones([...layout.zones, zone])
    setSelectedId(zone.id)
  }

  const removeZone = (id: string) => {
    updateZones(layout.zones.filter((z) => z.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const clientToLogical = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: ((clientX - rect.left) / rect.width) * cw,
      y: ((clientY - rect.top) / rect.height) * ch,
    }
  }

  const onCanvasPointerDown = (e: ReactPointerEvent) => {
    if (e.target === canvasRef.current) setSelectedId(null)
  }

  const onZonePointerDown = (
    e: ReactPointerEvent,
    zone: VenueLayoutZone,
    mode: DragMode,
  ) => {
    e.stopPropagation()
    setSelectedId(zone.id)
    if (!mode) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const { x, y } = clientToLogical(e.clientX, e.clientY)
    dragRef.current = {
      zoneId: zone.id,
      mode,
      startX: x,
      startY: y,
      origin: { ...zone },
    }
  }

  const onPointerMove = (e: ReactPointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    const { x, y } = clientToLogical(e.clientX, e.clientY)
    const dx = x - drag.startX
    const dy = y - drag.startY
    const o = drag.origin

    if (drag.mode === 'move') {
      updateZone(drag.zoneId, { x: o.x + dx, y: o.y + dy })
    } else {
      updateZone(drag.zoneId, {
        width: o.width + dx,
        height: o.height + dy,
      })
    }
  }

  const onPointerUp = (e: ReactPointerEvent) => {
    if (dragRef.current) {
      dragRef.current = null
      try {
        ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {
        /* already released */
      }
    }
  }

  const tableCount = layout.zones.filter((z) => z.type === 'table').length

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <ToolBtn onClick={() => addZone('dance_floor')}>+ Pista</ToolBtn>
          <ToolBtn onClick={() => addZone('jury')}>+ Júri</ToolBtn>
          <ToolBtn onClick={() => addZone('sponsors')}>+ Sponsors</ToolBtn>
          <ToolBtn onClick={() => addZone('support_station', 'makeup')}>
            + Maquilhagem
          </ToolBtn>
          <ToolBtn onClick={() => addZone('support_station', 'hairdresser')}>
            + Cabeleireiro
          </ToolBtn>
          <ToolBtn onClick={() => addZone('support_station', 'other')}>
            + Apoio
          </ToolBtn>
          <ToolBtn onClick={() => addZone('table')}>+ Mesa</ToolBtn>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#2a2a3d] bg-[#0d0d14] p-2 sm:p-3">
          <div
            ref={canvasRef}
            role="application"
            aria-label="Planta do salão"
            className="relative mx-auto w-full max-w-4xl touch-none select-none"
            style={{ aspectRatio: `${cw} / ${ch}` }}
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div
              className="absolute inset-0 rounded-lg border-2 border-dashed border-[#2a2a3d] bg-[#12121c]"
              style={{
                backgroundImage:
                  'linear-gradient(#1a1a28 1px, transparent 1px), linear-gradient(90deg, #1a1a28 1px, transparent 1px)',
                backgroundSize: '10% 10%',
              }}
            />
            <span className="absolute left-2 top-2 z-10 rounded bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {layout.hall_label ?? 'Salão'}
            </span>

            {layout.zones.map((zone) => {
              const style = ZONE_STYLES[zone.type]
              const isSelected = zone.id === selectedId
              return (
                <div
                  key={zone.id}
                  role="button"
                  tabIndex={0}
                  className={`absolute flex flex-col items-center justify-center overflow-hidden rounded-md border-2 p-1 text-center transition-shadow ${
                    isSelected ? 'z-20 ring-2 ring-[#ff2d6a] ring-offset-1 ring-offset-[#0d0d14]' : 'z-10'
                  }`}
                  style={{
                    left: pct(zone.x, cw),
                    top: pct(zone.y, ch),
                    width: pct(zone.width, cw),
                    height: pct(zone.height, ch),
                    backgroundColor: style.fill,
                    borderColor: style.border,
                    color: style.text,
                  }}
                  onPointerDown={(e) => onZonePointerDown(e, zone, 'move')}
                >
                  <span className="pointer-events-none text-[10px] font-bold uppercase leading-tight sm:text-xs">
                    {zone.label}
                  </span>
                  {zone.type === 'table' && zone.seats != null && (
                    <span className="pointer-events-none text-[9px] opacity-80">
                      {zone.seats} lugares
                    </span>
                  )}
                  {zone.type === 'support_station' && zone.supportKind && (
                    <span className="pointer-events-none text-[9px] opacity-80">
                      {SUPPORT_KIND_LABELS[zone.supportKind]}
                    </span>
                  )}
                  {isSelected && (
                    <div
                      className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize rounded-tl bg-white/90"
                      style={{ touchAction: 'none' }}
                      onPointerDown={(e) => {
                        e.stopPropagation()
                        onZonePointerDown(e, zone, 'resize')
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <ul className="flex flex-wrap gap-3 text-[10px] uppercase tracking-wide text-slate-500">
          {(Object.keys(ZONE_TYPE_LABELS) as VenueZoneType[]).map((type) => (
            <li key={type} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded border"
                style={{
                  backgroundColor: ZONE_STYLES[type].fill,
                  borderColor: ZONE_STYLES[type].border,
                }}
              />
              {ZONE_TYPE_LABELS[type]}
            </li>
          ))}
        </ul>
      </div>

      <aside className="w-full shrink-0 space-y-4 rounded-xl border border-[#2a2a3d] bg-[#12121c] p-4 lg:w-72">
        <h3 className="text-sm font-bold uppercase tracking-wide text-white">
          {selected ? 'Zona selecionada' : 'Propriedades'}
        </h3>

        <label className="block">
          <span className={darkLabel}>Nome do salão</span>
          <input
            className={darkInput}
            value={layout.hall_label ?? ''}
            onChange={(e) =>
              onChange({ ...layout, hall_label: e.target.value })
            }
            placeholder="Salão principal"
          />
        </label>

        {selected ? (
          <>
            <p className="text-xs text-slate-500">
              Tipo: {ZONE_TYPE_LABELS[selected.type]}
            </p>
            <label className="block">
              <span className={darkLabel}>Etiqueta</span>
              <input
                className={darkInput}
                value={selected.label}
                onChange={(e) =>
                  updateZone(selected.id, { label: e.target.value })
                }
              />
            </label>
            {selected.type === 'table' && (
              <label className="block">
                <span className={darkLabel}>Lugares</span>
                <input
                  type="number"
                  min={1}
                  className={darkInput}
                  value={selected.seats ?? 8}
                  onChange={(e) =>
                    updateZone(selected.id, {
                      seats: parseInt(e.target.value, 10) || 1,
                    })
                  }
                />
              </label>
            )}
            <div className="grid grid-cols-2 gap-2">
              <NumField
                label="X"
                value={Math.round(selected.x)}
                onChange={(v) => updateZone(selected.id, { x: v })}
              />
              <NumField
                label="Y"
                value={Math.round(selected.y)}
                onChange={(v) => updateZone(selected.id, { y: v })}
              />
              <NumField
                label="Largura"
                value={Math.round(selected.width)}
                onChange={(v) => updateZone(selected.id, { width: v })}
              />
              <NumField
                label="Altura"
                value={Math.round(selected.height)}
                onChange={(v) => updateZone(selected.id, { height: v })}
              />
            </div>
            <button
              type="button"
              onClick={() => removeZone(selected.id)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              Remover zona
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-500">
            Clica numa zona no canvas para a editar, ou adiciona elementos com os
            botões acima. Arrasta para mover; no canto inferior direito redimensiona.
          </p>
        )}

        <p className="text-[10px] text-slate-600">
          {layout.zones.length} zonas · {tableCount} mesas
        </p>
      </aside>
    </div>
  )
}

function ToolBtn({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-[#2a2a3d] bg-[#1a1a28] px-2 py-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-300 hover:border-[#ff2d6a]/50 hover:text-white min-[400px]:text-[10px] sm:px-2.5 sm:text-xs"
    >
      {children}
    </button>
  )
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-medium uppercase text-slate-500">
        {label}
      </span>
      <input
        type="number"
        className={darkInput + ' !py-1.5 !text-sm'}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </label>
  )
}
