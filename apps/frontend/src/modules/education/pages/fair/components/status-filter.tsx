import { useFilters } from '@frontend/hooks/use-filters'
import { useIsMobile } from '@frontend/hooks/use-mobile'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { Separator } from '@workspace/ui/components/separator'
import { CalendarClock, X } from 'lucide-react'
import { useState } from 'react'
import { useFairFilterOptions } from '../hooks/use-fair-filter-options'

type FairStatus = 'upcoming' | 'ongoing' | 'finished'

export default function StatusFilter() {
  const { filters, setFilters } = useFilters('/_authenticated/education/fair/')
  const { statuses } = useFairFilterOptions()
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()

  const selectedStatuses = filters.status
    ? (filters.status.split(',') as FairStatus[])
    : []

  const handleToggleStatus = (status: FairStatus | undefined) => {
    if (!status) return
    const newSelection = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status]

    setFilters({
      status: newSelection.length > 0 ? newSelection.join(',') : undefined,
      pageIndex: 1,
    })
  }

  const handleClearAll = () => {
    setFilters({ status: undefined, pageIndex: 1 })
  }

  const selectedStatusesData = statuses.filter((s) =>
    selectedStatuses.includes(s.value),
  )

  if (!statuses.length) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`gap-2 ${isMobile ? 'flex-1' : ''}`}
        >
          <CalendarClock className="h-4 w-4" />
          Estado
          {selectedStatuses.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {selectedStatuses.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">Filtrar por estado</h4>
            {selectedStatuses.length > 0 && (
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
          <div className="max-h-[300px] overflow-y-auto">
            <div className="space-y-1">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer w-full text-left"
                  onClick={() => handleToggleStatus(status.value)}
                >
                  <Checkbox
                    checked={selectedStatuses.includes(status.value)}
                    onCheckedChange={() => handleToggleStatus(status.value)}
                  />
                  <span className="text-sm flex-1">{status.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        {selectedStatusesData.length > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <p className="text-xs text-muted-foreground mb-2">
                Seleccionados:
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedStatusesData.map((status) => (
                  <Badge
                    key={status.value}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {status.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0.5 hover:bg-transparent"
                      onClick={(e) => {
                        e.preventDefault()
                        handleToggleStatus(status.value)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
