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
import { MapPin, X } from 'lucide-react'
import { useState } from 'react'
import { useFairFilterOptions } from '../hooks/use-fair-filter-options'

export default function RegionFilter() {
  const { filters, setFilters } = useFilters('/_authenticated/education/fair/')
  const { regions } = useFairFilterOptions()
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()

  const selectedDistricts = filters.district ? filters.district.split(',') : []

  const handleToggleRegion = (districtName: string) => {
    const newSelection = selectedDistricts.includes(districtName)
      ? selectedDistricts.filter((name) => name !== districtName)
      : [...selectedDistricts, districtName]

    setFilters({
      district: newSelection.length > 0 ? newSelection.join(',') : undefined,
      pageIndex: 1,
    })
  }

  const handleClearAll = () => {
    setFilters({ district: undefined, pageIndex: 1 })
  }

  const selectedRegions = regions.filter((r) =>
    selectedDistricts.includes(r.name),
  )

  if (!regions.length) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`gap-2 ${isMobile ? 'flex-1' : ''}`}
        >
          <MapPin className="h-4 w-4" />
          Distrito
          {selectedDistricts.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {selectedDistricts.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">Filtrar por distrito</h4>
            {selectedDistricts.length > 0 && (
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
              {regions.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer w-full text-left"
                  onClick={() => handleToggleRegion(region.name)}
                >
                  <Checkbox
                    checked={selectedDistricts.includes(region.name)}
                    onCheckedChange={() => handleToggleRegion(region.name)}
                  />
                  <span className="text-sm flex-1">{region.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        {selectedRegions.length > 0 && (
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
                        handleToggleRegion(region.name)
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
