import { useFilters } from '@frontend/hooks/use-filters'
import { Button } from '@workspace/ui/components/button'
import { Calendar } from '@workspace/ui/components/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { cn } from '@workspace/ui/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, FunnelX } from 'lucide-react'
import { useCallback, useState } from 'react'

type ActivitySearchFilters = {
  q?: string
  page?: number
  limit?: number
  sortBy?: string
  startDate?: string
  endDate?: string
}

const useActivityFilters = () => {
  return useFilters('/_authenticated/health/activities/') as {
    filters: ActivitySearchFilters
    setFilters: (f: Partial<ActivitySearchFilters>) => void
  }
}

const dateStringToDate = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined

  const parts = dateString.split('-').map(Number)
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return undefined
  }

  const date = new Date(parts[0], parts[1] - 1, parts[2], 12)

  return Number.isNaN(date.getTime()) ? undefined : date
}

const dateToDateString = (date: Date | undefined): string | undefined => {
  if (!date) return undefined
  return format(date, 'yyyy-MM-dd')
}

const ActivityDateRangeFilter = ({ onClearSearch }) => {
  const { filters, setFilters } = useActivityFilters()

  const currentStartDate = dateStringToDate(filters.startDate)
  const currentEndDate = dateStringToDate(filters.endDate)

  const [isStartDatePopoverOpen, setIsStartDatePopoverOpen] = useState(false)
  const [isEndDatePopoverOpen, setIsEndDatePopoverOpen] = useState(false)

  const handleDateChange = useCallback(
    (date: Date | undefined, field: 'startDate' | 'endDate') => {
      const dateString = dateToDateString(date)

      const updates: Partial<ActivitySearchFilters> = {
        [field]: dateString,
        page: 0,
      }

      if (
        field === 'startDate' &&
        date &&
        currentEndDate &&
        date > currentEndDate
      ) {
        updates.endDate = dateString
      }
      if (
        field === 'endDate' &&
        date &&
        currentStartDate &&
        date < currentStartDate
      ) {
        updates.startDate = dateString
      }

      setFilters(updates)
    },
    [currentStartDate, currentEndDate, setFilters],
  )

  const handleClearFilters = useCallback(() => {
    const areFiltersActive =
      !!filters.startDate || !!filters.endDate || !!filters.q

    if (areFiltersActive) {
      setFilters({
        startDate: undefined,
        endDate: undefined,
        page: 0,
      })

      if (onClearSearch) {
        onClearSearch()
      }
    }
  }, [filters.startDate, filters.endDate, filters.q, setFilters, onClearSearch])

  const areFiltersActive =
    !!filters.startDate || !!filters.endDate || !!filters.q

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-end">
      <div className="relative flex flex-col">
        <Popover
          open={isStartDatePopoverOpen}
          onOpenChange={setIsStartDatePopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[150px] justify-start text-left font-normal',
                !currentStartDate && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-1 h-4 w-4" />
              {currentStartDate
                ? format(currentStartDate, 'dd/MM/yyyy')
                : 'Desde'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50" align="start">
            <Calendar
              mode="single"
              selected={currentStartDate}
              onSelect={(date) => {
                handleDateChange(date, 'startDate')
                setIsStartDatePopoverOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Filtro Fecha HASTA */}
      {/* Aplicamos la misma estructura de alineación */}
      <div className="relative flex flex-col">
        <Popover
          open={isEndDatePopoverOpen}
          onOpenChange={setIsEndDatePopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[150px] justify-start text-left font-normal',
                !currentEndDate && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-1 h-4 w-4" />
              {currentEndDate
                ? format(currentEndDate, 'dd/MM/yyyy') // Formato dd/MM/yyyy
                : 'Hasta'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50" align="start">
            <Calendar
              mode="single"
              selected={currentEndDate}
              onSelect={(date) => {
                handleDateChange(date, 'endDate')
                setIsEndDatePopoverOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col">
        <Button
          variant="outline"
          onClick={handleClearFilters}
          disabled={!areFiltersActive}
          title="Limpiar todos los filtros activos"
        >
          <FunnelX className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default ActivityDateRangeFilter
