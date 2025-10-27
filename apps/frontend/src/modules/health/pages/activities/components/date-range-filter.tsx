import { useFilters } from '@frontend/hooks/use-filters'
import { Button } from '@workspace/ui/components/button'
import { Calendar } from '@workspace/ui/components/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { Separator } from '@workspace/ui/components/separator'
import { format, parse } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'
import { useState } from 'react'

export default function DateRangeFilter() {
  const { filters, setFilters } = useFilters(
    '/_authenticated/health/activities/',
  )
  const [open, setOpen] = useState(false)

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

  const hasFilters = startDate || endDate

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
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">Filtrar por fecha</h4>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs"
                onClick={handleClearAll}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Separator className="my-2" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </PopoverContent>
    </Popover>
  )
}
