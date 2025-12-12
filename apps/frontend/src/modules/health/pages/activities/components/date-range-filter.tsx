import { useFilters } from '@frontend/hooks/use-filters'
import { useIsMobile } from '@frontend/hooks/use-mobile'
import { Button } from '@workspace/ui/components/button'
import { Calendar } from '@workspace/ui/components/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { Separator } from '@workspace/ui/components/separator'
import { format, parse } from 'date-fns'
import { CalendarIcon, GripVertical } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

export default function DateRangeFilter() {
  const { filters, setFilters } = useFilters(
    '/_authenticated/health/activities/',
  )
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const startDate = filters.startDate
    ? parse(filters.startDate, 'yyyy-MM-dd', new Date())
    : undefined
  const endDate = filters.endDate
    ? parse(filters.endDate, 'yyyy-MM-dd', new Date())
    : undefined

  const handleStartChange = (date?: Date) => {
    setFilters({
      startDate: date ? format(date, 'yyyy-MM-dd') : undefined,
      // Si la fecha hasta es menor que la nueva fecha desde, la limpiamos
      endDate: endDate && date && endDate < date ? undefined : filters.endDate,
      page: 0,
    })
  }

  const handleEndChange = (date?: Date) => {
    setFilters({
      endDate: date ? format(date, 'yyyy-MM-dd') : undefined,
      page: 0,
    })
  }

  const handleClearAll = () => {
    setFilters({ startDate: undefined, endDate: undefined, page: 0 })
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
    },
    [isDragging, dragStart],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
    e.preventDefault()
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const hasFilters = startDate || endDate

  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md h-10"
        >
          <CalendarIcon className="h-4 w-4" />
          {hasFilters ? (
            <span className="text-xs sm:text-sm">
              {startDate && format(startDate, 'dd/MM')}
              {startDate && endDate && ' - '}
              {endDate && format(endDate, 'dd/MM')}
            </span>
          ) : (
            <span className="text-xs sm:text-sm">Fechas</span>
          )}
        </button>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-4">
          <DialogHeader className="text-left">
            <DialogTitle>Filtrar por rango de fecha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                Desde
              </p>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartChange}
                disabled={(date) => (endDate ? date > endDate : false)}
                initialFocus
                className="w-full"
              />
            </div>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                Hasta
              </p>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndChange}
                disabled={(date) => (startDate ? date < startDate : false)}
                className="w-full"
              />
            </div>
            {hasFilters && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleClearAll}
              >
                Limpiar filtro
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-[200px]">
          <CalendarIcon className="h-4 w-4" />
          {hasFilters ? (
            <span className="text-sm">
              {startDate && format(startDate, 'dd/MM/yyyy')}
              {startDate && endDate && ' - '}
              {endDate && format(endDate, 'dd/MM/yyyy')}
            </span>
          ) : (
            <span>Rango de fechas</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        >
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="calendar-drag-handle cursor-grab active:cursor-grabbing p-0 border-0 bg-transparent"
                  onMouseDown={handleMouseDown}
                  aria-label="Arrastrar para mover"
                  style={{
                    cursor: isDragging ? 'grabbing' : 'grab',
                  }}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </button>
                <h4 className="text-sm font-semibold">Filtrar por fecha</h4>
              </div>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-xs"
                  onClick={handleClearAll}
                >
                  Limpiar
                </Button>
              )}
            </div>
            <Separator className="my-2" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Desde</p>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartChange}
                  disabled={(date) => (endDate ? date > endDate : false)}
                  initialFocus
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Hasta</p>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndChange}
                  disabled={(date) => (startDate ? date < startDate : false)}
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
