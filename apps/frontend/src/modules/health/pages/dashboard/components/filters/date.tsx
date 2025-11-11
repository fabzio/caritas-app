import { useFilters } from '@frontend/hooks/use-filters'
import { Button } from '@workspace/ui/components/button'
import { Calendar } from '@workspace/ui/components/calendar'
import { Label } from '@workspace/ui/components/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { useState } from 'react'

export default function DateFilter() {
  const { filters, setFilters } = useFilters('/_authenticated/health/')
  const startDate = filters.startDate ? new Date(filters.startDate) : undefined
  const endDate = filters.endDate ? new Date(filters.endDate) : undefined

  return (
    <div>
      <div className="flex gap-2 md:justify-between items-center">
        <div>
          <Label className="mb-2">Fecha de Inicio</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {startDate ? startDate.toLocaleDateString() : 'Sin fecha'}{' '}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setFilters({
                    ...filters,
                    startDate: date ? date.toISOString() : undefined,
                  })
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <div className="mx-2 mt-6">-</div>
        </div>
        <div>
          <Label className="mb-2">Fecha de Fin</Label>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {endDate ? endDate.toLocaleDateString() : 'Sin fecha'}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setFilters({
                    ...filters,
                    endDate: date ? date.toISOString() : undefined,
                  })
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
