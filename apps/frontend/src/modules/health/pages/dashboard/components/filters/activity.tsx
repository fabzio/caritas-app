import { useFilters } from '@frontend/hooks/use-filters'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { Separator } from '@workspace/ui/components/separator'
import debounce from 'debounce'
import { ArrowUpDown, FilterX } from 'lucide-react'
import { useState } from 'react'
import { useGetActivityFilter } from '../../hooks/use-get-activity-filter'
export default function ActivityFilter() {
  const { filters, setFilters } = useFilters('/_authenticated/health/')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState<string | undefined>(undefined)
  const { data: activities } = useGetActivityFilter()
  const handleChange = debounce((value: string) => {
    setQuery(value)
  }, 300)
  const filteredActivities = query
    ? activities?.filter((activity) =>
        activity.activityName.toLowerCase().includes(query.toLowerCase()),
      )
    : activities
  return (
    <div>
      <Label className="mb-2">Filtrar por actividad</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <Button variant="outline">
            {
              <>
                <FilterX size={16} className="mr-2" />
                {(() => {
                  const count = filters.activityId
                    ? filters.activityId.split(',').filter(Boolean).length
                    : 0
                  return count > 0
                    ? `${count} ${count === 1 ? 'actividad seleccionada' : 'actividades seleccionadas'}`
                    : 'Todas las actividades'
                })()}
              </>
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div>
            <Input
              placeholder="Buscar actividad..."
              onChange={(e) => handleChange(e.target.value)}
            />

            {filteredActivities && filteredActivities.length > 0 ? (
              <ScrollArea className="mt-2 h-36 w-48 rounded-md">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.activityId}
                    className="flex items-center space-x-2 p-2"
                  >
                    <Checkbox
                      id={activity.activityId.toString()}
                      checked={filters.activityId
                        ?.split(',')
                        .map(Number)
                        .includes(activity.activityId)}
                      onCheckedChange={(checked) => {
                        const newActivityIds = checked
                          ? [
                              ...(filters.activityId
                                ? filters.activityId.split(',').map(Number)
                                : []),
                              activity.activityId,
                            ]
                          : filters.activityId
                            ? filters.activityId
                                .split(',')
                                .map(Number)
                                .filter((id) => id !== activity.activityId)
                            : []
                        setFilters({
                          ...filters,
                          activityId:
                            newActivityIds.length > 0
                              ? newActivityIds.join(',')
                              : undefined,
                        })
                      }}
                    >
                      {activity.activityName}
                    </Checkbox>
                    <Label htmlFor={activity.activityId.toString()}>
                      #{activity.activityId} - {activity.activityName}
                    </Label>
                  </div>
                ))}
              </ScrollArea>
            ) : (
              <p>No hay actividades disponibles</p>
            )}
          </div>
          <Separator />
          <div>
            <button
              type="button"
              className="w-full my-1 flex text-sm items-center cursor-pointer hover:bg-accent rounded-sm"
              onClick={() => {
                const activityIds = filters.activityId
                  ? filters.activityId.split(',').map(Number)
                  : []
                const allActivityIds =
                  activities?.map((a) => a.activityId) || []
                const invertedActivityIds = allActivityIds.filter(
                  (id) => !activityIds.includes(id),
                )
                setFilters({
                  ...filters,
                  activityId:
                    invertedActivityIds.length > 0
                      ? invertedActivityIds.join(',')
                      : undefined,
                })
              }}
            >
              <ArrowUpDown size={16} className="mr-1" />
              Invertir selección
            </button>
            <Separator />
            <button
              type="button"
              className="w-full my-1 flex items-center text-sm cursor-pointer hover:bg-accent rounded-sm"
              disabled={!filters.activityId}
              onClick={() => {
                setFilters({
                  ...filters,
                  activityId: undefined,
                })
              }}
            >
              <FilterX size={16} className="mr-1" /> Limpiar filtros
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
