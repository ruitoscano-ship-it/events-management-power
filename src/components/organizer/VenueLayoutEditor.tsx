import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Trash2 } from 'lucide-react'
import {
  clampZone,
  createZone,
  GRID_CELL,
  snapZone,
  SUPPORT_KIND_LABELS,
  VENUE_ZONE_TYPES,
  venueGridBackground,
  ZONE_TYPE_LABELS,
  ZONE_TYPE_SHORT,
  zoneStyle,
} from '../../lib/venueLayout'
import { darkInput, darkLabel } from '../ui/darkForm'
import { VenueZoneIcon } from './venue/VenueZoneIcon'
import { ZONE_PALETTE, type ZonePaletteItem } from './venue/zonePalette'
import type { VenueLayout, VenueLayoutZone } from '../../types'

interface Props {
  layout: VenueLayout
  onChange: (layout: VenueLayout) => void
  readOnly?: boolean
}

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

export function VenueLayoutEditor({ layout, onChange, readOnly = false }: Props) {
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
    (id: string, patch: Partial<VenueLayoutZone>, snap = false) => {
      updateZones(
        layout.zones.map((z) => {
          if (z.id !== id) return z
          const next = clampZone({ ...z, ...patch }, cw, ch)
          return snap ? snapZone(next) : next
        }),
      )
    },
    [layout.zones, updateZones, cw, ch],
  )

  const addZone = (item: ZonePaletteItem) => {
    const zone = createZone(item.type, { supportKind: item.supportKind })
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
    mode: 'move' | 'resize' | null,
  ) => {
    if (readOnly) return
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
    if (!drag || readOnly) return
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
    const drag = dragRef.current
    if (drag) {
      updateZone(drag.zoneId, {}, true)
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
        {!readOnly && (
          <div className="space-y-3">
            {ZONE_PALETTE.map((group) => (
              <div key={group.title}>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {group.title}
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {group.items.map((item) => (
                    <PaletteBtn
                      key={`${item.type}-${item.supportKind ?? ''}`}
                      item={item}
                      onClick={() => addZone(item)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

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
              className="absolute inset-0 rounded-lg border-2 border-[#3d3d52] shadow-inner"
              style={venueGridBackground(cw, ch)}
            />
            <div
              className="pointer-events-none absolute inset-2 rounded-md border border-dashed border-white/10"
              aria-hidden
            />
            <span className="absolute left-2 top-2 z-10 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-300 backdrop-blur-sm">
              {layout.hall_label ?? 'Salão'}
            </span>
            <span className="absolute right-2 top-2 z-10 rounded-md bg-black/50 px-2 py-0.5 text-[9px] text-slate-500">
              Grelha {GRID_CELL} u. · encaixe ao largar
            </span>

            {layout.zones.map((zone) => {
              const style = zoneStyle(zone.type)
              const isSelected = zone.id === selectedId
              const showIcon =
                zone.width >= 56 && zone.height >= 48
              return (
                <div
                  key={zone.id}
                  role="button"
                  tabIndex={readOnly ? -1 : 0}
                  className={`absolute flex flex-col items-center justify-center gap-0.5 overflow-hidden rounded-md border-2 p-1 text-center transition-shadow ${
                    isSelected
                      ? 'z-20 ring-2 ring-[#ff2d6a] ring-offset-1 ring-offset-[#0d0d14]'
                      : 'z-10'
                  } ${readOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
                  style={{
                    left: pct(zone.x, cw),
                    top: pct(zone.y, ch),
                    width: pct(zone.width, cw),
                    height: pct(zone.height, ch),
                    backgroundColor: style.fill,
                    borderColor: style.border,
                    color: style.text,
                  }}
                  onPointerDown={(e) =>
                    onZonePointerDown(e, zone, readOnly ? null : 'move')
                  }
                >
                  {showIcon && (
                    <VenueZoneIcon
                      type={zone.type}
                      supportKind={zone.supportKind}
                      size={zone.height >= 80 ? 'lg' : 'md'}
                      className="pointer-events-none opacity-95 drop-shadow-sm"
                    />
                  )}
                  <span className="pointer-events-none max-w-full truncate px-0.5 text-[9px] font-bold uppercase leading-tight sm:text-[10px]">
                    {zone.label}
                  </span>
                  {zone.type === 'table' && zone.seats != null && (
                    <span className="pointer-events-none text-[8px] opacity-80 sm:text-[9px]">
                      {zone.seats} lugares
                    </span>
                  )}
                  {zone.type === 'support_station' && zone.supportKind && (
                    <span className="pointer-events-none text-[8px] opacity-80 sm:text-[9px]">
                      {SUPPORT_KIND_LABELS[zone.supportKind]}
                    </span>
                  )}
                  {isSelected && !readOnly && (
                    <div
                      className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize rounded-tl bg-white/90 shadow"
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

        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] uppercase tracking-wide text-slate-500 sm:grid-cols-3 lg:grid-cols-5">
          {VENUE_ZONE_TYPES.map((type) => {
            const s = zoneStyle(type)
            return (
              <li key={type} className="flex items-center gap-1.5">
                <VenueZoneIcon type={type} size="sm" />
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded border"
                  style={{
                    backgroundColor: s.fill,
                    borderColor: s.border,
                  }}
                />
                {ZONE_TYPE_SHORT[type]}
              </li>
            )
          })}
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
            disabled={readOnly}
          />
        </label>

        {selected ? (
          <>
            <div className="flex items-center gap-2 rounded-lg border border-[#2a2a3d] bg-[#1a1a28] px-3 py-2">
              <VenueZoneIcon
                type={selected.type}
                supportKind={selected.supportKind}
                size="lg"
              />
              <p className="text-xs text-slate-400">
                {ZONE_TYPE_LABELS[selected.type]}
              </p>
            </div>
            <label className="block">
              <span className={darkLabel}>Etiqueta</span>
              <input
                className={darkInput}
                value={selected.label}
                onChange={(e) =>
                  updateZone(selected.id, { label: e.target.value })
                }
                disabled={readOnly}
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
                  disabled={readOnly}
                />
              </label>
            )}
            <div className="grid grid-cols-2 gap-2">
              <NumField
                label="X"
                value={Math.round(selected.x)}
                onChange={(v) => updateZone(selected.id, { x: v }, true)}
                disabled={readOnly}
              />
              <NumField
                label="Y"
                value={Math.round(selected.y)}
                onChange={(v) => updateZone(selected.id, { y: v }, true)}
                disabled={readOnly}
              />
              <NumField
                label="Largura"
                value={Math.round(selected.width)}
                onChange={(v) => updateZone(selected.id, { width: v }, true)}
                disabled={readOnly}
              />
              <NumField
                label="Altura"
                value={Math.round(selected.height)}
                onChange={(v) => updateZone(selected.id, { height: v }, true)}
                disabled={readOnly}
              />
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={() => removeZone(selected.id)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4" />
                Remover zona
              </button>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500">
            {readOnly
              ? 'Evento encerrado — consulta a planta em modo só leitura.'
              : 'Clica numa zona para editar. Arrasta para mover; ao largar encaixa na grelha. Redimensiona pelo canto inferior direito.'}
          </p>
        )}

        <p className="text-[10px] text-slate-600">
          {layout.zones.length} zonas · {tableCount} mesas
        </p>
      </aside>
    </div>
  )
}

function PaletteBtn({
  item,
  onClick,
}: {
  item: ZonePaletteItem
  onClick: () => void
}) {
  const label =
    item.type === 'support_station' && item.supportKind
      ? SUPPORT_KIND_LABELS[item.supportKind]
      : ZONE_TYPE_SHORT[item.type]
  const s = zoneStyle(item.type)

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors hover:border-[#ff2d6a]/60 hover:text-white sm:gap-2 sm:px-2.5 sm:text-xs"
      style={{
        borderColor: `${s.border}`,
        backgroundColor: `${s.fill}`,
        color: s.text,
      }}
    >
      <VenueZoneIcon type={item.type} supportKind={item.supportKind} size="sm" />
      {label}
    </button>
  )
}

function NumField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  disabled?: boolean
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
        disabled={disabled}
      />
    </label>
  )
}
