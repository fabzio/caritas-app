import { useFilters } from '@frontend/hooks/use-filters'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { Separator } from '@workspace/ui/components/separator'
import { MapPin, X } from 'lucide-react'
import { useState } from 'react'
import { useActivityRegions } from '../hooks/use-activity-regions'

export default function RegionFilter() {
  const { filters, setFilters } = useFilters(
    '/_authenticated/health/activities/',
  )
  const { data: regions, isLoading } = useActivityRegions()
  const [open, setOpen] = useState(false)

  const selectedRegionIds = filters.regionIds
    ? filters.regionIds.split(',').map((id: string) => Number.parseInt(id, 10))
    : []

  const handleToggleRegion = (regionId: number) => {
    const newSelection = selectedRegionIds.includes(regionId)
      ? selectedRegionIds.filter((id) => id !== regionId)
      : [...selectedRegionIds, regionId]

    setFilters({
      regionIds: newSelection.length > 0 ? newSelection.join(',') : undefined,
      page: 0,
    })
  }

  const handleClearAll = () => {
    setFilters({ regionIds: undefined, page: 0 })
  }

  const selectedRegions = regions?.filter((r) =>
    selectedRegionIds.includes(r.id),
  )

  if (isLoading) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MapPin className="h-4 w-4" />
          Distrito
          {selectedRegionIds.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {selectedRegionIds.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">Filtrar por distrito</h4>
            {selectedRegionIds.length > 0 && (
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
              {regions?.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer w-full text-left"
                  onClick={() => handleToggleRegion(region.id)}
                >
                  <Checkbox
                    checked={selectedRegionIds.includes(region.id)}
                    onCheckedChange={() => handleToggleRegion(region.id)}
                  />
                  <span className="text-sm flex-1">{region.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        {selectedRegions && selectedRegions.length > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <p className="text-xs text-muted-foreground mb-2">
                Seleccionados:
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedRegions.map((region) => (
                  <Badge
                    key={region.id}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {region.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0.5 hover:bg-transparent"
                      onClick={(e) => {
                        e.preventDefault()
                        handleToggleRegion(region.id)
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
