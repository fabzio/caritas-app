import { ScholarshipCard } from '@frontend/modules/user/components/scolarship-card'
import useGetScholarship from '@frontend/modules/user/pages/education/scholarship/pages/view-scholarship/hooks/use-get-scholarship'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@workspace/ui/components/pagination'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Filter, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'

const DISTRITOS_LIMA = [
  'Ate',
  'Barranco',
  'Breña',
  'Carabayllo',
  'Chaclacayo',
  'Chorrillos',
  'Cieneguilla',
  'Comas',
  'El Agustino',
  'Independencia',
  'Jesús María',
  'La Molina',
  'La Victoria',
  'Lima',
  'Lince',
  'Los Olivos',
  'Lurigancho',
  'Lurín',
  'Magdalena del Mar',
  'Miraflores',
  'Pachacámac',
  'Pucusana',
  'Pueblo Libre',
  'Puente Piedra',
  'Punta Hermosa',
  'Punta Negra',
  'Rímac',
  'San Bartolo',
  'San Borja',
  'San Isidro',
  'San Juan de Lurigancho',
  'San Juan de Miraflores',
  'San Luis',
  'San Martín de Porres',
  'San Miguel',
  'Santa Anita',
  'Santa María del Mar',
  'Santa Rosa',
  'Santiago de Surco',
  'Surquillo',
  'Villa El Salvador',
  'Villa María del Triunfo',
]

export default function ScholarshipPage() {
  const [nameFilter, setNameFilter] = useState('')
  const [selectedDistrito, setSelectedDistrito] = useState<string>('all')
  const [selectedOrganization, setSelectedOrganization] =
    useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const pageSize = 9
  const { data, isLoading, isError } = useGetScholarship(
    nameFilter,
    currentPage,
    pageSize,
  )
  const scholarships = data?.data

  const organizations = useMemo(() => {
    if (!scholarships) return []
    const orgSet = new Set(
      scholarships
        .filter((s) => s.organization)
        .map((s) => s.organization?.name || ''),
    )
    orgSet.delete('')
    return Array.from(orgSet).sort()
  }, [scholarships])

  const filteredScholarships = useMemo(() => {
    if (!scholarships) return []
    return scholarships.filter((scholarship) => {
      const matchesDistrito =
        selectedDistrito === 'all' || selectedDistrito === 'Lima'
      const matchesOrganization =
        selectedOrganization === 'all' ||
        scholarship.organization?.name === selectedOrganization
      return matchesDistrito && matchesOrganization
    })
  }, [scholarships, selectedDistrito, selectedOrganization])

  const hasActiveFilters =
    selectedDistrito !== 'all' || selectedOrganization !== 'all'

  const clearFilters = () => {
    setSelectedDistrito('all')
    setSelectedOrganization('all')
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Becas Disponibles
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Aquí podrá visualizar las becas a las que puede postular. Seleccione
          para más detalles.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar becas ..."
            className="pl-9"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="default" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-1 rounded-full bg-primary-foreground text-primary px-2 py-0.5 text-xs font-semibold">
                  {(selectedDistrito ? 1 : 0) + (selectedOrganization ? 1 : 0)}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filtros</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Distrito</span>
                  <Select
                    value={selectedDistrito}
                    onValueChange={setSelectedDistrito}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los distritos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los distritos</SelectItem>
                      {DISTRITOS_LIMA.map((distrito) => (
                        <SelectItem key={distrito} value={distrito}>
                          {distrito}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">Organización</span>
                  <Select
                    value={selectedOrganization}
                    onValueChange={setSelectedOrganization}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las organizaciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        Todas las organizaciones
                      </SelectItem>
                      {organizations.map((org) => (
                        <SelectItem key={org} value={org}>
                          {org}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div>
        {/* lista de becas en formato desktop y mobile(priori) */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-4">
                  <Skeleton className="h-6" />
                  <Skeleton className="h-4" />
                  <Skeleton className="h-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-destructive">
              <p>Error al cargar las becas. Intente de nuevo.</p>
            </CardContent>
          </Card>
        )}
        {/* en caso no hayan becas */}
        {!isLoading && scholarships && scholarships.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p>No hay becas registradas aún.</p>
            </CardContent>
          </Card>
        )}
        {!isLoading &&
          filteredScholarships &&
          filteredScholarships.length === 0 &&
          scholarships &&
          scholarships.length > 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>No se encontraron becas con los filtros aplicados.</p>
              </CardContent>
            </Card>
          )}
        {!isLoading &&
          filteredScholarships &&
          filteredScholarships.length > 0 && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredScholarships.map((scholarship) => (
                  <ScholarshipCard
                    key={scholarship.id}
                    scholarship={scholarship}
                  />
                ))}
              </div>
              {data && data.pageCount > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          className={
                            currentPage === 1
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                      {Array.from(
                        { length: data.pageCount },
                        (_, i) => i + 1,
                      ).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((p) =>
                              Math.min(data.pageCount, p + 1),
                            )
                          }
                          className={
                            !data.hasNext
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
      </div>
    </div>
  )
}
